import React from "react";
import "./skilldashboard.css";

/* ── SVG Radar Chart ── */
function RadarChart() {
  const skills = [
    { label: "Python", value: 84, angle: 270 },
    { label: "SQL", value: 78, angle: 342 },
    { label: "Data Analysis", value: 85, angle: 54 },
    { label: "Machine Learning", value: 68, angle: 126 },
    { label: "Data Visualization", value: 61, angle: 198 },
    { label: "Communication", value: 66, angle: 270 - 72 },
  ];

  const cx = 80, cy = 80, r = 60;

  const toXY = (angle, radius) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const angles = [270, 342, 54, 126, 198, 270 - 72];
  const vals = [84, 78, 85, 68, 61, 66];
  const industryVals = [75, 70, 78, 72, 70, 72];

  const polygon = (values) =>
    values
      .map((v, i) => {
        const pt = toXY(angles[i], (v / 100) * r);
        return `${pt.x},${pt.y}`;
      })
      .join(" ");

  const gridLevels = [25, 50, 75, 100];

  return (
    <div className="radar-container">
      <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {gridLevels.map((lvl) => (
          <polygon
            key={lvl}
            points={angles.map((a) => {
              const pt = toXY(a, (lvl / 100) * r);
              return `${pt.x},${pt.y}`;
            }).join(" ")}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="0.8"
          />
        ))}

        {/* Spokes */}
        {angles.map((a, i) => {
          const pt = toXY(a, r);
          return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="#e2e8f0" strokeWidth="0.8" />;
        })}

        {/* Industry Avg */}
        <polygon
          points={polygon(industryVals)}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.2"
          strokeDasharray="3,2"
        />

        {/* Your Score */}
        <polygon
          points={polygon(vals)}
          fill="url(#radarFill)"
          stroke="#6366f1"
          strokeWidth="1.8"
        />

        {/* Labels */}
        {[
          { label: "Python", pct: "84%", angle: 270, offset: [0, -10] },
          { label: "SQL", pct: "78%", angle: 342, offset: [10, -4] },
          { label: "Data Analysis", pct: "85%", angle: 54, offset: [10, 4] },
          { label: "Machine Learning", pct: "68%", angle: 126, offset: [0, 10] },
          { label: "Data Visualization", pct: "61%", angle: 198, offset: [-16, 4] },
          { label: "Communication", pct: "66%", angle: 270 - 72, offset: [-16, -4] },
        ].map((item, i) => {
          const pt = toXY(item.angle, r + 14);
          return (
            <text
              key={i}
              x={pt.x + item.offset[0]}
              y={pt.y + item.offset[1]}
              textAnchor="middle"
              fontSize="7"
              fill="#374151"
              fontWeight="600"
            >
              {item.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* ===== TOP ROW ===== */}
      <div className="top-row">
        {/* ATS Score */}
        <div className="ats-card">
          <div className="ats-circle">
            <svg viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="atsGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <circle className="track" cx="45" cy="45" r="36" />
              <circle className="progress" cx="45" cy="45" r="36" />
            </svg>
            <div className="ats-center">
              <div className="pct">75%</div>
            </div>
          </div>
          <div className="ats-label">
            <h3>Overall ATS Match</h3>
            <div className="good-match">✦ Good Match</div>
          </div>
          <div className="ats-trend">
            <span className="up">▲ 5%</span> vs last scan
          </div>
        </div>

        {/* Metrics */}
        <div className="metrics-row">
          {[
            { icon: "⌨️", name: "Keyword Density", value: "70%", status: "Good", statusClass: "green", change: "12% vs last scan" },
            { icon: "📝", name: "Formatting", value: "90%", status: "Excellent", statusClass: "blue", change: "6% vs last scan" },
            { icon: "💼", name: "Experience Match", value: "65%", status: "Average", statusClass: "orange", change: "5% vs last scan" },
            { icon: "🤝", name: "Soft Skills", value: "78%", status: "Good", statusClass: "green", change: "2% vs last scan" },
          ].map((m, i) => (
            <div className="metric-item" key={i}>
              <div className="metric-icon">{m.icon}</div>
              <div className="metric-name">{m.name}</div>
              <div className="metric-value">{m.value}</div>
              <div className={`metric-status ${m.statusClass}`}>{m.status}</div>
              <div className="metric-change">
                <span className="arrow-up">▲</span> {m.change}
              </div>
            </div>
          ))}
        </div>

        {/* AI Summary */}
        <div className="ai-summary-card">
          <div className="ai-summary-header">
            <span className="ai-robot">🤖</span>
            <span>AI Summary</span>
          </div>
          <div className="ai-summary-text">
            Your resume is strong focused on improving matching keywords, match and adding more action verbs.
          </div>
          <div className="ai-feedback-link">View AI Feedback →</div>
        </div>
      </div>

      {/* ===== SECOND ROW ===== */}
      <div className="second-row">
        {/* Skill Radar */}
        <div className="radar-card">
          <div className="card-title">Skill Strength Radar</div>
          <RadarChart />
          <div className="radar-legend">
            <div className="radar-legend-item">
              <div className="legend-dot solid"></div>
              <span>Your Score</span>
            </div>
            <div className="radar-legend-item">
              <div className="legend-dot dashed"></div>
              <span>Industry Avg</span>
            </div>
          </div>
          <span className="view-radar-link">View full radar →</span>
        </div>

        {/* Quick Improvement Tips */}
        <div className="tips-card">
          <div className="card-title">Quick Improvement Tips</div>
          <div className="card-subtitle">Based on your skills and experience</div>
          {[
            { icon: "✅", iconClass: "green", text: "Add more quantifiable achievements", impact: "+12% impact" },
            { icon: "💬", iconClass: "blue", text: "Include more action verbs", impact: "+8% impact" },
            { icon: "🏆", iconClass: "purple", text: "Highlight relevant certifications", impact: "+10% impact" },
            { icon: "🔑", iconClass: "orange", text: "Improve keyword matching", impact: "+14% impact" },
          ].map((tip, i) => (
            <div className="tip-item" key={i}>
              <div className="tip-left">
                <div className={`tip-icon ${tip.iconClass}`}>{tip.icon}</div>
                <div className="tip-text">{tip.text}</div>
              </div>
              <div className="tip-impact">{tip.impact}</div>
            </div>
          ))}
          <span className="view-all-link">View all tips →</span>
        </div>

        {/* Job Match Insights */}
        <div className="job-match-card">
          <div className="card-title">Job Match Insights</div>
          <div className="card-subtitle">Based on your skills and experience</div>
          <div className="job-match-content">
            <div className="job-match-circle">
              <svg viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
                <circle className="track" cx="45" cy="45" r="36" />
                <circle className="progress" cx="45" cy="45" r="36" />
              </svg>
              <div className="job-match-center">
                <div className="pct">82%</div>
                <div className="label">Strong Match</div>
              </div>
            </div>
            <div className="job-roles">
              <div className="card-subtitle" style={{ marginBottom: "4px" }}>Top Matching Roles</div>
              {[
                { name: "Data Analyst", pct: 82 },
                { name: "Business Analyst", pct: 78 },
                { name: "Data Scientist", pct: 73 },
              ].map((role, i) => (
                <div className="job-role-item" key={i}>
                  <div className="job-role-header">
                    <div className="job-role-name">
                      <span className="dot"></span>
                      {role.name}
                    </div>
                    <div className="job-role-pct">{role.pct}%</div>
                  </div>
                  <div className="job-role-bar">
                    <div className="job-role-fill" style={{ width: `${role.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <span className="view-jobs-link">View matching jobs →</span>
        </div>
      </div>

      {/* ===== THIRD ROW ===== */}
      <div className="third-row">
        {/* Resume Quality */}
        <div className="quality-card">
          <div className="card-title">Resume Quality Score</div>
          <div className="card-subtitle">Based on your skills and experience</div>
          <div className="quality-circle-wrap">
            <div className="quality-circle">
              <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                <circle className="track" cx="36" cy="36" r="30" />
                <circle className="progress" cx="36" cy="36" r="30" />
              </svg>
              <div className="quality-center">
                <div className="pct">92%</div>
                <div className="label">Strong Quality</div>
              </div>
            </div>
            <div className="quality-bars">
              {[
                { label: "Clarity", val: 92 },
                { label: "Impact", val: 90 },
                { label: "Layout", val: 90 },
                { label: "Relevance", val: 92 },
              ].map((b, i) => (
                <div className="quality-bar-row" key={i}>
                  <div className="quality-bar-label">{b.label}</div>
                  <div className="quality-bar-track">
                    <div className="quality-bar-fill" style={{ width: `${b.val}%` }}></div>
                  </div>
                  <div className="quality-bar-val">{b.val}%</div>
                </div>
              ))}
            </div>
          </div>
          <span className="view-quality-link">View full quality →</span>
        </div>

        {/* Personalized Learning Path + Activity Feed */}
        <div className="learning-card">
          <div className="card-title">Personalized Learning Path</div>
          <div className="learning-subtext">Step-by-step to reach your next career goal.</div>
          <button className="start-btn">Start</button>

          <div className="activity-section-title">Activity Feed</div>
          <div className="activity-sub">Your recent learning activity.</div>
          {[
            { icon: "📄", text: "Resume reviewed successfully", time: "2 hours ago" },
            { icon: "🔍", text: "Skills analysis completed", time: "2 hours ago" },
            { icon: "🤖", text: "AI feedback generated", time: "1 hour ago" },
            { icon: "🗺️", text: "Roadmap updated", time: "30 mins ago" },
          ].map((a, i) => (
            <div className="activity-item" key={i}>
              <div className="activity-left">
                <div className="activity-icon">{a.icon}</div>
                <div className="activity-text">{a.text}</div>
              </div>
              <div className="activity-time">{a.time}</div>
            </div>
          ))}
          <span className="view-activity-link">View full activity →</span>
        </div>

        {/* Focus Areas to Improve */}
        <div className="focus-card">
          <div className="card-title">Focus Areas to Improve</div>
          <div className="card-subtitle">Skills that will create the biggest impact.</div>
          {[
            {
              icon: "🧪",
              title: "Add Key Project Experience",
              desc: "Include 2-3 more projects in your resume.",
              badge: "High Impact",
              badgeClass: "high",
            },
            {
              icon: "⚡",
              title: "Use Stronger Action Verbs",
              desc: "Use stronger, industry-relevant action verbs.",
              badge: "Medium Impact",
              badgeClass: "medium",
            },
            {
              icon: "🏅",
              title: "Highlight Achievements",
              desc: "Quantify your achievements more.",
              badge: "Low Impact",
              badgeClass: "low",
            },
          ].map((f, i) => (
            <div className="focus-item" key={i}>
              <div className="focus-icon">{f.icon}</div>
              <div className="focus-content">
                <div className="focus-title">{f.title}</div>
                <div className="focus-desc">{f.desc}</div>
              </div>
              <div className={`focus-badge ${f.badgeClass}`}>{f.badge}</div>
            </div>
          ))}
          <span className="see-tips-link">See improvement tips →</span>
        </div>
      </div>

      {/* ===== BOTTOM ROW ===== */}
      <div className="bottom-row">
        {/* Career Impact Snapshot */}
        <div className="career-card">
          <div className="card-title">Career Impact Snapshot</div>
          <div className="card-subtitle">See how your skills translate to real-world opportunities.</div>
          <div className="career-metrics">
            <div className="career-metric">
              <div className="career-metric-icon green-bg">💼</div>
              <div className="career-metric-label">Job Opportunities</div>
              <div className="career-metric-value">1,240+</div>
              <div className="career-metric-sub">High match jobs</div>
            </div>
            <div className="career-metric">
              <div className="career-metric-icon blue-bg">💰</div>
              <div className="career-metric-label">Average Salary Range</div>
              <div className="career-metric-value">₹8 - ₹18 LPA</div>
              <div className="career-metric-sub">For your target roles</div>
            </div>
            <div className="career-metric">
              <div className="career-metric-icon purple-bg">👁️</div>
              <div className="career-metric-label">Profile Visibility</div>
              <div className="career-metric-value">
                <span className="career-metric-status green">Good</span>
              </div>
              <div className="career-metric-sub">Improve to reach top 20%</div>
            </div>
          </div>
        </div>

        {/* AI Roadmap */}
        <div className="roadmap-card">
          <div className="card-title">Your AI Roadmap</div>
          <div className="roadmap-header">
            <div className="roadmap-icon">🏆</div>
            <div>
              <div className="roadmap-level">Completion Level: Moderate</div>
              <div className="roadmap-sub">You're ahead of 40% peers.</div>
            </div>
          </div>
          <div className="roadmap-skills">
            {[
              { name: "Python", fillClass: "fill-python" },
              { name: "SQL", fillClass: "fill-sql" },
              { name: "Machine Learning", fillClass: "fill-ml" },
              { name: "Data Visualization", fillClass: "fill-dv" },
            ].map((skill, i) => (
              <div className="roadmap-skill" key={i}>
                <div className="roadmap-skill-header">
                  <div className="roadmap-skill-name">{skill.name}</div>
                </div>
                <div className="roadmap-skill-bar">
                  <div className={`roadmap-skill-fill ${skill.fillClass}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
