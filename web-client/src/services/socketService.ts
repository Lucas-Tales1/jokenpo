import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const getSocketUrl = () => {
  const host = window.location.hostname;
  return `http://${host}:3000`;
};

export const conectarSocket = (): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(getSocketUrl(), {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Conectado ao servidor WebSocket');
  });

  socket.on('disconnect', () => {
    console.log('Desconectado do servidor WebSocket');
  });

  return socket;
};

export const desconectarSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const obterSocket = (): Socket | null => {
  return socket;
};

export const entrarSala = (sala: string) => {
  if (socket?.connected) {
    socket.emit('joinRoom', sala);
  }
};

export const sairSala = (sala: string) => {
  if (socket?.connected) {
    socket.emit('leaveRoom', sala);
  }
};

export const enviarMensagem = (sala: string, nomeJogador: string, mensagem: string) => {
  if (socket?.connected) {
    socket.emit('enviar_mensagem', {
      sala,
      nomeJogador,
      mensagem,
      timestamp: new Date().toISOString(),
    });
  }
};

export const ouvirMensagens = (callback: (dados: any) => void) => {
  if (socket) {
    socket.on('receber_mensagem', callback);
  }
};

export const removerOuvidor = (evento: string) => {
  if (socket) {
    socket.off(evento);
  }
};
