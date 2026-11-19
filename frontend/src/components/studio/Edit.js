import { useState, useEffect, useRef, useCallback } from "react";
import "./Edit.css";
import { Logo, BrandName, BrandEditor, LogoPanel, EditableBrand, useBrand } from "./Logo";   // editable logo (Logo.js + Logo.css)

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

const isVideoFile = (f) => !!f && ((f.type || "").startsWith("video/") || /\.(mp4|m4v|webm|ogv|mov)$/i.test(f.name || ""));
// keep an uploaded video on this device; returns "" when saved, or the reason it was not
const storeVideo = async (f, id) => {
  if (!isVideoFile(f)) return "Please choose a video file (MP4 or WebM)";
  if (f.size > 300 * 1024 * 1024) return "That video is over 300 MB. Use a smaller file or a link";
  try { await aPut(`v:${id}`, f); } catch (e) { return "Couldn't store the video on this device"; }
  return "";
};
// a slide's video: an uploaded file (kept in IndexedDB, key "v:<slide id>") wins over the pasted link
function useVideoSrc(s) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!s.vfile) { setUrl(""); return undefined; }
    let dead = false, u = "";
    aGet(`v:${s.id}`).then((b) => { if (!dead && b) { u = URL.createObjectURL(b); setUrl(u); } }).catch(() => {});
    return () => { dead = true; if (u) URL.revokeObjectURL(u); };
  }, [s.id, s.vfile, s.vver]);
  return s.vfile ? url : s.video;
}

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
  { k: "vidtext", n: "Video + text", tag: "VIDEO + TEXT", ic: "pplay", sec: "Content", d: "Text beside a video" },
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
const BRAND0 = { bg: THEMES[2].bg, fg: THEMES[2].fg, font: FONTS[0][1], accent: "" };

const DELAYS = [[0, "Immediate"], [5, "After 5 seconds"], [10, "After 10 seconds"], [15, "After 15 seconds"], [30, "After 30 seconds"], [60, "After 1 minute"], [120, "After 2 minutes"]];

// question timer presets, accent colours, difficulty, points
const QTIMES = [[0, "No limit"], [15, "15s"], [30, "30s"], [45, "45s"], [60, "1 min"], [90, "90s"], [120, "2 min"], [180, "3 min"]];
const POINTS = [[1, "1"], [2, "2"], [3, "3"], [5, "5"], [10, "10"]];
const LEVELS = [["", "Not set"], ["easy", "Easy"], ["medium", "Medium"], ["hard", "Hard"]];
const ACCENTS = [["", "Rainbow"], ["#5b7cfa", "Blue"], ["#14b8a6", "Teal"], ["#22c55e", "Green"], ["#f59e0b", "Amber"], ["#f97316", "Orange"], ["#ec4899", "Pink"], ["#8b5cf6", "Purple"]];
const fmtT = (s) => (s >= 60 ? (s % 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s / 60} min`) : `${s}s`);

/* ---------- slide model ---------- */
const mk = (layout, o = {}) => ({
  id: uid(), layout, sec: SEC_OF[layout],
  title: "", body: "",
  items: ["First point", "Second point", "Third point"],
  points: [["Recognise", "what matters in everyday work"], ["Apply", "it confidently with your team"], ["Report", "problems quickly and clearly"]],
  cols: [["Do", "Describe the right way to do it."], ["Don't", "Describe what to avoid."]],
  q: "Which option is correct?", options: ["Option A", "Option B", "Option C"], answer: 0, answers: [0], accepted: "", explain: "",
  cfg: { pass: 80, tries: 3, shuffle: true, review: true, qtime: 0, showTimer: true, autoNext: true },
  passMsg: "Well done! You passed the course.", failMsg: "You did not reach the pass mark. Review the slides and try again.",
  img: "", video: "", poster: "", vfile: "", vver: 0, vfit: "cover", flip: false,
  bg: BRAND0.bg, fg: BRAND0.fg, font: BRAND0.font, accent: "", deco: true,
  qtime: 0, pts: 1, level: "", hint: "", must: false, shufOpt: false, k: 1, align: "left", bold: false, ital: false, notes: "",
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
  vidtext: { title: "Watch and learn", body: "A short video with the key points beside it.", items: ["First key point", "Second key point", "Third key point"] },
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
/* ---------- 4 starter templates: each course opens with its own look + content ---------- */
const ACC = (i) => ({ ownBrand: true, bg: THEMES[i].bg, fg: THEMES[i].fg });   // accent look for the opening / closing slides
const TPL_BRANDS = [
  { bg: THEMES[2].bg, fg: THEMES[2].fg, font: FONTS[0][1] },    // 1 Compliance:  Sky + Inter
  { bg: THEMES[8].bg, fg: THEMES[8].fg, font: FONTS[1][1] },    // 2 Product:     Aqua + Plus Jakarta Sans
  { bg: THEMES[7].bg, fg: THEMES[7].fg, font: FONTS[2][1] },    // 3 Onboarding:  Peach + Georgia
  { bg: THEMES[11].bg, fg: THEMES[11].fg, font: FONTS[3][1] },  // 4 Security:    Midnight + Mono
];
// choose the template from the course topic; any other course cycles through the four
const tplIndex = (course) => {
  const t = `${course.title || ""} ${course.tag || ""}`.toLowerCase();
  if (/phish|security|cyber/.test(t)) return 3;
  if (/onboard|joiner|people|welcome/.test(t)) return 2;
  if (/product|pulse|sales|marketing/.test(t)) return 1;
  if (/compliance|data|protect|privacy|gdpr/.test(t)) return 0;
  return (Math.abs(parseInt(course.id, 10)) || 0) % 4;
};
const starterBrand = (course) => TPL_BRANDS[tplIndex(course)];

const starterSlides = (course) => {
  const min = course.min || 20;
  const intro = course.desc || course.title;
  const T = [
    /* 1 · Compliance */ [
      S("welcome", { title: course.title || "Welcome", body: intro, ...ACC(11) }),
      S("overview", { title: "Course overview", body: "A quick look at what you will cover and how long it takes.", items: [`${min} minutes`, "Short, practical sections", "5 quiz questions"] }),
      S("objectives", { title: "Learning objectives", body: "By the end you will be able to:", points: [["Recognise", "personal data in everyday work"], ["Apply", "the six principles"], ["Report", "a breach within 72 hours"]] }),
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
      S("thanks", { title: "Thank you", body: "You have completed the course. Your certificate is ready.", ...ACC(11) }),
      S("takeaways", { title: "Key takeaways", body: "Remember these three things:", items: ["Know what counts as personal data", "Share only what is needed", "Report problems straight away"] }),
    ],
    /* 2 · Product knowledge */ [
      S("welcome", { title: course.title || "Product knowledge", body: intro, ...ACC(9) }),
      S("overview", { title: "What is inside the suite", body: "A fast tour of the product and how to talk about it.", items: [`${min} minutes`, "Four product modules", "5-question knowledge check"] }),
      S("objectives", { title: "Learning objectives", body: "After this course you can:", points: [["Explain", "what the product does in one minute"], ["Match", "each module to a customer need"], ["Position", "it clearly against other tools"]] }),
      S("content", { title: "Meet the Pulse Suite", body: "Pulse helps teams build, deliver and track training in one place.", items: ["Author: build courses fast", "Deliver: share with any team", "Track: see progress and scores"] }),
      S("points", { title: "Four modules", body: "Each module solves one job:", points: [["Author", "build slides and quizzes"], ["Deliver", "assign to teams in a click"], ["Track", "live progress and reports"]] }),
      S("text", { title: "Who it is for", body: "Pulse suits HR, compliance and sales teams that need quick, trackable training." }),
      S("video", { title: "Pulse in 90 seconds", body: "A short demo you can reuse with customers." }),
      S("twocol", { title: "Talking to customers", body: "Keep the conversation about their problem.", cols: [["Say", "Lead with the customer's training problem."], ["Avoid", "Reading out a long list of features."]] }),
      S("config", { title: "Knowledge check", body: "Answer every question. You need the pass mark below to finish." }),
      S("mcq", { title: "Question 1", q: "Which module is used to build slides and quizzes?", options: ["Author", "Deliver", "Track"], answer: 0, explain: "Author is where courses are built." }),
      S("multi", { title: "Question 2", q: "What does Pulse help with? Select all that apply.", options: ["Building courses", "Assigning to teams", "Tracking scores", "Payroll processing"], answers: [0, 1, 2], explain: "Pulse is about training, not payroll." }),
      S("tf", { title: "Question 3", q: "Pulse can show learner progress and quiz scores.", answer: 0, explain: "The Track module shows both." }),
      S("short", { title: "Question 4", q: "Which module shows learner progress reports?", accepted: "track, tracking", explain: "Track holds progress and reports." }),
      S("mcq", { title: "Question 5", q: "A customer says training is hard to follow up. What do you lead with?", options: ["A long feature list", "How Track shows progress live", "The price"], answer: 1, explain: "Start with the problem the customer has." }),
      S("result", { title: "Your result" }),
      S("thanks", { title: "Thank you", body: "You now know the suite well enough to demo it with confidence.", ...ACC(9) }),
      S("takeaways", { title: "Key takeaways", body: "Remember these three things:", items: ["Author, Deliver, Track", "Lead with the customer's problem", "Show progress, not features"] }),
    ],
    /* 3 · Onboarding */ [
      S("welcome", { title: course.title || "Welcome aboard", body: intro, ...ACC(10) }),
      S("overview", { title: "Your first week", body: "Here is how the week looks.", items: ["Day 1: meet your team and get set up", "Days 2-3: tools and policies", "Day 5: check in with your manager"] }),
      S("objectives", { title: "Learning objectives", body: "By the end of this course you will:", points: [["Meet", "the people you will work with"], ["Set up", "your accounts and tools"], ["Know", "where to find help"]] }),
      S("content", { title: "Who to ask for what", body: "You never need to guess who can help.", items: ["Manager: your role and goals", "People team: pay, leave and benefits", "IT desk: laptop and accounts"] }),
      S("points", { title: "Our values", body: "These guide how we work:", points: [["Own it", "take responsibility for results"], ["Be kind", "assume good intent"], ["Keep learning", "ask and share often"]] }),
      S("text", { title: "How we work", body: "We work in short cycles, share progress openly and ask for help early." }),
      S("video", { title: "A tour of the office", body: "Take a quick walk around before you arrive." }),
      S("twocol", { title: "First-week etiquette", body: "Small habits that help you settle in.", cols: [["Do", "Introduce yourself and ask plenty of questions."], ["Don't", "Wait to be asked before you reach out."]] }),
      S("config", { title: "Quick check", body: "Five short questions. You need the pass mark below to finish." }),
      S("mcq", { title: "Question 1", q: "Who do you contact for a laptop problem?", options: ["The IT desk", "The finance team", "A client"], answer: 0, explain: "The IT desk looks after laptops and accounts." }),
      S("multi", { title: "Question 2", q: "What should you do in week one? Select all that apply.", options: ["Meet your team", "Set up your accounts", "Skip the policies", "Agree goals with your manager"], answers: [0, 1, 3], explain: "Read the policies too, they matter." }),
      S("tf", { title: "Question 3", q: "You should wait until someone asks before you ask for help.", answer: 1, explain: "Ask early, everyone expects it." }),
      S("short", { title: "Question 4", q: "On which day of your first week is the manager check-in?", accepted: "5, day 5, five", explain: "The check-in is on day 5." }),
      S("mcq", { title: "Question 5", q: "Where do you find leave and benefits information?", options: ["The People team", "A competitor", "Social media"], answer: 0, explain: "The People team looks after pay, leave and benefits." }),
      S("result", { title: "Your result" }),
      S("thanks", { title: "You are ready", body: "We are glad you joined. See you on day one!", ...ACC(10) }),
      S("takeaways", { title: "Key takeaways", body: "Remember these three things:", items: ["Ask for help early", "Know who to contact", "Live our values every day"] }),
    ],
    /* 4 · Security awareness */ [
      S("welcome", { title: course.title || "Phishing awareness", body: intro, ...ACC(9) }),
      S("overview", { title: "What you will learn", body: "Learn to spot a fake before it spots you.", items: [`${min} minutes`, "Real examples of fake emails", "5 quick checks"] }),
      S("objectives", { title: "Learning objectives", body: "By the end you will be able to:", points: [["Spot", "the warning signs of a fake email"], ["Check", "links and senders before you click"], ["Report", "anything suspicious straight away"]] }),
      S("content", { title: "Anatomy of a phishing email", body: "Fake emails try to rush you into acting without thinking.", items: ["Urgent or threatening language", "A sender address that looks slightly wrong", "Links or attachments you did not expect"] }),
      S("points", { title: "Red flags", body: "Stop if you see any of these:", points: [["Urgency", "pressure to act right now"], ["Mismatch", "link text differs from the real address"], ["Requests", "passwords, codes or payments"]] }),
      S("text", { title: "Check before you click", body: "Hover over a link to see where it really goes. If anything feels off, stop and ask." }),
      S("video", { title: "How a phishing attack works", body: "Follow one attack from the first email to the damage." }),
      S("twocol", { title: "Safe habits", body: "Two habits that stop most attacks.", cols: [["Do", "Report suspicious email with the report button."], ["Don't", "Click links or open files from unknown senders."]] }),
      S("config", { title: "Quiz instructions", body: "Answer every question. You need the pass mark below to complete the course." }),
      S("mcq", { title: "Question 1", q: "Which is a common sign of phishing?", options: ["An urgent request for your password", "A newsletter you subscribed to", "A calendar invite from your team"], answer: 0, explain: "Urgency and password requests are classic signs." }),
      S("multi", { title: "Question 2", q: "Which of these are red flags? Select all that apply.", options: ["Misspelled sender address", "Unexpected attachment", "Message from a known colleague", "Threat to close your account"], answers: [0, 1, 3], explain: "A normal message from a colleague is not a red flag." }),
      S("tf", { title: "Question 3", q: "It is safe to click a link if the email looks professional.", answer: 1, explain: "Attackers copy professional designs." }),
      S("short", { title: "Question 4", q: "What do you do with a suspicious email? (one word)", accepted: "report, reported", explain: "Always report it." }),
      S("mcq", { title: "Question 5", q: "A text says your parcel is held and asks for a card payment. What do you do?", options: ["Pay quickly", "Ignore it and report it", "Reply with your details"], answer: 1, explain: "Never pay or reply. Report it." }),
      S("result", { title: "Your result" }),
      S("thanks", { title: "Thank you", body: "You are now a human firewall. Stay alert!", ...ACC(9) }),
      S("takeaways", { title: "Key takeaways", body: "Remember these three things:", items: ["Pause before you click", "Check the sender and the link", "Report anything suspicious"] }),
    ],
  ];
  return T[tplIndex(course)];
};

// the text the browser voice reads for a slide
const slideText = (s) => {
  const parts = [s.title, s.body];
  if (["content", "vidtext", "overview", "takeaways"].includes(s.layout)) parts.push(...s.items);
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

/* ---------- pill chooser (time, points, difficulty) ---------- */
const Chips = ({ opts, val, on }) => (
  <div className="pe-chips" role="group">
    {opts.map(([v, n]) => <button key={String(v)} type="button" className={`${val === v ? "on " : ""}${typeof v === "string" ? v : ""}`} aria-pressed={val === v} onClick={() => on(v)}>{n}</button>)}
  </div>
);

/* ---------- on/off switch row ---------- */
const Switch = ({ on, set, t, d }) => (
  <button type="button" role="switch" aria-checked={on} className={`pe-sw${on ? " on" : ""}`} onClick={() => set(!on)}>
    <span><b>{t}</b><small>{d}</small></span><i />
  </button>
);

/* ---------- media block ---------- */
function Media({ s, edit, upd, video }) {
  const file = useRef(null);
  const vpick = useRef(null);
  const src = video ? s.poster : s.img;
  const vsrc = useVideoSrc(s);
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [vsrc]);
  const [note, setNote] = useState("");
  const readVideo = async (f) => {
    if (!f) return;
    setNote("Saving video…");
    const err = await storeVideo(f, s.id);
    if (err) return setNote(err);
    upd({ vfile: f.name, vver: Date.now() }); setNote("");
  };
  const read = (f) => {
    if (video && isVideoFile(f)) { readVideo(f); return; }   // a video picked with the Poster button is still a video
    if (!f || !f.type.startsWith("image/")) { if (f) setNote("The poster must be an image (JPG or PNG)"); return; }
    const r = new FileReader();
    r.onload = () => upd(video ? { poster: r.result } : { img: r.result });
    r.readAsDataURL(f);
  };
  return (
    <div className={`ps-media${video ? " is-video" : ""}${src ? " has-img" : ""}${video && s.vfit === "contain" ? " fit-contain" : ""}`}>
      {video && edit && vsrc && !bad
        ? <video key={vsrc} src={vsrc} poster={s.poster || undefined} controls playsInline preload="metadata" onError={() => setBad(true)} />
        : src
          ? <img src={src} alt="" />
          : <div className="ps-ph"><Ic n={video ? "play" : "image"} size={44} /><span>{video ? (bad ? "This video can't be played. Upload an MP4 or check the link." : "Upload a video or paste a link in Content") : "Add an image"}</span>
            {video && edit && (
              <label className="ps-bigup"><Ic n="upload" size={16} /> Upload video
                <input type="file" accept="video/*" hidden onChange={(e) => { readVideo(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
            )}
          </div>}
      {note && <small className="ps-note">{note}</small>}
      {video && !edit && <span className="ps-play"><Ic n="play" size={30} /></span>}
      {edit && (
        <>
          {video && vsrc && <button type="button" className="ps-mbtn ps-m2" onClick={() => vpick.current?.click()}><Ic n="upload" size={14} /> Video</button>}
          {video && <input ref={vpick} type="file" accept="video/*" hidden onChange={(e) => { readVideo(e.target.files?.[0]); e.target.value = ""; }} />}
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

  const cls = ["ps", `t-${L}`, s.flip ? "flip" : "", s.bold ? "is-bold" : "", s.ital ? "is-ital" : "", edit ? "is-edit" : "", s.deco === false ? "no-deco" : "", s.accent ? "has-accent" : ""].join(" ");
  const style = { "--bg": s.bg, "--fg": s.fg, "--k": s.k, "--accent": s.accent || undefined, fontFamily: s.font, textAlign: s.align, transform: `scale(${scale})` };

  const qmeta = QUIZ.includes(L) && (s.qtime > 0 || s.pts > 0 || s.level || s.must || s.hint);
  const LV = { easy: "Easy", medium: "Medium", hard: "Hard" };

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
        <div className="ps-head"><span className="ps-brand">{edit ? <EditableBrand /> : <><Logo as="b" cls="" /> <BrandName /></>}</span><small>{title}</small></div>

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

        {L === "vidtext" && (
          <div className="ps-main">
            <div className="ps-text">
              {head("Slide title")}
              <Ed edit={edit} cls="ps-body" v={s.body} on={set("body")} ph="Add text" />
              {itemsBlock}
            </div>
            <Media s={s} edit={edit} upd={upd} video />
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
            <div className="ps-cfg six">
              <div><b>{s.cfg.pass}%</b><span>Pass mark</span></div>
              <div><b>{s.cfg.tries === 0 ? "∞" : s.cfg.tries}</b><span>Attempts</span></div>
              <div><b>{s.cfg.shuffle ? "On" : "Off"}</b><span>Shuffle questions</span></div>
              <div><b>{s.cfg.review ? "On" : "Off"}</b><span>Show answers after</span></div>
              <div><b>{s.cfg.qtime > 0 ? fmtT(s.cfg.qtime) : "None"}</b><span>Time per question</span></div>
              <div><b>{s.cfg.showTimer ? "On" : "Off"}</b><span>Show timer</span></div>
            </div>
          </div>
        )}

        {QUIZ.includes(L) && (
          <div className={`ps-stack ps-quiz${(L === "mcq" || L === "multi") && s.options.length > 4 ? " dense" : ""}${qmeta ? " has-meta" : ""}`}>
            {head("Question title")}
            {qmeta && (
              <div className="ps-qmeta">
                {s.qtime > 0 && <span className="ps-qchip time"><Ic n="clock" size={13} /> {fmtT(s.qtime)}</span>}
                {s.pts > 0 && <span className="ps-qchip pts"><Ic n="award" size={13} /> {s.pts} {s.pts === 1 ? "pt" : "pts"}</span>}
                {s.level && <span className={`ps-qchip lv ${s.level}`}>{LV[s.level]}</span>}
                {s.must && <span className="ps-qchip"><Ic n="lock" size={12} /> Required</span>}
                {s.hint && <span className="ps-qchip hint" title={s.hint}><Ic n="bulb" size={13} /> Hint</span>}
              </div>
            )}
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
// the very first starter deck (Data Protection content for every course). If a course still holds exactly that
// untouched deck but should have its own template, swap it for the right one.
const OLD_SIG = "welcome|overview|objectives|content:What is personal data|points:The six principles|text:Lawful basis|video:Breach response|twocol:Safe sharing|config|mcq:Question 1|multi:Question 2|tf:Question 3|short:Question 4|mcq:Question 5|result|thanks|takeaways";
const FIXED = ["welcome", "overview", "objectives", "config", "result", "thanks", "takeaways"];
const sigOf = (arr) => arr.map((s) => (FIXED.includes(s.layout) ? s.layout : `${s.layout}:${s.title}`)).join("|");
const isOldStarter = (arr) => {
  if (sigOf(arr) !== OLD_SIG) return false;
  const c = arr.find((x) => x.layout === "content");
  return !!c && c.body === "Personal data is any information that can identify a living person.";
};

const load = (KEY, course) => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    const arr = Array.isArray(v) ? v : v && v.slides;
    if (Array.isArray(arr) && arr.length) {
      if (tplIndex(course) !== 0 && isOldStarter(arr)) return { slides: starterSlides(course), brand: starterBrand(course) };
      return { slides: bySec(arr.map(norm)), brand: v && v.brand ? { ...BRAND0, ...v.brand } : BRAND0 };
    }
  } catch (e) { /* ignore */ }
  return { slides: starterSlides(course), brand: starterBrand(course) };
};
const loadCourse = (course) => load(`lernevo.edit.${course.id}`, course);
// real numbers for the course cards: whatever the editor holds (or would open with)
const courseStats = (course) => {
  const sl = loadCourse(course).slides;
  return { slides: sl.length, q: sl.filter((x) => QUIZ.includes(x.layout)).length };
};

/* ---------- editor ---------- */
export default function Edit({ course, onBack, onPreview, startSlideId }) {
  const KEY = `lernevo.edit.${course.id}`;
  const [init] = useState(() => load(KEY, course));
  const [hist, setHist] = useState({ past: [], present: init.slides, future: [] });
  const [brand, setBrand] = useState(init.brand);
  const slides = hist.present;
  const [selId, setSelId] = useState(() => (slides.some((x) => x.id === startSlideId) ? startSlideId : slides[0].id));   // startSlideId: open on this slide (used by the Templates page)
  const [title, setTitle] = useState(course.title);
  const [tab, setTab] = useState("design");
  const [menu, setMenu] = useState(false);
  const [picker, setPicker] = useState(null);      // { sec, all }
  const [rowMenu, setRowMenu] = useState(null);
  const [closed, setClosed] = useState({});
  const [zoom, setZoom] = useState(1);
  const [tmenu, setTmenu] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [brandCfg] = useBrand();
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
  const cur = { qtime: 0, pts: 1, level: "", hint: "", must: false, shufOpt: false, accent: "", deco: true, ...slides[idx],
    cfg: { qtime: 0, showTimer: true, autoNext: true, ...(slides[idx].cfg || {}) } };

  /* slides without "Override branding" follow the course branding */
  const eff = (s) => (s.ownBrand ? s : { ...s, bg: brand.bg, fg: brand.fg, font: brand.font, accent: brand.accent || "" });
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
  const pickVideo = async (f) => {
    if (!f) return;
    const id = selId;
    const err = await storeVideo(f, id);
    if (err) return flash(err);
    commit((sl) => sl.map((x) => (x.id === id ? { ...x, vfile: f.name, vver: Date.now() } : x)));
    flash("Video added to this slide");
  };
  const removeVideo = () => { const id = selId; aDel(`v:${id}`).catch(() => {}); upd({ vfile: "", vver: 0 }); };
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

  /* save right now: Save button, Ctrl/Cmd+S, Back, Preview, and when the editor closes */
  const latest = useRef({ slides, brand });
  latest.current = { slides, brand };
  const saveNow = (say) => {
    try { localStorage.setItem(KEY, JSON.stringify({ v: 2, slides: latest.current.slides, brand: latest.current.brand })); setSaved("saved"); if (say) { setToast("Saved"); setTimeout(() => setToast(""), 1800); } } catch (e) { setSaved("local"); }
  };
  useEffect(() => () => { try { localStorage.setItem(KEY, JSON.stringify({ v: 2, slides: latest.current.slides, brand: latest.current.brand })); } catch (e) { /* ignore */ } }, [KEY]);
  useEffect(() => {
    const k = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); saveNow(true); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

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
    if (cur.vfile) aGet(`v:${cur.id}`).then((b) => b && aPut(`v:${c.id}`, b)).catch(() => {});
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
  const isChoice = cur.layout === "mcq" || cur.layout === "multi";
  const quizOpts = (<>
    <div className="pe-time">
      <div className="pe-time-h">
        <span className="pe-time-i"><Ic n="clock" size={18} /></span>
        <span><b>Time for this question</b><small>{cur.qtime > 0 ? "Countdown starts when the question opens" : "Learners can take as long as they need"}</small></span>
        <em>{cur.qtime > 0 ? fmtT(cur.qtime) : "∞"}</em>
      </div>
      <Chips opts={QTIMES} val={cur.qtime} on={(v) => upd({ qtime: v })} />
      <label className="pe-lab sm" htmlFor="pe-qt">Custom time (seconds)</label>
      <input id="pe-qt" className="pe-in" type="number" min="0" max="3600" value={cur.qtime} onChange={(e) => quiet({ qtime: clamp(e.target.value, 0, 3600) })} />
      <button className="pe-btn full" onClick={() => { commit((sl) => sl.map((x) => (QUIZ.includes(x.layout) ? { ...x, qtime: cur.qtime } : x))); flash("Time applied to every question"); }}>Apply to all questions</button>
    </div>
    <Field label="Points for a correct answer"><Chips opts={POINTS} val={cur.pts} on={(v) => upd({ pts: v })} /></Field>
    <Field label="Difficulty"><Chips opts={LEVELS} val={cur.level} on={(v) => upd({ level: v })} /></Field>
    {area("Hint", "hint", 2, "A small clue (optional)", "Learners can open this if they get stuck.")}
    {isChoice && <Switch on={cur.shufOpt} set={(v) => upd({ shufOpt: v })} t="Shuffle answer options" d="Different order each time" />}
    <Switch on={cur.must} set={(v) => upd({ must: v })} t="Answer required" d="Learner must answer to continue" />
  </>);
  let contentBody;
  const videoFields = (<>
        <Field label="Upload a video" hint="MP4 (H.264) or WebM works best. The file stays on this device.">
          <label className="pe-btn full pe-up"><Ic n="upload" size={14} /> {cur.vfile ? "Replace video file" : "Choose a video file"}
            <input type="file" accept="video/*" hidden onChange={(e) => { pickVideo(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          {cur.vfile && (
            <div className="pe-clip"><Ic n="pplay" size={16} /><span>{cur.vfile}</span>
              <button type="button" onClick={removeVideo} aria-label="Remove uploaded video"><Ic n="trash" size={13} /></button>
            </div>
          )}
        </Field>
        <Field label="Or paste a video link" hint={cur.vfile ? "The uploaded file is used first. Remove it to use the link." : "Paste a direct .mp4 link."}>
          <input className="pe-in" aria-label="Video link" value={cur.video} placeholder="https://…/video.mp4" onChange={(e) => quiet({ video: e.target.value })} />
        </Field>
        <Switch on={cur.vfit === "contain"} set={(v) => upd({ vfit: v ? "contain" : "cover" })} t="Show the whole video" d="No cropping. Black bars may show" />
        <ImageField label="Poster image URL" value={cur.poster} onChange={(poster) => quiet({ poster })} />
  </>);
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
      contentBody = (<>{heading}{desc}{videoFields}</>); break;
    case "vidtext":
      contentBody = (<>{heading}{desc}{bullets}{videoFields}
        <button className="pe-btn full" onClick={() => upd({ flip: !cur.flip })}><Ic n="swap" size={14} /> Video on the {cur.flip ? "right" : "left"}</button></>); break;
    case "config":
      contentBody = (<>{heading}{desc}
        <Field label="Pass mark (%)"><input className="pe-in" type="number" min="0" max="100" aria-label="Pass mark" value={cur.cfg.pass} onChange={(e) => quiet({ cfg: { ...cur.cfg, pass: clamp(e.target.value, 0, 100) } })} /></Field>
        <Field label="Attempts allowed" hint="0 means learners can try as many times as they like.">
          <input className="pe-in" type="number" min="0" max="20" aria-label="Attempts allowed" value={cur.cfg.tries} onChange={(e) => quiet({ cfg: { ...cur.cfg, tries: clamp(e.target.value, 0, 20) } })} /></Field>
        <Switch on={cur.cfg.shuffle} set={(v) => upd({ cfg: { ...cur.cfg, shuffle: v } })} t="Shuffle questions" d="Different order for each learner" />
        <Switch on={cur.cfg.review} set={(v) => upd({ cfg: { ...cur.cfg, review: v } })} t="Show answers after" d="Learners can review the right answers" />
        <Field label="Default time per question" hint="Learners see a countdown for each question. Use the button to give every question this time.">
          <Chips opts={QTIMES} val={cur.cfg.qtime} on={(v) => upd({ cfg: { ...cur.cfg, qtime: v } })} />
        </Field>
        <button className="pe-btn full" onClick={() => { commit((sl) => sl.map((x) => (QUIZ.includes(x.layout) ? { ...x, qtime: cur.cfg.qtime } : x))); flash(cur.cfg.qtime ? `${fmtT(cur.cfg.qtime)} set on every question` : "Time limits removed from every question"); }}><Ic n="clock" size={14} /> Apply to all questions</button>
        <Switch on={cur.cfg.showTimer} set={(v) => upd({ cfg: { ...cur.cfg, showTimer: v } })} t="Show countdown timer" d="Learners see the time left" />
        <Switch on={cur.cfg.autoNext} set={(v) => upd({ cfg: { ...cur.cfg, autoNext: v } })} t="Move on when time ends" d="Unanswered counts as wrong" /></>); break;
    case "mcq": case "multi": {
      const multi = cur.layout === "multi";
      contentBody = (<>{heading}{area("Question", "q", 3, "Type the question")}
        <StrList label="Answer options" items={cur.options} onChange={(options) => quiet({ options })} onRemove={rmOptEd} min={2} max={5} addLabel="Add option" newText="New option"
          marks={(i) => (multi ? cur.answers.includes(i) : cur.answer === i)} square={multi}
          onMark={(i) => (multi ? upd({ answers: cur.answers.includes(i) ? cur.answers.filter((a) => a !== i) : [...cur.answers, i].sort() }) : upd({ answer: i }))} />
        <small className="pe-hint">{multi ? "Tick every correct answer." : "Tick the one correct answer."}</small>
        {feedback}{quizOpts}</>); break;
    }
    case "tf":
      contentBody = (<>{heading}{area("Statement", "q", 3, "Write a statement for learners to judge")}
        <Field label="Correct answer">
          <div className="pe-seg">
            <button type="button" className={`t${cur.answer === 0 ? " on" : ""}`} onClick={() => upd({ answer: 0 })}>True</button>
            <button type="button" className={`f${cur.answer === 1 ? " on" : ""}`} onClick={() => upd({ answer: 1 })}>False</button>
          </div>
        </Field>
        {feedback}{quizOpts}</>); break;
    case "short":
      contentBody = (<>{heading}{area("Question", "q", 3, "Type the question")}
        <Field label="Accepted answers" hint="Separate answers with commas. Capital letters are ignored.">
          <input className="pe-in" aria-label="Accepted answers" value={cur.accepted} placeholder="e.g. 72, 72 hours" onChange={(e) => quiet({ accepted: e.target.value })} />
        </Field>
        {feedback}{quizOpts}</>); break;
    case "result":
      contentBody = (<>{heading}{area("If the learner passes", "passMsg", 3, "Message for learners who pass")}{area("If the learner does not pass", "failMsg", 3, "Message for learners who do not pass")}</>); break;
    default:   // welcome, thanks
      contentBody = <>{heading}{desc}</>;
  }

  const qCount = slides.filter((x) => QUIZ.includes(x.layout)).length;
  const qList = slides.filter((x) => QUIZ.includes(x.layout));
  const totalPts = qList.reduce((a, x) => a + (x.pts || 0), 0);
  const quizSecs = qList.reduce((a, x) => a + (x.qtime || 0), 0);
  const lay = LAY[cur.layout];

  return (
    <div className="pe" onClick={() => { if (menu) setMenu(false); if (tmenu) setTmenu(false); if (rowMenu) setRowMenu(null); }}>
      {/* ---- top bar ---- */}
      <header className="pe-top">
        <div className="pe-left">
          <button className="pe-ib" onClick={() => { saveNow(); onBack(); }} aria-label="Back to courses"><Ic n="back" /></button>
          <span className={`pe-logo${brandCfg.img ? " has-img" : ""}`} role="button" tabIndex={0} title="Change logo" aria-label="Change logo"
            onClick={(e) => { e.stopPropagation(); setBrandOpen(true); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setBrandOpen(true); } }}>
            {brandCfg.img ? <img src={brandCfg.img} alt="Logo" /> : brandCfg.letter}
          </span>
          <div>
            <input className="pe-title" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Course title" />
            <div className="pe-status">
              <span className="pe-pill">● {course.status}</span>
              <small className={saved}>{saved === "saving" ? "Saving…" : saved === "local" ? "Saved (images too big to keep)" : "✓ All changes saved"}</small>
            </div>
          </div>
        </div>
        <div className="pe-right">
          <button className="pe-btn" onClick={() => saveNow(true)} title="Save (Ctrl+S)"><Ic n="check" size={15} /> Save</button>
          <button className="pe-btn" onClick={() => { saveNow(); onPreview(slides.findIndex((x) => x.id === selId)); }}><Ic n="eye" size={15} /> Preview</button>
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
          <button className="pe-tool" onClick={() => saveNow(true)} title="Save (Ctrl+S)"><Ic n="check" /><span>Save</span></button>
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
          {QUIZ.includes(cur.layout) && (
            <div className="pe-rel">
              <button className={`pe-tool timer${cur.qtime > 0 ? " on" : ""}`} onClick={() => setTmenu(!tmenu)} title="Set the time for this question"><Ic n="clock" /><span>{cur.qtime > 0 ? fmtT(cur.qtime) : "Timer"}</span></button>
              {tmenu && (
                <div className="pe-tpop">
                  <p>Time for this question</p>
                  <Chips opts={QTIMES} val={cur.qtime} on={(v) => upd({ qtime: v })} />
                  <button className="pe-btn full" onClick={() => { commit((sl) => sl.map((x) => (QUIZ.includes(x.layout) ? { ...x, qtime: cur.qtime } : x))); setTmenu(false); flash(cur.qtime ? `${fmtT(cur.qtime)} set on every question` : "Time limits removed from every question"); }}>Apply to all questions</button>
                </div>
              )}
            </div>
          )}
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
                          <button type="button" onClick={() => { saveNow(true); setRowMenu(null); }}><Ic n="check" size={14} />Save</button>
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
              <h4>Logo</h4>
              <LogoPanel />
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
              <h4>Accent colour</h4>
              <div className="pe-swatches">
                {ACCENTS.map(([c, n]) => {
                  const on = (look.accent || "") === c;
                  return <button key={n} type="button" className={on ? "on" : ""} style={{ "--sw": c || "linear-gradient(135deg,#38bdf8,#6366f1,#e879f9)" }} title={n} aria-label={n} aria-pressed={on} onClick={() => setLook({ accent: c })}>{on && <Ic n="check" size={13} />}</button>;
                })}
              </div>
              <Switch on={cur.deco !== false} set={(v) => upd({ deco: v })} t="Background shapes" d="Soft dots and circles behind the slide" />
              <h4>Text size <em>{Math.round(cur.k * 100)}%</em></h4>
              <input type="range" min="70" max="150" step="5" value={Math.round(cur.k * 100)} onChange={(e) => upd({ k: e.target.value / 100 })} />
              <h4>Font</h4>
              <select className="pe-sel full" value={look.font} onChange={(e) => setLook({ font: e.target.value })}>{FONTS.map(([n, v]) => <option key={n} value={v}>{n}</option>)}</select>
              {cur.ownBrand && (
                <button className="pe-btn full" onClick={() => { setBrand({ bg: cur.bg, fg: cur.fg, font: cur.font, accent: cur.accent || "" }); commit((sl) => sl.map((x) => ({ ...x, ownBrand: false }))); flash("Now the course branding for every slide"); }}>Make this the course branding</button>
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

      <footer className="pe-foot"><b>{slides.length}</b> slides · <b>{qCount}</b> {qCount === 1 ? "question" : "questions"} · <b>{totalPts}</b> points{quizSecs > 0 && <> · <b>{fmtT(quizSecs)}</b> quiz time</>} · Shortcuts: Ctrl+Z undo · Ctrl+D duplicate · ↑ ↓ switch slides</footer>
      {brandOpen && <BrandEditor onClose={() => setBrandOpen(false)} />}
      {toast && <div className="pe-toast" role="status">{toast}</div>}
    </div>
  );
}
/* used by Preview.js so the preview show
s exactly what the editor saved */
export { starterSlides, starterBrand, loadCourse, courseStats, useVideoSrc, norm, bySec, BRAND0, SlideView };