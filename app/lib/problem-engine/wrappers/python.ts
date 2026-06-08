export function generatePythonWrapper(
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

  return `
import sys
import json
from typing import *

# --- Helper Code ---
${helperCode}

# --- User Code ---
${userCode}

# --- Execution ---
try:
${indentedExecution}
except Exception as e:
    import traceback
    traceback.print_exc()
`;
}
