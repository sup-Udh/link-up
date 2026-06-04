import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
// saves the code langauage and all the custom test casesRL
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const supabase = await createClient();

    // Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = createAdminClient();

    const body = await request.json();
    const { code, language, customTestCases, latestResults, starterCode } = body;

    const payload: any = {
      last_saved_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(), // Update last active for dashboard
    };

    if (code !== undefined) payload.code = code;
    if (language !== undefined) payload.language = language;
    if (customTestCases !== undefined) payload.custom_test_cases = customTestCases;
    if (latestResults !== undefined) payload.latest_results = latestResults;
    if (starterCode !== undefined) payload.starter_code = starterCode;

    const { error } = await adminDb
      .from("rooms")
      .update(payload)
      .eq("id", roomId);

    if (error) {
      console.error("Error updating room:", error);
      return NextResponse.json({ error: "Failed to save room" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH room save error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
