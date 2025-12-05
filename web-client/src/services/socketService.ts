let ws: WebSocket | null = null;

export const conectarWS = () => {
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    const host = window.location.hostname;
    const port = 3000; // porta do servidor Node
    ws = new WebSocket(`ws://${host}:${port}`);

    ws.onopen = () => console.log("WS conectado:", `ws://${host}:${port}`);
    ws.onerror = (err) => console.error("Erro WS:", err);
    ws.onclose = () => console.warn("WS fechado");
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
      timestamp: new Date().toISOString(),
    }));
  } else {
    console.warn("WS não está conectado, mensagem não enviada");
  }
};

export const ouvirMensagensWS = (callback: (dados: any) => void) => {
  if (!ws) return () => {};
  const listener = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      callback(data);
    } catch (e) {
      console.error("Erro ao interpretar mensagem WS:", e);
    }
  };
  ws.addEventListener("message", listener);
  return () => ws.removeEventListener("message", listener);
};
