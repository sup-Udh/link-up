"use client";

import { useRoom } from "@/app/lib/RoomContext";

export default function Members() {
  const { onlineCount } = useRoom();

  return (
    <div className="p-4">
      <h2>Online Users</h2>
      <p>{onlineCount}</p>
    </div>
  );
}