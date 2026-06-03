export interface LeetCodeProblem {
  questionId: string;
  title: string;
  content: string;
  difficulty: string;
  metaData: string;
  sampleTestCase: string;
  codeSnippets: { langSlug: string; code: string }[];
}

export interface ProblemMetadata {
  slug: string;
  title: string;
  functionName: string;
  parameters: { name: string; type: string }[];
  returnType: { type: string; size?: number };
  starterCode: Record<string, string>;
  testCases: string[];
  expectedOutputs: string[];
}

export async function getProblemData(slug: string): Promise<LeetCodeProblem | null> {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        content
        difficulty
        metaData
        sampleTestCase
        codeSnippets {
          langSlug
          code
        }
      }
    }
  `;

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com/",
      },
      body: JSON.stringify({
        query,
        variables: { titleSlug: slug },
      }),
      next: { revalidate: 3600 },
    });

    const data = await response.json();
    return data?.data?.question || null;
  } catch (err) {
    console.error("Failed to fetch LeetCode data:", err);
    return null;
  }
}

export async function fetchLeetCodeMetadata(slug: string): Promise<ProblemMetadata | null> {
  const problem = await getProblemData(slug);
  if (!problem) return null;

  try {
    const meta = JSON.parse(problem.metaData);
    const starterCode: Record<string, string> = {};
    
    problem.codeSnippets.forEach((snippet: any) => {
      starterCode[snippet.langSlug] = snippet.code;
    });

    const numParams = meta.params.length;
    const rawTestCases = problem.sampleTestCase.split('\n').filter((l: string) => l.trim() !== "");
    const testCases: string[] = [];
    
    for (let i = 0; i < rawTestCases.length; i += numParams) {
      const tc = rawTestCases.slice(i, i + numParams).join('\n');
      if (tc) testCases.push(tc);
    }

    const expectedOutputs: string[] = [];
    const outputRegex = /Output(?:<\/strong>)?:\s*(.*?)(?:<|\n|$)/gi;
    let match;
    while ((match = outputRegex.exec(problem.content)) !== null) {
      expectedOutputs.push(match[1].trim());
    }

    return {
      slug,
      title: problem.title,
      functionName: meta.name,
      parameters: meta.params,
      returnType: meta.return,
      starterCode,
      testCases,
      expectedOutputs
    };
  } catch (err) {
    console.error("Error parsing LeetCode metadata:", err);
    return null;
  }
}
