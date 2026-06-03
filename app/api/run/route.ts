import { NextResponse } from "next/server";
import { getLanguageConfig } from "@/app/lib/languages";

export async function POST(request: Request) {
  try {
    const { language, code, input } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, output: "Error: No code provided." },
        { status: 400 }
      );
    }

    let finalCode = code;

    // Custom Input Injection (JavaScript MVP only)
    if (language === "javascript" && input && input.trim()) {
      try {
        const parsedInput = JSON.parse(input);
        
        // Use Regex to find the first function declaration: e.g. function add(a, b)
        const funcMatch = finalCode.match(/function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(([^)]*)\)/);
        
        if (funcMatch) {
          const funcName = funcMatch[1];
          // Extract parameter names from the regex capture group
          const paramNames = funcMatch[2].split(",").map((p: string) => p.trim()).filter((p: string) => p);
          
          // Generate the parameter string for the wrapper, e.g. __input["a"], __input["b"]
          const paramsList = paramNames.map((p: string) => `__input["${p}"]`).join(", ");
          
          finalCode += `\n\n// --- GENERATED EXECUTION WRAPPER ---\n`;
          finalCode += `const __input = ${JSON.stringify(parsedInput)};\n`;
          finalCode += `console.log(${funcName}(${paramsList}));\n`;
        }
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          output: `Error: Invalid Custom Input JSON\n${err.message}`
        });
      }
    }

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
