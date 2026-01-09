/**
 * SoundManager - Subtle audio feedback for chat interactions
 * 
 * Uses Web Audio API for lightweight, instantaneous sounds
 */

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3;
    }

    init() {
        if (this.audioContext) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    // Play a subtle "send" sound
    playSend() {
        if (!this.enabled) return;
        this.init();
        this.playTone(880, 0.05, 'sine'); // Quick high beep
    }

    // Play a subtle "receive" sound
    playReceive() {
        if (!this.enabled) return;
        this.init();
        this.playTone(660, 0.08, 'sine'); // Slightly longer, lower
    }

    // Play a notification chime
    playNotification() {
        if (!this.enabled) return;
        this.init();
        // Two-tone chime
        this.playTone(523, 0.1, 'sine');
        setTimeout(() => this.playTone(659, 0.1, 'sine'), 100);
    }

    // Play error sound
    playError() {
        if (!this.enabled) return;
        this.init();
        this.playTone(220, 0.15, 'sawtooth');
    }

    // Internal: Generate and play a tone
    playTone(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Toggle sounds on/off
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
}

// Singleton instance
const soundManager = new SoundManager();

export default soundManager;
