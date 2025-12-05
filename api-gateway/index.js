let ws: WebSocket | null = null;

// Conecta ao servidor WS usando o hostname e porta atual
export const conectarWS = () => {
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    const host = window.location.hostname;
    const port = window.location.port || "3000";

    ws = new WebSocket(`ws://${host}:${port}`);

    ws.onopen = () => {
      console.log("WebSocket conectado:", `ws://${host}:${port}`);
    };

    ws.onerror = (err) => {
      console.error("Erro no WebSocket:", err);
    };

    ws.onclose = () => {
      console.warn("WebSocket fechado");
    };
  }
  return ws;
};

// Envia uma mensagem para a sala
export const enviarMensagemWS = (
  sala: string,
  nomeJogador: string,
  mensagem: string
) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        tipo: "enviar_mensagem",
        sala,
        nomeJogador,
        mensagem,
        timestamp: new Date().toISOString(),
      })
    );
  } else {
    console.warn("WS não está conectado, mensagem não enviada");
  }
};

// Ouve mensagens WS e retorna função para remover listener
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

  // Retorna função de remoção
  return () => ws?.removeEventListener("message", listener);
};

// Remove listener explicitamente
export const removerOuvidorWS = (callback: any) => {
  if (ws) ws.removeEventListener("message", callback);
};
