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
import { ProblemMetadata } from "./leetcode";

export interface TestCaseResult {
  passed: boolean;
  expected: string;
  received: string;
  error?: string;
}

export interface ExecutionResult {
  success: boolean;
  output?: string; // fallback for compile errors
  results?: TestCaseResult[];
}

interface RoomContextType {
  ydoc: Y.Doc;
  yText: Y.Text;
  awareness: Awareness;
  onlineCount: number;
  latestOutput: ExecutionResult | null;
  isExecuting: boolean;
  runCode: () => Promise<void>;
  language: string;
  changeLanguage: (lang: string) => void;
  problemMetadata: ProblemMetadata | null;
}

const RoomContext = createContext<RoomContextType | null>(null);

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used inside RoomProvider");
  return ctx;
}

// needs to be changed. add more colors or a color lib
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
  const [latestOutput, setLatestOutput] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [problemMetadata, setProblemMetadata] = useState<ProblemMetadata | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

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
    // Fetch problem metadata asynchronously
    fetch(`/api/problem?roomId=${roomId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setProblemMetadata(data);
      })
      .catch(err => console.error("Failed to load metadata:", err));

    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;
    const username = "User-" + Math.floor(Math.random() * 1000);
    const color = getRandomColor();

    // Helper: send our full awareness state to others
    const broadcastAwareness = () => {
      if (ws.readyState === WebSocket.OPEN) {
        const update = encodeAwarenessUpdate(awareness, [ydoc.clientID]);
        ws.send(
          JSON.stringify({
            type: "awareness-update",
            roomId,
            update: Array.from(update),
          })
        );
      }
    };

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join-room", roomId, username }));

      // Set cursor identity AFTER socket is open so the
      // awareness update handler can actually send it
      awareness.setLocalStateField("user", {
        name: username,
        color: color,
        colorLight: color + "33",
      });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "presence") {
        setOnlineCount(data.count);
        // When someone joins or leaves, re-broadcast our cursor
        // so late joiners can see where we are
        broadcastAwareness();
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

      if (data.type === "execution-result") {
        setLatestOutput({ success: data.success, output: data.output, results: data.results });
        setIsExecuting(false);
      }

      if (data.type === "language-change") {
        setLanguage(data.language);
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

  const runCode = async () => {
    setIsExecuting(true);
    setLatestOutput({ success: true, output: "Executing..." });
    
    try {
      const code = yText.toString();
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, language, code }) // Added roomId to fetch metadata
      });
      
      const data = await res.json();
      setLatestOutput({ success: data.success, output: data.output, results: data.results });
      
      // Broadcast to other users
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "execution-result",
          roomId,
          success: data.success,
          output: data.output,
          results: data.results
        }));
      }
    } catch (err: any) {
      setLatestOutput({ success: false, output: `Network error: ${err.message}` });
    } finally {
      setIsExecuting(false);
    }
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "language-change",
        roomId,
        language: lang
      }));
    }
  };

  return (
    <RoomContext.Provider value={{ ydoc, yText, awareness, onlineCount, latestOutput, isExecuting, runCode, language, changeLanguage, problemMetadata }}>
      {children}
    </RoomContext.Provider>
  );
}
