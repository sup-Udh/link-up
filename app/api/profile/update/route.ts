import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bio, bannerUrl } = body;

    const adminDb = createAdminClient();
    const { data: updatedUser, error } = await adminDb.auth.admin.updateUserById(
      user.id,
      { user_metadata: { bio, banner_url: bannerUrl } }
    );

    if (error) {
      console.error("Error updating profile metadata:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: updatedUser.user });
  } catch (error) {
    console.error("POST profile update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
