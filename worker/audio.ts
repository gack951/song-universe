type AudioObject = { body: ReadableStream; size: number; httpEtag: string; writeHttpMetadata(headers: Headers): void };
type Env = { AUDIO: { get(key: string): Promise<AudioObject | null> } };

export default {
  async fetch(request: Request, env: Env) {
    const headers = new Headers({ "Access-Control-Allow-Origin": "*" });
    if (!["GET", "HEAD"].includes(request.method) || new URL(request.url).pathname !== "/MuseScore_General_Full.sf3") return new Response("Not found", { status: 404, headers });
    const object = await env.AUDIO.get("MuseScore_General_Full.sf3");
    if (!object) return new Response("Not found", { status: 404, headers });
    object.writeHttpMetadata(headers);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("Content-Length", String(object.size));
    headers.set("ETag", object.httpEtag);
    return new Response(request.method === "HEAD" ? null : object.body, { headers });
  },
};
