import { useEffect, useState } from "react";
import "./Certificate.css";

/* ---------- options ---------- */
export const DEFAULT_CERT = {
  enabled: true,
  layout: "classic",
  theme: "blue",
  font: "modern",
  seal: "star",
  logo: "",
  title: "Certificate of Completion",
  subtitle: "This is proudly presented to",
  body: "for successfully completing the course",
  org: "LERNEVO SOLUTIONS",
  signName: "Priya Nair",
  signRole: "Head of Learning",
  showScore: true,
  showDate: true,
  showId: true,
};

export const THEMES = {
  blue: ["#2456ed", "#7c3aed"],
  gold: ["#b7791f", "#f59e0b"],
  green: ["#0e8a5a", "#34d399"],
  rose: ["#be123c", "#f97316"],
  teal: ["#0e7490", "#22d3ee"],
  midnight: ["#1e293b", "#6366f1"],
};
const LAYOUTS = [["classic", "Classic"], ["modern", "Modern"], ["elegant", "Elegant"], ["bold", "Bold"]];
const FONTS = [["modern", "Modern"], ["serif", "Serif"], ["script", "Handwritten"]];
const SEALS = [["star", "★"], ["check", "✓"], ["spark", "✦"], ["none", "None"]];
const TITLE_IDEAS = ["Certificate of Completion", "Certificate of Achievement", "Certificate of Excellence"];

/* always returns a full certificate config for a course (old courses get the defaults) */
export const getCert = (course) => ({ ...DEFAULT_CERT, ...((course && course.certificate) || {}) });

const today = () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/* ---------- the certificate itself (editor, thumbnails, preview and download) ---------- */
export function CertificateView({ cert, course, name, score, date }) {
  const [c1, c2] = THEMES[cert.theme] || THEMES.blue;
  const initials = (name || "NAME").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "NAM";
  const certId = `LRN-${String(course.id).slice(-5)}-${initials}`;
  const seal = SEALS.find(([k]) => k === cert.seal) || SEALS[0];
  return (
    <div className={`cert cert-t-${cert.layout || "classic"} cert-f-${cert.font || "modern"}`} style={{ "--c1": c1, "--c2": c2 }}>
      <div className="cert-frame">
        <div className="cert-org">
          {cert.logo ? <img className="cert-logo-img" src={cert.logo} alt="" /> : <span className="cert-logo">{(cert.org || "L").trim()[0] || "L"}</span>}
          <span>{cert.org}</span>
        </div>
        <h2 className="cert-title">{cert.title}</h2>
        <p className="cert-sub">{cert.subtitle}</p>
        <div className="cert-name">{name || "Learner name"}</div>
        <p className="cert-body">{cert.body}</p>
        <div className="cert-course">{course.title}</div>
        {cert.showScore && score != null && <p className="cert-score">Score: {score}%</p>}
        <div className="cert-foot">
          {cert.showDate ? <div><b>{date || today()}</b><small>Date</small></div> : <div className="cert-gap" />}
          <div className={`cert-seal${seal[0] === "none" ? " none" : ""}`}>{seal[0] === "none" ? "" : seal[1]}</div>
          <div><b className="cert-sign">{cert.signName}</b><small>{cert.signRole}</small></div>
        </div>
        {cert.showId && <small className="cert-id">Certificate ID: {certId}</small>}
      </div>
    </div>
  );
}

/* ---------- Download button for the learner (use in Preview.js / player "thanks" slide) ----------
   <CertificateDownload course={course} name={name} score={score} />
   Opens the browser print dialog -> "Save as PDF" (A4 landscape). */
export function CertificateDownload({ course, name, score, label = "Download certificate" }) {
  const cert = getCert(course);
  if (!cert.enabled) return null;
  return (
    <>
      <button className="btn btn-primary" onClick={() => window.print()}>⬇ {label}</button>
      <div className="cert-print-host" aria-hidden="true">
        <CertificateView cert={cert} course={course} name={name} score={score} />
      </div>
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
  const [toast, setToast] = useState(false);
  const dirty = JSON.stringify(c) !== base;

  const change = (patch) => setC((p) => ({ ...p, ...patch }));
  const set = (k) => (e) => change({ [k]: e.target.value });
  const save = () => { onSave(c); setBase(JSON.stringify(c)); setToast(true); };
  const pickLogo = (file) => { if (file && file.type.startsWith("image/")) change({ logo: URL.createObjectURL(file) }); };

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(false), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const tabs = [["template", "▦", "Template"], ["text", "Aa", "Text"], ["style", "◐", "Style"], ["options", "⚙", "Options"]];

  return (
    <div className="cert-ed">
      <div className="ce-hero">
        <div className="ce-hero-text">
          <button className="link-back" onClick={onBack}>← Back to courses</button>
          <span className="ce-chip">✦ Certificate studio</span>
          <h1>Design your <span>certificate</span></h1>
          <p>{course.title}</p>
        </div>
        <div className="ce-hero-art"><HeroArt /></div>
        <div className="ce-hero-actions">
          <span className={`ce-state${dirty ? " dirty" : ""}`}>{dirty ? "● Unsaved changes" : "✓ All changes saved"}</span>
          <div>
            <button className="btn btn-ghost" onClick={() => window.print()}>⬇ Download sample</button>
            <button className="btn btn-primary" onClick={save} disabled={!dirty && !toast}>{toast ? "✓ Saved" : "Save certificate"}</button>
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
            {tab === "template" && (<>
              <p className="ce-help">Pick a design. Every template keeps your text and colours.</p>
              <div className="ce-templates">
                {LAYOUTS.map(([k, label]) => (
                  <button type="button" key={k} className={`ce-tpl${c.layout === k ? " on" : ""}`} onClick={() => change({ layout: k })}>
                    <span className="ce-tpl-thumb"><CertificateView cert={{ ...c, layout: k }} course={course} name="Aarav Sharma" /></span>
                    <b>{label}</b>
                    {c.layout === k && <i className="ce-tick">✓</i>}
                  </button>
                ))}
              </div>
            </>)}

            {tab === "text" && (<>
              <label className="ce-f"><span>Certificate title</span>
                <input value={c.title} onChange={set("title")} maxLength={40} />
                <div className="ce-ideas">{TITLE_IDEAS.map((t) => <button type="button" key={t} onClick={() => change({ title: t })}>{t.replace("Certificate of ", "")}</button>)}</div>
              </label>
              <label className="ce-f"><span>Line before the name</span><input value={c.subtitle} onChange={set("subtitle")} maxLength={50} /></label>
              <label className="ce-f"><span>Line after the name</span><input value={c.body} onChange={set("body")} maxLength={60} /></label>
              <label className="ce-f"><span>Organisation name</span><input value={c.org} onChange={set("org")} maxLength={40} /></label>
              <div className="ce-two">
                <label className="ce-f"><span>Signed by</span><input value={c.signName} onChange={set("signName")} maxLength={30} /></label>
                <label className="ce-f"><span>Designation</span><input value={c.signRole} onChange={set("signRole")} maxLength={30} /></label>
              </div>
            </>)}

            {tab === "style" && (<>
              <div className="ce-f"><span>Colour theme</span>
                <div className="ce-themes">
                  {Object.entries(THEMES).map(([k, [a, b]]) => (
                    <button type="button" key={k} title={k} aria-label={`${k} theme`} className={c.theme === k ? "on" : ""}
                      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} onClick={() => change({ theme: k })}>
                      {c.theme === k && "✓"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ce-f"><span>Font style</span>
                <div className="ce-seg">
                  {FONTS.map(([k, l]) => <button type="button" key={k} className={c.font === k ? "on" : ""} onClick={() => change({ font: k })}>{l}</button>)}
                </div>
              </div>
              <div className="ce-f"><span>Seal</span>
                <div className="ce-seg">
                  {SEALS.map(([k, l]) => <button type="button" key={k} className={c.seal === k ? "on" : ""} onClick={() => change({ seal: k })}>{l}</button>)}
                </div>
              </div>
              <div className="ce-f"><span>Logo <small>Optional · replaces the letter mark</small></span>
                <label className="ce-logo-drop">
                  <span className="ce-logo-prev">{c.logo ? <img src={c.logo} alt="Logo preview" /> : <b>{(c.org || "L").trim()[0] || "L"}</b>}</span>
                  <span className="ce-logo-txt"><b>{c.logo ? "Change logo" : "Upload your logo"}</b><small>PNG or JPG · square works best</small></span>
                  <input type="file" accept="image/*" hidden onChange={(e) => pickLogo(e.target.files?.[0])} />
                </label>
                {c.logo && <button type="button" className="ce-link" onClick={() => change({ logo: "" })}>Remove logo</button>}
              </div>
            </>)}

            {tab === "options" && (<>
              <Toggle on={c.enabled} onChange={() => change({ enabled: !c.enabled })} title="Issue certificate on pass" sub="Learners can download it after finishing the course" />
              <Toggle on={c.showDate} onChange={() => change({ showDate: !c.showDate })} title="Show completion date" />
              <Toggle on={c.showScore} onChange={() => change({ showScore: !c.showScore })} title="Show quiz score" />
              <Toggle on={c.showId} onChange={() => change({ showId: !c.showId })} title="Show certificate ID" sub="Helps you verify a certificate later" />
              <button type="button" className="ce-reset" onClick={() => setC({ ...DEFAULT_CERT })}>↺ Reset to default design</button>
            </>)}
          </div>
        </section>

        <aside className="ce-stage">
          <div className="ce-stage-top">
            <span className="ce-live"><i /> Live preview</span>
            <label className="ce-name"><small>Preview name</small><input value={sample} onChange={(e) => setSample(e.target.value)} maxLength={40} placeholder="Learner name" /></label>
          </div>
          {/* cert-live: shown on screen, and it is also what gets printed */}
          <div className="ce-desk">
            <div className="cert-print-host cert-live" key={c.layout}>
              <CertificateView cert={c} course={course} name={sample.trim() || undefined} score={92} />
            </div>
          </div>
          {!c.enabled && <p className="cert-off">Certificate is switched off, so learners will not see a download button.</p>}
        </aside>
      </div>

      {toast && <div className="ce-toast" role="status">✓ Certificate saved for this course</div>}
    </div>
  );
}