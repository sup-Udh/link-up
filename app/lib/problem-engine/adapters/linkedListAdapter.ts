/**
 * Linked List Adapter
 *
 * Handles problems that work with ListNode data structures.
 * Converts: Array → ListNode → Execute → Serialize back to Array
 *
 * Used for problems like: Reverse Linked List, Merge Two Sorted Lists,
 * Add Two Numbers, Remove Nth Node From End, etc.
 */

/**
 * Generate JavaScript helper code for ListNode problems.
 * This code is prepended to the user's solution during execution.
 */
export function getLinkedListHelpers(language: string): string {
  switch (language) {
    case "javascript":
    case "typescript":
      return JS_LINKED_LIST_HELPERS;
    case "python":
      return PYTHON_LINKED_LIST_HELPERS;
    case "java":
      return JAVA_LINKED_LIST_HELPERS;
    case "cpp":
      return CPP_LINKED_LIST_HELPERS;
    default:
      return JS_LINKED_LIST_HELPERS;
  }
}

/**
 * Generate the serialization call for the result.
 * Wraps the result in a linked list → array converter.
 */
export function getSerializeCall(language: string, resultVar: string): string {
  switch (language) {
    case "javascript":
    case "typescript":
      return `__serializeList(${resultVar})`;
    case "python":
      return `serialize_list(${resultVar})`;
    case "java":
      return `serializeList(${resultVar})`;
    case "cpp":
      return `serializeList(${resultVar})`;
    default:
      return `__serializeList(${resultVar})`;
  }
}

/**
 * Generate the deserialization call for an input argument.
 * Wraps the array input in an array → linked list converter.
 */
export function getDeserializeCall(language: string, arrayExpr: string): string {
  switch (language) {
    case "javascript":
    case "typescript":
      return `__buildList(${arrayExpr})`;
    case "python":
      return `build_list(${arrayExpr})`;
    case "java":
      return `buildList(${arrayExpr})`;
    case "cpp":
      return `buildList(${arrayExpr})`;
    default:
      return `__buildList(${arrayExpr})`;
  }
}

// ─── JavaScript / TypeScript Helpers ──────────────────────────────────

const JS_LINKED_LIST_HELPERS = `
function ListNode(val, next) {
  this.val = (val === undefined ? 0 : val);
  this.next = (next === undefined ? null : next);
}

function __buildList(arr) {
  if (!arr || arr.length === 0) return null;
  let head = new ListNode(arr[0]);
  let current = head;
  for (let i = 1; i < arr.length; i++) {
    current.next = new ListNode(arr[i]);
    current = current.next;
  }
  return head;
}

function __serializeList(head) {
  const result = [];
  let current = head;
  let safety = 10000;
  while (current && safety-- > 0) {
    result.push(current.val);
    current = current.next;
  }
  return result;
}
`;

// ─── Python Helpers ───────────────────────────────────────────────────

const PYTHON_LINKED_LIST_HELPERS = `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build_list(arr):
    if not arr:
        return None
    head = ListNode(arr[0])
    current = head
    for val in arr[1:]:
        current.next = ListNode(val)
        current = current.next
    return head

def serialize_list(head):
    result = []
    current = head
    safety = 10000
    while current and safety > 0:
        result.append(current.val)
        current = current.next
        safety -= 1
    return result
`;

// ─── Java Helpers ─────────────────────────────────────────────────────

const JAVA_LINKED_LIST_HELPERS = `
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

static ListNode buildList(int[] arr) {
    if (arr == null || arr.length == 0) return null;
    ListNode head = new ListNode(arr[0]);
    ListNode current = head;
    for (int i = 1; i < arr.length; i++) {
        current.next = new ListNode(arr[i]);
        current = current.next;
    }
    return head;
}

static int[] serializeList(ListNode head) {
    java.util.List<Integer> result = new java.util.ArrayList<>();
    ListNode current = head;
    int safety = 10000;
    while (current != null && safety-- > 0) {
        result.add(current.val);
        current = current.next;
    }
    return result.stream().mapToInt(Integer::intValue).toArray();
}
`;

// ─── C++ Helpers ──────────────────────────────────────────────────────

const CPP_LINKED_LIST_HELPERS = `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

ListNode* buildList(vector<int>& arr) {
    if (arr.empty()) return nullptr;
    ListNode* head = new ListNode(arr[0]);
    ListNode* current = head;
    for (int i = 1; i < arr.size(); i++) {
        current->next = new ListNode(arr[i]);
        current = current->next;
    }
    return head;
}

vector<int> serializeList(ListNode* head) {
    vector<int> result;
    ListNode* current = head;
    int safety = 10000;
    while (current && safety-- > 0) {
        result.push_back(current->val);
        current = current->next;
    }
    return result;
}
`;
