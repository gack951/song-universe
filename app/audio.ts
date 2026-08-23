import type { NoteEvent, Song } from "./music";

type Synth = import("spessasynth_lib").WorkletSynthesizer;

export const soundfontUrls = (pack: string) => Array.from({ length: 3 }, (_, index) => `/soundfonts/${pack}.sf3.${index}?v=4`);

export const joinBuffers = (buffers: ArrayBuffer[]) => {
  const joined = new Uint8Array(buffers.reduce((size, buffer) => size + buffer.byteLength, 0));
  let offset = 0;
  for (const buffer of buffers) { joined.set(new Uint8Array(buffer), offset); offset += buffer.byteLength; }
  return joined.buffer;
};

export const validateSoundfontFile = (file: Pick<File, "name" | "size">) => {
  if (!/\.(?:sf2|sf3)$/i.test(file.name) || !file.size || file.size > 512 * 1024 * 1024) throw new Error("512MB以下のSF2 / SF3音源を選択してください。");
};

export const effectSends = (instrument: number): readonly [number, number] =>
  instrument === 128 ? [16, 0] : instrument >= 32 && instrument <= 39 ? [24, 8] : [48, 20];

export class AudioEngine {
  context?: AudioContext;
  synth?: Synth;
  pack?: string;
  marker?: AudioScheduledSourceNode;
  token = 0;
  startedAt?: number;
  duration = 0;

  get position() { return this.context && this.startedAt !== undefined ? Math.max(0, Math.min(this.duration, this.context.currentTime - this.startedAt)) : 0; }

  async prepare(pack: string, file?: File) {
    this.context ??= new AudioContext({ latencyHint: "playback" });
    await this.context.resume();
    if (!this.synth) {
      await this.context.audioWorklet.addModule("/worklets/spessasynth_processor.min.js");
      const { WorkletSynthesizer } = await import("spessasynth_lib");
      this.synth = new WorkletSynthesizer(this.context, { eventsEnabled: false });
      this.synth.connect(this.context.destination);
      await this.synth.isReady;
    }
    const id = file ? `local:${file.name}:${file.size}:${file.lastModified}` : pack;
    if (this.pack !== id) {
      if (file) validateSoundfontFile(file);
      const responses = file ? undefined : await Promise.all(soundfontUrls(pack).map(async url => await caches.match(url) ?? fetch(url)));
      if (responses?.some(response => !response.ok)) throw new Error("音源の取得に失敗しました。");
      const previous = this.pack;
      await this.synth.soundBankManager.addSoundBank(file ? await file.arrayBuffer() : joinBuffers(await Promise.all(responses!.map(response => response.arrayBuffer()))), id);
      this.synth.soundBankManager.priorityOrder = [id, ...this.synth.soundBankManager.priorityOrder.filter(item => item !== id)];
      if (previous) await this.synth.soundBankManager.deleteSoundBank(previous);
      this.pack = id;
    }
  }

  private schedule(notes: NoteEvent[], bpm: number, start: number) {
    if (!this.synth) return;
    const channels = new Map<number, number>();
    let nextChannel = 0;
    for (const instrument of new Set(notes.map(note => note.instrument))) {
      const channel = instrument === 128 ? 9 : nextChannel === 9 ? ++nextChannel : nextChannel;
      channels.set(instrument, channel);
      if (instrument === 128) this.synth.midiChannels[channel].setDrums(true);
      else { this.synth.programChange(channel, instrument, { time: start }); nextChannel++; }
      const [reverb, chorus] = effectSends(instrument);
      this.synth.controllerChange(channel, 10 as Parameters<Synth["controllerChange"]>[1], 64, { time: start });
      this.synth.controllerChange(channel, 91 as Parameters<Synth["controllerChange"]>[1], reverb, { time: start });
      this.synth.controllerChange(channel, 93 as Parameters<Synth["controllerChange"]>[1], chorus, { time: start });
    }
    const secondsPerBeat = 60 / bpm;
    for (const note of notes) {
      const channel = channels.get(note.instrument) ?? 0;
      this.synth.noteOn(channel, note.pitch, note.velocity, { time: start + note.beat * secondsPerBeat });
      this.synth.noteOff(channel, note.pitch, { time: start + (note.beat + note.duration) * secondsPerBeat });
    }
  }

  private mark(time: number, callback: () => void) {
    if (!this.context) return;
    const source = this.context.createConstantSource();
    const gain = this.context.createGain();
    gain.gain.value = 0;
    source.connect(gain).connect(this.context.destination);
    source.onended = callback;
    source.start();
    source.stop(time);
    this.marker = source;
  }

  play(song: Song, onFinish: () => void) {
    if (!this.context || !this.synth) return;
    const token = ++this.token;
    this.synth.stopAll(true);
    const start = this.context.currentTime + .08;
    this.startedAt = start;
    this.duration = song.plan.durationSeconds;
    this.schedule(song.notes, song.plan.bpm, start);
    this.mark(start + song.plan.durationSeconds + 1, () => token === this.token && onFinish());
  }

  extend(song: Song, onFinish: () => void) {
    if (!this.context) return;
    this.startedAt = this.context.currentTime - song.plan.durationSeconds;
    this.duration = song.plan.durationSeconds;
    const beats = 32;
    const total = song.plan.chords.length * 4;
    const notes = song.notes.filter(note => note.beat >= total - beats).map(note => ({ ...note, beat: note.beat - (total - beats) }));
    const start = this.context.currentTime + .03;
    const token = ++this.token;
    this.schedule(notes, song.plan.bpm, start);
    this.mark(start + beats * 60 / song.plan.bpm, () => token === this.token && onFinish());
  }

  async pause() { await this.context?.suspend(); }
  async resume() { await this.context?.resume(); }

  stop(discardScheduled = false) {
    this.token++;
    this.startedAt = undefined;
    this.duration = 0;
    this.synth?.stopAll(true);
    if (this.marker) { this.marker.onended = null; this.marker.disconnect(); this.marker = undefined; }
    if (discardScheduled && this.synth) {
      this.synth.destroy();
      this.synth = undefined;
      this.pack = undefined;
    }
  }
}
