const soap = require('soap');
const SOAP_URL = "http://localhost:5000/jokenpo?wsdl"; // URL do seu serviço SOAP

const criarSala = async (jogador1) => {
  const client = await soap.createClientAsync(SOAP_URL);
  const [res] = await client.criarSalaAsync({ jogador1 });
  return res;
};

const entrarSala = async (idSala, jogador2) => {
  const client = await soap.createClientAsync(SOAP_URL);
  const [res] = await client.entrarSalaAsync({ idSala, jogador2 });
  return res;
};

const registrarJogada = async (idSala, jogador, jogada) => {
  const client = await soap.createClientAsync(SOAP_URL);
  const [res] = await client.registrarJogadaAsync({ idSala, jogador, jogada });
  return res;
};

const verResultado = async (idSala) => {
  const client = await soap.createClientAsync(SOAP_URL);
  const [res] = await client.verResultadoAsync({ idSala });
  return res;
};

module.exports = { criarSala, entrarSala, registrarJogada, verResultado };
