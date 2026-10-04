// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const os = require('os');

const PORT = 8080;

// 1. Webサーバー作成（index.htmlを自動配信）
const server = http.createServer((req, res) => {
  // index.htmlの場所を検索（balance-server内、または1つ上の親フォルダ）
  let filePath = path.join(__dirname, 'index.html');
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, '..', 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('index.html が見つかりませんでした。');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    }
  });
});

// 2. WebSocketサーバーの統合
const wss = new WebSocket.Server({ server });

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIPAddress();

wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`✅ デバイスが接続されました: ${clientIP}`);

  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log(`❌ デバイスが切断されました`);
  });
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 DOTS PIXEL ARCADE - Web & WebSocket Server Running!`);
  console.log(`📡 スマホ/PCのブラウザで開くURL: http://${localIP}:${PORT}`);
  console.log('====================================================');
});
