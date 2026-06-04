export function generateTypeScriptWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  // TypeScript behaves essentially identical to JS for execution wrapping
  // since the code will be compiled by Judge0 or similar sandbox
  return `
// --- Helper Code ---
${helperCode}

// --- User Code ---
${userCode}

// --- Execution ---
try {
${executionCode}
} catch (e) {
  console.error(e);
}
`;
}
