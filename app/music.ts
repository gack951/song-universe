export type Genre = "jazz" | "bigBand" | "funk" | "rock" | "pop" | "classical";

export type TrackPlan = {
  seed: string;
  title: string;
  genre: Genre;
  mood: string;
  key: string;
  bpm: number;
  durationSeconds: number;
  form: string[];
  chords: string[];
  instruments: {
    lead: number[];
    harmony: number[];
    bass: number;
    color: number[];
  };
};

export type NoteEvent = {
  beat: number;
  duration: number;
  pitch: number;
  velocity: number;
  instrument: number;
};

export type PlaybackState = "loading" | "playing" | "paused" | "buffering" | "error";
export type Song = { plan: TrackPlan; notes: NoteEvent[]; fingerprint: string; ai: boolean };

type GenreConfig = {
  label: string;
  bpm: [number, number];
  swing: number;
  moods: string[];
  instruments: { lead: number[]; harmony: number[]; bass: number[]; color: number[] };
  layers: { lead: number; harmony: number; color: number };
  progressions: number[][];
  bass: "walk" | "sync" | "eighth" | "pulse";
  drums: "swing" | "funk" | "rock" | "pop" | "none";
  voicing: "shell" | "stab" | "power" | "open";
  cadence: number[];
  form: string[];
  pack: "jazz-bigband" | "funk-rock-pop" | "classical";
};

export const GENRES: Record<Genre, GenreConfig> = {
  jazz: { label: "ジャズ", bpm: [88, 148], swing: .62, moods: ["夜更け", "軽やか", "スモーキー"], instruments: { lead: [65, 66, 56, 11], harmony: [0, 4, 16, 26], bass: [32, 33, 34], color: [11, 64, 56, 26] }, layers: { lead: 1, harmony: 1, color: 1 }, progressions: [[2, 5, 1, 6], [1, 6, 2, 5]], bass: "walk", drums: "swing", voicing: "shell", cadence: [2, 5, 1, 1], form: ["head", "solo", "head", "coda"], pack: "jazz-bigband" },
  bigBand: { label: "ビッグバンド", bpm: [104, 176], swing: .64, moods: ["華麗", "祝祭", "大胆"], instruments: { lead: [56, 65, 66], harmony: [57, 60, 67], bass: [32, 33], color: [0, 11, 26] }, layers: { lead: 2, harmony: 2, color: 1 }, progressions: [[1, 6, 2, 5], [3, 6, 2, 5]], bass: "walk", drums: "swing", voicing: "stab", cadence: [2, 5, 1, 1], form: ["intro", "head", "solos", "shout chorus", "coda"], pack: "jazz-bigband" },
  funk: { label: "ファンク", bpm: [92, 122], swing: .54, moods: ["粘る", "鮮烈", "地下室"], instruments: { lead: [4, 5, 80, 81], harmony: [27, 16, 4, 5], bass: [36, 37, 33, 34], color: [16, 11, 80, 81] }, layers: { lead: 1, harmony: 1, color: 1 }, progressions: [[1, 4, 1, 5], [1, 7, 4, 1]], bass: "sync", drums: "funk", voicing: "stab", cadence: [4, 5, 1, 1], form: ["A", "B", "break", "A", "outro"], pack: "funk-rock-pop" },
  rock: { label: "ロック", bpm: [104, 168], swing: .5, moods: ["疾走", "荒野", "昂揚"], instruments: { lead: [29, 30, 27, 28], harmony: [27, 29, 16, 0], bass: [33, 34, 32], color: [16, 80, 48] }, layers: { lead: 1, harmony: 1, color: 1 }, progressions: [[1, 5, 6, 4], [1, 4, 5, 1]], bass: "eighth", drums: "rock", voicing: "power", cadence: [4, 5, 1, 1], form: ["intro", "verse", "chorus", "verse", "bridge", "chorus", "outro"], pack: "funk-rock-pop" },
  pop: { label: "ポップ", bpm: [92, 132], swing: .5, moods: ["透明", "晴れ間", "切なさ"], instruments: { lead: [80, 81, 4, 73], harmony: [4, 0, 48, 88], bass: [33, 38, 39], color: [88, 89, 48, 52] }, layers: { lead: 1, harmony: 1, color: 1 }, progressions: [[1, 5, 6, 4], [6, 4, 1, 5]], bass: "pulse", drums: "pop", voicing: "open", cadence: [4, 5, 1, 1], form: ["intro", "verse", "prechorus", "chorus", "bridge", "final chorus"], pack: "funk-rock-pop" },
  classical: { label: "クラシック", bpm: [66, 126], swing: .5, moods: ["端正", "荘厳", "田園"], instruments: { lead: [40, 68, 71, 73], harmony: [41, 42, 48, 0], bass: [43, 42, 70], color: [46, 60, 68, 70, 6] }, layers: { lead: 2, harmony: 2, color: 1 }, progressions: [[1, 4, 5, 1], [1, 6, 2, 5]], bass: "pulse", drums: "none", voicing: "open", cadence: [2, 5, 1, 1], form: ["exposition", "development", "recapitulation", "coda"], pack: "classical" },
};

const KEYS = ["C", "D♭", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
const ROOTS = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const ADJECTIVES = ["Velvet", "Amber", "Quiet", "Electric", "Silver", "Midnight", "Open", "Blue"];
const NOUNS = ["Orbit", "Lantern", "Current", "Avenue", "Garden", "Signal", "Horizon", "Echo"];
export const RANGES: Record<number, [number, number]> = { 0: [36, 96], 4: [36, 96], 5: [36, 96], 6: [36, 96], 11: [53, 96], 16: [36, 96], 26: [40, 88], 27: [40, 88], 28: [40, 88], 29: [40, 88], 30: [40, 88], 32: [28, 67], 33: [28, 67], 34: [28, 67], 36: [28, 67], 37: [28, 67], 38: [28, 72], 39: [28, 72], 40: [55, 103], 41: [48, 88], 42: [36, 76], 43: [28, 67], 46: [24, 103], 47: [36, 72], 48: [36, 96], 52: [48, 84], 56: [54, 82], 57: [40, 72], 60: [34, 77], 64: [46, 92], 65: [49, 80], 66: [44, 79], 67: [37, 75], 68: [58, 91], 70: [34, 75], 71: [50, 94], 73: [60, 96], 80: [48, 96], 81: [36, 96], 88: [36, 96], 89: [36, 96], 128: [35, 81] };

function hash(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

function random(seed: string) {
  let n = hash(seed);
  return () => {
    n += 0x6d2b79f5;
    let t = n;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(rng: () => number, items: readonly T[]) => items[Math.floor(rng() * items.length)];

function chooseInstruments(rng: () => number, config: GenreConfig) {
  const used = new Set<number>();
  const take = (pool: number[], count: number) => {
    const available = pool.filter(instrument => !used.has(instrument));
    const selected: number[] = [];
    while (selected.length < count) {
      const source = available.length ? available : pool.filter(instrument => !selected.includes(instrument));
      const index = Math.floor(rng() * source.length);
      const instrument = source[index];
      selected.push(instrument); used.add(instrument);
      available.splice(available.indexOf(instrument), 1);
    }
    return selected;
  };
  return {
    lead: take(config.instruments.lead, config.layers.lead),
    harmony: take(config.instruments.harmony, config.layers.harmony),
    bass: take(config.instruments.bass, 1)[0],
    color: take(config.instruments.color, config.layers.color),
  };
}

function chordName(root: number, degree: number) {
  const semitones = [0, 2, 4, 5, 7, 9, 11];
  const qualities = ["maj7", "m7", "m7", "maj7", "7", "m7", "m7b5"];
  return ROOTS[(root + semitones[degree - 1]) % 12] + qualities[degree - 1];
}

export function createTrackPlan(seed: string, genre: Genre): TrackPlan {
  const rng = random(seed);
  const config = GENRES[genre];
  const bpm = Math.round(config.bpm[0] + rng() * (config.bpm[1] - config.bpm[0]));
  const target = 90 + Math.floor(rng() * 271);
  const bars = Math.min(Math.floor(360 * bpm / 240), Math.max(Math.ceil(90 * bpm / 240), Math.round(target * bpm / 240)));
  const durationSeconds = Math.round(bars * 240 / bpm);
  const root = Math.floor(rng() * 12);
  const degrees = pick(rng, config.progressions);
  const chords = Array.from({ length: bars }, (_, bar) => chordName(root, degrees[bar % degrees.length]));
  const instruments = chooseInstruments(rng, config);
  return {
    seed,
    title: `${pick(rng, ADJECTIVES)} ${pick(rng, NOUNS)}`,
    genre,
    mood: pick(rng, config.moods),
    key: KEYS[root],
    bpm,
    durationSeconds,
    form: config.form,
    chords,
    instruments,
  };
}

function rootOf(chord: string) {
  const name = chord.match(/^[A-G](?:b|#)?/)?.[0] ?? "C";
  return ROOTS.indexOf(name);
}

function chordPitches(chord: string, octave = 4) {
  const root = rootOf(chord) + 12 * (octave + 1);
  const minor = chord.includes("m") && !chord.includes("maj");
  const fifth = chord.includes("b5") ? 6 : 7;
  return [root, root + (minor ? 3 : 4), root + fifth, root + (chord.includes("7") ? (chord.includes("maj") ? 11 : 10) : 12)];
}

export function ruleTheme(plan: TrackPlan, salt = "rule"): NoteEvent[] {
  const rng = random(`${plan.seed}:${salt}`);
  const scale = [0, 2, 4, 5, 7, 9, 11];
  const tonic = 60 + ROOTS.indexOf(plan.key.replace("♭", "b").replace("♯", "#"));
  const notes: NoteEvent[] = [];
  let beat = 0;
  while (beat < 16) {
    const duration = pick(rng, [.5, .5, 1, 1, 1.5]);
    notes.push({ beat, duration: Math.min(duration, 16 - beat), pitch: tonic + pick(rng, scale) + (rng() > .82 ? 12 : 0), velocity: 76 + Math.floor(rng() * 26), instrument: plan.instruments.lead[0] });
    beat += duration;
  }
  return notes;
}

function addTheme(notes: NoteEvent[], theme: NoteEvent[], start: number, section: number, instrument: number) {
  const shift = section % 3 === 1 ? 2 : section % 3 === 2 ? -2 : 0;
  for (const note of theme) {
    const inverted = section % 4 === 2 ? theme[0].pitch - (note.pitch - theme[0].pitch) : note.pitch;
    notes.push({ ...note, beat: start + note.beat, pitch: inverted + shift, velocity: Math.min(116, note.velocity + (section % 2) * 5), instrument });
  }
}

function addRhythm(notes: NoteEvent[], plan: TrackPlan, bar: number) {
  const config = GENRES[plan.genre];
  const start = bar * 4;
  if (config.drums === "none") {
    for (let i = 0; i < 8; i++) notes.push({ beat: start + i * .5, duration: .42, pitch: chordPitches(plan.chords[bar], 3)[i % 3], velocity: 48 + (i % 2) * 8, instrument: plan.instruments.harmony[0] });
    return;
  }
  const kick = config.drums === "funk" ? [0, 1.5, 2.5] : [0, 2];
  const snare = config.drums === "swing" ? [1, 3] : [1, 3];
  for (const beat of kick) notes.push({ beat: start + beat, duration: .12, pitch: 36, velocity: 94, instrument: 128 });
  for (const beat of snare) notes.push({ beat: start + beat, duration: .12, pitch: 38, velocity: 88, instrument: 128 });
  for (let i = 0; i < 8; i++) notes.push({ beat: start + i * .5, duration: .08, pitch: config.drums === "swing" ? 51 : 42, velocity: 54 + (i % 2) * 10, instrument: 128 });
}

function addBass(notes: NoteEvent[], plan: TrackPlan, bar: number) {
  const config = GENRES[plan.genre];
  const start = bar * 4;
  const root = 36 + rootOf(plan.chords[bar]);
  const pattern = config.bass === "walk" ? [0, 4, 7, 9] : config.bass === "sync" ? [0, 0, 7, 0, 10] : config.bass === "eighth" ? [0, 0, 7, 7, 0, 0, 7, 10] : [0, 7, 0, 7];
  const step = 4 / pattern.length;
  pattern.forEach((interval, i) => notes.push({ beat: start + i * step, duration: step * .86, pitch: root + interval, velocity: 72 + (i === 0 ? 10 : 0), instrument: plan.instruments.bass }));
}

function addHarmony(notes: NoteEvent[], plan: TrackPlan, bar: number) {
  const config = GENRES[plan.genre];
  const pitches = chordPitches(plan.chords[bar], config.voicing === "power" ? 3 : 4);
  const starts = config.voicing === "stab" ? [0, 1.5, 2.5] : config.voicing === "power" ? [0, 2] : [0];
  const harmony = plan.instruments.harmony;
  for (const beat of starts) for (const [index, pitch] of pitches.slice(0, config.voicing === "power" ? 2 : 4).entries()) {
    const targets = harmony.length === 1 ? harmony : [harmony[index % harmony.length]];
    for (const instrument of targets) notes.push({ beat: bar * 4 + beat, duration: starts.length === 1 ? 3.7 : .42, pitch, velocity: config.voicing === "shell" ? 58 : 68, instrument });
  }
}

function addColor(notes: NoteEvent[], plan: TrackPlan, bar: number) {
  const pitches = chordPitches(plan.chords[bar], 4);
  plan.instruments.color.forEach((instrument, index) => notes.push({ beat: bar * 4, duration: 3.6, pitch: pitches[(index + 1) % pitches.length], velocity: 45, instrument }));
}

export function normalizeNotes(notes: NoteEvent[], totalBeats: number): NoteEvent[] {
  const seen = new Set<string>();
  return notes
    .map(note => {
      const [low, high] = RANGES[note.instrument] ?? [0, 127];
      return { ...note, beat: Math.max(0, note.beat), duration: Math.max(.05, Math.min(note.duration, totalBeats - note.beat)), pitch: Math.max(low, Math.min(high, Math.round(note.pitch))), velocity: Math.max(1, Math.min(127, Math.round(note.velocity))) };
    })
    .filter(note => note.beat < totalBeats && note.duration > 0)
    .filter(note => { const key = `${note.beat.toFixed(3)}:${note.pitch}:${note.instrument}`; if (seen.has(key)) return false; seen.add(key); return true; })
    .sort((a, b) => a.beat - b.beat || a.pitch - b.pitch);
}

export function fingerprint(theme: NoteEvent[]) {
  const sorted = [...theme].sort((a, b) => a.beat - b.beat).slice(0, 16);
  return sorted.slice(1).map((note, i) => `${Math.max(-12, Math.min(12, note.pitch - sorted[i].pitch))}:${Math.round(note.duration * 4)}`).join("|");
}

export function tooSimilar(candidate: string, history: string[]) {
  return history.some(old => {
    const a = candidate.split("|");
    const b = old.split("|");
    const same = a.filter((value, i) => value === b[i]).length;
    return same / Math.max(a.length, b.length, 1) > .78;
  });
}

export function buildSong(plan: TrackPlan, aiTheme?: NoteEvent[], aiDrums?: NoteEvent[]): Song {
  const config = GENRES[plan.genre];
  const bars = plan.chords.length;
  const totalBeats = bars * 4;
  const theme = aiTheme?.length ? aiTheme : ruleTheme(plan);
  const notes: NoteEvent[] = [];
  for (let bar = 0; bar < bars; bar++) {
    addHarmony(notes, plan, bar);
    addBass(notes, plan, bar);
    addRhythm(notes, plan, bar);
    addColor(notes, plan, bar);
    if (bar % 4 === 0 && bar < bars - 2) for (const [layer, instrument] of plan.instruments.lead.entries()) addTheme(notes, theme, bar * 4, Math.floor(bar / 4) + layer, instrument);
  }
  if (aiDrums?.length && config.drums !== "none") {
    for (let bar = 0; bar < bars - 2; bar++) for (const note of aiDrums) notes.push({ ...note, beat: bar * 4 + (note.beat % 4), instrument: 128 });
  }
  const tonic = 36 + ROOTS.indexOf(plan.key.replace("♭", "b").replace("♯", "#"));
  notes.push({ beat: totalBeats - 8, duration: 3.5, pitch: tonic + 7, velocity: 82, instrument: plan.instruments.bass });
  notes.push({ beat: totalBeats - 4, duration: 3.8, pitch: tonic, velocity: 88, instrument: plan.instruments.bass });
  for (const [index, pitch] of [tonic + 24, tonic + 28, tonic + 31].entries()) notes.push({ beat: totalBeats - 4, duration: 3.8, pitch, velocity: 72, instrument: plan.instruments.harmony[index % plan.instruments.harmony.length] });
  return { plan, notes: normalizeNotes(notes, totalBeats), fingerprint: fingerprint(theme), ai: Boolean(aiTheme?.length) };
}

type ModelSequence = { notes?: Array<{ pitch?: number | null; quantizedStartStep?: number | null; quantizedEndStep?: number | null }> | null };
let melodyModel: import("@magenta/music/esm/music_rnn.js").MusicRNN | undefined;
let drumModel: import("@magenta/music/esm/music_rnn.js").MusicRNN | undefined;

export async function initializeAI(progress: (value: number, label: string) => void) {
  progress(8, "WebGLを確認中");
  const processLike = (globalThis as unknown as { process?: { hrtime?: NodeJS.HRTime } }).process;
  if (processLike && !processLike.hrtime) {
    const hrtime = ((previous?: [number, number]) => {
      const nanoseconds = Math.floor(performance.now() * 1e6) - (previous ? previous[0] * 1e9 + previous[1] : 0);
      return [Math.floor(nanoseconds / 1e9), nanoseconds % 1e9];
    }) as NodeJS.HRTime;
    hrtime.bigint = () => BigInt(Math.floor(performance.now() * 1e6));
    processLike.hrtime = hrtime;
  }
  const tf = await import("@tensorflow/tfjs");
  if (!await tf.setBackend("webgl")) throw new Error("WebGLを利用できません。この端末は対象外です。");
  await tf.ready();
  progress(18, "作曲モデルを取得中");
  const { MusicRNN } = await import("@magenta/music/esm/music_rnn.js");
  const melody = new MusicRNN("/models/chord_pitches_improv");
  const drums = new MusicRNN("/models/drum_kit_rnn");
  melodyModel = melody;
  drumModel = drums;
  await melody.initialize();
  progress(62, "リズムモデルを取得中");
  await drums.initialize();
  progress(84, "音源を準備中");
}

function fromSequence(sequence: ModelSequence, instrument: number) {
  const notes = sequence.notes ?? [];
  const first = notes.length ? Math.min(...notes.map(note => note.quantizedStartStep ?? 0)) : 0;
  return notes.map(note => ({ beat: ((note.quantizedStartStep ?? 0) - first) / 4, duration: Math.max(.12, ((note.quantizedEndStep ?? 1) - (note.quantizedStartStep ?? 0)) / 4), pitch: note.pitch ?? 60, velocity: 88, instrument })).filter(note => note.beat < 16);
}

export async function aiParts(plan: TrackPlan, retry = false): Promise<{ theme: NoteEvent[]; drums: NoteEvent[] }> {
  if (!melodyModel || !drumModel) throw new Error("AI model is not initialized");
  const instrument = plan.instruments.lead[0];
  const root = 60 + ROOTS.indexOf(plan.key.replace("♭", "b").replace("♯", "#"));
  const primer = { notes: [{ pitch: root, quantizedStartStep: 0, quantizedEndStep: 4 }], quantizationInfo: { stepsPerQuarter: 4 }, totalQuantizedSteps: 4 };
  const drumPrimer = { notes: [{ pitch: 36, quantizedStartStep: 0, quantizedEndStep: 1, isDrum: true }], quantizationInfo: { stepsPerQuarter: 4 }, totalQuantizedSteps: 4 };
  const temperature = retry ? 1.12 : .96;
  const [theme, drums] = await Promise.all([
    melodyModel.continueSequence(primer, 64, temperature, plan.chords.slice(0, 4)),
    drumModel.continueSequence(drumPrimer, 16, temperature),
  ]);
  return { theme: fromSequence(theme, instrument), drums: fromSequence(drums, 128) };
}

export function newSeed() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
