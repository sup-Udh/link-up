
// export interface LeetCodeProblem {
//   questionId: string;
//   title: string;
//   content: string;
//   difficulty: string;
//   metaData: string;
//   sampleTestCase: string;
//   exampleTestcases?: string;
//   codeSnippets: { langSlug: string; code: string }[];
// }

import test from "node:test";

// export interface ProblemMetadata {
//   slug: string;
//   title: string;
//   functionName: string;
//   parameters: { name: string; type: string }[];
//   returnType: { type: string; size?: number };
//   starterCode: Record<string, string>;
//   testCases: string[];
//   expectedOutputs: string[];
// }

export interface extractedProblemData{
  slug: string;
  questionId: string;
  title : string;
  difficulty: string;
  content: string;
  testcases : any[]

}

interface recievedProblemData{
  questionId: string,
  title: string,
  titleSlug: string,
  content: string,
  difficulty: string,
  exampleTestcases: string
}

// export function returnSlugText(text: string) {
//   return text;
// }

// export async function fetchLeetCodeProblem(slug: string): Promise<LeetCodeProblem> {
//   const response = await fetch(`https://leetcode.com/graphql`, {
//     method: 'POST',
//     headers: {  
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       query: "query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId title titleSlug content difficulty similarQuestions exampleTestcases topicTags { name slug } } }",
//       variables: {
//         titleSlug: slug,
//       },
//     }),
//   });
  


//   const data = await response.json();
//   console.log('Fetched LeetCode problem data:', data);
//   return data as LeetCodeProblem;
//  }

// const data_real = data.content;

// function extractTestCases(htmlContent: string) {
    
//     // Regex to match anything inside <pre> tags where examples live
//     const preBlockRegex = /<pre>([\s\S]*?)<\/pre>/g;
    
//     // Regex patterns to capture specific Input and Output segments safely across potential newlines
//     const inputRegex = /Input:<\/strong>\s*([\s\S]*?)(?=\n|<strong>Output:|$)/;
//     const outputRegex = /Output:<\/strong>\s*([\s\S]*?)(?=\n|<strong>Explanation:|$)/;

//     const testCases = [];
//     let match;
//     let exampleCount = 1;

//     // Loop through every <pre> block found in the HTML string
//     while ((match = preBlockRegex.exec(htmlContent)) !== null) {
//         const blockContent = match[1];

//         const inputMatch = blockContent.match(inputRegex);
//         const outputMatch = blockContent.match(outputRegex);

//         if (inputMatch && outputMatch) {
//             testCases.push({
//                 example: `Example ${exampleCount++}`,
//                 input: inputMatch[1].trim(),
//                 output: outputMatch[1].trim()
//             });
//         }
//     }

//     return testCases;
// }

// // Execute the filter function
// const results = extractTestCases(data_real);

// function parseDynamicInput(inputStr: string) {
//   const result: Record<string, any> = {};
    
//     // This regex looks for patterns like: variable_name = value
//     // It captures the name and handles values until it sees a comma followed by another variable name
//     const pattern = /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([\s\S]*?)(?=\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=|$)/g;
    
//     let match;
//     while ((match = pattern.exec(inputStr)) !== null) {
//         const variableName = match[1].trim();
//         let rawValue = match[2].trim();
        
//       try {
//         // Automatically converts strings like "[1,2]", "9", or '"abc"' into actual JS Arrays, Numbers, or Strings
//         result[variableName] = JSON.parse(rawValue);
//       } catch (e) {
//         // Fallback: If JSON.parse fails (e.g., poorly formatted string), keep it as a clean string
//         result[variableName] = rawValue;
//       }
//     }
    
//     return result;
// }

// // Map over all datasets to parse them at once
// const parsedDatasets = results.map(data => ({
//     original: data.input,
//     parsed: parseDynamicInput(data.input)
// }));

// function parseOutputValue(outputStr: string) {
//     const cleanOutput = outputStr.trim();
//     try {
//         return JSON.parse(cleanOutput);
//     } catch (e) {
//         return cleanOutput; // Fallback to string if it's plain text
//     }
// }

// const parsedResults = results.map(test => {
//     return {
//         example: test.example,
//         parsedInput: parseDynamicInput(test.input),
//         parsedOutput: parseOutputValue(test.output)
//     };
// });


// parsedResults.forEach(result => {
//     console.log(`\n${result.example}:`);
//     console.log('Parsed Output:', result.parsedOutput);
//     console.log('Parsed Input:', result.parsedInput);
//   }
// );

// // Print the clean list of testcases
// // console.log(JSON.stringify(results, null, 2));






export async function fetchLeetCodeProblem(slug: string) {
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId
            title
            titleSlug
            content
            difficulty
            exampleTestcases
          }
        }
      `,
      variables: {
        titleSlug: slug,
      },
    }),
  });

  const json = await response.json();

  if (!json?.data?.question) {
    throw new Error("Failed to fetch problem data");
  }

  return json.data.question;
}

export function extractTestCases(htmlContent: string) {
  const preBlockRegex = /<pre>([\s\S]*?)<\/pre>/g;

  const inputRegex =
    /Input:<\/strong>\s*([\s\S]*?)(?=\n|<strong>Output:|$)/;

  const outputRegex =
    /Output:<\/strong>\s*([\s\S]*?)(?=\n|<strong>Explanation:|$)/;

  const testCases = [];

  let match;
  let exampleCount = 1;

  while ((match = preBlockRegex.exec(htmlContent)) !== null) {
    const blockContent = match[1];

    const inputMatch = blockContent.match(inputRegex);
    const outputMatch = blockContent.match(outputRegex);

    if (inputMatch && outputMatch) {
      testCases.push({
        example: `Example ${exampleCount++}`,
        input: inputMatch[1].trim(),
        output: outputMatch[1].trim(),
      });
    }
  }

  return testCases;
}

export async function getProblemData(slug: string) {
  const problem = await fetchLeetCodeProblem(slug);

  const testCases = extractTestCases(problem.content);

  const temp: recievedProblemData = problem;
  const returnValue: extractedProblemData = {
    slug: temp.titleSlug,
    questionId: temp.questionId,
    title: temp.title,
    difficulty: temp.difficulty,
    testcases: testCases,
    content: temp.content
  }
  return returnValue
}


  
