export function generateCWrapper(
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
${indentedExecution}
    return 0;
}
`;
}
