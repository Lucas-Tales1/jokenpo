package com.jokenpo;

import jakarta.jws.WebMethod;
import jakarta.jws.WebService;

@WebService
public interface JokenpoService {

    @WebMethod
    int criarSala(String jogador1);

    @WebMethod
    boolean entrarSala(int idSala, String jogador2);

    @WebMethod
    boolean registrarJogada(int idSala, String jogador, String jogada);

    @WebMethod
    String verResultado(int idSala);

    @WebMethod
    String listarSalasAbertas();
}
