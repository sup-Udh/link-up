const fs = require('fs');
const content = fs.readFileSync('scratch/two-sum-content.html', 'utf-8');
const expectedOutputs = [];
const outputRegex = /(?:<strong>)?Output:?(?:<\/strong>)?\s*:?\s*(.*?)(?:<|\n|$)/gi;
let match;
while ((match = outputRegex.exec(content)) !== null) {
    if (match[1].trim()) {
    expectedOutputs.push(match[1].trim());
    }
}
console.log(expectedOutputs);
expectedOutputs.forEach(o => console.log(JSON.stringify(o)));
