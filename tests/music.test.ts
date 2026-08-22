import assert from "node:assert/strict";
import test from "node:test";
import { GENRES, RANGES, buildSong, createTrackPlan, fingerprint, ruleTheme, tooSimilar, type Genre } from "../app/music.ts";

const genres = Object.keys(GENRES) as Genre[];

test("plans are deterministic and stay inside every genre contract", () => {
  for (const genre of genres) {
    const first = createTrackPlan(`fixed-${genre}`, genre);
    assert.deepEqual(first, createTrackPlan(`fixed-${genre}`, genre));
    assert.ok(first.durationSeconds >= 90 && first.durationSeconds <= 360);
    assert.ok(first.bpm >= GENRES[genre].bpm[0] && first.bpm <= GENRES[genre].bpm[1]);
    assert.deepEqual(first.form, GENRES[genre].form);
    assert.ok(first.chords.length > 20);
    assert.equal(first.sections[0].startBar, 0);
    assert.equal(first.sections.at(-1)!.startBar + first.sections.at(-1)!.bars, first.chords.length);
    first.sections.forEach((section, index) => {
      assert.equal(section.startBar, first.sections.slice(0, index).reduce((bars, part) => bars + part.bars, 0));
      assert.equal(section.bars % 4, 0);
      assert.ok(section.energy >= .25 && section.energy <= 1);
    });
    assert.ok(Object.values(GENRES[genre].instruments).every(pool => pool.length >= 2));
    assert.equal(first.instruments.lead.length, GENRES[genre].layers.lead);
    assert.equal(first.instruments.harmony.length, GENRES[genre].layers.harmony);
    assert.equal(first.instruments.color.length, GENRES[genre].layers.color);
    assert.equal(new Set([...first.instruments.lead, ...first.instruments.harmony, first.instruments.bass, ...first.instruments.color]).size, GENRES[genre].layers.lead + GENRES[genre].layers.harmony + GENRES[genre].layers.color + 1);
  }
});

test("sections change dynamics and introduce melodies independent from the theme", () => {
  for (const genre of genres) {
    const plan = createTrackPlan(`variation-${genre}`, genre);
    const song = buildSong(plan, ruleTheme(plan));
    const leads = new Set(plan.instruments.lead);
    const signatures: string[] = [];
    for (let bar = 0; bar < plan.chords.length; bar += 4) {
      const phrase = song.notes.filter(note => leads.has(note.instrument) && note.beat >= bar * 4 && note.beat < (bar + 4) * 4 && note.instrument === plan.instruments.lead[0]);
      if (!phrase.length) continue;
      const firstPitch = phrase[0].pitch;
      signatures.push(phrase.slice(0, 20).map(note => `${(note.beat - bar * 4).toFixed(2)}:${note.pitch - firstPitch}:${note.duration.toFixed(2)}`).join("|"));
    }
    const counts = [...new Set(signatures)].map(signature => signatures.filter(value => value === signature).length);
    assert.ok(new Set(signatures).size >= Math.min(4, Math.ceil(signatures.length / 3)), `${genre} lacks melodic variety`);
    assert.ok(Math.max(...counts) <= Math.max(2, Math.ceil(signatures.length * .35)), `${genre} repeats one phrase too often`);
    const densities = plan.sections.map(section => song.notes.filter(note => note.beat >= section.startBar * 4 && note.beat < (section.startBar + section.bars) * 4).length / section.bars);
    assert.ok(Math.max(...densities) - Math.min(...densities) > 2, `${genre} sections do not change intensity`);
  }
});

test("songs contain theme, harmony, bass, rhythm and a bounded cadence", () => {
  for (const genre of genres) {
    const plan = createTrackPlan(`song-${genre}`, genre);
    const theme = ruleTheme(plan);
    const song = buildSong(plan, theme);
    for (const instrument of [...plan.instruments.lead, ...plan.instruments.harmony, plan.instruments.bass, ...plan.instruments.color]) assert.ok(song.notes.some(note => note.instrument === instrument));
    assert.ok(song.notes.some(note => genre === "classical" ? note.beat % 1 === .5 : note.instrument === 128));
    assert.ok(song.notes.some(note => note.beat >= plan.chords.length * 4 - 4));
    const keys = new Set<string>();
    for (const note of song.notes) {
      assert.ok(note.beat >= 0 && note.duration > 0);
      assert.ok(note.beat + note.duration <= plan.chords.length * 4 + 1e-9);
      const [low, high] = RANGES[note.instrument];
      assert.ok(note.pitch >= low && note.pitch <= high);
      const key = `${note.beat.toFixed(3)}:${note.pitch}:${note.instrument}`;
      assert.ok(!keys.has(key), `duplicate ${key}`); keys.add(key);
    }
  }
});

test("instrumentation varies by song and expands big band and classical ensembles", () => {
  for (const genre of genres) {
    const arrangements = new Set(Array.from({ length: 16 }, (_, index) => JSON.stringify(createTrackPlan(`${genre}-${index}`, genre).instruments)));
    assert.ok(arrangements.size > 1, `${genre} instrumentation did not vary`);
  }
  for (const genre of ["bigBand", "classical"] as const) {
    const plan = createTrackPlan(`expanded-${genre}`, genre);
    const notes = buildSong(plan).notes;
    const simultaneous = Math.max(...notes.map(({ beat }) => new Set(notes.filter(note => note.beat <= beat && note.beat + note.duration > beat).map(note => note.instrument)).size));
    assert.ok(simultaneous >= (genre === "bigBand" ? 7 : 6));
  }
});

test("ensemble lead voices share phrasing without harmonic collisions", () => {
  for (const genre of ["bigBand", "classical"] as const) for (let seed = 0; seed < 6; seed++) {
    const plan = createTrackPlan(`${genre}-voicing-${seed}`, genre);
    const song = buildSong(plan);
    const [lead, harmony] = plan.instruments.lead;
    const primary = song.notes.filter(note => note.instrument === lead);
    const secondary = song.notes.filter(note => note.instrument === harmony);
    assert.equal(secondary.length, primary.length);
    primary.forEach(note => {
      const partner = secondary.find(other => other.beat === note.beat && other.duration === note.duration);
      assert.ok(partner, `${genre} lead rhythm diverged at ${note.beat}`);
      assert.ok([3, 4, 5, 7, 8, 9].includes(Math.abs(partner.pitch - note.pitch) % 12), `${genre} lead voices clash at ${note.beat}`);
    });
  }
});

test("jazz melody onsets stay on the beat or swung eighth grid", () => {
  const plan = createTrackPlan("jazz-metric-phrasing", "jazz");
  const song = buildSong(plan, Array.from({ length: 32 }, (_, index) => ({ beat: index * .25, duration: .25, pitch: 54 + index % 19, velocity: 90, instrument: plan.instruments.lead[0] })));
  song.notes.filter(note => plan.instruments.lead.includes(note.instrument)).forEach(note => {
    const position = note.beat - Math.floor(note.beat);
    assert.ok(Math.abs(position) < 1e-9 || Math.abs(position - GENRES.jazz.swing) < 1e-9, `off-grid jazz onset ${note.beat}`);
  });
});

test("the in-memory 32-song fingerprint window rejects near repeats", () => {
  const plan = createTrackPlan("fingerprint", "jazz");
  const value = fingerprint(ruleTheme(plan));
  const history = Array.from({ length: 32 }, (_, i) => i === 31 ? value : `unique-${i}`);
  assert.equal(tooSimilar(value, history), true);
  assert.equal(tooSimilar("1:1|2:2|3:3", history), false);
});
