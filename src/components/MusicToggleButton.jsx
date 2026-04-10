/**
 * @file MusicToggleButton.jsx
 * @description Reusable toggle button that mutes/unmutes background music only.
 *              Sound effects are never affected.
 */
import React from 'react';
import { useGameStore } from '../store/gameStore.js';

/**
 * @param {{ className?: string }} props
 */
export default function MusicToggleButton({ className = '' }) {
    const { isMusicMuted, toggleMusicMuted } = useGameStore();

    return (
        <button
            id="music-toggle-btn"
            onClick={toggleMusicMuted}
            title={isMusicMuted ? 'Unmute background music' : 'Mute background music'}
            className={`glass rounded-lg px-3 py-2 text-lg transition-all duration-150
                        hover:scale-110 active:scale-95 select-none ${className}`}
        >
            {isMusicMuted ? '🔇' : '🔊'}
        </button>
    );
}
