export function generateJavaScriptWrapper(
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
try {
${executionCode}
} catch (e) {
  console.error(e);
}
`;
}
