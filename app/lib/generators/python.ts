import { ProblemMetadata } from "../leetcode";

export function generatePython(code: string, meta: ProblemMetadata): string {
  const helperCode = `
import json

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def array_to_list(arr):
    if not arr:
        return None
    dummy = ListNode()
    curr = dummy
    for val in arr:
        curr.next = ListNode(val)
        curr = curr.next
    return dummy.next

def list_to_array(head):
    res = []
    while head:
        res.append(head.val)
        head = head.next
    return res

def array_to_tree(arr):
    if not arr:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    while i < len(arr):
        curr = queue.pop(0)
        if arr[i] is not None:
            curr.left = TreeNode(arr[i])
            queue.append(curr.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            curr.right = TreeNode(arr[i])
            queue.append(curr.right)
        i += 1
    return root

def tree_to_array(root):
    if not root:
        return []
    res = []
    queue = [root]
    while queue:
        curr = queue.pop(0)
        if curr:
            res.append(curr.val)
            queue.append(curr.left)
            queue.append(curr.right)
        else:
            res.append(None)
    while res and res[-1] is None:
        res.pop()
    return res

def format_output(val, type_str):
    if type_str == "ListNode":
        return list_to_array(val)
    if type_str == "TreeNode":
        return tree_to_array(val)
    return val

def parse_input(val, type_str):
    if type_str == "ListNode":
        return array_to_list(val)
    if type_str == "TreeNode":
        return array_to_tree(val)
    return val
`;

  let executionCode = `
__testCases = [${meta.testCases.map(t => `"""${t}"""`).join(", ")}]
__results = []

class SolutionWrapper:
    pass

for __i, __tc in enumerate(__testCases):
    raw_args = [l for l in __tc.split('\\n') if l.strip() != ""]
    try:
        sol = Solution()
${meta.parameters.map((p, idx) => `        arg${idx} = parse_input(json.loads(raw_args[${idx}]), "${p.type}")`).join("\n")}
        
        result = sol.${meta.functionName}(${meta.parameters.map((_, idx) => `arg${idx}`).join(", ")})
        formatted = format_output(result, "${meta.returnType.type}")
        
        __results.append({
            "passed": False,
            "received": json.dumps(formatted)
        })
    except Exception as e:
        __results.append({
            "passed": False,
            "error": str(e)
        })

print(json.dumps(__results))
`;

  return `
${code}

# --- GENERATED EXECUTION WRAPPER ---
${helperCode}
${executionCode}
`;
}
