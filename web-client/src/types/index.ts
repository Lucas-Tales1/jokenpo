export type Jogada = "pedra" | "papel" | "tesoura";

export interface Partida {
  id?: number;
  jogador1: string;
  jogador2: string;
  vencedor?: string | null;
  data: string;
}
