const userCode = `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        return [0, 1]
`;
const helperCode = '';
const executionCode = `import json\n__result = twoSum([2,7,11,15], 9)\nprint(json.dumps(__result))\n`;

const wrapper = `
import sys
import json
from typing import *

# --- Helper Code ---
${helperCode}

# --- User Code ---
${userCode}

# --- Execution ---
try:
${executionCode.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    import traceback
    traceback.print_exc()
`;

const fs = require('fs');
fs.writeFileSync('prog.py', wrapper);
console.log('Wrote to prog.py');
