const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http'); 
const crypto = require('crypto');

const { getHistorico, salvarPartida } = require('./services/restClient');
const { criarSala, entrarSala, registrarJogada, verResultado } = require('./services/soapClient');

const app = express();
const PORT = 3000;

// Mapa em memória para rastrear jogadores nas salas
const salasAtivas = new Map();

// ------------------- MIDDLEWARES -------------------
app.use(cors());
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));

// Middleware simples para tratar erros em funções async
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};


const server = http.createServer(app);

// ------------------- WEBSOCKET (NATIVO) -------------------

const salas = {}; // Armazena: { idSala: [socket1, socket2] }

server.on('upgrade', (request, socket, head) => {
  const acceptKey = request.headers['sec-websocket-key'];
  if (!acceptKey) {
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
    return;
  }
  const hash = generateAcceptValue(acceptKey);

  const responseHeaders = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${hash}`
  ];

  socket.write(responseHeaders.join('\r\n') + '\r\n\r\n');

  socket.on('data', (buffer) => {
    const message = parseMessage(buffer);
    if (message) handleMessage(socket, message);
  });

  socket.on('close', () => {
    // Lógica simples para remover socket das salas ao desconectar
    removerSocketDasSalas(socket);
    console.log('O cliente desconectou.');
  });

  socket.on('error', (err) => {
    console.error('WebSocket error:', err.message);
    removerSocketDasSalas(socket);
  });
});

function generateAcceptValue(acceptKey) {
  return crypto
    .createHash('sha1')
    .update(acceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');
}

function parseMessage(buffer) {
  const firstByte = buffer[0];
  const opCode = firstByte & 0x0f; // 0x1 texto, 0x9 ping, 0xA pong, 0x8 close

  if (opCode === 0x8) return null; // close frame
  if (opCode === 0x9) {
    // ping: responder com pong
    return { __ping: true };
  }
  if (opCode !== 0x1) return null; // Ignora se não for texto

  const secondByte = buffer.readUInt8(1);
  const isMasked = Boolean((secondByte >>> 7) & 0x1);
  
  let payloadLength = secondByte & 0x7f;
  let currentOffset = 2; // CORRIGIDO: atribuição direta (era +=)

  // Tratamento de tamanhos maiores (Frames estendidos)
  if (payloadLength === 126) {
    payloadLength = buffer.readUInt16BE(currentOffset);
    currentOffset += 2;
  } else if (payloadLength === 127) {
    // Simplificação: ignoramos mensagens gigantes (>65KB) para este exemplo acadêmico
    // Para suportar, precisaria ler UInt64BE (2 partes de 32bits)
    console.log("Mensagem muito grande ignorada");
    return null;
  }

  let maskingKey;
  if (isMasked) {
    maskingKey = buffer.slice(currentOffset, currentOffset + 4);
    currentOffset += 4;
  }

  const payloadData = buffer.slice(currentOffset, currentOffset + payloadLength);

  if (isMasked) {
    for (let i = 0; i < payloadData.length; i++) {
      payloadData[i] = payloadData[i] ^ maskingKey[i % 4];
    }
  }

  try {
    return JSON.parse(payloadData.toString('utf8'));
  } catch (e) {
    return null;
  }
}

function constructFrame(data) {
  const json = JSON.stringify(data);
  const payloadBuffer = Buffer.from(json, 'utf8');
  const payloadLength = payloadBuffer.length;

  let headerBuffer; // CORRIGIDO: Nome da variável unificado

  if (payloadLength < 126) {
    headerBuffer = Buffer.alloc(2);
    headerBuffer[1] = payloadLength;
  } else if (payloadLength < 65536) {
    headerBuffer = Buffer.alloc(4);
    headerBuffer[1] = 126;
    headerBuffer.writeUInt16BE(payloadLength, 2);
  } else {
    // Payload muito grande para este exemplo simples (precisaria de 64-bit frame)
    throw new Error("Payload muito grande para frame simples");
  }

  headerBuffer[0] = 0x81; // 0x80 (FIN) + 0x01 (Text Opcode)

  return Buffer.concat([headerBuffer, payloadBuffer]);
}

// --- LÓGICA DE GERENCIAMENTO DE MENSAGENS (Faltava esta função) ---
function handleMessage(socket, data) {
  // Trata ping
  if (data.__ping) {
    try {
      const pong = Buffer.from([0x8A, 0x00]); // FIN+PONG sem payload
      socket.write(pong);
    } catch {}
    return;
  }
  // data espera ser: { type: 'ENTRAR', idSala: '1', nome: 'Lucas' }
  // ou: { type: 'MSG', idSala: '1', nome: 'Lucas', texto: 'Olá' }

  if (data.type === 'ENTRAR') {
    const { idSala } = data;
    if (!salas[idSala]) salas[idSala] = [];
    
    // Adiciona socket à sala se ainda não estiver
    if (!salas[idSala].includes(socket)) {
      salas[idSala].push(socket);
      socket.idSalaAtual = idSala; // Guarda referência no socket para limpeza
    }
    console.log(`Usuário entrou no chat da sala ${idSala}`);
  } 
  else if (data.type === 'MSG') {
    const { idSala } = data;
    const targets = salas[idSala];
    
    if (targets) {
      const frame = constructFrame(data); // Cria o frame binário para envio
      targets.forEach(client => {
        // Verifica se a conexão ainda está aberta e escrevível
        if (client.writable) {
          client.write(frame);
        }
      });
    }
  }
}

function removerSocketDasSalas(socket) {
  // Se guardamos o id da sala no socket, fica fácil remover
  if (socket.idSalaAtual && salas[socket.idSalaAtual]) {
    salas[socket.idSalaAtual] = salas[socket.idSalaAtual].filter(s => s !== socket);
    if (salas[socket.idSalaAtual].length === 0) {
      delete salas[socket.idSalaAtual];
    }
  }
}

// ------------------- ROTAS REST -------------------
app.get('/jogo/historico', asyncHandler(async (req, res) => {
  const historico = await getHistorico();
  res.json(historico);
}));

// ------------------- ROTAS SOAP -------------------

// Criar sala
app.post('/jogo/soap/criar-sala', asyncHandler(async (req, res) => {
  const { jogador } = req.body;
  if (!jogador) {
    return res.status(400).json({ error: 'Nome do jogador é obrigatório.' });
  }
  const idSala = await criarSala(jogador);
  // Armazena o primeiro jogador
  salasAtivas.set(idSala, { jogador1: jogador, jogador2: null });
  res.json({ id: idSala });
}));

// Entrar sala
app.post('/jogo/soap/entrar-sala', asyncHandler(async (req, res) => {
  const { idSala, jogador } = req.body;
  if (!idSala || !jogador) {
    return res.status(400).json({ error: 'ID da sala e nome do jogador são obrigatórios.' });
  }
  const ok = await entrarSala(idSala, jogador);
  if (ok) {
    // Armazena o segundo jogador
    const sala = salasAtivas.get(idSala);
    if (sala) {
      sala.jogador2 = jogador;
    }
  }
  res.json({ sucesso: ok });
}));

// Listar salas ativas (abertas)
app.get('/jogo/soap/salas', asyncHandler(async (req, res) => {
  const lista = Array.from(salasAtivas.entries()).map(([idSala, info]) => ({
    id: idSala,
    jogador1: info.jogador1,
    jogador2: info.jogador2,
    aberta: !info.jogador2,
  }));
  res.json({ salas: lista });
}));

// Jogar
app.post('/jogo/soap/jogar', asyncHandler(async (req, res) => {
  const { idSala, jogador, jogada } = req.body;
  

  if (jogada === "check") {
    const resultado = await verResultado(idSala);
    return res.json({ resultado });
  }
  

  await registrarJogada(idSala, jogador, jogada);


  const resultado = await verResultado(idSala);
  

  if (resultado && !resultado.toLowerCase().includes('aguardando')) {
    const salaInfo = salasAtivas.get(idSala);
    if (salaInfo) {
      let vencedor = null; // Default para empate
      if (resultado.toLowerCase().includes('ganhou')) {
        // Extrai o nome do vencedor da string de resultado
        vencedor = resultado.split(' ')[0];
      }
      
      // Monta o objeto da partida para a API REST
      const partidaParaSalvar = {
        jogador1: salaInfo.jogador1,
        jogador2: salaInfo.jogador2,
        vencedor: vencedor,
      };

      try {
        await salvarPartida(partidaParaSalvar);
        //Limpa a sala da memória após salvar
        salasAtivas.delete(idSala);
      } catch (error) {
        console.error(`Erro ao salvar partida ${idSala}. Ela permanecerá ativa.`, error);
      }
    }
  }
  res.json({ resultado });
}));

// ------------------- ERRO GLOBAL -------------------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Erro interno do servidor' });
});

// ------------------- FAVICON -------------------
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

// ------------------- INICIALIZAÇÃO DO SERVIDOR -------------------
server.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway rodando em http://0.0.0.0:${PORT}`);
});
