import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "./Performance.css";

/* ---------- Sample data: 14 people in an IT company ---------- */
const SKILLS = ["Technical skills", "Quality of work", "Communication", "Teamwork", "Ownership"];
const QUARTERS = ["Q4 2025", "Q1 2026", "Q2 2026", "Q3 2026"];
const TOP = 4.3;
const LOW = 3.3;

// name, role, team, manager, skill ratings, goals %, on-time %, attendance %, last 3 quarters, review finished (1/0)
const RAW = [
  ["Arun", "Team Lead", "Support desk", "Priya", [4, 4, 5, 5, 4], 88, 95, 98, [3.9, 4.1, 4.2], 1],
  ["Meena", "Supervisor", "Quality", "Priya", [4, 5, 4, 4, 4], 92, 97, 99, [3.9, 4.0, 4.2], 1],
  ["Lakshmi", "Associate", "Support desk", "Priya", [3, 4, 4, 4, 3], 70, 90, 96, [3.3, 3.5, 3.6], 0],
  ["Hari", "Associate", "Engineering", "Vikram", [4, 4, 3, 4, 4], 75, 88, 96, [3.4, 3.6, 3.7], 1],
  ["Vikram", "Manager", "Engineering", "Leadership", [4, 3, 3, 3, 4], 55, 82, 94, [3.6, 3.4, 3.4], 0],
  ["Divya", "Executive", "Engineering", "Vikram", [5, 4, 4, 4, 5], 96, 95, 98, [3.8, 4.1, 4.3], 1],
  ["Suresh", "Executive", "Quality", "Priya", [3, 3, 4, 3, 3], 48, 80, 92, [3.2, 3.1, 3.1], 0],
  ["Bala", "Team Lead", "Engineering", "Vikram", [4, 4, 4, 5, 4], 85, 93, 97, [3.8, 3.9, 4.1], 1],
  ["Ravi", "Associate", "Support desk", "Priya", [3, 3, 3, 4, 3], 52, 84, 93, [3.1, 3.0, 3.2], 0],
  ["Sana", "Associate", "Support desk", "Priya", [3, 4, 5, 4, 3], 68, 91, 97, [3.5, 3.7, 3.8], 1],
  ["Karthik", "Associate", "Quality", "Priya", [4, 4, 4, 3, 4], 80, 92, 95, [3.6, 3.7, 3.8], 1],
  ["Priya", "Manager", "Support desk", "Leadership", [4, 4, 5, 4, 5], 90, 96, 99, [4.0, 4.1, 4.3], 1],
  ["Naveen", "Associate", "Engineering", "Vikram", [3, 3, 4, 4, 3], 60, 85, 94, [3.2, 3.3, 3.4], 0],
  ["Anita", "Executive", "Quality", "Priya", [5, 4, 4, 5, 4], 94, 98, 99, [4.0, 4.2, 4.3], 1],
];

const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const r1 = (n) => Math.round(n * 10) / 10;
const PEOPLE = RAW.map(([name, role, team, manager, ratings, goals, onTime, attendance, past, done], i) => ({
  id: i + 1, name, role, team, manager, ratings, goals, onTime, attendance, past, done: !!done, score: r1(avg(ratings)),
}));
const COMPANY_AVG = SKILLS.map((_, i) => r1(avg(PEOPLE.map((p) => p.ratings[i]))));
const PASTELS = ["#fdf3c7", "#fde0ea", "#e6e0fb", "#dbe8ff", "#d9f5e5", "#ffe6d2"];

const toneOf = (s) => (s >= TOP ? "#12a37a" : s >= 3.7 ? "#2f5bff" : s >= LOW ? "#d97706" : "#e5484d");
const verdictOf = (s) => (s >= TOP ? "Outstanding" : s >= 3.7 ? "Strong performer" : s >= LOW ? "Meets expectations" : "Needs support");
const skillWord = (v) => (v >= 5 ? "Excellent" : v >= 4 ? "Strong" : v >= 3 ? "Good" : "Needs work");
const uniq = (k) => [...new Set(PEOPLE.map((p) => p[k]))];
const MANAGERS = uniq("manager");
const TEAMS = uniq("team");

const CSS = `
.sa.ps{--ink:#14213d;--mut:#5b6b8c;--ln:#e1e8f7;--blue:#2f5bff;
  font-family:"Plus Jakarta Sans",system-ui,sans-serif;display:grid;gap:16px;width:100%;margin:0;padding:clamp(14px,2.2vw,28px);border-radius:0;background:#f7f9ff;color:var(--ink);font-size:14px;line-height:1.45}
.ps h1,.ps h2,.ps h3,.ps h4,.ps p{margin:0}
.ps-banner{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:space-between;padding:22px 26px;border-radius:20px;background:linear-gradient(120deg,#eaf0ff,#f6f3ff);border:1px solid var(--ln)}
.ps-banner h1{font-size:clamp(24px,3vw,30px);font-weight:800;letter-spacing:-.02em;color:#0f1b3d}
.ps-banner p{margin-top:4px;color:var(--mut);font-size:15px;max-width:60ch}
.ps-period{padding:8px 16px;border-radius:12px;background:#fff;border:1px solid var(--ln);font-weight:700;color:#1d3fd0}

.ps-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}
.ps-tile{display:flex;gap:14px;align-items:center;padding:18px 20px;border-radius:18px;background:#fff;border:1px solid var(--ln)}
.ps-ic{flex:none;width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:#eef2ff;font-size:21px}
.ps-tile span{display:block;color:var(--mut);font-weight:600;font-size:13.5px}
.ps-tile strong{display:block;font-size:28px;font-weight:800;line-height:1.15;color:#1d3fd0}
.ps-tile small{color:var(--mut);font-size:13px}

.ps-filters{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center}
.ps-fl{display:flex;align-items:center;gap:8px}
.ps-fl>span{color:var(--mut);font-size:12.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
.ps-fl label{display:flex;align-items:center;gap:8px;padding:5px 12px 5px 6px;border-radius:14px;background:#fff;border:1.5px solid var(--ln)}
.ps-fl i{font-style:normal;width:28px;height:28px;border-radius:9px;display:grid;place-items:center;background:#e0e8ff;color:#1d3fd0;font-size:13px}
.sa.ps .ps-fl select,.sa.ps .ps-sort{border:0;background:transparent;color:var(--ink);font-weight:700;font-size:15px;padding:6px 2px;cursor:pointer}
.sa.ps .ps-sort{border:1.5px solid var(--ln);background:#fff;border-radius:12px;padding:9px 12px;font-size:14px}

.ps-board{padding:14px;border-radius:20px;background:#fff;border:1px solid var(--ln)}
.ps-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:12px}
.ps-tabs{display:flex;padding:4px;border-radius:12px;background:#eef2ff}
.sa.ps .ps-tabs button{border:0;background:transparent;padding:9px 16px;border-radius:9px;font-weight:700;color:var(--mut)}
.sa.ps .ps-tabs button.on{background:#fff;color:#1d3fd0;box-shadow:0 1px 3px rgba(20,33,61,.12)}
.sa.ps .ps-search{flex:1 1 220px;max-width:340px;padding:11px 14px;border-radius:12px;border:1.5px solid var(--ln);font:inherit;color:var(--ink)}
.ps-bar .ps-sort{margin-left:auto}
.ps-scroll{overflow-x:auto}
.ps-grid{min-width:820px;display:grid;grid-template-columns:minmax(190px,1.5fr) 150px minmax(120px,1fr) 80px 100px 120px 120px;gap:10px;align-items:center}
.ps-head{padding:0 8px 8px}
.ps-head span{padding:8px 6px;border-radius:12px;background:#eef3ff;color:#4a5b82;font-weight:700;font-size:13px;text-align:center}
.ps-head span:first-child{background:none;text-align:left;font-size:14px}
.sa.ps .ps-row{width:100%;padding:9px 8px;border:0;border-top:1px solid #edf1fb;background:transparent;border-radius:14px;text-align:left;color:inherit;cursor:pointer;transition:background .15s}
.sa.ps .ps-row:hover{background:#f3f6ff}
.ps-who{display:flex;align-items:center;gap:12px;min-width:0}
.ps-av{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:13px;color:#33415f}
.ps-who strong{display:block;font-size:15px;color:#0f1b3d}.ps-who small{color:var(--mut);font-size:13px}
.ps-score{display:flex;align-items:center;justify-content:center;gap:8px}
.ps-score b{min-width:44px;padding:5px 10px;border-radius:10px;background:var(--c);color:#fff;text-align:center;font-size:14px}
.ps-score small{color:var(--mut);font-size:12px;line-height:1.2;max-width:70px}
.ps-pct{display:grid;gap:4px;justify-items:center;font-weight:700;font-size:13.5px}
.ps-pct .ps-track{width:100%}
.ps-num{text-align:center;font-weight:700;color:#1d3fd0;background:#eef3ff;border-radius:10px;padding:6px 4px;font-size:13.5px}
.ps-tr{display:flex;align-items:center;justify-content:center;gap:6px;font-weight:700;font-size:13px}
.ps-up{color:#0b7a57}.ps-dn{color:#b42318}.ps-eq{color:var(--mut)}
.ps-chip{justify-self:center;padding:4px 12px;border-radius:99px;font-size:12.5px;font-weight:700}
.ps-chip.ok{background:#dff5ea;color:#0b7a57}.ps-chip.wait{background:#fff1de;color:#b45309}
.ps-track{position:relative;height:10px;border-radius:9px;background:#edf1fb}
.ps-track i{display:block;height:100%;border-radius:9px;background:var(--c)}
.ps-track u{position:absolute;top:-4px;bottom:-4px;width:3px;border-radius:2px;background:#0f1b3d;text-decoration:none}
.ps-empty{padding:28px 10px;text-align:center;color:var(--mut)}

.ps-teams{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
.ps-team{padding:18px 20px;border-radius:16px;border:1px solid var(--ln);background:#fbfcff;display:grid;gap:10px}
.ps-team h3{font-size:18px;font-weight:800;color:#0f1b3d}
.ps-team .big{font-size:30px;font-weight:800;color:var(--c)}
.ps-team ul{margin:0;padding:0;list-style:none;display:grid;gap:4px;color:var(--mut);font-size:13.5px}
.sa.ps .ps-link{justify-self:start;border:0;background:#e0e8ff;color:#1d3fd0;font-weight:700;padding:8px 14px;border-radius:10px;cursor:pointer}

.ps-bg{position:fixed;inset:0;z-index:40;display:flex;justify-content:flex-end;background:rgba(15,27,61,.45)}
.ps-drawer{width:min(560px,100%);height:100%;overflow:auto;padding:20px;display:grid;gap:14px;align-content:start;background:#f4f6fc;animation:ps-in .25s ease-out}
@keyframes ps-in{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:none}}
.ps-dh{display:flex;align-items:center;gap:14px}
.ps-dh .ps-av{width:56px;height:56px;font-size:18px}
.ps-dh h2{font-size:22px;font-weight:800;color:#0f1b3d}.ps-dh p{color:var(--mut)}
.sa.ps .ps-x{margin-left:auto;width:38px;height:38px;border-radius:12px;border:1.5px solid var(--ln);background:#fff;font-size:18px;color:var(--ink);cursor:pointer}
.ps-hero{display:flex;gap:18px;align-items:center;padding:20px 22px;border-radius:20px;color:#fff;background:radial-gradient(circle at 90% 10%,rgba(124,92,255,.5),transparent 55%),#0f1b3d}
.ps-ring{flex:none;width:128px;height:128px}
.ps-badge{display:inline-block;padding:4px 12px;border-radius:99px;font-weight:800;font-size:13px;color:#fff}
.ps-hero p{margin-top:8px;color:#dbe4ff}
.ps-mini{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.ps-mini div{padding:12px 14px;border-radius:14px;background:#fff;border:1px solid var(--ln)}
.ps-mini span{display:block;color:var(--mut);font-size:12.5px;font-weight:600}.ps-mini strong{font-size:22px;color:#0f1b3d}
.ps-card{padding:18px 20px;border-radius:16px;background:#fff;border:1px solid var(--ln)}
.ps-card h3{font-size:16px;font-weight:800;color:#0f1b3d;margin-bottom:10px}
.ps-sk{display:grid;grid-template-columns:120px minmax(0,1fr) 96px;gap:10px;align-items:center;padding:7px 0;font-size:13.5px}
.ps-sk>span{text-align:right;color:var(--mut)}.ps-sk>span b{color:var(--ink)}
.ps-note{margin-top:8px;color:var(--mut);font-size:12.5px}
.ps-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ps-box{padding:14px 16px;border-radius:14px}.ps-box h4{margin-bottom:8px;font-size:14px}
.ps-box ul{margin:0;padding:0;list-style:none;display:grid;gap:6px;font-size:13.5px}
.ps-box li{display:flex;gap:8px}.ps-box li:before{flex:none;font-weight:800}
.ps-good{background:#eefaf4}.ps-good h4,.ps-good li:before{color:#0b7a57}.ps-good li:before{content:"✓"}
.ps-grow{background:#fff6e8}.ps-grow h4,.ps-grow li:before{color:#b45309}.ps-grow li:before{content:"↑"}
.ps-chart{width:100%;height:auto;display:block}
@media(max-width:560px){.ps-two{grid-template-columns:1fr}.ps-sk{grid-template-columns:1fr}.ps-sk>span{text-align:left}.ps-hero{flex-direction:column;align-items:flex-start}}
@media(prefers-reduced-motion:reduce){.ps-drawer{animation:none}.sa.ps .ps-row{transition:none}}

.ps .ps-banner{position:relative;overflow:hidden;color:#fff;border:0;background:radial-gradient(circle at 85% 0%,rgba(143,180,255,.55),transparent 45%),linear-gradient(115deg,#0b2a6f,#1746c4 60%,#7c5cff);box-shadow:0 14px 34px rgba(23,70,196,.28)}
.ps .ps-banner:after{content:"";position:absolute;right:-50px;bottom:-80px;width:240px;height:240px;border-radius:50%;border:34px solid rgba(255,255,255,.08)}
.ps .ps-banner h1{color:#fff}.ps .ps-banner p{color:#d6e2ff}
.ps .ps-period{position:relative;z-index:1;background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.3);color:#fff;backdrop-filter:blur(4px)}
.ps-tile{position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s}
.ps-tile:before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:linear-gradient(#2f5bff,#7c5cff)}
.ps-tile:nth-child(2):before{background:linear-gradient(#12a37a,#6ee7b7)}.ps-tile:nth-child(3):before{background:linear-gradient(#e5484d,#fca5a5)}.ps-tile:nth-child(4):before{background:linear-gradient(#d97706,#fcd34d)}
.ps-tile:hover{transform:translateY(-4px);box-shadow:0 16px 30px rgba(23,70,196,.14)}
.ps-board{box-shadow:0 10px 30px rgba(23,70,196,.08)}
.sa.ps .ps-row:hover{background:linear-gradient(90deg,#eef3ff,#f6f3ff);transform:translateX(3px)}
.ps-av{box-shadow:0 0 0 3px #fff,0 4px 10px rgba(20,33,61,.15)}
.ps-track i{background:linear-gradient(90deg,var(--c),color-mix(in srgb,var(--c) 60%,#fff));animation:ps-grow .7s ease-out}
@keyframes ps-grow{from{width:0}}
.ps-team{transition:transform .2s,box-shadow .2s;border-top:4px solid var(--c)}.ps-team:hover{transform:translateY(-4px);box-shadow:0 14px 28px rgba(23,70,196,.12)}
.ps-bg{backdrop-filter:blur(3px)}
.ps-drawer{box-shadow:-20px 0 50px rgba(15,27,61,.3)}
.ps-hero{box-shadow:0 14px 30px rgba(15,27,61,.3)}
.ps-rank{display:inline-block;margin-left:8px;padding:4px 12px;border-radius:99px;font-weight:800;font-size:13px;background:rgba(255,255,255,.16);color:#fff}
.ps-mini div{text-align:center;transition:transform .2s}.ps-mini div:hover{transform:translateY(-3px)}
.ps-radar{width:100%;max-width:320px;height:auto;display:block;margin:0 auto}
.ps-nav{display:flex;justify-content:space-between;gap:10px;position:sticky;bottom:-20px;padding:12px 0;background:linear-gradient(transparent,#f4f6fc 30%)}
.sa.ps .ps-nav button{flex:1;border:0;padding:12px;border-radius:12px;font-weight:700;cursor:pointer;color:#fff;background:linear-gradient(120deg,#1746c4,#2f6bff);box-shadow:0 6px 16px rgba(23,70,196,.3)}
.sa.ps.ps-portal{position:fixed;inset:0;z-index:2147483000;display:block;padding:0;margin:0;background:transparent;border-radius:0;width:auto}
.ps-drawer{padding-bottom:90px}
.sa.ps .ps-pn{margin-left:0;font-size:22px;line-height:1;font-weight:700;color:#1d3fd0}
.sa.ps .ps-dh .ps-pn:first-of-type{margin-left:auto}
.sa.ps .ps-dh .ps-pn+.ps-x:not(.ps-pn){margin-left:0}
.ps-radar{max-width:260px}
@media(prefers-reduced-motion:reduce){.ps-track i{animation:none}.ps-tile,.ps-team,.ps-mini div{transition:none}}
`;

function Spark({ points, color }) {
  const lo = Math.min(...points) - 0.1, hi = Math.max(...points) + 0.1;
  const pts = points.map((v, i) => `${i * 22 + 4},${22 - ((v - lo) / (hi - lo)) * 18}`).join(" ");
  return <svg width="70" height="26" viewBox="0 0 70 26" aria-hidden="true"><polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Ring({ score }) {
  const C = 2 * Math.PI * 54, len = (score / 5) * C;
  const stroke = score >= 3.7 && score < TOP ? "#7ea3ff" : toneOf(score);
  return (
    <svg viewBox="0 0 140 140" className="ps-ring" role="img" aria-label={`Overall score ${score.toFixed(1)} out of 5`}>
      <g transform="rotate(-90 70 70)">
        <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="14" />
        <circle cx="70" cy="70" r="54" fill="none" stroke={stroke} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${len} ${C - len}`} />
      </g>
      <text x="70" y="72" textAnchor="middle" fontSize="34" fontWeight="800" fill="#fff">{score.toFixed(1)}</text>
      <text x="70" y="92" textAnchor="middle" fontSize="12" fontWeight="600" fill="#b9c6ea">out of 5</text>
    </svg>
  );
}

function Trend({ points, color }) {
  const x = (i) => 40 + i * 80, y = (v) => 120 - ((v - 1) / 4) * 100, last = points.length - 1;
  return (
    <svg viewBox="0 0 320 165" className="ps-chart" role="img" aria-label={`Score by quarter: ${points.map((v, i) => `${QUARTERS[i]} ${v.toFixed(1)}`).join(", ")}`}>
      {[1, 2, 3, 4, 5].map((v) => <g key={v}><line x1="28" x2="300" y1={y(v)} y2={y(v)} stroke="#edf1fb" /><text x="14" y={y(v) + 4} fontSize="10" fill="#8a97b4" textAnchor="middle">{v}</text></g>)}
      <polyline points={points.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((v, i) => (
        <g key={QUARTERS[i]}>
          <circle cx={x(i)} cy={y(v)} r={i === last ? 7 : 5} fill={i === last ? color : "#fff"} stroke={color} strokeWidth="3" />
          <text x={x(i)} y={y(v) - 13} textAnchor="middle" fontSize="12" fontWeight="700" fill="#14213d">{v.toFixed(1)}</text>
          <text x={x(i)} y="150" textAnchor="middle" fontSize="11" fill="#5b6b8c">{QUARTERS[i]}</text>
        </g>
      ))}
    </svg>
  );
}

const Avatar = ({ p, cls = "ps-av" }) => <span className={cls} style={{ background: PASTELS[(p.id - 1) % PASTELS.length] }}>{p.name.slice(0, 2).toUpperCase()}</span>;
const Delta = ({ p }) => {
  const d = r1(p.score - p.past[2]);
  return <span className={`ps-tr ${d > 0 ? "ps-up" : d < 0 ? "ps-dn" : "ps-eq"}`}><Spark points={[...p.past, p.score]} color={toneOf(p.score)} />{d > 0 ? `▲ ${d.toFixed(1)}` : d < 0 ? `▼ ${Math.abs(d).toFixed(1)}` : "–"}</span>;
};

const SHORT = ["Technical", "Quality", "Comms", "Teamwork", "Ownership"];
function Radar({ p }) {
  const cx = 110, cy = 105, R = 70;
  const pt = (i, v) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return [cx + Math.cos(a) * R * (v / 5), cy + Math.sin(a) * R * (v / 5)]; };
  const poly = (vals) => vals.map((v, i) => pt(i, v).join(",")).join(" ");
  const color = toneOf(p.score);
  return (
    <svg viewBox="0 0 220 210" className="ps-radar" role="img" aria-label={`Skill shape of ${p.name}`}>
      {[1, 2, 3, 4, 5].map((v) => <polygon key={v} points={poly([v, v, v, v, v])} fill="none" stroke="#e1e8f7" />)}
      <polygon points={poly(COMPANY_AVG)} fill="none" stroke="#0f1b3d" strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points={poly(p.ratings)} fill={color} fillOpacity=".25" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {p.ratings.map((v, i) => { const [x, y] = pt(i, v), [lx, ly] = pt(i, 6.3); return <g key={i}><circle cx={x} cy={y} r="4" fill={color} /><text x={lx} y={ly + 3} textAnchor="middle" fontSize="10" fontWeight="700" fill="#5b6b8c">{SHORT[i]}</text></g>; })}
    </svg>
  );
}

function Detail({ p, onClose, onNav }) {
  const rank = [...PEOPLE].sort((a, b) => b.score - a.score).findIndex((x) => x.id === p.id) + 1;
  const color = toneOf(p.score);
  const d = r1(p.score - p.past[2]);
  const strong = SKILLS.filter((_, i) => p.ratings[i] >= 4);
  const weak = SKILLS.filter((_, i) => p.ratings[i] <= 3);
  return createPortal(
    <div className="sa ps ps-portal"><div className="ps-bg" onClick={onClose}>
      <aside className="ps-drawer" role="dialog" aria-modal="true" aria-label={`${p.name} performance`} onClick={(e) => e.stopPropagation()}>
        <div className="ps-dh">
          <Avatar p={p} />
          <div><h2>{p.name}</h2><p>{p.role}, {p.team} team. Reports to {p.manager}.</p></div>
          <button className="ps-x ps-pn" onClick={() => onNav(-1)} aria-label="Previous person">‹</button><button className="ps-x ps-pn" onClick={() => onNav(1)} aria-label="Next person">›</button><button className="ps-x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="ps-hero">
          <Ring score={p.score} />
          <div>
            <span className="ps-badge" style={{ background: color }}>{verdictOf(p.score)}</span><span className="ps-rank">🏅 Rank {rank} of {PEOPLE.length}</span>
            <p>{p.name} scored {p.score.toFixed(1)} out of 5 this quarter. {d > 0 ? `Up ${d.toFixed(1)}` : d < 0 ? `Down ${Math.abs(d).toFixed(1)}` : "No change"} from last quarter.</p>
          </div>
        </div>
        <div className="ps-mini">
          <div><span>Goals done</span><strong>{p.goals}%</strong></div>
          <div><span>On time</span><strong>{p.onTime}%</strong></div>
          <div><span>Attendance</span><strong>{p.attendance}%</strong></div>
        </div>
        <section className="ps-card"><h3>Skill shape</h3><Radar p={p} /><p className="ps-note">Coloured area is {p.name}. Dashed line is the company average.</p></section>
        <section className="ps-card">
          <h3>Skills</h3>
          {SKILLS.map((s, i) => (
            <div key={s} className="ps-sk">
              <b>{s}</b>
              <div className="ps-track" style={{ "--c": toneOf(p.ratings[i] + 0.3) }} role="img" aria-label={`${s}: ${p.ratings[i]} out of 5, company average ${COMPANY_AVG[i]}`}>
                <i style={{ width: `${(p.ratings[i] / 5) * 100}%` }} /><u style={{ left: `calc(${(COMPANY_AVG[i] / 5) * 100}% - 1px)` }} />
              </div>
              <span><b>{p.ratings[i]} / 5</b> {skillWord(p.ratings[i])}</span>
            </div>
          ))}
          <p className="ps-note">Black line shows the company average.</p>
        </section>
        <section className="ps-card"><h3>Score over time</h3><Trend points={[...p.past, p.score]} color={color} /></section>
        <div className="ps-two">
          <div className="ps-box ps-good"><h4>Strengths</h4><ul>{strong.length ? strong.map((s) => <li key={s}>Strong in {s.toLowerCase()}</li>) : <li>Keeps improving each quarter</li>}</ul></div>
          <div className="ps-box ps-grow"><h4>Areas to improve</h4><ul>{weak.length ? weak.map((s) => <li key={s}>Needs support in {s.toLowerCase()}</li>) : <li>Nothing urgent right now</li>}</ul></div>
        </div>
        {!p.done && <p className="ps-note">The manager has not finished this review yet.</p>}
      </aside>
    </div></div>,
    document.body
  );
}

export default function Performance() {
  const [manager, setManager] = useState("All");
  const [team, setTeam] = useState("All");
  const [tab, setTab] = useState("board");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("high");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    const k = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  const scoped = useMemo(() => PEOPLE.filter((p) => (manager === "All" || p.manager === manager) && (team === "All" || p.team === team)), [manager, team]);
  const shown = useMemo(() => {
    const list = scoped.filter((p) => `${p.name} ${p.role}`.toLowerCase().includes(q.trim().toLowerCase()));
    return [...list].sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : sort === "low" ? a.score - b.score : b.score - a.score));
  }, [scoped, q, sort]);

  const n = scoped.length;
  const mean = n ? r1(avg(scoped.map((p) => p.score))) : 0;
  const tiles = [
    ["📊", "Average score", mean.toFixed(1), `out of 5, across ${n} people`],
    ["🏆", "Top performers", scoped.filter((p) => p.score >= TOP).length, `score ${TOP} or higher`],
    ["🌱", "Need support", scoped.filter((p) => p.score < LOW).length, `score below ${LOW}`],
    ["⏳", "Reviews pending", scoped.filter((p) => !p.done).length, "manager has not finished"],
  ];
  const person = PEOPLE.find((p) => p.id === open);

  return (
    <div className="sa ps">
      <style>{CSS}</style>

      <header className="ps-banner">
        <div><h1>Performance</h1><p>See how every team and person is doing. Open anyone to see their full picture.</p></div>
        <span className="ps-period">Q3 2026, Jul to Sep</span>
      </header>

      <section className="ps-tiles" aria-label="Summary">
        {tiles.map(([ic, l, v, c]) => <div key={l} className="ps-tile"><span className="ps-ic" aria-hidden="true">{ic}</span><div><span>{l}</span><strong>{v}</strong><small>{c}</small></div></div>)}
      </section>

      <div className="ps-filters">
        <div className="ps-fl"><span>Manager</span><label><i aria-hidden="true">★</i>
          <select value={manager} onChange={(e) => setManager(e.target.value)} aria-label="Manager"><option value="All">All managers</option>{MANAGERS.map((m) => <option key={m}>{m}</option>)}</select></label></div>
        <div className="ps-fl"><span>Team</span><label><i aria-hidden="true">★</i>
          <select value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Team"><option value="All">All teams</option>{TEAMS.map((t) => <option key={t}>{t}</option>)}</select></label></div>
      </div>

      <section className="ps-board">
        <div className="ps-bar">
          <div className="ps-tabs" role="tablist">
            {[["board", "People board"], ["teams", "Teams"]].map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}
          </div>
          {tab === "board" && <>
            <input className="ps-search" type="search" placeholder="Search people" aria-label="Search people" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="ps-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
              <option value="high">Highest score first</option><option value="low">Lowest score first</option><option value="name">Name A to Z</option>
            </select>
          </>}
        </div>

        {tab === "board" ? (
          <div className="ps-scroll">
            <div className="ps-grid ps-head"><span>{shown.length} people</span><span>Overall score</span><span>Goals done</span><span>On time</span><span>Attendance</span><span>Trend</span><span>Review</span></div>
            {shown.length === 0 && <p className="ps-empty">No one matches. Clear the search or choose All teams.</p>}
            {shown.map((p) => (
              <button key={p.id} className="ps-row ps-grid" onClick={() => setOpen(p.id)} aria-label={`Open ${p.name}, score ${p.score.toFixed(1)}`}>
                <span className="ps-who"><Avatar p={p} /><span><strong>{p.name}</strong><small>{p.role}</small></span></span>
                <span className="ps-score" style={{ "--c": toneOf(p.score) }}><b>{p.score.toFixed(1)}</b><small>{verdictOf(p.score)}</small></span>
                <span className="ps-pct">{p.goals}%<span className="ps-track" style={{ "--c": p.goals >= 80 ? "#12a37a" : p.goals >= 60 ? "#2f5bff" : "#e5484d" }}><i style={{ width: `${p.goals}%` }} /></span></span>
                <span className="ps-num">{p.onTime}%</span>
                <span className="ps-num">{p.attendance}%</span>
                <Delta p={p} />
                <span className={`ps-chip ${p.done ? "ok" : "wait"}`}>{p.done ? "Reviewed" : "Pending"}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="ps-teams">
            {TEAMS.filter((t) => team === "All" || t === team).map((t) => {
              const m = scoped.filter((p) => p.team === t);
              if (!m.length) return null;
              const s = r1(avg(m.map((p) => p.score)));
              return (
                <div key={t} className="ps-team" style={{ "--c": toneOf(s) }}>
                  <h3>{t}</h3>
                  <div><span className="big">{s.toFixed(1)}</span> <small>out of 5, {verdictOf(s).toLowerCase()}</small></div>
                  <div className="ps-track"><i style={{ width: `${(s / 5) * 100}%` }} /></div>
                  <ul>
                    <li>{m.length} people</li>
                    <li>{m.filter((p) => p.score >= TOP).length} top performers, {m.filter((p) => p.score < LOW).length} need support</li>
                    <li>{Math.round(avg(m.map((p) => p.onTime)))}% of work delivered on time</li>
                  </ul>
                  <button className="ps-link" onClick={() => { setTeam(t); setTab("board"); }}>See people</button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {person && <Detail p={person} onClose={() => setOpen(null)} onNav={(d) => { if (!shown.length) return; const i = shown.findIndex((x) => x.id === open); setOpen(shown[(i + d + shown.length) % shown.length].id); }} />}
    </div>
  );
}