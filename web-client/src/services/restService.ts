import axios from "axios";
import { type Partida } from "../types";

const API_GATEWAY = "http://localhost:3000/jogo/historico";

export const getHistorico = async (): Promise<Partida[]> => {
  const res = await axios.get(API_GATEWAY);
  return res.data.historico || [];
};
