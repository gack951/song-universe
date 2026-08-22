import assert from "node:assert/strict";
import test from "node:test";

test("server renders the one-screen player shell", async () => {
  const workerUrl = new URL(`../dist/server/index.js?${Date.now()}`, import.meta.url);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /SONG UNIVERSE/);
  assert.match(html, /その瞬間だけの音楽/);
  assert.match(html, /NEXT GENRE/);
  assert.match(html, /aria-label="最初の曲を再生"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});
