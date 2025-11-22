const express = require('express');
const cors = require('cors');
const { getHistorico, postJogada, jogarSOAP } = require('./services'); // seu arquivo com axios/soap
const app = express();

app.use(cors());
app.use(express.json()); // para ler JSON do body
const helmet = require('helmet');
app.use(helmet({ contentSecurityPolicy: false }));

// Rotas REST
app.get('/jogo/historico', async (req, res) => {
  try {
    const historico = await getHistorico();
    res.json(historico);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/jogo/jogar', async (req, res) => {
  try {
    const { jogada } = req.body;
    const resultado = await postJogada(jogada);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota SOAP
app.post('/jogo/soap', async (req, res) => {
  try {
    const { jogada } = req.body;
    const resultado = await jogarSOAP(jogada);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('API Gateway rodando em http://localhost:3000');
});
