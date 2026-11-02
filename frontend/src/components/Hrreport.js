import { useMemo, useRef, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Filler } from "chart.js";
import { AlertTriangle, Brain, Briefcase, CalendarCheck, CalendarClock, CheckCircle2, ChevronRight, LayoutDashboard, Printer, UserMinus, Wallet } from "lucide-react";
import { buildReportData } from "./Hrreportsdata";
import "./Hrreport.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Filler);
ChartJS.defaults.font.family = '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif';
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = "#6b7a99";

/* ---------- look & feel ---------- */
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "attendance", label: "Attendance & Schedule", icon: CalendarClock },
  { id: "leave", label: "Leave", icon: CalendarCheck },
  { id: "payroll", label: "Payroll", icon: Wallet },
  { id: "performance", label: "Performance & Goals", icon: Brain },
  { id: "hiring", label: "Hiring", icon: Briefcase },
  { id: "exits", label: "Exits", icon: UserMinus },
];
const MODULE_COLOR = { Scheduler: "#0e9fbc", Timesheets: "#20a889", Leave: "#8a5cf6", Payslips: "#e79a28", Performance: "#315efb", Goals: "#e16a9a", "Job Portal": "#d9622b", Offboarding: "#64748b" };
const C = { blue: "#315efb", green: "#08a66a", teal: "#20a889", amber: "#f28a26", red: "#e5484d", violet: "#8a5cf6", pink: "#e16a9a", slate: "#94a3b8", grid: "#eef1f8" };
const SEVERITY = { high: "Urgent", med: "Soon", low: "Routine" };

const r1 = (n) => Math.round(n * 10) / 10;
const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const inrShort = (n) => (n >= 1e5 ? `₹${(n / 1e5).toFixed(2).replace(/\.?0+$/, "")} L` : inr(n));
const hue = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);
const initials = (n) => String(n).split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
const niceDate = (k) => new Date(`${k}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const tone = (s) => ({
  Approved: "good", Paid: "good", Sent: "good", Generated: "good", Completed: "good", Hired: "good", Active: "good", Relieved: "good", Open: "good", Shortlisted: "info",
  Pending: "warn", "Pending approval": "warn", Processing: "warn", "Not Sent": "muted", Applied: "info", Upcoming: "info", Clearance: "info", "Notice period": "warn", "At Risk": "warn", "On Track": "info",
  Rejected: "bad", Failed: "bad", "Missing timesheet": "bad", "Missing payroll data": "bad", Closed: "muted", "Not Started": "muted",
}[s] || "muted");

const axes = (extra = {}) => ({
  x: { grid: { display: false }, border: { display: false }, ...(extra.x || {}) },
  y: { beginAtZero: true, grid: { color: C.grid }, border: { display: false }, ticks: { precision: 0 }, ...(extra.y || {}) },
});
const barOpts = (extra) => ({ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: axes(extra) });
const ringOpts = { responsive: true, maintainAspectRatio: false, cutout: "70%", plugins: { legend: { display: false } } };

/* ---------- small building blocks ---------- */
const Avatar = ({ name }) => <i className="hr-avatar" style={{ "--h": hue(name) }}>{initials(name)}</i>;
const Pill = ({ children, kind }) => <span className={`hr-pill hr-${kind || tone(children)}`}>{children}</span>;
const ModuleChip = ({ name }) => <span className="hr-chip"><b style={{ background: MODULE_COLOR[name] }} />{name}</span>;

function Card({ title, hint, right, children, className = "" }) {
  return (
    <section className={`hr-card ${className}`}>
      {(title || right) && (
        <header className="hr-card-head">
          <div><h3>{title}</h3>{hint && <p>{hint}</p>}</div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

function Kpis({ items }) {
  return (
    <div className="hr-kpis">
      {items.map((k) => (
        <article key={k.label} className={`hr-kpi ${k.tone ? `hr-t-${k.tone}` : ""}`}>
          <span>{k.label}</span>
          <strong>{k.value}</strong>
          {k.sub && <small>{k.sub}</small>}
        </article>
      ))}
    </div>
  );
}

function Legend({ items }) {
  return (
    <ul className="hr-legend">
      {items.map((i) => (
        <li key={i.label}><b style={{ background: i.color }} /><span>{i.label}</span><em>{i.value}</em></li>
      ))}
    </ul>
  );
}

function Ring({ items, colors, center, centerLabel }) {
  const data = { labels: items.map((i) => i.label), datasets: [{ data: items.map((i) => i.value), backgroundColor: colors, borderWidth: 3, borderColor: "#fff" }] };
  return (
    <div className="hr-ring">
      <div className="hr-ring-chart">
        <Doughnut data={data} options={ringOpts} />
        <div className="hr-ring-center"><strong>{center}</strong><span>{centerLabel}</span></div>
      </div>
      <Legend items={items.map((i, n) => ({ ...i, color: colors[n % colors.length] }))} />
    </div>
  );
}

function Meter({ value, color = C.blue }) {
  return <span className="hr-meter"><i style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} /></span>;
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="hr-seg" role="group">
      {options.map(([v, l]) => <button key={v} type="button" className={value === v ? "on" : ""} aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  );
}

function Table({ cols, rows, empty = "Nothing to show yet." }) {
  if (!rows.length) return <p className="hr-empty">{empty}</p>;
  return (
    <div className="hr-table-wrap">
      <table className="hr-table">
        <thead><tr>{cols.map((c) => <th key={c.h} className={c.right ? "r" : ""}>{c.h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={r.id ?? i}>{cols.map((c) => <td key={c.h} className={c.right ? "r" : ""}>{c.cell(r)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/* =====================================================================
   OVERVIEW
   ===================================================================== */
function Overview({ d, go }) {
  const daily = d.attendance.daily;
  const lineData = {
    labels: daily.map((x) => x.label),
    datasets: [{ data: daily.map((x) => x.work), borderColor: C.teal, backgroundColor: "rgba(32,168,137,.12)", fill: true, tension: 0.35, pointRadius: 3, pointBackgroundColor: "#fff", pointBorderColor: C.teal, borderWidth: 2 }],
  };
  const deptColors = [C.blue, C.violet, C.teal, C.amber, C.pink, C.slate];
  const funnel = d.hiring.statusMix;
  const upcomingExit = d.exits.rows.filter((e) => !e.relievedOn).sort((a, b) => a.daysToLwd - b.daysToLwd);

  return (
    <>
      <div className="hr-grid hr-g-overview">
        <div className="hr-attention-wrap">
        <Card title="Needs attention" hint="Open items collected from every HR tab" right={<span className="hr-count">{d.attention.length}</span>} className="hr-attention">
          {d.attention.length === 0 ? (
            <div className="hr-allclear"><CheckCircle2 size={22} /><p>All clear. Nothing is waiting on HR right now.</p></div>
          ) : (
            <ul className="hr-todo">
              {d.attention.map((a, i) => (
                <li key={i}>
                  <button type="button" className={`hr-todo-row sev-${a.severity}`} onClick={() => go(a.tab)}>
                    <span className="hr-sev" title={SEVERITY[a.severity]} />
                    <span className="hr-todo-body">
                      <span className="hr-todo-top"><ModuleChip name={a.module} /><em>{SEVERITY[a.severity]}</em></span>
                      <strong>{a.title}</strong>
                      {a.detail && <small>{a.detail}</small>}
                    </span>
                    <ChevronRight size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        </div>

        <div className="hr-scorecard">
          {d.scorecard.map((s, i) => (
            <button type="button" key={s.module} className="hr-tile" style={{ "--accent": MODULE_COLOR[s.module], "--i": i }} onClick={() => go(s.tab)}>
              <ModuleChip name={s.module} />
              <strong>{s.value}</strong>
              <span>{s.label}</span>
              <Meter value={s.progress} color={MODULE_COLOR[s.module]} />
              <small>{s.caption}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="hr-grid hr-g3">
        <Card title="Staff working each day" hint="Last 14 days">
          <div className="hr-chart"><Line data={lineData} options={barOpts({ y: { suggestedMax: d.workforce.headcount } })} /></div>
        </Card>
        <Card title="People by department" hint={`${d.workforce.headcount} active employees`}>
          <Ring items={d.workforce.byDept} colors={deptColors} center={d.workforce.headcount} centerLabel="employees" />
        </Card>
        <Card title="Hiring pipeline" hint={`${d.hiring.applicants} applicants across ${d.hiring.openRoles} open roles`}>
          <div className="hr-chart">
            <Bar
              data={{ labels: funnel.map((f) => f.label), datasets: [{ data: funnel.map((f) => f.value), backgroundColor: [C.blue, C.violet, C.green, C.slate], borderRadius: 8, maxBarThickness: 38 }] }}
              options={barOpts()}
            />
          </div>
        </Card>
      </div>

      <div className="hr-grid hr-g3">
        <Card title="Next holidays">
          {d.leave.upcomingHolidays.length ? (
            <ul className="hr-rows">{d.leave.upcomingHolidays.map((h) => <li key={h.date}><span>{h.name}</span><em>{niceDate(h.date)}</em></li>)}</ul>
          ) : <p className="hr-empty">No upcoming holidays in the calendar.</p>}
        </Card>
        <Card title="Next last working days">
          {upcomingExit.length ? (
            <ul className="hr-rows">{upcomingExit.map((e) => <li key={e.id}><span>{e.name}<small>{e.designation}</small></span><em>{e.daysToLwd < 0 ? `${-e.daysToLwd}d overdue` : e.daysToLwd === 0 ? "Today" : `in ${e.daysToLwd}d`}</em></li>)}</ul>
          ) : <p className="hr-empty">No one is in their notice period.</p>}
        </Card>
        <Card title="Roles closing soon">
          {d.hiring.closingSoon.length ? (
            <ul className="hr-rows">{d.hiring.closingSoon.map((j) => <li key={j.id}><span>{j.title}<small>{j.applicants} applicants</small></span><em>{j.daysLeft === 0 ? "Today" : `in ${j.daysLeft}d`}</em></li>)}</ul>
          ) : <p className="hr-empty">No roles close in the next 7 days.</p>}
        </Card>
      </div>
    </>
  );
}

/* =====================================================================
   ATTENDANCE & SCHEDULE
   ===================================================================== */
function Attendance({ d }) {
  const [range, setRange] = useState("month");
  const s = d.attendance[range];
  const t = s.total;
  const daily = d.attendance.daily;
  const sc = d.scheduler;
  const stacked = {
    labels: daily.map((x) => x.label),
    datasets: [
      { label: "Working", data: daily.map((x) => x.work), backgroundColor: C.teal, borderRadius: 4 },
      { label: "On leave", data: daily.map((x) => x.leave), backgroundColor: C.violet, borderRadius: 4 },
      { label: "Missing timesheet", data: daily.map((x) => x.missing), backgroundColor: C.red, borderRadius: 4 },
    ],
  };
  return (
    <>
      <div className="hr-toolbar">
        <Segmented value={range} onChange={setRange} options={[["week", "This week"], ["month", "This month"]]} />
      </div>
      <Kpis items={[
        { label: "Attendance", value: `${t.attendance}%`, sub: "Worked + leave vs. expected", tone: t.attendance >= 95 ? "good" : "warn" },
        { label: "Hours logged", value: t.hours, sub: `${t.workDays} working days` },
        { label: "Overtime", value: `${t.ot} hrs`, sub: "Above standard hours" },
        { label: "Missing days", value: t.missing, sub: "No timesheet filed", tone: t.missing ? "bad" : "good" },
        { label: "Awaiting approval", value: t.pending, sub: "Days not yet signed off", tone: t.pending ? "warn" : "good" },
      ]} />

      <div className="hr-grid hr-g2">
        <Card title="Daily status" hint="Last 14 days, all employees">
          <div className="hr-chart tall">
            <Bar data={stacked} options={{ ...barOpts({ x: { stacked: true }, y: { stacked: true } }), plugins: { legend: { display: true, position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } } } }} />
          </div>
        </Card>
        <Card title="Attendance by team" hint={range === "week" ? "This week" : "This month"}>
          <div className="hr-chart tall">
            <Bar
              data={{ labels: s.perTeam.map((x) => x.name), datasets: [{ data: s.perTeam.map((x) => x.attendance), backgroundColor: s.perTeam.map((x) => (x.attendance >= 95 ? C.teal : C.amber)), borderRadius: 8, maxBarThickness: 44 }] }}
              options={barOpts({ y: { max: 100, ticks: { callback: (v) => `${v}%` } } })}
            />
          </div>
        </Card>
      </div>

      <Card title="Scheduler" hint={`${sc.week} plans in the next 7 days · ${sc.ackRate}% of past plans acknowledged`}>
        <div className="hr-grid hr-g3 flush">
          <div>
            <h4 className="hr-sub">Plans per day</h4>
            <div className="hr-chart"><Bar data={{ labels: sc.perDay.map((x) => x.label), datasets: [{ data: sc.perDay.map((x) => x.count), backgroundColor: MODULE_COLOR.Scheduler, borderRadius: 6, maxBarThickness: 30 }] }} options={barOpts()} /></div>
          </div>
          <div>
            <h4 className="hr-sub">By plan type</h4>
            <Ring items={sc.byType} colors={[C.blue, C.teal, C.violet, C.amber, C.pink, C.slate]} center={sc.week} centerLabel="plans" />
          </div>
          <div>
            <h4 className="hr-sub">Coming up</h4>
            {sc.upcoming.length ? (
              <ul className="hr-rows">{sc.upcoming.map((u, i) => <li key={i}><span>{u.title}<small>{u.who} · {u.type}</small></span><em>{niceDate(u.date).slice(0, 6)}, {u.start}</em></li>)}</ul>
            ) : <p className="hr-empty">No meetings, visits or trainings planned.</p>}
          </div>
        </div>
      </Card>

      <Card title="Timesheet summary by employee" hint={range === "week" ? "This week" : "This month"}>
        <Table
          cols={[
            { h: "Employee", cell: (r) => <span className="hr-person"><Avatar name={r.name} /><span>{r.name}<small>{r.role}</small></span></span> },
            { h: "Team", cell: (r) => r.teamName },
            { h: "Hours", right: true, cell: (r) => r1(r.hours) },
            { h: "Overtime", right: true, cell: (r) => r1(r.ot) },
            { h: "Leave", right: true, cell: (r) => r.leave },
            { h: "Missing", right: true, cell: (r) => (r.missing ? <Pill kind="bad">{r.missing}</Pill> : "0") },
            { h: "Pending", right: true, cell: (r) => (r.pending ? <Pill kind="warn">{r.pending}</Pill> : "0") },
            { h: "Attendance", cell: (r) => <span className="hr-inline-meter"><Meter value={r.attendance} color={r.attendance >= 95 ? C.teal : C.amber} />{r.attendance}%</span> },
          ]}
          rows={s.perEmp}
        />
      </Card>
    </>
  );
}
/* =====================================================================
   LEAVE
   ===================================================================== */
function Leave({ d }) {
  const l = d.leave;
  return (
    <>
      <Kpis items={[
        { label: "Pending", value: l.pending, sub: "Waiting for a decision", tone: l.pending ? "warn" : "good" },
        { label: "Approved", value: l.approved, tone: "good" },
        { label: "Rejected", value: l.rejected },
        { label: "Approval rate", value: `${l.approvalRate}%`, sub: `${l.decided} decided` },
        { label: "Permission hours", value: l.hours, sub: `${l.total} requests` },
        { label: "Holiday sets", value: l.sets, sub: `${l.activeAssignments} active assignments` },
      ]} />
      <div className="hr-grid hr-g2">
        <Card title="Requests by status">
          <Ring items={[{ label: "Pending", value: l.pending }, { label: "Approved", value: l.approved }, { label: "Rejected", value: l.rejected }]} colors={[C.amber, C.green, C.red]} center={l.total} centerLabel="requests" />
        </Card>
        <Card title="Permission hours by team">
          <div className="hr-chart tall"><Bar data={{ labels: l.byTeam.map((x) => x.label), datasets: [{ data: l.byTeam.map((x) => x.value), backgroundColor: C.violet, borderRadius: 8, maxBarThickness: 40 }] }} options={barOpts()} /></div>
        </Card>
      </div>
      <Card title="Permission requests">
        <Table
          cols={[
            { h: "Employee", cell: (r) => <span className="hr-person"><Avatar name={r.name} /><span>{r.name}<small>{r.team}</small></span></span> },
            { h: "Date", cell: (r) => niceDate(r.date) },
            { h: "Hours", right: true, cell: (r) => r.duration },
            { h: "Reason", cell: (r) => r.reason },
            { h: "Balance used", cell: (r) => <span className="hr-inline-meter"><Meter value={(r.used / r.limit) * 100} color={C.violet} />{r.used}/{r.limit}h</span> },
            { h: "Status", cell: (r) => <Pill>{r.status}</Pill> },
          ]}
          rows={l.requests}
        />
      </Card>
      <div className="hr-grid hr-g2">
        <Card title="Holiday set assignments">
          <Table
            cols={[{ h: "Set", cell: (r) => r.set }, { h: "Assigned to", cell: (r) => <>{r.to} <small className="hr-dim">({r.type})</small></> }, { h: "Status", cell: (r) => <Pill>{r.status}</Pill> }]}
            rows={l.assignments}
          />
        </Card>
        <Card title="Upcoming holidays">
          {l.upcomingHolidays.length ? <ul className="hr-rows">{l.upcomingHolidays.map((h) => <li key={h.date}><span>{h.name}<small>{h.type}</small></span><em>{niceDate(h.date)}</em></li>)}</ul> : <p className="hr-empty">No upcoming holidays in the calendar.</p>}
        </Card>
      </div>
    </>
  );
}

/* =====================================================================
   PAYROLL
   ===================================================================== */
function Payroll({ d }) {
  const p = d.payroll;
  const mixColors = { Approved: C.green, "Pending approval": C.amber, "Missing timesheet": C.red, "Missing payroll data": C.slate };
  return (
    <>
      <Kpis items={[
        { label: "Net payroll", value: inrShort(p.net), sub: `${p.count} employees` },
        { label: "Gross pay", value: inrShort(p.gross), sub: `${inrShort(p.overtime)} overtime` },
        { label: "Deductions", value: inrShort(p.deductions), sub: "PF, tax and others" },
        { label: "Approved", value: `${p.approved}/${p.count}`, sub: `${p.blocked} blocked`, tone: p.blocked ? "warn" : "good" },
        { label: "Emails sent", value: `${p.emailSent}/${p.count}`, sub: `${p.emailFailed} failed`, tone: p.emailFailed ? "bad" : undefined },
      ]} />
      <div className="hr-grid hr-g2">
        <Card title="Net pay by department">
          <div className="hr-chart tall">
            <Bar data={{ labels: p.byDept.map((x) => x.label), datasets: [{ data: p.byDept.map((x) => x.value), backgroundColor: MODULE_COLOR.Payslips, borderRadius: 8, maxBarThickness: 40 }] }} options={barOpts({ y: { ticks: { callback: (v) => `${v / 1000}k` } } })} />
          </div>
        </Card>
        <Card title="Payslip approval status">
          <Ring items={p.approvalMix} colors={p.approvalMix.map((x) => mixColors[x.label] || C.slate)} center={p.approved} centerLabel="approved" />
        </Card>
      </div>
      <Card title="Payslips this month">
        <Table
          cols={[
            { h: "Employee", cell: (r) => <span className="hr-person"><Avatar name={r.name} /><span>{r.name}<small>{r.id}</small></span></span> },
            { h: "Department", cell: (r) => r.department },
            { h: "Gross", right: true, cell: (r) => inr(r.gross) },
            { h: "Deductions", right: true, cell: (r) => inr(r.deductions) },
            { h: "Net pay", right: true, cell: (r) => <b>{inr(r.net)}</b> },
            { h: "Approval", cell: (r) => <Pill>{r.approval}</Pill> },
            { h: "Email", cell: (r) => <Pill>{r.email}</Pill> },
          ]}
          rows={p.rows}
        />
      </Card>
    </>
  );
}

/* =====================================================================
   PERFORMANCE & GOALS
   ===================================================================== */
function Performance({ d }) {
  const p = d.performance;
  const g = d.goals;
  return (
    <>
      <Kpis items={[
        { label: "Average rating", value: `${p.avg} / 5`, sub: "Q3 2026 reviews" },
        { label: "Reviews completed", value: `${p.done}/${p.total}`, sub: `${p.pending} pending`, tone: p.pending ? "warn" : "good" },
        { label: "Goal progress", value: `${g.avgProgress}%`, sub: `${g.total} goals` },
        { label: "Completed goals", value: g.completed, tone: "good" },
        { label: "At risk", value: g.atRisk, sub: `${g.dueSoon} due in 30 days`, tone: g.atRisk ? "warn" : "good" },
      ]} />
      <div className="hr-grid hr-g3">
        <Card title="Average rating by team">
          <div className="hr-chart tall"><Bar data={{ labels: p.byTeam.map((x) => x.name), datasets: [{ data: p.byTeam.map((x) => x.rating), backgroundColor: p.byTeam.map((x) => x.color), borderRadius: 8, maxBarThickness: 40 }] }} options={barOpts({ y: { min: 0, max: 5, ticks: { stepSize: 1 } } })} /></div>
        </Card>
        <Card title="Rating distribution" hint="Latest completed review per person">
          <Ring items={p.distribution} colors={[C.green, C.blue, C.amber, C.red]} center={p.currentDone} centerLabel="reviewed" />
        </Card>
        <Card title="Goal status">
          <Ring items={g.statusMix} colors={[C.green, C.blue, C.amber, C.slate]} center={g.total} centerLabel="goals" />
        </Card>
      </div>
      <div className="hr-grid hr-g2">
        <Card title="Goal progress by department">
          <div className="hr-chart"><Bar data={{ labels: g.byDept.map((x) => x.label), datasets: [{ data: g.byDept.map((x) => x.value), backgroundColor: MODULE_COLOR.Goals, borderRadius: 8, maxBarThickness: 22 }] }} options={{ ...barOpts({ x: { beginAtZero: true, max: 100, grid: { color: C.grid }, ticks: { callback: (v) => `${v}%` } }, y: { grid: { display: false }, ticks: {} } }), indexAxis: "y" }} /></div>
        </Card>
        <Card title="Top rated this quarter">
          <Table cols={[{ h: "Employee", cell: (r) => <span className="hr-person"><Avatar name={r.name} /><span>{r.name}<small>{r.team}</small></span></span> }, { h: "Rating", right: true, cell: (r) => <b>★ {r.rating.toFixed(1)}</b> }]} rows={p.top} />
        </Card>
      </div>
      <Card title="Goals at risk" hint="Earliest due date first">
        <Table
          cols={[
            { h: "Goal", cell: (r) => <>{r.title}<small className="hr-dim block">{r.id}</small></> },
            { h: "Owner", cell: (r) => <span className="hr-person"><Avatar name={r.owner} />{r.owner}</span> },
            { h: "Department", cell: (r) => r.department },
            { h: "Progress", cell: (r) => <span className="hr-inline-meter"><Meter value={r.progress} color={C.amber} />{r.progress}%</span> },
            { h: "Due", cell: (r) => niceDate(r.dueDate) },
          ]}
          rows={g.risky}
          empty="No goals are at risk."
        />
      </Card>
    </>
  );
}

/* =====================================================================
   HIRING
   ===================================================================== */
function Hiring({ d }) {
  const h = d.hiring;
  return (
    <>
      <Kpis items={[
        { label: "Open roles", value: h.openRoles, sub: `${h.openings} openings` },
        { label: "Applicants", value: h.applicants, sub: `${h.internal} internal` },
        { label: "Awaiting review", value: h.inReview, tone: h.inReview ? "warn" : "good" },
        { label: "Shortlisted", value: h.shortlisted },
        { label: "Hired", value: h.hired, tone: "good" },
      ]} />
      <div className="hr-grid hr-g2">
        <Card title="Applicants by status">
          <Ring items={h.statusMix} colors={[C.blue, C.violet, C.green, C.slate]} center={h.applicants} centerLabel="applicants" />
        </Card>
        <Card title="Applicants per role">
          <div className="hr-chart tall"><Bar data={{ labels: h.jobs.map((j) => j.title), datasets: [{ data: h.jobs.map((j) => j.applicants), backgroundColor: MODULE_COLOR["Job Portal"], borderRadius: 8, maxBarThickness: 44 }] }} options={barOpts()} /></div>
        </Card>
      </div>
      <Card title="Job postings" hint="Read live from the Job Portal">
        <Table
          cols={[
            { h: "Role", cell: (r) => <>{r.title}{r.urgent && <Pill kind="bad">Urgent</Pill>}<small className="hr-dim block">{r.code} · {r.department}</small></> },
            { h: "Openings", right: true, cell: (r) => r.openings },
            { h: "Applicants", right: true, cell: (r) => r.applicants },
            { h: "Shortlisted", right: true, cell: (r) => r.shortlisted },
            { h: "Hired", right: true, cell: (r) => r.hired },
            { h: "Deadline", cell: (r) => (r.status === "Open" ? <>{niceDate(r.deadline)}<small className="hr-dim block">{r.daysLeft < 0 ? "Passed" : r.daysLeft === 0 ? "Today" : `${r.daysLeft} days left`}</small></> : "—") },
            { h: "Status", cell: (r) => <Pill>{r.status}</Pill> },
          ]}
          rows={h.jobs}
          empty="No jobs posted yet."
        />
      </Card>
    </>
  );
}

/* =====================================================================
   EXITS
   ===================================================================== */
function Exits({ d }) {
  const e = d.exits;
  return (
    <>
      <Kpis items={[
        { label: "In progress", value: e.active, sub: `${e.relieved} relieved` },
        { label: "F&F outstanding", value: inrShort(e.fnfDue), sub: `${e.fnfOpen} settlements`, tone: e.fnfOpen ? "warn" : "good" },
        { label: "Checklist done", value: `${e.checklistPct}%`, sub: "Across all exits" },
        { label: "Leaving within 14 days", value: e.leavingSoon.length, tone: e.leavingSoon.length ? "warn" : undefined },
      ]} />
      <div className="hr-grid hr-g2">
        <Card title="Exit type">
          <Ring items={e.typeMix} colors={[C.blue, C.amber, C.violet, C.teal, C.slate]} center={e.total} centerLabel="exits" />
        </Card>
        <Card title="Clearance progress by task" hint="Share of exits where the task is done">
          <div className="hr-chart tall"><Bar data={{ labels: e.itemProgress.map((x) => x.label), datasets: [{ data: e.itemProgress.map((x) => x.value), backgroundColor: MODULE_COLOR.Offboarding, borderRadius: 6, maxBarThickness: 18 }] }} options={{ ...barOpts({ x: { beginAtZero: true, max: 100, grid: { color: C.grid }, ticks: { callback: (v) => `${v}%` } }, y: { grid: { display: false }, ticks: {} } }), indexAxis: "y" }} /></div>
        </Card>
      </div>
      <Card title="Employees leaving">
        <Table
          cols={[
            { h: "Employee", cell: (r) => <span className="hr-person"><Avatar name={r.name} /><span>{r.name}<small>{r.designation} · {r.department}</small></span></span> },
            { h: "Exit", cell: (r) => <>{r.exitType}<small className="hr-dim block">{r.reason}</small></> },
            { h: "Last day", cell: (r) => <>{niceDate(r.lastWorkingDay)}{!r.relievedOn && <small className="hr-dim block">{r.daysToLwd < 0 ? `${-r.daysToLwd} days overdue` : r.daysToLwd === 0 ? "Today" : `in ${r.daysToLwd} days`}</small>}</> },
            { h: "Stage", cell: (r) => <Pill>{r.stage}</Pill> },
            { h: "Clearance", cell: (r) => <span className="hr-inline-meter"><Meter value={(r.done / r.total) * 100} color={C.blue} />{r.done}/{r.total}</span> },
            { h: "F&F", right: true, cell: (r) => <>{inr(r.fnfAmount)}<br /><Pill>{r.fnfStatus}</Pill></> },
          ]}
          rows={e.rows}
          empty="No exits recorded."
        />
      </Card>
    </>
  );
}

/* =====================================================================
   PAGE
   ===================================================================== */
export default function HRReports({ data: overrides }) {
  const [tab, setTab] = useState("overview");
  const pageRef = useRef(null);
  const d = useMemo(() => buildReportData(overrides), [overrides]);

  /* Print: copy the report into a clean hidden page so the app sidebar / scroll areas can never blank it out */
  const printReport = () => {
    const src = pageRef.current;
    if (!src) return;
    const clone = src.cloneNode(true);
    clone.querySelectorAll(".hr-actions, .hr-tabs, .hr-toolbar").forEach((n) => n.remove());
    const h1 = clone.querySelector("h1");
    if (h1) h1.textContent = `HR Reports – ${TABS.find((t) => t.id === tab).label}`;
    const from = src.querySelectorAll("canvas");
    clone.querySelectorAll("canvas").forEach((cv, i) => {
      const img = document.createElement("img");
      try { img.src = from[i].toDataURL("image/png"); } catch { /* ignore */ }
      img.style.cssText = `display:block;width:${from[i].clientWidth}px;height:${from[i].clientHeight}px`;
      cv.replaceWith(img);
    });
    const head = [...document.querySelectorAll('link[rel="stylesheet"], style')].map((n) => n.outerHTML).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><base href="${document.baseURI}"><title>HR Report</title>${head}</head><body style="margin:0;background:#fff">${clone.outerHTML}</body></html>`;

    /* 1) a clean popup window: nothing from the app can leak into it */
    const win = window.open("", "_blank", "width=1100,height=800");
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
      setTimeout(() => {
        win.focus();
        win.print();
        win.onafterprint = () => win.close();
      }, 900);
      return;
    }

    /* 2) popup blocked: use an off-screen iframe (must stay visible, a hidden iframe prints blank) */
    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:1200px;height:900px;border:0";
    frame.srcdoc = html;
    frame.onload = () => setTimeout(() => {
      const w = frame.contentWindow;
      w.focus();
      w.addEventListener("afterprint", () => frame.remove());
      w.print();
    }, 700);
    document.body.appendChild(frame);
  };

  const urgentItems = d.attention.filter((a) => a.severity === "high");
  const urgent = urgentItems.length;
  const urgentModules = [...new Set(urgentItems.map((a) => a.module))].join(" and ");
  const View = { overview: Overview, attendance: Attendance, leave: Leave, payroll: Payroll, performance: Performance, hiring: Hiring, exits: Exits }[tab];

  return (
    <main className="hr-page" ref={pageRef}>
      <header className="hr-hero">
        <div>
          <h1>HR Reports</h1>
          <p>
            {urgent ? <><AlertTriangle size={15} /> {urgent} urgent {urgent > 1 ? "items need" : "item needs"} your attention in {urgentModules}.</> : "Scheduler, timesheets, leave, payroll, performance, hiring and exits in one view."}
          </p>
        </div>
        <div className="hr-actions">
          <span className="hr-stamp">Updated {d.builtAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
          <button type="button" className="hr-btn primary" onClick={printReport}><Printer size={15} /> Print</button>
        </div>
      </header>

      <nav className="hr-tabs" aria-label="Report sections">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" className={tab === id ? "on" : ""} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>
            <Icon size={16} />{label}
          </button>
        ))}
      </nav>

      <div className="hr-body" key={tab}>
        <View d={d} go={setTab} />
      </div>
    </main>
  );
}