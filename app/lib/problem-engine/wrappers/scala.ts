export function generateScalaWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
  const indentedExecution = executionCode
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => '            ' + line)
    .join('\n');

  return `
import scala.collection.mutable._

// --- Helper Code ---
${helperCode}

// --- User Code ---
${userCode}

// --- Execution ---
object Main {
    def main(args: Array[String]): Unit = {
        try {
${indentedExecution}
        } catch {
            case e: Exception => println("Execution Error")
        }
    }
}
`;
}
