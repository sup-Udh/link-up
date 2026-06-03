import { NextResponse } from "next/server";
import { getLanguageConfig } from "@/app/lib/languages";
import { getSlugForRoom } from "@/app/lib/db";
import { fetchLeetCodeMetadata } from "@/app/lib/leetcode";
import { generateExecutionWrapper } from "@/app/lib/generators";

export async function POST(request: Request) {
  try {
    const { roomId, language, code, customTestCases, runIndex } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, output: "Error: No code provided." },
        { status: 400 }
      );
    }

    if (!roomId) {
      return NextResponse.json(
        { success: false, output: "Error: No room ID provided." },
        { status: 400 }
      );
    }

    const slug = await getSlugForRoom(roomId);
    if (!slug) {
      return NextResponse.json({ success: false, output: "Error: Room problem not found." });
    }

    const meta = await fetchLeetCodeMetadata(slug);
    if (!meta) {
      return NextResponse.json({ success: false, output: "Error: Failed to fetch LeetCode metadata." });
    }

    // Append custom test cases if any
    if (customTestCases && Array.isArray(customTestCases)) {
      for (const tc of customTestCases) {
        meta.testCases.push(tc.input);
        meta.expectedOutputs.push(tc.expectedOutput);
      }
    }

    // Filter to a single test case if runIndex is provided
    if (runIndex !== undefined && runIndex !== null && runIndex !== "all") {
      const idx = Number(runIndex);
      if (idx >= 0 && idx < meta.testCases.length) {
        meta.testCases = [meta.testCases[idx]];
        meta.expectedOutputs = [meta.expectedOutputs[idx]];
      }
    }

    // Generate the execution wrapper using our native transpilers
    const finalCode = generateExecutionWrapper(language || "javascript", code, meta);

    // Get the correct Judge0 language ID for the chosen language
    const langConfig = getLanguageConfig(language || "javascript");
    const languageId = langConfig.judge0Id;

    const res = await fetch(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: finalCode,
          language_id: languageId,
        }),
      }
    );

    let data;
    try {
      data = await res.json();
    } catch (e) {
      // Ignored
    }

    if (!res.ok) {
      if (data && data.message) {
        return NextResponse.json({
          success: false,
          output: `API Error (${res.status}): ${data.message}`,
        });
      }
      throw new Error(`Judge0 API returned status: ${res.status}`);
    }

    const compileOutput = data.compile_output || "";
    const stdout = data.stdout || "";
    const stderr = data.stderr || "";
    const message = data.message || "";
    
    // Status ID 3 means "Accepted" (Success)
    // See Judge0 docs for other status codes (4 = Wrong Answer, 6 = Compile Error, etc.)
    const isSuccess = data.status?.id === 3;

    let finalOutput = compileOutput;
    if (finalOutput && stdout) finalOutput += "\n";
    finalOutput += stdout;

    if (stderr && !finalOutput.includes(stderr)) {
      if (finalOutput) finalOutput += "\n";
      finalOutput += stderr;
    }
    
    if (message) {
      if (finalOutput) finalOutput += "\n";
      finalOutput += `Message: ${message}`;
    }

    let parsedResults: any[] = [];
    try {
      if (stdout.trim().startsWith("[")) {
        parsedResults = JSON.parse(stdout);
        parsedResults = parsedResults.map((r: any, idx: number) => {
          let expected = meta.expectedOutputs[idx] || "N/A";
          let passed = false;
          
          if (!r.error) {
             const cleanExpected = expected.replace(/\s+/g, '');
             const cleanReceived = (r.received || "").replace(/\s+/g, '');
             passed = cleanExpected === cleanReceived;
          }
          
          return {
            ...r,
            passed: passed,
            expected: expected
          };
        });
      }
    } catch (e) {
      // Failed to parse JSON results (likely a compilation/runtime crash that corrupted stdout)
    }

    return NextResponse.json({
      success: isSuccess,
      output: finalOutput.trim() || "Execution finished with no output.",
      results: parsedResults.length > 0 ? parsedResults : undefined,
      runIndex: runIndex !== undefined ? runIndex : "all"
    });
  } catch (error: any) {
    console.error("Execution error:", error);
    return NextResponse.json(
      { success: false, output: `Internal Error: ${error.message}` },
      { status: 500 }
    );
  }
}
