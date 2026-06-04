/**
 * Tree Adapter
 *
 * Handles problems that work with TreeNode data structures.
 * Converts: BFS Array → TreeNode → Execute → Serialize back to BFS Array
 *
 * Used for problems like: Maximum Depth of Binary Tree, Invert Binary Tree,
 * Validate BST, Lowest Common Ancestor, etc.
 *
 * BFS array format: [1, null, 2, 3] represents:
 *       1
 *        \
 *         2
 *        /
 *       3
 */

/**
 * Generate tree helper code for the given language.
 */
export function getTreeHelpers(language: string): string {
  switch (language) {
    case "javascript":
    case "typescript":
      return JS_TREE_HELPERS;
    case "python":
      return PYTHON_TREE_HELPERS;
    case "java":
      return JAVA_TREE_HELPERS;
    case "cpp":
      return CPP_TREE_HELPERS;
    default:
      return JS_TREE_HELPERS;
  }
}

/**
 * Generate the serialization call for a tree result.
 */
export function getTreeSerializeCall(language: string, resultVar: string): string {
  switch (language) {
    case "javascript":
    case "typescript":
      return `__serializeTree(${resultVar})`;
    case "python":
      return `serialize_tree(${resultVar})`;
    case "java":
      return `serializeTree(${resultVar})`;
    case "cpp":
      return `serializeTree(${resultVar})`;
    default:
      return `__serializeTree(${resultVar})`;
  }
}

/**
 * Generate the deserialization call for a tree input.
 */
export function getTreeDeserializeCall(language: string, arrayExpr: string): string {
  switch (language) {
    case "javascript":
    case "typescript":
      return `__buildTree(${arrayExpr})`;
    case "python":
      return `build_tree(${arrayExpr})`;
    case "java":
      return `buildTree(${arrayExpr})`;
    case "cpp":
      return `buildTree(${arrayExpr})`;
    default:
      return `__buildTree(${arrayExpr})`;
  }
}

// ─── JavaScript / TypeScript Helpers ──────────────────────────────────

const JS_TREE_HELPERS = `
function TreeNode(val, left, right) {
  this.val = (val === undefined ? 0 : val);
  this.left = (left === undefined ? null : left);
  this.right = (right === undefined ? null : right);
}

function __buildTree(arr) {
  if (!arr || arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (i < arr.length) {
    const node = queue.shift();
    if (!node) continue;
    if (i < arr.length && arr[i] !== null) {
      node.left = new TreeNode(arr[i]);
      queue.push(node.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null) {
      node.right = new TreeNode(arr[i]);
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

function __serializeTree(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    if (node) {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    } else {
      result.push(null);
    }
  }
  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }
  return result;
}
`;

// ─── Python Helpers ───────────────────────────────────────────────────

const PYTHON_TREE_HELPERS = `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    while i < len(arr):
        node = queue.pop(0)
        if node is None:
            continue
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    return root

def serialize_tree(root):
    if not root:
        return []
    result = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)
    while result and result[-1] is None:
        result.pop()
    return result
`;

// ─── Java Helpers ─────────────────────────────────────────────────────

const JAVA_TREE_HELPERS = `
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

static TreeNode buildTree(Integer[] arr) {
    if (arr == null || arr.length == 0 || arr[0] == null) return null;
    TreeNode root = new TreeNode(arr[0]);
    java.util.Queue<TreeNode> queue = new java.util.LinkedList<>();
    queue.add(root);
    int i = 1;
    while (i < arr.length) {
        TreeNode node = queue.poll();
        if (node == null) continue;
        if (i < arr.length && arr[i] != null) {
            node.left = new TreeNode(arr[i]);
            queue.add(node.left);
        }
        i++;
        if (i < arr.length && arr[i] != null) {
            node.right = new TreeNode(arr[i]);
            queue.add(node.right);
        }
        i++;
    }
    return root;
}

static String serializeTree(TreeNode root) {
    if (root == null) return "[]";
    java.util.List<String> result = new java.util.ArrayList<>();
    java.util.Queue<TreeNode> queue = new java.util.LinkedList<>();
    queue.add(root);
    while (!queue.isEmpty()) {
        TreeNode node = queue.poll();
        if (node != null) {
            result.add(String.valueOf(node.val));
            queue.add(node.left);
            queue.add(node.right);
        } else {
            result.add("null");
        }
    }
    while (result.size() > 0 && result.get(result.size()-1).equals("null")) {
        result.remove(result.size()-1);
    }
    return "[" + String.join(",", result) + "]";
}
`;

// ─── C++ Helpers ──────────────────────────────────────────────────────

const CPP_TREE_HELPERS = `
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

TreeNode* buildTree(vector<int*>& arr) {
    if (arr.empty() || arr[0] == nullptr) return nullptr;
    TreeNode* root = new TreeNode(*arr[0]);
    queue<TreeNode*> q;
    q.push(root);
    int i = 1;
    while (i < arr.size()) {
        TreeNode* node = q.front();
        q.pop();
        if (i < arr.size() && arr[i] != nullptr) {
            node->left = new TreeNode(*arr[i]);
            q.push(node->left);
        }
        i++;
        if (i < arr.size() && arr[i] != nullptr) {
            node->right = new TreeNode(*arr[i]);
            q.push(node->right);
        }
        i++;
    }
    return root;
}
`;
