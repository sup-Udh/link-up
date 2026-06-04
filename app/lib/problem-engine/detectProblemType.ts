/**
 * Problem Type Detection
 *
 * Analyzes starter code, examples, and content to classify the problem type.
 * This determines which adapter is used during execution.
 */

import type { ProblemType } from "./types";

/**
 * Detect the problem type from the starter code and problem content.
 *
 * @param starterCode - The JavaScript/TypeScript starter code (preferred), or any available language
 * @param content     - The problem HTML content
 * @returns The detected problem type
 */
export function detectProblemType(
  starterCode: string,
  content: string = ""
): ProblemType {
  const code = starterCode.toLowerCase();
  const html = content.toLowerCase();

  // ── DESIGN ──────────────────────────────────────────────────────────
  // Design problems have class constructors or prototype patterns.
  // Examples: LRUCache, MinStack, Twitter, BrowserHistory
  //
  // Patterns:
  //   var LRUCache = function(capacity) { ... }
  //   LRUCache.prototype.get = function(key) { ... }
  //   class LRUCache { constructor(capacity) { ... } }
  if (
    /\.prototype\./.test(starterCode) ||
    /var\s+\w+\s*=\s*function\s*\(/.test(starterCode) ||
    (/class\s+\w+/.test(starterCode) && /constructor\s*\(/.test(starterCode))
  ) {
    // Make sure it's not just a regular function that happens to use `var f = function`
    // Design problems always have multiple method definitions
    const protoCount = (starterCode.match(/\.prototype\./g) || []).length;
    const methodCount = (starterCode.match(
      /^\s*\w+\s*\([^)]*\)\s*\{/gm
    ) || []).length;

    if (protoCount >= 1 || methodCount >= 2) {
      return "DESIGN";
    }
  }

  // ── LINKED_LIST ─────────────────────────────────────────────────────
  // Linked list problems reference ListNode in code or content.
  // Parameters: head, l1, l2, node
  if (
    /listnode/i.test(starterCode) ||
    /listnode/i.test(content) ||
    /\(\s*head\s*[,)]/i.test(starterCode) ||
    /\(\s*l1\s*,\s*l2\s*[,)]/i.test(starterCode)
  ) {
    return "LINKED_LIST";
  }

  // ── TREE ────────────────────────────────────────────────────────────
  // Tree problems reference TreeNode in code or content.
  // Parameters: root, p, q (when combined with tree context)
  if (
    /treenode/i.test(starterCode) ||
    /treenode/i.test(content) ||
    (/\(\s*root\s*[,)]/i.test(starterCode) &&
      (html.includes("binary tree") || html.includes("bst") || html.includes("tree")))
  ) {
    return "TREE";
  }

  // ── GRAPH ───────────────────────────────────────────────────────────
  // Graph problems mention adjacency lists/matrices or graph terminology.
  if (
    html.includes("adjacency") ||
    html.includes("directed graph") ||
    html.includes("undirected graph") ||
    (/\(\s*n\s*,\s*edges\s*[,)]/i.test(starterCode)) ||
    (/\(\s*graph\s*[,)]/i.test(starterCode))
  ) {
    return "GRAPH";
  }

  // ── MATRIX ──────────────────────────────────────────────────────────
  // Matrix problems take 2D arrays as input.
  // Parameters: grid, matrix, board, image
  if (
    /\(\s*(grid|matrix|board|image|dungeon|rooms|heights)\s*[,)]/i.test(starterCode) ||
    (html.includes("m x n") && html.includes("matrix")) ||
    (html.includes("grid") && html.includes("2d"))
  ) {
    return "MATRIX";
  }

  // ── FUNCTION (default) ──────────────────────────────────────────────
  // Standard function problems: arrays, strings, numbers, booleans, etc.
  return "FUNCTION";
}
