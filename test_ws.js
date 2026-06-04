const WebSocket = require('ws');
const ws = new WebSocket('wss://handiness-glucose-munchkin.ngrok-free.dev/socket');

ws.on('open', () => {
    console.log('Connected to WebSocket server via Ngrok without header');
    ws.close();
});

ws.on('error', (err) => {
    console.error('WebSocket error:', err);
});
