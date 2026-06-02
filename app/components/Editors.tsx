"use client";

import { useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";
import { ydoc, yText } from "@/app/lib/collaboration";

function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  // Auto-detect: use /socket path on the current host
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/socket`;
}

export default function Editor({ roomId }: { roomId: string }) {
  
  useEffect(() => {
    const ws = new WebSocket(getWsUrl());

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join-room",
          roomId,
          username: "Editor-" + Math.floor(Math.random() * 1000),
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "yjs-update") {
        const update = new Uint8Array(data.update);
        Y.applyUpdate(ydoc, update, "ws");
      }
    };

    const handleUpdate = (update: Uint8Array, origin: any) => {
      if (origin !== "ws" && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "yjs-update",
            roomId,
            update: Array.from(update),
          })
        );
      }
    };

    ydoc.on("update", handleUpdate);

    return () => {
      ydoc.off("update", handleUpdate);
      ws.close();
    };
  }, [roomId]);

  return (
     <MonacoEditor
      height="100vh"
      defaultLanguage="typescript"
      onMount={(editor) => {
        const model = editor.getModel();
        if (!model) return;

        new MonacoBinding(
          yText,
          model,
          new Set([editor])
        );
      }}
    />
  );
}
