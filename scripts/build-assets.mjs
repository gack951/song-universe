import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createOggEncoder } from "wasm-media-encoders";
import { BasicSoundBank, SoundBankLoader } from "spessasynth_core";

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error("Usage: node scripts/build-assets.mjs GeneralUser-GS.sf2");

const programs = {
  "jazz-bigband": new Set([0, 4, 11, 16, 32, 56, 57, 60, 64, 65, 66, 67]),
  "funk-rock-pop": new Set([4, 5, 16, 27, 29, 30, 33, 34, 36, 80, 88]),
  classical: new Set([0, 40, 41, 42, 43, 46, 47, 56, 60, 68, 70, 71, 73]),
};

const source = SoundBankLoader.fromArrayBuffer((await readFile(sourcePath)).buffer);
await mkdir("public/soundfonts", { recursive: true });

async function encodeVorbis(audioData, sampleRate) {
  const encoder = await createOggEncoder();
  encoder.configure({ channels: 1, sampleRate, vbrQuality: 2 });
  const first = Uint8Array.from(encoder.encode([audioData]));
  const last = Uint8Array.from(encoder.finalize());
  const result = new Uint8Array(first.length + last.length);
  result.set(first);
  result.set(last, first.length);
  return result;
}

for (const [name, allowed] of Object.entries(programs)) {
  const bank = BasicSoundBank.copyFrom(source);
  for (const preset of [...bank.presets]) {
    if (!preset.isDrum && !allowed.has(preset.program)) bank.deletePreset(preset);
  }
  bank.removeUnusedElements();
  await bank.setSampleFormat({ format: "compressed", compressionFunction: encodeVorbis });
  await writeFile(`public/soundfonts/${name}.sf3`, new Uint8Array(bank.writeSF2()));
}
