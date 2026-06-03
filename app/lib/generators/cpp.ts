import { ProblemMetadata } from "../leetcode";

function transpileCpp(valStr: string, type: string): string {
  try {
    const val = JSON.parse(valStr);
    if (type === "integer") return val.toString();
    if (type === "string") return `"${val}"`;
    if (type === "integer[]") return `std::vector<int>{${val.join(", ")}}`;
    if (type === "string[]") return `std::vector<std::string>{${val.map((v: string) => `"${v}"`).join(", ")}}`;
    if (type === "ListNode") return `arrayToList(std::vector<int>{${val.join(", ")}})`;
    if (type === "TreeNode") return `arrayToTree(std::vector<int>{${val.map((v: any) => v===null? -999999 : v).join(", ")}})`;
    return valStr;
  } catch (e) {
    return valStr;
  }
}

export function generateCpp(code: string, meta: ProblemMetadata): string {
  const includes = `
#include <iostream>
#include <vector>
#include <string>
#include <queue>

using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

ListNode* arrayToList(vector<int> arr) {
    ListNode* dummy = new ListNode();
    ListNode* curr = dummy;
    for (int val : arr) {
        curr->next = new ListNode(val);
        curr = curr->next;
    }
    return dummy->next;
}

string listToArrayString(ListNode* head) {
    string res = "[";
    while (head) {
        res += to_string(head->val);
        if (head->next) res += ",";
        head = head->next;
    }
    res += "]";
    return res;
}

TreeNode* arrayToTree(vector<int> arr) {
    if (arr.empty()) return nullptr;
    TreeNode* root = new TreeNode(arr[0]);
    queue<TreeNode*> q;
    q.push(root);
    int i = 1;
    while(i < arr.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (arr[i] != -999999) {
            curr->left = new TreeNode(arr[i]);
            q.push(curr->left);
        }
        i++;
        if (i < arr.size() && arr[i] != -999999) {
            curr->right = new TreeNode(arr[i]);
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

string treeToArrayString(TreeNode* root) {
    // simplified for MVP
    return "[]"; 
}

string formatOutput(int val) { return to_string(val); }
string formatOutput(string val) { return "\\"" + val + "\\""; }
string formatOutput(vector<int> val) {
    string res = "[";
    for(int i=0; i<val.size(); i++){ res += to_string(val[i]); if(i<val.size()-1) res += ","; }
    return res + "]";
}
string formatOutput(ListNode* val) { return listToArrayString(val); }
string formatOutput(TreeNode* val) { return treeToArrayString(val); }
`;

  let mainBody = `
int main() {
    Solution sol;
    cout << "[";
`;

  for (let i = 0; i < meta.testCases.length; i++) {
    const rawArgs = meta.testCases[i].split('\n').filter(l => l.trim() !== "");
    const args = meta.parameters.map((p, idx) => transpileCpp(rawArgs[idx], p.type)).join(", ");
    
    mainBody += `
    try {
        auto res = sol.${meta.functionName}(${args});
        cout << "{\\"passed\\": false, \\"received\\": \\"";
        
        cout << formatOutput(res);
        
        cout << "\\"}";
    } catch (...) {
        cout << "{\\"passed\\": false, \\"error\\": \\"Runtime Error\\"}";
    }
    ${i < meta.testCases.length - 1 ? `cout << ",";` : ``}
`;
  }
  
  mainBody += `
    cout << "]" << endl;
    return 0;
}
`;

  return `
${includes}

${code}

${mainBody}
`;
}
