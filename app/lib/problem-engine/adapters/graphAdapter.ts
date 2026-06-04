/**
 * Graph Adapter
 *
 * Handles graph problems. Most graph problems on LeetCode use
 * standard array inputs (adjacency lists, edge lists, adjacency matrices)
 * so the adapter mainly handles output format normalization.
 *
 * Graph input formats on LeetCode:
 * - Edge list: edges = [[0,1],[1,2],[2,0]]
 * - Adjacency list: graph = [[1,2],[0,2],[0,1]]
 * - n + edges: n = 4, edges = [[0,1],[1,2]]
 *
 * These are all standard arrays — no special deserialization needed.
 * The function adapter handles the input parsing.
 */

/**
 * Get graph helper code. Most graph problems don't need special helpers
 * since they use plain arrays, but some problems need Node cloning support.
 */
export function getGraphHelpers(language: string): string {
  switch (language) {
    case "javascript":
    case "typescript":
      return JS_GRAPH_HELPERS;
    case "python":
      return PYTHON_GRAPH_HELPERS;
    default:
      return JS_GRAPH_HELPERS;
  }
}

// ─── JavaScript Helpers ───────────────────────────────────────────────

const JS_GRAPH_HELPERS = `
// Graph Node for problems like Clone Graph
function _Node(val, neighbors) {
  this.val = val === undefined ? 0 : val;
  this.neighbors = neighbors === undefined ? [] : neighbors;
}

// Build adjacency list graph from node list
function __buildGraph(adjList) {
  if (!adjList || adjList.length === 0) return null;
  const nodes = adjList.map((_, i) => new _Node(i + 1));
  for (let i = 0; i < adjList.length; i++) {
    nodes[i].neighbors = (adjList[i] || []).map(idx => nodes[idx - 1]);
  }
  return nodes[0];
}

// Serialize graph back to adjacency list
function __serializeGraph(node) {
  if (!node) return [];
  const visited = new Map();
  const queue = [node];
  visited.set(node.val, node);
  while (queue.length > 0) {
    const curr = queue.shift();
    for (const neighbor of curr.neighbors) {
      if (!visited.has(neighbor.val)) {
        visited.set(neighbor.val, neighbor);
        queue.push(neighbor);
      }
    }
  }
  const result = [];
  for (let i = 1; i <= visited.size; i++) {
    const n = visited.get(i);
    result.push(n ? n.neighbors.map(nb => nb.val) : []);
  }
  return result;
}
`;

// ─── Python Helpers ───────────────────────────────────────────────────

const PYTHON_GRAPH_HELPERS = `
class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []

def build_graph(adj_list):
    if not adj_list:
        return None
    nodes = [Node(i + 1) for i in range(len(adj_list))]
    for i, neighbors in enumerate(adj_list):
        nodes[i].neighbors = [nodes[j - 1] for j in (neighbors or [])]
    return nodes[0]

def serialize_graph(node):
    if not node:
        return []
    visited = {}
    queue = [node]
    visited[node.val] = node
    while queue:
        curr = queue.pop(0)
        for neighbor in curr.neighbors:
            if neighbor.val not in visited:
                visited[neighbor.val] = neighbor
                queue.append(neighbor)
    result = []
    for i in range(1, len(visited) + 1):
        n = visited.get(i)
        result.append([nb.val for nb in n.neighbors] if n else [])
    return result
`;
