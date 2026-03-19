import React, { useState, useCallback, useRef, useLayoutEffect } from "react";
import GalleryPreview from './GalleryPreview';
import { useLocation } from "react-router-dom";

const NAV_SECTIONS = [
  { id: "personal",       label: "Personal",        icon: "👤" },
  { id: "summary",        label: "Summary",         icon: "📄" },
  { id: "experience",     label: "Experience",      icon: "💼" },
  { id: "education",      label: "Education",       icon: "🎓" },
  { id: "skills",         label: "Skills",          icon: "</>" },
  { id: "projects",       label: "Projects",        icon: "🚀" },
  { id: "certifications", label: "Certifications",  icon: "🏆" },
  { id: "languages",      label: "Languages",       icon: "Aa" },
  { id: "styling",        label: "Styling",         icon: "🎨" },
];

const AI_SUGGESTIONS = {
  summary: "Results-driven professional with 5+ years of experience delivering high-impact outcomes. Proven track record of leading cross-functional teams and shipping products on time. Passionate about clean work, strong communication, and continuous improvement.",
  experience: "Led end-to-end development of a platform that reduced deployment time by 60% and improved reliability to 99.98% uptime. Collaborated with product and design teams to ship 3 major features per quarter, contributing to a 40% increase in user retention.",
  project: "Built a real-time collaborative tool using React and WebSockets. Supports 50+ concurrent users with <100ms latency. Deployed on AWS with auto-scaling.",
  certification: "Completed advanced coursework covering architecture patterns, security best practices, and cost optimization strategies.",
};

const FONTS = ["DM Sans", "Inter", "Lato", "Merriweather", "Playfair Display", "Raleway"];
const PROFICIENCY_LEVELS = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const PRESET_COLORS = ["#1e293b","#2563eb","#059669","#dc2626","#7c3aed","#db2777","#b45309","#0f766e","#e11d48","#0f172a"];

const uid = () => Date.now() + Math.random();
const makeExp  = () => ({ id: uid(), company: "", role: "", duration: "", location: "", description: "" });
const makeProj = () => ({ id: uid(), name: "", stack: "", description: "", link: "" });
const makeCert = () => ({ id: uid(), name: "", issuer: "", date: "", description: "" });
const makeLang = () => ({ id: uid(), language: "", proficiency: "Intermediate" });
const makeSkill= () => ({ id: uid(), name: "", level: "Intermediate" });

const INIT = {
  activeSection: "personal",
  personal:       { name: "", title: "", email: "", phone: "", location: "", linkedin: "", github: "", photo: null },
  summary:        { text: "" },
  experience:     [makeExp()],
  education:      { degree: "", college: "", year: "", gpa: "" },
  skills:         [makeSkill()],
  projects:       [makeProj()],
  certifications: [makeCert()],
  languages:      [makeLang()],
  styling:        { font: "Inter", accentColor: "#2563eb" },
};

const SECTION_META = {
  personal:       { title: "Personal Information",    desc: "Your contact details and basic info" },
  summary:        { title: "Professional Summary",    desc: "A brief overview of your background" },
  experience:     { title: "Work Experience",         desc: "Your employment history" },
  education:      { title: "Education",               desc: "Your academic background" },
  skills:         { title: "Skills",                  desc: "Technical and soft skills" },
  projects:       { title: "Projects",                desc: "Notable projects you've worked on" },
  certifications: { title: "Certifications",          desc: "Professional certifications" },
  languages:      { title: "Languages",               desc: "Languages you speak" },
  styling:        { title: "Resume Styling",          desc: "Customize fonts and colors" },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;600;700&family=Raleway:wght@300;400;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;overflow:hidden;}
body{font-family:'Inter',sans-serif;background:#f0f0f0;color:#111827;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:99px;}

.topbar{height:52px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;padding:0 20px;gap:10px;position:fixed;top:0;left:0;right:0;z-index:100;}
.topbar-title{font-size:15px;font-weight:600;color:#111827;flex:1;}
.topbar-tpl-badge{display:flex;align-items:center;gap:5px;font-size:12px;background:#eff6ff;border:1px solid #bfdbfe;color:#2563eb;padding:4px 12px;border-radius:99px;font-weight:600;}
.topbar-divider{width:1px;height:24px;background:#e5e7eb;margin:0 2px;}
.zoom-controls{display:flex;align-items:center;gap:5px;}
.zoom-btn{width:28px;height:28px;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;color:#6b7280;transition:all 0.15s;line-height:1;}
.zoom-btn:hover{background:#f9fafb;}
.zoom-label{font-size:13px;font-weight:500;color:#374151;min-width:40px;text-align:center;}
.topbar-divider{width:1px;height:24px;background:#e5e7eb;margin:0 4px;}
.btn-save{display:flex;align-items:center;gap:6px;padding:7px 16px;border:1px solid #e5e7eb;border-radius:8px;background:white;font-size:13px;font-weight:500;color:#374151;cursor:pointer;font-family:inherit;transition:all 0.15s;}
.btn-save:hover{background:#f9fafb;}
.btn-download{display:flex;align-items:center;gap:6px;padding:7px 18px;border:none;border-radius:8px;background:#111827;font-size:13px;font-weight:600;color:white;cursor:pointer;font-family:inherit;}
.btn-download:hover{background:#1f2937;}

.app-layout{display:flex;height:100vh;padding-top:52px;}
.sidebar{width:68px;background:#1e293b;flex-shrink:0;display:flex;flex-direction:column;align-items:center;padding:8px 0;overflow-y:auto;height:100%;}
.nav-item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;cursor:pointer;border-radius:8px;width:58px;border:none;background:none;color:#94a3b8;font-family:inherit;transition:all 0.15s;margin-bottom:1px;}
.nav-item:hover{background:rgba(255,255,255,0.08);color:#e2e8f0;}
.nav-item.active{background:rgba(255,255,255,0.13);color:white;}
.nav-icon{font-size:17px;line-height:1;height:24px;display:flex;align-items:center;justify-content:center;}
.nav-label{font-size:9px;font-weight:500;text-align:center;line-height:1.2;}

.content-area{flex:1;display:flex;overflow:hidden;}
.form-side{width:520px;flex-shrink:0;background:#fff;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;height:100%;}
.form-header{padding:20px 24px 14px;border-bottom:1px solid #f3f4f6;flex-shrink:0;}
.form-header h2{font-size:18px;font-weight:700;color:#111827;margin-bottom:3px;}
.form-header p{font-size:13px;color:#6b7280;}
.form-body{flex:1;overflow-y:auto;padding:20px 24px;}
.form-footer{padding:12px 24px;border-top:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;background:white;}
.btn-back{display:flex;align-items:center;gap:6px;padding:8px 20px;border:1.5px solid #e5e7eb;border-radius:8px;background:white;font-size:13px;font-weight:500;color:#374151;cursor:pointer;font-family:inherit;transition:all 0.15s;}
.btn-back:hover:not(:disabled){border-color:#9ca3af;}
.btn-back:disabled{opacity:0.35;cursor:default;}
.btn-next{display:flex;align-items:center;gap:6px;padding:8px 24px;border:none;border-radius:8px;background:#111827;font-size:13px;font-weight:600;color:white;cursor:pointer;font-family:inherit;transition:background 0.15s;}
.btn-next:hover:not(:disabled){background:#1f2937;}
.btn-next:disabled{opacity:0.35;cursor:default;}

.preview-side{flex:1;background:#dde1e7;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;overflow-y:auto;overflow-x:hidden;padding:20px 0 40px;}
.preview-label{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:#6b7280;background:rgba(255,255,255,0.85);border:1px solid #e5e7eb;padding:5px 14px;border-radius:99px;margin:0 auto 14px;backdrop-filter:blur(4px);flex-shrink:0;width:fit-content;}
.preview-tpl-name{color:#1e293b;font-weight:700;}
.preview-scaler{flex-shrink:0;transform-origin:top center;}
.resume-sheet{width:595px;background:white;box-shadow:0 4px 12px rgba(0,0,0,0.15),0 20px 60px rgba(0,0,0,0.12);overflow:visible;}

.form-group{margin-bottom:14px;}
.form-label{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.form-label .opt{color:#9ca3af;font-weight:400;font-size:11px;margin-left:3px;}
.form-input{width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;font-family:inherit;color:#111827;background:white;outline:none;transition:border-color 0.15s,box-shadow 0.15s;}
.form-input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,0.1);}
.form-input::placeholder{color:#9ca3af;}
.form-textarea{min-height:85px;resize:vertical;line-height:1.55;padding-bottom:42px;}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

.ai-wrap{position:relative;}
.ai-btn{position:absolute;bottom:8px;right:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.15s;display:flex;align-items:center;gap:4px;}
.ai-btn:hover{transform:translateY(-1px);box-shadow:0 4px 10px rgba(99,102,241,0.4);}

.entry-card{background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:10px;padding:14px;margin-bottom:10px;}
.entry-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
.entry-title{font-size:12px;font-weight:600;color:#374151;}
.entry-remove{background:none;border:none;color:#ef4444;cursor:pointer;font-size:19px;padding:0 4px;line-height:1;border-radius:4px;}
.entry-remove:hover{background:#fef2f2;}
.add-btn{width:100%;padding:9px;background:white;border:1.5px dashed #d1d5db;border-radius:8px;color:#6366f1;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.15s;margin-top:3px;}
.add-btn:hover{border-color:#6366f1;background:#f5f3ff;}

.chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;min-height:30px;}
.chip{display:inline-flex;align-items:center;gap:4px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:99px;padding:3px 10px;font-size:12px;color:#2563eb;font-weight:500;}
.chip-lvl{font-size:10px;opacity:0.65;}
.chip-x{background:none;border:none;cursor:pointer;color:#93c5fd;font-size:14px;padding:0;line-height:1;transition:color 0.15s;}
.chip-x:hover{color:#ef4444;}
.skill-row{display:flex;gap:7px;}

.photo-row{display:flex;gap:14px;align-items:flex-start;margin-bottom:14px;}
.photo-circle{width:64px;height:64px;border-radius:50%;border:2px dashed #d1d5db;background:#f5f3ff;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;flex-shrink:0;font-size:20px;transition:border-color 0.15s;}
.photo-circle:hover{border-color:#6366f1;}
.photo-circle img{width:100%;height:100%;object-fit:cover;}
.photo-circle input{display:none;}

.style-label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;margin:16px 0 8px;}
.font-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
.font-opt{padding:9px 12px;border-radius:7px;border:1.5px solid #e5e7eb;cursor:pointer;font-size:13px;background:white;transition:all 0.15s;}
.font-opt:hover{border-color:#6366f1;background:#f5f3ff;}
.font-opt.on{border-color:#6366f1;background:#eff6ff;color:#4f46e5;font-weight:600;}
.color-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.swatch{width:28px;height:28px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all 0.15s;}
.swatch.on{border-color:#111827;transform:scale(1.18);}

.resume-canvas{width:100%;background:#fff;font-size:11px;line-height:1.5;color:#1e293b;display:block;}
.blank-start-inner{display:flex;align-items:center;justify-content:center;height:520px;}
`;

// ─── PREVIEW SCALER ───────────────────────────────────────────────────────────
// Renders the resume sheet at its true 595px width, then CSS-scales it down
// to fill the available panel width — preserving all font sizes and layouts.
function PreviewScaler({ sheetWidth, children }) {
  const wrapRef  = React.useRef(null);   // outer div — sets reserved height
  const innerRef = React.useRef(null);   // inner div — gets transform applied
  const [scale, setScale] = React.useState(0.6);

  React.useLayoutEffect(() => {
    const outer = wrapRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const recalc = () => {
      // Available width = parent minus padding
      const availW = outer.parentElement.clientWidth - 40;
      const s      = Math.min(1, availW / sheetWidth);
      // Inner is scaled — its visual height = natural height × scale
      const naturalH = inner.scrollHeight;
      // Reserve exactly that much space in the flow so nothing overlaps
      outer.style.height  = `${naturalH * s}px`;
      outer.style.width   = `${sheetWidth}px`;
      inner.style.transform        = `scale(${s})`;
      inner.style.transformOrigin  = 'top left';
      // Pull outer to centered position
      outer.style.marginLeft = `${(outer.parentElement.clientWidth - sheetWidth * s) / 2}px`;
    };

    // Run once after paint so scrollHeight is real
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(outer.parentElement);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [sheetWidth]);

  return (
    // Outer: reserves space in the scroll flow
    <div ref={wrapRef} style={{ flexShrink: 0, position: 'relative', overflow: 'visible' }}>
      {/* Inner: holds the true-size sheet and receives the scale transform */}
      <div ref={innerRef} style={{ position: 'absolute', top: 0, left: 0, width: sheetWidth }}>
        {children}
      </div>
    </div>
  );
}

// ─── FORM COMPONENTS ──────────────────────────────────────────────────────────

function PersonalSection({ data, onChange }) {
  const s = k => e => onChange({ ...data, [k]: e.target.value });
  const handlePhoto = e => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => onChange({ ...data, photo: ev.target.result });
    r.readAsDataURL(f);
  };
  return (
    <div>
      <div className="photo-row">
        <label className="photo-circle">
          {data.photo ? <img src={data.photo} alt="" /> : "📷"}
          <input type="file" accept="image/*" onChange={handlePhoto} />
        </label>
        <div style={{ flex: 1 }}>
          <div className="form-group"><label className="form-label">Full Name</label>
            <input className="form-input" placeholder="M. Senthil Kumar" value={data.name} onChange={s("name")} /></div>
          <div className="form-group"><label className="form-label">Job Title</label>
            <input className="form-input" placeholder="Senior Software Engineer" value={data.title} onChange={s("title")} /></div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@email.com" value={data.email} onChange={s("email")} /></div>
        <div className="form-group"><label className="form-label">Phone</label>
          <input className="form-input" placeholder="+91 98765 43210" value={data.phone} onChange={s("phone")} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Location</label>
          <input className="form-input" placeholder="Chennai, Tamil Nadu" value={data.location} onChange={s("location")} /></div>
        <div className="form-group"><label className="form-label">LinkedIn</label>
          <input className="form-input" placeholder="linkedin.com/in/you" value={data.linkedin} onChange={s("linkedin")} /></div>
      </div>
      <div className="form-group"><label className="form-label">GitHub <span className="opt">(optional)</span></label>
        <input className="form-input" placeholder="github.com/you" value={data.github} onChange={s("github")} /></div>
    </div>
  );
}

function SummarySection({ data, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">Professional Summary</label>
      <div className="ai-wrap">
        <textarea className="form-input form-textarea" style={{ minHeight: 130 }}
          placeholder="Write a 2–3 sentence overview of your background and goals…"
          value={data.text} onChange={e => onChange({ ...data, text: e.target.value })} />
        <button className="ai-btn" onClick={() => onChange({ ...data, text: AI_SUGGESTIONS.summary })}>✨ AI Suggest</button>
      </div>
    </div>
  );
}

function ExperienceSection({ data, onChange }) {
  const upd = (id, k, v) => onChange(data.map(e => e.id === id ? { ...e, [k]: v } : e));
  const rem = id => onChange(data.filter(e => e.id !== id));
  return (
    <div>
      {data.map((exp, i) => (
        <div key={exp.id} className="entry-card">
          <div className="entry-head">
            <span className="entry-title">Position {i + 1}</span>
            {data.length > 1 && <button className="entry-remove" onClick={() => rem(exp.id)}>×</button>}
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Company</label>
              <input className="form-input" placeholder="Zoho Corporation" value={exp.company} onChange={e => upd(exp.id, "company", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Role / Title</label>
              <input className="form-input" placeholder="Lead Developer" value={exp.role} onChange={e => upd(exp.id, "role", e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Duration</label>
              <input className="form-input" placeholder="2019 – Present" value={exp.duration} onChange={e => upd(exp.id, "duration", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Location</label>
              <input className="form-input" placeholder="Chennai / Remote" value={exp.location} onChange={e => upd(exp.id, "location", e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label>
            <div className="ai-wrap">
              <textarea className="form-input form-textarea" placeholder="Key responsibilities and achievements…"
                value={exp.description} onChange={e => upd(exp.id, "description", e.target.value)} />
              <button className="ai-btn" onClick={() => upd(exp.id, "description", AI_SUGGESTIONS.experience)}>✨ AI Suggest</button>
            </div>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={() => onChange([...data, makeExp()])}>+ Add Another Position</button>
    </div>
  );
}

function EducationSection({ data, onChange }) {
  const s = k => e => onChange({ ...data, [k]: e.target.value });
  return (
    <div>
      <div className="form-group"><label className="form-label">Institution</label>
        <input className="form-input" placeholder="Anna University" value={data.college} onChange={s("college")} /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Degree</label>
          <input className="form-input" placeholder="B.E. Computer Science" value={data.degree} onChange={s("degree")} /></div>
        <div className="form-group"><label className="form-label">Year</label>
          <input className="form-input" placeholder="2022" value={data.year} onChange={s("year")} /></div>
      </div>
      <div className="form-group"><label className="form-label">GPA <span className="opt">(optional)</span></label>
        <input className="form-input" placeholder="8.5 / 10" value={data.gpa} onChange={s("gpa")} /></div>
    </div>
  );
}

function SkillsSection({ data, onChange }) {
  const [ns, setNs] = useState(""); const [nl, setNl] = useState("Intermediate");
  const add = () => { if (!ns.trim()) return; onChange([...data, { id: uid(), name: ns.trim(), level: nl }]); setNs(""); };
  return (
    <div>
      <div className="chips">
        {data.filter(s => s.name).map(s => (
          <div key={s.id} className="chip">{s.name}
            <span className="chip-lvl">· {s.level}</span>
            <button className="chip-x" onClick={() => onChange(data.filter(x => x.id !== s.id))}>×</button>
          </div>
        ))}
        {data.every(s => !s.name) && <span style={{ fontSize: 12, color: "#9ca3af" }}>Add skills below…</span>}
      </div>
      <div className="skill-row">
        <input className="form-input" style={{ flex: 1 }} placeholder="React.js, Node.js, AWS…"
          value={ns} onChange={e => setNs(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
        <select className="form-input" style={{ width: 135 }} value={nl} onChange={e => setNl(e.target.value)}>
          {SKILL_LEVELS.map(l => <option key={l}>{l}</option>)}
        </select>
        <button className="btn-next" style={{ borderRadius: 7, padding: "8px 14px", flexShrink: 0 }} onClick={add}>Add</button>
      </div>
    </div>
  );
}

function ProjectsSection({ data, onChange }) {
  const upd = (id, k, v) => onChange(data.map(p => p.id === id ? { ...p, [k]: v } : p));
  const rem = id => onChange(data.filter(p => p.id !== id));
  return (
    <div>
      {data.map((p, i) => (
        <div key={p.id} className="entry-card">
          <div className="entry-head">
            <span className="entry-title">Project {i + 1}</span>
            {data.length > 1 && <button className="entry-remove" onClick={() => rem(p.id)}>×</button>}
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Project Name</label>
              <input className="form-input" placeholder="SaaS Dashboard" value={p.name} onChange={e => upd(p.id, "name", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Tech Stack</label>
              <input className="form-input" placeholder="React, Node.js, AWS" value={p.stack} onChange={e => upd(p.id, "stack", e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label>
            <div className="ai-wrap">
              <textarea className="form-input form-textarea" placeholder="What you built and outcomes…"
                value={p.description} onChange={e => upd(p.id, "description", e.target.value)} />
              <button className="ai-btn" onClick={() => upd(p.id, "description", AI_SUGGESTIONS.project)}>✨ AI Suggest</button>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Link <span className="opt">(optional)</span></label>
            <input className="form-input" placeholder="github.com/you/project" value={p.link} onChange={e => upd(p.id, "link", e.target.value)} /></div>
        </div>
      ))}
      <button className="add-btn" onClick={() => onChange([...data, makeProj()])}>+ Add Another Project</button>
    </div>
  );
}

function CertificationsSection({ data, onChange }) {
  const upd = (id, k, v) => onChange(data.map(c => c.id === id ? { ...c, [k]: v } : c));
  const rem = id => onChange(data.filter(c => c.id !== id));
  return (
    <div>
      {data.map((c, i) => (
        <div key={c.id} className="entry-card">
          <div className="entry-head">
            <span className="entry-title">Certification {i + 1}</span>
            {data.length > 1 && <button className="entry-remove" onClick={() => rem(c.id)}>×</button>}
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Certificate Name</label>
              <input className="form-input" placeholder="AWS Solutions Architect" value={c.name} onChange={e => upd(c.id, "name", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Issuing Body</label>
              <input className="form-input" placeholder="Amazon Web Services" value={c.issuer} onChange={e => upd(c.id, "issuer", e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Date</label>
            <input className="form-input" placeholder="March 2024" value={c.date} onChange={e => upd(c.id, "date", e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Description <span className="opt">(optional)</span></label>
            <div className="ai-wrap">
              <textarea className="form-input form-textarea" placeholder="What this certification covers…"
                value={c.description} onChange={e => upd(c.id, "description", e.target.value)} />
              <button className="ai-btn" onClick={() => upd(c.id, "description", AI_SUGGESTIONS.certification)}>✨ AI Suggest</button>
            </div>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={() => onChange([...data, makeCert()])}>+ Add Another Certification</button>
    </div>
  );
}

function LanguagesSection({ data, onChange }) {
  const upd = (id, k, v) => onChange(data.map(l => l.id === id ? { ...l, [k]: v } : l));
  const rem = id => onChange(data.filter(l => l.id !== id));
  return (
    <div>
      {data.map((l, i) => (
        <div key={l.id} className="entry-card">
          <div className="entry-head">
            <span className="entry-title">Language {i + 1}</span>
            {data.length > 1 && <button className="entry-remove" onClick={() => rem(l.id)}>×</button>}
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Language</label>
              <input className="form-input" placeholder="Tamil" value={l.language} onChange={e => upd(l.id, "language", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Proficiency</label>
              <select className="form-input" value={l.proficiency} onChange={e => upd(l.id, "proficiency", e.target.value)}>
                {PROFICIENCY_LEVELS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={() => onChange([...data, makeLang()])}>+ Add Another Language</button>
    </div>
  );
}

function StylingSection({ data, onChange }) {
  const s = k => v => onChange({ ...data, [k]: v });
  return (
    <div>
      <div className="style-label">Font Family</div>
      <div className="font-grid">
        {FONTS.map(f => (
          <div key={f} className={`font-opt ${data.font === f ? "on" : ""}`}
            style={{ fontFamily: `'${f}',sans-serif` }} onClick={() => s("font")(f)}>{f}</div>
        ))}
      </div>
      <div className="style-label">Accent Color</div>
      <div className="color-row">
        {PRESET_COLORS.map(c => (
          <div key={c} className={`swatch ${data.accentColor === c ? "on" : ""}`}
            style={{ background: c }} onClick={() => s("accentColor")(c)} />
        ))}
        <input type="color" value={data.accentColor}
          onChange={e => s("accentColor")(e.target.value)}
          style={{ width: 30, height: 30, border: "none", borderRadius: "50%", cursor: "pointer", padding: 0 }} />
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function ResumeBuilder() {
  const location        = useLocation();
  const galleryTemplate = location.state?.template || null;
  const galleryColor    = location.state?.selectedColor || null;

  const [st, setSt] = useState(() => ({
    ...INIT,
    styling: { ...INIT.styling, accentColor: galleryColor || INIT.styling.accentColor },
  }));

  const sec     = useCallback(id => setSt(s => ({ ...s, activeSection: id })), []);
  const setFld  = useCallback((k, v) => setSt(s => ({ ...s, [k]: v })), []);
  const idx  = NAV_SECTIONS.findIndex(n => n.id === st.activeSection);
  const meta = SECTION_META[st.activeSection];

  const renderForm = () => {
    switch (st.activeSection) {
      case "personal":       return <PersonalSection       data={st.personal}       onChange={v => setFld("personal", v)} />;
      case "summary":        return <SummarySection        data={st.summary}        onChange={v => setFld("summary", v)} />;
      case "experience":     return <ExperienceSection     data={st.experience}     onChange={v => setFld("experience", v)} />;
      case "education":      return <EducationSection      data={st.education}      onChange={v => setFld("education", v)} />;
      case "skills":         return <SkillsSection         data={st.skills}         onChange={v => setFld("skills", v)} />;
      case "projects":       return <ProjectsSection       data={st.projects}       onChange={v => setFld("projects", v)} />;
      case "certifications": return <CertificationsSection data={st.certifications} onChange={v => setFld("certifications", v)} />;
      case "languages":      return <LanguagesSection      data={st.languages}      onChange={v => setFld("languages", v)} />;
      case "styling":        return <StylingSection        data={st.styling}        onChange={v => setFld("styling", v)} />;
      default:               return null;
    }
  };

  const activeColor = st.styling.accentColor;

  // Always render at true A4 width (595px), scale to fit the panel via CSS transform
  const SHEET_W = 595;

  return (
    <>
      <style>{css}</style>
      <div className="topbar">
        <span className="topbar-title">Resume Builder</span>
        <span className="topbar-tpl-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="14" y2="12"/><line x1="8" y1="16" x2="11" y2="16"/></svg>
          {galleryTemplate ? galleryTemplate.name : 'Bold Two-Column'}
        </span>
        <div className="topbar-divider" />
        <button className="btn-save">💾 Save</button>
        <button className="btn-download">⬇ Download PDF</button>
      </div>

      <div className="app-layout">
        <aside className="sidebar">
          {NAV_SECTIONS.map(n => (
            <button key={n.id}
              className={`nav-item ${st.activeSection === n.id ? "active" : ""}`}
              onClick={() => sec(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </aside>

        <div className="content-area">
          <div className="form-side">
            <div className="form-header">
              <h2>{meta.title}</h2>
              <p>{meta.desc}</p>
            </div>
            <div className="form-body">{renderForm()}</div>
            <div className="form-footer">
              <button className="btn-back" disabled={idx === 0} onClick={() => sec(NAV_SECTIONS[idx - 1].id)}>‹ Back</button>
              <button className="btn-next" disabled={idx === NAV_SECTIONS.length - 1} onClick={() => sec(NAV_SECTIONS[idx + 1].id)}>Next ›</button>
            </div>
          </div>

          <div className="preview-side">
            {/* Live Preview label — always visible at top */}
            <div className="preview-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="14" y2="12"/><line x1="8" y1="16" x2="11" y2="16"/></svg>
              Live Preview
              {galleryTemplate && <span className="preview-tpl-name">— {galleryTemplate.name}</span>}
            </div>
            {/* Resume sheet — scaled to fit panel, scrollable */}
            <PreviewScaler sheetWidth={SHEET_W}>
              <div className="resume-sheet">
                <GalleryPreview
                  tpl={galleryTemplate || { id: 6, name: 'Bold Two-Column', structure: 'bold-two-col' }}
                  data={{
                    personal:       st.personal,
                    summary:        st.summary,
                    experience:     st.experience,
                    education:      st.education,
                    skills:         st.skills,
                    projects:       st.projects,
                    certifications: st.certifications,
                    languages:      st.languages,
                  }}
                  accentColor={activeColor}
                  font={st.styling.font}
                />
              </div>
            </PreviewScaler>
          </div>
        </div>
      </div>
    </>
  );
}
