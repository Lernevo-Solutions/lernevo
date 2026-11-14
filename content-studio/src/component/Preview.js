import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./Preview.css";

/* =========================================================
   Preview (landing + voice-guided player)
   Usage (from course.js):
     <Preview course={course} onExit={() => ...} onClose={() => ...} />
       onExit  -> "Exit preview" on the landing screen
       onClose -> "Exit" inside the player
   Reads the slides saved by Edit.js (localStorage) and the
   recorded voices (IndexedDB), so what you edit is what you hear.
   ========================================================= */

const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const DEFAULT_VOICE = { mode: "none", lang: "en-IN", rate: 1, name: "", has: false };
const RATES = [0.8, 1, 1.25, 1.5];

/* ---------- icons ---------- */
const P = {
  play: "M7 4.5l13 7.5-13 7.5z",
  pause: "M8 5v14|M16 5v14",
  speaker: "M4 9v6h4l5 4V5L8 9z|M16 8a5 5 0 010 8|M18.5 5.5a9 9 0 010 13",
  back: "M19 12H5|M11 6l-6 6 6 6",
  next: "M5 12h14|M13 6l6 6-6 6",
  check: "M5 12l5 5L20 7",
  x: "M6 6l12 12|M18 6L6 18",
  expand: "M4 9V4h5|M20 9V4h-5|M4 15v5h5|M20 15v5h-5",
  exit: "M9 21H5V3h4|M16 17l5-5-5-5|M21 12H9",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18z|M12 7v5l3 2",
  users: "M16 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1|M9.5 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7z",
  user: "M20 21a8 8 0 00-16 0|M12 12a4 4 0 100-8 4 4 0 000 8z",
  award: "M12 14a6 6 0 100-12 6 6 0 000 12z|M8.5 13l-1.5 8 5-3 5 3-1.5-8",
  dl: "M12 4v12|M7 11l5 5 5-5|M4 20h16",
  replay: "M3 12a9 9 0 109-9 9 9 0 00-6.7 3|M3 4v5h5",
  spark: "M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z",
  quiz: "M12 21a9 9 0 100-18 9 9 0 000 18z|M9.5 9.5a2.5 2.5 0 114 2c-1 .6-1.5 1-1.5 2|M12 17h.01",
  layers: "M12 3l9 5-9 5-9-5z|M3 13l9 5 9-5",
  image: "M3 5h18v14H3z|M3 16l5-5 4 4 3-3 6 6",
};
const Ic = ({ n, size = 16, fill }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {P[n].split("|").map((d, i) => <path key={i} d={d} />)}
  </svg>
);

/* ---------- saved data (same keys as Edit.js) ---------- */
const idb = () => new Promise((res, rej) => {
  const r = indexedDB.open("lernevo.audio", 1);
  r.onupgradeneeded = () => r.result.createObjectStore("a");
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});
const aGet = async (k) => { const d = await idb(); return new Promise((res, rej) => { const q = d.transaction("a").objectStore("a").get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); };

const slideText = (s) => {
  const parts = [s.title, s.body];
  if (s.layout === "content") parts.push(...(s.items || []));
  if (s.layout === "points") (s.points || []).forEach(([h, t]) => parts.push(`${h}. ${t}`));
  if (s.layout === "quiz") { parts.push(s.q); (s.options || []).forEach((o, i) => parts.push(`Option ${String.fromCharCode(65 + i)}. ${o}`)); }
  return parts.filter(Boolean).join(". ").replace(/\.\s*\./g, ".");
};
const splitSentences = (t) => (t.match(/[^.!?।]+[.!?।]*\s*/g) || [t]).map((x) => x.trim()).filter(Boolean);

const fallbackSlides = (c) => {
  const u = () => Math.random().toString(36).slice(2, 9);
  const base = { items: ["First point", "Second point", "Third point"], points: [["Recognise", "what matters in everyday work"], ["Apply", "it confidently with your team"], ["Report", "problems quickly and clearly"]], options: [], answer: 0, explain: "", img: "", video: SAMPLE_VIDEO, poster: "", flip: false, bg: "#ffffff", fg: "#0f172a", font: "Inter, system-ui, sans-serif", k: 1, align: "left", voice: { ...DEFAULT_VOICE } };
  const dark = { bg: "radial-gradient(circle at 70% 30%,#3a3fc9,#17124d 70%)", fg: "#ffffff", align: "center" };
  return [
    { ...base, ...dark, id: u(), layout: "title", title: c.title, body: c.desc },
    { ...base, id: u(), layout: "content", title: "Course overview", body: "A quick look at what you will cover.", items: [`${c.min || 20} minutes`, "Short, practical sections", `${c.q || 5} quiz questions`] },
    { ...base, id: u(), layout: "points", title: "Learning objectives", body: "By the end you will be able to:" },
    { ...base, id: u(), layout: "quiz", title: "Quick check", q: "Which option is correct?", options: ["The correct answer", "A wrong answer", "Another wrong answer"], explain: "Well done." },
    { ...base, ...dark, id: u(), layout: "thanks", title: "Thank you", body: "You have completed the course." },
  ];
};
const loadSlides = (course) => {
  try { const v = JSON.parse(localStorage.getItem(`lernevo.edit.${course.id}`)); if (Array.isArray(v) && v.length) return v; } catch (e) { /* ignore */ }
  return fallbackSlides(course);
};

/* ---------- narrator: browser voice OR recorded audio ---------- */
function useNarrator(rateRef) {
  const [state, setState] = useState("idle");        // idle | playing | paused
  const [sents, setSents] = useState([]);
  const [si, setSi] = useState(-1);
  const [prog, setProg] = useState(0);
  const run = useRef(0), job = useRef(null), audio = useRef(null), keep = useRef(null), voices = useRef([]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return undefined;
    const f = () => { voices.current = window.speechSynthesis.getVoices(); };
    f();
    window.speechSynthesis.addEventListener?.("voiceschanged", f);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", f);
  }, []);

  const hardStop = useCallback(() => {
    run.current++;
    try { window.speechSynthesis?.cancel(); } catch (e) { /* ignore */ }
    if (audio.current) { audio.current.pause(); try { URL.revokeObjectURL(audio.current.src); } catch (e) { /* ignore */ } audio.current = null; }
  }, []);

  const stop = useCallback(() => {
    hardStop(); job.current = null;
    setState("idle"); setSi(-1); setProg(0); setSents([]);
  }, [hardStop]);

  const speakFrom = useCallback((idx) => {
    const j = job.current; if (!j) return;
    const token = ++run.current;
    try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    const next = (i) => {
      if (token !== run.current) return;
      if (i >= j.sents.length) {
        setState("idle"); setSi(-1); setProg(1);
        const cb = j.onEnd; job.current = null; if (cb) cb();
        return;
      }
      j.idx = i; setSi(i); setProg(i / j.sents.length);
      const u = new SpeechSynthesisUtterance(j.sents[i]);
      u.lang = j.lang; u.rate = rateRef.current;
      const m = voices.current.find((v) => v.lang === j.lang) || voices.current.find((v) => v.lang.toLowerCase().startsWith(j.lang.slice(0, 2).toLowerCase()));
      if (m) u.voice = m;
      u.onend = () => next(i + 1);
      u.onerror = (e) => { if (token !== run.current) return; if (e.error === "canceled" || e.error === "interrupted") return; setState("idle"); };
      keep.current = u;                       // stops Chrome from garbage-collecting the utterance
      window.speechSynthesis.speak(u);
    };
    setState("playing");
    setTimeout(() => next(idx), 60);
  }, [rateRef]);

  /* slide = { id, voice }  ·  opts = { text, onEnd } */
  const play = useCallback(async (slide, opts = {}) => {
    hardStop();
    const token = run.current;
    const vc = { ...DEFAULT_VOICE, ...(slide.voice || {}) };
    if (!opts.text && vc.mode === "audio") {
      const b = await aGet(slide.id).catch(() => null);
      if (token !== run.current) return;
      if (b) {
        const a = new Audio(URL.createObjectURL(b));
        a.playbackRate = rateRef.current;
        a.ontimeupdate = () => a.duration && setProg(a.currentTime / a.duration);
        a.onended = () => { setState("idle"); setProg(1); const cb = opts.onEnd; job.current = null; audio.current = null; if (cb) cb(); };
        audio.current = a; job.current = { kind: "audio", onEnd: opts.onEnd };
        setSents([]); setSi(-1); setProg(0);
        a.play().then(() => setState("playing")).catch(() => setState("idle"));
        return;
      }
    }
    if (!("speechSynthesis" in window)) return;
    const list = splitSentences(opts.text || slideText(slide));
    job.current = { kind: "tts", sents: list, lang: vc.lang || "en-IN", idx: 0, onEnd: opts.onEnd };
    setSents(list); setSi(0); setProg(0);
    speakFrom(0);
  }, [hardStop, speakFrom, rateRef]);

  const pause = () => {
    const j = job.current; if (!j) return;
    if (j.kind === "audio") audio.current?.pause();
    else { run.current++; try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
    setState("paused");
  };
  const resume = () => {
    const j = job.current; if (!j) return;
    if (j.kind === "audio") { audio.current?.play(); setState("playing"); } else speakFrom(j.idx);
  };
  const applyRate = () => {
    const j = job.current; if (!j) return;
    if (j.kind === "audio") { if (audio.current) audio.current.playbackRate = rateRef.current; }
    else if (state === "playing") speakFrom(j.idx);
  };

  useEffect(() => stop, [stop]);
  return { state, sents, si, prog, play, pause, resume, stop, applyRate };
}

/* ---------- little helpers ---------- */
const lum = (c) => {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec((c || "").trim());
  if (!m) return 0.1;
  let h = m[1]; if (h.length === 3) h = h.split("").map((x) => x + x).join("");
  const [r, g, b] = [0, 2, 4].map((k) => parseInt(h.slice(k, k + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

function Wave({ on, n = 22 }) {
  return (
    <span className={`pv-wave${on ? " on" : ""}`} aria-hidden="true">
      {Array.from({ length: n }, (_, k) => <i key={k} style={{ "--d": `${(k * 83) % 700}ms`, "--h": 30 + ((k * 37) % 70) }} />)}
    </span>
  );
}

function VideoModal({ src, title, onClose }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="pv-modal" onClick={onClose}>
      <div className="pv-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="pv-modal-x" onClick={onClose} aria-label="Close"><Ic n="x" size={16} /></button>
        <video src={src} controls autoPlay playsInline />
        <p>{title}</p>
      </div>
    </div>
  );
}

function downloadCertificate(name, title, score) {
  const c = document.createElement("canvas"); c.width = 1600; c.height = 1100;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 1600, 1100);
  grad.addColorStop(0, "#ffffff"); grad.addColorStop(1, "#eef2ff");
  g.fillStyle = grad; g.fillRect(0, 0, 1600, 1100);
  const bar = g.createLinearGradient(0, 0, 1600, 0);
  bar.addColorStop(0, "#22d3ee"); bar.addColorStop(.5, "#6366f1"); bar.addColorStop(1, "#a855f7");
  g.strokeStyle = bar; g.lineWidth = 14; g.strokeRect(40, 40, 1520, 1020);
  g.strokeStyle = "#c7d2fe"; g.lineWidth = 2; g.strokeRect(70, 70, 1460, 960);
  g.textAlign = "center"; g.fillStyle = "#4f46e5";
  const F = "Plus Jakarta Sans, Inter, system-ui, sans-serif";
  g.font = `700 30px ${F}`; g.fillText("LERNEVO SOLUTIONS", 800, 190);
  g.fillStyle = "#0f172a"; g.font = `800 84px ${F}`; g.fillText("Certificate of Completion", 800, 330);
  g.fillStyle = "#64748b"; g.font = `500 32px ${F}`; g.fillText("This certifies that", 800, 430);
  g.fillStyle = "#4f46e5"; g.font = `800 96px ${F}`; g.fillText(name || "Learner", 800, 560);
  g.fillStyle = "#64748b"; g.font = `500 32px ${F}`; g.fillText("has successfully completed", 800, 650);
  g.fillStyle = "#0f172a"; g.font = `700 54px ${F}`; g.fillText(title, 800, 740);
  if (score) { g.fillStyle = "#16a34a"; g.font = `700 34px ${F}`; g.fillText(`Quiz score: ${score}`, 800, 820); }
  g.fillStyle = "#94a3b8"; g.font = `500 26px ${F}`; g.fillText(new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }), 800, 950);
  c.toBlob((b) => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `certificate-${(name || "learner").replace(/\s+/g, "-").toLowerCase()}.png`; a.click(); });
}

/* ---------- decorative art used when a slide has no picture ---------- */
function Art() {
  return (
    <svg viewBox="0 0 400 300" className="pv-art" aria-hidden="true">
      <defs>
        <linearGradient id="pva" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#22d3ee" /><stop offset=".55" stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" /></linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#pva)" />
      <circle cx="320" cy="60" r="90" fill="#fff" opacity=".12" /><circle cx="60" cy="260" r="110" fill="#fff" opacity=".1" />
      <g className="pv-fl"><rect x="96" y="70" width="208" height="150" rx="18" fill="#fff" opacity=".95" /><rect x="116" y="94" width="90" height="12" rx="6" fill="#c7d2fe" /><rect x="116" y="118" width="150" height="9" rx="4.5" fill="#e2e8f0" /><rect x="116" y="136" width="120" height="9" rx="4.5" fill="#e2e8f0" />
        <circle cx="262" cy="188" r="22" fill="#fbbf24" /><path d="M252 188l7 7 13-14" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></g>
    </svg>
  );
}

/* ---------- one slide ---------- */
function Slide({ s, n, total, title, name, pick, onPick, score, onVideoPlay }) {
  const tone = lum(s.fg) > 0.6 ? "dark" : "light";
  const style = { background: s.bg, color: s.fg, fontFamily: s.font, textAlign: s.align, "--k": s.k || 1 };
  const cls = `pv-slide pv-${s.layout} tone-${tone}${s.flip ? " flip" : ""}${s.bold ? " is-bold" : ""}${s.ital ? " is-ital" : ""}`;
  const hasVoice = s.voice && s.voice.mode !== "none";
  const r = (i) => ({ "--i": i });
  return (
    <div className={cls} style={style}>
      <i className="pv-glow" /><i className="pv-gridbg" /><i className="pv-orb o1" /><i className="pv-orb o2" />
      {s.layout === "thanks" && <div className="pv-confetti" aria-hidden="true">{Array.from({ length: 34 }, (_, k) => <i key={k} style={{ "--x": `${(k * 37) % 100}%`, "--d": `${(k % 8) * 0.14}s`, "--h": (k * 47) % 360 }} />)}</div>}
      <div className="pv-head"><span className="pv-brand"><b>L</b> LERNEVO SOLUTIONS</span><small>{title}</small></div>

      <div className="pv-body">
        {(s.layout === "title" || s.layout === "section" || s.layout === "thanks") && (
          <div className="pv-hero">
            {s.layout === "section" && <span className="pv-kicker pv-r" style={r(0)}>SECTION</span>}
            {s.layout === "thanks" && <span className="pv-medal pv-r" style={r(0)}><Ic n="award" size={34} /></span>}
            <h1 className="pv-title pv-r" style={r(1)}>{s.layout === "thanks" && name ? `${s.title}, ${name.split(" ")[0]}!` : s.title}</h1>
            {s.body && <p className="pv-text pv-r" style={r(2)}>{s.body}</p>}
            {s.layout === "thanks" && (
              <div className="pv-r pv-thx" style={r(3)}>
                {score && <span className="pv-score"><Ic n="check" size={14} /> Quiz score {score}</span>}
                <button className="pv-cert" onClick={() => downloadCertificate(name, title, score)}><Ic n="dl" size={16} /> Download certificate</button>
              </div>
            )}
          </div>
        )}

        {s.layout === "content" && (
          <div className="pv-split">
            <div className="pv-col">
              <h2 className="pv-title pv-r" style={r(0)}>{s.title}</h2>
              {s.body && <p className="pv-text pv-r" style={r(1)}>{s.body}</p>}
              <ul className="pv-items">
                {(s.items || []).map((t, k) => <li className="pv-r" style={r(k + 2)} key={k}><span><Ic n="check" size={13} /></span>{t}</li>)}
              </ul>
            </div>
            <div className="pv-media pv-r" style={r(2)}>{s.img ? <img src={s.img} alt="" /> : <Art />}</div>
          </div>
        )}

        {s.layout === "points" && (
          <div className="pv-stack">
            <h2 className="pv-title pv-r" style={r(0)}>{s.title}</h2>
            {s.body && <p className="pv-text pv-r" style={r(1)}>{s.body}</p>}
            <div className="pv-cards">
              {(s.points || []).map(([h, t], k) => (
                <div className="pv-card pv-r" style={r(k + 2)} key={k}><span className="pv-num">{k + 1}</span><b>{h}</b><p>{t}</p></div>
              ))}
            </div>
          </div>
        )}

        {s.layout === "video" && (
          <div className="pv-stack">
            <h2 className="pv-title pv-r" style={r(0)}>{s.title}</h2>
            {s.body && <p className="pv-text pv-r" style={r(1)}>{s.body}</p>}
            <div className="pv-media pv-vid pv-r" style={r(2)}>
              {s.video ? <video controls playsInline preload="metadata" poster={s.poster || undefined} src={s.video} onPlay={onVideoPlay} /> : <Art />}
            </div>
          </div>
        )}

        {s.layout === "quiz" && (
          <div className="pv-stack">
            <h2 className="pv-title pv-r" style={r(0)}>{s.title}</h2>
            <p className="pv-q pv-r" style={r(1)}>{s.q}</p>
            <div className="pv-opts">
              {(s.options || []).map((o, k) => (
                <button key={k} className={`pv-opt pv-r${pick == null ? "" : k === s.answer ? " right" : pick === k ? " wrong" : " dim"}`} style={r(k + 2)} disabled={pick != null} onClick={() => onPick(k)}>
                  <em>{String.fromCharCode(65 + k)}</em><span>{o}</span>
                  {pick != null && k === s.answer && <Ic n="check" size={16} />}
                  {pick === k && k !== s.answer && <Ic n="x" size={16} />}
                </button>
              ))}
            </div>
            {pick != null && <p className={`pv-fb ${pick === s.answer ? "ok" : "no"}`}><b>{pick === s.answer ? "Correct! " : "Not quite. "}</b>{s.explain}</p>}
          </div>
        )}
      </div>

      <div className="pv-foot"><small>Lernevo Academy · Internal training{hasVoice && <span className="pv-vtag"><Ic n="speaker" size={11} /> Voice</span>}</small><span>{n} / {total}</span></div>
    </div>
  );
}

/* =========================================================
   PLAYER
   ========================================================= */
function Player({ course, slides, name, startAuto, onClose }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [auto, setAuto] = useState(startAuto);
  const [rate, setRate] = useState(1);
  const [answers, setAnswers] = useState({});
  const root = useRef(null);
  const rateRef = useRef(1); rateRef.current = rate;
  const autoRef = useRef(auto); autoRef.current = auto;
  const iRef = useRef(0); iRef.current = i;
  const timer = useRef(null);
  const nar = useNarrator(rateRef);
  const s = slides[i];
  const total = slides.length;
  const pct = ((i + 1) / total) * 100;

  const goTo = useCallback((n) => {
    clearTimeout(timer.current);
    const t = Math.max(0, Math.min(total - 1, n));
    if (t === iRef.current) return;
    setDir(t > iRef.current ? 1 : -1); setI(t);
  }, [total]);

  const narrate = useCallback((slide) => {
    nar.play(slide, {
      onEnd: () => {
        if (!autoRef.current || slide.layout === "quiz" || slide.layout === "thanks") return;
        timer.current = setTimeout(() => { if (autoRef.current) goTo(iRef.current + 1); }, 1400);
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goTo, nar.play]);

  /* new slide: stop old voice, start the new one when Autoplay is on */
  useEffect(() => {
    clearTimeout(timer.current); nar.stop();
    if (!autoRef.current) return undefined;
    const t = setTimeout(() => narrate(slides[i]), 550);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const toggleVoice = () => {
    if (nar.state === "playing") nar.pause();
    else if (nar.state === "paused") nar.resume();
    else narrate(s);
  };
  const toggleAuto = () => {
    const v = !auto; setAuto(v); autoRef.current = v;
    clearTimeout(timer.current);
    if (v && nar.state === "idle") narrate(s);
    if (!v && nar.state === "playing") nar.pause();
  };
  const cycleRate = () => { const n = RATES[(RATES.indexOf(rate) + 1) % RATES.length]; rateRef.current = n; setRate(n); setTimeout(nar.applyRate, 0); };

  const pick = (k) => {
    setAnswers((a) => ({ ...a, [s.id]: k }));
    if (autoRef.current) {
      const ok = k === s.answer;
      nar.play(s, { text: `${ok ? "Correct." : "Not quite."} ${s.explain || ""}`, onEnd: () => { timer.current = setTimeout(() => goTo(iRef.current + 1), 1200); } });
    }
  };

  const quizzes = slides.filter((x) => x.layout === "quiz");
  const right = quizzes.filter((x) => answers[x.id] === x.answer).length;
  const score = quizzes.length && quizzes.every((x) => answers[x.id] != null) ? `${right}/${quizzes.length}` : quizzes.length ? `${right}/${quizzes.length}` : "";

  useEffect(() => {
    const h = (e) => {
      if (e.target.closest && e.target.closest("input, textarea, select, video")) return;
      if (e.key === "ArrowRight") goTo(iRef.current + 1);
      else if (e.key === "ArrowLeft") goTo(iRef.current - 1);
      else if (e.key === " " && !(e.target.tagName === "BUTTON")) { e.preventDefault(); toggleVoice(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const fullscreen = () => { const el = root.current; if (!document.fullscreenElement) el?.requestFullscreen?.(); else document.exitFullscreen?.(); };
  const playing = nar.state === "playing";
  const caption = nar.sents.length && nar.si >= 0 ? nar.sents[nar.si] : playing ? "Playing the recorded voice…" : nar.state === "paused" ? "Paused" : "Tap the speaker to listen to this slide";
  const vlabel = !s.voice || s.voice.mode === "none" ? "Read aloud" : s.voice.mode === "audio" ? "Recorded voice" : "Read aloud";

  return (
    <div className="pv" ref={root}>
      <div className="pl-aurora"><i /><i /><i /></div>
      <header className="pv-top">
        <div className="pv-ttl"><span className="pv-logo">L</span><div><strong>{course.title}</strong><small>Slide {i + 1} of {total}</small></div></div>
        <div className="pv-steps" role="tablist" aria-label="Slides">
          {slides.map((x, k) => <button key={x.id} role="tab" aria-selected={k === i} title={x.title} className={k === i ? "on" : k < i ? "done" : ""} onClick={() => goTo(k)} />)}
        </div>
        <div className="pv-tools">
          <button className="pv-ib" onClick={fullscreen} title="Fullscreen"><Ic n="expand" size={15} /></button>
          <button className="pv-exit" onClick={onClose}><Ic n="exit" size={14} /> Exit</button>
        </div>
      </header>

      <main className="pv-stage-wrap">
        <div className="pv-stage">
          <div key={s.id} className={`pv-slide-in ${dir > 0 ? "fwd" : "back"}`}>
            <Slide s={s} n={i + 1} total={total} title={course.title} name={name} pick={answers[s.id]} onPick={pick} score={score} onVideoPlay={nar.stop} />
          </div>
        </div>
      </main>

      <footer className="pv-bar">
        <button className="pv-nav" disabled={i === 0} onClick={() => goTo(i - 1)}><Ic n="back" size={15} /> <span>Back</span></button>

        <div className={`pv-voice${playing ? " on" : ""}`}>
          <div className="pv-ring" style={{ "--p": Math.round(nar.prog * 100) }}>
            <button className="pv-play" onClick={toggleVoice} aria-label={playing ? "Pause voice" : "Listen to this slide"} title={playing ? "Pause" : "Listen to this slide (Space)"}>
              <Ic n={playing ? "pause" : "speaker"} size={20} fill={playing} />
            </button>
          </div>
          <div className="pv-cap">
            <div className="pv-cap-top"><span><Ic n="speaker" size={11} /> {vlabel}</span><Wave on={playing} /></div>
            <p key={nar.si}>{caption}</p>
          </div>
          <div className="pv-vctl">
            <button className="pv-chip" onClick={() => { nar.stop(); narrate(s); }} title="Replay"><Ic n="replay" size={13} /></button>
            <button className="pv-chip" onClick={cycleRate} title="Speed">{rate}x</button>
            <button className={`pv-chip auto${auto ? " on" : ""}`} onClick={toggleAuto} title="Autoplay: read every slide and move on by itself"><Ic n="spark" size={13} /> Auto</button>
          </div>
        </div>

        {i === total - 1
          ? <button className="pv-nav primary" onClick={onClose}><span>Finish</span> <Ic n="check" size={15} /></button>
          : <button className="pv-nav primary" onClick={() => goTo(i + 1)}><span>Next</span> <Ic n="next" size={15} /></button>}
        <div className="pv-bar-prog"><i style={{ width: `${pct}%` }} /></div>
      </footer>
    </div>
  );
}

/* =========================================================
   LANDING
   ========================================================= */
function HeroShield() {
  return (
    <svg viewBox="0 0 420 460" className="pl-shield" aria-hidden="true">
      <defs>
        <linearGradient id="ph-s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8be9ff" /><stop offset=".55" stopColor="#6a8bff" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient>
        <radialGradient id="ph-g"><stop offset="0" stopColor="#6366f1" stopOpacity=".25" /><stop offset="1" stopColor="#6366f1" stopOpacity="0" /></radialGradient>
        <linearGradient id="ph-r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#22d3ee" /><stop offset=".5" stopColor="#8b5cf6" /><stop offset="1" stopColor="#f472b6" /></linearGradient>
      </defs>
      <circle cx="210" cy="230" r="200" fill="url(#ph-g)" />
      <g style={{ transformOrigin: "210px 230px" }} className="pl-spin"><circle cx="210" cy="230" r="170" fill="none" stroke="url(#ph-r)" strokeWidth="1.6" strokeDasharray="3 10" opacity=".8" /></g>
      <g style={{ transformOrigin: "210px 230px" }} className="pl-spin r"><circle cx="210" cy="230" r="140" fill="none" stroke="url(#ph-r)" strokeWidth="2.2" strokeDasharray="80 50" strokeLinecap="round" opacity=".55" /></g>
      <g className="pv-fl">
        <path d="M210 90l92 34v78c0 66-42 108-92 128-50-20-92-62-92-128v-78z" fill="url(#ph-s)" />
        <path d="M210 90v240c50-20 92-62 92-128v-78z" fill="#fff" opacity=".16" />
        <rect x="186" y="196" width="48" height="42" rx="9" fill="#fff" />
        <path d="M195 196v-10a15 15 0 0130 0v10" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
        <circle cx="210" cy="217" r="6" fill="#6a4cff" />
      </g>
      <g fill="#8be9ff"><circle cx="70" cy="120" r="4"><animate attributeName="opacity" values=".2;1;.2" dur="2.4s" repeatCount="indefinite" /></circle><circle cx="360" cy="150" r="5"><animate attributeName="opacity" values=".2;1;.2" dur="3s" repeatCount="indefinite" /></circle><circle cx="340" cy="360" r="4"><animate attributeName="opacity" values=".2;1;.2" dur="2.7s" repeatCount="indefinite" /></circle><circle cx="80" cy="340" r="5"><animate attributeName="opacity" values=".2;1;.2" dur="3.3s" repeatCount="indefinite" /></circle></g>
    </svg>
  );
}

function Landing({ course, slides, onStart, onExit }) {
  const [name, setName] = useState(() => { try { return localStorage.getItem("lernevo.learner") || ""; } catch (e) { return ""; } });
  const [auto, setAuto] = useState(false);
  const [trailer, setTrailer] = useState(false);
  const rateRef = useRef(1);
  const nar = useNarrator(rateRef);
  const quizzes = slides.filter((x) => x.layout === "quiz").length;
  const voiced = slides.filter((x) => x.voice && x.voice.mode !== "none").length;
  const cat = (course.tag || "Course").split(" · ")[0];
  const talking = nar.state === "playing";

  const intro = () => {
    if (talking) return nar.stop();
    nar.play({ id: "intro", voice: { mode: "tts", lang: "en-IN" } }, { text: `${course.title}. ${course.desc}` });
  };
  const start = () => {
    nar.stop();
    try { localStorage.setItem("lernevo.learner", name.trim()); } catch (e) { /* ignore */ }
    onStart(name.trim(), auto);
  };

  return (
    <div className="pl">
      <div className="pl-aurora"><i /><i /><i /></div>
      <i className="pl-grid" />
      {course.img && <div className="pl-photo" style={{ backgroundImage: `url(${course.img})` }} />}
      {Array.from({ length: 14 }, (_, k) => <i key={k} className="pl-dot" style={{ left: `${(k * 71) % 100}%`, animationDelay: `${(k % 7) * 1.1}s`, animationDuration: `${9 + (k % 5) * 2}s` }} />)}

      <div className="pl-wrap">
        <section className="pl-card">
          <div className="pl-top">
            <span className="pl-brand"><b>L</b> LERNEVO SOLUTIONS</span>
            <span className="pl-badge"><i /> Preview mode</span>
          </div>
          <span className="pl-cat">{cat.toUpperCase()}</span>
          <h1>{course.title}</h1>
          <p className="pl-desc">{course.desc}</p>

          <div className="pl-stats">
            <div><Ic n="clock" size={17} /><b>{course.min || 20}</b><small>minutes</small></div>
            <div><Ic n="layers" size={17} /><b>{slides.length}</b><small>slides</small></div>
            <div><Ic n="quiz" size={17} /><b>{quizzes}</b><small>questions</small></div>
            <div><Ic n="award" size={17} /><b>70%</b><small>to pass</small></div>
          </div>

          <div className={`pl-voice${talking ? " on" : ""}`}>
            <button className="pl-listen" onClick={intro} aria-label={talking ? "Stop intro" : "Listen to the intro"}>
              <Ic n={talking ? "pause" : "speaker"} size={19} fill={talking} />
            </button>
            <div className="pl-vtxt">
              <b>{talking ? "Reading the intro…" : "Listen to the intro"}</b>
              <small>{voiced ? `${voiced} of ${slides.length} slides have a voice` : "Every slide can be read aloud"}</small>
            </div>
            <Wave on={talking} n={16} />
          </div>

          <div className="pl-row">
            <button className="pl-trailer" onClick={() => setTrailer(true)}><Ic n="play" size={12} fill /> Watch the 90-second intro</button>
            <label className="pl-switch" title="Reads every slide aloud and moves on by itself">
              <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
              <span className="pl-track"><i /></span>
              <span><b>Voice-guided mode</b><small>Auto-read &amp; auto-advance</small></span>
            </label>
          </div>

          <label className="pl-label" htmlFor="pl-name">YOUR NAME (FOR THE CERTIFICATE)</label>
          <div className="pl-input"><Ic n="user" size={17} /><input id="pl-name" placeholder="e.g. Aarav Sharma" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && start()} /></div>

          <div className="pl-actions">
            <button className="pl-start" onClick={start}><Ic n="play" size={13} fill /> Start course</button>
            <button className="pl-exit" onClick={onExit}>Exit preview</button>
          </div>
        </section>

        <aside className="pl-visual" aria-hidden="true">
          <HeroShield />
          <span className="pl-chip c1"><Ic n="speaker" size={14} /> Voice guided</span>
          <span className="pl-chip c2"><Ic n="check" size={14} /> Quick quizzes</span>
          <span className="pl-chip c3"><Ic n="award" size={14} /> Certificate</span>
        </aside>
      </div>
      <p className="pl-foot">Participant preview · answers and results are stored in this browser only</p>
      {trailer && <VideoModal src={SAMPLE_VIDEO} title={course.title} onClose={() => setTrailer(false)} />}
    </div>
  );
}

/* =========================================================
   ROOT  —  landing first, then the voice-guided player
   ========================================================= */
export default function Preview({ course, onExit, onClose }) {
  const slides = useMemo(() => loadSlides(course), [course]);
  const [stage, setStage] = useState("landing");
  const [learner, setLearner] = useState("");
  const [auto, setAuto] = useState(false);
  if (stage === "play")
    return <Player course={course} slides={slides} name={learner} startAuto={auto} onClose={onClose || onExit} />;
  return <Landing course={course} slides={slides} onExit={onExit} onStart={(n, a) => { setLearner(n); setAuto(a); setStage("play"); }} />;
}