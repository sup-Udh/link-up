"use client";

import { useEffect, useState } from "react";

function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/socket`;
}

export function useRoomSocket(
  roomId: string
) {
  const [count, setCount] =
    useState(0);

  useEffect(() => {
    const ws = new WebSocket(getWsUrl());

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