export function generateRustWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  return `
// --- Helper Code ---
${helperCode}

// --- User Code ---
${userCode}

// --- Execution ---
fn main() {
    ${executionCode}
}
`;
}
