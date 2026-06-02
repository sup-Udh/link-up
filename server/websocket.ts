import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 8080,
});

const rooms = new Map<
  string,
  Set<any>
>();

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (raw) => {
    const data = JSON.parse(raw.toString());

    if (data.type === "join-room") {
      const { roomId, username } = data;

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
  });

  ws.on("close", () => {
    console.log("Disconnected");
    rooms.forEach((clients, roomId) => {
      clients.delete(ws);
      if (clients.size === 0) {
        rooms.delete(roomId);
      }
    });
  });
});

console.log(
  "WebSocket running on port 8080"
);