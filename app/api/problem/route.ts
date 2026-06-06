import { NextResponse } from "next/server";
import { fetchLeetCodeProblem } from "@/app/lib/leetcode";
import { normalizeProblem } from "@/app/lib/problem-engine/normalizeProblem";
import { getSlugForRoom } from "@/app/lib/db";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");
  const slugParam = searchParams.get("slug");

  if (!roomId && !slugParam) {
    return NextResponse.json({ error: "Missing roomId or slug" }, { status: 400 });
  }

  const slug = slugParam || (roomId ? await getSlugForRoom(roomId) : null);
  
  try {
    const supabase = createAdminClient();
    if (roomId) {
      const { data: room } = await supabase.from('rooms').select('official_test_cases').eq('id', roomId).single();
      if (room?.official_test_cases && (room.official_test_cases as any)._isFullProblem) {
        return NextResponse.json(room.official_test_cases);
      }
    }

    if (!slug) {
      return NextResponse.json({ error: "Room not found or no problem linked" }, { status: 404 });
    }

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
