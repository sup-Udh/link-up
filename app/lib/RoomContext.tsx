"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as Y from "yjs";
import {
  Awareness,
  encodeAwarenessUpdate,
  applyAwarenessUpdate,
} from "y-protocols/awareness";

interface RoomContextType {
  ydoc: Y.Doc;
  yText: Y.Text;
  awareness: Awareness;
  onlineCount: number;
}

const RoomContext = createContext<RoomContextType | null>(null);

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used inside RoomProvider");
  return ctx;
}

const CURSOR_COLORS = [
  "#30bced",
  "#6eeb83",
  "#ffbc42",
  "#ecd444",
  "#ee6352",
  "#9ac2c9",
  "#8acb88",
  "#1be7ff",
];

function getRandomColor() {
  return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}

function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/socket`;
}

export function RoomProvider({
  roomId,
  children,
}: {
  roomId: string;
  children: ReactNode;
}) {
  const [onlineCount, setOnlineCount] = useState(0);

  // Stable refs so ydoc and awareness survive re-renders
  const ydocRef = useRef<Y.Doc | null>(null);
  const awarenessRef = useRef<Awareness | null>(null);

  if (!ydocRef.current) {
    ydocRef.current = new Y.Doc();
  }
  if (!awarenessRef.current) {
    awarenessRef.current = new Awareness(ydocRef.current);
  }

  const ydoc = ydocRef.current;
  const awareness = awarenessRef.current;
  const yText = ydoc.getText("monaco");

  useEffect(() => {
    const ws = new WebSocket(getWsUrl());
    const username = "User-" + Math.floor(Math.random() * 1000);
    const color = getRandomColor();

    // Set local cursor identity
    awareness.setLocalStateField("user", {
      name: username,
      color: color,
      colorLight: color + "33",
    });

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join-room", roomId, username }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "presence") {
        setOnlineCount(data.count);
      }

      if (data.type === "yjs-update") {
        Y.applyUpdate(ydoc, new Uint8Array(data.update), "ws");
      }

      if (data.type === "awareness-update") {
        applyAwarenessUpdate(
          awareness,
          new Uint8Array(data.update),
          "ws"
        );
      }
    };

    // Broadcast local doc changes
    const handleDocUpdate = (update: Uint8Array, origin: any) => {
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

    // Broadcast local cursor/awareness changes
    const handleAwarenessUpdate = ({
      added,
      updated,
      removed,
    }: {
      added: number[];
      updated: number[];
      removed: number[];
    }) => {
      const changedClients = added.concat(updated).concat(removed);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "awareness-update",
            roomId,
            update: Array.from(
              encodeAwarenessUpdate(awareness, changedClients)
            ),
          })
        );
      }
    };

    ydoc.on("update", handleDocUpdate);
    awareness.on("update", handleAwarenessUpdate);

    return () => {
      ydoc.off("update", handleDocUpdate);
      awareness.off("update", handleAwarenessUpdate);
      ws.close();
    };
  }, [roomId, ydoc, awareness]);

  return (
    <RoomContext.Provider value={{ ydoc, yText, awareness, onlineCount }}>
      {children}
    </RoomContext.Provider>
  );
}
