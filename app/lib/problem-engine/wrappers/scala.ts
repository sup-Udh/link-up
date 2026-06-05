export function generateScalaWrapper(
  userCode: string,
  helperCode: string,
  executionCode: string
): string {
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
            ${executionCode}
        } catch {
            case e: Exception => println("Execution Error")
        }
    }
}
`;
}
