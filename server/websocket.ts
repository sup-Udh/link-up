import { WebSocketServer } from "ws";
import * as Y from "yjs";

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
const socketUsers = new Map<any, { id: string, name: string, joinedAt: number }>();

export interface RoomState {
  hostId: string;
  driverId: string | null;
  editorLocked: boolean;
  requireApproval: boolean;
  pendingRequests: { id: string, name: string }[];
}
const roomStates = new Map<string, RoomState>();
const pendingSockets = new Map<string, any>();

wss.on("connection", (ws) => {
  console.log("Client connected");

  let currentRoom: string | null = null;

  ws.on("message", (raw) => {
    const data = JSON.parse(raw.toString());

    const finishJoin = (socket: any, rId: string) => {
      rooms.get(rId)?.add(socket);
      const currentUser = socketUsers.get(socket);

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
        const latest = roomOutputs.get(rId);
        socket.send(JSON.stringify({
          type: "execution-result",
          roomId: rId,
          success: latest.success,
          output: latest.output
        }));
      }

      // Send current language if it was changed from default
      if (roomLanguages.has(rId)) {
        socket.send(JSON.stringify({
          type: "language-change",
          language: roomLanguages.get(rId)
        }));
      }
    };

    if (data.type === "join-room") {
      const { roomId, user, requireApproval } = data;
      currentRoom = roomId;

      if (user && user.id && user.name) {
        socketUsers.set(ws, { id: user.id, name: user.name, joinedAt: Date.now() });
      } else {
        // Fallback for missing identity
        const anonId = "anon_" + Math.random().toString(36).substr(2, 6);
        socketUsers.set(ws, { id: anonId, name: "Anonymous", joinedAt: Date.now() });
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
          pendingRequests: []
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
      // Persist latest output for the room
      roomOutputs.set(data.roomId, {
        success: data.success,
        output: data.output
      });

      // Broadcast to other clients
      rooms.get(data.roomId)?.forEach((client) => {
        if (client !== ws) {
          client.send(
            JSON.stringify({
              type: "execution-result",
              roomId: data.roomId,
              success: data.success,
              output: data.output,
            })
          );
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
    }
  });

  ws.on("close", () => {
    console.log("Disconnected");
    if (currentRoom && rooms.has(currentRoom)) {
      const room = rooms.get(currentRoom);
      const departingUser = socketUsers.get(ws);
      
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
      
      if (usersList.length === 0) {
        rooms.delete(currentRoom);
        roomDocs.delete(currentRoom);
        roomOutputs.delete(currentRoom);
        roomLanguages.delete(currentRoom);
        roomStates.delete(currentRoom);
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