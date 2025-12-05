let ws: WebSocket | null = null;

// Função para conectar automaticamente usando o IP/hostname do front-end
export const conectarWS = () => {
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    const host = window.location.hostname; 

    ws = new WebSocket(`ws://${host}:3000`);

    ws.onopen = () => {
      console.log("WebSocket conectado ao servidor:", `ws://${host}:3000`);
    };

    ws.onerror = (err) => {
      console.error("Erro no WebSocket:", err);
    };

    ws.onclose = () => {
      console.warn("WebSocket foi fechado");
    };
  }

  return ws;
};

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
    console.warn("Não foi possível enviar mensagem: WS não está conectado.");
  }
};

export const ouvirMensagensWS = (callback: (dados: any) => void) => {
  if (!ws) return;

  const listener = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      callback(data);
    } catch (e) {
      console.error("Erro ao interpretar mensagem WS:", e);
    }
  };

  ws.addEventListener("message", listener);

  // retorna a função para remover se quiser
  return () => ws?.removeEventListener("message", listener);
};

export const removerOuvidorWS = (callback: any) => {
  if (ws) ws.removeEventListener("message", callback);
};
