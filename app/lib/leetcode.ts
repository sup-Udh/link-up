export interface LeetCodeProblem {
  questionId: string;
  title: string;
  content: string;
  difficulty: string;
}

export async function getProblemData(slug: string): Promise<LeetCodeProblem | null> {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        content
        difficulty
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
      // Revalidate cache every hour if Next.js caches this
      next: { revalidate: 3600 },
    });

    const data = await response.json();
    return data?.data?.question || null;
  } catch (err) {
    console.error("Failed to fetch LeetCode data:", err);
    return null;
  }
}
