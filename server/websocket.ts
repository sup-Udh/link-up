import WebSocket, { WebSocketServer } from "ws";
import * as Y from "yjs";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client for syncing presence
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase: any = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    realtime: { transport: WebSocket as any }
  });
}

async function updateRoomDb(roomId: string, count: number) {
  if (!supabase) return;
  try {
    await supabase.from("rooms").update({
      participant_count: count,
      is_active: count > 0,
      last_active_at: new Date().toISOString()
    }).eq("id", roomId);
  } catch (err) {
    console.error("Failed to sync room count to DB:", err);
  }
}

const PORT = parseInt(process.env.PORT || "3001", 10);
const wss = new WebSocketServer({
  port: PORT,
});

const rooms = new Map<
  string,
  Set<any>
>();

const roomDocs = new Map<string, Y.Doc>();
const roomOutputs = new Map<string, any>();
const roomLanguages = new Map<string, string>();
const socketUsers = new Map<any, { id: string, name: string, joinedAt: number, supabaseUserId?: string | null, dbSessionId?: string }>();

export interface RoomState {
  hostId: string;
  driverId: string | null;
  editorLocked: boolean;
  requireApproval: boolean;
  pendingRequests: { id: string, name: string }[];
  customCases: { id: string, input: string, expectedOutput: string }[];
  problem?: any;
}
export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
}
const roomMessages = new Map<string, ChatMessage[]>();
const roomStates = new Map<string, RoomState>();
const pendingSockets = new Map<string, any>();

wss.on("connection", (ws) => {
  console.log("Client connected");

  let currentRoom: string | null = null;

  ws.on("message", (raw) => {
    const data = JSON.parse(raw.toString());

    const finishJoin = async (socket: any, rId: string) => {
      rooms.get(rId)?.add(socket);
      const currentUser = socketUsers.get(socket);

      // Log session to database for authenticated users
      if (currentUser && currentUser.supabaseUserId && supabase) {
        try {
          const { data, error } = await supabase.from("user_sessions").insert({
            user_id: currentUser.supabaseUserId,
            room_id: rId,
            joined_at: new Date().toISOString()
          }).select("id").single();
          
          if (data && data.id) {
            currentUser.dbSessionId = data.id;
          }
          if (error) {
            console.error("user_sessions insert error:", error.message);
          }
        } catch (e) {
          console.error("Failed to insert user session:", e);
        }
      }

      // Send current room state to the newly joined user
      if (roomStates.has(rId)) {
        socket.send(JSON.stringify({
          type: "room-state",
          state: roomStates.get(rId)
        }));
      }

      // Send join notification to others
      rooms.get(rId)?.forEach((client) => {
        if (client !== socket && currentUser) {
          client.send(JSON.stringify({
            type: "notification",
            message: `${currentUser.name} joined the room`
          }));
        }
      });

      // Send presence (users array)
      const usersList = Array.from(rooms.get(rId) || []).map(client => socketUsers.get(client)).filter(Boolean);
      const payload = JSON.stringify({
        type: "presence",
        users: usersList,
      });

      rooms.get(rId)?.forEach((client) => {
        client.send(payload);
      });

      updateRoomDb(rId, usersList.length);

      // Init and send room state
      if (!roomDocs.has(rId)) {
        roomDocs.set(rId, new Y.Doc());
      }
      
      const doc = roomDocs.get(rId)!;
      const stateVector = Y.encodeStateAsUpdate(doc);
      
      socket.send(JSON.stringify({
        type: "yjs-update",
        roomId: rId,
        update: Array.from(stateVector),
      }));

      // Send latest output if exists
      if (roomOutputs.has(rId)) {
        const latest = roomOutputs.get(rId)!;
        socket.send(JSON.stringify({
          type: "execution-result",
          roomId: rId,
          success: latest.success,
          output: latest.output,
          results: latest.results,
          runIndex: latest.runIndex
        }));
      }

      // Send current language if it was changed from default
      if (roomLanguages.has(rId)) {
        socket.send(JSON.stringify({
          type: "language-change",
          language: roomLanguages.get(rId)
        }));
      }

      // Send chat history if it exists
      if (roomMessages.has(rId)) {
        socket.send(JSON.stringify({
          type: "CHAT_HISTORY",
          messages: roomMessages.get(rId)
        }));
      }
    };

    if (data.type === "broadcastMessage") {
      const { roomId, text, senderId, senderName } = data;
      const msg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        senderId,
        senderName,
        timestamp: Date.now()
      };
      
      if (!roomMessages.has(roomId)) {
        roomMessages.set(roomId, []);
      }
      roomMessages.get(roomId)!.push(msg);
      
      // Broadcast to everyone (including sender, for confirmation)
      rooms.get(roomId)?.forEach((member) => {
        member.send(JSON.stringify({
          type: "NEW_MESSAGE",
          message: msg
        }));
      });
    }

    if (data.type === "join-room") {
      const { roomId, user, supabaseUserId, requireApproval } = data;
      currentRoom = roomId;

      if (user && user.id && user.name) {
        socketUsers.set(ws, { id: user.id, name: user.name, joinedAt: Date.now(), supabaseUserId: supabaseUserId || null });
      } else {
        // Fallback for missing identity
        const anonId = "anon_" + Math.random().toString(36).substr(2, 6);
        socketUsers.set(ws, { id: anonId, name: "Anonymous", joinedAt: Date.now(), supabaseUserId: null });
      }

      const currentUserData = socketUsers.get(ws)!;

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
        // First user to join becomes the host
        roomStates.set(roomId, {
          hostId: currentUserData.id,
          driverId: null,
          editorLocked: false,
          requireApproval: requireApproval === true,
          pendingRequests: [],
          customCases: []
        });
      }

      const state = roomStates.get(roomId);

      if (state && state.requireApproval && state.hostId !== currentUserData.id) {
        pendingSockets.set(currentUserData.id, ws);
        
        if (!state.pendingRequests.find(u => u.id === currentUserData.id)) {
          state.pendingRequests.push({ id: currentUserData.id, name: currentUserData.name });
        }
        
        ws.send(JSON.stringify({ type: "waiting-approval" }));
        
        // Notify host
        const payload = JSON.stringify({ type: "room-state", state });
        rooms.get(roomId)?.forEach(client => client.send(payload));
        return; // User is stuck in waiting room
      }

      finishJoin(ws, roomId);
    }

    if (data.type === "language-change") {
      roomLanguages.set(data.roomId, data.language);

      rooms.get(data.roomId)?.forEach((client) => {
        if (client !== ws) {
          client.send(
            JSON.stringify({
              type: "language-change",
              language: data.language,
            })
          );
        }
      });
    }

    if (data.type === "execution-result") {
      roomOutputs.set(data.roomId, { 
        success: data.success, 
        output: data.output,
        results: data.results,
        runIndex: data.runIndex
      });
      rooms.get(data.roomId)?.forEach((client) => {
        if (client !== ws) {
          client.send(JSON.stringify({
            type: "execution-result",
            roomId: data.roomId,
            success: data.success,
            output: data.output,
            results: data.results,
            runIndex: data.runIndex
          }));
        }
      });
    }

    if (data.type === "yjs-update") {
      // Apply to server document
      const doc = roomDocs.get(data.roomId);
      if (doc) {
        try {
          Y.applyUpdate(doc, new Uint8Array(data.update));
        } catch (e) {
          console.error("Failed to apply update:", e);
        }
      }

      // Broadcast to other clients
      rooms
        .get(data.roomId)
        ?.forEach((client) => {
          if (client !== ws) {
            client.send(
              JSON.stringify({
                type: "yjs-update",
                update: data.update,
              })
            );
          }
        });
    }

    if (data.type === "awareness-update") {
      rooms
        .get(data.roomId)
        ?.forEach((client) => {
          if (client !== ws) {
            client.send(
              JSON.stringify({
                type: "awareness-update",
                update: data.update,
              })
            );
          }
        });
    }

    // --- HOST MODERATION CONTROLS ---
    
    // Helper to validate host permissions securely
    const isHost = (roomId: string, socket: any) => {
      const state = roomStates.get(roomId);
      const user = socketUsers.get(socket);
      return state && user && state.hostId === user.id;
    };

    const broadcastRoomState = (roomId: string) => {
      const state = roomStates.get(roomId);
      if (state) {
        const payload = JSON.stringify({ type: "room-state", state });
        rooms.get(roomId)?.forEach(client => client.send(payload));
      }
    };

    if (data.type === "kick-user") {
      if (!isHost(data.roomId, ws)) return;
      
      rooms.get(data.roomId)?.forEach((client) => {
        const user = socketUsers.get(client);
        if (user && user.id === data.userId) {
          client.send(JSON.stringify({ type: "user-kicked" }));
          client.close();
        }
      });
    }

    if (data.type === "approve-request") {
      if (!isHost(data.roomId, ws)) return;
      
      const state = roomStates.get(data.roomId);
      if (state) {
        state.pendingRequests = state.pendingRequests.filter(u => u.id !== data.userId);
        broadcastRoomState(data.roomId);
        
        const targetSocket = pendingSockets.get(data.userId);
        if (targetSocket) {
          targetSocket.send(JSON.stringify({ type: "join-approved" }));
          finishJoin(targetSocket, data.roomId);
          pendingSockets.delete(data.userId);
        }
      }
    }

    if (data.type === "reject-request") {
      if (!isHost(data.roomId, ws)) return;
      
      const state = roomStates.get(data.roomId);
      if (state) {
        state.pendingRequests = state.pendingRequests.filter(u => u.id !== data.userId);
        broadcastRoomState(data.roomId);
        
        const targetSocket = pendingSockets.get(data.userId);
        if (targetSocket) {
          targetSocket.send(JSON.stringify({ type: "join-rejected" }));
          targetSocket.close();
          pendingSockets.delete(data.userId);
        }
      }
    }

    if (data.type === "add-custom-case") {
      const state = roomStates.get(data.roomId);
      if (state) {
        state.customCases.push(data.case);
        broadcastRoomState(data.roomId);
      }
    }

    if (data.type === "set-problem") {
      const state = roomStates.get(data.roomId);
      if (state) {
        state.problem = data.problem;
        broadcastRoomState(data.roomId);
      }
    }

    if (data.type === "update-custom-case") {
      const state = roomStates.get(data.roomId);
      if (state) {
        const idx = state.customCases.findIndex(c => c.id === data.case.id);
        if (idx !== -1) {
          state.customCases[idx] = data.case;
          broadcastRoomState(data.roomId);
        }
      }
    }

    if (data.type === "delete-custom-case") {
      const state = roomStates.get(data.roomId);
      if (state) {
        state.customCases = state.customCases.filter(c => c.id !== data.id);
        broadcastRoomState(data.roomId);
      }
    }

    if (data.type === "transfer-host") {
      if (!isHost(data.roomId, ws)) return;
      const state = roomStates.get(data.roomId);
      if (state) {
        state.hostId = data.userId;
        broadcastRoomState(data.roomId);
      }
    }

    if (data.type === "assign-driver") {
      if (!isHost(data.roomId, ws)) return;
      const state = roomStates.get(data.roomId);
      if (state) {
        state.driverId = data.userId; // can be null to clear driver
        broadcastRoomState(data.roomId);
      }
    }

    if (data.type === "lock-editor") {
      if (!isHost(data.roomId, ws)) return;
      const state = roomStates.get(data.roomId);
      if (state) {
        state.editorLocked = data.locked;
        broadcastRoomState(data.roomId);
      }
    }

    if (data.type === "reset-session") {
      if (!isHost(data.roomId, ws)) return;
      
      // Clear output history
      roomOutputs.delete(data.roomId);
      
      rooms.get(data.roomId)?.forEach((client) => {
        client.send(JSON.stringify({ type: "session-reset" }));
      });
    }

    if (data.type === "end-session") {
      if (!isHost(data.roomId, ws)) return;
      
      rooms.get(data.roomId)?.forEach((client) => {
        client.send(JSON.stringify({ type: "room-ended" }));
        client.close();
      });
      
      // Cleanup all server states for this room
      rooms.delete(data.roomId);
      roomDocs.delete(data.roomId);
      roomOutputs.delete(data.roomId);
      roomLanguages.delete(data.roomId);
      roomStates.delete(data.roomId);
      roomMessages.delete(data.roomId);
    }
  });

  ws.on("close", async () => {
    console.log("Disconnected");
    if (currentRoom && rooms.has(currentRoom)) {
      const room = rooms.get(currentRoom);
      const departingUser = socketUsers.get(ws);
      
      // Update session end time in database
      if (departingUser && departingUser.dbSessionId && supabase) {
        try {
          await supabase.from("user_sessions").update({
            left_at: new Date().toISOString()
          }).eq("id", departingUser.dbSessionId);
        } catch (e) {
          console.error("Failed to update user session:", e);
        }
      }
      
      // Handle pending sockets cleanup
      const currentUser = socketUsers.get(ws);
      if (currentUser) {
        if (pendingSockets.get(currentUser.id) === ws) {
          pendingSockets.delete(currentUser.id);
          // also remove from pendingRequests of any room (can just search currentRoom)
          if (currentRoom && roomStates.has(currentRoom)) {
            const state = roomStates.get(currentRoom)!;
            state.pendingRequests = state.pendingRequests.filter(u => u.id !== currentUser.id);
            const payload = JSON.stringify({ type: "room-state", state });
            rooms.get(currentRoom)?.forEach(client => client.send(payload));
          }
        }
      }

      room?.delete(ws);
      socketUsers.delete(ws);
      
      const usersList = Array.from(room || []).map(client => socketUsers.get(client)).filter(Boolean);
      
      updateRoomDb(currentRoom, usersList.length);
      
      if (usersList.length === 0) {
        rooms.delete(currentRoom);
        roomDocs.delete(currentRoom);
        roomOutputs.delete(currentRoom);
        roomLanguages.delete(currentRoom);
        roomStates.delete(currentRoom);
        roomMessages.delete(currentRoom);
      } else {
        const payload = JSON.stringify({
          type: "presence",
          users: usersList,
        });
        
        const leaveNotification = departingUser ? JSON.stringify({
          type: "notification",
          message: `${departingUser.name} left the room`
        }) : null;

        room?.forEach((client) => {
          client.send(payload);
          if (leaveNotification) {
            client.send(leaveNotification);
          }
        });
      }
    }
  });
});

console.log(
  `WebSocket running on port ${PORT}`
);