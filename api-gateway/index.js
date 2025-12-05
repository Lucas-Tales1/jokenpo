const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http'); 
const { Server } = require("socket.io");

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
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ------------------- WEBSOCKET -------------------
io.on('connection', (socket) => {
  console.log('Novo cliente conectado via WebSocket:', socket.id);

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Cliente ${socket.id} entrou na sala ${room}`);
  });

  socket.on('entrar_sala', (dados) => {
    const { idSala, nomeJogador } = dados;
    socket.join(idSala);
    console.log(`Jogador ${nomeJogador} entrou na sala ${idSala}`);
    socket.to(idSala).emit('notificacao', `${nomeJogador} entrou na sala.`);
  });

  socket.on('enviar_mensagem', (dados) => {
    io.to(dados.sala || dados.idSala).emit('receber_mensagem', dados);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

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
