const express = require("express");
const cors = require("cors");

const { getHistorico, postJogada } = require("./services/restClient");
const { jogarSOAP } = require("./services/soapClient");

const app = express();
app.use(cors());
app.use(express.json());

// Endpoints REST
app.get("/rest/historico", async (req, res) => {
  try {
    const data = await getHistorico();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/rest/jogar", async (req, res) => {
  try {
    const data = await postJogada(req.body.jogada);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoints SOAP
app.post("/soap/jogar", async (req, res) => {
  try {
    const data = await jogarSOAP(req.body.jogada);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("API Gateway rodando na porta 3000");
});
