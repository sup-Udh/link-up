/**
 * LeetCode GraphQL API Client
 *
 * Fetches problem data from LeetCode's public GraphQL endpoint.
 * Returns the raw response — normalization is done by the problem engine.
 */

import type { RawLeetCodeQuestion } from "./problem-engine/types";

/**
 * Fetch raw problem data from LeetCode GraphQL API.
 *
 * Includes: codeSnippets, topicTags, hints (expanded from previous version).
 *
 * @param slug - The problem's URL slug (e.g., "two-sum")
 * @returns Raw question data from LeetCode
 */
export async function fetchLeetCodeProblem(
  slug: string
): Promise<RawLeetCodeQuestion> {
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
            codeSnippets {
              lang
              langSlug
              code
            }
            topicTags {
              name
            }
            hints
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
    throw new Error(`Failed to fetch problem data for slug: ${slug}`);
  }

  return json.data.question as RawLeetCodeQuestion;
}
