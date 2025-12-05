const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const WebSocket = require('ws'); 

const { getHistorico, salvarPartida } = require('./services/restClient');
const { criarSala, entrarSala, registrarJogada, verResultado, listarSalasAbertas } = require('./services/soapClient');

const app = express();
const PORT = 3000;

// Mapa em memória para rastrear jogadores nas salas (SOAP)
const salasAtivas = new Map();

// Mapa de salas WEB SOCKET → roomId -> Set(sockets)
const salasWS = new Map();

// ------------------- MIDDLEWARES -------------------
app.use(cors());
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));

// Middleware simples para tratar erros em funções async
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const server = http.createServer(app);

// ------------------- WEBSOCKET -------------------
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log("Cliente WS conectado");

  ws.on('message', (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (err) {
      console.log("Mensagem inválida:", msg);
      return;
    }

    // ---- JOIN ROOM ----
    if (data.tipo === "joinRoom") {
      const room = data.room;

      if (!salasWS.has(room)) {
        salasWS.set(room, new Set());
      }

      salasWS.get(room).add(ws);
      ws.room = room;

      console.log(`Cliente entrou na sala WS ${room}`);
      return;
    }

    // ---- ENVIAR MENSAGEM PARA SALA ----
    if (data.tipo === "enviar_mensagem") {
      const room = data.sala || data.idSala;

      if (salasWS.has(room)) {
        for (const client of salasWS.get(room)) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              tipo: "receber_mensagem",
              ...data
            }));
          }
        }
      }
      return;
    }

  });

  ws.on('close', () => {
    console.log("Cliente WS desconectado");

    // remover da sala
    if (ws.room && salasWS.has(ws.room)) {
      salasWS.get(ws.room).delete(ws);
    }
  });

});

// ------------------- ROTAS REST -------------------
app.get('/jogo/historico', asyncHandler(async (req, res) => {
  const historico = await getHistorico();
  res.json(historico);
}));

app.get('/jogo/salas-abertas', asyncHandler(async (req, res) => {
  const salas = await listarSalasAbertas();
  res.json({ salas });
}));

// ------------------- ROTAS SOAP -------------------

// Criar sala
app.post('/jogo/soap/criar-sala', asyncHandler(async (req, res) => {
  const { jogador } = req.body;
  if (!jogador) {
    return res.status(400).json({ error: 'Nome do jogador é obrigatório.' });
  }
  const idSala = await criarSala(jogador);
  
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
    const sala = salasAtivas.get(idSala);
    if (sala) {
      sala.jogador2 = jogador;
    }
  }

  res.json({ sucesso: ok });
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
      let vencedor = null;
      if (resultado.toLowerCase().includes('ganhou')) {
        vencedor = resultado.split(' ')[0];
      }

      const partidaParaSalvar = {
        jogador1: salaInfo.jogador1,
        jogador2: salaInfo.jogador2,
        vencedor: vencedor,
      };

      try {
        await salvarPartida(partidaParaSalvar);
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
