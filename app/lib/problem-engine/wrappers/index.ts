/**
 * Wrapper Registry
 *
 * Dispatches to language-specific code generators that wrap the user's
 * solution and the adapter code into a fully executable program.
 */

import { generateJavaScriptWrapper } from "./javascript";
import { generatePythonWrapper } from "./python";
import { generateTypeScriptWrapper } from "./typescript";
import { generateJavaWrapper } from "./java";
import { generateCppWrapper } from "./cpp";
import { generateGoWrapper } from "./go";
import { generateRustWrapper } from "./rust";
import { generateCWrapper } from "./c";
import { generateCsharpWrapper } from "./csharp";
import { generateSwiftWrapper } from "./swift";
import { generateScalaWrapper } from "./scala";
import { generatePhpWrapper } from "./php";
import { generateRubyWrapper } from "./ruby";

/**
 * Generate a complete executable program for the given language.
 *
 * @param language       - Target language ID (e.g., "javascript", "python")
 * @param userCode       - The user's submitted solution code
 * @param helperCode     - Adapter helper code (e.g., ListNode class)
 * @param executionCode  - Code to execute the function and print result
 * @returns A fully self-contained string of code ready to be executed
 */
export function generateWrapper(
  language: string,
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  // Normalize: adapters encode newlines as literal \n (two chars: backslash + n).
  // Convert them to real newline characters so the generated source code is valid.
  const normalizedExecution = executionCode.replace(/\\n/g, '\n');
  const normalizedHelper = helperCode.replace(/\\n/g, '\n');
  switch (language) {
    case "javascript":
      return generateJavaScriptWrapper(userCode, normalizedHelper, normalizedExecution);
    case "typescript":
      return generateTypeScriptWrapper(userCode, normalizedHelper, normalizedExecution);
    case "python":
      return generatePythonWrapper(userCode, normalizedHelper, normalizedExecution);
    case "java":
      return generateJavaWrapper(userCode, normalizedHelper, normalizedExecution);
    case "cpp":
      return generateCppWrapper(userCode, normalizedHelper, normalizedExecution);
    case "go":
      return generateGoWrapper(userCode, normalizedHelper, normalizedExecution);
    case "rust":
      return generateRustWrapper(userCode, normalizedHelper, normalizedExecution);
    case "c":
      return generateCWrapper(userCode, normalizedHelper, normalizedExecution);
    case "csharp":
      return generateCsharpWrapper(userCode, normalizedHelper, normalizedExecution);
    case "swift":
      return generateSwiftWrapper(userCode, normalizedHelper, normalizedExecution);
    case "scala":
      return generateScalaWrapper(userCode, normalizedHelper, normalizedExecution);
    case "php":
      return generatePhpWrapper(userCode, normalizedHelper, normalizedExecution);
    case "ruby":
      return generateRubyWrapper(userCode, normalizedHelper, normalizedExecution);
    default:
      // Fallback for unsupported languages — just try to append them
      return `${normalizedHelper}\n\n${userCode}\n\n${normalizedExecution}`;
  }
}
