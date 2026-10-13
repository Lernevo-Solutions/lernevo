import React, { useMemo, useState } from "react";
import "./Timesheet.css";

/* ---------- Sample data (replace with your API data) ---------- */
// For a real app use: const TODAY = new Date();
const TODAY = new Date(2026, 9, 8);

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WORK_TYPES = ["Development", "UI/UX", "Backend", "Client Meeting", "Testing"];

const RULES = {
  india: { name: "India General Schedule", workDays: [1, 2, 3, 4, 5, 6], start: "09:00", end: "18:00", tz: "Asia/Kolkata", desc: "Mon–Sat · Sun off" },
  us: { name: "US Support Schedule", workDays: [2, 3, 4, 5, 6], start: "08:00", end: "17:00", tz: "America/New_York", desc: "Tue–Sat · Mon off" },
  rota: { name: "Rotational Schedule", workDays: [], start: "09:00", end: "18:00", tz: "Asia/Kolkata", desc: "3-week rotation" },
};
// Rotational week-off pattern (0 = Sun). Week 1: Sun+Mon, Week 2: Tue, Week 3: Sat+Sun
const ROTA_OFF = [[0, 1], [2], [6, 0]];

const HOLIDAYS = { "2026-10-02": "Gandhi Jayanti", "2026-11-10": "Diwali", "2026-12-25": "Christmas" };

const EMPLOYEES = [
  { id: 1, name: "Arun", role: "Developer", dept: "Engineering", rule: "india", leaves: ["2026-10-14"] },
  { id: 2, name: "Divya", role: "UI/UX Designer", dept: "Design", rule: "india", leaves: ["2026-10-07"] },
  { id: 3, name: "Karthik", role: "Backend Developer", dept: "Engineering", rule: "india", leaves: ["2026-09-28"] },
  { id: 4, name: "Priya", role: "Tester", dept: "QA", rule: "india", leaves: ["2026-10-07"] },
  { id: 5, name: "Meena", role: "HR Executive", dept: "HR", rule: "rota", leaves: [] },
  { id: 6, name: "Ravi", role: "QA Lead", dept: "QA", rule: "rota", leaves: ["2026-10-06"] },
  { id: 7, name: "Sana", role: "DevOps Engineer", dept: "Engineering", rule: "us", leaves: [] },
  { id: 8, name: "Vikram", role: "Support Lead", dept: "Support", rule: "us", leaves: ["2026-10-09"] },
];

/* ---------- Helpers ---------- */
const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayOf = (d) => addDays(d, -((d.getDay() + 6) % 7));
const fmt = (h) => {
  const m = Math.round(h * 60);
  return `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}`;
};
const daysBetween = (from, to) => {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
};
const getRange = (view, anchor) =>
  view === "week"
    ? [mondayOf(anchor), addDays(mondayOf(anchor), 6)]
    : [new Date(anchor.getFullYear(), anchor.getMonth(), 1), new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)];

/** Schedule Rule -> what kind of day is this for this employee? */
function getDayInfo(date, emp) {
  const rule = RULES[emp.rule];
  const k = keyOf(date);
  if (HOLIDAYS[k]) return { type: "holiday", label: HOLIDAYS[k] };

  const weekNo = Math.floor((mondayOf(date) - new Date(2026, 0, 5)) / 6048e5);
  const isOff =
    emp.rule === "rota"
      ? ROTA_OFF[(((weekNo + emp.id) % 3) + 3) % 3].includes(date.getDay())
      : !rule.workDays.includes(date.getDay());
  if (isOff) return { type: "off" };
  if (emp.leaves.includes(k)) return { type: "leave" };

  const diff = Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()) - new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate())) / 864e5);
  if (diff > 0) return { type: "scheduled" };
  if ((date.getDate() + emp.id) % 23 === 1) return { type: "missing" }; // demo only

  const hours = 8 + [0, 0.25, 0, 0.5, 0][(date.getDate() + emp.id) % 5];
  return { type: "work", hours, ot: hours - 8, status: diff >= -2 ? "Pending" : "Approved" };
}

function calcTotals(from, to, emp) {
  const t = { total: 0, regular: 0, ot: 0, brk: 0, leave: 0, off: 0, holiday: 0, missing: 0, workDays: 0, pending: 0 };
  daysBetween(from, to).forEach((d) => {
    const i = getDayInfo(d, emp);
    if (i.type === "work") {
      t.total += i.hours; t.regular += 8; t.ot += i.ot; t.brk += 1; t.workDays++;
      if (i.status === "Pending") t.pending++;
    } else if (i.type === "leave") t.leave++;
    else if (i.type === "off") t.off++;
    else if (i.type === "holiday") t.holiday++;
    else if (i.type === "missing") t.missing++;
  });
  const base = t.workDays + t.leave + t.missing;
  t.attendance = base ? Math.round((100 * (t.workDays + t.leave)) / base) : 100;
  return t;
}

const sumTotals = (list) =>
  list.reduce((a, t) => {
    Object.keys(t).forEach((k) => { if (k !== "attendance") a[k] = (a[k] || 0) + t[k]; });
    return a;
  }, {});
const attendanceOf = (a) => {
  const base = (a.workDays || 0) + (a.leave || 0) + (a.missing || 0);
  return base ? Math.round((100 * ((a.workDays || 0) + (a.leave || 0))) / base) : 100;
};

/* ---------- Small components ---------- */
const Avatar = ({ name }) => <span className="ts-av">{name.slice(0, 2).toUpperCase()}</span>;

function StatCard({ icon, bg, label, value }) {
  return (
    <div className="ts-stat">
      <div className="ts-ic" style={{ background: bg }}>{icon}</div>
      <div><small>{label}</small><b>{value}</b></div>
    </div>
  );
}

function ShiftBox({ info, emp, date }) {
  const rule = RULES[emp.rule];
  const workType = WORK_TYPES[(date.getDate() + emp.id) % 5];

  if (["off", "leave", "holiday"].includes(info.type)) {
    const label = info.type === "off" ? "Week off" : info.type === "leave" ? "Leave" : info.label;
    return <div className={`ts-optin ts-optin--${info.type}`}>{label}</div>;
  }
  const cls = info.type === "scheduled" ? "ts-shift--fade" : info.type === "missing" || info.status === "Pending" ? "ts-shift--pending" : "";
  return (
    <div>
      <div className="ts-optin">Opt in</div>
      <div className={`ts-shift ${cls}`}>
        <b>{rule.start} › {rule.end}</b>
        <div>🕒 {info.hours ? fmt(info.hours) : "8h"}{info.ot ? ` · +${fmt(info.ot)} OT` : ""}</div>
        <div>☕ 1h unpaid</div>
        <div className="ts-task">{workType}</div>
        {info.type === "work" && (
          <span className={`ts-badge ${info.status === "Approved" ? "ts-work" : "ts-pend"}`}>{info.status}</span>
        )}
        {info.type === "missing" && <span className="ts-badge ts-miss">Missing</span>}
      </div>
    </div>
  );
}

function DayTag({ info }) {
  switch (info.type) {
    case "work":
      return info.ot ? (
        <div className="ts-tag ts-ot">{fmt(info.hours)} + OT<small>{info.status}</small></div>
      ) : (
        <div className="ts-tag ts-work">{fmt(info.hours)} worked<small>{info.status}</small></div>
      );
    case "off": return <div className="ts-tag ts-off">Week off</div>;
    case "leave": return <div className="ts-tag ts-leave">Leave</div>;
    case "holiday": return <div className="ts-tag ts-hol">Holiday<small>{info.label}</small></div>;
    case "scheduled": return <div className="ts-tag ts-sched">Scheduled</div>;
    case "missing": return <div className="ts-tag ts-missing">Missing</div>;
    default: return null;
  }
}

/* ---------- Weekly: one row per employee, one box per day ---------- */
function WeekView({ list, totals, from, to, onPick }) {
  const days = daysBetween(from, to);
  const locked = to < new Date(2026, 9, 5);
  return (
    <div className="ts-scroll">
      {locked && <div className="ts-lock">🔒 This week&apos;s schedule is locked as the timesheet has been signed off</div>}
      <div className="ts-rota">
        <div />
        {days.map((d) => (
          <div key={keyOf(d)} className={`ts-dh ${keyOf(d) === keyOf(TODAY) ? "is-today" : ""}`}>
            {DAYS[d.getDay()]} {d.getDate()} {MONTHS[d.getMonth()].slice(0, 3)}
          </div>
        ))}
        <div className="ts-dh">Totals</div>

        {list.map((e, n) => (
          <React.Fragment key={e.id}>
            <div className="ts-who">
              <div className="ts-row"><Avatar name={e.name} /><button className="ts-name" onClick={() => onPick(e.id)}>{e.name}</button></div>
              <span className="ts-hrs">{fmt(totals[n].total)} / 40h</span>
              <small>{e.role}<br />{RULES[e.rule].name}</small>
            </div>
            {days.map((d) => (
              <div key={keyOf(d)} className="ts-cc"><ShiftBox info={getDayInfo(d, e)} emp={e} date={d} /></div>
            ))}
            <div className="ts-tcell">
              Worked<b>{fmt(totals[n].total)}</b>
              OT {fmt(totals[n].ot)}<br />Leave {totals[n].leave}d · Off {totals[n].off}d
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ---------- Monthly: one calendar per employee ---------- */
function MonthCalendar({ emp, from, to }) {
  const first = mondayOf(from);
  const weeks = [];
  for (let s = first; s <= to; s = addDays(s, 7)) weeks.push(daysBetween(s, addDays(s, 6)));
  return (
    <div className="ts-scroll">
      <div className="ts-cal">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="ts-h">{d}</div>)}
        <div className="ts-h">Week</div>
        {weeks.map((w) => {
          const weekTotal = w.reduce((s, d) => {
            const i = getDayInfo(d, emp);
            return d.getMonth() === from.getMonth() && i.type === "work" ? s + i.hours : s;
          }, 0);
          return (
            <React.Fragment key={keyOf(w[0])}>
              {w.map((d) => {
                const inMonth = d.getMonth() === from.getMonth();
                return (
                  <div key={keyOf(d)} className={`ts-cell ${inMonth ? "" : "is-out"} ${keyOf(d) === keyOf(TODAY) ? "is-today" : ""}`}>
                    <span className="ts-n">{d.getDate()}</span>
                    {inMonth && <DayTag info={getDayInfo(d, emp)} />}
                  </div>
                );
              })}
              <div className="ts-wk">{fmt(weekTotal)}</div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({ list, totals, from, to, onPick }) {
  return list.map((e, n) => {
    const rule = RULES[e.rule];
    return (
      <section key={e.id} className="ts-emp">
        <div className="ts-pf">
          <Avatar name={e.name} />
          {list.length > 1 ? <button className="ts-name" onClick={() => onPick(e.id)}>{e.name}</button> : <b>{e.name}</b>}
          <span className="ts-chip">{e.role} · {e.dept}</span>
          <span className="ts-chip">{rule.name} · {rule.desc}</span>
          <span className="ts-chip">{rule.start}–{rule.end} · {rule.tz}</span>
          <span className="ts-chip">{fmt(totals[n].total)} · OT {fmt(totals[n].ot)} · Att {totals[n].attendance}%</span>
        </div>
        <MonthCalendar emp={e} from={from} to={to} />
      </section>
    );
  });
}

/* ---------- Main page ---------- */
export default function Timesheet() {
  const [view, setView] = useState("week");
  const [anchor, setAnchor] = useState(TODAY);
  const [dept, setDept] = useState("all");
  const [empId, setEmpId] = useState("all");
  const [query, setQuery] = useState("");

  const [from, to] = useMemo(() => getRange(view, anchor), [view, anchor]);
  const list = useMemo(
    () => EMPLOYEES.filter((e) =>
      (dept === "all" || e.dept === dept) &&
      (empId === "all" || e.id === Number(empId)) &&
      e.name.toLowerCase().includes(query.toLowerCase())),
    [dept, empId, query]
  );
  const totals = useMemo(() => list.map((e) => calcTotals(from, to, e)), [list, from, to]);
  const agg = useMemo(() => sumTotals(totals), [totals]);

  const move = (n) =>
    setAnchor(view === "week" ? addDays(anchor, 7 * n) : new Date(anchor.getFullYear(), anchor.getMonth() + n, 1));
  const pick = (id) => { setEmpId(String(id)); setDept("all"); };

  const label = view === "month"
    ? `${MONTHS[from.getMonth()]} ${from.getFullYear()}`
    : `${from.getDate()} ${MONTHS[from.getMonth()].slice(0, 3)} – ${to.getDate()} ${MONTHS[to.getMonth()].slice(0, 3)} ${to.getFullYear()}`;

  return (
    <div className="ts-wrap">
      <header className="ts-hero">
        <h1>Timesheets</h1>
        <p>All employees&apos; hours, leave and overtime, filled automatically from each person&apos;s schedule rule.</p>
        <div className="ts-chips">
          <span className="ts-chip">Fixed / Static</span>
          <span className="ts-chip">Rotational / Rota</span>
          <span className="ts-chip">Asia/Kolkata · America/New_York</span>
          <span className="ts-chip">1h break</span>
        </div>
      </header>

      <section className="ts-stats">
        <StatCard icon="👥" bg="var(--ts-soft)" label="Employees" value={list.length} />
        <StatCard icon="⏱" bg="var(--ts-okb)" label="Total hours" value={fmt(agg.total || 0)} />
        <StatCard icon="🔥" bg="var(--ts-penb)" label="Overtime" value={fmt(agg.ot || 0)} />
        <StatCard icon="⏳" bg="var(--ts-penb)" label="Pending approval" value={agg.pending || 0} />
        <StatCard icon="🌴" bg="var(--ts-lvb)" label="Leave days" value={agg.leave || 0} />
        <StatCard icon="🗓" bg="var(--ts-offb)" label="Week-off days" value={agg.off || 0} />
      </section>

      <main className="ts-panel">
        <div className="ts-filters">
          <select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department">
            <option value="all">All Departments</option>
            {[...new Set(EMPLOYEES.map((e) => e.dept))].map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={empId} onChange={(e) => setEmpId(e.target.value)} aria-label="Employee">
            <option value="all">All Employees</option>
            {EMPLOYEES.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search employee name…" aria-label="Search employee" />
        </div>

        <div className="ts-bar">
          <div className="ts-tabs" role="tablist">
            {["week", "month"].map((v) => (
              <button key={v} role="tab" aria-selected={view === v} className="ts-tab" onClick={() => setView(v)}>
                {v === "week" ? "Weekly" : "Monthly"}
              </button>
            ))}
          </div>
          <div className="ts-nav">
            <button className="ts-btn" onClick={() => move(-1)} aria-label="Previous">‹</button>
            <span className="ts-lbl">{label}</span>
            <button className="ts-btn" onClick={() => move(1)} aria-label="Next">›</button>
            <button className="ts-btn ts-btn--pri" onClick={() => setAnchor(TODAY)}>Today</button>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="ts-empty">No employees match the filters.</div>
        ) : view === "week" ? (
          <WeekView list={list} totals={totals} from={from} to={to} onPick={pick} />
        ) : (
          <MonthView list={list} totals={totals} from={from} to={to} onPick={pick} />
        )}

        <div className="ts-legend">
          <span><i style={{ background: "var(--ts-ok)" }} />Worked</span>
          <span><i style={{ background: "var(--ts-ot)" }} />Overtime</span>
          <span><i style={{ background: "var(--ts-pen)" }} />Pending</span>
          <span><i style={{ background: "var(--ts-off)" }} />Week off</span>
          <span><i style={{ background: "var(--ts-lv)" }} />Leave / Missing</span>
          <span><i style={{ background: "var(--ts-hol)" }} />Holiday</span>
        </div>

        <div className="ts-sum">
          {(view === "month"
            ? [["Total working hours", fmt(agg.total || 0)], ["Regular hours", fmt(agg.regular || 0)], ["Overtime", fmt(agg.ot || 0)], ["Leave days", agg.leave || 0],
               ["Week-off days", agg.off || 0], ["Holidays", agg.holiday || 0], ["Attendance", `${attendanceOf(agg)}%`], ["Missing timesheets", agg.missing || 0]]
            : [["Total hours", fmt(agg.total || 0)], ["Working days", agg.workDays || 0], ["Week-off days", agg.off || 0], ["Holidays", agg.holiday || 0],
               ["Leave days", agg.leave || 0], ["Missing", agg.missing || 0], ["Attendance", `${attendanceOf(agg)}%`]]
          ).map(([l, v]) => <div key={l}><small>{l}</small><b>{v}</b></div>)}
        </div>
      </main>
    </div>
  );
}