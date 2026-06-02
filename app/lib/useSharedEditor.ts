// src/lib/useSharedEditor.ts

"use client";

import { useEffect } from "react";
import * as Y from "yjs";
import { ydoc } from "./collaboration";

export function useSharedEditor(
  roomId: string
) {
  useEffect(() => {
    const socket =
      new WebSocket(
        "ws://localhost/socket"
      );

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "join-room",
          roomId,
        })
      );
    };

    const updateHandler = (
      update: Uint8Array
    ) => {
      socket.send(
        JSON.stringify({
          type: "yjs-update",
          roomId,
          update:
            Array.from(update),
        })
      );
    };

    ydoc.on(
      "update",
      updateHandler
    );

    socket.onmessage = (
      event
    ) => {
      const data = JSON.parse(
        event.data
      );

      if (
        data.type ===
        "yjs-update"
      ) {
        Y.applyUpdate(
          ydoc,
          new Uint8Array(
            data.update
          )
        );
      }
    };

    return () => {
      ydoc.off(
        "update",
        updateHandler
      );

      socket.close();
    };
  }, [roomId]);
}