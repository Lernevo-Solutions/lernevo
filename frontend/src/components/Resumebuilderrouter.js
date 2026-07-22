// ResumeBuilderRouter.jsx
// CHANGES:
// 1) Skills section: Star rating + Beginner/Intermediate/Advanced/Expert dropdown — BOTH INDEPENDENTLY SELECTABLE
// 2) Certifications: "Description" renamed to "Key Highlights", AI Suggest button above textarea
// 3) Styling tab: Removed Resume Layout section, changed "Accent Color" to "Theme Color"
// 4) Fixed live preview for Education and all sections
// 5) DatePicker: Beautiful calendar-style UI with month grid, year scroller, Present toggle
//    Supports: Year only | Month+Year | Full Date (Day+Month+Year)
// 6) Education UG: Replaced Start/End with single "Graduated Year" calendar picker
// 7) Education: AI Suggest btn next to Highlights label (like Summary/Experience)
// 8) Education: Word count shown simply (no progress bar)
// 9) Experience: Calendar view for duration (same InlineDatePicker style)

import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GalleryPreview from "./GalleryPreview";
import BlankCanvasBuilder from "./BlankCanvasBuilder";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from 'axios';
import vertexAIService from '../services/vertexAIService';
import { API_BASE_URL } from "../config";
import {
  DEFAULT_TEMPLATE_DESCRIPTOR,
  buildResumeEditorState,
  buildResumeTemplatePayload,
  getResumePageCount,
  resolveTemplateDescriptor,
} from "./resumeLibraryUtils";

const RESUME_LIBRARY_KEY = "lernevo_resume_library";

const readResumeLibrary = () => {
  try {
    const raw = localStorage.getItem(RESUME_LIBRARY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeResumeLibrary = (items) => {
  localStorage.setItem(RESUME_LIBRARY_KEY, JSON.stringify(items.slice(0, 5)));
};

const upsertResumeLibraryEntry = (entry) => {
  const existing = readResumeLibrary();
  const next = existing.filter((item) => String(item.id) !== String(entry.id));
  next.unshift(entry);
  writeResumeLibrary(next);
};

const syncResumeLibraryFromApi = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/resumes/`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    const items = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.results)
        ? response.data.results
        : [];

    const mapped = items.map((resume) => ({
      id: resume.id,
      title:
        resume.title ||
        resume.personal_info?.full_name ||
        resume.personal_info?.job_title ||
        "My Resume",
      template: resume.template || resume.layout || "Modern",
      updated: resume.updated_at || resume.updated || resume.modified_at || new Date().toISOString(),
    }));

    if (mapped.length) {
      writeResumeLibrary(mapped);
    }

    return mapped;
  } catch (error) {
    return readResumeLibrary();
  }
};

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
const PAGE_SECTION_PRIORITY = [
  ["experience", "projects", "skills"],
  ["certifications", "languages", "education"],
  ["summary", "projects", "experience"],
];

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

const getVisibleSectionsForStructure = (structure) => {
  const base = ["personal", "summary", "experience", "education", "skills", "styling"];
  switch (structure) {
    case "classic-minimal":
      return [...base, "certifications"];
    case "bold-two-col":
      return [...base, "projects", "languages"];
    case "minimalist-top":
    case "minimalist-pro":
    case "photo-ats":
    case "graphic-split":
    case "clean-centered":
      return [...base, "projects", "languages", "certifications"];
    case "serif-pro":
      return [...base, "languages"];
    case "blank-start":
      return ALL_SECTIONS.map((section) => section.id);
    default:
      return ALL_SECTIONS.map((section) => section.id);
  }
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
const makeProj = () => ({ id:uid(), name:"", tech:"", keywords:"", date:"", validTill:"", description:"" });
const makeCert = () => ({ id:uid(), name:"", issuer:"", date:"", description:"" });
const makeLang = () => ({ id:uid(), language:"", proficiency:"Intermediate", stars:0 });
const makeSkill= () => ({ id:uid(), name:"", level:3, badge:"Intermediate" });
const makeUG     = () => ({ id:uid(), type:"ug",     college:"", degree:"",  branch:"",  graduatedYear:"", gpa:"", highlights:"" });
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
  styling: {
    font:"Inter",
    accentColor:"#2563eb",
    layout:"one-col",
    photoPosition:"left",
    photoSize:"medium",
    skillsDisplayMode:"level",
    skillsRatingStyle:"stars",
    languagesDisplayMode:"level",
    languagesRatingStyle:"stars",
  },
};
// BACKEND SAVE LOGIC
const saveResumeToBackend = async (st, order, pages, resumeMeta = {}) => {
  const token = localStorage.getItem('token');
  const resumeId = localStorage.getItem('resumeId');
  const resumeTitle = st.personal?.name ? `${st.personal.name} Resume` : "My Resume";
  const templatePayload = buildResumeTemplatePayload({
    template: resumeMeta.template,
    templateName: resumeMeta.templateName,
    templateStructure: resumeMeta.templateStructure,
    structure: resumeMeta.templateStructure,
    templateId: resumeMeta.templateId,
  });
  const pageCount = Array.isArray(pages)
    ? pages.length
    : Math.max(1, Number.isFinite(Number(pages)) ? Number(pages) + 1 : 1);
  const extraPages = Math.max(0, pageCount - 1);

  const clean = (val) => (val === undefined || val === null ? "" : val);

  const payload = {
    title: st.personal?.name ? `${st.personal.name} Resume` : "My Resume", // Fixed template literal
    font: clean(st.styling?.font),
    theme_color: clean(st.styling?.accentColor),
    layout: clean(st.styling?.layout),
    photo_position: st.styling?.photoPosition || "left",
    photo_size: st.styling?.photoSize || "medium",
    canvas_states: {
      order: order || [],
      pageCount,
      extraPages,
      pages: Array.isArray(pages) ? pages : [],
      template: templatePayload,
    },
    personal_info: {
      full_name: clean(st.personal?.name),
      job_title: clean(st.personal?.title),
      email: clean(st.personal?.email),
      phone: clean(st.personal?.phone),
      location: clean(st.personal?.location),
      linkedin: clean(st.personal?.linkedin),
      github: clean(st.personal?.github),
      photo: st.personal?.photo || null
    },
    summary: {
      text: typeof st.summary === "string" ? st.summary : clean(st.summary?.text)
    },
    experiences: (st.experience || []).map(exp => ({
      company: clean(exp.company),
      role: clean(exp.role),
      duration: clean(exp.duration),
      location: clean(exp.location),
      description: clean(exp.description)
    })),
    ug_education: (st.education?.ug || []).map(e => ({
      college: clean(e.college || e.institution),
      degree: clean(e.degree),
      branch: clean(e.branch),
      graduatedYear: clean(e.graduatedYear || e.graduated_year),
      gpa: clean(e.gpa),
      highlights: clean(e.highlights)
    })),
    school_education: (st.education?.school || []).map(e => ({
      schoolName: clean(e.schoolName || e.institution),
      board: clean(e.board),
      stream: clean(e.stream),
      passingYear: clean(e.passingYear || e.graduated_year),
      percentage: clean(e.percentage || e.gpa),
      highlights: clean(e.highlights)
    })),
    skills: (st.skills || []).map(sk => ({
      name: clean(sk.name),
      level: sk.level ?? 0,
      badge: clean(sk.badge)
    })),
    projects: (st.projects || []).map(pj => ({
      name: clean(pj.name),
      tech: clean(pj.tech || pj.tech_stack),
      description: clean(pj.description),
      date: clean(pj.date)
    })),
    certifications: (st.certifications || []).map(cert => ({
      name: clean(cert.name),
      issuer: clean(cert.issuer),
      date: clean(cert.date),
      description: clean(cert.description)
    })),
    languages: (st.languages || []).map(lang => ({
      language: clean(lang.language),
      proficiency: clean(lang.proficiency),
      stars: lang.stars ?? 0
    }))
  };

  if (!resumeId) {
    await syncResumeLibraryFromApi(token);
  }

  if (resumeId) {
    const response = await axios.patch(`${API_BASE_URL}/resumes/${resumeId}/`, payload, { // Fixed template literal
      headers: {
        Authorization: `Token ${token}`, // Fixed token string
        "Content-Type": "application/json"
      }
    });
    upsertResumeLibraryEntry({
      id: resumeId,
      title: resumeTitle,
      template: templatePayload?.name || resumeMeta.templateName || DEFAULT_TEMPLATE_DESCRIPTOR.name,
      updated: new Date().toLocaleDateString(),
    });
    return response;
  } else {
    const res = await axios.post(`${API_BASE_URL}/resumes/`, payload, { // Fixed template literal
      headers: {
        Authorization: `Token ${token}`, // Fixed token string
        "Content-Type": "application/json"
      }
    });
    localStorage.setItem("resumeId", res.data.id);
    upsertResumeLibraryEntry({
      id: res.data.id,
      title: resumeTitle,
      template: templatePayload?.name || resumeMeta.templateName || DEFAULT_TEMPLATE_DESCRIPTOR.name,
      updated: new Date().toLocaleDateString(),
    });
    return res;
  }
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
.rt-editor-shell{border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;overflow:hidden;transition:border-color .2s, box-shadow .2s;}
.rt-editor-shell:focus-within{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1);}
.rt-editor{min-height:120px;padding:10px 12px 6px;font-size:13px;line-height:1.65;color:#111827;outline:none;white-space:pre-wrap;word-break:break-word;}
.rt-editor:empty:before{content:attr(data-placeholder);color:#9ca3af;}
.rt-toolbar-row{display:flex;justify-content:flex-end;padding:8px 10px 10px;border-top:1px solid #eef2f7;background:#fbfcfe;}
.rt-toolbar{display:inline-flex;align-items:center;gap:6px;}
.rt-btn{width:32px;height:30px;border:1px solid #dbe4f0;border-radius:8px;background:#fff;color:#334155;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;transition:all .15s;}
.rt-btn:hover{border-color:#a5b4fc;background:#eef2ff;color:#4338ca;}
.rt-btn-italic{font-style:italic;}
.rt-btn-underline{text-decoration:underline;}
.word-slider-wrap{margin-bottom:10px;padding:12px 14px;border:1px solid #dbe4f0;border-radius:16px;background:linear-gradient(180deg,#fbfdff,#f4f8ff);}
.word-slider-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;}
.word-slider-label{font-size:12px;font-weight:700;color:#334155;}
.word-slider-value{font-size:12px;font-weight:800;color:#0f172a;}
.word-slider-input{width:100%;accent-color:#2563eb;cursor:pointer;}
.word-slider-scale{display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-top:6px;}
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
.rb-sheet {
  width: 595px;
  min-height: 842px;
  background: #fff;
  margin: auto;
  page-break-after: always;
}
.rb-add-page{width:595px;height:52px;border:2px dashed #94a3b8;border-radius:8px;background:rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:600;color:#64748b;cursor:pointer;font-family:inherit;}
.rb-add-page:hover{border-color:#6366f1;color:#6366f1;background:rgba(99,102,241,.05);}
.rb-rm-page{margin-top:5px;padding:4px 12px;border:1px solid #fca5a5;border-radius:6px;background:#fff;color:#ef4444;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;}
.rb-page-planner{width:595px;background:linear-gradient(145deg,rgba(255,255,255,.98),rgba(248,250,252,.98));border:1px solid rgba(148,163,184,.25);border-radius:20px;padding:20px 22px;box-shadow:0 18px 40px rgba(15,23,42,.08);}
.rb-page-planner-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px;}
.rb-page-planner-kicker{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:rgba(37,99,235,.08);color:#1d4ed8;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;}
.rb-page-planner-title{font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-.02em;margin:10px 0 6px;}
.rb-page-planner-copy{font-size:13px;line-height:1.65;color:#475569;max-width:420px;}
.rb-page-planner-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
.rb-page-planner-card{background:#fff;border:1px solid rgba(203,213,225,.9);border-radius:16px;padding:14px;min-height:112px;box-shadow:0 10px 24px rgba(15,23,42,.05);}
.rb-page-planner-page{font-size:11px;font-weight:800;color:#2563eb;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;}
.rb-page-planner-card-title{font-size:14px;font-weight:700;color:#0f172a;margin-bottom:8px;}
.rb-page-planner-tags{display:flex;flex-wrap:wrap;gap:6px;}
.rb-page-planner-tag{display:inline-flex;align-items:center;padding:5px 10px;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-size:11px;font-weight:700;}
.rb-cont-sheet{min-height:842px;background:linear-gradient(180deg,#ffffff 0%,#f8fafc 100%);padding:32px 34px 28px;display:flex;flex-direction:column;}
.rb-cont-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding-bottom:20px;border-bottom:1px solid rgba(148,163,184,.28);margin-bottom:22px;}
.rb-cont-kicker{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:rgba(15,23,42,.05);color:#334155;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}
.rb-cont-title{font-size:28px;font-weight:800;color:#0f172a;letter-spacing:-.03em;margin:12px 0 6px;}
.rb-cont-copy{font-size:13px;line-height:1.65;color:#475569;max-width:330px;}
.rb-cont-meta{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;max-width:210px;}
.rb-cont-chip{display:inline-flex;align-items:center;justify-content:center;padding:7px 12px;border-radius:999px;background:#fff;border:1px solid rgba(203,213,225,.9);font-size:11px;font-weight:700;color:#334155;}
.rb-cont-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:18px;flex:1;}
.rb-cont-col{display:flex;flex-direction:column;gap:16px;}
.rb-cont-section{background:rgba(255,255,255,.94);border:1px solid rgba(203,213,225,.9);border-radius:18px;padding:16px 16px 14px;box-shadow:0 14px 30px rgba(15,23,42,.05);}
.rb-cont-section-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid rgba(226,232,240,.9);}
.rb-cont-section-title{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#0f172a;}
.rb-cont-section-note{font-size:11px;font-weight:700;color:#64748b;}
.rb-cont-list{display:flex;flex-direction:column;gap:10px;}
.rb-cont-item{padding:12px;border-radius:14px;background:linear-gradient(180deg,#fff,#f8fafc);border:1px solid rgba(226,232,240,.95);}
.rb-cont-item-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:5px;}
.rb-cont-item-title{font-size:13px;font-weight:800;color:#0f172a;line-height:1.4;}
.rb-cont-item-meta{font-size:11px;font-weight:700;color:#64748b;text-align:right;white-space:pre-line;}
.rb-cont-item-sub{font-size:11px;font-weight:700;color:#475569;margin-bottom:5px;}
.rb-cont-item-copy{font-size:11px;line-height:1.6;color:#475569;white-space:pre-line;}
.rb-cont-pill-row{display:flex;flex-wrap:wrap;gap:8px;}
.rb-cont-pill{display:inline-flex;align-items:center;gap:7px;padding:8px 10px;border-radius:12px;background:#fff;border:1px solid rgba(191,219,254,.95);font-size:11px;font-weight:700;color:#1e3a8a;}
.rb-cont-pill-sub{font-size:10px;font-weight:700;color:#64748b;}
.rb-cont-summary{font-size:12px;line-height:1.75;color:#334155;}
.rb-cont-empty{padding:18px;border-radius:14px;border:1px dashed rgba(148,163,184,.5);font-size:12px;line-height:1.7;color:#64748b;background:rgba(248,250,252,.85);}
.rb-cont-footer{margin-top:auto;padding-top:14px;text-align:right;font-size:11px;font-weight:700;color:#94a3b8;}

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

.rb-modal-backdrop{
  position:fixed;
  inset:0;
  z-index:2000;
  background:rgba(15,23,42,.56);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
}
.rb-modal{
  width:min(100%, 560px);
  background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.98));
  border:1px solid rgba(203,213,225,.95);
  border-radius:24px;
  box-shadow:0 32px 80px rgba(15,23,42,.28);
  padding:28px;
  color:#0f172a;
}
.rb-modal-kicker{
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding:6px 12px;
  border-radius:999px;
  background:rgba(37,99,235,.08);
  color:#1d4ed8;
  font-size:11px;
  font-weight:800;
  letter-spacing:.08em;
  text-transform:uppercase;
}
.rb-modal-title{
  font-size:28px;
  line-height:1.15;
  font-weight:800;
  letter-spacing:-.03em;
  margin:14px 0 10px;
}
.rb-modal-copy{
  font-size:14px;
  line-height:1.7;
  color:#475569;
}
.rb-modal-status{
  margin-top:14px;
  padding:12px 14px;
  border-radius:14px;
  background:#ecfdf5;
  color:#065f46;
  font-size:13px;
  font-weight:700;
  border:1px solid rgba(110,231,183,.8);
}
.rb-modal-status.error{
  background:#fef2f2;
  color:#b91c1c;
  border-color:rgba(252,165,165,.85);
}
.rb-modal-actions{
  display:flex;
  gap:12px;
  margin-top:22px;
  flex-wrap:wrap;
}
.rb-modal-actions .rb-btn,
.rb-modal-actions .rb-btn-dark{
  flex:1 1 200px;
  min-height:48px;
  border-radius:14px;
  font-size:14px;
  justify-content:center;
}
.rb-modal-note{
  margin-top:14px;
  font-size:12px;
  color:#94a3b8;
  line-height:1.5;
}

@media (max-width: 640px){
  .rb-modal-backdrop{padding:14px;}
  .rb-modal{padding:22px 18px;border-radius:20px;}
  .rb-modal-title{font-size:24px;}
  .rb-modal-actions{flex-direction:column;}
  .rb-modal-actions .rb-btn,
  .rb-modal-actions .rb-btn-dark{width:100%;flex-basis:auto;}
}

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
.rb-sheet {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
  .rb-sheet {
  margin: 0 auto;
  background: white;
}
  
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
      const parent = containerRef?.current || outer.parentElement?.parentElement;
      const availW = (parent?.clientWidth || 800) - 80;
      const s = Math.min(1, Math.max(0.5, availW / 595));
      const naturalH = inner.scrollHeight;
      inner.style.transform = `scale(${s})`;
      inner.style.transformOrigin = "top left";
      outer.style.width = `${595 * s}px`;
      outer.style.height = `${naturalH * s}px`;
    };
    
    recalc();
    
    const ro = new ResizeObserver(recalc);
    if (innerRef.current) ro.observe(innerRef.current);
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
function ResumeSavedModal({ open, title, message, statusMessage, statusType = "success", onDownloadPdf, onChooseTemplate }) {
  if (!open) return null;

  return (
    <div className="rb-modal-backdrop" role="presentation">
      <div
        className="rb-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-saved-modal-title"
      >
        <span className="rb-modal-kicker">Resume Builder</span>
        <h2 id="resume-saved-modal-title" className="rb-modal-title">{title}</h2>
        <p className="rb-modal-copy">{message}</p>
        {statusMessage ? (
          <div className={`rb-modal-status ${statusType === "error" ? "error" : ""}`}>
            {statusMessage}
          </div>
        ) : null}
        <div className="rb-modal-actions">
          <button className="rb-btn rb-btn-dark" onClick={onDownloadPdf}>
            Download PDF
          </button>
          <button className="rb-btn" onClick={onChooseTemplate}>
            Choose Another Template
          </button>
        </div>
        <div className="rb-modal-note">
          You can keep editing this resume while the modal stays open.
        </div>
      </div>
    </div>
  );
}

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
function DurationPicker({ value, onChange, singleDate = false }) {
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

  if (singleDate) {
    const parts = value ? value.split(" ") : [];
    const sMo = parts.length === 2 ? parts[0] : "";
    const sYr = parts.length === 2 ? parts[1] : (parts.length === 1 ? parts[0] : "");
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, i) => String(currentYear - i));
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const selStyle = {
      flex:1, height:36, border:"1.5px solid #e5e7eb", borderRadius:7,
      padding:"0 8px", fontSize:13, fontFamily:"inherit",
      color:"#111827", background:"#fff", outline:"none", cursor:"pointer",
    };
    return (
      <div style={{ display:"flex", gap:6 }}>
        <select style={selStyle} value={sMo}
          onChange={e => onChange(e.target.value && sYr ? `${e.target.value} ${sYr}` : e.target.value || sYr || "")}>
          <option value="">Month</option>
          {months.map(m => <option key={m}>{m}</option>)}
        </select>
        <select style={selStyle} value={sYr}
          onChange={e => onChange(sMo && e.target.value ? `${sMo} ${e.target.value}` : sMo || e.target.value || "")}>
          <option value="">Year</option>
          {years.map(y => <option key={y}>{y}</option>)}
        </select>
      </div>
    );
  }
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
  const name  = personal.name  || "";
  const title = personal.title || "";

  const safeExp    = Array.isArray(experience)          ? experience          : [];
  const safeUG     = Array.isArray(education?.ug)       ? education.ug       : [];
  const safeSchool = Array.isArray(education?.school)   ? education.school   : [];
  const safeSk     = Array.isArray(skills)              ? skills              : [];
  const safeProj   = Array.isArray(projects)            ? projects            : [];
  const safeCert   = Array.isArray(certifications)      ? certifications      : [];
  const safeLang   = Array.isArray(languages)           ? languages           : [];

  const PhotoEl = ({ extraStyle = {} }) => !photo ? null : (
    <img src={photo} alt="profile" style={{
      width:pxSize, height:pxSize, borderRadius:"50%",
      objectFit:"cover", border:`2px solid ${col}33`,
      flexShrink:0, ...extraStyle,
    }}/>
  );

  const Heading = ({ label, dark = false }) => (
    <div style={{ borderBottom:`2px solid ${dark ? "rgba(255,255,255,.4)" : col}`, paddingBottom:2, marginBottom:7 }}>
      <h2 style={{ fontSize:10, fontWeight:800, margin:0,
        color: dark ? "#fff" : col, textTransform:"uppercase", letterSpacing:0.5 }}>
        {label}
      </h2>
    </div>
  );

  const MiniStars = ({ level }) => (
    <span style={{ fontSize:8, letterSpacing:1 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= level ? "#f59e0b" : "#d1d5db" }}>★</span>
      ))}
    </span>
  );

  const Header = ({ center = false }) => {
    const contacts = [
      personal.location,
      personal.phone,
      personal.email,
      personal.linkedin && `in: ${personal.linkedin}`,
      personal.github   && `gh: ${personal.github}`,
    ].filter(Boolean);

    return (
      <div style={{
        display:"flex",
        flexDirection: photoPosition === "center" || center ? "column" : "row",
        alignItems:    photoPosition === "center" || center ? "center" : "flex-start",
        gap:12, marginBottom:10,
      }}>
        {photoPosition === "left"   && <PhotoEl/>}
        {photoPosition === "center" && <PhotoEl extraStyle={{ margin:"0 auto 6px" }}/>}
        <div style={{ flex:1, textAlign: photoPosition === "center" || center ? "center" : "left" }}>
          {name  && <h1 style={{ fontSize:20, fontWeight:900, color:"#111", margin:0,
            textTransform:"uppercase", letterSpacing:0.4 }}>{name}</h1>}
          {title && <h2 style={{ fontSize:12, fontWeight:600, color:col, margin:"3px 0 4px" }}>{title}</h2>}
          {contacts.length > 0 && (
            <p style={{ fontSize:8, color:"#555", lineHeight:1.6 }}>
              {contacts.join("  |  ")}
            </p>
          )}
        </div>
        {photoPosition === "right" && <PhotoEl/>}
      </div>
    );
  };

  const renderBlock = (id, dark = false) => {
    const t  = (w = 400) => ({ fontSize:8.5, color: dark ? "rgba(255,255,255,.85)" : "#333", fontWeight:w });
    const sm = ()        => ({ fontSize:8,   color: dark ? "rgba(255,255,255,.6)"  : "#777" });

    switch (id) {

      case "summary":
        if (!summary?.text) return null;
        return (
          <>
            <Heading label="Professional Summary" dark={dark}/>
            <p style={{ ...t(), lineHeight:1.65 }}>{summary.text}</p>
          </>
        );

      case "experience": {
        const filled = safeExp.filter(e => e.company || e.role);
        if (!filled.length) return null;
        return (
          <>
            <Heading label="Work Experience" dark={dark}/>
            {filled.map(e => (
              <div key={e.id} style={{ marginBottom:9 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    {e.role    && <strong style={t(700)}>{e.role}</strong>}
                    {e.company && (
                      <p style={{ ...sm(), marginTop:1 }}>
                        {e.company}{e.location ? ` · ${e.location}` : ""}
                      </p>
                    )}
                  </div>
                  {e.duration && (
                    <span style={{ ...sm(), flexShrink:0, marginLeft:8 }}>{e.duration}</span>
                  )}
                </div>
                {e.description && e.description.split("\n").filter(Boolean).map((l, i) => (
                  <p key={i} style={{ ...t(), paddingLeft:8, marginTop:2 }}>• {l}</p>
                ))}
              </div>
            ))}
          </>
        );
      }

      case "education": {
        const hasUG     = safeUG.some(e => e.degree || e.college);
        const hasSchool = safeSchool.some(e => e.schoolName);
        if (!hasUG && !hasSchool) return null;
        return (
          <>
            <Heading label="Education" dark={dark}/>
            {safeUG.filter(e => e.degree || e.college).map(e => (
              <div key={e.id} style={{ marginBottom:9 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <strong style={t(700)}>
                      {e.degree}{e.branch ? ` — ${e.branch}` : ""}
                    </strong>
                    {e.college && (
                      <p style={{ ...sm(), fontStyle:"italic", marginTop:1 }}>{e.college}</p>
                    )}
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0, marginLeft:8 }}>
                    {e.graduatedYear && (
                      <span style={sm()}>Graduated: {e.graduatedYear}</span>
                    )}
                    {e.gpa && <p style={sm()}>CGPA: {e.gpa}</p>}
                  </div>
                </div>
                {e.highlights && (
                  <p style={{ ...t(), marginTop:2, lineHeight:1.55 }}>{e.highlights}</p>
                )}
              </div>
            ))}
            {safeSchool.filter(e => e.schoolName).map(e => (
              <div key={e.id} style={{ marginBottom:9 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <strong style={t(700)}>{e.schoolName}</strong>
                    {(e.board || e.stream) && (
                      <p style={{ ...sm(), marginTop:1 }}>
                        {e.board}{e.board && e.stream ? " · " : ""}{e.stream}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0, marginLeft:8 }}>
                    {e.passingYear && <span style={sm()}>{e.passingYear}</span>}
                    {e.percentage  && <p style={sm()}>{e.percentage}</p>}
                  </div>
                </div>
                {e.highlights && (
                  <p style={{ ...t(), marginTop:2, lineHeight:1.55 }}>{e.highlights}</p>
                )}
              </div>
            ))}
          </>
        );
      }

      case "skills": {
        const filled = safeSk.filter(s => s.name);
        if (!filled.length) return null;
        const BADGE_COLORS = {
          Beginner:"#16a34a", Elementary:"#0284c7", Intermediate:"#7c3aed",
          Advanced:"#d97706", Expert:"#dc2626",
          Basic:"#16a34a",    Native:"#dc2626",
        };
        return (
          <>
            <Heading label="Skills" dark={dark}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 10px" }}>
              {filled.map(s => {
                const badgeColor = BADGE_COLORS[s.badge] || "#6366f1";
                const lvl = typeof s.level === "number" ? s.level : 3;
                return (
                  <div key={s.id} style={{ display:"flex", alignItems:"center",
                    justifyContent:"space-between", gap:4 }}>
                    <p style={t()}>• {s.name}</p>
                    <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                      <MiniStars level={lvl}/>
                      {s.badge && (
                        <span style={{
                          fontSize:7, fontWeight:700, color:badgeColor,
                          background:`${badgeColor}18`, padding:"2px 5px", borderRadius:99,
                        }}>{s.badge}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );
      }

      case "projects": {
        const filled = safeProj.filter(p => p.name);
        if (!filled.length) return null;
        return (
          <>
            <Heading label="Projects" dark={dark}/>
            {filled.map(p => (
              <div key={p.id} style={{ marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <strong style={t(700)}>{p.name}</strong>
                  {(p.tech || p.date) && (
                    <span style={{ ...sm(), flexShrink:0, marginLeft:8 }}>
                      {p.tech}{p.tech && p.date ? " · " : ""}{p.date}
                    </span>
                  )}
                </div>
                {p.description && (
                  <p style={{ ...t(), marginTop:2, lineHeight:1.55 }}>
                    {p.description.length > 200
                      ? p.description.slice(0, 200) + "…"
                      : p.description}
                  </p>
                )}
              </div>
            ))}
          </>
        );
      }

      case "certifications": {
        const filled = safeCert.filter(c => c.name);
        if (!filled.length) return null;
        return (
          <>
            <Heading label="Certifications" dark={dark}/>
            {filled.map(c => (
              <div key={c.id} style={{ marginBottom:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <strong style={t(700)}>{c.name}</strong>
                  {c.date && (
                    <span style={{ ...sm(), flexShrink:0, marginLeft:8 }}>{c.date}</span>
                  )}
                </div>
                {c.issuer && (
                  <p style={{ ...sm(), fontStyle:"italic", marginTop:1 }}>{c.issuer}</p>
                )}
                {c.credentialId && (
                  <p style={sm()}>ID: {c.credentialId}</p>
                )}
                {c.description && (
                  <p style={{ ...t(), marginTop:2, lineHeight:1.55 }}>
                    {c.description.length > 120
                      ? c.description.slice(0, 120) + "…"
                      : c.description}
                  </p>
                )}
              </div>
            ))}
          </>
        );
      }

      case "languages": {
        const filled = safeLang.filter(l => l.language);
        if (!filled.length) return null;
        const LANG_COLORS = {
          Basic:"#16a34a", Elementary:"#0284c7", Intermediate:"#7c3aed",
          Advanced:"#d97706", Native:"#dc2626",
        };
        return (
          <>
            <Heading label="Languages" dark={dark}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 14px" }}>
              {filled.map(l => {
                const lvlColor = LANG_COLORS[l.proficiency] || "#6b7280";
                return (
                  <div key={l.id} style={{ display:"flex", alignItems:"center",
                    justifyContent:"space-between", gap:4 }}>
                    <p style={t()}><strong>{l.language}</strong></p>
                    <span style={{
                      fontSize:7, fontWeight:700, color:lvlColor,
                      background:`${lvlColor}18`, padding:"2px 6px", borderRadius:99, flexShrink:0,
                    }}>{l.proficiency}</span>
                  </div>
                );
              })}
            </div>
          </>
        );
      }

      default: return null;
    }
  };

  const DragSection = ({ id, dark = false, style = {} }) => {
    const block = renderBlock(id, dark);
    if (!block) return null;
    return (
      <div
        className={`rb-drag${dragging === id ? " dragging" : ""}${dragOverId === id ? " drag-over" : ""}`}
        draggable
        onDragStart={e => onDragStart(e, id)}
        onDragOver={e  => onDragOver(e, id)}
        onDrop={e      => onDrop(e, id)}
        onDragEnd={onDragEnd}
        style={{ marginBottom:10, ...style }}
      >
        <div className="rb-drag-handle"><span/><span/><span/></div>
        {block}
      </div>
    );
  };

  const hasHeader = name || title || personal.email || personal.phone || personal.location;
  const hasAny    = hasHeader || sectionOrder.some(id => renderBlock(id) !== null);

  if (layout === "one-col") return (
    <div style={{ ...fontStyle, background:"#fff", padding:"20px 22px", minHeight:500 }}>
      {!hasAny
        ? (
          <div className="rb-empty">
            <div className="rb-empty-icon">📝</div>
            <div className="rb-empty-text">Start filling your details</div>
            <div className="rb-empty-sub">Your resume will appear here as you type</div>
          </div>
        ) : (
          <>
            {hasHeader && (
              <>
                <Header/>
                <div style={{ height:2, background:col, marginBottom:12 }}/>
              </>
            )}
            {sectionOrder.map(id => <DragSection key={id} id={id}/>)}
          </>
        )}
    </div>
  );

  if (layout === "two-col") {
    const visible   = sectionOrder.filter(id => renderBlock(id) !== null);
    const mid       = Math.ceil(visible.length / 2);
    const leftSecs  = visible.slice(0, mid);
    const rightSecs = visible.slice(mid);
    return (
      <div style={{ ...fontStyle, background:"#fff", minHeight:500 }}>
        {hasHeader && (
          <div style={{ padding:"16px 18px 10px", borderBottom:`2px solid ${col}` }}>
            <Header/>
          </div>
        )}
        {!hasAny
          ? (
            <div className="rb-empty">
              <div className="rb-empty-icon">📝</div>
              <div className="rb-empty-text">Start filling your details</div>
              <div className="rb-empty-sub">Your resume will appear here as you type</div>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", minHeight:400 }}>
              <div style={{ padding:"12px 14px 12px 18px", borderRight:"1px solid #e5e7eb" }}>
                {leftSecs.map(id => <DragSection key={id} id={id}/>)}
              </div>
              <div style={{ padding:"12px 18px 12px 14px" }}>
                {rightSecs.map(id => <DragSection key={id} id={id}/>)}
              </div>
            </div>
          )}
      </div>
    );
  }

  if (layout === "sidebar-left") {
    const sideIds = sectionOrder.filter(id => ["skills","languages","certifications"].includes(id));
    const mainIds = sectionOrder.filter(id => !["skills","languages","certifications"].includes(id));
    return (
      <div style={{ ...fontStyle, background:"#fff", display:"flex", minHeight:500 }}>
        <div style={{ width:168, flexShrink:0, background:col, padding:"16px 13px",
          display:"flex", flexDirection:"column", gap:12 }}>
          {photo && (
            <div style={{ display:"flex", justifyContent:
              photoPosition === "right"  ? "flex-end" :
              photoPosition === "center" ? "center"   : "flex-start" }}>
              <PhotoEl extraStyle={{ border:"2px solid rgba(255,255,255,.3)" }}/>
            </div>
          )}
          {(name || title) && (
            <div>
              {name  && <h2 style={{ fontSize:13, fontWeight:900, color:"#fff",
                margin:0, lineHeight:1.2 }}>{name}</h2>}
              {title && <p style={{ fontSize:8.5, color:"rgba(255,255,255,.75)",
                marginTop:3, fontStyle:"italic" }}>{title}</p>}
            </div>
          )}
          {(personal.email || personal.phone || personal.location) && (
            <div>
              <div style={{ borderBottom:"1px solid rgba(255,255,255,.25)",
                paddingBottom:4, marginBottom:7 }}>
                <span style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,.6)",
                  textTransform:"uppercase", letterSpacing:.8 }}>Contact</span>
              </div>
              {personal.location && <p style={{ fontSize:8, color:"rgba(255,255,255,.8)", marginBottom:4 }}>📍 {personal.location}</p>}
              {personal.phone    && <p style={{ fontSize:8, color:"rgba(255,255,255,.8)", marginBottom:4 }}>📞 {personal.phone}</p>}
              {personal.email    && <p style={{ fontSize:8, color:"rgba(255,255,255,.8)", marginBottom:4, wordBreak:"break-all" }}>✉ {personal.email}</p>}
              {personal.linkedin && <p style={{ fontSize:8, color:"rgba(255,255,255,.8)", marginBottom:4 }}>in {personal.linkedin}</p>}
              {personal.github   && <p style={{ fontSize:8, color:"rgba(255,255,255,.8)" }}>⌥ {personal.github}</p>}
            </div>
          )}
          {sideIds.map(id => (
            <div key={id}
              className={`rb-drag${dragging===id?" dragging":""}${dragOverId===id?" drag-over":""}`}
              draggable
              onDragStart={e => onDragStart(e, id)}
              onDragOver={e  => onDragOver(e, id)}
              onDrop={e      => onDrop(e, id)}
              onDragEnd={onDragEnd}
            >
              {renderBlock(id, true)}
            </div>
          ))}
        </div>
        <div style={{ flex:1, padding:"16px 16px" }}>
          {mainIds.map(id => <DragSection key={id} id={id}/>)}
        </div>
      </div>
    );
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
const normalizeSectionOptions = (response) => {
  if (!response?.success || !Array.isArray(response.options)) return [];
  return response.options
    .filter(option => option && option.text)
    .slice(0, 2)
    .map((option, index) => ({
      label: option.label || `Option ${index + 1}`,
      focus: option.focus || "",
      text: option.text,
    }));
};

function SuggestionCards({ suggestions, onSelect, truncateAt = 0 }) {
  if (!suggestions.length) return null;

  return (
    <div className="sum-suggestions">
      {suggestions.map((suggestion, index) => {
        const preview =
          truncateAt > 0 && suggestion.text.length > truncateAt
            ? suggestion.text.slice(0, truncateAt) + "…"
            : suggestion.text;

        return (
          <div
            key={`${suggestion.label}-${index}`}
            className="sum-suggestion-card"
            onClick={() => onSelect(suggestion.text)}
          >
            <div className="sum-sug-tag">Option {index + 1} · {suggestion.label}</div>
            {suggestion.focus && (
              <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 600, marginBottom: 6 }}>
                {suggestion.focus}
              </div>
            )}
            <div className="sum-sug-text">{preview}</div>
            <div className="sum-sug-use">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Click to use this
            </div>
          </div>
        );
      })}
    </div>
  );
}

function countWords(text = "") {
  const trimmed = text
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function escapeHtml(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function htmlToPlainText(html = "") {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\n\s+\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function plainTextToHtml(text = "") {
  if (!text) return "";
  return text
    .split(/\r?\n/)
    .map((line) => escapeHtml(line) || "<br>")
    .join("<br>");
}

function normalizeEditorHtml(value = "") {
  if (!value) return "";
  const trimmed = value.trim();
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  return plainTextToHtml(trimmed);
}

function getWordCountState(wordCount, targetWordCount, tolerance = 25) {
  const min = Math.max(targetWordCount - tolerance, 0);
  const max = targetWordCount + tolerance;
  const isUnder = wordCount > 0 && wordCount < min;
  const isOver = wordCount > max;
  const isGood = wordCount >= min && wordCount <= max;
  return { min, max, isUnder, isOver, isGood };
}

function RichTextToolbar({ onFormat }) {
  return (
    <div className="rt-toolbar">
      {[
        { key: "bold", label: "B", title: "Bold" },
        { key: "italic", label: "I", title: "Italic" },
        { key: "underline", label: "U", title: "Underline" },
      ].map((tool) => (
        <button
          key={tool.key}
          type="button"
          className={`rt-btn rt-btn-${tool.key}`}
          title={tool.title}
          onMouseDown={(event) => {
            event.preventDefault();
            onFormat(tool.key);
          }}
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}

function RichTextEditor({ value, onChange, placeholder, minHeight = 130, borderColor }) {
  const editorRef = useRef(null);
  const normalizedValue = normalizeEditorHtml(value || "");

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML !== normalizedValue) {
      editor.innerHTML = normalizedValue;
    }
  }, [normalizedValue]);

  const handleInput = () => {
    const editor = editorRef.current;
    if (!editor) return;
    onChange(editor.innerHTML);
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData?.getData("text/plain") || "";
    document.execCommand("insertText", false, text);
    handleInput();
  };

  return (
    <div className="rt-editor-shell" style={{ borderColor: borderColor || "#e5e7eb", minHeight }}>
      <div
        ref={editorRef}
        className="rt-editor"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
      />
    </div>
  );
}

function WordGoalControl({
  value,
  min = 50,
  max = 500,
  step = 50,
  onChange,
  label = "Word Goal",
  instruction = "Enter an approximate word goal for AI suggestions and length guidance.",
}) {
  const clampValue = (nextValue) => {
    if (Number.isNaN(nextValue)) return value;
    const stepped = Math.round(nextValue / step) * step;
    return Math.min(max, Math.max(min, stepped));
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid #dbe4f0",
        background: "#f8fbff",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.75)",
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "#64748b",
          whiteSpace: "nowrap",
        }}>
          {label}
        </span>
        <span
          title={instruction}
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "1px solid #cbd5e1",
            color: "#64748b",
            background: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            cursor: "help",
            lineHeight: 1,
          }}
        >
          i
        </span>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => {
            const rawValue = event.target.value;
            if (rawValue === "") {
              onChange(min);
              return;
            }
            onChange(clampValue(Number(rawValue)));
          }}
          style={{
            width: 72,
            height: 32,
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            background: "#fff",
            color: "#0f172a",
            fontSize: 13,
            fontWeight: 700,
            padding: "0 10px",
            outline: "none",
          }}
        />
        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
          words
        </span>
      </div>
    </div>
  );
}

function WordCountSlider(props) {
  return <WordGoalControl {...props} />;
}

function WordCountSelector({ value, options, label = "Word Goal", onChange }) {
  const min = Math.min(...options);
  const max = Math.max(...options);
  const step = options.length > 1 ? Math.abs(options[1] - options[0]) : 50;

  return (
    <WordGoalControl
      value={value}
      min={min}
      max={max}
      step={step}
      label={label}
      instruction={`Type a word goal between ${min} and ${max}. The value snaps to the suggested AI ranges for this section.`}
      onChange={(nextValue) => {
        const nearest = options.reduce((best, option) => (
          Math.abs(option - nextValue) < Math.abs(best - nextValue) ? option : best
        ), options[0]);
        onChange(nearest);
      }}
    />
  );
}

// SUMMARY SECTION
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function SummarySection({ data, onChange, personalData }) {
  // ✅ ALL hooks MUST be here - inside the function
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [targetWordCount, setTargetWordCount] = useState(100);
  
  const jobTitle = personalData?.title || "";
  const resumeId = localStorage.getItem('resumeId');

  const wordCount = countWords(data.text || "");
  const { isGood, isOver } = getWordCountState(wordCount, targetWordCount, 25);

  const handleAISuggest = async () => {
    if (!keywords.trim() && !jobTitle) {
      alert("Please enter keywords or job title first");
      return;
    }
    
    setLoading(true);
    try {
      const result = await vertexAIService.generateSummary(
        resumeId,
        {
          action: "generate",
          title: jobTitle,
          keywords,
          currentText: htmlToPlainText(data.text || ""),
          experienceContext: `${jobTitle} with skills in ${keywords}`.trim(),
          targetWordCount,
        }
      );

      if (result.success) {
        setSuggestions(normalizeSectionOptions(result));
      } else {
        alert("Failed to generate: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert(error.message || "Failed to connect to AI service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Keywords input */}
      <div className="rb-g">
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <label className="rb-lbl" style={{ margin: 0 }}>Keywords</label>
          <div className="sum-info-wrap">
            <button
              className="sum-info-btn"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >i</button>
            {showTooltip && (
              <div className="sum-tooltip" style={{ right: "auto", left: 0, top: "calc(100% + 8px)" }}>
                <strong>How it works:</strong><br/>
                1️⃣ Type your skills or keywords<br/>
                2️⃣ Click <strong>AI Suggest</strong> next to the summary label<br/>
                3️⃣ Pick one of the 2 options below<br/><br/>
                <em>Tip: Aim for 100–200 words for best ATS results.</em>
              </div>
            )}
          </div>
        </div>
        <input
          className="rb-in"
          placeholder="e.g. React, team leadership, agile, AWS…"
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAISuggest()}
        />
      </div>

      {/* Summary textarea with AI button */}
      <div className="rb-g">
        <WordCountSlider value={targetWordCount} min={50} max={300} step={50} onChange={setTargetWordCount} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
          <label className="rb-lbl" style={{ margin: 0 }}>Professional Summary</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RichTextToolbar onFormat={(command) => {
              document.execCommand(command, false, null);
              const activeEditor = document.activeElement;
              if (activeEditor?.classList?.contains("rt-editor")) {
                onChange({ ...data, text: activeEditor.innerHTML });
              }
            }} />
            <button
              className="sum-ai-btn-top"
              onClick={handleAISuggest}
              disabled={(!keywords.trim() && !jobTitle) || loading}
              style={{
                opacity: ((!keywords.trim() && !jobTitle) || loading) ? 0.5 : 1,
                cursor: ((!keywords.trim() && !jobTitle) || loading) ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "exp-spin 0.7s linear infinite" }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
              )}
              {loading ? "Generating…" : "✨ AI Suggest"}
            </button>
          </div>
        </div>
        <RichTextEditor
          minHeight={130}
          borderColor={isGood ? "#86efac" : isOver ? "#fca5a5" : "#e5e7eb"}
          placeholder="Write a 2–3 sentence overview… or type keywords above and click ✨ AI Suggest."
          value={data.text || ""}
          onChange={(html) => onChange({ ...data, text: html })}
        />
        <p style={{
          fontSize: 11,
          color: isGood ? "#16a34a" : isOver ? "#ef4444" : "#9ca3af",
          fontStyle: "italic",
          marginTop: 5,
        }}>
          {isGood ? "✓ Looks great — perfect length for ATS scanners." : isOver ? "A little long — try trimming for better readability." : "Aim for 100–200 words for the best ATS results."}
        </p>
      </div>

      {/* Suggestions */}
      <SuggestionCards
        suggestions={suggestions}
        truncateAt={200}
        onSelect={(text) => onChange({ ...data, text: plainTextToHtml(text) })}
      />
      {suggestions.length === 0 && keywords.trim() === "" && (
        <div className="sum-chips-hint">
          Type keywords above → click ✨ AI Suggest to generate 2 summary options
        </div>
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
  const [targetWordCount, setTargetWordCount] = useState(200);

  const wordCount = countWords(exp.description || "");
  const { isOver, isGood } = getWordCountState(wordCount, targetWordCount, 50);
const handleAISuggest = async () => {
  if (!keywords.trim() && !exp.company && !exp.role) return;
  setLoading(true);
  try {
    const resumeId = localStorage.getItem('resumeId');
    const result = await vertexAIService.generateExperience(
      resumeId,
      {
        action: "generate",
        company: exp.company,
        role: exp.role,
        responsibilities: keywords,
        keywords,
        currentText: htmlToPlainText(exp.description || ""),
        targetWordCount,
      }
    );
    
    if (result.success) {
      setSuggestions(normalizeSectionOptions(result));
    }
  } catch (error) {
    alert("Experience API failed: " + error.message);
  } finally {
    setLoading(false);
  }
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
        </div>
        <input className="rb-in" placeholder="e.g. React, Node.js, agile, REST APIs, team lead…" value={keywords} onChange={e => setKeywords(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAISuggest()}/>
      </div>
      <div className="rb-g">
        <WordCountSlider value={targetWordCount} min={100} max={500} step={50} onChange={setTargetWordCount} />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:6 }}>
          <label className="rb-lbl" style={{ margin:0 }}>Responsibilities</label>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <RichTextToolbar onFormat={(command) => {
              document.execCommand(command, false, null);
              const activeEditor = document.activeElement;
              if (activeEditor?.classList?.contains("rt-editor")) {
                onUpd(exp.id, "description", activeEditor.innerHTML);
              }
            }} />
          <button className="sum-ai-btn-top" onClick={handleAISuggest} disabled={!hasContext || loading} style={{ opacity:(!hasContext || loading) ? 0.5 : 1, cursor:(!hasContext || loading) ? "not-allowed" : "pointer" }}>
            {loading
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"exp-spin 0.7s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>}
            {loading ? "Generating…" : "AI Suggest"}
          </button>
          </div>
        </div>
        <RichTextEditor
          minHeight={110}
          borderColor={isOver ? "#fca5a5" : isGood ? "#86efac" : "#e5e7eb"}
          placeholder={hasContext ? "Write directly or click ✦ AI Suggest above…" : "Fill Company & Role above first…"}
          value={exp.description}
          onChange={(html) => onUpd(exp.id,"description",html)}
        />
        <p style={{
          fontSize:11, marginTop:5, fontStyle:"italic", transition:"color .25s",
          color: isGood ? "#16a34a" : isOver ? "#ef4444" : "#9ca3af",
        }}>
          {isGood
            ? "✓ Looks great — perfect length for ATS scanners."
            : isOver
            ? "A little long — try trimming for better readability."
            : "Aim for 200–300 words for the best ATS results."}
        </p>
      </div>
      <SuggestionCards
        suggestions={suggestions}
        onSelect={(text) => onUpd(exp.id,"description",plainTextToHtml(text))}
      />
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
// INLINE DATE PICKER — Calendar-style dropdown with year grid + month grid
// ═══════════════════════════════════════════════════════════════════════════════
function InlineDatePicker({ value, onChange, placeholder = "Select year" }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => String(currentYear - i));
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("year");
  const [selYear, setSelYear] = useState(() => {
    if (!value) return "";
    const p = value.split(" ");
    return p.length === 2 ? p[1] : p[0];
  });
  const [selMonth, setSelMonth] = useState(() => {
    if (!value) return "";
    const p = value.split(" ");
    return p.length === 2 ? p[0] : "";
  });

  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setView("year");
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const display = value || "";

  const handleYear = (yr) => {
    setSelYear(yr);
    setView("month");
    onChange(yr);
  };

  const handleMonth = (mo) => {
    setSelMonth(mo);
    onChange(`${mo} ${selYear}`);
    setOpen(false);
    setView("year");
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          padding: "8px 10px",
          border: `1.5px solid ${open ? "#6366f1" : "#e5e7eb"}`,
          borderRadius: 7,
          fontSize: 12,
          fontFamily: "inherit",
          color: display ? "#111827" : "#9ca3af",
          background: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          userSelect: "none",
          boxShadow: open ? "0 0 0 3px rgba(99,102,241,.1)" : "none",
          transition: "all .15s",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {display || placeholder}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke={open ? "#6366f1" : "#9ca3af"} strokeWidth="2.5"
          style={{ flexShrink: 0, transition: "stroke .15s" }}
        >
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 5px)",
            left: 0,
            zIndex: 1000,
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 10,
            boxShadow: "0 8px 28px rgba(0,0,0,.13)",
            width: 220,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              padding: "9px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>
              {view === "year" ? "Select Year" : `${selYear} · Pick Month`}
            </span>
            {view === "month" && (
              <button
                onClick={() => setView("year")}
                style={{
                  background: "rgba(255,255,255,.22)",
                  border: "none",
                  borderRadius: 5,
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: "2px 8px",
                  fontFamily: "inherit",
                }}
              >
                ← Back
              </button>
            )}
          </div>

          <div style={{ padding: 8 }}>
            {/* Year grid — 4 columns */}
            {view === "year" && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 4,
                    maxHeight: 210,
                    overflowY: "auto",
                    paddingRight: 2,
                  }}
                >
                  {years.map(yr => (
                    <button
                      key={yr}
                      onClick={() => handleYear(yr)}
                      style={{
                        padding: "6px 2px",
                        border: `1.5px solid ${selYear === yr ? "#6366f1" : "#e5e7eb"}`,
                        borderRadius: 6,
                        background: selYear === yr ? "#ede9fe" : "#fff",
                        color: selYear === yr ? "#6366f1" : "#374151",
                        fontSize: 11,
                        fontWeight: selYear === yr ? 700 : 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all .1s",
                        textAlign: "center",
                      }}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", marginTop: 6, marginBottom: 0 }}>
                  Tap a year to pick month
                </p>
              </>
            )}

            {/* Month grid — 4 columns */}
            {view === "month" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 4,
                }}
              >
                {months.map(mo => (
                  <button
                    key={mo}
                    onClick={() => handleMonth(mo)}
                    style={{
                      padding: "8px 2px",
                      border: `1.5px solid ${selMonth === mo ? "#6366f1" : "#e5e7eb"}`,
                      borderRadius: 6,
                      background: selMonth === mo ? "#ede9fe" : "#fff",
                      color: selMonth === mo ? "#6366f1" : "#374151",
                      fontSize: 11,
                      fontWeight: selMonth === mo ? 700 : 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .1s",
                      textAlign: "center",
                    }}
                  >
                    {mo}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear button */}
          {display && (
            <div style={{ padding: "0 8px 8px" }}>
              <button
                onClick={() => {
                  onChange("");
                  setSelYear("");
                  setSelMonth("");
                  setOpen(false);
                  setView("year");
                }}
                style={{
                  width: "100%",
                  padding: "5px",
                  border: "1px solid #fca5a5",
                  borderRadius: 6,
                  background: "#fff",
                  color: "#ef4444",
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EDUCATION — DEGREE ENTRY CARD
// Changes: Start/End removed → single "Graduated Year" (InlineDatePicker)
//          AI Suggest btn next to Highlights label
//          Word count shown simply (no progress bar)
// ═══════════════════════════════════════════════════════════════════════════════
function DegreeEntryCard({ edu, index, total, upd, rem }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [keywords, setKeywords]       = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [targetWordCount, setTargetWordCount] = useState(150);

  const wordCount = countWords(edu.highlights || "");
  const { isOver, isGood } = getWordCountState(wordCount, targetWordCount, 25);
const handleAI = async () => {
  if (!keywords.trim() && !edu.degree && !edu.college) return;
  setLoading(true);
  try {
    const resumeId = localStorage.getItem('resumeId');
    const result = await vertexAIService.generateEducation(
      resumeId,
      {
        action: "generate",
        degree: edu.degree || edu.schoolName,
        field: edu.branch || edu.stream,
        university: edu.college || edu.schoolName,
        year: edu.graduatedYear || edu.passingYear || "",
        coursework: keywords,
        keywords,
        currentText: edu.highlights || "",
        targetWordCount,
      }
    );
    
    if (result.success) {
      setSuggestions(normalizeSectionOptions(result));
    }
  } catch (error) {
    alert("Education API failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="edu-degree-card">
      <div className="edu-degree-card-head">
        <div className="edu-degree-card-left">
          <div className="edu-degree-number">{index+1}</div>
          <div>
            <div className="edu-degree-card-title">
              {edu.college || edu.degree
                ? (edu.degree || "Degree") + (edu.college ? ` · ${edu.college}` : "")
                : `Education Entry ${index+1}`}
            </div>
            <div className="edu-degree-card-sub">
              {edu.graduatedYear ? `Graduated: ${edu.graduatedYear}` : "Add college & degree below"}
            </div>
          </div>
        </div>
        {total > 1 && <button className="rb-rm" onClick={() => rem(edu.id)}>×</button>}
      </div>

      <div className="rb-g">
        <label className="rb-lbl">College / University</label>
        <input className="rb-in" placeholder="e.g. PSG College of Technology…"
          value={edu.college} onChange={e => upd(edu.id,"college",e.target.value)}/>
      </div>

      <div className="edu-two-col">
        <div className="rb-g">
          <label className="rb-lbl">Degree</label>
          <input className="rb-in" placeholder="B.E. / B.Tech / B.Sc…"
            value={edu.degree} onChange={e => upd(edu.id,"degree",e.target.value)}/>
        </div>
        <div className="rb-g">
          <label className="rb-lbl">Branch / Specialisation</label>
          <input className="rb-in" placeholder="CSE / ECE / Mech…"
            value={edu.branch} onChange={e => upd(edu.id,"branch",e.target.value)}/>
        </div>
      </div>

      <div className="edu-two-col">
        <div className="rb-g">
          <label className="rb-lbl">Graduated Year</label>
          <DurationPicker
            value={edu.graduatedYear || ""}
            onChange={v => upd(edu.id, "graduatedYear", v)}
            singleDate
          />
        </div>
        <div className="rb-g">
          <label className="rb-lbl">CGPA / % <span className="opt">opt</span></label>
          <input className="rb-in" placeholder="8.5 / 84%"
            value={edu.gpa} onChange={e => upd(edu.id,"gpa",e.target.value)}/>
        </div>
      </div>

      <div className="rb-g">
        <label className="rb-lbl" style={{ marginBottom: 5 }}>Keywords <span className="opt">(for AI suggestions)</span></label>
        <input className="rb-in"
          placeholder="e.g. machine learning, data structures, capstone project…"
          value={keywords} onChange={e => setKeywords(e.target.value)}
          onKeyDown={e => e.key==="Enter" && handleAI()}/>
      </div>

      <div className="rb-g">
        <div style={{ display:"flex", justifyContent:"flex-start", marginBottom:8 }}>
          <WordCountSelector
            value={targetWordCount}
            options={[100, 150, 200, 250]}
            onChange={setTargetWordCount}
          />
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <label className="rb-lbl" style={{ margin:0 }}>
              Highlights
              <span style={{ color:"#9ca3af", fontWeight:400, fontSize:11, marginLeft:4 }}>opt</span>
            </label>
            <div style={{ position:"relative", display:"inline-flex", alignItems:"center" }}>
              <button className="sum-info-btn"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}>i</button>
              {showTooltip && (
                <div className="sum-tooltip" style={{ left:0, right:"auto", top:"calc(100% + 8px)", width:240 }}>
                  <strong>📚 What to write here:</strong><br/>
                  • Notable academic projects or thesis<br/>
                  • Awards, scholarships & honours<br/>
                  • Relevant coursework & electives<br/>
                  • Club activities or leadership roles<br/>
                  • Research papers or publications<br/><br/>
                  <em>💡 Tip: 100–200 words keeps it ATS-friendly.</em>
                </div>
              )}
            </div>
          </div>

          <button className="sum-ai-btn-top" onClick={handleAI} disabled={loading}
            style={{ opacity:loading?0.5:1, cursor:loading?"not-allowed":"pointer" }}>
            {loading
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"exp-spin 0.7s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>}
            {loading ? "Generating…" : "AI Suggest"}
          </button>
        </div>

        <textarea className="rb-in rb-ta"
          style={{
            minHeight:90,
            borderColor: isOver?"#fca5a5":isGood?"#86efac":undefined,
            transition:"border-color .25s",
          }}
          placeholder="Key projects, awards, relevant coursework… (optional)"
          value={edu.highlights}
          onChange={e => upd(edu.id,"highlights",e.target.value)}/>

        <p style={{ fontSize:11, color: isGood?"#16a34a":isOver?"#ef4444":"#9ca3af", fontStyle:"italic", marginTop:4 }}>
          {isGood ? "✓ Great length for ATS." : isOver ? "Too long — try trimming." : "Aim for 100–200 words."}
        </p>
      </div>

      <SuggestionCards
        suggestions={suggestions}
        onSelect={(text) => upd(edu.id,"highlights",text)}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EDUCATION — SCHOOL ENTRY CARD
// Changes: AI Suggest btn beside Highlights label, simple word count
// ═══════════════════════════════════════════════════════════════════════════════
function SchoolEntryCard({ edu, index, total, upd, rem }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [keywords, setKeywords]       = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [targetWordCount, setTargetWordCount] = useState(100);

  const wordCount = countWords(edu.highlights || "");
  const { isOver, isGood } = getWordCountState(wordCount, targetWordCount, 25);

  const handleAI = async () => {
    if (!keywords.trim() && !edu.schoolName) return;
    setLoading(true);
    try {
      const resumeId = localStorage.getItem("resumeId");
      const result = await vertexAIService.generateEducation(resumeId, {
        action: "generate",
        degree: "School Education",
        field: edu.stream || edu.board || "General Education",
        university: edu.schoolName || "",
        year: edu.passingYear || "",
        coursework: keywords,
        keywords,
        currentText: edu.highlights || "",
        targetWordCount,
      });

      if (result.success) {
        setSuggestions(normalizeSectionOptions(result));
      }
    } catch (error) {
      alert(error.message || "Education API failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edu-school-card">
      <div className="edu-school-card-head">
        <div className="edu-degree-card-left">
          <div className="edu-school-number">{index+1}</div>
          <div>
            <div className="edu-degree-card-title">
              {edu.schoolName}
            </div>
            <div className="edu-degree-card-sub">
              {edu.passingYear ? `Passing Year · ${edu.passingYear}` : "Add school details below"}
            </div>
          </div>
        </div>
        {total > 1 && <button className="rb-rm" onClick={() => rem(edu.id)}>×</button>}
      </div>

      <div className="rb-g">
        <label className="rb-lbl">School Name</label>
        <input className="rb-in" placeholder="e.g. St. Joseph's Higher Secondary School"
          value={edu.schoolName} onChange={e => upd(edu.id,"schoolName",e.target.value)}/>
      </div>

      <div className="edu-two-col">
        <div className="rb-g">
          <label className="rb-lbl">Passing Year</label>
          <DurationPicker
            value={edu.passingYear || ""}
            onChange={v => upd(edu.id,"passingYear",v)}
            singleDate
          />
        </div>
        <div className="rb-g">
          <label className="rb-lbl">Percentage / Grade <span className="opt">opt</span></label>
          <input className="rb-in" placeholder="92% / A+"
            value={edu.percentage} onChange={e => upd(edu.id,"percentage",e.target.value)}/>
        </div>
      </div>

      <div className="rb-g">
        <label className="rb-lbl" style={{ marginBottom:5 }}>Keywords <span className="opt">(for AI suggestions)</span></label>
        <input className="rb-in" placeholder="e.g. science, mathematics, debate, sports…"
          value={keywords} onChange={e => setKeywords(e.target.value)}
          onKeyDown={e => e.key==="Enter" && handleAI()}/>
      </div>

      <div className="rb-g">
        <div style={{ display:"flex", justifyContent:"flex-start", marginBottom:8 }}>
          <WordCountSelector
            value={targetWordCount}
            options={[100, 150, 200]}
            onChange={setTargetWordCount}
          />
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <label className="rb-lbl" style={{ margin:0 }}>
              Highlights
              <span style={{ color:"#9ca3af", fontWeight:400, fontSize:11, marginLeft:4 }}>opt</span>
            </label>
            <div style={{ position:"relative", display:"inline-flex", alignItems:"center" }}>
              <button className="sum-info-btn"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}>i</button>
              {showTooltip && (
                <div className="sum-tooltip" style={{ left:0, right:"auto", top:"calc(100% + 8px)", width:240 }}>
                  <strong>🏫 What to write here:</strong><br/>
                  • Board exam scores or distinctions<br/>
                  • Subject toppers or class rank<br/>
                  • Sports, arts or cultural wins<br/>
                  • School leadership (Head Boy/Girl)<br/>
                  • Science fairs or competitions<br/><br/>
                  <em>💡 Tip: 100–200 words is ideal for ATS readability.</em>
                </div>
              )}
            </div>
          </div>

          <button className="sum-ai-btn-top" onClick={handleAI} disabled={loading}
            style={{ opacity:loading?0.5:1, cursor:loading?"not-allowed":"pointer" }}>
            {loading
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"exp-spin 0.7s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>}
            {loading ? "Generating…" : "AI Suggest"}
          </button>
        </div>

        <textarea className="rb-in rb-ta"
          style={{
            minHeight:90,
            borderColor: isOver?"#fca5a5":isGood?"#86efac":undefined,
            transition:"border-color .25s",
          }}
          placeholder="Achievements, awards, co-curricular activities… (optional)"
          value={edu.highlights}
          onChange={e => upd(edu.id,"highlights",e.target.value)}/>

        <p style={{ fontSize:11, color: isGood?"#16a34a":isOver?"#ef4444":"#9ca3af", fontStyle:"italic", marginTop:4 }}>
          {isGood ? "✓ Great length for ATS." : isOver ? "Too long — try trimming." : "Aim for 100–200 words."}
        </p>
      </div>

      <SuggestionCards
        suggestions={suggestions}
        onSelect={(text) => upd(edu.id,"highlights",text)}
      />
    </div>
  );
}

function EducationSection({ data, onChange }) {
  const safeUG     = Array.isArray(data?.ug)     && data.ug.length     > 0 ? data.ug     : [makeUG()];
  const safeSchool = Array.isArray(data?.school) && data.school.length > 0 ? data.school : [makeSchool()];
  const [activeTab, setActiveTab] = useState("ug");

  const updUG     = (id,k,v) => onChange({ ug: safeUG.map(e => e.id===id?{...e,[k]:v}:e), school:safeSchool });
  const remUG     = id => onChange({ ug: safeUG.filter(e=>e.id!==id), school:safeSchool });
  const addUG     = () => onChange({ ug:[...safeUG,makeUG()], school:safeSchool });
  const updSchool = (id,k,v) => onChange({ ug:safeUG, school:safeSchool.map(e=>e.id===id?{...e,[k]:v}:e) });
  const remSchool = id => onChange({ ug:safeUG, school:safeSchool.filter(e=>e.id!==id) });
  const addSchool = () => onChange({ ug:safeUG, school:[...safeSchool,makeSchool()] });

  const tabs = [
    { id:"ug",     icon:"🎓", label:"UG / Degree",  count:safeUG.length },
    { id:"school", icon:"🏫", label:"Schooling",     count:safeSchool.length },
  ];

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {tabs.map(t => (
          <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
            style={{
              flex:1, display:"flex", alignItems:"center", gap:8,
              padding:"10px 14px", borderRadius:10, cursor:"pointer",
              border:`1.5px solid ${activeTab===t.id ? "#1e293b" : "#e5e7eb"}`,
              background: activeTab===t.id ? "#1e293b" : "#fff",
              fontFamily:"inherit", transition:"all .15s",
            }}
          >
            <span style={{ fontSize:15 }}>{t.icon}</span>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:1 }}>
              <span style={{ fontSize:12, fontWeight:700, color: activeTab===t.id ? "#fff" : "#374151" }}>
                {t.label}
              </span>
              <span style={{
                fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:99,
                background: activeTab===t.id ? "rgba(255,255,255,.18)" : "#f1f5f9",
                color: activeTab===t.id ? "#fff" : "#6b7280",
              }}>{t.count} entry</span>
            </div>
          </button>
        ))}
      </div>

      {activeTab === "ug" && (
        <div style={{ animation:"edu-fade-in .18s ease" }}>
          {safeUG.map((edu,i) => (
            <DegreeEntryCard key={edu.id} edu={edu} index={i} total={safeUG.length} upd={updUG} rem={remUG}/>
          ))}
          <button className="edu-add-btn" onClick={addUG}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Another Education
          </button>
        </div>
      )}

      {activeTab === "school" && (
        <div style={{ animation:"edu-fade-in .18s ease" }}>
          {safeSchool.map((edu,i) => (
            <SchoolEntryCard key={edu.id} edu={edu} index={i} total={safeSchool.length} upd={updSchool} rem={remSchool}/>
          ))}
          <button className="edu-add-btn" onClick={addSchool}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Another School
          </button>
        </div>
      )}
    </div>
  );
}

function normaliseEducation(raw) {
  if (raw && !Array.isArray(raw) && (Array.isArray(raw.ug) || Array.isArray(raw.school))) {
    return {
      ug:     Array.isArray(raw.ug)     ? raw.ug     : [makeUG()],
      school: Array.isArray(raw.school) ? raw.school : [makeSchool()],
    };
  }
  {}
  if (Array.isArray(raw)) {
    const ug     = raw.filter(e => e.type==="ug" || e.type==="pg" || (!e.type && !e.schoolName));
    const school = raw.filter(e => e.type==="school" || e.schoolName);
    return {
      ug:     ug.length     > 0 ? ug.map(e=>({...makeUG(),...e,type:"ug"}))         : [makeUG()],
      school: school.length > 0 ? school.map(e=>({...makeSchool(),...e,type:"school"})) : [makeSchool()],
    };
  }
  return { ug:[makeUG()], school:[makeSchool()] };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKILLS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function SkillsSection({ data, onChange, styling, onStylingChange }) {
  const safeData = Array.isArray(data) ? data : [makeSkill()];
  const mode = styling?.skillsDisplayMode || "level";
  const ratingType = styling?.skillsRatingStyle || "stars";
  const setMode = (nextMode) => onStylingChange?.({
    ...(styling || {}),
    skillsDisplayMode: nextMode,
  });
  const setRatingType = (nextRatingType) => onStylingChange?.({
    ...(styling || {}),
    skillsRatingStyle: nextRatingType,
  });
  const upd = (id, k, v) => onChange(safeData.map(s => s.id === id ? { ...s, [k]:v } : s));
  const rem = id => onChange(safeData.filter(s => s.id !== id));

  const LEVELS = [
    { label:"Beginner",     stars:1, color:"#16a34a", bg:"#f0fdf4", border:"#86efac" },
    { label:"Elementary",   stars:2, color:"#0284c7", bg:"#f0f9ff", border:"#7dd3fc" },
    { label:"Intermediate", stars:3, color:"#7c3aed", bg:"#f5f3ff", border:"#c4b5fd" },
    { label:"Advanced",     stars:4, color:"#d97706", bg:"#fffbeb", border:"#fde68a" },
    { label:"Expert",       stars:5, color:"#dc2626", bg:"#fef2f2", border:"#fca5a5" },
  ];

  const RATING_TYPES = [
    { id:"stars",  label:"Stars" },
    { id:"dots",   label:"Dots" },
    { id:"bars",   label:"Bars" },
    { id:"blocks", label:"Blocks" },
  ];

  function RatingWidget({ skillId, value }) {
    const [hov, setHov] = useState(0);
    const active = hov || value || 0;
    const col = "#6366f1";

    if (ratingType === "stars") return (
      <div style={{ display:"flex", gap:4 }}>
        {[1,2,3,4,5].map(n => (
          <button key={n} type="button"
            onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
            onClick={() => upd(skillId,"level",n)}
            style={{ background:"none", border:"none", cursor:"pointer", fontSize:26,
              color: n <= active ? "#f59e0b" : "#e2e8f0",
              transform: n <= active ? "scale(1.12)" : "scale(1)",
              transition:"all .1s", padding:"2px" }}
          >★</button>
        ))}
      </div>
    );

    if (ratingType === "dots") return (
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        {[1,2,3,4,5].map(n => (
          <div key={n}
            onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
            onClick={() => upd(skillId,"level",n)}
            style={{ width: n<=active?22:16, height: n<=active?22:16,
              borderRadius:"50%", cursor:"pointer",
              background: n<=active ? col : "#e5e7eb",
              border:`2px solid ${n<=active ? col : "#d1d5db"}`,
              transition:"all .15s" }}
          />
        ))}
      </div>
    );

    if (ratingType === "bars") return (
      <div style={{ display:"flex", gap:5, alignItems:"flex-end", height:34 }}>
        {[1,2,3,4,5].map(n => (
          <div key={n}
            onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
            onClick={() => upd(skillId,"level",n)}
            style={{ width:26, height:8+n*4, borderRadius:"3px 3px 0 0", cursor:"pointer",
              background: n<=active ? col : "#e5e7eb",
              border:`1.5px solid ${n<=active ? col : "#d1d5db"}`,
              transition:"all .15s" }}
          />
        ))}
      </div>
    );

    if (ratingType === "blocks") return (
      <div style={{ display:"flex", gap:5 }}>
        {[1,2,3,4,5].map(n => (
          <div key={n}
            onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
            onClick={() => upd(skillId,"level",n)}
            style={{ width:34, height:20, borderRadius:5, cursor:"pointer",
              background: n<=active ? col : "#e5e7eb",
              border:`1.5px solid ${n<=active ? col : "#d1d5db"}`,
              transition:"all .15s" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{ background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"12px 14px", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: mode==="rating" ? 12 : 0 }}>
          <span style={{ fontSize:12, fontWeight:600, color:"#374151" }}>How do you want to rate skills?</span>
          <div style={{ display:"flex", background:"#e2e8f0", borderRadius:99, padding:3, gap:2 }}>
            {[
              { id:"level",  label:"Level Badge" },
              { id:"rating", label:"Rating Style" },
            ].map(m => (
              <button key={m.id} type="button"
                onClick={() => setMode(m.id)}
                style={{
                  padding:"5px 14px", border:"none", borderRadius:99,
                  background: mode===m.id ? "#fff" : "transparent",
                  fontWeight: mode===m.id ? 700 : 500,
                  color: mode===m.id ? "#6366f1" : "#64748b",
                  fontSize:12, cursor:"pointer", fontFamily:"inherit",
                  boxShadow: mode===m.id ? "0 1px 4px rgba(0,0,0,.12)" : "none",
                  transition:"all .18s",
                }}
              >{m.label}</button>
            ))}
          </div>
        </div>

        {mode === "rating" && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {RATING_TYPES.map(rt => (
              <button key={rt.id} type="button"
                onClick={() => setRatingType(rt.id)}
                style={{
                  padding:"5px 13px", borderRadius:7, cursor:"pointer",
                  fontFamily:"inherit", fontSize:12, fontWeight:600,
                  border:`1.5px solid ${ratingType===rt.id ? "#6366f1" : "#e5e7eb"}`,
                  background: ratingType===rt.id ? "#ede9fe" : "#fff",
                  color: ratingType===rt.id ? "#6366f1" : "#374151",
                  transition:"all .15s",
                }}
              >{rt.label}</button>
            ))}
          </div>
        )}
      </div>

      {safeData.map((s, i) => {
        const selLvl = LEVELS.find(l => l.label === s.badge) || LEVELS[2];
        return (
          <div key={s.id} className="rb-card">
            <div className="rb-card-head">
              <span className="rb-card-title">Skill {i+1}</span>
              {safeData.length > 1 && <button className="rb-rm" onClick={() => rem(s.id)}>×</button>}
            </div>

            <div className="rb-g">
              <label className="rb-lbl">Skill Name</label>
              <input className="rb-in" placeholder="e.g. React.js, Figma, Python…"
                value={s.name} onChange={e => upd(s.id,"name",e.target.value)}/>
            </div>

            {mode === "level" && (
              <div className="rb-g">
                <label className="rb-lbl">Proficiency</label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6, marginBottom:8 }}>
                  {LEVELS.map(lvl => {
                    const isOn = s.badge === lvl.label;
                    return (
                      <div key={lvl.label}
                        onClick={() => {
                          if (s.badge === lvl.label) return;
                          onChange(safeData.map(sk =>
                            sk.id === s.id
                              ? { ...sk, badge: lvl.label, level: lvl.stars }
                              : sk
                          ));
                        }}
                        style={{ cursor:"pointer", textAlign:"center" }}
                      >
                        <div style={{ display:"flex", gap:2 }}>
                          {[1,2,3,4,5].map(d => (
                            <div key={d} style={{
                              width: d<=lvl.stars?7:5, height: d<=lvl.stars?7:5,
                              borderRadius:"50%",
                              background: d<=lvl.stars ? lvl.color : "#e5e7eb",
                              marginTop: d<=lvl.stars?0:1,
                            }}/>
                          ))}
                        </div>
                        <span style={{ fontSize:10, fontWeight:isOn?700:500,
                          color:isOn?lvl.color:"#6b7280", lineHeight:1.2 }}>
                          {lvl.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {s.badge && (
                  <div style={{ padding:"6px 12px", background:selLvl.bg,
                    border:`1.5px solid ${selLvl.border}`, borderRadius:8,
                    display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:selLvl.color }}>{selLvl.label}</span>
                    <span style={{ fontSize:11, color:"#6b7280" }}>· {selLvl.stars}/5</span>
                  </div>
                )}
              </div>
            )}

            {mode === "rating" && (
              <div className="rb-g">
                <label className="rb-lbl">Rating</label>
                <RatingWidget skillId={s.id} value={s.level || 0}/>
                {s.level > 0 && (
                  <div style={{ marginTop:8, fontSize:12, fontWeight:600,
                    color: LEVELS[(s.level||1)-1]?.color || "#6366f1" }}>
                    {LEVELS[(s.level||1)-1]?.label}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button className="rb-add" onClick={() => onChange([...safeData, makeSkill()])}>
        + Add Another Skill
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECTS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function ProjectsSection({ data, onChange }) {
  const safeData = Array.isArray(data) ? data : [makeProj()];
  const upd = (id, k, v) => onChange(safeData.map(p => p.id === id ? { ...p, [k]:v } : p));
  const rem = id => onChange(safeData.filter(p => p.id !== id));
  return (
    <div>
      {safeData.map((p, i) => (
        <ProjCard key={p.id} proj={p} index={i} total={safeData.length} onUpd={upd} onRem={rem}/>
      ))}
      <button className="rb-add" onClick={() => onChange([...safeData, makeProj()])}>+ Add Another Project</button>
    </div>
  );
}

function ProjCard({ proj, index, total, onUpd, onRem }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [targetWordCount, setTargetWordCount] = useState(250);

  const wordCount = countWords(proj.description || "");
  const { isOver, isGood } = getWordCountState(wordCount, targetWordCount, 50);

 const handleAISuggest = async () => {
  if (!proj.name && !proj.tech) return;
  setLoading(true);
  try {
    const resumeId = localStorage.getItem('resumeId');
    const result = await vertexAIService.generateProjects(resumeId, {
      action: "generate",
      projectName: proj.name,
      techStack: proj.tech || "",
      keywords: proj.keywords || "",
      context: `${proj.name} using ${proj.tech}. Keywords: ${proj.keywords}`.trim(),
      currentText: proj.description || "",
      targetWordCount,
    });
    
    if (result.success) {
      setSuggestions(normalizeSectionOptions(result));
    }
  } catch (error) {
    alert("Project API failed");
  } finally {
    setLoading(false);
  }
};

  const hasContext = proj.name || proj.tech || proj.keywords;

  return (
    <div className="rb-card">
      <div className="rb-card-head">
        <span className="rb-card-title">Project {index + 1}</span>
        {total > 1 && <button className="rb-rm" onClick={() => onRem(proj.id)}>x</button>}
      </div>

     <div className="rb-row">
        <div className="rb-g">
          <label className="rb-lbl">Project Title</label>
          <input className="rb-in" placeholder="e.g. Portfolio Website" value={proj.name} onChange={e => onUpd(proj.id,"name",e.target.value)}/>
        </div>
        <div className="rb-g">
          <label className="rb-lbl">Tools / Technologies</label>
          <input className="rb-in" placeholder="React, Figma, Python, Excel..." value={proj.tech || ""} onChange={e => onUpd(proj.id,"tech",e.target.value)}/>
        </div>
      </div>

      <div className="rb-row">
        <div className="rb-g">
          <label className="rb-lbl">Project Date <span className="opt">(optional)</span></label>
          <DurationPicker value={proj.date || ""} onChange={v => onUpd(proj.id, "date", v)} singleDate/>
        </div>
        <div className="rb-g">
          <label className="rb-lbl">Keywords <span className="opt">(for AI)</span></label>
          <input className="rb-in" placeholder="e.g. REST API, real-time..." value={proj.keywords || ""} onChange={e => onUpd(proj.id,"keywords",e.target.value)} onKeyDown={e => e.key === "Enter" && handleAISuggest()}/>
        </div>
      </div>

    <div className="rb-g">
          <div style={{ display:"flex", justifyContent:"flex-start", marginBottom:8 }}>
            <WordCountSelector
              value={targetWordCount}
              options={[150, 200, 250, 300, 350]}
              onChange={setTargetWordCount}
            />
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
            <label className="rb-lbl" style={{ margin:0 }}>Key Highlights</label>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <button className="sum-ai-btn-top" onClick={handleAISuggest} disabled={!hasContext || loading} style={{ opacity:(!hasContext || loading) ? 0.5 : 1, cursor:(!hasContext || loading) ? "not-allowed" : "pointer" }}>
              {loading
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"exp-spin 0.7s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>}
              {loading ? "Generating..." : "AI Suggest"}
            </button>
          </div>
        </div>
        
       <textarea
          className="rb-in rb-ta"
          style={{ minHeight:110, borderColor: isOver ? "#fca5a5" : isGood ? "#86efac" : undefined, transition:"border-color .25s" }}
          placeholder={hasContext ? `Describe what you built in about ${targetWordCount} words...` : "Fill Project Title & Tools above to unlock AI suggestions..."}
          value={proj.description}
          onChange={e => onUpd(proj.id,"description",e.target.value)}
        />
      </div>

      <SuggestionCards
        suggestions={suggestions}
        onSelect={(text) => onUpd(proj.id,"description",text)}
      />
      {false && suggestions.length > 0 && (
        <div className="sum-suggestions">
          {suggestions.map((s, i) => (
            <div key={i} className="sum-suggestion-card" onClick={() => onUpd(proj.id,"description",s.text)}>
              <div className="sum-sug-tag">Option {i+1} - {s.tag}</div>
              <div className="sum-sug-text">{s.text}</div>
              <div className="sum-sug-use">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Click to use this
              </div>
            </div>
          ))}
        </div>
      )}
      {suggestions.length === 0 && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 2px 0" }}>
          <span className="sum-chips-hint" style={{ padding:0, textAlign:"left" }}>
            {hasContext ? "Type keywords -> click AI Suggest to generate 2 options" : "Fill Title & Stack fields to unlock AI suggestions"}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CERTIFICATIONS SECTION
function CertCard({ cert, index, total, onUpd, onRem }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [targetWordCount, setTargetWordCount] = useState(100);
  const resumeId = localStorage.getItem('resumeId');

  const wordCount = countWords(cert.description || "");
  const { isOver, isGood } = getWordCountState(wordCount, targetWordCount, 25);

  const handleAISuggest = async () => {
    const hasCtx = cert.name || cert.issuer || keywords.trim();
    if (!hasCtx) {
      alert("Please fill Certification Name or Issuer first");
      return;
    }
    
    setLoading(true);
    try {
      const result = await vertexAIService.generateCertifications(resumeId, {
        action: "generate",
        certificationName: cert.name || "",
        issuer: cert.issuer || "",
        keywords,
        currentText: cert.description || "",
        targetWordCount,
      });

      if (result.success) {
        setSuggestions(normalizeSectionOptions(result));
      } else {
        alert("Failed to generate: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("AI Certifications error:", error);
      alert(error.message || "Failed to connect to AI service.");
    } finally {
      setLoading(false);
    }
  };

  const hasContext = cert.name || cert.issuer || keywords.trim();

  const ACCENTS = [
    { border: "#c7d2fe", top: "#6366f1", bg: "#f5f3ff" },
    { border: "#a7f3d0", top: "#059669", bg: "#f0fdf4" },
    { border: "#fde68a", top: "#d97706", bg: "#fffbeb" },
    { border: "#fca5a5", top: "#dc2626", bg: "#fef2f2" },
  ];
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <div style={{
      background: "#fff",
      border: `1.5px solid ${accent.border}`,
      borderRadius: 12,
      marginBottom: 12,
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,.04)",
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${accent.bg}, #fff)`,
        borderBottom: `1.5px solid ${accent.border}`,
        padding: "11px 15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 28, height: 28,
            background: accent.top,
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, flexShrink: 0,
          }}>🏆</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
              {cert.name || `Certification ${index + 1}`}
            </div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>
              {cert.issuer ? `Issued by ${cert.issuer}` : "Add certification details below"}
              {cert.date ? ` · ${cert.date}` : ""}
            </div>
          </div>
        </div>
        {total > 1 && (
          <button className="rb-rm" onClick={() => onRem(cert.id)}>×</button>
        )}
      </div>

      <div style={{ padding: "14px 15px" }}>
        <div className="rb-row">
          <div className="rb-g">
            <label className="rb-lbl">Certification Name</label>
            <input className="rb-in" placeholder="e.g. AWS Solutions Architect"
              value={cert.name}
              onChange={e => onUpd(cert.id, "name", e.target.value)}
            />
          </div>
          <div className="rb-g">
            <label className="rb-lbl">Issuing Authority</label>
            <input className="rb-in" placeholder="e.g. Amazon Web Services"
              value={cert.issuer}
              onChange={e => onUpd(cert.id, "issuer", e.target.value)}
            />
          </div>
        </div>

        <div className="rb-row">
          <div className="rb-g">
            <label className="rb-lbl">Issued On</label>
            <DurationPicker value={cert.date || ""} onChange={v => onUpd(cert.id, "date", v)} singleDate/>
          </div>
          <div className="rb-g">
            <label className="rb-lbl">Valid Till <span className="opt">(optional)</span></label>
            <DurationPicker value={cert.validTill || ""} onChange={v => onUpd(cert.id, "validTill", v)} singleDate/>
          </div>
        </div>

        <div className="rb-g">
          <label className="rb-lbl">Keywords <span className="opt">(for AI suggestions)</span></label>
          <input className="rb-in"
            placeholder="e.g. cloud architecture, IAM, cost optimization, security…"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAISuggest()}
          />
        </div>

        <div className="rb-g">
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
            <WordCountSelector
              value={targetWordCount}
              options={[100, 150, 200]}
              onChange={setTargetWordCount}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label className="rb-lbl" style={{ margin: 0 }}>
                Key Highlights
                <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: 11, marginLeft: 4 }}>(optional)</span>
              </label>
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                <button className="sum-info-btn"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >i</button>
                {showTooltip && (
                  <div className="sum-tooltip" style={{ left: 0, right: "auto", top: "calc(100% + 8px)", width: 230 }}>
                    <strong>✍️ What to write here:</strong><br/>
                    • Topics & modules covered<br/>
                    • Skills this cert validates<br/>
                    • Exam format or difficulty<br/>
                    • How it helps your career<br/><br/>
                    <em>💡 Tip: 80–150 words is the sweet spot for ATS scanners.</em>
                  </div>
                )}
              </div>
            </div>

            <button className="sum-ai-btn-top"
              onClick={handleAISuggest}
              disabled={!hasContext || loading}
              style={{ opacity: (!hasContext || loading) ? 0.5 : 1, cursor: (!hasContext || loading) ? "not-allowed" : "pointer" }}
            >
              {loading
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "exp-spin 0.7s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>}
              {loading ? "Generating…" : "✨ AI Suggest"}
            </button>
          </div>

          <textarea
            className="rb-in rb-ta"
            style={{
              minHeight: 100,
              borderColor: isOver ? "#fca5a5" : isGood ? "#86efac" : undefined,
              transition: "border-color .25s",
            }}
            placeholder={hasContext
              ? "Type keywords above → click ✨ AI Suggest, or write directly…"
              : "Fill Certification Name & Issuer above first…"}
            value={cert.description}
            onChange={e => onUpd(cert.id, "description", e.target.value)}
          />

          <p style={{
            fontSize: 11,
            color: isGood ? "#16a34a" : isOver ? "#ef4444" : "#9ca3af",
            fontStyle: "italic",
            marginTop: 4,
          }}>
            {isGood
              ? "✓ Great length for ATS."
              : isOver
              ? "Too long — try trimming."
              : "Aim for 80–150 words."}
          </p>
        </div>

        <SuggestionCards
          suggestions={suggestions}
          truncateAt={150}
          onSelect={(text) => onUpd(cert.id, "description", text)}
        />
        {false && suggestions.length > 0 && (
          <div className="sum-suggestions">
            {suggestions.map((s, i) => (
              <div key={i} className="sum-suggestion-card"
                onClick={() => onUpd(cert.id, "description", s.text)}>
                <div className="sum-sug-tag">Option {i + 1} · {s.tag}</div>
                <div className="sum-sug-text">{s.text.length > 150 ? s.text.slice(0, 150) + "…" : s.text}</div>
                <div className="sum-sug-use">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Click to use this
                </div>
              </div>
            ))}
          </div>
        )}
        {suggestions.length === 0 && (
          <div className="sum-chips-hint">
            {hasContext
              ? "Type keywords → click ✨ AI Suggest to generate 2 options"
              : "Fill Certification Name & Issuer to unlock AI suggestions"}
          </div>
        )}
      </div>
    </div>
  );
}
function CertificationsSection({ data, onChange }) {
  const safeData = Array.isArray(data) ? data : [makeCert()];
  const upd = (id, k, v) => onChange(safeData.map(c => c.id === id ? { ...c, [k]: v } : c));
  const rem = id => onChange(safeData.filter(c => c.id !== id));

  return (
    <div>
      {safeData.map((c, i) => (
        <CertCard key={c.id} cert={c} index={i} total={safeData.length} onUpd={upd} onRem={rem} />
      ))}
      <button className="rb-add" onClick={() => onChange([...safeData, makeCert()])}>
        + Add Another Certification
      </button>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// LANGUAGES SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function LanguagesSection({ data, onChange, styling, onStylingChange }) {
  const safeData = Array.isArray(data) ? data : [makeLang()];
  const mode = styling?.languagesDisplayMode || "level";
  const ratingType = styling?.languagesRatingStyle || "stars";
  const setMode = (nextMode) => onStylingChange?.({
    ...(styling || {}),
    languagesDisplayMode: nextMode,
  });
  const setRatingType = (nextRatingType) => onStylingChange?.({
    ...(styling || {}),
    languagesRatingStyle: nextRatingType,
  });

  const upd = (id, k, v) => onChange(safeData.map(l => l.id === id ? { ...l, [k]: v } : l));
  const rem = id => onChange(safeData.filter(l => l.id !== id));

  const LEVELS = [
    { label: "Basic",        stars: 1, color: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
    { label: "Elementary",   stars: 2, color: "#0284c7", bg: "#f0f9ff", border: "#7dd3fc" },
    { label: "Intermediate", stars: 3, color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
    { label: "Advanced",     stars: 4, color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    { label: "Native",       stars: 5, color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
  ];

  const RATING_TYPES = [
    { id: "stars",  label: "Stars"  },
    { id: "dots",   label: "Dots"   },
    { id: "bars",   label: "Bars"   },
    { id: "blocks", label: "Blocks" },
  ];

  function RatingWidget({ langId, value }) {
    const [hov, setHov] = useState(0);
    const active = hov || value || 0;
    const col = "#6366f1";

    if (ratingType === "stars") return (
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button"
            onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
            onClick={() => upd(langId, "stars", n)}
            style={{
              background: "none", border: "none", cursor: "pointer", fontSize: 26,
              color: n <= active ? "#f59e0b" : "#e2e8f0",
              transform: n <= active ? "scale(1.12)" : "scale(1)",
              transition: "all .1s", padding: "2px",
            }}
          >★</button>
        ))}
      </div>
    );

    if (ratingType === "dots") return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n}
            onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
            onClick={() => upd(langId, "stars", n)}
            style={{
              width: n <= active ? 22 : 16, height: n <= active ? 22 : 16,
              borderRadius: "50%", cursor: "pointer",
              background: n <= active ? col : "#e5e7eb",
              border: `2px solid ${n <= active ? col : "#d1d5db"}`,
              transition: "all .15s",
            }}
          />
        ))}
      </div>
    );

    if (ratingType === "bars") return (
      <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 34 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n}
            onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
            onClick={() => upd(langId, "stars", n)}
            style={{
              width: 26, height: 8 + n * 4, borderRadius: "3px 3px 0 0", cursor: "pointer",
              background: n <= active ? col : "#e5e7eb",
              border: `1.5px solid ${n <= active ? col : "#d1d5db"}`,
              transition: "all .15s",
            }}
          />
        ))}
      </div>
    );

    if (ratingType === "blocks") return (
      <div style={{ display: "flex", gap: 5 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n}
            onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
            onClick={() => upd(langId, "stars", n)}
            style={{
              width: 34, height: 20, borderRadius: 5, cursor: "pointer",
              background: n <= active ? col : "#e5e7eb",
              border: `1.5px solid ${n <= active ? col : "#d1d5db"}`,
              transition: "all .15s",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{
        background: "#f8fafc", border: "1.5px solid #e2e8f0",
        borderRadius: 12, padding: "12px 14px", marginBottom: 16,
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: mode === "rating" ? 12 : 0,
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
            How do you want to rate languages?
          </span>
          <div style={{ display: "flex", background: "#e2e8f0", borderRadius: 99, padding: 3, gap: 2 }}>
            {[
              { id: "level",  label: "Level Badge"  },
              { id: "rating", label: "Rating Style" },
            ].map(m => (
              <button key={m.id} type="button"
                onClick={() => setMode(m.id)}
                style={{
                  padding: "5px 14px", border: "none", borderRadius: 99,
                  background: mode === m.id ? "#fff" : "transparent",
                  fontWeight: mode === m.id ? 700 : 500,
                  color: mode === m.id ? "#6366f1" : "#64748b",
                  fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  boxShadow: mode === m.id ? "0 1px 4px rgba(0,0,0,.12)" : "none",
                  transition: "all .18s",
                }}
              >{m.label}</button>
            ))}
          </div>
        </div>

        {mode === "rating" && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {RATING_TYPES.map(rt => (
              <button key={rt.id} type="button"
                onClick={() => setRatingType(rt.id)}
                style={{
                  padding: "5px 13px", borderRadius: 7, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${ratingType === rt.id ? "#6366f1" : "#e5e7eb"}`,
                  background: ratingType === rt.id ? "#ede9fe" : "#fff",
                  color: ratingType === rt.id ? "#6366f1" : "#374151",
                  transition: "all .15s",
                }}
              >{rt.label}</button>
            ))}
          </div>
        )}
      </div>

      {safeData.map((l, i) => {
        const selLvl = LEVELS.find(lv => lv.label === l.proficiency) || LEVELS[2];
        return (
          <div key={l.id} className="rb-card">
            <div className="rb-card-head">
              <span className="rb-card-title">Language {i + 1}</span>
              {safeData.length > 1 &&
                <button className="rb-rm" onClick={() => rem(l.id)}>×</button>}
            </div>

            <div className="rb-g">
              <label className="rb-lbl">Language</label>
              <input className="rb-in" placeholder="e.g. Tamil, English, French…"
                value={l.language}
                onChange={e => upd(l.id, "language", e.target.value)}
              />
            </div>

            {mode === "level" && (
              <div className="rb-g">
                <label className="rb-lbl">Proficiency</label>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(5,1fr)",
                  gap: 6, marginBottom: 8,
                }}>
                  {LEVELS.map(lvl => {
                    const isOn = l.proficiency === lvl.label;
                    return (
                      <div key={lvl.label}
                        onClick={() => onChange(safeData.map(sk =>
                          sk.id === l.id
                            ? { ...sk, proficiency: lvl.label, stars: lvl.stars }
                            : sk
                        ))}
                        style={{ cursor: "pointer", textAlign: "center" }}
                      >
                        <div style={{ display: "flex", gap: 2, justifyContent: "center", marginBottom: 4 }}>
                          {[1, 2, 3, 4, 5].map(d => (
                            <div key={d} style={{
                              width: d <= lvl.stars ? 7 : 5,
                              height: d <= lvl.stars ? 7 : 5,
                              borderRadius: "50%",
                              background: d <= lvl.stars ? lvl.color : "#e5e7eb",
                              marginTop: d <= lvl.stars ? 0 : 1,
                            }} />
                          ))}
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: isOn ? 700 : 500,
                          color: isOn ? lvl.color : "#6b7280", lineHeight: 1.2,
                        }}>
                          {lvl.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {l.proficiency && (
                  <div style={{
                    padding: "6px 12px",
                    background: selLvl.bg,
                    border: `1.5px solid ${selLvl.border}`,
                    borderRadius: 8,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: selLvl.color }}>
                      {selLvl.label}
                    </span>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>
                      · {selLvl.stars}/5
                    </span>
                  </div>
                )}
              </div>
            )}

            {mode === "rating" && (
              <div className="rb-g">
                <label className="rb-lbl">Rating</label>
                <RatingWidget langId={l.id} value={l.stars || 0} />
                {l.stars > 0 && (
                  <div style={{
                    marginTop: 8, fontSize: 12, fontWeight: 600,
                    color: LEVELS[(l.stars || 1) - 1]?.color || "#6366f1",
                  }}>
                    {LEVELS[(l.stars || 1) - 1]?.label}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button className="rb-add" onClick={() => onChange([...safeData, makeLang()])}>
        + Add Another Language
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLING SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function StylingSection({ data, onChange, onSave }) {
  const s = k => v => onChange({ ...data, [k]:v });
  return (
    <div>
      <div className="rb-style-lbl">Font Family</div>
      <div className="rb-font-grid">
        {FONTS.map(f => (
          <div key={f} className={`rb-font-opt${data.font === f ? " on" : ""}`} 
               style={{ fontFamily:`'${f}',sans-serif` }} 
               onClick={() => s("font")(f)}>
            {f}
          </div>
        ))}
      </div>
      
      <div className="rb-style-lbl" style={{ marginTop:20 }}>Theme Color</div>
      <div className="rb-color-row">
        {COLORS.map(c => (
          <div key={c} className={`rb-swatch${data.accentColor === c ? " on" : ""}`} 
               style={{ background:c }} 
               onClick={() => s("accentColor")(c)}/>
        ))}
        <input type="color" value={data.accentColor} onChange={e => s("accentColor")(e.target.value)} 
               style={{ width:28, height:28, border:"none", borderRadius:"50%", cursor:"pointer", padding:0 }}/>
      </div>

     
    </div>
  );
}

function hasSectionContent(data, sectionId) {
  switch (sectionId) {
    case "summary":
      return Boolean(data.summary?.text?.trim());
    case "experience":
      return (data.experience || []).some((item) => item.role || item.company || item.description);
    case "education":
      return (data.education?.items || []).some((item) => item.title || item.subtitle || item.highlights);
    case "skills":
      return (data.skills || []).some((item) => item.name);
    case "projects":
      return (data.projects || []).some((item) => item.name || item.description);
    case "certifications":
      return (data.certifications || []).some((item) => item.name || item.issuer || item.description);
    case "languages":
      return (data.languages || []).some((item) => item.language);
    default:
      return false;
  }
}

function getContinuationPlan(data, visibleIds, pageIndex) {
  const available = visibleIds.filter(
    (id) => !["personal", "styling"].includes(id) && hasSectionContent(data, id)
  );

  if (available.length === 0) {
    return [];
  }

  const preferred = (PAGE_SECTION_PRIORITY[pageIndex % PAGE_SECTION_PRIORITY.length] || []).filter(
    (id) => available.includes(id)
  );
  const fallback = available.filter((id) => !preferred.includes(id));
  return [...preferred, ...fallback].slice(0, 3);
}

function ContinuationSheet({ pageNumber, sectionIds, data, accentColor, font }) {
  const fontStyle = { fontFamily: `'${font}', sans-serif` };
  const personal = data.personal || {};
  const accent = accentColor || "#2563eb";

  const renderSection = (sectionId) => {
    switch (sectionId) {
      case "summary":
        return (
          <section key={sectionId} className="rb-cont-section">
            <div className="rb-cont-section-head">
              <span className="rb-cont-section-title">Professional Summary</span>
              <span className="rb-cont-section-note">Live from form inputs</span>
            </div>
            <div className="rb-cont-summary">{data.summary.text}</div>
          </section>
        );
      case "experience":
        return (
          <section key={sectionId} className="rb-cont-section">
            <div className="rb-cont-section-head">
              <span className="rb-cont-section-title">Experience Highlights</span>
              <span className="rb-cont-section-note">{data.experience.filter((item) => item.role || item.company).length} entries</span>
            </div>
            <div className="rb-cont-list">
              {data.experience.filter((item) => item.role || item.company).slice(0, 4).map((item) => (
                <article key={item.id} className="rb-cont-item">
                  <div className="rb-cont-item-head">
                    <div className="rb-cont-item-title">{item.role || "Role"}{item.company ? ` at ${item.company}` : ""}</div>
                    <div className="rb-cont-item-meta">{[item.duration, item.location].filter(Boolean).join("\n")}</div>
                  </div>
                  {item.company && !item.role && <div className="rb-cont-item-sub">{item.company}</div>}
                  {item.description && <div className="rb-cont-item-copy">{item.description}</div>}
                </article>
              ))}
            </div>
          </section>
        );
      case "education":
        return (
          <section key={sectionId} className="rb-cont-section">
            <div className="rb-cont-section-head">
              <span className="rb-cont-section-title">Education</span>
              <span className="rb-cont-section-note">{data.education.items.length} records</span>
            </div>
            <div className="rb-cont-list">
              {data.education.items.slice(0, 4).map((item) => (
                <article key={item.id || item.title} className="rb-cont-item">
                  <div className="rb-cont-item-head">
                    <div className="rb-cont-item-title">{item.title}</div>
                    <div className="rb-cont-item-meta">{item.meta}</div>
                  </div>
                  {item.subtitle && <div className="rb-cont-item-sub">{item.subtitle}</div>}
                  {item.highlights && <div className="rb-cont-item-copy">{item.highlights}</div>}
                </article>
              ))}
            </div>
          </section>
        );
      case "skills":
        return (
          <section key={sectionId} className="rb-cont-section">
            <div className="rb-cont-section-head">
              <span className="rb-cont-section-title">Skills</span>
              <span className="rb-cont-section-note">Competitor-style quick scan</span>
            </div>
            <div className="rb-cont-pill-row">
              {data.skills.filter((item) => item.name).slice(0, 12).map((item) => (
                <div key={item.id} className="rb-cont-pill">
                  <span>{item.name}</span>
                  <span className="rb-cont-pill-sub">{item.badge || item.level}</span>
                </div>
              ))}
            </div>
          </section>
        );
      case "projects":
        return (
          <section key={sectionId} className="rb-cont-section">
            <div className="rb-cont-section-head">
              <span className="rb-cont-section-title">Projects</span>
              <span className="rb-cont-section-note">{data.projects.filter((item) => item.name).length} items</span>
            </div>
            <div className="rb-cont-list">
              {data.projects.filter((item) => item.name).slice(0, 4).map((item) => (
                <article key={item.id} className="rb-cont-item">
                  <div className="rb-cont-item-head">
                    <div className="rb-cont-item-title">{item.name}</div>
                    <div className="rb-cont-item-meta">{item.date || item.validTill || ""}</div>
                  </div>
                  {item.stack && <div className="rb-cont-item-sub">{item.stack}</div>}
                  {item.description && <div className="rb-cont-item-copy">{item.description}</div>}
                </article>
              ))}
            </div>
          </section>
        );
      case "certifications":
        return (
          <section key={sectionId} className="rb-cont-section">
            <div className="rb-cont-section-head">
              <span className="rb-cont-section-title">Certifications</span>
              <span className="rb-cont-section-note">Always synced</span>
            </div>
            <div className="rb-cont-list">
              {data.certifications.filter((item) => item.name).slice(0, 4).map((item) => (
                <article key={item.id} className="rb-cont-item">
                  <div className="rb-cont-item-head">
                    <div className="rb-cont-item-title">{item.name}</div>
                    <div className="rb-cont-item-meta">{item.date || ""}</div>
                  </div>
                  {item.issuer && <div className="rb-cont-item-sub">{item.issuer}</div>}
                  {item.description && <div className="rb-cont-item-copy">{item.description}</div>}
                </article>
              ))}
            </div>
          </section>
        );
      case "languages":
        return (
          <section key={sectionId} className="rb-cont-section">
            <div className="rb-cont-section-head">
              <span className="rb-cont-section-title">Languages</span>
              <span className="rb-cont-section-note">Readable chip layout</span>
            </div>
            <div className="rb-cont-pill-row">
              {data.languages.filter((item) => item.language).slice(0, 8).map((item) => (
                <div key={item.id} className="rb-cont-pill">
                  <span>{item.language}</span>
                  <span className="rb-cont-pill-sub">{item.proficiency}</span>
                </div>
              ))}
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  const leftColumn = sectionIds.filter((_, index) => index % 2 === 0);
  const rightColumn = sectionIds.filter((_, index) => index % 2 === 1);

  return (
    <div className="rb-cont-sheet" style={fontStyle}>
      <div className="rb-cont-head">
        <div>
          <span className="rb-cont-kicker" style={{ background: `${accent}14`, color: accent }}>Continuation Page</span>
          <div className="rb-cont-title">Page {pageNumber}</div>
          <div className="rb-cont-copy">
            This page stays connected to the form panel, so edits in sections like experience, projects, certifications, and languages show here live.
          </div>
        </div>
        <div className="rb-cont-meta">
          {[personal.name || "Your Name", personal.title || "Resume details", personal.location || "Multi-page layout"].map((item) => (
            <span key={item} className="rb-cont-chip">{item}</span>
          ))}
        </div>
      </div>

      {sectionIds.length === 0 ? (
        <div className="rb-cont-empty">
          Start filling the form sections to populate this page. Once you add experience, projects, certifications, or languages, the continuation preview will update automatically.
        </div>
      ) : (
        <div className="rb-cont-grid">
          <div className="rb-cont-col">{leftColumn.map(renderSection)}</div>
          <div className="rb-cont-col">{rightColumn.map(renderSection)}</div>
        </div>
      )}

      <div className="rb-cont-footer">Designed for cleaner multi-page exports and easier review in PDF preview.</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLANK BUILDER
// ═══════════════════════════════════════════════════════════════════════════════
function BlankBuilder({ galleryColor }) {
  // 1. Initialize State
  const [st, setSt] = useState(() => ({ 
    ...INIT, 
    styling: { ...INIT.styling, accentColor: galleryColor || "#2563eb" } 
  }));
  const [order, setOrder] = useState(() => [...DEFAULT_ORDER]);
  const [pages, setPages] = useState(() => [{ id: uid() }]);
  const previewRef = useRef(null);
  const pageRef = useRef(null);

  // 2. Navigation & Index Helpers
  const filteredSidebar = ALL_SECTIONS; 
  const currentIdx = filteredSidebar.findIndex(n => n.id === st.activeSection);
  const idx = currentIdx;
  const meta = SECTION_META[st.activeSection];
  const [isSaved, setIsSaved] = useState(false);
  const [resumeId, setResumeId] = useState(null);
  
  // 3. Define Action Functions
  const sec = id => setSt(s => ({ ...s, activeSection: id }));
  const setFld = (k, v) => setSt(s => ({ ...s, [k]: v }));
  const addPage = () => setPages(p => [...p, { id: uid() }]);
  const removePage = id => { 
    if (pages.length <= 1) return; 
    setPages(p => p.filter(x => x.id !== id)); 
  };
  
  // 4. Handle Save Function
  const handleSave = async () => {
    try {
      await saveResumeToBackend(st, order, pages, {
        templateName: "Blank Resume",
        template: { id: 0, name: "Blank Resume", structure: "blank-start" },
      });

      setIsSaved(true);
      alert("Resume successfully saved to backend!");
    } catch (error) {
      console.error("Save error:", error);
      const detail = error?.response?.data?.detail || error?.message || "";
      if (String(detail).includes("5 resumes") || String(detail).includes("Resume limit reached")) {
        alert("You can store up to 5 resumes only. Open My Resumes to manage your saved drafts.");
      } else {
        alert(detail || "An error occurred while saving.");
      }
    }
  };

  // 5. Handle Download PDF - FIXED MULTI-PAGE VERSION
const handleDownload = async () => {
  if (!previewRef.current) {
    alert("Preview not ready. Please wait a moment.");
    return;
  }

  try {
    // Show loading indicator on download button
    const downloadBtn = document.querySelector('.rb-btn.rb-btn-dark');
    const originalText = downloadBtn?.innerHTML;
    if (downloadBtn) downloadBtn.innerHTML = "⏳ Generating PDF...";

    // Get the pages container
    const pagesContainer = previewRef.current.querySelector('.rb-pages');
    
    if (!pagesContainer) {
      alert("Could not find resume pages. Please refresh and try again.");
      return;
    }

    // Find all .rb-sheet elements (each page)
    const sheetElements = pagesContainer.querySelectorAll('.rb-sheet');
    
    if (sheetElements.length === 0) {
      alert("No resume pages found to export.");
      return;
    }

    // Create PDF with proper page size
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    });
    
    const pageWidth = 210; // A4 width in mm
    let isFirstPage = true;

    for (let i = 0; i < sheetElements.length; i++) {
      const sheet = sheetElements[i];
      
      // Find the actual resume content inside the sheet
      // The content is inside the PreviewScaler's scaled div
      const scaledContent = sheet.querySelector('[style*="transform: scale"]') || 
                           sheet.querySelector('.rb-sheet > div');
      
      if (!scaledContent) continue;

      // Get the original unscaled content by finding the LivePreview component
      // The content is inside the inner div before transform is applied
      let contentToCapture = scaledContent;
      
      // If scaledContent has a child with the actual content, use that
      const innerContent = scaledContent.querySelector('[class*="LivePreview"]') || 
                          scaledContent.children[0];
      if (innerContent && innerContent.children.length > 0) {
        contentToCapture = innerContent;
      }

      // Create a clone for capture
      const clone = contentToCapture.cloneNode(true);
      
      // Apply fixed styling for accurate capture
      clone.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 595px;
        background: white;
        margin: 0;
        padding: 20px 22px;
        box-sizing: border-box;
        font-family: inherit;
      `;
      
      document.body.appendChild(clone);
      
      // Wait for fonts to load
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 200));
      
      // Capture with higher quality
      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 595,
        onclone: (clonedDoc, element) => {
          // Ensure all text is visible
          const allElements = element.querySelectorAll('*');
          allElements.forEach(el => {
            if (el.style) {
              el.style.visibility = 'visible';
              el.style.opacity = '1';
            }
          });
        }
      });
      
      // Clean up
      document.body.removeChild(clone);
      
      // Calculate image dimensions
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add new page if not first
      if (!isFirstPage) {
        pdf.addPage();
      }
      
      // Add image to PDF
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);
      isFirstPage = false;
    }
    
    // Save the PDF
    const fileName = `${st.personal?.name?.trim() || "Resume"}.pdf`;
    pdf.save(fileName);
    
    // Restore button
    if (downloadBtn) downloadBtn.innerHTML = originalText;
    alert("✅ PDF downloaded successfully!");
    
  } catch (error) {
    console.error("PDF error:", error);
    alert("Failed to generate PDF. Error: " + error.message);
    const downloadBtn = document.querySelector('.rb-btn.rb-btn-dark');
    if (downloadBtn) downloadBtn.innerHTML = "💾 Save Progress";
  }
};
  
  const eduNorm = normaliseEducation(st.education);
  const resumeData = {
    personal: st.personal,
    summary: st.summary,
    experience: Array.isArray(st.experience) ? st.experience : [makeExp()],
    education: eduNorm,
    skills: Array.isArray(st.skills) ? st.skills : [makeSkill()],
    projects: Array.isArray(st.projects) ? st.projects : [makeProj()],
    certifications: Array.isArray(st.certifications) ? st.certifications : [makeCert()],
    languages: Array.isArray(st.languages) ? st.languages : [makeLang()],
  };

  const renderForm = () => {
    switch (st.activeSection) {
      case "personal": return <PersonalSection data={st.personal} onChange={v => setFld("personal", v)} styling={st.styling} onStylingChange={v => setFld("styling", v)} />;
      case "summary": return <SummarySection data={st.summary} onChange={v => setFld("summary", v)} personalData={st.personal} />;
      case "experience": return <ExperienceSection data={resumeData.experience} onChange={v => setFld("experience", v)} />;
      case "education": return <EducationSection data={eduNorm} onChange={v => setFld("education", v)} />;
      case "skills": return <SkillsSection data={resumeData.skills} onChange={v => setFld("skills", v)} styling={st.styling} onStylingChange={v => setFld("styling", v)} />;
      case "projects": return <ProjectsSection data={resumeData.projects} onChange={v => setFld("projects", v)} />;
      case "certifications": return <CertificationsSection data={resumeData.certifications} onChange={v => setFld("certifications", v)} />;
      case "languages": return <LanguagesSection data={resumeData.languages} onChange={v => setFld("languages", v)} styling={st.styling} onStylingChange={v => setFld("styling", v)} />;
      case "styling": return <StylingSection data={st.styling} onChange={v => setFld("styling", v)} />;
      default: return null;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="rb-bar">
        <span className="rb-bar-title">Resume Builder</span>
        <span className="rb-badge">📄 Blank Resume</span>
        <div className="rb-sep" />
        <button className="rb-btn rb-btn-ghost" onClick={addPage}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Page
        </button>
        <div className="rb-sep" />
        <button className="rb-btn" onClick={handleSave}>💾 Save</button>
        <button 
          className="rb-btn rb-btn-dark" 
          disabled={!isSaved} 
          onClick={handleDownload}
          style={{ opacity: !isSaved ? 0.5 : 1, cursor: !isSaved ? "not-allowed" : "pointer" }}
        >
          ⬇️ Download PDF
        </button>
      </div>

      <div className="rb-layout">
        <aside className="rb-sidebar">
          {filteredSidebar.map(n => (
            <button key={n.id} className={`rb-nav${st.activeSection === n.id ? " on" : ""}`} onClick={() => sec(n.id)}>
              <span className="rb-nav-icon">{n.icon}</span>
              <span className="rb-nav-lbl">{n.label}</span>
            </button>
          ))}
        </aside>

        <div className="rb-content">
          <div className="rb-form">
            <div className="rb-form-head">
              <h2>{meta.title}</h2>
              <p>{meta.desc}</p>
            </div>
            <div className="rb-form-body">{renderForm()}</div>
            <div className="rb-form-foot" style={{ padding: "12px 22px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between" }}>
              <button className="rb-back" disabled={idx === 0} onClick={() => sec(ALL_SECTIONS[idx - 1].id)}>‹ Back</button>
              
              {st.activeSection === "styling" ? (
                <button 
                  className="rb-next" 
                  style={{ background: "#2563eb", color: "white", fontWeight: "bold", width: "120px" }} 
                  onClick={handleSave}
                >
                  💾 Save Resume
                </button>
              ) : (
                <button className="rb-next" disabled={idx === ALL_SECTIONS.length - 1} onClick={() => sec(ALL_SECTIONS[idx + 1].id)}>
                  Next ›
                </button>
              )}
            </div>
          </div>

          {/* PREVIEW PANEL - FIXED VERSION */}
          <div className="rb-preview" ref={previewRef}>
            <div className="rb-preview-bar">
              <div className="rb-preview-lbl">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
                Live Preview
              </div>
              <div className="rb-preview-hint">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
                {pages.length} page{pages.length === 1 ? "" : "s"} · Drag sections to reorder
              </div>
            </div>

            {/* Pages container - scrollable */}
            <div className="rb-pages" style={{ maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
              {pages.map((page, pi) => (
                <div key={page.id} className="rb-page-block" style={{ marginBottom: 24 }}>
                  <PreviewScaler containerRef={previewRef}>
                    <div className="rb-sheet" style={{ background: "#fff", minHeight: 842 }} ref={pageRef}>
                      <LivePreview 
                        data={resumeData} 
                        styling={st.styling} 
                        sectionOrder={order} 
                        onReorder={setOrder} 
                      />
                    </div>
                  </PreviewScaler>
                  <div className="rb-page-num" style={{ marginTop: 8, textAlign: "center" }}>
                    Page {pi + 1} of {pages.length}
                  </div>
                  {pages.length > 1 && (
                    <button 
                      className="rb-rm-page" 
                      onClick={() => removePage(page.id)}
                      style={{ marginTop: 6 }}
                    >
                      × Remove this page
                    </button>
                  )}
                </div>
              ))}
              
              {/* Add page button */}
              <button className="rb-add-page" onClick={addPage} style={{ width: "100%", marginTop: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add New Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
// ═══════════════════════════════════════════════════════════════════════════════
// CONTINUATION PAGE — clean blank A4 sheet for page 2+
// Must be defined OUTSIDE and BEFORE TemplateBuilder
// ═══════════════════════════════════════════════════════════════════════════════
function ContinuationPage({ tpl, accentColor, font, pageNumber }) {
  const fontStyle = { fontFamily: `'${font || "Inter"}', sans-serif` };
  return (
    <div style={{
      ...fontStyle,
      background: "#fff",
      minHeight: 841,
      padding: "24px 28px",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Thin accent bar at top to match template branding */}
      <div style={{
        height: 3,
        background: accentColor,
        marginBottom: 18,
        borderRadius: 2,
      }} />

      {/* Continuation area */}
      <div style={{
        flex: 1,
        border: `1.5px dashed ${accentColor}44`,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "28px 20px",
        gap: 12,
        background: `${accentColor}06`,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: `${accentColor}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: accentColor, fontWeight: 700,
        }}>{pageNumber}</div>
        <p style={{
          fontSize: 12, color: "#9ca3af", fontStyle: "italic", textAlign: "center",
        }}>
          Page {pageNumber} — overflow content will appear here when your resume fills page 1
        </p>
      </div>

      {/* Footer page number */}
      <div style={{
        marginTop: 16, textAlign: "center",
        fontSize: 9, color: "#d1d5db",
      }}>
        Page {pageNumber}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE BUILDER — FIXED
// ═══════════════════════════════════════════════════════════════════════════════
function TemplateBuilder({ galleryTemplate, galleryColor }) {
  const navigate = useNavigate();
  const location = useLocation();
  const resumeIdToLoad = location.state?.resumeId || localStorage.getItem("resumeId");
  const [selectedTemplate, setSelectedTemplate] = useState(() => galleryTemplate || DEFAULT_TEMPLATE_DESCRIPTOR);
  const [st, setSt] = useState(() => ({
    ...INIT,
    activeSection: getVisibleSectionsForStructure((galleryTemplate || DEFAULT_TEMPLATE_DESCRIPTOR).structure)[0],
    styling: { ...INIT.styling, accentColor: galleryColor || "#2563eb" },
  }));

  // ── pages array: each entry = one independent A4 sheet
  const [pages, setPages]     = useState(() => [{ id: uid() }]);
  const [order, setOrder]     = useState(() => [...DEFAULT_ORDER]);
  const [isSaved, setIsSaved] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveModalStatus, setSaveModalStatus] = useState("");
  const [saveModalStatusType, setSaveModalStatusType] = useState("success");
  const [isLoadingResume, setIsLoadingResume] = useState(Boolean(location.state?.resumeId || localStorage.getItem("resumeId")));
  const [, setLoadError] = useState("");
  const templateVisibleIds = getVisibleSectionsForStructure(
    selectedTemplate?.structure || galleryTemplate?.structure || DEFAULT_TEMPLATE_DESCRIPTOR.structure
  );

  const showAddPageStructures = [
    "clean-centered", "classic-minimal", "bold-two-col",
    "minimalist-top", "minimalist-pro", "photo-ats", "graphic-split",
  ];
  const showAddPage = showAddPageStructures.includes(selectedTemplate?.structure || galleryTemplate?.structure);
  const continuationPages = pages.slice(1).map((page, index) => ({
    ...page,
    pageNumber: index + 2,
    sections: [],
  }));

  const filteredSidebar = ALL_SECTIONS.filter((section) => templateVisibleIds.includes(section.id));
  const currentIdx      = filteredSidebar.findIndex((section) => section.id === st.activeSection);
  const previewRef      = useRef(null);
  const pageRef         = useRef(null);
  const meta            = SECTION_META[st.activeSection];

  const sec    = id => setSt(s => ({ ...s, activeSection: id }));
  const setFld = (k, v) => setSt(s => ({ ...s, [k]: v }));

  // ── Add / remove pages
  useEffect(() => {
    setSelectedTemplate(galleryTemplate || DEFAULT_TEMPLATE_DESCRIPTOR);
  }, [galleryTemplate]);

  useEffect(() => {
    const targetVisibleIds = getVisibleSectionsForStructure(
      selectedTemplate?.structure || galleryTemplate?.structure || DEFAULT_TEMPLATE_DESCRIPTOR.structure
    );
    setSt((current) => ({
      ...current,
      activeSection: targetVisibleIds.includes(current.activeSection)
        ? current.activeSection
        : targetVisibleIds[0] || "personal",
    }));
  }, [selectedTemplate?.structure, galleryTemplate?.structure]);
  useEffect(() => {
  // If this is NOT loading a saved resume (no resumeId in location state)
  // and we have a galleryTemplate, clear localStorage resumeId
  if (!location.state?.resumeId && galleryTemplate) {
    localStorage.removeItem('resumeId');
  }
}, [galleryTemplate, location.state?.resumeId]);

  useEffect(() => {
    if (!resumeIdToLoad) return undefined;

    let cancelled = false;

    const loadResume = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoadingResume(false);
        setLoadError("Sign in to continue editing a saved resume.");
        return;
      }

      setIsLoadingResume(true);
      setLoadError("");

      try {
        const response = await axios.get(`${API_BASE_URL}/resumes/${resumeIdToLoad}/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (cancelled) return;

        const resume = response.data || {};
        const savedTemplate = resume.template || resume.layout || resume.template_name || DEFAULT_TEMPLATE_DESCRIPTOR;
const template = resolveTemplateDescriptor(resume, savedTemplate);
        const loadedState = buildResumeEditorState(resume, template);
        const pageCount = getResumePageCount(resume.canvas_states);

        setSelectedTemplate(template);
        setSt(loadedState);
        setOrder(Array.isArray(resume.canvas_states?.order) && resume.canvas_states.order.length > 0
          ? resume.canvas_states.order
          : [...DEFAULT_ORDER]);
        setPages(Array.from({ length: Math.max(1, pageCount) }, () => ({ id: uid() })));
        setIsSaved(true);
        localStorage.setItem("resumeId", String(resume.id));
      } catch (error) {
        if (!cancelled) {
          setLoadError("We couldn't load that resume right now. You can continue from the current draft if needed.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingResume(false);
        }
      }
    };

    loadResume();
    return () => {
      cancelled = true;
    };
  }, [resumeIdToLoad]);

  const addPage    = () => setPages(p => [...p, { id: uid() }]);
  const removePage = id => setPages(p => p.length > 1 ? p.filter(x => x.id !== id) : p);

  const handleSave = async () => {
    try {
      await saveResumeToBackend(st, order, pages, {
        template: selectedTemplate,
        templateName: selectedTemplate?.name,
        templateStructure: selectedTemplate?.structure,
        templateId: selectedTemplate?.id,
      });
      setIsSaved(true);
      setSaveModalStatus("Your resume has been saved successfully.");
      setSaveModalStatusType("success");
      setSaveModalOpen(true);
    } catch (error) {
      console.error("Save error:", error);
      const detail = error?.response?.data?.detail || error?.message || "We couldn't save your resume. Please check your connection and try again.";
      setSaveModalStatus(detail.includes("5 resumes")
        ? "You can save up to 5 resumes. Please delete one before creating another."
        : detail);
      setSaveModalStatusType("error");
      setSaveModalOpen(true);
    }
  };

  const handleDownload = async () => {
  if (!pageRef.current) {
    setSaveModalStatus("Preview not ready. Please wait a moment.");
    setSaveModalStatusType("error");
    setSaveModalOpen(true);
    return;
  }
  
  try {
    // Find the actual resume content
    const previewContainer = previewRef.current?.querySelector('.rb-pages');
    const sheetElements = previewContainer?.querySelectorAll('.rb-pdf-page');
    
    if (!sheetElements || sheetElements.length === 0) {
      setSaveModalStatus("No resume content found to export.");
      setSaveModalStatusType("error");
      setSaveModalOpen(true);
      return;
    }
    
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    });
    
    const pageWidth = 210;
    const pageHeight = 297;
    let isFirstPage = true;
    
    for (let i = 0; i < sheetElements.length; i++) {
      const sheet = sheetElements[i];

      const clone = sheet.cloneNode(true);
      clone.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 595px;
        background: white;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        box-shadow: none;
        transform: none;
      `;
      
      document.body.appendChild(clone);
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 200));
      
      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 595,
      });
      
      document.body.removeChild(clone);
      
      const sliceHeight = Math.floor((canvas.width * pageHeight) / pageWidth);
      let yOffset = 0;
      
      while (yOffset < canvas.height) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(sliceHeight, canvas.height - yOffset);
        const ctx = pageCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          yOffset,
          canvas.width,
          pageCanvas.height,
          0,
          0,
          canvas.width,
          pageCanvas.height
        );

        const pageImgHeight = (pageCanvas.height * pageWidth) / pageCanvas.width;
        if (!isFirstPage) {
          pdf.addPage();
        }
        pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, 0, pageWidth, pageImgHeight);
        isFirstPage = false;
        yOffset += sliceHeight;
      }
    }
    
    pdf.save("resume.pdf");
    setSaveModalStatus("PDF download started successfully.");
    setSaveModalStatusType("success");
    
  } catch (error) {
    console.error("PDF error:", error);
    setSaveModalStatus("Failed to generate PDF: " + error.message);
    setSaveModalStatusType("error");
  }
};

  const eduNorm    = normaliseEducation(st.education);
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
  const renderForm = () => {
    switch (st.activeSection) {
      case "personal":       return <PersonalSection data={st.personal} onChange={v => setFld("personal", v)} styling={st.styling} onStylingChange={v => setFld("styling", v)} />;
      case "summary":        return <SummarySection data={st.summary} onChange={v => setFld("summary", v)} personalData={st.personal} />;
      case "experience":     return <ExperienceSection data={resumeData.experience} onChange={v => setFld("experience", v)} />;
      case "education":      return <EducationSection data={eduNorm} onChange={v => setFld("education", v)} />;
      case "skills":         return <SkillsSection data={resumeData.skills} onChange={v => setFld("skills", v)} styling={st.styling} onStylingChange={v => setFld("styling", v)} />;
      case "projects":       return <ProjectsSection data={resumeData.projects} onChange={v => setFld("projects", v)} />;
      case "certifications": return <CertificationsSection data={resumeData.certifications} onChange={v => setFld("certifications", v)} />;
      case "languages":      return <LanguagesSection data={resumeData.languages} onChange={v => setFld("languages", v)} styling={st.styling} onStylingChange={v => setFld("styling", v)} />;
      case "styling":        return <StylingSection data={st.styling} onChange={v => setFld("styling", v)} />;
      default:               return null;
    }
  };

  const handleChooseAnotherTemplate = () => {
    setSaveModalOpen(false);
    navigate("/templates");
  };

  if (isLoadingResume && resumeIdToLoad) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
        color: "#334155",
        fontFamily: "Inter, sans-serif",
        padding: 24,
      }}>
        <div style={{
          padding: "24px 28px",
          borderRadius: 24,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(191,219,254,0.8)",
          boxShadow: "0 20px 50px rgba(37,99,235,0.12)",
          textAlign: "center",
          maxWidth: 520,
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
            Loading your saved resume
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.7, color: "#475569" }}>
            We’re restoring the template, fields, and page structure so you can continue from where you left off.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>

      {/* ── Top bar ── */}
      <div className="rb-bar">
        <span className="rb-bar-title">Resume Builder</span>
        <span className="rb-badge">📄 {selectedTemplate?.name}</span>
        <div className="rb-sep" />

        {showAddPage && (
          <>
            <button className="rb-btn rb-btn-ghost" onClick={addPage}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Page
            </button>
            <div className="rb-sep" />
          </>
        )}

        <button
          onClick={handleDownload}
          disabled={!isSaved}
          style={{
            background: "#111827", border: "none", color: "#fff", fontWeight: "bold",
            padding: "7px 16px", borderRadius: "8px", fontSize: "13px",
            fontFamily: "inherit", display: "inline-flex", alignItems: "center",
            gap: "6px", cursor: !isSaved ? "not-allowed" : "pointer",
            opacity: !isSaved ? 0.5 : 1,
          }}
        >
          ⬇️ Download PDF
        </button>
      </div>

      {/* ── Layout ── */}
      <div className="rb-layout">
        <aside className="rb-sidebar">
          {filteredSidebar.map(n => (
            <button
              key={n.id}
              className={`rb-nav${st.activeSection === n.id ? " on" : ""}`}
              onClick={() => sec(n.id)}
            >
              <span className="rb-nav-icon">{n.icon}</span>
              <span className="rb-nav-lbl">{n.label}</span>
            </button>
          ))}
        </aside>

        <div className="rb-content">
          {/* ── Form panel ── */}
          <div className="rb-form">
            <div className="rb-form-head">
              <h2>{meta.title}</h2>
              <p>{meta.desc}</p>
            </div>
            <div className="rb-form-body">{renderForm()}</div>
            <div className="rb-form-foot" style={{ padding: "12px 22px", display: "flex", justifyContent: "space-between" }}>
              <button
                className="rb-back"
                disabled={currentIdx === 0}
                onClick={() => sec(filteredSidebar[currentIdx - 1].id)}
              >
                ‹ Back
              </button>
              {st.activeSection === "styling" ? (
                <button className="rb-next" style={{ background: "#2563eb" }} onClick={handleSave}>
                  💾 Save Progress
                </button>
              ) : (
                <button
                  className="rb-next"
                  disabled={currentIdx === filteredSidebar.length - 1}
                  onClick={() => sec(filteredSidebar[currentIdx + 1].id)}
                >
                  Next ›
                </button>
              )}
            </div>
          </div>

          {/* ── Preview panel ── */}
          <div className="rb-preview" ref={previewRef}>
            <div className="rb-preview-bar">
              <div className="rb-preview-lbl">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
                Live Preview — {selectedTemplate?.name}
              </div>
              {pages.length > 1 && (
                <button
                  onClick={() => removePage(pages[pages.length - 1].id)}
                  style={{
                    padding: "4px 12px", border: "1px solid #fca5a5", borderRadius: 6,
                    background: "#fff", color: "#ef4444", fontSize: 11,
                    fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  × Remove Last Page
                </button>
              )}
            </div>

            {/* ── Each page = its own independent A4 sheet ── */}
            <div className="rb-pages">
              <div className="rb-page-block">
                <PreviewScaler containerRef={previewRef}>
                  <div className="rb-sheet rb-pdf-page" ref={pageRef}>
                    <GalleryPreview
                      tpl={selectedTemplate}
                      data={resumeData}
                      accentColor={st.styling.accentColor}
                      font={st.styling.font}
                      skillsDisplayMode={st.styling.skillsDisplayMode}
                      skillsRatingStyle={st.styling.skillsRatingStyle}
                      languagesDisplayMode={st.styling.languagesDisplayMode}
                      languagesRatingStyle={st.styling.languagesRatingStyle}
                      extraPages={Math.max(0, pages.length - 1)}
                    />
                  </div>
                </PreviewScaler>
                <div className="rb-page-num">
                  Auto paginated preview
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ResumeSavedModal
        open={saveModalOpen}
        title={saveModalStatusType === "error" ? "Save Issue" : "Resume Saved Successfully ✅"}
        message={saveModalStatusType === "error"
          ? "Please review the message below and try again."
          : "Your resume has been saved successfully."}
        statusMessage={saveModalStatus}
        statusType={saveModalStatusType}
        onDownloadPdf={handleDownload}
        onChooseTemplate={handleChooseAnotherTemplate}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════════════
export default function ResumeBuilderRouter() {
  const location = useLocation();
  const galleryTemplate = location.state?.template || DEFAULT_TEMPLATE_DESCRIPTOR;
  const galleryColor    = location.state?.selectedColor || "#2563eb";
  if (galleryTemplate?.structure === "blank-start") return <BlankCanvasBuilder/>;
  return <TemplateBuilder galleryTemplate={galleryTemplate} galleryColor={galleryColor} />;
}


