package com.jokenpo;

import jakarta.jws.WebService;
import java.util.HashMap;
import java.util.Map;

@WebService(endpointInterface = "com.jokenpo.JokenpoService")
public class JokenpoServiceImpl implements JokenpoService {

    private Map<Integer, Sala> salas = new HashMap<>();
    private int nextId = 1;

    @Override
    public int criarSala(String jogador1) {
        int id = nextId++;
        salas.put(id, new Sala(jogador1));
        return id;
    }

    @Override
    public boolean entrarSala(int idSala, String jogador2) {
        Sala sala = salas.get(idSala);
        if (sala != null && sala.getJogador2() == null) {
            sala.setJogador2(jogador2);
            return true;
        }
        return false;
    }

    @Override
    public boolean registrarJogada(int idSala, String jogador, String jogada) {
        Sala sala = salas.get(idSala);
        if (sala != null) {
            sala.registrarJogada(jogador, jogada);
            return true;
        }
        return false;
    }

    @Override
    public String verResultado(int idSala) {
        Sala sala = salas.get(idSala);
        if (sala != null) return sala.calcularResultado();
        return "Sala não encontrada";
    }

    @Override
    public String listarSalasAbertas() {
        StringBuilder json = new StringBuilder("{\"salas\":[");
        boolean primeiro = true;
        
        for (var entry : salas.entrySet()) {
            if (entry.getValue().getJogador2() == null) {
                if (!primeiro) {
                    json.append(",");
                }
                json.append("{")
                    .append("\"id\":").append(entry.getKey()).append(",")
                    .append("\"jogador1\":\"").append(entry.getValue().getJogador1()).append("\",")
                    .append("\"status\":\"aguardando\"")
                    .append("}");
                primeiro = false;
            }
        }
        
        json.append("]}");
        return json.toString();
    }
}
