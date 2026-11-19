import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Certificate.css";

/* ---------- options ---------- */
export const DEFAULT_CERT = {
  enabled: true,
  layout: "classic",
  theme: "blue",
  color1: "#2456ed",
  color2: "#7c3aed",
  font: "modern",
  pattern: "none",
  paper: "auto", // auto | white | cream | mist | parchment
  foil: false, // shiny gold title
  corners: false,
  watermark: false,
  logo: "",
  title: "Certificate of Completion",
  subtitle: "This is proudly presented to",
  body: "for successfully completing the course",
  extra: "", // optional small line under the course name, e.g. "Duration: 8 hours"
  org: "LERNEVO SOLUTIONS",
  dateLabel: "Date",
  /* signature */
  signName: "Priya Nair",
  signRole: "Head of Learning",
  signMode: "typed", // typed | draw | upload
  signFont: "script", // script | italic
  signImg: "",
  showSign2: false,
  signName2: "Rahul Menon",
  signRole2: "Chief Executive",
  /* seal */
  seal: "star", // star | check | spark | text | none
  sealStyle: "medal", // medal | rosette | stamp | shield
  sealColor: "gold", // gold | silver | bronze | theme
  sealText: "PASS",
  sealImg: "",
  /* show / hide */
  showScore: true,
  showGrade: true, // Distinction / Merit / Passed badge from the score
  showDate: true,
  showId: true,
};

export const THEMES = {
  blue: ["#2456ed", "#7c3aed"],
  violet: ["#6d28d9", "#ec4899"],
  teal: ["#0e7490", "#22d3ee"],
  green: ["#0e8a5a", "#34d399"],
  gold: ["#b7791f", "#f59e0b"],
  sunset: ["#ea580c", "#db2777"],
  rose: ["#be123c", "#f97316"],
  midnight: ["#1e293b", "#6366f1"],
  ocean: ["#0369a1", "#06b6d4"],
  lavender: ["#7e22ce", "#c084fc"],
  forest: ["#14532d", "#ca8a04"],
  graphite: ["#111827", "#64748b"],
};
const LAYOUTS = [["classic", "Classic"], ["modern", "Modern"], ["elegant", "Elegant"], ["bold", "Bold"], ["royal", "Royal"], ["minimal", "Minimal"], ["ribbon", "Ribbon"], ["aurora", "Aurora"]];
const PAPERS = [["auto", "Auto", "linear-gradient(135deg, #fff 50%, #fffdf7 50%)"], ["white", "White", "#ffffff"], ["cream", "Cream", "#fff8e8"], ["mist", "Mist", "#eef3ff"], ["parchment", "Parchment", "#f6ecd6"]];
const FONTS = [["modern", "Modern"], ["serif", "Serif"], ["script", "Handwritten"]];
const PATTERNS = [["none", "None"], ["dots", "Dots"], ["lines", "Lines"], ["waves", "Waves"]];
const ICONS = { star: "★", check: "✓", spark: "✦" };
const SEAL_ICONS = [["star", "★"], ["check", "✓"], ["spark", "✦"], ["text", "Text"], ["none", "None"]];
const SEAL_STYLES = [["medal", "Medal"], ["rosette", "Rosette"], ["stamp", "Stamp"], ["shield", "Shield"]];
const SEAL_COLORS = { gold: ["#fde68a", "#f59e0b"], silver: ["#f8fafc", "#94a3b8"], bronze: ["#fcd9b6", "#b4651f"] };
const TITLE_IDEAS = ["Certificate of Completion", "Certificate of Achievement", "Certificate of Excellence"];
const PRESETS = [
  ["Corporate Blue", { layout: "classic", theme: "blue", font: "modern", seal: "star", sealStyle: "medal", sealColor: "gold", pattern: "none", corners: false, signFont: "script" }],
  ["Royal Gold", { layout: "royal", theme: "midnight", font: "serif", seal: "spark", sealStyle: "rosette", sealColor: "gold", pattern: "waves", corners: true, signFont: "script" }],
  ["Fresh Teal", { layout: "modern", theme: "teal", font: "modern", seal: "check", sealStyle: "shield", sealColor: "theme", pattern: "dots", corners: false, signFont: "italic" }],
  ["Script Gold", { layout: "elegant", theme: "gold", font: "script", seal: "star", sealStyle: "rosette", sealColor: "gold", pattern: "none", corners: true, signFont: "script", foil: true }],
  ["Bold Sunset", { layout: "bold", theme: "sunset", font: "modern", seal: "spark", sealStyle: "medal", sealColor: "theme", pattern: "lines", corners: false, signFont: "script" }],
  ["Minimal Ink", { layout: "minimal", theme: "midnight", font: "serif", seal: "check", sealStyle: "stamp", sealColor: "theme", pattern: "none", corners: false, signFont: "italic" }],
  ["Aurora Glow", { layout: "aurora", theme: "lavender", font: "modern", seal: "spark", sealStyle: "rosette", sealColor: "theme", pattern: "none", corners: false, signFont: "script", paper: "white" }],
  ["Ocean Ribbon", { layout: "ribbon", theme: "ocean", font: "serif", seal: "star", sealStyle: "medal", sealColor: "gold", pattern: "none", corners: false, signFont: "script" }],
  ["Forest Honour", { layout: "elegant", theme: "forest", font: "serif", seal: "star", sealStyle: "rosette", sealColor: "gold", pattern: "none", corners: true, signFont: "script", paper: "parchment", foil: true }],
];

/* always returns a full certificate config for a course (old courses get the defaults) */
export const getCert = (course) => ({ ...DEFAULT_CERT, ...((course && course.certificate) || {}) });
const colorsOf = (cert) => (cert.theme === "custom" ? [cert.color1 || "#2456ed", cert.color2 || "#7c3aed"] : THEMES[cert.theme] || THEMES.blue);
const today = () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const makeCertId = (course, name) => `LRN-${String(course.id).slice(-5)}-${(name || "NAME").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "NAM"}`;
/* score -> [css class, label] for the achievement badge */
const gradeOf = (s) => (s >= 90 ? ["g-dist", "With Distinction"] : s >= 75 ? ["g-merit", "With Merit"] : ["g-pass", "Successfully Passed"]);
const labelOf = (list, k) => ((list.find(([x]) => x === k) || [])[1]) || k;
/* image files -> data URLs, so they survive a page refresh once courses are saved */
const readImg = (file, cb) => {
  if (!file || !file.type.startsWith("image/")) return;
  const r = new FileReader();
  r.onload = () => cb(String(r.result));
  r.readAsDataURL(file);
};

/* ---------- the seal ---------- */
function Seal({ cert, unit }) {
  const none = cert.seal === "none" && !cert.sealImg;
  const content = cert.seal === "text" ? <em className="seal-txt">{cert.sealText}</em> : ICONS[cert.seal] || "★";
  return (
    <div className={`cert-seal ss-${cert.sealStyle || "medal"} sc-${cert.sealColor || "gold"}${cert.sealImg ? " ss-img" : ""}${none ? " none" : ""}`} style={unit ? { "--u": unit } : undefined}>
      <span className="seal-face">{cert.sealImg ? <img src={cert.sealImg} alt="" /> : none ? "" : content}</span>
    </div>
  );
}

/* ---------- the certificate itself (editor, thumbnails, preview and download) ----------
   onPick(field) is optional: when given, the text on the certificate becomes click-to-edit. */
export function CertificateView({ cert, course, name, score, date, onPick }) {
  const [c1, c2] = colorsOf(cert);
  const certId = makeCertId(course, name);
  const shownName = name || "Learner name";
  const nmCls = shownName.length > 30 ? " nm-long" : shownName.length > 21 ? " nm-mid" : "";
  const grade = gradeOf(Number(score) || 0);
  const hot = (f, cls = "") => (onPick ? { className: `${cls} cert-hot`.trim(), onClick: () => onPick(f), title: "Click to edit" } : { className: cls });
  const img1 = cert.signMode !== "typed" && cert.signImg ? cert.signImg : "";
  const signCls = `cert-sign${cert.signFont === "script" ? " sg-script" : ""}`;
  const two = cert.showSign2;
  const dateBox = cert.showDate ? (
    <div className="cert-fb" key="date">
      <div className="cert-fb-art"><b>{date || today()}</b></div>
      <div className="cert-fb-line"><small>{cert.dateLabel || "Date"}</small></div>
    </div>
  ) : <div className="cert-fb cert-gap" key="date" />;
  const sign1 = (
    <div className="cert-fb" key="s1">
      <div className="cert-fb-art">{img1 ? <img src={img1} alt="" /> : <span className={signCls}>{cert.signName}</span>}</div>
      <div className="cert-fb-line"><b {...hot("signName")}>{cert.signName}</b><small {...hot("signRole")}>{cert.signRole}</small></div>
    </div>
  );
  const sign2 = two && (
    <div className="cert-fb" key="s2">
      <div className="cert-fb-art"><span className={signCls}>{cert.signName2}</span></div>
      <div className="cert-fb-line"><b {...hot("signName2")}>{cert.signName2}</b><small {...hot("signRole2")}>{cert.signRole2}</small></div>
    </div>
  );
  return (
    <div className={`cert cert-t-${cert.layout || "classic"} cert-f-${cert.font || "modern"} cert-p-${cert.pattern || "none"} cert-bg-${cert.paper || "auto"}${cert.foil ? " cert-foil" : ""}`} style={{ "--c1": c1, "--c2": c2 }}>
      <div className="cert-frame">
        {cert.watermark && (
          <div className="cert-wm" aria-hidden="true">
            {cert.logo ? <img src={cert.logo} alt="" /> : <span>{(cert.org || "L").trim()[0] || "L"}</span>}
          </div>
        )}
        {cert.corners && <div className="cert-corners" aria-hidden="true"><i /><i /><i /><i /></div>}
        <div className="cert-org">
          {cert.logo ? <img className="cert-logo-img" src={cert.logo} alt="" /> : <span className="cert-logo">{(cert.org || "L").trim()[0] || "L"}</span>}
          <span {...hot("org")}>{cert.org}</span>
        </div>
        <h2 {...hot("title", "cert-title")}>{cert.title}</h2>
        <p {...hot("subtitle", "cert-sub")}>{cert.subtitle}</p>
        <div {...hot("name", `cert-name${nmCls}`)}>{shownName}</div>
        <p {...hot("body", "cert-body")}>{cert.body}</p>
        <div className="cert-course">{course.title}</div>
        {cert.extra && <p {...hot("extra", "cert-extra")}>{cert.extra}</p>}
        {(cert.showScore || cert.showGrade) && score != null && (
          <div className="cert-meta">
            {cert.showScore && <p className="cert-score">Score: {score}%</p>}
            {cert.showGrade && <p className={`cert-grade ${grade[0]}`}>✦ {grade[1]}</p>}
          </div>
        )}
        <div className={`cert-foot${two ? " four" : ""}`}>
          {two ? [dateBox, sign1, <Seal cert={cert} key="seal" />, sign2] : [dateBox, <Seal cert={cert} key="seal" />, sign1]}
        </div>
        {cert.showId && <small className="cert-id">Certificate ID: {certId}</small>}
      </div>
    </div>
  );
}

/* ---------- Download button for the learner (used on the player's "Thank you" slide) ----------
   <CertificateDownload course={course} name={name} score={92} />
   score = percentage (0-100). Opens the print dialog -> choose "Save as PDF" (A4 landscape).
   The printable certificate is rendered straight into <body> (portal), so slide animations,
   overflow:hidden or transforms in the player can never clip it. */
export function CertificateDownload({ course, name, score, label = "Download certificate", share = false, className = "btn btn-primary", shareClassName = "btn btn-ghost", icon = "⬇" }) {
  const cert = getCert(course);
  if (!cert.enabled) return null;
  const download = () => {
    const prev = document.title;
    document.title = `Certificate - ${name || "Learner"} - ${course.title}`; /* becomes the PDF file name */
    document.body.classList.add("cert-printing");
    const done = () => {
      document.body.classList.remove("cert-printing");
      document.title = prev;
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.print();
  };
  /* opens LinkedIn's "Add licence or certification" form, already filled in */
  const linkedIn = () => {
    const d = new Date();
    const u = new URL("https://www.linkedin.com/profile/add");
    u.searchParams.set("startTask", "CERTIFICATION_NAME");
    u.searchParams.set("name", course.title);
    u.searchParams.set("organizationName", cert.org);
    u.searchParams.set("issueYear", String(d.getFullYear()));
    u.searchParams.set("issueMonth", String(d.getMonth() + 1));
    u.searchParams.set("certId", makeCertId(course, name));
    window.open(u.toString(), "_blank", "noopener,noreferrer");
  };
  return (
    <>
      <span className="cert-actions">
        <button type="button" className={className} onClick={download}>{icon} {label}</button>
        {share && <button type="button" className={shareClassName} onClick={linkedIn}>in&nbsp; Add to LinkedIn</button>}
      </span>
      {typeof document !== "undefined" && createPortal(
        <div className="cert-print-host cert-print-root" aria-hidden="true">
          <CertificateView cert={cert} course={course} name={name} score={score} />
        </div>,
        document.body
      )}
    </>
  );
}

/* ---------- small UI pieces ---------- */
const Toggle = ({ on, onChange, title, sub }) => (
  <button type="button" role="switch" aria-checked={on} className={`ce-toggle${on ? " on" : ""}`} onClick={onChange}>
    <span className="ce-tg"><i /></span>
    <span className="ce-tt"><b>{title}</b>{sub && <small>{sub}</small>}</span>
  </button>
);

/* draw your signature with mouse / finger / pen */
function SignaturePad({ value, onChange }) {
  const ref = useRef(null);
  const drawing = useRef(false);
  const last = useRef([0, 0]);
  const [ink, setInk] = useState("#111827");
  const [empty, setEmpty] = useState(!value);

  useEffect(() => {
    if (!value) return;
    const cv = ref.current;
    const ctx = cv.getContext("2d");
    const im = new Image();
    im.onload = () => ctx.drawImage(im, 0, 0, cv.width, cv.height);
    im.src = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e) => {
    const cv = ref.current;
    const r = cv.getBoundingClientRect();
    return [((e.clientX - r.left) * cv.width) / r.width, ((e.clientY - r.top) * cv.height) / r.height];
  };
  const down = (e) => { ref.current.setPointerCapture(e.pointerId); drawing.current = true; last.current = pos(e); };
  const move = (e) => {
    if (!drawing.current) return;
    const ctx = ref.current.getContext("2d");
    const p = pos(e);
    ctx.strokeStyle = ink; ctx.lineWidth = 3.4; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(last.current[0], last.current[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
    last.current = p;
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    setEmpty(false);
    onChange(ref.current.toDataURL("image/png"));
  };
  const clear = () => { ref.current.getContext("2d").clearRect(0, 0, 560, 180); setEmpty(true); onChange(""); };

  return (
    <div className="ce-pad">
      <div className="ce-pad-top">
        <span>Draw with mouse, finger or pen</span>
        <div className="ce-inks">
          {["#111827", "#1d4ed8", "#7c3aed"].map((c) => <button type="button" key={c} aria-label={`Ink ${c}`} className={ink === c ? "on" : ""} style={{ background: c }} onClick={() => setInk(c)} />)}
        </div>
      </div>
      <canvas ref={ref} width={560} height={180} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
      <div className="ce-pad-foot">
        <small>{empty ? "Sign above the line" : "✓ Signature added to the certificate"}</small>
        <button type="button" className="ce-link" onClick={clear}>Clear</button>
      </div>
    </div>
  );
}

/* a short burst of confetti over the preview (on save, or the Celebrate button) */
const CONFETTI = ["#2456ed", "#7c3aed", "#f59e0b", "#22c55e", "#ec4899", "#06b6d4", "#fde68a"];
function Confetti() {
  const bits = useMemo(() => Array.from({ length: 46 }, (_, i) => ({
    id: i, x: Math.random() * 100, w: 5 + Math.random() * 6, d: 1.8 + Math.random() * 1.6, dl: Math.random() * 0.5,
    dx: (Math.random() - 0.5) * 160, r: 360 + Math.random() * 540, bg: CONFETTI[i % CONFETTI.length],
  })), []);
  return (
    <div className="ce-confetti" aria-hidden="true">
      {bits.map((b) => <i key={b.id} style={{ "--x": `${b.x}%`, "--w": `${b.w}px`, "--d": `${b.d}s`, "--dl": `${b.dl}s`, "--dx": `${b.dx}px`, "--r": `${b.r}deg`, "--bg": b.bg }} />)}
    </div>
  );
}

function HeroArt() {
  return (
    <svg viewBox="0 0 220 130" aria-hidden="true">
      <defs>
        <linearGradient id="ce-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#22d3ee" /><stop offset=".55" stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" /></linearGradient>
        <linearGradient id="ce-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#f59e0b" /></linearGradient>
        <filter id="ce-s" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#3b4bdc" floodOpacity=".25" /></filter>
      </defs>
      <circle cx="110" cy="66" r="56" fill="#c7d2fe" opacity=".4" />
      <g className="ce-float" filter="url(#ce-s)">
        <rect x="46" y="22" width="128" height="86" rx="10" fill="#fff" />
        <rect x="46" y="22" width="128" height="86" rx="10" fill="none" stroke="url(#ce-a)" strokeWidth="3" />
        <rect x="68" y="40" width="84" height="8" rx="4" fill="url(#ce-a)" />
        <rect x="82" y="56" width="56" height="5" rx="2.5" fill="#c7d2fe" />
        <rect x="74" y="70" width="72" height="4" rx="2" fill="#e2e8f0" />
        <rect x="60" y="92" width="38" height="3" rx="1.5" fill="#cbd5e1" />
        <path d="M144 96l-5 16 11-6 11 6-5-16z" fill="#f59e0b" />
        <circle cx="150" cy="90" r="13" fill="url(#ce-g)" />
        <path d="M144 90l4 4 8-9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g fill="#f5b301"><path className="ce-twk" d="M24 28l2.6 7 7 2.6-7 2.6-2.6 7-2.6-7-7-2.6 7-2.6z" /><path className="ce-twk ce-tw2" d="M196 84l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" /></g>
    </svg>
  );
}

/* ---------- author screen: design + edit the certificate ---------- */
export function CertificateEditor({ course, onBack, onSave }) {
  const [c, setC] = useState(() => getCert(course));
  const [base, setBase] = useState(() => JSON.stringify(getCert(course)));
  const [tab, setTab] = useState("template");
  const [sample, setSample] = useState("Aarav Sharma");
  const [score, setScore] = useState(92);
  const [toast, setToast] = useState(false);
  const [full, setFull] = useState(false);
  const [burst, setBurst] = useState(0);
  const deskRef = useRef(null);
  const dirty = JSON.stringify(c) !== base;
  const [t1, t2] = colorsOf(c);

  const change = (patch) => setC((p) => ({ ...p, ...patch }));
  const set = (k) => (e) => change({ [k]: e.target.value });
  const save = () => { onSave(c); setBase(JSON.stringify(c)); setToast(true); setBurst((b) => b + 1); };
  /* gentle 3D tilt of the certificate following the mouse */
  const tilt = (e) => {
    const el = deskRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--rx", `${(-((e.clientY - r.top) / r.height - 0.5) * 5).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(((e.clientX - r.left) / r.width - 0.5) * 7).toFixed(2)}deg`);
  };
  const untilt = () => { const el = deskRef.current; if (el) { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); } };
  const revert = () => setC(JSON.parse(base));

  /* click a line on the certificate -> jump to its field */
  const pick = (f) => {
    if (f === "name") { document.getElementById("ce-sample")?.focus(); return; }
    setTab(f.endsWith("2") ? "sign" : "text");
    setTimeout(() => { const el = document.getElementById(`ce-${f}`); if (el) { el.focus(); el.select?.(); } }, 70);
  };

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(false), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  /* Ctrl/Cmd + S saves, Esc closes full screen */
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save(); }
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const tabs = [["template", "▦", "Template"], ["text", "Aa", "Text"], ["style", "◐", "Style"], ["sign", "✍", "Sign & Seal"], ["options", "⚙", "Options"]];
  const sealDemoColors = c.sealColor === "theme" ? { "--c1": t1, "--c2": t2 } : { "--c1": t1, "--c2": t2 };
  const signLabel = c.signMode === "typed" || !c.signImg ? "Typed signature" : c.signMode === "draw" ? "Drawn signature" : "Uploaded signature";

  return (
    <div className="cert-ed">
      <div className="ce-hero">
        <div className="ce-hero-text">
          <button className="link-back" onClick={onBack}>← Back to courses</button>
          <span className="ce-chip">✦ Certificate studio</span>
          <h1>Design your <span>certificate</span></h1>
          <p>{course.title}</p>
          <div className="ce-hero-chips">
            <span>▦ {labelOf(LAYOUTS, c.layout)}</span>
            <span><i style={{ background: `linear-gradient(135deg, ${t1}, ${t2})` }} /> {c.theme === "custom" ? "Custom colours" : c.theme}</span>
            <span>✍ {signLabel}</span>
            <span>◎ {c.sealImg ? "Custom seal" : c.seal === "none" ? "No seal" : labelOf(SEAL_STYLES, c.sealStyle)}</span>
          </div>
        </div>
        <div className="ce-hero-art"><HeroArt /></div>
        <div className="ce-hero-actions">
          <span className={`ce-state${dirty ? " dirty" : ""}`}>{dirty ? "● Unsaved changes" : "✓ All changes saved"}</span>
          <div>
            {dirty && <button className="btn btn-ghost" onClick={revert}>↺ Revert</button>}
            <button className="btn btn-ghost" onClick={() => window.print()}>⬇ Download sample</button>
            <button className="btn btn-primary" onClick={save} disabled={!dirty && !toast} title="Ctrl + S">{toast ? "✓ Saved" : "Save certificate"}</button>
          </div>
        </div>
      </div>

      <div className="ce-grid">
        <section className="ce-panel">
          <div className="ce-tabs" role="tablist">
            {tabs.map(([k, ic, t]) => (
              <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
                <em>{ic}</em>{t}
              </button>
            ))}
          </div>

          <div className="ce-body" key={tab}>
            {/* ---------------- TEMPLATE ---------------- */}
            {tab === "template" && (<>
              <div className="ce-f"><span>Quick styles <small>One click, full look</small></span>
                <div className="ce-presets">
                  {PRESETS.map(([label, p]) => {
                    const [a, b] = THEMES[p.theme];
                    return <button type="button" key={label} style={{ background: `linear-gradient(120deg, ${a}, ${b})` }} onClick={() => change({ paper: "auto", foil: false, ...p })}>{label}</button>;
                  })}
                </div>
              </div>
              <div className="ce-f"><span>Template</span>
                <div className="ce-templates">
                  {LAYOUTS.map(([k, label]) => (
                    <button type="button" key={k} className={`ce-tpl${c.layout === k ? " on" : ""}`} onClick={() => change({ layout: k })}>
                      <span className="ce-tpl-thumb"><CertificateView cert={{ ...c, layout: k }} course={course} name="Aarav Sharma" /></span>
                      <b>{label}</b>
                      {c.layout === k && <i className="ce-tick">✓</i>}
                    </button>
                  ))}
                </div>
              </div>
            </>)}

            {/* ---------------- TEXT ---------------- */}
            {tab === "text" && (<>
              <p className="ce-help">Tip: you can also click any text on the certificate to jump to its box.</p>
              <label className="ce-f"><span>Certificate title</span>
                <input id="ce-title" value={c.title} onChange={set("title")} maxLength={40} />
                <div className="ce-ideas">{TITLE_IDEAS.map((t) => <button type="button" key={t} onClick={() => change({ title: t })}>{t.replace("Certificate of ", "")}</button>)}</div>
              </label>
              <label className="ce-f"><span>Line before the name</span><input id="ce-subtitle" value={c.subtitle} onChange={set("subtitle")} maxLength={50} /></label>
              <label className="ce-f"><span>Line after the name</span><input id="ce-body" value={c.body} onChange={set("body")} maxLength={60} /></label>
              <label className="ce-f"><span>Extra line under course <small>Optional</small></span>
                <input id="ce-extra" value={c.extra} onChange={set("extra")} maxLength={50} placeholder="e.g. Duration: 8 hours" />
                <div className="ce-ideas">{["Duration: 8 hours", "Verified learning achievement", "With honours"].map((t) => <button type="button" key={t} onClick={() => change({ extra: t })}>{t}</button>)}</div>
              </label>
              <label className="ce-f"><span>Organisation name</span><input id="ce-org" value={c.org} onChange={set("org")} maxLength={40} /></label>
              <div className="ce-two">
                <label className="ce-f"><span>Signed by</span><input id="ce-signName" value={c.signName} onChange={set("signName")} maxLength={30} /></label>
                <label className="ce-f"><span>Designation</span><input id="ce-signRole" value={c.signRole} onChange={set("signRole")} maxLength={30} /></label>
              </div>
              <label className="ce-f"><span>Date label <small>e.g. Date, Issued on, Awarded on</small></span><input id="ce-dateLabel" value={c.dateLabel} onChange={set("dateLabel")} maxLength={20} /></label>
            </>)}

            {/* ---------------- STYLE ---------------- */}
            {tab === "style" && (<>
              <div className="ce-f"><span>Colour theme</span>
                <div className="ce-themes">
                  {Object.entries(THEMES).map(([k, [a, b]]) => (
                    <button type="button" key={k} title={k} aria-label={`${k} theme`} className={c.theme === k ? "on" : ""}
                      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} onClick={() => change({ theme: k })}>
                      {c.theme === k && "✓"}
                    </button>
                  ))}
                  <button type="button" title="Your own colours" aria-label="Custom colours" className={`ce-custom${c.theme === "custom" ? " on" : ""}`} onClick={() => change({ theme: "custom" })}>
                    {c.theme === "custom" ? "✓" : "+"}
                  </button>
                </div>
                {c.theme === "custom" && (
                  <div className="ce-colors">
                    <label><small>Colour 1</small><input type="color" value={c.color1} onChange={set("color1")} /></label>
                    <label><small>Colour 2</small><input type="color" value={c.color2} onChange={set("color2")} /></label>
                  </div>
                )}
              </div>
              <div className="ce-f"><span>Font style</span>
                <div className="ce-seg">
                  {FONTS.map(([k, l]) => <button type="button" key={k} className={c.font === k ? "on" : ""} onClick={() => change({ font: k })}>{l}</button>)}
                </div>
              </div>
              <div className="ce-f"><span>Background pattern</span>
                <div className="ce-seg">
                  {PATTERNS.map(([k, l]) => <button type="button" key={k} className={c.pattern === k ? "on" : ""} onClick={() => change({ pattern: k })}>{l}</button>)}
                </div>
              </div>
              <div className="ce-f"><span>Paper colour <small>Royal keeps its dark paper</small></span>
                <div className="ce-themes">
                  {PAPERS.map(([k, l, bg]) => (
                    <button type="button" key={k} title={l} aria-label={`${l} paper`} className={c.paper === k ? "on" : ""}
                      style={{ background: bg, color: "#334155" }} onClick={() => change({ paper: k })}>
                      {c.paper === k && "✓"}
                    </button>
                  ))}
                </div>
              </div>
              <Toggle on={c.foil} onChange={() => change({ foil: !c.foil })} title="Gold foil title" sub="Shiny gold lettering for the heading" />
              <Toggle on={c.corners} onChange={() => change({ corners: !c.corners })} title="Corner ornaments" sub="Elegant corner frames on all four corners" />
              <Toggle on={c.watermark} onChange={() => change({ watermark: !c.watermark })} title="Faint watermark" sub="A soft logo letter behind the text" />
              <div className="ce-f"><span>Logo <small>Optional · replaces the letter mark</small></span>
                <label className="ce-logo-drop">
                  <span className="ce-logo-prev">{c.logo ? <img src={c.logo} alt="Logo preview" /> : <b>{(c.org || "L").trim()[0] || "L"}</b>}</span>
                  <span className="ce-logo-txt"><b>{c.logo ? "Change logo" : "Upload your logo"}</b><small>PNG or JPG · square works best</small></span>
                  <input type="file" accept="image/*" hidden onChange={(e) => readImg(e.target.files?.[0], (v) => change({ logo: v }))} />
                </label>
                {c.logo && <button type="button" className="ce-link" onClick={() => change({ logo: "" })}>Remove logo</button>}
              </div>
            </>)}

            {/* ---------------- SIGN & SEAL ---------------- */}
            {tab === "sign" && (<>
              <div className="ce-sec"><span>✍</span> Signature</div>
              <div className="ce-f"><span>How should it look? <small>Shown above the signature line</small></span>
                <div className="ce-seg">
                  {[["typed", "Typed"], ["draw", "Draw"], ["upload", "Upload"]].map(([k, l]) => (
                    <button type="button" key={k} className={c.signMode === k ? "on" : ""} onClick={() => change({ signMode: k })}>{l}</button>
                  ))}
                </div>
                {c.signMode === "typed" && (<>
                  <div className="ce-seg">
                    {[["script", "Handwritten"], ["italic", "Classic italic"]].map(([k, l]) => (
                      <button type="button" key={k} className={c.signFont === k ? "on" : ""} onClick={() => change({ signFont: k })}>{l}</button>
                    ))}
                  </div>
                  <small>Uses “{c.signName}”. Change the name in the Text tab.</small>
                </>)}
                {c.signMode === "draw" && <SignaturePad value={c.signImg} onChange={(v) => change({ signImg: v })} />}
                {c.signMode === "upload" && (<>
                  <label className="ce-logo-drop">
                    <span className="ce-logo-prev ce-wide">{c.signImg ? <img src={c.signImg} alt="Signature preview" /> : <b>✍</b>}</span>
                    <span className="ce-logo-txt"><b>{c.signImg ? "Change signature" : "Upload signature image"}</b><small>PNG with transparent background looks best</small></span>
                    <input type="file" accept="image/*" hidden onChange={(e) => readImg(e.target.files?.[0], (v) => change({ signImg: v }))} />
                  </label>
                  {c.signImg && <button type="button" className="ce-link" onClick={() => change({ signImg: "" })}>Remove signature</button>}
                </>)}
              </div>

              <Toggle on={c.showSign2} onChange={() => change({ showSign2: !c.showSign2 })} title="Add a second signature" sub="Two signatories, e.g. HR and CEO" />
              {c.showSign2 && (
                <div className="ce-two">
                  <label className="ce-f"><span>Second signer</span><input id="ce-signName2" value={c.signName2} onChange={set("signName2")} maxLength={30} /></label>
                  <label className="ce-f"><span>Designation</span><input id="ce-signRole2" value={c.signRole2} onChange={set("signRole2")} maxLength={30} /></label>
                </div>
              )}

              <div className="ce-sec"><span>◎</span> Seal</div>
              <div className="ce-f"><span>Seal style</span>
                <div className="ce-sealgrid">
                  {SEAL_STYLES.map(([k, l]) => (
                    <button type="button" key={k} className={`ce-sealopt${c.sealStyle === k ? " on" : ""}`} onClick={() => change({ sealStyle: k })}>
                      <span className="ce-sealdemo" style={sealDemoColors}>
                        <Seal cert={{ ...c, sealStyle: k, seal: c.seal === "none" ? "star" : c.seal, sealImg: "" }} unit="5px" />
                      </span>
                      <b>{l}</b>
                      {c.sealStyle === k && <i className="ce-tick">✓</i>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ce-f"><span>Inside the seal</span>
                <div className="ce-seg">
                  {SEAL_ICONS.map(([k, l]) => <button type="button" key={k} className={c.seal === k ? "on" : ""} onClick={() => change({ seal: k })}>{l}</button>)}
                </div>
                {c.seal === "text" && <input id="ce-sealText" value={c.sealText} onChange={(e) => change({ sealText: e.target.value.toUpperCase() })} maxLength={6} placeholder="PASS, A+, 2026…" />}
              </div>
              <div className="ce-f"><span>Seal colour</span>
                <div className="ce-themes">
                  {Object.entries(SEAL_COLORS).map(([k, [a, b]]) => (
                    <button type="button" key={k} title={k} aria-label={`${k} seal`} className={c.sealColor === k ? "on" : ""}
                      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} onClick={() => change({ sealColor: k })}>
                      {c.sealColor === k && <span style={{ color: "#7c4a03" }}>✓</span>}
                    </button>
                  ))}
                  <button type="button" title="Match theme" aria-label="Match theme" className={c.sealColor === "theme" ? "on" : ""}
                    style={{ background: `linear-gradient(135deg, ${t2}, ${t1})` }} onClick={() => change({ sealColor: "theme" })}>
                    {c.sealColor === "theme" && "✓"}
                  </button>
                </div>
              </div>
              <div className="ce-f"><span>Your own seal image <small>Optional · replaces the seal</small></span>
                <label className="ce-logo-drop">
                  <span className="ce-logo-prev">{c.sealImg ? <img src={c.sealImg} alt="Seal preview" /> : <b>◎</b>}</span>
                  <span className="ce-logo-txt"><b>{c.sealImg ? "Change seal image" : "Upload a seal or stamp"}</b><small>Round PNG with transparent background</small></span>
                  <input type="file" accept="image/*" hidden onChange={(e) => readImg(e.target.files?.[0], (v) => change({ sealImg: v }))} />
                </label>
                {c.sealImg && <button type="button" className="ce-link" onClick={() => change({ sealImg: "" })}>Remove seal image</button>}
              </div>
            </>)}

            {/* ---------------- OPTIONS ---------------- */}
            {tab === "options" && (<>
              <Toggle on={c.enabled} onChange={() => change({ enabled: !c.enabled })} title="Issue certificate on pass" sub="Learners can download it after finishing the course" />
              <Toggle on={c.showDate} onChange={() => change({ showDate: !c.showDate })} title="Show completion date" />
              <Toggle on={c.showScore} onChange={() => change({ showScore: !c.showScore })} title="Show quiz score" />
              <Toggle on={c.showGrade} onChange={() => change({ showGrade: !c.showGrade })} title="Show achievement badge" sub="Distinction 90+ · Merit 75+ · otherwise Passed" />
              <Toggle on={c.showId} onChange={() => change({ showId: !c.showId })} title="Show certificate ID" sub="Helps you verify a certificate later" />
              <button type="button" className="ce-reset" onClick={() => setC({ ...DEFAULT_CERT })}>↺ Reset to default design</button>
            </>)}
          </div>
        </section>

        <aside className="ce-stage">
          <div className="ce-stage-top">
            <span className="ce-live"><i /> Live preview</span>
            <div className="ce-stage-in">
              <label className="ce-name"><small>Preview name</small><input id="ce-sample" value={sample} onChange={(e) => setSample(e.target.value)} maxLength={40} placeholder="Learner name" /></label>
              <label className="ce-name ce-score"><small>Score %</small><input type="number" min="0" max="100" value={score} onChange={(e) => setScore(Math.max(0, Math.min(100, Number(e.target.value) || 0)))} /></label>
              <button type="button" className="ce-fs" onClick={() => setBurst((b) => b + 1)} title="Throw some confetti">✨ Celebrate</button>
              <button type="button" className="ce-fs" onClick={() => setFull(true)} title="Full screen preview">⛶ Full screen</button>
            </div>
          </div>
          {/* cert-live: shown on screen, and it is also what gets printed */}
          <div className="ce-desk" ref={deskRef} onMouseMove={tilt} onMouseLeave={untilt}>
            {burst > 0 && <Confetti key={burst} />}
            <div className="cert-print-host cert-live" key={c.layout}>
              <CertificateView cert={c} course={course} name={sample.trim() || undefined} score={score} onPick={pick} />
            </div>
          </div>
          <p className="ce-tip">✎ Click any text on the certificate to edit it · Ctrl + S to save</p>
          {!c.enabled && <p className="cert-off">Certificate is switched off, so learners will not see a download button.</p>}
        </aside>
      </div>

      {toast && <div className="ce-toast" role="status">✓ Certificate saved for this course</div>}

      {full && (
        <div className="ce-modal" onClick={() => setFull(false)}>
          <div className="ce-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="ce-modal-x" onClick={() => setFull(false)} aria-label="Close full screen">×</button>
            <CertificateView cert={c} course={course} name={sample.trim() || undefined} score={score} />
          </div>
        </div>
      )}
    </div>
  );
}