/**
 * Function Adapter
 *
 * Handles standard function problems:
 *   Arrays, Strings, Numbers, Booleans, Matrices
 *
 * These problems take primitive/array inputs and return primitive/array outputs.
 * No special data structure conversion is needed.
 */

import type { Example, ExecutionMetadata } from "../types";

export interface ParsedInput {
  /** Ordered argument values as JSON strings */
  args: string[];
}

/**
 * Parse an example's input string into ordered function arguments.
 *
 * Input format: "nums = [2,7,11,15], target = 9"
 * Output: { args: ["[2,7,11,15]", "9"] }
 *
 * Also handles unnamed inputs (one value per line from rawTestcases).
 */
export function parseFunctionInput(
  input: string,
  paramNames: string[]
): ParsedInput {
  // ── Strategy 1: Named parameters — "nums = [2,7,11,15], target = 9" ─
  // This is the format from extracted examples
  const namedArgs = parseNamedArgs(input);

  if (Object.keys(namedArgs).length > 0 && paramNames.length > 0) {
    // Order by parameter names
    const args = paramNames.map((name) => {
      if (namedArgs[name] !== undefined) return namedArgs[name];
      return "null";
    });
    return { args };
  }

  // ── Strategy 2: Line-separated values (from rawTestcases) ───────────
  // e.g. "[2,7,11,15]\n9"
  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "");

  return { args: lines };
}

/**
 * Parse named arguments from a string like:
 * "nums = [2,7,11,15], target = 9"
 *
 * Returns: { nums: "[2,7,11,15]", target: "9" }
 */
function parseNamedArgs(input: string): Record<string, string> {
  const result: Record<string, string> = {};

  // Match `name = value` patterns
  // Value can be: array [...], string "...", number, boolean, null, or nested
  const pattern =
    /([a-zA-Z_]\w*)\s*=\s*((?:\[[\s\S]*?\]|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|-?\d+(?:\.\d+)?|true|false|null))/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(input)) !== null) {
    const name = match[1].trim();
    const value = match[2].trim();
    result[name] = value;
  }

  // If regex didn't catch everything (e.g. complex nested arrays),
  // try a bracket-aware split
  if (Object.keys(result).length === 0) {
    return parseNamedArgsManual(input);
  }

  return result;
}

/**
 * Manual bracket-aware parser for complex inputs.
 * Handles nested arrays like: "matrix = [[1,2],[3,4]], k = 2"
 */
function parseNamedArgsManual(input: string): Record<string, string> {
  const result: Record<string, string> = {};

  // Find all "name = " anchors
  const anchors: { name: string; start: number }[] = [];
  const anchorRegex = /([a-zA-Z_]\w*)\s*=\s*/g;
  let m: RegExpExecArray | null;

  while ((m = anchorRegex.exec(input)) !== null) {
    anchors.push({
      name: m[1],
      start: m.index + m[0].length,
    });
  }

  for (let i = 0; i < anchors.length; i++) {
    const start = anchors[i].start;
    const end = i + 1 < anchors.length ? findSplitPoint(input, start, anchors[i + 1].start) : input.length;
    const value = input.slice(start, end).trim().replace(/,\s*$/, "");
    result[anchors[i].name] = value;
  }

  return result;
}

/**
 * Find the comma split point between two named args, respecting brackets.
 */
function findSplitPoint(input: string, start: number, nextAnchor: number): number {
  let depth = 0;
  for (let i = start; i < nextAnchor; i++) {
    const ch = input[i];
    if (ch === "[" || ch === "(" || ch === "{") depth++;
    else if (ch === "]" || ch === ")" || ch === "}") depth--;
    else if (ch === "," && depth === 0) {
      // Check if the next non-whitespace is the next anchor
      const remaining = input.slice(i + 1, nextAnchor).trim();
      if (remaining.match(/^[a-zA-Z_]\w*\s*=/)) {
        return i;
      }
    }
  }
  return nextAnchor;
}
