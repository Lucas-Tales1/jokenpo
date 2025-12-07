package com.jokenpo;

import java.util.HashMap;
import java.util.Map;

public class Sala {
    private String jogador1;
    private String jogador2;
    private Map<String, String> jogadas; // jogador -> jogada
    private int placar1 = 0;
    private int placar2 = 0;
    private int roundsPlayed = 0; // conta apenas rodadas concluídas

    public Sala(String jogador1) {
        this.jogador1 = jogador1;
        this.jogadas = new HashMap<>();
    }

    public String getJogador1() { return jogador1; }
    public String getJogador2() { return jogador2; }
    public void setJogador2(String jogador2) { this.jogador2 = jogador2; }

    public void registrarJogada(String jogador, String jogada) {
        jogadas.put(jogador, jogada);
    }

    public String calcularResultado() {
        // Se ainda não há jogadas completas, segue aguardando
        if (jogador1 == null || jogador2 == null || !jogadas.containsKey(jogador1) || !jogadas.containsKey(jogador2))
            return "Aguardando jogadas";

        String j1 = jogadas.get(jogador1);
        String j2 = jogadas.get(jogador2);

        String resultadoRodada;
        if (j1.equals(j2)) {
            resultadoRodada = "Empate!";
        } else if ((j1.equals("pedra") && j2.equals("tesoura")) ||
                   (j1.equals("papel") && j2.equals("pedra")) ||
                   (j1.equals("tesoura") && j2.equals("papel"))) {
            placar1++;
            resultadoRodada = jogador1 + " ganhou!";
        } else {
            placar2++;
            resultadoRodada = jogador2 + " ganhou!";
        }

        // Limpa jogadas para iniciar próxima rodada automaticamente
        jogadas.clear();
        roundsPlayed++;

        // Verifica se alguém venceu a série (melhor de 3)
        if (placar1 >= 2 || placar2 >= 2) {
            String vencedorSerie = placar1 > placar2 ? jogador1 : jogador2;
            return "SERIE: " + vencedorSerie + " venceu! (" + placar1 + "-" + placar2 + ")";
        }

        // Caso atinja o limite de 3 rodadas e não haja vencedor (empates podem ocorrer)
        if (roundsPlayed >= 3 && placar1 == placar2) {
            return "SERIE: Empate! (" + placar1 + "-" + placar2 + ")";
        }

        // Caso contrário, apenas informa resultado da rodada e placar
        String resposta = "Rodada " + roundsPlayed + ": " + resultadoRodada + " | Placar " + placar1 + "-" + placar2;
        return resposta;
    }

    public int getPlacar1() { return placar1; }
    public int getPlacar2() { return placar2; }
}
