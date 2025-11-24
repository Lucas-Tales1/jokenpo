import axios from "axios";

const API_GATEWAY = "http://localhost:3000/jogo/soap";

export const criarSala = async (jogador: string) => {
  const res = await axios.post(`${API_GATEWAY}/criar-sala`, { jogador });
  return res.data.id;
};

export const entrarSala = async (idSala: number, jogador: string) => {
  const res = await axios.post(`${API_GATEWAY}/entrar-sala`, { idSala, jogador });
  return res.data.sucesso;
};

export const jogar = async (idSala: number, jogador: string, jogada: string) => {
  try {
    const res = await axios.post(`${API_GATEWAY}/jogar`, { idSala, jogador, jogada });
    return res.data.resultado;
  } catch (error) {
    console.error('Erro na chamada POST /jogar:', error);
    throw error;
  }
};

export const verResultado = async (idSala: number) => {
  const res = await axios.post(`${API_GATEWAY}/resultado`, { idSala });
  return res.data.resultado;
};
