let ws: WebSocket | null = null;

export const conectarWS = () => {
  if (!ws || ws.readyState === WebSocket.CLOSED) {

    // pega automaticamente o endereço da API Gateway
    const gatewayWS = window.location.origin.replace("http", "ws");

    ws = new WebSocket(gatewayWS);

    ws.onopen = () => {
      console.log("WebSocket conectado a:", gatewayWS);
    };

    ws.onerror = (e) => {
      console.error("Erro no WebSocket:", e);
    };

    ws.onclose = () => {
      console.log("WebSocket desconectado");
    };
  }

  return ws;
};
