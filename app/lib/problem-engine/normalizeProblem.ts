/**
 * Problem Normalizer
 *
 * Transforms raw LeetCode GraphQL responses into a clean NormalizedProblem.
 * This is the ONLY entry point for consuming LeetCode data.
 * Nothing else in the app should touch raw LeetCode responses.
 */

import type { NormalizedProblem, RawLeetCodeQuestion } from "./types";
import { extractExamples } from "./extractExamples";
import { detectProblemType } from "./detectProblemType";
import { extractExecutionMetadata } from "./extractExecutionMetadata";
import { buildStarterCodeMap } from "./starterCode";

/**
 * Normalize a raw LeetCode GraphQL question response into a structured problem.
 *
 * @param raw - The raw `question` object from LeetCode's GraphQL API
 * @returns A fully normalized problem ready for consumption by the app
 */
export function normalizeProblem(raw: RawLeetCodeQuestion): NormalizedProblem {
  // 1. Build starter code map from code snippets
  const starterCode = buildStarterCodeMap(raw.codeSnippets || []);

  // 2. Extract examples from HTML content
  const examples = extractExamples(raw.content || "");

  // 3. Get JavaScript starter code for analysis (most reliable for parsing)
  const jsCode =
    starterCode["javascript"] ||
    starterCode["typescript"] ||
    Object.values(starterCode)[0] ||
    "";

  // 4. Detect problem type
  const problemType = detectProblemType(jsCode, raw.content || "");

  // 5. Extract execution metadata
  const metadata = extractExecutionMetadata(jsCode, raw.content || "", problemType);

  // 6. Extract topic tags
  const topicTags = (raw.topicTags || []).map((t) => t.name);

  // 7. Build the normalized problem
  return {
    slug: raw.titleSlug,
    questionId: raw.questionId,
    title: raw.title,
    difficulty: raw.difficulty as NormalizedProblem["difficulty"],
    content: raw.content || "",
    examples,
    starterCode,
    topicTags,
    hints: raw.hints || [],
    rawTestcases: raw.exampleTestcases || "",
    metadata,
  };
}
