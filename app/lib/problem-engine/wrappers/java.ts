export function generateJavaWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  // Java requires putting everything into a class structure.
  // The user code is usually `class Solution { ... }`.
  // We'll rename it or instantiate it.
  
  // Actually, LeetCode's Java template is typically: class Solution { public ... }
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
            ${executionCode}
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
`;
}
