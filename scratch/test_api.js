const code = `
class Solution:
    def twoSum(self, nums, target):
        return [0,1]
`;

fetch('http://localhost:3000/api/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    roomId: 'test-room', // assuming this is not checked strictly, or we mock it
    language: 'python',
    code: code,
    customTestCases: [],
    runIndex: 2
  })
}).then(res => res.json()).then(console.log).catch(console.error);
