package com.jokenpo;

import jakarta.xml.ws.Endpoint;

public class JokenpoServer {
    public static void main(String[] args) {
        Endpoint.publish("http://localhost:8080/jokenpo", new JokenpoServiceImpl());
        System.out.println("SOAP Jokenpô rodando em http://localhost:8080/jokenpo?wsdl");
    }
}
