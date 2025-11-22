const express = require('express');
const bodyParser = require('body-parser');
const soap = require('soap');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const SOAP_URL = '[http://localhost:8080/jokenpo?wsdl](http://localhost:8080/jokenpo?wsdl)'; // SOAP Java

// Criar sala
app.post('/jogo/sala', async (req, res) => {
const { jogador1 } = req.body;
try {
const client = await soap.createClientAsync(SOAP_URL);
const result = await client.criarSalaAsync({ jogador1 });
const salaId = result[0].salaId || result[0];
res.json({
salaId,
_links: {
self: { href: `/jogo/sala/${salaId}` },
entrar: { href: `/jogo/sala/${salaId}/entrar` },
},
});
} catch (err) {
res.status(500).json({ error: err.message });
}
});

// Entrar na sala
app.post('/jogo/sala/:id/entrar', async (req, res) => {
const { id } = req.params;
const { jogador2 } = req.body;
try {
const client = await soap.createClientAsync(SOAP_URL);
const result = await client.entrarSalaAsync({ salaId: id, jogador2 });
res.json({
status: result[0].status || 'ok',
_links: {
self: { href: `/jogo/sala/${id}/entrar` },
jogar: { href: `/jogo/sala/${id}/jogar` },
},
});
} catch (err) {
res.status(500).json({ error: err.message });
}
});

// Registrar jogada
app.post('/jogo/sala/:id/jogar', async (req, res) => {
const { id } = req.params;
const { jogador, jogada } = req.body;
try {
const client = await soap.createClientAsync(SOAP_URL);
const result = await client.registrarJogadaAsync({ salaId: id, jogador, jogada });
res.json({
resultado: result[0].resultado || 'aguardando',
_links: {
self: { href: `/jogo/sala/${id}/jogar` },
resultado: { href: `/jogo/sala/${id}/resultado` },
},
});
} catch (err) {
res.status(500).json({ error: err.message });
}
});

// Obter resultado
app.get('/jogo/sala/:id/resultado', async (req, res) => {
const { id } = req.params;
try {
const client = await soap.createClientAsync(SOAP_URL);
const result = await client.obterResultadoAsync({ salaId: id });
res.json({
resultado: result[0].resultado || 'aguardando',
vencedor: result[0].vencedor || null,
_links: {
self: { href: `/jogo/sala/${id}/resultado` },
historico: { href: `/jogo/historico` },
},
});
} catch (err) {
res.status(500).json({ error: err.message });
}
});

// Histórico de partidas via REST Django
app.get('/jogo/historico', async (req, res) => {
try {
const response = await axios.get('[http://localhost:8000/api/historico](http://localhost:8000/api/historico)');
res.json({
historico: response.data,
_links: { self: { href: '/jogo/historico' } },
});
} catch (err) {
res.status(500).json({ error: err.message });
}
});

app.listen(3000, () => {
console.log('API Gateway rodando em [http://localhost:3000](http://localhost:3000)');
});
