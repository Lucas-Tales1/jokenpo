"""
Cliente RabbitMQ usando pika para o serviço de histórico.

Fornece:
- connect()
- assert_queue(queue_name)
- publish_message(queue_name, message_dict)
- consume_messages(queue_name, callback)
- start_consuming()
- stop_consuming()
- disconnect()
- delete_queue(queue_name)

O `callback` recebido em `consume_messages` será chamado como
`callback(message_dict, method)`.
"""

import json
import logging
import time
from typing import Callable, Any

import pika

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class RabbitMQClient:
    def __init__(self, host='localhost', port=5672, username='guest', password='guest'):
        self.host = host
        self.port = port
        self.username = username
        self.password = password

        self.connection: pika.BlockingConnection | None = None
        self.channel: pika.adapters.blocking_connection.BlockingChannel | None = None
        self._is_connected = False

        self._consumer_tags = {}

    def connect(self) -> bool:
        try:
            credentials = pika.PlainCredentials(self.username, self.password)
            params = pika.ConnectionParameters(
                host=self.host,
                port=self.port,
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=60,
            )

            self.connection = pika.BlockingConnection(params)
            self.channel = self.connection.channel()
            self._is_connected = True

            logger.info('[RabbitMQ] Conectado com sucesso')
            return True

        except Exception as e:
            logger.error(f'[RabbitMQ] Falha ao conectar: {e}')
            self._is_connected = False
            return False

    def assert_queue(self, queue_name: str) -> bool:
        if not self.channel:
            return False

        try:
            # Exchange fanout + fila durável
            self.channel.exchange_declare(exchange=queue_name, exchange_type='fanout', durable=True)
            self.channel.queue_declare(queue=queue_name, durable=True)
            self.channel.queue_bind(queue=queue_name, exchange=queue_name, routing_key='')

            logger.info(f'[RabbitMQ] Fila "{queue_name}" criada/verificada')
            return True

        except Exception as e:
            logger.error(f'[RabbitMQ] Erro ao criar fila "{queue_name}": {e}')
            return False

    def publish_message(self, queue_name: str, message: dict) -> bool:
        if not self.channel or not self._is_connected:
            logger.error('[RabbitMQ] Canal não conectado')
            return False

        try:
            body = json.dumps(message).encode('utf-8')

            properties = pika.BasicProperties(
                content_type='application/json',
                delivery_mode=2,  # persistent
                timestamp=int(time.time()),
            )

            self.channel.basic_publish(exchange=queue_name, routing_key='', body=body, properties=properties)

            logger.info(f'[RabbitMQ] Mensagem publicada em "{queue_name}": {message}')
            return True

        except Exception as e:
            logger.error(f'[RabbitMQ] Erro ao publicar em "{queue_name}": {e}')
            return False

    def consume_messages(self, queue_name: str, callback: Callable[[dict, Any], None]) -> bool:
        if not self.channel or not self._is_connected:
            logger.error('[RabbitMQ] Canal não conectado')
            return False

        try:
            self.channel.basic_qos(prefetch_count=1)

            logger.info(f'[RabbitMQ] Aguardando mensagens em "{queue_name}"...')

            def _on_message(ch, method, properties, body):
                try:
                    message_json = body.decode('utf-8')
                    message = json.loads(message_json)

                    logger.info(f'[RabbitMQ] Mensagem recebida em "{queue_name}": {message_json}')

                    # chama o callback com (message, method)
                    callback(message, method)

                    ch.basic_ack(delivery_tag=method.delivery_tag)

                except Exception as e:
                    logger.error(f'[RabbitMQ] Erro ao processar mensagem: {e}')
                    try:
                        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
                    except Exception as ex:
                        logger.error(f'[RabbitMQ] Erro ao fazer nack: {ex}')

            consumer_tag = self.channel.basic_consume(queue=queue_name, on_message_callback=_on_message, auto_ack=False)
            self._consumer_tags[queue_name] = consumer_tag

            return True

        except Exception as e:
            logger.error(f'[RabbitMQ] Erro ao consumir "{queue_name}": {e}')
            return False

    def start_consuming(self) -> None:
        if not self.channel or not self._is_connected:
            logger.error('[RabbitMQ] Não está conectado para iniciar consumo')
            return

        try:
            logger.info('[RabbitMQ] Iniciando loop de consumo')
            self.channel.start_consuming()
        except Exception as e:
            logger.error(f'[RabbitMQ] Erro no consumo: {e}')

    def stop_consuming(self) -> None:
        try:
            if self.channel and self.channel.is_open:
                logger.info('[RabbitMQ] Parando consumo')
                self.channel.stop_consuming()
        except Exception as e:
            logger.error(f'[RabbitMQ] Erro ao parar consumo: {e}')

    def disconnect(self) -> bool:
        try:
            if self.channel:
                try:
                    if self.channel.is_open:
                        self.channel.close()
                except Exception:
                    pass

            if self.connection:
                try:
                    if self.connection.is_open:
                        self.connection.close()
                except Exception:
                    pass

            self._is_connected = False
            logger.info('[RabbitMQ] Desconectado')
            return True

        except Exception as e:
            logger.error(f'[RabbitMQ] Erro ao desconectar: {e}')
            return False

    def delete_queue(self, queue_name: str) -> bool:
        if not self.channel:
            return False

        try:
            self.channel.queue_delete(queue=queue_name)
            logger.info(f'[RabbitMQ] Fila "{queue_name}" deletada')
            return True

        except Exception as e:
            logger.error(f'[RabbitMQ] Erro ao deletar fila "{queue_name}": {e}')
            return False

    def is_connected(self) -> bool:
        return self._is_connected and self.connection is not None and getattr(self.connection, 'is_open', False)

