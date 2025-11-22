const express = require('express');
const cors = require('cors');
const app = express();

// Habilita CORS
app.use(cors());

const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: false
}));

app.listen(3000, () => {
  console.log('API Gateway rodando em http://localhost:3000');
});
