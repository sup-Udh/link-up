import { fetchLeetCodeMetadata } from "./app/lib/leetcode";

async function run() {
  const meta = await fetchLeetCodeMetadata("two-sum");
  console.log("TEST CASES LENGTH:", meta?.testCases.length);
  console.log("EXPECTED OUTPUTS LENGTH:", meta?.expectedOutputs.length);
  console.log("TEST CASES:");
  meta?.testCases.forEach((tc, i) => {
    console.log(`[${i}] ${JSON.stringify(tc)}`);
  });
  console.log("EXPECTED OUTPUTS:");
  meta?.expectedOutputs.forEach((out, i) => {
    console.log(`[${i}] ${JSON.stringify(out)}`);
  });
}
run();
