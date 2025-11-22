export type Jogada = "pedra" | "papel" | "tesoura";

export interface Partida {
  jogador: string;
  jogada: string;
  data: string;
}
