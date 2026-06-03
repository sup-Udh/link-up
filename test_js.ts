const { fetchLeetCodeMetadata } = require('./app/lib/leetcode');
const { generateJavaScript } = require('./app/lib/generators/javascript');
const fs = require('fs');

async function run() {
  const meta = await fetchLeetCodeMetadata("two-sum");
  
  const code = `
var twoSum = function(nums, target) {
    return [0,1];
};
`;
  
  const finalCode = generateJavaScript(code, meta);
  fs.writeFileSync('scratch/generated.js', finalCode);
  
  // also run it
  const { execSync } = require('child_process');
  try {
    const out = execSync('node scratch/generated.js').toString();
    console.log("JS OUTPUT:", out);
  } catch(e) {
    console.log("JS ERROR:", e.message);
  }
}
run();
