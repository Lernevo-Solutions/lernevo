import { useState, useEffect } from "react";
import "./course.css";
import Edit from "./Edit";   // new PowerPoint-style editor (edit.js + edit.css)
import Preview from "./Preview"; // voice-guided preview (Preview.js + Preview.css)

/* ---------- media (swap these URLs for your own images / videos) ---------- */
const PHOTO = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=70`;
const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const SAMPLE_POSTER = PHOTO("photo-1550751827-4bd374c3f58b");

/* ---------- sample data ---------- */
const INITIAL_COURSES = [
  { id: 1, status: "Published", art: "shield", tag: "Compliance · Human Resources", title: "Data Protection Essentials",
    desc: "A practical 20-minute course for every Lernevo colleague on handling personal data responsibly — what counts as personal data.",
    slides: 16, min: 20, q: 5, learners: 128, done: 100, edited: "2 days ago", rating: 4.8 },
  { id: 2, status: "Draft", art: "PK", sub: "Product Knowledge", tag: "Product Knowledge · Product Marketing", title: "Product Knowledge: The Lernevo Pulse Suite",
    desc: "Let's get comfortable with the product, one step at a time. A friendly tour of the Pulse suite for everyone who talks to customers.",
    slides: 14, min: 25, q: 4, learners: 64, done: 60, edited: "yesterday", rating: 4.6 },
  { id: 3, status: "Draft", art: "NJ", sub: "Onboarding", tag: "Onboarding · People Operations", title: "New Joiner Onboarding",
    desc: "The first-day essentials for new Lernevo colleagues: systems, people, and the way we work together.",
    slides: 7, min: 25, q: 1, learners: 41, done: 25, edited: "3 days ago", rating: 4.7 },
  { id: 4, status: "In Review", art: "mail", tag: "Security Awareness · IT & Security", title: "Phishing Awareness: Spot the Fake",
    desc: "A short awareness course on recognising phishing attempts, verifying suspicious requests, and reporting them in one click.",
    slides: 11, min: 12, q: 4, learners: 92, done: 90, edited: "today", rating: 4.9 },
];

const PLAYER_SLIDES = [
  { type: "intro", title: "Data Protection Essentials",
    body: "Let’s make data protection feel simple. We handle information about colleagues, candidates and customers every day — this short course shows how to do it confidently, and what to do if something goes wrong.",
    list: ["20 minutes", "5 sections", "5 quiz questions"], scene: "shield" },
  { type: "split", title: "Course overview", body: "Five short sections: what personal data is, the six principles, lawful basis, breach response and safe sharing.", scene: "PK" },
  { type: "points", title: "Learning objectives", body: "By the end you will be able to:",
    points: [["Recognise", "personal data in everyday work"], ["Share", "information safely with the right people"], ["Report", "a breach within the required time"]] },
  { type: "split", flip: true, title: "What is personal data?", body: "Any information that can identify a living person — a name, an email address, an employee ID or even a photo.", scene: "mail" },
  { type: "video", title: "Breach response in 90 seconds", body: "Watch what to do the moment you spot something wrong.", video: SAMPLE_VIDEO, poster: SAMPLE_POSTER },
  { type: "quiz", title: "Quick check", q: "Which of these is personal data?",
    options: ["A work email address that includes a person’s name", "A company-wide sales total", "A public holiday calendar"], answer: 0,
    explain: "An email address with a name identifies a person, so it is personal data." },
  { type: "thanks", title: "Thank you", body: "You have completed the course. Your certificate is ready." },
];

const STRUCTURE = [
  { section: "Introduction", count: 3, items: [["Welcome", "WELCOME"], ["Course overview", "OVERVIEW"], ["Learning objectives", "OBJECTIVES"]] },
  { section: "Content", count: 5, items: [["What is personal data", "TEXT + IMAGE"], ["The six principles", "KEY POINTS"], ["Lawful basis", "TEXT"], ["Breach response", "VIDEO"], ["Safe sharing", "TWO-COLUMN"]] },
  { section: "Questions", count: 5, items: [["Quiz instructions", "CONFIGURATION"], ["Which of these is personal…", "MULTIPLE CHOICE"], ["Which of these are valid la…", "MULTIPLE ANSWER"], ["You can share a colleague…", "TRUE / FALSE"], ["Within how many hours m…", "SHORT ANSWER"]] },
  { section: "Result", count: 1, items: [["Result screen", "RESULT"]] },
  { section: "Conclusion", count: 2, items: [["Thank you", "THANK YOU"], ["Key takeaways", "TAKEAWAYS"]] },
];

/* ---------- tiny icons ---------- */
const Icon = ({ d, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d.split("|").map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const I = {
  home: "M3 11l9-8 9 8|M5 10v10h14V10",
  book: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z|M4 21V5",
  grid: "M4 4h7v7H4z|M13 4h7v7h-7z|M4 13h7v7H4z|M13 13h7v7h-7z",
  list: "M8 6h13|M8 12h13|M8 18h13|M3 6h.01|M3 12h.01|M3 18h.01",
  image: "M3 5h18v14H3z|M3 16l5-5 4 4 3-3 6 6",
  wand: "M5 19L19 5|M14 4v3|M17 6h3|M4 9v2|M3 10h2",
  brush: "M12 3a9 9 0 100 18 2 2 0 002-2c0-1-1-1.5-1-2.5S14 15 15 15h2a4 4 0 004-4 9 9 0 00-9-8z",
  gear: "M12 15a3 3 0 100-6 3 3 0 000 6z|M19 12l2-1-2-4-2 1-2-1V5h-4v2l-2 1-2-1-2 4 2 1v2l-2 1 2 4 2-1 2 1v2h4v-2l2-1 2 1 2-4-2-1z",
  help: "M12 21a9 9 0 100-18 9 9 0 000 18z|M9.5 9.5a2.5 2.5 0 114 2c-1 .6-1.5 1-1.5 2|M12 17h.01",
  plus: "M12 5v14|M5 12h14",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16z|M21 21l-4-4",
  edit: "M4 20h4L19 9l-4-4L4 16z",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z|M12 15a3 3 0 100-6 3 3 0 000 6z",
  copy: "M9 9h11v11H9z|M5 15V4h11",
  back: "M19 12H5|M11 6l-6 6 6 6",
  next: "M5 12h14|M13 6l6 6-6 6",
  check: "M5 12l5 5L20 7",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18z|M12 7v5l3 2",
  users: "M16 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1|M9.5 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7z",
  upload: "M12 16V4|M7 9l5-5 5 5|M4 20h16",
  exit: "M9 21H5V3h4|M16 17l5-5-5-5|M21 12H9",
  dl: "M12 4v12|M7 11l5 5 5-5|M4 20h16",
  send: "M4 12l16-8-6 16-3-7z",
  more: "M5 12h.01|M12 12h.01|M19 12h.01",
  play: "M6 4l14 8-14 8z",
  user: "M20 21a8 8 0 00-16 0|M12 12a4 4 0 100-8 4 4 0 000 8z",
  tag: "M3 12V4h8l10 10-8 8z|M7.5 7.5h.01",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z|M9 12l2 2 4-4",
  award: "M12 14a6 6 0 100-12 6 6 0 000 12z|M8.5 13l-1.5 8 5-3 5 3-1.5-8",
  globe: "M12 21a9 9 0 100-18 9 9 0 000 18z|M3 12h18|M12 3c3 3 3 15 0 18|M12 3c-3 3-3 15 0 18",
};

/* ---------- hero illustration (no photo, no faces) ---------- */
function HeroArt() {
  return (
    <svg viewBox="0 0 800 280" preserveAspectRatio="xMaxYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id="hr-play" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#22d3ee" /><stop offset=".55" stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" /></linearGradient>
        <linearGradient id="hr-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1b1757" /><stop offset=".6" stopColor="#2a237c" /><stop offset="1" stopColor="#3a2c9c" /></linearGradient>
        <linearGradient id="hr-bezel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b3a86" /><stop offset=".5" stopColor="#14123f" /><stop offset="1" stopColor="#262468" /></linearGradient>
        <linearGradient id="hr-rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#c7d2fe" /><stop offset="1" stopColor="#a5b4fc" /></linearGradient>
        <linearGradient id="hr-base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".45" stopColor="#e3e9ff" /><stop offset="1" stopColor="#9aa8f5" /></linearGradient>
        <linearGradient id="hr-bar" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#6366f1" /><stop offset="1" stopColor="#22d3ee" /></linearGradient>
        <linearGradient id="hr-prog" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#22d3ee" /><stop offset="1" stopColor="#c4b5fd" /></linearGradient>
        <linearGradient id="hr-sh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8be9ff" /><stop offset="1" stopColor="#6a4cff" /></linearGradient>
        <linearGradient id="hr-cap" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5b6cff" /><stop offset="1" stopColor="#2a35b8" /></linearGradient>
        <linearGradient id="hr-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#f59e0b" /></linearGradient>
        <linearGradient id="hr-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#eef2ff" /></linearGradient>
        <linearGradient id="hr-glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".22" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <radialGradient id="hr-glow"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset=".5" stopColor="#c7d2fe" stopOpacity=".28" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <radialGradient id="hr-plat" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#a5b4fc" stopOpacity=".7" /><stop offset=".7" stopColor="#c4b5fd" stopOpacity=".25" /><stop offset="1" stopColor="#c4b5fd" stopOpacity="0" /></radialGradient>
        <filter id="hr-soft" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#3b4bdc" floodOpacity=".22" /></filter>
        <filter id="hr-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
        <linearGradient id="hr-shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".28" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <linearGradient id="hr-aur1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a5f3fc" /><stop offset="1" stopColor="#c4b5fd" /></linearGradient>
        <linearGradient id="hr-aur2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fbcfe8" /><stop offset="1" stopColor="#a5b4fc" /></linearGradient>
        <linearGradient id="hr-bk1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4f46e5" /><stop offset="1" stopColor="#7c3aed" /></linearGradient>
        <linearGradient id="hr-bk2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#06b6d4" /><stop offset="1" stopColor="#3b82f6" /></linearGradient>
        <linearGradient id="hr-bk3" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f59e0b" /><stop offset="1" stopColor="#fb7185" /></linearGradient>
        <linearGradient id="hr-neon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#22d3ee" /><stop offset=".5" stopColor="#8b5cf6" /><stop offset="1" stopColor="#f472b6" /></linearGradient>
        <linearGradient id="hr-ray" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset="1" stopColor="#c7d2fe" stopOpacity="0" /></linearGradient>
        <radialGradient id="hr-bulb" cx=".4" cy=".35" r=".7"><stop offset="0" stopColor="#fff7c2" /><stop offset=".6" stopColor="#fbbf24" /><stop offset="1" stopColor="#f59e0b" /></radialGradient>
        <pattern id="hr-dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#6366f1" opacity=".22" /></pattern>
        <clipPath id="hr-scr"><rect x="472" y="56" width="256" height="138" rx="7" /></clipPath>
        <clipPath id="hr-vid"><rect x="484" y="80" width="134" height="84" rx="10" /></clipPath>
      </defs>

      {/* aurora blobs + dotted grid */}
      <g filter="url(#hr-blur)" opacity=".75">
        <ellipse cx="520" cy="70" rx="120" ry="60" fill="url(#hr-aur1)" opacity=".7"><animate attributeName="cx" values="520;560;520" dur="9s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="700" cy="210" rx="110" ry="55" fill="url(#hr-aur2)" opacity=".7"><animate attributeName="cx" values="700;660;700" dur="11s" repeatCount="indefinite" /></ellipse>
      </g>
      <rect x="360" y="10" width="110" height="80" fill="url(#hr-dots)" />
      <rect x="690" y="196" width="100" height="70" fill="url(#hr-dots)" />

      {/* ambient glow + orbit rings with travelling dots */}
      <circle cx="600" cy="130" r="210" fill="url(#hr-glow)" />
      <g opacity=".55">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <path key={a} d="M600 128L588 -40H612z" fill="url(#hr-ray)" transform={`rotate(${a} 600 128)`} />
        ))}
        <animateTransform attributeName="transform" type="rotate" from="0 600 128" to="-360 600 128" dur="70s" repeatCount="indefinite" />
      </g>
      <g>
        <circle cx="600" cy="128" r="152" fill="none" stroke="url(#hr-neon)" strokeWidth="1.6" strokeDasharray="2 9" opacity=".7" />
        <circle cx="600" cy="128" r="130" fill="none" stroke="url(#hr-neon)" strokeWidth="2" strokeDasharray="70 46" strokeLinecap="round" opacity=".5" />
        <animateTransform attributeName="transform" type="rotate" from="0 600 128" to="360 600 128" dur="40s" repeatCount="indefinite" />
      </g>
      <g fill="none" strokeWidth="1.5">
        <ellipse cx="600" cy="140" rx="250" ry="92" stroke="#c5b6ff" opacity=".85" transform="rotate(-11 600 140)" />
        <ellipse cx="600" cy="140" rx="228" ry="84" stroke="#b9d9ff" strokeDasharray="3 7" opacity=".95" transform="rotate(15 600 140)" />
      </g>
      <g transform="rotate(-11 600 140)">
        <circle r="5" fill="#8b5cf6"><animateMotion dur="16s" repeatCount="indefinite" path="M350 140a250 92 0 1 1 500 0a250 92 0 1 1 -500 0" /></circle>
      </g>
      <g transform="rotate(15 600 140)">
        <circle r="4" fill="#22d3ee"><animateMotion dur="12s" repeatCount="indefinite" path="M372 140a228 84 0 1 0 456 0a228 84 0 1 0 -456 0" /></circle>
      </g>
      <g fill="#6d7dff"><circle cx="740" cy="40" r="70" opacity=".09" /><circle cx="440" cy="250" r="46" opacity=".08" /></g>

      {/* sparkles (twinkle) */}
      <g fill="#f5b301">
        <path className="twk" d="M392 26l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
        <path className="twk tw2" d="M780 128l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" />
        <path className="twk tw3" d="M560 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
        <circle cx="782" cy="246" r="3.5" opacity=".7" />
      </g>
      <g fill="#a78bfa"><path className="twk tw2" d="M446 200l1.8 4.6 4.6 1.8-4.6 1.8-1.8 4.6-1.8-4.6-4.6-1.8 4.6-1.8z" opacity=".8" /><circle cx="690" cy="262" r="2.5" opacity=".6" /></g>

      {/* glowing platform */}
      <ellipse cx="600" cy="240" rx="230" ry="20" fill="url(#hr-plat)" />
      {[0, 1.6].map((d) => (
        <ellipse key={d} cx="600" cy="240" rx="120" ry="8" fill="none" stroke="#8b5cf6" strokeWidth="1.6">
          <animate attributeName="rx" values="120;250" dur="3.2s" begin={`${d}s`} repeatCount="indefinite" />
          <animate attributeName="ry" values="8;22" dur="3.2s" begin={`${d}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values=".6;0" dur="3.2s" begin={`${d}s`} repeatCount="indefinite" />
        </ellipse>
      ))}
      <ellipse cx="600" cy="240" rx="196" ry="13" fill="none" stroke="#a5b4fc" strokeWidth="1.2" opacity=".6" />
      <ellipse cx="600" cy="241" rx="176" ry="10" fill="#0b0a33" opacity=".3" />

      {/* screen back-glow */}
      <rect x="480" y="70" width="240" height="130" rx="20" fill="#6366f1" opacity=".45" filter="url(#hr-blur)" />

      {/* laptop lid */}
      <rect x="460" y="44" width="280" height="162" rx="14" fill="url(#hr-bezel)" />
      <rect x="460" y="44" width="280" height="162" rx="14" fill="none" stroke="url(#hr-rim)" strokeWidth="3" />
      <rect x="460" y="44" width="280" height="162" rx="14" fill="none" stroke="url(#hr-neon)" strokeWidth="3.4" strokeLinecap="round" pathLength="100" strokeDasharray="16 84" filter="url(#hr-soft)">
        <animate attributeName="stroke-dashoffset" values="0;-100" dur="5s" repeatCount="indefinite" />
      </rect>
      <circle cx="600" cy="50" r="1.8" fill="#8b93ff" opacity=".8" />
      <rect x="472" y="56" width="256" height="138" rx="7" fill="url(#hr-screen)" />
      <g clipPath="url(#hr-scr)">
        <path d="M472 56h150l-86 138H472z" fill="url(#hr-glare)" />
        <rect x="440" y="40" width="70" height="170" fill="url(#hr-shine)" transform="skewX(-18)" opacity=".9">
          <animate attributeName="x" values="380;760;760" keyTimes="0;.35;1" dur="6s" repeatCount="indefinite" />
        </rect>
        {/* top bar */}
        <circle cx="484" cy="68" r="2.6" fill="#fb7185" /><circle cx="493" cy="68" r="2.6" fill="#fbbf24" /><circle cx="502" cy="68" r="2.6" fill="#34d399" />
        <rect x="540" y="64" width="110" height="8" rx="4" fill="#fff" opacity=".14" />
        <circle cx="714" cy="68" r="5" fill="#c4b5fd" />
        {/* video */}
        <rect x="484" y="80" width="134" height="84" rx="10" fill="url(#hr-play)" />
        <g clipPath="url(#hr-vid)">
          <circle cx="592" cy="102" r="13" fill="#fff" opacity=".3" />
          <path d="M484 164l38-36 26 22 22-18 48 32z" fill="#fff" opacity=".22" />
          <path d="M484 164l22-18 22 12 24-22 66 28z" fill="#fff" opacity=".14" />
          <path d="M484 80h70l-40 84h-30z" fill="#fff" opacity=".07" />
        </g>
        <rect x="490" y="86" width="38" height="14" rx="7" fill="#0f0d3a" opacity=".55" />
        <circle cx="499" cy="93" r="3" fill="#fb7185"><animate attributeName="opacity" values="1;.2;1" dur="1.2s" repeatCount="indefinite" /></circle>
        <text x="505" y="96.5" fontSize="8" fontWeight="800" fill="#fff" fontFamily="Inter, system-ui, sans-serif">LIVE</text>
        <circle cx="551" cy="122" r="23" fill="none" stroke="#fff" strokeWidth="2" opacity=".5">
          <animate attributeName="r" values="22;29;22" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values=".55;0;.55" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="551" cy="122" r="17" fill="#fff" />
        <path d="M546 113l15 9-15 9z" fill="#4f46e5" />
        <rect x="484" y="172" width="134" height="6" rx="3" fill="#fff" opacity=".16" />
        <rect x="484" y="172" width="86" height="6" rx="3" fill="url(#hr-prog)">
          <animate attributeName="width" values="40;96;40" dur="7s" repeatCount="indefinite" />
        </rect>
        <circle cx="570" cy="175" r="5" fill="#fff" />
        {/* lessons */}
        {[84, 108, 132].map((y, k) => (
          <g key={y}>
            <circle cx="634" cy={y + 6} r="7" fill={k < 2 ? "#22c55e" : "none"} stroke={k < 2 ? "none" : "#67e8f9"} strokeWidth="2" />
            {k < 2
              ? <path d={`M630.5 ${y + 6}l2.5 2.5 4.5-5`} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              : <circle cx="634" cy={y + 6} r="2.6" fill="#67e8f9" />}
            <rect x="648" y={y} width="62" height="7" rx="3.5" fill="#fff" opacity={k < 2 ? ".22" : ".4"} />
            <rect x="648" y={y + 10} width="40" height="5" rx="2.5" fill="#fff" opacity=".12" />
          </g>
        ))}
        {/* mini chart (bars grow) */}
        {[14, 24, 18, 32].map((h, k) => (
          <rect key={k} x={650 + k * 16} y={178 - h} width="10" height={h} rx="3" fill="url(#hr-bar)">
            <animate attributeName="height" values={`${h};${h + 6};${h}`} dur={`${3 + k * 0.4}s`} repeatCount="indefinite" />
            <animate attributeName="y" values={`${178 - h};${172 - h};${178 - h}`} dur={`${3 + k * 0.4}s`} repeatCount="indefinite" />
          </rect>
        ))}
      </g>

      {/* hinge + base */}
      <rect x="546" y="203" width="108" height="6" rx="3" fill="#4338ca" opacity=".55" />
      <path d="M468 205H732" stroke="#fff" strokeWidth="1.5" opacity=".5" />
      <path d="M436 208H764L752 224Q750 229 743 229H457Q450 229 448 224Z" fill="url(#hr-base)" />
      <rect x="436" y="208" width="328" height="2" rx="1" fill="#fff" opacity=".9" />
      {[0, 1].map((r) => (
        <g key={r} fill="#6366f1" opacity=".16">
          {Array.from({ length: 16 }).map((_, k) => <rect key={k} x={452 + k * 18.5 + r * 4} y={211 + r * 7} width="14" height="4.5" rx="1.5" />)}
        </g>
      ))}
      <path d="M562 218h76q-3 5-10 5h-56q-7 0-10-5z" fill="#818cf8" opacity=".5" />
      <path d="M452 226H748" stroke="#6366f1" strokeWidth="1" opacity=".25" />

      {/* graduation cap on the lid */}
      <g className="fl">
        <path d="M652 36v18c0 9 60 9 60 0V36" fill="url(#hr-cap)" />
        <path d="M682 6l50 20-50 20-50-20z" fill="#4a5cf0" />
        <path d="M682 6l50 20-50 20z" fill="#fff" opacity=".12" />
        <g>
          <path d="M732 26v24" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" /><circle cx="732" cy="53" r="4" fill="url(#hr-gold)" />
          <animateTransform attributeName="transform" type="rotate" values="-9 732 26;9 732 26;-9 732 26" dur="3s" repeatCount="indefinite" />
        </g>
      </g>

      {/* new-lesson notification */}
      <g className="fl" filter="url(#hr-soft)">
        <rect x="378" y="50" width="92" height="30" rx="15" fill="url(#hr-card)" stroke="#e0e7ff" strokeWidth="1" />
        <circle cx="395" cy="65" r="8" fill="#22c55e" opacity=".22"><animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values=".4;0;.4" dur="2s" repeatCount="indefinite" /></circle>
        <circle cx="395" cy="65" r="5" fill="#22c55e" />
        <text x="406" y="69" fontSize="11" fontWeight="700" fill="#4f46e5" fontFamily="Inter, system-ui, sans-serif">New lesson</text>
      </g>

      {/* certificate */}
      <g className="fl fl2" filter="url(#hr-soft)">
        <rect x="366" y="98" width="104" height="64" rx="10" fill="url(#hr-card)" stroke="#e0e7ff" strokeWidth="1" />
        <rect x="377" y="109" width="54" height="6" rx="3" fill="#c7d2fe" /><rect x="377" y="121" width="38" height="5" rx="2.5" fill="#e2e8f0" />
        <rect x="377" y="132" width="28" height="4" rx="2" fill="#e2e8f0" />
        <path d="M438 147l-4 13 10-5 10 5-4-13z" fill="#f59e0b" />
        <circle cx="444" cy="138" r="11" fill="url(#hr-gold)" /><circle cx="444" cy="138" r="8" fill="none" stroke="#fff" strokeWidth="1" opacity=".6" />
        <path d="M440 138l3 3 6-6" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* progress ring card */}
      <g className="fl fl3" filter="url(#hr-soft)">
        <rect x="384" y="176" width="96" height="52" rx="12" fill="url(#hr-card)" stroke="#e0e7ff" strokeWidth="1" />
        <circle cx="410" cy="202" r="14" fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle cx="410" cy="202" r="14" fill="none" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" strokeDasharray="75 88" transform="rotate(-90 410 202)">
          <animate attributeName="stroke-dasharray" values="10 88;75 88;75 88" keyTimes="0;.45;1" dur="5s" repeatCount="indefinite" />
        </circle>
        <text x="434" y="201" fontSize="15" fontWeight="800" fill="#4f46e5" fontFamily="Plus Jakarta Sans, Inter, system-ui, sans-serif">85%</text>
        <text x="434" y="215" fontSize="9" fill="#94a3b8" fontFamily="Inter, system-ui, sans-serif">complete</text>
      </g>

      {/* rating chip */}
      <g transform="translate(742 82)">
        <g className="fl fl2" filter="url(#hr-soft)">
          <rect x="0" y="0" width="52" height="24" rx="12" fill="url(#hr-card)" stroke="#e0e7ff" strokeWidth="1" />
          <path d="M14 5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="url(#hr-gold)" />
          <text x="26" y="16.5" fontSize="10.5" fontWeight="800" fill="#4f46e5" fontFamily="Inter, system-ui, sans-serif">4.9</text>
        </g>
      </g>

      {/* secure badge: translate sits on the OUTER group so the float animation can't override it */}
      <g transform="translate(716 168)">
        <g className="fl" filter="url(#hr-soft)">
          <path d="M30 3l24 9v20c0 17-11 28-24 35C17 60 6 49 6 32V12z" fill="url(#hr-sh)" />
          <path d="M30 3l24 9v20c0 17-11 28-24 35z" fill="#fff" opacity=".14" />
          <path d="M20 33l8 8 14-16" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* code chip */}
      <g transform="translate(498 8)">
        <g className="fl fl3" filter="url(#hr-soft)">
          <rect x="0" y="0" width="58" height="26" rx="13" fill="url(#hr-card)" stroke="#e0e7ff" strokeWidth="1" />
          <text x="29" y="17.5" textAnchor="middle" fontSize="12" fontWeight="800" fill="#7c3aed" fontFamily="ui-monospace, Menlo, monospace">{"</>"}</text>
        </g>
      </g>

      {/* chat bubble */}
      <g transform="translate(300 118)">
        <g className="fl" filter="url(#hr-soft)">
          <path d="M10 0h40a10 10 0 0 1 10 10v16a10 10 0 0 1-10 10H26l-10 9v-9h-6A10 10 0 0 1 0 26V10A10 10 0 0 1 10 0z" fill="url(#hr-card)" stroke="#e0e7ff" strokeWidth="1" />
          <circle cx="18" cy="18" r="3" fill="#6366f1"><animate attributeName="opacity" values=".25;1;.25" dur="1.4s" repeatCount="indefinite" /></circle>
          <circle cx="30" cy="18" r="3" fill="#8b5cf6"><animate attributeName="opacity" values=".25;1;.25" dur="1.4s" begin=".2s" repeatCount="indefinite" /></circle>
          <circle cx="42" cy="18" r="3" fill="#22d3ee"><animate attributeName="opacity" values=".25;1;.25" dur="1.4s" begin=".4s" repeatCount="indefinite" /></circle>
        </g>
      </g>

      {/* book stack */}
      <g transform="translate(318 204)">
        <g className="fl fl2" filter="url(#hr-soft)">
          <rect x="0" y="22" width="56" height="10" rx="3" fill="url(#hr-bk1)" />
          <rect x="5" y="12" width="48" height="10" rx="3" fill="url(#hr-bk2)" />
          <rect x="2" y="2" width="52" height="10" rx="3" fill="url(#hr-bk3)" />
          <rect x="8" y="5" width="18" height="2.5" rx="1.2" fill="#fff" opacity=".7" />
          <rect x="10" y="15" width="14" height="2.5" rx="1.2" fill="#fff" opacity=".6" />
          <rect x="6" y="25" width="20" height="2.5" rx="1.2" fill="#fff" opacity=".55" />
        </g>
      </g>

      {/* idea bulb */}
      <g transform="translate(318 56)">
        <g className="fl" filter="url(#hr-soft)">
          <circle cx="16" cy="16" r="22" fill="#fbbf24" opacity=".18"><animate attributeName="r" values="18;26;18" dur="2.4s" repeatCount="indefinite" /></circle>
          <path d="M16 3a12 12 0 0 0-6 22.4V30h12v-4.6A12 12 0 0 0 16 3z" fill="url(#hr-bulb)" />
          <rect x="10" y="30" width="12" height="3.5" rx="1.7" fill="#a5b4fc" />
          <rect x="12" y="34" width="8" height="3" rx="1.5" fill="#818cf8" />
          <path d="M11 14q5-6 10 0" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
        </g>
      </g>

      {/* rising particles */}
      <g>
        {[[500, 232, "#22d3ee", 0], [560, 236, "#a78bfa", 1.2], [640, 234, "#f472b6", 2.1], [700, 238, "#fbbf24", 0.6], [610, 232, "#6366f1", 3], [740, 236, "#22d3ee", 1.8]].map(([x, y, c, d], i) => (
          <circle key={i} cx={x} cy={y} r="2.6" fill={c}>
            <animate attributeName="cy" values={`${y};${y - 90}`} dur="5s" begin={`${d}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;.9;0" dur="5s" begin={`${d}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
    </svg>
  );
}

/* ---------- media helpers ---------- */
function CoverPhoto({ src }) {
  const [bad, setBad] = useState(false);
  if (!src || bad) return null;               // falls back to the gradient art underneath
  return <img className="cover-photo" src={src} alt="" loading="lazy" onError={() => setBad(true)} />;
}

function CountUp({ to }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf, t0;
    const step = (t) => {
      if (t0 === undefined) t0 = t;
      const p = Math.min((t - t0) / 700, 1);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{n}</>;
}

function VideoModal({ src, poster, title, onClose }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-box" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close video">×</button>
        <video src={src} poster={poster} controls autoPlay playsInline />
        <p>{title}</p>
      </div>
    </div>
  );
}

function SlideMedia({ s }) {
  const [bad, setBad] = useState(false);
  if (s.type === "video")
    return <div className="media"><video controls playsInline preload="metadata" poster={s.poster} src={s.video} /></div>;
  if (s.scene || bad) {
    const k = s.scene || "shield";
    return <div className={`media sb-${k}`}><Scene kind={k} fit="meet" /></div>;
  }
  return <div className="media"><img src={s.img} alt="" onError={() => setBad(true)} /></div>;
}

/* one slide, shared by the player and the editor */
function SlideFrame({ course, s, editor }) {
  const [pick, setPick] = useState(null);
  const withMedia = s.img || s.scene || s.type === "video";
  const cls = `slide slide-${s.type}${withMedia && s.type !== "video" ? " has-media" : ""}${s.flip ? " flip" : ""}${editor ? " e-slide" : ""}`;
  return (
    <div className={cls}>
      {s.type === "thanks" && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 28 }, (_, k) => <i key={k} style={{ "--x": `${(k * 37) % 100}%`, "--d": `${(k % 7) * 0.15}s`, "--h": (k * 47) % 360 }} />)}
        </div>
      )}
      <div className="slide-head"><span className="lb"><span className="logo sm">L</span> LERNEVO SOLUTIONS</span><small>{course.title}</small></div>
      <div className="slide-main">
        <div className="slide-text">
          <h2>{s.title}</h2>
          {s.body && <p>{s.body}</p>}
          {s.list && <ul className="checks">{s.list.map((x, k) => <li key={x}><span className={k === 1 ? "alt" : ""}><Icon d={I.check} size={11} /></span>{x}</li>)}</ul>}
          {s.points && (
            <div className="points">
              {s.points.map(([b, t]) => (
                <div className="point" key={b}><span><Icon d={I.check} size={15} /></span><div><b>{b}</b><small>{t}</small></div></div>
              ))}
            </div>
          )}
          {s.type === "quiz" && (
            <div className="quiz">
              <p className="q-text">{s.q}</p>
              {s.options.map((o, k) => (
                <button key={o} disabled={pick !== null} onClick={() => setPick(k)}
                  className={`opt ${pick === null ? "" : k === s.answer ? "right" : pick === k ? "wrong" : ""}`}>{o}</button>
              ))}
              {pick !== null && <p className={`q-fb ${pick === s.answer ? "ok" : "no"}`}>{pick === s.answer ? "Correct. " : "Not quite. "}{s.explain}</p>}
            </div>
          )}
          {s.type === "thanks" && <button className="btn btn-primary"><Icon d={I.dl} size={14} /> Download certificate</button>}
        </div>
        {withMedia && <SlideMedia s={s} />}
      </div>
      <div className="slide-foot"><small>Lernevo Academy · Internal training</small><i /></div>
    </div>
  );
}

/* ---------- illustrated scenes (no internet needed) ---------- */
function Scene({ kind, fit = "slice" }) {
  const p = { className: "scene", viewBox: "0 0 400 200", preserveAspectRatio: `xMidYMid ${fit}`, "aria-hidden": true };
  if (kind === "shield") return (
    <svg {...p}>
      <defs><linearGradient id="sc-sh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8be9ff" /><stop offset="1" stopColor="#6a4cff" /></linearGradient></defs>
      <g fill="#fff" opacity=".13"><rect x="52" y="52" width="58" height="74" rx="8" transform="rotate(-12 81 89)" /><rect x="290" y="62" width="58" height="74" rx="8" transform="rotate(10 319 99)" /></g>
      <g stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".28"><path d="M66 74h28M66 88h22M66 102h26" transform="rotate(-12 81 89)" /><path d="M304 84h28M304 98h22M304 112h26" transform="rotate(10 319 99)" /></g>
      <g fill="#8be9ff"><circle cx="110" cy="40" r="3" /><circle cx="300" cy="34" r="4" opacity=".7" /><circle cx="330" cy="160" r="3" /><circle cx="76" cy="160" r="4" opacity=".6" /></g>
      <g transform="translate(140 30)">
        <path d="M60 6l48 18v40c0 34-22 56-48 70C34 120 12 98 12 64V24z" fill="url(#sc-sh)" />
        <path d="M60 6v128c26-14 48-36 48-70V24z" fill="#fff" opacity=".18" />
        <rect x="46" y="62" width="28" height="24" rx="5" fill="#fff" />
        <path d="M52 62v-6a8 8 0 0116 0v6" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <circle cx="60" cy="74" r="3.5" fill="#6a4cff" />
      </g>
    </svg>
  );
  if (kind === "PK") return (
    <svg {...p}>
      <defs><linearGradient id="sc-pk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#22d3ee" /><stop offset="1" stopColor="#2563eb" /></linearGradient></defs>
      <rect x="95" y="28" width="210" height="146" rx="14" fill="#fff" opacity=".96" />
      <path d="M95 42a14 14 0 0114-14h182a14 14 0 0114 14v10H95z" fill="#e0ecff" />
      <circle cx="111" cy="40" r="4" fill="#fb7185" /><circle cx="123" cy="40" r="4" fill="#fbbf24" /><circle cx="135" cy="40" r="4" fill="#34d399" />
      <g fill="url(#sc-pk)"><rect x="116" y="110" width="18" height="40" rx="4" /><rect x="142" y="88" width="18" height="62" rx="4" /><rect x="168" y="102" width="18" height="48" rx="4" /><rect x="194" y="70" width="18" height="80" rx="4" /><rect x="220" y="84" width="18" height="66" rx="4" /></g>
      <polyline points="125,98 151,78 177,90 203,58 229,72" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="270" cy="108" r="22" fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle cx="270" cy="108" r="22" fill="none" stroke="#06b6d4" strokeWidth="10" strokeDasharray="86 138" strokeLinecap="round" transform="rotate(-90 270 108)" />
      <g className="fl"><rect x="40" y="118" width="92" height="36" rx="18" fill="#fff" /><circle cx="58" cy="136" r="9" fill="#22c55e" /><path d="M54 136l3 3 6-6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M74 131h44M74 141h30" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" /></g>
    </svg>
  );
  if (kind === "NJ") return (
    <svg {...p}>
      <g fill="#fff" opacity=".22"><circle cx="70" cy="50" r="5" /><circle cx="340" cy="44" r="4" /><circle cx="355" cy="130" r="6" /><circle cx="46" cy="140" r="4" /></g>
      <g className="fl"><rect x="140" y="20" width="120" height="38" rx="19" fill="#fff" /><path d="M190 58l10 12 10-12z" fill="#fff" /><text x="200" y="45" textAnchor="middle" fontSize="16" fontWeight="700" fill="#6d3df5" fontFamily="Inter, system-ui, sans-serif">Welcome!</text></g>
      {[[120, "#fde68a", "#f6c9a0"], [200, "#ffffff", "#c68642"], [280, "#fbcfe8", "#8d5524"]].map(([x, shirt, skin]) => (
        <g key={x}>
          <path d={`M${x - 34} 176v-12a34 32 0 0168 0v12z`} fill={shirt} />
          <circle cx={x} cy="116" r="20" fill={skin} />
          <path d={`M${x - 20} 112a20 20 0 0140 0z`} fill="#2a1d6e" opacity=".85" />
        </g>
      ))}
    </svg>
  );
  if (kind === "mail") return (
    <svg {...p}>
      <g fill="#fff" opacity=".12"><circle cx="70" cy="60" r="26" /><circle cx="340" cy="150" r="34" /></g>
      <rect x="120" y="76" width="150" height="96" rx="12" fill="#4b3fb5" stroke="#b9a6ff" strokeWidth="3" />
      <path d="M124 82l71 50 71-50" fill="none" stroke="#b9a6ff" strokeWidth="3" strokeLinejoin="round" />
      <path d="M300 14v82a14 14 0 01-28 0v-6" fill="none" stroke="#ffd36a" strokeWidth="5" strokeLinecap="round" />
      <g className="fl"><path d="M150 40l30 52h-60z" fill="#ffd36a" stroke="#ffd36a" strokeWidth="6" strokeLinejoin="round" /><rect x="148" y="58" width="4" height="18" rx="2" fill="#2a1d6e" /><circle cx="150" cy="83" r="2.6" fill="#2a1d6e" /></g>
    </svg>
  );
  return null;
}

function CoverArt({ course }) {
  const k = course.art;
  const known = ["shield", "mail", "PK", "NJ"].includes(k);
  const cls = { shield: "shield", mail: "mail", PK: "pk", NJ: "nj" }[k] || ["rose", "mint", "pk", "nj"][course.id % 4];
  return (
    <div className={`cover cover-${cls}`}>
      {known ? <Scene kind={k} /> : <div className="cover-initials"><strong>{k}</strong><span>{course.sub}</span></div>}
    </div>
  );
}

/* ---------- top bar (sidebar comes from your Sidebar.js) ---------- */
function Topbar({ onCreate }) {
  return (
    <header className="topbar">
      <label className="search"><Icon d={I.search} /><input placeholder="Search courses…" /></label>
      <div className="top-actions">
        <button className="btn btn-primary btn-sm" onClick={onCreate}><Icon d={I.plus} size={13} /> Create course</button>
        <span className="avatar">AM</span>
      </div>
    </header>
  );
}

/* ---------- 1. My courses ---------- */
function MyCourses({ courses, onCreate, onPreview, onEdit }) {
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [tour, setTour] = useState(false);
  const count = (st) => courses.filter((c) => c.status === st).length;
  const shown = courses.filter(
    (c) => (filter === "All" || c.status === filter || (filter === "In review" && c.status === "In Review")) &&
      (c.title + c.tag).toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-bg"><HeroArt /></div>
        <div className="hero-text">
          <span className="hero-chip"><Icon d={I.wand} size={12} /> Lernevo Academy</span>
          <h1>My <span>courses</span></h1>
          <p>{courses.length} courses in this demo workspace · everything saves in your browser.</p>
          <div className="hero-chips">
            <span><i className="dot-green" /> {count("Published")} live</span>
            <span><i className="dot-amber" /> {count("In Review")} in review</span>
            <span><i className="dot-violet" /> {count("Draft")} drafts</span>
          </div>
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={onCreate}><Icon d={I.plus} size={16} /> Create course</button>
          <button className="btn btn-outline btn-lg" onClick={() => setTour(true)}><Icon d={I.play} size={13} /> Watch quick tour</button>
        </div>
      </section>
      {tour && <VideoModal src={SAMPLE_VIDEO} poster={SAMPLE_POSTER} title="Quick tour: build a course in minutes" onClose={() => setTour(false)} />}

      <div className="stats">
        {[
          ["Total courses", courses.length, I.book, "t-blue"],
          ["Published", count("Published"), I.check, "t-green"],
          ["In review", count("In Review"), I.eye, "t-amber"],
          ["Drafts", count("Draft"), I.edit, "t-violet"],
        ].map(([label, n, icon, tone]) => (
          <div className={`stat ${tone}`} key={label}>
            <span className="stat-icon"><Icon d={icon} size={16} /></span>
            <div><strong><CountUp to={n} /></strong><small>{label}</small></div>
          </div>
        ))}
      </div>

      <div className="filters">
        <label className="search wide"><Icon d={I.search} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, owner or category…" /></label>
        <div className="tabs">
          {["All", "Draft", "In review", "Approved", "Published"].map((t) => (
            <button key={t} className={filter === t ? "on" : ""} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
        <select className="sort"><option>Recently edited</option><option>Title</option></select>
      </div>
      <div className="section-heading">
        <h2>All courses</h2>
        <span className="section-note">{shown.length} shown</span>
      </div>
      <div className="grid">
        {shown.map((c) => (
          <article className="card" key={c.id}>
            <div className="card-media">
              <CoverArt course={c} />
              <CoverPhoto src={c.img} />
              <span className="card-shade" />
              <span className={`badge badge-${c.status.replace(" ", "").toLowerCase()}`}><i /> {c.status}</span>
              <button className="dots" aria-label="More options"><Icon d={I.more} /></button>
              <button className="play-fab" aria-label={`Preview ${c.title}`} onClick={() => onPreview(c)}><Icon d={I.play} size={16} /></button>
            </div>
            <div className="card-body">
              <p className="eyebrow">{c.tag}</p>
              <h3>{c.title}</h3>
              <p className="desc">{c.desc}</p>
              {c.done !== undefined && (
                <div className="build">
                  <div className="build-top"><span>{c.status === "Published" ? "Live for learners" : "Course build"}</span><b>{c.done}%</b></div>
                  <div className="bar"><i style={{ width: `${c.done}%` }} /></div>
                  <small>Edited {c.edited}</small>
                </div>
              )}
              <div className="meta">
                <span>{c.slides} slides</span><span><Icon d={I.clock} size={11} /> {c.min} min</span><span>{c.q} questions</span>
              </div>
              {c.learners && (
                <div className="social">
                  <span className="avatars"><i /><i /><i /></span>{c.learners} learners
                  <span className="rate">★ {c.rating}</span>
                </div>
              )}
              <div className="card-actions">
                <button className="btn btn-primary btn-sm" onClick={() => onEdit(c)}><Icon d={I.edit} size={12} /> Edit</button>
                <button className="btn btn-ghost btn-sm" onClick={() => onPreview(c)}><Icon d={I.eye} size={12} /> Preview</button>
                <button className="icon-btn"><Icon d={I.copy} /></button>
              </div>
            </div>
          </article>
        ))}
        {!shown.length && <p className="muted">No courses match. Try a different search or filter.</p>}
      </div>
    </div>
  );
}

/* ---------- 2. Create course wizard ---------- */
function WizArt() {
  return (
    <svg viewBox="0 0 240 130" aria-hidden="true">
      <defs>
        <linearGradient id="wz-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#22d3ee" /><stop offset=".55" stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" /></linearGradient>
        <linearGradient id="wz-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#eef2ff" /></linearGradient>
        <linearGradient id="wz-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#f59e0b" /></linearGradient>
        <filter id="wz-s" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#3b4bdc" floodOpacity=".22" /></filter>
      </defs>
      <circle cx="130" cy="64" r="58" fill="#c7d2fe" opacity=".35" />
      <circle cx="130" cy="64" r="46" fill="none" stroke="#a5b4fc" strokeWidth="1.4" strokeDasharray="3 7" opacity=".9">
        <animateTransform attributeName="transform" type="rotate" from="0 130 64" to="360 130 64" dur="30s" repeatCount="indefinite" />
      </circle>
      <g className="fl" filter="url(#wz-s)">
        <rect x="64" y="30" width="112" height="72" rx="12" fill="url(#wz-b)" />
        <rect x="64" y="30" width="112" height="34" rx="12" fill="url(#wz-a)" />
        <rect x="64" y="52" width="112" height="12" fill="url(#wz-a)" />
        <path d="M112 38l16 9-16 9z" fill="#fff" />
        <rect x="74" y="74" width="62" height="6" rx="3" fill="#c7d2fe" />
        <rect x="74" y="86" width="40" height="5" rx="2.5" fill="#e2e8f0" />
        <circle cx="156" cy="84" r="9" fill="url(#wz-g)" /><path d="M152 84l3 3 5-6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="fl fl2" filter="url(#wz-s)">
        <circle cx="42" cy="40" r="15" fill="url(#wz-b)" />
        <path d="M42 31v18M33 40h18" stroke="#4f46e5" strokeWidth="3.4" strokeLinecap="round" />
      </g>
      <g fill="#f5b301"><path className="twk" d="M200 22l2.6 7 7 2.6-7 2.6-2.6 7-2.6-7-7-2.6 7-2.6z" /><path className="twk tw2" d="M24 92l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" /></g>
      <circle cx="206" cy="96" r="4" fill="#a78bfa" opacity=".8"><animate attributeName="cy" values="100;84;100" dur="4s" repeatCount="indefinite" /></circle>
    </svg>
  );
}

function CreateCourse({ onCancel, onSave }) {
  const [step, setStep] = useState(1);
  const [over, setOver] = useState(false);
  const DEFAULT_CATS = ["Product knowledge", "Compliance", "Onboarding", "Security awareness"];
  const [cats, setCats] = useState(() => {
    try { const v = JSON.parse(localStorage.getItem("lernevo.categories")); if (Array.isArray(v)) return v; } catch (e) { /* ignore */ }
    return DEFAULT_CATS;
  });
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState("");
  useEffect(() => { try { localStorage.setItem("lernevo.categories", JSON.stringify(cats)); } catch (e) { /* ignore */ } }, [cats]);
  const [f, setF] = useState({ img: "", title: "", desc: "", category: cats[0] || "", lang: "English", owner: "Priya Nair", dept: "Human Resources", audience: "All employees" });
  const [cfg, setCfg] = useState({ dur: 20, pass: 70, attempts: "Unlimited", cert: "Issue on pass" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const addCat = () => {
    const v = newCat.trim().replace(/\s+/g, " ");
    if (v) {
      const ex = cats.find((c) => c.toLowerCase() === v.toLowerCase());
      const name = ex || v;
      if (!ex) setCats([...cats, name]);
      setF((p) => ({ ...p, category: name }));
    }
    setNewCat(""); setAdding(false);
  };
  const removeCat = (c) => {
    const rest = cats.filter((x) => x !== c);
    setCats(rest);
    if (f.category === c) setF((p) => ({ ...p, category: rest[0] || "" }));
  };
  const setC = (k) => (e) => setCfg({ ...cfg, [k]: e.target.value });
  const steps = ["Basic information", "Learning configuration", "Branding & review"];
  const heads = [
    { icon: I.book, t: "Tell us about your course", s: "A clear title and short description help employees decide to start." },
    { icon: I.gear, t: "Set up the learning experience", s: "Duration, pass mark and certificate. You can fine-tune these in the editor." },
    { icon: I.check, t: "Review and create", s: "Everything looks good? Create the course and jump straight into the editor." },
  ];
  const cat = f.category || "General";
  const initials = f.title.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "NC";
  const pickFile = (file) => { if (file && file.type.startsWith("image/")) setF((p) => ({ ...p, img: URL.createObjectURL(file) })); };
  const finish = (status) => onSave({
    id: Date.now(), status, art: initials, sub: cat, tag: `${cat} · ${f.dept}`,
    title: f.title || "Untitled course", desc: f.desc || "No description yet.", slides: 0, min: Number(cfg.dur) || 10, q: 0, img: f.img, done: 5, edited: "just now",
  });
  const ready = [
    { ok: !!f.title.trim(), label: "Course title added" },
    { ok: !!f.desc.trim(), label: "Description added" },
    { ok: !!f.img, label: "Cover uploaded", optional: true },
  ];
  const head = heads[step - 1];
  return (
    <div className="wizard">
      <div className="wz-hero">
        <div className="wz-hero-text">
          <button className="link-back" onClick={onCancel}><Icon d={I.back} size={13} /> Back</button>
          <span className="wz-chip"><Icon d={I.wand} size={12} /> New course</span>
          <h1>Create a new <span>course</span></h1>
          <p>Three quick steps, then you are in the editor. Nothing here is permanent — you can change it later.</p>
        </div>
        <div className="wz-hero-art"><WizArt /></div>
      </div>

      <ol className="wz-steps">
        {steps.map((s, i) => (
          <li key={s} className={step === i + 1 ? "on" : step > i + 1 ? "done" : ""}>
            <span className="wz-dot">{step > i + 1 ? <Icon d={I.check} size={13} /> : i + 1}</span>
            <span className="wz-lbl"><em>Step {i + 1}</em>{s}</span>
          </li>
        ))}
      </ol>

      <div className="wz-grid">
        <div className="wz-main">
          <section className="panel wz-panel">
            <div className="wz-topbar"><i style={{ width: `${step * 33.4}%` }} /></div>
            <div className="wz-ph">
              <span className="wz-ph-ico"><Icon d={head.icon} size={20} /></span>
              <div><h2>{head.t}</h2><p>{head.s}</p></div>
            </div>
            <div className="wz-body" key={step}>
              {step === 1 && (<>
                <div className="wz-sec"><span>01</span> Basics</div>
                <label className="field"><span>Course title</span>
                  <div className="wz-input"><Icon d={I.edit} size={16} /><input maxLength={70} value={f.title} onChange={set("title")} placeholder="e.g. Product Portfolio Essentials" /></div>
                  <small className="wz-count">{f.title.length}/70</small>
                  {!f.title && (
                    <div className="wz-ideas"><small>Quick ideas:</small>
                      {["Product Portfolio Essentials", "Data Security Basics", "Welcome to Lernevo"].map((t) => <button type="button" key={t} onClick={() => setF({ ...f, title: t })}>{t}</button>)}
                    </div>
                  )}</label>
                <label className="field"><span>Course description</span>
                  <textarea rows="3" maxLength={220} value={f.desc} onChange={set("desc")} placeholder="A friendly, practical introduction to…" />
                  <small className="wz-hint"><span>One or two sentences — what will employees be able to do?</span><span>{f.desc.length}/220</span></small></label>
                <div className="wz-sec"><span>02</span> Look and feel</div>
                <div className="field"><span>Course thumbnail</span>
                  <label className={`wz-drop${over ? " over" : ""}${f.img ? " has" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
                    onDrop={(e) => { e.preventDefault(); setOver(false); pickFile(e.dataTransfer.files?.[0]); }}>
                    <div className="wz-drop-prev">{f.img ? <img src={f.img} alt="Cover preview" /> : <Icon d={I.image} size={26} />}</div>
                    <div className="wz-drop-txt">
                      <b>{f.img ? "Looking good! Click to change" : "Drag & drop your cover here"}</b>
                      <small>or <u>browse files</u> · PNG or JPG, under 2.5 MB</small>
                      <span className="btn btn-ghost btn-sm"><Icon d={I.upload} size={13} /> {f.img ? "Change cover" : "Upload cover"}</span>
                    </div>
                    <input type="file" accept="image/*" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
                  </label>
                </div>
                <div className="wz-sec"><span>03</span> Details</div>
                  <div className="two">
                  <div className="field span2"><span>Category <small className="wz-sub">Pick one, or add your own</small></span>
                    <div className="wz-chips">
                      {cats.map((c) => (
                        <span key={c} className={`wz-cw${f.category === c ? " on" : ""}`}>
                          <button type="button" className="wz-chip-opt" onClick={() => setF({ ...f, category: c })}>
                            <Icon d={{ "Product knowledge": I.book, Compliance: I.check, Onboarding: I.users, "Security awareness": I.shield }[c] || I.tag} size={15} /> {c}
                          </button>
                          <button type="button" className="wz-x" aria-label={`Remove ${c}`} title="Remove category" onClick={() => removeCat(c)}>×</button>
                        </span>
                      ))}
                      {adding ? (
                        <span className="wz-add-box">
                          <Icon d={I.tag} size={15} />
                          <input autoFocus maxLength={30} value={newCat} placeholder="New category name" onChange={(e) => setNewCat(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCat(); } if (e.key === "Escape") { setAdding(false); setNewCat(""); } }} />
                          <button type="button" className="wz-add-ok" onClick={addCat}><Icon d={I.check} size={14} /> Add</button>
                          <button type="button" className="wz-add-cancel" onClick={() => { setAdding(false); setNewCat(""); }}>Cancel</button>
                        </span>
                      ) : (
                        <button type="button" className="wz-chip-add" onClick={() => setAdding(true)}><Icon d={I.plus} size={15} /> Add category</button>
                      )}
                    </div>
                    {cats.length === 0 && !adding && <small>No categories yet. Add your first one.</small>}
                  </div>
                  <div className="field span2"><span>Course language</span>
                    <div className="wz-seg">
                      {["English", "Tamil", "Hindi"].map((l) => <button type="button" key={l} className={f.lang === l ? "on" : ""} onClick={() => setF({ ...f, lang: l })}><Icon d={I.globe} size={13} /> {l}</button>)}
                    </div></div>
                  <label className="field"><span>Content owner</span><div className="wz-input"><Icon d={I.user} size={16} /><input value={f.owner} onChange={set("owner")} /></div></label>
                  <label className="field"><span>Department</span><div className="wz-input"><Icon d={I.grid} size={16} /><input value={f.dept} onChange={set("dept")} /></div></label>
                  <label className="field"><span>Target audience</span><div className="wz-input"><Icon d={I.users} size={16} /><input value={f.audience} onChange={set("audience")} /></div><small>Who is this course for?</small></label>
                </div>
              </>)}
              {step === 2 && (
                <div className="wz-cfg">
                  <div className="field"><span>Estimated duration</span>
                    <div className="wz-pills">
                      {[10, 20, 30, 45, 60].map((m) => <button type="button" key={m} className={`wz-pill${Number(cfg.dur) === m ? " on" : ""}`} onClick={() => setCfg({ ...cfg, dur: m })}>{m} min</button>)}
                    </div></div>
                  <div className="field"><span>Pass mark <b className="wz-bubble">{cfg.pass}%</b></span>
                    <input type="range" className="wz-range" min="40" max="100" step="5" value={cfg.pass} onChange={setC("pass")} style={{ "--p": `${((cfg.pass - 40) / 60) * 100}%` }} />
                    <small>Learners need at least {cfg.pass}% on the quiz to pass.</small></div>
                  <div className="field"><span>Quiz attempts allowed</span>
                    <div className="wz-seg">
                      {["Unlimited", "3", "1"].map((a) => <button type="button" key={a} className={cfg.attempts === a ? "on" : ""} onClick={() => setCfg({ ...cfg, attempts: a })}>{a === "Unlimited" ? "Unlimited" : `${a} ${a === "1" ? "attempt" : "attempts"}`}</button>)}
                    </div></div>
                  <div className="field"><span>Certificate</span>
                    <div className="wz-opts">
                      {[["Issue on pass", "Learners receive a certificate when they pass", I.award], ["None", "No certificate for this course", I.exit]].map(([k, d, ic]) => (
                        <button type="button" key={k} className={`wz-opt${cfg.cert === k ? " on" : ""}`} onClick={() => setCfg({ ...cfg, cert: k })}>
                          <span className="wz-opt-ico"><Icon d={ic} size={18} /></span><b>{k}</b><small>{d}</small>
                        </button>
                      ))}
                    </div></div>
                </div>
              )}
              {step === 3 && (
                <div className="wz-review">
                  <div className="wz-done">
                    <div className="wz-confetti" aria-hidden="true">{Array.from({ length: 18 }).map((_, i) => <span key={i} style={{ left: `${(i * 5.6 + 2) % 100}%`, animationDelay: `${(i % 6) * 0.12}s`, background: ["#22d3ee", "#a78bfa", "#f472b6", "#fbbf24", "#34d399"][i % 5] }} />)}</div>
                    <span className="wz-done-ico"><Icon d={I.check} size={22} /></span>
                    <div><b>{f.title || "Untitled course"}</b><small>is ready to be created. You can edit everything later.</small></div>
                  </div>
                  <div className="wz-facts">
                    {[["Category", cat], ["Language", f.lang], ["Owner", f.owner], ["Department", f.dept], ["Audience", f.audience], ["Duration", `${cfg.dur} min`], ["Pass mark", `${cfg.pass}%`], ["Attempts", cfg.attempts], ["Certificate", cfg.cert]].map(([k, v]) => (
                      <div key={k}><small>{k}</small><b>{v || "—"}</b></div>
                    ))}
                  </div>
                  <ul className="wz-ready">
                    {ready.map((r) => (
                      <li key={r.label} className={r.ok ? "ok" : r.optional ? "opt" : "no"}>
                        <span>{r.ok ? <Icon d={I.check} size={12} /> : r.optional ? "–" : "!"}</span>{r.label}{!r.ok && r.optional ? " (optional)" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          <div className="wizard-foot wz-foot">
            <button className="btn btn-ghost" onClick={step === 1 ? onCancel : () => setStep(step - 1)}><Icon d={I.back} size={13} /> {step === 1 ? "Cancel" : "Previous"}</button>
            <div>
              <button className="btn btn-ghost" onClick={() => finish("Draft")}>Save as draft</button>
              {step < 3
                ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue <Icon d={I.next} size={13} /></button>
                : <button className="btn btn-primary" onClick={() => finish("Draft")}>Create course <Icon d={I.check} size={13} /></button>}
            </div>
          </div>
        </div>

        <aside className="wz-aside">
          <div className="wz-aside-top"><span className="wz-live"><i /> Live preview</span><small>Updates as you type</small></div>
          <div className="wz-prev">
            <div className="wz-prev-cover">
              {f.img ? <img src={f.img} alt="" /> : <div className="wz-prev-ph"><strong>{initials}</strong><span>{cat}</span></div>}
              <em>Draft</em>
            </div>
            <div className="wz-prev-body">
              <small className="wz-prev-tag">{cat} · {f.dept}</small>
              <h3>{f.title || "Your course title"}</h3>
              <p>{f.desc || "Your short description will appear here so employees know what to expect."}</p>
              <div className="wz-prev-meta"><span><Icon d={I.clock} size={12} /> {cfg.dur} min</span><span><Icon d={I.users} size={12} /> {f.audience || "Everyone"}</span><span>{f.lang}</span></div>
              <div className="wz-prev-bar"><i style={{ width: `${step * 33.4}%` }} /></div>
              <small>{Math.round(step * 33.4)}% set up</small>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------- 3. Preview landing (dark) ---------- */
function PreviewLanding({ course, onStart, onExit }) {
  const [name, setName] = useState("");
  const [trailer, setTrailer] = useState(false);
  return (
    <div className="landing">
      <div className="landing-bg" />
      <div className="landing-photo" style={course.img ? { backgroundImage: `url(${course.img})` } : undefined} />
      <div className="landing-card">
        <div className="lbrand"><span className="logo sm">L</span> LERNEVO SOLUTIONS</div>
        <p className="l-cat">{course.tag.split(" · ")[0].toUpperCase()}</p>
        <h1>{course.title}</h1>
        <p className="l-desc">{course.desc}</p>
        <div className="chips">
          <span><Icon d={I.clock} size={11} /> {course.min} minutes</span>
          <span>{course.q} questions</span>
          <span><Icon d={I.users} size={11} /> All employees</span>
          <span>70% to pass</span>
        </div>
        <button className="l-trailer" onClick={() => setTrailer(true)}><Icon d={I.play} size={11} /> Watch the 90-second intro</button>
        <label className="l-label">YOUR NAME (FOR THE CERTIFICATE)</label>
        <input className="l-input" placeholder="e.g. Aarav Sharma" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="l-actions">
          <button className="btn btn-blue" onClick={() => onStart(name)}><Icon d="M6 4l14 8-14 8z" size={12} /> Start course</button>
          <button className="l-exit" onClick={onExit}>Exit preview</button>
        </div>
      </div>
      {trailer && <VideoModal src={SAMPLE_VIDEO} poster={SAMPLE_POSTER} title={course.title} onClose={() => setTrailer(false)} />}
      <p className="l-foot">Participant preview · answers and results are stored in this browser only</p>
    </div>
  );
}

/* ---------- 4. Course player ---------- */
function Player({ course, onExit }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowRight") setI((n) => Math.min(n + 1, PLAYER_SLIDES.length - 1));
      if (e.key === "ArrowLeft") setI((n) => Math.max(n - 1, 0));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  const s = PLAYER_SLIDES[i];
  const pct = ((i + 1) / PLAYER_SLIDES.length) * 100;
  return (
    <div className="player">
      <div className="p-progress"><i style={{ width: pct + "%" }} /></div>
      <header className="p-top">
        <div className="p-title"><span className="logo sm">L</span>
          <div><strong>{course.title}</strong><small>Slide {i + 1} of {PLAYER_SLIDES.length}</small></div></div>
        <div className="p-tools">
          <button className="icon-btn" title="Fullscreen" onClick={() => document.documentElement.requestFullscreen?.()}><Icon d="M4 9V4h5|M20 9V4h-5|M4 15v5h5|M20 15v5h-5" size={13} /></button>
          <button className="exit-btn" onClick={onExit}><Icon d={I.exit} size={13} /> Exit</button>
        </div>
      </header>
      <section className="slide-wrap"><SlideFrame key={i} course={course} s={s} /></section>
      <footer className="p-bottom">
        <button className="btn btn-ghost btn-sm" disabled={i === 0} onClick={() => setI(i - 1)}><Icon d={I.back} size={12} /> Back</button>
        <div className="p-count"><small>{i + 1} / {PLAYER_SLIDES.length}</small><div><i style={{ width: pct + "%" }} /></div></div>
        <button className="btn btn-primary btn-sm" disabled={i === PLAYER_SLIDES.length - 1} onClick={() => setI(i + 1)}>Next <Icon d={I.next} size={12} /></button>
      </footer>
    </div>
  );
}

/* ---------- 5. Editor ---------- */
function Editor({ course, onBack, onPreview }) {
  const [sel, setSel] = useState("Welcome");
  const [tab, setTab] = useState("Design");
  const timeline = STRUCTURE.flatMap((s) => s.items);
  return (
    <div className="editor">
      <header className="e-top">
        <div className="e-left">
          <button className="icon-btn" onClick={onBack}><Icon d={I.back} /></button>
          <div><strong>{course.title}</strong>
            <div><span className="pill-ok">● {course.status}</span><small className="muted"> ✓ All changes saved</small></div></div>
        </div>
        <div className="e-right">
          <button className="btn btn-ghost btn-sm" onClick={onPreview}><Icon d={I.eye} size={13} /> Preview</button>
          <button className="btn btn-ghost btn-sm"><Icon d={I.dl} size={13} /> Export</button>
          <button className="btn btn-primary btn-sm"><Icon d={I.send} size={13} /> Publish</button>
        </div>
      </header>
      <div className="e-body">
        <aside className="e-structure">
          <p className="nav-group">COURSE STRUCTURE</p><small className="muted pad">16 items</small>
          {STRUCTURE.map((g) => (
            <div key={g.section}>
              <div className="sec"><span>⌄ {g.section} <em>{g.count}</em></span><Icon d={I.plus} size={12} /></div>
              {g.items.map(([name, type]) => (
                <button key={name} className={`s-item ${sel === name ? "on" : ""}`} onClick={() => setSel(name)}>
                  <b>{name}</b><small>{type}</small>
                </button>
              ))}
            </div>
          ))}
        </aside>
        <section className="e-canvas">
          <div className="crumb"><span>WELCOME</span> {sel}</div>
          <SlideFrame editor course={course} s={{ ...PLAYER_SLIDES[0], title: sel === "Welcome" ? course.title : sel }} />
          <div className="tags"><span>Mandatory slide</span><span>Duration none</span><span>3 bullets</span></div>
        </section>
        <aside className="e-props">
          <p className="nav-group">PROPERTIES</p><small className="muted pad">{sel}</small>
          <div className="seg">{["Design", "Content", "Settings"].map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
          <label className="field"><span>Background</span>
            <div className="swatches">{["#fff", "#f4f7fb", "#e8f0ff", "#eaf2ff", "#e6f8f1", "#0f172a", "#1c1b4b"].map((c) => <i key={c} style={{ background: c }} />)}</div></label>
          <label className="field"><span>Text colour</span><div className="color-row"><i /><input defaultValue="#0f172a" /></div></label>
          <label className="field"><span>Font size · 19px</span><input type="range" min="12" max="32" defaultValue="19" /></label>
          <label className="field"><span>Font family</span><select><option>Inter</option><option>Poppins</option></select></label>
          <div className="field"><span>Alignment</span><div className="seg"><button className="on">Left</button><button>Center</button><button>Right</button></div></div>
          <label className="field"><span>Layout</span><select><option>Centered content</option><option>Split</option></select></label>
          <label className="field"><span>Image position</span><select><option>Media on the right</option><option>Media on the left</option></select></label>
        </aside>
      </div>
      <footer className="e-timeline">
        <div className="tl-head"><b>SLIDE TIMELINE</b><small>11 slides · 5 questions</small></div>
        <div className="tl-row">
          {timeline.slice(0, 11).map(([n, t]) => (
            <button key={n} className={`tl-card ${sel === n ? "on" : ""}`} onClick={() => setSel(n)}><i /><b>{n}</b><small>{t}</small></button>
          ))}
        </div>
      </footer>
    </div>
  );
}

/* ---------- root: courses area (opens when My Courses is clicked) ---------- */
export default function Course() {
  const [view, setView] = useState("courses");   // courses | create | landing | player | editor
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [current, setCurrent] = useState(INITIAL_COURSES[0]);

  if (view === "courses")
    return (
      <div className="course-area">
        <Topbar onCreate={() => setView("create")} />
        <main className="content">
          <MyCourses
            courses={courses}
            onCreate={() => setView("create")}
            onPreview={(c) => { setCurrent(c); setView("landing"); }}
            onEdit={(c) => { setCurrent(c); setView("editor"); }}
          />
        </main>
      </div>
    );

  // create screen stays inside the content area, so your sidebar stays visible
  if (view === "create")
    return (
      <div className="course-area">
        <main className="content">
          <CreateCourse
            onCancel={() => setView("courses")}
            onSave={(c) => { setCourses([c, ...courses]); setView("courses"); }}
          />
        </main>
      </div>
    );

  // preview / player / editor still open full-screen on top of the sidebar
  return (
    <div className="overlay">
      {view === "create" && (
        <CreateCourse
          onCancel={() => setView("courses")}
          onSave={(c) => { setCourses([c, ...courses]); setView("courses"); }}
        />
      )}
      {/* landing + player now live inside Preview.js */}
      {(view === "landing" || view === "player") && (
        <Preview course={current} onExit={() => setView("courses")} onClose={() => setView("editor")} />
      )}
      {view === "editor" && (
        <Edit course={current} onBack={() => setView("courses")} onPreview={() => setView("landing")} />
      )}
    </div>
  );
}