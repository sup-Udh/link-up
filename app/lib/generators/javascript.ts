import { ProblemMetadata } from "../leetcode";

export function generateJavaScript(code: string, meta: ProblemMetadata): string {
  const isTypescript = false; // We can strip types or let Judge0 TS handle it
  
  const helperCode = `
function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val)
    this.next = (next===undefined ? null : next)
}
function TreeNode(val, left, right) {
    this.val = (val===undefined ? 0 : val)
    this.left = (left===undefined ? null : left)
    this.right = (right===undefined ? null : right)
}

function arrayToList(arr) {
    if (!arr || !arr.length) return null;
    let dummy = new ListNode();
    let curr = dummy;
    for (let val of arr) {
        curr.next = new ListNode(val);
        curr = curr.next;
    }
    return dummy.next;
}

function listToArray(head) {
    let res = [];
    while (head) {
        res.push(head.val);
        head = head.next;
    }
    return res;
}

function arrayToTree(arr) {
    if (!arr || !arr.length) return null;
    let root = new TreeNode(arr[0]);
    let queue = [root];
    let i = 1;
    while (i < arr.length) {
        let curr = queue.shift();
        if (arr[i] !== null) {
            curr.left = new TreeNode(arr[i]);
            queue.push(curr.left);
        }
        i++;
        if (i < arr.length && arr[i] !== null) {
            curr.right = new TreeNode(arr[i]);
            queue.push(curr.right);
        }
        i++;
    }
    return root;
}

function treeToArray(root) {
    if (!root) return [];
    let res = [];
    let queue = [root];
    while (queue.length > 0) {
        let curr = queue.shift();
        if (curr) {
            res.push(curr.val);
            queue.push(curr.left);
            queue.push(curr.right);
        } else {
            res.push(null);
        }
    }
    while (res.length && res[res.length - 1] === null) {
        res.pop();
    }
    return res;
}

function formatOutput(val, type) {
    if (type === "ListNode") return listToArray(val);
    if (type === "TreeNode") return treeToArray(val);
    return val;
}

function parseInput(val, type) {
    if (type === "ListNode") return arrayToList(val);
    if (type === "TreeNode") return arrayToTree(val);
    return val;
}
`;

  const parseParam = (valStr: string, type: string) => {
    return `parseInput(${valStr}, "${type}")`;
  };

  let executionCode = `
const __testCases = [${meta.testCases.map(t => `\`${t}\``).join(", ")}];
const __results = [];

for (let i = 0; i < __testCases.length; i++) {
    const rawArgs = __testCases[i].split('\\n').filter(l => l.trim() !== "");
    try {
        const args = [
            ${meta.parameters.map((p, idx) => parseParam(`JSON.parse(rawArgs[${idx}])`, p.type)).join(",\n            ")}
        ];
        
        let result = ${meta.functionName}(...args);
        let formatted = formatOutput(result, "${meta.returnType.type}");
        
        __results.push({
            passed: false, // We'll compare on backend
            received: JSON.stringify(formatted)
        });
    } catch (e) {
        __results.push({
            passed: false,
            error: e.message
        });
    }
}
console.log(JSON.stringify(__results));
`;

  return `
${code}

// --- GENERATED EXECUTION WRAPPER ---
${helperCode}
${executionCode}
`;
}
