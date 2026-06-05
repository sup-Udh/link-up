export function generatePhpWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  return `<?php

// --- Helper Code ---
${helperCode}

// --- User Code ---
${userCode}

// --- Execution ---
try {
    \$__solution = new Solution();
    ${executionCode}
} catch (Exception \$e) {
    echo "Execution Error";
}
?>`;
}
