const soap = require('soap');
const SOAP_URL = "http://localhost:5000/jokenpo?wsdl"; // URL do seu serviço SOAP

/*A resposta do client.MethodAsync() é um array onde o primeiro elemento é o resultado.*/
const extractResult = (result) => {
  if (Array.isArray(result) && result.length > 0) {

    if (result[0] && typeof result[0].return !== 'undefined') {
      return result[0].return;
    }
    return result[0];
  }
  return result;
};

const criarSala = async (jogador1) => {
  const client = await soap.createClientAsync(SOAP_URL);
  const response = await client.criarSalaAsync({ arg0: jogador1 });
  return extractResult(response);
};

const entrarSala = async (idSala, jogador2) => {
  const client = await soap.createClientAsync(SOAP_URL);
  const response = await client.entrarSalaAsync({ arg0: idSala, arg1: jogador2 });
  return extractResult(response);
};

const registrarJogada = async (idSala, jogador, jogada) => {
  const client = await soap.createClientAsync(SOAP_URL);
  const response = await client.registrarJogadaAsync({ arg0: idSala, arg1: jogador, arg2: jogada });
  return extractResult(response);
};

const verResultado = async (idSala) => {
  const client = await soap.createClientAsync(SOAP_URL);
  const response = await client.verResultadoAsync({ arg0: idSala });
  return extractResult(response);
};

const listarSalasAbertas = async () => {
  try {
    console.log('Tentando conectar ao SOAP em:', SOAP_URL);
    const client = await soap.createClientAsync(SOAP_URL);
    console.log('Cliente SOAP criado. Chamando listarSalasAbertasAsync...');
    
    // Chama o método com um objeto vazio
    const response = await client.listarSalasAbertasAsync({});
    const jsonString = extractResult(response);
    console.log('Resposta SOAP bruta:', jsonString);
    return JSON.parse(jsonString).salas || [];
  } catch (err) {
    console.error("Erro ao listar salas abertas - Detalhes:", err.message);
    return [];
  }
};

module.exports = { criarSala, entrarSala, registrarJogada, verResultado, listarSalasAbertas };
