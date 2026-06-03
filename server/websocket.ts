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

wss.on("connection", (ws) => {
  console.log("Client connected");

  let currentRoom: string | null = null;

  ws.on("message", (raw) => {
    const data = JSON.parse(raw.toString());

    if (data.type === "join-room") {
      const { roomId, user } = data;
      currentRoom = roomId;

      if (user && user.id && user.name) {
        socketUsers.set(ws, { id: user.id, name: user.name, joinedAt: Date.now() });
      } else {
        // Fallback for missing identity
        const anonId = "anon_" + Math.random().toString(36).substr(2, 6);
        socketUsers.set(ws, { id: anonId, name: "Anonymous", joinedAt: Date.now() });
      }

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }

      rooms.get(roomId)?.add(ws);

      const currentUser = socketUsers.get(ws);

      // Send join notification to others
      rooms.get(roomId)?.forEach((client) => {
        if (client !== ws && currentUser) {
          client.send(JSON.stringify({
            type: "notification",
            message: `${currentUser.name} joined the room`
          }));
        }
      });

      // Send presence (users array)
      const usersList = Array.from(rooms.get(roomId) || []).map(client => socketUsers.get(client)).filter(Boolean);
      const payload = JSON.stringify({
        type: "presence",
        users: usersList,
      });

      rooms.get(roomId)?.forEach((client) => {
        client.send(payload);
      });

      // Init and send room state
      if (!roomDocs.has(roomId)) {
        roomDocs.set(roomId, new Y.Doc());
      }
      
      const doc = roomDocs.get(roomId)!;
      const stateVector = Y.encodeStateAsUpdate(doc);
      
      ws.send(JSON.stringify({
        type: "yjs-update",
        roomId: roomId,
        update: Array.from(stateVector),
      }));

      // Send latest output if exists
      if (roomOutputs.has(roomId)) {
        const latest = roomOutputs.get(roomId);
        ws.send(JSON.stringify({
          type: "execution-result",
          roomId: roomId,
          success: latest.success,
          output: latest.output
        }));
      }

      // Send current language if it was changed from default
      if (roomLanguages.has(roomId)) {
        ws.send(JSON.stringify({
          type: "language-change",
          language: roomLanguages.get(roomId)
        }));
      }
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
  });

  ws.on("close", () => {
    console.log("Disconnected");
    if (currentRoom && rooms.has(currentRoom)) {
      const room = rooms.get(currentRoom);
      const departingUser = socketUsers.get(ws);
      
      room?.delete(ws);
      socketUsers.delete(ws);
      
      const usersList = Array.from(room || []).map(client => socketUsers.get(client)).filter(Boolean);
      
      if (usersList.length === 0) {
        rooms.delete(currentRoom);
        roomDocs.delete(currentRoom);
        roomOutputs.delete(currentRoom);
        roomLanguages.delete(currentRoom);
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