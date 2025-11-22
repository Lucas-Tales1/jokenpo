const axios = require('axios');

// URL base do Django REST
const REST_SERVICE = "http://localhost:8000/api"; // Django padrão roda na porta 8000

// Buscar histórico de partidas
const getHistorico = async () => {
  try {
    const res = await axios.get(`${REST_SERVICE}/historico/`);
    return {
      historico: res.data.map(p => `${p.jogador1} vs ${p.jogador2} - ${p.vencedor || 'Empate'}`)
    };
  } catch (err) {
    console.error("Erro ao buscar histórico do Django REST:", err.message);
    return { historico: [] };
  }
};

// Mock de jogada (pode usar REST POST real se criar no Django)
const postJogada = async (jogada) => {
  const opcoes = ["pedra", "papel", "tesoura"];
  const computador = opcoes[Math.floor(Math.random() * 3)];

  let resultado;
  if (jogada === computador) resultado = "Empate!";
  else if (
    (jogada === "pedra" && computador === "tesoura") ||
    (jogada === "papel" && computador === "pedra") ||
    (jogada === "tesoura" && computador === "papel")
  ) resultado = "Você ganhou!";
  else resultado = "Computador ganhou!";

  return { resultado: `Você: ${jogada} | Computador: ${computador} -> ${resultado}` };
};

module.exports = { getHistorico, postJogada };
