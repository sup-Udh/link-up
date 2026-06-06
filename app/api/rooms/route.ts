import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

import { createAdminClient } from "@/utils/supabase/admin";

// Helper to generate 8-character ID
function generateRoomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = createAdminClient();
    const { data: rooms, error } = await adminDb
      .from('rooms')
      .select('*')
      .eq('host_id', user.id)
      .order('last_active_at', { ascending: false });

    if (error) {
      console.error("Error fetching rooms:", error);
      return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
    }

    return NextResponse.json(rooms || []);
  } catch (error) {
    console.error("GET rooms error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check for standard Web Session OR Extension Bearer token
    let user = null;
    let isExtension = false;
    
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extension token
      const token = authHeader.split(' ')[1];
      const { data: tokenRecord } = await supabase.from('extension_tokens').select('user_id').eq('token', token).single();
      if (tokenRecord) {
        user = { id: tokenRecord.user_id };
        isExtension = true;
      }
    } else {
      // Web session
      const { data: { user: webUser } } = await supabase.auth.getUser();
      user = webUser;
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, language, source = "blank", description, requireApproval = false, slug = null } = body;

    const roomId = generateRoomId();

    const roomPayload: any = {
      
      id: roomId,
      title: title || slug || "Untitled Session",
      language: language || "JavaScript",
      source: slug ? "extension" : source,
      host_id: user.id,
      require_approval: requireApproval,
      participant_count: 0,
      is_active: false,
    };

    if (description) {
      roomPayload.official_test_cases = { _isFullProblem: false, description };
    }

    const adminDb = createAdminClient();
    const { error } = await adminDb.from('rooms').insert([roomPayload]);

    if (error) {
      console.error("Error inserting room:", error);
      return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
    }

    return NextResponse.json({ roomId, ...roomPayload });
  } catch (error) {
    console.error("POST room error:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
