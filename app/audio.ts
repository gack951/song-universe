import type { NoteEvent, Song } from "./music";

type Synth = import("spessasynth_lib").WorkletSynthesizer;

export const soundfontUrl = (pack: string) => `/soundfonts/${pack}.sf3?v=2`;

export class AudioEngine {
  context?: AudioContext;
  synth?: Synth;
  pack?: string;
  marker?: AudioScheduledSourceNode;
  token = 0;

  async prepare(pack: string) {
    this.context ??= new AudioContext({ latencyHint: "playback" });
    await this.context.resume();
    if (!this.synth) {
      await this.context.audioWorklet.addModule("/worklets/spessasynth_processor.min.js");
      const { WorkletSynthesizer } = await import("spessasynth_lib");
      this.synth = new WorkletSynthesizer(this.context, { eventsEnabled: false });
      this.synth.connect(this.context.destination);
      await this.synth.isReady;
    }
    if (this.pack !== pack) {
      const response = await caches.match(soundfontUrl(pack)) ?? await fetch(soundfontUrl(pack));
      if (!response.ok) throw new Error("音源の取得に失敗しました。");
      const previous = this.pack;
      await this.synth.soundBankManager.addSoundBank(await response.arrayBuffer(), pack);
      this.synth.soundBankManager.priorityOrder = [pack, ...this.synth.soundBankManager.priorityOrder.filter(id => id !== pack)];
      if (previous) await this.synth.soundBankManager.deleteSoundBank(previous);
      this.pack = pack;
    }
  }

  private schedule(notes: NoteEvent[], bpm: number, start: number) {
    if (!this.synth) return;
    const channels = new Map<number, number>();
    let nextChannel = 0;
    for (const instrument of new Set(notes.map(note => note.instrument))) {
      if (instrument === 128) { channels.set(instrument, 9); this.synth.midiChannels[9].setDrums(true); continue; }
      if (nextChannel === 9) nextChannel++;
      channels.set(instrument, nextChannel);
      this.synth.programChange(nextChannel, instrument, { time: start });
      nextChannel++;
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
    this.schedule(song.notes, song.plan.bpm, start);
    this.mark(start + song.plan.durationSeconds + 1, () => token === this.token && onFinish());
  }

  extend(song: Song, onFinish: () => void) {
    if (!this.context) return;
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
    this.synth?.stopAll(true);
    if (this.marker) { this.marker.onended = null; this.marker.disconnect(); this.marker = undefined; }
    if (discardScheduled && this.synth) {
      this.synth.destroy();
      this.synth = undefined;
      this.pack = undefined;
    }
  }
}
