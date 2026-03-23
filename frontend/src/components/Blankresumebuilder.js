import React, { useState, useRef, useLayoutEffect } from "react";

// ─── SECTION ORDER (drag-droppable) ──────────────────────────────────────────
const ALL_SECTIONS = [
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

const PREVIEW_SECTIONS = ["summary","experience","education","skills","projects","certifications","languages"];

const AI_SUGGESTIONS = {
  summary: "Results-driven professional with 5+ years of experience delivering high-impact outcomes. Proven track record of leading cross-functional teams and shipping products on time. Passionate about clean work, strong communication, and continuous improvement.",
  experience: "Led end-to-end development of a platform that reduced deployment time by 60% and improved reliability to 99.98% uptime. Collaborated with product and design teams to ship 3 major features per quarter.",
  project: "Built a real-time collaborative tool using React and WebSockets. Supports 50+ concurrent users with <100ms latency. Deployed on AWS with auto-scaling.",
  certification: "Completed advanced coursework covering architecture patterns, security best practices, and cost optimization strategies.",
};

const FONTS = ["DM Sans","Inter","Lato","Merriweather","Playfair Display","Raleway"];
const PROFICIENCY_LEVELS = ["Native","Fluent","Advanced","Intermediate","Basic"];
const SKILL_LEVELS = ["Beginner","Intermediate","Advanced","Expert"];
const PRESET_COLORS = ["#1e293b","#2563eb","#059669","#dc2626","#7c3aed","#db2777","#b45309","#0f766e","#e11d48","#0f172a"];

const uid = () => Date.now() + Math.random();
const makeExp  = () => ({ id: uid(), company:"", role:"", duration:"", location:"", description:"" });
const makeProj = () => ({ id: uid(), name:"", stack:"", description:"", link:"" });
const makeCert = () => ({ id: uid(), name:"", issuer:"", date:"", description:"" });
const makeLang = () => ({ id: uid(), language:"", proficiency:"Intermediate" });
const makeSkill= () => ({ id: uid(), name:"", level:"Intermediate" });

const INIT = {
  activeSection: "personal",
  personal: { name:"", title:"", email:"", phone:"", location:"", linkedin:"", github:"", photo:null },
  summary: { text:"" },
  experience: [makeExp()],
  education: { degree:"", college:"", year:"", gpa:"" },
  skills: [makeSkill()],
  projects: [makeProj()],
  certifications: [makeCert()],
  languages: [makeLang()],
  styling: { font:"Inter", accentColor:"#2563eb" },
};

const SECTION_META = {
  personal:       { title:"Personal Information",   desc:"Your contact details and basic info" },
  summary:        { title:"Professional Summary",   desc:"A brief overview of your background" },
  experience:     { title:"Work Experience",        desc:"Your employment history" },
  education:      { title:"Education",              desc:"Your academic background" },
  skills:         { title:"Skills",                 desc:"Technical and soft skills" },
  projects:       { title:"Projects",               desc:"Notable projects you've worked on" },
  certifications: { title:"Certifications",         desc:"Professional certifications" },
  languages:      { title:"Languages",              desc:"Languages you speak" },
  styling:        { title:"Resume Styling",         desc:"Customize fonts and colors" },
};

// ─── BLANK PAGE HEIGHT (A4 preview) ──────────────────────────────────────────
const BLANK_PAGE_HEIGHT = 841; // px — A4 proportional to 595px width

// ─── CSS ─────────────────────────────────────────────────────────────────────
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
.topbar-divider{width:1px;height:24px;background:#e5e7eb;margin:0 4px;}
.btn-save{display:flex;align-items:center;gap:6px;padding:7px 16px;border:1px solid #e5e7eb;border-radius:8px;background:white;font-size:13px;font-weight:500;color:#374151;cursor:pointer;font-family:inherit;transition:all .15s;}
.btn-save:hover{background:#f9fafb;}
.btn-download{display:flex;align-items:center;gap:6px;padding:7px 18px;border:none;border-radius:8px;background:#111827;font-size:13px;font-weight:600;color:white;cursor:pointer;font-family:inherit;}
.btn-download:hover{background:#1f2937;}
.btn-add-page{display:flex;align-items:center;gap:5px;padding:6px 13px;border:1.5px dashed #6366f1;border-radius:8px;background:transparent;font-size:12px;font-weight:600;color:#6366f1;cursor:pointer;font-family:inherit;transition:all .15s;}
.btn-add-page:hover{background:#f5f3ff;}

.app-layout{display:flex;height:100vh;padding-top:52px;}
.sidebar{width:68px;background:#1e293b;flex-shrink:0;display:flex;flex-direction:column;align-items:center;padding:8px 0;overflow-y:auto;height:100%;}
.nav-item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;cursor:pointer;border-radius:8px;width:58px;border:none;background:none;color:#94a3b8;font-family:inherit;transition:all .15s;margin-bottom:1px;}
.nav-item:hover{background:rgba(255,255,255,.08);color:#e2e8f0;}
.nav-item.active{background:rgba(255,255,255,.13);color:white;}
.nav-icon{font-size:17px;line-height:1;height:24px;display:flex;align-items:center;justify-content:center;}
.nav-label{font-size:9px;font-weight:500;text-align:center;line-height:1.2;}

.content-area{flex:1;display:flex;overflow:hidden;}

.form-side{width:520px;flex-shrink:0;background:#fff;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;height:100%;}
.form-header{padding:20px 24px 14px;border-bottom:1px solid #f3f4f6;flex-shrink:0;}
.form-header h2{font-size:18px;font-weight:700;color:#111827;margin-bottom:3px;}
.form-header p{font-size:13px;color:#6b7280;}
.form-body{flex:1;overflow-y:auto;padding:20px 24px;}
.form-footer{padding:12px 24px;border-top:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;background:white;}
.btn-back{display:flex;align-items:center;gap:6px;padding:8px 20px;border:1.5px solid #e5e7eb;border-radius:8px;background:white;font-size:13px;font-weight:500;color:#374151;cursor:pointer;font-family:inherit;transition:all .15s;}
.btn-back:hover:not(:disabled){border-color:#9ca3af;}
.btn-back:disabled{opacity:.35;cursor:default;}
.btn-next{display:flex;align-items:center;gap:6px;padding:8px 24px;border:none;border-radius:8px;background:#111827;font-size:13px;font-weight:600;color:white;cursor:pointer;font-family:inherit;}
.btn-next:disabled{opacity:.35;cursor:default;}

.form-group{margin-bottom:14px;}
.form-label{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.form-label .opt{color:#9ca3af;font-weight:400;font-size:11px;margin-left:3px;}
.form-input{width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;font-family:inherit;color:#111827;background:white;outline:none;transition:border-color .15s,box-shadow .15s;}
.form-input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1);}
.form-input::placeholder{color:#9ca3af;}
.form-textarea{min-height:85px;resize:vertical;line-height:1.55;padding-bottom:42px;}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.ai-wrap{position:relative;}
.ai-btn{position:absolute;bottom:8px;right:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px;}
.ai-btn:hover{transform:translateY(-1px);box-shadow:0 4px 10px rgba(99,102,241,.4);}
.entry-card{background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:10px;padding:14px;margin-bottom:10px;}
.entry-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
.entry-title{font-size:12px;font-weight:600;color:#374151;}
.entry-remove{background:none;border:none;color:#ef4444;cursor:pointer;font-size:19px;padding:0 4px;line-height:1;border-radius:4px;}
.entry-remove:hover{background:#fef2f2;}
.add-btn{width:100%;padding:9px;background:white;border:1.5px dashed #d1d5db;border-radius:8px;color:#6366f1;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s;margin-top:3px;}
.add-btn:hover{border-color:#6366f1;background:#f5f3ff;}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;min-height:30px;}
.chip{display:inline-flex;align-items:center;gap:4px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:99px;padding:3px 10px;font-size:12px;color:#2563eb;font-weight:500;}
.chip-lvl{font-size:10px;opacity:.65;}
.chip-x{background:none;border:none;cursor:pointer;color:#93c5fd;font-size:14px;padding:0;line-height:1;}
.chip-x:hover{color:#ef4444;}
.skill-row{display:flex;gap:7px;}
.photo-row{display:flex;gap:14px;align-items:flex-start;margin-bottom:14px;}
.photo-circle{width:64px;height:64px;border-radius:50%;border:2px dashed #d1d5db;background:#f5f3ff;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;flex-shrink:0;font-size:20px;}
.photo-circle:hover{border-color:#6366f1;}
.photo-circle img{width:100%;height:100%;object-fit:cover;}
.photo-circle input{display:none;}
.style-label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;margin:16px 0 8px;}
.font-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
.font-opt{padding:9px 12px;border-radius:7px;border:1.5px solid #e5e7eb;cursor:pointer;font-size:13px;background:white;transition:all .15s;}
.font-opt:hover{border-color:#6366f1;background:#f5f3ff;}
.font-opt.on{border-color:#6366f1;background:#eff6ff;color:#4f46e5;font-weight:600;}
.color-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.swatch{width:28px;height:28px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all .15s;}
.swatch.on{border-color:#111827;transform:scale(1.18);}

.preview-side{flex:1;background:#dde1e7;display:flex;flex-direction:column;align-items:stretch;overflow-y:auto;overflow-x:hidden;padding:20px 0 40px;}
.preview-topbar{display:flex;align-items:center;justify-content:space-between;padding:0 20px;margin-bottom:14px;flex-shrink:0;}
.preview-label{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:#6b7280;background:rgba(255,255,255,.85);border:1px solid #e5e7eb;padding:5px 14px;border-radius:99px;backdrop-filter:blur(4px);}
.preview-hint{font-size:11px;color:#94a3b8;display:flex;align-items:center;gap:4px;}

.page-wrap{display:flex;flex-direction:column;align-items:center;gap:16px;padding:0 20px;}
.page-number{font-size:10px;color:#94a3b8;text-align:center;margin-top:4px;}

.resume-sheet{width:595px;background:white;box-shadow:0 4px 12px rgba(0,0,0,.15),0 20px 60px rgba(0,0,0,.12);position:relative;}

/* ── Blank page: fixed A4 height, pure white ── */
.blank-page{
  width: 595px;
  height: ${BLANK_PAGE_HEIGHT}px;
  background: #fff;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}
.blank-page-num{
  padding: 10px 16px;
  font-size: 10px;
  color: #e5e7eb;
  font-family: sans-serif;
  user-select: none;
}

.drag-handle{position:absolute;left:-28px;top:50%;transform:translateY(-50%);width:20px;height:28px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.3);border-radius:5px;cursor:grab;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;opacity:0;transition:opacity .2s;}
.drag-handle:active{cursor:grabbing;}
.drag-handle span{width:10px;height:1.5px;background:#6366f1;border-radius:1px;display:block;}
.draggable-section{position:relative;}
.draggable-section:hover .drag-handle{opacity:1;}
.draggable-section.drag-over{outline:2px dashed #6366f1;outline-offset:2px;background:#f5f3ff22;}
.draggable-section.dragging{opacity:.4;}

.add-page-btn{width:595px;height:60px;border:2px dashed #94a3b8;border-radius:8px;background:rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:600;color:#64748b;cursor:pointer;transition:all .2s;margin-top:8px;}
.add-page-btn:hover{border-color:#6366f1;color:#6366f1;background:rgba(99,102,241,.05);}

.blank-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:500px;gap:8px;color:#cbd5e1;}
.blank-placeholder-icon{font-size:48px;opacity:.4;}
.blank-placeholder-text{font-size:14px;font-weight:600;opacity:.6;}
.blank-placeholder-sub{font-size:11px;opacity:.4;}
`;

// ─── FORM SECTIONS ────────────────────────────────────────────────────────────

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
            <input className="form-input" placeholder="Your Full Name" value={data.name} onChange={s("name")} /></div>
          <div className="form-group"><label className="form-label">Job Title</label>
            <input className="form-input" placeholder="Your Job Title" value={data.title} onChange={s("title")} /></div>
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
          <input className="form-input" placeholder="City, State" value={data.location} onChange={s("location")} /></div>
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
              <input className="form-input" placeholder="Company Name" value={exp.company} onChange={e => upd(exp.id, "company", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Role</label>
              <input className="form-input" placeholder="Your Role" value={exp.role} onChange={e => upd(exp.id, "role", e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Duration</label>
              <input className="form-input" placeholder="2021 – Present" value={exp.duration} onChange={e => upd(exp.id, "duration", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Location</label>
              <input className="form-input" placeholder="City / Remote" value={exp.location} onChange={e => upd(exp.id, "location", e.target.value)} /></div>
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
        <input className="form-input" placeholder="University / College" value={data.college} onChange={s("college")} /></div>
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
        <button className="btn-next" style={{ borderRadius: 7, padding: "8px 14px" }} onClick={add}>Add</button>
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
              <input className="form-input" placeholder="Project Name" value={p.name} onChange={e => upd(p.id, "name", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Tech Stack</label>
              <input className="form-input" placeholder="React, Node, AWS" value={p.stack} onChange={e => upd(p.id, "stack", e.target.value)} /></div>
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
              <textarea className="form-input form-textarea" placeholder="What this covers…"
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

// ─── BLANK RESUME LIVE PREVIEW (Page 1 content only) ─────────────────────────
function BlankResumePreview({ data, accentColor, font, sectionOrder, onReorder }) {
  const col = accentColor || "#2563eb";
  const fontStyle = { fontFamily: `'${font}', sans-serif` };
  const { personal, summary, experience, education, skills, projects, certifications, languages } = data;

  const dragItem = useRef(null);
  const dragOver = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const handleDragStart = (e, id) => { dragItem.current = id; setDragging(id); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver  = (e, id) => { e.preventDefault(); dragOver.current = id; setDragOverId(id); };
  const handleDrop = (e, id) => {
    e.preventDefault();
    if (dragItem.current === id) { setDragging(null); setDragOverId(null); return; }
    const order = [...sectionOrder];
    const from = order.indexOf(dragItem.current);
    const to   = order.indexOf(id);
    if (from === -1 || to === -1) return;
    order.splice(from, 1);
    order.splice(to, 0, dragItem.current);
    onReorder(order);
    setDragging(null); setDragOverId(null);
  };
  const handleDragEnd = () => { setDragging(null); setDragOverId(null); };

  const name  = personal.name  || "";
  const title = personal.title || "";
  const hasHeader = name || title || personal.email || personal.phone;

  const SectionTitle = ({ label }) => (
    <div style={{ borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>
      <h2 style={{ fontSize: 10, fontWeight: 800, color: col, textTransform: "uppercase", letterSpacing: 0.5, margin: 0 }}>{label}</h2>
    </div>
  );

  const renderSection = (sectionId) => {
    switch (sectionId) {
      case "summary":
        if (!summary.text) return null;
        return (
          <div style={{ marginBottom: 10 }}>
            <SectionTitle label="Professional Summary" />
            <p style={{ fontSize: 8.5, color: "#333", lineHeight: 1.65 }}>{summary.text}</p>
          </div>
        );
      case "experience":
        if (experience.every(e => !e.company && !e.role)) return null;
        return (
          <div style={{ marginBottom: 10 }}>
            <SectionTitle label="Work Experience" />
            {experience.filter(e => e.company || e.role).map(e => (
              <div key={e.id} style={{ marginBottom: 9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: 9 }}>{e.role}{e.company ? `, ${e.company}` : ""}</strong>
                  <span style={{ fontSize: 8, color: "#888", whiteSpace: "nowrap" }}>{e.duration}</span>
                </div>
                {e.location && <p style={{ fontSize: 8, color: "#777" }}>{e.location}</p>}
                {e.description && e.description.split("\n").filter(Boolean).map((l, i) => (
                  <p key={i} style={{ fontSize: 8.5, color: "#333", paddingLeft: 8, marginTop: 2 }}>• {l}</p>
                ))}
              </div>
            ))}
          </div>
        );
      case "education":
        if (!education.degree && !education.college) return null;
        return (
          <div style={{ marginBottom: 10 }}>
            <SectionTitle label="Education" />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong style={{ fontSize: 9 }}>{education.degree}</strong>
              <span style={{ fontSize: 8, color: "#555" }}>{education.year}</span>
            </div>
            {education.college && <p style={{ fontSize: 8.5, color: "#555", fontStyle: "italic" }}>{education.college}</p>}
            {education.gpa && <p style={{ fontSize: 8, color: "#777" }}>GPA: {education.gpa}</p>}
          </div>
        );
      case "skills":
        if (!skills.some(s => s.name)) return null;
        return (
          <div style={{ marginBottom: 10 }}>
            <SectionTitle label="Skills" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "3px 12px" }}>
              {skills.filter(s => s.name).map(s => (
                <p key={s.id} style={{ fontSize: 8.5, color: "#333" }}>• {s.name}</p>
              ))}
            </div>
          </div>
        );
      case "projects":
        if (!projects.some(p => p.name)) return null;
        return (
          <div style={{ marginBottom: 10 }}>
            <SectionTitle label="Projects" />
            {projects.filter(p => p.name).map(p => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: 9 }}>{p.name}</strong>
                  {p.stack && <span style={{ fontSize: 8, color: "#888" }}>{p.stack}</span>}
                </div>
                {p.description && p.description.split("\n").filter(Boolean).map((l, i) => (
                  <p key={i} style={{ fontSize: 8.5, color: "#333", paddingLeft: 8, marginTop: 2 }}>• {l}</p>
                ))}
                {p.link && <p style={{ fontSize: 8, color: col, marginTop: 2 }}>🔗 {p.link}</p>}
              </div>
            ))}
          </div>
        );
      case "certifications":
        if (!certifications.some(c => c.name)) return null;
        return (
          <div style={{ marginBottom: 10 }}>
            <SectionTitle label="Certifications" />
            {certifications.filter(c => c.name).map(c => (
              <div key={c.id} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 9 }}>{c.name}</strong>
                  {c.date && <span style={{ fontSize: 8, color: "#888" }}>{c.date}</span>}
                </div>
                {c.issuer && <p style={{ fontSize: 8.5, color: "#555", fontStyle: "italic" }}>{c.issuer}</p>}
              </div>
            ))}
          </div>
        );
      case "languages":
        if (!languages.some(l => l.language)) return null;
        return (
          <div style={{ marginBottom: 10 }}>
            <SectionTitle label="Languages" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
              {languages.filter(l => l.language).map(l => (
                <p key={l.id} style={{ fontSize: 8.5, color: "#333" }}>
                  <strong>{l.language}</strong> — {l.proficiency}
                </p>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  const hasAnySection = sectionOrder.some(s => renderSection(s) !== null);

  return (
    <div style={{ ...fontStyle, background: "#fff", padding: "20px 22px", minHeight: 500 }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: hasHeader ? 14 : 0 }}>
        {name  && <h1 style={{ fontSize: 22, fontWeight: 900, color: "#111", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>{name}</h1>}
        {title && <h2 style={{ fontSize: 13, fontWeight: 600, color: col, margin: "3px 0 6px" }}>{title}</h2>}
        {(personal.email || personal.phone || personal.location || personal.linkedin) && (
          <p style={{ fontSize: 8.5, color: "#555" }}>
            {[personal.location, personal.phone, personal.email, personal.linkedin && `linkedin: ${personal.linkedin}`].filter(Boolean).join(" | ")}
          </p>
        )}
        {hasHeader && <div style={{ height: 2, background: col, margin: "10px 0 0" }} />}
      </div>

      {/* ── Placeholder ── */}
      {!hasHeader && !hasAnySection ? (
        <div className="blank-placeholder">
          <div className="blank-placeholder-icon">📝</div>
          <div className="blank-placeholder-text">Start filling your details</div>
          <div className="blank-placeholder-sub">Your resume will appear here as you type</div>
        </div>
      ) : (
        <div style={{ marginTop: hasHeader ? 10 : 0 }}>
          {sectionOrder.map(sectionId => {
            const content = renderSection(sectionId);
            if (!content) return null;
            return (
              <div
                key={sectionId}
                className={`draggable-section${dragging === sectionId ? " dragging" : ""}${dragOverId === sectionId ? " drag-over" : ""}`}
                draggable
                onDragStart={e => handleDragStart(e, sectionId)}
                onDragOver={e => handleDragOver(e, sectionId)}
                onDrop={e => handleDrop(e, sectionId)}
                onDragEnd={handleDragEnd}
                style={{ position: "relative" }}
              >
                <div className="drag-handle" title="Drag to reorder"><span /><span /><span /></div>
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PREVIEW SCALER (content page only) ──────────────────────────────────────
function ContentPageScaler({ children, parentRef }) {
  const wrapRef  = useRef(null);
  const innerRef = useRef(null);

  useLayoutEffect(() => {
    const outer = wrapRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const recalc = () => {
      const parent = parentRef?.current || outer.parentElement;
      const availW = parent.clientWidth - 80;
      const s = Math.min(1, availW / 595);
      const naturalH = inner.scrollHeight;
      outer.style.height = `${naturalH * s}px`;
      outer.style.width  = `${595 * s}px`;
      inner.style.transform = `scale(${s})`;
      inner.style.transformOrigin = "top left";
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(inner);
    if (parentRef?.current) ro.observe(parentRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", flexShrink: 0 }}>
      <div ref={innerRef} style={{ position: "absolute", top: 0, left: 0, width: 595 }}>
        {children}
      </div>
    </div>
  );
}

// ─── BLANK PAGE SCALER (fixed A4 height, no ResizeObserver needed) ────────────
function BlankPageScaler({ pageNumber, parentRef }) {
  const wrapRef = useRef(null);

  useLayoutEffect(() => {
    const outer = wrapRef.current;
    if (!outer) return;
    const recalc = () => {
      const parent = parentRef?.current || outer.parentElement;
      const availW = parent.clientWidth - 80;
      const s = Math.min(1, availW / 595);
      outer.style.height = `${BLANK_PAGE_HEIGHT * s}px`;
      outer.style.width  = `${595 * s}px`;
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    if (parentRef?.current) ro.observe(parentRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", flexShrink: 0 }}>
      {/* The blank sheet itself — not scaled, just sized via the wrapper */}
      <div
        className="resume-sheet blank-page"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <span className="blank-page-num">{pageNumber}</span>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BlankResumeBuilder() {
  const [st, setSt]                   = useState({ ...INIT });
  const [sectionOrder, setSectionOrder] = useState([...PREVIEW_SECTIONS]);
  const [pages, setPages]             = useState([{ id: uid() }]);
  const previewRef                    = useRef(null);

  const sec    = id => setSt(s => ({ ...s, activeSection: id }));
  const setFld = (k, v) => setSt(s => ({ ...s, [k]: v }));

  const idx  = ALL_SECTIONS.findIndex(n => n.id === st.activeSection);
  const meta = SECTION_META[st.activeSection];

  const addPage    = () => setPages(p => [...p, { id: uid() }]);
  const removePage = id => { if (pages.length === 1) return; setPages(p => p.filter(x => x.id !== id)); };

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
      default: return null;
    }
  };

  const accentColor = st.styling.accentColor;
  const font        = st.styling.font;
  const resumeData  = {
    personal: st.personal, summary: st.summary, experience: st.experience,
    education: st.education, skills: st.skills, projects: st.projects,
    certifications: st.certifications, languages: st.languages,
  };

  return (
    <>
      <style>{css}</style>

      {/* ── Topbar ── */}
      <div className="topbar">
        <span className="topbar-title">Resume Builder</span>
        <span className="topbar-tpl-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="14" y2="12"/><line x1="8" y1="16" x2="11" y2="16"/></svg>
          Blank Resume
        </span>
        <div className="topbar-divider" />
        <button className="btn-add-page" onClick={addPage}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Page
        </button>
        <div className="topbar-divider" />
        <button className="btn-save">💾 Save</button>
        <button className="btn-download">⬇ Download PDF</button>
      </div>

      <div className="app-layout">

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          {ALL_SECTIONS.map(n => (
            <button key={n.id}
              className={`nav-item ${st.activeSection === n.id ? "active" : ""}`}
              onClick={() => sec(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </aside>

        <div className="content-area">

          {/* ── Form Side ── */}
          <div className="form-side">
            <div className="form-header">
              <h2>{meta.title}</h2>
              <p>{meta.desc}</p>
            </div>
            <div className="form-body">{renderForm()}</div>
            <div className="form-footer">
              <button className="btn-back" disabled={idx === 0} onClick={() => sec(ALL_SECTIONS[idx - 1].id)}>‹ Back</button>
              <button className="btn-next" disabled={idx === ALL_SECTIONS.length - 1} onClick={() => sec(ALL_SECTIONS[idx + 1].id)}>Next ›</button>
            </div>
          </div>

          {/* ── Preview Side ── */}
          <div className="preview-side" ref={previewRef}>
            <div className="preview-topbar">
              <div className="preview-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                Live Preview — Blank Resume
              </div>
              <div className="preview-hint">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                Drag sections to reorder
              </div>
            </div>

            <div className="page-wrap">
             {pages.map((page,pi)=>(
  <div key={page.id} className="rb-page-block">
    <PreviewScaler containerRef={previewRef}>
      <div className="rb-sheet">
        {pi === 0 ? (
          /* ── Page 1: actual resume content ── */
          <LivePreview
            data={resumeData}
            styling={st.styling}
            sectionOrder={order}
            onReorder={setOrder}
          />
        ) : (
          /* ── Page 2+: pure blank white A4 ── */
          <div style={{
            width: 595,
            height: 841,
            background: '#fff',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}>
            <span style={{
              padding: '10px 16px',
              fontSize: 10,
              color: '#e5e7eb',
              fontFamily: 'sans-serif',
              userSelect: 'none',
            }}>{pi + 1}</span>
          </div>
        )}
      </div>
    </PreviewScaler>
    <div className="rb-page-num">Page {pi+1} of {pages.length}</div>
    {pages.length>1&&(
      <button className="rb-rm-page" onClick={()=>removePage(page.id)}>× Remove page</button>
    )}
  </div>
))}

              {/* Add Page button */}
              <button className="add-page-btn" onClick={addPage}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Another Page 123
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}