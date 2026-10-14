import React, { useCallback, useMemo, useState } from "react";
import "./Timesheet.css";

/* =====================================================================
   Timesheet — super-admin view for ANY company or team. Shifts, work types,
   departments and people all come from the `config` prop, so nothing is
   fixed to one industry. Replace DEFAULT_CONFIG with your API data.
   ===================================================================== */

// Always the real current date (midnight), so "today" is never treated as a future day
const NOW = new Date();
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
// Weeks that end before this Monday are signed off and locked
const LOCK_BEFORE = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - ((TODAY.getDay() + 6) % 7));

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const HOLIDAYS = { "2026-10-02": "Gandhi Jayanti", "2026-11-10": "Diwali", "2026-12-25": "Christmas" };

// Rotational week-off pattern (0 = Sun). Week 1: Sun+Mon, Week 2: Tue, Week 3: Sat+Sun
const ROTA_OFF = [[0, 1], [2], [6, 0]];

// Demo leave dates are relative to today (0 = today, -1 = yesterday, 1 = tomorrow...)
const d = (offset) => {
  const x = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + offset);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
const TZ = "Asia/Kolkata";

/* ---------- Default setup: neutral, works for any company ----------
   Pass your own <Timesheet config={...} /> with your shifts, departments,
   work types and employees. Nothing here is tied to one industry. */
const DEFAULT_CONFIG = {
  labels: { employees: "Employees", departments: "Departments" },
  tasks: ["Project work", "Meetings", "Operations", "Training", "Support"],
  shifts: {
    general: { name: "General shift", workDays: [1, 2, 3, 4, 5], start: "09:00", end: "18:00", brk: 1, tz: TZ, desc: "Mon–Fri" },
    early: { name: "Early shift", workDays: [1, 2, 3, 4, 5, 6], start: "06:00", end: "14:00", brk: 0.5, tz: TZ, desc: "Mon–Sat" },
    late: { name: "Late shift", workDays: [1, 2, 3, 4, 5, 6], start: "14:00", end: "22:00", brk: 0.5, tz: TZ, desc: "Mon–Sat" },
    rota: { name: "Rotational", rota: true, start: "09:00", end: "18:00", brk: 1, tz: TZ, desc: "3-week rotation" },
  },
  employees: [
    { id: 1, name: "Arun", role: "Team Lead", dept: "Operations", rule: "general", leaves: [d(6)] },
    { id: 2, name: "Divya", role: "Executive", dept: "Sales", rule: "general", leaves: [d(-1)] },
    { id: 3, name: "Karthik", role: "Analyst", dept: "Finance", rule: "general", leaves: [d(-10)] },
    { id: 4, name: "Priya", role: "Coordinator", dept: "Admin", rule: "general", leaves: [d(-1)] },
    { id: 5, name: "Meena", role: "Supervisor", dept: "Operations", rule: "early", leaves: [d(1)] },
    { id: 6, name: "Ravi", role: "Associate", dept: "Support", rule: "late", leaves: [d(-2)] },
    { id: 7, name: "Sana", role: "Associate", dept: "Support", rule: "rota", leaves: [] },
    { id: 8, name: "Vikram", role: "Manager", dept: "Sales", rule: "rota", leaves: [d(1)] },
  ],
};

const STATUS_OPTIONS = [
  ["all", "All statuses"],
  ["pending", "Has pending approvals"],
  ["missing", "Has missing timesheets"],
  ["leave", "Has leave"],
];

/* ---------- Helpers ---------- */
const keyOf = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
const addDays = (dt, n) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n);
const mondayOf = (dt) => addDays(dt, -((dt.getDay() + 6) % 7));
const fmt = (h) => {
  const m = Math.round(h * 60);
  return `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}`;
};
const QUARTERS = { 0: "", 0.25: "¼", 0.5: "½", 0.75: "¾" };
const short = (h) => {
  const whole = Math.floor(h);
  const frac = Math.round((h - whole) * 100) / 100;
  return QUARTERS[frac] !== undefined ? `${whole}${QUARTERS[frac]}` : h.toFixed(1);
};
const daysBetween = (from, to) => {
  const out = [];
  for (let x = from; x <= to; x = addDays(x, 1)) out.push(x);
  return out;
};
const getRange = (view, anchor) =>
  view === "week"
    ? [mondayOf(anchor), addDays(mondayOf(anchor), 6)]
    : [new Date(anchor.getFullYear(), anchor.getMonth(), 1), new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)];

const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const stdHours = (r) => ((toMin(r.end) - toMin(r.start) + 1440) % 1440) / 60 - r.brk;
const timeRange = (r) => `${r.start}–${r.end}${toMin(r.end) <= toMin(r.start) ? " (+1)" : ""}`;
const weekTarget = (emp) => stdHours(emp.r) * (emp.r.rota ? 5 : emp.r.workDays.length);

/** Shift rule -> what kind of day is this for this employee? (demo logic) */
function getDayInfo(date, emp) {
  const r = emp.r;
  const k = keyOf(date);
  if (HOLIDAYS[k]) return { type: "holiday", label: HOLIDAYS[k] };

  const weekNo = Math.floor((mondayOf(date) - new Date(2026, 0, 5)) / 6048e5);
  const isOff = r.rota
    ? ROTA_OFF[(((weekNo + emp.id) % 3) + 3) % 3].includes(date.getDay())
    : !r.workDays.includes(date.getDay());
  if (isOff) return { type: "off" };
  if (emp.leaves.includes(k)) return { type: "leave" };

  const std = stdHours(r);
  const taskIdx = (date.getDate() + emp.id) % emp.tasks.length;
  const task = emp.tasks[taskIdx];
  const diff = Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()) - new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate())) / 864e5);
  if (diff > 0) return { type: "scheduled", std, task, taskIdx };
  if (diff < 0 && (date.getDate() + emp.id) % 23 === 1) return { type: "missing", std, task, taskIdx }; // demo only

  const hours = std + [0, 0.25, 0, 0.5, 0][(date.getDate() + emp.id) % 5];
  return { type: "work", hours, std, task, taskIdx, ot: hours - std, status: diff >= -2 ? "Pending" : "Approved" }; // today and the last 2 days stay Pending
}

function calcTotals(from, to, emp, infoOf) {
  const t = { total: 0, regular: 0, ot: 0, leave: 0, off: 0, holiday: 0, missing: 0, workDays: 0, pending: 0 };
  daysBetween(from, to).forEach((day) => {
    const i = infoOf(day, emp);
    if (i.type === "work") {
      t.total += i.hours; t.regular += i.std; t.ot += i.ot; t.workDays++;
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
const Avatar = ({ emp }) => (
  <span className="ts-av" style={{ "--h": (emp.id * 67) % 360 }}>{emp.name.slice(0, 2).toUpperCase()}</span>
);

function Kpi({ label, value, sub, icon, tone, children }) {
  return (
    <div className={`ts-kpi ts-kpi--${tone}`}>
      <span className="ts-kic" aria-hidden="true">{icon}</span>
      <small>{label}</small>
      <b>{value}</b>
      {sub && <span>{sub}</span>}
      {children}
    </div>
  );
}

/* One day box in the weekly view */
function DayCell({ info, emp }) {
  const r = emp.r;
  if (info.type === "off") return <div className="ts-dc ts-dc--off">Week off</div>;
  if (info.type === "leave") return <div className="ts-dc ts-dc--leave">On leave</div>;
  if (info.type === "holiday") return <div className="ts-dc ts-dc--hol"><b>{info.label}</b><small>Holiday</small></div>;

  const kind = info.type === "work" ? (info.status === "Approved" ? "ok" : "pend") : info.type;
  const statusText = { ok: "Approved", pend: "Pending approval", scheduled: "Scheduled", missing: "No timesheet" }[kind];
  const hours = info.type === "work" ? fmt(info.hours) : info.type === "scheduled" ? fmt(info.std) : "—";
  return (
    <div className={`ts-dc ts-dc--${kind}`} title={`${timeRange(r)} · ${r.brk}h break · ${info.task}`}>
      <span className="ts-time">{timeRange(r)}</span>
      <span className="ts-hours">
        {hours}
        {info.ot > 0 && <em className="ts-otchip">+{fmt(info.ot)} OT</em>}
      </span>
      <span className={`ts-task ts-tk-${info.taskIdx % 6}`}>{info.task}</span>
      <span className="ts-st">{statusText}</span>
    </div>
  );
}

/* ---------- Weekly: one row per employee, one box per day, coverage on top ---------- */
function WeekView({ list, totals, from, to, infoOf, onPick, onApprove }) {
  const days = daysBetween(from, to);
  const locked = to < LOCK_BEFORE;
  const todayKey = keyOf(TODAY);

  const cover = days.map((day) => {
    const c = { work: 0, leave: 0, off: 0, hol: 0 };
    list.forEach((e) => {
      const t = infoOf(day, e).type;
      if (t === "leave") c.leave++;
      else if (t === "off") c.off++;
      else if (t === "holiday") c.hol++;
      else c.work++;
    });
    return c;
  });
  const pct = (n) => `${(100 * n) / list.length}%`;

  return (
    <div className="ts-scroll">
      <div className="ts-weekgrid">
        {locked && <div className="ts-lock">🔒 This week is signed off and locked. Approvals are disabled.</div>}

        <div className="ts-line ts-line--head">
          <div className="ts-sticky ts-corner">{list.length} {list.length === 1 ? "person" : "people"}</div>
          {days.map((day, i) => (
            <div key={keyOf(day)} className={`ts-dh ${keyOf(day) === todayKey ? "is-today" : ""}`}>
              <span className="ts-dh-top"><b>{DAYS[day.getDay()]}</b> {day.getDate()} {MONTHS[day.getMonth()].slice(0, 3)}</span>
              <span className="ts-mix" aria-hidden="true">
                <i style={{ width: pct(cover[i].work), background: "var(--ts-ok)" }} />
                <i style={{ width: pct(cover[i].leave), background: "var(--ts-lv)" }} />
                <i style={{ width: pct(cover[i].hol), background: "var(--ts-hol)" }} />
                <i style={{ width: pct(cover[i].off), background: "var(--ts-line)" }} />
              </span>
              <small>{cover[i].hol ? "Holiday" : `${cover[i].work} working`}</small>
              <small>{cover[i].leave} leave · {cover[i].off} off</small>
            </div>
          ))}
          <div className="ts-dh"><span className="ts-dh-top"><b>Week total</b></span></div>
        </div>

        {list.map((e, n) => {
          const t = totals[n];
          const target = weekTarget(e);
          const fill = Math.min(100, Math.round((100 * t.total) / target));
          return (
            <div className="ts-line" key={e.id}>
              <div className="ts-sticky ts-who">
                <Avatar emp={e} />
                <div>
                  <button className="ts-name" onClick={() => onPick(e.id)}>{e.name}</button>
                  <small>{e.role}</small>
                  <small>{e.r.name}</small>
                </div>
              </div>
              {days.map((day) => <DayCell key={keyOf(day)} info={infoOf(day, e)} emp={e} />)}
              <div className="ts-tot">
                <b>{fmt(t.total)}</b><span className="ts-of">of {fmt(target)}</span>
                <span className="ts-prog"><i style={{ width: `${fill}%` }} /></span>
                <span className="ts-meta">{t.ot > 0 ? `OT ${fmt(t.ot)}` : "No overtime"} · {t.leave} leave</span>
                {t.missing > 0 && <span className="ts-badge ts-missing">{t.missing} missing</span>}
                {!locked && t.pending > 0 && (
                  <button className="ts-approve" onClick={() => onApprove([e])}>
                    Approve {t.pending} {t.pending === 1 ? "day" : "days"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Monthly (a): team grid — everyone, every day, one screen ---------- */
function GridCell({ info, isToday }) {
  const today = isToday ? " is-today" : "";
  switch (info.type) {
    case "work": {
      const cls = info.status === "Pending" ? "pend" : info.ot > 0 ? "ot" : "ok";
      return <span className={`ts-g ts-g--${cls}${today}`}>{short(info.hours)}</span>;
    }
    case "off": return <span className={`ts-g ts-g--off${today}`} />;
    case "leave": return <span className={`ts-g ts-g--leave${today}`}>L</span>;
    case "holiday": return <span className={`ts-g ts-g--hol${today}`}>H</span>;
    case "missing": return <span className={`ts-g ts-g--miss${today}`}>!</span>;
    default: return <span className={`ts-g ts-g--sch${today}`}>·</span>;
  }
}

const cellTitle = (day, info) => {
  const base = `${DAYS[day.getDay()]} ${day.getDate()} ${MONTHS[day.getMonth()].slice(0, 3)}`;
  const label = {
    work: `${fmt(info.hours || 0)} worked${info.ot > 0 ? ` (+${fmt(info.ot)} OT)` : ""} · ${info.status}`,
    off: "Week off", leave: "On leave", holiday: `Holiday: ${info.label}`,
    missing: "No timesheet", scheduled: "Scheduled",
  }[info.type];
  return `${base} — ${label}`;
};

function TeamGrid({ list, totals, from, to, infoOf, onPick }) {
  const days = daysBetween(from, to);
  const todayKey = keyOf(TODAY);
  const onDuty = days.map((day) => list.filter((e) => ["work", "scheduled", "missing"].includes(infoOf(day, e).type)).length);

  return (
    <div className="ts-scroll">
      {/* name column and totals column stay pinned; only the days scroll if the screen is narrow */}
      <div className="ts-mgrid" style={{ "--dcols": `repeat(${days.length}, minmax(34px, 1fr))`, minWidth: 180 + days.length * 37 + 240 }}>
        <div className="ts-mrow ts-mrow--head">
          <div className="ts-sticky ts-mname ts-corner">Name</div>
          <div className="ts-mdays">
            {days.map((day) => (
              <div key={keyOf(day)} className={`ts-gh ${keyOf(day) === todayKey ? "is-today" : ""}`}>
                <small>{DAYS[day.getDay()][0]}</small>{day.getDate()}
              </div>
            ))}
          </div>
          <div className="ts-mtot ts-mtot--head"><span>Hours</span><span>OT</span><span>Leave</span><span>Att.</span></div>
        </div>

        {list.map((e, n) => (
          <div className="ts-mrow" key={e.id}>
            <div className="ts-sticky ts-mname ts-who ts-who--sm">
              <Avatar emp={e} />
              <div>
                <button className="ts-name" onClick={() => onPick(e.id)}>{e.name}</button>
                <small>{e.role}</small>
              </div>
            </div>
            <div className="ts-mdays">
              {days.map((day) => {
                const info = infoOf(day, e);
                return <span key={keyOf(day)} title={cellTitle(day, info)} className="ts-gwrap"><GridCell info={info} isToday={keyOf(day) === todayKey} /></span>;
              })}
            </div>
            <div className="ts-mtot">
              <b>{fmt(totals[n].total)}</b>
              <span className="ts-ot-t">{totals[n].ot > 0 ? fmt(totals[n].ot) : "—"}</span>
              <span>{totals[n].leave}d</span>
              <span>{totals[n].attendance}%</span>
            </div>
          </div>
        ))}

        <div className="ts-mrow ts-mrow--foot">
          <div className="ts-sticky ts-mname ts-corner">On duty</div>
          <div className="ts-mdays">
            {onDuty.map((c, i) => <div key={i} className="ts-gh">{c}</div>)}
          </div>
          <div className="ts-mtot" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Monthly (b): one calendar per employee ---------- */
function DayTag({ info }) {
  switch (info.type) {
    case "work":
      return (
        <div className={`ts-tag ${info.status === "Approved" ? "ts-tag--ok" : "ts-tag--pend"}`}>
          <b>{fmt(info.hours)}</b>
          <small>{info.ot > 0 ? `+${fmt(info.ot)} OT · ` : ""}{info.status}</small>
        </div>
      );
    case "off": return <div className="ts-tag ts-tag--off">Week off</div>;
    case "leave": return <div className="ts-tag ts-tag--leave">On leave</div>;
    case "holiday": return <div className="ts-tag ts-tag--hol"><b>Holiday</b><small>{info.label}</small></div>;
    case "scheduled": return <div className="ts-tag ts-tag--sch">Scheduled</div>;
    case "missing": return <div className="ts-tag ts-tag--miss">No timesheet</div>;
    default: return null;
  }
}

function MonthCalendar({ emp, from, to, infoOf }) {
  const weeks = [];
  for (let s = mondayOf(from); s <= to; s = addDays(s, 7)) weeks.push(daysBetween(s, addDays(s, 6)));
  return (
    <div className="ts-scroll">
      <div className="ts-cal">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((n) => <div key={n} className="ts-h">{n}</div>)}
        <div className="ts-h">Week</div>
        {weeks.map((w) => {
          const weekTotal = w.reduce((s, day) => {
            const i = infoOf(day, emp);
            return day.getMonth() === from.getMonth() && i.type === "work" ? s + i.hours : s;
          }, 0);
          return (
            <React.Fragment key={keyOf(w[0])}>
              {w.map((day) => {
                const inMonth = day.getMonth() === from.getMonth();
                return (
                  <div key={keyOf(day)} className={`ts-cell ${inMonth ? "" : "is-out"} ${keyOf(day) === keyOf(TODAY) ? "is-today" : ""}`}>
                    <span className="ts-n">{day.getDate()}</span>
                    {inMonth && <DayTag info={infoOf(day, emp)} />}
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

function MonthCalendars({ list, totals, from, to, infoOf, onPick }) {
  return list.map((e, n) => (
    <section key={e.id} className="ts-emp">
      <div className="ts-pf">
        <Avatar emp={e} />
        {list.length > 1 ? <button className="ts-name" onClick={() => onPick(e.id)}>{e.name}</button> : <b>{e.name}</b>}
        <span className="ts-chip">{e.role}, {e.dept}</span>
        <span className="ts-chip">{e.r.name} {timeRange(e.r)} ({e.r.desc})</span>
        <span className="ts-chip">{fmt(totals[n].total)} worked</span>
        <span className="ts-chip">OT {fmt(totals[n].ot)}</span>
        <span className="ts-chip">Attendance {totals[n].attendance}%</span>
      </div>
      <MonthCalendar emp={e} from={from} to={to} infoOf={infoOf} />
    </section>
  ));
}

/* ---------- Main page ---------- */
export default function Timesheet({ config = DEFAULT_CONFIG }) {
  const [view, setView] = useState("week");
  const [layout, setLayout] = useState("grid"); // monthly: "grid" | "calendar"
  const [anchor, setAnchor] = useState(TODAY);
  const [dept, setDept] = useState("all");
  const [empId, setEmpId] = useState("all");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [approved, setApproved] = useState(() => new Set());

  const labels = config.labels || DEFAULT_CONFIG.labels;
  const emps = useMemo(
    () => config.employees.map((e) => ({ ...e, r: config.shifts[e.rule], tasks: config.tasks })),
    [config]
  );
  const infoOf = useCallback((day, e) => {
    const i = getDayInfo(day, e);
    return i.type === "work" && approved.has(`${e.id}:${keyOf(day)}`) ? { ...i, status: "Approved" } : i;
  }, [approved]);

  const [from, to] = useMemo(() => getRange(view, anchor), [view, anchor]);

  const { list, totals } = useMemo(() => {
    const base = emps.filter((e) =>
      (dept === "all" || e.dept === dept) &&
      (empId === "all" || e.id === Number(empId)) &&
      e.name.toLowerCase().includes(query.toLowerCase()));
    const all = base.map((e) => calcTotals(from, to, e, infoOf));
    const keep = all.map((t) =>
      status === "all" || (status === "pending" && t.pending > 0) || (status === "missing" && t.missing > 0) || (status === "leave" && t.leave > 0));
    return { list: base.filter((_, i) => keep[i]), totals: all.filter((_, i) => keep[i]) };
  }, [emps, dept, empId, query, status, from, to, infoOf]);
  const agg = useMemo(() => sumTotals(totals), [totals]);

  const move = (n) =>
    setAnchor(view === "week" ? addDays(anchor, 7 * n) : new Date(anchor.getFullYear(), anchor.getMonth() + n, 1));
  const pick = (id) => { setEmpId(String(id)); setDept("all"); setStatus("all"); };
  const approve = (people) =>
    setApproved((prev) => {
      const next = new Set(prev);
      people.forEach((e) => daysBetween(from, to).forEach((day) => {
        const i = getDayInfo(day, e);
        if (i.type === "work" && i.status === "Pending") next.add(`${e.id}:${keyOf(day)}`);
      }));
      return next;
    });

  const label = view === "month"
    ? `${MONTHS[from.getMonth()]} ${from.getFullYear()}`
    : `${from.getDate()} ${MONTHS[from.getMonth()].slice(0, 3)} – ${to.getDate()} ${MONTHS[to.getMonth()].slice(0, 3)} ${to.getFullYear()}`;

  return (
    <div className="ts-wrap">
      <header className="ts-head">
        <h1>Timesheets</h1>
        <p>Hours, leave and overtime for everyone on the team, filled automatically from each person&apos;s shift.</p>
        <div className="ts-shifts">
          {Object.values(config.shifts).map((r) => (
            <span className="ts-chip" key={r.name}>
              <b>{r.name}</b> {timeRange(r)}, {r.desc}
            </span>
          ))}
        </div>
      </header>

      <section className="ts-kpis" aria-label="Summary for the selected period">
        <Kpi icon="👥" tone="blue" label={labels.employees} value={list.length} sub={`${agg.workDays || 0} working days logged`} />
        <Kpi icon="⏱" tone="green" label="Total hours" value={fmt(agg.total || 0)} sub={`Overtime ${fmt(agg.ot || 0)}`} />
        <Kpi icon="⏳" tone="amber" label="Pending approval" value={agg.pending || 0} sub="days waiting">
          {(agg.pending || 0) > 0 && <button className="ts-approve" onClick={() => approve(list)}>Approve all</button>}
        </Kpi>
        <Kpi icon="⚠" tone="rose" label="Missing timesheets" value={agg.missing || 0} sub="days not filled" />
        <Kpi icon="🌴" tone="violet" label="Leave days" value={agg.leave || 0} sub={`${agg.off || 0} week-off days`} />
        <Kpi icon="✓" tone="teal" label="Attendance" value={`${attendanceOf(agg)}%`} sub={`${agg.holiday || 0} holiday days`} />
      </section>

      <main className="ts-panel">
        <div className="ts-top">
        <div className="ts-filters">
          <select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department">
            <option value="all">All {labels.departments.toLowerCase()}</option>
            {[...new Set(emps.map((e) => e.dept))].map((x) => <option key={x}>{x}</option>)}
          </select>
          <select value={empId} onChange={(e) => setEmpId(e.target.value)} aria-label="Employee">
            <option value="all">All {labels.employees.toLowerCase()}</option>
            {emps.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name" aria-label="Search employee" />
        </div>

        <div className="ts-bar">
          <div className="ts-bar-l">
            <div className="ts-tabs" role="tablist">
              {["week", "month"].map((v) => (
                <button key={v} role="tab" aria-selected={view === v} className="ts-tab" onClick={() => setView(v)}>
                  {v === "week" ? "Weekly" : "Monthly"}
                </button>
              ))}
            </div>
            {view === "month" && (
              <div className="ts-tabs ts-tabs--sm" role="tablist" aria-label="Monthly layout">
                {[["grid", "Team grid"], ["calendar", "Calendars"]].map(([v, l]) => (
                  <button key={v} role="tab" aria-selected={layout === v} className="ts-tab" onClick={() => setLayout(v)}>{l}</button>
                ))}
              </div>
            )}
            {empId !== "all" && (
              <button className="ts-btn" onClick={() => setEmpId("all")}>Show everyone</button>
            )}
          </div>
          <div className="ts-nav">
            <button className="ts-btn" onClick={() => move(-1)} aria-label="Previous">‹</button>
            <span className="ts-lbl">{label}</span>
            <button className="ts-btn" onClick={() => move(1)} aria-label="Next">›</button>
            <button className="ts-btn ts-btn--pri" onClick={() => setAnchor(TODAY)}>Today</button>
          </div>
        </div>
        </div>

        {list.length === 0 ? (
          <div className="ts-empty">No employees match these filters. Clear a filter or search to see everyone.</div>
        ) : view === "week" ? (
          <WeekView list={list} totals={totals} from={from} to={to} infoOf={infoOf} onPick={pick} onApprove={approve} />
        ) : layout === "grid" ? (
          <TeamGrid list={list} totals={totals} from={from} to={to} infoOf={infoOf} onPick={pick} />
        ) : (
          <MonthCalendars list={list} totals={totals} from={from} to={to} infoOf={infoOf} onPick={pick} />
        )}

        <div className="ts-legend">
          <span><i style={{ background: "var(--ts-ok)" }} />Approved</span>
          <span><i style={{ background: "var(--ts-pen)" }} />Pending approval</span>
          <span><i style={{ background: "var(--ts-ot)" }} />Overtime</span>
          <span><i style={{ background: "var(--ts-lv)" }} />Leave / missing</span>
          <span><i style={{ background: "var(--ts-hol)" }} />Holiday</span>
          <span><i className="ts-hatch" />Week off</span>
          <span><i className="ts-dash" />Scheduled</span>
        </div>

        <div className="ts-sum">
          {[["Working days", agg.workDays || 0], ["Regular hours", fmt(agg.regular || 0)], ["Overtime", fmt(agg.ot || 0)],
            ["Week-off days", agg.off || 0], ["Holidays", agg.holiday || 0], ["Leave days", agg.leave || 0]]
            .map(([l, v]) => <div key={l}><small>{l}</small><b>{v}</b></div>)}
        </div>
      </main>
    </div>
  );
}