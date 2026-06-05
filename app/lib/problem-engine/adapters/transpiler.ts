/**
 * Native Literal Transpiler
 *
 * Converts a raw JSON value string from LeetCode into a natively typed
 * literal string for strongly-typed languages.
 */

export function transpileLiteral(
  rawValue: string,
  typeStr: string,
  language: string
): string {
  // Parse the raw JSON value to a JS object
  let parsed: any;
  try {
    parsed = JSON.parse(rawValue);
  } catch (e) {
    // If it fails to parse (e.g., bare word), treat it as string or pass it through
    parsed = rawValue;
  }

  return generateLiteral(parsed, typeStr, language);
}

function generateLiteral(val: any, typeStr: string, language: string): string {
  // Handle basic scalar types
  if (typeStr === "integer" || typeStr === "double" || typeStr === "float") {
    return String(val);
  }

  if (typeStr === "boolean") {
    if (language === "python") return val ? "True" : "False";
    if (language === "cpp" || language === "c") return val ? "true" : "false";
    if (language === "java" || language === "csharp") return val ? "true" : "false";
    if (language === "go") return val ? "true" : "false";
    if (language === "rust") return val ? "true" : "false";
    if (language === "swift") return val ? "true" : "false";
    if (language === "scala") return val ? "true" : "false";
    return val ? "true" : "false";
  }

  if (typeStr === "string") {
    return JSON.stringify(val); // Ensure it is properly escaped
  }

  if (typeStr === "character") {
    return `'${val}'`;
  }

  // Handle arrays
  if (typeStr.endsWith("[]") || typeStr.startsWith("list<")) {
    // Extract inner type: integer[] -> integer, list<integer> -> integer
    const innerType = typeStr.replace("[]", "").replace("list<", "").replace(">", "");
    if (!Array.isArray(val)) {
      // Fallback
      val = [];
    }

    const innerLiterals = val.map((v: any) => generateLiteral(v, innerType, language)).join(", ");

    switch (language) {
      case "cpp":
        return `vector<${cppType(innerType)}>{${innerLiterals}}`;
      case "java":
        return `new ${javaType(innerType)}[]{${innerLiterals}}`;
      case "csharp":
        return `new ${csharpType(innerType)}[] {${innerLiterals}}`;
      case "go":
        return `[]${goType(innerType)}{${innerLiterals}}`;
      case "rust":
        return `vec![${innerLiterals}]`;
      case "swift":
        return `[${innerLiterals}]`;
      case "scala":
        return `Array(${innerLiterals})`;
      case "c":
        // C arrays can't be easily passed inline without compound literals
        // But for C we might just pass a pointer or use a compound literal (C99): (int[]){1, 2, 3}
        return `(${cType(innerType)}[]){${innerLiterals}}`;
      default:
        return `[${innerLiterals}]`; // Fallback to JSON array format
    }
  }
  
  // For multidimensional arrays: integer[][]
  if (typeStr.endsWith("[][]")) {
    const baseType = typeStr.replace("[][]", "");
    const rowType = baseType + "[]";
    if (!Array.isArray(val)) val = [];
    
    const rowLiterals = val.map((v: any) => generateLiteral(v, rowType, language)).join(", ");
    
    switch (language) {
      case "cpp":
        return `vector<vector<${cppType(baseType)}>>{${rowLiterals}}`;
      case "java":
        return `new ${javaType(baseType)}[][]{${rowLiterals}}`;
      case "csharp":
        return `new ${csharpType(baseType)}[][] {${rowLiterals}}`;
      case "go":
        return `[][]${goType(baseType)}{${rowLiterals}}`;
      case "rust":
        return `vec![${rowLiterals}]`;
      case "swift":
        return `[${rowLiterals}]`;
      case "scala":
        return `Array(${rowLiterals})`;
      default:
        return `[${rowLiterals}]`;
    }
  }

  // Fallback for unknown types (just emit as JSON and hope the language is dynamic)
  return JSON.stringify(val);
}

// Language Type Mappers
function cppType(t: string): string {
  if (t === "integer") return "int";
  if (t === "boolean") return "bool";
  if (t === "string") return "string";
  if (t === "character") return "char";
  if (t === "double") return "double";
  if (t === "float") return "float";
  return "int";
}

function javaType(t: string): string {
  if (t === "integer") return "int";
  if (t === "boolean") return "boolean";
  if (t === "string") return "String";
  if (t === "character") return "char";
  if (t === "double") return "double";
  if (t === "float") return "float";
  return "int";
}

function csharpType(t: string): string {
  if (t === "integer") return "int";
  if (t === "boolean") return "bool";
  if (t === "string") return "string";
  if (t === "character") return "char";
  if (t === "double") return "double";
  if (t === "float") return "float";
  return "int";
}

function goType(t: string): string {
  if (t === "integer") return "int";
  if (t === "boolean") return "bool";
  if (t === "string") return "string";
  if (t === "character") return "byte";
  if (t === "double") return "float64";
  if (t === "float") return "float32";
  return "int";
}

function cType(t: string): string {
  if (t === "integer") return "int";
  if (t === "boolean") return "bool";
  if (t === "string") return "char*";
  if (t === "character") return "char";
  if (t === "double") return "double";
  if (t === "float") return "float";
  return "int";
}
