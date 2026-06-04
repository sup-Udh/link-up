/**
 * Example Extraction Engine
 *
 * Parses LeetCode's HTML `content` field to extract structured examples.
 * Ignores: Constraints, Follow-up, Explanation, Notes.
 * Only extracts Input / Output pairs from <pre> blocks or <strong> markers.
 */

import type { Example } from "./types";

/**
 * Extract examples from LeetCode problem HTML content.
 */
export function extractExamples(htmlContent: string): Example[] {
  if (!htmlContent) return [];

  const examples: Example[] = [];

  // ── Strategy 1: Match <pre> blocks containing Input/Output ──────────
  //
  // LeetCode typically wraps examples in <pre> tags like:
  //   <pre><strong>Input:</strong> nums = [2,7,11,15], target = 9
  //   <strong>Output:</strong> [0,1]
  //   <strong>Explanation:</strong> ...
  //   </pre>
  //
  // But newer problems may use <div class="example-block"> instead.

  // Try <pre> blocks first
  const preBlockRegex = /<pre>([\s\S]*?)<\/pre>/g;
  let match: RegExpExecArray | null;

  while ((match = preBlockRegex.exec(htmlContent)) !== null) {
    const block = match[1];
    const parsed = parseInputOutput(block);
    if (parsed) {
      examples.push(parsed);
    }
  }

  // ── Strategy 2: Match <div class="example-block"> blocks ────────────
  // Newer LeetCode problems use this format
  if (examples.length === 0) {
    const divBlockRegex = /<div class="example-block"[^>]*>([\s\S]*?)<\/div>/g;
    while ((match = divBlockRegex.exec(htmlContent)) !== null) {
      const block = match[1];
      const parsed = parseInputOutput(block);
      if (parsed) {
        examples.push(parsed);
      }
    }
  }

  // ── Strategy 3: Look for Example N headers followed by Input/Output ─
  // Some problems use <p><strong>Example N:</strong></p> followed by content
  if (examples.length === 0) {
    const exampleSectionRegex =
      /Example\s*\d+:?\s*<\/strong>[\s\S]*?Input[^:]*:\s*<\/strong>\s*([\s\S]*?)(?:<strong>|<\/p>)/gi;
    while ((match = exampleSectionRegex.exec(htmlContent)) !== null) {
      const block = match[0];
      const parsed = parseInputOutput(block);
      if (parsed) {
        examples.push(parsed);
      }
    }
  }

  // Assign sequential IDs and titles
  return examples.map((ex, idx) => ({
    ...ex,
    id: String(idx + 1),
    title: `Example ${idx + 1}`,
  }));
}

/**
 * Parse a single block of HTML text to extract Input and Output values.
 */
function parseInputOutput(block: string): Example | null {
  // Strip HTML tags for cleaner matching
  const stripped = stripHtml(block);

  // Match Input: ... and Output: ...
  const inputMatch = stripped.match(
    /Input:\s*([\s\S]*?)(?=Output:|$)/i
  );
  const outputMatch = stripped.match(
    /Output:\s*([\s\S]*?)(?=Explanation:|Follow[- ]?up:|Note:|Constraints:|$)/i
  );

  if (!inputMatch || !outputMatch) return null;

  const input = inputMatch[1].trim();
  const output = outputMatch[1].trim();

  // Skip empty matches
  if (!input && !output) return null;

  return { id: "", title: "", input, output };
}

/**
 * Strip HTML tags and decode common HTML entities.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")       // Remove HTML tags
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ");      // Non-breaking space
}
