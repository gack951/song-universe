import assert from "node:assert/strict";
import test from "node:test";
import { AudioEngine } from "../app/audio.ts";

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
