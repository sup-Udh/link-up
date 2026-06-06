import { ProblemProvider } from "./Provider";
import { LeetCodeProvider } from "./leetcodeProvider";
import { NeetCodeProvider } from "./neetcodeProvider";

export function getProvider(source: string): ProblemProvider {
  switch (source.toLowerCase()) {
    case "neetcode":
      return new NeetCodeProvider();
    case "leetcode":
    case "extension": // legacy default
    default:
      return new LeetCodeProvider();
  }
}
