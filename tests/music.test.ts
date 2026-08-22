import assert from "node:assert/strict";
import test from "node:test";
import { GENRES, RANGES, buildSong, createTrackPlan, eighthNoteMilliseconds, fingerprint, ruleTheme, tooSimilar, type Genre } from "../app/music.ts";

const genres = Object.keys(GENRES) as Genre[];

test("piano roll clock follows an eighth note at the song BPM", () => {
  assert.equal(eighthNoteMilliseconds(60), 500);
  assert.equal(eighthNoteMilliseconds(120), 250);
});

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

test("classical leads harmonize while big band leads trade phrases", () => {
  for (let seed = 0; seed < 6; seed++) {
    const plan = createTrackPlan(`classical-voicing-${seed}`, "classical");
    const song = buildSong(plan);
    const [lead, harmony] = plan.instruments.lead;
    const primary = song.notes.filter(note => note.instrument === lead);
    const secondary = song.notes.filter(note => note.instrument === harmony);
    assert.equal(secondary.length, primary.length);
    primary.forEach(note => {
      const partner = secondary.find(other => other.beat === note.beat && other.duration === note.duration);
      assert.ok(partner, `classical lead rhythm diverged at ${note.beat}`);
      assert.ok([3, 4, 5, 7, 8, 9].includes(Math.abs(partner.pitch - note.pitch) % 12), `classical lead voices clash at ${note.beat}`);
    });
  }
  for (let seed = 0; seed < 6; seed++) {
    const plan = createTrackPlan(`bigband-response-${seed}`, "bigBand");
    const song = buildSong(plan);
    const [first, second] = plan.instruments.lead.map(instrument => song.notes.filter(note => note.instrument === instrument));
    const overlaps = first.filter(note => second.some(other => other.beat === note.beat));
    assert.ok(first.length && second.length);
    assert.ok(overlaps.length / Math.min(first.length, second.length) < .25, "big band leads harmonize too often");
    assert.ok(overlaps.every(note => second.some(other => other.beat === note.beat && [3, 4, 5, 7, 8, 9].includes(Math.abs(other.pitch - note.pitch) % 12))), "big band cadence clashes");
  }
});

test("phrases and sections cadence, with controlled chromatic turns in jazz and pop", () => {
  const roots = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  for (const genre of genres) {
    const plan = createTrackPlan(`cadence-${genre}`, genre);
    const tonic = roots.indexOf(plan.key.replace("♭", "b").replace("♯", "#"));
    plan.sections.forEach(section => {
      const tail = plan.chords.slice(section.startBar + section.bars - 3, section.startBar + section.bars).map(chord => roots.indexOf(chord.match(/^[A-G](?:b|#)?/)![0]));
      assert.ok(tail.includes((tonic + 7) % 12));
      assert.equal(tail.at(-1), tonic);
    });
    const song = buildSong(plan);
    for (let startBar = 0; startBar < plan.chords.length; startBar += 4) {
      const end = (startBar + 4) * 4;
      const leads = song.notes.filter(note => plan.instruments.lead.includes(note.instrument) && note.beat >= startBar * 4 && note.beat < end);
      const lastBeat = Math.max(...leads.map(note => note.beat));
      const root = roots.indexOf(plan.chords[startBar + 3].match(/^[A-G](?:b|#)?/)![0]);
      assert.ok(end - Math.max(...leads.map(note => note.beat + note.duration)) >= .5);
      assert.ok(leads.some(note => note.beat === lastBeat && note.pitch % 12 === root));
    }
  }
  for (const genre of ["jazz", "pop"] as const) {
    const plan = createTrackPlan(`chromatic-${genre}`, genre);
    const tonic = roots.indexOf(plan.key.replace("♭", "b").replace("♯", "#"));
    const diatonic = new Set([0, 2, 4, 5, 7, 9, 11].map(step => (tonic + step) % 12));
    assert.ok(plan.chords.some(chord => !diatonic.has(roots.indexOf(chord.match(/^[A-G](?:b|#)?/)![0]))));
  }
});

test("jazz and big band use swing as their basic eighth-note feel", () => {
  for (const genre of ["jazz", "bigBand"] as const) {
    const plan = createTrackPlan(`${genre}-metric-phrasing`, genre);
    plan.sections.forEach(section => { section.energy = 1; });
    const song = buildSong(plan, Array.from({ length: 32 }, (_, index) => ({ beat: index * .25, duration: .25, pitch: 54 + index % 19, velocity: 90, instrument: plan.instruments.lead[0] })), [{ beat: .5, duration: .1, pitch: 49, velocity: 90, instrument: 128 }]);
    song.notes.filter(note => plan.instruments.lead.includes(note.instrument)).forEach(note => {
      const position = note.beat - Math.floor(note.beat);
      assert.ok(Math.abs(position) < 1e-9 || Math.abs(position - GENRES[genre].swing) < 1e-9, `off-grid ${genre} onset ${note.beat}`);
    });
    assert.ok(song.notes.some(note => note.instrument === 128 && note.pitch === 49 && Math.abs(note.beat % 1 - GENRES[genre].swing) < 1e-9), `${genre} AI drum stayed straight`);
  }
});

test("melodies occasionally enter offbeat and sustain across a strong beat", () => {
  for (const genre of genres) {
    let syncopatedBars = 0, bars = 0, sustained = 0;
    for (let seed = 0; seed < 12; seed++) {
      const plan = createTrackPlan(`${genre}-syncopation-${seed}`, genre);
      const melody = buildSong(plan).notes.filter(note => plan.instruments.lead.includes(note.instrument));
      for (let bar = 0; bar < plan.chords.length; bar++) {
        const notes = melody.filter(note => note.beat >= bar * 4 && note.beat < (bar + 1) * 4);
        if (notes.length && Math.min(...notes.map(note => note.beat)) > bar * 4 + .1) syncopatedBars++;
        sustained += notes.filter(note => note.beat % 1 > .1 && note.beat + note.duration > Math.ceil(note.beat)).length;
        bars++;
      }
    }
    assert.ok(syncopatedBars > 0 && syncopatedBars / bars < .2, `${genre} syncopation is not occasional`);
    assert.ok(sustained > 0, `${genre} has no tied syncopation`);
  }
});

test("melodies form four-bar periods and rest only at phrase boundaries", () => {
  for (const genre of genres) {
    const plan = createTrackPlan(`phrasing-${genre}`, genre);
    const song = buildSong(plan);
    const melody = song.notes.filter(note => plan.genre === "bigBand" ? plan.instruments.lead.includes(note.instrument) : note.instrument === plan.instruments.lead[0]);
    for (let start = 0; start < plan.chords.length * 4; start += 16) {
      const phrase = melody.filter(note => note.beat >= start && note.beat < start + 16);
      assert.ok(phrase.some(note => Math.abs(note.beat - start) < 1e-9), `${genre} enters late in a phrase`);
      assert.ok([0, 4, 8, 12].every(bar => phrase.some(note => note.beat >= start + bar && note.beat < start + bar + 4)), `${genre} leaves a bar empty`);
      assert.ok(start + 16 - Math.max(...phrase.map(note => note.beat + note.duration)) >= .5, `${genre} lacks a phrase boundary`);
      for (let index = 1; index < phrase.length; index++) assert.ok(phrase[index].beat - (phrase[index - 1].beat + phrase[index - 1].duration) <= .8 + 1e-9, `${genre} has an arbitrary long rest`);
    }
  }
});

test("the in-memory 32-song fingerprint window rejects near repeats", () => {
  const plan = createTrackPlan("fingerprint", "jazz");
  const value = fingerprint(ruleTheme(plan));
  const history = Array.from({ length: 32 }, (_, i) => i === 31 ? value : `unique-${i}`);
  assert.equal(tooSimilar(value, history), true);
  assert.equal(tooSimilar("1:1|2:2|3:3", history), false);
});
