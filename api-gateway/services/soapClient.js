const soap = require("soap");

const SOAP_URL = "http://localhost:8080/jokenpo?wsdl";

async function jogarSOAP(jogada) {
  const client = await soap.createClientAsync(SOAP_URL);
  // supondo que a operação se chame "jogar"
  const [result] = await client.jogarAsync({ jogada });
  return result;
}

module.exports = { jogarSOAP };
