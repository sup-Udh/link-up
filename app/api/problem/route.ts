import { NextResponse } from "next/server";
import { getSlugForRoom } from "@/app/lib/db";
import { createAdminClient } from "@/utils/supabase/admin";
import { getProvider } from "@/app/lib/problem-engine/providers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");
  const slugParam = searchParams.get("slug");

  if (!roomId && !slugParam) {
    return NextResponse.json({ error: "Missing roomId or slug" }, { status: 400 });
  }

  let slug = slugParam;
  let source = "leetcode";

  try {
    const supabase = createAdminClient();
    if (roomId) {
      const { data: room } = await supabase.from('rooms').select('official_test_cases, title, source').eq('id', roomId).single();
      if (room?.official_test_cases && (room.official_test_cases as any)._isFullProblem) {
        return NextResponse.json(room.official_test_cases);
      }
      
      if (!slug) {
        // Fallback: If it was saved with source 'blank' but the title is a slug (e.g. 'two-sum')
        if (room?.source === 'extension' || room?.source === 'leetcode' || room?.source === 'neetcode' || (room?.source === 'blank' && room?.title && !room.title.includes(' '))) {
          slug = room.title;
        }
        
        if (room?.official_test_cases && (room.official_test_cases as any).provider) {
          source = (room.official_test_cases as any).provider;
        } else if (room?.source) {
          source = room.source;
        }
      }
    }

    if (!slug) {
      return NextResponse.json({ error: "Room not found or no problem linked" }, { status: 404 });
    }

    const provider = getProvider(source);
    const problem = await provider.getProblem(slug);
    
    return NextResponse.json(problem);
  } catch (err: any) {
    console.error("Failed to fetch/normalize problem:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch problem metadata" },
      { status: 500 }
    );
  }
}
