"use client";

import { useEffect, useState } from "react";

export function useRoomSocket(
  roomId: string
) {
  const [count, setCount] =
    useState(0);

  useEffect(() => {
    const fallbackWsUrl = typeof window !== "undefined" 
      ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/socket`
      : "ws://localhost:3001";
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || fallbackWsUrl;
    const ws = new WebSocket(wsUrl);

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