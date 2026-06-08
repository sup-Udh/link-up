export function generateGoWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  const indentedExecution = executionCode
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => '    ' + line)
    .join('\n');

  return `
package main

import (
    "encoding/json"
    "fmt"
)

// --- Helper Code ---
${helperCode}

// --- User Code ---
${userCode}

// --- Execution ---
func main() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Execution Error")
        }
    }()
${indentedExecution}
}
`;
}
