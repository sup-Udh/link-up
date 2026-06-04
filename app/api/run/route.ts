import { NextResponse } from "next/server";
import { getSlugForRoom } from "@/app/lib/db";
import { fetchLeetCodeProblem } from "@/app/lib/leetcode";
import { normalizeProblem } from "@/app/lib/problem-engine/normalizeProblem";
import { SUPPORTED_LANGUAGES } from "@/app/lib/languages";
import { getAdapterCode } from "@/app/lib/problem-engine/adapters";
import { generateWrapper } from "@/app/lib/problem-engine/wrappers";
import { judge } from "@/app/lib/problem-engine/judge";
import type { Example, TestCaseResult } from "@/app/lib/problem-engine/types";

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

export async function POST(request: Request) {
  try {
    const { roomId, language, code, runIndex, customTestCases } = await request.json();

    if (!roomId || !language || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    // 4. Find Piston language config (case-insensitive check against both id and name)
    const langInfo = SUPPORTED_LANGUAGES.find(
      (l) => l.id.toLowerCase() === language.toLowerCase() || l.name.toLowerCase() === language.toLowerCase()
    );
    if (!langInfo) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }

    // 5. Execute all selected examples via Piston API concurrently
    const executionPromises = examplesToRun.map(async (example) => {
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

      // Determine filename extension for Piston based on language ID
      let extension = "txt";
      if (langInfo.id === "javascript") extension = "js";
      else if (langInfo.id === "python") extension = "py";
      else if (langInfo.id === "java") extension = "java";
      else if (langInfo.id === "cpp") extension = "cpp";
      else if (langInfo.id === "typescript") extension = "ts";
      
      const payload = {
        language: langInfo.pistonLanguage,
        version: langInfo.pistonVersion,
        files: [
          {
            name: `main.${extension}`,
            content: sourceCode
          }
        ],
        compile_timeout: 10000,
        run_timeout: 3000
      };

      try {
        const response = await fetch(PISTON_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Piston API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const executionTime = (Date.now() - startTime) / 1000;
        
        let stderr = data.run?.stderr || "";
        
        // If compilation failed, surface compile errors
        if (data.compile && data.compile.code !== 0) {
           stderr = data.compile.stderr || data.compile.output || "Compilation Error";
        }

        if (stderr || (data.run && data.run.code !== 0)) {
           return {
             passed: false,
             expected: example.output,
             received: "",
             error: stderr || data.run?.output || "Runtime Error",
             executionTime
           };
        }

        const stdout = data.run?.stdout || "";
        const isCorrect = judge(example.output, stdout);
        
        return {
          passed: isCorrect,
          expected: example.output,
          received: stdout.trim(),
          executionTime
        };
      } catch (err: any) {
        return {
          passed: false,
          expected: example.output,
          received: "",
          error: err.message || "Execution Failed",
          executionTime: 0
        };
      }
    });

    const results = await Promise.all(executionPromises);

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Run API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
