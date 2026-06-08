export function generatePhpWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  // Indent each line of executionCode for the try block
  const indentedExecution = executionCode
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => '    ' + line)
    .join('\n');

  return `<?php

// --- Helper Code ---
${helperCode}

// --- User Code ---
${userCode}

// --- Execution ---
try {
    \\$__solution = new Solution();
${indentedExecution}
} catch (Exception \\$e) {
    echo "Execution Error";
}
?>`;
}
