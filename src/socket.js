/**
 * @file socket.js
 * @description Singleton Socket.io client. Connects lazily with a JWT token.
 *              Call connectSocket(token) after login to establish an authenticated connection.
 */
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Start disconnected — no token yet
export const socket = io(SERVER_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
});

/**
 * Connect (or reconnect) the socket with a JWT token.
 * @param {string} token
 */
export function connectSocket(token) {
    socket.auth = { token };
    if (socket.connected) {
        socket.disconnect();
    }
    socket.connect();
}

socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
socket.on('disconnect', (reason) => console.warn('[Socket] Disconnected:', reason));
socket.on('connect_error', (err) => console.error('[Socket] Error:', err.message));
