import React, { useEffect, useMemo, useState } from "react";
import "./Employeetimesheet.css";


/* =====================  SAMPLE DATA (replace with API data)  ===================== */
// Always the real current date (midnight), so "today" is never treated as a future day
const NOW = new Date();
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
// Demo leave dates are relative to today (0 = today, -1 = yesterday, 1 = tomorrow...)
const rel = (n) => {
  const x = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + n);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
const TASKS = ["Project work", "Client meeting", "Code review", "Documentation", "Training", "Support tickets"];

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const SCHEDULES = {
  india: { name: "India General Schedule", type: "Fixed / Static Schedule", workDays: [1, 2, 3, 4, 5, 6], start: "09:00", end: "18:00", breakMin: 60, tz: "Asia/Kolkata", shift: "General Day" },
  us: { name: "US Support Schedule", type: "Fixed / Static Schedule", workDays: [2, 3, 4, 5, 6], start: "08:00", end: "17:00", breakMin: 60, tz: "America/New_York", shift: "US Day Shift" },
  rota: { name: "Rotational Schedule", type: "Rotational Schedule", workDays: null, start: "09:00", end: "18:00", breakMin: 60, tz: "Asia/Kolkata", shift: "Rota Shift" },
};
const ROTA_OFF = [[0, 1], [2], [6, 0]]; // week 1: Sun+Mon, week 2: Tue, week 3: Sat+Sun

// Real 2026 dates. `countries` decides which employees get that holiday (IN = India staff, US = US staff).
const HOLIDAYS = [
  { date: "2026-10-02", name: "Gandhi Jayanti", countries: ["IN"] },
  { date: "2026-10-20", name: "Dussehra", countries: ["IN"] },
  { date: "2026-11-08", name: "Diwali", countries: ["IN"] },
  { date: "2026-11-26", name: "Thanksgiving", countries: ["US"] },
  { date: "2026-12-25", name: "Christmas", countries: ["IN", "US"] },
];
// Only the holidays that apply to this employee's country (default India)
const holidaysFor = (emp) => HOLIDAYS.filter((h) => h.countries.includes(emp.country || "IN")).sort((a, b) => a.date.localeCompare(b.date));

const EMPLOYEES = [
  { id: "EMP001", name: "Priya Sharma", dept: "Engineering", location: "Chennai", leaves: [rel(-6), rel(-20)] },
  { id: "EMP002", name: "Arun Kumar", dept: "Engineering", location: "Chennai", leaves: [rel(6)] },
  { id: "EMP003", name: "Divya R", dept: "Design", location: "Bengaluru", leaves: [rel(-1)] },
  { id: "EMP004", name: "Karthik S", dept: "Engineering", location: "Bengaluru", leaves: [] },
  { id: "EMP005", name: "Meena Iyer", dept: "HR", location: "Chennai", leaves: [rel(-3)] },
  { id: "EMP006", name: "Vikram Das", dept: "Support", location: "New York", country: "US", leaves: [] },
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
// Optional overrides from your API ("EMP001|2026-10-05"). In this demo, status is derived from the date:
// older than 2 days = Approved (a few Rejected), today + last 2 days = Pending, future = Scheduled.
const INITIAL_APPROVED = [];

/* =====================  HELPERS  ===================== */
const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayOf = (d) => addDays(d, -((d.getDay() + 6) % 7));
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const shiftHours = (r) => (toMin(r.end) - toMin(r.start) - r.breakMin) / 60;
const hrs = (n) => `${Number.isInteger(n) ? n : Number(n.toFixed(2))}`;
const fmtHM = (h) => { const m = Math.round(h * 60); return `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}`; };
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
// "09:00" -> "9", "18:05" -> "6:05"; a day box reads like "9 to 6"
const clock12 = (t) => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""}`; };
const timeSpan = (a, b) => `${clock12(a)} to ${clock12(b)}`;
// worked days: clock-in to clock-out; scheduled days: the planned shift
const dayTime = (i) => (i.status === "Scheduled" ? timeSpan(i.rule.start, i.rule.end) : timeSpan(i.in, i.out));
const isoWeek = (d) => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  return Math.ceil(((t - new Date(Date.UTC(t.getUTCFullYear(), 0, 1))) / 864e5 + 1) / 7);
};
const monthRange = (a) => [new Date(a.getFullYear(), a.getMonth(), 1), new Date(a.getFullYear(), a.getMonth() + 1, 0)];
const eachDay = (from, to) => { const out = []; for (let d = from; d <= to; d = addDays(d, 1)) out.push(d); return out; };

const taskCls = (t) => `et-tk-${Math.max(0, TASKS.indexOf(t)) % 6}`;
const MON3 = (d) => MONTHS[d.getMonth()].slice(0, 3);
const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const longDate = (d) => `${DOW[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
// props that make any element clickable + keyboard friendly
const press = (fn) => ({ role: "button", tabIndex: 0, onClick: fn, onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } } });

const ruleAt = (emp, schedules, date) => {
  const k = keyOf(date);
  let cur = schedules[emp.id][0];
  schedules[emp.id].forEach((s) => { if (s.from <= k) cur = s; });
  return SCHEDULES[cur.rule];
};

/** Demo only: split a day's hours over 1-3 tasks. Your API should return the real list: works = [{ task, hours }]. */
function splitWork(hours, seed) {
  const n = 1 + (seed % 3);
  const weights = [[1], [0.6, 0.4], [0.5, 0.3, 0.2]][n - 1];
  let left = hours;
  return weights.map((w, i) => {
    const h = i === n - 1 ? left : Math.round(hours * w * 4) / 4;
    left -= h;
    return { task: TASKS[(seed + i) % TASKS.length], hours: h };
  });
}

/** Demo only: believable clock-in / clock-out, overtime and task for a worked day (your API returns the real values) */
function demoDay(rule, n, date) {
  const seed = date.getDate() * 7 + n * 3 + date.getMonth();
  const inShift = [-10, 0, 5, 12, -5, 25, 8][seed % 7];
  const outShift = [0, 30, -45, 90, 0, 150, 15, 60][seed % 8];
  const start = toMin(rule.start) + inShift;
  const end = toMin(rule.end) + outShift;
  const hours = (end - start - rule.breakMin) / 60;
  const std = shiftHours(rule);
  return {
    in: hhmm(start), out: hhmm(end), hours,
    ot: Math.max(0, hours - std),
    late: inShift > 10 ? inShift : 0,
    short: hours < std - 0.25,
    task: TASKS[seed % TASKS.length],
    breakMin: rule.breakMin,
    works: splitWork(hours, seed),
  };
}

/** Schedule Rule -> what is this day for this employee? (no manual week-off selection) */
function getDay(emp, date, schedules, approved, entries) {
  const k = keyOf(date);
  const rule = ruleAt(emp, schedules, date);
  const hol = holidaysFor(emp).find((h) => h.date === k);
  if (hol) return { type: "holiday", label: hol.name, rule };

  const n = parseInt(emp.id.slice(3), 10);
  const weekNo = Math.round((mondayOf(date) - new Date(2026, 0, 5)) / 6048e5);
  const isOff = rule.workDays ? !rule.workDays.includes(date.getDay()) : ROTA_OFF[(((weekNo + n) % 3) + 3) % 3].includes(date.getDay());
  if (isOff) return { type: "off", rule };
  if (emp.leaves.includes(k)) return { type: "leave", rule };
  const diff = Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()) - TODAY) / 864e5);
  if (diff > 0) return { type: "work", rule, hours: shiftHours(rule), ot: 0, status: "Scheduled" };
  const mine = entries && entries[`${emp.id}|${k}`]; // timesheet added / edited by the employee
  if (mine) {
    const hours = (toMin(mine.out) - toMin(mine.in) - mine.breakMin) / 60;
    const late = toMin(mine.in) - toMin(rule.start);
    return {
      type: "work", rule, status: "Pending", in: mine.in, out: mine.out, hours, ot: Math.max(0, hours - shiftHours(rule)),
      late: late > 10 ? late : 0, short: hours < shiftHours(rule) - 0.25, task: mine.works[0].task, breakMin: mine.breakMin, works: mine.works, notes: mine.notes,
    };
  }
  const status = approved.has(`${emp.id}|${k}`) ? "Approved"
    : diff >= -2 ? "Pending"
    : (date.getDate() + n) % 11 === 0 ? "Rejected" : "Approved";
  return { type: "work", rule, status, ...demoDay(rule, n, date) };
}

function summarize(emp, from, to, schedules, approved, entries) {
  const s = { scheduled: 0, worked: 0, logged: 0, ot: 0, leave: 0, off: 0, holiday: 0, workDays: 0, filled: 0, pending: 0, rejected: 0, approvedDays: 0, missing: 0 };
  eachDay(from, to).forEach((d) => {
    const i = getDay(emp, d, schedules, approved, entries);
    if (i.type === "work") {
      s.workDays++; s.scheduled += shiftHours(i.rule);
      if (i.status !== "Scheduled") {
        s.filled++; s.logged += i.hours; s.ot += i.ot;
        if (i.status === "Pending") s.pending++;
        if (i.status === "Rejected") s.rejected++;
        if (i.status === "Approved") { s.worked += i.hours; s.approvedDays++; }
      }
    } else if (i.type === "leave") s.leave++;
    else if (i.type === "off") s.off++;
    else if (i.type === "holiday") s.holiday++;
  });
  s.attendance = s.filled + s.missing ? Math.round((100 * s.filled) / (s.filled + s.missing)) : 0;
  return s;
}

function downloadCsv(emp, from, to, schedules, approved, entries) {
  const rows = [["Date", "Day", "Type", "Status", "Clock in", "Clock out", "Hours", "Overtime", "Task"]];
  eachDay(from, to).forEach((d) => {
    const i = getDay(emp, d, schedules, approved, entries);
    const worked = i.type === "work" && i.status !== "Scheduled";
    rows.push([keyOf(d), DOW[d.getDay()], i.type, i.status || i.label || "", worked ? i.in : "", worked ? i.out : "", worked ? hrs(i.hours) : 0, worked ? hrs(i.ot) : 0, worked ? i.works.map((w) => w.task).join(" / ") : ""]);
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

function WeekView({ emp, anchor, schedules, approved, entries, statusFilter, onOpen }) {
  const mon = mondayOf(anchor);
  const days = eachDay(mon, addDays(mon, 6));
  const infos = days.map((d) => getDay(emp, d, schedules, approved, entries));
  const scheduled = infos.reduce((s, i) => s + (i.type === "work" ? shiftHours(i.rule) : 0), 0);
  const worked = infos.reduce((s, i) => s + (i.type === "work" && i.status === "Approved" ? i.hours : 0), 0);
  const overtime = infos.reduce((s, i) => s + (i.type === "work" && i.status !== "Scheduled" ? i.ot : 0), 0);
  return (
    <div className="et-week">
      <div className="et-week__grid">
        {days.map((d) => (
          <div key={keyOf(d)} className="et-week__head"><span>{DOW[d.getDay()]}</span><b>{d.getDate()}</b></div>
        ))}
        {infos.map((i, n) => {
          const dim = statusFilter !== "All" && i.type === "work" && i.status !== statusFilter;
          if (i.type === "work") {
            const st = i.status.toLowerCase();
            return (
              <div key={n} className={`et-wcell et-click et-wcell--${st} ${dim ? "is-dim" : ""}`} title={i.status} aria-label={`${longDate(days[n])}: ${i.status}. Click for details`} {...press(() => onOpen(days[n]))}>
                <span className="et-wcell__hours et-clock">{dayTime(i)}</span>
                {i.status === "Scheduled" && <span className={`et-wcell__status et-wcell__status--${st}`}>Scheduled</span>}
              </div>
            );
          }
          const label = i.type === "off" ? "Week Off" : i.type === "leave" ? "Leave" : i.label;
          return (
            <div key={n} className={`et-wcell et-click et-wcell--${i.type}`} aria-label={`${longDate(days[n])}: ${label}. Click for details`} {...press(() => onOpen(days[n]))}>
              <b>{label}</b>
            </div>
          );
        })}
      </div>
      <div className="et-week__foot">
        <div>Scheduled: <b>{hrs(scheduled)} hrs</b></div>
        <div>Approved: <b>{hrs(worked)} hrs</b></div>
        <div>Overtime: <b>{hrs(overtime)} hrs</b></div>
      </div>
    </div>
  );
}

function MonthView({ emp, anchor, schedules, approved, entries, statusFilter, onOpen }) {
  const [from, to] = monthRange(anchor);
  const days = eachDay(from, to);
  const s = summarize(emp, from, to, schedules, approved, entries);
  const rows = [
    ["Total Working Hours", `${hrs(s.logged)} hrs`, ""], ["Regular Hours", `${hrs(s.logged - s.ot)} hrs`, ""], ["Overtime", `${hrs(s.ot)} hrs`, "warn"],
    ["Leave Days", s.leave, "warn"], ["Week-Off Days", s.off, ""], ["Holidays", s.holiday, "bad"],
    ["Attendance %", `${s.attendance}%`, s.attendance >= 90 ? "good" : "bad"], ["Rejected (resubmit)", s.rejected, s.rejected ? "bad" : "good"],
  ];
  return (
    <div className="et-month">
      <div className="et-cal">
        {DOW.map((d) => <div key={d} className="et-cal__head">{d}</div>)}
        {Array.from({ length: from.getDay() }).map((_, n) => <div key={`b${n}`} className="et-day et-day--blank" />)}
        {days.map((d) => {
          const i = getDay(emp, d, schedules, approved, entries);
          const dim = statusFilter !== "All" && i.type === "work" && i.status !== statusFilter;
          const tone = i.type === "work" ? i.status.toLowerCase() : i.type;
          return (
            <div key={keyOf(d)} className={`et-day et-click ${keyOf(d) === keyOf(TODAY) ? "is-today" : ""} ${dim ? "is-dim" : ""}`} title={i.type === "work" ? i.status : undefined} aria-label={`${longDate(d)}${i.type === "work" ? `, ${i.status}` : ""}. Click for details`} {...press(() => onOpen(d))}>
              <div className="et-day__top"><b>{d.getDate()}</b><i className={`et-dot et-dot--${tone}`} /></div>
              {i.type === "work" && i.status !== "Scheduled" && (
                <>
                  <div className={`et-t et-t--${i.status.toLowerCase()} et-clock`}>{dayTime(i)}</div>
                </>
              )}
              {i.type === "work" && i.status === "Scheduled" && <div className="et-time">{dayTime(i)}</div>}
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

/* ---------- Popups ---------- */
function Modal({ label, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="et-ov" onClick={onClose}>
      <div className="et-modal" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="et-x" onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  );
}

/** Everything about one day: opens when a day box is clicked */
function DayDetail({ emp, date, info, plan, onClose, onEdit, onPlan }) {
  const r = info.rule;
  const worked = info.type === "work" && info.status !== "Scheduled";
  const tone = info.type === "work" ? info.status.toLowerCase() : info.type;
  const statusText = info.type === "work" ? info.status : info.type === "off" ? "Week off" : info.type === "leave" ? "On leave" : `Holiday: ${info.label}`;
  const rows = [["Schedule", r.name], ["Shift", r.shift]];
  if (info.type === "work" && !worked) rows.push(["Planned time", `${r.start} → ${r.end}`], ["Break", `${r.breakMin} min`], ["Planned hours", `${hrs(info.hours)}h`]);
  if (worked) {
    rows.push(
      ["Clock in", info.in], ["Clock out", info.out], ["Break", `${info.breakMin} min`],
      ["Standard hours", `${hrs(shiftHours(r))}h`], ["Hours worked", `${hrs(info.hours)}h`],
      ["Overtime", info.ot > 0 ? `+${hrs(info.ot)}h` : "None"],
      ["Arrival", info.late > 0 ? `Late by ${info.late} min` : "On time"],
      ["Day length", info.short ? "Short day" : "Full day"],
    );
  }
  return (
    <Modal label={`Timesheet for ${longDate(date)}`} onClose={onClose}>
      <div className="et-md-head">
        <span className="et-av">{emp.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</span>
        <div><b>{emp.name}</b><small>{emp.id} · {emp.dept}</small></div>
      </div>
      <div className="et-md-date">{longDate(date)}</div>
      <span className={`et-stp et-stp--${tone}`}>{statusText}</span>
      <dl className="et-md-rows">
        {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
      {worked && (
        <div className="et-md-work">
          <h4>Work done</h4>
          <ul>{info.works.map((w) => <li key={w.task}><span className="et-wcell__task">{w.task}</span><b>{hrs(w.hours)}h</b></li>)}</ul>
          {info.notes && <p className="et-md-notes">"{info.notes}"</p>}
        </div>
      )}
      {info.type === "work" && info.status === "Scheduled" && (
        <>
          <div className="et-md-work">
            <h4>Planned work</h4>
            {plan && plan.length
              ? <ul>{plan.map((w) => <li key={w.task}><span className={`et-chip ${taskCls(w.task)}`}>{w.task}</span><b>{fmtHM(w.hours)}</b></li>)}</ul>
              : <p className="et-md-notes">Nothing planned yet.</p>}
          </div>
          <button type="button" className="et-btn et-btn--white et-md-act" onClick={() => onPlan(date)}>{plan && plan.length ? "Edit plan" : "＋ Plan work"}</button>
        </>
      )}
      {info.status === "Rejected" && <p className="et-md-warn">This timesheet was rejected. Please correct it and submit again.</p>}
      {worked && (info.status === "Pending" || info.status === "Rejected") && (
        <button type="button" className="et-btn et-btn--white et-md-act" onClick={() => onEdit(date)}>
          {info.status === "Rejected" ? "Edit & resubmit" : "Edit timesheet"}
        </button>
      )}
    </Modal>
  );
}

/** Add / edit a timesheet. Calls onSave(entry) when valid. */
function TimesheetForm({ emp, schedules, approved, entries, initialDate, onSave, onClose }) {
  const first = getDay(emp, parseKey(initialDate), schedules, approved, entries);
  const has = first.type === "work" && first.status !== "Scheduled";
  const [date, setDate] = useState(initialDate);
  const [inT, setInT] = useState(has ? first.in : first.rule.start);
  const [outT, setOutT] = useState(has ? first.out : first.rule.end);
  const [brk, setBrk] = useState(String(has ? first.breakMin : first.rule.breakMin));
  const [rows, setRows] = useState(has && first.works.length > 1
    ? first.works.map((w) => ({ task: w.task, hours: String(w.hours) }))
    : [{ task: has ? first.works[0].task : TASKS[0], hours: "" }]);
  const [notes, setNotes] = useState(has && first.notes ? first.notes : "");
  const [error, setError] = useState("");

  const total = (toMin(outT || "00:00") - toMin(inT || "00:00") - Number(brk || 0)) / 60;
  const okTotal = Number.isFinite(total) && total > 0;
  const setRow = (n, patch) => setRows((rs) => rs.map((r, i) => (i === n ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => {
    const next = TASKS.find((t) => !rs.some((r) => r.task === t)) || TASKS[0];
    const head = rs.length === 1 && okTotal ? [{ ...rs[0], hours: String(Math.round(total * 100) / 100) }] : rs;
    return [...head, { task: next, hours: "" }];
  });

  const submit = () => {
    if (!date) return setError("Pick a date.");
    const d = parseKey(date);
    if (d > TODAY) return setError("You can't fill a timesheet for a future day.");
    const info = getDay(emp, d, schedules, approved, entries);
    if (info.type !== "work") return setError(`That day is a ${info.type === "off" ? "week off" : info.type === "leave" ? "leave day" : "holiday"}, so no timesheet is needed.`);
    if (info.status === "Approved") return setError("That day is already approved and can't be changed.");
    if (!inT || !outT) return setError("Enter clock-in and clock-out time.");
    if (toMin(outT) <= toMin(inT)) return setError("Clock-out must be after clock-in.");
    if (!okTotal) return setError("Break is longer than the time worked.");
    let works;
    if (rows.length === 1) works = [{ task: rows[0].task, hours: total }];
    else {
      works = rows.map((r) => ({ task: r.task, hours: Number(r.hours) }));
      if (works.some((w) => !(w.hours > 0))) return setError("Enter the hours for every task.");
      const sum = works.reduce((a, w) => a + w.hours, 0);
      if (Math.abs(sum - total) > 0.01) return setError(`Task hours add up to ${hrs(sum)}h, but you worked ${hrs(total)}h.`);
    }
    onSave({ date, in: inT, out: outT, breakMin: Number(brk || 0), works, notes: notes.trim() });
  };

  return (
    <Modal label="Add timesheet" onClose={onClose}>
      <h3 className="et-md-title">{has ? "Edit timesheet" : "Add timesheet"}</h3>
      <div className="et-form">
        <label>Date<input type="date" value={date} max={keyOf(TODAY)} onChange={(e) => { setDate(e.target.value); setError(""); }} /></label>
        <div className="et-form__row">
          <label>Clock in<input type="time" value={inT} onChange={(e) => setInT(e.target.value)} /></label>
          <label>Clock out<input type="time" value={outT} onChange={(e) => setOutT(e.target.value)} /></label>
          <label>Break (min)<input type="number" min="0" step="5" value={brk} onChange={(e) => setBrk(e.target.value)} /></label>
        </div>
        <div className="et-form__work">
          <span className="et-form__lbl">Work done · <b>{okTotal ? `${hrs(total)}h` : "—"}</b></span>
          {rows.map((r, n) => (
            <div className="et-form__task" key={n}>
              <select value={r.task} onChange={(e) => setRow(n, { task: e.target.value })} aria-label="Task">
                {TASKS.map((t) => <option key={t}>{t}</option>)}
              </select>
              {rows.length > 1
                ? <input type="number" min="0" step="0.25" placeholder="hrs" aria-label="Hours" value={r.hours} onChange={(e) => setRow(n, { hours: e.target.value })} />
                : <span className="et-form__all">{okTotal ? `${hrs(total)}h` : ""}</span>}
              {rows.length > 1 && <button type="button" className="et-form__rm" aria-label="Remove task" onClick={() => setRows((rs) => rs.filter((_, i) => i !== n))}>×</button>}
            </div>
          ))}
          <button type="button" className="et-link" onClick={addRow}>+ Add another task</button>
        </div>
        <label>Notes (optional)<textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything your manager should know" /></label>
        {error && <p className="et-form__err" role="alert">{error}</p>}
        <div className="et-form__act">
          <button type="button" className="et-btn et-btn--plain" onClick={onClose}>Cancel</button>
          <button type="button" className="et-btn et-btn--white" onClick={submit}>Submit for approval</button>
        </div>
      </div>
    </Modal>
  );
}

/** Plan what you will work on for an upcoming day */
function PlanForm({ date, info, plan, onSave, onClear, onClose }) {
  const std = info.hours; // shift hours available that day
  const [rows, setRows] = useState(plan && plan.length ? plan.map((w) => ({ task: w.task, hours: String(w.hours) })) : [{ task: TASKS[0], hours: String(std) }]);
  const [error, setError] = useState("");
  const sum = rows.reduce((a, r) => a + (Number(r.hours) || 0), 0);
  const setRow = (n, patch) => setRows((rs) => rs.map((r, i) => (i === n ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, { task: TASKS.find((t) => !rs.some((r) => r.task === t)) || TASKS[0], hours: String(Math.max(0, Math.round((std - sum) * 4) / 4) || "") }]);
  const save = () => {
    const works = rows.map((r) => ({ task: r.task, hours: Number(r.hours) }));
    if (works.some((w) => !(w.hours > 0))) return setError("Enter the hours for every task.");
    if (sum > std + 0.01) return setError(`Planned hours (${hrs(sum)}h) are more than the shift hours (${hrs(std)}h).`);
    onSave(works);
  };
  return (
    <Modal label="Plan work" onClose={onClose}>
      <h3 className="et-md-title">Plan work</h3>
      <div className="et-md-date">{longDate(date)} · {info.rule.start} → {info.rule.end} · {fmtHM(std)} available</div>
      <div className="et-form">
        <div className="et-form__work">
          <span className="et-form__lbl">What will you work on?</span>
          {rows.map((r, n) => (
            <div className="et-form__task" key={n}>
              <select value={r.task} onChange={(e) => setRow(n, { task: e.target.value })} aria-label="Task">{TASKS.map((t) => <option key={t}>{t}</option>)}</select>
              <input type="number" min="0" step="0.25" placeholder="hrs" aria-label="Hours" value={r.hours} onChange={(e) => { setRow(n, { hours: e.target.value }); setError(""); }} />
              {rows.length > 1 ? <button type="button" className="et-form__rm" aria-label="Remove task" onClick={() => setRows((rs) => rs.filter((_, i) => i !== n))}>×</button> : <span />}
            </div>
          ))}
          <button type="button" className="et-link" onClick={addRow}>+ Add another task</button>
        </div>
        <div className="et-meter" aria-hidden="true"><i style={{ width: `${Math.min(100, (100 * sum) / std)}%` }} /></div>
        <small className="et-meter__txt">Planned {fmtHM(sum)} of {fmtHM(std)}</small>
        {error && <p className="et-form__err" role="alert">{error}</p>}
        <div className="et-form__act">
          {plan && plan.length > 0 && <button type="button" className="et-btn et-btn--plain" onClick={onClear}>Clear plan</button>}
          <button type="button" className="et-btn et-btn--plain" onClick={onClose}>Cancel</button>
          <button type="button" className="et-btn et-btn--white" onClick={save}>Save plan</button>
        </div>
      </div>
    </Modal>
  );
}

/** Work Planner tab: what am I going to do on the upcoming days */
function Planner({ emp, schedules, approved, entries, plans, horizon, setHorizon, onPlan }) {
  const rows = eachDay(addDays(TODAY, 1), addDays(TODAY, horizon)).map((d) => ({
    d, info: getDay(emp, d, schedules, approved, entries), plan: plans[`${emp.id}|${keyOf(d)}`],
  }));
  const workRows = rows.filter((r) => r.info.type === "work");
  const planned = workRows.filter((r) => r.plan && r.plan.length);
  const plannedHrs = planned.reduce((s, r) => s + r.plan.reduce((a, w) => a + w.hours, 0), 0);
  return (
    <div className="et-plan">
      <div className="et-plan__top">
        <div className="et-plan__stats">
          <div><b>{planned.length}</b><small>Days planned</small></div>
          <div><b>{workRows.length - planned.length}</b><small>Still to plan</small></div>
          <div><b>{fmtHM(plannedHrs)}</b><small>Planned hours</small></div>
        </div>
        <div className="et-seg">
          <button aria-pressed={horizon === 14} onClick={() => setHorizon(14)}>Next 2 weeks</button>
          <button aria-pressed={horizon === 28} onClick={() => setHorizon(28)}>Next 4 weeks</button>
        </div>
      </div>
      <ul className="et-rows">
        {rows.map(({ d, info, plan }, n) => {
          const wk = (n === 0 || d.getDay() === 1) && (
            <li key={`w${keyOf(d)}`} className="et-rows__week">W{isoWeek(d)} · {mondayOf(d).getDate()} {MON3(mondayOf(d))} – {addDays(mondayOf(d), 6).getDate()} {MON3(addDays(mondayOf(d), 6))}</li>
          );
          const tile = <div className="et-row__date"><small>{DOW[d.getDay()]}</small><b>{d.getDate()}</b><small>{MON3(d)}</small></div>;
          if (info.type !== "work") {
            const label = info.type === "off" ? "Week off" : info.type === "leave" ? "On leave" : `Holiday: ${info.label}`;
            return <React.Fragment key={keyOf(d)}>{wk}<li className={`et-row et-row--${info.type}`}>{tile}<div className="et-row__main"><b>{label}</b></div></li></React.Fragment>;
          }
          return (
            <React.Fragment key={keyOf(d)}>
              {wk}
              <li className={`et-row ${plan && plan.length ? "et-row--planned" : "et-row--open"}`}>
                {tile}
                <div className="et-row__main">
                  <div className="et-row__top"><b>{info.rule.start} → {info.rule.end}</b><span>{info.rule.shift} · {fmtHM(info.hours)}</span></div>
                  {plan && plan.length
                    ? <div className="et-row__chips">{plan.map((w) => <span key={w.task} className={`et-chip ${taskCls(w.task)}`}>{w.task} <b>{fmtHM(w.hours)}</b></span>)}</div>
                    : <div className="et-row__empty">Nothing planned yet</div>}
                </div>
                <button type="button" className="et-btn et-btn--plain" onClick={() => onPlan(keyOf(d))}>{plan && plan.length ? "Edit plan" : "＋ Plan work"}</button>
              </li>
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
}

/** Holidays tab: a card per holiday, with a countdown */
function HolidayList({ emp }) {
  const items = holidaysFor(emp).map((h) => {
    const d = parseKey(h.date);
    return { ...h, d, diff: Math.round((d - TODAY) / 864e5) };
  });
  const next = items.find((h) => h.diff >= 0);
  const left = items.filter((h) => h.diff >= 0).length;
  const when = (n) => (n === 0 ? "Today" : n === 1 ? "Tomorrow" : n > 1 ? `In ${n} days` : "Passed");
  return (
    <div className="et-hol">
      <div className="et-hol__top">
        <div><b>{items.length}</b><small>Holidays this year</small></div>
        <div><b>{left}</b><small>Still to come</small></div>
        <div className="et-hol__next">
          <small>Next holiday</small>
          <b>{next ? `${next.name} · ${when(next.diff).toLowerCase()}` : "None left this year"}</b>
        </div>
      </div>
      <ul className="et-hgrid">
        {items.map((h) => (
          <li key={h.date} className={`et-hcard ${h.diff < 0 ? "is-past" : ""} ${next && next.date === h.date ? "is-next" : ""}`}>
            <div className="et-hcard__date"><small>{MON3(h.d)}</small><b>{h.d.getDate()}</b></div>
            <div className="et-hcard__main">
              <b>{h.name}</b>
              <span>{DOW[h.d.getDay()]}, {h.d.getDate()} {MONTHS[h.d.getMonth()]} {h.d.getFullYear()}</span>
            </div>
            <span className="et-hcard__when">{when(h.diff)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* =====================  MAIN PAGE — single employee, own data only  ===================== */
// onAddTimesheet(entry) is optional: it is called after the employee submits a timesheet, so you can save it to your API.
// onBack is optional: when given, a "Back" button is shown.
export default function EmployeeTimesheet({ employeeId = "EMP001", onAddTimesheet, onBack }) {
  // Real app: employeeId comes from the logged-in session, and your API must return ONLY this user's data.
  const emp = EMPLOYEES.find((e) => e.id === employeeId);

  const [tab, setTab] = useState("timesheets");
  const [view, setView] = useState("week");
  const [anchor, setAnchor] = useState(TODAY);
  const [statusFilter, setStatusFilter] = useState("All");
  const [entries, setEntries] = useState({}); // timesheets added / edited here, key "EMP001|2026-10-15"
  const [form, setForm] = useState(null); // date key while the Add / Edit popup is open
  const [detail, setDetail] = useState(null); // Date while the details popup is open
  const [toast, setToast] = useState("");
  const [horizon, setHorizon] = useState(14); // planner: how many upcoming days to show
  const [planFor, setPlanFor] = useState(null); // date key while the Plan popup is open
  // What the employee plans to work on, key "EMP001|2026-10-16" -> [{ task, hours }]. Demo: a few days are pre-planned.
  const [plans, setPlans] = useState(() => {
    const out = {};
    if (!emp) return out;
    let n = 0;
    for (let k = 1; k <= 10 && n < 3; k++) {
      const d = addDays(TODAY, k);
      const info = getDay(emp, d, INITIAL_SCHEDULES, new Set(INITIAL_APPROVED), {});
      if (info.type !== "work") continue;
      const first = Math.round(info.hours * 0.6 * 4) / 4;
      out[`${emp.id}|${keyOf(d)}`] = [{ task: TASKS[n % TASKS.length], hours: first }, { task: TASKS[(n + 2) % TASKS.length], hours: info.hours - first }];
      n++;
    }
    return out;
  });
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  const approved = useMemo(() => new Set(INITIAL_APPROVED), []);
  const schedules = INITIAL_SCHEDULES;

  if (!emp) return <div className="et-page"><div className="et-empty">Employee not found.</div></div>;

  // Add button opens on today, or the latest working day if today is a week off / leave / holiday
  const defaultFormDate = () => {
    for (let n = 0; n < 14; n++) {
      const d = addDays(TODAY, -n);
      if (getDay(emp, d, schedules, approved, entries).type === "work") return keyOf(d);
    }
    return keyOf(TODAY);
  };
  const saveEntry = (entry) => {
    setEntries((prev) => ({ ...prev, [`${emp.id}|${entry.date}`]: entry }));
    const d = parseKey(entry.date);
    setAnchor(d); setTab("timesheets"); setStatusFilter("All"); setForm(null); setDetail(null);
    setToast(`Timesheet for ${DOW[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} submitted. Waiting for approval.`);
    if (onAddTimesheet) onAddTimesheet({ employeeId: emp.id, ...entry });
  };

  const savePlan = (key, works) => {
    setPlans((prev) => {
      const next = { ...prev };
      if (works && works.length) next[`${emp.id}|${key}`] = works; else delete next[`${emp.id}|${key}`];
      return next;
    });
    const d = parseKey(key);
    setPlanFor(null);
    setToast(works && works.length ? `Plan saved for ${DOW[d.getDay()]}, ${d.getDate()} ${MON3(d)}.` : `Plan cleared for ${DOW[d.getDay()]}, ${d.getDate()} ${MON3(d)}.`);
  };

  const [mFrom, mTo] = monthRange(anchor);
  const rule = ruleAt(emp, schedules, TODAY);
  const stats = summarize(emp, mFrom, mTo, schedules, approved, entries);

  const move = (n) => setAnchor(view === "week" ? addDays(anchor, 7 * n) : new Date(anchor.getFullYear(), anchor.getMonth() + n, 1));
  const monday = mondayOf(anchor);
  const sunday = addDays(monday, 6);
  const label = view === "week"
    ? `W${isoWeek(monday)}: ${monday.getDate()} ${MONTHS[monday.getMonth()].slice(0, 3)} – ${sunday.getDate()} ${MONTHS[sunday.getMonth()].slice(0, 3)}, ${sunday.getFullYear()}`
    : `${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`;
  const initials = emp.name.split(" ").map((p) => p[0]).join("").slice(0, 2);

  return (
    <div className="et-page">
      

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
              <button className="et-btn et-btn--ghost" onClick={() => downloadCsv(emp, mFrom, mTo, schedules, approved, entries)}>⭳ Export</button>
              <button className="et-btn et-btn--white" onClick={() => setForm(defaultFormDate())}>＋ Add Timesheet</button>
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
          <StatCard icon="⏱" tone="blue" value={`${hrs(stats.worked)} hrs`} label="Approved Hours" />
        </section>

        <section className="et-filters">
          <label>MONTH
            <select value={anchor.getMonth()} onChange={(e) => setAnchor(new Date(anchor.getFullYear(), Number(e.target.value), 1))}>
              {MONTHS.map((m, n) => <option key={m} value={n}>{m} {anchor.getFullYear()}</option>)}
            </select>
          </label>
          <label>STATUS
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option>
            </select>
          </label>
        </section>

        <section className="et-panel">
          <div className="et-tabs">
            <div className="et-tablist" role="tablist">
            <button role="tab" aria-selected={tab === "timesheets"} onClick={() => setTab("timesheets")}>My Timesheet</button>
            <button role="tab" aria-selected={tab === "holidays"} onClick={() => setTab("holidays")}>Holidays</button>
            <button role="tab" aria-selected={tab === "planner"} onClick={() => setTab("planner")}>Work Planner</button>
            </div>
            {onBack && <button type="button" className="et-back" onClick={onBack}>← Back to Timesheets</button>}
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
                ? <WeekView emp={emp} anchor={anchor} schedules={schedules} approved={approved} entries={entries} statusFilter={statusFilter} onOpen={setDetail} />
                : <MonthView emp={emp} anchor={anchor} schedules={schedules} approved={approved} entries={entries} statusFilter={statusFilter} onOpen={setDetail} />}
            </>
          )}

          {tab === "holidays" && <HolidayList emp={emp} />}

          {tab === "planner" && (
            <Planner emp={emp} schedules={schedules} approved={approved} entries={entries} plans={plans} horizon={horizon} setHorizon={setHorizon} onPlan={setPlanFor} />
          )}
        </section>
      </div>

      {detail && (
        <DayDetail
          emp={emp}
          date={detail}
          info={getDay(emp, detail, schedules, approved, entries)}
          plan={plans[`${emp.id}|${keyOf(detail)}`]}
          onClose={() => setDetail(null)}
          onEdit={(d) => { setDetail(null); setForm(keyOf(d)); }}
          onPlan={(d) => { setDetail(null); setPlanFor(keyOf(d)); }}
        />
      )}
      {form && (
        <TimesheetForm emp={emp} schedules={schedules} approved={approved} entries={entries} initialDate={form} onSave={saveEntry} onClose={() => setForm(null)} />
      )}
      {planFor && (
        <PlanForm
          key={planFor}
          date={parseKey(planFor)}
          info={getDay(emp, parseKey(planFor), schedules, approved, entries)}
          plan={plans[`${emp.id}|${planFor}`]}
          onSave={(works) => savePlan(planFor, works)}
          onClear={() => savePlan(planFor, null)}
          onClose={() => setPlanFor(null)}
        />
      )}
      {toast && <div className="et-toast" role="status">✔ {toast}</div>}
    </div>
  );
}