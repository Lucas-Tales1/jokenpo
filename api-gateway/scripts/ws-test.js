const net = require('net');
const crypto = require('crypto');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = parseInt(process.env.PORT || '3000', 10);
const SALA = process.env.SALA || '1';
const NOME = process.env.NOME || 'Tester';

function buildHandshake() {
  const key = crypto.randomBytes(16).toString('base64');
  const req = [
    'GET / HTTP/1.1',
    `Host: ${HOST}:${PORT}`,
    'Upgrade: websocket',
    'Connection: Upgrade',
    'Sec-WebSocket-Version: 13',
    `Sec-WebSocket-Key: ${key}`,
    '\r\n',
  ].join('\r\n');
  return req;
}

function maskPayload(buffer, maskKey) {
  const out = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    out[i] = buffer[i] ^ maskKey[i % 4];
  }
  return out;
}

function buildClientTextFrame(obj) {
  const payload = Buffer.from(JSON.stringify(obj), 'utf8');
  const maskKey = crypto.randomBytes(4);
  const finOpcode = 0x81; // FIN + text
  let header;
  if (payload.length < 126) {
    header = Buffer.alloc(2);
    header[0] = finOpcode;
    header[1] = 0x80 | payload.length; // mask bit + length
  } else if (payload.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = finOpcode;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    throw new Error('Payload too large');
  }
  const masked = maskPayload(payload, maskKey);
  return Buffer.concat([header, maskKey, masked]);
}

function run() {
  const s = net.createConnection(PORT, HOST);
  s.on('connect', () => {
    s.write(buildHandshake());
  });

  let upgraded = false;
  s.on('data', (d) => {
    if (!upgraded) {
      const txt = d.toString();
      if (/101 Switching Protocols/.test(txt)) {
        upgraded = true;
        console.log('[OK] Handshake done');
        // Entrar na sala
        s.write(buildClientTextFrame({ type: 'ENTRAR', idSala: SALA, nome: NOME }));
        // Enviar mensagem
        setTimeout(() => {
          s.write(buildClientTextFrame({ type: 'MSG', idSala: SALA, nome: NOME, texto: 'Olá da automação!' }));
        }, 300);
      } else {
        console.log('[WARN] Unexpected handshake response:', txt);
      }
    } else {
      // Print raw server frames
      console.log('[FRAME]', d);
    }
  });

  s.on('error', (e) => {
    console.error('[ERR]', e.message);
  });

  s.on('close', () => {
    console.log('[CLOSED]');
  });
}

run();
