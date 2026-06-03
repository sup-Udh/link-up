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
  output?: string;
  results?: TestCaseResult[];
}

export interface User {
  id: string;
  name: string;
  joinedAt: number;
}

export interface Notification {
  id: string;
  message: string;
}

interface RoomContextType {
  ydoc: Y.Doc;
  yText: Y.Text;
  awareness: Awareness;
  users: User[];
  currentUser: User | null;
  identityStatus: "loading" | "missing" | "ready";
  setIdentity: (name: string) => void;
  notifications: Notification[];
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

// Generate a hex color strictly from a string
function getColorForId(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
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
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [identityStatus, setIdentityStatus] = useState<"loading" | "missing" | "ready">("loading");
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

  const setIdentity = (name: string) => {
    localStorage.setItem("linko_name", name.trim());
    let storedId = localStorage.getItem("linko_id");
    if (!storedId) {
      storedId = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("linko_id", storedId);
    }
    setCurrentUser({ id: storedId, name: name.trim(), joinedAt: Date.now() });
    setIdentityStatus("ready");
  };

  const addNotification = (message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  useEffect(() => {
    // Identity resolution
    const urlParams = new URLSearchParams(window.location.search);
    let nameParam = urlParams.get("name");
    if (nameParam) {
      localStorage.setItem("linko_name", nameParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    let storedName = localStorage.getItem("linko_name");
    if (!storedName) {
      setIdentityStatus("missing");
      return;
    }
    
    let storedId = localStorage.getItem("linko_id");
    if (!storedId) {
      storedId = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("linko_id", storedId);
    }
    
    setCurrentUser({ id: storedId, name: storedName, joinedAt: Date.now() });
    setIdentityStatus("ready");
  }, []);

  useEffect(() => {
    // Fetch problem metadata asynchronously
    fetch(`/api/problem?roomId=${roomId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setProblemMetadata(data);
      })
      .catch(err => console.error("Failed to load metadata:", err));
  }, [roomId]);

  useEffect(() => {
    if (identityStatus !== "ready" || !currentUser) return;

    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;
    const color = getColorForId(currentUser.id);

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
      ws.send(JSON.stringify({ type: "join-room", roomId, user: currentUser }));

      awareness.setLocalStateField("user", {
        id: currentUser.id,
        name: currentUser.name,
        color: color,
        colorLight: color + "33",
      });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "presence") {
        setUsers(data.users || []);
        broadcastAwareness();
      }

      if (data.type === "notification") {
        addNotification(data.message);
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

    const handleAwarenessUpdate = ({ added, updated, removed }: any) => {
      const changedClients = added.concat(updated).concat(removed);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "awareness-update",
            roomId,
            update: Array.from(encodeAwarenessUpdate(awareness, changedClients)),
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
  }, [roomId, ydoc, awareness, identityStatus, currentUser]);

  const runCode = async () => {
    setIsExecuting(true);
    setLatestOutput({ success: true, output: "Executing..." });
    
    try {
      const code = yText.toString();
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, language, code })
      });
      
      const data = await res.json();
      setLatestOutput({ success: data.success, output: data.output, results: data.results });
      
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
    <RoomContext.Provider value={{ ydoc, yText, awareness, users, currentUser, identityStatus, setIdentity, notifications, latestOutput, isExecuting, runCode, language, changeLanguage, problemMetadata }}>
      {children}
    </RoomContext.Provider>
  );
}
