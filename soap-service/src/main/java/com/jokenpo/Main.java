package com.jokenpo;

import jakarta.xml.ws.Endpoint;

public class Main {
    public static void main(String[] args) {
        String url = "http://localhost:5000/jokenpo";
        Endpoint.publish(url, new JokenpoServiceImpl());
        System.out.println("SOAP Service rodando em: " + url + "?wsdl");
    }
}
