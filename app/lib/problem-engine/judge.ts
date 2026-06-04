/**
 * Judge Engine
 *
 * Compares the execution output against the expected output.
 * Normalizes both outputs to handle differences in whitespace,
 * formatting, and language-specific representations (e.g. True vs true).
 */

export function judge(expected: string, received: string): boolean {
  if (!expected || !received) return false;

  const exp = normalizeOutput(expected);
  const rec = normalizeOutput(received);

  // Exact match after normalization
  if (exp === rec) return true;

  // Try parsing as JSON to compare objects/arrays (order matters for now, except for certain problems)
  try {
    const expJson = JSON.parse(exp);
    const recJson = JSON.parse(rec);
    return deepEqual(expJson, recJson);
  } catch {
    // If not valid JSON, stick with string comparison
  }

  // Handle floats/numbers
  const expNum = Number(exp);
  const recNum = Number(rec);
  if (!isNaN(expNum) && !isNaN(recNum)) {
    // Arbitrary precision up to 5 decimals
    return Math.abs(expNum - recNum) < 1e-5;
  }

  return false;
}

/**
 * Normalizes a string output for comparison.
 */
function normalizeOutput(str: string): string {
  let s = str.trim();
  
  // Strip outer quotes for strings
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.substring(1, s.length - 1);
  }

  // Normalize booleans
  if (s.toLowerCase() === "true") return "true";
  if (s.toLowerCase() === "false") return "false";

  // Normalize nulls (Python's None -> null)
  if (s === "None" || s === "null" || s === "undefined") return "null";

  // Normalize arrays spacing e.g., [1, 2, 3] -> [1,2,3]
  s = s.replace(/\\s*([,\\[\\]])\\s*/g, "$1");

  return s;
}

/**
 * Deep equality check for parsed JSON.
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
}
