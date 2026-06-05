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
import type { NormalizedProblem } from "./problem-engine/types";
import { getStarterCode, isEditorEmpty } from "./problem-engine/starterCode";
import { createClient } from "@/utils/supabase/client";

export interface TestCaseResult {
  passed: boolean;
  expected: string;
  received: string;
  error?: string;
}

export interface CustomTestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  results?: TestCaseResult[];
  runIndex?: number | "all";
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
  testResults: Record<number, TestCaseResult>;
  isExecutingIndex: number | "all" | null;
  runCode: (runIndex?: number | "all") => Promise<void>;
  language: string;
  changeLanguage: (lang: string) => void;
  problemMetadata: NormalizedProblem | null;
  
  // Custom Cases
  customCases: CustomTestCase[];
  addCustomCase: (tc: CustomTestCase) => void;
  updateCustomCase: (tc: CustomTestCase) => void;
  deleteCustomCase: (id: string) => void;

  // Moderation
  hostId: string | null;
  driverId: string | null;
  editorLocked: boolean;
  joinStatus: "connecting" | "waiting-approval" | "joined" | "rejected";
  pendingRequests: { id: string, name: string }[];
  approveUser: (id: string) => void;
  rejectUser: (id: string) => void;
  kickUser: (id: string) => void;
  transferHost: (id: string) => void;
  assignDriver: (id: string | null) => void;
  setEditorLock: (locked: boolean) => void;
  resetSession: () => void;
  endSession: () => void;
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
  
  // If running locally, route directly to the websocket server port to bypass any Next.js proxying issues
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "ws://localhost:8080";
  }

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
  const [testResults, setTestResults] = useState<Record<number, TestCaseResult>>({});
  const [isExecutingIndex, setIsExecutingIndex] = useState<number | "all" | null>(null);
  const [language, setLanguage] = useState("javascript");
  const [problemMetadata, setProblemMetadata] = useState<NormalizedProblem | null>(null);
  const [customCases, setCustomCases] = useState<CustomTestCase[]>([]);
  const [hasLoadedState, setHasLoadedState] = useState(false);
  
  // Autosave refs
  const autosaveTimer = useRef<any>(null);
  
  const [hostId, setHostId] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [editorLocked, setEditorLocked] = useState(false);
  const [joinStatus, setJoinStatus] = useState<"connecting" | "waiting-approval" | "joined" | "rejected">("connecting");
  const [pendingRequests, setPendingRequests] = useState<{ id: string, name: string }[]>([]);
  
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
    let reqAppParam = urlParams.get("requireApproval");
    
    if (nameParam || reqAppParam) {
      if (nameParam) localStorage.setItem("linko_name", nameParam);
      if (reqAppParam) sessionStorage.setItem("linko_req_app", reqAppParam);
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
    const urlParams = new URLSearchParams(window.location.search);
    const slugParam = urlParams.get("slug");
    fetch(`/api/problem?roomId=${roomId}${slugParam ? `&slug=${slugParam}` : ''}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProblemMetadata(data);
          // Inject starter code if the editor is empty
          if (isEditorEmpty(yText.toString())) {
            const starter = getStarterCode(data, language);
            if (starter) {
              yText.delete(0, yText.length);
              yText.insert(0, starter);
            }
          }
        }
      })
      .catch(err => console.error("Failed to load metadata:", err));

    // Fetch persisted room state
    fetch(`/api/rooms/${roomId}`)
      .then(res => {
        if (!res.ok) throw new Error("Room not found");
        return res.json();
      })
      .then(data => {
        if (data.language) setLanguage(data.language);
        if (data.custom_test_cases) setCustomCases(data.custom_test_cases);
        if (data.latest_results) setTestResults(data.latest_results);
        
        // Rehydrate Yjs if it's currently empty (e.g. server restarted)
        if (data.code && yText.toString() === "") {
          yText.insert(0, data.code);
        }
        
        setHasLoadedState(true);
      })
      .catch(err => {
        console.error("Failed to load persisted room state:", err);
        setHasLoadedState(true); // Proceed anyway
      });
  }, [roomId, yText]);

  // Debounced Autosave
  useEffect(() => {
    if (!hasLoadedState || !currentUser) return;

    const saveToDb = async () => {
      try {
        await fetch(`/api/rooms/${roomId}/save`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: yText.toString(),
            language,
            customTestCases: customCases,
            latestResults: testResults
          })
        });
      } catch (err) {
        console.error("Autosave failed:", err);
      }
    };

    const triggerAutosave = () => {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        saveToDb();
      }, 3000); // 3 seconds debounce
    };

    // Watch Yjs changes
    const observer = () => triggerAutosave();
    yText.observe(observer);

    // Watch React state changes
    triggerAutosave();

    return () => {
      clearTimeout(autosaveTimer.current);
      yText.unobserve(observer);
    };
  }, [yText, language, customCases, testResults, hasLoadedState, currentUser, roomId]);

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

    ws.onopen = async () => {
      const requireApproval = sessionStorage.getItem("linko_req_app") === "true";

      // Fetch the real Supabase user UUID — this is what the DB foreign key requires.
      // The currentUser.id is a localStorage random ID used for presence only.
      let supabaseUserId: string | null = null;
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) supabaseUserId = user.id;
      } catch (_) {
        // Non-authenticated guest — session won't be tracked
      }

      ws.send(JSON.stringify({ type: "join-room", roomId, user: currentUser, supabaseUserId, requireApproval }));

      awareness.setLocalStateField("user", {
        id: currentUser.id,
        name: currentUser.name,
        color: color,
        colorLight: color + "33",
      });
      // We start in connecting state. If we are added immediately, presence or room-state sets us to joined.
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "presence") {
        setUsers(data.users || []);
        broadcastAwareness();
        setJoinStatus((prev) => prev === "connecting" ? "joined" : prev);
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
        setLatestOutput({ success: data.success, output: data.output, results: data.results, runIndex: data.runIndex });
        setIsExecutingIndex(null);
        
        if (data.results) {
          setTestResults(prev => {
            const next = { ...prev };
            if (data.runIndex === "all" || data.runIndex === undefined) {
              // Replace all
              data.results.forEach((r: any, idx: number) => {
                next[idx] = r;
              });
            } else {
              // Single test case update
              next[data.runIndex] = data.results[0]; // the API filters it down to 1 element
            }
            return next;
          });
        }
      }

      if (data.type === "language-change") {
        setLanguage(data.language);
      }

      if (data.type === "room-state") {
        setHostId(data.state.hostId);
        setDriverId(data.state.driverId);
        setEditorLocked(data.state.editorLocked);
        if (data.state.pendingRequests) {
          setPendingRequests(data.state.pendingRequests);
        }
        if (data.state.customCases) {
          setCustomCases(data.state.customCases);
        }
      }

      if (data.type === "waiting-approval") {
        setJoinStatus("waiting-approval");
      }

      if (data.type === "join-approved") {
        setJoinStatus("joined");
        addNotification("Approved by host.");
      }

      if (data.type === "join-rejected") {
        setJoinStatus("rejected");
      }

      if (data.type === "user-kicked") {
        alert("You have been removed from this room.");
        window.location.href = "/";
      }

      if (data.type === "room-ended") {
        alert("Session ended by host.");
        window.location.href = "/";
      }

      if (data.type === "session-reset") {
        setLatestOutput(null);
        addNotification("Session reset by host.");
        if (currentUser.id === hostId) {
          yText.delete(0, yText.length);
        }
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

  const runCode = async (runIndex: number | "all" = "all") => {
    setIsExecutingIndex(runIndex);
    setLatestOutput({ success: true, output: "Executing...", runIndex });
    
    try {
      const code = yText.toString();
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          roomId, 
          language, 
          code, 
          customTestCases: customCases, 
          runIndex,
          slug: problemMetadata?.slug
        })
      });
      
      const data = await res.json();
      setLatestOutput({ success: data.success, output: data.output, results: data.results, runIndex: data.runIndex });
      
      if (data.results) {
        setTestResults(prev => {
          const next = { ...prev };
          if (data.runIndex === "all" || data.runIndex === undefined) {
            data.results.forEach((r: any, idx: number) => {
              next[idx] = r;
            });
          } else {
            next[data.runIndex] = data.results[0];
          }
          return next;
        });
      }
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "execution-result",
          roomId,
          success: data.success,
          output: data.output,
          results: data.results,
          runIndex: data.runIndex
        }));
      }
    } catch (err: any) {
      setLatestOutput({ success: false, output: `Network error: ${err.message}` });
    } finally {
      setIsExecutingIndex(null);
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

  const addCustomCase = (tc: CustomTestCase) => {
    wsRef.current?.send(JSON.stringify({ type: "add-custom-case", roomId, case: tc }));
  };

  const updateCustomCase = (tc: CustomTestCase) => {
    wsRef.current?.send(JSON.stringify({ type: "update-custom-case", roomId, case: tc }));
  };

  const deleteCustomCase = (id: string) => {
    wsRef.current?.send(JSON.stringify({ type: "delete-custom-case", roomId, id }));
  };

  const approveUser = (userId: string) => {
    wsRef.current?.send(JSON.stringify({ type: "approve-request", roomId, userId }));
  };

  const rejectUser = (userId: string) => {
    wsRef.current?.send(JSON.stringify({ type: "reject-request", roomId, userId }));
  };

  const kickUser = (userId: string) => {
    wsRef.current?.send(JSON.stringify({ type: "kick-user", roomId, userId }));
  };

  const transferHost = (userId: string) => {
    if (window.confirm("Are you sure you want to transfer host permissions?")) {
      wsRef.current?.send(JSON.stringify({ type: "transfer-host", roomId, userId }));
    }
  };

  const assignDriver = (userId: string | null) => {
    wsRef.current?.send(JSON.stringify({ type: "assign-driver", roomId, userId }));
  };

  const setEditorLock = (locked: boolean) => {
    wsRef.current?.send(JSON.stringify({ type: "lock-editor", roomId, locked }));
  };

  const resetSession = () => {
    if (window.confirm("Are you sure you want to reset the session? All code and outputs will be cleared.")) {
      wsRef.current?.send(JSON.stringify({ type: "reset-session", roomId }));
    }
  };

  const endSession = () => {
    if (window.confirm("Are you sure you want to permanently end this session? Everyone will be disconnected.")) {
      wsRef.current?.send(JSON.stringify({ type: "end-session", roomId }));
    }
  };

  return (
    <RoomContext.Provider value={{ 
      ydoc, yText, awareness, users, currentUser, identityStatus, setIdentity, notifications, 
      latestOutput, testResults, isExecutingIndex, runCode, language, changeLanguage, problemMetadata,
      customCases, addCustomCase, updateCustomCase, deleteCustomCase,
      hostId, driverId, editorLocked, joinStatus, pendingRequests, approveUser, rejectUser,
      kickUser, transferHost, assignDriver, setEditorLock, resetSession, endSession
    }}>
      {children}
    </RoomContext.Provider>
  );
}
