let ws: WebSocket | null = null;

export const conectarWS = () => {
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    ws = new WebSocket("ws://localhost:3000");
  }
  return ws;
};

export const enviarMensagemWS = (sala: string, nomeJogador: string, mensagem: string) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      tipo: "enviar_mensagem",
      sala,
      nomeJogador,
      mensagem,
      timestamp: new Date().toISOString()
    }));
  }
};

export const ouvirMensagensWS = (callback: (dados: any) => void) => {
  if (!ws) return;

  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    callback(data);
  });
};

export const removerOuvidorWS = (callback: any) => {
  if (ws) ws.removeEventListener("message", callback);
};
