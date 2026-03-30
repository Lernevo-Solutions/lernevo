// BlankCanvasBuilder.js – Complete with Undo/Redo, Layouts, Additional Sections, Resizable Elements
import React, { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ALL_SECTIONS = [
  { id: "layout",         label: "Layout",         icon: "📐" },
  { id: "styling",        label: "Styling",        icon: "🎨" },
  { id: "personal",       label: "Personal",       icon: "👤" },
  { id: "summary",        label: "Summary",        icon: "📄" },
  { id: "experience",     label: "Experience",     icon: "💼" },
  { id: "education",      label: "Education",      icon: "🎓" },
  { id: "skills",         label: "Skills",         icon: "</>" },
  { id: "projects",       label: "Projects",       icon: "🚀" },
  { id: "certifications", label: "Certifications", icon: "🏆" },
  { id: "languages",      label: "Languages",      icon: "Aa" },
  { id: "additional",     label: "More",           icon: "➕" },
];

const SECTION_META = {
  layout:         { title:"Resume Layout",          desc:"Craft a personalized layout with complete creative freedom" },
  personal:       { title:"Personal Information",   desc:"Your contact details and basic info" },
  summary:        { title:"Professional Summary",   desc:"A brief overview of your background" },
  experience:     { title:"Work Experience",        desc:"Your employment history" },
  education:      { title:"Education",              desc:"Your academic background" },
  skills:         { title:"Skills",                 desc:"Technical and soft skills" },
  projects:       { title:"Projects",               desc:"Notable projects you've worked on" },
  certifications: { title:"Certifications",         desc:"Professional certifications" },
  languages:      { title:"Languages",              desc:"Languages you speak" },
  styling:        { title:"Resume Styling",         desc:"Customize fonts, colors & layout" },
  additional:     { title:"Additional Sections",    desc:"Add awards, references, hobbies, or custom sections" },
};

const AI = {
  summary:       "Results-driven professional with 5+ years of experience delivering high-impact outcomes. Proven track record of leading cross-functional teams and shipping products on time.",
  experience:    "Led end-to-end development of a platform that reduced deployment time by 60% and improved reliability to 99.98% uptime.",
  project:       "Built a real-time collaborative tool using React and WebSockets. Supports 50+ concurrent users with <100ms latency.",
  certification: "Completed advanced coursework covering architecture patterns, security best practices, and cost optimization.",
};

const BASE_FONTS = ["DM Sans","Inter","Lato","Merriweather","Playfair Display","Raleway"];
const EXTRA_FONTS = [
  "Poppins", "Roboto", "Open Sans", "Montserrat", "Source Sans Pro", "Nunito",
  "Ubuntu", "Cabin", "Work Sans", "Josefin Sans", "Quicksand", "Rubik"
];
const ALL_FONTS = [...BASE_FONTS, ...EXTRA_FONTS];

const PROF_LEVELS  = ["Native","Fluent","Advanced","Intermediate","Basic"];
const SKILL_LEVELS = ["Beginner","Intermediate","Advanced","Expert"];
const COLORS       = ["#1e293b","#2563eb","#059669","#dc2626","#7c3aed","#db2777","#b45309","#0f766e","#e11d48","#0f172a"];

const LAYOUTS = [
  { id: "one-col", label: "Classic", icon: "📋", desc: "Standard top-to-bottom" },
  { id: "two-col", label: "Two Column", icon: "▌▐", desc: "Balanced side-by-side" },
  { id: "sidebar-left", label: "Modern Sidebar", icon: "▌▬", desc: "Left sidebar + Main" },
  { id: "creative", label: "Creative", icon: "🎨", desc: "Asymmetric stylish design" },
  { id: "technical", label: "Tech Focused", icon: "💻", desc: "Highlighting skills and stack" },
  
  { id: "academic", label: "Academic CV", icon: "🎓", desc: "Detailed for research/edu" },
];

const PHOTO_SIZES = { small:52, medium:72, large:96 };

const uid = () => Date.now() + Math.random();
const makeExp  = () => ({ id:uid(), company:"", role:"", duration:"", location:"", description:"" });
const makeProj = () => ({ id:uid(), name:"", stack:"", description:"", link:"" });
const makeCert = () => ({ id:uid(), name:"", issuer:"", date:"", description:"" });
const makeLang = () => ({ id:uid(), language:"", proficiency:"Intermediate" });
const makeSkill= () => ({ id:uid(), name:"", level:"Intermediate" });

const INIT = {
  activeSection:"layout",
  personal:       { name:"", title:"", email:"", phone:"", location:"", linkedin:"", github:"", photo:null },
  summary:        { text:"" },
  experience:     [makeExp()],
  education:      { degree:"", college:"", year:"", gpa:"" },
  skills:         [makeSkill()],
  projects:       [makeProj()],
  certifications: [makeCert()],
  languages:      [makeLang()],
  styling: { font:"Inter", accentColor:"#2563eb", layout:"one-col", photoPosition:"left", photoSize:"medium" },
  optionalSections: [],
};

// ─── Design Elements Data (only lines are used for adding lines, shapes and stickers not used)
const LINES = [
  { id: "hline", name: "Horizontal", icon: "─", defaultProps: { lineType: "horizontal", width: 150, height: 2, color: "#475569", thickness: 2, rotation: 0 } },
  { id: "vline", name: "Vertical", icon: "│", defaultProps: { lineType: "vertical", width: 2, height: 100, color: "#475569", thickness: 2, rotation: 0 } },
  { id: "diag", name: "Diagonal", icon: "╱", defaultProps: { lineType: "diagonal", width: 100, height: 100, color: "#475569", thickness: 2, rotation: 0 } },
];

// ─── Table helper ────────────────────────────────────────────────────────────
const makeTable = () => ({
  id: uid(),
  type: "table",
  rows: 3,
  cols: 3,
  data: Array(3).fill().map(() => Array(3).fill("")),
  width: 300,
  height: 200,
  x: 50,
  y: 50,
});

// ─── Resizable Component with Invisible Corners (fixed dependency) ──────────
const ResizableWithHandles = ({ children, width, height, onResize, minWidth = 20, minHeight = 20, maxWidth = 600, maxHeight = 4000 }) => {
  const [resizing, setResizing] = useState(false);
  const [handleType, setHandleType] = useState(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width, height });
  const startPosition = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const getPosition = useCallback(() => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const parentRect = containerRef.current.parentElement?.getBoundingClientRect() || { left: 0, top: 0 };
    return {
      x: rect.left - parentRect.left,
      y: rect.top - parentRect.top,
    };
  }, []);

  const handleMouseDown = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    setHandleType(handle);
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { width: typeof width === 'number' ? width : 0, height: typeof height === 'number' ? height : 0 };
    startPosition.current = getPosition();
  };

  const handleMouseMove = useCallback((e) => {
    if (!resizing) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    let newWidth = startSize.current.width;
    let newHeight = startSize.current.height;
    let newX = startPosition.current.x;
    let newY = startPosition.current.y;

    switch (handleType) {
      case "bottom-right":
        newWidth = Math.min(maxWidth, Math.max(minWidth, startSize.current.width + dx));
        newHeight = Math.min(maxHeight, Math.max(minHeight, startSize.current.height + dy));
        break;
      case "bottom-left":
        newWidth = Math.min(maxWidth, Math.max(minWidth, startSize.current.width - dx));
        newHeight = Math.min(maxHeight, Math.max(minHeight, startSize.current.height + dy));
        newX = startPosition.current.x + (startSize.current.width - newWidth);
        break;
      case "top-right":
        newWidth = Math.min(maxWidth, Math.max(minWidth, startSize.current.width + dx));
        newHeight = Math.min(maxHeight, Math.max(minHeight, startSize.current.height - dy));
        newY = startPosition.current.y + (startSize.current.height - newHeight);
        break;
      case "top-left":
        newWidth = Math.min(maxWidth, Math.max(minWidth, startSize.current.width - dx));
        newHeight = Math.min(maxHeight, Math.max(minHeight, startSize.current.height - dy));
        newX = startPosition.current.x + (startSize.current.width - newWidth);
        newY = startPosition.current.y + (startSize.current.height - newHeight);
        break;
      default: break;
    }

    onResize(newWidth, newHeight, newX, newY);
  }, [resizing, handleType, maxWidth, maxHeight, minWidth, minHeight, onResize]);

  const handleMouseUp = useCallback(() => {
    setResizing(false);
    setHandleType(null);
  }, []);

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing, handleMouseMove, handleMouseUp]);

  const cornerStyle = {
    position: 'absolute',
    width: 16,
    height: 16,
    zIndex: 10,
    opacity: 0,
    cursor: 'default',
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: typeof width === 'number' ? width : 'auto',
        height: typeof height === 'number' ? height : 'auto',
        display: 'inline-block',
        position: 'relative',
      }}
    >
      {children}
      <div
        onMouseDown={(e) => handleMouseDown(e, "top-left")}
        style={{ ...cornerStyle, top: -8, left: -8, cursor: 'nw-resize' }}
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, "top-right")}
        style={{ ...cornerStyle, top: -8, right: -8, cursor: 'ne-resize' }}
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, "bottom-left")}
        style={{ ...cornerStyle, bottom: -8, left: -8, cursor: 'sw-resize' }}
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, "bottom-right")}
        style={{ ...cornerStyle, bottom: -8, right: -8, cursor: 'se-resize' }}
      />
    </div>
  );
};

// ─── Draggable Text Block (fully draggable) ─────────────────────────────────
const DraggableTextBlock = ({ id, text, baseStyle, defaultPos, defaultSize, onTextChange, defaultFontSize, defaultTextAlign, onDragStop, onResize, onFontSizeChange, onTextAlignChange, isSelected, onSelect, minWidth = 50, minHeight = 30 }) => {
  const nodeRef = useRef(null);
  const [size, setSize] = useState(defaultSize || { width: 'auto', height: 'auto' });
  const [fontSize, setFontSize] = useState(defaultFontSize || (baseStyle.fontSize ? parseInt(baseStyle.fontSize) : 14));
  const [textAlign, setTextAlign] = useState(defaultTextAlign || 'left');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setSize(defaultSize || { width: 'auto', height: 'auto' });
  }, [defaultSize]);

  useEffect(() => {
    setFontSize(defaultFontSize || (baseStyle.fontSize ? parseInt(baseStyle.fontSize) : 14));
  }, [defaultFontSize, baseStyle]);

  useEffect(() => {
    setTextAlign(defaultTextAlign || 'left');
  }, [defaultTextAlign]);

  const handleResize = (w, h) => {
    const newSize = { width: w, height: h };
    setSize(newSize);
    onResize(newSize);
  };

  const increaseFont = (e) => {
    e.stopPropagation();
    const newSize = Math.min(48, fontSize + 2);
    setFontSize(newSize);
    onFontSizeChange(newSize);
  };

  const decreaseFont = (e) => {
    e.stopPropagation();
    const newSize = Math.max(8, fontSize - 2);
    setFontSize(newSize);
    onFontSizeChange(newSize);
  };

  const currentStyle = {
    ...baseStyle,
    fontSize: `${fontSize}px`,
    lineHeight: '1',
    textAlign: textAlign,
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(id);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      position={{ x: defaultPos.x, y: defaultPos.y }}
      onStop={onDragStop}
    >
      <div
        ref={nodeRef}
        onClick={handleClick}
        className="draggable-text-block"
        style={{
          position: "absolute",
          cursor: "move",
          background: "transparent",
          border: isSelected ? "1px dashed #3b82f6" : "1px dashed transparent",
          transition: "border 0.2s",
        }}
        onMouseOver={(e) => {
          if (!isSelected) e.currentTarget.style.border = "1px dashed #cbd5e1";
        }}
        onMouseOut={(e) => {
          if (!isSelected) e.currentTarget.style.border = "1px dashed transparent";
        }}
      >
        {isSelected && (
          <div
            style={{
              position: "absolute",
              top: -32,
              left: 0,
              display: "flex",
              gap: "6px",
              background: "white",
              borderRadius: "20px",
              padding: "4px 8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              zIndex: 20,
              fontSize: "12px",
              border: "1px solid #e2e8f0",
            }}
          >
            <button
              onClick={decreaseFont}
              style={{ cursor: "pointer", background: "#f1f5f9", border: "none", borderRadius: "50%", width: "24px", height: "24px", fontWeight: "bold" }}
            >
              –
            </button>
            <span style={{ fontSize: "12px", fontWeight: 500, minWidth: "30px", textAlign: "center" }}>{fontSize}px</span>
            <button
              onClick={increaseFont}
              style={{ cursor: "pointer", background: "#f1f5f9", border: "none", borderRadius: "50%", width: "24px", height: "24px", fontWeight: "bold" }}
            >
              +
            </button>
            <div style={{ width: "1px", background: "#e2e8f0", margin: "0 2px" }} />
          </div>
        )}
        <ResizableWithHandles
          width={size.width === 'auto' ? 'auto' : size.width}
          height={size.height === 'auto' ? 'auto' : size.height}
          onResize={handleResize}
          minWidth={minWidth}
          minHeight={minHeight}
          maxWidth={600}
        >
          <div
            contentEditable={isEditing}
            suppressContentEditableWarning
            onDoubleClick={() => setIsEditing(true)}
            onBlur={(e) => {
              setIsEditing(false);
              if (onTextChange) onTextChange(e.target.innerText);
            }}
            style={{
              ...currentStyle,
              display: 'block',
              padding: '0px 2px',
              width: '100%',
              height: 'auto',
              whiteSpace: 'normal',
              outline: isEditing ? '1px solid #3b82f6' : 'none',
              cursor: isEditing ? 'text' : 'move',
            }}
          >
            {text}
          </div>
        </ResizableWithHandles>
      </div>
    </Draggable>
  );
};

// ─── FORM COMPONENTS ─────────────────────────────────────────────────────────
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

// ─── StylingSection with "More" fonts ───────────────────────────────────────
function StylingSection({ data, onChange, onAddTable, onAddLine }) {
  const [showMoreFonts, setShowMoreFonts] = useState(false);
  const s = k => v => onChange({...data,[k]:v});
  const displayedFonts = showMoreFonts ? ALL_FONTS : BASE_FONTS;
  return (
    <div>
      
     

      <div className="rb-style-lbl">Font Family</div>
      <div className="rb-font-grid">
        {displayedFonts.map(f=>(
          <div key={f} className={`rb-font-opt${data.font===f?" on":""}`}
            style={{fontFamily:`'${f}',sans-serif`}} onClick={()=>s("font")(f)}>{f}</div>
        ))}
        {!showMoreFonts && (
          <div className="rb-font-opt" onClick={()=>setShowMoreFonts(true)} style={{textAlign:"center", background:"#f1f5f9"}}>
            + More
          </div>
        )}
        {showMoreFonts && (
          <div className="rb-font-opt" onClick={()=>setShowMoreFonts(false)} style={{textAlign:"center", background:"#f1f5f9"}}>
            Show less
          </div>
        )}
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

      <div className="rb-style-lbl">Add Design Elements</div>
      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <button
          onClick={onAddTable}
          style={{
            flex: 1,
            padding: "8px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span>📊</span> Add Table
        </button>
        <button
          onClick={onAddLine}
          style={{
            flex: 1,
            padding: "8px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span>➖</span> Add Line
        </button>
      </div>
    </div>
  );
}

// ─── Additional Sections Panel (empty placeholder) ──────────────────────────
function AdditionalSectionsPanel({ optionalSections, onAdd, onRemove, onUpdate }) {
  const [customTitle, setCustomTitle] = useState("");
  const [customContent, setCustomContent] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);

  const predefinedSections = [
    { id: "awards", title: "Awards & Honors", content: "" },
    { id: "websites", title: "Websites & Social Media", content: "" },
    { id: "references", title: "References", content: "" },
    { id: "hobbies", title: "Hobbies & Interests", content: "" },
  ];

  const addPredefined = (type, title, content) => {
    const newId = uid();
    onAdd({
      id: newId,
      title,
      content: content || "Click to edit...",
      type: "predefined",
    });
  };

  const addCustom = () => {
    if (!customTitle.trim()) return;
    const newId = uid();
    onAdd({
      id: newId,
      title: customTitle.trim(),
      content: customContent.trim() || "Click to edit...",
      type: "custom",
    });
    setCustomTitle("");
    setCustomContent("");
    setShowCustomForm(false);
  };

  return (
    <div style={{ padding: "8px 0" }}>
      <p style={{ fontSize: "13px", color: "#4b5563", marginBottom: "16px" }}>
        Add extra sections like awards, references, hobbies, or create your own.
      </p>

      <div className="rb-style-lbl">Pre‑defined Sections</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
        {predefinedSections.map(sec => (
          <button
            key={sec.id}
            onClick={() => addPredefined(sec.id, sec.title, sec.content)}
            style={{
              padding: "8px 12px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "30px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            + {sec.title}
          </button>
        ))}
      </div>

      <div className="rb-style-lbl">Custom Section</div>
      {!showCustomForm ? (
        <button
          onClick={() => setShowCustomForm(true)}
          style={{
            width: "100%",
            padding: "10px",
            background: "#f8fafc",
            border: "1px dashed #cbd5e1",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 500,
            color: "#2563eb",
            marginBottom: "20px",
          }}
        >
          + Create Custom Section
        </button>
      ) : (
        <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "12px", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Section title (e.g., 'Volunteering')"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            style={{ width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}
          />
          <textarea
            placeholder="Section content (one item per line)"
            value={customContent}
            onChange={(e) => setCustomContent(e.target.value)}
            rows={3}
            style={{ width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button onClick={() => setShowCustomForm(false)} style={{ padding: "5px 12px", background: "#e5e7eb", border: "none", borderRadius: "20px", cursor: "pointer" }}>Cancel</button>
            <button onClick={addCustom} style={{ padding: "5px 12px", background: "#2563eb", color: "white", border: "none", borderRadius: "20px", cursor: "pointer" }}>Add Section</button>
          </div>
        </div>
      )}

      {optionalSections.length > 0 && (
        <>
          <div className="rb-style-lbl">Your Added Sections</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {optionalSections.map(section => (
              <div key={section.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ fontSize: "14px" }}>{section.title}</strong>
                  <button
                    onClick={() => onRemove(section.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#ef4444" }}
                  >
                    🗑️
                  </button>
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdate(section.id, { ...section, content: e.target.innerText })}
                  style={{
                    fontSize: "12px",
                    color: "#4b5563",
                    whiteSpace: "pre-wrap",
                    outline: "none",
                    padding: "4px 0",
                    minHeight: "40px",
                  }}
                  data-placeholder={section.content === "" ? "Click to edit..." : undefined}
                >
                  {section.content || ""}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── FREE‑FORM ELEMENT (including table, shape, line, sticker) ──────────────
function FreeformElement({ element, onUpdate, isSelected }) {
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

  const renderTable = () => {
    const { rows, cols, data } = element;
    
    const addRow = (e) => {
      e.stopPropagation();
      const newRow = Array(cols || 3).fill("");
      onUpdate({ ...element, rows: rows + 1, data: [...data, newRow] });
    };

    const addCol = (e) => {
      e.stopPropagation();
      const newData = data.map(row => [...row, ""]);
      onUpdate({ ...element, cols: cols + 1, data: newData });
    };

    const updateCell = (r, c, value) => {
      const newData = [...data];
      if (newData[r]) {
        newData[r][c] = value;
        onUpdate({ ...element, data: newData });
      }
    };

    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {isSelected && (
          <div style={{ position: "absolute", top: -35, left: 0, display: "flex", gap: "8px", zIndex: 100 }}>
            <button onClick={addRow} style={{ padding: "4px 10px", fontSize: "11px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>+ Row</button>
            <button onClick={addCol} style={{ padding: "4px 10px", fontSize: "11px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>+ Column</button>
          </div>
        )}
        
        <div style={{ overflow: "hidden", width: "100%", height: "100%", border: "1px solid #cbd5e1" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", height: "100%", fontSize: "12px", tableLayout: "fixed" }}>
            <tbody>
              {data.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateCell(r, c, e.target.innerText)}
                      style={{ border: "1px solid #cbd5e1", padding: "8px", outline: "none", background: "white", wordBreak: "break-word" }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderShape = () => {
    const { shapeType, width, height, fill, stroke, strokeWidth, rotation } = element;
    const style = { width, height, transform: `rotate(${rotation}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' };
    if (shapeType === 'rect') {
      return <div style={{ ...style, background: fill, border: `${strokeWidth}px solid ${stroke}` }} />;
    }
    if (shapeType === 'circle') {
      return <div style={{ ...style, borderRadius: '50%', background: fill, border: `${strokeWidth}px solid ${stroke}` }} />;
    }
    if (shapeType === 'triangle') {
      return (
        <div style={{ ...style, position: 'relative' }}>
          <div style={{
            width: 0, height: 0,
            borderLeft: `${width/2}px solid transparent`,
            borderRight: `${width/2}px solid transparent`,
            borderBottom: `${height}px solid ${fill}`,
            position: 'absolute',
            top: 0, left: 0,
          }} />
          {strokeWidth > 0 && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0,
              width: width, height: height,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              border: `${strokeWidth}px solid ${stroke}`,
              boxSizing: 'border-box',
            }} />
          )}
        </div>
      );
    }
    if (shapeType === 'star') {
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <polygon points="12,2 15,9 22,9 16,14 19,22 12,17 5,22 8,14 2,9 9,9 12,2" />
        </svg>
      );
    }
    if (shapeType === 'heart') {
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    }
    return null;
  };

  const renderLine = () => {
    const { lineType, width, height, color, thickness, rotation } = element;
    const style = { width, height, transform: `rotate(${rotation}deg)`, backgroundColor: color };
    if (lineType === 'horizontal') return <div style={{ ...style, height: thickness }} />;
    if (lineType === 'vertical') return <div style={{ ...style, width: thickness }} />;
    if (lineType === 'diagonal') {
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ transform: `rotate(${rotation}deg)` }}>
          <line x1="0" y1="0" x2={width} y2={height} stroke={color} strokeWidth={thickness} />
        </svg>
      );
    }
    return null;
  };

  const renderSticker = () => {
    const { stickerType, content, fontSize } = element;
    if (stickerType === 'emoji') {
      return <div style={{ fontSize: `${fontSize}px`, textAlign: 'center' }}>{content}</div>;
    }
    return null;
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
    case "table":
      return renderTable();
    case "shape":
      return renderShape();
    case "line":
      return renderLine();
    case "sticker":
      return renderSticker();
    default: return null;
  }
}

// ─── Helper: Generate all draggable text items (includes optional sections) ──
function getAllDraggableItems(state, styling) {
  const items = [];
  const { personal, summary, experience, education, skills, projects, certifications, languages } = state;
  const optionalSections = state.optionalSections || [];
  const { accentColor, font } = styling;

  const baseFont = { fontFamily: `'${font}', sans-serif` };

  // Personal
  if (personal.name) {
    items.push({
      id: "personal-name",
      text: personal.name,
      style: { ...baseFont, fontSize: 24, fontWeight: "bold", color: "#1e293b", marginBottom: "0px", whiteSpace: "normal", maxWidth: "280px", padding: "2px 4px" }
    });
  }
  if (personal.title) {
    items.push({
      id: "personal-title",
      text: personal.title,
      style: { ...baseFont, fontSize: 14, color: accentColor, fontWeight: 500, marginBottom: "2px", whiteSpace: "normal", maxWidth: "280px" }
    });
  }
  if (personal.email) items.push({ id: "personal-email", text: personal.email, style: { ...baseFont, fontSize: 11, color: "#64748b", whiteSpace: "normal", maxWidth: "200px" } });
  if (personal.phone) items.push({ id: "personal-phone", text: personal.phone, style: { ...baseFont, fontSize: 11, color: "#64748b", whiteSpace: "normal", maxWidth: "200px" } });
  if (personal.location) items.push({ id: "personal-location", text: personal.location, style: { ...baseFont, fontSize: 11, color: "#64748b", whiteSpace: "normal", maxWidth: "200px" } });
  if (personal.linkedin) items.push({ id: "personal-linkedin", text: `🔗 ${personal.linkedin}`, style: { ...baseFont, fontSize: 11, color: "#64748b", whiteSpace: "normal", maxWidth: "200px" } });
  if (personal.github) items.push({ id: "personal-github", text: `🐙 ${personal.github}`, style: { ...baseFont, fontSize: 11, color: "#64748b", whiteSpace: "normal", maxWidth: "200px" } });

  // Summary
  if (summary.text.trim()) {
    items.push({ 
      id: "heading-summary", 
      text: "Summary", 
      style: { ...baseFont, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderLeft: `3px solid ${accentColor}`, paddingLeft: 10, color: "#1e293b", whiteSpace: "nowrap" } 
    });
    
    items.push({
      id: "summary-text",
      text: summary.text,
      style: { 
        ...baseFont, 
        fontSize: 12, 
        lineHeight: 1.5, 
        color: "#334155", 
        whiteSpace: "normal", 
        maxWidth: "520px"  
      }
    });
  }

  // Experience
  const hasExperience = experience.some(e => e.company || e.role || e.description);
  if (hasExperience) {
    items.push({ id: "heading-experience", text: "Experience", style: { ...baseFont, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderLeft: `3px solid ${accentColor}`, paddingLeft: 10, color: "#1e293b", whiteSpace: "nowrap" } });
    experience.forEach(exp => {
      if (exp.role || exp.company) items.push({ id: `exp-title-${exp.id}`, text: `${exp.role}${exp.company ? ` | ${exp.company}` : ''}`, style: { ...baseFont, fontWeight: 700, fontSize: 13, color: "#1e293b", whiteSpace: "normal" } });
      if (exp.duration || exp.location) items.push({ id: `exp-meta-${exp.id}`, text: `${exp.duration}${exp.location ? ` • ${exp.location}` : ''}`, style: { ...baseFont, fontSize: 10, color: accentColor, fontWeight: 600, whiteSpace: "normal" } });
      if (exp.description) items.push({ id: `exp-desc-${exp.id}`, text: exp.description, style: { ...baseFont, fontSize: 11, lineHeight: 1.5, color: "#475569", whiteSpace: "normal" } });
    });
  }

  // Education
  if (education.degree || education.college) {
    items.push({ id: "heading-education", text: "Education", style: { ...baseFont, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderLeft: `3px solid ${accentColor}`, paddingLeft: 10, color: "#1e293b", whiteSpace: "nowrap" } });
    items.push({ id: "edu-degree", text: `${education.degree}${education.college ? `, ${education.college}` : ''}`, style: { ...baseFont, fontWeight: 700, fontSize: 13, color: "#1e293b", whiteSpace: "normal" } });
    if (education.year || education.gpa) items.push({ id: "edu-meta", text: `${education.year}${education.gpa ? ` • GPA: ${education.gpa}` : ''}`, style: { ...baseFont, fontSize: 11, color: accentColor, whiteSpace: "normal" } });
  }

  // Skills
  const hasSkills = skills.some(s => s.name);
  if (hasSkills) {
    items.push({ id: "heading-skills", text: "Skills", style: { ...baseFont, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderLeft: `3px solid ${accentColor}`, paddingLeft: 10, color: "#1e293b", whiteSpace: "nowrap" } });
    skills.filter(s => s.name).forEach(skill => {
      items.push({ id: `skill-${skill.id}`, text: `${skill.name}${skill.level ? ` · ${skill.level}` : ''}`, style: { ...baseFont, fontSize: 11, padding: "3px 10px", borderRadius: 4, border: `1px solid #e2e8f0`, color: "#475569", whiteSpace: "nowrap" } });
    });
  }

  // Projects
  const hasProjects = projects.some(p => p.name);
  if (hasProjects) {
    items.push({ id: "heading-projects", text: "Projects", style: { ...baseFont, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderLeft: `3px solid ${accentColor}`, paddingLeft: 10, color: "#1e293b", whiteSpace: "nowrap" } });
    projects.forEach(proj => {
      if (proj.name) items.push({ id: `proj-name-${proj.id}`, text: `${proj.name}${proj.stack ? ` (${proj.stack})` : ''}`, style: { ...baseFont, fontWeight: 700, fontSize: 13, color: "#1e293b", whiteSpace: "normal" } });
      if (proj.description) items.push({ id: `proj-desc-${proj.id}`, text: proj.description, style: { ...baseFont, fontSize: 11, lineHeight: 1.5, color: "#475569", whiteSpace: "normal" } });
      if (proj.link) items.push({ id: `proj-link-${proj.id}`, text: `🔗 ${proj.link}`, style: { ...baseFont, fontSize: 10, color: accentColor, whiteSpace: "nowrap" } });
    });
  }

  // Certifications (main)
  const hasCerts = certifications.some(c => c.name);
  if (hasCerts) {
    items.push({ id: "heading-certifications", text: "Certifications", style: { ...baseFont, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderLeft: `3px solid ${accentColor}`, paddingLeft: 10, color: "#1e293b", whiteSpace: "nowrap" } });
    certifications.forEach(cert => {
      if (cert.name) items.push({ id: `cert-name-${cert.id}`, text: cert.name, style: { ...baseFont, fontWeight: 700, fontSize: 13, color: "#1e293b", whiteSpace: "normal" } });
      if (cert.issuer) items.push({ id: `cert-issuer-${cert.id}`, text: cert.issuer, style: { ...baseFont, fontSize: 11, color: "#475569", whiteSpace: "normal" } });
      if (cert.date) items.push({ id: `cert-date-${cert.id}`, text: cert.date, style: { ...baseFont, fontSize: 10, color: accentColor, whiteSpace: "normal" } });
      if (cert.description) items.push({ id: `cert-desc-${cert.id}`, text: cert.description, style: { ...baseFont, fontSize: 11, lineHeight: 1.5, color: "#475569", whiteSpace: "normal" } });
    });
  }

  // Languages (main)
  const hasLanguages = languages.some(l => l.language);
  if (hasLanguages) {
    items.push({ id: "heading-languages", text: "Languages", style: { ...baseFont, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderLeft: `3px solid ${accentColor}`, paddingLeft: 10, color: "#1e293b", whiteSpace: "nowrap" } });
    languages.filter(l => l.language).forEach(lang => {
      items.push({ id: `lang-${lang.id}`, text: `${lang.language} · ${lang.proficiency}`, style: { ...baseFont, fontSize: 11, color: "#475569", whiteSpace: "normal" } });
    });
  }

  // Optional Sections
  optionalSections.forEach(section => {
    const sectionId = `opt-${section.id}`;
    items.push({
      id: `${sectionId}-heading`,
      text: section.title,
      style: { ...baseFont, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderLeft: `3px solid ${accentColor}`, paddingLeft: 10, color: "#1e293b", whiteSpace: "nowrap" }
    });
    items.push({
      id: `${sectionId}-content`,
      text: section.content,
      style: { ...baseFont, fontSize: 12, lineHeight: 1.5, color: "#475569", whiteSpace: "pre-wrap" }
    });
  });

  return items;
}

// ─── Layout repositioning engine (enhanced for all layouts) ─────────────────
// ─── DYNAMIC LAYOUT ENGINE (FIXED & DISTINCT) ────────────────────────────────
// ─── DYNAMIC LAYOUT ENGINE (FIXED & HIGHLY DISTINCT) ─────────────────────────
function repositionItemsForLayout(items, layoutId, state, canvasWidth = 600) {
  const margin = 40;
  const sidebarWidth = 200;
  const mainWidth = canvasWidth - sidebarWidth - (margin * 2.5);
  const fullWidth = canvasWidth - (margin * 2);

  let positions = {};
  
  // 1. PHOTO AWARENESS: Photo irundhaal space allocate pannuvom
  const hasPhoto = !!state.personal.photo;
  const photoHeight = hasPhoto ? 130 : 0; // Space for the photo

  let leftY = margin, rightY = margin, centerY = margin;

  // 2. LAYOUT-SPECIFIC PHOTO OFFSET: Photo mela text overlap aagaama irukka logic
  if (hasPhoto) {
    if (layoutId === "modern-sidebar" || layoutId === "sidebar-left") {
      leftY += photoHeight; // Left sidebar-la gap
    } else if (layoutId === "creative") {
      rightY += photoHeight; // Creative-la right column-la gap (Personal info side)
      // Creative-la photo perusa irundha summary-um overlap aagalaam, so leftY-um konjam thalluvom
      leftY += 20; 
    } else if (layoutId === "two-col") {
      centerY += photoHeight; // Center gap
    } else {
      centerY += photoHeight; // Default top gap
    }
  }

  const getH = (text, width, fontSize) => {
    const charsPerLine = (width / fontSize) * 1.8;
    const lines = Math.ceil((text || "").length / charsPerLine) || 1;
    return lines * (fontSize * 1.6); 
  };

  const isHeading = (id) => id.includes("heading");
  const isPersonal = (id) => id.startsWith("personal-");

  switch (layoutId) {
    case "creative":
      // STYLE: Asymmetric Bold - Personal on Right, Body on Left
      items.forEach(item => {
        if (isPersonal(item.id)) {
          // RIGHT SIDE: Personal details shift downwards if photo exists
          positions[item.id] = { x: margin + 320, y: rightY, width: 240, fontSize: 11, textAlign: "right" };
          rightY += getH(item.text, 240, 11) + 12;
        } else {
          // LEFT SIDE: Experience, Education, etc.
          positions[item.id] = { x: margin, y: leftY, width: 300, fontSize: 11, textAlign: "left" };
          leftY += getH(item.text, 300, 11) + 20;
        }
      });
      break;

    case "modern-sidebar":
    case "sidebar-left":
      items.forEach(item => {
        const isSidebar = isPersonal(item.id) || item.id.includes("skill") || item.id.includes("edu") || item.id.includes("lang");
        if (isSidebar) {
          positions[item.id] = { x: margin, y: leftY, width: sidebarWidth, fontSize: 10, textAlign: "left" };
          leftY += getH(item.text, sidebarWidth, 10) + (isHeading(item.id) ? 14 : 8);
        } else {
          positions[item.id] = { x: margin + sidebarWidth + 35, y: rightY, width: mainWidth, fontSize: 11, textAlign: "left" };
          rightY += getH(item.text, mainWidth, 11) + (isHeading(item.id) ? 18 : 12);
        }
      });
      break;

    case "two-col":
      items.forEach(item => {
        if (isPersonal(item.id)) {
          positions[item.id] = { x: margin, y: centerY, width: fullWidth, fontSize: 12, textAlign: "center" };
          centerY += getH(item.text, fullWidth, 12) + 8;
        } else {
          const colW = (fullWidth / 2) - 15;
          let side = leftY <= rightY ? "left" : "right";
          let xPos = side === "left" ? margin : margin + colW + 30;
          positions[item.id] = { x: xPos, y: (side === "left" ? leftY : rightY) + centerY + 20, width: colW, fontSize: 11, textAlign: "left" };
          if (side === "left") leftY += getH(item.text, colW, 11) + 15;
          else rightY += getH(item.text, colW, 11) + 15;
        }
      });
      break;

    case "technical":
      items.sort((a, b) => (a.id.includes("skill") ? -1 : 1)).forEach(item => {
        let align = item.id.includes("skill") ? "center" : "left";
        positions[item.id] = { x: margin, y: centerY, width: fullWidth, fontSize: 11, textAlign: align };
        centerY += getH(item.text, fullWidth, 11) + (isHeading(item.id) ? 15 : 10);
      });
      break;

    case "academic":
      items.forEach(item => {
        let xPos = isHeading(item.id) ? margin : margin + 45;
        positions[item.id] = { x: xPos, y: centerY, width: fullWidth - 50, fontSize: 11, textAlign: "left" };
        centerY += getH(item.text, fullWidth - 50, 11) + (isHeading(item.id) ? 22 : 8);
      });
      break;

    default: // Classic / Executive
      items.forEach(item => {
        positions[item.id] = { x: margin, y: centerY, width: fullWidth, fontSize: 11, textAlign: "left" };
        centerY += getH(item.text, fullWidth, 11) + (isHeading(item.id) ? 15 : 10);
      });
      break;
  }
  return positions;
}
// ─── AI Modal Component ─────────────────────────────────────────────────────
const AIModal = ({ isOpen, onClose, onGenerate, activeSection }) => {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      let generatedText = "";
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes("summary")) {
        generatedText = AI.summary;
      } else if (lowerPrompt.includes("experience") || lowerPrompt.includes("work")) {
        generatedText = AI.experience;
      } else if (lowerPrompt.includes("project")) {
        generatedText = AI.project;
      } else if (lowerPrompt.includes("certification")) {
        generatedText = AI.certification;
      } else {
        generatedText = `AI-generated content based on: "${prompt}"\n\n(This is a demo. In a real app you would connect to an AI API.)`;
      }
      onGenerate(generatedText, activeSection);
      setGenerating(false);
      onClose();
    }, 500);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          width: "500px",
          padding: "24px",
          boxShadow: "0 20px 35px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 12px 0", fontSize: "20px" }}>✨ Ask AI</h3>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
          Describe what you want to add or improve for the <strong>{activeSection}</strong> section.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Write a summary for a senior software developer with 5 years of experience in React..."
          style={{
            width: "100%",
            height: "120px",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            fontSize: "14px",
            fontFamily: "inherit",
            resize: "vertical",
            marginBottom: "16px",
          }}
        />
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "#f1f5f9",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            style={{
              padding: "8px 20px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: generating ? "default" : "pointer",
              opacity: generating ? 0.6 : 1,
            }}
          >
            {generating ? "Generating..." : "Generate & Insert"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Helper to deep clone state for history ─────────────────────────────────
const cloneState = (structured, freeform, itemProps, photoPosition) => ({
  structured: JSON.parse(JSON.stringify(structured)),
  freeform: JSON.parse(JSON.stringify(freeform)),
  itemProps: JSON.parse(JSON.stringify(itemProps)),
  photoPosition: { ...photoPosition },
});

// ─── MAIN COMPONENT with Undo/Redo ──────────────────────────────────────────
export default function BlankCanvasBuilderPro() {
  const [st, setSt] = useState(INIT);
  const [freeformElements, setFreeformElements] = useState([]);
  const [itemProps, setItemProps] = useState(() => {
    const initialItems = getAllDraggableItems(INIT, INIT.styling);
    return computeDefaultProps(initialItems);
  });
  const [photoPosition, setPhotoPosition] = useState({ x: 300, y: 40 });
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedDraggableId, setSelectedDraggableId] = useState(null);
  const [selectedFreeformId, setSelectedFreeformId] = useState(null);
  const nodeRefs = useRef({});
  const canvasContainerRef = useRef(null);
  const photoRef = useRef(null);

  // History state
  const [history, setHistory] = useState(() => {
    const initialSnapshot = cloneState(INIT, [], {}, { x: 300, y: 40 });
    return [initialSnapshot];
  });
  const [historyIndex, setHistoryIndex] = useState(0);
  const MAX_HISTORY = 50;
  const isRestoringRef = useRef(false);

  const pushSnapshot = useCallback(() => {
    if (isRestoringRef.current) return;
    const newSnapshot = cloneState(st, freeformElements, itemProps, photoPosition);
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newSnapshot);
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [st, freeformElements, itemProps, photoPosition, historyIndex]);

  const restoreSnapshot = useCallback((snapshot) => {
    isRestoringRef.current = true;
    setSt(snapshot.structured);
    setFreeformElements(snapshot.freeform);
    setItemProps(snapshot.itemProps);
    setPhotoPosition(snapshot.photoPosition);
    setSelectedDraggableId(null);
    setSelectedFreeformId(null);
    setTimeout(() => { isRestoringRef.current = false; }, 0);
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      restoreSnapshot(history[newIndex]);
    }
  }, [historyIndex, history, restoreSnapshot]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      restoreSnapshot(history[newIndex]);
    }
  }, [historyIndex, history, restoreSnapshot]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Wrapped state setters
  const setFld = (k, v) => {
    setSt(prev => ({ ...prev, [k]: v }));
    pushSnapshot();
  };
  const updateItemProp = (id, updates) => {
    setItemProps(prev => ({
      ...prev,
      [id]: { 
        ...prev[id], 
        ...updates
      }
    }));
    pushSnapshot();
  };
  const setPhotoPositionAndSnapshot = (newPos) => {
    setPhotoPosition(newPos);
    pushSnapshot();
  };
  const addTable = () => {
    const newTable = makeTable();
    setFreeformElements(prev => [...prev, newTable]);
    setSelectedFreeformId(newTable.id);
    pushSnapshot();
  };
  const addLine = () => {
    const lineProps = LINES.find(l => l.id === "hline").defaultProps;
    const newId = Date.now();
    const newLine = { id: newId, type: "line", x: 50, y: 50, ...lineProps };
    setFreeformElements(prev => [...prev, newLine]);
    setSelectedFreeformId(newId);
    pushSnapshot();
  };
  const updateFreeform = (id, newData) => {
    setFreeformElements(prev => prev.map(el => el.id === id ? { ...el, ...newData } : el));
    pushSnapshot();
  };
  const addOptionalSection = (section) => {
    setSt(prev => ({ ...prev, optionalSections: [...prev.optionalSections, section] }));
    pushSnapshot();
  };
  const removeOptionalSection = (id) => {
    setSt(prev => ({ ...prev, optionalSections: prev.optionalSections.filter(s => s.id !== id) }));
    pushSnapshot();
  };
  const updateOptionalSection = (id, newData) => {
    setSt(prev => ({ ...prev, optionalSections: prev.optionalSections.map(s => s.id === id ? newData : s) }));
    pushSnapshot();
  };
  const setItemPropsAndPush = (newProps) => {
    setItemProps(newProps);
    pushSnapshot();
  };

  const sec = id => setSt(prev => ({ ...prev, activeSection: id }));
  const handleAIGenerate = (generatedText, sectionId) => {
    if (sectionId === "summary") {
      setFld("summary", { ...st.summary, text: generatedText });
    } else if (sectionId === "experience") {
      if (st.experience.length > 0) {
        const updated = [...st.experience];
        updated[0] = { ...updated[0], description: generatedText };
        setFld("experience", updated);
      }
    } else if (sectionId === "projects") {
      if (st.projects.length > 0) {
        const updated = [...st.projects];
        updated[0] = { ...updated[0], description: generatedText };
        setFld("projects", updated);
      }
    } else if (sectionId === "certifications") {
      if (st.certifications.length > 0) {
        const updated = [...st.certifications];
        updated[0] = { ...updated[0], description: generatedText };
        setFld("certifications", updated);
      }
    }
  };

  const renderForm = () => {
    switch(st.activeSection){
   case "layout":
  return (
    <div>
      <div className="rb-style-lbl">Choose a Base Layout</div>
      <div className="rb-layout-grid">
        {LAYOUTS.map(l => (
          <div key={l.id} className={`rb-layout-card${st.styling.layout === l.id ? " on" : ""}`}
            onClick={() => {
              // 1. Update the layout style state
              const newStyling = { ...st.styling, layout: l.id };
              setFld("styling", newStyling);
              
              // 2. Refresh the items list to get absolute latest data
              const freshItems = getAllDraggableItems(st, newStyling);
              
              // 3. Force calculation using the NEW layout ID
              const newPositions = repositionItemsForLayout(freshItems, l.id, st, 600);
              
              // 4. Update the actual positions on the canvas
              setItemPropsAndPush(newPositions);
            }}>
            <span className="rb-layout-icon">{l.icon}</span>
            <span className="rb-layout-name">{l.label}</span>
            <span className="rb-layout-desc">{l.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
      case "personal":       return <PersonalSection data={st.personal} onChange={v=>setFld("personal",v)} styling={st.styling} onStylingChange={v=>setFld("styling",v)}/>;
      case "summary":        return <SummarySection data={st.summary} onChange={v=>setFld("summary",v)}/>;
      case "experience":     return <ExperienceSection data={st.experience} onChange={v=>setFld("experience",v)}/>;
      case "education":      return <EducationSection data={st.education} onChange={v=>setFld("education",v)}/>;
      case "skills":         return <SkillsSection data={st.skills} onChange={v=>setFld("skills",v)}/>;
      case "projects":       return <ProjectsSection data={st.projects} onChange={v=>setFld("projects",v)}/>;
      case "certifications": return <CertificationsSection data={st.certifications} onChange={v=>setFld("certifications",v)}/>;
      case "languages":      return <LanguagesSection data={st.languages} onChange={v=>setFld("languages",v)}/>;
      case "styling":        return <StylingSection data={st.styling} onChange={v=>setFld("styling",v)} onAddTable={addTable} onAddLine={addLine} />;
      case "additional":     return <AdditionalSectionsPanel optionalSections={st.optionalSections} onAdd={addOptionalSection} onRemove={removeOptionalSection} onUpdate={updateOptionalSection} />;
      default: return null;
    }
  };

  const handleSelectDraggable = (id) => {
    setSelectedDraggableId(id);
    setSelectedFreeformId(null);
  };
  const handleSelectFreeform = (id) => {
    setSelectedFreeformId(id);
    setSelectedDraggableId(null);
  };
  const onFreeformResize = (id, newWidth, newHeight, newX, newY) => {
    updateFreeform(id, { width: newWidth, height: newHeight, x: newX, y: newY });
  };

  const draggableItems = getAllDraggableItems(st, st.styling);
  const idx = ALL_SECTIONS.findIndex(n => n.id === st.activeSection);
  const meta = SECTION_META[st.activeSection];

  // Layout change effect – now fully replaces itemProps for all draggable items
  

  // Dynamic canvas height effect – no snapshot needed
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    let maxY = 20;
    Object.values(itemProps).forEach(prop => {
      if (prop.y > maxY) maxY = prop.y;
    });
    freeformElements.forEach(el => {
      if (el.y > maxY) maxY = el.y;
    });
    if (photoPosition.y > maxY) maxY = photoPosition.y;
    const neededHeight = maxY + 300;
    canvasContainerRef.current.style.minHeight = `${Math.max(800, neededHeight)}px`;
  }, [itemProps, freeformElements, photoPosition]);

  // Auto-add missing props for draggable items
  useEffect(() => {
    const newProps = { ...itemProps };
    const currentIds = new Set(draggableItems.map(i => i.id));
    
    // Clean up old IDs
    Object.keys(newProps).forEach(id => {
      if (!currentIds.has(id)) delete newProps[id];
    });

    const missing = draggableItems.filter(item => !newProps[item.id]);
    if (missing.length) {
      let maxYUsed = 20;
      Object.values(newProps).forEach(prop => {
        if (prop.y > maxYUsed) maxYUsed = prop.y;
      });

      missing.forEach((item, index) => {
        const defaultFontSize = item.style.fontSize ? parseInt(item.style.fontSize) : 14;
        newProps[item.id] = {
          x: 40,
          y: maxYUsed + (20 * (index + 1)), // small gap to prevent overlapping
          width: 'auto',
          height: 'auto',
          fontSize: defaultFontSize,
          textAlign: 'left',
        };
      });
      setItemPropsAndPush(newProps);
    }
  }, [draggableItems]);

  // Sync photo position with styling – push snapshot only if position changed
  useEffect(() => {
    if (!st.personal.photo) return;
    const photoSize = PHOTO_SIZES[st.styling.photoSize] || 72;
    const canvasWidth = 600;
    const margin = 20;
    let newX = photoPosition.x;
    switch (st.styling.photoPosition) {
      case "left": newX = margin; break;
      case "center": newX = (canvasWidth - photoSize) / 2; break;
      case "right": newX = canvasWidth - photoSize - margin; break;
      default: return;
    }
    if (Math.abs(newX - photoPosition.x) > 1) {
      setPhotoPositionAndSnapshot({ x: newX, y: photoPosition.y });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st.styling.photoPosition, st.styling.photoSize, st.personal.photo]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
      {/* LEFT: Section sidebar */}
      <div style={{ width: 68, background: "#1e293b", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", overflowY: "auto" }}>
        {ALL_SECTIONS.map(n => (
          <button key={n.id} className={`rb-nav${st.activeSection === n.id ? " on" : ""}`} onClick={() => sec(n.id)} style={{ marginBottom: 1 }}>
            <span className="rb-nav-icon">{n.icon}</span>
            <span className="rb-nav-lbl">{n.label}</span>
          </button>
        ))}
      </div>

      {/* MIDDLE: Form panel */}
      <div style={{ width: 500, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <div className="rb-form-head" style={{ padding: "18px 22px 12px", borderBottom: "1px solid #f3f4f6" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{meta.title}</h2>
          <p style={{ fontSize: 12, color: "#6b7280" }}>{meta.desc}</p>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>{renderForm()}</div>
        <div className="rb-form-foot" style={{ padding: "12px 22px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between" }}>
          <button className="rb-back" disabled={idx === 0} onClick={() => sec(ALL_SECTIONS[idx - 1].id)}>‹ Back</button>
          <button className="rb-next" disabled={idx === ALL_SECTIONS.length - 1} onClick={() => sec(ALL_SECTIONS[idx + 1].id)}>Next ›</button>
        </div>
      </div>

      {/* RIGHT: Canvas area */}
      <div 
        style={{ flex: 1, background: "#d1d5db", display: "flex", flexDirection: "column", alignItems: "center", overflow: "auto", padding: "40px" }}
        onClick={() => {
          setSelectedDraggableId(null);
          setSelectedFreeformId(null);
        }}
      >
        <div style={{ position: "relative", width: "600px", marginBottom: "10px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button onClick={(e) => { e.stopPropagation(); undo(); }} style={{ background: "#fff", border: "1px solid #ccc", borderRadius: "6px", padding: "6px 12px", cursor: "pointer" }}>↩️ Undo</button>
          <button onClick={(e) => { e.stopPropagation(); redo(); }} style={{ background: "#fff", border: "1px solid #ccc", borderRadius: "6px", padding: "6px 12px", cursor: "pointer" }}>↪️ Redo</button>
        </div>

        <div
          ref={canvasContainerRef}
          onDragOver={e => e.preventDefault()}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedDraggableId(null);
              setSelectedFreeformId(null);
            }
          }}
          style={{
            position: "relative",
            width: "600px",
            minHeight: "800px",
            background: "white",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            borderRadius: "4px",
            paddingBottom: "150px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column"
          }}
        >
          {draggableItems.map(item => {
            const props = itemProps[item.id] || { x: 40, y: 20, width: 'auto', height: 'auto', fontSize: 14, textAlign: 'left' };
            const customMinWidth = item.id === "personal-name" ? 30 : 50;
            return (
              <DraggableTextBlock
                key={item.id}
                id={item.id}
                text={item.text}
                baseStyle={item.style}
                defaultPos={{ x: props.x, y: props.y }}
                defaultSize={{ width: props.width, height: props.height }}
                defaultFontSize={props.fontSize}
                defaultTextAlign={props.textAlign}
                onDragStop={(e, data) => updateItemProp(item.id, { x: data.x, y: data.y })}
                onResize={(newSize) => updateItemProp(item.id, { width: newSize.width, height: newSize.height })}
                onFontSizeChange={(newSize) => updateItemProp(item.id, { fontSize: newSize })}
                onTextAlignChange={(newAlign) => updateItemProp(item.id, { textAlign: newAlign })}
                isSelected={selectedDraggableId === item.id}
                onSelect={handleSelectDraggable}
                minWidth={customMinWidth}
                minHeight={30}
              />
            );
          })}

          {st.personal.photo && (
            <Draggable
              nodeRef={photoRef}
              bounds="parent"
              position={photoPosition}
              onStop={(e, data) => setPhotoPositionAndSnapshot({ x: data.x, y: data.y })}
            >
              <div ref={photoRef} style={{ position: "absolute", cursor: "move", zIndex: 10 }}>
                <img
                  src={st.personal.photo}
                  alt="profile"
                  style={{
                    width: PHOTO_SIZES[st.styling.photoSize] || 72,
                    height: PHOTO_SIZES[st.styling.photoSize] || 72,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `2px solid ${st.styling.accentColor}`,
                  }}
                />
              </div>
            </Draggable>
          )}

          {freeformElements.map(el => {
            if (!nodeRefs.current[el.id]) nodeRefs.current[el.id] = { current: null };
            const isDesign = ["shape", "line", "sticker", "table"].includes(el.type);
            const isSelected = selectedFreeformId === el.id;

            return (
              <Draggable
                key={el.id}
                nodeRef={nodeRefs.current[el.id]}
                bounds="parent"
                position={{ x: el.x, y: el.y }}
                onStop={(e, data) => updateFreeform(el.id, { x: data.x, y: data.y })}
              >
                <div
                  ref={nodeRefs.current[el.id]}
                  className="freeform-element"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectFreeform(el.id);
                  }}
                  style={{
                    position: "absolute",
                    cursor: "move",
                    background: isDesign ? "transparent" : "white",
                    borderRadius: el.type === "table" ? "0px" : "20px",
                    outline: isSelected ? "2px solid #3b82f6" : "none",
                    outlineOffset: "2px",
                    padding: el.type === "table" ? 0 : (isDesign ? 0 : "12px 16px"),
                    zIndex: isSelected ? 50 : 5,
                  }}
                >
                  <ResizableWithHandles
                    width={el.width}
                    height={el.height}
                    onResize={(w, h, x, y) => onFreeformResize(el.id, w, h, x, y)}
                    minWidth={isDesign ? 20 : 150}
                    minHeight={isDesign ? 20 : 100}
                    maxWidth={600}
                  >
                    <FreeformElement 
                      element={el} 
                      isSelected={isSelected} 
                      onUpdate={(newData) => updateFreeform(el.id, newData)} 
                    />
                  </ResizableWithHandles>
                </div>
              </Draggable>
            );
          })}
        </div>
      </div>

      <AIModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGenerate={handleAIGenerate}
        activeSection={st.activeSection}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;600;700&family=Raleway:wght@300;400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700&family=Source+Sans+Pro:wght@300;400;600;700&family=Nunito:wght@300;400;600;700&family=Ubuntu:wght@300;400;500;700&family=Cabin:wght@400;500;600;700&family=Work+Sans:wght@300;400;500;600;700&family=Josefin+Sans:wght@300;400;500;600;700&family=Quicksand:wght@300;400;500;600;700&family=Rubik:wght@300;400;500;600;700&display=swap');
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
        [contentEditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
        .draggable-text-block, .freeform-element { }
      `}</style>
    </div>
  );
}

function computeDefaultProps(items) {
  const props = {};
  let currentY = 20;
  items.forEach((item) => {
    props[item.id] = {
      x: 40,
      y: currentY,
      width: 'auto',
      height: 'auto',
      fontSize: item.style.fontSize ? parseInt(item.style.fontSize) : 14,
      textAlign: 'left',
    };
    if (item.id.startsWith('personal-')) {
      currentY += 8;
    } else {
      currentY += 55;
    }
  });
  return props;
}