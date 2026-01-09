/**
 * Sound Manager - Web Audio API based sound effects
 * 
 * Provides simple, browser-native sounds for:
 * - Timer start/stop
 * - Session complete (success)
 * - Session failed
 * - Tick sounds (optional)
 * - Notification alert
 */

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.5;
    }

    // Initialize Audio Context (must be called on user interaction)
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    // Resume context if suspended (due to browser autoplay policy)
    async resume() {
        if (this.audioContext?.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // Set volume (0-1)
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    // Enable/disable sounds
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    // Create an oscillator-based beep
    _beep(frequency = 440, duration = 0.15, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Play a sequence of notes
    _playSequence(notes, baseTime = 0.15) {
        if (!this.enabled) return;
        this.init();
        this.resume();

        notes.forEach(([freq, duration, delay], index) => {
            setTimeout(() => {
                this._beep(freq, duration || baseTime);
            }, (delay || index * baseTime * 1000));
        });
    }

    // === PUBLIC SOUND METHODS ===

    // Timer Start - Ascending beep
    playStart() {
        this._playSequence([
            [440, 0.1, 0],
            [523, 0.1, 100],
            [659, 0.15, 200],
        ]);
    }

    // Timer Pause - Single soft beep
    playPause() {
        this.init();
        this.resume();
        this._beep(350, 0.2, 'sine');
    }

    // Timer Resume - Quick double beep
    playResume() {
        this._playSequence([
            [520, 0.08, 0],
            [520, 0.08, 120],
        ]);
    }

    // Session Complete - Happy chime (ascending major chord)
    playComplete() {
        this._playSequence([
            [523, 0.15, 0],     // C
            [659, 0.15, 150],   // E
            [784, 0.15, 300],   // G
            [1047, 0.3, 450],   // High C
        ]);
    }

    // Session Failed - Descending minor
    playFailed() {
        this._playSequence([
            [440, 0.15, 0],
            [392, 0.15, 150],
            [349, 0.2, 300],
        ]);
    }

    // Timer Reset - Quick descent
    playReset() {
        this._playSequence([
            [600, 0.08, 0],
            [500, 0.08, 80],
            [400, 0.1, 160],
        ]);
    }

    // Notification/Alert - Attention grabbing
    playNotification() {
        this._playSequence([
            [880, 0.1, 0],
            [880, 0.1, 150],
            [1109, 0.2, 300],
        ]);
    }

    // Tick sound (for optional countdown ticks)
    playTick() {
        this.init();
        this.resume();
        this._beep(1200, 0.03, 'square');
    }

    // Warning - Last minute warning
    playWarning() {
        this._playSequence([
            [600, 0.15, 0],
            [600, 0.15, 200],
        ]);
    }
}

// Singleton instance
const soundManager = new SoundManager();

export default soundManager;

// React hook for easy integration
import { useCallback, useEffect } from 'react';

export const useSoundManager = () => {
    // Initialize on mount
    useEffect(() => {
        const initOnInteraction = () => {
            soundManager.init();
            document.removeEventListener('click', initOnInteraction);
            document.removeEventListener('keydown', initOnInteraction);
        };

        document.addEventListener('click', initOnInteraction);
        document.addEventListener('keydown', initOnInteraction);

        return () => {
            document.removeEventListener('click', initOnInteraction);
            document.removeEventListener('keydown', initOnInteraction);
        };
    }, []);

    const playStart = useCallback(() => soundManager.playStart(), []);
    const playPause = useCallback(() => soundManager.playPause(), []);
    const playResume = useCallback(() => soundManager.playResume(), []);
    const playComplete = useCallback(() => soundManager.playComplete(), []);
    const playFailed = useCallback(() => soundManager.playFailed(), []);
    const playReset = useCallback(() => soundManager.playReset(), []);
    const playNotification = useCallback(() => soundManager.playNotification(), []);
    const playTick = useCallback(() => soundManager.playTick(), []);
    const playWarning = useCallback(() => soundManager.playWarning(), []);
    const setVolume = useCallback((vol) => soundManager.setVolume(vol), []);
    const setEnabled = useCallback((enabled) => soundManager.setEnabled(enabled), []);

    return {
        playStart,
        playPause,
        playResume,
        playComplete,
        playFailed,
        playReset,
        playNotification,
        playTick,
        playWarning,
        setVolume,
        setEnabled,
    };
};
