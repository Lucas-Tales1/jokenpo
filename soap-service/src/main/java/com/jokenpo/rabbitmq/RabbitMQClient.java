package com.jokenpo.rabbitmq;

import com.rabbitmq.client.*;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;
import java.util.function.Consumer;

public class RabbitMQClient {
    private static final Logger logger = LoggerFactory.getLogger(RabbitMQClient.class);
    
    private Connection connection;
    private Channel channel;
    private boolean isConnected = false;
    private final Gson gson = new Gson();
    
    private final String host;
    private final int port;
    private final String username;
    private final String password;

    public RabbitMQClient(String host, int port, String username, String password) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
    }

    public RabbitMQClient() {
        this("localhost", 5672, "guest", "guest");
    }

    /**
     * Conecta ao RabbitMQ
     */
    public boolean connect() {
        try {
            ConnectionFactory factory = new ConnectionFactory();
            factory.setHost(host);
            factory.setPort(port);
            factory.setUsername(username);
            factory.setPassword(password);
            factory.setRequestedHeartbeat(600);
            factory.setConnectionTimeout(60000);

            this.connection = factory.newConnection();
            this.channel = connection.createChannel();
            this.isConnected = true;

            logger.info("[RabbitMQ] Conectado com sucesso");
            return true;

        } catch (IOException | TimeoutException e) {
            logger.error("[RabbitMQ] Falha ao conectar: " + e.getMessage());
            this.isConnected = false;
            return false;
        }
    }

    /**
     * Cria ou obtém uma fila (exchange + queue)
     */
    public boolean assertQueue(String queueName) {
        if (channel == null) {
            return false;
        }

        try {
            // Cria exchange do tipo fanout
            channel.exchangeDeclare(queueName, "fanout", true);

            // Cria a fila
            channel.queueDeclare(queueName, true, false, false, null);

            // Vincula a fila ao exchange
            channel.queueBind(queueName, queueName, "");

            logger.info("[RabbitMQ] Fila \"" + queueName + "\" criada/verificada");
            return true;

        } catch (IOException e) {
            logger.error("[RabbitMQ] Erro ao criar fila \"" + queueName + "\": " + e.getMessage());
            return false;
        }
    }

    /**
     * Publica uma mensagem na fila
     */
    public boolean publishMessage(String queueName, JsonObject message) {
        if (channel == null || !isConnected) {
            logger.error("[RabbitMQ] Canal não conectado");
            return false;
        }

        try {
            String messageJson = gson.toJson(message);
            byte[] messageBody = messageJson.getBytes(StandardCharsets.UTF_8);

            AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
                    .contentType("application/json")
                    .deliveryMode(2) // persistent
                    .timestamp(new java.util.Date())
                    .build();

            channel.basicPublish(queueName, "", props, messageBody);

            logger.info("[RabbitMQ] Mensagem publicada em \"" + queueName + "\": " + messageJson);
            return true;

        } catch (IOException e) {
            logger.error("[RabbitMQ] Erro ao publicar em \"" + queueName + "\": " + e.getMessage());
            return false;
        }
    }

    /**
     * Consome mensagens de uma fila
     */
    public boolean consumeMessages(String queueName, Consumer<JsonObject> callback) {
        if (channel == null || !isConnected) {
            logger.error("[RabbitMQ] Canal não conectado");
            return false;
        }

        try {
            channel.basicQos(1);

            logger.info("[RabbitMQ] Aguardando mensagens em \"" + queueName + "\"...");

            DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                try {
                    String messageJson = new String(delivery.getBody(), StandardCharsets.UTF_8);
                    JsonObject message = gson.fromJson(messageJson, JsonObject.class);

                    logger.info("[RabbitMQ] Mensagem recebida em \"" + queueName + "\": " + messageJson);

                    // Executa callback
                    callback.accept(message);

                    // Confirma recebimento
                    channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);

                } catch (Exception e) {
                    logger.error("[RabbitMQ] Erro ao processar mensagem: " + e.getMessage());
                    try {
                        // Rejeita e recoloca na fila
                        channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true);
                    } catch (IOException ex) {
                        logger.error("[RabbitMQ] Erro ao fazer nack: " + ex.getMessage());
                    }
                }
            };

            channel.basicConsume(queueName, false, deliverCallback, consumerTag -> {});

            return true;

        } catch (IOException e) {
            logger.error("[RabbitMQ] Erro ao consumir \"" + queueName + "\": " + e.getMessage());
            return false;
        }
    }

    /**
     * Desconecta do RabbitMQ
     */
    public boolean disconnect() {
        try {
            if (channel != null) {
                channel.close();
            }
            if (connection != null) {
                connection.close();
            }
            this.isConnected = false;
            logger.info("[RabbitMQ] Desconectado");
            return true;

        } catch (IOException | TimeoutException e) {
            logger.error("[RabbitMQ] Erro ao desconectar: " + e.getMessage());
            return false;
        }
    }

    /**
     * Deleta uma fila
     */
    public boolean deleteQueue(String queueName) {
        if (channel == null) {
            return false;
        }

        try {
            channel.queueDelete(queueName);
            logger.info("[RabbitMQ] Fila \"" + queueName + "\" deletada");
            return true;

        } catch (IOException e) {
            logger.error("[RabbitMQ] Erro ao deletar fila \"" + queueName + "\": " + e.getMessage());
            return false;
        }
    }

    /**
     * Verifica status da conexão
     */
    public boolean isConnected() {
        return isConnected && connection != null && connection.isOpen();
    }

    /**
     * Retorna o canal
     */
    public Channel getChannel() {
        return channel;
    }
}
