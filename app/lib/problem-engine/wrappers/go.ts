export function generateGoWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
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
    ${executionCode}
}
`;
}
