// Áudio original sintetizado (WebAudio): efeitos e música ambiente — sem arquivos externos.
let ctx = null, master = null, musicGain = null, musicTimer = null, step = 0;
const opts = { sfx: true, music: true };

function ensure() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
    return true;
  } catch (e) { console.warn('[audio] indisponível', e); return false; }
}

function tone(freq, t0, dur, { type = 'sine', vol = 0.3, to = null, dest = master } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(dest);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

const SFX = {
  tap: (t) => tone(520, t, 0.06, { type: 'triangle', vol: 0.15 }),
  spawn: (t) => tone(380, t, 0.12, { type: 'triangle', vol: 0.2, to: 760 }),
  merge: (t, lvl = 1) => { const f = 440 * Math.pow(1.122, Math.min(lvl, 9)); tone(f, t, 0.12, { type: 'triangle' }); tone(f * 1.5, t + 0.07, 0.18, { type: 'sine', vol: 0.25 }); },
  coin: (t) => { tone(1318, t, 0.08, { type: 'square', vol: 0.1 }); tone(1760, t + 0.07, 0.16, { type: 'square', vol: 0.1 }); },
  deliver: (t) => [523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * 0.08, 0.2, { type: 'triangle', vol: 0.25 })),
  error: (t) => tone(180, t, 0.16, { type: 'sawtooth', vol: 0.12, to: 120 }),
  pop: (t) => tone(900, t, 0.1, { type: 'sine', vol: 0.25, to: 300 }),
  level: (t) => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, t + i * 0.1, 0.3, { type: 'triangle', vol: 0.28 })),
  build: (t) => { tone(160, t, 0.08, { type: 'square', vol: 0.15 }); tone(160, t + 0.15, 0.08, { type: 'square', vol: 0.15 }); tone(660, t + 0.3, 0.3, { type: 'triangle', vol: 0.25 }); },
  page: (t) => tone(640, t, 0.07, { type: 'sine', vol: 0.12, to: 820 }),
};

export function sfx(name, arg) {
  if (!opts.sfx || !ensure()) return;
  try { if (ctx.state === 'suspended') ctx.resume(); (SFX[name] || SFX.tap)(ctx.currentTime, arg); } catch (e) { /* áudio nunca deve quebrar o jogo */ }
}

// Música: progressão suave em pentatônica, tocada em laço.
const CHORDS = [[262, 330, 392], [220, 262, 330], [175, 220, 262], [196, 247, 294]];
const MELODY = [784, 0, 659, 587, 523, 0, 587, 659, 880, 0, 784, 659, 587, 523, 440, 0];
function musicStep() {
  if (!ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime + 0.05, bar = Math.floor(step / 4) % CHORDS.length;
  if (step % 4 === 0) for (const f of CHORDS[bar]) tone(f / 2, t, 1.5, { type: 'sine', vol: 0.5, dest: musicGain });
  tone(CHORDS[bar][step % 3], t, 0.35, { type: 'triangle', vol: 0.35, dest: musicGain });
  const m = MELODY[step % MELODY.length];
  if (m && Math.floor(step / 16) % 2 === 0) tone(m, t, 0.4, { type: 'sine', vol: 0.4, dest: musicGain });
  step++;
}
export function setAudio({ sfx: s, music: m }) {
  opts.sfx = !!s; opts.music = !!m;
  if (opts.music && !musicTimer && ensure()) musicTimer = setInterval(musicStep, 380);
  if (!opts.music && musicTimer) { clearInterval(musicTimer); musicTimer = null; }
}
/** Deve ser chamado no primeiro toque do jogador (política de autoplay dos navegadores). */
export function unlockAudio() {
  if (!ensure()) return;
  if (ctx.state === 'suspended') ctx.resume();
  setAudio(opts);
}
