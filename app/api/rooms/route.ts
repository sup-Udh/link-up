import { NextResponse } from "next/server";
import { saveRoom } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, url } = body;

    // Generate a random 8-character room ID
    const roomId = crypto.randomUUID().slice(0, 8);

    // Save mapping to our local JSON db
    if (slug) {
      await saveRoom(roomId, slug);
    }

    return NextResponse.json({ roomId });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
