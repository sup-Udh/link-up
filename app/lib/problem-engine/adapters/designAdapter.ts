/**
 * Design Adapter
 *
 * Handles design problems (class-based) like:
 * - LRU Cache
 * - Min Stack
 * - Twitter
 * - Browser History
 *
 * LeetCode format for design problems:
 *   Input:  ["LRUCache", "put", "put", "get"]
 *           [[2], [1, 1], [2, 2], [1]]
 *   Output: [null, null, null, 1]
 *
 * The adapter generates wrapper code that:
 * 1. Instantiates the class with constructor args
 * 2. Iterates through operations array
 * 3. Calls methods in sequence
 * 4. Collects return values
 */

/**
 * Generate design problem wrapper for JavaScript.
 *
 * @param className  - e.g., "LRUCache"
 * @param operations - Raw operations string: '["LRUCache","put","get"]'
 * @param arguments_ - Raw arguments string: '[[2],[1,1],[1]]'
 * @returns Wrapper code that executes all operations
 */
export function generateDesignWrapper(
  language: string,
  className: string
): string {
  switch (language) {
    case "javascript":
    case "typescript":
      return generateJSDesignWrapper(className);
    case "python":
      return generatePythonDesignWrapper(className);
    default:
      return generateJSDesignWrapper(className);
  }
}

function generateJSDesignWrapper(className: string): string {
  return `
function __executeDesign(operations, args) {
  const results = [null]; // First operation is always constructor
  const instance = new ${className}(...args[0]);
  for (let i = 1; i < operations.length; i++) {
    const method = operations[i];
    if (typeof instance[method] === 'function') {
      const result = instance[method](...args[i]);
      results.push(result === undefined ? null : result);
    } else {
      results.push(null);
    }
  }
  return results;
}
`;
}

function generatePythonDesignWrapper(className: string): string {
  return `
def execute_design(operations, args):
    results = [None]  # First operation is always constructor
    instance = ${className}(*args[0])
    for i in range(1, len(operations)):
        method = operations[i]
        if hasattr(instance, method):
            result = getattr(instance, method)(*args[i])
            results.append(result)
        else:
            results.append(None)
    return results
`;
}

/**
 * Parse design problem input from example string.
 *
 * Input format:
 *   "["LRUCache","put","put","get","put","get"]
 *    [[2],[1,1],[2,2],[1],[3,3],[2]]"
 *
 * Returns: { operations: string[], arguments: any[][] }
 */
export function parseDesignInput(input: string): {
  operations: string[];
  arguments: any[][];
} | null {
  try {
    // Split into two lines: operations and arguments
    const lines = input
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) return null;

    const operations = JSON.parse(lines[0]);
    const args = JSON.parse(lines[1]);

    if (!Array.isArray(operations) || !Array.isArray(args)) return null;

    return { operations, arguments: args };
  } catch {
    return null;
  }
}
