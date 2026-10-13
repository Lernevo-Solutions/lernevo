import React, { useMemo, useState } from "react";
import "./Employeetimesheet.css";


/* =====================  SAMPLE DATA (replace with API data)  ===================== */
// Real app: const TODAY = new Date();
const TODAY = new Date(2026, 9, 8);

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const SCHEDULES = {
  india: { name: "India General Schedule", type: "Fixed / Static Schedule", workDays: [1, 2, 3, 4, 5, 6], start: "09:00", end: "18:00", breakMin: 60, tz: "Asia/Kolkata", shift: "General Day" },
  us: { name: "US Support Schedule", type: "Fixed / Static Schedule", workDays: [2, 3, 4, 5, 6], start: "08:00", end: "17:00", breakMin: 60, tz: "America/New_York", shift: "US Day Shift" },
  rota: { name: "Rotational Schedule", type: "Rotational Schedule", workDays: null, start: "09:00", end: "18:00", breakMin: 60, tz: "Asia/Kolkata", shift: "Rota Shift" },
};
const ROTA_OFF = [[0, 1], [2], [6, 0]]; // week 1: Sun+Mon, week 2: Tue, week 3: Sat+Sun

const HOLIDAYS = [
  { date: "2026-10-02", name: "Gandhi Jayanti" },
  { date: "2026-10-12", name: "Dussehra" },
  { date: "2026-10-21", name: "Diwali" },
  { date: "2026-12-25", name: "Christmas" },
];

const EMPLOYEES = [
  { id: "EMP001", name: "Priya Sharma", dept: "Engineering", location: "Chennai", leaves: [] },
  { id: "EMP002", name: "Arun Kumar", dept: "Engineering", location: "Chennai", leaves: ["2026-10-14"] },
  { id: "EMP003", name: "Divya R", dept: "Design", location: "Bengaluru", leaves: ["2026-10-07"] },
  { id: "EMP004", name: "Karthik S", dept: "Engineering", location: "Bengaluru", leaves: [] },
  { id: "EMP005", name: "Meena Iyer", dept: "HR", location: "Chennai", leaves: [] },
  { id: "EMP006", name: "Vikram Das", dept: "Support", location: "New York", leaves: [] },
];
// Schedule history per employee: the last entry whose `from` <= date is used (effective dating)
const INITIAL_SCHEDULES = {
  EMP001: [{ from: "2026-01-01", rule: "india" }],
  EMP002: [{ from: "2026-01-01", rule: "india" }],
  EMP003: [{ from: "2026-01-01", rule: "india" }],
  EMP004: [{ from: "2026-01-01", rule: "india" }],
  EMP005: [{ from: "2026-01-01", rule: "rota" }],
  EMP006: [{ from: "2026-01-01", rule: "us" }],
};
const INITIAL_APPROVED = ["EMP001|2026-10-05", "EMP001|2026-10-08", "EMP002|2026-10-05", "EMP003|2026-10-05"];

/* =====================  HELPERS  ===================== */
const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayOf = (d) => addDays(d, -((d.getDay() + 6) % 7));
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const shiftHours = (r) => (toMin(r.end) - toMin(r.start) - r.breakMin) / 60;
const hrs = (n) => `${Number.isInteger(n) ? n : n.toFixed(2)}`;
const isoWeek = (d) => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  return Math.ceil(((t - new Date(Date.UTC(t.getUTCFullYear(), 0, 1))) / 864e5 + 1) / 7);
};
const monthRange = (a) => [new Date(a.getFullYear(), a.getMonth(), 1), new Date(a.getFullYear(), a.getMonth() + 1, 0)];
const eachDay = (from, to) => { const out = []; for (let d = from; d <= to; d = addDays(d, 1)) out.push(d); return out; };

const ruleAt = (emp, schedules, date) => {
  const k = keyOf(date);
  let cur = schedules[emp.id][0];
  schedules[emp.id].forEach((s) => { if (s.from <= k) cur = s; });
  return SCHEDULES[cur.rule];
};

/** Schedule Rule -> what is this day for this employee? (no manual week-off selection) */
function getDay(emp, date, schedules, approved) {
  const k = keyOf(date);
  const rule = ruleAt(emp, schedules, date);
  const hol = HOLIDAYS.find((h) => h.date === k);
  if (hol) return { type: "holiday", label: hol.name, rule };

  const n = parseInt(emp.id.slice(3), 10);
  const weekNo = Math.round((mondayOf(date) - new Date(2026, 0, 5)) / 6048e5);
  const isOff = rule.workDays ? !rule.workDays.includes(date.getDay()) : ROTA_OFF[(((weekNo + n) % 3) + 3) % 3].includes(date.getDay());
  if (isOff) return { type: "off", rule };
  if (emp.leaves.includes(k)) return { type: "leave", rule };
  return { type: "work", rule, hours: shiftHours(rule), status: approved.has(`${emp.id}|${k}`) ? "Approved" : "Pending" };
}

function summarize(emp, from, to, schedules, approved) {
  const s = { scheduled: 0, worked: 0, leave: 0, off: 0, holiday: 0, workDays: 0, filled: 0, pending: 0, approvedDays: 0 };
  eachDay(from, to).forEach((d) => {
    const i = getDay(emp, d, schedules, approved);
    if (i.type === "work") {
      s.workDays++; s.scheduled += i.hours;
      if (i.status === "Approved") { s.worked += i.hours; s.approvedDays++; }
      if (d <= TODAY) { s.filled++; if (i.status === "Pending") s.pending++; }
    } else if (i.type === "leave") s.leave++;
    else if (i.type === "off") s.off++;
    else if (i.type === "holiday") s.holiday++;
  });
  s.missing = s.pending;
  s.attendance = s.filled ? Math.round((100 * s.approvedDays) / s.filled) : 0;
  return s;
}

function downloadCsv(emp, from, to, schedules, approved) {
  const rows = [["Date", "Day", "Type", "Status", "Shift", "Hours"]];
  eachDay(from, to).forEach((d) => {
    const i = getDay(emp, d, schedules, approved);
    rows.push([keyOf(d), DOW[d.getDay()], i.type, i.status || "", i.type === "work" ? `${i.rule.start}-${i.rule.end}` : i.label || "", i.hours || 0]);
  });
  const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `timesheet-${emp.id}-${MONTHS[from.getMonth()]}-${from.getFullYear()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* =====================  SMALL COMPONENTS  ===================== */
const Icon = ({ children, tone }) => <div className={`et-ic et-ic--${tone}`}>{children}</div>;

function StatCard({ icon, tone, value, label }) {
  return (
    <div className="et-stat">
      <Icon tone={tone}>{icon}</Icon>
      <div><b>{value}</b><small>{label}</small></div>
    </div>
  );
}

function WeekView({ emp, anchor, schedules, approved, statusFilter }) {
  const mon = mondayOf(anchor);
  const days = eachDay(mon, addDays(mon, 6));
  const infos = days.map((d) => getDay(emp, d, schedules, approved));
  const scheduled = infos.reduce((s, i) => s + (i.type === "work" ? i.hours : 0), 0);
  const worked = infos.reduce((s, i) => s + (i.type === "work" && i.status === "Approved" ? i.hours : 0), 0);
  return (
    <div className="et-week">
      <div className="et-week__grid">
        {days.map((d) => (
          <div key={keyOf(d)} className="et-week__head"><span>{DOW[d.getDay()]}</span><b>{d.getDate()}</b></div>
        ))}
        {infos.map((i, n) => {
          const dim = statusFilter !== "All" && i.type === "work" && i.status !== statusFilter;
          if (i.type === "work")
            return (
              <div key={n} className={`et-wcell et-wcell--${i.status.toLowerCase()} ${dim ? "is-dim" : ""}`}>
                <span className={`et-wcell__status et-wcell__status--${i.status.toLowerCase()}`}>{i.status}</span>
                <div className="et-wcell__time">{i.rule.start} → {i.rule.end}</div>
                <div className="et-wcell__sub">☕ {hrs(i.hours)}h · {i.rule.breakMin}m break</div>
                <div className="et-wcell__shift">{i.rule.shift}</div>
              </div>
            );
          const label = i.type === "off" ? "Week Off" : i.type === "leave" ? "Leave" : i.label;
          return (
            <div key={n} className={`et-wcell et-wcell--${i.type}`}>
              <div className="et-wcell__center">{i.type === "off" && <span>🔒</span>}<b>{label}</b></div>
            </div>
          );
        })}
      </div>
      <div className="et-week__foot">
        <div>Scheduled: <b>{scheduled.toFixed(2)} hrs</b></div>
        <div>Worked: <b>{worked.toFixed(2)} hrs</b></div>
      </div>
    </div>
  );
}

function MonthView({ emp, anchor, schedules, approved, statusFilter }) {
  const [from, to] = monthRange(anchor);
  const days = eachDay(from, to);
  const s = summarize(emp, from, to, schedules, approved);
  const rows = [
    ["Total Working Hours", `${s.scheduled} hrs`, ""], ["Regular Hours", `${s.scheduled} hrs`, ""], ["Overtime", "0 hrs", "warn"],
    ["Leave Days", s.leave, "warn"], ["Week-Off Days", s.off, ""], ["Holidays", s.holiday, "bad"],
    ["Attendance %", `${s.attendance}%`, s.attendance >= 90 ? "good" : "bad"], ["Missing Timesheets", s.missing, "bad"],
  ];
  return (
    <div className="et-month">
      <div className="et-cal">
        {DOW.map((d) => <div key={d} className="et-cal__head">{d}</div>)}
        {Array.from({ length: from.getDay() }).map((_, n) => <div key={`b${n}`} className="et-day et-day--blank" />)}
        {days.map((d) => {
          const i = getDay(emp, d, schedules, approved);
          const dim = statusFilter !== "All" && i.type === "work" && i.status !== statusFilter;
          const tone = i.type === "work" ? i.status.toLowerCase() : i.type;
          return (
            <div key={keyOf(d)} className={`et-day ${keyOf(d) === keyOf(TODAY) ? "is-today" : ""} ${dim ? "is-dim" : ""}`}>
              <div className="et-day__top"><b>{d.getDate()}</b><i className={`et-dot et-dot--${tone}`} /></div>
              {i.type === "work" && i.status === "Approved" && <><div className="et-t et-t--approved">{hrs(i.hours)}h</div><div className="et-time">{i.rule.start}–{i.rule.end}</div></>}
              {i.type === "work" && i.status === "Pending" && <><div className="et-t et-t--pending">Pending</div><div className="et-time">{i.rule.start}–{i.rule.end}</div></>}
              {i.type === "off" && <div className="et-time">Week Off</div>}
              {i.type === "leave" && <div className="et-t et-t--leave">Leave</div>}
              {i.type === "holiday" && <div className="et-t et-t--holiday">{i.label}</div>}
            </div>
          );
        })}
      </div>
      <aside className="et-summary">
        <h3>Monthly Summary</h3>
        {rows.map(([l, v, c]) => <div key={l} className="et-summary__row"><span>{l}</span><b className={c ? `is-${c}` : ""}>{v}</b></div>)}
      </aside>
    </div>
  );
}

/* =====================  MAIN PAGE — single employee, own data only  ===================== */
export default function EmployeeTimesheet({ employeeId = "EMP001", onAddTimesheet }) {
  // Real app: employeeId comes from the logged-in session, and your API must return ONLY this user's data.
  const emp = EMPLOYEES.find((e) => e.id === employeeId);

  const [tab, setTab] = useState("timesheets");
  const [view, setView] = useState("week");
  const [anchor, setAnchor] = useState(TODAY);
  const [statusFilter, setStatusFilter] = useState("All");
  const approved = useMemo(() => new Set(INITIAL_APPROVED), []);
  const schedules = INITIAL_SCHEDULES;

  if (!emp) return <div className="et-page"><div className="et-empty">Employee not found.</div></div>;

  const [mFrom, mTo] = monthRange(anchor);
  const rule = ruleAt(emp, schedules, TODAY);
  const stats = summarize(emp, mFrom, mTo, schedules, approved);
  const submissions = eachDay(mFrom, mTo)
    .map((d) => ({ d, i: getDay(emp, d, schedules, approved) }))
    .filter(({ d, i }) => i.type === "work" && d <= TODAY && (statusFilter === "All" || i.status === statusFilter));

  const move = (n) => setAnchor(view === "week" ? addDays(anchor, 7 * n) : new Date(anchor.getFullYear(), anchor.getMonth() + n, 1));
  const monday = mondayOf(anchor);
  const sunday = addDays(monday, 6);
  const label = view === "week"
    ? `W${isoWeek(monday)}: ${monday.getDate()} ${MONTHS[monday.getMonth()].slice(0, 3)} – ${sunday.getDate()} ${MONTHS[sunday.getMonth()].slice(0, 3)}, ${sunday.getFullYear()}`
    : `${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`;
  const initials = emp.name.split(" ").map((p) => p[0]).join("").slice(0, 2);

  return (
    <div className="et-page">
      <div className="et-topbar">
        <h2>My Timesheet</h2>
        <div className="et-topbar__right">
          <span className="et-bell" aria-label="Notifications">🔔<i /></span>
          <span className="et-avatar" title={emp.name}>{initials}</span>
        </div>
      </div>

      <div className="et-body">
        <section className="et-hero">
          <div className="et-hero__row">
            <div className="et-hero__title">
              <div className="et-hero__icon">🕒</div>
              <div>
                <h1>My Timesheet</h1>
                <p>Your hours, leave and overtime from your assigned schedule.</p>
              </div>
            </div>
            <div className="et-hero__actions">
              <span className="et-pill">{emp.name} · <b>{emp.id}</b></span>
              <button className="et-btn et-btn--ghost" onClick={() => downloadCsv(emp, mFrom, mTo, schedules, approved)}>⭳ Export</button>
              <button className="et-btn et-btn--white" onClick={onAddTimesheet}>＋ Add Timesheet</button>
            </div>
          </div>
          <div className="et-hero__chips">
            <span className="et-pill">{rule.type}</span>
            <span className="et-pill">Office {rule.start} – {rule.end}</span>
            <span className="et-pill">Break {rule.breakMin}m</span>
            <span className="et-pill">{rule.tz}</span>
          </div>
        </section>

        <section className="et-stats">
          <StatCard icon="📄" tone="green" value={stats.filled} label="Timesheets Filled" />
          <StatCard icon="⏳" tone="amber" value={stats.pending} label="Pending Approval" />
          <StatCard icon="✔" tone="pink" value={stats.approvedDays} label="Approved" />
          <StatCard icon="⏱" tone="blue" value={`${stats.worked} hrs`} label="Approved Hours" />
        </section>

        <section className="et-filters">
          <label>MONTH
            <select value={anchor.getMonth()} onChange={(e) => setAnchor(new Date(anchor.getFullYear(), Number(e.target.value), 1))}>
              {MONTHS.map((m, n) => <option key={m} value={n}>{m} {anchor.getFullYear()}</option>)}
            </select>
          </label>
          <label>STATUS
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All</option><option>Pending</option><option>Approved</option>
            </select>
          </label>
        </section>

        <section className="et-panel">
          <div className="et-tabs" role="tablist">
            <button role="tab" aria-selected={tab === "timesheets"} onClick={() => setTab("timesheets")}>My Timesheet</button>
            <button role="tab" aria-selected={tab === "holidays"} onClick={() => setTab("holidays")}>Holidays ({HOLIDAYS.length})</button>
            <button role="tab" aria-selected={tab === "status"} onClick={() => setTab("status")}>Approval Status ({stats.pending})</button>
          </div>

          {tab === "timesheets" && (
            <>
              <div className="et-toolbar">
                <div className="et-toolbar__left">
                  <span className="et-me"><span className="et-av">{initials}</span><b>{emp.name}</b><small>{emp.id}</small></span>
                  <span className="et-toolbar__rule">Schedule: <b>{rule.name}</b></span>
                </div>
                <div className="et-toolbar__right">
                  <div className="et-seg">
                    <button aria-pressed={view === "week"} onClick={() => setView("week")}>Weekly</button>
                    <button aria-pressed={view === "month"} onClick={() => setView("month")}>Monthly</button>
                  </div>
                  <div className="et-navbox">
                    <button onClick={() => move(-1)} aria-label="Previous">‹</button>
                    <span>{label}</span>
                    <button onClick={() => move(1)} aria-label="Next">›</button>
                  </div>
                </div>
              </div>
              {view === "week"
                ? <WeekView emp={emp} anchor={anchor} schedules={schedules} approved={approved} statusFilter={statusFilter} />
                : <MonthView emp={emp} anchor={anchor} schedules={schedules} approved={approved} statusFilter={statusFilter} />}
            </>
          )}

          {tab === "holidays" && (
            <ul className="et-list">
              {HOLIDAYS.map((h) => {
                const d = new Date(h.date);
                return <li key={h.date}><b>{h.name}</b><span>{DOW[d.getDay()]}, {d.getDate()} {MONTHS[d.getMonth()]} {d.getFullYear()}</span></li>;
              })}
            </ul>
          )}

          {tab === "status" && (
            <ul className="et-list">
              {submissions.map(({ d, i }) => (
                <li key={keyOf(d)}>
                  <b>{DOW[d.getDay()]}, {d.getDate()} {MONTHS[d.getMonth()].slice(0, 3)}</b>
                  <span>{i.rule.start}–{i.rule.end} · {hrs(i.hours)}h</span>
                  <em className={i.status === "Approved" ? "is-ok" : "is-pending"}>{i.status}</em>
                </li>
              ))}
              {submissions.length === 0 && <li className="et-empty">Nothing to show.</li>}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}