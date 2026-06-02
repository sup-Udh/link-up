"use client";

import { useRoomSocket } from "@/app/lib/useRoomSocket"; 

export default function Members({
  roomId,
}: {
  roomId: string;
}) {
  const count =
    useRoomSocket(roomId);

  return (
    <div className="p-4">
      <h2>
        Online Users
      </h2>

      <p>{count}</p>
    </div>
  );
}