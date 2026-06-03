import { ProblemMetadata } from "../leetcode";

function transpileJava(valStr: string, type: string): string {
  try {
    const val = JSON.parse(valStr);
    if (type === "integer") return val.toString();
    if (type === "string") return `"${val}"`;
    if (type === "integer[]") return `new int[]{${val.join(", ")}}`;
    if (type === "string[]") return `new String[]{${val.map((v: string) => `"${v}"`).join(", ")}}`;
    if (type === "ListNode") return `arrayToList(new int[]{${val.join(", ")}})`;
    if (type === "TreeNode") return `arrayToTree(new Integer[]{${val.map((v: any) => v).join(", ")}})`;
    return valStr;
  } catch (e) {
    return valStr;
  }
}

export function generateJava(code: string, meta: ProblemMetadata): string {
  const helpers = `
import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

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

public class Main {
    public static ListNode arrayToList(int[] arr) {
        ListNode dummy = new ListNode();
        ListNode curr = dummy;
        for (int val : arr) {
            curr.next = new ListNode(val);
            curr = curr.next;
        }
        return dummy.next;
    }

    public static String listToArrayString(ListNode head) {
        StringBuilder sb = new StringBuilder("[");
        while(head != null) {
            sb.append(head.val);
            if (head.next != null) sb.append(",");
            head = head.next;
        }
        sb.append("]");
        return sb.toString();
    }

    public static TreeNode arrayToTree(Integer[] arr) {
        if (arr.length == 0) return null;
        TreeNode root = new TreeNode(arr[0]);
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        int i = 1;
        while(i < arr.length) {
            TreeNode curr = q.poll();
            if (arr[i] != null) {
                curr.left = new TreeNode(arr[i]);
                q.add(curr.left);
            }
            i++;
            if (i < arr.length && arr[i] != null) {
                curr.right = new TreeNode(arr[i]);
                q.add(curr.right);
            }
            i++;
        }
        return root;
    }

    public static String formatOutput(int val) { return String.valueOf(val); }
    public static String formatOutput(String val) { return "\\"" + val + "\\""; }
    public static String formatOutput(int[] val) {
        StringBuilder sb = new StringBuilder("[");
        for(int i=0; i<val.length; i++){ sb.append(val[i]); if(i<val.length-1) sb.append(","); }
        return sb.append("]").toString();
    }
    public static String formatOutput(ListNode val) { return listToArrayString(val); }

`;

  let mainBody = `
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.print("[");
`;

  for (let i = 0; i < meta.testCases.length; i++) {
    const rawArgs = meta.testCases[i].split('\n').filter(l => l.trim() !== "");
    const args = meta.parameters.map((p, idx) => transpileJava(rawArgs[idx], p.type)).join(", ");
    
    mainBody += `
        try {
            var res = sol.${meta.functionName}(${args});
            System.out.print("{\\"passed\\": false, \\"received\\": \\"");
            
            System.out.print(formatOutput(res));
            
            System.out.print("\\"}");
        } catch (Exception e) {
            System.out.print("{\\"passed\\": false, \\"error\\": \\"" + e.getMessage() + "\\"}");
        }
        ${i < meta.testCases.length - 1 ? `System.out.print(",");` : ``}
`;
  }
  
  mainBody += `
        System.out.println("]");
    }
}
`;

  return `
${code}

// --- GENERATED EXECUTION WRAPPER ---
${helpers}
${mainBody}
`;
}
