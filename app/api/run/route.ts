import { NextResponse } from "next/server";
import { getSlugForRoom } from "@/app/lib/db";
import { fetchLeetCodeProblem } from "@/app/lib/leetcode";
import { normalizeProblem } from "@/app/lib/problem-engine/normalizeProblem";
import { SUPPORTED_LANGUAGES } from "@/app/lib/languages";
import { getAdapterCode } from "@/app/lib/problem-engine/adapters";
import { generateWrapper } from "@/app/lib/problem-engine/wrappers";
import { judge } from "@/app/lib/problem-engine/judge";
import type { Example, TestCaseResult } from "@/app/lib/problem-engine/types";

const JUDGE0_URL = process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = process.env.JUDGE0_KEY || "3547aafb53msh1717c26ade42f4dp1a774bjsn9332645a7084";
const JUDGE0_HOST = process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com";

export async function POST(request: Request) {
  try {
    const { roomId, language, code, runIndex, customTestCases } = await request.json();

    if (!roomId || !language || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!JUDGE0_KEY) {
      return NextResponse.json({ 
        error: "Judge0 API key is not configured. Please add JUDGE0_KEY to your .env.local file." 
      }, { status: 500 });
    }

    // 1. Get problem data
    const slug = await getSlugForRoom(roomId);
    if (!slug) {
      return NextResponse.json({ error: "Room not linked to a problem" }, { status: 404 });
    }

    const raw = await fetchLeetCodeProblem(slug);
    const problem = normalizeProblem(raw);

    // 2. Fetch custom cases from request payload
    const customCases = customTestCases || [];

    // 3. Combine LeetCode examples and Custom Cases
    const allExamples: Example[] = [
      ...problem.examples,
      ...customCases.map((c: any, i: number) => ({
        id: `custom-${c.id}`,
        title: `Custom Case ${i + 1}`,
        input: c.input,
        output: c.expectedOutput,
      })),
    ];

    // Determine which examples to run
    let examplesToRun = allExamples;
    if (typeof runIndex === "number" && runIndex >= 0 && runIndex < allExamples.length) {
      examplesToRun = [allExamples[runIndex]];
    }

    // 4. Find Judge0 language ID (case-insensitive check against both id and name)
    const langInfo = SUPPORTED_LANGUAGES.find(
      (l) => l.id.toLowerCase() === language.toLowerCase() || l.name.toLowerCase() === language.toLowerCase()
    );
    if (!langInfo) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }

    // 5. Execute all selected examples (sequentially to avoid rate limits, or batch if supported)
    const results: TestCaseResult[] = [];
    
    // We'll use the Judge0 Batch API for efficiency if we are running multiple
    const submissions = examplesToRun.map((example) => {
      // a. Get adapter code (Helper + Execution parts)
      const adapter = getAdapterCode(problem.metadata, langInfo.id, example);
      
      // b. Wrap everything into an executable program
      const sourceCode = generateWrapper(
        langInfo.id,
        code,
        adapter.helperCode,
        adapter.executionCode
      );

      return {
        language_id: langInfo.judge0Id,
        source_code: sourceCode,
        expected_output: example.output,
      };
    });

    // Submit to Judge0 Batch API
    const response = await fetch(`${JUDGE0_URL}/submissions/batch?base64_encoded=false`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Host": JUDGE0_HOST,
        "X-RapidAPI-Key": JUDGE0_KEY,
      },
      body: JSON.stringify({ submissions }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Judge0 submission failed:", errText);
      return NextResponse.json({ error: "Execution engine failed to process request" }, { status: 500 });
    }

    const tokensData = await response.json();
    const tokens = tokensData.map((t: any) => t.token).join(",");

    // Poll for results
    let finished = false;
    let finalData = [];
    let attempts = 0;
    
    while (!finished && attempts < 15) {
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s delay
      attempts++;
      
      const res = await fetch(`${JUDGE0_URL}/submissions/batch?tokens=${tokens}&base64_encoded=false&fields=status_id,compile_output,stdout,stderr,time,expected_output`, {
        headers: {
          "X-RapidAPI-Host": JUDGE0_HOST,
          "X-RapidAPI-Key": JUDGE0_KEY,
        }
      });
      
      const pollData = await res.json();
      
      // Check if all are done (status_id <= 2 means In Queue or Processing)
      finished = pollData.submissions.every((s: any) => s.status_id > 2);
      if (finished) {
        finalData = pollData.submissions;
      }
    }

    if (!finished) {
      return NextResponse.json({ error: "Execution timed out" }, { status: 504 });
    }

    // 6. Process results
    for (let i = 0; i < finalData.length; i++) {
      const submission = finalData[i];
      const example = examplesToRun[i];
      
      // Status > 3 means error (Compile Error, Runtime Error, etc)
      if (submission.status_id > 3) {
        results.push({
          passed: false,
          expected: example.output,
          received: "",
          error: submission.compile_output || submission.stderr || "Runtime Error",
          executionTime: parseFloat(submission.time) || 0,
        });
        continue;
      }
      
      const stdout = submission.stdout || "";
      const isCorrect = judge(example.output, stdout);
      
      results.push({
        passed: isCorrect,
        expected: example.output,
        received: stdout.trim(),
        executionTime: parseFloat(submission.time) || 0,
      });
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Run API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
