import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { language, code } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, output: "Error: No code provided." },
        { status: 400 }
      );
    }

    // Judge0 uses language_id 93 for Node.js 18.15.0
    // If you need more languages later, you can map 'language' string to the correct Judge0 ID
    const languageId = language === "javascript" ? 93 : 93;

    const res = await fetch(
      // major terminal player.
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
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

    return NextResponse.json({
      success: isSuccess,
      output: finalOutput.trim() || "Execution finished with no output.",
    });
  } catch (error: any) {
    console.error("Execution error:", error);
    return NextResponse.json(
      { success: false, output: `Internal Error: ${error.message}` },
      { status: 500 }
    );
  }
}
