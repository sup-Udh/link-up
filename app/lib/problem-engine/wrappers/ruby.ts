export function generateRubyWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  // Indent each line of executionCode for the begin block
  const indentedExecution = executionCode
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => '  ' + line)
    .join('\n');

  return `
require 'json'

# --- Helper Code ---
${helperCode}

# --- User Code ---
${userCode}

# --- Execution ---
begin
${indentedExecution}
rescue => e
  puts "Execution Error"
end
`;
}
