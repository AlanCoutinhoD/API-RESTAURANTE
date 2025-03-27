const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:3000');

ws.on('open', () => {
    console.log('Connected to WebSocket server');
    // Send connection message
    ws.send(JSON.stringify({
        type: 'connection',
        message: 'API Connected Successfully',
        timestamp: new Date().toISOString()
    }));
    console.log('Connection message sent to WebSocket server');
});

ws.on('message', (data) => {
    console.log('Received:', data);
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});

ws.on('close', () => {
    console.log('Disconnected from WebSocket server');
});

// Export the WebSocket instance
module.exports = ws;