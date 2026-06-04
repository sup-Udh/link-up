export function generateCppWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  // C++ requires includes, and the user code is a Solution class.
  return `
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>
#include <queue>
#include <stack>

using namespace std;

// --- Helper Code ---
${helperCode}

// --- User Code ---
${userCode}

// --- Execution ---
int main() {
    try {
        Solution __solution;
        ${executionCode}
    } catch (...) {
        cout << "Execution Error" << endl;
    }
    return 0;
}
`;
}
