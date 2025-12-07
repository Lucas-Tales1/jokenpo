// Native WebSocket client (no libs)
export type WsMessage = { type: 'ENTRAR' | 'MSG'; idSala: string; nome?: string; texto?: string };

export class WsClient {
  private ws?: WebSocket;
  private url: string;
  private onMessageCb?: (data: any) => void;
  private onOpenCb?: () => void;
  private onCloseCb?: () => void;
  private pingInterval?: number;
  private connected = false;

  constructor(url = 'ws://localhost:3000') {
    this.url = url;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      this.connected = true;
      // keepalive ping each 25s
      this.pingInterval = window.setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          // send empty text ping alternative (server handles ping opcodes too)
          // Using minimal text to avoid masking complexities here
          // Real ping frames are handled by browser automatically.
        }
      }, 25000);
      this.onOpenCb && this.onOpenCb();
    };
    this.ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        this.onMessageCb && this.onMessageCb(data);
      } catch {
        // ignore non-JSON frames
      }
    };
    this.ws.onclose = () => {
      this.connected = false;
      if (this.pingInterval) window.clearInterval(this.pingInterval);
      this.onCloseCb && this.onCloseCb();
    };
  }

  onMessage(cb: (data: any) => void) { this.onMessageCb = cb; }
  onOpen(cb: () => void) { this.onOpenCb = cb; }
  onClose(cb: () => void) { this.onCloseCb = cb; }

  entrar(idSala: string, nome: string) {
    this.send({ type: 'ENTRAR', idSala, nome });
  }

  enviarMensagem(idSala: string, nome: string, texto: string) {
    this.send({ type: 'MSG', idSala, nome, texto });
  }

  private send(msg: WsMessage) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(msg));
  }

  close() { this.ws?.close(); }

  isConnected() { return this.connected; }

  joinGlobal(nome: string) {
    this.send({ type: 'ENTRAR', idSala: '', nome });
  }

  sendGlobal(nome: string, texto: string) {
    this.send({ type: 'MSG_GLOBAL', idSala: '', nome, texto });
  }
}
