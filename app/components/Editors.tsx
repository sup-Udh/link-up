"use client";

import { useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";
import { ydoc, yText } from "@/app/lib/collaboration";

export default function Editor({ roomId }: { roomId: string }) {
  
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      // Connect specifically for typing without incrementing the user count
      // if you decide to separate connections. But for now, we'll just join.
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
        // Apply remote update to local Y.Doc
        const update = new Uint8Array(data.update);
        Y.applyUpdate(ydoc, update, "ws");
      }
    };

    // When local ydoc changes, send it to the websocket
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


