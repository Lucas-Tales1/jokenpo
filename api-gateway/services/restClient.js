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

// Salva o resultado de uma partida finalizada na API REST
const salvarPartida = async (partida) => {
  try {
    const { jogador1, jogador2, vencedor } = partida;
    const response = await axios.post(`${REST_SERVICE}/historico/`, {
      jogador1,
      jogador2,
      vencedor,
    });
    console.log('Partida salva com sucesso:', response.data);
    return response.data;
  } catch (err) {
    console.error("Erro ao salvar partida no Django REST:", err.message);
    // Lançar o erro para que o chamador possa tratá-lo
    throw err;
  }
};

module.exports = { getHistorico, salvarPartida };
