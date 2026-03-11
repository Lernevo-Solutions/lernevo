import { useState, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: "template",       label: "Template",       icon: "⊞" },
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

const TEMPLATES = [
  { id: "classic",      name: "Classic",      desc: "Traditional, clean layo...", pillColor: "#1e293b" },
  { id: "modern",       name: "Modern",       desc: "Two-column...",               pillColor: "#7c3aed" },
  { id: "minimal",      name: "Minimal",      desc: "Clean, spacious...",          pillColor: "#1e293b" },
  { id: "professional", name: "Professional", desc: "Bold header with...",         pillColor: "#3b82f6" },
  { id: "creative",     name: "Creative",     desc: "Unique layout for...",        pillColor: "#ec4899" },
  { id: "elegant",      name: "Elegant",      desc: "Sophisticated design wit...", pillColor: "#6d28d9" },
  { id: "compact",      name: "Compact",      desc: "Space-efficient...",          pillColor: "#059669" },
  { id: "bold",         name: "Bold",         desc: "Eye-catching...",             pillColor: "#dc2626" },
  { id: "timeline",     name: "Timeline",     desc: "Visual timeline fo...",       pillColor: "#7c3aed" },
  { id: "executive",    name: "Executive",    desc: "Premium design for...",       pillColor: "#1e3a5f" },
];

const AI_SUGGESTIONS = {
  summary: "Results-driven Software Engineer with 5+ years of experience building scalable web applications and distributed systems. Proven track record of leading cross-functional teams to deliver high-impact products on time. Passionate about clean architecture, developer experience, and mentoring junior engineers.",
  experience: "Led end-to-end development of a microservices platform that reduced deployment time by 60% and improved system reliability to 99.98% uptime. Collaborated with product and design teams to ship 3 major features per quarter, directly contributing to a 40% increase in user retention.",
  project: "Built a real-time collaborative document editor using React, WebSockets, and operational transformation algorithms. Supports 50+ concurrent users with < 100ms latency. Deployed on AWS with auto-scaling and achieved 99.9% uptime over 12 months.",
  certification: "Completed rigorous coursework covering advanced cloud architecture patterns, security best practices, and cost optimization strategies. Applied knowledge to architect a multi-region deployment that reduced infrastructure costs by 35%.",
};

const FONTS = ["DM Sans", "Lato", "Merriweather", "Playfair Display", "Raleway", "Source Serif 4"];
const PROFICIENCY_LEVELS = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const PRESET_COLORS = ["#2563eb","#7c3aed","#0f766e","#db2777","#b45309","#dc2626","#5b21b6","#059669","#1e3a5f","#0f172a"];

const makeExperience    = () => ({ id: Date.now() + Math.random(), company: "", role: "", duration: "", location: "", description: "" });
const makeProject       = () => ({ id: Date.now() + Math.random(), name: "", stack: "", description: "", link: "" });
const makeCertification = () => ({ id: Date.now() + Math.random(), name: "", issuer: "", date: "", description: "" });
const makeLanguage      = () => ({ id: Date.now() + Math.random(), language: "", proficiency: "Intermediate" });
const makeSkill         = () => ({ id: Date.now() + Math.random(), name: "", level: "Intermediate" });

const INITIAL_STATE = {
  selectedTemplate: "classic",
  activeSection: "template",
  zoom: 55,
  personal:       { name: "", email: "", phone: "", location: "", linkedin: "", portfolio: "", photo: null },
  summary:        { text: "" },
  experience:     [makeExperience()],
  education:      { institution: "", degree: "", field: "", year: "", gpa: "" },
  skills:         [makeSkill()],
  projects:       [makeProject()],
  certifications: [makeCertification()],
  languages:      [makeLanguage()],
  styling:        { font: "DM Sans", accentColor: "#2563eb", density: "comfortable" },
};

const SECTION_META = {
  template:       { title: "Choose Your Template",     desc: "Select a design that best represents your professional style" },
  personal:       { title: "Personal Information",     desc: "Your contact details and basic info" },
  summary:        { title: "Professional Summary",     desc: "A brief overview of your background and goals" },
  experience:     { title: "Work Experience",          desc: "Your employment history and achievements" },
  education:      { title: "Education",                desc: "Your academic background" },
  skills:         { title: "Skills",                   desc: "Your technical and soft skills" },
  projects:       { title: "Projects",                 desc: "Notable projects you've worked on" },
  certifications: { title: "Certifications",           desc: "Professional certifications and credentials" },
  languages:      { title: "Languages",                desc: "Languages you speak and your proficiency" },
  styling:        { title: "Resume Styling",           desc: "Customize fonts, colors and spacing" },
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Inter:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;600;700&family=Raleway:wght@300;400;600;700&family=Source+Serif+4:wght@300;400;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; overflow: hidden; }
body { font-family: 'Inter', 'DM Sans', sans-serif; background: #f0f0f0; color: #111827; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }

/* ── TOP BAR ── */
.topbar {
  height: 52px; background: #fff; border-bottom: 1px solid #e5e7eb;
  display: flex; align-items: center; padding: 0 20px; gap: 10px;
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
}
.topbar-title { font-size: 15px; font-weight: 600; color: #111827; flex: 1; }
.zoom-controls { display: flex; align-items: center; gap: 5px; }
.zoom-btn {
  width: 28px; height: 28px; border: 1px solid #e5e7eb; border-radius: 6px;
  background: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: #6b7280; transition: all 0.15s; line-height: 1;
}
.zoom-btn:hover { background: #f9fafb; }
.zoom-label { font-size: 13px; font-weight: 500; color: #374151; min-width: 40px; text-align: center; }
.topbar-divider { width: 1px; height: 24px; background: #e5e7eb; margin: 0 4px; }
.btn-save {
  display: flex; align-items: center; gap: 6px; padding: 7px 16px;
  border: 1px solid #e5e7eb; border-radius: 8px; background: white;
  font-size: 13px; font-weight: 500; color: #374151; cursor: pointer;
  font-family: inherit; transition: all 0.15s;
}
.btn-save:hover { background: #f9fafb; }
.btn-download {
  display: flex; align-items: center; gap: 6px; padding: 7px 18px;
  border: none; border-radius: 8px; background: #111827;
  font-size: 13px; font-weight: 600; color: white; cursor: pointer;
  font-family: inherit; transition: background 0.15s;
}
.btn-download:hover { background: #1f2937; }

/* ── LAYOUT ── */
.app-layout { display: flex; height: 100vh; padding-top: 52px; }

/* ── SIDEBAR ── */
.sidebar {
  width: 68px; background: #1e293b; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center;
  padding: 8px 0; overflow-y: auto; height: 100%;
}
.nav-item {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 8px 4px; cursor: pointer; border-radius: 8px; width: 58px;
  border: none; background: none; color: #94a3b8; font-family: inherit;
  transition: all 0.15s; margin-bottom: 1px;
}
.nav-item:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
.nav-item.active { background: rgba(255,255,255,0.13); color: white; }
.nav-icon { font-size: 17px; line-height: 1; height: 24px; display: flex; align-items: center; justify-content: center; }
.nav-label { font-size: 9px; font-weight: 500; letter-spacing: 0.1px; text-align: center; line-height: 1.2; }

/* ── CONTENT ── */
.content-area { flex: 1; display: flex; overflow: hidden; }

/* ── FORM SIDE ── */
.form-side {
  width: 540px; flex-shrink: 0; background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex; flex-direction: column; height: 100%;
}
.form-header { padding: 22px 26px 16px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.form-header h2 { font-size: 19px; font-weight: 700; color: #111827; margin-bottom: 3px; }
.form-header p { font-size: 13px; color: #6b7280; }
.form-body { flex: 1; overflow-y: auto; padding: 22px 26px; }
.form-footer {
  padding: 12px 26px; border-top: 1px solid #f3f4f6;
  display: flex; justify-content: space-between; align-items: center;
  flex-shrink: 0; background: white;
}
.btn-back {
  display: flex; align-items: center; gap: 6px; padding: 8px 20px;
  border: 1.5px solid #e5e7eb; border-radius: 8px; background: white;
  font-size: 13.5px; font-weight: 500; color: #374151; cursor: pointer;
  font-family: inherit; transition: all 0.15s;
}
.btn-back:hover:not(:disabled) { border-color: #9ca3af; }
.btn-back:disabled { opacity: 0.35; cursor: default; }
.btn-next {
  display: flex; align-items: center; gap: 6px; padding: 8px 24px;
  border: none; border-radius: 8px; background: #111827;
  font-size: 13.5px; font-weight: 600; color: white; cursor: pointer;
  font-family: inherit; transition: background 0.15s;
}
.btn-next:hover:not(:disabled) { background: #1f2937; }
.btn-next:disabled { opacity: 0.35; cursor: default; }

/* ── PREVIEW SIDE ── */
.preview-side {
  flex: 1; background: #e8eaed;
  display: flex; flex-direction: column; align-items: center;
  justify-content: flex-start; overflow-y: auto; padding: 36px 24px;
}
.resume-sheet {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12), 0 16px 48px rgba(0,0,0,0.1);
  transition: width 0.2s; min-height: 680px;
}

/* ── FORM ELEMENTS ── */
.form-group { margin-bottom: 15px; }
.form-label { display: block; font-size: 12.5px; font-weight: 600; color: #374151; margin-bottom: 5px; }
.form-label .opt { color: #9ca3af; font-weight: 400; font-size: 11px; margin-left: 3px; }
.form-input {
  width: 100%; padding: 8px 12px; border: 1.5px solid #e5e7eb;
  border-radius: 7px; font-size: 13.5px; font-family: inherit; color: #111827;
  background: white; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
}
.form-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.form-input::placeholder { color: #9ca3af; }
.form-textarea { min-height: 88px; resize: vertical; line-height: 1.55; padding-bottom: 42px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* ── TEMPLATE GRID ── */
.template-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
.tpl-card {
  background: white; border: 1.5px solid #e5e7eb; border-radius: 10px;
  cursor: pointer; overflow: hidden; transition: all 0.2s;
}
.tpl-card:hover { border-color: #a5b4fc; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-2px); }
.tpl-card.sel { border-color: #6366f1; border-width: 2px; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
.tpl-thumb {
  height: 108px; background: #f9fafb;
  display: flex; flex-direction: column; align-items: center;
  padding: 12px 10px 8px; gap: 5px; position: relative;
}
.tpl-check {
  position: absolute; top: 7px; right: 7px;
  width: 17px; height: 17px; background: #6366f1; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 9px; font-weight: 700;
}
.tpl-pill { height: 7px; border-radius: 99px; width: 52%; margin-bottom: 3px; }
.tpl-line { height: 3px; border-radius: 99px; background: #e2e8f0; width: 83%; }
.tpl-line.mid { width: 68%; }
.tpl-line.short { width: 53%; }
.tpl-footer { padding: 7px 9px 9px; }
.tpl-name { font-size: 11.5px; font-weight: 600; color: #111827; margin-bottom: 2px; }
.tpl-desc { font-size: 10px; color: #9ca3af; line-height: 1.35; }

/* ── AI BUTTON ── */
.ai-wrap { position: relative; }
.ai-btn {
  position: absolute; bottom: 8px; right: 8px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white; border: none; padding: 4px 11px; border-radius: 6px;
  font-size: 11px; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: all 0.15s;
  display: flex; align-items: center; gap: 4px;
}
.ai-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(99,102,241,0.4); }

/* ── ENTRY CARDS ── */
.entry-card { background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 15px; margin-bottom: 11px; }
.entry-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 11px; }
.entry-title { font-size: 12.5px; font-weight: 600; color: #374151; }
.entry-remove { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 19px; padding: 0 4px; line-height: 1; border-radius: 4px; transition: background 0.15s; }
.entry-remove:hover { background: #fef2f2; }
.add-btn {
  width: 100%; padding: 9px; background: white; border: 1.5px dashed #d1d5db;
  border-radius: 8px; color: #6366f1; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.15s; margin-top: 3px;
}
.add-btn:hover { border-color: #6366f1; background: #f5f3ff; }

/* ── SKILLS ── */
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; min-height: 30px; }
.chip {
  display: inline-flex; align-items: center; gap: 4px;
  background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 99px;
  padding: 3px 10px; font-size: 12px; color: #2563eb; font-weight: 500;
}
.chip-lvl { font-size: 10px; opacity: 0.65; }
.chip-x { background: none; border: none; cursor: pointer; color: #93c5fd; font-size: 14px; padding: 0; line-height: 1; transition: color 0.15s; }
.chip-x:hover { color: #ef4444; }
.skill-row { display: flex; gap: 7px; }

/* ── PHOTO ── */
.photo-row { display: flex; gap: 15px; align-items: flex-start; margin-bottom: 16px; }
.photo-circle {
  width: 68px; height: 68px; border-radius: 50%;
  border: 2px dashed #d1d5db; background: #f5f3ff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; overflow: hidden; flex-shrink: 0; font-size: 20px;
  transition: border-color 0.15s;
}
.photo-circle:hover { border-color: #6366f1; }
.photo-circle img { width: 100%; height: 100%; object-fit: cover; }
.photo-circle input { display: none; }

/* ── STYLING ── */
.style-label { font-size: 10.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #9ca3af; margin: 16px 0 8px; }
.font-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
.font-opt { padding: 9px 12px; border-radius: 7px; border: 1.5px solid #e5e7eb; cursor: pointer; font-size: 13.5px; background: white; transition: all 0.15s; }
.font-opt:hover { border-color: #6366f1; background: #f5f3ff; }
.font-opt.on { border-color: #6366f1; background: #eff6ff; color: #4f46e5; font-weight: 600; }
.color-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.swatch { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; transition: all 0.15s; }
.swatch.on { border-color: #111827; transform: scale(1.18); }
.density-row { display: flex; border: 1.5px solid #e5e7eb; border-radius: 8px; overflow: hidden; width: fit-content; }
.density-opt { padding: 7px 14px; font-size: 12.5px; font-weight: 500; background: white; border: none; cursor: pointer; font-family: inherit; color: #6b7280; transition: all 0.15s; }
.density-opt.on { background: #111827; color: white; font-weight: 600; }

/* ══ RESUME PREVIEW ══ */
.resume-preview { width: 100%; min-height: 680px; }

/* Classic */
.r-classic .r-head { background: #1e293b; color: white; padding: 26px 30px 20px; }
.r-classic .r-name { font-size: 22px; font-weight: 700; }
.r-classic .r-contact { font-size: 10px; opacity: 0.75; margin-top: 5px; display: flex; flex-wrap: wrap; gap: 10px; }
.r-classic .r-body { display: grid; grid-template-columns: 155px 1fr; min-height: 550px; }
.r-classic .r-left { background: #f8fafc; border-right: 1px solid #e2e8f0; padding: 18px 14px; }
.r-classic .r-right { padding: 18px 22px; }
.r-classic .r-sec { font-size: 9px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: #1e293b; border-bottom: 2px solid #1e293b; padding-bottom: 3px; margin: 14px 0 8px; }
.r-classic .r-sec:first-child { margin-top: 0; }

/* Modern */
.r-modern .r-head { background: #7c3aed; color: white; padding: 22px 26px; display: flex; gap: 14px; align-items: center; }
.r-modern .r-avatar { width: 54px; height: 54px; border-radius: 50%; background: rgba(255,255,255,0.2); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 22px; overflow: hidden; }
.r-modern .r-name { font-size: 20px; font-weight: 700; }
.r-modern .r-contact { font-size: 10px; opacity: 0.8; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 9px; }
.r-modern .r-body { padding: 18px 26px; }
.r-modern .r-sec { font-size: 9.5px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #7c3aed; margin: 13px 0 7px; display: flex; align-items: center; gap: 6px; }
.r-modern .r-sec::before { content: ''; display: block; width: 12px; height: 3px; background: currentColor; border-radius: 2px; flex-shrink: 0; }

/* Minimal */
.r-minimal .r-head { padding: 30px 30px 14px; border-bottom: 1px solid #e5e7eb; }
.r-minimal .r-name { font-size: 24px; font-weight: 300; letter-spacing: -0.5px; color: #111827; }
.r-minimal .r-role { font-size: 12px; color: #6b7280; margin-top: 2px; }
.r-minimal .r-contact { font-size: 10.5px; color: #9ca3af; margin-top: 7px; display: flex; flex-wrap: wrap; gap: 12px; }
.r-minimal .r-body { padding: 18px 30px; }
.r-minimal .r-sec { font-size: 9.5px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #111827; margin: 16px 0 9px; }

/* Professional */
.r-professional .r-head { background: #1d4ed8; padding: 20px 26px; color: white; text-align: center; }
.r-professional .r-name { font-size: 21px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
.r-professional .r-contact { font-size: 10px; margin-top: 5px; opacity: 0.9; display: flex; justify-content: center; flex-wrap: wrap; gap: 11px; }
.r-professional .r-body { padding: 16px 26px; }
.r-professional .r-sec { text-align: center; font-size: 10px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #1d4ed8; border-top: 1px solid #bfdbfe; border-bottom: 1px solid #bfdbfe; padding: 4px 0; margin: 13px 0 9px; }

/* Creative */
.r-creative .r-head { background: linear-gradient(135deg, #db2777, #f472b6); padding: 26px; color: white; }
.r-creative .r-name { font-size: 23px; font-weight: 800; letter-spacing: -0.5px; }
.r-creative .r-contact { font-size: 10px; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 10px; opacity: 0.9; }
.r-creative .r-body { padding: 16px 26px; }
.r-creative .r-sec { font-size: 9.5px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: white; background: #db2777; display: inline-block; padding: 3px 9px; border-radius: 4px; margin: 13px 0 8px; }

/* Elegant */
.r-elegant .r-head { padding: 28px 30px 16px; text-align: center; border-bottom: 1px solid #e5e7eb; }
.r-elegant .r-name { font-size: 25px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase; color: #4338ca; }
.r-elegant .r-div { width: 52px; height: 2px; background: #4338ca; margin: 7px auto 9px; }
.r-elegant .r-contact { font-size: 10.5px; color: #9ca3af; display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; }
.r-elegant .r-body { padding: 16px 30px; }
.r-elegant .r-sec { font-size: 9.5px; font-weight: 500; letter-spacing: 2.5px; text-transform: uppercase; color: #4338ca; border-bottom: 1px solid #c7d2fe; padding-bottom: 4px; margin: 16px 0 9px; }

/* Compact */
.r-compact .r-head { background: #065f46; color: white; padding: 13px 17px; }
.r-compact .r-name { font-size: 16px; font-weight: 700; }
.r-compact .r-contact { font-size: 9px; opacity: 0.8; margin-top: 3px; display: flex; flex-wrap: wrap; gap: 7px; }
.r-compact .r-body { display: grid; grid-template-columns: 140px 1fr; min-height: 500px; }
.r-compact .r-left { background: #ecfdf5; border-right: 2px solid #065f46; padding: 11px; font-size: 10.5px; }
.r-compact .r-right { padding: 11px 15px; }
.r-compact .r-sec { font-size: 8px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #065f46; margin: 9px 0 5px; }
.r-compact .r-sec:first-child { margin-top: 0; }

/* Bold */
.r-bold .r-head { background: #111827; color: white; }
.r-bold .r-banner { background: #dc2626; height: 6px; }
.r-bold .r-head-inner { padding: 17px 22px; }
.r-bold .r-name { font-size: 23px; font-weight: 900; letter-spacing: -1px; }
.r-bold .r-contact { font-size: 10px; opacity: 0.65; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 10px; }
.r-bold .r-body { padding: 16px 22px; }
.r-bold .r-sec { font-size: 11px; font-weight: 900; text-transform: uppercase; color: #dc2626; border-left: 4px solid #dc2626; padding-left: 9px; margin: 13px 0 8px; }

/* Timeline */
.r-timeline .r-head { background: linear-gradient(160deg, #5b21b6, #7c3aed); color: white; padding: 24px 26px; }
.r-timeline .r-name { font-size: 21px; font-weight: 700; }
.r-timeline .r-contact { font-size: 10px; opacity: 0.8; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 10px; }
.r-timeline .r-body { padding: 16px 26px; }
.r-timeline .r-sec { font-size: 9.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #5b21b6; margin: 13px 0 9px; }
.r-timeline .tl { padding-left: 16px; border-left: 2px solid #ede9fe; position: relative; margin-bottom: 9px; }
.r-timeline .tl::before { content: ''; position: absolute; left: -5px; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: #5b21b6; }

/* Executive */
.r-executive .r-head { padding: 28px 30px 16px; border-bottom: 3px solid #1e3a5f; }
.r-executive .r-name { font-size: 25px; font-weight: 700; color: #1e3a5f; letter-spacing: -0.5px; }
.r-executive .r-role { font-size: 12px; color: #64748b; font-weight: 400; margin-top: 2px; }
.r-executive .r-contact { font-size: 10.5px; color: #94a3b8; margin-top: 7px; display: flex; flex-wrap: wrap; gap: 12px; }
.r-executive .r-body { padding: 16px 30px; }
.r-executive .r-sec { font-size: 9px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #1e3a5f; background: #f1f5f9; padding: 4px 9px; border-radius: 4px; margin: 13px 0 9px; display: inline-block; }

/* Shared */
.r-entry { margin-bottom: 9px; }
.r-etitle { font-size: 11.5px; font-weight: 700; color: #111827; }
.r-esub { font-size: 10.5px; color: #6b7280; margin-top: 1px; }
.r-ebody { font-size: 10px; color: #374151; margin-top: 3px; line-height: 1.55; }
.r-summary { font-size: 10.5px; color: #374151; line-height: 1.6; }
.r-placeholder { font-size: 10.5px; color: #d1d5db; font-style: italic; }
.r-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.r-tag { font-size: 9.5px; padding: 2px 8px; border-radius: 99px; font-weight: 500; }
.r-ghost { color: rgba(255,255,255,0.4) !important; }
.r-ghost-dark { color: #e5e7eb !important; font-weight: 300 !important; }
`;

// ─── RESUME PREVIEW ───────────────────────────────────────────────────────────

function ResumePreview({ data, templateId, styling }) {
  const { personal, summary, experience, education, skills, projects, certifications, languages } = data;
  const accent = styling.accentColor || "#2563eb";
  const fontStyle = { fontFamily: `'${styling.font}', sans-serif` };
  const hasName = !!personal.name;
  const nameText = personal.name || "Your Name";

  // Helper to lighten accent for tag backgrounds
  const accentBg = accent + "1a";

  const Contacts = () => {
    const items = [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean);
    return <>{items.map((c, i) => <span key={i}>{c}</span>)}</>;
  };

  const ExpItems = () => (
    <>
      {experience.filter(e => e.company || e.role).map(e => (
        <div key={e.id} className="r-entry">
          <div className="r-etitle">{e.role}{e.company ? ` · ${e.company}` : ""}</div>
          <div className="r-esub">{[e.duration, e.location].filter(Boolean).join(" · ")}</div>
          {e.description && <div className="r-ebody">{e.description}</div>}
        </div>
      ))}
      {experience.every(e => !e.company && !e.role) && <div className="r-placeholder">Experience will appear here…</div>}
    </>
  );

  const SkillTags = () => (
    <div className="r-tags">
      {skills.filter(s => s.name).map(s => (
        <span key={s.id} className="r-tag" style={{ background: accentBg, color: accent }}>{s.name}</span>
      ))}
      {skills.every(s => !s.name) && <span className="r-placeholder">Skills here…</span>}
    </div>
  );

  const Edu = () => education.institution || education.degree ? (
    <div className="r-entry">
      <div className="r-etitle">{[education.degree, education.field].filter(Boolean).join(" in ")}</div>
      <div className="r-esub">{education.institution}{education.year ? ` · ${education.year}` : ""}{education.gpa ? ` · GPA: ${education.gpa}` : ""}</div>
    </div>
  ) : <div className="r-placeholder">Education here…</div>;

  const Sum = () => summary.text
    ? <p className="r-summary">{summary.text}</p>
    : <p className="r-placeholder">Your summary will appear here…</p>;

  const Projs = () => (
    <>
      {projects.filter(p => p.name).map(p => (
        <div key={p.id} className="r-entry">
          <div className="r-etitle">{p.name}</div>
          {p.stack && <div className="r-esub">{p.stack}</div>}
          {p.description && <div className="r-ebody">{p.description}</div>}
          {p.link && <div className="r-esub" style={{color: accent}}>{p.link}</div>}
        </div>
      ))}
      {projects.every(p => !p.name) && <div className="r-placeholder">Projects here…</div>}
    </>
  );

  // ── Certifications block — always render if any cert has a name ──
  const hasCerts = certifications.some(c => c.name);
  const Certs = () => hasCerts ? (
    <>
      {certifications.filter(c => c.name).map(c => (
        <div key={c.id} className="r-entry">
          <div className="r-etitle">{c.name}</div>
          <div className="r-esub">{[c.issuer, c.date].filter(Boolean).join(" · ")}</div>
          {c.description && <div className="r-ebody">{c.description}</div>}
        </div>
      ))}
    </>
  ) : null;

  // ── Languages block — always render if any lang has a value ──
  const hasLangs = languages.some(l => l.language);
  const Langs = () => hasLangs ? (
    <>
      {languages.filter(l => l.language).map(l => (
        <div key={l.id} className="r-esub" style={{ marginBottom: 3 }}>
          <span style={{ fontWeight: 600, color: "#374151" }}>{l.language}</span>
          <span style={{ color: "#9ca3af" }}> — {l.proficiency}</span>
        </div>
      ))}
    </>
  ) : null;

  // Sec heading styled with accent color dynamically
  const SecHead = ({ children, dark, invert }) => {
    if (invert) {
      // white text on accent background (creative style)
      return <div className="r-sec" style={{ background: accent, color: "#fff", display: "inline-block", padding: "3px 9px", borderRadius: 4, marginBottom: 8, marginTop: 13, fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase" }}>{children}</div>;
    }
    if (dark) {
      return <div className="r-sec" style={{ color: "#1e293b", borderBottomColor: "#1e293b" }}>{children}</div>;
    }
    return <div className="r-sec" style={{ color: accent, borderBottomColor: accent }}>{children}</div>;
  };

  const wrap = { ...fontStyle, width: "100%" };

  if (templateId === "classic") return (
    <div className="resume-preview r-classic" style={wrap}>
      <div className="r-head" style={{ background: accent }}>
        <div className={`r-name${!hasName ? " r-ghost" : ""}`}>{nameText}</div>
        <div className="r-contact"><Contacts /></div>
      </div>
      <div className="r-body">
        <div className="r-left">
          <div className="r-sec" style={{ color: accent, borderBottomColor: accent }}>Skills</div>
          <SkillTags />
          <div className="r-sec" style={{ color: accent, borderBottomColor: accent }}>Education</div>
          <Edu />
          {hasCerts && <><div className="r-sec" style={{ color: accent, borderBottomColor: accent }}>Certifications</div><Certs /></>}
          {hasLangs && <><div className="r-sec" style={{ color: accent, borderBottomColor: accent }}>Languages</div><Langs /></>}
        </div>
        <div className="r-right">
          <div className="r-sec" style={{ color: accent, borderBottomColor: accent }}>Summary</div><Sum />
          <div className="r-sec" style={{ color: accent, borderBottomColor: accent }}>Experience</div><ExpItems />
          {projects.some(p => p.name) && <><div className="r-sec" style={{ color: accent, borderBottomColor: accent }}>Projects</div><Projs /></>}
        </div>
      </div>
    </div>
  );

  if (templateId === "modern") return (
    <div className="resume-preview r-modern" style={wrap}>
      <div className="r-head" style={{ background: accent }}>
        <div className="r-avatar">{personal.photo ? <img src={personal.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}} /> : "👤"}</div>
        <div>
          <div className={`r-name${!hasName ? " r-ghost" : ""}`}>{nameText}</div>
          <div className="r-contact"><Contacts /></div>
        </div>
      </div>
      <div className="r-body">
        <div className="r-sec" style={{ color: accent }}>Summary</div><Sum />
        <div className="r-sec" style={{ color: accent }}>Experience</div><ExpItems />
        <div className="r-sec" style={{ color: accent }}>Skills</div><SkillTags />
        <div className="r-sec" style={{ color: accent }}>Education</div><Edu />
        {hasCerts && <><div className="r-sec" style={{ color: accent }}>Certifications</div><Certs /></>}
        {hasLangs && <><div className="r-sec" style={{ color: accent }}>Languages</div><Langs /></>}
        {projects.some(p => p.name) && <><div className="r-sec" style={{ color: accent }}>Projects</div><Projs /></>}
      </div>
    </div>
  );

  if (templateId === "minimal") return (
    <div className="resume-preview r-minimal" style={wrap}>
      <div className="r-head">
        <div className={`r-name${!hasName ? " r-ghost-dark" : ""}`}>{nameText}</div>
        {experience[0]?.role && <div className="r-role" style={{ color: accent }}>{experience[0].role}</div>}
        <div className="r-contact"><Contacts /></div>
      </div>
      <div className="r-body">
        <div className="r-sec" style={{ color: accent }}>About</div><Sum />
        <div className="r-sec" style={{ color: accent }}>Experience</div><ExpItems />
        <div className="r-sec" style={{ color: accent }}>Skills</div><SkillTags />
        <div className="r-sec" style={{ color: accent }}>Education</div><Edu />
        {hasCerts && <><div className="r-sec" style={{ color: accent }}>Certifications</div><Certs /></>}
        {hasLangs && <><div className="r-sec" style={{ color: accent }}>Languages</div><Langs /></>}
        {projects.some(p => p.name) && <><div className="r-sec" style={{ color: accent }}>Projects</div><Projs /></>}
      </div>
    </div>
  );

  if (templateId === "professional") return (
    <div className="resume-preview r-professional" style={wrap}>
      <div className="r-head" style={{ background: accent }}>
        <div className={`r-name${!hasName ? " r-ghost" : ""}`}>{nameText}</div>
        <div className="r-contact"><Contacts /></div>
      </div>
      <div className="r-body">
        <div className="r-sec" style={{ color: accent, borderTopColor: accentBg, borderBottomColor: accentBg }}>Professional Summary</div><Sum />
        <div className="r-sec" style={{ color: accent, borderTopColor: accentBg, borderBottomColor: accentBg }}>Work Experience</div><ExpItems />
        <div className="r-sec" style={{ color: accent, borderTopColor: accentBg, borderBottomColor: accentBg }}>Technical Skills</div><SkillTags />
        <div className="r-sec" style={{ color: accent, borderTopColor: accentBg, borderBottomColor: accentBg }}>Education</div><Edu />
        {hasCerts && <><div className="r-sec" style={{ color: accent, borderTopColor: accentBg, borderBottomColor: accentBg }}>Certifications</div><Certs /></>}
        {hasLangs && <><div className="r-sec" style={{ color: accent, borderTopColor: accentBg, borderBottomColor: accentBg }}>Languages</div><Langs /></>}
      </div>
    </div>
  );

  if (templateId === "creative") return (
    <div className="resume-preview r-creative" style={wrap}>
      <div className="r-head" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)` }}>
        <div className={`r-name${!hasName ? " r-ghost" : ""}`}>{nameText}</div>
        <div className="r-contact"><Contacts /></div>
      </div>
      <div className="r-body">
        <div className="r-sec" style={{ background: accent }}>Profile</div><Sum />
        <div className="r-sec" style={{ background: accent }}>Experience</div><ExpItems />
        <div className="r-sec" style={{ background: accent }}>Skills</div><SkillTags />
        {projects.some(p => p.name) && <><div className="r-sec" style={{ background: accent }}>Projects</div><Projs /></>}
        {hasCerts && <><div className="r-sec" style={{ background: accent }}>Certifications</div><Certs /></>}
        {hasLangs && <><div className="r-sec" style={{ background: accent }}>Languages</div><Langs /></>}
      </div>
    </div>
  );

  if (templateId === "elegant") return (
    <div className="resume-preview r-elegant" style={wrap}>
      <div className="r-head">
        <div className={`r-name${!hasName ? " r-ghost-dark" : ""}`} style={{ color: accent }}>{nameText}</div>
        <div className="r-div" style={{ background: accent }} />
        <div className="r-contact"><Contacts /></div>
      </div>
      <div className="r-body">
        <div className="r-sec" style={{ color: accent, borderBottomColor: accentBg }}>Summary</div><Sum />
        <div className="r-sec" style={{ color: accent, borderBottomColor: accentBg }}>Experience</div><ExpItems />
        <div className="r-sec" style={{ color: accent, borderBottomColor: accentBg }}>Education</div><Edu />
        <div className="r-sec" style={{ color: accent, borderBottomColor: accentBg }}>Skills</div><SkillTags />
        {hasCerts && <><div className="r-sec" style={{ color: accent, borderBottomColor: accentBg }}>Certifications</div><Certs /></>}
        {hasLangs && <><div className="r-sec" style={{ color: accent, borderBottomColor: accentBg }}>Languages</div><Langs /></>}
      </div>
    </div>
  );

  if (templateId === "compact") return (
    <div className="resume-preview r-compact" style={wrap}>
      <div className="r-head" style={{ background: accent }}>
        <div className={`r-name${!hasName ? " r-ghost" : ""}`}>{nameText}</div>
        <div className="r-contact"><Contacts /></div>
      </div>
      <div className="r-body">
        <div className="r-left" style={{ borderRightColor: accent }}>
          <div className="r-sec" style={{ color: accent }}>Skills</div><SkillTags />
          <div className="r-sec" style={{ color: accent }}>Education</div><Edu />
          {hasCerts && <><div className="r-sec" style={{ color: accent }}>Certs</div><Certs /></>}
          {hasLangs && <><div className="r-sec" style={{ color: accent }}>Languages</div><Langs /></>}
        </div>
        <div className="r-right">
          <div className="r-sec" style={{ color: accent }}>Summary</div><Sum />
          <div className="r-sec" style={{ color: accent }}>Experience</div><ExpItems />
          {projects.some(p => p.name) && <><div className="r-sec" style={{ color: accent }}>Projects</div><Projs /></>}
        </div>
      </div>
    </div>
  );

  if (templateId === "bold") return (
    <div className="resume-preview r-bold" style={wrap}>
      <div className="r-head">
        <div className="r-banner" style={{ background: accent }} />
        <div className="r-head-inner">
          <div className={`r-name${!hasName ? " r-ghost" : ""}`}>{nameText}</div>
          <div className="r-contact"><Contacts /></div>
        </div>
      </div>
      <div className="r-body">
        <div className="r-sec" style={{ color: accent, borderLeftColor: accent }}>Profile</div><Sum />
        <div className="r-sec" style={{ color: accent, borderLeftColor: accent }}>Experience</div><ExpItems />
        <div className="r-sec" style={{ color: accent, borderLeftColor: accent }}>Skills</div><SkillTags />
        <div className="r-sec" style={{ color: accent, borderLeftColor: accent }}>Education</div><Edu />
        {hasCerts && <><div className="r-sec" style={{ color: accent, borderLeftColor: accent }}>Certifications</div><Certs /></>}
        {hasLangs && <><div className="r-sec" style={{ color: accent, borderLeftColor: accent }}>Languages</div><Langs /></>}
        {projects.some(p => p.name) && <><div className="r-sec" style={{ color: accent, borderLeftColor: accent }}>Projects</div><Projs /></>}
      </div>
    </div>
  );

  if (templateId === "timeline") return (
    <div className="resume-preview r-timeline" style={wrap}>
      <div className="r-head" style={{ background: `linear-gradient(160deg, ${accent}ee, ${accent})` }}>
        <div className={`r-name${!hasName ? " r-ghost" : ""}`}>{nameText}</div>
        <div className="r-contact"><Contacts /></div>
      </div>
      <div className="r-body">
        <div className="r-sec" style={{ color: accent }}>Summary</div><Sum />
        <div className="r-sec" style={{ color: accent }}>Experience</div>
        {experience.filter(e => e.company || e.role).map(e => (
          <div key={e.id} className="tl" style={{ borderLeftColor: accentBg }}>
            <div className="r-etitle">{e.role}</div>
            <div className="r-esub">{e.company}{e.duration ? ` · ${e.duration}` : ""}</div>
            {e.description && <div className="r-ebody">{e.description}</div>}
            <span style={{ position:"absolute", left:-5, top:4, width:8, height:8, borderRadius:"50%", background:accent, display:"block" }}></span>
          </div>
        ))}
        {experience.every(e => !e.company && !e.role) && <div className="r-placeholder">Experience appears here…</div>}
        <div className="r-sec" style={{ color: accent }}>Skills</div><SkillTags />
        {hasCerts && <><div className="r-sec" style={{ color: accent }}>Certifications</div><Certs /></>}
        {hasLangs && <><div className="r-sec" style={{ color: accent }}>Languages</div><Langs /></>}
      </div>
    </div>
  );

  // executive
  return (
    <div className="resume-preview r-executive" style={wrap}>
      <div className="r-head" style={{ borderBottomColor: accent }}>
        <div className={`r-name${!hasName ? " r-ghost-dark" : ""}`} style={{ color: accent }}>{nameText}</div>
        {experience[0]?.role && <div className="r-role">{experience[0].role}</div>}
        <div className="r-contact"><Contacts /></div>
      </div>
      <div className="r-body">
        <div className="r-sec" style={{ color: accent, background: accentBg }}>Executive Summary</div><Sum />
        <div className="r-sec" style={{ color: accent, background: accentBg }}>Professional Experience</div><ExpItems />
        <div className="r-sec" style={{ color: accent, background: accentBg }}>Core Competencies</div><SkillTags />
        <div className="r-sec" style={{ color: accent, background: accentBg }}>Education</div><Edu />
        {hasCerts && <><div className="r-sec" style={{ color: accent, background: accentBg }}>Certifications</div><Certs /></>}
        {hasLangs && <><div className="r-sec" style={{ color: accent, background: accentBg }}>Languages</div><Langs /></>}
        {projects.some(p => p.name) && <><div className="r-sec" style={{ color: accent, background: accentBg }}>Projects</div><Projs /></>}
      </div>
    </div>
  );
}

// ─── FORMS ────────────────────────────────────────────────────────────────────

function TemplateSection({ selected, onSelect }) {
  return (
    <div className="template-grid">
      {TEMPLATES.map(t => (
        <div key={t.id} className={`tpl-card ${selected === t.id ? "sel" : ""}`} onClick={() => onSelect(t.id)}>
          <div className="tpl-thumb">
            {selected === t.id && <div className="tpl-check">✓</div>}
            <div className="tpl-pill" style={{ background: t.pillColor }} />
            <div className="tpl-line" />
            <div className="tpl-line mid" />
            <div className="tpl-line short" />
            <div className="tpl-line" />
            <div className="tpl-line mid" />
            <div className="tpl-line short" />
          </div>
          <div className="tpl-footer">
            <div className="tpl-name">{t.name}</div>
            <div className="tpl-desc">{t.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

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
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Alex Johnson" value={data.name} onChange={s("name")} />
          </div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="alex@example.com" value={data.email} onChange={s("email")} /></div>
        <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="+1 (555) 000-0000" value={data.phone} onChange={s("phone")} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Location</label><input className="form-input" placeholder="San Francisco, CA" value={data.location} onChange={s("location")} /></div>
        <div className="form-group"><label className="form-label">LinkedIn</label><input className="form-input" placeholder="linkedin.com/in/alexj" value={data.linkedin} onChange={s("linkedin")} /></div>
      </div>
      <div className="form-group"><label className="form-label">Portfolio / Website <span className="opt">(optional)</span></label><input className="form-input" placeholder="alexjohnson.dev" value={data.portfolio} onChange={s("portfolio")} /></div>
    </div>
  );
}

function SummarySection({ data, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">Professional Summary</label>
      <div className="ai-wrap">
        <textarea className="form-input form-textarea" style={{ minHeight: 130 }}
          placeholder="Write a compelling 2–3 sentence overview of your background and goals…"
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
            <div className="form-group"><label className="form-label">Company</label><input className="form-input" placeholder="Acme Corp" value={exp.company} onChange={e => upd(exp.id,"company",e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Role / Title</label><input className="form-input" placeholder="Senior Engineer" value={exp.role} onChange={e => upd(exp.id,"role",e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Duration</label><input className="form-input" placeholder="Jan 2022 – Present" value={exp.duration} onChange={e => upd(exp.id,"duration",e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Location</label><input className="form-input" placeholder="Remote / NYC" value={exp.location} onChange={e => upd(exp.id,"location",e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label>
            <div className="ai-wrap">
              <textarea className="form-input form-textarea" placeholder="Key responsibilities and achievements…" value={exp.description} onChange={e => upd(exp.id,"description",e.target.value)} />
              <button className="ai-btn" onClick={() => upd(exp.id,"description",AI_SUGGESTIONS.experience)}>✨ AI Suggest</button>
            </div>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={() => onChange([...data, makeExperience()])}>+ Add Another Position</button>
    </div>
  );
}

function EducationSection({ data, onChange }) {
  const s = k => e => onChange({ ...data, [k]: e.target.value });
  return (
    <div>
      <div className="form-group"><label className="form-label">Institution</label><input className="form-input" placeholder="MIT / Stanford / State University" value={data.institution} onChange={s("institution")} /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Degree</label><input className="form-input" placeholder="Bachelor of Science" value={data.degree} onChange={s("degree")} /></div>
        <div className="form-group"><label className="form-label">Field of Study</label><input className="form-input" placeholder="Computer Science" value={data.field} onChange={s("field")} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Graduation Year</label><input className="form-input" placeholder="2022" value={data.year} onChange={s("year")} /></div>
        <div className="form-group"><label className="form-label">GPA <span className="opt">(optional)</span></label><input className="form-input" placeholder="3.8 / 4.0" value={data.gpa} onChange={s("gpa")} /></div>
      </div>
    </div>
  );
}

function SkillsSection({ data, onChange }) {
  const [ns, setNs] = useState(""); const [nl, setNl] = useState("Intermediate");
  const add = () => { if (!ns.trim()) return; onChange([...data, { id: Date.now(), name: ns.trim(), level: nl }]); setNs(""); };
  return (
    <div>
      <div className="chips">
        {data.filter(s => s.name).map(s => (
          <div key={s.id} className="chip">{s.name}<span className="chip-lvl">· {s.level}</span><button className="chip-x" onClick={() => onChange(data.filter(x => x.id !== s.id))}>×</button></div>
        ))}
        {data.every(s => !s.name) && <span style={{fontSize:12,color:"#9ca3af"}}>Add skills below…</span>}
      </div>
      <div className="skill-row">
        <input className="form-input" style={{flex:1}} placeholder="e.g. React, Python, Figma…" value={ns} onChange={e => setNs(e.target.value)} onKeyDown={e => e.key==="Enter" && add()} />
        <select className="form-input" style={{width:135}} value={nl} onChange={e => setNl(e.target.value)}>{SKILL_LEVELS.map(l => <option key={l}>{l}</option>)}</select>
        <button className="btn-next" style={{borderRadius:7,padding:"8px 15px",flexShrink:0}} onClick={add}>Add</button>
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
          <div className="entry-head"><span className="entry-title">Project {i + 1}</span>{data.length > 1 && <button className="entry-remove" onClick={() => rem(p.id)}>×</button>}</div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Project Name</label><input className="form-input" placeholder="ShipFast Dashboard" value={p.name} onChange={e => upd(p.id,"name",e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Tech Stack</label><input className="form-input" placeholder="React, Node.js, PostgreSQL" value={p.stack} onChange={e => upd(p.id,"stack",e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label>
            <div className="ai-wrap">
              <textarea className="form-input form-textarea" placeholder="What you built and key outcomes…" value={p.description} onChange={e => upd(p.id,"description",e.target.value)} />
              <button className="ai-btn" onClick={() => upd(p.id,"description",AI_SUGGESTIONS.project)}>✨ AI Suggest</button>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Link <span className="opt">(optional)</span></label><input className="form-input" placeholder="github.com/you/project" value={p.link} onChange={e => upd(p.id,"link",e.target.value)} /></div>
        </div>
      ))}
      <button className="add-btn" onClick={() => onChange([...data, makeProject()])}>+ Add Another Project</button>
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
          <div className="entry-head"><span className="entry-title">Certification {i + 1}</span>{data.length > 1 && <button className="entry-remove" onClick={() => rem(c.id)}>×</button>}</div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Certificate Name</label><input className="form-input" placeholder="AWS Solutions Architect" value={c.name} onChange={e => upd(c.id,"name",e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Issuing Body</label><input className="form-input" placeholder="Amazon Web Services" value={c.issuer} onChange={e => upd(c.id,"issuer",e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Date</label><input className="form-input" placeholder="March 2024" value={c.date} onChange={e => upd(c.id,"date",e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Description <span className="opt">(optional)</span></label>
            <div className="ai-wrap">
              <textarea className="form-input form-textarea" placeholder="What this certification covers…" value={c.description} onChange={e => upd(c.id,"description",e.target.value)} />
              <button className="ai-btn" onClick={() => upd(c.id,"description",AI_SUGGESTIONS.certification)}>✨ AI Suggest</button>
            </div>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={() => onChange([...data, makeCertification()])}>+ Add Another Certification</button>
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
          <div className="entry-head"><span className="entry-title">Language {i + 1}</span>{data.length > 1 && <button className="entry-remove" onClick={() => rem(l.id)}>×</button>}</div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Language</label><input className="form-input" placeholder="Spanish" value={l.language} onChange={e => upd(l.id,"language",e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Proficiency</label>
              <select className="form-input" value={l.proficiency} onChange={e => upd(l.id,"proficiency",e.target.value)}>{PROFICIENCY_LEVELS.map(p => <option key={p}>{p}</option>)}</select>
            </div>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={() => onChange([...data, makeLanguage()])}>+ Add Another Language</button>
    </div>
  );
}

function StylingSection({ data, onChange }) {
  const s = k => v => onChange({ ...data, [k]: v });
  return (
    <div>
      <div className="style-label">Font Family</div>
      <div className="font-grid">
        {FONTS.map(f => <div key={f} className={`font-opt ${data.font===f?"on":""}`} style={{fontFamily:`'${f}',sans-serif`}} onClick={() => s("font")(f)}>{f}</div>)}
      </div>
      <div className="style-label">Accent Color</div>
      <div className="color-row">
        {PRESET_COLORS.map(c => <div key={c} className={`swatch ${data.accentColor===c?"on":""}`} style={{background:c}} onClick={() => s("accentColor")(c)} />)}
        <input type="color" value={data.accentColor} onChange={e => s("accentColor")(e.target.value)} style={{width:30,height:30,border:"none",borderRadius:"50%",cursor:"pointer",padding:0,background:"none"}} />
      </div>
      <div className="style-label">Content Density</div>
      <div className="density-row">
        {["Compact","Comfortable","Spacious"].map(d => <button key={d} className={`density-opt ${data.density===d.toLowerCase()?"on":""}`} onClick={() => s("density")(d.toLowerCase())}>{d}</button>)}
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [st, setSt] = useState(INITIAL_STATE);

  const sec    = useCallback(id => setSt(s => ({ ...s, activeSection: id })), []);
  const setTpl = useCallback(id => setSt(s => ({ ...s, selectedTemplate: id })), []);
  const setFld = useCallback((k, v) => setSt(s => ({ ...s, [k]: v })), []);
  const adjZoom = useCallback(d => setSt(s => ({ ...s, zoom: Math.min(120, Math.max(30, s.zoom + d)) })), []);

  const idx = NAV_SECTIONS.findIndex(n => n.id === st.activeSection);
  const meta = SECTION_META[st.activeSection];

  const renderForm = () => {
    switch (st.activeSection) {
      case "template":       return <TemplateSection selected={st.selectedTemplate} onSelect={setTpl} />;
      case "personal":       return <PersonalSection data={st.personal} onChange={v => setFld("personal", v)} />;
      case "summary":        return <SummarySection data={st.summary} onChange={v => setFld("summary", v)} />;
      case "experience":     return <ExperienceSection data={st.experience} onChange={v => setFld("experience", v)} />;
      case "education":      return <EducationSection data={st.education} onChange={v => setFld("education", v)} />;
      case "skills":         return <SkillsSection data={st.skills} onChange={v => setFld("skills", v)} />;
      case "projects":       return <ProjectsSection data={st.projects} onChange={v => setFld("projects", v)} />;
      case "certifications": return <CertificationsSection data={st.certifications} onChange={v => setFld("certifications", v)} />;
      case "languages":      return <LanguagesSection data={st.languages} onChange={v => setFld("languages", v)} />;
      case "styling":        return <StylingSection data={st.styling} onChange={v => setFld("styling", v)} />;
    }
  };

  const previewWidth = Math.round(595 * st.zoom / 100);

  return (
    <>
      <style>{css}</style>

      {/* TOP BAR */}
      <div className="topbar">
        <span className="topbar-title">My Resume</span>
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
            <button key={n.id} className={`nav-item ${st.activeSection === n.id ? "active" : ""}`} onClick={() => sec(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </aside>

        <div className="content-area">
          {/* FORM */}
          <div className="form-side">
            <div className="form-header">
              <h2>{meta.title}</h2>
              <p>{meta.desc}</p>
            </div>
            <div className="form-body">{renderForm()}</div>
            <div className="form-footer">
              <button className="btn-back" disabled={idx === 0} onClick={() => sec(NAV_SECTIONS[idx-1].id)}>‹ Back</button>
              <button className="btn-next" disabled={idx === NAV_SECTIONS.length-1} onClick={() => sec(NAV_SECTIONS[idx+1].id)}>Next ›</button>
            </div>
          </div>

          {/* PREVIEW */}
          <div className="preview-side">
            <div className="resume-sheet" style={{ width: previewWidth }}>
              <ResumePreview
                data={{ personal: st.personal, summary: st.summary, experience: st.experience, education: st.education, skills: st.skills, projects: st.projects, certifications: st.certifications, languages: st.languages }}
                templateId={st.selectedTemplate}
                styling={st.styling}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}