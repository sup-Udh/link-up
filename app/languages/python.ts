import { getProblemData } from "@/app/lib/leetcode";

export function generatePythonCode(code: string, problemData: any): any {
    const { title, functionName, parameters, returnType } = problemData;
    const paramList = parameters.map((param: any) => param.name).join(', ');
    const starterCode = `def ${functionName}(${paramList}):\n    # Write your code here\n    pass\n`;
    return starterCode;
}

