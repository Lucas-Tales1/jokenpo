import axios from "axios";
import { type Partida } from "../types";

const getApiGatewayUrl = () => {
  const host = window.location.hostname;
  return `http://${host}:3000/jogo/historico`;
};

export const getHistorico = async (): Promise<Partida[]> => {
  const API_GATEWAY = getApiGatewayUrl();
  const res = await axios.get(API_GATEWAY);
  return res.data.historico || [];
};
