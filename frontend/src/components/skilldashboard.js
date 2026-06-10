import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./skilldashboard.css";

/* ─────────────────────────────────────
   Radar Chart Component
───────────────────────────────────── */
function RadarChart({ skills = [] }) {
  const cx = 185, cy = 165, r = 100;

  const toXY = (angle, radius) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const displaySkills = skills.filter(s => s && s.skill_name).slice(0, 6);
  
  if (displaySkills.length === 0) {
    return (
      <div className="sd-radar-container">
        <svg viewBox="0 0 370 330" xmlns="http://www.w3.org/2000/svg">
          <text x="185" y="165" textAnchor="middle" fill="#6b7280" fontSize="14">
            No skill data available
          </text>
        </svg>
      </div>
    );
  }

  const angles6 = [270, 330, 30, 90, 150, 210];
  const vals = displaySkills.map(s => s.score || 50);
  const indAvg = vals.map(v => Math.max(40, v - 15));
  
  const skillColors = ["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#f43f5e", "#a855f7"];

  const polygon = (values) =>
    values.map((v, i) => {
      const pt = toXY(angles6[i], (v / 100) * r);
      return `${pt.x},${pt.y}`;
    }).join(" ");

  const gridLevels = [25, 50, 75, 100];
  const pts = vals.map((v, i) => toXY(angles6[i], (v / 100) * r));

  const labels = displaySkills.map((skill, i) => ({
    label: skill.skill_name,
    pct: `${skill.score || 50}%`,
    angle: angles6[i],
    ox: [0, 30, 30, 0, -30, -30][i % 6],
    oy: [-20, -10, 12, 24, 12, -10][i % 6]
  }));

  return (
    <div className="sd-radar-container">
      <svg viewBox="0 0 370 330" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {skillColors.map((c, i) => (
            <linearGradient key={i} id={`rg${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity="0.55" />
              <stop offset="100%" stopColor={c} stopOpacity="0.15" />
            </linearGradient>
          ))}
        </defs>

        {gridLevels.map((lvl) => (
          <polygon key={lvl}
            points={angles6.map((a) => { const pt = toXY(a, (lvl/100)*r); return `${pt.x},${pt.y}`; }).join(" ")}
            fill="none" stroke="#e2e8f0" strokeWidth="1" />
        ))}

        {angles6.map((a, i) => {
          const pt = toXY(a, r);
          return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y}
            stroke={skillColors[i]} strokeWidth="1.2" strokeOpacity="0.4" />;
        })}

        {pts.map((pt, i) => {
          const next = pts[(i + 1) % pts.length];
          return (
            <polygon key={i}
              points={`${cx},${cy} ${pt.x},${pt.y} ${next.x},${next.y}`}
              fill={skillColors[i]} fillOpacity="0.28"
              stroke={skillColors[i]} strokeWidth="0" />
          );
        })}

        <polygon points={polygon(vals)} fill="none" />
        {pts.map((pt, i) => {
          const next = pts[(i + 1) % pts.length];
          return (
            <line key={i}
              x1={pt.x} y1={pt.y} x2={next.x} y2={next.y}
              stroke={skillColors[i]} strokeWidth="2.2" strokeLinecap="round" />
          );
        })}

        <polygon points={polygon(indAvg)} fill="none" stroke="#94a3b8" strokeWidth="1.4" strokeDasharray="4,3" />

        {pts.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="3.5"
            fill={skillColors[i]} stroke="#fff" strokeWidth="1.5" />
        ))}

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
  const circ = 2 * Math.PI * radius;
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
  { id: 0, icon: "📝", title: "Update resume summary", pts: 10 },
  { id: 1, icon: "🔍", title: "Apply to 2 jobs today", pts: 20 },
  { id: 2, icon: "📚", title: "Study missing skills", pts: 15 },
  { id: 3, icon: "🤝", title: "Send 1 LinkedIn connection", pts: 10 },
  { id: 4, icon: "💡", title: "Read 1 industry article", pts: 5 },
];

function DailyGoalsCard() {
  const [done, setDone] = React.useState(new Set());
  const [streak, setStreak] = React.useState(4);

  const toggle = (id) => {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const totalPts = DAILY_GOALS.reduce((s, g) => s + g.pts, 0);
  const earnedPts = DAILY_GOALS.filter(g => done.has(g.id)).reduce((s, g) => s + g.pts, 0);
  const pct = Math.round((earnedPts / totalPts) * 100);
  const allDone = done.size === DAILY_GOALS.length;

  return (
    <div className="sd-card sd-dg-card" style={{height:'100%',boxSizing:'border-box',display:'flex',flexDirection:'column'}}>
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

      <div className="sd-dg-xp-row">
        <span className="sd-dg-xp-lbl">{earnedPts} / {totalPts} XP</span>
        <span className="sd-dg-xp-pct">{pct}%</span>
      </div>
      <div className="sd-dg-bar-track">
        <div className="sd-dg-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      {allDone && (
        <div className="sd-dg-banner">
          🎉 All goals done! Streak extended to {streak + 1} days!
        </div>
      )}

      <div className="sd-dg-list">
        {DAILY_GOALS.map((goal) => {
          const isDone = done.has(goal.id);
          return (
            <div key={goal.id} className={`sd-dg-item ${isDone ? "sd-dg-item--done" : ""}`} onClick={() => toggle(goal.id)}>
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
───────────────────────────────────── */
function AICareerSuggestions({ suggestions = [] }) {
  const [activeSkill, setActiveSkill] = React.useState(null);

  React.useEffect(() => {
    if (suggestions && suggestions.length > 0) {
      setActiveSkill(suggestions[0].skill_name);
    }
  }, [suggestions]);

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="sd-card sd-acs-card" style={{height:'100%',boxSizing:'border-box',display:'flex',flexDirection:'column'}}>
        <div className="sd-acs-header">
          <div>
            <div className="sd-acs-title">
              <span className="sd-acs-sparkle">✨</span>
              AI Career Suggestions
            </div>
            <div className="sd-acs-sub">No suggestions available. Analyze your resume first.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sd-card sd-acs-card" style={{height:'100%',boxSizing:'border-box',display:'flex',flexDirection:'column',gap:0}}>
      <div style={{flexShrink:0,marginBottom:'8px'}}>
        <div className="sd-acs-title">
          <span className="sd-acs-sparkle">✨</span>
          AI Career Suggestions
        </div>
        <div className="sd-acs-sub">Your skills mapped to career roles</div>
      </div>

      <div style={{flex:1,display:'flex',flexDirection:'column',gap:'6px',minHeight:0}}>
        {suggestions.map((item, i) => {
          const isActive = activeSkill === item.skill_name;
          return (
            <div
              key={i}
              onClick={() => setActiveSkill(item.skill_name)}
              style={{
                flex:1,
                display:'flex',
                alignItems:'center',
                gap:'8px',
                padding:'0 10px',
                borderRadius:'10px',
                border: isActive ? '1.5px solid #a5b4fc' : '1.5px solid #f1f5f9',
                background: isActive ? '#eef2ff' : '#fafbff',
                cursor:'pointer',
                transition:'all 0.15s',
                minHeight:0,
              }}
            >
              <div style={{
                flexShrink:0,
                background: isActive ? '#6366f1' : '#fff',
                border:'1.5px solid #c7d2fe',
                borderRadius:'8px',
                padding:'5px 10px',
                minWidth:'90px',
              }}>
                <div style={{fontSize:'11px',fontWeight:700,color: isActive ? '#fff' : '#1e1b4b',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                  💼 {item.skill_name || "Core Technology"}
                </div>
                <div style={{fontSize:'9px',color: isActive ? '#c7d2fe' : '#6366f1',marginTop:'1px'}}>
                  ✅ Recommended
                </div>
              </div>

              <div style={{color:'#a5b4fc',fontSize:'14px',flexShrink:0}}>→</div>

              <div style={{
                flex:1,
                background:'#f5f3ff',
                border:'1px solid #ddd6fe',
                borderRadius:'8px',
                padding:'5px 10px',
                textAlign:'center',
              }}>
                <div style={{fontSize:'11px',fontWeight:700,color:'#4f46e5',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                  {item.role_name || "Target Professional Role"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   AI Resume Detector Card Component (UPDATED)
───────────────────────────────────── */
function AIResumeDetectorCard({ atsScore = 65, resumeMetrics = [], analysisId = null, initialDetection = null, initialResumeText = '' }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(initialDetection);
  const [error, setError] = useState(null);

  const getGrade = (score) => {
    if (score >= 85) return { label: "Excellent", color: "#22c55e", bg: "#dcfce7", border: "#bbf7d0" };
    if (score >= 70) return { label: "Good", color: "#3b82f6", bg: "#dbeafe", border: "#bfdbfe" };
    if (score >= 55) return { label: "Average", color: "#3b82f6", bg: "#dbeafe", border: "#93c5fd" };
    return { label: "Needs Work", color: "#ef4444", bg: "#fee2e2", border: "#fecaca" };
  };

  const grade = getGrade(atsScore);

  const detectResume = async () => {
    if (initialDetection) {
      console.log("Using initial detection data");
      return;
    }
    
    setLoading(true);
    setError(null);

    // ✅ Use passed resume text first, then localStorage
    let resumeText = initialResumeText || localStorage.getItem('resumeText') || '';
    const jobDescription = localStorage.getItem('jobDescription') || '';
    const aid = analysisId || localStorage.getItem('latest_analysis_id') || null;
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';

    console.log("Resume text length for detection:", resumeText.length);
    console.log("Resume text preview:", resumeText.substring(0, 100));
    
    if (!resumeText || resumeText.length < 50) {
      setError("Resume text not available. Please re-analyze your resume.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://lernevo-backend-237359549871.us-central1.run.app/api/detect-resume/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          ats_score: atsScore,
          resume_text: resumeText,
          job_description: jobDescription,
          analysis_id: aid,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setResult({ ...data.data, analyzedFromText: data.data.analyzed_from_text });
      } else {
        setError(data.error || "Detection failed. Please try again.");
      }
    } catch (e) {
      console.error("Detection API error:", e);
      setError("Cannot reach backend. Check your connection.");
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (!initialDetection) {
      detectResume();
    }
  }, []);

  return (
    <div className="sd-card sd-ai-detector-card" style={{height:'100%',boxSizing:'border-box',display:'flex',flexDirection:'column'}}>
      <div className="sd-aid-header">
        <span className="sd-aid-ico">🤖</span>
        <div>
          <div className="sd-aid-title">AI Resume Detector</div>
          <div className="sd-aid-sub">Detect resume type & quality</div>
        </div>
      </div>

      <div className="sd-aid-grade" style={{ background: grade.bg, border: `1.5px solid ${grade.border}` }}>
        <span className="sd-aid-grade-label" style={{ color: grade.color }}>
          {atsScore}% — {grade.label}
        </span>
      </div>

      {loading && (
        <div className="sd-aid-loading">
          <div className="sd-aid-spinner" />
          <span>Detecting...</span>
        </div>
      )}

      {error && (
        <div className="sd-aid-error">
          ⚠️ {error}
          <button className="sd-aid-retry" onClick={detectResume}>🔄 Retry</button>
        </div>
      )}

      {result && (
        <div className="sd-aid-result">
          <div className="sd-aid-row">
            <span className="sd-aid-type-badge">📄 {result.resume_type}</span>
            <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
              {result.analyzedFromText && (
                <span style={{fontSize:'9px',background:'#dcfce7',color:'#16a34a',border:'1px solid #bbf7d0',borderRadius:'999px',padding:'2px 7px',fontWeight:700}}>
                  ✅ Text Analyzed
                </span>
              )}
              {result.detection_confidence && (
                <span style={{
                  fontSize:'9px',
                  background: result.detection_confidence === 'High' ? '#eef2ff' : result.detection_confidence === 'Medium' ? '#fef3c7' : '#f1f5f9',
                  color: result.detection_confidence === 'High' ? '#6366f1' : result.detection_confidence === 'Medium' ? '#d97706' : '#64748b',
                  border: `1px solid ${result.detection_confidence === 'High' ? '#c7d2fe' : result.detection_confidence === 'Medium' ? '#fde68a' : '#e2e8f0'}`,
                  borderRadius:'999px',padding:'2px 7px',fontWeight:700
                }}>
                  {result.detection_confidence} Confidence
                </span>
              )}
              <button className="sd-aid-retry-btn" onClick={detectResume} title="Re-analyze">↺</button>
            </div>
          </div>

          <div className="sd-aid-bars">
            <div className="sd-aid-bar-row">
              <span className="sd-aid-bar-lbl">🤖 AI Written</span>
              <div className="sd-aid-bar-track">
                <div className="sd-aid-bar-fill sd-aid-bar--ai" style={{ width: `${result.ai_written_probability}%` }} />
              </div>
              <span className="sd-aid-bar-pct" style={{ color: "#6366f1" }}>{result.ai_written_probability}%</span>
            </div>
            <div className="sd-aid-bar-row">
              <span className="sd-aid-bar-lbl">✍️ Human</span>
              <div className="sd-aid-bar-track">
                <div className="sd-aid-bar-fill sd-aid-bar--human" style={{ width: `${result.human_written_probability}%` }} />
              </div>
              <span className="sd-aid-bar-pct" style={{ color: "#22c55e" }}>{result.human_written_probability}%</span>
            </div>
          </div>

          {result.analyzedFromText && result.ai_signals && result.ai_signals.length > 0 && result.ai_signals[0] !== 'No resume text provided for detailed analysis' && (
            <div className="sd-aid-section">
              <div className="sd-aid-sec-title" style={{color:'#6366f1'}}>🤖 AI Signals Detected</div>
              {result.ai_signals.slice(0, 2).map((s, i) => (
                <div key={i} className="sd-aid-item" style={{background:'#eef2ff',color:'#3730a3',borderLeft:'2px solid #818cf8'}}>• {s}</div>
              ))}
            </div>
          )}

          {result.analyzedFromText && result.human_signals && result.human_signals.length > 0 && (
            <div className="sd-aid-section">
              <div className="sd-aid-sec-title" style={{color:'#16a34a'}}>✍️ Human Signals Found</div>
              {result.human_signals.slice(0, 2).map((s, i) => (
                <div key={i} className="sd-aid-item sd-aid-item--green">• {s}</div>
              ))}
            </div>
          )}

          {result.strengths && !result.analyzedFromText && (
            <div className="sd-aid-section">
              <div className="sd-aid-sec-title">✅ Strengths</div>
              {result.strengths.slice(0, 2).map((s, i) => (
                <div key={i} className="sd-aid-item sd-aid-item--green">• {s}</div>
              ))}
            </div>
          )}

          {result.red_flags && result.red_flags.length > 0 && (
            <div className="sd-aid-section">
              <div className="sd-aid-sec-title">🚩 Flags</div>
              {result.red_flags.slice(0, 2).map((f, i) => (
                <div key={i} className="sd-aid-item sd-aid-item--red">• {f}</div>
              ))}
            </div>
          )}

          {result.recommendation && (
            <div className="sd-aid-tip">💡 {result.recommendation}</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────
   Main Dashboard Component (UPDATED)
───────────────────────────────────── */
export default function Dashboard() {
  const [analysisData, setAnalysisData] = useState(null);
  const [detectionData, setDetectionData] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const data = location.state?.analysis;
    const detection = location.state?.detection;
    const passedResumeText = location.state?.resumeText;
    
    console.log("Dashboard received analysis:", data);
    console.log("Dashboard received detection:", detection);
    console.log("Dashboard received resumeText length:", passedResumeText?.length);

    if (data) {
      setAnalysisData(data);
      if (detection) {
        setDetectionData(detection);
      }
      if (passedResumeText) {
        setResumeText(passedResumeText);
        localStorage.setItem("resumeText", passedResumeText);
      }
    } else {
      const cachedData = localStorage.getItem("latest_analysis");
      const cachedDetection = localStorage.getItem("resumeDetection");
      const cachedResumeText = localStorage.getItem("resumeText");
      
      if (cachedData) {
        console.log("Loading analysis from cache");
        setAnalysisData(JSON.parse(cachedData));
      }
      if (cachedDetection) {
        console.log("Loading detection from cache");
        setDetectionData(JSON.parse(cachedDetection));
      }
      if (cachedResumeText) {
        console.log("Loading resume text from cache, length:", cachedResumeText.length);
        setResumeText(cachedResumeText);
      }
    }
    setLoading(false);
  }, [location]);

  if (loading) {
    return (
      <div className="sd-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="sd-dashboard" style={{ textAlign: 'center', padding: '50px' }}>
        <div className="sd-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <h2>No Analysis Data Found</h2>
          <p style={{ marginTop: '20px', color: '#6b7280' }}>
            Please analyze your resume first by going to the Skill Gap Analyzer page.
          </p>
          <button 
            onClick={() => navigate('/skillgap')}
            style={{
              marginTop: '30px',
              padding: '12px 24px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Go to Analyzer
          </button>
        </div>
      </div>
    );
  }

  const atsScore = analysisData.ats_score ?? analysisData.resume_quality_score ?? 65;
  const matchScore = analysisData.match_score ?? 60;
  const gapScore = analysisData.gap_score ?? 40;
  const openJobs = analysisData.open_jobs ?? 0;
  const salaryRange = analysisData.salary_range || "N/A";
  const growthRate = analysisData.growth_rate || "0%";

  const skills = (analysisData.skills || []).map(s => ({
    ...s,
    status: (s.status || "").toUpperCase(),
    score: typeof s.score === "string" ? parseInt(s.score, 10) : (s.score ?? 50),
  }));
  const matchedSkills = skills.filter(s => s.status === "MATCHED");
  const missingSkills = skills.filter(s => s.status === "MISSING");
  const roadmap = analysisData.learning_roadmaps || [];

  const tips = (analysisData.improvement_tips || []).map(t => ({
    ...t,
    impact_percentage: typeof t.impact_percentage === "number" ? t.impact_percentage : parseInt(t.impact_percentage || "0", 10) || 0,
  }));

  const focusAreas = (analysisData.focus_areas || []).map(f => ({
    ...f,
    priority: f.priority === "CRITICAL" ? "HIGH" : (f.priority || "MEDIUM"),
  }));

  const suggestions = analysisData.career_suggestions || [];
  const jobMatches = analysisData.job_matches || [];

  const resumeMetrics = (analysisData.resume_metrics || []).map(m => ({
    ...m,
    metric_type: (m.metric_type || "").toUpperCase(),
    score: typeof m.score === "string" ? parseInt(m.score, 10) : (m.score ?? 70),
  }));

  const defaultMetrics = [
    { metric_type: "KEYWORD_DENSITY", score: 70, label: "Good" },
    { metric_type: "FORMATTING", score: 85, label: "Excellent" },
    { metric_type: "EXPERIENCE_MATCH", score: 65, label: "Fair" },
    { metric_type: "SOFT_SKILLS", score: 78, label: "Good" },
    { metric_type: "ATS_COMPATIBILITY", score: 82, label: "High" },
    { metric_type: "RELEVANCE_SCORE", score: 74, label: "Solid" },
  ];

  const metricsToShow = resumeMetrics.length > 0 ? resumeMetrics : defaultMetrics;

  const metricConfig = {
    "KEYWORD_DENSITY": { icon: "⌨️", name: "Keyword Density", accent: "#22c55e", bg: "#f0fdf4", ring: "#bbf7d0" },
    "FORMATTING": { icon: "📝", name: "Formatting", accent: "#6366f1", bg: "#eef2ff", ring: "#c7d2fe" },
    "EXPERIENCE_MATCH": { icon: "💼", name: "Experience Match", accent: "#f59e0b", bg: "#fefce8", ring: "#fde68a" },
    "SOFT_SKILLS": { icon: "🤝", name: "Soft Skills", accent: "#f97316", bg: "#fff7ed", ring: "#fed7aa" },
    "ATS_COMPATIBILITY": { icon: "🎯", name: "ATS Compatibility", accent: "#8b5cf6", bg: "#f5f3ff", ring: "#ddd6fe" },
    "RELEVANCE_SCORE": { icon: "📌", name: "Relevance Score", accent: "#ec4899", bg: "#fdf2f8", ring: "#fbcfe8" },
  };

  return (
    <div className="sd-dashboard">
      {/* ROW 1 */}
      <div className="sd-row sd-r1" style={{display:'grid',gridTemplateColumns:'1.35fr 1.8fr 1fr 1fr',gap:'14px',alignItems:'stretch'}}>
        {/* ATS Score Card */}
        {(() => {
          const score = atsScore;
          const isExcellent = score >= 85, isGood = score >= 70, isFair = score >= 50;
          const R = 50, sw = 11, cx = 60, cy = 60;
          const circ = 2 * Math.PI * R;
          const offset = circ - (score / 100) * circ;
          const tipAngle = (-90 + (score / 100) * 360) * Math.PI / 180;
          const tipX = cx + R * Math.cos(tipAngle);
          const tipY = cy + R * Math.sin(tipAngle);
          const gradStart = isExcellent ? '#22c55e' : isGood ? '#6366f1' : isFair ? '#3b82f6' : '#ef4444';
          const gradEnd = isExcellent ? '#4ade80' : isGood ? '#a78bfa' : isFair ? '#60a5fa' : '#f87171';
          const cardBg = isExcellent ? 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)' : isGood ? 'linear-gradient(135deg,#eef2ff 0%,#e0e7ff 100%)' : isFair ? 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)' : 'linear-gradient(135deg,#fff1f2 0%,#ffe4e6 100%)';
          const pillBg = isExcellent ? '#dcfce7' : isGood ? '#e0e7ff' : isFair ? '#dbeafe' : '#ffe4e6';
          const pillBdr = isExcellent ? '#86efac' : isGood ? '#a5b4fc' : isFair ? '#93c5fd' : '#fca5a5';
          const pillTxt = isExcellent ? '#15803d' : isGood ? '#4338ca' : isFair ? '#1d4ed8' : '#b91c1c';
          const gradId = `atsGrad_${score}`;
          const atsGrade = isExcellent ? 'Excellent' : isGood ? 'Good' : isFair ? 'Fair' : 'Weak';
          const resumeRankPct = Math.max(1, Math.round(100 - score * 0.68));
          const keywordsHit = matchedSkills.length;
          const sparkBars = [0.4, 0.7, 0.55, 0.9, score/100, 0.75, 0.6, 0.85];

          return (
            <div className="sd-card sd-ats-card sd-ats-v3" style={{display:'flex', flexDirection:'column', boxSizing:'border-box', height:'100%', padding:'16px 14px', background: cardBg, border:`1.5px solid ${pillBdr}`, position:'relative', overflow:'hidden'}}>
              <div style={{position:'absolute',top:'-18px',right:'-18px',width:'80px',height:'80px',borderRadius:'50%',background:gradStart,opacity:0.12,filter:'blur(18px)',pointerEvents:'none'}}/>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'8px',position:'relative'}}>
                <div>
                  <div style={{fontSize:'9px',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:gradStart}}>ATS Score</div>
                  <div style={{fontSize:'13px',fontWeight:800,color:'#1e1b4b',marginTop:'2px'}}>Resume Match</div>
                </div>
                <div style={{background:pillBg,border:`1.5px solid ${pillBdr}`,color:pillTxt,borderRadius:'999px',padding:'4px 12px',fontSize:'11px',fontWeight:800,flexShrink:0,boxShadow:`0 2px 8px ${gradStart}22`}}>{atsGrade}</div>
              </div>
              <div style={{display:'flex',justifyContent:'center',alignItems:'center',marginBottom:'8px'}}>
                <div style={{position:'relative',width:'130px',height:'130px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="130" height="130" viewBox="0 0 120 120" style={{position:'absolute',top:0,left:0}}>
                    <defs><linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={gradStart}/><stop offset="100%" stopColor={gradEnd}/></linearGradient></defs>
                    <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={sw}/>
                    <circle cx={cx} cy={cy} r={R} fill="none" stroke={`url(#${gradId})`} strokeWidth={sw} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform={`rotate(-90 ${cx} ${cy})`}/>
                    <circle cx={cx} cy={cy} r={R - sw - 4} fill="none" stroke={`${gradStart}22`} strokeWidth="1.5" strokeDasharray="4 4"/>
                    <circle cx={tipX} cy={tipY} r="7" fill={gradStart} opacity="0.25"/>
                    <circle cx={tipX} cy={tipY} r="4.5" fill={gradStart}/>
                    <circle cx={tipX} cy={tipY} r="2" fill="#fff"/>
                  </svg>
                  <div style={{position:'absolute',display:'flex',flexDirection:'column',alignItems:'center',gap:'0px'}}>
                    <span style={{fontSize:'32px',fontWeight:900,color:gradStart,lineHeight:1,letterSpacing:'-2px'}}>{score}</span>
                    <span style={{fontSize:'13px',fontWeight:700,color:gradStart,lineHeight:1}}>%</span>
                    <span style={{fontSize:'7.5px',fontWeight:700,letterSpacing:'2px',color:'#94a3b8',textTransform:'uppercase',marginTop:'2px'}}>match</span>
                  </div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'flex-end',gap:'3px',height:'22px',justifyContent:'center',marginBottom:'8px'}}>
                {sparkBars.map((h, i) => (<div key={i} style={{width:'10px',borderRadius:'3px 3px 0 0',background:`linear-gradient(180deg,${gradStart},${gradEnd})`,opacity: i === 4 ? 1 : 0.35 + h * 0.45,height:`${Math.round(h*22)}px`,transition:'height 0.5s'}}/>))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'5px',marginBottom:'10px'}}>
                {[{ val: `Top ${resumeRankPct}%`, lbl: 'Resume Rank', color: gradStart },{ val: `${keywordsHit}`, lbl: 'Keywords Hit', color: '#10b981' },{ val: atsGrade, lbl: 'ATS Grade', color: pillTxt }].map((s, i) => (
                  <div key={i} style={{background:'rgba(255,255,255,0.7)',border:`1px solid ${pillBdr}`,borderRadius:'10px',padding:'6px 4px',textAlign:'center',backdropFilter:'blur(4px)'}}>
                    <div style={{fontSize:'11px',fontWeight:800,color:s.color,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s.val}</div>
                    <div style={{fontSize:'7.5px',color:'#94a3b8',marginTop:'1px',fontWeight:600}}>{s.lbl}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:'auto',display:'flex',alignItems:'center',justifyContent:'center',gap:'7px',background:`linear-gradient(90deg,${gradStart}18,${gradEnd}18)`,border:`1.5px solid ${pillBdr}`,borderRadius:'20px',padding:'8px 10px',boxShadow:`0 2px 10px ${gradStart}18`}}>
                <span style={{width:'8px',height:'8px',borderRadius:'50%',flexShrink:0,background:`linear-gradient(135deg,${gradStart},${gradEnd})`,boxShadow:`0 0 6px ${gradStart}`}}/>
                <span style={{fontSize:'10px',fontWeight:700,color:pillTxt}}>{isExcellent ? '🏆 Excellent Match — Apply Now!' : isGood ? '✅ Strong Match — Ready to Apply!' : isFair ? '⚡ Average — Keep Improving' : '🔧 Needs Improvement'}</span>
              </div>
            </div>
          );
        })()}

        {/* Resume Metrics Card */}
        <div className="sd-card sd-metrics-card" style={{display:'flex',flexDirection:'column',boxSizing:'border-box',height:'100%'}}>
          <div className="sd-met-header"><span className="sd-met-header-title">📊 Resume Metrics</span></div>
          <div className="sd-met-grid" style={{flex:1,display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px',alignContent:'stretch'}}>
            {metricsToShow.slice(0, 6).map((m, i) => {
              const metricName = m.metric_type || m.name;
              const config = metricConfig[metricName] || metricConfig["RELEVANCE_SCORE"];
              const score = m.score || 70;
              const label = m.label || "Good";
              const circ = 2 * Math.PI * 22;
              const offset = circ - (score / 100) * circ;
              return (
                <div className="sd-met3" key={i} style={{ borderColor: config.ring, background: `linear-gradient(145deg, ${config.bg}, #fff)` }}>
                  <div className="sd-met3-left">
                    <div className="sd-met3-ico" style={{ background: config.bg, border: `1.5px solid ${config.ring}` }}>{config.icon}</div>
                    <div><div className="sd-met3-name">{config.name}</div><span className="sd-met3-label" style={{ color: config.accent, background: config.bg, border: `1px solid ${config.ring}` }}>{label}</span></div>
                  </div>
                  <div className="sd-met3-ring">
                    <svg width="54" height="54" viewBox="0 0 54 54">
                      <circle cx="27" cy="27" r="22" fill="none" stroke="#e8edff" strokeWidth="5"/>
                      <circle cx="27" cy="27" r="22" fill="none" stroke={config.accent} strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 27 27)"/>
                    </svg>
                    <div className="sd-met3-pct" style={{ color: config.accent }}>{score}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Learning Roadmap Card */}
        <div className="sd-card sd-ai-card sd-rl-card" style={{display:'flex',flexDirection:'column',boxSizing:'border-box',height:'100%'}}>
          <div className="sd-rl-header"><span className="sd-rl-ico">🗺️</span><span className="sd-rl-title">Learning Roadmap</span></div>
          <div className="sd-rl-list" style={{overflowY:'auto',flex:1}}>
            {(() => {
              const roadmapNames = roadmap.map(r => (r.skill_name || '').toLowerCase());
              const extraFromMissing = missingSkills.filter(s => !roadmapNames.includes((s.skill_name || '').toLowerCase())).map(s => ({ skill_name: s.skill_name, youtube_link: null, google_link: null }));
              const fullList = [...roadmap, ...extraFromMissing];
              if (fullList.length === 0) return <div className="sd-rl-row"><span className="sd-rl-name">No missing skills found!</span></div>;
              return fullList.map((item, i) => (
                <div className="sd-rl-row" key={i}>
                  <div className="sd-rl-skill"><span className="sd-rl-name">🔹 {item.skill_name}</span></div>
                  <div className="sd-rl-btns">
                    <a href={item.youtube_link || `https://www.youtube.com/results?search_query=${encodeURIComponent((item.skill_name || '') + ' tutorial')}`} target="_blank" rel="noopener noreferrer" className="sd-rl-btn sd-rl-btn--y">▶ YouTube</a>
                    <a href={item.google_link || `https://www.google.com/search?q=${encodeURIComponent((item.skill_name || '') + ' learn')}`} target="_blank" rel="noopener noreferrer" className="sd-rl-btn sd-rl-btn--g">🔍 Google</a>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* AI Resume Detector Card - WITH resumeText prop */}
        <AIResumeDetectorCard 
          atsScore={atsScore} 
          resumeMetrics={metricsToShow} 
          analysisId={analysisData?.id || null} 
          initialDetection={detectionData}
          initialResumeText={resumeText}
        />
      </div>

      {/* ROW 2 */}
      <div className="sd-row sd-r2" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',alignItems:'stretch'}}>
        <div className="sd-card sd-radar-card" style={{display:'flex',flexDirection:'column',boxSizing:'border-box',height:'100%'}}>
          <div className="sd-ctitle">Skill Strength Radar</div>
          <RadarChart skills={skills} />
          <div className="sd-radar-leg"><div className="sd-leg-item"><div className="sd-leg-line sd-solid"></div><span>Your Score</span></div><div className="sd-leg-item"><div className="sd-leg-line sd-dash"></div><span>Industry Avg</span></div></div>
        </div>

        <div className="sd-card sd-tips-card" style={{display:'flex',flexDirection:'column',boxSizing:'border-box',height:'100%'}}>
          <div className="sd-ctitle">Quick Improvement Tips</div>
          <div className="sd-csub">Based on your skills and experience</div>
          <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
            {tips.length > 0 ? tips.map((t, i) => (
              <div className="sd-tip-row" key={i}><div className="sd-tip-left"><span className="sd-tip-txt">💡 {t.title}</span></div><span className="sd-tip-imp">{t.impact_percentage > 0 ? `+${t.impact_percentage}%` : ""}</span></div>
            )) : (
              <>
                <div className="sd-tip-row"><div className="sd-tip-left"><span className="sd-tip-txt">💡 Add more quantifiable achievements</span></div><span className="sd-tip-imp">+15% impact</span></div>
                <div className="sd-tip-row"><div className="sd-tip-left"><span className="sd-tip-txt">💡 Include more action verbs</span></div><span className="sd-tip-imp">+10% impact</span></div>
                <div className="sd-tip-row"><div className="sd-tip-left"><span className="sd-tip-txt">💡 Highlight relevant certifications</span></div><span className="sd-tip-imp">+12% impact</span></div>
                <div className="sd-tip-row"><div className="sd-tip-left"><span className="sd-tip-txt">💡 Improve keyword matching</span></div><span className="sd-tip-imp">+14% impact</span></div>
                <div className="sd-tip-row"><div className="sd-tip-left"><span className="sd-tip-txt">💡 Add leadership experiences</span></div><span className="sd-tip-imp">+8% impact</span></div>
              </>
            )}
          </div>
        </div>

        <div className="sd-card sd-qual-card sd-qual-v2" style={{display:'flex',flexDirection:'column',boxSizing:'border-box',height:'100%'}}>
          <div className="sd-qv2-header">
            <div className="sd-qv2-badge">
              <div className="sd-qv2-badge-ring">
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#dcfce7" strokeWidth="6"/>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="url(#qGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2*Math.PI*26}`} strokeDashoffset={`${2*Math.PI*26*(1-0.92)}`} transform="rotate(-90 32 32)"/>
                  <defs><linearGradient id="qGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#4ade80"/></linearGradient></defs>
                </svg>
              </div>
              <div className="sd-qv2-badge-score">{atsScore}%</div>
            </div>
            <div className="sd-qv2-title-block">
              <div className="sd-qv2-title">Resume Quality</div>
              <div className="sd-qv2-subtitle">Based on skills & experience</div>
              <div className="sd-qv2-status-row"><span className="sd-qv2-dot" /><span className="sd-qv2-status-txt">{atsScore >= 70 ? "Top 10% of resumes" : "Good improvement possible"}</span></div>
            </div>
          </div>
          <div className="sd-qv2-divider"/>
          <div className="sd-qv2-grid" style={{flex:1}}>
            {[
              { lbl: "Clarity", v: Math.min(95, atsScore + 5), icon: "✏️", c: "#6366f1", bg: "#eef2ff", bar: "#a5b4fc" },
              { lbl: "Impact", v: Math.min(90, atsScore + 2), icon: "⚡", c: "#f59e0b", bg: "#fff7ed", bar: "#fdba74" },
              { lbl: "Structure", v: Math.min(92, atsScore + 3), icon: "🏗️", c: "#06b6d4", bg: "#ecfeff", bar: "#67e8f9" },
              { lbl: "Readability", v: Math.min(93, atsScore + 4), icon: "📖", c: "#22c55e", bg: "#f0fdf4", bar: "#86efac" },
              { lbl: "Professionalism", v: Math.min(94, atsScore + 5), icon: "💼", c: "#8b5cf6", bg: "#f5f3ff", bar: "#c4b5fd" },
              { lbl: "ATS Readiness", v: atsScore, icon: "🤖", c: "#ec4899", bg: "#fdf2f8", bar: "#f9a8d4" },
            ].map((m, i) => (
              <div className="sd-qv2-tile" key={i} style={{ background: m.bg, borderColor: m.bar }}>
                <div className="sd-qv2-tile-top"><span className="sd-qv2-tile-icon">{m.icon}</span><span className="sd-qv2-tile-val" style={{ color: m.c }}>{m.v}%</span></div>
                <div className="sd-qv2-tile-lbl">{m.lbl}</div>
                <div className="sd-qv2-tile-bar-track"><div className="sd-qv2-tile-bar-fill" style={{ width: `${m.v}%`, background: m.c }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="sd-card sd-jm-card" style={{display:'flex',flexDirection:'column',boxSizing:'border-box',height:'100%'}}>
          <div className="sd-ctitle">Job Match Insights</div>
          <div className="sd-csub">Based on your skills and experience</div>
          <div className="sd-jm-body">
            <Ring size={100} sw={9} value={matchScore} color="#6366f1"><div className="sd-jm-pct">{matchScore}%</div><div className="sd-jm-sub">{matchScore >= 70 ? "Strong Match" : "Average Match"}</div></Ring>
            <div className="sd-jm-roles">
              <div className="sd-csub" style={{ marginBottom: 4 }}>Top Matching Roles</div>
              {jobMatches.length > 0 ? jobMatches.slice(0, 3).map((r, i) => (
                <div className="sd-role-row" key={i}><div className="sd-role-hd"><div className="sd-role-name">{r.role_name || "Full Stack Engineer"}</div><div className="sd-role-pct">{r.match_percentage}%</div></div><div className="sd-bar-track"><div className="sd-bar-fill" style={{ width: `${r.match_percentage}%`, background: "#6366f1" }}></div></div></div>
              )) : (<><div className="sd-role-row"><div className="sd-role-hd"><div className="sd-role-name">Software Developer</div><div className="sd-role-pct">75%</div></div><div className="sd-bar-track"><div className="sd-bar-fill" style={{ width: "75%", background: "#6366f1" }}></div></div></div><div className="sd-role-row"><div className="sd-role-hd"><div className="sd-role-name">Full Stack Developer</div><div className="sd-role-pct">70%</div></div><div className="sd-bar-track"><div className="sd-bar-fill" style={{ width: "70%", background: "#6366f1" }}></div></div></div></>)}
            </div>
          </div>
          <div className="sd-jm-divider" />
          <div className="sd-jm-why-title">📈 Market Demand</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: '8px' }}>
            <div className="sd-jm-stat"><div className="sd-jm-stat-val">{analysisData?.open_jobs > 0 ? `${analysisData.open_jobs}+` : "0+"}</div><div className="sd-jm-stat-lbl">Open Jobs</div></div>
            <div className="sd-jm-stat-sep" />
            <div className="sd-jm-stat"><div className="sd-jm-stat-val sd-jm-green">↑{analysisData?.growth_rate}{typeof analysisData?.growth_rate === 'number' ? '%' : ''}</div><div className="sd-jm-stat-lbl">Your Growth</div></div>
            <div className="sd-jm-stat-sep" />
            <div className="sd-jm-stat"><div className="sd-jm-stat-val">{analysisData?.salary_range || 'N/A'}</div><div className="sd-jm-stat-lbl">Avg Salary</div></div>
          </div>
        </div>
      </div>

      {/* ROW 3 */}
      <div className="sd-row sd-r3" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',alignItems:'stretch'}}>
        <div className="sd-card" style={{display:'flex',flexDirection:'column',boxSizing:'border-box',height:'100%',padding:'16px 18px'}}>
          <div style={{fontSize:'13px',fontWeight:700,color:'#1a1a2e',marginBottom:'2px',flexShrink:0}}>Career Impact Snapshot</div>
          <div style={{fontSize:'10px',color:'#94a3b8',marginBottom:'0',flexShrink:0}}>See how your skills translate to real-world opportunities.</div>
          {[
            { ico:'💼', bg:'#dcfce7', lbl:'Job Opportunities', val: openJobs > 0 ? `${openJobs}+` : jobMatches.length > 0 ? `${Math.floor(jobMatches[0].match_percentage*15)}+` : '1,240+', sub:'High match jobs', bar: Math.min(100, openJobs > 0 ? Math.min(openJobs / 50 * 100, 100) : 75), barColor: '#22c55e', trend: `${matchedSkills.length} skills matched`, trendColor: '#22c55e' },
            { ico:'💰', bg:'#dbeafe', lbl:'Average Salary Range', val: salaryRange !== 'N/A' ? salaryRange : `₹${Math.floor(atsScore*0.5)}\u2013₹${Math.floor(atsScore*1.2)} LPA`, sub:'For your target roles', bar: Math.min(100, atsScore), barColor: '#6366f1', trend: `Based on ${atsScore}% ATS match`, trendColor: '#6366f1' },
            { ico:'👁️', bg:'#ede9fe', lbl:'Profile Visibility', val: atsScore >= 70 ? 'Excellent' : atsScore >= 50 ? 'Good' : 'Fair', sub:'Improve to reach top 20%', green: atsScore >= 70, bar: atsScore, barColor: atsScore >= 70 ? '#22c55e' : atsScore >= 50 ? '#6366f1' : '#3b82f6', trend: `Top ${Math.max(1, Math.round(100 - atsScore * 0.68))}% of applicants`, trendColor: atsScore >= 70 ? '#22c55e' : '#1d4ed8' },
          ].map((m, i, arr) => (
            <div key={i} style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',gap:'3px',borderBottom: i < arr.length-1 ? '1px solid #f1f5f9' : 'none',paddingTop:'10px',paddingBottom:'10px',minHeight:0}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'2px'}}>
                <div style={{width:'30px',height:'30px',borderRadius:'8px',background:m.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px',flexShrink:0}}>{m.ico}</div>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:'9px',color:'#94a3b8',fontWeight:500}}>{m.lbl}</div><div style={{fontSize:'15px',fontWeight:800,color: m.green ? '#22c55e' : '#1a1a2e',lineHeight:1.1,wordBreak:'break-word'}}>{m.val}</div></div>
              </div>
              <div style={{height:'4px',background:'#f1f5f9',borderRadius:'4px',overflow:'hidden'}}><div style={{height:'100%',width:`${m.bar}%`,background:m.barColor,borderRadius:'4px'}}/></div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:'8.5px',color:m.trendColor,fontWeight:600}}>↑ {m.trend}</span><span style={{fontSize:'8px',color:'#94a3b8'}}>{m.sub}</span></div>
            </div>
          ))}
        </div>

        <div className="sd-card sd-skillgap-card" style={{display:'flex',flexDirection:'column',boxSizing:'border-box',height:'100%'}}>
          <div className="sd-sg-header"><div><div className="sd-ctitle">Skill Gap Breakdown</div><div className="sd-csub">Your resume vs job market requirements</div></div><div className="sd-sg-badge"><span className="sd-sg-badge-val">{gapScore}%</span><span className="sd-sg-badge-lbl">Gap Score</span></div></div>
          <div className="sd-sg-section"><div className="sd-sg-sec-head"><div className="sd-sg-sec-left"><div className="sd-sg-sec-dot sd-sg-dot--green" /><span className="sd-sg-sec-title">Matched Skills</span></div><span className="sd-sg-pill sd-sg-pill--green">{matchedSkills.length} skills</span></div><div className="sd-sg-tags">{matchedSkills.length > 0 ? matchedSkills.map((s, i) => (<span className="sd-sg-tag sd-sg-tag--green" key={i}>{s.skill_name}</span>)) : (<div style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 12px',background:'#fef3c7',border:'1.5px solid #fde68a',borderRadius:'10px',width:'100%',boxSizing:'border-box'}}><span style={{fontSize:'18px'}}>📋</span><div><div style={{fontSize:'12px',fontWeight:700,color:'#92400e'}}>No matched skills yet</div><div style={{fontSize:'10px',color:'#b45309',marginTop:'1px'}}>Try updating your resume with relevant keywords.</div></div></div>)}</div></div>
          <div className="sd-sg-section"><div className="sd-sg-sec-head"><div className="sd-sg-sec-left"><div className="sd-sg-sec-dot sd-sg-dot--red" /><span className="sd-sg-sec-title">Missing Skills</span></div><span className="sd-sg-pill sd-sg-pill--red">{missingSkills.length} skills</span></div><div className="sd-sg-tags">{missingSkills.length > 0 ? missingSkills.map((s, i) => (<span className="sd-sg-tag sd-sg-tag--red" key={i}>{s.skill_name}</span>)) : (<div style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 12px',background:'#f0fdf4',border:'1.5px solid #bbf7d0',borderRadius:'10px',width:'100%',boxSizing:'border-box'}}><span style={{fontSize:'18px'}}>🎉</span><div><div style={{fontSize:'12px',fontWeight:700,color:'#15803d'}}>No skill gaps found!</div><div style={{fontSize:'10px',color:'#16a34a',marginTop:'1px'}}>Your resume covers all required skills.</div></div></div>)}</div></div>
          {missingSkills.length > 0 ? (<div className="sd-sg-section sd-pm-section"><div className="sd-sg-sec-head"><div className="sd-sg-sec-left"><div className="sd-sg-sec-dot sd-sg-dot--purple" /><span className="sd-sg-sec-title">Priority Matrix</span></div></div><div className="sd-pm-grid">{missingSkills.slice(0, 3).map((skill, idx) => { const priority = idx === 0 ? "HIGH" : idx === 1 ? "MEDIUM" : "LOW"; const barWidth = idx === 0 ? 100 : idx === 1 ? 70 : 40; return (<div className="sd-pm-row" key={idx}><span className="sd-pm-name">{skill.skill_name}</span><div className={`sd-pm-bar-track ${priority === 'HIGH' ? 'sd-pm-high' : priority === 'MEDIUM' ? 'sd-pm-med' : 'sd-pm-low'}-track`}><div className={`sd-pm-bar-fill ${priority === 'HIGH' ? 'sd-pm-high' : priority === 'MEDIUM' ? 'sd-pm-med' : 'sd-pm-low'}-fill`} style={{ width: `${barWidth}%` }} /></div><span className={`sd-pm-label ${priority === 'HIGH' ? 'sd-pm-txt-high' : priority === 'MEDIUM' ? 'sd-pm-txt-med' : 'sd-pm-txt-low'}`}>{priority}</span></div>); })}</div></div>) : (<div className="sd-sg-section" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center',padding:'16px 0'}}><div style={{fontSize:'32px',marginBottom:'8px'}}>✨</div><div style={{fontSize:'13px',fontWeight:700,color:'#15803d'}}>You're fully job-ready!</div><div style={{fontSize:'11px',color:'#6b7280',marginTop:'4px'}}>No skill priorities needed — great match!</div></div></div>)}
        </div>

        <div className="sd-card sd-focus-card" style={{display:'flex',flexDirection:'column',boxSizing:'border-box',height:'100%'}}>
          <div className="sd-ctitle">Focus Areas to Improve</div>
          <div className="sd-csub">Skills that will create the biggest impact.</div>
          <div style={{flex:1,display:'flex',flexDirection:'column'}}>
            {focusAreas.length > 0 ? focusAreas.map((f, i) => (<div className="sd-focus-row" key={i} style={{flex:1,padding:'10px 0'}}><div className="sd-foc-body"><div className="sd-foc-title">🎯 {f.title}</div><div className="sd-foc-desc">{f.description}</div></div><span className={`sd-foc-badge ${f.priority === 'HIGH' ? 'sd-high' : f.priority === 'MEDIUM' ? 'sd-med' : 'sd-low'}`}>{f.priority} Impact</span></div>)) : (<><div className="sd-focus-row" style={{flex:1,padding:'10px 0'}}><div className="sd-foc-body"><div className="sd-foc-title">🎯 Add Key Project Experience</div><div className="sd-foc-desc">Include 2-3 more projects in your resume.</div></div><span className="sd-foc-badge sd-high">HIGH Impact</span></div><div className="sd-focus-row" style={{flex:1,padding:'10px 0'}}><div className="sd-foc-body"><div className="sd-foc-title">🎯 Use Stronger Action Verbs</div><div className="sd-foc-desc">Use stronger, industry-relevant action verbs.</div></div><span className="sd-foc-badge sd-med">MEDIUM Impact</span></div><div className="sd-focus-row" style={{flex:1,padding:'10px 0'}}><div className="sd-foc-body"><div className="sd-foc-title">🎯 Highlight Achievements</div><div className="sd-foc-desc">Quantify your achievements more.</div></div><span className="sd-foc-badge sd-low">LOW Impact</span></div></>)}
          </div>
        </div>

        <AICareerSuggestions suggestions={suggestions} />
      </div>
    </div>
  );
}