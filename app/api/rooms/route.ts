import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, url } = body;

    // TODO: In the future, you can save the `slug` and `url` to a database here 
    // so the RoomLayout knows which LeetCode problem to load into the ProblemPanel!

    // Generate a random 8-character room ID
    const roomId = crypto.randomUUID().slice(0, 8);

    return NextResponse.json({ roomId });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
