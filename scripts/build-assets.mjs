import { mkdir, readFile, writeFile } from "node:fs/promises";
import { BasicSoundBank, SoundBankLoader } from "spessasynth_core";

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error("Usage: node scripts/build-assets.mjs MuseScore_General.sf3");

const programs = {
  "jazz-bigband": new Set([0, 4, 11, 16, 26, 32, 33, 34, 56, 57, 60, 64, 65, 66, 67]),
  "funk-rock-pop": new Set([0, 4, 5, 11, 16, 27, 28, 29, 30, 32, 33, 34, 36, 37, 38, 39, 48, 52, 73, 80, 81, 88, 89]),
  classical: new Set([0, 6, 40, 41, 42, 43, 46, 48, 60, 68, 70, 71, 73]),
  "music-box": new Set([0, 8, 9, 10, 11, 42, 43, 46]),
};

const source = SoundBankLoader.fromArrayBuffer((await readFile(sourcePath)).buffer);
await mkdir("public/soundfonts", { recursive: true });

for (const [name, allowed] of Object.entries(programs)) {
  const bank = BasicSoundBank.copyFrom(source);
  for (const preset of [...bank.presets]) {
    const standard = preset.bankMSB === 0 && preset.bankLSB === 0;
    if (!standard || (preset.isDrum ? preset.program !== 0 : !allowed.has(preset.program))) bank.deletePreset(preset);
  }
  bank.removeUnusedElements();
  const bytes = new Uint8Array(bank.writeSF2());
  for (let index = 0; index < 3; index++) await writeFile(`public/soundfonts/${name}.sf3.${index}`, bytes.slice(index * 8 * 1024 * 1024, (index + 1) * 8 * 1024 * 1024));
}
