// ResumeBuilderRouter.jsx
// Features:
// • Blank Resume → full builder with live preview
// • Template Resume → GalleryPreview-based builder with multi-page support
// • Automatic blank second page for specific templates
// • Add/remove blank pages manually
// • Section drag & drop reorder in preview
// • Photo: left/center/right position + small/medium/large size + delete

import React, { useState, useRef, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import GalleryPreview from "./GalleryPreview";
import BlankCanvasBuilder from "./BlankCanvasBuilder";
// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ALL_SECTIONS = [
  { id: "personal",       label: "Personal",       icon: "👤" },
  { id: "summary",        label: "Summary",        icon: "📄" },
  { id: "experience",     label: "Experience",     icon: "💼" },
  { id: "education",      label: "Education",      icon: "🎓" },
  { id: "skills",         label: "Skills",         icon: "</>" },
  { id: "projects",       label: "Projects",       icon: "🚀" },
  { id: "certifications", label: "Certifications", icon: "🏆" },
  { id: "languages",      label: "Languages",      icon: "Aa" },
  { id: "styling",        label: "Styling",        icon: "🎨" },
];

const DEFAULT_ORDER = ["summary","experience","education","skills","projects","certifications","languages"];

const SECTION_META = {
  personal:       { title:"Personal Information",   desc:"Your contact details and basic info" },
  summary:        { title:"Professional Summary",   desc:"A brief overview of your background" },
  experience:     { title:"Work Experience",        desc:"Your employment history" },
  education:      { title:"Education",              desc:"Your academic background" },
  skills:         { title:"Skills",                 desc:"Technical and soft skills" },
  projects:       { title:"Projects",               desc:"Notable projects you've worked on" },
  certifications: { title:"Certifications",         desc:"Professional certifications" },
  languages:      { title:"Languages",              desc:"Languages you speak" },
  styling:        { title:"Resume Styling",         desc:"Customize fonts, colors & layout" },
};

const AI = {
  summary:       "Results-driven professional with 5+ years of experience delivering high-impact outcomes. Proven track record of leading cross-functional teams and shipping products on time.",
  experience:    "Led end-to-end development of a platform that reduced deployment time by 60% and improved reliability to 99.98% uptime.",
  project:       "Built a real-time collaborative tool using React and WebSockets. Supports 50+ concurrent users with <100ms latency.",
  certification: "Completed advanced coursework covering architecture patterns, security best practices, and cost optimization.",
};

const FONTS        = ["DM Sans","Inter","Lato","Merriweather","Playfair Display","Raleway"];
const PROF_LEVELS  = ["Native","Fluent","Advanced","Intermediate","Basic"];
const SKILL_LEVELS = ["Beginner","Intermediate","Advanced","Expert"];
const COLORS       = ["#1e293b","#2563eb","#059669","#dc2626","#7c3aed","#db2777","#b45309","#0f766e","#e11d48","#0f172a"];

const LAYOUTS = [
  { id:"one-col",      label:"Single Column", icon:"▬",   desc:"Classic top-to-bottom" },
  { id:"two-col",      label:"Two Column",    icon:"▌▐",  desc:"Side by side sections" },
  { id:"sidebar-left", label:"Sidebar",       icon:"▌▬",  desc:"Dark sidebar + main" },
];

const PHOTO_SIZES = { small:52, medium:72, large:96 };

const uid      = () => Date.now() + Math.random();
const makeExp  = () => ({ id:uid(), company:"", role:"", duration:"", location:"", description:"" });
const makeProj = () => ({ id:uid(), name:"", stack:"", description:"", link:"" });
const makeCert = () => ({ id:uid(), name:"", issuer:"", date:"", description:"" });
const makeLang = () => ({ id:uid(), language:"", proficiency:"Intermediate" });
const makeSkill= () => ({ id:uid(), name:"", level:"Intermediate" });

const INIT = {
  activeSection:"personal",
  personal:       { name:"", title:"", email:"", phone:"", location:"", linkedin:"", github:"", photo:null },
  summary:        { text:"" },
  experience:     [makeExp()],
  education:      { degree:"", college:"", year:"", gpa:"" },
  skills:         [makeSkill()],
  projects:       [makeProj()],
  certifications: [makeCert()],
  languages:      [makeLang()],
  styling: { font:"Inter", accentColor:"#2563eb", layout:"one-col", photoPosition:"left", photoSize:"medium" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CSS
// ═══════════════════════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;600;700&family=Raleway:wght@300;400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;overflow:hidden;}
body{font-family:'Inter',sans-serif;background:#f0f2f5;color:#111827;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:99px;}

.rb-bar{height:52px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;padding:0 20px;gap:10px;position:fixed;top:0;left:0;right:0;z-index:200;}
.rb-bar-title{font-size:15px;font-weight:700;color:#111827;flex:1;}
.rb-badge{font-size:11px;background:#eff6ff;border:1px solid #bfdbfe;color:#2563eb;padding:4px 12px;border-radius:99px;font-weight:700;}
.rb-sep{width:1px;height:24px;background:#e5e7eb;margin:0 2px;}
.rb-btn{display:flex;align-items:center;gap:6px;padding:7px 16px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;font-size:13px;font-weight:500;color:#374151;cursor:pointer;font-family:inherit;}
.rb-btn:hover{background:#f9fafb;}
.rb-btn-dark{border:none;background:#111827;color:#fff;font-weight:700;}
.rb-btn-dark:hover{background:#1f2937;}
.rb-btn-ghost{border:1.5px dashed #6366f1;background:transparent;color:#6366f1;font-weight:700;}
.rb-btn-ghost:hover{background:#f5f3ff;}

.rb-layout{display:flex;height:100vh;padding-top:52px;}
.rb-sidebar{width:68px;background:#1e293b;flex-shrink:0;display:flex;flex-direction:column;align-items:center;padding:8px 0;overflow-y:auto;}
.rb-nav{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;cursor:pointer;border-radius:8px;width:58px;border:none;background:none;color:#94a3b8;font-family:inherit;transition:all .15s;margin-bottom:1px;}
.rb-nav:hover{background:rgba(255,255,255,.08);color:#e2e8f0;}
.rb-nav.on{background:rgba(255,255,255,.14);color:#fff;}
.rb-nav-icon{font-size:16px;line-height:1;height:22px;display:flex;align-items:center;justify-content:center;}
.rb-nav-lbl{font-size:9px;font-weight:500;text-align:center;line-height:1.2;}

.rb-content{flex:1;display:flex;overflow:hidden;}

.rb-form{width:500px;flex-shrink:0;background:#fff;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;height:100%;}
.rb-form-head{padding:18px 22px 12px;border-bottom:1px solid #f3f4f6;flex-shrink:0;}
.rb-form-head h2{font-size:17px;font-weight:700;color:#111827;margin-bottom:2px;}
.rb-form-head p{font-size:12px;color:#6b7280;}
.rb-form-body{flex:1;overflow-y:auto;padding:18px 22px;}
.rb-form-foot{padding:12px 22px;border-top:1px solid #f3f4f6;display:flex;justify-content:space-between;flex-shrink:0;background:#fff;}
.rb-back{display:flex;align-items:center;gap:5px;padding:8px 18px;border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;font-size:13px;font-weight:500;color:#374151;cursor:pointer;font-family:inherit;}
.rb-back:disabled{opacity:.3;cursor:default;}
.rb-next{display:flex;align-items:center;gap:5px;padding:8px 22px;border:none;border-radius:8px;background:#111827;font-size:13px;font-weight:700;color:#fff;cursor:pointer;font-family:inherit;}
.rb-next:disabled{opacity:.3;cursor:default;}

.rb-g{margin-bottom:13px;}
.rb-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:4px;}
.rb-lbl .opt{color:#9ca3af;font-weight:400;font-size:11px;margin-left:3px;}
.rb-in{width:100%;padding:8px 11px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;font-family:inherit;color:#111827;background:#fff;outline:none;transition:border-color .15s;}
.rb-in:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1);}
.rb-in::placeholder{color:#9ca3af;}
.rb-ta{min-height:82px;resize:vertical;line-height:1.55;padding-bottom:40px;}
.rb-row{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
.rb-ai-wrap{position:relative;}
.rb-ai-btn{position:absolute;bottom:8px;right:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;}
.rb-ai-btn:hover{transform:translateY(-1px);}
.rb-card{background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:10px;padding:13px;margin-bottom:9px;}
.rb-card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;}
.rb-card-title{font-size:12px;font-weight:600;color:#374151;}
.rb-rm{background:none;border:none;color:#ef4444;cursor:pointer;font-size:19px;padding:0 3px;line-height:1;}
.rb-add{width:100%;padding:8px;background:#fff;border:1.5px dashed #d1d5db;border-radius:8px;color:#6366f1;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;margin-top:2px;}
.rb-add:hover{border-color:#6366f1;background:#f5f3ff;}
.rb-chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:11px;min-height:28px;}
.rb-chip{display:inline-flex;align-items:center;gap:3px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:99px;padding:3px 9px;font-size:12px;color:#2563eb;font-weight:500;}
.rb-chip-x{background:none;border:none;cursor:pointer;color:#93c5fd;font-size:13px;padding:0;line-height:1;}
.rb-chip-x:hover{color:#ef4444;}
.rb-skill-row{display:flex;gap:6px;}

.rb-photo-wrap{display:flex;gap:14px;align-items:flex-start;margin-bottom:14px;}
.rb-photo-upload{width:68px;height:68px;border-radius:50%;border:2px dashed #d1d5db;background:#f5f3ff;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;flex-shrink:0;font-size:22px;position:relative;}
.rb-photo-upload:hover{border-color:#6366f1;}
.rb-photo-upload img{width:100%;height:100%;object-fit:cover;}
.rb-photo-upload input{display:none;}
.rb-photo-overlay{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;border-radius:50%;}
.rb-photo-upload:hover .rb-photo-overlay{opacity:1;}

.rb-photo-controls{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px;margin-bottom:14px;}
.rb-photo-ctrl-title{font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px;}
.rb-ctrl-label{font-size:11px;font-weight:600;color:#475569;margin-bottom:6px;display:block;}
.rb-pos-row{display:flex;gap:7px;margin-bottom:12px;}
.rb-pos-btn{flex:1;padding:7px 4px;border:1.5px solid #e2e8f0;border-radius:7px;background:#fff;font-size:11px;font-weight:600;color:#64748b;cursor:pointer;font-family:inherit;text-align:center;transition:all .15s;}
.rb-pos-btn.on{border-color:#6366f1;background:#eff6ff;color:#4f46e5;}
.rb-size-row{display:flex;gap:7px;margin-bottom:12px;}
.rb-size-btn{flex:1;padding:7px 4px;border:1.5px solid #e2e8f0;border-radius:7px;background:#fff;font-size:11px;font-weight:600;color:#64748b;cursor:pointer;font-family:inherit;text-align:center;transition:all .15s;}
.rb-size-btn.on{border-color:#6366f1;background:#eff6ff;color:#4f46e5;}
.rb-del-photo{width:100%;padding:7px;border:1.5px solid #fca5a5;border-radius:7px;background:#fff;color:#ef4444;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;}
.rb-del-photo:hover{background:#fef2f2;}

.rb-style-lbl{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;margin:16px 0 8px;}
.rb-font-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
.rb-font-opt{padding:9px 11px;border-radius:7px;border:1.5px solid #e5e7eb;cursor:pointer;font-size:13px;background:#fff;transition:all .15s;}
.rb-font-opt:hover{border-color:#6366f1;}
.rb-font-opt.on{border-color:#6366f1;background:#eff6ff;color:#4f46e5;font-weight:700;}
.rb-color-row{display:flex;gap:7px;flex-wrap:wrap;align-items:center;}
.rb-swatch{width:27px;height:27px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all .15s;}
.rb-swatch.on{border-color:#111827;transform:scale(1.18);}

.rb-layout-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:4px;}
.rb-layout-card{border:2px solid #e5e7eb;border-radius:10px;padding:10px 6px 8px;cursor:pointer;background:#fff;transition:all .15s;text-align:center;}
.rb-layout-card:hover{border-color:#a5b4fc;}
.rb-layout-card.on{border-color:#6366f1;background:#eff6ff;}
.rb-layout-icon{font-size:20px;margin-bottom:4px;display:block;}
.rb-layout-name{font-size:11px;font-weight:700;color:#374151;display:block;}
.rb-layout-desc{font-size:9px;color:#94a3b8;display:block;margin-top:2px;}

.rb-preview{flex:1;background:#dde1e7;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;padding:18px 0 40px;}
.rb-preview-bar{display:flex;align-items:center;justify-content:space-between;padding:0 22px;margin-bottom:14px;flex-shrink:0;}
.rb-preview-lbl{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:#6b7280;background:rgba(255,255,255,.88);border:1px solid #e5e7eb;padding:5px 13px;border-radius:99px;}
.rb-preview-hint{font-size:11px;color:#94a3b8;display:flex;align-items:center;gap:4px;}
.rb-pages{display:flex;flex-direction:column;align-items:center;gap:20px;padding:0 20px;}
.rb-page-block{display:flex;flex-direction:column;align-items:center;}
.rb-page-num{font-size:10px;color:#94a3b8;margin-top:6px;}
.rb-sheet{width:595px;background:#fff;box-shadow:0 4px 16px rgba(0,0,0,.14),0 20px 60px rgba(0,0,0,.10);}
.rb-add-page{width:595px;height:52px;border:2px dashed #94a3b8;border-radius:8px;background:rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:600;color:#64748b;cursor:pointer;font-family:inherit;}
.rb-add-page:hover{border-color:#6366f1;color:#6366f1;background:rgba(99,102,241,.05);}
.rb-rm-page{margin-top:5px;padding:4px 12px;border:1px solid #fca5a5;border-radius:6px;background:#fff;color:#ef4444;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;}

.rb-drag{position:relative;}
.rb-drag-handle{position:absolute;left:-26px;top:50%;transform:translateY(-50%);width:20px;height:26px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.28);border-radius:5px;cursor:grab;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.5px;opacity:0;transition:opacity .18s;}
.rb-drag-handle span{width:9px;height:1.5px;background:#6366f1;border-radius:1px;display:block;}
.rb-drag:hover .rb-drag-handle{opacity:1;}
.rb-drag.dragging{opacity:.35;}
.rb-drag.drag-over{outline:2px dashed #6366f1;outline-offset:3px;border-radius:4px;}

.rb-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:460px;gap:6px;color:#cbd5e1;}
.rb-empty-icon{font-size:42px;opacity:.4;}
.rb-empty-text{font-size:13px;font-weight:600;opacity:.6;}
.rb-empty-sub{font-size:11px;opacity:.4;}
`;

// ═══════════════════════════════════════════════════════════════════════════════
// PREVIEW SCALER
// ═══════════════════════════════════════════════════════════════════════════════
function PreviewScaler({ children, containerRef }) {
  const wrapRef  = useRef(null);
  const innerRef = useRef(null);
  useLayoutEffect(() => {
    const recalc = () => {
      const outer = wrapRef.current;
      const inner = innerRef.current;
      if (!outer || !inner) return;
      const parent = containerRef?.current || outer.parentElement;
      const availW = (parent?.clientWidth || 800) - 80;
      const s = Math.min(1, availW / 595);
      inner.style.transform       = `scale(${s})`;
      inner.style.transformOrigin = "top left";
      outer.style.width  = `${595 * s}px`;
      outer.style.height = `${inner.scrollHeight * s}px`;
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    if (innerRef.current)      ro.observe(innerRef.current);
    if (containerRef?.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={wrapRef} style={{ position:"relative", flexShrink:0 }}>
      <div ref={innerRef} style={{ position:"absolute", top:0, left:0, width:595 }}>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE PREVIEW (for blank pages)
// ═══════════════════════════════════════════════════════════════════════════════
function LivePreview({ data, styling, sectionOrder, onReorder }) {
  const { font, accentColor:col, layout, photoPosition, photoSize } = styling;
  const { personal, summary, experience, education, skills, projects, certifications, languages } = data;

  const dragRef = useRef(null);
  const [dragging,  setDragging]  = useState(null);
  const [dragOverId,setDragOver]  = useState(null);
  const onDragStart=(e,id)=>{ dragRef.current=id; setDragging(id); e.dataTransfer.effectAllowed="move"; };
  const onDragOver =(e,id)=>{ e.preventDefault(); setDragOver(id); };
  const onDragEnd  =()=>{ setDragging(null); setDragOver(null); };
  const onDrop     =(e,id)=>{
    e.preventDefault();
    if(dragRef.current===id){onDragEnd();return;}
    const o=[...sectionOrder];
    const from=o.indexOf(dragRef.current), to=o.indexOf(id);
    if(from===-1||to===-1){onDragEnd();return;}
    o.splice(from,1); o.splice(to,0,dragRef.current);
    onReorder(o); onDragEnd();
  };

  const fontStyle = { fontFamily:`'${font}',sans-serif` };
  const pxSize    = PHOTO_SIZES[photoSize]||72;
  const photo     = personal.photo;
  const name      = personal.name||"";
  const title     = personal.title||"";

  const PhotoEl = ({ extraStyle={} }) => !photo ? null : (
    <img src={photo} alt="profile" style={{
      width:pxSize, height:pxSize, borderRadius:"50%",
      objectFit:"cover", border:`2px solid ${col}33`,
      flexShrink:0, ...extraStyle,
    }}/>
  );

  const Heading = ({ label, dark=false }) => (
    <div style={{ borderBottom:`2px solid ${dark?"rgba(255,255,255,.4)":col}`, paddingBottom:2, marginBottom:7 }}>
      <h2 style={{ fontSize:10, fontWeight:800, margin:0,
        color:dark?"#fff":col, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</h2>
    </div>
  );

  const renderBlock = (id, dark=false) => {
    const t  = (w=400) => ({ fontSize:8.5, color:dark?"rgba(255,255,255,.85)":"#333", fontWeight:w });
    const sm = ()      => ({ fontSize:8,   color:dark?"rgba(255,255,255,.6)" :"#777"  });
    switch(id){
      case "summary":
        if(!summary.text) return null;
        return <><Heading label="Professional Summary" dark={dark}/><p style={{...t(),lineHeight:1.65}}>{summary.text}</p></>;
      case "experience":
        if(experience.every(e=>!e.company&&!e.role)) return null;
        return (
          <>
            <Heading label="Work Experience" dark={dark}/>
            {experience.filter(e=>e.company||e.role).map(e=>(
              <div key={e.id} style={{marginBottom:9}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <strong style={t(700)}>{e.role}{e.company?`, ${e.company}`:""}</strong>
                  <span style={sm()}>{e.duration}</span>
                </div>
                {e.location&&<p style={sm()}>{e.location}</p>}
                {e.description&&e.description.split("\n").filter(Boolean).map((l,i)=>(
                  <p key={i} style={{...t(),paddingLeft:8,marginTop:2}}>• {l}</p>
                ))}
              </div>
            ))}
          </>
        );
      case "education":
        if(!education.degree&&!education.college) return null;
        return (
          <>
            <Heading label="Education" dark={dark}/>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <strong style={t(700)}>{education.degree}</strong>
              <span style={sm()}>{education.year}</span>
            </div>
            {education.college&&<p style={{...sm(),fontStyle:"italic"}}>{education.college}</p>}
            {education.gpa&&<p style={sm()}>GPA: {education.gpa}</p>}
          </>
        );
      case "skills":
        if(!skills.some(s=>s.name)) return null;
        return (
          <>
            <Heading label="Skills" dark={dark}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 10px"}}>
              {skills.filter(s=>s.name).map(s=><p key={s.id} style={t()}>• {s.name}</p>)}
            </div>
          </>
        );
      case "projects":
        if(!projects.some(p=>p.name)) return null;
        return (
          <>
            <Heading label="Projects" dark={dark}/>
            {projects.filter(p=>p.name).map(p=>(
              <div key={p.id} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <strong style={t(700)}>{p.name}</strong>
                  {p.stack&&<span style={sm()}>{p.stack}</span>}
                </div>
                {p.description&&<p style={{...t(),marginTop:2}}>{p.description}</p>}
                {p.link&&<p style={{fontSize:8,color:dark?"#a5b4fc":col,marginTop:2}}>🔗 {p.link}</p>}
              </div>
            ))}
          </>
        );
      case "certifications":
        if(!certifications.some(c=>c.name)) return null;
        return (
          <>
            <Heading label="Certifications" dark={dark}/>
            {certifications.filter(c=>c.name).map(c=>(
              <div key={c.id} style={{marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <strong style={t(700)}>{c.name}</strong>
                  {c.date&&<span style={sm()}>{c.date}</span>}
                </div>
                {c.issuer&&<p style={{...sm(),fontStyle:"italic"}}>{c.issuer}</p>}
              </div>
            ))}
          </>
        );
      case "languages":
        if(!languages.some(l=>l.language)) return null;
        return (
          <>
            <Heading label="Languages" dark={dark}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 14px"}}>
              {languages.filter(l=>l.language).map(l=>(
                <p key={l.id} style={t()}><strong>{l.language}</strong> — {l.proficiency}</p>
              ))}
            </div>
          </>
        );
      default: return null;
    }
  };

  const DragSection = ({ id, dark=false, style={} }) => {
    const block = renderBlock(id, dark);
    if(!block) return null;
    return (
      <div
        className={`rb-drag${dragging===id?" dragging":""}${dragOverId===id?" drag-over":""}`}
        draggable
        onDragStart={e=>onDragStart(e,id)}
        onDragOver={e=>onDragOver(e,id)}
        onDrop={e=>onDrop(e,id)}
        onDragEnd={onDragEnd}
        style={{marginBottom:10,...style}}
      >
        <div className="rb-drag-handle"><span/><span/><span/></div>
        {block}
      </div>
    );
  };

  const hasHeader = name||title||personal.email||personal.phone||personal.location;
  const hasAny    = hasHeader||sectionOrder.some(id=>renderBlock(id)!==null);

  const Header = ({ center=false }) => (
    <div style={{
      display:"flex",
      flexDirection: photoPosition==="center"||center ? "column":"row",
      alignItems: photoPosition==="center"||center ? "center":"flex-start",
      gap:12, marginBottom:10,
    }}>
      {photoPosition==="left"   && <PhotoEl/>}
      {photoPosition==="center" && <PhotoEl extraStyle={{margin:"0 auto 6px"}}/>}
      <div style={{flex:1, textAlign:photoPosition==="center"||center?"center":"left"}}>
        {name  && <h1 style={{fontSize:20,fontWeight:900,color:"#111",margin:0,textTransform:"uppercase",letterSpacing:0.4}}>{name}</h1>}
        {title && <h2 style={{fontSize:12,fontWeight:600,color:col,margin:"3px 0 4px"}}>{title}</h2>}
        <p style={{fontSize:8,color:"#555"}}>
          {[personal.location,personal.phone,personal.email,
            personal.linkedin&&`in: ${personal.linkedin}`,
            personal.github&&`gh: ${personal.github}`
          ].filter(Boolean).join(" | ")}
        </p>
      </div>
      {photoPosition==="right" && <PhotoEl/>}
    </div>
  );

  if(layout==="one-col") return (
    <div style={{...fontStyle,background:"#fff",padding:"20px 22px",minHeight:500}}>
      {!hasAny ? (
        <div className="rb-empty">
          <div className="rb-empty-icon">📝</div>
          <div className="rb-empty-text">Start filling your details</div>
          <div className="rb-empty-sub">Your resume will appear here as you type</div>
        </div>
      ):(
        <>
          {hasHeader&&<><Header/><div style={{height:2,background:col,marginBottom:12}}/></>}
          {sectionOrder.map(id=><DragSection key={id} id={id}/>)}
        </>
      )}
    </div>
  );

  if(layout==="two-col") {
    const visible  = sectionOrder.filter(id=>renderBlock(id)!==null);
    const mid      = Math.ceil(visible.length/2);
    const leftSecs = visible.slice(0,mid);
    const rightSecs= visible.slice(mid);
    return (
      <div style={{...fontStyle,background:"#fff",minHeight:500}}>
        {hasHeader&&(
          <div style={{padding:"16px 18px 10px",borderBottom:`2px solid ${col}`}}>
            <Header/>
          </div>
        )}
        {!hasAny ? (
          <div className="rb-empty">
            <div className="rb-empty-icon">📝</div>
            <div className="rb-empty-text">Start filling your details</div>
            <div className="rb-empty-sub">Your resume will appear here as you type</div>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:400}}>
            <div style={{padding:"12px 14px 12px 18px",borderRight:"1px solid #e5e7eb"}}>
              {leftSecs.map(id=><DragSection key={id} id={id}/>)}
              {leftSecs.length===0&&<p style={{fontSize:8,color:"#ccc",fontStyle:"italic"}}>Drag sections here…</p>}
            </div>
            <div style={{padding:"12px 18px 12px 14px"}}>
              {rightSecs.map(id=><DragSection key={id} id={id}/>)}
              {rightSecs.length===0&&<p style={{fontSize:8,color:"#ccc",fontStyle:"italic"}}>Drag sections here…</p>}
            </div>
          </div>
        )}
      </div>
    );
  }

  if(layout==="sidebar-left") {
    const sideIds = sectionOrder.filter(id=>["skills","languages","certifications"].includes(id));
    const mainIds = sectionOrder.filter(id=>!["skills","languages","certifications"].includes(id));
    return (
      <div style={{...fontStyle,background:"#fff",display:"flex",minHeight:500}}>
        <div style={{width:168,flexShrink:0,background:col,padding:"16px 13px",display:"flex",flexDirection:"column",gap:12}}>
          {photo&&(
            <div style={{display:"flex",justifyContent:photoPosition==="right"?"flex-end":photoPosition==="center"?"center":"flex-start"}}>
              <PhotoEl extraStyle={{border:"2px solid rgba(255,255,255,.3)"}}/>
            </div>
          )}
          {(name||title)&&(
            <div>
              {name &&<h2 style={{fontSize:13,fontWeight:900,color:"#fff",margin:0,lineHeight:1.2}}>{name}</h2>}
              {title&&<p style={{fontSize:8.5,color:"rgba(255,255,255,.75)",marginTop:3,fontStyle:"italic"}}>{title}</p>}
            </div>
          )}
          {(personal.email||personal.phone||personal.location)&&(
            <div>
              <div style={{borderBottom:"1px solid rgba(255,255,255,.25)",paddingBottom:4,marginBottom:7}}>
                <span style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,.6)",textTransform:"uppercase",letterSpacing:.8}}>Contact</span>
              </div>
              {personal.location&&<p style={{fontSize:8,color:"rgba(255,255,255,.8)",marginBottom:4}}>📍 {personal.location}</p>}
              {personal.phone   &&<p style={{fontSize:8,color:"rgba(255,255,255,.8)",marginBottom:4}}>📞 {personal.phone}</p>}
              {personal.email   &&<p style={{fontSize:8,color:"rgba(255,255,255,.8)",marginBottom:4,wordBreak:"break-all"}}>✉ {personal.email}</p>}
              {personal.linkedin&&<p style={{fontSize:8,color:"rgba(255,255,255,.8)",marginBottom:4}}>in {personal.linkedin}</p>}
              {personal.github  &&<p style={{fontSize:8,color:"rgba(255,255,255,.8)"}}>⌥ {personal.github}</p>}
            </div>
          )}
          {sideIds.map(id=>(
            <div key={id}
              className={`rb-drag${dragging===id?" dragging":""}${dragOverId===id?" drag-over":""}`}
              draggable
              onDragStart={e=>onDragStart(e,id)}
              onDragOver={e=>onDragOver(e,id)}
              onDrop={e=>onDrop(e,id)}
              onDragEnd={onDragEnd}
            >
              {renderBlock(id,true)}
            </div>
          ))}
        </div>
        <div style={{flex:1,padding:"16px 16px"}}>
          {mainIds.map(id=><DragSection key={id} id={id}/>)}
          {mainIds.length===0&&<p style={{fontSize:8,color:"#ccc",fontStyle:"italic",marginTop:20,textAlign:"center"}}>Fill in your details to see preview…</p>}
        </div>
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORM SECTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function PersonalSection({ data, onChange, styling, onStylingChange }) {
  const s = k => e => onChange({...data,[k]:e.target.value});
  const handlePhoto = e => {
    const f=e.target.files?.[0]; if(!f)return;
    const r=new FileReader();
    r.onload=ev=>onChange({...data,photo:ev.target.result});
    r.readAsDataURL(f);
  };
  return (
    <div>
      <div className="rb-photo-wrap">
        <label className="rb-photo-upload">
          {data.photo
            ? <><img src={data.photo} alt=""/><div className="rb-photo-overlay"><span>✏️</span></div></>
            : "📷"}
          <input type="file" accept="image/*" onChange={handlePhoto}/>
        </label>
        <div style={{flex:1}}>
          <div className="rb-g"><label className="rb-lbl">Full Name</label>
            <input className="rb-in" placeholder="Your Full Name" value={data.name} onChange={s("name")}/></div>
          <div className="rb-g"><label className="rb-lbl">Job Title</label>
            <input className="rb-in" placeholder="Your Job Title" value={data.title} onChange={s("title")}/></div>
        </div>
      </div>

      {data.photo && (
        <div className="rb-photo-controls">
          <div className="rb-photo-ctrl-title">📸 Photo Settings</div>
          <span className="rb-ctrl-label">Position</span>
          <div className="rb-pos-row">
            {["left","center","right"].map(pos=>(
              <button key={pos}
                className={`rb-pos-btn${styling.photoPosition===pos?" on":""}`}
                onClick={()=>onStylingChange({...styling,photoPosition:pos})}>
                {pos==="left"?"◀ Left":pos==="center"?"⬤ Center":"Right ▶"}
              </button>
            ))}
          </div>
          <span className="rb-ctrl-label">Size</span>
          <div className="rb-size-row">
            {["small","medium","large"].map(sz=>(
              <button key={sz}
                className={`rb-size-btn${styling.photoSize===sz?" on":""}`}
                onClick={()=>onStylingChange({...styling,photoSize:sz})}>
                {sz==="small"?"S — Small":sz==="medium"?"M — Medium":"L — Large"}
              </button>
            ))}
          </div>
          <button className="rb-del-photo" onClick={()=>onChange({...data,photo:null})}>
            🗑️ Remove Photo
          </button>
        </div>
      )}

      <div className="rb-row">
        <div className="rb-g"><label className="rb-lbl">Email</label>
          <input className="rb-in" type="email" placeholder="you@email.com" value={data.email} onChange={s("email")}/></div>
        <div className="rb-g"><label className="rb-lbl">Phone</label>
          <input className="rb-in" placeholder="+91 98765 43210" value={data.phone} onChange={s("phone")}/></div>
      </div>
      <div className="rb-row">
        <div className="rb-g"><label className="rb-lbl">Location</label>
          <input className="rb-in" placeholder="City, State" value={data.location} onChange={s("location")}/></div>
        <div className="rb-g"><label className="rb-lbl">LinkedIn</label>
          <input className="rb-in" placeholder="linkedin.com/in/you" value={data.linkedin} onChange={s("linkedin")}/></div>
      </div>
      <div className="rb-g"><label className="rb-lbl">GitHub <span className="opt">(optional)</span></label>
        <input className="rb-in" placeholder="github.com/you" value={data.github} onChange={s("github")}/></div>
    </div>
  );
}

function SummarySection({ data, onChange }) {
  return (
    <div className="rb-g"><label className="rb-lbl">Professional Summary</label>
      <div className="rb-ai-wrap">
        <textarea className="rb-in rb-ta" style={{minHeight:130}}
          placeholder="Write a 2–3 sentence overview…"
          value={data.text} onChange={e=>onChange({...data,text:e.target.value})}/>
        <button className="rb-ai-btn" onClick={()=>onChange({...data,text:AI.summary})}>✨ AI Suggest</button>
      </div>
    </div>
  );
}

function ExperienceSection({ data, onChange }) {
  const upd=(id,k,v)=>onChange(data.map(e=>e.id===id?{...e,[k]:v}:e));
  const rem=id=>onChange(data.filter(e=>e.id!==id));
  return (
    <div>
      {data.map((exp,i)=>(
        <div key={exp.id} className="rb-card">
          <div className="rb-card-head">
            <span className="rb-card-title">Position {i+1}</span>
            {data.length>1&&<button className="rb-rm" onClick={()=>rem(exp.id)}>×</button>}
          </div>
          <div className="rb-row">
            <div className="rb-g"><label className="rb-lbl">Company</label>
              <input className="rb-in" placeholder="Company" value={exp.company} onChange={e=>upd(exp.id,"company",e.target.value)}/></div>
            <div className="rb-g"><label className="rb-lbl">Role</label>
              <input className="rb-in" placeholder="Role" value={exp.role} onChange={e=>upd(exp.id,"role",e.target.value)}/></div>
          </div>
          <div className="rb-row">
            <div className="rb-g"><label className="rb-lbl">Duration</label>
              <input className="rb-in" placeholder="2021 – Present" value={exp.duration} onChange={e=>upd(exp.id,"duration",e.target.value)}/></div>
            <div className="rb-g"><label className="rb-lbl">Location</label>
              <input className="rb-in" placeholder="City / Remote" value={exp.location} onChange={e=>upd(exp.id,"location",e.target.value)}/></div>
          </div>
          <div className="rb-g"><label className="rb-lbl">Description</label>
            <div className="rb-ai-wrap">
              <textarea className="rb-in rb-ta" placeholder="Key responsibilities…"
                value={exp.description} onChange={e=>upd(exp.id,"description",e.target.value)}/>
              <button className="rb-ai-btn" onClick={()=>upd(exp.id,"description",AI.experience)}>✨ AI Suggest</button>
            </div>
          </div>
        </div>
      ))}
      <button className="rb-add" onClick={()=>onChange([...data,makeExp()])}>+ Add Another Position</button>
    </div>
  );
}

function EducationSection({ data, onChange }) {
  const s=k=>e=>onChange({...data,[k]:e.target.value});
  return (
    <div>
      <div className="rb-g"><label className="rb-lbl">Institution</label>
        <input className="rb-in" placeholder="University / College" value={data.college} onChange={s("college")}/></div>
      <div className="rb-row">
        <div className="rb-g"><label className="rb-lbl">Degree</label>
          <input className="rb-in" placeholder="B.E. Computer Science" value={data.degree} onChange={s("degree")}/></div>
        <div className="rb-g"><label className="rb-lbl">Year</label>
          <input className="rb-in" placeholder="2022" value={data.year} onChange={s("year")}/></div>
      </div>
      <div className="rb-g"><label className="rb-lbl">GPA <span className="opt">(optional)</span></label>
        <input className="rb-in" placeholder="8.5 / 10" value={data.gpa} onChange={s("gpa")}/></div>
    </div>
  );
}

function SkillsSection({ data, onChange }) {
  const [ns,setNs]=useState(""); const [nl,setNl]=useState("Intermediate");
  const add=()=>{if(!ns.trim())return;onChange([...data,{id:uid(),name:ns.trim(),level:nl}]);setNs("");};
  return (
    <div>
      <div className="rb-chips">
        {data.filter(s=>s.name).map(s=>(
          <div key={s.id} className="rb-chip">{s.name}
            <span style={{fontSize:9,opacity:.6,marginLeft:2}}>· {s.level}</span>
            <button className="rb-chip-x" onClick={()=>onChange(data.filter(x=>x.id!==s.id))}>×</button>
          </div>
        ))}
        {data.every(s=>!s.name)&&<span style={{fontSize:12,color:"#9ca3af"}}>Add skills below…</span>}
      </div>
      <div className="rb-skill-row">
        <input className="rb-in" style={{flex:1}} placeholder="React.js, Node.js…"
          value={ns} onChange={e=>setNs(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}/>
        <select className="rb-in" style={{width:130}} value={nl} onChange={e=>setNl(e.target.value)}>
          {SKILL_LEVELS.map(l=><option key={l}>{l}</option>)}
        </select>
        <button className="rb-next" style={{borderRadius:7,padding:"8px 13px"}} onClick={add}>Add</button>
      </div>
    </div>
  );
}

function ProjectsSection({ data, onChange }) {
  const upd=(id,k,v)=>onChange(data.map(p=>p.id===id?{...p,[k]:v}:p));
  const rem=id=>onChange(data.filter(p=>p.id!==id));
  return (
    <div>
      {data.map((p,i)=>(
        <div key={p.id} className="rb-card">
          <div className="rb-card-head">
            <span className="rb-card-title">Project {i+1}</span>
            {data.length>1&&<button className="rb-rm" onClick={()=>rem(p.id)}>×</button>}
          </div>
          <div className="rb-row">
            <div className="rb-g"><label className="rb-lbl">Name</label>
              <input className="rb-in" placeholder="Project Name" value={p.name} onChange={e=>upd(p.id,"name",e.target.value)}/></div>
            <div className="rb-g"><label className="rb-lbl">Stack</label>
              <input className="rb-in" placeholder="React, Node" value={p.stack} onChange={e=>upd(p.id,"stack",e.target.value)}/></div>
          </div>
          <div className="rb-g"><label className="rb-lbl">Description</label>
            <div className="rb-ai-wrap">
              <textarea className="rb-in rb-ta" placeholder="What you built…"
                value={p.description} onChange={e=>upd(p.id,"description",e.target.value)}/>
              <button className="rb-ai-btn" onClick={()=>upd(p.id,"description",AI.project)}>✨ AI Suggest</button>
            </div>
          </div>
          <div className="rb-g"><label className="rb-lbl">Link <span className="opt">(optional)</span></label>
            <input className="rb-in" placeholder="github.com/you/project" value={p.link} onChange={e=>upd(p.id,"link",e.target.value)}/></div>
        </div>
      ))}
      <button className="rb-add" onClick={()=>onChange([...data,makeProj()])}>+ Add Another Project</button>
    </div>
  );
}

function CertificationsSection({ data, onChange }) {
  const upd=(id,k,v)=>onChange(data.map(c=>c.id===id?{...c,[k]:v}:c));
  const rem=id=>onChange(data.filter(c=>c.id!==id));
  return (
    <div>
      {data.map((c,i)=>(
        <div key={c.id} className="rb-card">
          <div className="rb-card-head">
            <span className="rb-card-title">Certification {i+1}</span>
            {data.length>1&&<button className="rb-rm" onClick={()=>rem(c.id)}>×</button>}
          </div>
          <div className="rb-row">
            <div className="rb-g"><label className="rb-lbl">Name</label>
              <input className="rb-in" placeholder="AWS Solutions Architect" value={c.name} onChange={e=>upd(c.id,"name",e.target.value)}/></div>
            <div className="rb-g"><label className="rb-lbl">Issuer</label>
              <input className="rb-in" placeholder="Amazon Web Services" value={c.issuer} onChange={e=>upd(c.id,"issuer",e.target.value)}/></div>
          </div>
          <div className="rb-g"><label className="rb-lbl">Date</label>
            <input className="rb-in" placeholder="March 2024" value={c.date} onChange={e=>upd(c.id,"date",e.target.value)}/></div>
          <div className="rb-g"><label className="rb-lbl">Description <span className="opt">(optional)</span></label>
            <div className="rb-ai-wrap">
              <textarea className="rb-in rb-ta" placeholder="What this covers…"
                value={c.description} onChange={e=>upd(c.id,"description",e.target.value)}/>
              <button className="rb-ai-btn" onClick={()=>upd(c.id,"description",AI.certification)}>✨ AI Suggest</button>
            </div>
          </div>
        </div>
      ))}
      <button className="rb-add" onClick={()=>onChange([...data,makeCert()])}>+ Add Another Certification</button>
    </div>
  );
}

function LanguagesSection({ data, onChange }) {
  const upd=(id,k,v)=>onChange(data.map(l=>l.id===id?{...l,[k]:v}:l));
  const rem=id=>onChange(data.filter(l=>l.id!==id));
  return (
    <div>
      {data.map((l,i)=>(
        <div key={l.id} className="rb-card">
          <div className="rb-card-head">
            <span className="rb-card-title">Language {i+1}</span>
            {data.length>1&&<button className="rb-rm" onClick={()=>rem(l.id)}>×</button>}
          </div>
          <div className="rb-row">
            <div className="rb-g"><label className="rb-lbl">Language</label>
              <input className="rb-in" placeholder="Tamil" value={l.language} onChange={e=>upd(l.id,"language",e.target.value)}/></div>
            <div className="rb-g"><label className="rb-lbl">Proficiency</label>
              <select className="rb-in" value={l.proficiency} onChange={e=>upd(l.id,"proficiency",e.target.value)}>
                {PROF_LEVELS.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}
      <button className="rb-add" onClick={()=>onChange([...data,makeLang()])}>+ Add Another Language</button>
    </div>
  );
}

function StylingSection({ data, onChange }) {
  const s=k=>v=>onChange({...data,[k]:v});
  return (
    <div>
      <div className="rb-style-lbl">Resume Layout</div>
      <div className="rb-layout-grid">
        {LAYOUTS.map(l=>(
          <div key={l.id} className={`rb-layout-card${data.layout===l.id?" on":""}`}
            onClick={()=>s("layout")(l.id)}>
            <span className="rb-layout-icon">{l.icon}</span>
            <span className="rb-layout-name">{l.label}</span>
            <span className="rb-layout-desc">{l.desc}</span>
          </div>
        ))}
      </div>
      <div className="rb-style-lbl">Font Family</div>
      <div className="rb-font-grid">
        {FONTS.map(f=>(
          <div key={f} className={`rb-font-opt${data.font===f?" on":""}`}
            style={{fontFamily:`'${f}',sans-serif`}} onClick={()=>s("font")(f)}>{f}</div>
        ))}
      </div>
      <div className="rb-style-lbl">Accent Color</div>
      <div className="rb-color-row">
        {COLORS.map(c=>(
          <div key={c} className={`rb-swatch${data.accentColor===c?" on":""}`}
            style={{background:c}} onClick={()=>s("accentColor")(c)}/>
        ))}
        <input type="color" value={data.accentColor}
          onChange={e=>s("accentColor")(e.target.value)}
          style={{width:28,height:28,border:"none",borderRadius:"50%",cursor:"pointer",padding:0}}/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLANK BUILDER
// ═══════════════════════════════════════════════════════════════════════════════
function BlankBuilder({ galleryColor }) {
  const [st, setSt] = useState({
    ...INIT,
    styling:{...INIT.styling, accentColor:galleryColor||"#2563eb"},
  });
  const [order, setOrder] = useState([...DEFAULT_ORDER]);
  const [pages, setPages] = useState([{id:uid()}]);
  const previewRef = useRef(null);

  const sec    = id => setSt(s=>({...s,activeSection:id}));
  const setFld = (k,v) => setSt(s=>({...s,[k]:v}));
  const idx    = ALL_SECTIONS.findIndex(n=>n.id===st.activeSection);
  const meta   = SECTION_META[st.activeSection];
  const addPage    = () => setPages(p=>[...p,{id:uid()}]);
  const removePage = id => { if(pages.length<=1)return; setPages(p=>p.filter(x=>x.id!==id)); };

  const resumeData = {
    personal:st.personal, summary:st.summary, experience:st.experience,
    education:st.education, skills:st.skills, projects:st.projects,
    certifications:st.certifications, languages:st.languages,
  };

  const renderForm = () => {
    switch(st.activeSection){
      case "personal":       return <PersonalSection data={st.personal} onChange={v=>setFld("personal",v)} styling={st.styling} onStylingChange={v=>setFld("styling",v)}/>;
      case "summary":        return <SummarySection data={st.summary} onChange={v=>setFld("summary",v)}/>;
      case "experience":     return <ExperienceSection data={st.experience} onChange={v=>setFld("experience",v)}/>;
      case "education":      return <EducationSection data={st.education} onChange={v=>setFld("education",v)}/>;
      case "skills":         return <SkillsSection data={st.skills} onChange={v=>setFld("skills",v)}/>;
      case "projects":       return <ProjectsSection data={st.projects} onChange={v=>setFld("projects",v)}/>;
      case "certifications": return <CertificationsSection data={st.certifications} onChange={v=>setFld("certifications",v)}/>;
      case "languages":      return <LanguagesSection data={st.languages} onChange={v=>setFld("languages",v)}/>;
      case "styling":        return <StylingSection data={st.styling} onChange={v=>setFld("styling",v)}/>;
      default: return null;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="rb-bar">
        <span className="rb-bar-title">Resume Builder</span>
        <span className="rb-badge">📄 Blank Resume</span>
        <div className="rb-sep"/>
        <button className="rb-btn rb-btn-ghost" onClick={addPage}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Page
        </button>
        <div className="rb-sep"/>
        <button className="rb-btn">💾 Save</button>
        <button className="rb-btn rb-btn-dark">⬇ Download PDF</button>
      </div>

      <div className="rb-layout">
        <aside className="rb-sidebar">
          {ALL_SECTIONS.map(n=>(
            <button key={n.id} className={`rb-nav${st.activeSection===n.id?" on":""}`} onClick={()=>sec(n.id)}>
              <span className="rb-nav-icon">{n.icon}</span>
              <span className="rb-nav-lbl">{n.label}</span>
            </button>
          ))}
        </aside>

        <div className="rb-content">
          <div className="rb-form">
            <div className="rb-form-head"><h2>{meta.title}</h2><p>{meta.desc}</p></div>
            <div className="rb-form-body">{renderForm()}</div>
            <div className="rb-form-foot">
              <button className="rb-back" disabled={idx===0} onClick={()=>sec(ALL_SECTIONS[idx-1].id)}>‹ Back</button>
              <button className="rb-next" disabled={idx===ALL_SECTIONS.length-1} onClick={()=>sec(ALL_SECTIONS[idx+1].id)}>Next ›</button>
            </div>
          </div>

          <div className="rb-preview" ref={previewRef}>
            <div className="rb-preview-bar">
              <div className="rb-preview-lbl">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                Live Preview
              </div>
              <div className="rb-preview-hint">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                Hover sections to drag &amp; reorder
              </div>
            </div>
            <div className="rb-pages">
              {pages.map((page,pi)=>(
                <div key={page.id} className="rb-page-block">
                  <PreviewScaler containerRef={previewRef}>
                    <div className="rb-sheet">
                      <LivePreview
                        data={resumeData}
                        styling={st.styling}
                        sectionOrder={order}
                        onReorder={setOrder}
                      />
                    </div>
                  </PreviewScaler>
                  <div className="rb-page-num">Page {pi+1} of {pages.length}</div>
                  {pages.length>1&&(
                    <button className="rb-rm-page" onClick={()=>removePage(page.id)}>× Remove page</button>
                  )}
                </div>
              ))}
              <button className="rb-add-page" onClick={addPage}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Another Page 
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE BUILDER (with automatic blank second page for specific templates)
// ═══════════════════════════════════════════════════════════════════════════════
function TemplateBuilder({ galleryTemplate, galleryColor, visibleIds }) {
  const [st, setSt] = useState({
    ...INIT,
    activeSection: visibleIds[0],
    styling: { ...INIT.styling, accentColor: galleryColor || "#2563eb" },
  });

  // Only show Add Page button for these template structures
 const showAddPageStructures = [
  'clean-centered',
  'classic-minimal',
  'bold-two-col',
  'minimalist-top',
  'minimalist-pro',
  'photo-ats',
  'graphic-split'
];
  const showAddPage = showAddPageStructures.includes(galleryTemplate.structure);

  const [pages, setPages] = useState([{ id: uid(), type: 'template' }]); // start with one template page
  const [order, setOrder] = useState([...DEFAULT_ORDER]);

  const filteredSidebar = ALL_SECTIONS.filter(s => visibleIds.includes(s.id));
  const currentIdx = filteredSidebar.findIndex(s => s.id === st.activeSection);
  const previewRef = useRef(null);
  const sec    = id => setSt(s=>({...s,activeSection:id}));
  const setFld = (k,v) => setSt(s=>({...s,[k]:v}));
  const meta   = SECTION_META[st.activeSection];

  const resumeData = {
    personal:st.personal, summary:st.summary, experience:st.experience,
    education:st.education, skills:st.skills, projects:st.projects,
    certifications:st.certifications, languages:st.languages,
  };

  const addPage = () => setPages(p => [...p, { id: uid(), type: 'blank' }]);
  const removePage = (id) => {
    if (pages[0].id === id) return; // never remove the template page
    setPages(p => p.filter(x => x.id !== id));
  };

  const renderForm = () => {
    switch(st.activeSection){
      case "personal":       return <PersonalSection data={st.personal} onChange={v=>setFld("personal",v)} styling={st.styling} onStylingChange={v=>setFld("styling",v)}/>;
      case "summary":        return <SummarySection data={st.summary} onChange={v=>setFld("summary",v)}/>;
      case "experience":     return <ExperienceSection data={st.experience} onChange={v=>setFld("experience",v)}/>;
      case "education":      return <EducationSection data={st.education} onChange={v=>setFld("education",v)}/>;
      case "skills":         return <SkillsSection data={st.skills} onChange={v=>setFld("skills",v)}/>;
      case "projects":       return <ProjectsSection data={st.projects} onChange={v=>setFld("projects",v)}/>;
      case "certifications": return <CertificationsSection data={st.certifications} onChange={v=>setFld("certifications",v)}/>;
      case "languages":      return <LanguagesSection data={st.languages} onChange={v=>setFld("languages",v)}/>;
      case "styling":        return <StylingSection data={st.styling} onChange={v=>setFld("styling",v)}/>;
      default: return null;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="rb-bar">
        <span className="rb-bar-title">Resume Builder</span>
        <span className="rb-badge">📄 {galleryTemplate?.name}</span>
        <div className="rb-sep"/>
        {showAddPage && (
          <>
            <button className="rb-btn rb-btn-ghost" onClick={addPage}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Page
            </button>
            <div className="rb-sep"/>
          </>
        )}
        <button className="rb-btn">💾 Save</button>
        <button className="rb-btn rb-btn-dark">⬇ Download PDF</button>
      </div>

      <div className="rb-layout">
        <aside className="rb-sidebar">
          {filteredSidebar.map(n=>(
            <button key={n.id} className={`rb-nav${st.activeSection===n.id?" on":""}`} onClick={()=>sec(n.id)}>
              <span className="rb-nav-icon">{n.icon}</span>
              <span className="rb-nav-lbl">{n.label}</span>
            </button>
          ))}
        </aside>

        <div className="rb-content">
          <div className="rb-form">
            <div className="rb-form-head"><h2>{meta.title}</h2><p>{meta.desc}</p></div>
            <div className="rb-form-body">{renderForm()}</div>
            <div className="rb-form-foot">
              <button className="rb-back" disabled={currentIdx === 0} onClick={()=>sec(filteredSidebar[currentIdx - 1].id)}>‹ Back</button>
              <button className="rb-next" disabled={currentIdx === filteredSidebar.length - 1} onClick={()=>sec(filteredSidebar[currentIdx + 1].id)}>Next ›</button>
            </div>
          </div>

          <div className="rb-preview" ref={previewRef}>
            <div className="rb-preview-bar">
              <div className="rb-preview-lbl">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
                Live Preview — {galleryTemplate?.name}
              </div>
            </div>
            <div className="rb-pages">
              {pages.map((page, pi) => (
                <div key={page.id} className="rb-page-block">
                  <PreviewScaler containerRef={previewRef}>
                    <div className="rb-sheet">
                      {page.type === 'template' ? (
                        <GalleryPreview
                          tpl={galleryTemplate}
                          data={resumeData}
                          accentColor={st.styling.accentColor}
                          font={st.styling.font}
                        />
                      ) : (
                        <LivePreview
                          data={resumeData}
                          styling={st.styling}
                          sectionOrder={order}
                          onReorder={setOrder}
                        />
                      )}
                    </div>
                  </PreviewScaler>
                  <div className="rb-page-num">Page {pi+1} of {pages.length}</div>
                  {page.type !== 'template' && (
                    <button className="rb-rm-page" onClick={() => removePage(page.id)}>× Remove page</button>
                  )}
                </div>
              ))}
              {/* Bottom "Add Another Page" button removed */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTER — entry point
// ═══════════════════════════════════════════════════════════════════════════════
export default function ResumeBuilderRouter() {
  const location = useLocation();
  
  const galleryTemplate = location.state?.template || { id: 6, name: 'Bold Two-Column', structure: 'bold-two-col' }; 
  const galleryColor    = location.state?.selectedColor || "#2563eb";

const getVisibleSections = (structure) => {
  const base = ["personal", "summary", "experience", "education", "skills", "styling"];

  switch(structure) {
    case 'classic-minimal':
      return [...base, "certifications"];

    case 'bold-two-col':
      return [...base, "projects", "languages"];

    case 'minimalist-top':
    case 'minimalist-pro':
    case 'photo-ats':
    case 'graphic-split':
    case 'clean-centered':
      return [...base, "projects", "languages", "certifications"];

    case 'serif-pro':
      return [...base, "languages"];

    case 'blank-start':
      return ALL_SECTIONS.map(s => s.id);

    default:
      return ALL_SECTIONS.map(s => s.id);
  }
};

  if (galleryTemplate?.structure === "blank-start") {
  return <BlankCanvasBuilder />;
}
  return <TemplateBuilder 
            galleryTemplate={galleryTemplate} 
            galleryColor={galleryColor} 
            visibleIds={getVisibleSections(galleryTemplate.structure)}
         />;
}