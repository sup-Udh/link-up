export function generateCsharpWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  // Indent each line of executionCode for the try block
  const indentedExecution = executionCode
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => '            ' + line)
    .join('\n');

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
${indentedExecution}
        } catch (Exception e) {
            Console.WriteLine("Execution Error");
        }
    }
}
`;
}
