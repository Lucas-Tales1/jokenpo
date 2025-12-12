package com.jokenpo.rabbitmq;

import com.google.gson.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Publisher de eventos para RabbitMQ
 * Responsável por publicar eventos de partidas
 */
public class EventPublisher {
    private static final Logger logger = LoggerFactory.getLogger(EventPublisher.class);
    private final RabbitMQClient rabbitClient;
    private static final DateTimeFormatter dateFormatter = DateTimeFormatter.ISO_DATE_TIME;

    public EventPublisher(RabbitMQClient rabbitClient) {
        this.rabbitClient = rabbitClient;
    }

    /**
     * Publica evento de sala criada
     */
    public void publicarSalaCriada(String idSala, String jogador1) {
        JsonObject event = new JsonObject();
        event.addProperty("tipo", "SALA_CRIADA");
        event.addProperty("idSala", idSala);
        event.addProperty("timestamp", LocalDateTime.now().format(dateFormatter));

        JsonObject dados = new JsonObject();
        dados.addProperty("jogador1", jogador1);
        event.add("dados", dados);

        String queueName = "sala-" + idSala;
        rabbitClient.assertQueue(queueName);
        rabbitClient.publishMessage(queueName, event);

        logger.info("Evento SALA_CRIADA publicado: " + idSala);
    }

    /**
     * Publica evento de jogador entrou na sala
     */
    public void publicarJogadorEntrou(String idSala, String jogador2) {
        JsonObject event = new JsonObject();
        event.addProperty("tipo", "JOGADOR_ENTROU");
        event.addProperty("idSala", idSala);
        event.addProperty("timestamp", LocalDateTime.now().format(dateFormatter));

        JsonObject dados = new JsonObject();
        dados.addProperty("jogador2", jogador2);
        event.add("dados", dados);

        String queueName = "sala-" + idSala;
        rabbitClient.publishMessage(queueName, event);

        logger.info("Evento JOGADOR_ENTROU publicado: " + idSala);
    }

    /**
     * Publica evento de jogada registrada
     */
    public void publicarJogadaRegistrada(String idSala, String jogador, String jogada) {
        JsonObject event = new JsonObject();
        event.addProperty("tipo", "JOGADA_REGISTRADA");
        event.addProperty("idSala", idSala);
        event.addProperty("timestamp", LocalDateTime.now().format(dateFormatter));

        JsonObject dados = new JsonObject();
        dados.addProperty("jogador", jogador);
        dados.addProperty("jogada", jogada);
        event.add("dados", dados);

        String queueName = "sala-" + idSala;
        rabbitClient.publishMessage(queueName, event);

        logger.info("Evento JOGADA_REGISTRADA publicado: " + idSala + " - " + jogador + " jogou " + jogada);
    }

    /**
     * Publica evento de resultado calculado
     */
    public void publicarResultado(String idSala, String resultado, String vencedor, String motivo) {
        JsonObject event = new JsonObject();
        event.addProperty("tipo", "RESULTADO_CALCULADO");
        event.addProperty("idSala", idSala);
        event.addProperty("timestamp", LocalDateTime.now().format(dateFormatter));

        JsonObject dados = new JsonObject();
        dados.addProperty("resultado", resultado);
        dados.addProperty("vencedor", vencedor);
        dados.addProperty("motivo", motivo);
        event.add("dados", dados);

        String queueName = "sala-" + idSala;
        rabbitClient.publishMessage(queueName, event);

        // Também publica na fila geral de histórico
        rabbitClient.assertQueue("eventos-historico");
        rabbitClient.publishMessage("eventos-historico", event);

        logger.info("Evento RESULTADO_CALCULADO publicado: " + idSala + " - Vencedor: " + vencedor);
    }

    /**
     * Publica evento de sala encerrada
     */
    public void publicarSalaEncerrada(String idSala) {
        JsonObject event = new JsonObject();
        event.addProperty("tipo", "SALA_ENCERRADA");
        event.addProperty("idSala", idSala);
        event.addProperty("timestamp", LocalDateTime.now().format(dateFormatter));

        JsonObject dados = new JsonObject();
        event.add("dados", dados);

        String queueName = "sala-" + idSala;
        rabbitClient.publishMessage(queueName, event);

        // Também publica na fila geral de histórico
        rabbitClient.assertQueue("eventos-historico");
        rabbitClient.publishMessage("eventos-historico", event);

        logger.info("Evento SALA_ENCERRADA publicado: " + idSala);
    }

    /**
     * Publica erro de validação
     */
    public void publicarErro(String idSala, String mensagem) {
        JsonObject event = new JsonObject();
        event.addProperty("tipo", "ERRO");
        event.addProperty("idSala", idSala);
        event.addProperty("timestamp", LocalDateTime.now().format(dateFormatter));

        JsonObject dados = new JsonObject();
        dados.addProperty("mensagem", mensagem);
        event.add("dados", dados);

        String queueName = "sala-" + idSala;
        rabbitClient.publishMessage(queueName, event);

        logger.error("Evento ERRO publicado: " + idSala + " - " + mensagem);
    }
}
