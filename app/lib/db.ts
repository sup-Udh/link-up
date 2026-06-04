import { createAdminClient } from "@/utils/supabase/admin";

export async function getSlugForRoom(roomId: string): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data: room, error } = await supabase
      .from('rooms')
      .select('title, source')
      .eq('id', roomId)
      .single();

    if (error || !room) {
      console.error("Error fetching room for slug:", error);
      return null;
    }

    // If source is extension, the title is the slug (e.g. 'two-sum')
    if (room.source === 'extension') {
      return room.title;
    }

    // Fallback: If it was saved with source 'blank' but the title is a slug (e.g. 'two-sum')
    // LeetCode slugs do not contain spaces.
    if (room.source === 'blank' && room.title && !room.title.includes(' ')) {
      return room.title;
    }

    return null;
  } catch (e) {
    console.error("Error in getSlugForRoom:", e);
    return null;
  }
}
