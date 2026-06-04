import { NextResponse } from "next/server";
import { fetchLeetCodeProblem } from "@/app/lib/leetcode";
import { normalizeProblem } from "@/app/lib/problem-engine/normalizeProblem";
import { getSlugForRoom } from "@/app/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
  }

  const slug = await getSlugForRoom(roomId);
  if (!slug) {
    return NextResponse.json({ error: "Room not found or no problem linked" }, { status: 404 });
  }

  try {
    const raw = await fetchLeetCodeProblem(slug);
    const normalized = normalizeProblem(raw);
    return NextResponse.json(normalized);
  } catch (err: any) {
    console.error("Failed to fetch/normalize problem:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch problem metadata" },
      { status: 500 }
    );
  }
}
