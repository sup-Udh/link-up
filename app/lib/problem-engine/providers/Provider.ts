import { NormalizedProblem } from "../types";

export interface ProblemProvider {
  /**
   * Identifies the source of the problem (e.g. 'leetcode', 'neetcode').
   */
  source: string;

  /**
   * Fetch and normalize a problem by its slug.
   * @param slug The unique identifier for the problem.
   */
  getProblem(slug: string): Promise<NormalizedProblem>;
}
