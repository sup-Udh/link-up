import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "rooms.json");

export async function getRooms() {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist or is corrupted, return an empty object
    return {};
  }
}

export async function saveRoom(roomId: string, slug: string) {
  const rooms = await getRooms();
  rooms[roomId] = slug;
  await fs.writeFile(DB_PATH, JSON.stringify(rooms, null, 2), "utf-8");
}

export async function getSlugForRoom(roomId: string): Promise<string | null> {
  const rooms = await getRooms();
  return rooms[roomId] || null;
}
