export function generateCWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  return `
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

// --- Helper Code ---
${helperCode}

// --- User Code ---
${userCode}

// --- Execution ---
int main() {
    ${executionCode}
    return 0;
}
`;
}
