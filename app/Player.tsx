"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AudioEngine } from "./audio";
import { GENRES, aiParts, buildSong, createTrackPlan, initializeAI, newSeed, tooSimilar, type Genre, type PlaybackState, type Song } from "./music";

const engine = new AudioEngine();
const genreOrder = Object.keys(GENRES) as Genre[];

async function cacheAsset(url: string) {
  const cache = await caches.open("song-universe-assets-v1");
  if (!await cache.match(url)) await cache.add(url);
}

function Visualizer({ song, active }: { song?: Song; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !song) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const resize = () => { const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * devicePixelRatio; canvas.height = rect.height * devicePixelRatio; context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); };
    const draw = (time = 0) => {
      const width = canvas.clientWidth, height = canvas.clientHeight;
      const hue = [...song.plan.seed].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 360;
      context.clearRect(0, 0, width, height);
      context.fillStyle = `hsl(${hue} 48% 9%)`; context.fillRect(0, 0, width, height);
      const pulse = active && !reduced ? Math.sin(time / 280 * song.plan.bpm / 100) * 8 : 0;
      for (let i = 0; i < 9; i++) {
        const angle = i * Math.PI * 2 / 9 + (active && !reduced ? time / 18000 : 0);
        const radius = 44 + i * 10 + pulse;
        context.beginPath();
        context.arc(width / 2 + Math.cos(angle) * radius, height / 2 + Math.sin(angle) * radius, 7 + (i % 3) * 6, 0, Math.PI * 2);
        context.fillStyle = `hsla(${(hue + i * 23) % 360} 85% 63% / ${.24 + i * .045})`;
        context.fill();
      }
      context.strokeStyle = `hsl(${(hue + 42) % 360} 90% 70% / .72)`;
      context.lineWidth = 2;
      context.beginPath();
      song.notes.filter(note => note.instrument !== 128).slice(0, 24).forEach((note, i) => { const x = i / 23 * width; const y = height * .72 - (note.pitch - 60) * 2.1; if (!i) context.moveTo(x, y); else context.lineTo(x, y); });
      context.stroke();
      if (active && !reduced && !document.hidden) frame = requestAnimationFrame(draw);
    };
    resize(); draw();
    const observer = new ResizeObserver(() => { resize(); draw(); }); observer.observe(canvas);
    const visibility = () => { cancelAnimationFrame(frame); if (!document.hidden && active && !reduced) frame = requestAnimationFrame(draw); };
    document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, [song, active]);
  return <canvas ref={canvasRef} className="visual" aria-label="曲の主題とリズムを表す抽象ビジュアル" />;
}

export default function Player() {
  const [genre, setGenre] = useState<Genre>("jazz");
  const [state, setState] = useState<PlaybackState>("loading");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("準備を始めています");
  const [current, setCurrent] = useState<Song>();
  const [error, setError] = useState("");
  const queue = useRef<Song[]>([]);
  const history = useRef<string[]>([]);
  const desiredGenre = useRef<Genre>(genre);
  const generation = useRef(0);
  const currentRef = useRef<Song | undefined>(undefined);
  const started = useRef(false);
  const extended = useRef(false);
  const transitioning = useRef(false);

  const compose = useCallback(async (targetGenre: Genre) => {
    const plan = createTrackPlan(newSeed(), targetGenre);
    let parts: Awaited<ReturnType<typeof aiParts>> | undefined;
    try {
      parts = await aiParts(plan);
      if (tooSimilar(buildSong(plan, parts.theme, parts.drums).fingerprint, history.current)) parts = await aiParts(plan, true);
    } catch { /* Rule composition keeps playback alive. */ }
    const song = buildSong(plan, parts?.theme, parts?.drums);
    if (tooSimilar(song.fingerprint, history.current)) return buildSong(createTrackPlan(`${plan.seed}-fresh`, targetGenre));
    history.current = [...history.current, song.fingerprint].slice(-32);
    return song;
  }, []);

  const fillQueue = useCallback(async (targetGenre: Genre, keepCurrent = false) => {
    const id = ++generation.current;
    const kept = keepCurrent && queue.current[0] ? [queue.current[0]] : [];
    const needed = 3 - kept.length;
    const songs: Song[] = [];
    for (let i = 0; i < needed; i++) songs.push(await compose(targetGenre));
    if (id === generation.current) queue.current = [...kept, ...songs];
  }, [compose]);

  const prepare = useCallback(async () => {
    setError(""); setState("loading"); setProgress(0);
    try {
      if (!("AudioWorkletNode" in window)) throw new Error("AudioWorkletを利用できません。この端末は対象外です。");
      await initializeAI((value, label) => { setProgress(value); setProgressLabel(label); });
      await cacheAsset(`/soundfonts/${GENRES[desiredGenre.current].pack}.sf3`);
      setProgress(90); setProgressLabel("3曲を先読み中");
      await fillQueue(desiredGenre.current);
      setProgress(100); setProgressLabel("準備完了"); setState("paused");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "準備に失敗しました。"); setState("error"); }
  }, [fillQueue]);

  const updateMediaSession = useCallback((song: Song) => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: song.plan.title, artist: `${GENRES[song.plan.genre].label}・${song.plan.mood}`, album: "SONG UNIVERSE", artwork: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }] });
    navigator.mediaSession.playbackState = "playing";
  }, []);

  const advanceRef = useRef<(discardScheduled?: boolean) => Promise<void>>(async () => {});
  const playSong = useCallback(async (song: Song) => {
    setState("loading");
    await engine.prepare(GENRES[song.plan.genre].pack);
    engine.play(song, () => void advanceRef.current(false));
    queue.current[0] = song; currentRef.current = song; setCurrent(song); setState("playing"); updateMediaSession(song); extended.current = false;
    void (async () => { while (queue.current.length < 3) queue.current.push(await compose(desiredGenre.current)); })();
  }, [compose, updateMediaSession]);

  const advance = useCallback(async (discardScheduled = false) => {
    if (transitioning.current) return;
    transitioning.current = true;
    try {
      engine.stop(discardScheduled);
      if (queue.current[0] === currentRef.current) queue.current.shift();
      let next = queue.current[0];
      if (next && next.plan.genre !== desiredGenre.current) {
        generation.current++;
        setState("buffering");
        next = await compose(desiredGenre.current);
        queue.current = [next];
      }
      if (next) { await playSong(next); return; }
      if (!discardScheduled && !extended.current && currentRef.current) {
        extended.current = true; setState("playing");
        engine.extend(currentRef.current, () => void advanceRef.current(false));
        return;
      }
      setState("buffering");
      const song = await compose(desiredGenre.current); queue.current = [song]; await playSong(song);
    } finally { transitioning.current = false; }
  }, [compose, playSong]);
  useEffect(() => { advanceRef.current = advance; }, [advance]);

  const toggle = useCallback(async () => {
    try {
      if (!started.current) {
        if (transitioning.current) return;
        transitioning.current = true;
        try {
          const targetGenre = desiredGenre.current;
          let first = queue.current[0];
          if (!first || first.plan.genre !== targetGenre) {
            generation.current++;
            setState("loading");
            first = await compose(targetGenre);
            queue.current = [first];
          }
          started.current = true;
          await playSong(first);
        } finally { transitioning.current = false; }
        return;
      }
      if (state === "playing") { await engine.pause(); setState("paused"); if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused"; }
      else { await engine.resume(); setState("playing"); if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing"; }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "再生できませんでした。"); setState("error"); }
  }, [compose, playSong, state]);

  const chooseGenre = useCallback((next: Genre) => {
    setGenre(next); desiredGenre.current = next;
    void cacheAsset(`/soundfonts/${GENRES[next].pack}.sf3`);
    if (started.current && queue.current[0]) void fillQueue(next, true); else void fillQueue(next);
  }, [fillQueue]);

  useEffect(() => {
    const timer = setTimeout(() => void prepare(), 0);
    navigator.serviceWorker?.register("/sw.js");
    return () => { clearTimeout(timer); engine.stop(true); };
  }, [prepare]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.setActionHandler("play", () => void toggle());
    navigator.mediaSession.setActionHandler("pause", () => void toggle());
    navigator.mediaSession.setActionHandler("nexttrack", () => void advance(true));
    return () => { for (const action of ["play", "pause", "nexttrack"] as MediaSessionAction[]) navigator.mediaSession.setActionHandler(action, null); };
  }, [advance, toggle]);

  useEffect(() => {
    if (!engine.context) return;
    engine.context.onstatechange = () => { if (engine.context?.state === "interrupted") setState("paused"); };
  }, [current]);

  const ready = state !== "loading" && state !== "error";
  const playing = state === "playing";
  return <main>
    <header><span className="eyebrow">ENDLESS • ON-DEVICE</span><h1>SONG<br />UNIVERSE</h1><p>その瞬間だけの音楽を、端末の中で。</p></header>
    <section className="player" aria-live="polite">
      <Visualizer song={current} active={playing} />
      <div className="track-copy">
        <span className={`status ${state}`}>{state === "loading" ? progressLabel : state === "buffering" ? "次の曲を生成中" : playing ? "NOW PLAYING" : state === "paused" ? "PAUSED" : "ERROR"}</span>
        <h2>{current?.plan.title ?? (progress === 100 ? "準備ができました" : "新しい宇宙を生成中")}</h2>
        {current ? <p>{GENRES[current.plan.genre].label} <i /> {current.plan.mood} <i /> {current.plan.bpm} BPM</p> : <p>曲は保存されず、同じ瞬間は戻りません。</p>}
      </div>
      {state === "loading" && !current ? <div className="progress" role="progressbar" aria-valuenow={progress} aria-label={progressLabel}><span style={{ width: `${progress}%` }} /></div> : null}
      {error ? <div className="error" role="alert"><p>{error}</p><button onClick={() => void prepare()}>再取得・再試行</button></div> : null}
      <div className="controls">
        <button className="play" onClick={() => void toggle()} disabled={!ready} aria-label={playing ? "一時停止" : current ? "再生" : "最初の曲を再生"}>{playing ? "Ⅱ" : "▶"}</button>
        <button className="next" onClick={() => void advance(true)} disabled={!current || state === "loading"} aria-label="次の曲">NEXT <span>→</span></button>
      </div>
    </section>
    <nav aria-label="次の曲のジャンル"><span>NEXT GENRE</span><div>{genreOrder.map(item => <button key={item} className={genre === item ? "selected" : ""} onClick={() => chooseGenre(item)} aria-pressed={genre === item}>{GENRES[item].label}</button>)}</div></nav>
    <footer><span>AI COMPOSED</span><span>NO HISTORY</span><span>LOCAL ONLY</span></footer>
  </main>;
}
