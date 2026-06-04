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
  switch (language) {
    case "javascript":
      return generateJavaScriptWrapper(userCode, helperCode, executionCode);
    case "typescript":
      return generateTypeScriptWrapper(userCode, helperCode, executionCode);
    case "python":
      return generatePythonWrapper(userCode, helperCode, executionCode);
    case "java":
      return generateJavaWrapper(userCode, helperCode, executionCode);
    case "cpp":
      return generateCppWrapper(userCode, helperCode, executionCode);
    default:
      // Fallback for unsupported languages — just try to append them
      return `${helperCode}\n\n${userCode}\n\n${executionCode}`;
  }
}
