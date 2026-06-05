/**
 * Adapter Registry
 *
 * Selects the correct adapter based on the detected problem type.
 * This is the single entry point for the adapter system.
 */

import type { ProblemType, ExecutionMetadata, Example } from "../types";
import { parseFunctionInput, type ParsedInput } from "./functionAdapter";
import { transpileLiteral } from "./transpiler";
import {
  getLinkedListHelpers,
  getSerializeCall as getListSerializeCall,
  getDeserializeCall as getListDeserializeCall,
} from "./linkedListAdapter";
import {
  getTreeHelpers,
  getTreeSerializeCall,
  getTreeDeserializeCall,
} from "./treeAdapter";
import { getGraphHelpers } from "./graphAdapter";
import { generateDesignWrapper, parseDesignInput } from "./designAdapter";

// ─── Adapter Interface ───────────────────────────────────────────────

export interface AdapterResult {
  /** Helper code to prepend (ListNode class, TreeNode class, etc.) */
  helperCode: string;
  /** The code that parses inputs, calls the function, and prints the result */
  executionCode: string;
}

/**
 * Generate adapter code for a given problem, language, and example.
 *
 * @param metadata  - Execution metadata (function name, params, type)
 * @param language  - Target language ID
 * @param example   - The example to execute
 * @returns Helper code and execution code to wrap around the user's solution
 */
export function getAdapterCode(
  metadata: ExecutionMetadata,
  language: string,
  example: Example
): AdapterResult {
  switch (metadata.problemType) {
    case "LINKED_LIST":
      return getLinkedListAdapterCode(metadata, language, example);
    case "TREE":
      return getTreeAdapterCode(metadata, language, example);
    case "GRAPH":
      return getGraphAdapterCode(metadata, language, example);
    case "DESIGN":
      return getDesignAdapterCode(metadata, language, example);
    case "MATRIX":
    case "FUNCTION":
    default:
      return getFunctionAdapterCode(metadata, language, example);
  }
}

// ─── Function Adapter (Arrays, Strings, Numbers, Matrices) ───────────

function getFunctionAdapterCode(
  metadata: ExecutionMetadata,
  language: string,
  example: Example
): AdapterResult {
  const parsed = parseFunctionInput(example.input, metadata.parameters);

  if (language === "python" || language === "ruby" || language === "php" || language === "javascript" || language === "typescript") {
    const argsStr = parsed.args.join(", ");
    
    if (language === "python") {
      return {
        helperCode: "",
        executionCode: `import json\n__result = ${metadata.functionName}(${argsStr})\nprint(json.dumps(__result))\n`,
      };
    }
    if (language === "ruby") {
      return {
        helperCode: "",
        executionCode: `__result = ${metadata.functionName}(${argsStr})\nputs __result.to_json\n`,
      };
    }
    if (language === "php") {
      return {
        helperCode: "",
        executionCode: `$__result = $__solution->${metadata.functionName}(${argsStr});\necho json_encode($__result);\n`,
      };
    }
    // JS / TS
    return {
      helperCode: "",
      executionCode: `const __result = ${metadata.functionName}(${argsStr});\nconsole.log(JSON.stringify(__result));\n`,
    };
  }

  // --- Static Languages (C++, Java, Rust, Go, C#, Swift, Scala, C) ---
  const apiParams = metadata.apiMetadata?.params || [];
  
  const args = parsed.args.map((valStr, i) => {
    const typeStr = apiParams[i]?.type || "unknown";
    return transpileLiteral(valStr, typeStr, language);
  });
  
  const argsStr = args.join(", ");
  
  if (language === "cpp") {
    return {
      helperCode: `
#include <iostream>
#include <vector>
#include <string>

template <typename T>
void print_json(const std::vector<T>& v) {
    std::cout << "[";
    for(size_t i=0; i<v.size(); ++i) {
        std::cout << v[i];
        if(i != v.size() - 1) std::cout << ",";
    }
    std::cout << "]" << std::endl;
}

void print_json(int v) { std::cout << v << std::endl; }
void print_json(double v) { std::cout << v << std::endl; }
void print_json(bool v) { std::cout << (v ? "true" : "false") << std::endl; }
void print_json(const std::string& v) { std::cout << "\\"" << v << "\\"" << std::endl; }
`,
      executionCode: `auto __result = __solution.${metadata.functionName}(${argsStr});\n        print_json(__result);`,
    };
  }
  if (language === "java") {
    return {
      helperCode: `
class JsonUtils {
    public static void print(int[] v) {
        System.out.print("[");
        for(int i=0; i<v.length; i++) {
            System.out.print(v[i]);
            if(i != v.length - 1) System.out.print(",");
        }
        System.out.println("]");
    }
    public static void print(int v) { System.out.println(v); }
    public static void print(double v) { System.out.println(v); }
    public static void print(boolean v) { System.out.println(v); }
    public static void print(String v) { System.out.println("\\"" + v + "\\""); }
}
`,
      executionCode: `var __result = __solution.${metadata.functionName}(${argsStr});\n            JsonUtils.print(__result);`,
    };
  }
  if (language === "csharp") {
    return {
      helperCode: "",
      executionCode: `var __result = __solution.${metadata.functionName}(${argsStr});\n            Console.WriteLine(JsonSerializer.Serialize(__result));`,
    };
  }
  if (language === "go") {
    return {
      helperCode: "",
      executionCode: `__result := ${metadata.functionName}(${argsStr})\n    __json, _ := json.Marshal(__result)\n    fmt.Println(string(__json))`,
    };
  }
  if (language === "rust") {
    return {
      helperCode: "",
      executionCode: `let __result = Solution::${metadata.functionName}(${argsStr});\n    println!("Executed successfully");`,
    };
  }
  if (language === "swift") {
    return {
      helperCode: "",
      executionCode: `let __result = __solution.${metadata.functionName}(${argsStr})\nprint("Executed successfully")`,
    };
  }
  if (language === "scala") {
    return {
      helperCode: "",
      executionCode: `val __result = ${metadata.functionName}(${argsStr})\n            println("Executed successfully")`,
    };
  }
  if (language === "c") {
    return {
      helperCode: "",
      executionCode: `${metadata.functionName}(${argsStr});\n    printf("Executed successfully\\n");`,
    };
  }

  return {
    helperCode: "",
    executionCode: `const __result = ${metadata.functionName}(${argsStr});\nconsole.log(JSON.stringify(__result));\n`,
  };
}

// ─── Linked List Adapter ─────────────────────────────────────────────

function getLinkedListAdapterCode(
  metadata: ExecutionMetadata,
  language: string,
  example: Example
): AdapterResult {
  const helperCode = getLinkedListHelpers(language);
  const parsed = parseFunctionInput(example.input, metadata.parameters);

  // Determine which parameters are linked list nodes
  const listParams = new Set(["head", "l1", "l2", "node", "list1", "list2"]);

  if (language === "python") {
    const args = metadata.parameters.map((name, i) => {
      const val = parsed.args[i] || "None";
      if (listParams.has(name)) {
        return `build_list(${val})`;
      }
      return val;
    });
    return {
      helperCode,
      executionCode: `
import json
__result = ${metadata.functionName}(${args.join(", ")})
if isinstance(__result, ListNode) or __result is None:
    __result = serialize_list(__result)
print(json.dumps(__result))
`,
    };
  }

  // JavaScript
  const args = metadata.parameters.map((name, i) => {
    const val = parsed.args[i] || "null";
    if (listParams.has(name)) {
      return getListDeserializeCall(language, val);
    }
    return val;
  });

  return {
    helperCode,
    executionCode: `
let __result = ${metadata.functionName}(${args.join(", ")});
if (__result && typeof __result === 'object' && 'val' in __result) {
  __result = __serializeList(__result);
}
console.log(JSON.stringify(__result));
`,
  };
}

// ─── Tree Adapter ────────────────────────────────────────────────────

function getTreeAdapterCode(
  metadata: ExecutionMetadata,
  language: string,
  example: Example
): AdapterResult {
  const helperCode = getTreeHelpers(language);
  const parsed = parseFunctionInput(example.input, metadata.parameters);

  const treeParams = new Set(["root", "p", "q", "root1", "root2"]);

  if (language === "python") {
    const args = metadata.parameters.map((name, i) => {
      const val = parsed.args[i] || "None";
      if (treeParams.has(name)) {
        return `build_tree(${val})`;
      }
      return val;
    });
    return {
      helperCode,
      executionCode: `
import json
__result = ${metadata.functionName}(${args.join(", ")})
if isinstance(__result, TreeNode):
    __result = serialize_tree(__result)
print(json.dumps(__result))
`,
    };
  }

  // JavaScript
  const args = metadata.parameters.map((name, i) => {
    const val = parsed.args[i] || "null";
    if (treeParams.has(name)) {
      return getTreeDeserializeCall(language, val);
    }
    return val;
  });

  return {
    helperCode,
    executionCode: `
let __result = ${metadata.functionName}(${args.join(", ")});
if (__result && typeof __result === 'object' && 'val' in __result && 'left' in __result) {
  __result = __serializeTree(__result);
}
console.log(JSON.stringify(__result));
`,
  };
}

// ─── Graph Adapter ───────────────────────────────────────────────────

function getGraphAdapterCode(
  metadata: ExecutionMetadata,
  language: string,
  example: Example
): AdapterResult {
  // Most graph problems use standard array inputs
  // Only Clone Graph-type problems need the Node helper
  const helperCode = getGraphHelpers(language);
  const parsed = parseFunctionInput(example.input, metadata.parameters);

  if (language === "python") {
    const argsStr = parsed.args.join(", ");
    return {
      helperCode,
      executionCode: `
import json
__result = ${metadata.functionName}(${argsStr})
print(json.dumps(__result))
`,
    };
  }

  const argsStr = parsed.args.join(", ");
  return {
    helperCode,
    executionCode: `
const __result = ${metadata.functionName}(${argsStr});
console.log(JSON.stringify(__result));
`,
  };
}

// ─── Design Adapter ──────────────────────────────────────────────────

function getDesignAdapterCode(
  metadata: ExecutionMetadata,
  language: string,
  example: Example
): AdapterResult {
  const designWrapper = generateDesignWrapper(language, metadata.functionName);
  const designInput = parseDesignInput(example.input);

  if (!designInput) {
    // Fallback: treat as regular function
    return getFunctionAdapterCode(metadata, language, example);
  }

  if (language === "python") {
    return {
      helperCode: designWrapper,
      executionCode: `
import json
__operations = ${JSON.stringify(designInput.operations)}
__args = ${JSON.stringify(designInput.arguments)}
__result = execute_design(__operations, __args)
print(json.dumps(__result))
`,
    };
  }

  return {
    helperCode: designWrapper,
    executionCode: `
const __operations = ${JSON.stringify(designInput.operations)};
const __args = ${JSON.stringify(designInput.arguments)};
const __result = __executeDesign(__operations, __args);
console.log(JSON.stringify(__result));
`,
  };
}
