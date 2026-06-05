/**
 * Shared types for the universal LeetCode execution engine.
 * All problem data flows through these interfaces.
 */

// ─── Core Problem Shape ──────────────────────────────────────────────

export interface NormalizedProblem {
  slug: string;
  questionId: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  content: string;                          // Raw HTML description
  examples: Example[];                      // Parsed from content HTML
  starterCode: Record<string, string>;      // langSlug → code snippet
  topicTags: string[];
  hints: string[];
  rawTestcases: string;                     // exampleTestcases (newline-separated raw values)
  metadata: ExecutionMetadata;
}

// ─── Parsed Example ──────────────────────────────────────────────────

export interface Example {
  id: string;       // Sequential: "1", "2", …
  title: string;    // "Example 1", "Example 2", …
  input: string;    // "nums = [2,7,11,15], target = 9"
  output: string;   // "[0,1]"
}

// ─── Execution Metadata ──────────────────────────────────────────────

export interface ExecutionMetadata {
  functionName: string;
  parameters: string[];
  problemType: ProblemType;
  apiMetadata?: any;
}

// ─── Problem Type ────────────────────────────────────────────────────

export type ProblemType =
  | "FUNCTION"
  | "LINKED_LIST"
  | "TREE"
  | "GRAPH"
  | "MATRIX"
  | "DESIGN";

// ─── Test Case Result ────────────────────────────────────────────────

export interface TestCaseResult {
  passed: boolean;
  expected: string;
  received: string;
  error?: string;
  executionTime?: number;
}

// ─── Raw LeetCode GraphQL Response ───────────────────────────────────

export interface RawLeetCodeQuestion {
  questionId: string;
  title: string;
  titleSlug: string;
  content: string;
  difficulty: string;
  exampleTestcases: string;
  codeSnippets: { lang: string; langSlug: string; code: string }[];
  topicTags: { name: string }[];
  hints: string[];
  metaData?: string;
}
