export function generateRubyWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  return `
require 'json'

# --- Helper Code ---
${helperCode}

# --- User Code ---
${userCode}

# --- Execution ---
begin
  ${executionCode}
rescue => e
  puts "Execution Error"
end
`;
}
