import { NextResponse } from "next/server";
import { getSlugForRoom } from "@/app/lib/db";
import { fetchLeetCodeProblem } from "@/app/lib/leetcode";
import { normalizeProblem } from "@/app/lib/problem-engine/normalizeProblem";
import { SUPPORTED_LANGUAGES } from "@/app/lib/languages";
import { getAdapterCode } from "@/app/lib/problem-engine/adapters";
import { generateWrapper } from "@/app/lib/problem-engine/wrappers";
import { judge } from "@/app/lib/problem-engine/judge";
import type { Example, TestCaseResult } from "@/app/lib/problem-engine/types";

const WANDBOX_URL = "https://wandbox.org/api/compile.json";

export async function POST(request: Request) {
  try {
    const { roomId, language, code, runIndex, customTestCases, slug: reqSlug } = await request.json();

    if (!roomId || !language || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Get problem data
    const slug = reqSlug || await getSlugForRoom(roomId);
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

    // 4. Find Wandbox language config (case-insensitive check against both id and name)
    const langInfo = SUPPORTED_LANGUAGES.find(
      (l) => l.id.toLowerCase() === language.toLowerCase() || l.name.toLowerCase() === language.toLowerCase()
    );
    if (!langInfo) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }
    
    // Check if the language is unsupported by our Wandbox compiler
    if (langInfo.id === "dart" || langInfo.id === "kotlin") {
      return NextResponse.json({ 
        results: examplesToRun.map(ex => ({
          passed: false,
          expected: ex.output,
          received: "",
          error: `${langInfo.name} execution is temporarily disabled as our compiler infrastructure does not yet support it natively. Please select another language like JavaScript, Python, or C++.`,
          executionTime: 0
        })) 
      });
    }

    // 5. Execute all selected examples via Wandbox API sequentially to avoid rate/resource limits
    const results: any[] = [];
    
    for (const example of examplesToRun) {
      const startTime = Date.now();
      
      // a. Get adapter code (Helper + Execution parts)
      const adapter = getAdapterCode(problem.metadata, langInfo.id, example);
      
      // b. Wrap everything into an executable program
      const sourceCode = generateWrapper(
        langInfo.id,
        code,
        adapter.helperCode,
        adapter.executionCode
      );

      const payload = {
        code: sourceCode,
        compiler: langInfo.wandboxCompiler,
        save: false
      };

      try {
        const response = await fetch(WANDBOX_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Wandbox API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const executionTime = (Date.now() - startTime) / 1000;
        
        let stderr = data.program_error || "";
        
        // If compilation failed
        if (data.compiler_error) {
           stderr = data.compiler_error;
        }

        if (stderr || data.status !== "0") {
           results.push({
             passed: false,
             expected: example.output,
             received: "",
             error: stderr || data.program_output || "Runtime Error",
             executionTime
           });
           continue;
        }

        const stdout = data.program_output || "";
        const isCorrect = judge(example.output, stdout);
        
        results.push({
          passed: isCorrect,
          expected: example.output,
          received: stdout.trim(),
          executionTime
        });
      } catch (err: any) {
        results.push({
          passed: false,
          expected: example.output,
          received: "",
          error: err.message || "Execution Failed",
          executionTime: 0
        });
      }
      
      // Add a tiny delay between requests to prevent overwhelming the free API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Run API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
