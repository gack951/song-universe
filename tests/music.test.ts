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
    assert.ok(Object.values(GENRES[genre].instruments).every(pool => pool.length >= 2));
    assert.equal(first.instruments.lead.length, GENRES[genre].layers.lead);
    assert.equal(first.instruments.harmony.length, GENRES[genre].layers.harmony);
    assert.equal(first.instruments.color.length, GENRES[genre].layers.color);
    assert.equal(new Set([...first.instruments.lead, ...first.instruments.harmony, first.instruments.bass, ...first.instruments.color]).size, GENRES[genre].layers.lead + GENRES[genre].layers.harmony + GENRES[genre].layers.color + 1);
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

test("the in-memory 32-song fingerprint window rejects near repeats", () => {
  const plan = createTrackPlan("fingerprint", "jazz");
  const value = fingerprint(ruleTheme(plan));
  const history = Array.from({ length: 32 }, (_, i) => i === 31 ? value : `unique-${i}`);
  assert.equal(tooSimilar(value, history), true);
  assert.equal(tooSimilar("1:1|2:2|3:3", history), false);
});
