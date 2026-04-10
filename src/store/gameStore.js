/**
 * @file gameStore.js
 * @description Zustand global store for BOMB CHAOS client state.
 */
import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
    // ── Connection ────────────────────────────────────────────────────────────
    connected: false,
    setConnected: (v) => set({ connected: v }),

    // ── Player identity ───────────────────────────────────────────────────────
    nickname: '',
    mySocketId: null,
    setNickname: (nickname) => set({ nickname }),
    setMySocketId: (id) => set({ mySocketId: id }),

    // ── Room / Lobby ──────────────────────────────────────────────────────────
    roomCode: null,
    roomState: null,     // serializeLobby() shape from server
    setRoomCode: (code) => set({ roomCode: code }),
    setRoomState: (state) => set({ roomState: state }),

    // ── Game ──────────────────────────────────────────────────────────────────
    mapSeed: null,
    gameStartPlayers: [],   // ordered player meta from game_start
    gameState: null,         // latest game_state_update snapshot
    setMapSeed: (seed) => set({ mapSeed: seed }),
    setGameStartPlayers: (players) => set({ gameStartPlayers: players }),
    setGameState: (state) => set({ gameState: state }),

    // ── Results ───────────────────────────────────────────────────────────────
    gameOverData: null,     // { winnerId, scoreboard }
    setGameOverData: (data) => set({ gameOverData: data }),

    // ── Event Feed ────────────────────────────────────────────────────────────
    eventFeed: [],   // [{ id, text, color, ts }]
    addEvent: (text, color = '#f97316') => {
        const id = Date.now() + Math.random();
        set(s => ({ eventFeed: [{ id, text, color, ts: Date.now() }, ...s.eventFeed].slice(0, 8) }));
        // Auto-expire after 4s
        setTimeout(() => {
            set(s => ({ eventFeed: s.eventFeed.filter(e => e.id !== id) }));
        }, 4000);
    },

    // ── Power-up notifications ────────────────────────────────────────────────
    powerupNotifications: [],
    addPowerupNotification: (type) => {
        const id = Date.now() + Math.random();
        set(s => ({ powerupNotifications: [...s.powerupNotifications, { id, type }] }));
        setTimeout(() => {
            set(s => ({ powerupNotifications: s.powerupNotifications.filter(n => n.id !== id) }));
        }, 3000);
    },

    // ── Music mute ────────────────────────────────────────────────────────────
    // Persisted in localStorage so it survives page refresh.
    isMusicMuted: localStorage.getItem('music_muted') === 'true',
    toggleMusicMuted: () =>
        set(s => {
            const next = !s.isMusicMuted;
            localStorage.setItem('music_muted', String(next));
            // Notify Phaser's MainScene (no React dependency in Phaser)
            window.dispatchEvent(new CustomEvent('music_muted_change', { detail: next }));
            return { isMusicMuted: next };
        }),

    // ── Navigation ────────────────────────────────────────────────────────────
    screen: 'login',   // 'login' | 'register' | 'landing' | 'lobby' | 'game' | 'results'
    setScreen: (screen) => set({ screen }),

    // ── Reset ─────────────────────────────────────────────────────────────────
    resetGame: () => set({
        mapSeed: null,
        gameStartPlayers: [],
        gameState: null,
        gameOverData: null,
        eventFeed: [],
        powerupNotifications: [],
        screen: 'lobby',
    }),
    resetAll: () => set({
        roomCode: null,
        roomState: null,
        mapSeed: null,
        gameStartPlayers: [],
        gameState: null,
        gameOverData: null,
        eventFeed: [],
        powerupNotifications: [],
        screen: 'landing',
    }),
}));
