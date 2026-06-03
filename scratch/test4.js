const query = `query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { content } }`;
fetch('https://leetcode.com/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com/' }, body: JSON.stringify({ query, variables: { titleSlug: 'two-sum' } }) })
  .then(res => res.json())
  .then(data => {
    const fs = require('fs');
    fs.writeFileSync('scratch/two-sum-content.html', data.data.question.content);
    
    // test the regex here too
    const expectedOutputs = [];
    const outputRegex = /(?:<strong>)?Output:?(?:<\/strong>)?\s*:?\s*(.*?)(?:<|\n|$)/gi;
    let match;
    while ((match = outputRegex.exec(data.data.question.content)) !== null) {
      if (match[1].trim()) {
        expectedOutputs.push(match[1].trim());
      }
    }
    console.log(expectedOutputs);
  });
