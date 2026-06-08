export function generateJavaWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  // Indent each line of executionCode to match the try block indentation
  const indentedExecution = executionCode
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => '            ' + line)
    .join('\n');

  // Java requires putting everything into a class structure.
  // The user code is usually `class Solution { ... }`.
  // We can just append a Main class with public static void main.

  return `
import java.util.*;

// --- Helper Code ---
${helperCode}

// --- User Code ---
${userCode}

// --- Execution ---
public class Main {
    public static void main(String[] args) {
        try {
            Solution __solution = new Solution();
${indentedExecution}
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
`;
}
