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

    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: language || "javascript",
        version: "*", // Piston API typically expects a specific version, but '*' is requested
        files: [{ content: code }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Piston API returned status: ${res.status}`);
    }

    const data = await res.json();

    // The API might return a whitelist message directly if restricted
    if (data.message) {
      return NextResponse.json({
        success: false,
        output: `API Restriction: ${data.message}`,
      });
    }

    const compileOutput = data.compile?.output || "";
    const runOutput = data.run?.output || "";
    const stderr = data.run?.stderr || "";
    const codeStatus = data.run?.code;

    const isError = codeStatus !== 0 || compileOutput !== "" || stderr !== "";
    
    // Format output nicely
    let finalOutput = compileOutput;
    if (finalOutput && runOutput) finalOutput += "\n";
    finalOutput += runOutput;
    
    if (stderr && !finalOutput.includes(stderr)) {
        finalOutput += "\n" + stderr;
    }

    return NextResponse.json({
      success: !isError,
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
