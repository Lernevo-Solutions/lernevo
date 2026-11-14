import { useState, useEffect, useRef, useCallback } from "react";
import "./Edit.css";

/* =========================================================
   Course editor  (Course structure · slide canvas · properties)
   Usage (from course.js):
     <Edit course={course} onBack={...} onPreview={...} />
   ========================================================= */

const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

/* ---------- icons ---------- */
const P = {
  back: "M19 12H5|M11 6l-6 6 6 6",
  next: "M5 12h14|M13 6l6 6-6 6",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z|M12 15a3 3 0 100-6 3 3 0 000 6z",
  dl: "M12 4v12|M7 11l5 5 5-5|M4 20h16",
  send: "M4 12l16-8-6 16-3-7z",
  plus: "M12 5v14|M5 12h14",
  copy: "M9 9h11v11H9z|M5 15V4h11",
  trash: "M4 7h16|M9 7V4h6v3|M6 7l1 13h10l1-13",
  up: "M6 15l6-6 6 6",
  down: "M6 9l6 6 6-6",
  undo: "M9 14L4 9l5-5|M4 9h10a6 6 0 010 12h-3",
  redo: "M15 14l5-5-5-5|M20 9H10a6 6 0 000 12h3",
  bold: "M7 5h6a3.5 3.5 0 010 7H7z|M7 12h7a3.5 3.5 0 010 7H7z",
  ital: "M10 5h8|M6 19h8|M14 5l-4 14",
  aL: "M4 6h16|M4 10h10|M4 14h16|M4 18h10",
  aC: "M4 6h16|M7 10h10|M4 14h16|M7 18h10",
  aR: "M4 6h16|M10 10h10|M4 14h16|M10 18h10",
  image: "M3 5h18v14H3z|M3 16l5-5 4 4 3-3 6 6",
  play: "M6 4l14 8-14 8z",
  check: "M5 12l5 5L20 7",
  x: "M6 6l12 12|M18 6L6 18",
  text: "M5 6V4h14v2|M12 4v16|M9 20h6",
  layout: "M3 4h18v16H3z|M3 10h18|M10 10v10",
  pal: "M12 3a9 9 0 100 18 2 2 0 002-2c0-1-1-1.5-1-2.5S14 15 15 15h2a4 4 0 004-4 9 9 0 00-9-8z",
  note: "M5 4h14v16H5z|M9 9h6|M9 13h6",
  swap: "M7 7h13|M16 3l4 4-4 4|M17 17H4|M8 13l-4 4 4 4",
  help: "M12 21a9 9 0 100-18 9 9 0 000 18z|M9.5 9.5a2.5 2.5 0 114 2c-1 .6-1.5 1-1.5 2|M12 17h.01",
  mic: "M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3z|M5 11a7 7 0 0014 0|M12 18v3",
  speaker: "M4 9v6h4l5 4V5L8 9z|M16 8a5 5 0 010 8|M18.5 5.5a9 9 0 010 13",
  stop: "M6 6h12v12H6z",
  upload: "M12 16V4|M7 9l5-5 5 5|M4 20h16",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z|M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18z|M12 7v5l3 2",
  lock: "M6 11h12v9H6z|M8 11V8a4 4 0 018 0v3",
  bulb: "M9 18h6|M10 21h4|M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z",
  target: "M12 21a9 9 0 100-18 9 9 0 000 18z|M12 16a4 4 0 100-8 4 4 0 000 8z|M12 12h.01",
  cols: "M3 5h18v14H3z|M12 5v14",
  list: "M9 6h11|M9 12h11|M9 18h11|M4 6l1 1 2-2|M4 12l1 1 2-2|M4 18l1 1 2-2",
  award: "M12 14a5 5 0 100-10 5 5 0 000 10z|M8.5 13.5L7 21l5-3 5 3-1.5-7.5",
  heart: "M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z",
  pcheck: "M12 21a9 9 0 100-18 9 9 0 000 18z|M8 12l3 3 5-6",
  pplay: "M12 21a9 9 0 100-18 9 9 0 000 18z|M10 8.5l5 3.5-5 3.5z",
  grip: "M9 6h.01|M15 6h.01|M9 12h.01|M15 12h.01|M9 18h.01|M15 18h.01",
  dots: "M5 12h.01|M12 12h.01|M19 12h.01",
};
const Ic = ({ n, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {P[n].split("|").map((d, i) => <path key={i} d={d} />)}
  </svg>
);

/* ---------- small helpers ---------- */
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.max(a, Math.min(b, parseInt(v, 10) || 0));

/* ---------- voice / narration ---------- */
// mode: "none" | "tts" (browser reads the slide text) | "audio" (recorded or uploaded clip)
const DEFAULT_VOICE = { mode: "none", lang: "en-IN", rate: 1, name: "", has: false };
const VLANGS = [["en-IN", "English (India)"], ["en-US", "English (US)"], ["en-GB", "English (UK)"], ["ta-IN", "Tamil (தமிழ்)"], ["hi-IN", "Hindi (हिन्दी)"]];

// audio clips live in IndexedDB (key = slide id), because they are too big for localStorage
const idb = () => new Promise((res, rej) => {
  const r = indexedDB.open("lernevo.audio", 1);
  r.onupgradeneeded = () => r.result.createObjectStore("a");
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});
const aPut = async (k, blob) => { const d = await idb(); return new Promise((res, rej) => { const t = d.transaction("a", "readwrite"); t.objectStore("a").put(blob, k); t.oncomplete = res; t.onerror = () => rej(t.error); }); };
const aGet = async (k) => { const d = await idb(); return new Promise((res, rej) => { const q = d.transaction("a").objectStore("a").get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); };
const aDel = async (k) => { const d = await idb(); return new Promise((res, rej) => { const t = d.transaction("a", "readwrite"); t.objectStore("a").delete(k); t.oncomplete = res; t.onerror = () => rej(t.error); }); };

/* ---------- sections + slide types (the "Course structure") ---------- */
const SECTIONS = ["Introduction", "Content", "Questions", "Result", "Conclusion"];
// [icon colour, icon background]
const SEC_TONE = {
  Introduction: ["#3b6cf6", "#e6edff"],
  Content: ["#7c3aed", "#f0e9ff"],
  Questions: ["#0d9488", "#d9f6f0"],
  Result: ["#d97706", "#fff0d4"],
  Conclusion: ["#db2777", "#ffe3f0"],
};
const tone = (sec) => ({ "--c": SEC_TONE[sec][0], "--cb": SEC_TONE[sec][1] });

const LAYOUTS = [
  { k: "welcome", n: "Welcome", tag: "WELCOME", ic: "spark", sec: "Introduction", d: "Opening slide" },
  { k: "overview", n: "Overview", tag: "OVERVIEW", ic: "list", sec: "Introduction", d: "What to expect" },
  { k: "objectives", n: "Objectives", tag: "OBJECTIVES", ic: "target", sec: "Introduction", d: "Learning goals" },
  { k: "content", n: "Text + image", tag: "TEXT + IMAGE", ic: "image", sec: "Content", d: "Text with picture" },
  { k: "points", n: "Key points", tag: "KEY POINTS", ic: "pcheck", sec: "Content", d: "Highlight cards" },
  { k: "text", n: "Text", tag: "TEXT", ic: "aL", sec: "Content", d: "Reading slide" },
  { k: "video", n: "Video", tag: "VIDEO", ic: "pplay", sec: "Content", d: "Play a video" },
  { k: "twocol", n: "Two-column", tag: "TWO-COLUMN", ic: "cols", sec: "Content", d: "Side by side" },
  { k: "config", n: "Configuration", tag: "CONFIGURATION", ic: "help", sec: "Questions", d: "Quiz rules" },
  { k: "mcq", n: "Multiple choice", tag: "MULTIPLE CHOICE", ic: "list", sec: "Questions", d: "One right answer" },
  { k: "multi", n: "Multiple answer", tag: "MULTIPLE ANSWER", ic: "list", sec: "Questions", d: "Several right answers" },
  { k: "tf", n: "True / False", tag: "TRUE / FALSE", ic: "list", sec: "Questions", d: "Judge a statement" },
  { k: "short", n: "Short answer", tag: "SHORT ANSWER", ic: "list", sec: "Questions", d: "Type the answer" },
  { k: "result", n: "Result", tag: "RESULT", ic: "award", sec: "Result", d: "Score screen" },
  { k: "thanks", n: "Thank you", tag: "THANK YOU", ic: "heart", sec: "Conclusion", d: "Closing slide" },
  { k: "takeaways", n: "Takeaways", tag: "TAKEAWAYS", ic: "bulb", sec: "Conclusion", d: "What to remember" },
];
const LAY = Object.fromEntries(LAYOUTS.map((l) => [l.k, l]));
const SEC_OF = Object.fromEntries(LAYOUTS.map((l) => [l.k, l.sec]));
const LEGACY = { title: "welcome", section: "text", quiz: "mcq" };   // slides saved by the older editor
const QUIZ = ["mcq", "multi", "tf", "short"];
const bySec = (a) => [...a].sort((x, y) => SECTIONS.indexOf(x.sec) - SECTIONS.indexOf(y.sec));   // stable: keeps order inside a section
const rowName = (s) => (QUIZ.includes(s.layout) ? s.q : s.title) || "Untitled slide";

/* ---------- light themes first ---------- */
const THEMES = [
  { n: "Clean", bg: "#ffffff", fg: "#0f172a" },
  { n: "Mist", bg: "#f4f7fb", fg: "#0f172a" },
  { n: "Sky", bg: "linear-gradient(135deg,#e8f0ff,#f3eaff)", fg: "#1e1b4b" },
  { n: "Mint", bg: "linear-gradient(135deg,#e6f8f1,#e0f2fe)", fg: "#064e3b" },
  { n: "Rose", bg: "linear-gradient(135deg,#fff1f2,#ffe4e6 55%,#fce7f3)", fg: "#881337" },
  { n: "Sand", bg: "linear-gradient(135deg,#fffbeb,#fef3c7)", fg: "#78350f" },
  { n: "Lilac", bg: "linear-gradient(135deg,#f6f1ff,#e9e2ff)", fg: "#3b0764" },
  { n: "Peach", bg: "linear-gradient(135deg,#fff5ed,#ffe5d4)", fg: "#7c2d12" },
  { n: "Aqua", bg: "linear-gradient(135deg,#e0fbff,#e3eefe)", fg: "#0c4a6e" },
  { n: "Ocean", bg: "linear-gradient(135deg,#06b6d4,#2563eb)", fg: "#ffffff" },
  { n: "Violet", bg: "linear-gradient(135deg,#6d3df5,#c084fc)", fg: "#ffffff" },
  { n: "Midnight", bg: "radial-gradient(circle at 70% 30%,#3a3fc9,#17124d 70%)", fg: "#ffffff" },
];

const FONTS = [
  ["Inter", "Inter, system-ui, sans-serif"],
  ["Plus Jakarta Sans", '"Plus Jakarta Sans", Inter, sans-serif'],
  ["Georgia", "Georgia, serif"],
  ["Mono", "ui-monospace, Menlo, monospace"],
];

// the course branding every slide follows unless it turns on "Override branding"
const BRAND0 = { bg: THEMES[2].bg, fg: THEMES[2].fg, font: FONTS[0][1] };

const DELAYS = [[0, "Immediate"], [5, "After 5 seconds"], [10, "After 10 seconds"], [15, "After 15 seconds"], [30, "After 30 seconds"], [60, "After 1 minute"], [120, "After 2 minutes"]];

/* ---------- slide model ---------- */
const mk = (layout, o = {}) => ({
  id: uid(), layout, sec: SEC_OF[layout],
  title: "", body: "",
  items: ["First point", "Second point", "Third point"],
  points: [["Recognise", "what matters in everyday work"], ["Apply", "it confidently with your team"], ["Report", "problems quickly and clearly"]],
  cols: [["Do", "Describe the right way to do it."], ["Don't", "Describe what to avoid."]],
  q: "Which option is correct?", options: ["Option A", "Option B", "Option C"], answer: 0, answers: [0], accepted: "", explain: "",
  cfg: { pass: 80, tries: 3, shuffle: true, review: true },
  passMsg: "Well done! You passed the course.", failMsg: "You did not reach the pass mark. Review the slides and try again.",
  img: "", video: SAMPLE_VIDEO, poster: "", flip: false,
  bg: BRAND0.bg, fg: BRAND0.fg, font: BRAND0.font, k: 1, align: "left", bold: false, ital: false, notes: "",
  ownBrand: false, delay: 0, duration: 0, mandatory: false, nav: true,
  voice: { ...DEFAULT_VOICE },
  ...o,
});

// make any saved slide (old or new) safe to render
const norm = (s) => {
  const L = LAY[s.layout] ? s.layout : (LEGACY[s.layout] || "text");
  const base = mk(L);
  return {
    ...base, ...s, layout: L, id: s.id || base.id,
    sec: SECTIONS.includes(s.sec) ? s.sec : SEC_OF[L],
    ownBrand: s.ownBrand ?? true,          // old slides keep the look they already had
    cfg: { ...base.cfg, ...(s.cfg || {}) },
    voice: { ...DEFAULT_VOICE, ...(s.voice || {}) },
  };
};

const NEW_DEFAULTS = {
  welcome: { title: "Welcome", body: "What this course is about and who it is for", align: "center", mandatory: true },
  overview: { title: "Course overview", body: "A quick look at what you will cover.", items: ["20 minutes", "Short, practical sections", "A short quiz at the end"] },
  objectives: { title: "Learning objectives", body: "By the end you will be able to:" },
  content: { title: "Slide title", body: "Click to add your text. Keep it short and friendly." },
  points: { title: "Key points", body: "Three things to remember:" },
  text: { title: "Slide title", body: "Write your explanation here. Keep it short, clear and friendly." },
  video: { title: "Watch this video", body: "A short explainer to get you started." },
  twocol: { title: "Do and don't", body: "Two things side by side." },
  config: { title: "Quiz instructions", body: "Read this before you begin." },
  mcq: { title: "Quick check", q: "Which of these is correct?", options: ["Option A", "Option B", "Option C"], explain: "Explain why the answer is right." },
  multi: { title: "Quick check", q: "Which of these are correct? Select all that apply.", options: ["Option A", "Option B", "Option C", "Option D"], answers: [0, 1], explain: "Explain why these answers are right." },
  tf: { title: "True or false", q: "Write a statement for learners to judge.", answer: 0, explain: "Explain why the statement is true or false." },
  short: { title: "Short answer", q: "Type your question here.", accepted: "answer", explain: "Explain the correct answer." },
  result: { title: "Your result" },
  thanks: { title: "Thank you", body: "You have completed the course.", align: "center" },
  takeaways: { title: "Key takeaways", body: "Remember these three things:", items: ["Takeaway one", "Takeaway two", "Takeaway three"] },
};

const S = (layout, o) => mk(layout, { ...NEW_DEFAULTS[layout], ...o });
const starterSlides = (course) => [
  S("welcome", { title: "Welcome", body: course.desc || course.title }),
  S("overview", { title: "Course overview", body: "A quick look at what you will cover and how long it takes.", items: [`${course.min || 20} minutes`, "Short, practical sections", `${course.q || 5} quiz questions`] }),
  S("objectives", { title: "Learning objectives", body: "By the end you will be able to:" }),
  S("content", { title: "What is personal data", body: "Personal data is any information that can identify a living person.", items: ["Name, email and phone number", "Photos and ID numbers", "Online identifiers"] }),
  S("points", { title: "The six principles", body: "Every use of personal data should follow these:", points: [["Lawful", "have a valid reason to use it"], ["Fair", "be open about what you do"], ["Secure", "protect it from misuse"]] }),
  S("text", { title: "Lawful basis", body: "Before you use personal data you need a lawful basis, such as consent, a contract, or a legal duty." }),
  S("video", { title: "Breach response", body: "Watch what to do the moment you spot a breach." }),
  S("twocol", { title: "Safe sharing", body: "Share only what is needed, only with who needs it.", cols: [["Do", "Use approved tools and share the minimum."], ["Don't", "Send personal data to private email or chat apps."]] }),
  S("config", { title: "Quiz instructions", body: "Answer every question. You need the pass mark below to complete the course." }),
  S("mcq", { title: "Question 1", q: "Which of these is personal data?", options: ["A staff email address", "A company logo", "A public holiday date"], answer: 0, explain: "An email address can identify a person." }),
  S("multi", { title: "Question 2", q: "Which of these are valid lawful bases? Select all that apply.", options: ["Consent", "Legal obligation", "Curiosity", "Contract"], answers: [0, 1, 3], explain: "Curiosity is never a lawful basis." }),
  S("tf", { title: "Question 3", q: "You can share a colleague's personal data with anyone who asks.", answer: 1, explain: "Share only with people who have a reason to see it." }),
  S("short", { title: "Question 4", q: "Within how many hours must a serious breach be reported?", accepted: "72, 72 hours", explain: "Serious breaches are reported within 72 hours." }),
  S("mcq", { title: "Question 5", q: "An email asks you to reset your password through a link. What do you do?", options: ["Click the link at once", "Report it and do not click", "Forward it to a friend"], answer: 1, explain: "Report suspicious emails and never click the link." }),
  S("result", { title: "Your result" }),
  S("thanks", { title: "Thank you", body: "You have completed the course. Your certificate is ready." }),
  S("takeaways", { title: "Key takeaways", body: "Remember these three things:", items: ["Know what counts as personal data", "Share only what is needed", "Report problems straight away"] }),
];

// the text the browser voice reads for a slide
const slideText = (s) => {
  const parts = [s.title, s.body];
  if (["content", "overview", "takeaways"].includes(s.layout)) parts.push(...s.items);
  if (["points", "objectives"].includes(s.layout)) s.points.forEach(([h, t]) => parts.push(`${h}. ${t}`));
  if (s.layout === "twocol") s.cols.forEach(([h, t]) => parts.push(`${h}. ${t}`));
  if (s.layout === "result") parts.push(s.passMsg);
  if (s.layout === "mcq" || s.layout === "multi") { parts.push(s.q); s.options.forEach((o, i) => parts.push(`Option ${String.fromCharCode(65 + i)}. ${o}`)); }
  if (s.layout === "tf") parts.push(s.q, "True or false?");
  if (s.layout === "short") parts.push(s.q);
  return parts.filter(Boolean).join(". ").replace(/\.\s*\./g, ".");
};

/* ---------- editable text ---------- */
function Ed({ v, on, cls = "", ph = "Click to edit", tag: T = "div", edit, onKeyDown }) {
  const r = useRef(null);
  useEffect(() => {
    if (r.current && document.activeElement !== r.current && r.current.innerText !== v) r.current.innerText = v;
  }, [v]);
  if (!edit) return <T className={cls}>{v}</T>;
  return (
    <T ref={r} className={`${cls} ed`} contentEditable suppressContentEditableWarning spellCheck data-ph={ph}
      onPaste={(e) => { e.preventDefault(); document.execCommand("insertText", false, e.clipboardData.getData("text/plain")); }}
      onKeyDown={onKeyDown}
      onBlur={(e) => { const t = e.currentTarget.innerText.replace(/\n+$/, ""); if (t !== v) on(t); }} />
  );
}

/* ---------- on/off switch row ---------- */
const Switch = ({ on, set, t, d }) => (
  <button type="button" role="switch" aria-checked={on} className={`pe-sw${on ? " on" : ""}`} onClick={() => set(!on)}>
    <span><b>{t}</b><small>{d}</small></span><i />
  </button>
);

/* ---------- media block ---------- */
function Media({ s, edit, upd, video }) {
  const file = useRef(null);
  const src = video ? s.poster : s.img;
  const read = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = () => upd(video ? { poster: r.result } : { img: r.result });
    r.readAsDataURL(f);
  };
  return (
    <div className={`ps-media${video ? " is-video" : ""}${src ? " has-img" : ""}`}>
      {video && edit && s.video
        ? <video src={s.video} poster={s.poster || undefined} controls playsInline preload="metadata" />
        : src
          ? <img src={src} alt="" />
          : <div className="ps-ph"><Ic n={video ? "play" : "image"} size={44} /><span>{video ? "Add a video link in Content" : "Add an image"}</span></div>}
      {video && !edit && <span className="ps-play"><Ic n="play" size={30} /></span>}
      {edit && (
        <>
          <button type="button" className="ps-mbtn" onClick={() => file.current?.click()}><Ic n="image" size={14} /> {src ? "Replace" : video ? "Poster" : "Upload"}</button>
          {src && <button type="button" className="ps-mbtn ps-mdel" onClick={() => upd(video ? { poster: "" } : { img: "" })}><Ic n="x" size={13} /></button>}
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => read(e.target.files?.[0])} />
        </>
      )}
    </div>
  );
}

/* ---------- one slide ---------- */
function SlideView({ s, n, title, edit, upd, scale, go, hasPrev, hasNext }) {
  const L = s.layout;
  const set = (k) => (v) => upd({ [k]: v });
  const listSet = (key, i, v) => upd({ [key]: s[key].map((x, j) => (j === i ? v : x)) });
  const pairSet = (key, i, pos, v) => upd({ [key]: s[key].map((p, j) => (j === i ? (pos === 0 ? [v, p[1]] : [p[0], v]) : p)) });
  const bullet = (i) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const items = [...s.items]; items.splice(i + 1, 0, "");
      upd({ items });
      setTimeout(() => { const els = document.querySelectorAll(".ps-items .ed"); els[i + 1]?.focus(); }, 30);
    } else if (e.key === "Backspace" && e.currentTarget.innerText === "" && s.items.length > 1) {
      e.preventDefault();
      upd({ items: s.items.filter((_, j) => j !== i) });
    }
  };
  const rmOpt = (i) => upd({
    options: s.options.filter((_, j) => j !== i),
    answer: i === s.answer ? 0 : s.answer > i ? s.answer - 1 : s.answer,
    answers: s.answers.filter((a) => a !== i).map((a) => (a > i ? a - 1 : a)),
  });

  const cls = ["ps", `t-${L}`, s.flip ? "flip" : "", s.bold ? "is-bold" : "", s.ital ? "is-ital" : "", edit ? "is-edit" : ""].join(" ");
  const style = { "--bg": s.bg, "--fg": s.fg, "--k": s.k, fontFamily: s.font, textAlign: s.align, transform: `scale(${scale})` };

  const itemsBlock = (
    <>
      <ul className="ps-items">
        {s.items.map((t, i) => (
          <li key={i}>
            <span className="ps-tick"><Ic n={L === "takeaways" ? "bulb" : "check"} size={13} /></span>
            <Ed edit={edit} v={t} on={(v) => listSet("items", i, v)} onKeyDown={bullet(i)} ph="Bullet" />
            {edit && s.items.length > 1 && <button type="button" className="ps-rm" aria-label="Remove bullet" onClick={() => upd({ items: s.items.filter((_, j) => j !== i) })}><Ic n="x" size={12} /></button>}
          </li>
        ))}
      </ul>
      {edit && <button type="button" className="ps-add" onClick={() => upd({ items: [...s.items, "New point"] })}><Ic n="plus" size={13} /> Add bullet</button>}
    </>
  );

  const head = (ph) => (
    <>
      <Ed edit={edit} tag="h2" cls="ps-title" v={s.title} on={set("title")} ph={ph} />
    </>
  );

  return (
    <div className="ps-wrap" style={{ width: 960 * scale, height: 540 * scale }}>
      <div className={cls} style={style}>
        <i className="ps-grid" /><i className="ps-deco d1" /><i className="ps-deco d2" /><i className="ps-deco d3" />
        <div className="ps-head"><span className="ps-brand"><b>L</b> LERNEVO SOLUTIONS</span><small>{title}</small></div>

        {(L === "welcome" || L === "thanks") && (
          <div className="ps-hero">
            {L === "welcome" && <span className="ps-kicker">WELCOME</span>}
            {L === "thanks" && <span className="ps-medal"><Ic n="check" size={34} /></span>}
            <Ed edit={edit} tag="h1" cls="ps-title" v={s.title} on={set("title")} ph="Title" />
            <Ed edit={edit} cls="ps-body" v={s.body} on={set("body")} ph="Subtitle" />
            {L === "welcome" && <span className="ps-cert">Start course <Ic n="next" size={15} /></span>}
            {L === "thanks" && <span className="ps-cert"><Ic n="dl" size={15} /> Download certificate</span>}
          </div>
        )}

        {L === "content" && (
          <div className="ps-main">
            <div className="ps-text">
              {head("Slide title")}
              <Ed edit={edit} cls="ps-body" v={s.body} on={set("body")} ph="Add text" />
              {itemsBlock}
            </div>
            <Media s={s} edit={edit} upd={upd} />
          </div>
        )}

        {(L === "overview" || L === "takeaways") && (
          <div className="ps-stack">
            {head("Slide title")}
            <Ed edit={edit} cls="ps-body" v={s.body} on={set("body")} ph="Intro text" />
            {itemsBlock}
          </div>
        )}

        {L === "text" && (
          <div className="ps-stack ps-reading">
            {head("Slide title")}
            <Ed edit={edit} cls="ps-body" v={s.body} on={set("body")} ph="Write your text here" />
          </div>
        )}

        {(L === "points" || L === "objectives") && (
          <div className="ps-stack">
            {head("Slide title")}
            <Ed edit={edit} cls="ps-body" v={s.body} on={set("body")} ph="Intro text" />
            <div className="ps-cards">
              {s.points.map(([h, t], i) => (
                <div className="ps-card" key={i}>
                  <span className="ps-num">{i + 1}</span>
                  <Ed edit={edit} tag="b" v={h} on={(v) => pairSet("points", i, 0, v)} ph="Heading" />
                  <Ed edit={edit} tag="p" v={t} on={(v) => pairSet("points", i, 1, v)} ph="Description" />
                  {edit && s.points.length > 1 && <button type="button" className="ps-rm" aria-label="Remove card" onClick={() => upd({ points: s.points.filter((_, j) => j !== i) })}><Ic n="x" size={12} /></button>}
                </div>
              ))}
              {edit && s.points.length < 4 && <button type="button" className="ps-card ps-card-add" onClick={() => upd({ points: [...s.points, ["Heading", "Description"]] })}><Ic n="plus" size={20} /> Add card</button>}
            </div>
          </div>
        )}

        {L === "twocol" && (
          <div className="ps-stack">
            {head("Slide title")}
            <Ed edit={edit} cls="ps-body" v={s.body} on={set("body")} ph="Intro text" />
            <div className="ps-cols">
              {s.cols.map(([h, t], i) => (
                <div className="ps-col" key={i}>
                  <Ed edit={edit} tag="b" v={h} on={(v) => pairSet("cols", i, 0, v)} ph="Heading" />
                  <Ed edit={edit} tag="p" v={t} on={(v) => pairSet("cols", i, 1, v)} ph="Write the column text" />
                </div>
              ))}
            </div>
          </div>
        )}

        {L === "video" && (
          <div className="ps-stack">
            {head("Slide title")}
            <Ed edit={edit} cls="ps-body" v={s.body} on={set("body")} ph="Short description" />
            <Media s={s} edit={edit} upd={upd} video />
          </div>
        )}

        {L === "config" && (
          <div className="ps-stack">
            {head("Quiz title")}
            <Ed edit={edit} cls="ps-body" v={s.body} on={set("body")} ph="Tell learners how the quiz works" />
            <div className="ps-cfg">
              <div><b>{s.cfg.pass}%</b><span>Pass mark</span></div>
              <div><b>{s.cfg.tries === 0 ? "∞" : s.cfg.tries}</b><span>Attempts</span></div>
              <div><b>{s.cfg.shuffle ? "On" : "Off"}</b><span>Shuffle questions</span></div>
              <div><b>{s.cfg.review ? "On" : "Off"}</b><span>Show answers after</span></div>
            </div>
          </div>
        )}

        {QUIZ.includes(L) && (
          <div className={`ps-stack ps-quiz${(L === "mcq" || L === "multi") && s.options.length > 4 ? " dense" : ""}`}>
            {head("Question title")}
            <Ed edit={edit} cls="ps-q" v={s.q} on={set("q")} ph="Type the question" />

            {(L === "mcq" || L === "multi") && (
              <div className="ps-opts">
                {s.options.map((o, i) => {
                  const on = L === "multi" ? s.answers.includes(i) : i === s.answer;
                  const pick = () => (L === "multi" ? upd({ answers: on ? s.answers.filter((a) => a !== i) : [...s.answers, i].sort() }) : upd({ answer: i }));
                  return (
                    <div className={`ps-opt${on ? " right" : ""}`} key={i}>
                      <button type="button" className={`ps-radio${L === "multi" ? " sq" : ""}`} title="Mark as correct answer" disabled={!edit} onClick={pick}>{on && <Ic n="check" size={13} />}</button>
                      <Ed edit={edit} v={o} on={(v) => listSet("options", i, v)} ph="Answer option" />
                      {edit && s.options.length > 2 && <button type="button" className="ps-rm" aria-label="Remove option" onClick={() => rmOpt(i)}><Ic n="x" size={12} /></button>}
                    </div>
                  );
                })}
                {edit && s.options.length < 5 && <button type="button" className="ps-add" onClick={() => upd({ options: [...s.options, "New option"] })}><Ic n="plus" size={13} /> Add option</button>}
              </div>
            )}

            {L === "tf" && (
              <div className="ps-opts ps-tf">
                {["True", "False"].map((t, i) => (
                  <button type="button" key={t} className={`ps-opt${s.answer === i ? " right" : ""}`} disabled={!edit} onClick={() => upd({ answer: i })}>
                    <span className="ps-tfi"><Ic n={i === 0 ? "check" : "x"} size={20} /></span><span>{t}</span>
                  </button>
                ))}
              </div>
            )}

            {L === "short" && (
              <div className="ps-short">
                <div className="ps-input">Learners type their answer here…</div>
                <div className="ps-acc"><em><Ic n="check" size={13} /> Accepted answers</em>
                  <Ed edit={edit} v={s.accepted} on={set("accepted")} ph="Separate answers with commas, e.g. 72, 72 hours" /></div>
              </div>
            )}

            <Ed edit={edit} cls="ps-explain" v={s.explain} on={set("explain")} ph="Feedback shown after answering (optional)" />
          </div>
        )}

        {L === "result" && (
          <div className="ps-stack ps-result">
            {head("Result title")}
            <div className="ps-res">
              <div className="ps-ring">
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <circle className="rb" cx="60" cy="60" r="52" />
                  <circle className="rf" cx="60" cy="60" r="52" strokeDasharray="326.7" strokeDashoffset="49" transform="rotate(-90 60 60)" />
                </svg>
                <b>85%</b><small>Sample score</small>
              </div>
              <div className="ps-msgs">
                <div className="ps-msg pass"><em><Ic n="check" size={13} /> If the learner passes</em><Ed edit={edit} v={s.passMsg} on={set("passMsg")} ph="Message for learners who pass" /></div>
                <div className="ps-msg fail"><em><Ic n="x" size={13} /> If the learner does not pass</em><Ed edit={edit} v={s.failMsg} on={set("failMsg")} ph="Message for learners who do not pass" /></div>
              </div>
            </div>
          </div>
        )}

        <div className="ps-foot">
          <small>Lernevo Academy · Internal training</small>
          <div className="ps-ctl">
            {s.delay > 0 && <span className="ps-chip"><Ic n="clock" size={12} /> Next after {s.delay}s</span>}
            {s.duration > 0 && <span className="ps-chip"><Ic n="clock" size={12} /> {s.duration}s limit</span>}
            {s.mandatory && <span className="ps-chip"><Ic n="lock" size={12} /> Mandatory</span>}
            {s.nav && <>
              <button type="button" className="ps-nb" disabled={!go || !hasPrev} onClick={() => go && go(-1)} title="Go to the previous slide"><Ic n="back" size={12} /> Back</button>
              <button type="button" className="ps-nb pri" disabled={!go || !hasNext} onClick={() => go && go(1)} title="Go to the next slide (delay and mandatory apply in the player)">Next <Ic n="next" size={12} /></button>
            </>}
            <b className="ps-pn">{n}</b>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ---------- side-panel form pieces ---------- */
const Field = ({ label, hint, children }) => (
  <div className="pe-f"><span className="pe-lab">{label}</span>{children}{hint && <small className="pe-hint">{hint}</small>}</div>
);

function StrList({ label, items, onChange, onRemove, min = 1, max = 12, addLabel = "Add bullet", newText = "New point", marks, onMark, square }) {
  return (
    <Field label={`${label} (${items.length})`}>
      {items.map((t, i) => (
        <div className="pe-li" key={i}>
          {marks
            ? <button type="button" className={`pe-mk${marks(i) ? " on" : ""}${square ? " sq" : ""}`} aria-pressed={marks(i)} aria-label="Mark as correct answer" onClick={() => onMark(i)}>{marks(i) && <Ic n="check" size={13} />}</button>
            : <span className="pe-dot" />}
          <input className="pe-in" aria-label={`${label} ${i + 1}`} value={t} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
          {items.length > min && <button type="button" className="pe-x" aria-label="Remove" onClick={() => (onRemove ? onRemove(i) : onChange(items.filter((_, j) => j !== i)))}><Ic n="x" size={14} /></button>}
        </div>
      ))}
      {items.length < max && <button type="button" className="pe-addb" onClick={() => onChange([...items, newText])}><Ic n="plus" size={14} /> {addLabel}</button>}
    </Field>
  );
}

function PairList({ label, pairs, onChange, min = 1, max = 4, addLabel = "Add card", ph = ["Heading", "Description"] }) {
  const edit = (i, pos, v) => onChange(pairs.map((p, j) => (j === i ? (pos === 0 ? [v, p[1]] : [p[0], v]) : p)));
  return (
    <Field label={`${label} (${pairs.length})`}>
      {pairs.map(([h, t], i) => (
        <div className="pe-pair" key={i}>
          <input className="pe-in" aria-label={`${label} ${i + 1} heading`} placeholder={ph[0]} value={h} onChange={(e) => edit(i, 0, e.target.value)} />
          <textarea className="pe-ta" rows={2} aria-label={`${label} ${i + 1} description`} placeholder={ph[1]} value={t} onChange={(e) => edit(i, 1, e.target.value)} />
          {pairs.length > min && <button type="button" className="pe-x" aria-label="Remove" onClick={() => onChange(pairs.filter((_, j) => j !== i))}><Ic n="x" size={14} /></button>}
        </div>
      ))}
      {pairs.length < max && <button type="button" className="pe-addb" onClick={() => onChange([...pairs, ["Heading", "Description"]])}><Ic n="plus" size={14} /> {addLabel}</button>}
    </Field>
  );
}

function ImageField({ label, value, onChange }) {
  const f = useRef(null);
  const isData = !!value && value.startsWith("data:");
  const read = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = () => onChange(r.result);
    r.readAsDataURL(file);
  };
  return (
    <Field label={label} hint="Uploads stay in this browser. Keep files small for the demo.">
      <div className="pe-img">
        <input className="pe-in" aria-label={label} value={isData ? "" : value} placeholder={isData ? "Uploaded picture" : "https://…"} onChange={(e) => onChange(e.target.value)} />
        <button type="button" className="pe-up-b" aria-label="Upload a picture" onClick={() => f.current?.click()}><Ic n="upload" size={16} /></button>
        <input ref={f} type="file" accept="image/*" hidden onChange={(e) => { read(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      {value && (
        <div className="pe-thumbrow">
          <img src={value} alt="" /><span>{isData ? "Uploaded picture" : "Linked picture"}</span>
          <button type="button" onClick={() => onChange("")}>Remove</button>
        </div>
      )}
    </Field>
  );
}

/* ---------- load / save ---------- */
const load = (KEY, course) => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    const arr = Array.isArray(v) ? v : v && v.slides;
    if (Array.isArray(arr) && arr.length) return { slides: bySec(arr.map(norm)), brand: v && v.brand ? { ...BRAND0, ...v.brand } : BRAND0 };
  } catch (e) { /* ignore */ }
  return { slides: starterSlides(course), brand: BRAND0 };
};

/* ---------- editor ---------- */
export default function Edit({ course, onBack, onPreview }) {
  const KEY = `lernevo.edit.${course.id}`;
  const [init] = useState(() => load(KEY, course));
  const [hist, setHist] = useState({ past: [], present: init.slides, future: [] });
  const [brand, setBrand] = useState(init.brand);
  const slides = hist.present;
  const [selId, setSelId] = useState(slides[0].id);
  const [title, setTitle] = useState(course.title);
  const [tab, setTab] = useState("design");
  const [menu, setMenu] = useState(false);
  const [picker, setPicker] = useState(null);      // { sec, all }
  const [rowMenu, setRowMenu] = useState(null);
  const [closed, setClosed] = useState({});
  const [zoom, setZoom] = useState(1);
  const [saved, setSaved] = useState("saved");
  const [toast, setToast] = useState("");
  const [dragId, setDragId] = useState(null);
  const [box, setBox] = useState({ w: 900, h: 560 });
  const stage = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [rec, setRec] = useState(false);
  const [voices, setVoices] = useState([]);
  const audioRef = useRef(null);
  const recRef = useRef(null);

  const idx = Math.max(0, slides.findIndex((x) => x.id === selId));
  const cur = slides[idx];

  /* slides without "Override branding" follow the course branding */
  const eff = (s) => (s.ownBrand ? s : { ...s, bg: brand.bg, fg: brand.fg, font: brand.font });
  const look = eff(cur);
  const setLook = (p) => (cur.ownBrand ? upd(p) : setBrand((b) => ({ ...b, ...p })));

  /* history (slides are always kept grouped by section) */
  const commit = useCallback((fn) => setHist((h) => ({ past: [...h.past.slice(-60), h.present], present: bySec(fn(h.present)), future: [] })), []);
  const undo = useCallback(() => setHist((h) => (h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h)), []);
  const redo = useCallback(() => setHist((h) => (h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h)), []);
  const upd = useCallback((patch) => commit((sl) => sl.map((x) => (x.id === selId ? { ...x, ...patch } : x))), [commit, selId]);
  // change without adding an undo step (typing numbers / notes)
  const quiet = (patch) => setHist((h) => ({ ...h, present: h.present.map((x) => (x.id === selId ? { ...x, ...patch } : x)) }));

  /* ---- narration ---- */
  const vc = { ...DEFAULT_VOICE, ...(cur.voice || {}) };
  const setVoice = (p) => upd({ voice: { ...vc, ...p } });
  const hasVoice = voices.length === 0 || voices.some((v) => v.lang.toLowerCase().startsWith(vc.lang.slice(0, 2)));

  useEffect(() => {
    if (!("speechSynthesis" in window)) return undefined;
    const f = () => setVoices(window.speechSynthesis.getVoices());
    f();
    window.speechSynthesis.addEventListener?.("voiceschanged", f);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", f);
  }, []);

  const stopVoice = useCallback(() => {
    try { window.speechSynthesis?.cancel(); } catch (e) { /* ignore */ }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlaying(false);
  }, []);
  useEffect(() => stopVoice, [selId, stopVoice]);   // stop when the slide changes / editor closes

  const playVoice = async () => {
    if (playing) return stopVoice();
    if (vc.mode === "tts") {
      if (!("speechSynthesis" in window)) return flash("This browser can't read aloud");
      const u = new SpeechSynthesisUtterance(slideText(cur));
      u.lang = vc.lang; u.rate = vc.rate;
      const m = voices.find((v) => v.lang === vc.lang) || voices.find((v) => v.lang.toLowerCase().startsWith(vc.lang.slice(0, 2)));
      if (m) u.voice = m;
      u.onend = u.onerror = () => setPlaying(false);
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); setPlaying(true);
    } else if (vc.mode === "audio") {
      const b = await aGet(cur.id).catch(() => null);
      if (!b) return flash("No audio on this slide yet");
      const a = new Audio(URL.createObjectURL(b)); audioRef.current = a;
      a.onended = () => setPlaying(false);
      a.play().then(() => setPlaying(true)).catch(() => flash("Couldn't play the audio"));
    } else flash("Turn on a voice in the Voice tab first");
  };

  const saveAudio = async (blob, name, id) => {
    try { await aPut(id, blob); } catch (e) { return flash("Couldn't store the audio"); }
    commit((sl) => sl.map((x) => (x.id === id ? { ...x, voice: { ...DEFAULT_VOICE, ...(x.voice || {}), mode: "audio", has: true, name } } : x)));
    flash("Voice saved to this slide");
  };
  const pickAudio = (f) => { if (!f) return; if (f.type.startsWith("audio/")) saveAudio(f, f.name, selId); else flash("Please choose an audio file"); };
  const toggleRec = async () => {
    if (rec) { recRef.current?.stop(); return; }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return flash("Recording isn't supported in this browser");
    const id = selId;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream); const chunks = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      mr.onstop = () => { stream.getTracks().forEach((t) => t.stop()); setRec(false); saveAudio(new Blob(chunks, { type: mr.mimeType || "audio/webm" }), "My recording", id); };
      recRef.current = mr; mr.start(); setRec(true);
    } catch (e) { flash("Microphone permission was blocked"); }
  };
  const removeAudio = async () => { stopVoice(); await aDel(cur.id).catch(() => {}); setVoice({ has: false, name: "", mode: "none" }); };

  /* keep selection valid after undo/redo */
  useEffect(() => { if (!slides.some((x) => x.id === selId)) setSelId(slides[0].id); }, [slides, selId]);

  /* autosave */
  useEffect(() => {
    setSaved("saving");
    const t = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify({ v: 2, slides, brand })); setSaved("saved"); } catch (e) { setSaved("local"); }
    }, 500);
    return () => clearTimeout(t);
  }, [slides, brand, KEY]);

  /* stage size → fit scale */
  useEffect(() => {
    if (!stage.current) return undefined;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(stage.current);
    return () => ro.disconnect();
  }, []);
  const fit = Math.max(0.3, Math.min((box.w - 56) / 960, (box.h - 70) / 540));
  const scale = fit * zoom;

  /* slide actions */
  const addSlide = (layout, sec = SEC_OF[layout], atEnd = false) => {
    const s = mk(layout, NEW_DEFAULTS[layout]); s.sec = sec;
    commit((sl) => {
      const a = [...sl];
      let at;
      if (!atEnd && cur.sec === sec) at = idx + 1;
      else { let last = -1; a.forEach((x, i) => { if (x.sec === sec) last = i; }); at = last >= 0 ? last + 1 : a.length; }
      a.splice(at, 0, s); return a;
    });
    setSelId(s.id); setMenu(false); setPicker(null);
    setClosed((o) => ({ ...o, [sec]: false }));
  };
  const dupSlide = () => {
    const c = { ...cur, id: uid(), items: [...cur.items], points: cur.points.map((p) => [...p]), cols: cur.cols.map((p) => [...p]), options: [...cur.options], answers: [...cur.answers], cfg: { ...cur.cfg }, voice: { ...DEFAULT_VOICE, ...(cur.voice || {}) } };
    if (cur.voice?.has) aGet(cur.id).then((b) => b && aPut(c.id, b)).catch(() => {});
    commit((sl) => { const a = [...sl]; a.splice(idx + 1, 0, c); return a; });
    setSelId(c.id);
  };
  const delSlide = () => {
    if (slides.length < 2) return flash("A course needs at least one slide");
    const next = slides[idx + 1] || slides[idx - 1];
    commit((sl) => sl.filter((x) => x.id !== cur.id));
    setSelId(next.id);
  };
  const move = (d) => {
    const j = idx + d; if (j < 0 || j >= slides.length) return;
    const o = slides[j];
    commit((sl) => {
      const a = [...sl];
      if (o.sec === cur.sec) [a[idx], a[j]] = [a[j], a[idx]];
      else a[idx] = { ...cur, sec: o.sec };          // crossing a section edge moves it into that section
      return a;
    });
  };
  const drop = (toId) => {
    if (!dragId || dragId === toId) return;
    commit((sl) => {
      const from = sl.findIndex((x) => x.id === dragId);
      const to = sl.findIndex((x) => x.id === toId);
      const sec = sl[to].sec;
      const a = [...sl]; const [m] = a.splice(from, 1);
      const t = a.findIndex((x) => x.id === toId);
      a.splice(from < to ? t + 1 : t, 0, { ...m, sec }); return a;
    });
    setDragId(null);
  };
  const dropSec = (sec) => {
    if (!dragId) return;
    commit((sl) => { const m = sl.find((x) => x.id === dragId); return m ? [...sl.filter((x) => x.id !== dragId), { ...m, sec }] : sl; });
    setDragId(null);
  };
  const setLayout = (layout) => upd({
    layout,
    ...(layout === "welcome" || layout === "thanks" ? { align: "center" } : {}),
    ...(layout === "multi" ? { answers: cur.answers && cur.answers.length ? cur.answers : [cur.answer || 0] } : {}),
    ...(layout === "mcq" && cur.layout === "multi" ? { answer: (cur.answers && cur.answers[0]) || 0 } : {}),
    ...(layout === "tf" ? { answer: cur.answer > 1 ? 0 : cur.answer } : {}),
  });

  const go = (d) => { const j = idx + d; if (j >= 0 && j < slides.length) setSelId(slides[j].id); };
  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };
  const exportJson = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ course: title, brand, slides }, null, 2)], { type: "application/json" }));
    a.download = `${title.replace(/\s+/g, "-").toLowerCase() || "course"}.json`; a.click(); flash("Exported as JSON");
  };

  /* shortcuts (ignored while typing) */
  useEffect(() => {
    const h = (e) => {
      const t = e.target;
      if (t.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); }
      else if (mod && e.key.toLowerCase() === "d") { e.preventDefault(); dupSlide(); }
      else if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); setSelId(slides[Math.min(idx + 1, slides.length - 1)].id); }
      else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); setSelId(slides[Math.max(idx - 1, 0)].id); }
      else if (e.key === "Delete") delSlide();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });


  /* ---- Content tab: fields depend on the slide type ---- */
  const area = (label, key, rows, ph, hint) => (
    <Field label={label} hint={hint}>
      <textarea className="pe-ta" rows={rows} aria-label={label} value={cur[key]} placeholder={ph}
        onChange={(e) => quiet({ [key]: key === "title" ? e.target.value.replace(/\n/g, " ") : e.target.value })} />
    </Field>
  );
  const rmOptEd = (i) => upd({
    options: cur.options.filter((_, j) => j !== i),
    answer: i === cur.answer ? 0 : cur.answer > i ? cur.answer - 1 : cur.answer,
    answers: cur.answers.filter((a) => a !== i).map((a) => (a > i ? a - 1 : a)),
  });
  const heading = area("Heading", "title", 2, "Slide heading");
  const desc = area("Description", "body", 3, "Short supporting paragraph");
  const bullets = <StrList label="Bullet points" items={cur.items} onChange={(items) => quiet({ items })} />;
  const feedback = area("Feedback after answering", "explain", 3, "Shown to learners after they answer (optional)");
  let contentBody;
  switch (cur.layout) {
    case "overview": case "takeaways":
      contentBody = <>{heading}{desc}{bullets}</>; break;
    case "objectives": case "points":
      contentBody = <>{heading}{desc}<PairList label="Cards" pairs={cur.points} onChange={(points) => quiet({ points })} /></>; break;
    case "content":
      contentBody = (<>{heading}{desc}{bullets}
        <ImageField label="Image URL" value={cur.img} onChange={(img) => quiet({ img })} />
        <button className="pe-btn full" onClick={() => upd({ flip: !cur.flip })}><Ic n="swap" size={14} /> Picture on the {cur.flip ? "right" : "left"}</button></>); break;
    case "text":
      contentBody = <>{heading}{area("Body text", "body", 9, "Write your text here", "Press Enter to start a new paragraph.")}</>; break;
    case "twocol":
      contentBody = <>{heading}{desc}<PairList label="Columns" pairs={cur.cols} onChange={(cols) => quiet({ cols })} min={2} max={2} ph={["Column heading", "Column text"]} /></>; break;
    case "video":
      contentBody = (<>{heading}{desc}
        <Field label="Video link" hint="Paste a direct .mp4 link.">
          <input className="pe-in" aria-label="Video link" value={cur.video} placeholder="https://…/video.mp4" onChange={(e) => quiet({ video: e.target.value })} />
        </Field>
        <ImageField label="Poster image URL" value={cur.poster} onChange={(poster) => quiet({ poster })} /></>); break;
    case "config":
      contentBody = (<>{heading}{desc}
        <Field label="Pass mark (%)"><input className="pe-in" type="number" min="0" max="100" aria-label="Pass mark" value={cur.cfg.pass} onChange={(e) => quiet({ cfg: { ...cur.cfg, pass: clamp(e.target.value, 0, 100) } })} /></Field>
        <Field label="Attempts allowed" hint="0 means learners can try as many times as they like.">
          <input className="pe-in" type="number" min="0" max="20" aria-label="Attempts allowed" value={cur.cfg.tries} onChange={(e) => quiet({ cfg: { ...cur.cfg, tries: clamp(e.target.value, 0, 20) } })} /></Field>
        <Switch on={cur.cfg.shuffle} set={(v) => upd({ cfg: { ...cur.cfg, shuffle: v } })} t="Shuffle questions" d="Different order for each learner" />
        <Switch on={cur.cfg.review} set={(v) => upd({ cfg: { ...cur.cfg, review: v } })} t="Show answers after" d="Learners can review the right answers" /></>); break;
    case "mcq": case "multi": {
      const multi = cur.layout === "multi";
      contentBody = (<>{heading}{area("Question", "q", 3, "Type the question")}
        <StrList label="Answer options" items={cur.options} onChange={(options) => quiet({ options })} onRemove={rmOptEd} min={2} max={5} addLabel="Add option" newText="New option"
          marks={(i) => (multi ? cur.answers.includes(i) : cur.answer === i)} square={multi}
          onMark={(i) => (multi ? upd({ answers: cur.answers.includes(i) ? cur.answers.filter((a) => a !== i) : [...cur.answers, i].sort() }) : upd({ answer: i }))} />
        <small className="pe-hint">{multi ? "Tick every correct answer." : "Tick the one correct answer."}</small>
        {feedback}</>); break;
    }
    case "tf":
      contentBody = (<>{heading}{area("Statement", "q", 3, "Write a statement for learners to judge")}
        <Field label="Correct answer">
          <div className="pe-seg">
            <button type="button" className={`t${cur.answer === 0 ? " on" : ""}`} onClick={() => upd({ answer: 0 })}>True</button>
            <button type="button" className={`f${cur.answer === 1 ? " on" : ""}`} onClick={() => upd({ answer: 1 })}>False</button>
          </div>
        </Field>
        {feedback}</>); break;
    case "short":
      contentBody = (<>{heading}{area("Question", "q", 3, "Type the question")}
        <Field label="Accepted answers" hint="Separate answers with commas. Capital letters are ignored.">
          <input className="pe-in" aria-label="Accepted answers" value={cur.accepted} placeholder="e.g. 72, 72 hours" onChange={(e) => quiet({ accepted: e.target.value })} />
        </Field>
        {feedback}</>); break;
    case "result":
      contentBody = (<>{heading}{area("If the learner passes", "passMsg", 3, "Message for learners who pass")}{area("If the learner does not pass", "failMsg", 3, "Message for learners who do not pass")}</>); break;
    default:   // welcome, thanks
      contentBody = <>{heading}{desc}</>;
  }

  const qCount = slides.filter((x) => QUIZ.includes(x.layout)).length;
  const lay = LAY[cur.layout];

  return (
    <div className="pe" onClick={() => { if (menu) setMenu(false); if (rowMenu) setRowMenu(null); }}>
      {/* ---- top bar ---- */}
      <header className="pe-top">
        <div className="pe-left">
          <button className="pe-ib" onClick={onBack} aria-label="Back to courses"><Ic n="back" /></button>
          <span className="pe-logo">L</span>
          <div>
            <input className="pe-title" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Course title" />
            <div className="pe-status">
              <span className="pe-pill">● {course.status}</span>
              <small className={saved}>{saved === "saving" ? "Saving…" : saved === "local" ? "Saved (images too big to keep)" : "✓ All changes saved"}</small>
            </div>
          </div>
        </div>
        <div className="pe-right">
          <button className="pe-btn" onClick={onPreview}><Ic n="eye" size={15} /> Preview</button>
          <button className="pe-btn" onClick={exportJson}><Ic n="dl" size={15} /> Export</button>
          <button className="pe-btn pe-primary" onClick={() => flash("Published to learners (demo)")}><Ic n="send" size={15} /> Publish</button>
        </div>
      </header>

      {/* ---- ribbon ---- */}
      <div className="pe-ribbon" onClick={(e) => e.stopPropagation()}>
        <div className="pe-grp">
          <div className="pe-rel">
            <button className="pe-tool wide" onClick={() => setMenu(!menu)}><Ic n="plus" size={17} /><span>New slide</span><Ic n="down" size={12} /></button>
            {menu && (
              <div className="pe-menu">
                <p>Choose a slide type</p>
                <div>
                  {LAYOUTS.map((l) => (
                    <button key={l.k} onClick={() => addSlide(l.k)}>
                      <span className="pe-ico" style={tone(l.sec)}><Ic n={l.ic} size={16} /></span><b>{l.n}</b><small>{l.sec}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="pe-tool" onClick={dupSlide} title="Duplicate (Ctrl+D)"><Ic n="copy" /><span>Duplicate</span></button>
          <button className="pe-tool" onClick={delSlide} title="Delete (Del)"><Ic n="trash" /><span>Delete</span></button>
          <button className="pe-tool" onClick={() => move(-1)} disabled={idx === 0} title="Move up"><Ic n="up" /><span>Up</span></button>
          <button className="pe-tool" onClick={() => move(1)} disabled={idx === slides.length - 1} title="Move down"><Ic n="down" /><span>Down</span></button>
        </div>
        <i className="pe-sep" />
        <div className="pe-grp">
          <button className="pe-tool sm" onClick={undo} disabled={!hist.past.length} title="Undo (Ctrl+Z)"><Ic n="undo" /></button>
          <button className="pe-tool sm" onClick={redo} disabled={!hist.future.length} title="Redo (Ctrl+Y)"><Ic n="redo" /></button>
        </div>
        <i className="pe-sep" />
        <div className="pe-grp">
          <select className="pe-sel" value={look.font} onChange={(e) => setLook({ font: e.target.value })} aria-label="Font">
            {FONTS.map(([n, v]) => <option key={n} value={v}>{n}</option>)}
          </select>
          <button className="pe-tool sm" onClick={() => upd({ k: Math.max(0.7, +(cur.k - 0.1).toFixed(1)) })} title="Smaller text">A−</button>
          <span className="pe-num">{Math.round(cur.k * 100)}%</span>
          <button className="pe-tool sm" onClick={() => upd({ k: Math.min(1.5, +(cur.k + 0.1).toFixed(1)) })} title="Bigger text">A+</button>
          <button className={`pe-tool sm${cur.bold ? " on" : ""}`} onClick={() => upd({ bold: !cur.bold })} title="Bold"><Ic n="bold" /></button>
          <button className={`pe-tool sm${cur.ital ? " on" : ""}`} onClick={() => upd({ ital: !cur.ital })} title="Italic"><Ic n="ital" /></button>
          <label className="pe-color" title="Text colour"><Ic n="text" size={15} /><i style={{ background: look.fg }} /><input type="color" value={/^#[0-9a-f]{6}$/i.test(look.fg) ? look.fg : "#0f172a"} onChange={(e) => setLook({ fg: e.target.value })} /></label>
        </div>
        <i className="pe-sep" />
        <div className="pe-grp">
          {[["left", "aL"], ["center", "aC"], ["right", "aR"]].map(([a, ic]) => (
            <button key={a} className={`pe-tool sm${cur.align === a ? " on" : ""}`} onClick={() => upd({ align: a })} title={`Align ${a}`}><Ic n={ic} /></button>
          ))}
        </div>
        <i className="pe-sep" />
        <div className="pe-grp">
          <button className={`pe-tool listen${playing ? " on" : ""}`} onClick={playVoice} title="Listen to this slide's voice"><Ic n={playing ? "stop" : "speaker"} /><span>{playing ? "Stop" : "Listen"}</span></button>
        </div>
        <div className="pe-grow" />
        <div className="pe-grp">
          <button className="pe-tool sm" onClick={() => setZoom(Math.max(0.5, +(zoom - 0.1).toFixed(1)))}>−</button>
          <button className="pe-num btn" onClick={() => setZoom(1)} title="Fit to window">{Math.round(scale * 100)}%</button>
          <button className="pe-tool sm" onClick={() => setZoom(Math.min(1.6, +(zoom + 0.1).toFixed(1)))}>+</button>
        </div>
      </div>

      {/* ---- body ---- */}
      <div className="pe-body">
        {/* course structure */}
        <aside className="pe-struct" aria-label="Course structure">
          <div className="pe-st-head"><b>Course structure</b><small>{slides.length} items</small></div>
          <div className="pe-st-scroll">
            {SECTIONS.map((sec) => {
              const list = slides.filter((x) => x.sec === sec);
              const shut = closed[sec];
              const native = LAYOUTS.filter((l) => l.sec === sec);
              const choices = picker && picker.sec === sec && picker.all ? [...native, ...LAYOUTS.filter((l) => l.sec !== sec)] : native;
              return (
                <section key={sec} className="pe-sec" style={tone(sec)}>
                  <div className="pe-sec-h" onDragOver={(e) => e.preventDefault()} onDrop={() => dropSec(sec)}>
                    <button type="button" className="pe-sec-t" aria-expanded={!shut} onClick={() => setClosed((o) => ({ ...o, [sec]: !o[sec] }))}>
                      <Ic n={shut ? "next" : "down"} size={13} /><b>{sec}</b><em>{list.length}</em>
                    </button>
                    <button type="button" className="pe-sec-add" aria-label={`Add a slide to ${sec}`} title={`Add a slide to ${sec}`} onClick={() => setPicker((p) => (p && p.sec === sec ? null : { sec, all: false }))}><Ic n="plus" size={15} /></button>
                  </div>

                  {picker && picker.sec === sec && (
                    <div className="pe-pick">
                      {choices.map((l) => (
                        <button key={l.k} type="button" onClick={() => addSlide(l.k, sec, true)}>
                          <span className="pe-ico" style={tone(l.sec)}><Ic n={l.ic} size={14} /></span>{l.n}
                        </button>
                      ))}
                      {!picker.all && <button type="button" className="more" onClick={() => setPicker({ sec, all: true })}>Show all slide types</button>}
                    </div>
                  )}

                  {!shut && list.map((x) => (
                    <div key={x.id}>
                      <div role="button" tabIndex={0}
                        className={`pe-it${x.id === selId ? " on" : ""}${dragId === x.id ? " drag" : ""}`}
                        draggable onDragStart={() => setDragId(x.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => drop(x.id)} onDragEnd={() => setDragId(null)}
                        onClick={() => setSelId(x.id)}
                        onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setSelId(x.id); } }}>
                        <span className="pe-grip" aria-hidden="true"><Ic n="grip" size={12} /></span>
                        <span className="pe-ico"><Ic n={LAY[x.layout].ic} size={15} /></span>
                        <span className="pe-rt"><b>{rowName(x)}</b><small>{LAY[x.layout].tag}</small></span>
                        {x.voice && x.voice.mode !== "none" && <span className="pe-th-v2" title="This slide has a voice"><Ic n="speaker" size={11} /></span>}
                        <button type="button" className="pe-more" aria-label="Slide actions" onClick={(e) => { e.stopPropagation(); setSelId(x.id); setRowMenu(rowMenu === x.id ? null : x.id); }}><Ic n="dots" size={16} /></button>
                      </div>
                      {rowMenu === x.id && (
                        <div className="pe-rowmenu" onClick={(e) => e.stopPropagation()}>
                          <button type="button" onClick={() => { dupSlide(); setRowMenu(null); }}><Ic n="copy" size={14} />Duplicate</button>
                          <button type="button" onClick={() => move(-1)} disabled={idx === 0}><Ic n="up" size={14} />Up</button>
                          <button type="button" onClick={() => move(1)} disabled={idx === slides.length - 1}><Ic n="down" size={14} />Down</button>
                          <button type="button" className="del" onClick={() => { delSlide(); setRowMenu(null); }}><Ic n="trash" size={14} />Delete</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {!shut && list.length === 0 && <p className="pe-empty">No slides here yet. Use + to add one, or drop a slide here.</p>}
                </section>
              );
            })}
          </div>
          <p className="pe-st-foot">Drag rows to reorder, or drop a slide into another section to move it.</p>
        </aside>

        <main className="pe-stage" ref={stage}>
          <div className="pe-crumb">
            <span>SLIDE {idx + 1}</span> {lay.n} · {cur.sec} · click any text to edit
            {cur.ownBrand && <em className="pe-own">Custom style</em>}
          </div>
          <div className="pe-canvas"><SlideView key={cur.id} s={look} n={idx + 1} title={title} edit upd={upd} scale={scale} go={go} hasPrev={idx > 0} hasNext={idx < slides.length - 1} /></div>
        </main>

        {/* properties */}
        <aside className="pe-props">
          <div className="pe-ph"><small>Properties</small><b>{rowName(cur)}</b></div>
          <div className="pe-tabs" role="tablist">
            {[["design", "Design"], ["content", "Content"], ["settings", "Settings"], ["voice", "Voice"]].map(([k, n]) => (
              <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{n}</button>
            ))}
          </div>

          {/* DESIGN */}
          {tab === "design" && (
            <div className="pe-pane">
              <div className={`pe-scope${cur.ownBrand ? " own" : ""}`}>
                <span className="pe-scope-i"><Ic n="pal" size={16} /></span>
                <span><b>{cur.ownBrand ? "This slide only" : "Course branding"}</b>
                  <small>{cur.ownBrand ? "This slide uses its own styling." : "Changes apply to every slide that follows the course branding."}</small></span>
                <button type="button" onClick={() => upd({ ownBrand: !cur.ownBrand })}>{cur.ownBrand ? "Use course style" : "Style this slide"}</button>
              </div>
              <h4>Theme</h4>
              <div className="pe-themes">
                {THEMES.map((t) => (
                  <button key={t.n} className={look.bg === t.bg ? "on" : ""} onClick={() => setLook({ bg: t.bg, fg: t.fg })} title={t.n}>
                    <i style={{ background: t.bg }}><b style={{ color: t.fg }}>Aa</b></i><small>{t.n}</small>
                  </button>
                ))}
              </div>
              <h4>Custom background</h4>
              <label className="pe-row"><input type="color" value={/^#[0-9a-f]{6}$/i.test(look.bg) ? look.bg : "#ffffff"} onChange={(e) => setLook({ bg: e.target.value })} /><span>Pick a solid colour</span></label>
              <h4>Text size <em>{Math.round(cur.k * 100)}%</em></h4>
              <input type="range" min="70" max="150" step="5" value={Math.round(cur.k * 100)} onChange={(e) => upd({ k: e.target.value / 100 })} />
              <h4>Font</h4>
              <select className="pe-sel full" value={look.font} onChange={(e) => setLook({ font: e.target.value })}>{FONTS.map(([n, v]) => <option key={n} value={v}>{n}</option>)}</select>
              {cur.ownBrand && (
                <button className="pe-btn full" onClick={() => { setBrand({ bg: cur.bg, fg: cur.fg, font: cur.font }); commit((sl) => sl.map((x) => ({ ...x, ownBrand: false }))); flash("Now the course branding for every slide"); }}>Make this the course branding</button>
              )}
              {!cur.ownBrand && slides.some((x) => x.ownBrand) && (
                <button className="pe-btn full" onClick={() => { commit((sl) => sl.map((x) => ({ ...x, ownBrand: false }))); flash("All slides follow the course branding"); }}>Reset every slide to course branding</button>
              )}
            </div>
          )}

          {/* CONTENT */}
          {tab === "content" && (
            <div className="pe-pane">
              {contentBody}

              <details className="pe-det">
                <summary>Slide type and section</summary>
                <div>
                  <span className="pe-lab">Section</span>
                  <select className="pe-sel full" value={cur.sec} onChange={(e) => upd({ sec: e.target.value })} aria-label="Section">
                    {SECTIONS.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                  {SECTIONS.map((sec) => (
                    <div key={sec}>
                      <p className="pe-gl">{sec}</p>
                      <div className="pe-layouts">
                        {LAYOUTS.filter((l) => l.sec === sec).map((l) => (
                          <button key={l.k} className={cur.layout === l.k ? "on" : ""} onClick={() => setLayout(l.k)}>
                            <span className="pe-ico" style={tone(l.sec)}><Ic n={l.ic} size={14} /></span><b>{l.n}</b>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}

          {/* SETTINGS */}
          {tab === "settings" && (
            <div className="pe-pane">
              <label className="pe-lab" htmlFor="pe-delay">Next button delay</label>
              <select id="pe-delay" className="pe-sel full" value={cur.delay} onChange={(e) => upd({ delay: Number(e.target.value) })}>
                {DELAYS.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
              </select>
              <small className="pe-hint">{cur.delay ? "Learners cannot continue until the timer ends." : "Learners can continue as soon as the slide opens."}</small>

              <label className="pe-lab" htmlFor="pe-dur">Slide duration (seconds)</label>
              <input id="pe-dur" className="pe-in" type="number" min="0" max="3600" value={cur.duration} onChange={(e) => quiet({ duration: clamp(e.target.value, 0, 3600) })} />
              <small className="pe-hint">0 means the slide has no time limit.</small>
              {cur.duration > 0 && cur.delay > cur.duration && <small className="pe-hint warn">The Next button delay is longer than the slide duration. Shorten the delay.</small>}

              <Switch on={cur.mandatory} set={(v) => upd({ mandatory: v })} t="Mandatory slide" d="Learner cannot skip ahead" />
              <Switch on={cur.nav} set={(v) => upd({ nav: v })} t="Show navigation buttons" d="Back and Next in the player" />
              <Switch on={cur.ownBrand} set={(v) => upd({ ownBrand: v })} t="Override branding" d="Use this slide's own styling" />

              <label className="pe-lab" htmlFor="pe-notes">Slide notes</label>
              <textarea id="pe-notes" className="pe-ta" rows="5" value={cur.notes} placeholder="Talking points, timing or context…" onChange={(e) => quiet({ notes: e.target.value })} />
              <small className="pe-hint">Visible to authors only, in the editor and preview.</small>

              <button className="pe-btn full" onClick={() => { commit((sl) => sl.map((x) => ({ ...x, delay: cur.delay, duration: cur.duration, mandatory: cur.mandatory, nav: cur.nav }))); flash("Settings applied to all slides"); }}>Apply these settings to all slides</button>
            </div>
          )}

          {/* VOICE */}
          {tab === "voice" && (
            <div className="pe-pane">
              <h4>Narration for this slide</h4>
              <div className="pe-vmodes">
                {[["none", "No voice", "Learners just read"], ["tts", "Read aloud", "Auto from slide text"], ["audio", "My voice", "Record or upload"]].map(([k, t, d]) => (
                  <button key={k} className={vc.mode === k ? "on" : ""} onClick={() => { stopVoice(); setVoice({ mode: k }); }}><b>{t}</b><small>{d}</small></button>
                ))}
              </div>

              {vc.mode === "tts" && (<>
                <h4>Language</h4>
                <select className="pe-sel full" value={vc.lang} onChange={(e) => setVoice({ lang: e.target.value })}>
                  {VLANGS.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
                </select>
                {!hasVoice && <small className="pe-hint warn">This device has no voice installed for this language, so it will use the default voice. For Tamil, install a Tamil voice in your system settings, or use “My voice”.</small>}
                <h4>Speed <em>{vc.rate.toFixed(1)}×</em></h4>
                <input type="range" min="0.7" max="1.4" step="0.1" value={vc.rate} onChange={(e) => setVoice({ rate: Number(e.target.value) })} />
                <h4>What will be read</h4>
                <div className="pe-said">{slideText(cur) || "This slide has no text yet."}</div>
                <button className="pe-btn full" onClick={playVoice}><Ic n={playing ? "stop" : "speaker"} size={14} /> {playing ? "Stop" : "Preview voice"}</button>
                <button className="pe-btn full" onClick={() => commit((sl) => sl.map((x) => ({ ...x, voice: { ...DEFAULT_VOICE, ...(x.voice || {}), mode: "tts", lang: vc.lang, rate: vc.rate } })))}>Use this for all slides</button>
              </>)}

              {vc.mode === "audio" && (<>
                <h4>Record or upload</h4>
                <button className={`pe-rec${rec ? " on" : ""}`} onClick={toggleRec}>
                  <span><Ic n={rec ? "stop" : "mic"} size={20} /></span>
                  <b>{rec ? "Stop recording" : "Record with microphone"}</b>
                  <small>{rec ? "Recording… speak now" : "Allow the microphone when asked"}</small>
                </button>
                <label className="pe-btn full pe-up"><Ic n="upload" size={14} /> Upload an audio file
                  <input type="file" accept="audio/*" hidden onChange={(e) => { pickAudio(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
                {vc.has && (
                  <div className="pe-clip">
                    <Ic n="speaker" size={16} /><span>{vc.name || "Audio clip"}</span>
                    <button onClick={playVoice} aria-label={playing ? "Stop" : "Play"}><Ic n={playing ? "stop" : "play"} size={13} /></button>
                    <button onClick={removeAudio} aria-label="Delete audio"><Ic n="trash" size={13} /></button>
                  </div>
                )}
                <small className="pe-hint">Tip: keep each clip under 1–2 minutes. MP3, WAV, M4A and WebM all work.</small>
              </>)}

              {vc.mode === "none" && <small className="pe-hint">Pick “Read aloud” to let the browser read the slide, or “My voice” to record your own narration.</small>}
            </div>
          )}
        </aside>
      </div>

      <footer className="pe-foot"><b>{slides.length}</b> slides · <b>{qCount}</b> {qCount === 1 ? "question" : "questions"} · Shortcuts: Ctrl+Z undo · Ctrl+D duplicate · ↑ ↓ switch slides</footer>
      {toast && <div className="pe-toast" role="status">{toast}</div>}
    </div>
  );
}