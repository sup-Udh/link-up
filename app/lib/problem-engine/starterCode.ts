/**
 * Starter Code Registry
 *
 * Maps LeetCode's langSlug values to our internal language IDs and
 * provides utilities for loading the correct starter code.
 */

import type { NormalizedProblem } from "./types";

// ─── LeetCode langSlug → Internal language ID mapping ─────────────────

const LEETCODE_SLUG_MAP: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python3: "python",
  python: "python",
  java: "java",
  cpp: "cpp",
  "c++": "cpp",
  c: "c",
  csharp: "csharp",
  "c#": "csharp",
  golang: "go",
  go: "go",
  rust: "rust",
  kotlin: "kotlin",
  swift: "swift",
  php: "php",
  ruby: "ruby",
  scala: "scala",
  dart: "dart",
};

/**
 * Get the starter code for a specific language from a normalized problem.
 *
 * @param problem    - The normalized problem containing all starter code
 * @param languageId - Our internal language ID (e.g., "javascript", "python")
 * @returns The starter code string, or null if not available
 */
export function getStarterCode(
  problem: NormalizedProblem,
  languageId: string
): string | null {
  // Direct match first
  if (problem.starterCode[languageId]) {
    return problem.starterCode[languageId];
  }

  // Try reverse lookup through the slug map
  for (const [slug, id] of Object.entries(LEETCODE_SLUG_MAP)) {
    if (id === languageId && problem.starterCode[slug]) {
      return problem.starterCode[slug];
    }
  }

  return null;
}

/**
 * Build the starterCode map from raw LeetCode codeSnippets.
 * Maps both the original langSlug and our internal ID for easy lookup.
 */
export function buildStarterCodeMap(
  codeSnippets: { lang: string; langSlug: string; code: string }[]
): Record<string, string> {
  const map: Record<string, string> = {};

  for (const snippet of codeSnippets) {
    // Store under LeetCode's langSlug
    map[snippet.langSlug] = snippet.code;

    // Also store under our internal language ID
    const internalId = LEETCODE_SLUG_MAP[snippet.langSlug];
    if (internalId && internalId !== snippet.langSlug) {
      map[internalId] = snippet.code;
    }
  }

  return map;
}

/**
 * Check if the editor content is "empty" or contains only a starter code.
 * Used to decide whether to inject starter code or not.
 */
export function isEditorEmpty(content: string): boolean {
  const trimmed = content.trim();
  return trimmed === "" || trimmed === "\n";
}

/**
 * Get all available language IDs from a normalized problem.
 */
export function getAvailableLanguages(problem: NormalizedProblem): string[] {
  const ids = new Set<string>();

  for (const slug of Object.keys(problem.starterCode)) {
    const internalId = LEETCODE_SLUG_MAP[slug] || slug;
    ids.add(internalId);
  }

  return Array.from(ids);
}
