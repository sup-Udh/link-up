import { NextResponse } from "next/server";
import { getProblemData } from "@/app/lib/leetcode";
import { getSlugForRoom } from "@/app/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
  }

  const slug = await getSlugForRoom(roomId);
  if (!slug) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  try {
    const meta = await getProblemData(slug);
    return NextResponse.json(meta);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
}
