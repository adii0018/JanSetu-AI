/**
 * sounds.ts — Web Audio API based UI sounds
 * No external files needed. All sounds generated programmatically.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

/** Generic tone player */
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.18,
  fadeOut = true,
) {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime);

    gain.gain.setValueAtTime(gainPeak, ac.currentTime);
    if (fadeOut) {
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
    }

    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch {
    // silently fail if AudioContext not available
  }
}

/** Short click — for buttons, nav links, toggles */
export function playClick() {
  playTone(420, 0.06, 'sine', 0.14);
}

/** Soft tick — for small interactions (upvote, tab switch) */
export function playTick() {
  playTone(600, 0.04, 'sine', 0.09);
}

/** Success chime — 2-note up */
export function playSuccess() {
  playTone(520, 0.12, 'sine', 0.13);
  setTimeout(() => playTone(780, 0.18, 'sine', 0.11), 110);
}

/** Error buzz */
export function playError() {
  playTone(200, 0.15, 'sawtooth', 0.08);
}

/** Submit whoosh — for form submission */
export function playSubmit() {
  try {
    const ac = getCtx();
    const bufferSize = ac.sampleRate * 0.08;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.12;
    }
    const src = ac.createBufferSource();
    src.buffer = buffer;

    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 0.8;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.5, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.08);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    src.start();
  } catch {
    // silently fail
  }
}

/** Nav click — slightly deeper */
export function playNav() {
  playTone(340, 0.07, 'sine', 0.12);
}
