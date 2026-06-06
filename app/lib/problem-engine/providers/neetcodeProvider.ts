import { ProblemProvider } from "./Provider";
import { NormalizedProblem } from "../types";
import { fetchLeetCodeProblem } from "@/app/lib/leetcode";
import { normalizeProblem } from "../normalizeProblem";
import { marked } from "marked";

export class NeetCodeProvider implements ProblemProvider {
  source = "neetcode";

  async getProblem(slug: string): Promise<NormalizedProblem> {
    // Attempt to fetch from NeetCode's custom problems API
    const response = await fetch('https://neetcode.io/api/getProblemMetadataFunctionHttp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { problemId: slug } })
    });

    if (response.ok) {
      const json = await response.json();
      if (json && json.data) {
        return this.parseCustomNeetCodeProblem(json.data, slug);
      }
    }

    // Fallback: NeetCode 150/All problems map 1:1 to LeetCode slugs.
    // We use the robust LeetCode GraphQL API under the hood.
    const raw = await fetchLeetCodeProblem(slug);
    const normalized = normalizeProblem(raw);

    return {
      ...normalized,
      source: this.source,
    } as NormalizedProblem & { source: string };
  }

  private parseCustomNeetCodeProblem(data: any, slug: string): NormalizedProblem {
    // Convert markdown to HTML asynchronously/synchronously. marked.parse is sync string -> string.
    const rawMarkdown = data.description || "";
    let htmlContent = "";
    try {
      htmlContent = marked.parse(rawMarkdown) as string;
    } catch (e) {
      htmlContent = rawMarkdown; // Fallback
    }

    return {
      slug: slug,
      questionId: data.id || slug,
      title: data.name || slug,
      difficulty: "Medium", // Custom problems usually default to Medium if not specified
      content: htmlContent,
      examples: [], // Examples are embedded inside the markdown description
      starterCode: data.starterCode || {},
      topicTags: data.tag ? [data.tag] : ["NeetCode"],
      hints: [],
      rawTestcases: "", // We might not have raw test cases for custom NeetCode problems
      metadata: {
        functionName: data.name || slug,
        parameters: [],
        problemType: "FUNCTION",
        apiMetadata: data
      },
      source: this.source,
    };
  }
}
