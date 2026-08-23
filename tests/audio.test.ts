import assert from "node:assert/strict";
import test from "node:test";
import { AudioEngine, effectSends, joinBuffers, soundfontUrls, validateSoundfontFile } from "../app/audio.ts";

test("split standard soundfonts reassemble in order", () => {
  assert.deepEqual(soundfontUrls("jazz-bigband"), ["/soundfonts/jazz-bigband.sf3.0?v=4", "/soundfonts/jazz-bigband.sf3.1?v=4", "/soundfonts/jazz-bigband.sf3.2?v=4"]);
  assert.deepEqual([...new Uint8Array(joinBuffers([Uint8Array.of(1, 2).buffer, Uint8Array.of(3).buffer]))], [1, 2, 3]);
});

test("local rich soundfonts are bounded and type checked", () => {
  assert.doesNotThrow(() => validateSoundfontFile({ name: "studio.sf3", size: 200_000_000 }));
  assert.throws(() => validateSoundfontFile({ name: "song.mp3", size: 2_000_000 }), /SF2 \/ SF3/);
  assert.throws(() => validateSoundfontFile({ name: "huge.sf2", size: 513 * 1024 * 1024 }), /512MB/);
});

test("reverb and chorus stay restrained on the rhythm section", () => {
  assert.deepEqual(effectSends(56), [48, 20]);
  assert.deepEqual(effectSends(33), [24, 8]);
  assert.deepEqual(effectSends(128), [16, 0]);
});

test("manual stop destroys the worklet so queued notes cannot leak into the next song", () => {
  const engine = new AudioEngine();
  let stopped = 0;
  let destroyed = 0;
  engine.synth = {
    stopAll: () => { stopped++; },
    destroy: () => { destroyed++; },
  } as unknown as NonNullable<typeof engine.synth>;
  engine.pack = "jazz-bigband";

  engine.stop(true);

  assert.equal(stopped, 1);
  assert.equal(destroyed, 1);
  assert.equal(engine.synth, undefined);
  assert.equal(engine.pack, undefined);
});

test("natural song endings keep the prepared worklet", () => {
  const engine = new AudioEngine();
  const synth = {
    stopAll: () => {},
    destroy: () => assert.fail("natural transition must not destroy the worklet"),
  } as unknown as NonNullable<typeof engine.synth>;
  engine.synth = synth;

  engine.stop();

  assert.equal(engine.synth, synth);
});

test("playback position follows AudioContext time and stays within the song", () => {
  const engine = new AudioEngine();
  engine.context = { currentTime: 42 } as AudioContext;
  engine.startedAt = 12;
  engine.duration = 100;
  assert.equal(engine.position, 30);
  engine.context = { currentTime: 200 } as AudioContext;
  assert.equal(engine.position, 100);
});
