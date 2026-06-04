export function generatePythonWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
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
${executionCode.split('\\n').map(line => '    ' + line).join('\\n')}
except Exception as e:
    import traceback
    traceback.print_exc()
`;
}
