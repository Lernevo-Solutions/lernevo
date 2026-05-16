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
   Main Dashboard Component
───────────────────────────────────── */
export default function Dashboard() {
  return (
    <div className="sd-dashboard">

      {/* ══ ROW 1: ATS Score · Metrics · AI Summary ══ */}
      <div className="sd-row sd-r1">

        <div className="sd-card sd-ats-card">
          <Ring size={100} sw={9} value={75} id="atsG"
            gradient={[{ o:"0%", c:"#6366f1" }, { o:"100%", c:"#22c55e" }]}>
            <div className="sd-ats-pct">75%</div>
          </Ring>
          <div className="sd-ats-info">
            <div className="sd-ats-title">Overall ATS Match</div>
            <div className="sd-ats-good">✦ Good Match</div>
          </div>
          <div className="sd-ats-wave">

 

  <svg viewBox="0 0 160 40" preserveAspectRatio="none">

    <defs>

      {/* gradient */}
      <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#c7d2fe" />
        <stop offset="40%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#22c55e" />
      </linearGradient>

      {/* glow */}
      <filter id="glow">
        <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

    </defs>

    {/* background faded stock line */}
    <polyline
      points="0,32 10,28 18,30 28,22 35,25 45,18 52,21 60,15 68,18 75,12 82,16 90,8 100,12 108,9 116,14 124,6 132,10 140,4 150,7 160,2"
      fill="none"
      stroke="#e0e7ff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* main stock trend line */}
    <polyline
      className="sd-wave-path"
      points="0,32 10,28 18,30 28,22 35,25 45,18 52,21 60,15 68,18 75,12 82,16 90,8 100,12 108,9 116,14 124,6 132,10 140,4 150,7 160,2"
      fill="none"
      stroke="url(#waveGradient)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#glow)"
    />

    {/* endpoint glow circle */}
    <circle
      cx="160"
      cy="2"
      r="4"
      fill="#22c55e"
      className="sd-wave-circle"
    />

  </svg>
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

        <div className="sd-card sd-ai-card">
          <div className="sd-ai-head">
            <span className="sd-ai-ico">🤖</span>
            <span className="sd-ai-title">AI Summary</span>
          </div>
          <p className="sd-ai-body">
            Your resume is strong focused on improving matching keywords, match and adding more action verbs.
          </p>
     
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

        <div className="sd-card sd-learn-card">
          <div className="sd-learn-top">
            <div>
              <div className="sd-ctitle">Personalized Learning Path</div>
              <div className="sd-csub">Step-by-step to reach your next career goal.</div>
            </div>
            <button className="sd-start-btn">Start</button>
          </div>
          <div className="sd-act-title">Activity Feed</div>
          <div className="sd-csub">Your recent learning activity.</div>
          {[
            {icon:"📄", txt:"Resume reviewed successfully", time:"2 hours ago"},
            {icon:"🔍", txt:"Skills analysis completed",    time:"2 hours ago"},
            {icon:"🤖", txt:"AI feedback generated",        time:"1 hour ago" },
            {icon:"🗺️", txt:"Roadmap updated",              time:"30 mins ago"},
          ].map((a,i) => (
            <div className="sd-act-row" key={i}>
              <div className="sd-act-left">
                <div className="sd-act-ico">{a.icon}</div>
                <span className="sd-act-txt">{a.txt}</span>
              </div>
              <span className="sd-act-time">{a.time}</span>
            </div>
          ))}
         
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
          <span className="sd-lnk">See improvement tips →</span>
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

        <div className="sd-card sd-roadmap-card">
          <div className="sd-ctitle">Your AI Roadmap</div>
          <div className="sd-rm-col-headers">
            <span></span>
            <span className="sd-rm-col-h sd-rm-col-py">Python</span>
            <span className="sd-rm-col-h sd-rm-col-sq">SQL</span>
            <span className="sd-rm-col-h sd-rm-col-ml">Machine Learning</span>
          </div>
          <div className="sd-rm-top">
            <div className="sd-rm-trophy">🏆</div>
            <div>
              <div className="sd-rm-level">Completion Level: <strong>Moderate</strong></div>
              <div className="sd-rm-sub">You're ahead of 40% peers.</div>
            </div>
          </div>
          <div className="sd-rm-skills">
            {[
              {name:"Python",            cls:"py", w:"84%"},
              {name:"SQL",               cls:"sq", w:"78%"},
              {name:"Machine Learning",  cls:"ml", w:"68%"},
              {name:"Data Visualization",cls:"dv", w:"61%"},
            ].map((s,i) => (
              <div className="sd-rm-row" key={i}>
                <div className="sd-rm-name">{s.name}</div>
                <div className="sd-bar-track">
                  <div className={`sd-bar-fill rm-${s.cls}`} style={{width:s.w}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}