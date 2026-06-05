export function generateSwiftWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  return `
import Foundation

// --- Helper Code ---
${helperCode}

// --- User Code ---
${userCode}

// --- Execution ---
let __solution = Solution()
${executionCode}
`;
}
