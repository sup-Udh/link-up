import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const supabase = await createClient();

    // Check if the user is authenticated (room membership check)
    // For now we allow any logged in user, or just require a valid session
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = createAdminClient();
    const { data: room, error } = await adminDb
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (error || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("GET room error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = createAdminClient();
    
    // First verify that the user is actually the host of this room
    const { data: room, error: fetchError } = await adminDb
      .from("rooms")
      .select("host_id")
      .eq("id", roomId)
      .single();

    if (fetchError || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.host_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: Not the host" }, { status: 403 });
    }

    const { error: deleteError } = await adminDb
      .from("rooms")
      .delete()
      .eq("id", roomId);

    if (deleteError) {
      console.error("Error deleting room:", deleteError);
      return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE room error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
