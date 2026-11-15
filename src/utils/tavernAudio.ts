// Procedural Web Audio Synthesizer for Hearthlight Tavern SFX
// Zero external asset dependencies: fully synthesized in real-time

import { useAppStore } from '../store/useAppStore';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function getSfxVolume(): number {
  try {
    const settings = useAppStore.getState().settings;
    const master = (settings.masterVolume ?? 80) / 100;
    const sfx = (settings.sfxVolume ?? 90) / 100;
    return Math.max(0, Math.min(1, master * sfx));
  } catch {
    return 0.5;
  }
}

/**
 * Plays an authentic tactile ratchet tick as each facet of the drum rotates past the pointer.
 * @param pitchFactor Optional frequency multiplier (0.8 - 1.4)
 */
export function playRatchetTick(pitchFactor = 1.0): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const vol = getSfxVolume();
    if (vol <= 0.001) return;

    const now = ctx.currentTime;

    // 1. Mechanical 'click' click transient using filtered noise buffer
    const bufferSize = Math.floor(ctx.sampleRate * 0.025); // 25ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Decaying white noise
      const decay = 1 - i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * decay * decay;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Highpass filter for the metallic snap
    const hpFilter = ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.setValueAtTime(1400 * pitchFactor, now);

    // Bandpass resonance filter for the wooden/brass gear body
    const bpFilter = ctx.createBiquadFilter();
    bpFilter.type = 'bandpass';
    bpFilter.frequency.setValueAtTime(850 * pitchFactor, now);
    bpFilter.Q.setValueAtTime(4.0, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.28 * vol, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);

    noise.connect(hpFilter);
    hpFilter.connect(bpFilter);
    bpFilter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 2. Subtle low-mid 'thump' for the solid wooden chassis resonance
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260 * pitchFactor, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);

    oscGain.gain.setValueAtTime(0.18 * vol, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noise.start(now);
    osc.start(now);
    osc.stop(now + 0.035);
  } catch {
    // Gracefully ignore audio errors in unsupported/headless environments
  }
}

/**
 * Plays a triumphant, resonant gold lock-in chime when "Worthy Opponent" is selected.
 */
export function playOpponentLockedChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const vol = getSfxVolume();
    if (vol <= 0.001) return;

    const now = ctx.currentTime;

    // 1. Heavy resonant iron lock latch (thud)
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(180, now);
    thudOsc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    thudGain.gain.setValueAtTime(0.55 * vol, now);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);
    thudOsc.start(now);
    thudOsc.stop(now + 0.16);

    // 2. Celebratory brass tavern bell chord: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const chordFrequencies = [523.25, 659.25, 783.99, 1046.5];
    const detunes = [-4, 3, -2, 5];

    chordFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detunes[idx], now);

      // Warm shimmering harmonic envelope
      const noteDelay = idx * 0.025; // staggered arpeggio
      const noteStart = now + noteDelay;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.setValueAtTime(0.24 * vol, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 1.45);
    });

    // 3. Shimmering high sparkle bell (FM synthesis)
    const shimmerCarrier = ctx.createOscillator();
    const shimmerMod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const shimmerGain = ctx.createGain();

    shimmerCarrier.type = 'sine';
    shimmerCarrier.frequency.setValueAtTime(2093, now + 0.05); // C7

    shimmerMod.type = 'sine';
    shimmerMod.frequency.setValueAtTime(12, now + 0.05); // vibrato
    modGain.gain.setValueAtTime(14, now + 0.05);

    shimmerMod.connect(modGain);
    modGain.connect(shimmerCarrier.frequency);

    shimmerGain.gain.setValueAtTime(0.0001, now);
    shimmerGain.gain.setValueAtTime(0.18 * vol, now + 0.06);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    shimmerCarrier.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);

    shimmerMod.start(now + 0.05);
    shimmerCarrier.start(now + 0.05);
    shimmerMod.stop(now + 1.25);
    shimmerCarrier.stop(now + 1.25);
  } catch {
    // Gracefully ignore audio errors
  }
}
