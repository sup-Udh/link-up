import { ProblemMetadata } from "../leetcode";
import { generateJavaScript } from "./javascript";
import { generatePython } from "./python";
import { generateJava } from "./java";
import { generateCpp } from "./cpp";

export function generateExecutionWrapper(language: string, code: string, meta: ProblemMetadata): string {
  try {
    switch (language) {
      case "javascript":
      case "typescript":
        return generateJavaScript(code, meta);
      case "python":
      case "python3":
        return generatePython(code, meta);
      case "java":
        return generateJava(code, meta);
      case "cpp":
      case "c":
        return generateCpp(code, meta);
      default:
        // Basic fallback for unsupported advanced languages
        return \`
/* 
  Language \${language} is in MVP stage. 
  Full native wrapper execution is coming soon! 
  Please test manually or use JS/Python/C++/Java for full Problem-Aware execution.
*/
\${code}
\`;
    }
  } catch (err) {
    console.error("Generator Error:", err);
    return code; // Fallback to raw code
  }
}
