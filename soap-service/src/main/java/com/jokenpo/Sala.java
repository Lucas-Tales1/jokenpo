package com.jokenpo;

import java.util.HashMap;
import java.util.Map;

public class Sala {
    private String jogador1;
    private String jogador2;
    private Map<String, String> jogadas; // jogador -> jogada

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
        if (jogador1 == null || jogador2 == null || !jogadas.containsKey(jogador1) || !jogadas.containsKey(jogador2))
            return "Aguardando jogadas";

        String j1 = jogadas.get(jogador1);
        String j2 = jogadas.get(jogador2);

        if (j1.equals(j2)) return "Empate!";
        if ((j1.equals("pedra") && j2.equals("tesoura")) ||
            (j1.equals("papel") && j2.equals("pedra")) ||
            (j1.equals("tesoura") && j2.equals("papel"))) return jogador1 + " ganhou!";
        return jogador2 + " ganhou!";
    }
}
