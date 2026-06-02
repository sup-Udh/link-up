"use client";

import { useEffect, useState } from "react";

export function useRoomSocket(
  roomId: string
) {
  const [count, setCount] =
    useState(0);

  useEffect(() => {
    const ws =
      new WebSocket(
        "wss://1fzqjw74-3000.inc1.devtunnels.ms/room/test"
      );

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join-room",
          roomId,
          username:
            "User-" +
            Math.floor(
              Math.random() * 1000
            ),
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(
        event.data
      );

      if (
        data.type === "presence"
      ) {
        setCount(data.count);
      }
    };

    return () => ws.close();
  }, [roomId]);

  return count;
}