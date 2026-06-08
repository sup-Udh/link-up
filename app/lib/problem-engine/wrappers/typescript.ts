export function generateTypeScriptWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  // Indent each line of executionCode for the try block
  const indentedExecution = executionCode
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => '  ' + line)
    .join('\n');

  // TypeScript behaves essentially identical to JS for execution wrapping
  // since the code will be compiled by Judge0 or similar sandbox
  return `
// --- Helper Code ---
${helperCode}

// --- User Code ---
${userCode}

// --- Execution ---
try {
${indentedExecution}
} catch (e) {
  console.error(e);
}
`;
}
