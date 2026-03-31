// ResumeBuilderRouter.jsx
// CHANGES:
// 1) Skills section: Star rating + Beginner/Intermediate/Advanced/Expert dropdown — BOTH INDEPENDENTLY SELECTABLE
// 2) Certifications: "Description" renamed to "Key Highlights", AI Suggest button above textarea
// 3) Styling tab: Removed Resume Layout section, changed "Accent Color" to "Theme Color"
// 4) Fixed live preview for Education and all sections
// 5) DatePicker: Beautiful calendar-style UI with month grid, year scroller, Present toggle
//    Supports: Year only | Month+Year | Full Date (Day+Month+Year)

import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
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
  skills:         { title:"Skills",                 desc:"Rate your skills with stars (1–5) and select your level" },
  projects:       { title:"Projects",               desc:"Notable projects you've worked on" },
  certifications: { title:"Certifications",         desc:"Professional certifications" },
  languages:      { title:"Languages",              desc:"Languages you speak" },
  styling:        { title:"Resume Styling",         desc:"Customize fonts & theme colors" },
};

const AI = {
  summary:       "Results-driven professional with 5+ years of experience delivering high-impact outcomes. Proven track record of leading cross-functional teams and shipping products on time.",
  experience:    "Led end-to-end development of a platform that reduced deployment time by 60% and improved reliability to 99.98% uptime.",
  project:       "Built a real-time collaborative tool using React and WebSockets. Supports 50+ concurrent users with <100ms latency.",
  certification: "Completed advanced coursework covering architecture patterns, security best practices, and cost optimization strategies. Demonstrated proficiency through rigorous assessments and hands-on labs.",
};

const STAR_LABELS = { 1:"Beginner", 2:"Elementary", 3:"Intermediate", 4:"Advanced", 5:"Expert" };
const BADGE_OPTIONS = [
  { label:"Beginner",     stars:1, color:"#16a34a", bg:"#f0fdf4", border:"#86efac" },
  { label:"Intermediate", stars:3, color:"#2563eb", bg:"#eff6ff", border:"#93c5fd" },
  { label:"Advanced",     stars:4, color:"#7c3aed", bg:"#f5f3ff", border:"#c4b5fd" },
  { label:"Expert",       stars:5, color:"#dc2626", bg:"#fef2f2", border:"#fca5a5" },
];

const FONTS        = ["DM Sans","Inter","Lato","Merriweather","Playfair Display","Raleway"];
const PROF_LEVELS  = ["Native","Fluent","Advanced","Intermediate","Basic"];
const SKILL_LEVELS = ["Beginner","Intermediate","Advanced","Expert"];
const COLORS       = ["#1e293b","#2563eb","#059669","#dc2626","#7c3aed","#db2777","#b45309","#0f766e","#e11d48","#0f172a"];
const LAYOUTS      = [
  { id:"one-col",      label:"Single Column", icon:"▬",  desc:"Classic top-to-bottom" },
  { id:"two-col",      label:"Two Column",    icon:"▌▐", desc:"Side by side sections" },
  { id:"sidebar-left", label:"Sidebar",       icon:"▌▬", desc:"Dark sidebar + main" },
];
const PHOTO_SIZES = { small:52, medium:72, large:96 };

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL  = ["January","February","March","April","May","June",
                      "July","August","September","October","November","December"];

const uid      = () => Date.now() + Math.random();
const makeExp  = () => ({ id:uid(), company:"", role:"", duration:"", location:"", description:"" });
const makeProj = () => ({ id:uid(), name:"", stack:"", date:"", description:"", link:"" });
const makeCert = () => ({ id:uid(), name:"", issuer:"", date:"", description:"" });
const makeLang = () => ({ id:uid(), language:"", proficiency:"Intermediate", stars:0 });
const makeSkill= () => ({ id:uid(), name:"", level:3, badge:"Intermediate" });
const makeUG     = () => ({ id:uid(), type:"ug",     college:"", degree:"",  branch:"",  startYear:"", endYear:"", gpa:"", highlights:"" });
const makeSchool = () => ({ id:uid(), type:"school", schoolName:"", board:"", stream:"", passingYear:"", percentage:"", highlights:"" });

const INIT = {
  activeSection:"personal",
  personal:       { name:"", title:"", email:"", phone:"", location:"", linkedin:"", github:"", photo:null },
  summary:        { text:"" },
  experience:     [makeExp()],
  education:      { ug:[makeUG()], school:[makeSchool()] },
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
.rb-ta{min-height:82px;resize:vertical;line-height:1.55;}
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
.rb-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;min-height:32px;}
.rb-chip{display:inline-flex;align-items:center;gap:5px;background:#fff;border:1.5px solid #e5e7eb;border-radius:10px;padding:5px 10px 5px 10px;font-size:12px;color:#374151;font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,.06);}
.rb-chip-x{background:none;border:none;cursor:pointer;color:#d1d5db;font-size:14px;padding:0;line-height:1;margin-left:2px;}
.rb-chip-x:hover{color:#ef4444;}

/* ══════════════════════════════════════════════════════
   CALENDAR DATE PICKER
   ══════════════════════════════════════════════════════ */
.dp-wrap{
  background:#fff;border:1.5px solid #e2e8f0;
  border-radius:12px;overflow:hidden;
  box-shadow:0 2px 8px rgba(0,0,0,.06);
}
.dp-header{
  background:linear-gradient(135deg,#6366f1,#8b5cf6);
  padding:12px 14px;
  display:flex;align-items:center;justify-content:space-between;
}
.dp-header-label{
  font-size:12px;font-weight:700;color:#fff;
  display:flex;align-items:center;gap:6px;
}
.dp-present-pill{
  display:flex;align-items:center;gap:6px;
  padding:4px 12px;border-radius:99px;
  border:1.5px solid rgba(255,255,255,.4);
  background:rgba(255,255,255,.15);
  color:#fff;font-size:11px;font-weight:700;
  cursor:pointer;font-family:inherit;
  transition:all .18s;
}
.dp-present-pill.active{
  background:#fff;color:#6366f1;
  border-color:#fff;
}
.dp-present-pill:hover:not(.active){background:rgba(255,255,255,.25);}

.dp-format-bar{
  display:flex;border-bottom:1.5px solid #f1f5f9;
  background:#fafbff;
}
.dp-format-btn{
  flex:1;padding:9px 4px;border:none;
  background:transparent;font-size:11px;font-weight:600;
  color:#64748b;cursor:pointer;font-family:inherit;
  border-bottom:2.5px solid transparent;transition:all .15s;
}
.dp-format-btn.on{color:#6366f1;border-bottom-color:#6366f1;background:#fff;}
.dp-format-btn:hover:not(.on){background:#f5f3ff;color:#6366f1;}

.dp-body{padding:14px;}

/* Year scroller */
.dp-year-scroll{
  display:flex;align-items:center;gap:6px;
  background:#f8fafc;border:1.5px solid #e2e8f0;
  border-radius:9px;padding:8px 10px;margin-bottom:12px;
}
.dp-year-nav{
  width:28px;height:28px;border-radius:7px;border:1.5px solid #e2e8f0;
  background:#fff;color:#6366f1;font-size:14px;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;flex-shrink:0;font-family:inherit;
  transition:all .15s;font-weight:700;
}
.dp-year-nav:hover{background:#eff6ff;border-color:#a5b4fc;}
.dp-year-list{
  display:flex;gap:5px;overflow-x:auto;flex:1;
  scrollbar-width:none;padding:1px 0;
}
.dp-year-list::-webkit-scrollbar{display:none;}
.dp-year-chip{
  flex-shrink:0;padding:5px 12px;border-radius:7px;
  border:1.5px solid #e2e8f0;background:#fff;
  font-size:12px;font-weight:600;color:#374151;
  cursor:pointer;font-family:inherit;transition:all .15s;
  white-space:nowrap;
}
.dp-year-chip.selected{
  background:#6366f1;color:#fff;
  border-color:#6366f1;
  box-shadow:0 2px 8px rgba(99,102,241,.35);
}
.dp-year-chip:hover:not(.selected){background:#f5f3ff;border-color:#a5b4fc;color:#6366f1;}

/* Month grid */
.dp-month-grid{
  display:grid;grid-template-columns:repeat(4,1fr);gap:6px;
  margin-bottom:12px;
}
.dp-month-btn{
  padding:8px 4px;border-radius:8px;
  border:1.5px solid #e2e8f0;background:#fff;
  font-size:12px;font-weight:600;color:#374151;
  cursor:pointer;font-family:inherit;transition:all .15s;
  text-align:center;
}
.dp-month-btn.selected{
  background:#6366f1;color:#fff;border-color:#6366f1;
  box-shadow:0 2px 8px rgba(99,102,241,.3);
}
.dp-month-btn:hover:not(.selected){background:#f5f3ff;border-color:#a5b4fc;color:#6366f1;}

/* Day grid */
.dp-day-label-row{
  display:grid;grid-template-columns:repeat(7,1fr);
  gap:3px;margin-bottom:5px;
}
.dp-day-label{
  text-align:center;font-size:9px;font-weight:700;
  color:#94a3b8;padding:3px 0;text-transform:uppercase;
}
.dp-day-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
.dp-day-btn{
  aspect-ratio:1;border-radius:7px;border:1.5px solid transparent;
  background:transparent;font-size:11px;font-weight:600;
  color:#374151;cursor:pointer;font-family:inherit;transition:all .15s;
  display:flex;align-items:center;justify-content:center;
}
.dp-day-btn.empty{cursor:default;}
.dp-day-btn:not(.empty):hover{background:#f5f3ff;border-color:#a5b4fc;color:#6366f1;}
.dp-day-btn.selected{
  background:#6366f1;color:#fff;border-color:#6366f1;
  box-shadow:0 1px 6px rgba(99,102,241,.4);
}
.dp-day-btn.today{border-color:#fbbf24 !important;}

/* Selected preview chip */
.dp-preview{
  display:flex;align-items:center;gap:6px;
  margin-top:10px;padding:7px 12px;
  background:linear-gradient(135deg,#f5f3ff,#eff6ff);
  border:1.5px solid #c7d2fe;border-radius:8px;
}
.dp-preview-icon{font-size:13px;}
.dp-preview-val{font-size:12px;font-weight:700;color:#4f46e5;}
.dp-preview-clear{
  margin-left:auto;padding:2px 8px;border-radius:6px;
  border:1px solid #c7d2fe;background:#fff;
  color:#6366f1;font-size:10px;font-weight:700;
  cursor:pointer;font-family:inherit;
}
.dp-preview-clear:hover{background:#eff6ff;}

/* Present overlay */
.dp-present-overlay{
  display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:8px;
  padding:24px 14px;text-align:center;
}
.dp-present-badge{
  display:inline-flex;align-items:center;gap:7px;
  padding:10px 20px;border-radius:99px;
  background:linear-gradient(135deg,#6366f1,#8b5cf6);
  color:#fff;font-size:14px;font-weight:800;
  box-shadow:0 4px 14px rgba(99,102,241,.38);
}
.dp-present-sub{font-size:11px;color:#9ca3af;}

/* Duration wrapper */
.dur-wrap{
  background:#f8fafc;border:1.5px solid #e2e8f0;
  border-radius:12px;overflow:hidden;
}
.dur-tab-bar{
  display:flex;background:#fff;
  border-bottom:1.5px solid #f1f5f9;
}
.dur-tab{
  flex:1;padding:9px 4px;border:none;background:transparent;
  font-size:11px;font-weight:700;color:#94a3b8;cursor:pointer;
  font-family:inherit;text-align:center;
  border-bottom:2.5px solid transparent;transition:all .15s;
  display:flex;align-items:center;justify-content:center;gap:5px;
}
.dur-tab.on{color:#6366f1;border-bottom-color:#6366f1;background:#fafbff;}
.dur-tab:hover:not(.on){color:#6366f1;background:#f5f3ff;}
.dur-pane{padding:12px;}
.dur-summary{
  display:flex;align-items:center;gap:8px;
  padding:9px 12px;
  background:linear-gradient(135deg,#f5f3ff,#eff6ff);
  border-radius:9px;margin-bottom:12px;
  border:1.5px solid #c7d2fe;
}
.dur-summary-arrow{font-size:14px;color:#818cf8;flex-shrink:0;}
.dur-summary-text{font-size:12px;font-weight:700;color:#4f46e5;flex:1;}
.dur-summary-empty{font-size:11px;color:#9ca3af;font-style:italic;flex:1;}

/* ════════════════════════════════════════════════════════
   SKILLS SECTION
   ════════════════════════════════════════════════════════ */
.sk-banner{display:flex;align-items:flex-start;gap:10px;background:linear-gradient(135deg,#fefce8,#fdf4ff);border:1.5px solid #fde68a;border-radius:10px;padding:11px 14px;margin-bottom:16px;}
.sk-banner-icon{font-size:20px;flex-shrink:0;margin-top:1px;}
.sk-banner-text{font-size:11.5px;color:#78350f;line-height:1.6;}
.sk-banner-text strong{color:#92400e;}
.sk-add-btn{width:100%;padding:11px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:9px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .18s;box-shadow:0 2px 8px rgba(99,102,241,.28);}
.sk-add-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 14px rgba(99,102,241,.38);}
.sk-add-btn:disabled{opacity:.38;cursor:not-allowed;}
.sk-stars-row{display:flex;gap:4px;align-items:center;margin-bottom:6px;}
.sk-star-btn{background:none;border:none;cursor:pointer;padding:2px;font-size:30px;line-height:1;transition:transform .12s,filter .12s;}
.sk-star-btn:hover{transform:scale(1.22);filter:drop-shadow(0 2px 6px rgba(245,158,11,.5));}
.sk-star-btn.filled{color:#f59e0b;}
.sk-star-btn.empty{color:#e2e8f0;}
.sk-star-btn.hovered{color:#fcd34d;transform:scale(1.18);}
.sk-star-desc{display:flex;justify-content:space-between;padding:0 2px;margin-top:3px;}
.sk-star-desc span{font-size:9px;color:#94a3b8;font-weight:500;}

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

/* Education */
.edu-tab-bar{display:flex;gap:0;background:#f1f5f9;border-radius:12px;padding:4px;margin-bottom:20px;border:1.5px solid #e2e8f0;}
.edu-tab-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:10px 8px;border:none;border-radius:9px;background:transparent;font-size:13px;font-weight:600;color:#64748b;cursor:pointer;font-family:inherit;transition:all .2s ease;position:relative;}
.edu-tab-btn:hover:not(.active){background:rgba(255,255,255,.6);color:#374151;}
.edu-tab-btn.active{background:#fff;color:#111827;box-shadow:0 1px 4px rgba(0,0,0,.1),0 0 0 1px rgba(0,0,0,.06);}
.edu-tab-icon{font-size:16px;line-height:1;}
.edu-tab-label{font-size:13px;font-weight:700;}
.edu-tab-count{min-width:18px;height:18px;background:#6366f1;color:#fff;border-radius:99px;font-size:10px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;padding:0 5px;}
.edu-tab-btn:not(.active) .edu-tab-count{background:#cbd5e1;color:#fff;}
.edu-tab-panel{animation:edu-fade-in .18s ease;}
@keyframes edu-fade-in{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}
.edu-degree-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;padding:15px 15px 12px;margin-bottom:10px;position:relative;transition:border-color .15s;}
.edu-degree-card:hover{border-color:#c7d2fe;}
.edu-degree-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;}
.edu-degree-card-left{display:flex;align-items:center;gap:8px;}
.edu-degree-number{width:24px;height:24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:7px;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.edu-degree-card-title{font-size:12px;font-weight:700;color:#374151;}
.edu-degree-card-sub{font-size:10px;color:#9ca3af;font-weight:400;margin-top:1px;}
.edu-three-col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;}
.edu-two-col{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
.edu-ai-row{display:flex;align-items:center;justify-content:space-between;margin:8px 0 6px;}
.edu-ai-label{font-size:11px;font-weight:700;color:#6366f1;display:flex;align-items:center;gap:4px;}
.edu-ai-sub{font-size:10px;color:#9ca3af;font-weight:400;margin-left:2px;}
.edu-ai-btn{display:flex;align-items:center;gap:5px;padding:5px 12px;border:none;border-radius:7px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 2px 8px rgba(99,102,241,.25);transition:all .18s;}
.edu-ai-btn:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(99,102,241,.38);}
.edu-add-btn{width:100%;padding:11px;background:#fff;border:2px dashed #c7d2fe;border-radius:10px;color:#6366f1;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;margin-top:4px;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .18s;}
.edu-add-btn:hover{border-color:#6366f1;background:#f5f3ff;}
.edu-school-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;padding:15px 15px 12px;margin-bottom:10px;position:relative;transition:border-color .15s;}
.edu-school-card:hover{border-color:#fde68a;}
.edu-school-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;}
.edu-school-number{width:24px;height:24px;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#fff;border-radius:7px;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.edu-empty-hint{text-align:center;padding:30px 20px;color:#94a3b8;font-size:12px;border:2px dashed #e2e8f0;border-radius:12px;margin-bottom:10px;}
.edu-empty-hint-icon{font-size:28px;margin-bottom:8px;display:block;}

/* Summary */
.sum-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
.sum-label{font-size:12px;font-weight:600;color:#374151;}
.sum-info-wrap{position:relative;display:inline-flex;align-items:center;}
.sum-info-btn{width:18px;height:18px;border-radius:50%;border:1.5px solid #c7d2fe;background:#eff6ff;color:#6366f1;font-size:10px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;line-height:1;padding:0;font-family:inherit;transition:all .15s;}
.sum-info-btn:hover{background:#e0e7ff;border-color:#818cf8;}
.sum-tooltip{position:absolute;top:calc(100% + 8px);right:0;width:220px;background:#1e293b;color:#e2e8f0;font-size:11px;line-height:1.55;padding:10px 12px;border-radius:9px;z-index:999;box-shadow:0 8px 24px rgba(0,0,0,.22);pointer-events:none;}
.sum-tooltip::before{content:'';position:absolute;top:-5px;right:6px;width:10px;height:10px;background:#1e293b;transform:rotate(45deg);border-radius:2px;}
.sum-ai-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.sum-ai-label{font-size:11px;font-weight:700;color:#6366f1;letter-spacing:.4px;}
.sum-ai-btn-top{display:flex;align-items:center;gap:5px;padding:5px 13px;border:none;border-radius:7px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .18s;box-shadow:0 2px 8px rgba(99,102,241,.28);}
.sum-ai-btn-top:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(99,102,241,.38);}
.sum-suggestions{display:flex;flex-direction:column;gap:7px;margin-top:10px;}
.sum-suggestion-card{background:linear-gradient(135deg,#f5f3ff 0%,#eff6ff 100%);border:1.5px solid #c7d2fe;border-radius:10px;padding:11px 13px;cursor:pointer;transition:all .18s;position:relative;overflow:hidden;}
.sum-suggestion-card::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:linear-gradient(180deg,#6366f1,#8b5cf6);border-radius:2px 0 0 2px;}
.sum-suggestion-card:hover{border-color:#818cf8;background:linear-gradient(135deg,#ede9fe 0%,#dbeafe 100%);transform:translateX(2px);}
.sum-sug-tag{font-size:9px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;}
.sum-sug-text{font-size:11.5px;color:#374151;line-height:1.6;}
.sum-sug-use{font-size:10px;color:#818cf8;font-weight:600;margin-top:5px;display:flex;align-items:center;gap:3px;}
.sum-chips-hint{font-size:11px;color:#94a3b8;text-align:center;padding:10px 0 4px;font-style:italic;}

.exp-desc-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;}
.exp-desc-left{display:flex;align-items:center;}
@keyframes exp-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

.cert-field-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
.cert-field-label{font-size:12px;font-weight:600;color:#374151;}
.cert-field-sub{font-size:10px;color:#9ca3af;font-weight:400;margin-left:4px;}
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
  }, [children]);
  return (
    <div ref={wrapRef} style={{ position:"relative", flexShrink:0 }}>
      <div ref={innerRef} style={{ position:"absolute", top:0, left:0, width:595 }}>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAR RATING WIDGET
// ═══════════════════════════════════════════════════════════════════════════════
function StarRating({ value, onChange, hovered, setHovered }) {
  return (
    <div>
      <div className="sk-stars-row">
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star} type="button"
            className={`sk-star-btn ${
              hovered > 0
                ? star <= hovered ? "hovered" : "empty"
                : star <= value  ? "filled"  : "empty"
            }`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            title={STAR_LABELS[star]}
          >★</button>
        ))}
      </div>
      <div className="sk-star-desc">
        <span>Beginner</span><span>Elementary</span>
        <span>Intermediate</span><span>Advanced</span><span>Expert</span>
      </div>
    </div>
  );
}



// ═══════════════════════════════════════════════════════════════════════════════
// DURATION PICKER — Start + End with tab UI
// ═══════════════════════════════════════════════════════════════════════════════
function DurationPicker({ value, onChange }) {
  const parseRange = (v) => {
    if (!v) return ["", ""];
    const sep = v.includes(" – ") ? " – " : v.includes(" - ") ? " - " : null;
    if (sep) { const parts = v.split(sep); return [parts[0] || "", parts[1] || ""]; }
    return [v, ""];
  };

  const [startMonth, setStartMonth] = useState(() => {
    const s = parseRange(value)[0];
    return s.includes(" ") ? s.split(" ")[0] : "";
  });
  const [startYear, setStartYear] = useState(() => {
    const s = parseRange(value)[0];
    return s.includes(" ") ? s.split(" ")[1] : s || "";
  });
  const [endMonth, setEndMonth] = useState(() => {
    const e = parseRange(value)[1];
    return e === "Present" ? "" : e.includes(" ") ? e.split(" ")[0] : "";
  });
  const [endYear, setEndYear] = useState(() => {
    const e = parseRange(value)[1];
    return e === "Present" ? "" : e.includes(" ") ? e.split(" ")[1] : e || "";
  });
  const [isPresent, setIsPresent] = useState(() => parseRange(value)[1] === "Present");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => String(currentYear - i));
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const buildStart = (mo, yr) => (mo && yr) ? `${mo} ${yr}` : (yr || mo || "");
  const buildEnd   = (mo, yr, present) => present ? "Present" : (mo && yr) ? `${mo} ${yr}` : (yr || mo || "");

  const handleStartMonth = (v) => { setStartMonth(v); onChange(`${buildStart(v, startYear)} – ${buildEnd(endMonth, endYear, isPresent)}`); };
  const handleStartYear  = (v) => { setStartYear(v);  onChange(`${buildStart(startMonth, v)} – ${buildEnd(endMonth, endYear, isPresent)}`); };
  const handleEndMonth   = (v) => { setEndMonth(v);   onChange(`${buildStart(startMonth, startYear)} – ${buildEnd(v, endYear, isPresent)}`); };
  const handleEndYear    = (v) => { setEndYear(v);    onChange(`${buildStart(startMonth, startYear)} – ${buildEnd(endMonth, v, isPresent)}`); };
  const handlePresent    = () => {
    const next = !isPresent;
    setIsPresent(next);
    if (next) { setEndMonth(""); setEndYear(""); }
    onChange(`${buildStart(startMonth, startYear)} – ${buildEnd(endMonth, endYear, next)}`);
  };

  const summaryText = (startMonth || startYear) || (endMonth || endYear || isPresent)
    ? `${buildStart(startMonth, startYear) || "?"} → ${buildEnd(endMonth, endYear, isPresent) || "?"}`
    : "";

  const selStyle = {
    flex: 1, height: 36, border: "1.5px solid #e5e7eb", borderRadius: 7,
    padding: "0 8px", fontSize: 13, fontFamily: "inherit",
    color: "#111827", background: "#fff", outline: "none", cursor: "pointer",
  };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 5, display: "block" };
  const groupStyle = { display: "flex", flexDirection: "column", flex: 1 };

  return (
    <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
      {/* Summary bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "9px 12px", borderBottom: "1.5px solid #f1f5f9",
        background: summaryText ? "linear-gradient(135deg,#f5f3ff,#eff6ff)" : "#fff",
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={summaryText ? "#6366f1" : "#9ca3af"} strokeWidth="2.5">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {summaryText
          ? <span style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5" }}>{summaryText}</span>
          : <span style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>Select start and end dates below</span>
        }
      </div>

      {/* Date inputs */}
      <div style={{ padding: "12px 12px 10px", display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "end" }}>
        {/* Start */}
        <div style={groupStyle}>
          <span style={labelStyle}>Start date</span>
          <div style={{ display: "flex", gap: 6 }}>
            <select style={selStyle} value={startMonth} onChange={e => handleStartMonth(e.target.value)}>
              <option value="">Month</option>
              {months.map(m => <option key={m}>{m}</option>)}
            </select>
            <select style={selStyle} value={startYear} onChange={e => handleStartYear(e.target.value)}>
              <option value="">Year</option>
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ paddingBottom: 8, color: "#94a3b8", fontSize: 16 }}>→</div>

        {/* End */}
        <div style={groupStyle}>
          <span style={labelStyle}>End date</span>
          <div style={{ display: "flex", gap: 6, opacity: isPresent ? 0.4 : 1, pointerEvents: isPresent ? "none" : "auto", transition: "opacity .2s" }}>
            <select style={selStyle} value={endMonth} onChange={e => handleEndMonth(e.target.value)}>
              <option value="">Month</option>
              {months.map(m => <option key={m}>{m}</option>)}
            </select>
            <select style={selStyle} value={endYear} onChange={e => handleEndYear(e.target.value)}>
              <option value="">Year</option>
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Present toggle */}
      <div style={{ padding: "0 12px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <div
          onClick={handlePresent}
          style={{
            width: 32, height: 18, borderRadius: 9, cursor: "pointer", position: "relative", flexShrink: 0, transition: "background .2s",
            background: isPresent ? "#6366f1" : "#e2e8f0",
          }}
        >
          <div style={{
            width: 14, height: 14, background: "#fff", borderRadius: "50%",
            position: "absolute", top: 2, transition: "left .2s",
            left: isPresent ? 16 : 2,
          }}/>
        </div>
        <span style={{ fontSize: 13, color: "#6b7280" }}>I currently work here</span>
        {isPresent && (
          <span style={{
            marginLeft: 4, fontSize: 11, fontWeight: 700, padding: "2px 8px",
            borderRadius: 99, background: "#ede9fe", color: "#6366f1",
          }}>Present</span>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE PREVIEW
// ═══════════════════════════════════════════════════════════════════════════════
function LivePreview({ data, styling, sectionOrder, onReorder }) {
  const { font, accentColor:col, layout, photoPosition, photoSize } = styling;
  const { personal, summary, experience, education, skills, projects, certifications, languages } = data;

  const dragRef = useRef(null);
  const [dragging, setDragging]   = useState(null);
  const [dragOverId, setDragOver] = useState(null);
  const onDragStart = (e, id) => { dragRef.current = id; setDragging(id); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver  = (e, id) => { e.preventDefault(); setDragOver(id); };
  const onDragEnd   = () => { setDragging(null); setDragOver(null); };
  const onDrop = (e, id) => {
    e.preventDefault();
    if (dragRef.current === id) { onDragEnd(); return; }
    const o = [...sectionOrder];
    const from = o.indexOf(dragRef.current), to = o.indexOf(id);
    if (from === -1 || to === -1) { onDragEnd(); return; }
    o.splice(from, 1); o.splice(to, 0, dragRef.current);
    onReorder(o); onDragEnd();
  };

  const fontStyle = { fontFamily: `'${font}',sans-serif` };
  const pxSize = PHOTO_SIZES[photoSize] || 72;
  const photo = personal.photo;
  const name  = personal.name || "";
  const title = personal.title || "";

  const safeExp    = Array.isArray(experience)     ? experience     : [];
  const safeUG     = Array.isArray(education?.ug)  ? education.ug  : [];
  const safeSchool = Array.isArray(education?.school) ? education.school : [];
  const safeSk     = Array.isArray(skills)         ? skills         : [];
  const safeProj   = Array.isArray(projects)       ? projects       : [];
  const safeCert   = Array.isArray(certifications) ? certifications : [];
  const safeLang   = Array.isArray(languages)      ? languages      : [];

  const PhotoEl  = ({ extraStyle = {} }) => !photo ? null : (
    <img src={photo} alt="profile" style={{ width:pxSize, height:pxSize, borderRadius:"50%", objectFit:"cover", border:`2px solid ${col}33`, flexShrink:0, ...extraStyle }} />
  );
  const Heading  = ({ label, dark = false }) => (
    <div style={{ borderBottom:`2px solid ${dark ? "rgba(255,255,255,.4)" : col}`, paddingBottom:2, marginBottom:7 }}>
      <h2 style={{ fontSize:10, fontWeight:800, margin:0, color: dark ? "#fff" : col, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</h2>
    </div>
  );
  const MiniStars = ({ level }) => (
    <span style={{ fontSize:8, letterSpacing:1 }}>
      {[1,2,3,4,5].map(s => (<span key={s} style={{ color: s <= level ? "#f59e0b" : "#d1d5db" }}>★</span>))}
    </span>
  );

  const renderBlock = (id, dark = false) => {
    const t  = (w = 400) => ({ fontSize:8.5, color: dark ? "rgba(255,255,255,.85)" : "#333", fontWeight:w });
    const sm = ()        => ({ fontSize:8,   color: dark ? "rgba(255,255,255,.6)"  : "#777" });
    switch (id) {
      case "summary":
        if (!summary.text) return null;
        return <><Heading label="Professional Summary" dark={dark}/><p style={{ ...t(), lineHeight:1.65 }}>{summary.text}</p></>;
      case "experience":
        if (safeExp.every(e => !e.company && !e.role)) return null;
        return (<><Heading label="Work Experience" dark={dark}/>{safeExp.filter(e => e.company || e.role).map(e => (<div key={e.id} style={{ marginBottom:9 }}><div style={{ display:"flex", justifyContent:"space-between" }}><div><strong style={t(700)}>{e.role}</strong>{e.company && <p style={sm()}>{e.company}</p>}</div><div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:1 }}>{e.duration && <span style={sm()}>{e.duration}</span>}</div></div>{e.location && <p style={sm()}>{e.location}</p>}{e.description && e.description.split("\n").filter(Boolean).map((l, i) => (<p key={i} style={{ ...t(), paddingLeft:8, marginTop:2 }}>• {l}</p>))}</div>))}</>);
      case "education":
        const hasUG     = safeUG.some(e => e.degree || e.college);
        const hasSchool = safeSchool.some(e => e.schoolName);
        if (!hasUG && !hasSchool) return null;
        return (<><Heading label="Education" dark={dark}/>{safeUG.filter(e => e.degree || e.college).map(e => (<div key={e.id} style={{ marginBottom:12 }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}><div><strong style={t(700)}>{e.degree}{e.branch ? ` — ${e.branch}` : ""}</strong>{e.college && <p style={{ ...sm(), fontStyle:"italic", marginTop:1 }}>{e.college}</p>}</div>{(e.startYear || e.endYear) && (<span style={sm()}>{e.startYear}{e.startYear && e.endYear ? " – " : ""}{e.endYear}</span>)}</div>{e.gpa && <p style={sm()}>CGPA: {e.gpa}</p>}{e.highlights && <p style={{ ...t(), marginTop:2, lineHeight:1.55 }}>{e.highlights}</p>}</div>))}{safeSchool.filter(e => e.schoolName).map(e => (<div key={e.id} style={{ marginBottom:12 }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}><div><strong style={t(700)}>{e.schoolName}</strong>{e.board && <span style={{ ...sm(), marginLeft:4 }}>· {e.board}</span>}{e.stream && <p style={{ ...sm(), fontStyle:"italic", marginTop:1 }}>{e.stream}</p>}</div><span style={sm()}>{e.passingYear}{e.percentage ? ` · ${e.percentage}` : ""}</span></div>{e.highlights && <p style={{ ...t(), marginTop:2, lineHeight:1.55 }}>{e.highlights}</p>}</div>))}</>);
      case "skills":
        if (!safeSk.some(s => s.name)) return null;
        return (<><Heading label="Skills" dark={dark}/><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 10px" }}>{safeSk.filter(s => s.name).map(s => { const badgeColor = s.badge === "Beginner" ? "#16a34a" : s.badge === "Intermediate" ? "#2563eb" : s.badge === "Advanced" ? "#7c3aed" : "#dc2626"; return (<div key={s.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:4 }}><p style={t()}>• {s.name}</p><div style={{ display:"flex", alignItems:"center", gap:4 }}><MiniStars level={typeof s.level === "number" ? s.level : 3}/>{s.badge && <span style={{ fontSize:7, fontWeight:700, color:badgeColor, background:`${badgeColor}15`, padding:"2px 5px", borderRadius:99 }}>{s.badge}</span>}</div></div>); })}</div></>);
      case "projects":
        if (!safeProj.some(p => p.name)) return null;
        return (<><Heading label="Projects" dark={dark}/>{safeProj.filter(p => p.name).map(p => (<div key={p.id} style={{ marginBottom:8 }}><div style={{ display:"flex", justifyContent:"space-between" }}><strong style={t(700)}>{p.name}</strong>{p.stack && <span style={sm()}>{p.stack}</span>}</div>{p.description && <p style={{ ...t(), marginTop:2 }}>{p.description}</p>}{p.link && <p style={{ fontSize:8, color: dark ? "#a5b4fc" : col, marginTop:2 }}>🔗 {p.link}</p>}</div>))}</>);
      case "certifications":
        if (!safeCert.some(c => c.name)) return null;
        return (<><Heading label="Certifications" dark={dark}/>{safeCert.filter(c => c.name).map(c => (<div key={c.id} style={{ marginBottom:6 }}><div style={{ display:"flex", justifyContent:"space-between" }}><strong style={t(700)}>{c.name}</strong>{c.date && <span style={sm()}>{c.date}</span>}</div>{c.issuer && <p style={{ ...sm(), fontStyle:"italic" }}>{c.issuer}</p>}{c.description && <p style={{ ...t(), marginTop:2, lineHeight:1.55 }}>{c.description}</p>}</div>))}</>);
      case "languages":
        if (!safeLang.some(l => l.language)) return null;
        return (<><Heading label="Languages" dark={dark}/><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 14px" }}>{safeLang.filter(l => l.language).map(l => (<p key={l.id} style={t()}><strong>{l.language}</strong> — {l.proficiency}</p>))}</div></>);
      default: return null;
    }
  };

  const DragSection = ({ id, dark = false, style = {} }) => {
    const block = renderBlock(id, dark);
    if (!block) return null;
    return (<div className={`rb-drag${dragging === id ? " dragging" : ""}${dragOverId === id ? " drag-over" : ""}`} draggable onDragStart={e => onDragStart(e, id)} onDragOver={e => onDragOver(e, id)} onDrop={e => onDrop(e, id)} onDragEnd={onDragEnd} style={{ marginBottom:10, ...style }}><div className="rb-drag-handle"><span/><span/><span/></div>{block}</div>);
  };

  const hasHeader = name || title || personal.email || personal.phone || personal.location;
  const hasAny    = hasHeader || sectionOrder.some(id => renderBlock(id) !== null);

  const Header = ({ center = false }) => (
    <div style={{ display:"flex", flexDirection: photoPosition === "center" || center ? "column" : "row", alignItems: photoPosition === "center" || center ? "center" : "flex-start", gap:12, marginBottom:10 }}>
      {photoPosition === "left"   && <PhotoEl/>}
      {photoPosition === "center" && <PhotoEl extraStyle={{ margin:"0 auto 6px" }}/>}
      <div style={{ flex:1, textAlign: photoPosition === "center" || center ? "center" : "left" }}>
        {name  && <h1 style={{ fontSize:20, fontWeight:900, color:"#111", margin:0, textTransform:"uppercase", letterSpacing:0.4 }}>{name}</h1>}
        {title && <h2 style={{ fontSize:12, fontWeight:600, color:col, margin:"3px 0 4px" }}>{title}</h2>}
        <p style={{ fontSize:8, color:"#555" }}>{[personal.location, personal.phone, personal.email, personal.linkedin && `in: ${personal.linkedin}`, personal.github && `gh: ${personal.github}`].filter(Boolean).join(" | ")}</p>
      </div>
      {photoPosition === "right" && <PhotoEl/>}
    </div>
  );

  if (layout === "one-col") return (
    <div style={{ ...fontStyle, background:"#fff", padding:"20px 22px", minHeight:500 }}>
      {!hasAny ? (<div className="rb-empty"><div className="rb-empty-icon">📝</div><div className="rb-empty-text">Start filling your details</div><div className="rb-empty-sub">Your resume will appear here as you type</div></div>)
        : (<>{hasHeader && <><Header/><div style={{ height:2, background:col, marginBottom:12 }}/></>}{sectionOrder.map(id => <DragSection key={id} id={id}/>)}</>)}
    </div>
  );

  if (layout === "two-col") {
    const visible = sectionOrder.filter(id => renderBlock(id) !== null);
    const mid = Math.ceil(visible.length / 2);
    const leftSecs = visible.slice(0, mid); const rightSecs = visible.slice(mid);
    return (<div style={{ ...fontStyle, background:"#fff", minHeight:500 }}>{hasHeader && (<div style={{ padding:"16px 18px 10px", borderBottom:`2px solid ${col}` }}><Header/></div>)}{!hasAny ? (<div className="rb-empty"><div className="rb-empty-icon">📝</div><div className="rb-empty-text">Start filling your details</div><div className="rb-empty-sub">Your resume will appear here as you type</div></div>) : (<div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", minHeight:400 }}><div style={{ padding:"12px 14px 12px 18px", borderRight:"1px solid #e5e7eb" }}>{leftSecs.map(id => <DragSection key={id} id={id}/>)}</div><div style={{ padding:"12px 18px 12px 14px" }}>{rightSecs.map(id => <DragSection key={id} id={id}/>)}</div></div>)}</div>);
  }

  if (layout === "sidebar-left") {
    const sideIds = sectionOrder.filter(id => ["skills","languages","certifications"].includes(id));
    const mainIds = sectionOrder.filter(id => !["skills","languages","certifications"].includes(id));
    return (<div style={{ ...fontStyle, background:"#fff", display:"flex", minHeight:500 }}><div style={{ width:168, flexShrink:0, background:col, padding:"16px 13px", display:"flex", flexDirection:"column", gap:12 }}>{photo && (<div style={{ display:"flex", justifyContent: photoPosition === "right" ? "flex-end" : photoPosition === "center" ? "center" : "flex-start" }}><PhotoEl extraStyle={{ border:"2px solid rgba(255,255,255,.3)" }}/></div>)}{(name || title) && (<div>{name && <h2 style={{ fontSize:13, fontWeight:900, color:"#fff", margin:0, lineHeight:1.2 }}>{name}</h2>}{title && <p style={{ fontSize:8.5, color:"rgba(255,255,255,.75)", marginTop:3, fontStyle:"italic" }}>{title}</p>}</div>)}{(personal.email || personal.phone || personal.location) && (<div><div style={{ borderBottom:"1px solid rgba(255,255,255,.25)", paddingBottom:4, marginBottom:7 }}><span style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:.8 }}>Contact</span></div>{personal.location && <p style={{ fontSize:8, color:"rgba(255,255,255,.8)", marginBottom:4 }}>📍 {personal.location}</p>}{personal.phone && <p style={{ fontSize:8, color:"rgba(255,255,255,.8)", marginBottom:4 }}>📞 {personal.phone}</p>}{personal.email && <p style={{ fontSize:8, color:"rgba(255,255,255,.8)", marginBottom:4, wordBreak:"break-all" }}>✉ {personal.email}</p>}{personal.linkedin && <p style={{ fontSize:8, color:"rgba(255,255,255,.8)", marginBottom:4 }}>in {personal.linkedin}</p>}{personal.github && <p style={{ fontSize:8, color:"rgba(255,255,255,.8)" }}>⌥ {personal.github}</p>}</div>)}{sideIds.map(id => (<div key={id} className={`rb-drag${dragging === id ? " dragging" : ""}${dragOverId === id ? " drag-over" : ""}`} draggable onDragStart={e => onDragStart(e, id)} onDragOver={e => onDragOver(e, id)} onDrop={e => onDrop(e, id)} onDragEnd={onDragEnd}>{renderBlock(id, true)}</div>))}</div><div style={{ flex:1, padding:"16px 16px" }}>{mainIds.map(id => <DragSection key={id} id={id}/>)}</div></div>);
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSONAL SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function PersonalSection({ data, onChange, styling, onStylingChange }) {
  const s = k => e => onChange({ ...data, [k]: e.target.value });
  const handlePhoto = e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => onChange({ ...data, photo: ev.target.result }); r.readAsDataURL(f); };
  return (<div><div className="rb-photo-wrap"><label className="rb-photo-upload">{data.photo ? <><img src={data.photo} alt=""/><div className="rb-photo-overlay"><span>✏️</span></div></> : "📷"}<input type="file" accept="image/*" onChange={handlePhoto}/></label><div style={{ flex:1 }}><div className="rb-g"><label className="rb-lbl">Full Name</label><input className="rb-in" placeholder="Your Full Name" value={data.name} onChange={s("name")}/></div><div className="rb-g"><label className="rb-lbl">Job Title</label><input className="rb-in" placeholder="Your Job Title" value={data.title} onChange={s("title")}/></div></div></div>{data.photo && (<div className="rb-photo-controls"><div className="rb-photo-ctrl-title">📸 Photo Settings</div><span className="rb-ctrl-label">Position</span><div className="rb-pos-row">{["left","center","right"].map(pos => (<button key={pos} className={`rb-pos-btn${styling.photoPosition === pos ? " on" : ""}`} onClick={() => onStylingChange({ ...styling, photoPosition:pos })}>{pos === "left" ? "◀ Left" : pos === "center" ? "⬤ Center" : "Right ▶"}</button>))}</div><span className="rb-ctrl-label">Size</span><div className="rb-size-row">{["small","medium","large"].map(sz => (<button key={sz} className={`rb-size-btn${styling.photoSize === sz ? " on" : ""}`} onClick={() => onStylingChange({ ...styling, photoSize:sz })}>{sz === "small" ? "S — Small" : sz === "medium" ? "M — Medium" : "L — Large"}</button>))}</div><button className="rb-del-photo" onClick={() => onChange({ ...data, photo:null })}>🗑️ Remove Photo</button></div>)}<div className="rb-row"><div className="rb-g"><label className="rb-lbl">Email</label><input className="rb-in" type="email" placeholder="you@email.com" value={data.email} onChange={s("email")}/></div><div className="rb-g"><label className="rb-lbl">Phone</label><input className="rb-in" placeholder="+91 98765 43210" value={data.phone} onChange={s("phone")}/></div></div><div className="rb-row"><div className="rb-g"><label className="rb-lbl">Location</label><input className="rb-in" placeholder="City, State" value={data.location} onChange={s("location")}/></div><div className="rb-g"><label className="rb-lbl">LinkedIn</label><input className="rb-in" placeholder="linkedin.com/in/you" value={data.linkedin} onChange={s("linkedin")}/></div></div><div className="rb-g"><label className="rb-lbl">GitHub <span className="opt">(optional)</span></label><input className="rb-in" placeholder="github.com/you" value={data.github} onChange={s("github")}/></div></div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function SummarySection({ data, onChange, personalData }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [keywords, setKeywords]       = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const jobTitle = personalData?.title || "";

  const wordCount = data.text.trim() === "" ? 0 : data.text.trim().split(/\s+/).length;
  const MIN = 100, MAX = 200;
  const isUnder = wordCount > 0 && wordCount < MIN;
  const isOver  = wordCount > MAX;
  const isGood  = wordCount >= MIN && wordCount <= MAX;
  const counterColor  = isGood ? "#16a34a" : isOver ? "#dc2626" : isUnder ? "#d97706" : "#9ca3af";
  const counterBg     = isGood ? "#f0fdf4" : isOver ? "#fef2f2" : isUnder ? "#fffbeb" : "transparent";
  const counterBorder = isGood ? "#bbf7d0" : isOver ? "#fecaca" : isUnder ? "#fde68a" : "transparent";
  const counterMsg    = isGood ? "✓ Great length" : isOver ? `${wordCount - MAX} words over limit` : isUnder ? `${MIN - wordCount} more words needed` : "100–200 words recommended";

  const handleAISuggest = () => {
    if (!keywords.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const role = jobTitle.trim() || "Professional";
      const kw   = keywords.trim();
      setSuggestions([
        { tag:"Achievement-Led", text:`Results-driven ${role} with expertise in ${kw}, known for delivering high-impact solutions on time and within budget. Adept at leading cross-functional teams, translating complex requirements into scalable systems, and continuously improving processes that drive measurable business outcomes. Passionate about leveraging ${kw} to solve real-world challenges and create lasting organisational value.` },
        { tag:"Skills-Forward",  text:`Versatile ${role} with hands-on experience in ${kw}, collaborating across disciplines to build robust, user-focused applications. Known for strong problem-solving instincts, clear technical communication, and a commitment to clean, maintainable work that stands up in production. Dedicated to continuous learning and applying ${kw} expertise to drive meaningful product outcomes.` },
      ]);
      setLoading(false);
    }, 380);
  };

  return (
    <div>
      <div className="rb-g">
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
          <label className="rb-lbl" style={{ margin:0 }}>Keywords</label>
          <div className="sum-info-wrap">
            <button className="sum-info-btn" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>i</button>
            {showTooltip && (<div className="sum-tooltip" style={{ right:"auto", left:0, top:"calc(100% + 8px)" }}><strong>How it works:</strong><br/>1️⃣ Type your skills or keywords<br/>2️⃣ Click <strong>AI Suggest</strong><br/>3️⃣ Pick one of the 2 options below<br/><br/><em>Tip: Keep your summary between 100–200 words for best ATS results.</em></div>)}
          </div>
          <div style={{ marginLeft:"auto" }}>
            <button className="sum-ai-btn-top" onClick={handleAISuggest} disabled={!keywords.trim() || loading} style={{ opacity:(!keywords.trim() || loading) ? 0.5 : 1, cursor:(!keywords.trim() || loading) ? "not-allowed" : "pointer" }}>
              {loading ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"exp-spin 0.7s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>}
              {loading ? "Generating…" : "AI Suggest"}
            </button>
          </div>
        </div>
        <input className="rb-in" placeholder="e.g. React, team leadership, agile, AWS…" value={keywords} onChange={e => setKeywords(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAISuggest()}/>
      </div>

      <div className="rb-g">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
          <label className="rb-lbl" style={{ margin:0 }}>Professional Summary</label>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:99, background:counterBg, border:`1.5px solid ${counterBorder}`, transition:"all .25s" }}>
            <span style={{ fontSize:11, fontWeight:700, color:counterColor, transition:"color .25s" }}>{wordCount}</span>
            <span style={{ fontSize:10, color:counterColor, opacity:.75, transition:"color .25s" }}>/ {MAX} words</span>
            {wordCount > 0 && (<span style={{ fontSize:10, fontWeight:600, color:counterColor, borderLeft:`1px solid ${counterBorder}`, paddingLeft:6, marginLeft:2, transition:"all .25s" }}>{counterMsg}</span>)}
          </div>
        </div>
        <div style={{ width:"100%", height:3, background:"#f1f5f9", borderRadius:99, marginBottom:6, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${Math.min(100,(wordCount/MAX)*100)}%`, background: isGood ? "#16a34a" : isOver ? "#dc2626" : "#f59e0b", borderRadius:99, transition:"width .3s, background .3s" }}/>
        </div>
        <textarea className="rb-in rb-ta" style={{ minHeight:130, borderColor: isOver ? "#fca5a5" : isGood ? "#86efac" : undefined, transition:"border-color .25s" }} placeholder="Write a 2–3 sentence overview… or type keywords above and click AI Suggest." value={data.text} onChange={e => onChange({ ...data, text:e.target.value })}/>
      </div>

      {suggestions.length > 0 && (
        <div className="sum-suggestions">
          {suggestions.map((s, i) => (
            <div key={i} className="sum-suggestion-card" onClick={() => onChange({ ...data, text:s.text })}>
              <div className="sum-sug-tag">Option {i+1} · {s.tag}</div>
              <div className="sum-sug-text">{s.text}</div>
              <div className="sum-sug-use"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Click to use this</div>
            </div>
          ))}
        </div>
      )}
      {suggestions.length === 0 && keywords.trim() === "" && (
        <div className="sum-chips-hint">Type keywords above → click ✨ AI Suggest to generate 2 summary options</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERIENCE SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function ExpCard({ exp, index, total, onUpd, onRem }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [keywords, setKeywords]       = useState("");

  const wordCount = exp.description.trim() === "" ? 0 : exp.description.trim().split(/\s+/).length;
  const MIN = 200, MAX = 300;
  const isUnder = wordCount > 0 && wordCount < MIN;
  const isOver  = wordCount > MAX;
  const isGood  = wordCount >= MIN && wordCount <= MAX;
  const counterColor  = isGood ? "#16a34a" : isOver ? "#dc2626" : isUnder ? "#d97706" : "#9ca3af";
  const counterBg     = isGood ? "#f0fdf4" : isOver ? "#fef2f2" : isUnder ? "#fffbeb" : "transparent";
  const counterBorder = isGood ? "#bbf7d0" : isOver ? "#fecaca" : isUnder ? "#fde68a" : "transparent";
  const counterMsg    = isGood ? "✓ Great length" : isOver ? `${wordCount - MAX} words over` : isUnder ? `${MIN - wordCount} more needed` : "200–300 words recommended";

  const handleAISuggest = () => {
    if (!keywords.trim() && !exp.company && !exp.role) return;
    setLoading(true);
    setTimeout(() => {
      const role = exp.role?.trim() || "Professional";
      const company = exp.company?.trim() || "";
      const kw = keywords.trim();
      const atComp = company ? ` at ${company}` : "";
      const kwCtx = kw ? ` with expertise in ${kw}` : "";
      setSuggestions([
        { tag:"Impact-Led",           text:`Served as ${role}${atComp}${kwCtx}, driving key initiatives that significantly improved team efficiency and product quality. Led end-to-end delivery of critical features, collaborated with cross-functional stakeholders to define requirements, and ensured on-time deployment with high reliability. Championed best practices in code quality, testing, and documentation, resulting in a measurable reduction in production incidents. Mentored junior team members and contributed to a culture of continuous improvement and technical excellence across the organisation.` },
        { tag:"Responsibility-First", text:`Worked as ${role}${atComp}${kwCtx}, taking full ownership of core workflows and deliverables from planning through to production. Engaged directly with product and design teams to translate business requirements into scalable technical solutions. Maintained a strong focus on performance, security, and maintainability while adapting to shifting project priorities. Consistently delivered high-quality outcomes under tight deadlines and played an active role in sprint planning, code reviews, and technical decision-making within the team.` },
      ]);
      setLoading(false);
    }, 380);
  };

  const hasContext = exp.company || exp.role || keywords.trim();

  return (
    <div className="rb-card">
      <div className="rb-card-head">
        <span className="rb-card-title">Position {index + 1}</span>
        {total > 1 && <button className="rb-rm" onClick={() => onRem(exp.id)}>×</button>}
      </div>
      <div className="rb-row">
        <div className="rb-g"><label className="rb-lbl">Company</label><input className="rb-in" placeholder="Google, TCS…" value={exp.company} onChange={e => onUpd(exp.id,"company",e.target.value)}/></div>
        <div className="rb-g"><label className="rb-lbl">Role</label><input className="rb-in" placeholder="Software Engineer…" value={exp.role} onChange={e => onUpd(exp.id,"role",e.target.value)}/></div>
      </div>
      <div className="rb-g">
        <label className="rb-lbl">Duration</label>
        <DurationPicker value={exp.duration} onChange={v => onUpd(exp.id,"duration",v)}/>
      </div>
      <div className="rb-g"><label className="rb-lbl">Location</label><input className="rb-in" placeholder="City / Remote" value={exp.location} onChange={e => onUpd(exp.id,"location",e.target.value)}/></div>
      <div className="rb-g">
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
          <label className="rb-lbl" style={{ margin:0 }}>Keywords</label>
          <div className="sum-info-wrap">
            <button className="sum-info-btn" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>i</button>
            {showTooltip && (<div className="sum-tooltip" style={{ right:"auto", left:0, top:"calc(100% + 8px)" }}><strong>How it works:</strong><br/>1️⃣ Type skills or tools you used in this role<br/>2️⃣ Click <strong>AI Suggest</strong><br/>3️⃣ Pick one of the 2 options below<br/><br/><em>Tip: Aim for 200–300 words for best ATS visibility.</em></div>)}
          </div>
          <div style={{ marginLeft:"auto" }}>
            <button className="sum-ai-btn-top" onClick={handleAISuggest} disabled={!hasContext || loading} style={{ opacity:(!hasContext || loading) ? 0.5 : 1, cursor:(!hasContext || loading) ? "not-allowed" : "pointer" }}>
              {loading ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"exp-spin 0.7s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>}
              {loading ? "Generating…" : "AI Suggest"}
            </button>
          </div>
        </div>
        <input className="rb-in" placeholder="e.g. React, Node.js, agile, REST APIs, team lead…" value={keywords} onChange={e => setKeywords(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAISuggest()}/>
      </div>
      <div className="rb-g">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
          <label className="rb-lbl" style={{ margin:0 }}>Responsibilities</label>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:99, background:counterBg, border:`1.5px solid ${counterBorder}`, transition:"all .25s" }}>
            <span style={{ fontSize:11, fontWeight:700, color:counterColor }}>{wordCount}</span>
            <span style={{ fontSize:10, color:counterColor, opacity:.75 }}>/ {MAX} words</span>
            {wordCount > 0 && (<span style={{ fontSize:10, fontWeight:600, color:counterColor, borderLeft:`1px solid ${counterBorder}`, paddingLeft:6, marginLeft:2 }}>{counterMsg}</span>)}
          </div>
        </div>
        <div style={{ width:"100%", height:3, background:"#f1f5f9", borderRadius:99, marginBottom:6, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${Math.min(100,(wordCount/MAX)*100)}%`, background: isGood ? "#16a34a" : isOver ? "#dc2626" : "#f59e0b", borderRadius:99, transition:"width .3s, background .3s" }}/>
        </div>
        <textarea className="rb-in rb-ta" style={{ minHeight:110, borderColor: isOver ? "#fca5a5" : isGood ? "#86efac" : undefined, transition:"border-color .25s" }} placeholder={hasContext ? "Type keywords above and click AI Suggest, or write directly…" : "Fill Company & Role above first…"} value={exp.description} onChange={e => onUpd(exp.id,"description",e.target.value)}/>
      </div>
      {suggestions.length > 0 && (
        <div className="sum-suggestions">
          {suggestions.map((s, i) => (
            <div key={i} className="sum-suggestion-card" onClick={() => onUpd(exp.id,"description",s.text)}>
              <div className="sum-sug-tag">Option {i+1} · {s.tag}</div>
              <div className="sum-sug-text">{s.text}</div>
              <div className="sum-sug-use"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Click to use this</div>
            </div>
          ))}
        </div>
      )}
      {suggestions.length === 0 && (<div className="sum-chips-hint">{hasContext ? "Type keywords → click ✨ AI Suggest to generate 2 options" : "Fill Company & Role fields to unlock AI suggestions"}</div>)}
    </div>
  );
}

function ExperienceSection({ data, onChange }) {
  const safeData = Array.isArray(data) ? data : [makeExp()];
  const upd = (id, k, v) => onChange(safeData.map(e => e.id === id ? { ...e, [k]:v } : e));
  const rem = id => onChange(safeData.filter(e => e.id !== id));
  return (<div>{safeData.map((exp, i) => (<ExpCard key={exp.id} exp={exp} index={i} total={safeData.length} onUpd={upd} onRem={rem}/>))}<button className="rb-add" onClick={() => onChange([...safeData, makeExp()])}>+ Add Another Position</button></div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EDUCATION SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function DegreeEntryCard({ edu, index, total, upd, rem }) {
  const genAI = () => { const degree = edu.degree || "the programme"; const branch = edu.branch ? ` in ${edu.branch}` : ""; const inst = edu.college || "the institution"; const period = edu.startYear && edu.endYear ? ` from ${edu.startYear} to ${edu.endYear}` : edu.endYear ? ` graduating in ${edu.endYear}` : ""; const gpa = edu.gpa ? ` Achieved a CGPA of ${edu.gpa}.` : ""; return `Completed ${degree}${branch} at ${inst}${period}.${gpa} Gained in-depth knowledge through rigorous coursework, hands-on projects, and collaborative learning, building a strong foundation for a professional career.`; };
  return (<div className="edu-degree-card"><div className="edu-degree-card-head"><div className="edu-degree-card-left"><div className="edu-degree-number">{index+1}</div><div><div className="edu-degree-card-title">{edu.college || edu.degree ? (edu.degree || "Degree") + (edu.college ? ` · ${edu.college}` : "") : `Education Entry ${index+1}`}</div><div className="edu-degree-card-sub">{edu.startYear || edu.endYear ? `${edu.startYear || ""}${edu.startYear && edu.endYear ? " – " : ""}${edu.endYear || ""}` : "Add college & degree below"}</div></div></div>{total > 1 && <button className="rb-rm" onClick={() => rem(edu.id)}>×</button>}</div><div className="rb-g"><label className="rb-lbl">College / University</label><input className="rb-in" placeholder="e.g. PSG College of Technology…" value={edu.college} onChange={e => upd(edu.id,"college",e.target.value)}/></div><div className="edu-two-col"><div className="rb-g"><label className="rb-lbl">Degree</label><input className="rb-in" placeholder="B.E. / B.Tech / B.Sc…" value={edu.degree} onChange={e => upd(edu.id,"degree",e.target.value)}/></div><div className="rb-g"><label className="rb-lbl">Branch / Specialisation</label><input className="rb-in" placeholder="CSE / ECE / Mech…" value={edu.branch} onChange={e => upd(edu.id,"branch",e.target.value)}/></div></div><div className="edu-three-col"><div className="rb-g"><label className="rb-lbl">Start Year</label><input className="rb-in" placeholder="2018" value={edu.startYear} onChange={e => upd(edu.id,"startYear",e.target.value)}/></div><div className="rb-g"><label className="rb-lbl">End Year</label><input className="rb-in" placeholder="2022" value={edu.endYear} onChange={e => upd(edu.id,"endYear",e.target.value)}/></div><div className="rb-g"><label className="rb-lbl">CGPA / % <span className="opt">opt</span></label><input className="rb-in" placeholder="8.5 / 84%" value={edu.gpa} onChange={e => upd(edu.id,"gpa",e.target.value)}/></div></div><div className="edu-ai-row"><span className="edu-ai-label">✏️ Highlights <span className="edu-ai-sub">(optional)</span></span><button className="edu-ai-btn" onClick={() => upd(edu.id,"highlights",genAI())}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>AI Suggest</button></div><div className="rb-g"><textarea className="rb-in rb-ta" style={{ minHeight:80 }} placeholder="Key projects, publications, awards, relevant coursework… (optional)" value={edu.highlights} onChange={e => upd(edu.id,"highlights",e.target.value)}/></div></div>);
}

function SchoolEntryCard({ edu, index, total, upd, rem }) {
  const genAI = () => { const school = edu.schoolName || "the school"; const stream = edu.stream ? ` (${edu.stream})` : ""; const year = edu.passingYear ? `, passing out in ${edu.passingYear}` : ""; const pct = edu.percentage ? ` Scored ${edu.percentage}.` : ""; return `Completed schooling at ${school}${stream}${year}.${pct} Built a strong academic foundation through focused coursework, extracurricular participation, and consistent performance across core subjects.`; };
  return (<div className="edu-school-card"><div className="edu-school-card-head"><div className="edu-degree-card-left"><div className="edu-school-number">{index+1}</div><div><div className="edu-degree-card-title">{edu.schoolName || `School Entry ${index+1}`}</div><div className="edu-degree-card-sub">{edu.board ? edu.board : "Add school details below"}{edu.passingYear ? ` · ${edu.passingYear}` : ""}</div></div></div>{total > 1 && <button className="rb-rm" onClick={() => rem(edu.id)}>×</button>}</div><div className="rb-g"><label className="rb-lbl">School Name</label><input className="rb-in" placeholder="e.g. St. Joseph's Higher Secondary School" value={edu.schoolName} onChange={e => upd(edu.id,"schoolName",e.target.value)}/></div><div className="edu-two-col"><div className="rb-g"><label className="rb-lbl">Board</label><input className="rb-in" placeholder="CBSE / State Board / ICSE" value={edu.board} onChange={e => upd(edu.id,"board",e.target.value)}/></div><div className="rb-g"><label className="rb-lbl">Stream <span className="opt">opt</span></label><input className="rb-in" placeholder="Science / Commerce / Arts" value={edu.stream} onChange={e => upd(edu.id,"stream",e.target.value)}/></div></div><div className="edu-two-col"><div className="rb-g"><label className="rb-lbl">Passing Year</label><input className="rb-in" placeholder="2018" value={edu.passingYear} onChange={e => upd(edu.id,"passingYear",e.target.value)}/></div><div className="rb-g"><label className="rb-lbl">Percentage / Grade <span className="opt">opt</span></label><input className="rb-in" placeholder="92% / A+" value={edu.percentage} onChange={e => upd(edu.id,"percentage",e.target.value)}/></div></div><div className="edu-ai-row"><span className="edu-ai-label">✏️ Highlights <span className="edu-ai-sub">(optional)</span></span><button className="edu-ai-btn" onClick={() => upd(edu.id,"highlights",genAI())}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>AI Suggest</button></div><div className="rb-g"><textarea className="rb-in rb-ta" style={{ minHeight:80 }} placeholder="Achievements, awards, co-curricular activities… (optional)" value={edu.highlights} onChange={e => upd(edu.id,"highlights",e.target.value)}/></div></div>);
}

function EducationSection({ data, onChange }) {
  const safeUG = Array.isArray(data?.ug) && data.ug.length > 0 ? data.ug : [makeUG()];
  const safeSchool = Array.isArray(data?.school) && data.school.length > 0 ? data.school : [makeSchool()];
  const [activeTab, setActiveTab] = useState("ug");
  const updUG     = (id, k, v) => onChange({ ug: safeUG.map(e => e.id === id ? { ...e, [k]:v } : e), school: safeSchool });
  const remUG     = id => onChange({ ug: safeUG.filter(e => e.id !== id), school: safeSchool });
  const addUG     = () => onChange({ ug: [...safeUG, makeUG()], school: safeSchool });
  const updSchool = (id, k, v) => onChange({ ug: safeUG, school: safeSchool.map(e => e.id === id ? { ...e, [k]:v } : e) });
  const remSchool = id => onChange({ ug: safeUG, school: safeSchool.filter(e => e.id !== id) });
  const addSchool = () => onChange({ ug: safeUG, school: [...safeSchool, makeSchool()] });
  return (<div><div className="edu-tab-bar"><button className={`edu-tab-btn${activeTab === "ug" ? " active" : ""}`} onClick={() => setActiveTab("ug")}><span className="edu-tab-icon">📚</span><span className="edu-tab-label">UG / Degree</span><span className="edu-tab-count">{safeUG.length}</span></button><button className={`edu-tab-btn${activeTab === "school" ? " active" : ""}`} onClick={() => setActiveTab("school")}><span className="edu-tab-icon">🏫</span><span className="edu-tab-label">Schooling</span><span className="edu-tab-count">{safeSchool.length}</span></button></div>{activeTab === "ug" && (<div className="edu-tab-panel">{safeUG.length === 0 ? (<div className="edu-empty-hint"><span className="edu-empty-hint-icon">📚</span>No degree entries yet.</div>) : safeUG.map((edu, i) => (<DegreeEntryCard key={edu.id} edu={edu} index={i} total={safeUG.length} upd={updUG} rem={remUG}/>))}<button className="edu-add-btn" onClick={addUG}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Another Education</button></div>)}{activeTab === "school" && (<div className="edu-tab-panel">{safeSchool.length === 0 ? (<div className="edu-empty-hint"><span className="edu-empty-hint-icon">🏫</span>No schooling entries yet.</div>) : safeSchool.map((edu, i) => (<SchoolEntryCard key={edu.id} edu={edu} index={i} total={safeSchool.length} upd={updSchool} rem={remSchool}/>))}<button className="edu-add-btn" onClick={addSchool}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Another School</button></div>)}</div>);
}

function normaliseEducation(raw) {
  if (raw && !Array.isArray(raw) && (Array.isArray(raw.ug) || Array.isArray(raw.school))) { return { ug: Array.isArray(raw.ug) ? raw.ug : [makeUG()], school: Array.isArray(raw.school) ? raw.school : [makeSchool()] }; }
  if (Array.isArray(raw)) { const ug = raw.filter(e => e.type === "ug" || e.type === "pg" || (!e.type && !e.schoolName)); const school = raw.filter(e => e.type === "school" || e.schoolName); return { ug: ug.length > 0 ? ug.map(e => ({ ...makeUG(), ...e, type:"ug" })) : [makeUG()], school: school.length > 0 ? school.map(e => ({ ...makeSchool(), ...e, type:"school" })) : [makeSchool()] }; }
  return { ug:[makeUG()], school:[makeSchool()] };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKILLS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function SkillsSection({ data, onChange }) {
  const safeData = Array.isArray(data) ? data : [makeSkill()];
  const [hoveredMap, setHoveredMap] = useState({});
  const upd = (id, k, v) => onChange(safeData.map(s => s.id === id ? { ...s, [k]:v } : s));
  const rem = id => onChange(safeData.filter(s => s.id !== id));
  return (
    <div>
      {safeData.map((s, i) => (
        <div key={s.id} className="rb-card">
          <div className="rb-card-head">
            <span className="rb-card-title">Skill {i+1}</span>
            {safeData.length > 1 && <button className="rb-rm" onClick={() => rem(s.id)}>×</button>}
          </div>
          <div className="rb-row">
            <div className="rb-g"><label className="rb-lbl">Skill Name</label><input className="rb-in" placeholder="e.g. React.js, Figma…" value={s.name} onChange={e => upd(s.id,"name",e.target.value)}/></div>
            <div className="rb-g"><label className="rb-lbl">Level</label><select className="rb-in" value={s.badge} onChange={e => upd(s.id,"badge",e.target.value)}>{SKILL_LEVELS.map(l => <option key={l}>{l}</option>)}</select></div>
          </div>
          <div className="rb-g">
            <label className="rb-lbl">Rating <span className="opt">(1–5 stars)</span></label>
            <StarRating value={s.level || 0} onChange={val => upd(s.id,"level",val)} hovered={hoveredMap[s.id] || 0} setHovered={val => setHoveredMap(prev => ({ ...prev, [s.id]:val }))}/>
          </div>
        </div>
      ))}
      <button className="rb-add" onClick={() => onChange([...safeData, makeSkill()])}>+ Add Another Skill</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECTS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function ProjCard({ proj, index, total, onUpd, onRem }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(false);

  const buildSuggestions = (p) => {
    const name = p.name?.trim() || ""; const stack = p.stack?.trim() || "";
    if (!name && !stack) { setSuggestions([]); return; }
    const title = name || "the project"; const techCtx = stack ? ` using ${stack}` : "";
    setSuggestions([
      { tag:"Impact-Led",     text:`Designed and developed ${title}${techCtx}, delivering a seamless user experience with optimized performance. Implemented core features end-to-end, integrated APIs, and ensured cross-platform compatibility. Resulted in measurable improvements in efficiency and user engagement.` },
      { tag:"Technical-Deep", text:`Built ${title}${techCtx} with a focus on scalability and clean architecture. Engineered reusable components, managed state effectively, and applied best practices in code quality and testing. Deployed and maintained the application with zero critical downtime.` },
    ]);
  };

  const handleAISuggest = () => { if (!proj.name && !proj.stack) return; setLoading(true); setTimeout(() => { buildSuggestions(proj); setLoading(false); }, 380); };
  const hasContext = proj.name || proj.stack;

  return (
    <div className="rb-card">
      <div className="rb-card-head"><span className="rb-card-title">Project {index+1}</span>{total > 1 && <button className="rb-rm" onClick={() => onRem(proj.id)}>×</button>}</div>
      <div className="rb-row">
        <div className="rb-g"><label className="rb-lbl">Name</label><input className="rb-in" placeholder="Project Name" value={proj.name} onChange={e => onUpd(proj.id,"name",e.target.value)}/></div>
        <div className="rb-g"><label className="rb-lbl">Stack</label><input className="rb-in" placeholder="React, Node" value={proj.stack} onChange={e => onUpd(proj.id,"stack",e.target.value)}/></div>
      </div>
      <div className="rb-g"><label className="rb-lbl">Date <span className="opt">(optional)</span></label><input className="rb-in" placeholder="2024 / Jan 2024" value={proj.date || ""} onChange={e => onUpd(proj.id,"date",e.target.value)}/></div>
      <div className="rb-g">
        <div className="cert-field-header">
          <span className="cert-field-label">Key Highlights<span className="cert-field-sub">(optional)</span></span>
          <button className="sum-ai-btn-top" onClick={handleAISuggest} disabled={!hasContext || loading} style={{ opacity:(!hasContext || loading) ? 0.5 : 1, cursor:(!hasContext || loading) ? "not-allowed" : "pointer" }}>
            {loading ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"exp-spin 0.7s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>}
            {loading ? "Generating…" : "AI Suggest"}
          </button>
        </div>
        <textarea className="rb-in rb-ta" placeholder={hasContext ? "Click ✨ AI Suggest to generate…" : "Fill Name & Stack above first…"} value={proj.description} onChange={e => onUpd(proj.id,"description",e.target.value)}/>
        {suggestions.length > 0 && (<div className="sum-suggestions" style={{ marginTop:8 }}>{suggestions.map((s, i) => (<div key={i} className="sum-suggestion-card" onClick={() => onUpd(proj.id,"description",s.text)}><div className="sum-sug-tag">Option {i+1} · {s.tag}</div><div className="sum-sug-text">{s.text}</div><div className="sum-sug-use"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Click to use this</div></div>))}</div>)}
        {suggestions.length === 0 && (<div className="sum-chips-hint">{hasContext ? "Click ✨ AI Suggest to generate tailored suggestions" : "Fill Name & Stack fields to unlock AI suggestions"}</div>)}
      </div>
      <div className="rb-g"><label className="rb-lbl">Link <span className="opt">(optional)</span></label><input className="rb-in" placeholder="github.com/you/project" value={proj.link} onChange={e => onUpd(proj.id,"link",e.target.value)}/></div>
    </div>
  );
}

function ProjectsSection({ data, onChange }) {
  const safeData = Array.isArray(data) ? data : [makeProj()];
  const upd = (id, k, v) => onChange(safeData.map(p => p.id === id ? { ...p, [k]:v } : p));
  const rem = id => onChange(safeData.filter(p => p.id !== id));
  return (<div>{safeData.map((p, i) => (<ProjCard key={p.id} proj={p} index={i} total={safeData.length} onUpd={upd} onRem={rem}/>))}<button className="rb-add" onClick={() => onChange([...safeData, makeProj()])}>+ Add Another Project</button></div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CERTIFICATIONS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function CertificationsSection({ data, onChange }) {
  const safeData = Array.isArray(data) ? data : [makeCert()];
  const upd = (id, k, v) => onChange(safeData.map(c => c.id === id ? { ...c, [k]:v } : c));
  const rem = id => onChange(safeData.filter(c => c.id !== id));
  const genAI = (cert) => { const name = cert.name || "the certification"; const issuer = cert.issuer || "the issuing body"; const date = cert.date ? ` in ${cert.date}` : ""; return `Earned ${name} from ${issuer}${date}. ${AI.certification}`; };
  return (<div>{safeData.map((c, i) => (<div key={c.id} className="rb-card"><div className="rb-card-head"><span className="rb-card-title">Certification {i+1}</span>{safeData.length > 1 && <button className="rb-rm" onClick={() => rem(c.id)}>×</button>}</div><div className="rb-row"><div className="rb-g"><label className="rb-lbl">Name</label><input className="rb-in" placeholder="AWS Solutions Architect" value={c.name} onChange={e => upd(c.id,"name",e.target.value)}/></div><div className="rb-g"><label className="rb-lbl">Issuer</label><input className="rb-in" placeholder="Amazon Web Services" value={c.issuer} onChange={e => upd(c.id,"issuer",e.target.value)}/></div></div><div className="rb-g"><label className="rb-lbl">Date</label><input className="rb-in" placeholder="March 2024" value={c.date} onChange={e => upd(c.id,"date",e.target.value)}/></div><div className="rb-g"><div className="cert-field-header"><span className="cert-field-label">Key Highlights<span className="cert-field-sub">(optional)</span></span><button className="sum-ai-btn-top" onClick={() => upd(c.id,"description",genAI(c))}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>AI Suggest</button></div><textarea className="rb-in rb-ta" placeholder="What this certification covers, skills validated, key topics…" value={c.description} onChange={e => upd(c.id,"description",e.target.value)}/></div></div>))}<button className="rb-add" onClick={() => onChange([...safeData, makeCert()])}>+ Add Another Certification</button></div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// LANGUAGES SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function LanguagesSection({ data, onChange }) {
  const safeData = Array.isArray(data) ? data : [makeLang()];
  const upd = (id, k, v) => onChange(safeData.map(l => l.id === id ? { ...l, [k]:v } : l));
  const rem = id => onChange(safeData.filter(l => l.id !== id));
  const [hoveredMap, setHoveredMap] = useState({});
  return (
    <div>
      {safeData.map((l, i) => (
        <div key={l.id} className="rb-card">
          <div className="rb-card-head"><span className="rb-card-title">Language {i+1}</span>{safeData.length > 1 && <button className="rb-rm" onClick={() => rem(l.id)}>×</button>}</div>
          <div className="rb-g"><label className="rb-lbl">Language</label><input className="rb-in" placeholder="Tamil" value={l.language} onChange={e => upd(l.id,"language",e.target.value)}/></div>
          <div className="rb-g"><label className="rb-lbl">Proficiency</label><select className="rb-in" value={l.proficiency} onChange={e => upd(l.id,"proficiency",e.target.value)}>{PROF_LEVELS.map(p => <option key={p}>{p}</option>)}</select></div>
          <div className="rb-g"><label className="rb-lbl">Rating <span className="opt">(1–5 stars)</span></label><StarRating value={l.stars || 0} onChange={val => upd(l.id,"stars",val)} hovered={hoveredMap[l.id] || 0} setHovered={val => setHoveredMap(prev => ({ ...prev, [l.id]:val }))}/></div>
        </div>
      ))}
      <button className="rb-add" onClick={() => onChange([...safeData, makeLang()])}>+ Add Another Language</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLING SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function StylingSection({ data, onChange }) {
  const s = k => v => onChange({ ...data, [k]:v });
  return (<div><div className="rb-style-lbl">Font Family</div><div className="rb-font-grid">{FONTS.map(f => (<div key={f} className={`rb-font-opt${data.font === f ? " on" : ""}`} style={{ fontFamily:`'${f}',sans-serif` }} onClick={() => s("font")(f)}>{f}</div>))}</div><div className="rb-style-lbl" style={{ marginTop:20 }}>Theme Color</div><div className="rb-color-row">{COLORS.map(c => (<div key={c} className={`rb-swatch${data.accentColor === c ? " on" : ""}`} style={{ background:c }} onClick={() => s("accentColor")(c)}/>))}<input type="color" value={data.accentColor} onChange={e => s("accentColor")(e.target.value)} style={{ width:28, height:28, border:"none", borderRadius:"50%", cursor:"pointer", padding:0 }}/></div></div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLANK BUILDER
// ═══════════════════════════════════════════════════════════════════════════════
function BlankBuilder({ galleryColor }) {
  const [st, setSt]       = useState(() => ({ ...INIT, styling: { ...INIT.styling, accentColor: galleryColor || "#2563eb" } }));
  const [order, setOrder] = useState(() => [...DEFAULT_ORDER]);
  const [pages, setPages] = useState(() => [{ id:uid() }]);
  const previewRef        = useRef(null);
  const sec    = id => setSt(s => ({ ...s, activeSection:id }));
  const setFld = (k, v) => setSt(s => ({ ...s, [k]:v }));
  const idx  = ALL_SECTIONS.findIndex(n => n.id === st.activeSection);
  const meta = SECTION_META[st.activeSection];
  const addPage    = () => setPages(p => [...p, { id:uid() }]);
  const removePage = id => { if (pages.length <= 1) return; setPages(p => p.filter(x => x.id !== id)); };
  const eduNorm = normaliseEducation(st.education);
  const resumeData = {
    personal:       st.personal,
    summary:        st.summary,
    experience:     Array.isArray(st.experience)     ? st.experience     : [makeExp()],
    education:      eduNorm,
    skills:         Array.isArray(st.skills)         ? st.skills         : [makeSkill()],
    projects:       Array.isArray(st.projects)       ? st.projects       : [makeProj()],
    certifications: Array.isArray(st.certifications) ? st.certifications : [makeCert()],
    languages:      Array.isArray(st.languages)      ? st.languages      : [makeLang()],
  };
  const renderForm = () => { switch (st.activeSection) { case "personal": return <PersonalSection data={st.personal} onChange={v => setFld("personal",v)} styling={st.styling} onStylingChange={v => setFld("styling",v)}/>; case "summary": return <SummarySection data={st.summary} onChange={v => setFld("summary",v)} personalData={st.personal}/>; case "experience": return <ExperienceSection data={resumeData.experience} onChange={v => setFld("experience",v)}/>; case "education": return <EducationSection data={eduNorm} onChange={v => setFld("education",v)}/>; case "skills": return <SkillsSection data={resumeData.skills} onChange={v => setFld("skills",v)}/>; case "projects": return <ProjectsSection data={resumeData.projects} onChange={v => setFld("projects",v)}/>; case "certifications": return <CertificationsSection data={resumeData.certifications} onChange={v => setFld("certifications",v)}/>; case "languages": return <LanguagesSection data={resumeData.languages} onChange={v => setFld("languages",v)}/>; case "styling": return <StylingSection data={st.styling} onChange={v => setFld("styling",v)}/>; default: return null; } };
  return (
    <><style>{CSS}</style>
    <div className="rb-bar">
      <span className="rb-bar-title">Resume Builder</span>
      <span className="rb-badge">📄 Blank Resume</span>
      <div className="rb-sep"/>
      <button className="rb-btn rb-btn-ghost" onClick={addPage}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Page</button>
      <div className="rb-sep"/>
      <button className="rb-btn">💾 Save</button>
      <button className="rb-btn rb-btn-dark">⬇ Download PDF</button>
    </div>
    <div className="rb-layout">
      <aside className="rb-sidebar">
        {ALL_SECTIONS.map(n => (<button key={n.id} className={`rb-nav${st.activeSection === n.id ? " on" : ""}`} onClick={() => sec(n.id)}><span className="rb-nav-icon">{n.icon}</span><span className="rb-nav-lbl">{n.label}</span></button>))}
      </aside>
      <div className="rb-content">
        <div className="rb-form">
          <div className="rb-form-head"><h2>{meta.title}</h2><p>{meta.desc}</p></div>
          <div className="rb-form-body">{renderForm()}</div>
          <div className="rb-form-foot">
            <button className="rb-back" disabled={idx === 0} onClick={() => sec(ALL_SECTIONS[idx-1].id)}>‹ Back</button>
            <button className="rb-next" disabled={idx === ALL_SECTIONS.length-1} onClick={() => sec(ALL_SECTIONS[idx+1].id)}>Next ›</button>
          </div>
        </div>
        <div className="rb-preview" ref={previewRef}>
          <div className="rb-preview-bar">
            <div className="rb-preview-lbl"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>Live Preview</div>
            <div className="rb-preview-hint"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>Hover sections to drag &amp; reorder</div>
          </div>
          <div className="rb-pages">
            {pages.map((page, pi) => (
              <div key={page.id} className="rb-page-block">
                <PreviewScaler containerRef={previewRef}>
                  <div className="rb-sheet"><LivePreview data={resumeData} styling={st.styling} sectionOrder={order} onReorder={setOrder}/></div>
                </PreviewScaler>
                <div className="rb-page-num">Page {pi+1} of {pages.length}</div>
                {pages.length > 1 && <button className="rb-rm-page" onClick={() => removePage(page.id)}>× Remove page</button>}
              </div>
            ))}
            <button className="rb-add-page" onClick={addPage}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Another Page</button>
          </div>
        </div>
      </div>
    </div></>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE BUILDER
// ═══════════════════════════════════════════════════════════════════════════════
function TemplateBuilder({ galleryTemplate, galleryColor, visibleIds }) {
  const [st, setSt]       = useState(() => ({ ...INIT, activeSection:visibleIds[0], styling: { ...INIT.styling, accentColor: galleryColor || "#2563eb" } }));
  const showAddPageStructures = ['clean-centered','classic-minimal','bold-two-col','minimalist-top','minimalist-pro','photo-ats','graphic-split'];
  const showAddPage = showAddPageStructures.includes(galleryTemplate.structure);
  const [pages, setPages] = useState(() => [{ id:uid(), type:'template' }]);
  const [order, setOrder] = useState(() => [...DEFAULT_ORDER]);
  const filteredSidebar   = ALL_SECTIONS.filter(s => visibleIds.includes(s.id));
  const currentIdx        = filteredSidebar.findIndex(s => s.id === st.activeSection);
  const previewRef        = useRef(null);
  const sec    = id => setSt(s => ({ ...s, activeSection:id }));
  const setFld = (k, v) => setSt(s => ({ ...s, [k]:v }));
  const meta   = SECTION_META[st.activeSection];
  const eduNorm = normaliseEducation(st.education);
  const resumeData = { personal:st.personal, summary:st.summary, experience: Array.isArray(st.experience) ? st.experience : [makeExp()], education:eduNorm, skills: Array.isArray(st.skills) ? st.skills : [makeSkill()], projects: Array.isArray(st.projects) ? st.projects : [makeProj()], certifications: Array.isArray(st.certifications) ? st.certifications : [makeCert()], languages: Array.isArray(st.languages) ? st.languages : [makeLang()] };
  const addPage    = () => setPages(p => [...p, { id:uid(), type:'blank' }]);
  const removePage = id => { if (pages[0].id === id) return; setPages(p => p.filter(x => x.id !== id)); };
  const renderForm = () => { switch (st.activeSection) { case "personal": return <PersonalSection data={st.personal} onChange={v => setFld("personal",v)} styling={st.styling} onStylingChange={v => setFld("styling",v)}/>; case "summary": return <SummarySection data={st.summary} onChange={v => setFld("summary",v)} personalData={st.personal}/>; case "experience": return <ExperienceSection data={resumeData.experience} onChange={v => setFld("experience",v)}/>; case "education": return <EducationSection data={eduNorm} onChange={v => setFld("education",v)}/>; case "skills": return <SkillsSection data={resumeData.skills} onChange={v => setFld("skills",v)}/>; case "projects": return <ProjectsSection data={resumeData.projects} onChange={v => setFld("projects",v)}/>; case "certifications": return <CertificationsSection data={resumeData.certifications} onChange={v => setFld("certifications",v)}/>; case "languages": return <LanguagesSection data={resumeData.languages} onChange={v => setFld("languages",v)}/>; case "styling": return <StylingSection data={st.styling} onChange={v => setFld("styling",v)}/>; default: return null; } };
  return (
    <><style>{CSS}</style>
    <div className="rb-bar">
      <span className="rb-bar-title">Resume Builder</span>
      <span className="rb-badge">📄 {galleryTemplate?.name}</span>
      <div className="rb-sep"/>
      {showAddPage && (<><button className="rb-btn rb-btn-ghost" onClick={addPage}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Page</button><div className="rb-sep"/></>)}
      <button className="rb-btn">💾 Save</button>
      <button className="rb-btn rb-btn-dark">⬇ Download PDF</button>
    </div>
    <div className="rb-layout">
      <aside className="rb-sidebar">
        {filteredSidebar.map(n => (<button key={n.id} className={`rb-nav${st.activeSection === n.id ? " on" : ""}`} onClick={() => sec(n.id)}><span className="rb-nav-icon">{n.icon}</span><span className="rb-nav-lbl">{n.label}</span></button>))}
      </aside>
      <div className="rb-content">
        <div className="rb-form">
          <div className="rb-form-head"><h2>{meta.title}</h2><p>{meta.desc}</p></div>
          <div className="rb-form-body">{renderForm()}</div>
          <div className="rb-form-foot">
            <button className="rb-back" disabled={currentIdx === 0} onClick={() => sec(filteredSidebar[currentIdx-1].id)}>‹ Back</button>
            <button className="rb-next" disabled={currentIdx === filteredSidebar.length-1} onClick={() => sec(filteredSidebar[currentIdx+1].id)}>Next ›</button>
          </div>
        </div>
        <div className="rb-preview" ref={previewRef}>
          <div className="rb-preview-bar">
            <div className="rb-preview-lbl"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>Live Preview — {galleryTemplate?.name}</div>
          </div>
          <div className="rb-pages">
            {pages.map((page, pi) => (
              <div key={page.id} className="rb-page-block">
                <PreviewScaler containerRef={previewRef}>
                  <div className="rb-sheet">
                    {page.type === 'template'
                      ? <GalleryPreview tpl={galleryTemplate} data={resumeData} accentColor={st.styling.accentColor} font={st.styling.font}/>
                      : <LivePreview data={resumeData} styling={st.styling} sectionOrder={order} onReorder={setOrder}/>}
                  </div>
                </PreviewScaler>
                <div className="rb-page-num">Page {pi+1} of {pages.length}</div>
                {page.type !== 'template' && <button className="rb-rm-page" onClick={() => removePage(page.id)}>× Remove page</button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div></>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════════════
export default function ResumeBuilderRouter() {
  const location = useLocation();
  const galleryTemplate = location.state?.template || { id:6, name:'Bold Two-Column', structure:'bold-two-col' };
  const galleryColor    = location.state?.selectedColor || "#2563eb";
  const getVisibleSections = (structure) => {
    const base = ["personal","summary","experience","education","skills","styling"];
    switch (structure) {
      case 'classic-minimal':  return [...base,"certifications"];
      case 'bold-two-col':     return [...base,"projects","languages"];
      case 'minimalist-top':
      case 'minimalist-pro':
      case 'photo-ats':
      case 'graphic-split':
      case 'clean-centered':   return [...base,"projects","languages","certifications"];
      case 'serif-pro':        return [...base,"languages"];
      case 'blank-start':      return ALL_SECTIONS.map(s => s.id);
      default:                 return ALL_SECTIONS.map(s => s.id);
    }
  };
  if (galleryTemplate?.structure === "blank-start") return <BlankCanvasBuilder/>;
  return <TemplateBuilder galleryTemplate={galleryTemplate} galleryColor={galleryColor} visibleIds={getVisibleSections(galleryTemplate.structure)}/>;
}