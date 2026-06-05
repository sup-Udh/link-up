export function generateCsharpWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  return `
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

// --- Helper Code ---
${helperCode}

// --- User Code ---
${userCode}

// --- Execution ---
class Program {
    static void Main() {
        try {
            Solution __solution = new Solution();
            ${executionCode}
        } catch (Exception e) {
            Console.WriteLine("Execution Error");
        }
    }
}
`;
}
