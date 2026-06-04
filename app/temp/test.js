import fetchProblemData from "@/app/lib/fetchProblemData";

const data = fetchProblemData("valid-palindrome").then(problemData => {
    console.log("Fetched Problem Data:", problemData);
    return problemData;
}).catch(error => {
    console.error("Failed to fetch problem data:", error);
    return null;
});

function extractTestCases(htmlContent) {
    // Regex to match anything inside <pre> tags where examples live
    const preBlockRegex = /<pre>([\s\S]*?)<\/pre>/g;
    
    // Regex patterns to capture specific Input and Output segments safely across potential newlines
    const inputRegex = /Input:<\/strong>\s*([\s\S]*?)(?=\n|<strong>Output:|$)/;
    const outputRegex = /Output:<\/strong>\s*([\s\S]*?)(?=\n|<strong>Explanation:|$)/;

    const testCases = [];
    let match;
    let exampleCount = 1;

    // Loop through every <pre> block found in the HTML string
    while ((match = preBlockRegex.exec(htmlContent)) !== null) {
        const blockContent = match[1];

        const inputMatch = blockContent.match(inputRegex);
        const outputMatch = blockContent.match(outputRegex);

        if (inputMatch && outputMatch) {
            testCases.push({
                example: `Example ${exampleCount++}`,
                input: inputMatch[1].trim(),
                output: outputMatch[1].trim()
            });
        }
    }

    return testCases;
}

// Execute the filter function
const results = extractTestCases(data.content);

function parseDynamicInput(inputStr) {
    const result = {};
    
    // This regex looks for patterns like: variable_name = value
    // It captures the name and handles values until it sees a comma followed by another variable name
    const pattern = /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([\s\S]*?)(?=\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=|$)/g;
    
    let match;
    while ((match = pattern.exec(inputStr)) !== null) {
        const variableName = match[1].trim();
        let rawValue = match[2].trim();
        
        try {
            // Automatically converts strings like "[1,2]", "9", or '"abc"' into actual JS Arrays, Numbers, or Strings
            result[variableName] = JSON.parse(rawValue);
        } catch (e) {
            // Fallback: If JSON.parse fails (e.g., poorly formatted string), keep it as a clean string
            result[variableName] = rawValue;
        }
    }
    
    return result;
}

// Map over all datasets to parse them at once
const parsedDatasets = results.map(data => ({
    original: data.input,
    parsed: parseDynamicInput(data.input)
}));

function parseOutputValue(outputStr) {
    const cleanOutput = outputStr.trim();
    try {
        return JSON.parse(cleanOutput);
    } catch (e) {
        return cleanOutput; // Fallback to string if it's plain text
    }
}

const parsedResults = results.map(test => {
    return {
        example: test.example,
        parsedInput: parseDynamicInput(test.input),
        parsedOutput: parseOutputValue(test.output)
    };
});


console.log(JSON.stringify(parsedResults, null, 2));

// Print the clean list of testcases
// console.log(JSON.stringify(results, null, 2));