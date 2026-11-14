import { useState, useEffect } from "react";
import "./course.css";

/* ---------- media (swap these URLs for your own images / videos) ---------- */
const PHOTO = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=70`;
const HERO_IMG = PHOTO("photo-1522202176988-66273c2fd55f");
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
};

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
        <img className="avatar" alt="" src="https://i.pravatar.cc/60?img=12" />
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
        <div className="hero-bg" style={{ backgroundImage: `linear-gradient(90deg, rgba(22,30,120,.82) 0%, rgba(40,50,185,.42) 34%, rgba(0,0,0,0) 62%), linear-gradient(0deg, rgba(10,10,50,.28), rgba(0,0,0,0) 45%), url(${HERO_IMG})` }} />
        <div className="hero-text">
          <span className="hero-chip"><Icon d={I.wand} size={12} /> Lernevo Academy</span>
          <h1>My courses</h1>
          <p>{courses.length} courses in this demo workspace · everything saves in your browser.</p>
          <div className="hero-chips">
            <span><i className="dot-green" /> {count("Published")} live</span>
            <span><i className="dot-amber" /> {count("In Review")} in review</span>
            <span><i className="dot-violet" /> {count("Draft")} drafts</span>
          </div>
        </div>
        <div className="hero-actions">
          <button className="btn btn-glass btn-lg" onClick={() => setTour(true)}><Icon d={I.play} size={13} /> Watch quick tour</button>
          <button className="btn btn-white btn-lg" onClick={onCreate}><Icon d={I.plus} /> Create course</button>
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
function CreateCourse({ onCancel, onSave }) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ img: "", title: "", desc: "", category: "Product knowledge", lang: "English", owner: "Priya Nair", dept: "Human Resources", audience: "All employees" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const steps = ["Basic information", "Learning configuration", "Branding & review"];
  const finish = (status) => onSave({
    id: Date.now(), status, art: (f.title.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "NC"), sub: f.category, tag: `${f.category} · ${f.dept}`,
    title: f.title || "Untitled course", desc: f.desc || "No description yet.", slides: 0, min: 10, q: 0, img: f.img, done: 5, edited: "just now",
  });
  return (
    <div className="wizard">
      <button className="link-back" onClick={onCancel}><Icon d={I.back} size={13} /> Back</button>
      <h1>Create a new course</h1>
      <p className="muted">Three quick steps, then you are in the editor. Nothing here is permanent — you can change it later.</p>
      <ol className="stepper">
        {steps.map((s, i) => (
          <li key={s} className={step === i + 1 ? "on" : step > i + 1 ? "done" : ""}><b>{i + 1}</b> {s}</li>
        ))}
      </ol>
      <section className="panel">
        {step === 1 && (<>
          <label className="field"><span>Course title</span><input value={f.title} onChange={set("title")} placeholder="e.g. Product Portfolio Essentials" /></label>
          <label className="field"><span>Course description</span><textarea rows="3" value={f.desc} onChange={set("desc")} placeholder="A friendly, practical introduction to…" /><small>One or two sentences — what will employees be able to do?</small></label>
          <div className="field"><span>Course thumbnail</span>
            <div className="thumb-row">
              <div className="thumb-drop">{f.img ? <img src={f.img} alt="Cover preview" /> : <Icon d={I.image} size={22} />}</div>
              <div>
                <label className="btn btn-ghost btn-sm"><Icon d={I.upload} size={13} /> {f.img ? "Change cover" : "Upload cover"}
                  <input type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) setF({ ...f, img: URL.createObjectURL(file) }); }} />
                </label>
                <small className="block">PNG or JPG, under 2.5 MB</small>
              </div>
            </div>
          </div>
          <div className="two">
            <label className="field"><span>Category</span>
              <select value={f.category} onChange={set("category")}><option>Product knowledge</option><option>Compliance</option><option>Onboarding</option><option>Security awareness</option></select></label>
            <label className="field"><span>Course language</span>
              <select value={f.lang} onChange={set("lang")}><option>English</option><option>Tamil</option><option>Hindi</option></select></label>
            <label className="field"><span>Content owner</span><input value={f.owner} onChange={set("owner")} /></label>
            <label className="field"><span>Department</span><input value={f.dept} onChange={set("dept")} /></label>
            <label className="field"><span>Target audience</span><input value={f.audience} onChange={set("audience")} /><small>Who is this course for?</small></label>
          </div>
        </>)}
        {step === 2 && (
          <div className="two">
            <label className="field"><span>Estimated duration (min)</span><input type="number" defaultValue={20} /></label>
            <label className="field"><span>Pass mark (%)</span><input type="number" defaultValue={70} /></label>
            <label className="field"><span>Quiz attempts allowed</span><select><option>Unlimited</option><option>3</option><option>1</option></select></label>
            <label className="field"><span>Certificate</span><select><option>Issue on pass</option><option>None</option></select></label>
          </div>
        )}
        {step === 3 && (
          <div className="review">
            <h3>{f.title || "Untitled course"}</h3>
            <p className="muted">{f.desc || "No description yet."}</p>
            <p><b>{f.category}</b> · {f.lang} · {f.owner} · {f.dept} · {f.audience}</p>
          </div>
        )}
      </section>
      <div className="wizard-foot">
        <button className="btn btn-ghost" onClick={step === 1 ? onCancel : () => setStep(step - 1)}><Icon d={I.back} size={13} /> {step === 1 ? "Cancel" : "Previous"}</button>
        <div>
          <button className="btn btn-ghost" onClick={() => finish("Draft")}>Save as draft</button>
          {step < 3
            ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue <Icon d={I.next} size={13} /></button>
            : <button className="btn btn-primary" onClick={() => finish("Draft")}>Create course <Icon d={I.check} size={13} /></button>}
        </div>
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
      <div className="landing-photo" style={{ backgroundImage: `url(${course.img || HERO_IMG})` }} />
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

  // every other screen opens full-screen on top of the sidebar
  return (
    <div className="overlay">
      {view === "create" && (
        <CreateCourse
          onCancel={() => setView("courses")}
          onSave={(c) => { setCourses([c, ...courses]); setView("courses"); }}
        />
      )}
      {view === "landing" && (
        <PreviewLanding course={current} onStart={() => setView("player")} onExit={() => setView("courses")} />
      )}
      {view === "player" && <Player course={current} onExit={() => setView("editor")} />}
      {view === "editor" && (
        <Editor course={current} onBack={() => setView("courses")} onPreview={() => setView("landing")} />
      )}
    </div>
  );
}