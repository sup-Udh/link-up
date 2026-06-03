const fs = require('fs');

async function test() {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        title
        content
        metaData
        sampleTestCase
      }
    }
  `;

  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com/",
    },
    body: JSON.stringify({
      query,
      variables: { titleSlug: "two-sum" },
    })
  });

  const data = await response.json();
  const problem = data.data.question;
  const meta = JSON.parse(problem.metaData);
  const numParams = meta.params.length;
  
  const rawTestCases = problem.sampleTestCase.split('\n').filter(l => l.trim() !== "");
  const testCases = [];
  
  for (let i = 0; i < rawTestCases.length; i += numParams) {
    const tc = rawTestCases.slice(i, i + numParams).join('\n');
    if (tc) testCases.push(tc);
  }

  const expectedOutputs = [];
  const outputRegex = /(?:<strong>)?Output:?(?:<\/strong>)?\s*:?\s*(.*?)(?:<|\n|$)/gi;
  let match;
  while ((match = outputRegex.exec(problem.content)) !== null) {
    if (match[1].trim()) {
      expectedOutputs.push(match[1].trim());
    }
  }

  console.log("Test Cases:", testCases);
  console.log("Expected Outputs:", expectedOutputs);
}

test();
