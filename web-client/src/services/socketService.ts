let ws: WebSocket | null = null;
let ouvintes: ((dados: any) => void)[] = [];

export const conectarWS = () => {
  if (ws && ws.readyState === WebSocket.OPEN) return ws;

  const host = window.location.hostname;
  const port = 3000; // porta do backend
  const protocolo = window.location.protocol === "https:" ? "wss" : "ws";

  ws = new WebSocket(`${protocolo}://${host}:${port}`);

  ws.onmessage = (event) => {
    try {
      const dados = JSON.parse(event.data);
      ouvintes.forEach((cb) => cb(dados)); // dispara todos os ouvintes
    } catch (e) {
      console.error("Erro ao processar mensagem WS:", e);
    }
  };

  ws.onopen = () => console.log("WS conectado:", `${protocolo}://${host}:${port}`);
  ws.onclose = () => console.log("WS desconectado");
  ws.onerror = (err) => console.error("Erro no WS:", err);

  return ws;
};

export const enviarMensagemWS = (room: string, nomeJogador: string, mensagem: string) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn("WS não conectado");
    return;
  }

  ws.send(JSON.stringify({
    tipo: "enviar_mensagem",
    room,
    nomeJogador,
    mensagem,
    timestamp: new Date().toISOString(),
  }));
};

export const ouvirMensagensWS = (callback: (dados: any) => void) => {
  ouvintes.push(callback);
  // retorna função para remover listener se necessário
  return () => removerOuvidorWS(callback);
};

export const removerOuvidorWS = (callback: (dados: any) => void) => {
  ouvintes = ouvintes.filter(cb => cb !== callback);
};
