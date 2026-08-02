import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('pairly_token');
    const serverUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '') ||
      (window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : window.location.origin);
    socket = io(serverUrl, {
      auth: { token },
      autoConnect: false,
      transports: ['polling', 'websocket'],
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  const token = localStorage.getItem('pairly_token');
  if (s && !s.connected && token) {
    s.auth = { token };
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};
