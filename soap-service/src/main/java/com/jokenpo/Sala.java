package com.jokenpo;

import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class Sala {
    private String jogador1;
    private String jogador2;
    private Map<String, String> jogadas; // jogador -> jogada atual do round
    private List<String> historico; // descrição de rounds anteriores
    private String resultadoAtual; // cache do resultado do round atual
    private static final Set<String> JOGADAS_VALIDAS = Set.of("pedra", "papel", "tesoura");

    public Sala(String jogador1) {
        this.jogador1 = jogador1;
        this.jogadas = new HashMap<>();
        this.historico = new ArrayList<>();
    }

    public String getJogador1() { return jogador1; }
    public String getJogador2() { return jogador2; }
    public void setJogador2(String jogador2) { this.jogador2 = jogador2; }

    public boolean registrarJogada(String jogador, String jogada) {
        if (jogador == null || jogada == null) return false;
        if (!JOGADAS_VALIDAS.contains(jogada.toLowerCase())) return false;
        if (!jogador.equals(jogador1) && (jogador2 == null || !jogador.equals(jogador2))) return false;
        // Impede sobrescrever jogada se já fez nesse round e ainda não terminou
        if (resultadoAtual == null && jogadas.containsKey(jogador)) return false;
        jogadas.put(jogador, jogada.toLowerCase());
        // Se ambos jogaram, calcula e armazena resultado
        if (jogador2 != null && jogadas.containsKey(jogador1) && jogadas.containsKey(jogador2)) {
            resultadoAtual = calcularResultadoInternal();
            historico.add(descreverRound());
        }
        return true;
    }

    public String calcularResultado() {
        if (resultadoAtual != null) return resultadoAtual;
        if (jogador1 == null || jogador2 == null || !jogadas.containsKey(jogador1) || !jogadas.containsKey(jogador2))
            return "Aguardando jogadas";
        resultadoAtual = calcularResultadoInternal();
        historico.add(descreverRound());
        return resultadoAtual;
    }

    private String calcularResultadoInternal() {
        String j1 = jogadas.get(jogador1);
        String j2 = jogadas.get(jogador2);
        if (j1.equals(j2)) return "Empate";
        if ((j1.equals("pedra") && j2.equals("tesoura")) ||
            (j1.equals("papel") && j2.equals("pedra")) ||
            (j1.equals("tesoura") && j2.equals("papel"))) return jogador1 + " ganhou";
        return jogador2 + " ganhou";
    }

    private String descreverRound() {
        String j1 = jogadas.getOrDefault(jogador1, "-");
        String j2 = jogadas.getOrDefault(jogador2, "-");
        String vencedor = resultadoAtual;
        return "{" + jogador1 + ":" + j1 + ", " + jogador2 + ":" + j2 + ", resultado:" + vencedor + "}";
    }

    public List<String> getHistorico() {
        return historico;
    }

    public void novoRoundSeConcluido() {
        if (resultadoAtual != null) {
            jogadas.clear();
            resultadoAtual = null;
        }
    }
}
