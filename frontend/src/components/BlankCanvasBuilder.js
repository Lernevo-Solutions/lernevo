// BlankCanvasBuilder.js
import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";

// ─── CONSTANTS (same as your router) ──────────────────────────────────────────
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

const uid = () => Date.now() + Math.random();
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

// ─── Helper: Resizable Box ─────────────────────────────────────────────────────
const ResizableBox = ({ children, width, height, onResize, minWidth = 150, minHeight = 100, maxWidth = 600, maxHeight = 800 }) => {
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width, height });
  const boxRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { width, height };
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    let newWidth = Math.min(maxWidth, Math.max(minWidth, startSize.current.width + dx));
    let newHeight = Math.min(maxHeight, Math.max(minHeight, startSize.current.height + dy));
    onResize(newWidth, newHeight);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  const boxStyle = {
    width: typeof width === 'number' ? width : 'auto',
    height: typeof height === 'number' ? height : 'auto',
    position: 'relative',
  };

  return (
    <div ref={boxRef} style={boxStyle}>
      {children}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 12,
          height: 12,
          cursor: 'se-resize',
          backgroundColor: '#3b82f6',
          borderRadius: '2px',
          zIndex: 10,
        }}
      />
    </div>
  );
};

// ─── FORM COMPONENTS (exactly as in your router) ───────────────────────────────
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

// ─── CANVAS RENDERER FOR STRUCTURED SECTIONS (as draggable blocks) ────────────
function StructuredSectionBlock({ id, data, styling }) {
  const { font, accentColor, layout, photoPosition, photoSize } = styling;
  const pxSize = PHOTO_SIZES[photoSize] || 72;
  const photo = data.personal?.photo;

  const renderBlock = () => {
    switch(id) {
      case "personal":
        return (
          <div style={{ minWidth: 220 }}>
            <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:8 }}>
              {photo && (
                <img src={photo} alt="profile" style={{ width:pxSize, height:pxSize, borderRadius:"50%", objectFit:"cover", border:`2px solid ${accentColor}` }}/>
              )}
              <div>
                <div style={{ fontSize:18, fontWeight:"bold" }}>{data.personal.name || "Your Name"}</div>
                <div style={{ fontSize:12, color:accentColor }}>{data.personal.title || "Job Title"}</div>
                <div style={{ fontSize:10, color:"#666", marginTop:4 }}>
                  {[data.personal.location, data.personal.phone, data.personal.email].filter(Boolean).join(" · ")}
                </div>
              </div>
            </div>
          </div>
        );
      case "summary":
        return (
          <div style={{ minWidth: 260 }}>
            <h3 style={{ fontSize:16, fontWeight:"bold", marginBottom:8, borderLeft:`3px solid ${accentColor}`, paddingLeft:8 }}>Summary</h3>
            <p style={{ fontSize:12, lineHeight:1.5, color:"#333" }}>{data.summary.text || "Your professional summary will appear here."}</p>
          </div>
        );
      case "experience":
        return (
          <div style={{ minWidth: 280 }}>
            <h3 style={{ fontSize:16, fontWeight:"bold", marginBottom:8, borderLeft:`3px solid ${accentColor}`, paddingLeft:8 }}>Experience</h3>
            {data.experience.filter(e=>e.company || e.role).map(exp => (
              <div key={exp.id} style={{ marginBottom:12 }}>
                <div style={{ fontWeight:"bold" }}>{exp.role}{exp.company && ` @ ${exp.company}`}</div>
                <div style={{ fontSize:10, color:"#666" }}>{exp.duration} · {exp.location}</div>
                <div style={{ fontSize:11, marginTop:4 }}>{exp.description}</div>
              </div>
            ))}
            {data.experience.every(e=>!e.company && !e.role) && <p style={{ fontSize:11, color:"#999", fontStyle:"italic" }}>Add your experience from the left panel</p>}
          </div>
        );
      case "education":
        return (
          <div style={{ minWidth: 240 }}>
            <h3 style={{ fontSize:16, fontWeight:"bold", marginBottom:8, borderLeft:`3px solid ${accentColor}`, paddingLeft:8 }}>Education</h3>
            <div><strong>{data.education.degree || "Degree"}</strong></div>
            <div style={{ fontSize:12 }}>{data.education.college || "Institution"}</div>
            <div style={{ fontSize:11, color:"#666" }}>{data.education.year}{data.education.gpa && ` · GPA: ${data.education.gpa}`}</div>
          </div>
        );
      case "skills":
        return (
          <div style={{ minWidth: 200 }}>
            <h3 style={{ fontSize:16, fontWeight:"bold", marginBottom:8, borderLeft:`3px solid ${accentColor}`, paddingLeft:8 }}>Skills</h3>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {data.skills.filter(s=>s.name).map(s => (
                <span key={s.id} style={{ background:"#eef2ff", padding:"4px 12px", borderRadius:20, fontSize:12 }}>{s.name}</span>
              ))}
              {data.skills.every(s=>!s.name) && <span style={{ fontSize:12, color:"#999" }}>Add skills from left panel</span>}
            </div>
          </div>
        );
      case "projects":
        return (
          <div style={{ minWidth: 260 }}>
            <h3 style={{ fontSize:16, fontWeight:"bold", marginBottom:8, borderLeft:`3px solid ${accentColor}`, paddingLeft:8 }}>Projects</h3>
            {data.projects.filter(p=>p.name).map(proj => (
              <div key={proj.id} style={{ marginBottom:10 }}>
                <strong>{proj.name}</strong> {proj.stack && <span style={{ fontSize:10, color:"#666" }}>· {proj.stack}</span>}
                <p style={{ fontSize:11, marginTop:2 }}>{proj.description}</p>
              </div>
            ))}
          </div>
        );
      case "certifications":
        return (
          <div style={{ minWidth: 240 }}>
            <h3 style={{ fontSize:16, fontWeight:"bold", marginBottom:8, borderLeft:`3px solid ${accentColor}`, paddingLeft:8 }}>Certifications</h3>
            {data.certifications.filter(c=>c.name).map(cert => (
              <div key={cert.id} style={{ marginBottom:6 }}>
                <strong>{cert.name}</strong> <span style={{ fontSize:10, color:"#666" }}>{cert.issuer}</span>
              </div>
            ))}
          </div>
        );
      case "languages":
        return (
          <div style={{ minWidth: 180 }}>
            <h3 style={{ fontSize:16, fontWeight:"bold", marginBottom:8, borderLeft:`3px solid ${accentColor}`, paddingLeft:8 }}>Languages</h3>
            <div>
              {data.languages.filter(l=>l.language).map(l => (
                <div key={l.id} style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                  <span>{l.language}</span> <span style={{ color:"#666" }}>{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={{ width:"100%", height:"100%" }}>
      {renderBlock()}
    </div>
  );
}

// ─── FREE‑FORM ELEMENT BLOCK (Text, Image, SkillsCloud) ───────────────────────
function FreeformElement({ element, onUpdate, onDelete, onDuplicate }) {
  const fileInputRef = useRef(null);
  const [activeImageElement, setActiveImageElement] = useState(null);

  const updateText = (newText) => onUpdate({ ...element, content: newText });
  const updateSectionTitle = (title) => onUpdate({ ...element, title });
  const updateSectionContent = (content) => onUpdate({ ...element, content });

  const triggerImageUpload = () => {
    setActiveImageElement(element.id);
    fileInputRef.current.click();
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && activeImageElement === element.id) {
      const reader = new FileReader();
      reader.onload = (ev) => onUpdate({ ...element, imageUrl: ev.target.result });
      reader.readAsDataURL(file);
    }
    setActiveImageElement(null);
    e.target.value = "";
  };

  const addSkill = (newSkill) => {
    if (!newSkill.trim()) return;
    onUpdate({ ...element, skills: [...(element.skills || []), newSkill.trim()] });
  };
  const removeSkill = (idx) => {
    const newSkills = [...(element.skills || [])];
    newSkills.splice(idx, 1);
    onUpdate({ ...element, skills: newSkills });
  };

  switch(element.type) {
    case "text":
      return (
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => updateText(e.target.innerText)}
          style={{ outline:"none", fontSize:14, lineHeight:1.4, minWidth:120 }}
        >
          {element.content}
        </div>
      );
    case "section":
      return (
        <div style={{ minWidth:240 }}>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => updateSectionTitle(e.target.innerText)}
            style={{ fontWeight:"bold", fontSize:18, borderBottom:"2px solid #3b82f6", marginBottom:8, outline:"none" }}
          >
            {element.title}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => updateSectionContent(e.target.innerText)}
            style={{ fontSize:13, color:"#334155", outline:"none" }}
          >
            {element.content}
          </div>
        </div>
      );
    case "image":
      return (
        <div
          onClick={triggerImageUpload}
          style={{
            cursor:"pointer",
            minWidth:150, minHeight:120,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:"#f1f5f9", borderRadius:12, border:"1px dashed #94a3b8"
          }}
        >
          {element.imageUrl ? (
            <img src={element.imageUrl} alt="uploaded" style={{ maxWidth:200, maxHeight:150, objectFit:"contain", borderRadius:8 }}/>
          ) : (
            <span style={{ color:"#475569" }}>{element.placeholder || "🖼️ Click to upload"}</span>
          )}
          <input type="file" ref={fileInputRef} style={{ display:"none" }} accept="image/*" onChange={handleImageUpload} />
        </div>
      );
    case "skills":
      return (
        <div style={{ minWidth:180, maxWidth:260 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
            {(element.skills || []).map((skill, idx) => (
              <span key={idx} style={{ background:"#eef2ff", padding:"4px 12px", borderRadius:30, fontSize:12, display:"inline-flex", alignItems:"center", gap:6 }}>
                {skill}
                <span onClick={(e) => { e.stopPropagation(); removeSkill(idx); }} style={{ cursor:"pointer", fontWeight:"bold", color:"#ef4444" }}>×</span>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="➕ Add new skill"
            onKeyDown={(e) => { if(e.key === "Enter") { addSkill(e.target.value); e.target.value = ""; } }}
            style={{ width:"100%", padding:"6px 10px", borderRadius:20, border:"1px solid #cbd5e1", fontSize:12, outline:"none" }}
          />
        </div>
      );
    default: return null;
  }
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BlankCanvasBuilderPro() {
  const [st, setSt] = useState(INIT);
  const [freeformElements, setFreeformElements] = useState([]);
  const [sectionSizes, setSectionSizes] = useState({});
  const paperRef = useRef(null);
  const nodeRefs = useRef({});

  const sec = id => setSt(s=>({...s, activeSection:id}));
  const setFld = (k,v) => setSt(s=>({...s,[k]:v}));

  const idx = ALL_SECTIONS.findIndex(n=>n.id===st.activeSection);
  const meta = SECTION_META[st.activeSection];

  // Add a new freeform element
  const addFreeformElement = (type) => {
    let newEl = {
      id: Date.now(),
      type,
      x: 50,
      y: 50,
      width: 220,
      height: 'auto',
    };
    if (type === "text") newEl.content = "Double-click to edit";
    if (type === "section") { newEl.title = "New Section"; newEl.content = "Write your content here..."; }
    if (type === "image") { newEl.imageUrl = null; newEl.placeholder = "🖼️ Click to upload"; }
    if (type === "skills") newEl.skills = [];
    setFreeformElements(prev => [...prev, newEl]);
  };

  const deleteFreeform = (id) => {
    setFreeformElements(prev => prev.filter(el => el.id !== id));
    delete nodeRefs.current[id];
  };
  const duplicateFreeform = (el) => {
    const newId = Date.now();
    const newEl = { ...el, id: newId, x: el.x + 30, y: el.y + 30 };
    setFreeformElements(prev => [...prev, newEl]);
  };
  const updateFreeform = (id, newData) => {
    setFreeformElements(prev => prev.map(el => el.id === id ? { ...el, ...newData } : el));
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

  // All structured sections as draggable blocks (only those with content)
  const visibleSections = ALL_SECTIONS.filter(s => {
    if (s.id === "personal") return true;
    if (s.id === "summary") return st.summary.text.trim() !== "";
    if (s.id === "experience") return st.experience.some(e => e.company || e.role);
    if (s.id === "education") return st.education.degree || st.education.college;
    if (s.id === "skills") return st.skills.some(sk => sk.name);
    if (s.id === "projects") return st.projects.some(p => p.name);
    if (s.id === "certifications") return st.certifications.some(c => c.name);
    if (s.id === "languages") return st.languages.some(l => l.language);
    return true;
  }).map(s => s.id);

  const getSectionSize = (secId) => sectionSizes[secId] || { width: 260, height: 'auto' };
  const setSectionSize = (secId, width, height) => {
    setSectionSizes(prev => ({ ...prev, [secId]: { width, height } }));
  };

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Inter', sans-serif", overflow:"hidden" }}>
      {/* LEFT: Section sidebar + form */}
      <div style={{ width: 68, background:"#1e293b", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", padding:"8px 0", overflowY:"auto" }}>
        {ALL_SECTIONS.map(n => (
          <button key={n.id} className={`rb-nav${st.activeSection===n.id?" on":""}`} onClick={()=>sec(n.id)} style={{ marginBottom:1 }}>
            <span className="rb-nav-icon">{n.icon}</span>
            <span className="rb-nav-lbl">{n.label}</span>
          </button>
        ))}
      </div>

      <div style={{ width: 500, background:"#fff", borderRight:"1px solid #e5e7eb", display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
        <div className="rb-form-head" style={{ padding:"18px 22px 12px", borderBottom:"1px solid #f3f4f6" }}>
          <h2 style={{ fontSize:17, fontWeight:700 }}>{meta.title}</h2>
          <p style={{ fontSize:12, color:"#6b7280" }}>{meta.desc}</p>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"18px 22px" }}>{renderForm()}</div>
        <div className="rb-form-foot" style={{ padding:"12px 22px", borderTop:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between" }}>
          <button className="rb-back" disabled={idx===0} onClick={()=>sec(ALL_SECTIONS[idx-1].id)}>‹ Back</button>
          <button className="rb-next" disabled={idx===ALL_SECTIONS.length-1} onClick={()=>sec(ALL_SECTIONS[idx+1].id)}>Next ›</button>
        </div>
      </div>

      {/* RIGHT: Canvas area with A4 sheet */}
      <div style={{ flex:1, background:"#d1d5db", display:"flex", alignItems:"center", justifyContent:"center", overflow:"auto", padding:"20px" }}>
        <div
          ref={paperRef}
          onDragOver={e=>e.preventDefault()}
          style={{
            position:"relative",
            width:"794px", height:"1123px",
            background:"white",
            boxShadow:"0 25px 50px -12px rgba(0,0,0,0.25)",
            borderRadius:"4px",
            overflow:"hidden"
          }}
        >
          {/* Structured sections as draggable blocks */}
          {visibleSections.map((secId, i) => {
            const size = getSectionSize(secId);
            if (!nodeRefs.current[`sec-${secId}`]) nodeRefs.current[`sec-${secId}`] = { current: null };
            return (
              <Draggable
                key={`sec-${secId}`}
                nodeRef={nodeRefs.current[`sec-${secId}`]}
                handle=".drag-handle"
                bounds="parent"
                defaultPosition={{ x: 30 + (i%2)*50, y: 50 + i*120 }}
              >
                <div
                  ref={nodeRefs.current[`sec-${secId}`]}
                  style={{
                    position:"absolute",
                    background:"white",
                    borderRadius:"20px",
                    boxShadow:"0 12px 30px rgba(0,0,0,0.08)",
                    padding:"12px 16px",
                    cursor:"default"
                  }}
                >
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, borderBottom:"1px solid #eef2ff", paddingBottom:6 }}>
                    <span className="drag-handle" style={{ cursor:"grab", fontSize:16, color:"#94a3b8", letterSpacing:2 }}>⋮⋮</span>
                    <div style={{ display:"flex", gap:8 }}>
                      <span onClick={() => {
                        const newId = Date.now();
                        const newEl = { type:"section", id:newId, title: secId, content: "", x: 60, y: 60, width: 220, height: 'auto' };
                        setFreeformElements(prev => [...prev, newEl]);
                      }} style={{ cursor:"pointer", fontSize:13, color:"#3b82f6", background:"#eff6ff", padding:"2px 8px", borderRadius:20 }}>Duplicate</span>
                    </div>
                  </div>
                  <ResizableBox
                    width={size.width}
                    height={size.height}
                    onResize={(w, h) => setSectionSize(secId, w, h)}
                    minWidth={180}
                    maxWidth={500}
                    minHeight={100}
                  >
                    <StructuredSectionBlock id={secId} data={st} styling={st.styling} />
                  </ResizableBox>
                </div>
              </Draggable>
            );
          })}

          {/* Freeform elements */}
          {freeformElements.map(el => {
            if (!nodeRefs.current[el.id]) nodeRefs.current[el.id] = { current: null };
            return (
              <Draggable
                key={el.id}
                nodeRef={nodeRefs.current[el.id]}
                handle=".drag-handle"
                bounds="parent"
                defaultPosition={{ x: el.x, y: el.y }}
                onStop={(e, data) => updateFreeform(el.id, { x: data.x, y: data.y })}
              >
                <div
                  ref={nodeRefs.current[el.id]}
                  style={{
                    position:"absolute",
                    background:"white",
                    borderRadius:"20px",
                    boxShadow:"0 12px 30px rgba(0,0,0,0.08)",
                    padding:"12px 16px",
                    cursor:"default"
                  }}
                >
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, borderBottom:"1px solid #eef2ff", paddingBottom:6 }}>
                    <span className="drag-handle" style={{ cursor:"grab", fontSize:16, color:"#94a3b8", letterSpacing:2 }}>⋮⋮</span>
                    <div style={{ display:"flex", gap:8 }}>
                      <span onClick={() => duplicateFreeform(el)} style={{ cursor:"pointer", fontSize:13, color:"#3b82f6", background:"#eff6ff", padding:"2px 8px", borderRadius:20 }}>Duplicate</span>
                      <span onClick={() => deleteFreeform(el.id)} style={{ cursor:"pointer", fontSize:13, color:"#ef4444", background:"#fee2e2", padding:"2px 8px", borderRadius:20 }}>Delete</span>
                    </div>
                  </div>
                  <ResizableBox
                    width={el.width || 220}
                    height={el.height || 'auto'}
                    onResize={(w, h) => updateFreeform(el.id, { width: w, height: h })}
                    minWidth={150}
                    maxWidth={600}
                    minHeight={100}
                  >
                    <FreeformElement element={el} onUpdate={(newData) => updateFreeform(el.id, newData)} />
                  </ResizableBox>
                </div>
              </Draggable>
            );
          })}

          {visibleSections.length === 0 && freeformElements.length === 0 && (
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", color:"#9ca3af", pointerEvents:"none" }}>
              <p>Drag elements from the left panel or use the floating menu to add blocks</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating action menu for freeform elements */}
      <div style={{ position:"fixed", bottom:"24px", right:"24px", display:"flex", gap:"12px", zIndex:20 }}>
        <button onClick={() => addFreeformElement("text")} style={{ background:"#0f172a", border:"none", padding:"10px 16px", borderRadius:"40px", color:"white", fontWeight:600, fontSize:12, cursor:"pointer" }}>➕ Text</button>
        <button onClick={() => addFreeformElement("section")} style={{ background:"#0f172a", border:"none", padding:"10px 16px", borderRadius:"40px", color:"white", fontWeight:600, fontSize:12, cursor:"pointer" }}>📌 Section</button>
        <button onClick={() => addFreeformElement("image")} style={{ background:"#0f172a", border:"none", padding:"10px 16px", borderRadius:"40px", color:"white", fontWeight:600, fontSize:12, cursor:"pointer" }}>🖼️ Image</button>
        <button onClick={() => addFreeformElement("skills")} style={{ background:"#0f172a", border:"none", padding:"10px 16px", borderRadius:"40px", color:"white", fontWeight:600, fontSize:12, cursor:"pointer" }}>⚡ Skills</button>
        <button onClick={() => {
          const dataStr = JSON.stringify({ structured: st, freeform: freeformElements, sectionSizes }, null, 2);
          const blob = new Blob([dataStr], { type:"application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "resume-canvas-full.json";
          a.click();
          URL.revokeObjectURL(url);
        }} style={{ background:"#10b981", border:"none", padding:"10px 16px", borderRadius:"40px", color:"white", fontWeight:600, fontSize:12, cursor:"pointer" }}>💾 Export</button>
        <button onClick={() => { setSt(INIT); setFreeformElements([]); setSectionSizes({}); }} style={{ background:"#ef4444", border:"none", padding:"10px 16px", borderRadius:"40px", color:"white", fontWeight:600, fontSize:12, cursor:"pointer" }}>🗑️ Clear All</button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;600;700&family=Raleway:wght@300;400;600;700&display=swap');
        .rb-nav{ display:flex; flex-direction:column; align-items:center; gap:3px; padding:8px 4px; cursor:pointer; border-radius:8px; width:58px; border:none; background:none; color:#94a3b8; transition:all .15s; margin-bottom:1px; }
        .rb-nav:hover{ background:rgba(255,255,255,.08); color:#e2e8f0; }
        .rb-nav.on{ background:rgba(255,255,255,.14); color:#fff; }
        .rb-nav-icon{ font-size:16px; line-height:1; height:22px; display:flex; align-items:center; justify-content:center; }
        .rb-nav-lbl{ font-size:9px; font-weight:500; text-align:center; line-height:1.2; }
        .rb-back, .rb-next{ display:flex; align-items:center; gap:5px; padding:8px 18px; border:1.5px solid #e5e7eb; border-radius:8px; background:#fff; font-size:13px; font-weight:500; color:#374151; cursor:pointer; }
        .rb-next{ background:#111827; color:#fff; border:none; }
        .rb-back:disabled, .rb-next:disabled{ opacity:.3; cursor:default; }
        .rb-g{margin-bottom:13px;}
        .rb-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:4px;}
        .rb-in{width:100%;padding:8px 11px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;font-family:inherit;color:#111827;background:#fff;outline:none;}
        .rb-in:focus{border-color:#6366f1;}
        .rb-ta{min-height:82px;resize:vertical;line-height:1.55;padding-bottom:40px;}
        .rb-row{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
        .rb-ai-wrap{position:relative;}
        .rb-ai-btn{position:absolute;bottom:8px;right:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;}
        .rb-card{background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:10px;padding:13px;margin-bottom:9px;}
        .rb-card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;}
        .rb-card-title{font-size:12px;font-weight:600;color:#374151;}
        .rb-rm{background:none;border:none;color:#ef4444;cursor:pointer;font-size:19px;padding:0 3px;line-height:1;}
        .rb-add{width:100%;padding:8px;background:#fff;border:1.5px dashed #d1d5db;border-radius:8px;color:#6366f1;font-size:13px;font-weight:600;cursor:pointer;margin-top:2px;}
        .rb-chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:11px;min-height:28px;}
        .rb-chip{display:inline-flex;align-items:center;gap:3px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:99px;padding:3px 9px;font-size:12px;color:#2563eb;font-weight:500;}
        .rb-chip-x{background:none;border:none;cursor:pointer;color:#93c5fd;font-size:13px;padding:0;line-height:1;}
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
        .rb-pos-btn{flex:1;padding:7px 4px;border:1.5px solid #e2e8f0;border-radius:7px;background:#fff;font-size:11px;font-weight:600;color:#64748b;cursor:pointer;text-align:center;}
        .rb-pos-btn.on{border-color:#6366f1;background:#eff6ff;color:#4f46e5;}
        .rb-size-row{display:flex;gap:7px;margin-bottom:12px;}
        .rb-size-btn{flex:1;padding:7px 4px;border:1.5px solid #e2e8f0;border-radius:7px;background:#fff;font-size:11px;font-weight:600;color:#64748b;cursor:pointer;text-align:center;}
        .rb-size-btn.on{border-color:#6366f1;background:#eff6ff;color:#4f46e5;}
        .rb-del-photo{width:100%;padding:7px;border:1.5px solid #fca5a5;border-radius:7px;background:#fff;color:#ef4444;font-size:12px;font-weight:600;cursor:pointer;}
        .rb-style-lbl{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;margin:16px 0 8px;}
        .rb-font-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
        .rb-font-opt{padding:9px 11px;border-radius:7px;border:1.5px solid #e5e7eb;cursor:pointer;font-size:13px;background:#fff;transition:all .15s;}
        .rb-font-opt.on{border-color:#6366f1;background:#eff6ff;color:#4f46e5;font-weight:700;}
        .rb-color-row{display:flex;gap:7px;flex-wrap:wrap;align-items:center;}
        .rb-swatch{width:27px;height:27px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all .15s;}
        .rb-swatch.on{border-color:#111827;transform:scale(1.18);}
        .rb-layout-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:4px;}
        .rb-layout-card{border:2px solid #e5e7eb;border-radius:10px;padding:10px 6px 8px;cursor:pointer;background:#fff;text-align:center;}
        .rb-layout-card.on{border-color:#6366f1;background:#eff6ff;}
        .rb-layout-icon{font-size:20px;margin-bottom:4px;display:block;}
        .rb-layout-name{font-size:11px;font-weight:700;color:#374151;display:block;}
        .rb-layout-desc{font-size:9px;color:#94a3b8;display:block;margin-top:2px;}
      `}</style>
    </div>
  );
}