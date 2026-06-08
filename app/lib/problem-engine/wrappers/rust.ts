export function generateRustWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  const indentedExecution = executionCode
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => '    ' + line)
    .join('\n');

  return `
// --- Helper Code ---
${helperCode}

// --- User Code ---
${userCode}

// --- Execution ---
fn main() {
${indentedExecution}
}
`;
}
