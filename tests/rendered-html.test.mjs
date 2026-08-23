import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("server renders the one-screen player shell", async () => {
  const workerUrl = new URL(`../dist/server/index.js?${Date.now()}`, import.meta.url);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /SONG UNIVERSE/);
  assert.match(html, /次の曲のジャンル/);
  assert.match(html, /aria-label="最初の曲を再生"/);
  assert.doesNotMatch(html, /ENDLESS|ON-DEVICE|AI COMPOSED|NO HISTORY|LOCAL ONLY/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("service worker never pins an old application shell", async () => {
  const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(source, /request\.mode === "navigate"/);
  assert.match(source, /fetch\(event\.request\).*catch\(\(\) => caches\.match\("\/"\)/);
  assert.match(source, /pathname\.startsWith\("\/soundfonts\/"\)\) return/);
  assert.doesNotMatch(source.match(/const SHELL = \[(.*?)\]/)?.[1] ?? "", /"\/"/);
});
