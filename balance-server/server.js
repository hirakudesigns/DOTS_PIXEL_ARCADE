// server.js
const { WebSocketServer } = require('ws');
const os = require('os');

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

// ローカルIPアドレスの取得と表示
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
console.log('----------------------------------------------------');
console.log(`🚀 BALANCE ARCADE SERVER RUNNING!`);
console.log(`📡 PC/スマホから接続するアドレス: ws://${localIP}:${PORT}`);
console.log('----------------------------------------------------');

wss.on('connection', (ws) => {
  console.log('🟢 新しいデバイスが接続されました');

  ws.on('message', (data) => {
    // 送信元以外の全接続クライアント（PC/スマホ間）へブロードキャスト
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(data.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('🔴 デバイスが切断されました');
  });
});