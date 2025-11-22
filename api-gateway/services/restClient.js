const axios = require("axios");

const REST_BASE_URL = "http://localhost:8000"; // porta do seu Django REST

async function getHistorico() {
  const res = await axios.get(`${REST_BASE_URL}/jogo/historico/`);
  return res.data;
}

async function postJogada(jogada) {
  const res = await axios.post(`${REST_BASE_URL}/jogo/jogar/`, { jogada });
  return res.data;
}

module.exports = { getHistorico, postJogada };
