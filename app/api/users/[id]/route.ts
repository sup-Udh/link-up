import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const adminDb = createAdminClient();

    // Fetch user from auth to get raw metadata
    const { data: authUser, error: authError } = await adminDb.auth.admin.getUserById(id);

    if (authError || !authUser.user) {
      console.error("Error fetching auth user:", authError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch public profile for avatar and name
    const { data: profile } = await adminDb.from('profiles').select('*').eq('id', id).single();

    // Fetch public rooms created by user
    const { data: rooms } = await adminDb
      .from('rooms')
      .select('*')
      .eq('host_id', id)
      .order('last_active_at', { ascending: false });

    // Construct the public profile payload
    const publicProfile = {
      id: authUser.user.id,
      email: authUser.user.email,
      created_at: authUser.user.created_at,
      full_name: profile?.full_name || null,
      avatar_url: profile?.avatar_url || null,
      bio: authUser.user.user_metadata?.bio || null,
      banner_url: authUser.user.user_metadata?.banner_url || null,
    };

    // Fetch user sessions to calculate real collaboration time
    const { data: sessions } = await adminDb
      .from('user_sessions')
      .select('joined_at, left_at')
      .eq('user_id', id)
      .not('left_at', 'is', null);

    let totalCollaborationMs = 0;
    if (sessions) {
      totalCollaborationMs = sessions.reduce((acc, s) => {
        return acc + (new Date(s.left_at).getTime() - new Date(s.joined_at).getTime());
      }, 0);
    }

    return NextResponse.json({
      profile: publicProfile,
      rooms: rooms || [],
      totalCollaborationMs
    });

  } catch (error) {
    console.error("GET public user error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
