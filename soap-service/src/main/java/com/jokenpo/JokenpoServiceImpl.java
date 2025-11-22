package com.jokenpo;

import jakarta.jws.WebService;
import java.util.*;

@WebService(endpointInterface = "com.jokenpo.JokenpoService")
public class JokenpoServiceImpl implements JokenpoService {

    private static class Sala {
        String jogador1;
        String jogador2;
        String jogada1;
        String jogada2;
        boolean resultadoCalculado = false;
    }

    private Map<Integer, Sala> salas = new HashMap<>();
    private int nextId = 1;

    @Override
    public synchronized int criarSala(String jogador1) {
        Sala sala = new Sala();
        sala.jogador1 = jogador1;
        salas.put(nextId, sala);
        return nextId++;
    }

    @Override
    public synchronized boolean entrarSala(int idSala, String jogador2) {
        Sala sala = salas.get(idSala);
        if (sala != null && sala.jogador2 == null) {
            sala.jogador2 = jogador2;
            new Timer().schedule(new TimerTask() {
                @Override
                public void run() {
                    calcularResultado(idSala);
                }
            }, 5000);
            return true;
        }
        return false;
    }

    @Override
    public synchronized boolean registrarJogada(int idSala, String jogador, String jogada) {
        Sala sala = salas.get(idSala);
        if (sala == null) return false;
        if (jogador.equals(sala.jogador1)) sala.jogada1 = jogada;
        else if (jogador.equals(sala.jogador2)) sala.jogada2 = jogada;
        return true;
    }

    @Override
    public synchronized String verResultado(int idSala) {
        Sala sala = salas.get(idSala);
        if (sala == null || !sala.resultadoCalculado) return "Aguardando jogadas...";
        return calcularResultado(idSala);
    }

    private synchronized String calcularResultado(int idSala) {
        Sala sala = salas.get(idSala);
        if (sala.resultadoCalculado) return sala.jogada1 + " vs " + sala.jogada2 + " -> Resultado já calculado";

        String j1 = sala.jogada1 != null ? sala.jogada1.toLowerCase() : "";
        String j2 = sala.jogada2 != null ? sala.jogada2.toLowerCase() : "";

        String resultado;
        if (j1.isEmpty() && j2.isEmpty()) resultado = "Empate (WO duplo)";
        else if (j1.isEmpty()) resultado = sala.jogador1 + " perdeu por WO";
        else if (j2.isEmpty()) resultado = sala.jogador2 + " perdeu por WO";
        else if (j1.equals(j2)) resultado = "Empate";
        else if ((j1.equals("pedra") && j2.equals("tesoura")) ||
                 (j1.equals("tesoura") && j2.equals("papel")) ||
                 (j1.equals("papel") && j2.equals("pedra"))) {
            resultado = sala.jogador1 + " venceu!";
        } else {
            resultado = sala.jogador2 + " venceu!";
        }

        sala.resultadoCalculado = true;
        return resultado;
    }
}
