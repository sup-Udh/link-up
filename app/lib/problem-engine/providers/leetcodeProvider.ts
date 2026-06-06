import { ProblemProvider } from "./Provider";
import { NormalizedProblem } from "../types";
import { fetchLeetCodeProblem } from "@/app/lib/leetcode";
import { normalizeProblem } from "../normalizeProblem";

export class LeetCodeProvider implements ProblemProvider {
  source = "leetcode";

  async getProblem(slug: string): Promise<NormalizedProblem> {
    const raw = await fetchLeetCodeProblem(slug);
    const normalized = normalizeProblem(raw);
    
    // Tag the problem with its source so downstream consumers know where it came from
    return {
      ...normalized,
      source: this.source,
    } as NormalizedProblem & { source: string };
  }
}
