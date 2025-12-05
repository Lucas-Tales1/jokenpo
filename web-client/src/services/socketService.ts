let ws: WebSocket | null = null;
let ouvintes: ((dados: any) => void)[] = [];

// Conectar ao servidor WebSocket usando host e porta automáticos
export function conectarWS() {
  if (ws && ws.readyState === WebSocket.OPEN) return ws;

  // Pega host e porta de onde a página foi carregada
  const host = window.location.hostname;
  const port = window.location.port; // pega a porta atual do frontend
  const protocolo = window.location.protocol === "https:" ? "wss" : "ws";

  ws = new WebSocket(`${protocolo}://${host}:${port}`);

  ws.onmessage = (event) => {
    try {
      const dados = JSON.parse(event.data);
      ouvintes.forEach((cb) => cb(dados));
    } catch (e) {
      console.error("Erro ao processar mensagem WS:", e);
    }
  };

  ws.onopen = () => console.log("WS conectado ao servidor:", `${protocolo}://${host}:${port}`);
  ws.onclose = () => console.log("WS desconectado");
  ws.onerror = (err) => console.error("Erro no WS:", err);

  return ws;
}

// Enviar mensagem
export function enviarMensagemWS(room: string, nomeJogador: string, mensagem: string) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn("WS não conectado, não é possível enviar");
    return;
  }

  const payload = {
    tipo: "enviar_mensagem",
    room,
    nomeJogador,
    mensagem,
    timestamp: new Date().toISOString(),
  };

  ws.send(JSON.stringify(payload));
}

// Registrar ouvinte
export function ouvirMensagensWS(callback: (dados: any) => void) {
  ouvintes.push(callback);
}

// Remover ouvinte
export function removerOuvidorWS(callback: (dados: any) => void) {
  ouvintes = ouvintes.filter((cb) => cb !== callback);
}
