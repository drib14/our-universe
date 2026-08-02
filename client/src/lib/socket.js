import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const isVercelServerless = apiUrl.includes('.vercel.app') || window.location.hostname.includes('.vercel.app');

  // Vercel serverless functions do not support WebSockets. Bypass if no dedicated socket server URL is specified.
  if (!socketUrl && isVercelServerless) {
    return null;
  }

  if (!socket) {
    const token = localStorage.getItem('pairly_token');
    const serverUrl =
      socketUrl ||
      apiUrl.replace(/\/api\/?$/, '') ||
      (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);

    try {
      socket = io(serverUrl, {
        auth: { token },
        autoConnect: false,
        transports: ['websocket'],
        reconnection: false,
        timeout: 3000,
      });

      socket.on('connect_error', () => {
        // Quietly suppress socket connection errors on serverless hosts
      });
    } catch (e) {
      socket = null;
    }
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s) return null;
  const token = localStorage.getItem('pairly_token');
  if (s && !s.connected && token) {
    s.auth = { token };
    try {
      s.connect();
    } catch (e) {}
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    try {
      socket.disconnect();
    } catch (e) {}
  }
};
