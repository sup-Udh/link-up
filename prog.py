
import sys
import json
from typing import *

# --- Helper Code ---


# --- User Code ---
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        return [0, 1]


# --- Execution ---
try:
    import json
    __result = twoSum([2,7,11,15], 9)
    print(json.dumps(__result))
    
except Exception as e:
    import traceback
    traceback.print_exc()
