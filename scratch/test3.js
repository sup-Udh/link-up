const { fetchLeetCodeMetadata } = require('./app/lib/leetcode');
const { generatePython } = require('./app/lib/generators/python');

async function test() {
  const meta = await fetchLeetCodeMetadata("two-sum");
  console.log("meta.testCases:", meta.testCases);
  console.log("meta.expectedOutputs:", meta.expectedOutputs);

  const code = `
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        return [0, 1]
`;
  
  const finalCode = generatePython(code, meta);
  const fs = require('fs');
  fs.writeFileSync('scratch/generated.py', finalCode);
  console.log("Generated Python saved to scratch/generated.py");
}
test();
