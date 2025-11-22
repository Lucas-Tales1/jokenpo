const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { getHistorico, postJogada } = require('./services/restClient');
const { criarSala, entrarSala, registrarJogada, verResultado } = require('./services/soapClient');

const app = express();
const PORT = 3000;

// ------------------- MIDDLEWARES -------------------
app.use(cors());
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));

// Middleware simples para tratar erros em funções async
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ------------------- ROTAS REST -------------------
app.get('/jogo/historico', asyncHandler(async (req, res) => {
  const historico = await getHistorico();
  res.json(historico);
}));

app.post('/jogo/jogar', asyncHandler(async (req, res) => {
  const { jogada } = req.body;
  const resultado = await postJogada(jogada);
  res.json(resultado);
}));

// ------------------- ROTAS SOAP -------------------

// Criar sala
app.post('/jogo/soap/criar-sala', asyncHandler(async (req, res) => {
  const { jogador } = req.body;
  const id = await criarSala(jogador);
  res.json({ id });
}));

// Entrar sala
app.post('/jogo/soap/entrar-sala', asyncHandler(async (req, res) => {
  const { idSala, jogador } = req.body;
  const ok = await entrarSala(idSala, jogador);
  res.json({ ok });
}));

// Jogar
app.post('/jogo/soap/jogar', asyncHandler(async (req, res) => {
  const { idSala, jogador, jogada } = req.body;
  await registrarJogada(idSala, jogador, jogada);
  const resultado = await verResultado(idSala);
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
app.listen(PORT, () => {
  console.log(`API Gateway rodando em http://localhost:${PORT}`);
});
