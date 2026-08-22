"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AudioEngine, soundfontUrl } from "./audio";
import { GENRES, INSTRUMENT_NAMES, aiParts, buildSong, createTrackPlan, initializeAI, newSeed, tooSimilar, type Genre, type PlaybackState, type Song } from "./music";

const engine = new AudioEngine();
const genreOrder = Object.keys(GENRES) as Genre[];
const formNames: Record<string, string> = { intro: "イントロ", head: "テーマ", solo: "ソロ", solos: "ソロ", "shout chorus": "シャウトコーラス", coda: "コーダ", A: "A", B: "B", break: "ブレイク", outro: "アウトロ", verse: "ヴァース", chorus: "コーラス", bridge: "ブリッジ", prechorus: "プレコーラス", "final chorus": "最終コーラス", exposition: "提示部", development: "展開部", recapitulation: "再現部" };
const pitchNames = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];

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

function PianoRoll({ song, elapsed, active }: { song: Song; elapsed: number; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elapsedRef = useRef(elapsed);
  const drawRef = useRef<() => void>(() => {});
  useEffect(() => { elapsedRef.current = elapsed; drawRef.current(); }, [elapsed]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const instruments = song.plan.instruments.lead;
    const lead = new Set(instruments);
    const melody = song.notes.filter(note => lead.has(note.instrument));
    const low = Math.floor(Math.min(...melody.map(note => note.pitch)) / 12) * 12;
    const high = Math.ceil((Math.max(...melody.map(note => note.pitch)) + 1) / 12) * 12;
    let frame = 0;
    const resize = () => { const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * devicePixelRatio; canvas.height = rect.height * devicePixelRatio; context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); };
    const draw = () => {
      const width = canvas.clientWidth, height = canvas.clientHeight;
      const current = (active ? engine.position : elapsedRef.current) * song.plan.bpm / 60;
      const start = current - 3, span = 24;
      context.clearRect(0, 0, width, height); context.fillStyle = "#0b0a0e"; context.fillRect(0, 0, width, height);
      context.strokeStyle = "#29242e"; context.lineWidth = 1;
      for (let beat = Math.ceil(start); beat < start + span; beat++) { const x = (beat - start) / span * width; context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke(); }
      for (let pitch = low; pitch <= high; pitch += 12) { const y = (high - pitch) / Math.max(1, high - low) * height; context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke(); }
      melody.filter(note => note.beat + note.duration >= start && note.beat <= start + span).forEach(note => {
        const voice = instruments.indexOf(note.instrument);
        context.fillStyle = `hsl(${12 + voice * 92} 86% ${voice ? 67 : 62}%)`;
        context.fillRect((note.beat - start) / span * width, (high - note.pitch) / Math.max(1, high - low) * (height - 7), Math.max(3, note.duration / span * width), 6);
      });
      context.fillStyle = "#f6f0e8"; context.fillRect(3 / span * width - 1, 0, 2, height);
      if (active && !reduced && !document.hidden) frame = requestAnimationFrame(draw);
    };
    drawRef.current = draw;
    resize(); draw();
    const observer = new ResizeObserver(() => { resize(); draw(); }); observer.observe(canvas);
    const visibility = () => { cancelAnimationFrame(frame); if (!document.hidden && active && !reduced) frame = requestAnimationFrame(draw); };
    document.addEventListener("visibilitychange", visibility);
    return () => { drawRef.current = () => {}; cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, [song, active]);
  const names = song.plan.instruments.lead.map(program => INSTRUMENT_NAMES[program]);
  return <div className="piano-roll"><div className="piano-roll-heading"><h3>リアルタイム・ピアノロール</h3><span>{names.map((name, index) => <i key={name} style={{ color: `hsl(${12 + index * 92} 86% ${index ? 67 : 62}%)` }}>{name}</i>)}</span></div><canvas ref={canvasRef} role="img" aria-label={`旋律楽器: ${names.join("、")}`} /></div>;
}

function formatTime(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

function CompositionDetails({ song, elapsed, active }: { song: Song; elapsed: number; active: boolean }) {
  const { plan } = song;
  const totalBars = plan.chords.length;
  const currentBar = Math.min(totalBars, Math.floor(elapsed * plan.bpm / 240) + 1);
  const section = Math.max(0, plan.sections.findIndex(part => currentBar - 1 >= part.startBar && currentBar - 1 < part.startBar + part.bars));
  const theme = song.theme.slice(0, 24);
  const low = Math.min(...theme.map(note => note.pitch));
  const high = Math.max(...theme.map(note => note.pitch));
  const range = Math.max(1, high - low);
  const instruments = [
    ["主旋律", plan.instruments.lead],
    ["和声", plan.instruments.harmony],
    ["ベース", [plan.instruments.bass]],
    ["色付け", plan.instruments.color],
    ...(GENRES[plan.genre].drums === "none" ? [] : [["リズム", [128]]] as [string, number[]][]),
  ] as [string, number[]][];
  const melodyLabel = theme.map(note => `${pitchNames[note.pitch % 12]}${Math.floor(note.pitch / 12) - 1}`).join("、");

  return <section className="composition" aria-label="現在の曲の構成">
    <div className="composition-heading"><h3>曲の進行</h3><span>{formatTime(elapsed)} / {formatTime(plan.durationSeconds)}・{currentBar} / {totalBars}小節</span></div>
    <ol className="form" aria-label={`現在は${formNames[plan.sections[section].name] ?? plan.sections[section].name}`}>
      {plan.sections.map((part, index) => <li key={`${part.name}-${index}`} className={index === section ? "current" : index < section ? "passed" : ""}><span>{part.startBar + 1}–{part.startBar + part.bars}</span>{formNames[part.name] ?? part.name}</li>)}
    </ol>
    <PianoRoll song={song} elapsed={elapsed} active={active} />
    <div className="detail-grid">
      <div><h3>楽器構成</h3><dl className="instruments">{instruments.map(([role, programs]) => <div key={role}><dt>{role}</dt><dd>{programs.map(program => INSTRUMENT_NAMES[program]).join("・")}</dd></div>)}</dl></div>
      <div><h3>テーマのメロディー</h3><svg className="melody" viewBox="0 0 320 82" role="img" aria-label={`4小節のテーマ: ${melodyLabel}`}>
        <title>4小節のテーマメロディー</title>
        {[0, 1, 2, 3, 4].map(bar => <line key={bar} x1={bar * 80} x2={bar * 80} y1="0" y2="82" />)}
        {theme.map((note, index) => <rect key={`${note.beat}-${note.pitch}-${index}`} x={note.beat / 16 * 312 + 4} y={68 - (note.pitch - low) / range * 58} width={Math.max(4, note.duration / 16 * 312 - 2)} height="7" rx="3.5" />)}
      </svg></div>
    </div>
  </section>;
}

export default function Player() {
  const [genre, setGenre] = useState<Genre>("jazz");
  const [state, setState] = useState<PlaybackState>("loading");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("準備を始めています");
  const [current, setCurrent] = useState<Song>();
  const [elapsed, setElapsed] = useState(0);
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
      await cacheAsset(soundfontUrl(GENRES[desiredGenre.current].pack));
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
    queue.current[0] = song; currentRef.current = song; setCurrent(song); setElapsed(0); setState("playing"); updateMediaSession(song); extended.current = false;
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
    void cacheAsset(soundfontUrl(GENRES[next].pack));
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

  useEffect(() => {
    if (state !== "playing") return;
    const timer = setInterval(() => setElapsed(engine.position), 500);
    return () => clearInterval(timer);
  }, [current, state]);

  const ready = state !== "loading" && state !== "error";
  const playing = state === "playing";
  return <main>
    <header><h1>SONG UNIVERSE</h1></header>
    <section className="player" aria-live="polite">
      <Visualizer song={current} active={playing} />
      <div className="track-copy">
        <span className={`status ${state}`}>{state === "loading" ? progressLabel : state === "buffering" ? "次の曲を生成中" : playing ? "再生中" : state === "paused" ? "一時停止" : "エラー"}</span>
        <h2>{current?.plan.title ?? (progress === 100 ? "準備ができました" : "新しい宇宙を生成中")}</h2>
        {current ? <p>{GENRES[current.plan.genre].label} <i /> {current.plan.mood} <i /> {current.plan.key} <i /> {current.plan.bpm} BPM</p> : null}
      </div>
      {state === "loading" && !current ? <div className="progress" role="progressbar" aria-valuenow={progress} aria-label={progressLabel}><span style={{ width: `${progress}%` }} /></div> : null}
      {error ? <div className="error" role="alert"><p>{error}</p><button onClick={() => void prepare()}>再取得・再試行</button></div> : null}
      <div className="controls">
        <button className="play" onClick={() => void toggle()} disabled={!ready} aria-label={playing ? "一時停止" : current ? "再生" : "最初の曲を再生"}>{playing ? "Ⅱ" : "▶"}</button>
        <button className="next" onClick={() => void advance(true)} disabled={!current || state === "loading"} aria-label="次の曲">次へ <span>→</span></button>
      </div>
    </section>
    {current ? <CompositionDetails song={current} elapsed={elapsed} active={playing} /> : null}
    <nav aria-label="次の曲のジャンル"><span>次の曲のジャンル</span><div>{genreOrder.map(item => <button key={item} className={genre === item ? "selected" : ""} onClick={() => chooseGenre(item)} aria-pressed={genre === item}>{GENRES[item].label}</button>)}</div></nav>
  </main>;
}
