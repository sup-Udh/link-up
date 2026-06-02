const WebSocket = require('ws');
const Y = require('yjs');

const ws1 = new WebSocket('ws://localhost:3001');
const ws2 = new WebSocket('ws://localhost:3001');

const doc1 = new Y.Doc();
const doc2 = new Y.Doc();
const text1 = doc1.getText('monaco');

const text2 = doc2.getText('monaco');

ws1.on('open', () => {
    ws1.send(JSON.stringify({ type: 'join-room', roomId: '123', username: 'A' }));
});

ws2.on('open', () => {
    ws2.send(JSON.stringify({ type: 'join-room', roomId: '123', username: 'B' }));
});

ws2.on('message', (msg) => {
    const data = JSON.parse(msg.toString());
    if (data.type === 'yjs-update') {
        console.log('WS2 received update:', data.update);
        Y.applyUpdate(doc2, new Uint8Array(data.update));
        console.log('Doc2 text is now:', text2.toString());
    }
});

doc1.on('update', (update) => {
    ws1.send(JSON.stringify({
        type: 'yjs-update',
        roomId: '123',
        update: Array.from(update)
    }));
});

setTimeout(() => {
    console.log('Inserting text in doc1...');
    text1.insert(0, 'Hello World!');
}, 1000);

setTimeout(() => {
    process.exit(0);
}, 2000);
