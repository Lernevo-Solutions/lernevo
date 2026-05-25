import React from "react";
import "./skilldashboard.css";

/* ─────────────────────────────────────
   Radar Chart Component
───────────────────────────────────── */
function RadarChart() {
  // Larger canvas: cx pushed right to give left labels space
  const cx = 185, cy = 165, r = 100;

  const toXY = (angle, radius) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  // 6 evenly spaced angles: Python=top, clockwise every 60°
  const angles6 = [270, 330, 30, 90, 150, 210];
  const vals     = [84, 78, 85, 68, 61, 66];
  const indAvg   = [75, 70, 78, 72, 70, 72];

  // Per-skill colors
  const skillColors = [
    "#6366f1", // Python     — indigo
    "#f59e0b", // SQL        — amber
    "#10b981", // Data Analysis — emerald
    "#3b82f6", // Machine Learning — blue
    "#f43f5e", // Data Visualization — rose
    "#a855f7", // Communication — purple
  ];

  const polygon = (values) =>
    values.map((v, i) => {
      const pt = toXY(angles6[i], (v / 100) * r);
      return `${pt.x},${pt.y}`;
    }).join(" ");

  const gridLevels = [25, 50, 75, 100];

  // Labels: anchor + offsets tuned per position to avoid clipping
  const labels = [
    { label: "Python",             pct: "84%", angle: 270, ox:   0, oy: -20 }, // top
    { label: "SQL",                pct: "78%", angle: 330, ox:  30, oy: -10 }, // top-right
    { label: "Data Analysis",      pct: "85%", angle:  30, ox:  30, oy:  12 }, // bottom-right
    { label: "Machine Learning",   pct: "68%", angle:  90, ox:   0, oy:  24 }, // bottom
    { label: "Data Visualization", pct: "61%", angle: 150, ox: -30, oy:  12 }, // bottom-left
    { label: "Communication",      pct: "66%", angle: 210, ox: -30, oy: -10 }, // top-left
  ];

  // Build colorful filled polygon: split into triangles center→edge[i]→edge[i+1]
  const pts = vals.map((v, i) => toXY(angles6[i], (v / 100) * r));

  return (
    <div className="sd-radar-container">
      {/* viewBox wide enough: cx=185, left label needs ~185-100-30-80=-25 → pad to 370 wide */}
      <svg viewBox="0 0 370 330" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {skillColors.map((c, i) => (
            <linearGradient key={i} id={`rg${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity="0.55" />
              <stop offset="100%" stopColor={c} stopOpacity="0.15" />
            </linearGradient>
          ))}
        </defs>

        {/* Grid rings */}
        {gridLevels.map((lvl) => (
          <polygon key={lvl}
            points={angles6.map((a) => { const pt = toXY(a, (lvl/100)*r); return `${pt.x},${pt.y}`; }).join(" ")}
            fill="none" stroke="#e2e8f0" strokeWidth="1" />
        ))}

        {/* Axis spokes — colored */}
        {angles6.map((a, i) => {
          const pt = toXY(a, r);
          return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y}
            stroke={skillColors[i]} strokeWidth="1.2" strokeOpacity="0.4" />;
        })}

        {/* Colorful filled slices (center → pt[i] → pt[i+1]) */}
        {pts.map((pt, i) => {
          const next = pts[(i + 1) % pts.length];
          return (
            <polygon key={i}
              points={`${cx},${cy} ${pt.x},${pt.y} ${next.x},${next.y}`}
              fill={skillColors[i]} fillOpacity="0.28"
              stroke={skillColors[i]} strokeWidth="0" />
          );
        })}

        {/* Outer colored stroke border */}
        <polygon points={polygon(vals)}
          fill="none" stroke="url(#rg0)" strokeWidth="0" />
        {pts.map((pt, i) => {
          const next = pts[(i + 1) % pts.length];
          return (
            <line key={i}
              x1={pt.x} y1={pt.y} x2={next.x} y2={next.y}
              stroke={skillColors[i]} strokeWidth="2.2" strokeLinecap="round" />
          );
        })}

        {/* Industry avg dashed */}
        <polygon points={polygon(indAvg)}
          fill="none" stroke="#94a3b8" strokeWidth="1.4" strokeDasharray="4,3" />

        {/* Dot on each vertex */}
        {pts.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="3.5"
            fill={skillColors[i]} stroke="#fff" strokeWidth="1.5" />
        ))}

        {/* Labels */}
        {labels.map((item, i) => {
          const pt = toXY(item.angle, r + 32);
          return (
            <g key={i}>
              <text x={pt.x + item.ox} y={pt.y + item.oy}
                textAnchor="middle" fontSize="11.5" fill="#374151"
                fontWeight="600" fontFamily="'Segoe UI', sans-serif">{item.label}</text>
              <text x={pt.x + item.ox} y={pt.y + item.oy + 15}
                textAnchor="middle" fontSize="11.5" fill={skillColors[i]}
                fontWeight="800" fontFamily="'Segoe UI', sans-serif">{item.pct}</text>
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
   Daily Goals Card Component
───────────────────────────────────── */
const DAILY_GOALS = [
  { id:0, icon:"📝", title:"Update resume summary",      pts: 10 },
  { id:1, icon:"🔍", title:"Apply to 2 jobs today",      pts: 20 },
  { id:2, icon:"📚", title:"Study Python for 30 mins",   pts: 15 },
  { id:3, icon:"🤝", title:"Send 1 LinkedIn connection",  pts: 10 },
  { id:4, icon:"💡", title:"Read 1 industry article",     pts: 5  },
];

function DailyGoalsCard() {
  const [done, setDone]     = React.useState(new Set());
  const [streak, setStreak] = React.useState(4); // mock streak

  const toggle = (id) => {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const totalPts    = DAILY_GOALS.reduce((s, g) => s + g.pts, 0);
  const earnedPts   = DAILY_GOALS.filter(g => done.has(g.id)).reduce((s,g) => s+g.pts, 0);
  const pct         = Math.round((earnedPts / totalPts) * 100);
  const allDone     = done.size === DAILY_GOALS.length;

  return (
    <div className="sd-card sd-dg-card">

      {/* Header row */}
      <div className="sd-dg-header">
        <div>
          <div className="sd-ctitle">🎯 Daily Goals</div>
          <div className="sd-csub">Complete today's targets to grow faster</div>
        </div>
        <div className="sd-dg-streak">
          <span className="sd-dg-fire">🔥</span>
          <span className="sd-dg-streak-num">{streak}</span>
          <span className="sd-dg-streak-lbl">day streak</span>
        </div>
      </div>

      {/* XP progress bar */}
      <div className="sd-dg-xp-row">
        <span className="sd-dg-xp-lbl">{earnedPts} / {totalPts} XP</span>
        <span className="sd-dg-xp-pct">{pct}%</span>
      </div>
      <div className="sd-dg-bar-track">
        <div className="sd-dg-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* All done banner */}
      {allDone && (
        <div className="sd-dg-banner">
          🎉 All goals done! Streak extended to {streak + 1} days!
        </div>
      )}

      {/* Goal list */}
      <div className="sd-dg-list">
        {DAILY_GOALS.map((goal) => {
          const isDone = done.has(goal.id);
          return (
            <div
              key={goal.id}
              className={`sd-dg-item ${isDone ? "sd-dg-item--done" : ""}`}
              onClick={() => toggle(goal.id)}
            >
              <div className="sd-dg-ico">{goal.icon}</div>
              <span className={`sd-dg-text ${isDone ? "sd-dg-strike" : ""}`}>{goal.title}</span>
              <div className={`sd-dg-pts ${isDone ? "sd-dg-pts--done" : ""}`}>
                {isDone ? "✓" : `+${goal.pts}`}
                <span className="sd-dg-xplbl">{isDone ? " done" : " xp"}</span>
              </div>
            </div>
          );
        })}
      </div>

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

  // first skill default selected
  const [activeSkill, setActiveSkill] = React.useState(
    SKILL_ROLE_MAP[0]?.skill || null
  );

  // only selected skill display
  const displayed = SKILL_ROLE_MAP.filter(
    s => s.skill === activeSkill
  );

  return (
    <div className="sd-card sd-acs-card">

      {/* Header */}
      <div className="sd-acs-header">
        <div>
          <div className="sd-acs-title">
            <span className="sd-acs-sparkle">✨</span>
            AI Career Suggestions
          </div>

          <div className="sd-acs-sub">
            Click a skill to see matching career roles
          </div>
        </div>
      </div>

      {/* Skill pills */}
      <div className="sd-acs-skills-row">

        {SKILL_ROLE_MAP.map((s, i) => (

          <span
            key={i}
            onClick={() => setActiveSkill(s.skill)}
            className={[
              "sd-acs-skill-pill",

              s.type === "matched"
                ? "sd-acs-pill--matched"
                : "sd-acs-pill--missing",

              activeSkill === s.skill
                ? "sd-acs-pill--active"
                : "",

            ].join(" ")}
          >
            {s.emoji} {s.skill}
          </span>

        ))}

      </div>

      {/* Selected skill only */}
      <div className="sd-acs-map-list">

        {displayed.map((item, i) => (

          <div className="sd-acs-map-row" key={i}>

            {/* Skill */}
            <div className={`sd-acs-map-skill ${
              item.type === "missing"
                ? "sd-acs-map-skill--miss"
                : ""
            }`}>

              <span className="sd-acs-map-emoji">
                {item.emoji}
              </span>

              <div>

                <div className="sd-acs-map-skillname">
                  {item.skill}
                </div>

                <div className="sd-acs-map-skilltype">
                  {item.type === "matched"
                    ? "✅ Matched"
                    : "⚠️ Missing"}
                </div>

              </div>

            </div>

            {/* Arrow */}
            <div className="sd-acs-arrow">→</div>

            {/* Roles */}
            <div className="sd-acs-map-roles">

              {item.roles.map((role, j) => {

                const c =
                  ROLE_COLORS[j % ROLE_COLORS.length];

                return (
                  <span
                    key={j}
                    className="sd-acs-map-role-tag"
                    style={{
                      background: c.bg,
                      color: c.color,
                      borderColor: c.border
                    }}
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
          {/* Stars overlay */}
          <div className="sd-ats-stars" />

          {/* Decorative blobs */}
          <div className="sd-ats-blob sd-ats-blob1" />
          <div className="sd-ats-blob sd-ats-blob2" />

          {/* Label */}
          <div className="sd-ats-v2-label">ATS Score</div>

          {/* Big ring */}
          <div className="sd-ats-v2-ring">
            <Ring size={130} sw={11} value={85} id="atsG2"
              gradient={[{ o:"0%", c:"#6366f1" }, { o:"50%", c:"#818cf8" }, { o:"100%", c:"#22c55e" }]}>
              <div className="sd-ats-v2-inner">
                <div className="sd-ats-v2-pct">85%</div>
                <div className="sd-ats-v2-sub">Match</div>
              </div>
            </Ring>
          </div>

          {/* Status pill */}
          <div className="sd-ats-v2-pill sd-ats-pill--good">
            <span className="sd-ats-v2-dot" />
            Good Match
          </div>

        </div>

        <div className="sd-card sd-metrics-card">
          <div className="sd-met-header">
            <span className="sd-met-header-title">📊 Resume Metrics</span>
            
          </div>
          <div className="sd-met-grid">
          {[
            { icon:"⌨️", name:"Keyword Density",  val:70,  accent:"#22c55e", bg:"#f0fdf4", ring:"#bbf7d0", label:"Strong" },
            { icon:"📝", name:"Formatting",        val:90,  accent:"#6366f1", bg:"#eef2ff", ring:"#c7d2fe", label:"Excellent" },
            { icon:"💼", name:"Experience Match",  val:65,  accent:"#f59e0b", bg:"#fefce8", ring:"#fde68a", label:"Fair" },
            { icon:"🤝", name:"Soft Skills",       val:78,  accent:"#f97316", bg:"#fff7ed", ring:"#fed7aa", label:"Good" },
            { icon:"🎯", name:"ATS Compatibility", val:82,  accent:"#8b5cf6", bg:"#f5f3ff", ring:"#ddd6fe", label:"High" },
            { icon:"📌", name:"Relevance Score",   val:74,  accent:"#ec4899", bg:"#fdf2f8", ring:"#fbcfe8", label:"Solid" },
          ].map((m,i) => {
            const circ = 2 * Math.PI * 22;
            const offset = circ - (m.val / 100) * circ;
            return (
            <div className="sd-met3" key={i} style={{borderColor: m.ring, background: `linear-gradient(145deg, ${m.bg}, #fff)`}}>
              {/* Left: icon + name + label */}
              <div className="sd-met3-left">
                <div className="sd-met3-ico" style={{background: m.bg, border:`1.5px solid ${m.ring}`}}>
                  {m.icon}
                </div>
                <div>
                  <div className="sd-met3-name">{m.name}</div>
                  <span className="sd-met3-label" style={{color: m.accent, background: m.bg, border:`1px solid ${m.ring}`}}>{m.label}</span>
                </div>
              </div>
              {/* Right: circular ring progress */}
              <div className="sd-met3-ring">
                <svg width="54" height="54" viewBox="0 0 54 54">
                  <circle cx="27" cy="27" r="22" fill="none" stroke="#e8edff" strokeWidth="5"/>
                  <circle cx="27" cy="27" r="22" fill="none"
                    stroke={m.accent} strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    transform="rotate(-90 27 27)"
                  />
                </svg>
                <div className="sd-met3-pct" style={{color: m.accent}}>{m.val}%</div>
              </div>
            </div>
            );
          })}
          </div>
        </div>

       <div className="sd-card sd-ai-card sd-rl-card">
  <div className="sd-rl-header">
    <span className="sd-rl-ico">🗺️</span>
    <span className="sd-rl-title">Learning Roadmap</span>
  </div>

  <div className="sd-rl-list">
    {[
      { 
        skill: "Python",             
        emoji: "🐍",
        udemy:   "https://www.udemy.com/course/complete-python-bootcamp/",
        youtube: "https://www.youtube.com/results?search_query=python+tutorial",
        google:  "https://www.google.com/search?q=learn+python+free" 
      },

      { 
        skill: "Machine Learning",   
        emoji: "🤖",
        udemy:   "https://www.udemy.com/course/machinelearning/",
        youtube: "https://www.youtube.com/results?search_query=machine+learning+course",
        google:  "https://www.google.com/search?q=learn+machine+learning" 
      },

      { 
        skill: "Data Visualization", 
        emoji: "📊",
        udemy:   "https://www.udemy.com/course/data-visualization-with-python/",
        youtube: "https://www.youtube.com/results?search_query=data+visualization+tutorial",
        google:  "https://www.google.com/search?q=data+visualization+courses" 
      },

      // NEW ROADMAP 1
      { 
        skill: "Deep Learning", 
        emoji: "🧠",
        udemy:   "https://www.udemy.com/course/deeplearning/",
        youtube: "https://www.youtube.com/results?search_query=deep+learning+tutorial",
        google:  "https://www.google.com/search?q=learn+deep+learning" 
      },

      // NEW ROADMAP 2
      { 
        skill: "React JS", 
        emoji: "⚛️",
        udemy:   "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
        youtube: "https://www.youtube.com/results?search_query=react+js+tutorial",
        google:  "https://www.google.com/search?q=learn+react+js" 
      },

    ].map((item, i) => (
      <div className="sd-rl-row" key={i}>
        <div className="sd-rl-skill">
          <span className="sd-rl-emoji">{item.emoji}</span>
          <span className="sd-rl-name">{item.skill}</span>
        </div>

        <div className="sd-rl-btns">
          <a
            href={item.udemy}
            target="_blank"
            rel="noopener noreferrer"
            className="sd-rl-btn sd-rl-btn--u"
          >
            🎓 Udemy
          </a>

          <a
            href={item.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="sd-rl-btn sd-rl-btn--y"
          >
            ▶ YouTube
          </a>

          <a
            href={item.google}
            target="_blank"
            rel="noopener noreferrer"
            className="sd-rl-btn sd-rl-btn--g"
          >
            🔍 Google
          </a>
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

        <DailyGoalsCard />

        <div className="sd-card sd-jm-card">
          <div className="sd-ctitle">Job Match Insights</div>
          <div className="sd-csub">Based on your skills and experience</div>

          {/* Ring + roles row */}
          <div className="sd-jm-body">
            <Ring size={100} sw={9} value={82} color="#6366f1">
              <div className="sd-jm-pct">82%</div>
              <div className="sd-jm-sub">Strong Match</div>
            </Ring>
            <div className="sd-jm-roles">
              <div className="sd-csub" style={{marginBottom:4}}>Top Matching Roles</div>
              {[
                { name:"Data Analyst",     p:82, c:"#6366f1" },
                { name:"Business Analyst", p:78, c:"#3b82f6" },
                { name:"Data Scientist",   p:73, c:"#8b5cf6" },
              ].map((r,i) => (
                <div className="sd-role-row" key={i}>
                  <div className="sd-role-hd">
                    <div className="sd-role-name"><span className="sd-dot" style={{background:r.c}}></span>{r.name}</div>
                    <div className="sd-role-pct" style={{color:r.c}}>{r.p}%</div>
                  </div>
                  <div className="sd-bar-track">
                    <div className="sd-bar-fill" style={{width:`${r.p}%`, background:r.c}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="sd-jm-divider" />

          {/* Market demand stats */}
          <div className="sd-jm-why-title">📈 Market Demand</div>
          <div className="sd-jm-stats-row">
            <div className="sd-jm-stat">
              <div className="sd-jm-stat-val">1,240+</div>
              <div className="sd-jm-stat-lbl">Open Jobs</div>
            </div>
            <div className="sd-jm-stat-sep" />
            <div className="sd-jm-stat">
              <div className="sd-jm-stat-val sd-jm-green">↑18%</div>
              <div className="sd-jm-stat-lbl">You Growth</div>
            </div>
            <div className="sd-jm-stat-sep" />
            <div className="sd-jm-stat">
              <div className="sd-jm-stat-val">₹12 LPA</div>
              <div className="sd-jm-stat-lbl">Avg Salary</div>
            </div>
          </div>

        </div>
      </div>

      {/* ══ ROW 3: Quality · Learning · Focus ══ */}
      <div className="sd-row sd-r3">

        <div className="sd-card sd-qual-card sd-qual-v2">

          {/* Top: badge + title side by side */}
          <div className="sd-qv2-header">
            <div className="sd-qv2-badge">
              <div className="sd-qv2-badge-ring">
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#dcfce7" strokeWidth="6"/>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="url(#qGrad)" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2*Math.PI*26}`}
                    strokeDashoffset={`${2*Math.PI*26*(1-0.92)}`}
                    transform="rotate(-90 32 32)"/>
                  <defs>
                    <linearGradient id="qGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#22c55e"/>
                      <stop offset="100%" stopColor="#4ade80"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="sd-qv2-badge-score">92%</div>
              
            </div>
            <div className="sd-qv2-title-block">
              <div className="sd-qv2-title">Resume Quality</div>
              <div className="sd-qv2-subtitle">Based on skills & experience</div>
              <div className="sd-qv2-status-row">
                <span className="sd-qv2-dot" />
                <span className="sd-qv2-status-txt">Top 10% of resumes</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="sd-qv2-divider"/>

          {/* 2x2 metric tiles */}
          <div className="sd-qv2-grid">
            {[
              { 
  lbl:"Clarity",
  v:92,
  icon:"✏️",
  c:"#6366f1",
  bg:"#eef2ff",
  bar:"#a5b4fc"
},

{ 
  lbl:"Impact",
  v:90,
  icon:"⚡",
  c:"#f59e0b",
  bg:"#fff7ed",
  bar:"#fdba74"
},

{ 
  lbl:"Structure",
  v:90,
  icon:"🏗️",
  c:"#06b6d4",
  bg:"#ecfeff",
  bar:"#67e8f9"
},

{ 
  lbl:"Readability",
  v:92,
  icon:"📖",
  c:"#22c55e",
  bg:"#f0fdf4",
  bar:"#86efac"
},

{ 
  lbl:"Professionalism",
  v:92,
  icon:"💼",
  c:"#8b5cf6",
  bg:"#f5f3ff",
  bar:"#c4b5fd"
},

{ 
  lbl:"ATS Readiness",
  v:92,
  icon:"🤖",
  c:"#ec4899",
  bg:"#fdf2f8",
  bar:"#f9a8d4"
},
            ].map((m,i) => (
              <div className="sd-qv2-tile" key={i} style={{background: m.bg, borderColor: m.bar}}>
                <div className="sd-qv2-tile-top">
                  <span className="sd-qv2-tile-icon">{m.icon}</span>
                  <span className="sd-qv2-tile-val" style={{color: m.c}}>{m.v}%</span>
                </div>
                <div className="sd-qv2-tile-lbl">{m.lbl}</div>
                <div className="sd-qv2-tile-bar-track">
                  <div className="sd-qv2-tile-bar-fill" style={{width:`${m.v}%`, background: m.c}}/>
                </div>
              </div>
            ))}
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