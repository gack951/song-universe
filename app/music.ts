export type Genre = "jazz" | "bigBand" | "funk" | "rock" | "pop" | "classical" | "musicBox";

export type TrackPlan = {
  seed: string;
  title: string;
  genre: Genre;
  mood: string;
  key: string;
  bpm: number;
  feel: "スイング" | "ストレート8";
  swing: number;
  harmonyStyle: "ヴィンテージ" | "モダン";
  durationSeconds: number;
  form: string[];
  chords: string[];
  sections: SectionPlan[];
  phraseEnds: number[];
  instruments: {
    lead: number[];
    harmony: number[];
    bass: number;
    color: number[];
  };
};

export type SectionPlan = {
  name: string;
  startBar: number;
  bars: number;
  energy: number;
  melody: "theme" | "contrast" | "improv" | "sparse";
};

export type NoteEvent = {
  beat: number;
  duration: number;
  pitch: number;
  velocity: number;
  instrument: number;
};

export type PlaybackState = "loading" | "playing" | "paused" | "buffering" | "error";
export type Song = { plan: TrackPlan; notes: NoteEvent[]; theme: NoteEvent[]; fingerprint: string; ai: boolean };

type GenreConfig = {
  label: string;
  bpm: [number, number];
  swing: number;
  moods: string[];
  moodEnergy: number[];
  instruments: { lead: number[]; harmony: number[]; bass: number[]; color: number[] };
  layers: { lead: number; harmony: number; color: number };
  melody: { grid: number; tension: number; syncopation: number; rhythms: number[][] };
  energy: number[];
  sectionWeights: number[];
  progressions: number[][];
  bass: "walk" | "sync" | "eighth" | "pulse";
  drums: "swing" | "funk" | "rock" | "pop" | "none";
  voicing: "shell" | "stab" | "power" | "open";
  cadence: number[];
  form: string[];
  pack: "jazz-bigband" | "funk-rock-pop" | "classical" | "music-box";
};

export const GENRES: Record<Genre, GenreConfig> = {
  jazz: { label: "ジャズ", bpm: [88, 148], swing: .62, moods: ["夜更け", "軽やか", "スモーキー"], moodEnergy: [.86, 1.06, .94], instruments: { lead: [65, 66, 56, 11], harmony: [0, 4, 16, 26], bass: [32, 33, 34], color: [11, 64, 56, 26] }, layers: { lead: 1, harmony: 1, color: 1 }, melody: { grid: .5, tension: .18, syncopation: .4, rhythms: [[0, 1, 2, 3], [0, .5, 1.5, 2.5, 3], [0, 1, 1.5, 2.5, 3.5]] }, energy: [.62, .86, .7, .42], sectionWeights: [1, 2, 1, 1], progressions: [[2, 5, 1, 6], [1, 6, 2, 5]], bass: "walk", drums: "swing", voicing: "shell", cadence: [2, 5, 1, 1], form: ["head", "solo", "head", "coda"], pack: "jazz-bigband" },
  bigBand: { label: "ビッグバンド", bpm: [104, 176], swing: .64, moods: ["華麗", "祝祭", "大胆"], moodEnergy: [1, 1.05, 1.1], instruments: { lead: [56, 65, 66], harmony: [57, 60, 67], bass: [32, 33], color: [0, 11, 26] }, layers: { lead: 2, harmony: 2, color: 1 }, melody: { grid: .5, tension: .12, syncopation: .34, rhythms: [[0, 1, 2, 3], [0, .5, 1.5, 2.5, 3], [0, 1, 2, 2.5, 3.5]] }, energy: [.46, .68, .78, 1, .48], sectionWeights: [1, 1, 2, 1, 1], progressions: [[1, 6, 2, 5], [3, 6, 2, 5]], bass: "walk", drums: "swing", voicing: "stab", cadence: [2, 5, 1, 1], form: ["intro", "head", "solos", "shout chorus", "coda"], pack: "jazz-bigband" },
  funk: { label: "ファンク", bpm: [92, 122], swing: .54, moods: ["粘る", "鮮烈", "地下室"], moodEnergy: [.96, 1.08, .86], instruments: { lead: [4, 5, 80, 81], harmony: [27, 16, 4, 5], bass: [36, 37, 33, 34], color: [16, 11, 80, 81] }, layers: { lead: 1, harmony: 1, color: 1 }, melody: { grid: .25, tension: .22, syncopation: .5, rhythms: [[0, .75, 1.5, 2.5, 3.25], [0, .5, 1.5, 2, 3.5], [0, .75, 1.75, 2.5, 3]] }, energy: [.72, .88, .3, .84, .5], sectionWeights: [2, 1, 1, 2, 1], progressions: [[1, 4, 1, 5], [1, 7, 4, 1]], bass: "sync", drums: "funk", voicing: "stab", cadence: [4, 5, 1, 1], form: ["A", "B", "break", "A", "outro"], pack: "funk-rock-pop" },
  rock: { label: "ロック", bpm: [104, 168], swing: .5, moods: ["疾走", "荒野", "昂揚"], moodEnergy: [1.08, .9, 1.05], instruments: { lead: [29, 30, 27, 28], harmony: [27, 29, 16, 0], bass: [33, 34, 32], color: [16, 80, 48] }, layers: { lead: 1, harmony: 1, color: 1 }, melody: { grid: .5, tension: .1, syncopation: .28, rhythms: [[0, .5, 1, 2, 2.5, 3], [0, 1, 1.5, 2, 3], [0, .5, 1.5, 2.5, 3.5]] }, energy: [.46, .62, .9, .66, .74, 1, .48], sectionWeights: [1, 2, 1, 2, 1, 1, 1], progressions: [[1, 5, 6, 4], [1, 4, 5, 1]], bass: "eighth", drums: "rock", voicing: "power", cadence: [4, 5, 1, 1], form: ["intro", "verse", "chorus", "verse", "bridge", "chorus", "outro"], pack: "funk-rock-pop" },
  pop: { label: "ポップ", bpm: [92, 132], swing: .5, moods: ["透明", "晴れ間", "切なさ"], moodEnergy: [.88, 1.05, .9], instruments: { lead: [80, 81, 4, 73], harmony: [4, 0, 48, 88], bass: [33, 38, 39], color: [88, 89, 48, 52] }, layers: { lead: 1, harmony: 1, color: 1 }, melody: { grid: .5, tension: .08, syncopation: .42, rhythms: [[0, 1, 1.5, 2.5, 3], [0, .5, 1.5, 2, 3], [0, 1, 2, 3]] }, energy: [.42, .56, .72, .94, .68, 1], sectionWeights: [1, 2, 1, 2, 1, 2], progressions: [[1, 5, 6, 4], [6, 4, 1, 5]], bass: "pulse", drums: "pop", voicing: "open", cadence: [4, 5, 1, 1], form: ["intro", "verse", "prechorus", "chorus", "bridge", "final chorus"], pack: "funk-rock-pop" },
  classical: { label: "クラシック", bpm: [66, 126], swing: .5, moods: ["端正", "荘厳", "田園"], moodEnergy: [.92, 1.06, .84], instruments: { lead: [40, 68, 71, 73], harmony: [41, 42, 48, 0], bass: [43, 42, 70], color: [46, 60, 68, 70, 6] }, layers: { lead: 2, harmony: 2, color: 1 }, melody: { grid: .5, tension: .06, syncopation: .12, rhythms: [[0, .5, 1, 2, 3], [0, 1, 2, 2.5, 3], [0, .5, 1.5, 2.5, 3]] }, energy: [.62, .9, .76, .44], sectionWeights: [2, 2, 2, 1], progressions: [[1, 4, 5, 1], [1, 6, 2, 5]], bass: "pulse", drums: "none", voicing: "open", cadence: [2, 5, 1, 1], form: ["exposition", "development", "recapitulation", "coda"], pack: "classical" },
  musicBox: { label: "オルゴール", bpm: [52, 68], swing: .5, moods: ["まどろみ", "星明かり", "やすらぎ"], moodEnergy: [1, 1, 1], instruments: { lead: [10, 8], harmony: [0, 46], bass: [43, 42], color: [9, 11] }, layers: { lead: 1, harmony: 1, color: 0 }, melody: { grid: 1, tension: .01, syncopation: .03, rhythms: [[0, 1, 2, 3], [0, 2], [0, 1, 3]] }, energy: [.36, .36, .36, .32], sectionWeights: [1, 1, 1, 1], progressions: [[1, 4, 5, 1]], bass: "pulse", drums: "none", voicing: "open", cadence: [4, 5, 1, 1], form: ["lullaby", "lullaby", "lullaby", "lullaby"], pack: "music-box" },
};

const KEYS = ["C", "D♭", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
const ROOTS = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const ADJECTIVES = ["Velvet", "Amber", "Quiet", "Electric", "Silver", "Midnight", "Open", "Blue"];
const NOUNS = ["Orbit", "Lantern", "Current", "Avenue", "Garden", "Signal", "Horizon", "Echo"];
export const RANGES: Record<number, [number, number]> = { 0: [36, 96], 4: [36, 96], 5: [36, 96], 6: [36, 96], 8: [48, 96], 9: [60, 96], 10: [60, 96], 11: [53, 96], 16: [36, 96], 26: [40, 88], 27: [40, 88], 28: [40, 88], 29: [40, 88], 30: [40, 88], 32: [28, 67], 33: [28, 67], 34: [28, 67], 36: [28, 67], 37: [28, 67], 38: [28, 72], 39: [28, 72], 40: [55, 103], 41: [48, 88], 42: [36, 76], 43: [28, 67], 46: [24, 103], 47: [36, 72], 48: [36, 96], 52: [48, 84], 56: [54, 82], 57: [40, 72], 60: [34, 77], 64: [46, 92], 65: [49, 80], 66: [44, 79], 67: [37, 75], 68: [58, 91], 70: [34, 75], 71: [50, 94], 73: [60, 96], 80: [48, 96], 81: [36, 96], 88: [36, 96], 89: [36, 96], 128: [35, 81] };

export const INSTRUMENT_NAMES: Record<number, string> = {
  0: "グランドピアノ", 4: "エレクトリックピアノ", 5: "エレクトリックピアノ2", 6: "ハープシコード", 8: "チェレスタ", 9: "グロッケン", 10: "オルゴール", 11: "ヴィブラフォン", 16: "ドローバーオルガン",
  26: "ジャズギター", 27: "クリーンギター", 28: "ミュートギター", 29: "オーバードライブギター", 30: "ディストーションギター",
  32: "アコースティックベース", 33: "フィンガーベース", 34: "ピックベース", 36: "スラップベース", 37: "スラップベース2", 38: "シンセベース", 39: "シンセベース2",
  40: "ヴァイオリン", 41: "ヴィオラ", 42: "チェロ", 43: "コントラバス", 46: "ハープ", 48: "ストリングス", 52: "クワイア",
  56: "トランペット", 57: "トロンボーン", 60: "フレンチホルン", 64: "ソプラノサックス", 65: "アルトサックス", 66: "テナーサックス", 67: "バリトンサックス",
  68: "オーボエ", 70: "ファゴット", 71: "クラリネット", 73: "フルート", 80: "スクエアシンセ", 81: "ソーシンセ", 88: "ファンタジアパッド", 89: "ウォームパッド", 128: "ドラム",
};

export const eighthNoteMilliseconds = (bpm: number) => 30000 / bpm;

export const swingForTempo = (bpm: number, straight = false) => straight ? .5 : Math.max(.56, Math.min(.68, .77 - bpm * .001));

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

function styleChord(chord: string, modern: boolean, rng: () => number) {
  if (!modern) return chord.replace("maj7", "").replace("m7b5", "m").replace("m7", "m");
  if (rng() > .42) return chord;
  if (chord.includes("maj7")) return chord.replace("maj7", rng() < .5 ? "maj9" : "maj13");
  if (chord.includes("m7b5")) return chord.replace("m7b5", "m11b5");
  if (chord.includes("m7")) return chord.replace("m7", rng() < .5 ? "m9" : "m11");
  return chord.replace("7", rng() < .5 ? "9" : "13");
}

const namedChord = (root: number, offset: number, quality: string) => ROOTS[(root + offset) % 12] + quality;

function sectionMelody(name: string): SectionPlan["melody"] {
  if (["head", "A", "chorus", "final chorus", "exposition", "recapitulation", "lullaby"].includes(name)) return "theme";
  if (["B", "verse", "prechorus", "bridge"].includes(name)) return "contrast";
  if (["solo", "solos", "shout chorus", "development"].includes(name)) return "improv";
  return "sparse";
}

function makeSections(rng: () => number, config: GenreConfig, bars: number, mood: number): SectionPlan[] {
  const units = Array(config.form.length).fill(1) as number[];
  for (let remaining = bars / 4 - units.length; remaining > 0; remaining--) {
    const total = config.sectionWeights.reduce((sum, weight) => sum + weight, 0);
    let roll = rng() * total;
    const target = Math.max(0, config.sectionWeights.findIndex(weight => (roll -= weight) <= 0));
    units[target]++;
  }
  let startBar = 0;
  return config.form.map((name, index) => {
    const section = {
      name,
      startBar,
      bars: units[index] * 4,
      energy: Math.max(.25, Math.min(1, config.energy[index] * config.moodEnergy[mood] + (rng() - .5) * .08)),
      melody: sectionMelody(name),
    } satisfies SectionPlan;
    startBar += section.bars;
    return section;
  });
}

function makePhraseEnds(rng: () => number, sections: SectionPlan[]) {
  const ends: number[] = [];
  sections.forEach((section, sectionIndex) => {
    let bar = section.startBar;
    let remaining = section.bars - (sectionIndex === sections.length - 1 ? 4 : 0);
    while (remaining > 0) {
      const choices = [4, 4, 4, 3, 5, 6, 2, 7, 8].filter(length => length <= remaining && (remaining - length === 0 || remaining - length >= 2));
      const length = pick(rng, choices);
      bar += length; remaining -= length; ends.push(bar);
    }
    if (bar < section.startBar + section.bars) ends.push(section.startBar + section.bars);
  });
  return ends;
}

export function createTrackPlan(seed: string, genre: Genre): TrackPlan {
  const rng = random(seed);
  const config = GENRES[genre];
  const bpm = Math.round(config.bpm[0] + rng() * (config.bpm[1] - config.bpm[0]));
  const target = 90 + Math.floor(rng() * 271);
  const minBars = Math.ceil(90 * bpm / 960) * 4;
  const maxBars = Math.floor(360 * bpm / 960) * 4;
  const bars = Math.min(maxBars, Math.max(minBars, Math.round(target * bpm / 960) * 4, config.form.length * 4));
  const durationSeconds = Math.round(bars * 240 / bpm);
  const root = Math.floor(rng() * 12);
  const mood = Math.floor(rng() * config.moods.length);
  const straight = (genre === "jazz" || genre === "bigBand") && rng() < .2;
  const harmonyRng = random(`${seed}:harmony-style`);
  const modern = harmonyRng() < .3;
  const sections = makeSections(rng, config, bars, mood);
  const chords = sections.flatMap((section, index) => {
    const degrees = config.progressions[(index + Math.floor(rng() * config.progressions.length)) % config.progressions.length];
    const turn = genre === "musicBox" ? 0 : index % degrees.length;
    return Array.from({ length: section.bars }, (_, bar) => chordName(root, degrees[(bar + turn) % degrees.length]));
  });
  for (const section of sections) {
    if ((genre === "jazz" || genre === "pop") && section.bars >= 8) {
      const bar = section.startBar + Math.floor(rng() * (section.bars / 4 - 1)) * 4 + 1;
      const pairs = genre === "jazz"
        ? [[namedChord(root, 1, "7"), namedChord(root, 0, "maj7")], [namedChord(root, 10, "7"), namedChord(root, 0, "maj7")], [namedChord(root, 4, "7"), namedChord(root, 9, "m7")]]
        : [[namedChord(root, 5, "m"), namedChord(root, 0, "maj7")], [namedChord(root, 10, "maj7"), namedChord(root, 0, "maj7")], [namedChord(root, 4, "7"), namedChord(root, 9, "m7")]];
      [chords[bar], chords[bar + 1]] = pick(rng, pairs);
    }
  }
  const phraseEnds = genre === "musicBox" ? Array.from({ length: bars / 4 }, (_, index) => (index + 1) * 4) : makePhraseEnds(rng, sections);
  const linkEnds: number[] = [];
  for (const end of phraseEnds) {
    const sectionEnd = sections.some(section => end === section.startBar + section.bars);
    const cadence = genre === "musicBox" ? "authentic" : pick(rng, sectionEnd ? ["authentic", "authentic", "plagal"] : ["half", "authentic", "plagal", "deceptive", "link", "link"]);
    if (cadence === "authentic") [chords[end - 2], chords[end - 1]] = [chordName(root, 5), chordName(root, 1)];
    if (cadence === "plagal") [chords[end - 2], chords[end - 1]] = [chordName(root, 4), chordName(root, 1)];
    if (cadence === "deceptive") [chords[end - 2], chords[end - 1]] = [chordName(root, 5), chordName(root, 6)];
    if (cadence === "half") [chords[end - 2], chords[end - 1]] = [chordName(root, 2), chordName(root, 5)];
    if (cadence === "link") linkEnds.push(end);
  }
  config.cadence.slice(0, -1).forEach((degree, index, cadence) => { chords[chords.length - cadence.length + index] = chordName(root, degree); });
  linkEnds.forEach(end => { chords[end - 1] = namedChord(rootOf(chords[end]), 7, "7"); });
  chords.forEach((chord, index) => { chords[index] = styleChord(chord, modern, harmonyRng); });
  const instruments = chooseInstruments(rng, config);
  return {
    seed,
    title: `${pick(rng, ADJECTIVES)} ${pick(rng, NOUNS)}`,
    genre,
    mood: config.moods[mood],
    key: KEYS[root],
    bpm,
    feel: (genre === "jazz" || genre === "bigBand") && !straight ? "スイング" : "ストレート8",
    swing: genre === "jazz" || genre === "bigBand" ? swingForTempo(bpm, straight) : config.swing,
    harmonyStyle: modern ? "モダン" : "ヴィンテージ",
    durationSeconds,
    form: config.form,
    chords,
    sections,
    phraseEnds,
    instruments,
  };
}

function rootOf(chord: string) {
  const name = chord.match(/^[A-G](?:b|#)?/)?.[0] ?? "C";
  return ROOTS.indexOf(name);
}

function chordPitches(chord: string, octave = 4, includeTension = true) {
  const root = rootOf(chord) + 12 * (octave + 1);
  const minor = chord.includes("m") && !chord.includes("maj");
  const fifth = chord.includes("b5") ? 6 : 7;
  const seventh = root + (chord.includes("maj") ? 11 : 10);
  const tension = chord.includes("13") ? root + 21 : chord.includes("11") ? root + 17 : chord.includes("9") ? root + 14 : undefined;
  return tension && includeTension ? [root, root + (minor ? 3 : 4), seventh, tension] : [root, root + (minor ? 3 : 4), root + fifth, chord.includes("7") ? seventh : root + 12];
}

export function ruleTheme(plan: TrackPlan, salt = "rule"): NoteEvent[] {
  return melodyPhrase(plan, 0, 4, "theme", salt);
}

function nearestChordPitch(pitch: number, chord: string) {
  const candidates = [-1, 0, 1].flatMap(octave => chordPitches(chord, 4, false).map(value => value + octave * 12));
  return candidates.reduce((best, value) => Math.abs(value - pitch) < Math.abs(best - pitch) ? value : best);
}

function nearestRootPitch(pitch: number, chord: string) {
  const root = rootOf(chord) + 60;
  return nearest(pitch, [-2, -1, 0, 1, 2].map(octave => root + octave * 12));
}

function nearest(pitch: number, candidates: number[]) {
  return candidates.reduce((best, value) => Math.abs(value - pitch) < Math.abs(best - pitch) ? value : best);
}

function swingOffset(plan: TrackPlan, beat: number) {
  return plan.swing > .5 && beat % 1 === .5 ? Math.floor(beat) + plan.swing : beat;
}

type PhraseEnding = "closed" | "imperfect" | "half" | "plagal" | "deceptive" | "continue";

function phraseEnding(plan: TrackPlan, startBar: number, bars: number, salt: string): PhraseEnding {
  if (plan.genre === "musicBox") return "closed";
  const endBar = startBar + bars;
  if (endBar >= plan.chords.length) return "closed";
  const tonic = ROOTS.indexOf(plan.key.replace("♭", "b").replace("♯", "#"));
  const previous = rootOf(plan.chords[endBar - 2]), final = rootOf(plan.chords[endBar - 1]);
  if (previous === (tonic + 5) % 12 && final === tonic) return "plagal";
  if (previous === (tonic + 7) % 12 && final === tonic) return pick(random(`${plan.seed}:ending:${startBar}:${salt}`), ["closed", "imperfect", "imperfect"] as const);
  if (previous === (tonic + 7) % 12 && final === (tonic + 9) % 12) return "deceptive";
  if (final === (tonic + 7) % 12) return "half";
  return "continue";
}

function endingPitch(plan: TrackPlan, startBar: number, bars: number, target: number, ending: PhraseEnding) {
  const chord = plan.chords[startBar + bars - 1];
  if (ending === "closed") return nearestRootPitch(target, chord);
  const destination = ending === "continue" ? plan.chords[Math.min(startBar + bars, plan.chords.length - 1)] : chord;
  const tones = [-1, 0, 1].flatMap(octave => chordPitches(destination, 4).slice(0, 3).map(pitch => pitch + octave * 12));
  const candidates = ending === "half" || ending === "plagal" ? tones : tones.filter(pitch => pitch % 12 !== rootOf(destination));
  return nearest(target, candidates);
}

function melodyPhrase(plan: TrackPlan, startBar: number, barCount: number, mode: SectionPlan["melody"], salt: string, source: NoteEvent[] = []) {
  const config = GENRES[plan.genre];
  const rng = random(`${plan.seed}:${mode}:${startBar}:${salt}`);
  const keyRoot = ROOTS.indexOf(plan.key.replace("♭", "b").replace("♯", "#"));
  const scale = Array.from({ length: 5 }, (_, octave) => [0, 2, 4, 5, 7, 9, 11].map(step => 36 + octave * 12 + keyRoot + step)).flat();
  const [low, high] = RANGES[plan.instruments.lead[0]];
  const center = Math.max(low + 5, Math.min(high - 5, 66 + keyRoot % 6));
  const motif = pick(rng, config.melody.rhythms);
  const motifPrime = motif.length > 4
    ? motif.filter((_, index) => index !== motif.length - 2)
    : motif.map((beat, index) => index === motif.length - 1 ? Math.max(motif[index - 1] + config.melody.grid, beat - config.melody.grid) : beat);
  const answer = pick(rng, config.melody.rhythms.filter(pattern => pattern !== motif));
  const ending = phraseEnding(plan, startBar, barCount, salt);
  const bars = Array.from({ length: barCount }, (_, bar) => mode === "sparse"
    ? pick(rng, [[0, 2], [0, 1.5], [0, 2.5]])
    : bar % 3 === 0 ? motif : bar % 3 === 1 ? motifPrime : answer);
  bars[barCount - 1] = plan.genre === "musicBox" ? [0, 1, 2] : pick(rng, ending === "continue"
    ? [[0, 1.5, 2.5, 3.5], [.5, 1.5, 2.5, 3.5]]
    : mode === "sparse" ? [[0, 2], [0, 1.5], [.5, 2.5]] : [[0, 1, 2], [0, .5, 1.5, 2.5], [0, 1, 2.5], [.5, 1.5, 3]]);
  if (plan.genre !== "musicBox" && barCount > 2 && mode !== "sparse" && rng() < config.melody.syncopation) bars[1 + Math.floor(rng() * (barCount - 2))] = pick(rng, [[.5, 1.5, 2.5, 3.5], [.5, 1, 2.5, 3.5], [.5, 1.5, 2, 3.5]]);
  const tension = config.melody.tension * (mode === "improv" ? 1.6 : mode === "sparse" ? .4 : 1);
  const sourcePitches = [...source].sort((a, b) => a.beat - b.beat).map(note => note.pitch);
  const learnedShape = sourcePitches.slice(0, 4).map(pitch => Math.max(-5, Math.min(5, pitch - sourcePitches[0])));
  const shapes = mode === "contrast" ? [[0, -2, 1, 4], [0, 3, 1, 5]] : mode === "improv" ? [[0, 2, -1, 4], [0, 3, -2, 5], [0, -2, 3, 1]] : mode === "sparse" ? [[0, 2], [0, -2]] : [[0, 2, 4, 2], [0, 3, 5, 2], [0, 2, 3, 1]];
  const shape = new Set(learnedShape).size >= 3 ? learnedShape : pick(rng, shapes);
  const sequence = rng() > .5 ? 2 : -2;
  const events: NoteEvent[] = [];
  const sectionEnd = plan.sections.some(section => startBar + barCount === section.startBar + section.bars);
  let previous = center;
  bars.forEach((pattern, bar) => pattern.forEach((rawOffset, index) => {
    const offset = swingOffset(plan, rawOffset);
    const lastBar = bar === barCount - 1;
    const nextRaw = pattern[index + 1] ?? (lastBar ? 3.5 : 4);
    const next = swingOffset(plan, nextRaw);
    const beat = (startBar + bar) * 4 + offset;
    const chord = plan.chords[startBar + bar];
    const chordTones = [-1, 0, 1].flatMap(octave => chordPitches(chord, 4).map(pitch => pitch + octave * 12));
    const strong = rawOffset % 2 === 0;
    const cadence = lastBar && index === pattern.length - 1;
    const gesture = lastBar ? [4, 2, 0, -1][Math.min(index, 3)] : bar % 3 === 1 ? shape[index % shape.length] + sequence : bar % 3 === 2 ? -shape[shape.length - 1 - index % shape.length] : shape[index % shape.length];
    const arc = barCount === 1 ? 0 : Math.sin(Math.PI * bar / (barCount - 1));
    const target = center + Math.round(arc * (mode === "improv" ? 8 : mode === "sparse" ? 3 : 5)) + (mode === "contrast" ? 2 : 0) + gesture;
    let pitch = nearest(target, strong || cadence ? chordTones : scale);
    if (!strong && !cadence && rng() < tension) pitch = previous + pick(rng, plan.genre === "jazz" || plan.genre === "funk" ? [-2, -1, 1, 2] : [-1, 1]);
    if (Math.abs(pitch - previous) > (mode === "improv" ? 12 : 7)) pitch += pitch > previous ? -12 : 12;
    if (cadence) pitch = endingPitch(plan, startBar, barCount, target, ending);
    const duration = cadence
      ? ending === "continue" ? Math.max(.18, 4 - offset - .04) : Math.max(.4, (sectionEnd ? 3 : 3.5) - offset)
      : Math.max(config.melody.grid * .72, (next - offset) * .9);
    events.push({ beat, duration, pitch, velocity: plan.genre === "musicBox" ? 48 + Math.round(arc * 5) + (strong ? 2 : 0) : 70 + Math.round(arc * 16) + (strong ? 5 : 0), instrument: plan.instruments.lead[0] });
    previous = pitch;
  }));
  return events;
}

function placeTheme(theme: NoteEvent[], plan: TrackPlan, startBar: number, variation: number) {
  const shift = variation % 3 === 1 ? 2 : variation % 3 === 2 ? -2 : 0;
  const lastBeat = Math.max(...theme.map(note => note.beat));
  const sectionEnd = plan.sections.some(section => startBar + 4 === section.startBar + section.bars);
  const ending = phraseEnding(plan, startBar, 4, `placed:${variation}`);
  return theme.map(note => {
    const inverted = variation % 4 === 2 ? theme[0].pitch - (note.pitch - theme[0].pitch) : note.pitch;
    const beat = startBar * 4 + note.beat;
    const chord = plan.chords[Math.floor(beat / 4)];
    const pitch = note.beat === lastBeat ? endingPitch(plan, startBar, 4, inverted + shift, ending) : note.beat % 1 === 0 ? nearestChordPitch(inverted + shift, chord) : inverted + shift;
    return { ...note, beat, duration: note.beat === lastBeat && sectionEnd ? Math.min(note.duration, 1) : note.duration, pitch, velocity: Math.min(116, note.velocity + (variation % 2) * 5), instrument: plan.instruments.lead[0] };
  });
}

function addLeadVoices(notes: NoteEvent[], melody: NoteEvent[], plan: TrackPlan) {
  const [leadLow, leadHigh] = RANGES[plan.instruments.lead[0]];
  const primary = melody.map(note => ({ ...note, pitch: Math.max(leadLow, Math.min(leadHigh, note.pitch)) }));
  if (plan.genre === "bigBand" && plan.instruments.lead[1]) {
    const instrument = plan.instruments.lead[1];
    const [low, high] = RANGES[instrument];
    const answerAt = primary[0].beat + (Math.max(...primary.map(note => note.beat + note.duration)) - primary[0].beat) / 2;
    const answer = primary.filter(note => note.beat >= answerAt).map(note => ({ ...note, pitch: Math.max(low, Math.min(high, note.pitch)), velocity: note.velocity - 3, instrument }));
    notes.push(...primary.filter(note => note.beat < answerAt), ...answer);
    const cadence = answer.at(-1);
    if (cadence) notes.push({ ...cadence, pitch: nearestChordPitch(cadence.pitch - 4, plan.chords[Math.floor(cadence.beat / 4)]), velocity: cadence.velocity - 7, instrument: plan.instruments.lead[0] });
    return;
  }
  notes.push(...primary);
  plan.instruments.lead.slice(1).forEach((instrument, voice) => {
    const [low, high] = RANGES[instrument];
    primary.forEach(note => {
      const chord = plan.chords[Math.min(plan.chords.length - 1, Math.floor(note.beat / 4))];
      const consonant = [-1, 0, 1].flatMap(octave => chordPitches(chord, 4).map(pitch => pitch + octave * 12)).filter(pitch => {
        const interval = Math.abs(pitch - note.pitch) % 12;
        return pitch >= low && pitch <= high && [3, 4, 5, 7, 8, 9].includes(interval);
      });
      const fallback = Array.from({ length: high - low + 1 }, (_, index) => low + index).filter(pitch => Math.abs(pitch - note.pitch) > 2);
      notes.push({ ...note, pitch: nearest(note.pitch - 4 - voice * 3, consonant.length ? consonant : fallback), velocity: note.velocity - 8, instrument });
    });
  });
}

function addRhythm(notes: NoteEvent[], plan: TrackPlan, bar: number, section: SectionPlan) {
  const config = GENRES[plan.genre];
  const start = bar * 4;
  if (config.drums === "none") {
    const steps = plan.genre === "musicBox" ? 2 : section.energy > .7 ? 8 : 4;
    for (let i = 0; i < steps; i++) notes.push({ beat: start + i * 4 / steps, duration: 3.4 / steps, pitch: chordPitches(plan.chords[bar], 3)[i % 3], velocity: plan.genre === "musicBox" ? 36 + i * 2 : 38 + section.energy * 24 + (i % 2) * 6, instrument: plan.instruments.harmony[0] });
    return;
  }
  const kick = config.drums === "funk" ? [0, 1.5, 2.5] : [0, 2];
  for (const beat of kick.filter((_, index) => index === 0 || section.energy > .55)) notes.push({ beat: start + beat, duration: .12, pitch: 36, velocity: 72 + section.energy * 26, instrument: 128 });
  for (const beat of [1, 3]) notes.push({ beat: start + beat, duration: .12, pitch: 38, velocity: 66 + section.energy * 24, instrument: 128 });
  const hats = section.energy > .72 ? 8 : 4;
  for (let i = 0; i < hats; i++) {
    const straight = i * 4 / hats;
    notes.push({ beat: start + swingOffset(plan, straight), duration: .08, pitch: config.drums === "swing" ? 51 : 42, velocity: 38 + section.energy * 26 + (i % 2) * 7, instrument: 128 });
  }
  if (bar === section.startBar + section.bars - 1 && section.energy > .52) {
    const fill = pick(random(`${plan.seed}:fill:${bar}`), [
      [[3, 45], [3.25, 47], [3.5, 48], [3.75, 50]],
      [[2.5, 45], [3, 47], [3.25, 48], [3.5, 50], [3.75, 57]],
      [[2.75, 43], [3, 45], [3.5, 47], [3.75, 49]],
    ]);
    fill.forEach(([beat, pitch], index) => notes.push({ beat: start + beat, duration: .08, pitch, velocity: 72 + section.energy * 18 + index * 5, instrument: 128 }));
  }
}

function addBass(notes: NoteEvent[], plan: TrackPlan, bar: number, section: SectionPlan) {
  const config = GENRES[plan.genre];
  const start = bar * 4;
  const root = 36 + rootOf(plan.chords[bar]);
  const pattern = config.bass === "walk" ? [0, 4, 7, 9] : config.bass === "sync" ? [0, 0, 7, 0, 10] : config.bass === "eighth" ? [0, 0, 7, 7, 0, 0, 7, 10] : plan.genre === "musicBox" ? [0, 7] : [0, 7, 0, 7];
  const active = section.energy < .5 ? pattern.filter((_, index) => index % 2 === 0) : pattern;
  const step = 4 / active.length;
  active.forEach((interval, i) => {
    const approach = i === active.length - 1 && section.energy > .65 ? 35 + rootOf(plan.chords[Math.min(bar + 1, plan.chords.length - 1)]) : root + interval;
    notes.push({ beat: start + i * step, duration: step * .86, pitch: approach, velocity: plan.genre === "musicBox" ? 42 + (i === 0 ? 3 : 0) : 58 + section.energy * 24 + (i === 0 ? 8 : 0), instrument: plan.instruments.bass });
  });
}

function addHarmony(notes: NoteEvent[], plan: TrackPlan, bar: number, section: SectionPlan) {
  const config = GENRES[plan.genre];
  const pitches = chordPitches(plan.chords[bar], config.voicing === "power" ? 3 : 4);
  const starts = section.energy < .45 ? [0] : config.voicing === "stab" ? [0, 1.5, 2.5] : config.voicing === "power" ? [0, 2] : [0];
  const harmony = section.energy > .62 ? plan.instruments.harmony : plan.instruments.harmony.slice(0, 1);
  for (const beat of starts.map(value => swingOffset(plan, value))) for (const [index, pitch] of pitches.slice(0, config.voicing === "power" ? 2 : 4).entries()) {
    const targets = harmony.length === 1 ? harmony : [harmony[index % harmony.length]];
    for (const instrument of targets) notes.push({ beat: bar * 4 + beat, duration: starts.length === 1 ? 3.7 : .42, pitch, velocity: 42 + section.energy * (config.voicing === "shell" ? 22 : 32), instrument });
  }
}

function addColor(notes: NoteEvent[], plan: TrackPlan, bar: number, section: SectionPlan) {
  if (section.energy < .38 || bar % (section.energy > .75 ? 1 : 2)) return;
  const pitches = chordPitches(plan.chords[bar], 4);
  plan.instruments.color.forEach((instrument, index) => notes.push({ beat: bar * 4, duration: section.energy > .7 ? 3.6 : 1.8, pitch: pitches[(index + 1) % pitches.length], velocity: 30 + section.energy * 24, instrument }));
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
  const theme = aiTheme?.length ? melodyPhrase(plan, 0, 4, "theme", "ai", aiTheme) : ruleTheme(plan);
  const notes: NoteEvent[] = [];
  for (const [sectionIndex, section] of plan.sections.entries()) {
    for (let bar = section.startBar; bar < section.startBar + section.bars; bar++) {
      addHarmony(notes, plan, bar, section);
      addBass(notes, plan, bar, section);
      addRhythm(notes, plan, bar, section);
      addColor(notes, plan, bar, section);
    }
    let startBar = section.startBar;
    const phraseEnds = plan.phraseEnds.filter(end => end > section.startBar && end <= section.startBar + section.bars);
    phraseEnds.forEach((endBar, phrase) => {
      const phraseBars = endBar - startBar;
      const melody = section.melody === "theme" && phraseBars === 4 && (phrase === 0 || plan.genre === "musicBox")
        ? placeTheme(theme, plan, startBar, plan.genre === "musicBox" ? 0 : sectionIndex)
        : melodyPhrase(plan, startBar, phraseBars, section.melody === "theme" ? (phrase ? (phrase % 2 ? "contrast" : "improv") : "theme") : section.melody, `${sectionIndex}:${phrase}`, phrase === 0 ? theme : undefined);
      addLeadVoices(notes, melody, plan);
      startBar = endBar;
    });
    if (aiDrums?.length && config.drums !== "none" && section.energy > .7) {
      const fillBar = section.startBar + section.bars - 1;
      for (const note of aiDrums) notes.push({ ...note, beat: fillBar * 4 + swingOffset(plan, note.beat % 4), velocity: 58 + section.energy * 32, instrument: 128 });
    }
  }
  const tonic = 36 + ROOTS.indexOf(plan.key.replace("♭", "b").replace("♯", "#"));
  const cadenceVelocity = plan.genre === "musicBox" ? 46 : 82;
  notes.push({ beat: totalBeats - 8, duration: 3.5, pitch: tonic + 7, velocity: cadenceVelocity, instrument: plan.instruments.bass });
  notes.push({ beat: totalBeats - 4, duration: 3.8, pitch: tonic, velocity: cadenceVelocity + 6, instrument: plan.instruments.bass });
  for (const [index, pitch] of [tonic + 24, tonic + 28, tonic + 31].entries()) notes.push({ beat: totalBeats - 4, duration: 3.8, pitch, velocity: plan.genre === "musicBox" ? 42 : 72, instrument: plan.instruments.harmony[index % plan.instruments.harmony.length] });
  return { plan, notes: normalizeNotes(notes, totalBeats).map(note => plan.genre === "musicBox" ? { ...note, velocity: 127 } : note), theme, fingerprint: fingerprint(theme), ai: Boolean(aiTheme?.length) };
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
