import React from "react";
import "./skilldashboard.css";

/* ─────────────────────────────────────
   Radar Chart Component
───────────────────────────────────── */
function RadarChart() {
  const cx = 90, cy = 90, r = 62;

  const toXY = (angle, radius) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const angles6 = [270, 342, 54, 126, 198, 270];
  const vals    = [84, 78, 85, 68, 61, 66];
  const indAvg  = [75, 70, 78, 72, 70, 72];

  const polygon = (values) =>
    values.map((v, i) => {
      const pt = toXY(angles6[i], (v / 100) * r);
      return `${pt.x},${pt.y}`;
    }).join(" ");

  const gridLevels = [25, 50, 75, 100];

  const labels = [
    { label: "Python", pct: "84%", angle: 270, ox: 0, oy: -14 },
    { label: "SQL", pct: "78%", angle: 342, ox: 14, oy: -4 },
    { label: "Data Analysis", pct: "85%", angle: 54, ox: 16, oy: 5 },
    { label: "Machine Learning", pct: "68%", angle: 126, ox: 0, oy: 16 },
    { label: "Data Visualization", pct: "61%", angle: 198, ox: -20, oy: 5 },
    { label: "Communication", pct: "66%", angle: 270, ox: -20, oy: -4 },
  ];

  return (
    <div className="sd-radar-container">
      <svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.40" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.14" />
          </linearGradient>
        </defs>

        {gridLevels.map((lvl) => (
          <polygon key={lvl}
            points={angles6.map((a) => { const pt = toXY(a, (lvl/100)*r); return `${pt.x},${pt.y}`; }).join(" ")}
            fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
        ))}

        {angles6.map((a, i) => {
          const pt = toXY(a, r);
          return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="#e2e8f0" strokeWidth="0.8" />;
        })}

        <polygon points={polygon(indAvg)} fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3,2" />
        <polygon points={polygon(vals)} fill="url(#radarFill)" stroke="#6366f1" strokeWidth="1.8" />

        {labels.map((item, i) => {
          const pt = toXY(item.angle, r + 18);
          return (
            <g key={i}>
              <text x={pt.x + item.ox} y={pt.y + item.oy}
                textAnchor="middle" fontSize="7" fill="#374151"
                fontWeight="600" fontFamily="'Segoe UI', sans-serif">{item.label}</text>
              <text x={pt.x + item.ox} y={pt.y + item.oy + 9}
                textAnchor="middle" fontSize="7" fill="#6366f1"
                fontWeight="700" fontFamily="'Segoe UI', sans-serif">{item.pct}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────
   Circular Progress Ring Component
───────────────────────────────────── */
function Ring({ size, sw, value, color, gradient, id, children }) {
  const radius = (size - sw) / 2;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="sd-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)", display: "block" }}>
        {gradient && (
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
              {gradient.map((s, i) => <stop key={i} offset={s.o} stopColor={s.c} />)}
            </linearGradient>
          </defs>
        )}
        <circle cx={size/2} cy={size/2} r={radius}
          fill="none" stroke="#eef2ff" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={radius}
          fill="none"
          stroke={gradient ? `url(#${id})` : color}
          strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="sd-ring-center">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────
   AI Career Suggestions Component
   — Skill → Roles mapping view —
───────────────────────────────────── */

// TODO: Replace with your AI API response when ready
const SKILL_ROLE_MAP = [
  {
    skill: "Python",
    emoji: "🐍",
    type: "matched",
    roles: ["Data Analyst", "Data Scientist", "ML Engineer", "Data Engineer"],
  },
  {
    skill: "SQL",
    emoji: "🗄️",
    type: "matched",
    roles: ["Data Analyst", "Analytics Engineer", "BI Developer", "Data Engineer"],
  },
  {
    skill: "Data Analysis",
    emoji: "📊",
    type: "matched",
    roles: ["Data Analyst", "Research Analyst", "Product Analyst"],
  },
  {
    skill: "Pandas",
    emoji: "🐼",
    type: "matched",
    roles: ["Data Scientist", "Data Analyst", "ML Engineer"],
  },
  {
    skill: "Excel",
    emoji: "📗",
    type: "matched",
    roles: ["Business Analyst", "Data Analyst", "Financial Analyst"],
  },
  {
    skill: "Tableau",
    emoji: "📉",
    type: "matched",
    roles: ["BI Analyst", "Data Analyst", "BI Developer"],
  },
  {
    skill: "Apache Spark",
    emoji: "⚡",
    type: "missing",
    roles: ["Data Engineer", "Big Data Engineer", "ML Engineer"],
  },
  {
    skill: "Airflow",
    emoji: "🌬️",
    type: "missing",
    roles: ["Data Engineer", "Analytics Engineer", "MLOps Engineer"],
  },
  {
    skill: "dbt",
    emoji: "🔧",
    type: "missing",
    roles: ["Analytics Engineer", "Data Engineer", "BI Developer"],
  },
  {
    skill: "AWS S3",
    emoji: "☁️",
    type: "missing",
    roles: ["Cloud Data Engineer", "Data Engineer", "MLOps Engineer"],
  },
];

const ROLE_COLORS = [
  { bg: "#eef2ff", color: "#4f46e5", border: "#c7d2fe" },
  { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  { bg: "#fdf4ff", color: "#9333ea", border: "#e9d5ff" },
];

function AICareerSuggestions() {
  const [activeSkill, setActiveSkill] = React.useState(null);

  const displayed = activeSkill
    ? SKILL_ROLE_MAP.filter(s => s.skill === activeSkill)
    : SKILL_ROLE_MAP;

  return (
    <div className="sd-card sd-acs-card">

      {/* Header */}
      <div className="sd-acs-header">
        <div>
          <div className="sd-acs-title">
            <span className="sd-acs-sparkle">✨</span> AI Career Suggestions
          </div>
          <div className="sd-acs-sub">
            Click a skill to see which roles you can apply for
          </div>
        </div>
        {activeSkill && (
          <button className="sd-acs-refresh" onClick={() => setActiveSkill(null)}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Skill filter pills */}
      <div className="sd-acs-skills-row">
        {SKILL_ROLE_MAP.map((s, i) => (
          <span
            key={i}
            onClick={() => setActiveSkill(activeSkill === s.skill ? null : s.skill)}
            className={[
              "sd-acs-skill-pill",
              s.type === "matched" ? "sd-acs-pill--matched" : "sd-acs-pill--missing",
              activeSkill === s.skill ? "sd-acs-pill--active" : "",
            ].join(" ")}
          >
            {s.emoji} {s.skill}
          </span>
        ))}
      </div>

      {/* Skill → Roles list */}
      <div className="sd-acs-map-list">
        {displayed.map((item, i) => (
          <div className="sd-acs-map-row" key={i}>

            {/* Skill name left */}
            <div className={`sd-acs-map-skill ${item.type === "missing" ? "sd-acs-map-skill--miss" : ""}`}>
              <span className="sd-acs-map-emoji">{item.emoji}</span>
              <div>
                <div className="sd-acs-map-skillname">{item.skill}</div>
                <div className="sd-acs-map-skilltype">
                  {item.type === "matched" ? "✅ Matched" : "⚠️ Missing"}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="sd-acs-arrow">→</div>

            {/* Role tags right */}
            <div className="sd-acs-map-roles">
              {item.roles.map((role, j) => {
                const c = ROLE_COLORS[j % ROLE_COLORS.length];
                return (
                  <span
                    key={j}
                    className="sd-acs-map-role-tag"
                    style={{ background: c.bg, color: c.color, borderColor: c.border }}
                  >
                    {role}
                  </span>
                );
              })}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

/* ─────────────────────────────────────
   Main Dashboard Component
───────────────────────────────────── */
export default function Dashboard() {
  return (
    <div className="sd-dashboard">

      {/* ══ ROW 1: ATS Score · Metrics · AI Summary ══ */}
      <div className="sd-row sd-r1">

        <div className="sd-card sd-ats-card sd-ats-v2">
          {/* Decorative blobs */}
          <div className="sd-ats-blob sd-ats-blob1" />
          <div className="sd-ats-blob sd-ats-blob2" />

          {/* Label */}
          <div className="sd-ats-v2-label">ATS Score</div>

          {/* Big ring */}
          <div className="sd-ats-v2-ring">
            <Ring size={118} sw={10} value={75} id="atsG2"
              gradient={[{ o:"0%", c:"#6366f1" }, { o:"60%", c:"#818cf8" }, { o:"100%", c:"#22c55e" }]}>
              <div className="sd-ats-v2-inner">
                <div className="sd-ats-v2-pct">75%</div>
                <div className="sd-ats-v2-sub">Match</div>
              </div>
            </Ring>
          </div>

          {/* Status pill */}
          <div className="sd-ats-v2-pill">
            <span className="sd-ats-v2-dot" />
            Good Match
          </div>
        </div>

        <div className="sd-card sd-metrics-card">
          {[
            { icon:"⌨️", name:"Keyword Density",  val:"70%", s:"Good",      sc:"sd-green",  ch:"12% vs last scan" },
            { icon:"📝", name:"Formatting",        val:"90%", s:"Excellent", sc:"sd-blue",   ch:"6% vs last scan"  },
            { icon:"💼", name:"Experience Match",  val:"65%", s:"Average",   sc:"sd-orange", ch:"5% vs last scan"  },
            { icon:"🤝", name:"Soft Skills",       val:"78%", s:"Good",      sc:"sd-green",  ch:"2% vs last scan"  },
          ].map((m,i) => (
            <div className={`sd-met ${i<3 ? "sd-sep" : ""}`} key={i}>
              <span className="sd-met-icon">{m.icon}</span>
              <span className="sd-met-name">{m.name}</span>
              <span className="sd-met-val">{m.val}</span>
              <span className={`sd-met-s ${m.sc}`}>{m.s}</span>
              <span className="sd-met-ch"><span className="sd-gt">▲</span> {m.ch}</span>
            </div>
          ))}
        </div>

        <div className="sd-card sd-ai-card sd-rl-card">
          <div className="sd-rl-header">
            <span className="sd-rl-ico">🗺️</span>
            <span className="sd-rl-title">Learning Roadmap</span>
          </div>
          <div className="sd-rl-list">
            {[
              { skill: "Python",             emoji: "🐍",
                udemy:   "https://www.udemy.com/course/complete-python-bootcamp/",
                youtube: "https://www.youtube.com/results?search_query=python+tutorial",
                google:  "https://www.google.com/search?q=learn+python+free" },
              { skill: "Machine Learning",   emoji: "🤖",
                udemy:   "https://www.udemy.com/course/machinelearning/",
                youtube: "https://www.youtube.com/results?search_query=machine+learning+course",
                google:  "https://www.google.com/search?q=learn+machine+learning" },
              { skill: "Data Visualization", emoji: "📊",
                udemy:   "https://www.udemy.com/course/data-visualization-with-python/",
                youtube: "https://www.youtube.com/results?search_query=data+visualization+tutorial",
                google:  "https://www.google.com/search?q=data+visualization+courses" },
            ].map((item, i) => (
              <div className="sd-rl-row" key={i}>
                <div className="sd-rl-skill">
                  <span className="sd-rl-emoji">{item.emoji}</span>
                  <span className="sd-rl-name">{item.skill}</span>
                </div>
                <div className="sd-rl-btns">
                  <a href={item.udemy}   target="_blank" rel="noopener noreferrer" className="sd-rl-btn sd-rl-btn--u">🎓 Udemy</a>
                  <a href={item.youtube} target="_blank" rel="noopener noreferrer" className="sd-rl-btn sd-rl-btn--y">▶ YouTube</a>
                  <a href={item.google}  target="_blank" rel="noopener noreferrer" className="sd-rl-btn sd-rl-btn--g">🔍 Google</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ROW 2: Radar · Tips · Job Match ══ */}
      <div className="sd-row sd-r2">

        <div className="sd-card sd-radar-card">
          <div className="sd-ctitle">Skill Strength Radar</div>
          <RadarChart />
          <div className="sd-radar-leg">
            <div className="sd-leg-item"><div className="sd-leg-line sd-solid"></div><span>Your Score</span></div>
            <div className="sd-leg-item"><div className="sd-leg-line sd-dash"></div><span>Industry Avg</span></div>
          </div>
          
        </div>

        <div className="sd-card sd-tips-card">
          <div className="sd-ctitle">Quick Improvement Tips</div>
          <div className="sd-csub">Based on your skills and experience</div>
          {[
            { icon:"✅", ic:"g", text:"Add more quantifiable achievements", imp:"+12% impact" },
            { icon:"💬", ic:"b", text:"Include more action verbs",           imp:"+8% impact"  },
            { icon:"🏆", ic:"p", text:"Highlight relevant certifications",   imp:"+10% impact" },
            { icon:"🔑", ic:"o", text:"Improve keyword matching",            imp:"+14% impact" },
          ].map((t,i) => (
            <div className="sd-tip-row" key={i}>
              <div className="sd-tip-left">
                <div className={`sd-tip-ic ${t.ic}`}>{t.icon}</div>
                <span className="sd-tip-txt">{t.text}</span>
              </div>
              <span className="sd-tip-imp">{t.imp}</span>
            </div>
          ))}
       
        </div>

        <div className="sd-card sd-jm-card">
          <div className="sd-ctitle">Job Match Insights</div>
          <div className="sd-csub">Based on your skills and experience</div>
          <div className="sd-jm-body">
            <Ring size={100} sw={9} value={82} color="#6366f1">
              <div className="sd-jm-pct">82%</div>
              <div className="sd-jm-sub">Strong Match</div>
            </Ring>
            <div className="sd-jm-roles">
              <div className="sd-csub" style={{marginBottom:6}}>Top Matching Roles</div>
              {[
                { name:"Data Analyst",     p:82 },
                { name:"Business Analyst", p:78 },
                { name:"Data Scientist",   p:73 },
              ].map((r,i) => (
                <div className="sd-role-row" key={i}>
                  <div className="sd-role-hd">
                    <div className="sd-role-name"><span className="sd-dot"></span>{r.name}</div>
                    <div className="sd-role-pct">{r.p}%</div>
                  </div>
                  <div className="sd-bar-track">
                    <div className="sd-bar-fill sd-bf-ind" style={{width:`${r.p}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      {/* ══ ROW 3: Quality · Learning · Focus ══ */}
      <div className="sd-row sd-r3">

        <div className="sd-card sd-qual-card">
          <div className="sd-ctitle">Resume Quality Score</div>
          <div className="sd-csub">Based on your skills and experience</div>
          <div className="sd-qual-body">
            <Ring size={90} sw={8} value={92} color="#22c55e">
              <div className="sd-q-pct">92%</div>
              <div className="sd-q-sub">Strong Quality</div>
            </Ring>
            <div className="sd-q-bars">
              {[
                {lbl:"Clarity",  v:92},
                {lbl:"Impact",   v:90},
                {lbl:"Layout",   v:90},
                {lbl:"Relevance",v:92},
              ].map((b,i) => (
                <div className="sd-qbar" key={i}>
                  <span className="sd-qbar-lbl">{b.lbl}</span>
                  <div className="sd-bar-track"><div className="sd-bar-fill sd-bf-ind" style={{width:`${b.v}%`}}></div></div>
                  <span className="sd-qbar-val">{b.v}%</span>
                </div>
              ))}
            </div>
          </div>
         
        </div>

        <div className="sd-card sd-skillgap-card">

          {/* Header */}
          <div className="sd-sg-header">
            <div>
              <div className="sd-ctitle">Skill Gap Breakdown</div>
              <div className="sd-csub">Your resume vs job market requirements</div>
            </div>
            <div className="sd-sg-badge">
              <span className="sd-sg-badge-val">68%</span>
              <span className="sd-sg-badge-lbl">Gap Score</span>
            </div>
          </div>

          {/* Matched Skills */}
          <div className="sd-sg-section">
            <div className="sd-sg-sec-head">
              <div className="sd-sg-sec-left">
                <div className="sd-sg-sec-dot sd-sg-dot--green" />
                <span className="sd-sg-sec-title">Matched Skills</span>
              </div>
              <span className="sd-sg-pill sd-sg-pill--green">6 skills</span>
            </div>
            <div className="sd-sg-tags">
              {["Python","SQL","Data Analysis","Pandas","Excel","Tableau"].map((s,i) => (
                <span className="sd-sg-tag sd-sg-tag--green" key={i}>{s}</span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="sd-sg-section">
            <div className="sd-sg-sec-head">
              <div className="sd-sg-sec-left">
                <div className="sd-sg-sec-dot sd-sg-dot--red" />
                <span className="sd-sg-sec-title">Missing Skills</span>
              </div>
              <span className="sd-sg-pill sd-sg-pill--red">4 skills</span>
            </div>
            <div className="sd-sg-tags">
              {["Apache Spark","Airflow","dbt","AWS S3"].map((s,i) => (
                <span className="sd-sg-tag sd-sg-tag--red" key={i}>{s}</span>
              ))}
            </div>
          </div>

          {/* Priority Matrix */}
          <div className="sd-sg-section sd-pm-section">
            <div className="sd-sg-sec-head">
              <div className="sd-sg-sec-left">
                <div className="sd-sg-sec-dot sd-sg-dot--purple" />
                <span className="sd-sg-sec-title">Priority Matrix</span>
              </div>
              <span className="sd-sg-pill sd-sg-pill--purple">3 skills</span>
            </div>
            <div className="sd-pm-grid">
              {[
                { name: "Apache Spark",       label: "HIGH",   barW: 100, pc: "sd-pm-high", tc: "sd-pm-txt-high" },
                { name: "dbt",               label: "MEDIUM", barW: 70,  pc: "sd-pm-med",  tc: "sd-pm-txt-med"  },
                { name: "Airflow",  label: "LOW",    barW: 40,  pc: "sd-pm-low",  tc: "sd-pm-txt-low"  },
               
              ].map((item, i) => (
                <div className="sd-pm-row" key={i}>
                  <span className="sd-pm-name">{item.name}</span>
                  <div className={`sd-pm-bar-track ${item.pc}-track`}>
                    <div className={`sd-pm-bar-fill ${item.pc}-fill`} style={{ width: `${item.barW}%` }} />
                  </div>
                  <span className={`sd-pm-label ${item.tc}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="sd-card sd-focus-card">
          <div className="sd-ctitle">Focus Areas to Improve</div>
          <div className="sd-csub">Skills that will create the biggest impact.</div>
          {[
            {icon:"🧪", title:"Add Key Project Experience",  desc:"Include 2-3 more projects in your resume.",      badge:"High Impact",   bc:"sd-high"  },
            {icon:"⚡", title:"Use Stronger Action Verbs",   desc:"Use stronger, industry-relevant action verbs.",  badge:"Medium Impact", bc:"sd-med"   },
            {icon:"🏅", title:"Highlight Achievements",      desc:"Quantify your achievements more.",               badge:"Low Impact",    bc:"sd-low"   },
          ].map((f,i) => (
            <div className="sd-focus-row" key={i}>
              <div className="sd-foc-ico">{f.icon}</div>
              <div className="sd-foc-body">
                <div className="sd-foc-title">{f.title}</div>
                <div className="sd-foc-desc">{f.desc}</div>
              </div>
              <span className={`sd-foc-badge ${f.bc}`}>{f.badge}</span>
            </div>
          ))}
          
        </div>
      </div>

      {/* ══ ROW 4: Career Impact · AI Roadmap ══ */}
      <div className="sd-row sd-r4">

        <div className="sd-card sd-career-card">
          <div className="sd-ctitle">Career Impact Snapshot</div>
          <div className="sd-csub">See how your skills translate to real-world opportunities.</div>
          <div className="sd-career-grid">
            <div className="sd-c-metric">
              <div className="sd-c-ico sd-gbg">💼</div>
              <div className="sd-c-lbl">Job Opportunities</div>
              <div className="sd-c-val">1,240+</div>
              <div className="sd-c-sub">High match jobs</div>
            </div>
            <div className="sd-c-metric">
              <div className="sd-c-ico sd-bbg">💰</div>
              <div className="sd-c-lbl">Average Salary Range</div>
              <div className="sd-c-val">₹8 – ₹18 LPA</div>
              <div className="sd-c-sub">For your target roles</div>
            </div>
            <div className="sd-c-metric">
              <div className="sd-c-ico sd-pbg">👁️</div>
              <div className="sd-c-lbl">Profile Visibility</div>
              <div className="sd-c-val sd-c-good">Good</div>
              <div className="sd-c-sub">Improve to reach top 20%</div>
            </div>
          </div>
        </div>

        <AICareerSuggestions />
      </div>

    </div>
  );
}