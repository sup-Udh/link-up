const fs = require('fs');

async function test() {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        exampleTestcases
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
  console.log("exampleTestcases:", data.data.question.exampleTestcases);
  console.log("sampleTestCase:", data.data.question.sampleTestCase);
}

test();
