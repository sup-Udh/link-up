import { NextResponse } from "next/server";
import { getSlugForRoom } from "@/app/lib/db";
import { fetchLeetCodeProblem } from "@/app/lib/leetcode";

export async function POST(request: Request) {
  try {
    const { roomId, language, code, customTestCases, runIndex } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, output: "Error: No code provided." },
        { status: 400 }
      );
    }

    if (!roomId) {
      return NextResponse.json(
        { success: false, output: "Error: No room ID provided." },
        { status: 400 }
      );
    }

    const slug = await getSlugForRoom(roomId);
    if (!slug) {
      return NextResponse.json({ success: false, output: "Error: Room problem not found." });
    }

    const meta = await fetchLeetCodeProblem(slug);
    if (!meta) {
      return NextResponse.json({ success: false, output: "Error: Failed to fetch LeetCode metadata." });
    }

    // NOTE: Backend test case execution logic has been removed as requested.
    // Reimplement your test case wrapping, Judge0 execution, and result parsing here.

    return NextResponse.json({
      success: true,
      output: "Backend test case logic removed. Please reimplement.",
      results: [],
      runIndex: runIndex !== undefined ? runIndex : "all"
    });
  } catch (error: any) {
    console.error("Execution error:", error);
    return NextResponse.json(
      { success: false, output: `Internal Error: ${error.message}` },
      { status: 500 }
    );
  }
}
