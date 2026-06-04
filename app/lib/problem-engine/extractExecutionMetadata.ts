/**
 * Execution Metadata Extraction
 *
 * Parses starter code to extract the function name and parameter names.
 * Uses JavaScript starter code as the primary source (most reliable parsing).
 */

import type { ExecutionMetadata, ProblemType } from "./types";
import { detectProblemType } from "./detectProblemType";

/**
 * Extract execution metadata from starter code.
 *
 * @param starterCode   - The starter code snippet (preferably JavaScript)
 * @param content       - The problem HTML content (for type detection)
 * @param problemType   - Optional pre-detected problem type
 * @returns Execution metadata with function name, parameters, and problem type
 */
export function extractExecutionMetadata(
  starterCode: string,
  content: string = "",
  problemType?: ProblemType
): ExecutionMetadata {
  const type = problemType ?? detectProblemType(starterCode, content);

  if (type === "DESIGN") {
    return extractDesignMetadata(starterCode, type);
  }

  return extractFunctionMetadata(starterCode, content, type);
}

/**
 * Extract metadata from standard function-style problems.
 */
function extractFunctionMetadata(
  code: string,
  content: string,
  type: ProblemType
): ExecutionMetadata {
  let functionName = "";
  let parameters: string[] = [];

  // ── Pattern 1: JavaScript — var/const/let name = function(params) ──
  const jsVarMatch = code.match(
    /(?:var|const|let)\s+(\w+)\s*=\s*function\s*\(([^)]*)\)/
  );
  if (jsVarMatch) {
    functionName = jsVarMatch[1];
    parameters = parseParamList(jsVarMatch[2]);
    return { functionName, parameters, problemType: type };
  }

  // ── Pattern 2: JavaScript — function name(params) ──────────────────
  const jsFnMatch = code.match(/function\s+(\w+)\s*\(([^)]*)\)/);
  if (jsFnMatch) {
    functionName = jsFnMatch[1];
    parameters = parseParamList(jsFnMatch[2]);
    return { functionName, parameters, problemType: type };
  }

  // ── Pattern 3: JavaScript Arrow — const name = (params) => ─────────
  const jsArrowMatch = code.match(
    /(?:var|const|let)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/
  );
  if (jsArrowMatch) {
    functionName = jsArrowMatch[1];
    parameters = parseParamList(jsArrowMatch[2]);
    return { functionName, parameters, problemType: type };
  }

  // ── Pattern 4: Python — def name(self, params): ────────────────────
  const pyMatch = code.match(/def\s+(\w+)\s*\(\s*self\s*,?\s*([^)]*)\)/);
  if (pyMatch) {
    functionName = pyMatch[1];
    parameters = parseParamList(pyMatch[2]);
    return { functionName, parameters, problemType: type };
  }

  // ── Pattern 5: Python — def name(params): (standalone function) ────
  const pyStandaloneMatch = code.match(/def\s+(\w+)\s*\(([^)]*)\)/);
  if (pyStandaloneMatch) {
    functionName = pyStandaloneMatch[1];
    parameters = parseParamList(pyStandaloneMatch[2]);
    return { functionName, parameters, problemType: type };
  }

  // ── Pattern 6: Java — public ReturnType name(params) ───────────────
  const javaMatch = code.match(
    /public\s+[\w<>\[\]]+\s+(\w+)\s*\(([^)]*)\)/
  );
  if (javaMatch) {
    functionName = javaMatch[1];
    parameters = parseJavaParams(javaMatch[2]);
    return { functionName, parameters, problemType: type };
  }

  // ── Pattern 7: C++ — ReturnType name(params) ──────────────────────
  const cppMatch = code.match(
    /(?:[\w<>&*\[\]:]+)\s+(\w+)\s*\(([^)]*)\)\s*\{/
  );
  if (cppMatch) {
    functionName = cppMatch[1];
    parameters = parseCppParams(cppMatch[2]);
    return { functionName, parameters, problemType: type };
  }

  // ── Pattern 8: Go — func name(params) ──────────────────────────────
  const goMatch = code.match(/func\s+(\w+)\s*\(([^)]*)\)/);
  if (goMatch) {
    functionName = goMatch[1];
    parameters = parseGoParams(goMatch[2]);
    return { functionName, parameters, problemType: type };
  }

  return { functionName: functionName || "solution", parameters, problemType: type };
}

/**
 * Extract metadata from design-pattern problems (class with methods).
 */
function extractDesignMetadata(
  code: string,
  type: ProblemType
): ExecutionMetadata {
  // Find class/constructor name
  const classMatch =
    code.match(/var\s+(\w+)\s*=\s*function/) ||
    code.match(/class\s+(\w+)/);

  const functionName = classMatch ? classMatch[1] : "Solution";

  // Find constructor params
  const ctorMatch =
    code.match(/var\s+\w+\s*=\s*function\s*\(([^)]*)\)/) ||
    code.match(/constructor\s*\(([^)]*)\)/);

  const parameters = ctorMatch ? parseParamList(ctorMatch[1]) : [];

  return { functionName, parameters, problemType: type };
}

// ─── Parameter Parsing Helpers ─────────────────────────────────────────

/**
 * Parse a comma-separated parameter list (JavaScript / Python style).
 * Strips type annotations like `: List[int]` or `: str`.
 */
function parseParamList(raw: string): string[] {
  if (!raw.trim()) return [];

  return raw
    .split(",")
    .map((p) => {
      // Strip type annotations (Python: `nums: List[int]`, TS: `nums: number[]`)
      const name = p.split(":")[0].split("=")[0].trim();
      return name;
    })
    .filter((p) => p.length > 0 && p !== "self");
}

/**
 * Parse Java-style parameters: `int[] nums, int target`
 */
function parseJavaParams(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(",")
    .map((p) => {
      const parts = p.trim().split(/\s+/);
      return parts[parts.length - 1];  // Last token is the param name
    })
    .filter((p) => p.length > 0);
}

/**
 * Parse C++ parameters: `vector<int>& nums, int target`
 */
function parseCppParams(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(",")
    .map((p) => {
      // Remove reference/pointer markers and get the last word
      const cleaned = p.replace(/[&*]/g, "").trim();
      const parts = cleaned.split(/\s+/);
      return parts[parts.length - 1];
    })
    .filter((p) => p.length > 0);
}

/**
 * Parse Go parameters: `nums []int, target int`
 */
function parseGoParams(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(",")
    .map((p) => {
      const parts = p.trim().split(/\s+/);
      return parts[0];  // First token is the param name in Go
    })
    .filter((p) => p.length > 0);
}
