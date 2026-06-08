export function generateCppWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  // Indent each line of executionCode to match the try block indentation
  const indentedExecution = executionCode
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => '        ' + line)
    .join('\n');

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
${indentedExecution}
    } catch (...) {
        cout << "Execution Error" << endl;
    }
    return 0;
}
`;
}
