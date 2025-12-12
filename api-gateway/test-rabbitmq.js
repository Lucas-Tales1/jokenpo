#!/usr/bin/env node

/**
 * Script de teste da integração RabbitMQ
 * 
 * Uso: node test-rabbitmq.js [opção]
 * 
 * Opções:
 *   connection   - Testar conexão ao RabbitMQ
 *   queue        - Testar criação de fila
 *   publish      - Testar publicação de mensagem
 *   consume      - Testar consumo de mensagem
 *   full         - Executar teste completo
 *   flow         - Simular fluxo de partida
 */

const RabbitClient = require('./services/rabbitClient');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, ...args) {
  console.log(color, ...args, COLORS.reset);
}

function success(...args) {
  log(COLORS.green, '✓', ...args);
}

function error(...args) {
  log(COLORS.red, '✗', ...args);
}

function info(...args) {
  log(COLORS.blue, 'ℹ', ...args);
}

function warn(...args) {
  log(COLORS.yellow, '⚠', ...args);
}

// ==================== TESTES ====================

async function testConnection() {
  console.log('\n' + COLORS.blue + '=== Teste de Conexão ===' + COLORS.reset);
  
  try {
    const connected = await RabbitClient.connect();
    
    if (connected) {
      success('Conectado ao RabbitMQ com sucesso');
      await RabbitClient.disconnect();
      return true;
    } else {
      error('Falha ao conectar ao RabbitMQ');
      return false;
    }
  } catch (err) {
    error('Erro na conexão:', err.message);
    return false;
  }
}

async function testQueue() {
  console.log('\n' + COLORS.blue + '=== Teste de Fila ===' + COLORS.reset);
  
  try {
    const testQueue = 'test-' + Date.now();
    info(`Criando fila temporária: ${testQueue}`);
    
    await RabbitClient.connect();
    const created = await RabbitClient.assertQueue(testQueue);
    
    if (created) {
      success(`Fila criada: ${testQueue}`);
      await RabbitClient.deleteQueue(testQueue);
      success(`Fila deletada: ${testQueue}`);
      await RabbitClient.disconnect();
      return true;
    } else {
      error('Falha ao criar fila');
      return false;
    }
  } catch (err) {
    error('Erro ao testar fila:', err.message);
    return false;
  }
}

async function testPublish() {
  console.log('\n' + COLORS.blue + '=== Teste de Publicação ===' + COLORS.reset);
  
  try {
    const testQueue = 'test-pub-' + Date.now();
    const testMsg = {
      tipo: 'TEST',
      conteudo: 'Mensagem de teste',
      timestamp: new Date().toISOString()
    };
    
    info(`Publicando mensagem na fila: ${testQueue}`);
    
    await RabbitClient.connect();
    await RabbitClient.assertQueue(testQueue);
    const published = await RabbitClient.publishMessage(testQueue, testMsg);
    
    if (published) {
      success('Mensagem publicada com sucesso');
      await RabbitClient.deleteQueue(testQueue);
      await RabbitClient.disconnect();
      return true;
    } else {
      error('Falha ao publicar mensagem');
      return false;
    }
  } catch (err) {
    error('Erro ao testar publicação:', err.message);
    return false;
  }
}

async function testConsume() {
  console.log('\n' + COLORS.blue + '=== Teste de Consumo ===' + COLORS.reset);
  
  try {
    const testQueue = 'test-consume-' + Date.now();
    const testMsg = {
      tipo: 'TEST_CONSUME',
      numero: 42,
      timestamp: new Date().toISOString()
    };
    
    let messageReceived = false;
    
    info(`Publicando mensagem na fila: ${testQueue}`);
    
    await RabbitClient.connect();
    await RabbitClient.assertQueue(testQueue);
    
    // Setup consumidor
    await RabbitClient.consumeMessages(testQueue, (msg) => {
      success(`Mensagem recebida: ${JSON.stringify(msg)}`);
      messageReceived = true;
    });
    
    // Publicar mensagem
    await RabbitClient.publishMessage(testQueue, testMsg);
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (messageReceived) {
      success('Consumo de mensagem funcionando');
      await RabbitClient.deleteQueue(testQueue);
      await RabbitClient.disconnect();
      return true;
    } else {
      error('Nenhuma mensagem recebida');
      return false;
    }
  } catch (err) {
    error('Erro ao testar consumo:', err.message);
    return false;
  }
}

async function testFullFlow() {
  console.log('\n' + COLORS.blue + '=== Teste Completo ===' + COLORS.reset);
  
  const tests = [
    { name: 'Conexão', fn: testConnection },
    { name: 'Fila', fn: testQueue },
    { name: 'Publicação', fn: testPublish },
    { name: 'Consumo', fn: testConsume },
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n▶ Executando: ${test.name}`);
    try {
      const result = await test.fn();
      results.push({ nome: test.name, sucesso: result });
    } catch (err) {
      error(`Erro ao executar ${test.name}:`, err.message);
      results.push({ nome: test.name, sucesso: false });
    }
  }
  
  console.log('\n' + COLORS.blue + '=== Resumo ===' + COLORS.reset);
  results.forEach(r => {
    if (r.sucesso) {
      success(r.nome);
    } else {
      error(r.nome);
    }
  });
  
  const sucessos = results.filter(r => r.sucesso).length;
  const total = results.length;
  
  if (sucessos === total) {
    console.log(COLORS.green + `\n✓ Todos os testes passaram (${sucessos}/${total})` + COLORS.reset);
    return true;
  } else {
    console.log(COLORS.red + `\n✗ Alguns testes falharam (${sucessos}/${total})` + COLORS.reset);
    return false;
  }
}

async function testGameFlow() {
  console.log('\n' + COLORS.blue + '=== Teste de Fluxo de Partida ===' + COLORS.reset);
  
  const salaId = 'test-sala-' + Date.now();
  const queueName = `sala-${salaId}`;
  
  try {
    await RabbitClient.connect();
    await RabbitClient.assertQueue(queueName);
    
    const eventos = [];
    
    // Setup consumer
    await RabbitClient.consumeMessages(queueName, (msg) => {
      eventos.push(msg);
      info(`Evento recebido: ${msg.tipo}`);
    });
    
    // Simular eventos de partida
    console.log('\nSimulando eventos de partida...');
    
    const eventos_test = [
      {
        tipo: 'SALA_CRIADA',
        idSala: salaId,
        dados: { jogador1: 'Alice' },
        timestamp: new Date().toISOString()
      },
      {
        tipo: 'JOGADOR_ENTROU',
        idSala: salaId,
        dados: { jogador2: 'Bob' },
        timestamp: new Date().toISOString()
      },
      {
        tipo: 'JOGADA_REGISTRADA',
        idSala: salaId,
        dados: { jogador: 'Alice', jogada: 'pedra' },
        timestamp: new Date().toISOString()
      },
      {
        tipo: 'JOGADA_REGISTRADA',
        idSala: salaId,
        dados: { jogador: 'Bob', jogada: 'tesoura' },
        timestamp: new Date().toISOString()
      },
      {
        tipo: 'RESULTADO_CALCULADO',
        idSala: salaId,
        dados: { resultado: 'vitoria', vencedor: 'Alice', motivo: 'Pedra vence Tesoura' },
        timestamp: new Date().toISOString()
      },
      {
        tipo: 'SALA_ENCERRADA',
        idSala: salaId,
        dados: { vencedor: 'Alice' },
        timestamp: new Date().toISOString()
      }
    ];
    
    for (const evt of eventos_test) {
      info(`Publicando: ${evt.tipo}`);
      await RabbitClient.publishMessage(queueName, evt);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    success(`Fluxo completo testado! ${eventos.length}/${eventos_test.length} eventos recebidos`);
    
    await RabbitClient.deleteQueue(queueName);
    await RabbitClient.disconnect();
    
    return true;
  } catch (err) {
    error('Erro ao testar fluxo:', err.message);
    return false;
  }
}

// ==================== MAIN ====================

async function main() {
  const args = process.argv.slice(2);
  const option = args[0] || 'full';
  
  console.log(COLORS.blue + '\n╔════════════════════════════════════════╗' + COLORS.reset);
  console.log(COLORS.blue + '║   Teste de Integração RabbitMQ        ║' + COLORS.reset);
  console.log(COLORS.blue + '╚════════════════════════════════════════╝' + COLORS.reset);
  
  let result = false;
  
  switch (option) {
    case 'connection':
      result = await testConnection();
      break;
    case 'queue':
      result = await testQueue();
      break;
    case 'publish':
      result = await testPublish();
      break;
    case 'consume':
      result = await testConsume();
      break;
    case 'full':
      result = await testFullFlow();
      break;
    case 'flow':
      result = await testGameFlow();
      break;
    default:
      console.log('Opção inválida:', option);
      console.log('\nOpções disponíveis:');
      console.log('  connection - Testar conexão');
      console.log('  queue      - Testar criação de fila');
      console.log('  publish    - Testar publicação');
      console.log('  consume    - Testar consumo');
      console.log('  full       - Executar tudo');
      console.log('  flow       - Simular fluxo de partida');
      process.exit(1);
  }
  
  process.exit(result ? 0 : 1);
}

main().catch(err => {
  error('Erro fatal:', err.message);
  process.exit(1);
});
