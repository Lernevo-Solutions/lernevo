import React, { useEffect, useState } from "react";
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
    <div className="sd-card sd-dg-card">
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
      <div className="sd-card sd-acs-card">
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

  const displayed = suggestions.filter(s => s.skill_name === activeSkill);

  return (
    <div className="sd-card sd-acs-card">
      <div className="sd-acs-header">
        <div>
          <div className="sd-acs-title">
            <span className="sd-acs-sparkle">✨</span>
            AI Career Suggestions
          </div>
          <div className="sd-acs-sub">Click a skill to see matching career roles</div>
        </div>
      </div>

      <div className="sd-acs-skills-row">
        {suggestions.map((s, i) => (
          <span
            key={i}
            onClick={() => setActiveSkill(s.skill_name)}
            className={`sd-acs-skill-pill sd-acs-pill--matched ${activeSkill === s.skill_name ? "sd-acs-pill--active" : ""}`}
          >
            💼 {s.skill_name}
          </span>
        ))}
      </div>

      <div className="sd-acs-map-list">
        {displayed.map((item, i) => (
          <div className="sd-acs-map-row" key={i}>
            <div className="sd-acs-map-skill">
              <div>
                <div className="sd-acs-map-skillname">{item.skill_name}</div>
                <div className="sd-acs-map-skilltype">✅ Recommended Fit</div>
              </div>
            </div>
            <div className="sd-acs-arrow">→</div>
            <div className="sd-acs-map-roles">
              <span className="sd-acs-map-role-tag" style={{ background: "#eef2ff", color: "#4f46e5", borderColor: "#c7d2fe" }}>
                {item.role_name || "Target Professional"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   AI Resume Detector Card Component
───────────────────────────────────── */
function AIResumeDetectorCard({ atsScore = 65, resumeMetrics = [] }) {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState(null);

  const getGrade = (score) => {
    if (score >= 85) return { label: "Excellent", color: "#22c55e", bg: "#dcfce7", border: "#bbf7d0" };
    if (score >= 70) return { label: "Good", color: "#3b82f6", bg: "#dbeafe", border: "#bfdbfe" };
    if (score >= 55) return { label: "Average", color: "#f59e0b", bg: "#fef3c7", border: "#fde68a" };
    return { label: "Needs Work", color: "#ef4444", bg: "#fee2e2", border: "#fecaca" };
  };

  const grade = getGrade(atsScore);

  const detectResume = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const avgMetricScore = resumeMetrics.length > 0
      ? Math.round(resumeMetrics.reduce((s, m) => s + (m.score || 70), 0) / resumeMetrics.length)
      : 70;

    const prompt = `You are an AI Resume Quality Detector. Based on these stats:
- ATS Score: ${atsScore}%
- Average Metric Score: ${avgMetricScore}%
- Grade: ${grade.label}

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "resume_type": "one of: Fresher | Mid-Level | Senior | Executive",
  "ai_written_probability": <number 0-100>,
  "human_written_probability": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "red_flags": ["flag 1", "flag 2"],
  "recommendation": "one sentence actionable recommendation"
}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(i => i.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      setError("Detection failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="sd-card sd-ai-detector-card">
      <div className="sd-aid-header">
        <span className="sd-aid-ico">🤖</span>
        <div>
          <div className="sd-aid-title">AI Resume Detector</div>
          <div className="sd-aid-sub">Detect resume type & quality</div>
        </div>
      </div>

      {/* Current Grade Badge */}
      <div className="sd-aid-grade" style={{ background: grade.bg, border: `1.5px solid ${grade.border}` }}>
        <span className="sd-aid-grade-label" style={{ color: grade.color }}>
          {atsScore}% — {grade.label}
        </span>
      </div>

      {!result && !loading && (
        <button className="sd-aid-btn" onClick={detectResume}>
          ✨ Analyze Resume
        </button>
      )}

      {loading && (
        <div className="sd-aid-loading">
          <div className="sd-aid-spinner" />
          <span>Detecting...</span>
        </div>
      )}

      {error && (
        <div className="sd-aid-error">
          ⚠️ {error}
          <button className="sd-aid-retry" onClick={detectResume}>Retry</button>
        </div>
      )}

      {result && (
        <div className="sd-aid-result">
          <div className="sd-aid-row">
            <span className="sd-aid-type-badge">📄 {result.resume_type}</span>
            <button className="sd-aid-retry-btn" onClick={detectResume}>↺</button>
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

          {result.strengths && (
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
   Main Dashboard Component
───────────────────────────────────── */
export default function Dashboard() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem('analysisResult');
    console.log("Stored data from localStorage:", storedData);
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log("Parsed analysis data:", parsedData);
        setAnalysisData(parsedData);
      } catch (e) {
        console.error("Failed to parse analysis data:", e);
      }
    }
    
    setLoading(false);
  }, []);

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

  // Extract data from analysis
  const atsScore = analysisData.ats_score || 65;
  const matchScore = analysisData.match_score || 60;
  const gapScore = analysisData.gap_score || 40;
  const skills = analysisData.skills || [];
  const matchedSkills = skills.filter(s => s.status === "MATCHED");
  const missingSkills = skills.filter(s => s.status === "MISSING");
  const roadmap = analysisData.learning_roadmaps || [];
  const tips = analysisData.improvement_tips || [];
  const focusAreas = analysisData.focus_areas || [];
  const suggestions = analysisData.career_suggestions || [];
  const jobMatches = analysisData.job_matches || [];
  
  // Get resume metrics from analysisData (if available)
  const resumeMetrics = analysisData.resume_metrics || [];

  // Default metrics if none from API
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

      {/* ROW 1: ATS Score · Metrics · Learning Roadmap */}
      <div className="sd-row sd-r1">

        <div className="sd-card sd-ats-card sd-ats-v2">
          <div className="sd-ats-stars" />
          <div className="sd-ats-blob sd-ats-blob1" />
          <div className="sd-ats-blob sd-ats-blob2" />
          <div className="sd-ats-v2-label">ATS Score</div>
          <div className="sd-ats-v2-ring">
            <Ring size={130} sw={11} value={atsScore} id="atsG2"
              gradient={[{ o: "0%", c: "#6366f1" }, { o: "50%", c: "#818cf8" }, { o: "100%", c: "#22c55e" }]}>
              <div className="sd-ats-v2-inner">
                <div className="sd-ats-v2-pct">{atsScore}%</div>
                <div className="sd-ats-v2-sub">Match</div>
              </div>
            </Ring>
          </div>
          <div className="sd-ats-v2-pill sd-ats-pill--good">
            <span className="sd-ats-v2-dot" />
            {atsScore >= 70 ? "Good Match" : atsScore >= 50 ? "Average Match" : "Needs Improvement"}
          </div>
        </div>

        <div className="sd-card sd-metrics-card">
          <div className="sd-met-header">
            <span className="sd-met-header-title">📊 Resume Metrics</span>
          </div>
          <div className="sd-met-grid">
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
                    <div className="sd-met3-ico" style={{ background: config.bg, border: `1.5px solid ${config.ring}` }}>
                      {config.icon}
                    </div>
                    <div>
                      <div className="sd-met3-name">{config.name}</div>
                      <span className="sd-met3-label" style={{ color: config.accent, background: config.bg, border: `1px solid ${config.ring}` }}>{label}</span>
                    </div>
                  </div>
                  <div className="sd-met3-ring">
                    <svg width="54" height="54" viewBox="0 0 54 54">
                      <circle cx="27" cy="27" r="22" fill="none" stroke="#e8edff" strokeWidth="5"/>
                      <circle cx="27" cy="27" r="22" fill="none"
                        stroke={config.accent} strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        transform="rotate(-90 27 27)"
                      />
                    </svg>
                    <div className="sd-met3-pct" style={{ color: config.accent }}>{score}%</div>
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
            {roadmap.length > 0 ? (
              roadmap.map((item, i) => (
                <div className="sd-rl-row" key={i}>
                  <div className="sd-rl-skill">
                    <span className="sd-rl-name">🔹 {item.skill_name}</span>
                  </div>
                  <div className="sd-rl-btns">
                    {item.youtube_link && (
                      <a href={item.youtube_link} target="_blank" rel="noopener noreferrer" className="sd-rl-btn sd-rl-btn--y">
                        ▶ YouTube
                      </a>
                    )}
                    {item.google_link && (
                      <a href={item.google_link} target="_blank" rel="noopener noreferrer" className="sd-rl-btn sd-rl-btn--g">
                        🔍 Google
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="sd-rl-row">
                <span className="sd-rl-name">No missing skills found! Ready to apply.</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Resume Detector Card */}
        <AIResumeDetectorCard atsScore={atsScore} resumeMetrics={metricsToShow} />
      </div>

      {/* ROW 2: Radar · Tips · Daily Goals · Job Match */}
      <div className="sd-row sd-r2">

        <div className="sd-card sd-radar-card">
          <div className="sd-ctitle">Skill Strength Radar</div>
          <RadarChart skills={skills} />
          <div className="sd-radar-leg">
            <div className="sd-leg-item"><div className="sd-leg-line sd-solid"></div><span>Your Score</span></div>
            <div className="sd-leg-item"><div className="sd-leg-line sd-dash"></div><span>Industry Avg</span></div>
          </div>
        </div>

        <div className="sd-card sd-tips-card">
          <div className="sd-ctitle">Quick Improvement Tips</div>
          <div className="sd-csub">Based on your skills and experience</div>
          {tips.length > 0 ? (
            tips.map((t, i) => (
              <div className="sd-tip-row" key={i}>
                <div className="sd-tip-left">
                  <span className="sd-tip-txt">💡 {t.title}</span>
                </div>
                <span className="sd-tip-imp">{t.impact_percentage || t.impact || ''}</span>
              </div>
            ))
          ) : (
            <>
              <div className="sd-tip-row"><div className="sd-tip-left"><span className="sd-tip-txt">💡 Add more quantifiable achievements</span></div><span className="sd-tip-imp">+15% impact</span></div>
              <div className="sd-tip-row"><div className="sd-tip-left"><span className="sd-tip-txt">💡 Include more action verbs</span></div><span className="sd-tip-imp">+10% impact</span></div>
              <div className="sd-tip-row"><div className="sd-tip-left"><span className="sd-tip-txt">💡 Highlight relevant certifications</span></div><span className="sd-tip-imp">+12% impact</span></div>
              <div className="sd-tip-row"><div className="sd-tip-left"><span className="sd-tip-txt">💡 Improve keyword matching</span></div><span className="sd-tip-imp">+14% impact</span></div>
              <div className="sd-tip-row"><div className="sd-tip-left"><span className="sd-tip-txt">💡 Add leadership experiences</span></div><span className="sd-tip-imp">+8% impact</span></div>
            </>
          )}
        </div>

        <DailyGoalsCard />

        <div className="sd-card sd-jm-card">
          <div className="sd-ctitle">Job Match Insights</div>
          <div className="sd-csub">Based on your skills and experience</div>
          <div className="sd-jm-body">
            <Ring size={100} sw={9} value={matchScore} color="#6366f1">
              <div className="sd-jm-pct">{matchScore}%</div>
              <div className="sd-jm-sub">{matchScore >= 70 ? "Strong Match" : "Average Match"}</div>
            </Ring>
            <div className="sd-jm-roles">
              <div className="sd-csub" style={{ marginBottom: 4 }}>Top Matching Roles</div>
              {jobMatches.length > 0 ? (
                jobMatches.slice(0, 3).map((r, i) => (
                  <div className="sd-role-row" key={i}>
                    <div className="sd-role-hd">
                      <div className="sd-role-name">{r.role_name}</div>
                      <div className="sd-role-pct">{r.match_percentage}%</div>
                    </div>
                    <div className="sd-bar-track">
                      <div className="sd-bar-fill" style={{ width: `${r.match_percentage}%`, background: "#6366f1" }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="sd-role-row"><div className="sd-role-hd"><div className="sd-role-name">Software Developer</div><div className="sd-role-pct">75%</div></div><div className="sd-bar-track"><div className="sd-bar-fill" style={{ width: "75%", background: "#6366f1" }}></div></div></div>
                  <div className="sd-role-row"><div className="sd-role-hd"><div className="sd-role-name">Full Stack Developer</div><div className="sd-role-pct">70%</div></div><div className="sd-bar-track"><div className="sd-bar-fill" style={{ width: "70%", background: "#6366f1" }}></div></div></div>
                </>
              )}
            </div>
          </div>
          <div className="sd-jm-divider" />
          <div className="sd-jm-why-title">📈 Market Demand</div>
          <div className="sd-jm-stats-row">
            <div className="sd-jm-stat"><div className="sd-jm-stat-val">1,240+</div><div className="sd-jm-stat-lbl">Open Jobs</div></div>
            <div className="sd-jm-stat-sep" />
            <div className="sd-jm-stat"><div className="sd-jm-stat-val sd-jm-green">↑{Math.floor(matchScore / 5)}%</div><div className="sd-jm-stat-lbl">Your Growth</div></div>
            <div className="sd-jm-stat-sep" />
            <div className="sd-jm-stat"><div className="sd-jm-stat-val">₹{Math.floor(atsScore * 1.5)} LPA</div><div className="sd-jm-stat-lbl">Avg Salary</div></div>
          </div>
        </div>
      </div>

      {/* ROW 3: Quality · Skill Gap · Focus */}
      <div className="sd-row sd-r3">

        <div className="sd-card sd-qual-card sd-qual-v2">
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
              <div className="sd-qv2-badge-score">{atsScore}%</div>
            </div>
            <div className="sd-qv2-title-block">
              <div className="sd-qv2-title">Resume Quality</div>
              <div className="sd-qv2-subtitle">Based on skills & experience</div>
              <div className="sd-qv2-status-row">
                <span className="sd-qv2-dot" />
                <span className="sd-qv2-status-txt">{atsScore >= 70 ? "Top 10% of resumes" : "Good improvement possible"}</span>
              </div>
            </div>
          </div>
          <div className="sd-qv2-divider"/>
          <div className="sd-qv2-grid">
            {[
              { lbl: "Clarity", v: Math.min(95, atsScore + 5), icon: "✏️", c: "#6366f1", bg: "#eef2ff", bar: "#a5b4fc" },
              { lbl: "Impact", v: Math.min(90, atsScore + 2), icon: "⚡", c: "#f59e0b", bg: "#fff7ed", bar: "#fdba74" },
              { lbl: "Structure", v: Math.min(92, atsScore + 3), icon: "🏗️", c: "#06b6d4", bg: "#ecfeff", bar: "#67e8f9" },
              { lbl: "Readability", v: Math.min(93, atsScore + 4), icon: "📖", c: "#22c55e", bg: "#f0fdf4", bar: "#86efac" },
              { lbl: "Professionalism", v: Math.min(94, atsScore + 5), icon: "💼", c: "#8b5cf6", bg: "#f5f3ff", bar: "#c4b5fd" },
              { lbl: "ATS Readiness", v: atsScore, icon: "🤖", c: "#ec4899", bg: "#fdf2f8", bar: "#f9a8d4" },
            ].map((m, i) => (
              <div className="sd-qv2-tile" key={i} style={{ background: m.bg, borderColor: m.bar }}>
                <div className="sd-qv2-tile-top">
                  <span className="sd-qv2-tile-icon">{m.icon}</span>
                  <span className="sd-qv2-tile-val" style={{ color: m.c }}>{m.v}%</span>
                </div>
                <div className="sd-qv2-tile-lbl">{m.lbl}</div>
                <div className="sd-qv2-tile-bar-track">
                  <div className="sd-qv2-tile-bar-fill" style={{ width: `${m.v}%`, background: m.c }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sd-card sd-skillgap-card">
          <div className="sd-sg-header">
            <div>
              <div className="sd-ctitle">Skill Gap Breakdown</div>
              <div className="sd-csub">Your resume vs job market requirements</div>
            </div>
            <div className="sd-sg-badge">
              <span className="sd-sg-badge-val">{gapScore}%</span>
              <span className="sd-sg-badge-lbl">Gap Score</span>
            </div>
          </div>

          <div className="sd-sg-section">
            <div className="sd-sg-sec-head">
              <div className="sd-sg-sec-left">
                <div className="sd-sg-sec-dot sd-sg-dot--green" />
                <span className="sd-sg-sec-title">Matched Skills</span>
              </div>
              <span className="sd-sg-pill sd-sg-pill--green">{matchedSkills.length} skills</span>
            </div>
            <div className="sd-sg-tags">
              {matchedSkills.length > 0 ? (
                matchedSkills.map((s, i) => (
                  <span className="sd-sg-tag sd-sg-tag--green" key={i}>{s.skill_name}</span>
                ))
              ) : (
                <span className="sd-sg-tag">No matched skills</span>
              )}
            </div>
          </div>

          <div className="sd-sg-section">
            <div className="sd-sg-sec-head">
              <div className="sd-sg-sec-left">
                <div className="sd-sg-sec-dot sd-sg-dot--red" />
                <span className="sd-sg-sec-title">Missing Skills</span>
              </div>
              <span className="sd-sg-pill sd-sg-pill--red">{missingSkills.length} skills</span>
            </div>
            <div className="sd-sg-tags">
              {missingSkills.length > 0 ? (
                missingSkills.map((s, i) => (
                  <span className="sd-sg-tag sd-sg-tag--red" key={i}>{s.skill_name}</span>
                ))
              ) : (
                <span className="sd-sg-tag">No missing skills!</span>
              )}
            </div>
          </div>

          {/* Priority Matrix Section */}
          {missingSkills.length > 0 && (
            <div className="sd-sg-section sd-pm-section">
              <div className="sd-sg-sec-head">
                <div className="sd-sg-sec-left">
                  <div className="sd-sg-sec-dot sd-sg-dot--purple" />
                  <span className="sd-sg-sec-title">Priority Matrix</span>
                </div>
                <span className="sd-sg-pill sd-sg-pill--purple">{missingSkills.length} skills</span>
              </div>
              <div className="sd-pm-grid">
                {missingSkills.slice(0, 3).map((skill, idx) => {
                  const priority = idx === 0 ? "HIGH" : idx === 1 ? "MEDIUM" : "LOW";
                  const barWidth = idx === 0 ? 100 : idx === 1 ? 70 : 40;
                  return (
                    <div className="sd-pm-row" key={idx}>
                      <span className="sd-pm-name">{skill.skill_name}</span>
                      <div className={`sd-pm-bar-track ${priority === 'HIGH' ? 'sd-pm-high' : priority === 'MEDIUM' ? 'sd-pm-med' : 'sd-pm-low'}-track`}>
                        <div className={`sd-pm-bar-fill ${priority === 'HIGH' ? 'sd-pm-high' : priority === 'MEDIUM' ? 'sd-pm-med' : 'sd-pm-low'}-fill`} style={{ width: `${barWidth}%` }} />
                      </div>
                      <span className={`sd-pm-label ${priority === 'HIGH' ? 'sd-pm-txt-high' : priority === 'MEDIUM' ? 'sd-pm-txt-med' : 'sd-pm-txt-low'}`}>{priority}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="sd-card sd-focus-card">
          <div className="sd-ctitle">Focus Areas to Improve</div>
          <div className="sd-csub">Skills that will create the biggest impact.</div>
          {focusAreas.length > 0 ? (
            focusAreas.map((f, i) => (
              <div className="sd-focus-row" key={i}>
                <div className="sd-foc-body">
                  <div className="sd-foc-title">🎯 {f.title}</div>
                  <div className="sd-foc-desc">{f.description}</div>
                </div>
                <span className={`sd-foc-badge ${f.priority === 'HIGH' ? 'sd-high' : f.priority === 'MEDIUM' ? 'sd-med' : 'sd-low'}`}>
                  {f.priority} Impact
                </span>
              </div>
            ))
          ) : (
            <>
              <div className="sd-focus-row"><div className="sd-foc-body"><div className="sd-foc-title">🎯 Add Key Project Experience</div><div className="sd-foc-desc">Include 2-3 more projects in your resume.</div></div><span className="sd-foc-badge sd-high">HIGH Impact</span></div>
              <div className="sd-focus-row"><div className="sd-foc-body"><div className="sd-foc-title">🎯 Use Stronger Action Verbs</div><div className="sd-foc-desc">Use stronger, industry-relevant action verbs.</div></div><span className="sd-foc-badge sd-med">MEDIUM Impact</span></div>
              <div className="sd-focus-row"><div className="sd-foc-body"><div className="sd-foc-title">🎯 Highlight Achievements</div><div className="sd-foc-desc">Quantify your achievements more.</div></div><span className="sd-foc-badge sd-low">LOW Impact</span></div>
            </>
          )}
        </div>
      </div>

      {/* ROW 4: Career Impact · AI Suggestions */}
      <div className="sd-row sd-r4">
        <div className="sd-card sd-career-card">
          <div className="sd-ctitle">Career Impact Snapshot</div>
          <div className="sd-csub">See how your skills translate to real-world opportunities.</div>
          <div className="sd-career-grid">
            <div className="sd-c-metric">
              <div className="sd-c-ico sd-gbg">💼</div>
              <div className="sd-c-lbl">Job Opportunities</div>
              <div className="sd-c-val">{jobMatches.length > 0 ? Math.floor(jobMatches[0].match_percentage * 15) : "1,240"}+</div>
              <div className="sd-c-sub">High match jobs</div>
            </div>
            <div className="sd-c-metric">
              <div className="sd-c-ico sd-bbg">💰</div>
              <div className="sd-c-lbl">Average Salary Range</div>
              <div className="sd-c-val">₹{Math.floor(atsScore * 0.5)} – ₹{Math.floor(atsScore * 1.2)} LPA</div>
              <div className="sd-c-sub">For your target roles</div>
            </div>
            <div className="sd-c-metric">
              <div className="sd-c-ico sd-pbg">👁️</div>
              <div className="sd-c-lbl">Profile Visibility</div>
              <div className={`sd-c-val ${atsScore >= 70 ? 'sd-c-good' : ''}`}>{atsScore >= 70 ? "Excellent" : atsScore >= 50 ? "Good" : "Fair"}</div>
              <div className="sd-c-sub">Improve to reach top 20%</div>
            </div>
          </div>
        </div>

        <AICareerSuggestions suggestions={suggestions} />
      </div>

    </div>
  );
}