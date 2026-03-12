import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

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
  summary: "Results-driven Software Engineer with 5+ years of experience building scalable web applications and distributed systems. Proven track record of leading cross-functional teams to deliver high-impact products on time. Passionate about clean architecture, developer experience, and mentoring junior engineers.",
  experience: "Led end-to-end development of a microservices platform that reduced deployment time by 60% and improved system reliability to 99.98% uptime. Collaborated with product and design teams to ship 3 major features per quarter, contributing to a 40% increase in user retention.",
  project: "Built a real-time collaborative document editor using React, WebSockets, and operational transformation algorithms. Supports 50+ concurrent users with <100ms latency. Deployed on AWS with auto-scaling.",
  certification: "Completed rigorous coursework covering advanced cloud architecture patterns, security best practices, and cost optimization strategies.",
};

const FONTS = ["DM Sans", "Inter", "Lato", "Merriweather", "Playfair Display", "Raleway"];
const PROFICIENCY_LEVELS = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const PRESET_COLORS = ["#1e293b","#2563eb","#059669","#dc2626","#7c3aed","#db2777","#b45309","#0f766e","#5b21b6","#0f172a"];

const uid = () => Date.now() + Math.random();
const makeExp  = () => ({ id: uid(), company: "", role: "", duration: "", location: "", description: "" });
const makeProj = () => ({ id: uid(), name: "", stack: "", description: "", link: "" });
const makeCert = () => ({ id: uid(), name: "", issuer: "", date: "", description: "" });
const makeLang = () => ({ id: uid(), language: "", proficiency: "Intermediate" });
const makeSkill= () => ({ id: uid(), name: "", level: "Intermediate" });

const INIT = {
  activeSection: "personal",
  zoom: 60,
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

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;600;700&family=Raleway:wght@300;400;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;overflow:hidden;}
body{font-family:'Inter',sans-serif;background:#f0f0f0;color:#111827;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:99px;}

/* TOP BAR */
.topbar{height:52px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;padding:0 20px;gap:10px;position:fixed;top:0;left:0;right:0;z-index:100;}
.topbar-title{font-size:15px;font-weight:600;color:#111827;flex:1;}
.topbar-tpl-badge{font-size:12px;background:#f1f5f9;border:1px solid #e2e8f0;color:#475569;padding:4px 12px;border-radius:99px;font-weight:500;}
.zoom-controls{display:flex;align-items:center;gap:5px;}
.zoom-btn{width:28px;height:28px;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;color:#6b7280;transition:all 0.15s;line-height:1;}
.zoom-btn:hover{background:#f9fafb;}
.zoom-label{font-size:13px;font-weight:500;color:#374151;min-width:40px;text-align:center;}
.topbar-divider{width:1px;height:24px;background:#e5e7eb;margin:0 4px;}
.btn-save{display:flex;align-items:center;gap:6px;padding:7px 16px;border:1px solid #e5e7eb;border-radius:8px;background:white;font-size:13px;font-weight:500;color:#374151;cursor:pointer;font-family:inherit;transition:all 0.15s;}
.btn-save:hover{background:#f9fafb;}
.btn-download{display:flex;align-items:center;gap:6px;padding:7px 18px;border:none;border-radius:8px;background:#111827;font-size:13px;font-weight:600;color:white;cursor:pointer;font-family:inherit;}
.btn-download:hover{background:#1f2937;}

/* LAYOUT */
.app-layout{display:flex;height:100vh;padding-top:52px;}

/* SIDEBAR */
.sidebar{width:68px;background:#1e293b;flex-shrink:0;display:flex;flex-direction:column;align-items:center;padding:8px 0;overflow-y:auto;height:100%;}
.nav-item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;cursor:pointer;border-radius:8px;width:58px;border:none;background:none;color:#94a3b8;font-family:inherit;transition:all 0.15s;margin-bottom:1px;}
.nav-item:hover{background:rgba(255,255,255,0.08);color:#e2e8f0;}
.nav-item.active{background:rgba(255,255,255,0.13);color:white;}
.nav-icon{font-size:17px;line-height:1;height:24px;display:flex;align-items:center;justify-content:center;}
.nav-label{font-size:9px;font-weight:500;text-align:center;line-height:1.2;}

/* CONTENT */
.content-area{flex:1;display:flex;overflow:hidden;}

/* FORM SIDE */
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

/* PREVIEW SIDE */
.preview-side{flex:1;background:#e8eaed;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;overflow-y:auto;padding:32px 20px;}
.resume-sheet{background:white;box-shadow:0 2px 8px rgba(0,0,0,0.12),0 16px 48px rgba(0,0,0,0.1);transition:width 0.2s;min-height:600px;}

/* FORM ELEMENTS */
.form-group{margin-bottom:14px;}
.form-label{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.form-label .opt{color:#9ca3af;font-weight:400;font-size:11px;margin-left:3px;}
.form-input{width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;font-family:inherit;color:#111827;background:white;outline:none;transition:border-color 0.15s,box-shadow 0.15s;}
.form-input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,0.1);}
.form-input::placeholder{color:#9ca3af;}
.form-textarea{min-height:85px;resize:vertical;line-height:1.55;padding-bottom:42px;}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

/* AI BUTTON */
.ai-wrap{position:relative;}
.ai-btn{position:absolute;bottom:8px;right:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.15s;display:flex;align-items:center;gap:4px;}
.ai-btn:hover{transform:translateY(-1px);box-shadow:0 4px 10px rgba(99,102,241,0.4);}

/* ENTRY CARDS */
.entry-card{background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:10px;padding:14px;margin-bottom:10px;}
.entry-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
.entry-title{font-size:12px;font-weight:600;color:#374151;}
.entry-remove{background:none;border:none;color:#ef4444;cursor:pointer;font-size:19px;padding:0 4px;line-height:1;border-radius:4px;}
.entry-remove:hover{background:#fef2f2;}
.add-btn{width:100%;padding:9px;background:white;border:1.5px dashed #d1d5db;border-radius:8px;color:#6366f1;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.15s;margin-top:3px;}
.add-btn:hover{border-color:#6366f1;background:#f5f3ff;}

/* SKILLS */
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;min-height:30px;}
.chip{display:inline-flex;align-items:center;gap:4px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:99px;padding:3px 10px;font-size:12px;color:#2563eb;font-weight:500;}
.chip-lvl{font-size:10px;opacity:0.65;}
.chip-x{background:none;border:none;cursor:pointer;color:#93c5fd;font-size:14px;padding:0;line-height:1;transition:color 0.15s;}
.chip-x:hover{color:#ef4444;}
.skill-row{display:flex;gap:7px;}

/* PHOTO */
.photo-row{display:flex;gap:14px;align-items:flex-start;margin-bottom:14px;}
.photo-circle{width:64px;height:64px;border-radius:50%;border:2px dashed #d1d5db;background:#f5f3ff;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;flex-shrink:0;font-size:20px;transition:border-color 0.15s;}
.photo-circle:hover{border-color:#6366f1;}
.photo-circle img{width:100%;height:100%;object-fit:cover;}
.photo-circle input{display:none;}

/* STYLING */
.style-label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;margin:16px 0 8px;}
.font-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
.font-opt{padding:9px 12px;border-radius:7px;border:1.5px solid #e5e7eb;cursor:pointer;font-size:13px;background:white;transition:all 0.15s;}
.font-opt:hover{border-color:#6366f1;background:#f5f3ff;}
.font-opt.on{border-color:#6366f1;background:#eff6ff;color:#4f46e5;font-weight:600;}
.color-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.swatch{width:28px;height:28px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all 0.15s;}
.swatch.on{border-color:#111827;transform:scale(1.18);}

/* ══════════════════════════════════════════
   RESUME PREVIEW — mirrors your gallery CSS
   ══════════════════════════════════════════ */

.resume-canvas{
  width:100%;
  min-height:600px;
  background:#fff;
  overflow:hidden;
  font-size:11px;
  line-height:1.5;
  color:#1e293b;
}

/* Header strip (present in most templates) */
.res-header{
  padding:14px 18px 12px;
  color:white;
}
.res-header h2{font-size:16px;font-weight:700;margin:0 0 2px;}
.res-header p{font-size:10px;opacity:0.85;margin:0;}

/* Two-panel flex layout */
.res-content{
  display:flex;
  min-height:520px;
}

/* Sidebar */
.res-sidebar{
  width:130px;
  flex-shrink:0;
  background:#f1f5f9;
  padding:14px 10px;
  display:flex;
  flex-direction:column;
  gap:10px;
}
.res-img{
  width:70px;height:70px;border-radius:50%;
  object-fit:cover;margin:0 auto 6px;display:block;
}
.res-img-small{
  width:50px;height:50px;border-radius:50%;object-fit:cover;
}
.res-img-small.centered{display:block;margin:10px auto;}
.res-img-small.left{float:left;margin:0 12px 8px 0;}
.res-side-sec h6,.res-side-sec p{font-size:9px;margin-bottom:3px;}
.res-side-sec h6{font-weight:700;letter-spacing:.8px;text-transform:uppercase;border-bottom:1px solid #e2e8f0;padding-bottom:3px;margin-bottom:5px;}

/* Main area */
.res-main{flex:1;padding:14px 16px;overflow:hidden;}

/* Section */
.res-sec{margin-bottom:10px;}
.res-sec h6{font-size:9px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;border-bottom:1.5px solid currentColor;padding-bottom:3px;margin-bottom:6px;}
.res-sec p,.res-sec div{font-size:9px;color:#374151;line-height:1.5;}
.res-sec strong{font-size:9.5px;color:#111827;}

/* Skill tags */
.skill-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;}
.skill-tags span{font-size:8px;padding:2px 7px;border-radius:99px;font-weight:500;}

/* Executive grid */
.executive-grid-layout{display:grid;grid-template-columns:130px 1fr;width:100%;min-height:520px;}
.exec-left{background:#1e293b;color:white;padding:14px 10px;}
.exec-left h6{color:rgba(255,255,255,0.6) !important;font-size:8px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;margin-bottom:5px;}
.exec-left p{color:rgba(255,255,255,0.85);font-size:8.5px;margin-bottom:2px;}
.exec-photo{width:60px;height:60px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 10px;border:2px solid rgba(255,255,255,0.2);}
.exec-section{margin-bottom:12px;}
.exec-skills{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;}
.exec-skills span{font-size:7.5px;padding:2px 6px;border-radius:4px;font-weight:500;}
.exec-right{padding:14px 16px;}

/* Blank start */
.blank-start-inner{display:flex;align-items:center;justify-content:center;height:520px;background:#fff;}
`;

// ─── GALLERY TEMPLATE PREVIEW RENDERER ────────────────────────────────────────
// Renders user's real form data using the gallery template's exact layout/structure

function GalleryPreview({ tpl, data, accentColor, font }) {
  const { personal, summary, experience, education, skills, projects, certifications, languages } = data;
  const col = accentColor || "#2563eb";
  const colBg = col + "18";

  const name   = personal.name  || "Your Name";
  const title  = personal.title || personal.name ? (experience[0]?.role || "") : "";
  const photoSrc = personal.photo;

  // -- reusable sub-renders --

  const PhotoImg = ({ className, style }) => photoSrc
    ? <img src={photoSrc} alt="profile" className={className} style={style} />
    : <div style={{ background: col + "22", display:"flex", alignItems:"center", justifyContent:"center", color: col, fontWeight:700, fontSize:14, ...style }} className={className}>
        {name.charAt(0).toUpperCase()}
      </div>;

  const ContactBlock = () => (
    <div>
      {personal.phone    && <p>{personal.phone}</p>}
      {personal.email    && <p>{personal.email}</p>}
      {personal.location && <p>{personal.location}</p>}
      {personal.linkedin && <p>{personal.linkedin}</p>}
      {personal.github   && <p>{personal.github}</p>}
    </div>
  );

  const SummaryBlock = () => summary.text
    ? <p>{summary.text}</p>
    : <p style={{color:"#cbd5e1",fontStyle:"italic"}}>Your summary here…</p>;

  const ExpBlock = ({ compact }) => (
    <>
      {experience.filter(e => e.company || e.role).map((e, i) => (
        <div key={e.id} style={{ marginBottom: compact ? 4 : 8 }}>
          <strong>{e.role || "Role"}</strong>{e.company ? ` — ${e.company}` : ""}
          {e.duration && <div style={{ fontSize: compact ? 7 : 8.5, color:"#64748b" }}>{e.duration}</div>}
          {!compact && e.description && <p style={{ fontSize:8.5, margin:"2px 0", color:"#374151" }}>{e.description}</p>}
        </div>
      ))}
      {experience.every(e => !e.company && !e.role) && <p style={{color:"#cbd5e1",fontStyle:"italic"}}>Experience here…</p>}
    </>
  );

  const SkillsBlock = () => (
    <div className="skill-tags">
      {skills.filter(s => s.name).map(s => (
        <span key={s.id} style={{ border:`1px solid ${col}`, color:col }}>{s.name}</span>
      ))}
      {skills.every(s => !s.name) && <span style={{color:"#cbd5e1",fontStyle:"italic",fontSize:8}}>Skills here…</span>}
    </div>
  );

  const EduBlock = () => education.degree || education.college ? (
    <div>
      <strong>{education.degree}</strong>
      {education.college && <div style={{fontSize:8.5,color:"#64748b"}}>{education.college}{education.year ? ` · ${education.year}` : ""}</div>}
    </div>
  ) : <p style={{color:"#cbd5e1",fontStyle:"italic"}}>Education here…</p>;

  const CertsBlock = () => certifications.filter(c => c.name).length > 0 ? (
    <>
      {certifications.filter(c => c.name).map(c => (
        <div key={c.id} style={{marginBottom:4}}>
          <strong>{c.name}</strong>
          {c.issuer && <span style={{color:"#64748b"}}> · {c.issuer}</span>}
          {c.date   && <span style={{color:"#64748b"}}> · {c.date}</span>}
        </div>
      ))}
    </>
  ) : null;

  const LangsBlock = () => languages.filter(l => l.language).length > 0 ? (
    <>
      {languages.filter(l => l.language).map(l => (
        <div key={l.id} style={{fontSize:8.5}}>{l.language} <span style={{color:"#94a3b8"}}>— {l.proficiency}</span></div>
      ))}
    </>
  ) : null;

  const ProjsBlock = () => projects.filter(p => p.name).length > 0 ? (
    <>
      {projects.filter(p => p.name).map(p => (
        <div key={p.id} style={{marginBottom:6}}>
          <strong>{p.name}</strong>
          {p.stack && <span style={{color:"#64748b",fontSize:8}}> · {p.stack}</span>}
          {p.description && <p style={{fontSize:8.5,margin:"2px 0"}}>{p.description}</p>}
        </div>
      ))}
    </>
  ) : null;

  const fontStyle = { fontFamily: `'${font}', sans-serif` };

  // ── STRUCTURE SWITCH — mirrors your gallery exactly ──────────────────────────

  switch (tpl.structure) {

    case "blank-start":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div className="blank-start-inner">
            <div style={{textAlign:"center",color:"#cbd5e1"}}>
              <div style={{fontSize:40,marginBottom:10}}>+</div>
              <p style={{fontSize:12,fontWeight:600}}>Start from Scratch</p>
              <p style={{fontSize:10}}>Add your details to build a custom resume</p>
            </div>
          </div>
        </div>
      );

    case "sidebar-left":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div className="res-header" style={{ background: col }}>
            <h2>{name}</h2>
            <p>{title}</p>
          </div>
          <div className="res-content">
            <div className="res-sidebar">
              {tpl.photo && <PhotoImg className="res-img" />}
              {tpl.contact && (
                <div className="res-side-sec">
                  <h6 style={{ color: col }}>CONTACT</h6>
                  <ContactBlock />
                </div>
              )}
              {skills.some(s => s.name) && (
                <div className="res-side-sec">
                  <h6 style={{ color: col }}>SKILLS</h6>
                  <SkillsBlock />
                </div>
              )}
              {languages.some(l => l.language) && (
                <div className="res-side-sec">
                  <h6 style={{ color: col }}>LANGUAGES</h6>
                  <LangsBlock />
                </div>
              )}
            </div>
            <div className="res-main">
              <div className="res-sec"><h6 style={{ color: col }}>SUMMARY</h6><SummaryBlock /></div>
              <div className="res-sec"><h6 style={{ color: col }}>EXPERIENCE</h6><ExpBlock /></div>
              <div className="res-sec"><h6 style={{ color: col }}>EDUCATION</h6><EduBlock /></div>
              {certifications.some(c => c.name) && <div className="res-sec"><h6 style={{ color: col }}>CERTIFICATIONS</h6><CertsBlock /></div>}
              {projects.some(p => p.name) && <div className="res-sec"><h6 style={{ color: col }}>PROJECTS</h6><ProjsBlock /></div>}
            </div>
          </div>
        </div>
      );

    case "sidebar-right":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div className="res-header" style={{ background: col }}>
            <h2>{name}</h2><p>{title}</p>
          </div>
          <div className="res-content" style={{ flexDirection:"row-reverse" }}>
            <div className="res-sidebar">
              {tpl.photo && <PhotoImg className="res-img" />}
              {tpl.contact && <div className="res-side-sec"><h6 style={{ color: col }}>CONTACT</h6><ContactBlock /></div>}
              {skills.some(s => s.name) && <div className="res-side-sec"><h6 style={{ color: col }}>SKILLS</h6><SkillsBlock /></div>}
              {languages.some(l => l.language) && <div className="res-side-sec"><h6 style={{ color: col }}>LANGUAGES</h6><LangsBlock /></div>}
            </div>
            <div className="res-main">
              <div className="res-sec"><h6 style={{ color: col }}>SUMMARY</h6><SummaryBlock /></div>
              <div className="res-sec"><h6 style={{ color: col }}>EXPERIENCE</h6><ExpBlock /></div>
              <div className="res-sec"><h6 style={{ color: col }}>EDUCATION</h6><EduBlock /></div>
              {certifications.some(c => c.name) && <div className="res-sec"><h6 style={{ color: col }}>CERTIFICATIONS</h6><CertsBlock /></div>}
            </div>
          </div>
        </div>
      );

    case "top-centered":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div className="res-header" style={{ background: col, textAlign:"center" }}>
            {tpl.photo && <PhotoImg style={{ width:52, height:52, borderRadius:"50%", objectFit:"cover", display:"block", margin:"0 auto 8px", border:"2px solid rgba(255,255,255,0.3)" }} />}
            <h2>{name}</h2><p>{title}</p>
            {tpl.contact && (
              <div style={{ fontSize:8.5, opacity:0.85, marginTop:5, display:"flex", justifyContent:"center", flexWrap:"wrap", gap:10 }}>
                {personal.email && <span>{personal.email}</span>}
                {personal.phone && <span>{personal.phone}</span>}
                {personal.location && <span>{personal.location}</span>}
              </div>
            )}
          </div>
          <div className="res-main">
            <div className="res-sec"><h6 style={{ color: col }}>SUMMARY</h6><SummaryBlock /></div>
            <div className="res-sec"><h6 style={{ color: col }}>EXPERIENCE</h6><ExpBlock /></div>
            <div className="res-sec"><h6 style={{ color: col }}>SKILLS</h6><SkillsBlock /></div>
            <div className="res-sec"><h6 style={{ color: col }}>EDUCATION</h6><EduBlock /></div>
            {certifications.some(c => c.name) && <div className="res-sec"><h6 style={{ color: col }}>CERTIFICATIONS</h6><CertsBlock /></div>}
            {languages.some(l => l.language) && <div className="res-sec"><h6 style={{ color: col }}>LANGUAGES</h6><LangsBlock /></div>}
          </div>
        </div>
      );

    case "minimal-no-photo":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div className="res-main" style={{ padding:22 }}>
            <div style={{ marginBottom:14 }}>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:3 }}>{name}</h3>
              <p style={{ fontSize:8.5, color:"#64748b" }}>
                {[personal.email, personal.phone, personal.location].filter(Boolean).join(" | ")}
              </p>
            </div>
            {[
              { label:"SUMMARY",        el:<SummaryBlock /> },
              { label:"EXPERIENCE",     el:<ExpBlock /> },
              { label:"EDUCATION",      el:<EduBlock /> },
              { label:"SKILLS",         el:<SkillsBlock /> },
              ...(certifications.some(c=>c.name) ? [{ label:"CERTIFICATIONS", el:<CertsBlock /> }] : []),
              ...(languages.some(l=>l.language) ? [{ label:"LANGUAGES", el:<LangsBlock /> }] : []),
            ].map(({ label, el }) => (
              <div key={label} style={{ background:"#f8fafc", padding:10, borderRadius:7, marginBottom:10, borderLeft:`3px solid ${col}` }}>
                <h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5 }}>{label}</h6>
                {el}
              </div>
            ))}
          </div>
        </div>
      );

    case "executive-grid":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div className="res-header" style={{ background: col }}>
            <h2>{name}</h2><p>{title}</p>
          </div>
          <div className="executive-grid-layout">
            <div className="exec-left">
              {tpl.photo && <PhotoImg className="exec-photo" />}
              {tpl.contact && <div className="exec-section"><h6>CONTACT</h6><ContactBlock /></div>}
              {skills.some(s => s.name) && (
                <div className="exec-section">
                  <h6>SKILLS</h6>
                  <div className="exec-skills">
                    {skills.filter(s => s.name).map(s => (
                      <span key={s.id} style={{ background: col, color:"#fff" }}>{s.name}</span>
                    ))}
                  </div>
                </div>
              )}
              {languages.some(l => l.language) && (
                <div className="exec-section"><h6>LANGUAGES</h6><LangsBlock /></div>
              )}
            </div>
            <div className="exec-right">
              <div className="res-sec"><h6 style={{ color:col }}>SUMMARY</h6><SummaryBlock /></div>
              <div className="res-sec"><h6 style={{ color:col }}>EXPERIENCE</h6><ExpBlock /></div>
              <div className="res-sec"><h6 style={{ color:col }}>EDUCATION</h6><EduBlock /></div>
              {certifications.some(c => c.name) && <div className="res-sec"><h6 style={{ color:col }}>CERTIFICATIONS</h6><CertsBlock /></div>}
              {projects.some(p => p.name) && <div className="res-sec"><h6 style={{ color:col }}>PROJECTS</h6><ProjsBlock /></div>}
            </div>
          </div>
        </div>
      );

    case "header-bg":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div className="res-header" style={{ background: col }}>
            <h2>{name}</h2><p>{title}</p>
            {tpl.contact && (
              <div style={{ fontSize:8.5, opacity:0.85, marginTop:4, display:"flex", flexWrap:"wrap", gap:10 }}>
                {personal.phone    && <span>{personal.phone}</span>}
                {personal.location && <span>{personal.location}</span>}
                {personal.email    && <span>{personal.email}</span>}
              </div>
            )}
          </div>
          <div className="res-main">
            <div className="res-sec"><h6 style={{ color:col }}>SUMMARY</h6><SummaryBlock /></div>
            <div className="res-sec"><h6 style={{ color:col }}>EXPERIENCE</h6><ExpBlock /></div>
            <div className="res-sec"><h6 style={{ color:col }}>SKILLS</h6><SkillsBlock /></div>
            <div className="res-sec"><h6 style={{ color:col }}>EDUCATION</h6><EduBlock /></div>
            {certifications.some(c=>c.name) && <div className="res-sec"><h6 style={{ color:col }}>CERTIFICATIONS</h6><CertsBlock /></div>}
            {languages.some(l=>l.language) && <div className="res-sec"><h6 style={{ color:col }}>LANGUAGES</h6><LangsBlock /></div>}
          </div>
        </div>
      );

    case "asymmetric":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div className="res-header" style={{ background: col }}>
            <h2>{name}</h2><p>{title}</p>
          </div>
          <div style={{ display:"block", position:"relative", padding:14 }}>
            {tpl.photo && <PhotoImg style={{ width:72, height:72, borderRadius:"50%", objectFit:"cover", float:"right", margin:"0 0 12px 12px", border:`2px solid ${col}` }} />}
            <div className="res-sec"><h6 style={{ color:col }}>SUMMARY</h6><SummaryBlock /></div>
            <div className="res-sec"><h6 style={{ color:col }}>EXPERIENCE</h6><ExpBlock /></div>
            <div className="res-sec"><h6 style={{ color:col }}>SKILLS</h6><SkillsBlock /></div>
            <div className="res-sec"><h6 style={{ color:col }}>EDUCATION</h6><EduBlock /></div>
            {certifications.some(c=>c.name) && <div className="res-sec"><h6 style={{ color:col }}>CERTIFICATIONS</h6><CertsBlock /></div>}
            {languages.some(l=>l.language) && <div className="res-sec"><h6 style={{ color:col }}>LANGUAGES</h6><LangsBlock /></div>}
          </div>
        </div>
      );

    case "professional-card":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div className="res-main" style={{ padding:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, background:colBg, padding:12, borderRadius:12 }}>
              {tpl.photo && <PhotoImg style={{ width:54, height:54, borderRadius:10, objectFit:"cover", flexShrink:0 }} />}
              <div>
                <h3 style={{ fontSize:14, fontWeight:700, margin:0 }}>{name}</h3>
                <p style={{ fontSize:9.5, color:"#64748b" }}>{title}</p>
                <p style={{ fontSize:8.5, color:"#94a3b8" }}>{[personal.email, personal.phone].filter(Boolean).join(" · ")}</p>
              </div>
            </div>
            <div style={{ background:"#f8fafc", padding:10, borderRadius:10, marginBottom:10 }}>
              <h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5 }}>SUMMARY</h6>
              <SummaryBlock />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={{ background:"#f8fafc", padding:10, borderRadius:10 }}>
                <h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5 }}>EXPERIENCE</h6>
                <ExpBlock compact />
              </div>
              <div style={{ background:"#f8fafc", padding:10, borderRadius:10 }}>
                <h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5 }}>SKILLS</h6>
                <SkillsBlock />
                {education.degree && <>
                  <h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5, marginTop:8 }}>EDUCATION</h6>
                  <EduBlock />
                </>}
              </div>
            </div>
            {certifications.some(c=>c.name) && (
              <div style={{ background:"#f8fafc", padding:10, borderRadius:10, marginTop:10 }}>
                <h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5 }}>CERTIFICATIONS</h6>
                <CertsBlock />
              </div>
            )}
          </div>
        </div>
      );

    case "compact":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div className="res-header" style={{ background: col, padding:"10px 14px" }}>
            <h2 style={{ fontSize:13 }}>{name}</h2><p style={{ fontSize:9 }}>{title}</p>
          </div>
          <div className="res-main" style={{ padding:10, fontSize:8.5 }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8 }}>
              {tpl.photo && <PhotoImg style={{ width:44, height:44, borderRadius:7, objectFit:"cover", flexShrink:0 }} />}
              <div>
                {personal.email    && <p>{personal.email}</p>}
                {personal.phone    && <p>{personal.phone}</p>}
                {personal.location && <p>{personal.location}</p>}
              </div>
            </div>
            <div className="res-sec"><SummaryBlock /></div>
            <div className="res-sec"><strong style={{ color:col }}>EXPERIENCE</strong><ExpBlock compact /></div>
            <div className="res-sec"><strong style={{ color:col }}>SKILLS</strong><SkillsBlock /></div>
            <div className="res-sec"><strong style={{ color:col }}>EDUCATION</strong><EduBlock /></div>
            {certifications.some(c=>c.name) && <div className="res-sec"><strong style={{ color:col }}>CERTIFICATIONS</strong><CertsBlock /></div>}
            {languages.some(l=>l.language) && <div className="res-sec"><strong style={{ color:col }}>LANGUAGES</strong><LangsBlock /></div>}
          </div>
        </div>
      );

    case "infographic":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div className="res-header" style={{ background: col }}>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              {tpl.photo && <PhotoImg style={{ width:52, height:52, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />}
              <div><h2 style={{ fontSize:15 }}>{name}</h2><p style={{ fontSize:9 }}>{title}</p></div>
            </div>
          </div>
          <div className="res-main">
            <div className="res-sec"><h6 style={{ color:col }}>SUMMARY</h6><SummaryBlock /></div>
            <div className="res-sec"><h6 style={{ color:col }}>EXPERIENCE</h6><ExpBlock /></div>
            <div className="res-sec">
              <h6 style={{ color:col }}>SKILLS</h6>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {skills.filter(s=>s.name).map(s => (
                  <div key={s.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ width:60, fontSize:8.5, flexShrink:0 }}>{s.name}</span>
                    <div style={{ flex:1, height:6, background:"#e2e8f0", borderRadius:4 }}>
                      <div style={{ width: s.level==="Expert"?"90%":s.level==="Advanced"?"75%":s.level==="Intermediate"?"55%":"35%", height:"100%", background:col, borderRadius:4 }} />
                    </div>
                  </div>
                ))}
                {skills.every(s=>!s.name) && <p style={{color:"#cbd5e1",fontStyle:"italic",fontSize:8}}>Skills here…</p>}
              </div>
            </div>
            {languages.some(l=>l.language) && <div className="res-sec"><h6 style={{ color:col }}>LANGUAGES</h6><LangsBlock /></div>}
            {certifications.some(c=>c.name) && <div className="res-sec"><h6 style={{ color:col }}>CERTIFICATIONS</h6><CertsBlock /></div>}
          </div>
        </div>
      );

    case "two-column":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div className="res-header" style={{ background: col }}>
            {tpl.photo && <PhotoImg style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover", float:"left", marginRight:12 }} />}
            <h2>{name}</h2><p>{title}</p>
          </div>
          <div className="res-main">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:12 }}>
              <div><h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5 }}>SUMMARY</h6><SummaryBlock /></div>
              <div>
                <h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5 }}>CONTACT</h6>
                <ContactBlock />
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div><h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5 }}>EXPERIENCE</h6><ExpBlock /></div>
              <div>
                <h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5 }}>SKILLS</h6>
                <SkillsBlock />
                {education.degree && <>
                  <h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5, marginTop:10 }}>EDUCATION</h6>
                  <EduBlock />
                </>}
                {certifications.some(c=>c.name) && <>
                  <h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5, marginTop:10 }}>CERTIFICATIONS</h6>
                  <CertsBlock />
                </>}
                {languages.some(l=>l.language) && <>
                  <h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5, marginTop:10 }}>LANGUAGES</h6>
                  <LangsBlock />
                </>}
              </div>
            </div>
          </div>
        </div>
      );

    case "pastel":
      return (
        <div className="resume-canvas" style={{ ...fontStyle, background:"#fdf2f8" }}>
          <div style={{ padding:"16px 18px" }}>
            <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14 }}>
              {tpl.photo && <PhotoImg style={{ width:54, height:54, borderRadius:30, objectFit:"cover", border:`2px solid ${col}` }} />}
              <div>
                <h3 style={{ fontSize:14, fontWeight:700 }}>{name}</h3>
                <p style={{ fontSize:9, color:"#64748b" }}>{title}</p>
              </div>
            </div>
            {[
              { label:"SUMMARY",        el:<SummaryBlock /> },
              { label:"EXPERIENCE",     el:<ExpBlock /> },
              { label:"EDUCATION",      el:<EduBlock /> },
              { label:"SKILLS",         el:<SkillsBlock /> },
              ...(certifications.some(c=>c.name) ? [{label:"CERTIFICATIONS",el:<CertsBlock />}] : []),
              ...(languages.some(l=>l.language) ? [{label:"LANGUAGES",el:<LangsBlock />}] : []),
            ].map(({ label, el }) => (
              <div key={label} style={{ background:"#fff", padding:10, borderRadius:10, marginBottom:10 }}>
                <h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5 }}>{label}</h6>
                {el}
              </div>
            ))}
          </div>
        </div>
      );

    case "card-style":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div style={{ display:"flex", flexDirection:"column", gap:10, padding:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, background:"#fff", padding:12, borderRadius:14, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", border:`1px solid ${colBg}` }}>
              {tpl.photo && <PhotoImg style={{ width:50, height:50, borderRadius:12, objectFit:"cover", flexShrink:0 }} />}
              <div>
                <h3 style={{ fontSize:13, fontWeight:700, margin:0 }}>{name}</h3>
                <p style={{ fontSize:9, color:"#64748b" }}>{title}</p>
                <p style={{ fontSize:8, color:"#94a3b8" }}>{[personal.email, personal.phone].filter(Boolean).join(" · ")}</p>
              </div>
            </div>
            {[
              { label:"SUMMARY",        el:<SummaryBlock /> },
              { label:"EXPERIENCE",     el:<ExpBlock /> },
              { label:"SKILLS",         el:<SkillsBlock /> },
              ...(education.degree ? [{label:"EDUCATION",el:<EduBlock />}] : []),
              ...(certifications.some(c=>c.name) ? [{label:"CERTIFICATIONS",el:<CertsBlock />}] : []),
              ...(languages.some(l=>l.language) ? [{label:"LANGUAGES",el:<LangsBlock />}] : []),
            ].map(({ label, el }) => (
              <div key={label} style={{ background:"#fff", padding:12, borderRadius:14, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                <h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5 }}>{label}</h6>
                {el}
              </div>
            ))}
          </div>
        </div>
      );

    case "timeline":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div className="res-header" style={{ background: col }}>
            {tpl.photo && <PhotoImg style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover", float:"left", marginRight:12 }} />}
            <h2>{name}</h2><p>{title}</p>
          </div>
          <div className="res-main">
            <div className="res-sec"><h6 style={{ color:col }}>SUMMARY</h6><SummaryBlock /></div>
            <div className="res-sec">
              <h6 style={{ color:col }}>EXPERIENCE</h6>
              <div style={{ borderLeft:`2px solid ${col}`, paddingLeft:12, marginLeft:4 }}>
                {experience.filter(e=>e.company||e.role).map(e => (
                  <div key={e.id} style={{ marginBottom:8, position:"relative" }}>
                    <div style={{ position:"absolute", left:-16, top:3, width:8, height:8, borderRadius:"50%", background:col }} />
                    <strong>{e.role}</strong>{e.company ? ` — ${e.company}` : ""}
                    {e.duration && <div style={{ fontSize:8, color:"#64748b" }}>{e.duration}</div>}
                    {e.description && <p style={{ fontSize:8.5, margin:"2px 0" }}>{e.description}</p>}
                  </div>
                ))}
                {experience.every(e=>!e.company&&!e.role) && <p style={{color:"#cbd5e1",fontStyle:"italic"}}>Experience here…</p>}
              </div>
            </div>
            <div className="res-sec"><h6 style={{ color:col }}>SKILLS</h6><SkillsBlock /></div>
            <div className="res-sec"><h6 style={{ color:col }}>EDUCATION</h6><EduBlock /></div>
            {certifications.some(c=>c.name) && <div className="res-sec"><h6 style={{ color:col }}>CERTIFICATIONS</h6><CertsBlock /></div>}
            {languages.some(l=>l.language) && <div className="res-sec"><h6 style={{ color:col }}>LANGUAGES</h6><LangsBlock /></div>}
          </div>
        </div>
      );

    case "grid-skills":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div className="res-header" style={{ background: col }}>
            <h2>{name}</h2><p>{title}</p>
          </div>
          <div className="res-main">
            <div className="res-sec"><h6 style={{ color:col }}>SUMMARY</h6><SummaryBlock /></div>
            <div className="res-sec"><h6 style={{ color:col }}>EXPERIENCE</h6><ExpBlock /></div>
            <div className="res-sec">
              <h6 style={{ color:col }}>SKILLS</h6>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
                {skills.filter(s=>s.name).map(s => (
                  <span key={s.id} style={{ border:`1px solid ${col}`, color:col, padding:"3px 6px", textAlign:"center", borderRadius:5, fontSize:8 }}>{s.name}</span>
                ))}
                {skills.every(s=>!s.name) && <p style={{color:"#cbd5e1",fontStyle:"italic",fontSize:8}}>Skills here…</p>}
              </div>
            </div>
            <div className="res-sec"><h6 style={{ color:col }}>EDUCATION</h6><EduBlock /></div>
            {certifications.some(c=>c.name) && <div className="res-sec"><h6 style={{ color:col }}>CERTIFICATIONS</h6><CertsBlock /></div>}
            {languages.some(l=>l.language) && <div className="res-sec"><h6 style={{ color:col }}>LANGUAGES</h6><LangsBlock /></div>}
          </div>
        </div>
      );

    case "minimal-accent":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div style={{ padding:"22px 22px 0" }}>
            <div style={{ borderBottom:`3px solid ${col}`, marginBottom:14, paddingBottom:10 }}>
              <h2 style={{ fontSize:18, fontWeight:700, margin:0 }}>{name}</h2>
              <p style={{ fontSize:10, color:"#64748b", marginTop:2 }}>{title}</p>
              <p style={{ fontSize:8.5, color:"#94a3b8", marginTop:4 }}>{[personal.email,personal.phone,personal.location].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <div className="res-main" style={{ paddingTop:0 }}>
            <div className="res-sec"><SummaryBlock /></div>
            <div className="res-sec"><h6 style={{ color:col }}>EXPERIENCE</h6><ExpBlock /></div>
            <div className="res-sec">
              <div className="skill-tags">
                {skills.filter(s=>s.name).map(s => (
                  <span key={s.id} style={{ background:col, color:"white", padding:"2px 8px", borderRadius:12, fontSize:8 }}>{s.name}</span>
                ))}
              </div>
            </div>
            <div className="res-sec"><h6 style={{ color:col }}>EDUCATION</h6><EduBlock /></div>
            {certifications.some(c=>c.name) && <div className="res-sec"><h6 style={{ color:col }}>CERTIFICATIONS</h6><CertsBlock /></div>}
            {languages.some(l=>l.language) && <div className="res-sec"><h6 style={{ color:col }}>LANGUAGES</h6><LangsBlock /></div>}
          </div>
        </div>
      );

    case "creative-stack":
      return (
        <div className="resume-canvas" style={fontStyle}>
          <div style={{ padding:14 }}>
            <div style={{ position:"relative", marginBottom:24 }}>
              {tpl.photo && <PhotoImg style={{ width:60, height:60, borderRadius:14, objectFit:"cover", position:"absolute", top:-8, left:-8, border:`2px solid ${col}`, zIndex:1 }} />}
              <div style={{ marginLeft:60, background:"#f1f5f9", padding:"12px 12px 12px 16px", borderRadius:14 }}>
                <h3 style={{ fontSize:13, fontWeight:700, margin:0 }}>{name}</h3>
                <p style={{ fontSize:9, color:"#64748b" }}>{title}</p>
              </div>
            </div>
            {[
              { label:"SUMMARY",        el:<SummaryBlock /> },
              { label:"EXPERIENCE",     el:<ExpBlock /> },
              { label:"SKILLS",         el:<SkillsBlock /> },
              ...(education.degree ? [{label:"EDUCATION",el:<EduBlock />}] : []),
              ...(certifications.some(c=>c.name) ? [{label:"CERTIFICATIONS",el:<CertsBlock />}] : []),
              ...(languages.some(l=>l.language) ? [{label:"LANGUAGES",el:<LangsBlock />}] : []),
            ].map(({ label, el }) => (
              <div key={label} style={{ background:"#f1f5f9", padding:12, borderRadius:14, marginBottom:10 }}>
                <h6 style={{ color:col, fontSize:8.5, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:5 }}>{label}</h6>
                {el}
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="resume-canvas" style={{ ...fontStyle, padding:20 }}>
          <h3>{name}</h3>
          <p style={{ color:"#64748b", fontSize:10 }}>{title}</p>
          <div style={{ marginTop:14 }}>
            <SummaryBlock />
            <div style={{ marginTop:10 }}><ExpBlock /></div>
          </div>
        </div>
      );
  }
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
        <div style={{ flex:1 }}>
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
        <textarea className="form-input form-textarea" style={{ minHeight:130 }}
          placeholder="Write a 2–3 sentence overview of your background and goals…"
          value={data.text} onChange={e => onChange({ ...data, text: e.target.value })} />
        <button className="ai-btn" onClick={() => onChange({ ...data, text: AI_SUGGESTIONS.summary })}>✨ AI Suggest</button>
      </div>
    </div>
  );
}

function ExperienceSection({ data, onChange }) {
  const upd = (id,k,v) => onChange(data.map(e => e.id===id ? {...e,[k]:v} : e));
  const rem = id => onChange(data.filter(e => e.id!==id));
  return (
    <div>
      {data.map((exp,i) => (
        <div key={exp.id} className="entry-card">
          <div className="entry-head">
            <span className="entry-title">Position {i+1}</span>
            {data.length>1 && <button className="entry-remove" onClick={() => rem(exp.id)}>×</button>}
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Company</label>
              <input className="form-input" placeholder="Zoho Corporation" value={exp.company} onChange={e => upd(exp.id,"company",e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Role / Title</label>
              <input className="form-input" placeholder="Lead Developer" value={exp.role} onChange={e => upd(exp.id,"role",e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Duration</label>
              <input className="form-input" placeholder="2019 – Present" value={exp.duration} onChange={e => upd(exp.id,"duration",e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Location</label>
              <input className="form-input" placeholder="Chennai / Remote" value={exp.location} onChange={e => upd(exp.id,"location",e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label>
            <div className="ai-wrap">
              <textarea className="form-input form-textarea" placeholder="Key responsibilities and achievements…"
                value={exp.description} onChange={e => upd(exp.id,"description",e.target.value)} />
              <button className="ai-btn" onClick={() => upd(exp.id,"description",AI_SUGGESTIONS.experience)}>✨ AI Suggest</button>
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
  const add = () => { if (!ns.trim()) return; onChange([...data, { id:uid(), name:ns.trim(), level:nl }]); setNs(""); };
  return (
    <div>
      <div className="chips">
        {data.filter(s=>s.name).map(s => (
          <div key={s.id} className="chip">{s.name}
            <span className="chip-lvl">· {s.level}</span>
            <button className="chip-x" onClick={() => onChange(data.filter(x=>x.id!==s.id))}>×</button>
          </div>
        ))}
        {data.every(s=>!s.name) && <span style={{fontSize:12,color:"#9ca3af"}}>Add skills below…</span>}
      </div>
      <div className="skill-row">
        <input className="form-input" style={{flex:1}} placeholder="React.js, Node.js, AWS…"
          value={ns} onChange={e=>setNs(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} />
        <select className="form-input" style={{width:135}} value={nl} onChange={e=>setNl(e.target.value)}>
          {SKILL_LEVELS.map(l=><option key={l}>{l}</option>)}
        </select>
        <button className="btn-next" style={{borderRadius:7,padding:"8px 14px",flexShrink:0}} onClick={add}>Add</button>
      </div>
    </div>
  );
}

function ProjectsSection({ data, onChange }) {
  const upd = (id,k,v) => onChange(data.map(p => p.id===id ? {...p,[k]:v} : p));
  const rem = id => onChange(data.filter(p=>p.id!==id));
  return (
    <div>
      {data.map((p,i) => (
        <div key={p.id} className="entry-card">
          <div className="entry-head">
            <span className="entry-title">Project {i+1}</span>
            {data.length>1 && <button className="entry-remove" onClick={() => rem(p.id)}>×</button>}
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Project Name</label>
              <input className="form-input" placeholder="SaaS Dashboard" value={p.name} onChange={e=>upd(p.id,"name",e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Tech Stack</label>
              <input className="form-input" placeholder="React, Node.js, AWS" value={p.stack} onChange={e=>upd(p.id,"stack",e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label>
            <div className="ai-wrap">
              <textarea className="form-input form-textarea" placeholder="What you built and outcomes…"
                value={p.description} onChange={e=>upd(p.id,"description",e.target.value)} />
              <button className="ai-btn" onClick={() => upd(p.id,"description",AI_SUGGESTIONS.project)}>✨ AI Suggest</button>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Link <span className="opt">(optional)</span></label>
            <input className="form-input" placeholder="github.com/you/project" value={p.link} onChange={e=>upd(p.id,"link",e.target.value)} /></div>
        </div>
      ))}
      <button className="add-btn" onClick={() => onChange([...data, makeProj()])}>+ Add Another Project</button>
    </div>
  );
}

function CertificationsSection({ data, onChange }) {
  const upd = (id,k,v) => onChange(data.map(c => c.id===id ? {...c,[k]:v} : c));
  const rem = id => onChange(data.filter(c=>c.id!==id));
  return (
    <div>
      {data.map((c,i) => (
        <div key={c.id} className="entry-card">
          <div className="entry-head">
            <span className="entry-title">Certification {i+1}</span>
            {data.length>1 && <button className="entry-remove" onClick={() => rem(c.id)}>×</button>}
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Certificate Name</label>
              <input className="form-input" placeholder="AWS Solutions Architect" value={c.name} onChange={e=>upd(c.id,"name",e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Issuing Body</label>
              <input className="form-input" placeholder="Amazon Web Services" value={c.issuer} onChange={e=>upd(c.id,"issuer",e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Date</label>
            <input className="form-input" placeholder="March 2024" value={c.date} onChange={e=>upd(c.id,"date",e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Description <span className="opt">(optional)</span></label>
            <div className="ai-wrap">
              <textarea className="form-input form-textarea" placeholder="What this certification covers…"
                value={c.description} onChange={e=>upd(c.id,"description",e.target.value)} />
              <button className="ai-btn" onClick={() => upd(c.id,"description",AI_SUGGESTIONS.certification)}>✨ AI Suggest</button>
            </div>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={() => onChange([...data, makeCert()])}>+ Add Another Certification</button>
    </div>
  );
}

function LanguagesSection({ data, onChange }) {
  const upd = (id,k,v) => onChange(data.map(l => l.id===id ? {...l,[k]:v} : l));
  const rem = id => onChange(data.filter(l=>l.id!==id));
  return (
    <div>
      {data.map((l,i) => (
        <div key={l.id} className="entry-card">
          <div className="entry-head">
            <span className="entry-title">Language {i+1}</span>
            {data.length>1 && <button className="entry-remove" onClick={() => rem(l.id)}>×</button>}
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Language</label>
              <input className="form-input" placeholder="Tamil" value={l.language} onChange={e=>upd(l.id,"language",e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Proficiency</label>
              <select className="form-input" value={l.proficiency} onChange={e=>upd(l.id,"proficiency",e.target.value)}>
                {PROFICIENCY_LEVELS.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={() => onChange([...data, makeLang()])}>+ Add Another Language</button>
    </div>
  );
}

function StylingSection({ data, onChange, tplColor }) {
  const s = k => v => onChange({ ...data, [k]: v });
  return (
    <div>
      <div className="style-label">Font Family</div>
      <div className="font-grid">
        {FONTS.map(f => (
          <div key={f} className={`font-opt ${data.font===f?"on":""}`}
            style={{ fontFamily:`'${f}',sans-serif` }} onClick={() => s("font")(f)}>{f}</div>
        ))}
      </div>
      <div className="style-label">Accent Color</div>
      <div className="color-row">
        {PRESET_COLORS.map(c => (
          <div key={c} className={`swatch ${data.accentColor===c?"on":""}`}
            style={{ background:c }} onClick={() => s("accentColor")(c)} />
        ))}
        <input type="color" value={data.accentColor}
          onChange={e => s("accentColor")(e.target.value)}
          style={{ width:30, height:30, border:"none", borderRadius:"50%", cursor:"pointer", padding:0 }} />
      </div>
      {tplColor && (
        <div style={{ marginTop:12, padding:"10px 12px", background:"#f8fafc", borderRadius:8, fontSize:12, color:"#64748b" }}>
          
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function ResumeBuilder() {
  // ── Read template passed from gallery via navigate(state) ──
  const location = useLocation();
  const galleryTemplate = location.state?.template || null;
  // Gallery-ல் select பண்ண color (from color dots) — use as initial accent
  const galleryColor = location.state?.selectedColor || null;

  const [st, setSt] = useState(() => ({
    ...INIT,
    styling: {
      ...INIT.styling,
      // If gallery sent a color, use it; otherwise default blue
      accentColor: galleryColor || INIT.styling.accentColor,
    },
  }));

  const sec    = useCallback(id => setSt(s => ({ ...s, activeSection: id })), []);
  const setFld = useCallback((k, v) => setSt(s => ({ ...s, [k]: v })), []);
  const adjZoom = useCallback(d => setSt(s => ({ ...s, zoom: Math.min(130, Math.max(30, s.zoom+d)) })), []);

  const idx  = NAV_SECTIONS.findIndex(n => n.id === st.activeSection);
  const meta = SECTION_META[st.activeSection];

  const renderForm = () => {
    switch (st.activeSection) {
      case "personal":       return <PersonalSection       data={st.personal}       onChange={v => setFld("personal",v)} />;
      case "summary":        return <SummarySection        data={st.summary}        onChange={v => setFld("summary",v)} />;
      case "experience":     return <ExperienceSection     data={st.experience}     onChange={v => setFld("experience",v)} />;
      case "education":      return <EducationSection      data={st.education}      onChange={v => setFld("education",v)} />;
      case "skills":         return <SkillsSection         data={st.skills}         onChange={v => setFld("skills",v)} />;
      case "projects":       return <ProjectsSection       data={st.projects}       onChange={v => setFld("projects",v)} />;
      case "certifications": return <CertificationsSection data={st.certifications} onChange={v => setFld("certifications",v)} />;
      case "languages":      return <LanguagesSection      data={st.languages}      onChange={v => setFld("languages",v)} />;
      case "styling":        return <StylingSection        data={st.styling}        onChange={v => setFld("styling",v)} tplColor={galleryColor} />;
      default:               return null;
    }
  };

  const previewWidth = Math.round(595 * st.zoom / 100);

  // The accent color to use: styling panel pick OR gallery color
  const activeColor = st.styling.accentColor;

  return (
    <>
      <style>{css}</style>

      {/* TOP BAR */}
      <div className="topbar">
        <span className="topbar-title">Resume Builder</span>
        {galleryTemplate && (
          <span className="topbar-tpl-badge">📐 {galleryTemplate.name}</span>
        )}
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={() => adjZoom(-5)}>−</button>
          <span className="zoom-label">{st.zoom}%</span>
          <button className="zoom-btn" onClick={() => adjZoom(5)}>+</button>
        </div>
        <div className="topbar-divider" />
        <button className="btn-save">💾 Save</button>
        <button className="btn-download">⬇ Download PDF</button>
      </div>

      <div className="app-layout">

        {/* SIDEBAR */}
        <aside className="sidebar">
          {NAV_SECTIONS.map(n => (
            <button key={n.id}
              className={`nav-item ${st.activeSection===n.id ? "active" : ""}`}
              onClick={() => sec(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </aside>

        <div className="content-area">

          {/* FORM PANEL */}
          <div className="form-side">
            <div className="form-header">
              <h2>{meta.title}</h2>
              <p>{meta.desc}</p>
            </div>
            <div className="form-body">{renderForm()}</div>
            <div className="form-footer">
              <button className="btn-back"
                disabled={idx===0}
                onClick={() => sec(NAV_SECTIONS[idx-1].id)}>‹ Back</button>
              <button className="btn-next"
                disabled={idx===NAV_SECTIONS.length-1}
                onClick={() => sec(NAV_SECTIONS[idx+1].id)}>Next ›</button>
            </div>
          </div>

          {/* PREVIEW PANEL */}
          <div className="preview-side">
            <div className="resume-sheet" style={{ width: previewWidth }}>
              {galleryTemplate ? (
                // ── Use gallery template layout with real user data ──
                <GalleryPreview
                  tpl={galleryTemplate}
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
              ) : (
                // ── No template selected — plain preview ──
                <div style={{ padding:28, fontFamily:`'${st.styling.font}',sans-serif`, minHeight:600 }}>
                  <h2 style={{ fontSize:22, fontWeight:700, color: activeColor }}>
                    {st.personal.name || "Your Name"}
                  </h2>
                  {st.personal.title && <p style={{ color:"#64748b", fontSize:13 }}>{st.personal.title}</p>}
                  <p style={{ fontSize:12, color:"#94a3b8", marginTop:6 }}>
                    {[st.personal.email, st.personal.phone, st.personal.location].filter(Boolean).join(" · ")}
                  </p>
                  {st.summary.text && (
                    <p style={{ marginTop:14, fontSize:12, lineHeight:1.6, color:"#374151" }}>{st.summary.text}</p>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
