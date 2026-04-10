/**
 * @file audioManager.js
 * @description Lightweight singleton for managing lobby background music
 *              OUTSIDE of Phaser (e.g. on the LobbyScreen React component).
 *              Uses the native HTMLAudioElement so it works without Phaser running.
 *
 *              Game music (game_bg) is handled entirely inside MainScene via
 *              Phaser's sound system.
 */

let lobbyAudio = null;
let _wantLobbyMusic = false; // desired state: should lobby music be playing?

// Initialise muted state from localStorage so it's consistent with gameStore on boot.
let _muted = localStorage.getItem('music_muted') === 'true';

/**
 * One-time handler attached to the document on the first startLobbyMusic()
 * call. Browsers block autoplay until a user gesture; this listener fires on
 * the first click/keydown and retries playing the music automatically.
 */
function _onFirstInteraction() {
    document.removeEventListener('click', _onFirstInteraction, true);
    document.removeEventListener('keydown', _onFirstInteraction, true);
    if (_wantLobbyMusic && !_muted) {
        audioManager.startLobbyMusic();
    }
}

export const audioManager = {
    /**
     * Start the lobby background music. Safe to call multiple times —
     * will not create a new instance if one is already playing.
     * If autoplay is blocked, registers a one-time listener to retry on
     * the first user interaction.
     */
    startLobbyMusic() {
        _wantLobbyMusic = true;

        // Don't start if music is muted
        if (_muted) return;

        if (lobbyAudio) return; // already playing

        // Register the first-interaction retry listener (idempotent —
        // adding the same function reference twice is a no-op for addEventListener).
        document.addEventListener('click', _onFirstInteraction, true);
        document.addEventListener('keydown', _onFirstInteraction, true);

        try {
            lobbyAudio = new Audio('/assets/sounds/lobby_bg.wav');
            lobbyAudio.loop = true;
            lobbyAudio.volume = 0.3;
            lobbyAudio.play().catch(() => {
                // Autoplay blocked — clear so the _onFirstInteraction handler
                // can create a fresh instance and retry after user interaction.
                lobbyAudio = null;
            });
        } catch {
            lobbyAudio = null;
        }
    },

    /** Stop and destroy the lobby music instance. */
    stopLobbyMusic() {
        _wantLobbyMusic = false;
        // Remove the pending retry listener too
        document.removeEventListener('click', _onFirstInteraction, true);
        document.removeEventListener('keydown', _onFirstInteraction, true);

        if (!lobbyAudio) return;
        lobbyAudio.pause();
        lobbyAudio.src = '';
        lobbyAudio = null;
    },

    /**
     * Set the muted state for lobby music.
     * Called by App.jsx whenever isMusicMuted changes in the Zustand store.
     * @param {boolean} muted
     */
    setMuted(muted) {
        _muted = muted;
        if (muted) {
            // Pause (not destroy) so we can resume seamlessly
            if (lobbyAudio) {
                lobbyAudio.pause();
            }
        } else {
            // Resume existing instance or create a new one
            if (lobbyAudio) {
                lobbyAudio.play().catch(() => { lobbyAudio = null; });
            } else if (_wantLobbyMusic) {
                audioManager.startLobbyMusic();
            }
        }
    },

    isMuted() {
        return _muted;
    },
};
