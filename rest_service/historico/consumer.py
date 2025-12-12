"""
Consumer RabbitMQ para o REST Service
Escuta eventos das partidas e persiste no banco de dados
"""

import django
import os
import sys
import json
import logging
from threading import Thread

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rest_service.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

django.setup()

from historico.models import Historico
from historico.rabbitmq_client import RabbitMQClient

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class HistoricoConsumer:
    """Consumer que persiste eventos do RabbitMQ no banco de dados"""

    def __init__(self):
        self.rabbitmq = RabbitMQClient(
            host=os.getenv('RABBITMQ_HOST', 'localhost'),
            port=int(os.getenv('RABBITMQ_PORT', '5672')),
            username=os.getenv('RABBITMQ_USER', 'guest'),
            password=os.getenv('RABBITMQ_PASSWORD', 'guest')
        )

    def conectar(self):
        """Conecta ao RabbitMQ"""
        return self.rabbitmq.connect()

    def processar_evento(self, event, method):
        """
        Processa um evento e persiste no banco de dados
        
        Args:
            event: dict com dados do evento
            method: método do RabbitMQ
        """
        try:
            tipo = event.get('tipo')
            dados = event.get('dados', {})
            id_sala = event.get('idSala')

            logger.info(f'Processando evento: tipo={tipo}, sala={id_sala}')

            # Persiste no banco dependendo do tipo de evento
            if tipo == 'JOGADA_REGISTRADA':
                self._registrar_jogada(id_sala, dados)

            elif tipo == 'RESULTADO_CALCULADO':
                self._registrar_resultado(id_sala, dados)

            elif tipo == 'SALA_CRIADA':
                self._registrar_sala_criada(id_sala, dados)

            elif tipo == 'SALA_ENCERRADA':
                self._registrar_sala_encerrada(id_sala, dados)

            logger.info(f'Evento processado com sucesso: {tipo}')

        except Exception as e:
            logger.error(f'Erro ao processar evento: {str(e)}')

    def _registrar_jogada(self, id_sala, dados):
        """Registra uma jogada no histórico"""
        jogador = dados.get('jogador')
        jogada = dados.get('jogada')

        # Atualiza ou cria histórico
        historico, created = Historico.objects.get_or_create(
            id_sala=id_sala,
            defaults={'resultado': json.dumps({})}
        )

        if created:
            historico.resultado = json.dumps({
                'jogadas': {},
                'eventos': []
            })
        
        # Atualiza resultado com a nova jogada
        resultado = json.loads(historico.resultado)
        if 'jogadas' not in resultado:
            resultado['jogadas'] = {}
        
        resultado['jogadas'][jogador] = jogada
        resultado['eventos'] = resultado.get('eventos', [])
        resultado['eventos'].append({
            'tipo': 'JOGADA_REGISTRADA',
            'jogador': jogador,
            'jogada': jogada,
            'timestamp': dados.get('timestamp', '')
        })

        historico.resultado = json.dumps(resultado)
        historico.save()

    def _registrar_resultado(self, id_sala, dados):
        """Registra o resultado final da partida"""
        try:
            historico = Historico.objects.get(id_sala=id_sala)
        except Historico.DoesNotExist:
            historico = Historico.objects.create(id_sala=id_sala)

        resultado = json.loads(historico.resultado)
        resultado['resultado_final'] = dados
        resultado['resultado_final']['timestamp'] = dados.get('timestamp', '')

        historico.resultado = json.dumps(resultado)
        historico.save()

    def _registrar_sala_criada(self, id_sala, dados):
        """Registra a criação de uma sala"""
        historico, created = Historico.objects.get_or_create(
            id_sala=id_sala,
            defaults={
                'resultado': json.dumps({
                    'sala_criada': True,
                    'jogador1': dados.get('jogador1'),
                    'timestamp_criacao': dados.get('timestamp', '')
                })
            }
        )
        
        if not created:
            resultado = json.loads(historico.resultado)
            resultado['sala_criada'] = True
            resultado['jogador1'] = dados.get('jogador1')
            resultado['timestamp_criacao'] = dados.get('timestamp', '')
            historico.resultado = json.dumps(resultado)
            historico.save()

    def _registrar_sala_encerrada(self, id_sala, dados):
        """Registra o encerramento de uma sala"""
        try:
            historico = Historico.objects.get(id_sala=id_sala)
            resultado = json.loads(historico.resultado)
            resultado['sala_encerrada'] = True
            resultado['timestamp_encerramento'] = dados.get('timestamp', '')
            historico.resultado = json.dumps(resultado)
            historico.save()
        except Historico.DoesNotExist:
            logger.warning(f'Sala {id_sala} não encontrada ao encerrar')

    def iniciar_consumo(self):
        """Inicia o consumo de mensagens de todas as salas"""
        logger.info('Iniciando consumer de histórico...')

        # Conecta ao RabbitMQ
        if not self.conectar():
            logger.error('Falha ao conectar ao RabbitMQ')
            return False

        # Começará a consumir de todas as salas que existem
        # Para salas específicas, você pode fazer isso sob demanda
        
        # Exemplo: consumir de uma fila geral de eventos
        fila_geral = 'eventos-historico'
        self.rabbitmq.assert_queue(fila_geral)
        
        self.rabbitmq.consume_messages(
            fila_geral,
            self.processar_evento
        )

        try:
            self.rabbitmq.start_consuming()
        except KeyboardInterrupt:
            logger.info('Consumer interrompido pelo usuário')
            self.rabbitmq.stop_consuming()
            self.rabbitmq.disconnect()

    def registrar_sala_dynamic(self, id_sala):
        """
        Registra consumo dinâmico para uma sala específica
        Pode ser chamado quando uma nova sala é criada
        """
        fila_sala = f'sala-{id_sala}'
        
        if not self.rabbitmq.connect():
            logger.error(f'Falha ao conectar para sala {id_sala}')
            return False

        logger.info(f'Registrando consumer para sala {id_sala}...')
        
        self.rabbitmq.assert_queue(fila_sala)
        self.rabbitmq.consume_messages(
            fila_sala,
            self.processar_evento
        )

        return True


# Função para iniciar o consumer como thread separada
def iniciar_consumer_thread():
    """Inicia o consumer em uma thread separada"""
    consumer = HistoricoConsumer()
    thread = Thread(target=consumer.iniciar_consumo, daemon=True)
    thread.start()
    return consumer


if __name__ == '__main__':
    consumer = HistoricoConsumer()
    consumer.iniciar_consumo()
