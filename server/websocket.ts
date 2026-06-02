import { WebSocketServer } from "ws";

const PORT = parseInt(process.env.PORT || "3001", 10);
const wss = new WebSocketServer({
  port: PORT,
});

const rooms = new Map<
  string,
  Set<any>
>();

wss.on("connection", (ws) => {
  console.log("Client connected");

  let currentRoom: string | null = null;

  ws.on("message", (raw) => {
    const data = JSON.parse(raw.toString());

    if (data.type === "join-room") {
      const { roomId, username } = data;
      currentRoom = roomId;

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }

      rooms.get(roomId)?.add(ws);

      const users =
        Array.from(
          rooms.get(roomId) || []
        ).length;


        
      const payload = JSON.stringify({
        type: "presence",
        count: users,
      });

      rooms
        .get(roomId)
        ?.forEach((client) => {
          client.send(payload);
        });
    }

    if (data.type === "yjs-update") {
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
      room?.delete(ws);
      
      const users = Array.from(room || []).length;
      if (users === 0) {
        rooms.delete(currentRoom);
      } else {
        const payload = JSON.stringify({
          type: "presence",
          count: users,
        });
        room?.forEach((client) => {
          client.send(payload);
        });
      }
    }
  });
});

console.log(
  `WebSocket running on port ${PORT}`
);