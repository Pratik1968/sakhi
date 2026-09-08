import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './config';

let socket: Socket | null = null;

/** Connect (or reconnect) the shared Socket.IO client with the given JWT. */
export function connectSocket(token: string): Socket {
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }
  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
