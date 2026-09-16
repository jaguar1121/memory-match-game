let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

function beep(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.15,
) {
  const ctx = getContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  oscillator.stop(ctx.currentTime + duration);
}

export function playFlipSound() {
  beep(420, 0.12, "triangle", 0.1);
}

export function playMatchSound() {
  beep(660, 0.1, "sine", 0.15);
  setTimeout(() => beep(880, 0.15, "sine", 0.15), 100);
}

export function playMismatchSound() {
  beep(200, 0.2, "sawtooth", 0.08);
}

export function playWinSound() {
  [523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => beep(freq, 0.2, "sine", 0.15), i * 150);
  });
}
