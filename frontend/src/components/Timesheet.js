import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Timesheet.css";
import { useSearchParams } from "react-router-dom";
import EmployeeTimesheet from "./Employeetimesheet";
import Scheduler, { TeamModal, seedPlans } from "./Scheduler";

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
const HOLIDAYS = { "2026-10-02": "Gandhi Jayanti", "2026-10-20": "Dussehra", "2026-11-08": "Diwali", "2026-12-25": "Christmas" };

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
  labels: { employees: "Employees", departments: "Departments", teams: "Teams" },
  tasks: ["Project work", "Meetings", "Operations", "Training", "Support"],
  shifts: {
    general: { name: "General shift", workDays: [1, 2, 3, 4, 5], start: "09:00", end: "18:00", brk: 1, tz: TZ, desc: "Mon–Fri" },
    early: { name: "Early shift", workDays: [1, 2, 3, 4, 5, 6], start: "06:00", end: "14:00", brk: 0.5, tz: TZ, desc: "Mon–Sat" },
    late: { name: "Late shift", workDays: [1, 2, 3, 4, 5, 6], start: "14:00", end: "22:00", brk: 0.5, tz: TZ, desc: "Mon–Sat" },
    rota: { name: "Rotational", rota: true, start: "09:00", end: "18:00", brk: 1, tz: TZ, desc: "3-week rotation" },
  },
  // One super admin sees many teams. `lead` = id of the employee who leads that team.
  teams: [
    { id: "ops", name: "Operations Team", lead: 1 },
    { id: "sales", name: "Sales Team", lead: 8 },
    { id: "support", name: "Support Team", lead: 12 },
    { id: "fin", name: "Finance & Admin Team", lead: 3 },
  ],
  // `team` = id of the team the person belongs to
  employees: [
    { id: 1, name: "Arun", role: "Team Lead", dept: "Operations", team: "ops", rule: "general", leaves: [d(6)] },
    { id: 5, name: "Meena", role: "Supervisor", dept: "Operations", team: "ops", rule: "early", leaves: [d(1)] },
    { id: 9, name: "Lakshmi", role: "Associate", dept: "Operations", team: "ops", rule: "early", leaves: [d(-4)] },
    { id: 14, name: "Hari", role: "Associate", dept: "Operations", team: "ops", rule: "late", leaves: [] },
    { id: 8, name: "Vikram", role: "Manager", dept: "Sales", team: "sales", rule: "rota", leaves: [d(1)] },
    { id: 2, name: "Divya", role: "Executive", dept: "Sales", team: "sales", rule: "general", leaves: [d(-1)] },
    { id: 10, name: "Suresh", role: "Executive", dept: "Sales", team: "sales", rule: "general", leaves: [d(3)] },
    { id: 12, name: "Bala", role: "Team Lead", dept: "Support", team: "support", rule: "general", leaves: [] },
    { id: 6, name: "Ravi", role: "Associate", dept: "Support", team: "support", rule: "late", leaves: [d(-2)] },
    { id: 7, name: "Sana", role: "Associate", dept: "Support", team: "support", rule: "rota", leaves: [] },
    { id: 11, name: "Anitha", role: "Associate", dept: "Support", team: "support", rule: "late", leaves: [d(-6)] },
    { id: 3, name: "Karthik", role: "Analyst", dept: "Finance", team: "fin", rule: "general", leaves: [d(-10)] },
    { id: 13, name: "Nisha", role: "Accountant", dept: "Finance", team: "fin", rule: "general", leaves: [] },
    { id: 4, name: "Priya", role: "Coordinator", dept: "Admin", team: "fin", rule: "general", leaves: [d(-1)] },
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
const hhmm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
// "09:00" -> "9", "18:05" -> "6:05"; a range reads like "9 to 6"
const clock12 = (t) => { const [h, m] = t.split(":").map(Number); const h24 = h % 24; return `${String(h24 % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")}${h24 < 12 ? "AM" : "PM"}`; };
const span = (a, b) => `${clock12(a)}–${clock12(b)}`;
const stdHours = (r) => ((toMin(r.end) - toMin(r.start) + 1440) % 1440) / 60 - r.brk;
const timeRange = (r) => `${span(r.start, r.end)}${toMin(r.end) <= toMin(r.start) ? " (+1)" : ""}`;
const weekTarget = (emp) => stdHours(emp.r) * (emp.r.rota ? 5 : emp.r.workDays.length);
// Employee ID shown under the name (use `code` from your API if you have one, e.g. "EMP001")
const empCode = (e) => e.code || `EMP${String(e.id).padStart(3, "0")}`;
// hours between clock in and clock out, minus break
const hoursOf = (inT, outT, brk) => Math.max(0, ((toMin(outT) - toMin(inT) + 1440) % 1440) / 60 - (Number(brk) || 0));
// starting values of the edit form for one employee-day
const formFrom = (info, emp) => ({
  inT: info.inT || emp.r.start,
  outT: info.outT || emp.r.end,
  brk: info.brk != null ? info.brk : emp.r.brk,
});
// Admin edit (clock in/out, break, work done note) on top of the system-calculated day
function applyEdit(info, ed, emp) {
  if (!ed || (info.type !== "work" && info.type !== "missing")) return info;
  const std = info.std != null ? info.std : stdHours(emp.r);
  const hours = hoursOf(ed.inT, ed.outT, ed.brk);
  const baseBrk = info.brk != null ? info.brk : emp.r.brk;
  return {
    ...info, type: "work", hours, std, ot: Math.max(0, hours - std),
    inT: ed.inT, outT: ed.outT, brk: Number(ed.brk),
    notes: ed.notes || "", status: info.status || "Pending",
    extra: ed.extra || [],
    edited: info.type === "missing" || ed.inT !== info.inT || ed.outT !== info.outT || Number(ed.brk) !== Number(baseBrk),
    calcHours: info.type === "work" ? info.hours : 0, // what the system calculated before the edit
  };
}

/** Demo: split the day's hours over 1-3 tasks. Real data should come from the API as [{ task, hours }]. */
function splitWork(hours, startIdx, tasks, extra) {
  const n = Math.min(1 + extra, tasks.length);
  const weights = [[1], [0.6, 0.4], [0.5, 0.3, 0.2]][n - 1];
  let left = hours;
  return weights.map((w, i) => {
    const h = i === n - 1 ? left : Math.round(hours * w * 4) / 4;
    left -= h;
    const taskIdx = (startIdx + i) % tasks.length;
    return { task: tasks[taskIdx], taskIdx, hours: h };
  });
}

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
  // demo clock-in / clock-out (your API returns the real times); out = in + hours worked + break
  const inM = toMin(r.start) + [0, -10, 5, 0, -5][(date.getDate() * 3 + emp.id) % 5];
  const inT = hhmm(inM);
  const outT = hhmm(inM + Math.round(hours * 60) + Math.round(r.brk * 60));
  const works = splitWork(hours, taskIdx, emp.tasks, (date.getDate() + emp.id) % 3);
  return { type: "work", hours, std, brk: r.brk, task, taskIdx, works, inT, outT, ot: hours - std, status: diff >= -2 ? "Pending" : "Approved" }; // today and the last 2 days stay Pending
}

function calcTotals(from, to, emp, infoOf) {
  const t = { total: 0, calc: 0, regular: 0, ot: 0, leave: 0, off: 0, holiday: 0, missing: 0, workDays: 0, pending: 0 };
  daysBetween(from, to).forEach((day) => {
    const i = infoOf(day, emp);
    if (i.type === "work") {
      t.total += i.hours; t.calc += i.calcHours != null ? i.calcHours : i.hours; t.regular += i.std; t.ot += i.ot; t.workDays++;
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

/* Status text shared by the compact box and the detail popup */
const statusOf = (info) => {
  switch (info.type) {
    case "work": return info.status === "Approved" ? { kind: "ok", text: "Approved" } : { kind: "pend", text: "Pending approval" };
    case "scheduled": return { kind: "scheduled", text: "Scheduled" };
    case "missing": return { kind: "missing", text: "No timesheet" };
    case "leave": return { kind: "leave", text: "On leave" };
    case "holiday": return { kind: "hol", text: `Holiday: ${info.label}` };
    default: return { kind: "off", text: "Week off" };
  }
};
const longDate = (day) => `${DAYS[day.getDay()]}, ${day.getDate()} ${MONTHS[day.getMonth()]} ${day.getFullYear()}`;

/* One COMPACT day box in the weekly view: only hours + status. Click it for everything else. */
function DayCell({ info, day, emp, onOpen }) {
  const open = () => onOpen(emp.id, day);
  const aria = `${emp.name}, ${longDate(day)}: ${statusOf(info).text}. Click for details`;
  if (info.type === "off") return <button type="button" className="ts-dc ts-dc--off" onClick={open} aria-label={aria}>Off</button>;
  if (info.type === "leave") return <button type="button" className="ts-dc ts-dc--leave" onClick={open} aria-label={aria}>Leave</button>;
  if (info.type === "holiday") return <button type="button" className="ts-dc ts-dc--hol" onClick={open} aria-label={aria}>Holiday</button>;

  if (info.type === "missing") return <button type="button" className="ts-dc ts-dc--missing" onClick={open} aria-label={aria} title="Click for details">Missing</button>;

  const { kind } = statusOf(info);
  const statusText = { ok: "Approved", pend: "Pending", scheduled: "Scheduled", missing: "Missing" }[kind];
  const time = info.type === "work" ? span(info.inT, info.outT) : info.type === "scheduled" ? span(emp.r.start, emp.r.end) : "—";
  return (
    <button type="button" className={`ts-dc ts-dc--${kind}`} onClick={open} aria-label={aria} title="Click for details">
      <span className="ts-hours ts-clock">{time}</span>
      <span className="ts-st">{statusText}{info.type === "work" && info.edited ? " ✎" : ""}{info.type === "work" && info.notes ? " 📝" : ""}</span>
    </button>
  );
}

/* Popup with the FULL details of one employee-day. Opens when any day box is clicked.
   Work / missing days can be edited here: clock in, clock out and break. "Work done" is a typed note. */
function DayDetail({ emp, day, info, locked, onClose, onApprove, onSave, onReset }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const r = emp.r;
  const st = statusOf(info);
  const std = info.std != null ? info.std : stdHours(r);
  const isShiftDay = ["work", "scheduled", "missing"].includes(info.type);
  const canEdit = !locked && (info.type === "work" || info.type === "missing");

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [notes, setNotes] = useState(info.notes || "");
  const [err, setErr] = useState("");
  const [extra, setExtra] = useState(info.extra || []); // custom fields: [{ k: label, v: value }]
  const cleanExtra = () => extra.map((x) => ({ k: x.k.trim(), v: x.v.trim() })).filter((x) => x.k);
  const notesDirty = notes !== (info.notes || "") || JSON.stringify(cleanExtra()) !== JSON.stringify(info.extra || []);

  const setF = (patch) => setForm((f) => ({ ...f, ...patch }));
  const startEdit = () => { setForm(formFrom(info, emp)); setExtra(info.extra || []); setErr(""); setEditing(true); };
  const cancelEdit = () => { setEditing(false); setErr(""); };
  const reset = () => { onReset(emp, day); setNotes(""); setExtra([]); setEditing(false); setErr(""); };

  const live = editing ? hoursOf(form.inT, form.outT, form.brk) : info.hours;
  const liveOt = Math.max(0, live - std);

  const save = () => {
    const f = editing ? form : formFrom(info, emp);
    if (!f.inT || !f.outT) return setErr("Enter both clock in and clock out.");
    if (!(Number(f.brk) >= 0)) return setErr("Break must be 0 or more hours.");
    onSave(emp, day, {
      inT: f.inT, outT: f.outT, brk: Number(f.brk),
      notes: notes.trim(), extra: cleanExtra(),
    });
    setEditing(false); setErr("");
  };

  const brkNow = info.brk != null ? info.brk : r.brk;
  const rows = [ ["Shift time", timeRange(r)]];
  rows.push(editing
    ? ["Break (hours)", <input key="b" className="ts-in" type="number" min="0" step="0.25" value={form.brk} onChange={(e) => setF({ brk: e.target.value })} />]
    : ["Break", `${brkNow}h`]);
  rows.push(["Standard hours", fmt(std)]);
  if (editing) {
    rows.push(
      ["Clock in", <input key="i" className="ts-in" type="time" value={form.inT} onChange={(e) => setF({ inT: e.target.value })} />],
      ["Clock out", <input key="o" className="ts-in" type="time" value={form.outT} onChange={(e) => setF({ outT: e.target.value })} />],
      ["Hours worked", fmt(live)],
      ["Overtime", liveOt > 0 ? `+${fmt(liveOt)}` : "None"],
    );
  } else if (info.type === "work") {
    rows.push(
      ["Clock in", clock12(info.inT)], ["Clock out", clock12(info.outT)],
      ["Overtime", info.ot > 0 ? `+${fmt(info.ot)}` : "None"],
    );
  }
  if (info.type === "scheduled") rows.push(["Planned work", info.task]);
  if (emp.teamName) rows.push();

  if (isShiftDay && !editing) (info.extra || []).forEach((x) => rows.push([x.k, x.v]));
  const shown = isShiftDay ? rows : rows.filter(([k]) => k === "Department" || k === "Shift" || k === "Team");

  return (
    <div className="ts-ov" onClick={onClose}>
      <div className="ts-modal" role="dialog" aria-modal="true" aria-label={`${emp.name} timesheet for ${longDate(day)}`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ts-x" onClick={onClose} aria-label="Close">×</button>
        <div className="ts-md-head">
          <Avatar emp={emp} />
          <div>
            <b>{emp.name}</b>
            <small>{empCode(emp)} · {emp.role} · {emp.dept}</small>
          </div>
        </div>
        <div className="ts-md-date">{longDate(day)}</div>
        <span className={`ts-pill ts-pill--${st.kind}`}>{st.text}</span>
        {info.edited && <span className="ts-pill ts-pill--pend ts-pill--edited">✎ Edited</span>}

        <dl className="ts-md-rows">
          {shown.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
        </dl>

        {editing && (
          <div className="ts-xf">
            {extra.map((x, i) => (
              <div className="ts-xf-row" key={i}>
                <input className="ts-in ts-in--l" placeholder="Field name" maxLength={30} value={x.k} onChange={(e) => setExtra((a) => a.map((y, j) => (j === i ? { ...y, k: e.target.value } : y)))} />
                <input className="ts-in ts-in--v" placeholder="Value" maxLength={60} value={x.v} onChange={(e) => setExtra((a) => a.map((y, j) => (j === i ? { ...y, v: e.target.value } : y)))} />
                <button type="button" className="ts-xf-del" aria-label="Remove field" onClick={() => setExtra((a) => a.filter((_, j) => j !== i))}>×</button>
              </div>
            ))}
            <button type="button" className="ts-link" onClick={() => setExtra((a) => [...a, { k: "", v: "" }])}>＋ Add field</button>
          </div>
        )}

        {info.type === "missing" && !editing && <p className="ts-md-note">No timesheet was filled for this day.</p>}

        {(info.type === "work" || editing) && (
          <div className="ts-md-notes">
            <h4>Work done</h4>
            <textarea
              rows={4} maxLength={500} value={notes} disabled={!canEdit}
              placeholder={canEdit ? "Type the work done for this day…" : "No notes"}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}

        {err && <p className="ts-md-err" role="alert">{err}</p>}

        {editing ? (
          <div className="ts-md-acts">
            <button type="button" className="ts-btn" onClick={cancelEdit}>Cancel</button>
            <button type="button" className="ts-btn ts-btn--pri" onClick={save}>Save changes</button>
          </div>
        ) : (
          canEdit && (
            <div className="ts-md-acts">
              <button type="button" className="ts-btn" onClick={startEdit}>{info.type === "missing" ? "＋ Fill timesheet" : "✎ Edit"}</button>
              {info.type === "work" && notesDirty && <button type="button" className="ts-btn ts-btn--pri" onClick={save}>Save note</button>}
            </div>
          )
        )}
        {!editing && info.edited && canEdit && <button type="button" className="ts-link" onClick={reset}>Reset to calculated hours</button>}

        {info.type === "work" && info.status === "Pending" && !editing && (
          locked
            ? <p className="ts-md-note">🔒 This week is signed off and locked.</p>
            : <button type="button" className="ts-btn ts-btn--pri ts-md-act" onClick={() => onApprove(emp, day)}>Approve this day</button>
        )}
      </div>
    </div>
  );
}

/* One pending day inside the "Approve N days" popup. Edit works right here (no second popup). */
function ReviewDay({ emp, day, info, onApprove, onSave }) {
  const r = emp.r;
  const std = info.std != null ? info.std : stdHours(r);
  const brkNow = info.brk != null ? info.brk : r.brk;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [notes, setNotes] = useState(info.notes || "");
  const [err, setErr] = useState("");
  const setF = (patch) => setForm((f) => ({ ...f, ...patch }));
  const startEdit = () => { setForm(formFrom(info, emp)); setNotes(info.notes || ""); setErr(""); setEditing(true); };
  const cancel = () => { setEditing(false); setErr(""); };
  const save = () => {
    if (!form.inT || !form.outT) return setErr("Enter both clock in and clock out.");
    if (!(Number(form.brk) >= 0)) return setErr("Break must be 0 or more hours.");
    onSave(emp, day, { inT: form.inT, outT: form.outT, brk: Number(form.brk), notes: notes.trim() });
    setEditing(false); setErr("");
  };

  const live = editing ? hoursOf(form.inT, form.outT, form.brk) : info.hours;
  const liveOt = Math.max(0, live - std);
  const rows = editing
    ? [
        ["Shift time", timeRange(r)],
        ["Break (hours)", <input key="b" className="ts-in" type="number" min="0" step="0.25" value={form.brk} onChange={(ev) => setF({ brk: ev.target.value })} />],
        ["Standard hours", fmt(std)],
        ["Clock in", <input key="i" className="ts-in" type="time" value={form.inT} onChange={(ev) => setF({ inT: ev.target.value })} />],
        ["Clock out", <input key="o" className="ts-in" type="time" value={form.outT} onChange={(ev) => setF({ outT: ev.target.value })} />],
        ["Hours worked", fmt(live)],
        ["Overtime", liveOt > 0 ? `+${fmt(liveOt)}` : "None"],
      ]
    : [
        ["Shift time", timeRange(r)],
        ["Break", `${brkNow}h`],
        ["Standard hours", fmt(std)],
        ["Clock in", clock12(info.inT)],
        ["Clock out", clock12(info.outT)],
        ["Overtime", info.ot > 0 ? `+${fmt(info.ot)}` : "None"],
      ];

  return (
    <section className="ts-rv-day">
      <div className="ts-md-date">{longDate(day)}</div>
      <span className="ts-pill ts-pill--pend">Pending approval</span>
      {info.edited && <span className="ts-pill ts-pill--pend ts-pill--edited">✎ Edited</span>}
      <dl className="ts-md-rows">
        {rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
      </dl>
      <div className="ts-md-notes">
        <h4>Work done</h4>
        <textarea
          rows={3} maxLength={500} disabled={!editing}
          value={editing ? notes : (info.notes || "")}
          placeholder={editing ? "Type the work done for this day…" : "No notes"}
          onChange={(ev) => setNotes(ev.target.value)}
        />
      </div>
      {err && <p className="ts-md-err" role="alert">{err}</p>}
      <div className="ts-md-acts">
        {editing ? (
          <>
            <button type="button" className="ts-btn" onClick={cancel}>Cancel</button>
            <button type="button" className="ts-btn ts-btn--pri" onClick={save}>Save changes</button>
          </>
        ) : (
          <>
            <button type="button" className="ts-btn" onClick={startEdit}>✎ Edit</button>
            <button type="button" className="ts-btn ts-btn--pri" onClick={() => onApprove(emp, day)}>Approve this day</button>
          </>
        )}
      </div>
    </section>
  );
}

/* Popup for the "Approve N days" button: every pending day of that employee, same layout as the single-day popup. */
function ReviewDays({ emp, days, infoOf, onApprove, onApproveAll, onSave, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="ts-ov" onClick={onClose}>
      <div className="ts-modal ts-modal--rv" role="dialog" aria-modal="true" aria-label={`${emp.name} pending days`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ts-x" onClick={onClose} aria-label="Close">×</button>
        <div className="ts-md-head">
          <Avatar emp={emp} />
          <div>
            <b>{emp.name}</b>
            <small>{empCode(emp)} · {emp.role} · {emp.dept}</small>
          </div>
        </div>

        <div className="ts-rv-list">
          {days.map((day) => (
            <ReviewDay key={keyOf(day)} emp={emp} day={day} info={infoOf(day, emp)} onApprove={onApprove} onSave={onSave} />
          ))}
        </div>

        {days.length > 1 && (
          <button type="button" className="ts-btn ts-btn--pri ts-md-act" onClick={() => onApproveAll(emp)}>
            Approve all {days.length} days
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Weekly: one row per employee, one box per day, coverage on top ---------- */
function WeekView({ list, totals, from, to, infoOf, onPick, onReview, onOpen }) {
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
                  <small className="ts-eid">{empCode(e)}</small>
                  <small className="ts-hrs" title="Calculated / Current">
                    <b>{fmt(t.calc)}</b> / <b className={Math.abs(t.calc - t.total) > 0.01 ? "is-edited" : ""}>{fmt(t.total)}</b>
                  </small>
                </div>
              </div>
              {days.map((day) => <DayCell key={keyOf(day)} info={infoOf(day, e)} day={day} emp={e} onOpen={onOpen} />)}
              <div className="ts-tot">
                <span className="ts-tot-top">
                  <b>{fmt(t.total)}</b><span className="ts-of">of {fmt(target)}</span>
                  {!locked && t.pending > 0 && (
                    <button className="ts-approve" onClick={() => onReview(e.id)}>
                      Approve {t.pending} {t.pending === 1 ? "day" : "days"}
                    </button>
                  )}
                </span>
                <span className="ts-prog"><i style={{ width: `${fill}%` }} /></span>
                <span className="ts-tot-bot">
                  <span className="ts-meta">{t.ot > 0 ? `OT ${fmt(t.ot)}` : "No OT"} · {t.leave} leave</span>
                  {t.missing > 0 && <span className="ts-badge ts-missing">{t.missing} missing</span>}
                </span>
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
    work: `${info.inT ? `${span(info.inT, info.outT)}, ` : ""}${fmt(info.hours || 0)} worked${info.ot > 0 ? ` (+${fmt(info.ot)} OT)` : ""} · ${info.status}`,
    off: "Week off", leave: "On leave", holiday: `Holiday: ${info.label}`,
    missing: "No timesheet", scheduled: "Scheduled",
  }[info.type];
  return `${base} — ${label}`;
};

function TeamGrid({ list, totals, from, to, infoOf, onPick, onOpen, showTeam }) {
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
                <small>{showTeam ? e.teamName : e.role}</small>
              </div>
            </div>
            <div className="ts-mdays">
              {days.map((day) => {
                const info = infoOf(day, e);
                return <button type="button" key={keyOf(day)} title={cellTitle(day, info)} className="ts-gwrap" onClick={() => onOpen(e.id, day)}><GridCell info={info} isToday={keyOf(day) === todayKey} /></button>;
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
          <b className="ts-clock">{span(info.inT, info.outT)}</b>
          <small>{fmt(info.hours)}{info.ot > 0 ? ` (+${fmt(info.ot)} OT)` : ""} · {info.status}</small>
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

function MonthCalendar({ emp, from, to, infoOf, onOpen }) {
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
                  <div key={keyOf(day)} className={`ts-cell ${inMonth ? "ts-cell--click" : "is-out"} ${keyOf(day) === keyOf(TODAY) ? "is-today" : ""}`}
                    {...(inMonth ? { role: "button", tabIndex: 0, onClick: () => onOpen(emp.id, day), onKeyDown: (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onOpen(emp.id, day); } } } : {})}>
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

function MonthCalendars({ list, totals, from, to, infoOf, onPick, onOpen }) {
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
      <MonthCalendar emp={e} from={from} to={to} infoOf={infoOf} onOpen={onOpen} />
    </section>
  ));
}

/* ---------- Main page ---------- */
// myEmployeeId = the logged-in user (from your session). onAddTimesheet = what the "+ Add Timesheet" button should do.
// config.teams = [{ id, name, lead }]  and every employee has `team: <team id>`.  No teams in config = old single-list page.
// The page is chosen from the sidebar:  /timesheet?tab=scheduler  (default)  |  /timesheet?tab=timesheet
// role = "superadmin" | "employee". If you don't pass it, it follows the "Signed in as" dropdown of the sidebar.
const ROLE_KEY = "lv-role";
const readRole = () => {
  try { return localStorage.getItem(ROLE_KEY) === "Employee" ? "employee" : "superadmin"; } catch (err) { return "superadmin"; }
};

export default function Timesheet({ config = DEFAULT_CONFIG, myEmployeeId = "EMP001", onAddTimesheet, role: roleProp, tab: tabProp }) {
  const [sp] = useSearchParams();
  const tab = tabProp || sp.get("tab") || "scheduler"; // Scheduler is the first page that opens
  const [showMine, setShowMine] = useState(false); // "My Timesheet" opens inside this page
  useEffect(() => setShowMine(false), [tab]); // sidebar click always goes back to Scheduler / Timesheets
  const [storedRole, setStoredRole] = useState(readRole);
  useEffect(() => {
    const h = () => setStoredRole(readRole());
    window.addEventListener("lv-role", h);
    window.addEventListener("storage", h);
    return () => { window.removeEventListener("lv-role", h); window.removeEventListener("storage", h); };
  }, []);
  const role = roleProp || storedRole;
  // teams, people and plans live here so the Timesheet tab and the Scheduler tab always agree
  const [teams, setTeams] = useState(config.teams || []);
  const [people, setPeople] = useState(config.employees);
  const [plans, setPlans] = useState(() => config.plans || seedPlans(config.employees));
  const [teamModal, setTeamModal] = useState(null); // null = closed, { team } = open (team null = create new)
  const hasTeams = teams.length > 0;
  const [teamId, setTeamId] = useState("all");
  const [view, setView] = useState("week");
  const [layout, setLayout] = useState("grid"); // monthly: "grid" | "calendar"
  const [anchor, setAnchor] = useState(TODAY);
  const [dept, setDept] = useState("all");
  const [empId, setEmpId] = useState("all");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [approved, setApproved] = useState(() => new Set());
  const [edits, setEdits] = useState({}); // admin edits per "empId:YYYY-MM-DD" (clock in/out, break, work done, notes)
  const [detail, setDetail] = useState(null); // { empId, day } of the clicked box
  const [reviewId, setReviewId] = useState(null); // empId whose "Approve N days" popup is open

  const labels = { ...DEFAULT_CONFIG.labels, ...(config.labels || {}) };
  const emps = useMemo(
    () => people.map((e) => ({
      ...e,
      r: config.shifts[e.rule],
      tasks: config.tasks,
      teamName: (teams.find((t) => t.id === e.team) || {}).name || "No team",
    })),
    [config, people, teams]
  );
  const infoOf = useCallback((day, e) => {
    const k = `${e.id}:${keyOf(day)}`;
    const i = applyEdit(getDayInfo(day, e), edits[k], e);
    return i.type === "work" && approved.has(k) ? { ...i, status: "Approved" } : i;
  }, [approved, edits]);

  const [from, to] = useMemo(() => getRange(view, anchor), [view, anchor]);

  // people of the team that is open ("all" = everybody)
  const scoped = useMemo(() => emps.filter((e) => teamId === "all" || e.team === teamId), [emps, teamId]);
  const openTeamInfo = teams.find((t) => t.id === teamId);
  const openLead = openTeamInfo ? emps.find((e) => e.id === openTeamInfo.lead) : null;

  const { list, totals } = useMemo(() => {
    const base = scoped.filter((e) =>
      (dept === "all" || e.dept === dept) &&
      (empId === "all" || e.id === Number(empId)) &&
      `${e.name} ${e.teamName}`.toLowerCase().includes(query.trim().toLowerCase()));
    const all = base.map((e) => calcTotals(from, to, e, infoOf));
    const keep = all.map((t) =>
      status === "all" || (status === "pending" && t.pending > 0) || (status === "missing" && t.missing > 0) || (status === "leave" && t.leave > 0));
    return { list: base.filter((_, i) => keep[i]), totals: all.filter((_, i) => keep[i]) };
  }, [scoped, dept, empId, query, status, from, to, infoOf]);
  const agg = useMemo(() => sumTotals(totals), [totals]);

  const move = (n) =>
    setAnchor(view === "week" ? addDays(anchor, 7 * n) : new Date(anchor.getFullYear(), anchor.getMonth() + n, 1));
  const pick = (id) => { setEmpId(String(id)); setDept("all"); setStatus("all"); };
  const approve = (people) =>
    setApproved((prev) => {
      const next = new Set(prev);
      people.forEach((e) => daysBetween(from, to).forEach((day) => {
        const i = infoOf(day, e);
        if (i.type === "work" && i.status === "Pending") next.add(`${e.id}:${keyOf(day)}`);
      }));
      return next;
    });

  const openTeam = (id) => { setTeamId(id); setEmpId("all"); setDept("all"); setStatus("all"); setQuery(""); };
  const openDay = useCallback((eid, day) => setDetail({ empId: eid, day }), []);
  const closeDay = useCallback(() => setDetail(null), []);
  const approveDay = (e, day) => setApproved((prev) => new Set(prev).add(`${e.id}:${keyOf(day)}`));
  const saveEdit = (e, day, data) => setEdits((prev) => ({ ...prev, [`${e.id}:${keyOf(day)}`]: data }));
  const resetEdit = (e, day) => setEdits((prev) => { const n = { ...prev }; delete n[`${e.id}:${keyOf(day)}`]; return n; });
  const detailEmp = detail ? emps.find((e) => e.id === detail.empId) : null;
  const reviewEmp = reviewId != null ? emps.find((e) => e.id === reviewId) : null;
  const reviewDays = useMemo(
    () => (reviewEmp ? daysBetween(from, to).filter((d) => { const i = infoOf(d, reviewEmp); return i.type === "work" && i.status === "Pending"; }) : []),
    [reviewEmp, from, to, infoOf]
  );
  const approveAllOf = (e) => approve([e]);
  // close the popup automatically once nothing is left to approve
  useEffect(() => { if (reviewId != null && reviewDays.length === 0) setReviewId(null); }, [reviewId, reviewDays]);
  const isAdmin = role === "superadmin";
  const active = isAdmin && tab === "timesheet" ? "timesheet" : "scheduler";
  const me = emps.find((e) => e.id === myEmployeeId || `EMP${String(e.id).padStart(3, "0")}` === myEmployeeId) || emps[0];

  const saveTeam = ({ id, name, lead, members }) => {
    const tid = id || `team-${Date.now().toString(36)}`;
    setTeams((prev) => (id ? prev.map((t) => (t.id === id ? { ...t, name, lead } : t)) : [...prev, { id: tid, name, lead }]));
    setPeople((prev) => prev.map((e) => (members.includes(e.id) ? { ...e, team: tid } : e.team === tid ? { ...e, team: "" } : e)));
    setTeamModal(null);
  };
  const deleteTeam = (id) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
    setPeople((prev) => prev.map((e) => (e.team === id ? { ...e, team: "" } : e)));
    if (teamId === id) setTeamId("all");
    setTeamModal(null);
  };
  const openTeamModal = (team) => setTeamModal({ team });
  const teamModalEl = teamModal && (
    <TeamModal team={teamModal.team} people={emps} teams={teams} onSave={saveTeam} onDelete={deleteTeam} onClose={() => setTeamModal(null)} />
  );

  const label = view === "month"
    ? `${MONTHS[from.getMonth()]} ${from.getFullYear()}`
    : `${from.getDate()} ${MONTHS[from.getMonth()].slice(0, 3)} – ${to.getDate()} ${MONTHS[to.getMonth()].slice(0, 3)} ${to.getFullYear()}`;

  const viewTabs = (
    <div className="ts-tabs" role="tablist">
      {["week", "month"].map((v) => (
        <button key={v} role="tab" aria-selected={view === v} className="ts-tab" onClick={() => setView(v)}>
          {v === "week" ? "Weekly" : "Monthly"}
        </button>
      ))}
    </div>
  );
  const navBox = (
    <div className="ts-nav">
      <button className="ts-btn" onClick={() => move(-1)} aria-label="Previous">‹</button>
      <span className="ts-lbl">{label}</span>
      <button className="ts-btn" onClick={() => move(1)} aria-label="Next">›</button>
      <button className="ts-btn ts-btn--pri" onClick={() => setAnchor(TODAY)}>Today</button>
    </div>
  );

  if (showMine) {
    return (
      <div className="ts-wrap">
        <EmployeeTimesheet employeeId={myEmployeeId} onAddTimesheet={onAddTimesheet} onBack={() => setShowMine(false)} />
      </div>
    );
  }

  if (active === "scheduler") {
    return (
      <div className="ts-wrap">
        <Scheduler role={role} me={me} people={emps} teams={teams} plans={plans} setPlans={setPlans} onTeam={openTeamModal} onMine={() => setShowMine(true)} />
        {teamModalEl}
      </div>
    );
  }

  /* ===== Page 2: one team (or everyone) ===== */
  const title = openTeamInfo ? openTeamInfo.name : "Timesheets";
  return (
    <div className="ts-wrap">
      <header className="ts-head">
        <h1>{title}</h1>
        <p>
          {openTeamInfo
            ? `${openLead ? `Led by ${openLead.name} · ` : ""}${scoped.length} ${scoped.length === 1 ? "person" : "people"}. Hours, leave and overtime are filled automatically from each person's shift.`
            : "Hours, leave and overtime for everyone, filled automatically from each person's shift."}
        </p>
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
          {hasTeams && (
            <select value={teamId} onChange={(e) => openTeam(e.target.value)} aria-label="Team">
              <option value="all">All {labels.teams.toLowerCase()}</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
          <select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department">
            <option value="all">All {labels.departments.toLowerCase()}</option>
            {[...new Set(scoped.map((e) => e.dept))].map((x) => <option key={x}>{x}</option>)}
          </select>
          <select value={empId} onChange={(e) => setEmpId(e.target.value)} aria-label="Employee">
            <option value="all">All {labels.employees.toLowerCase()}</option>
            {scoped.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or team" aria-label="Search by employee name or team" />
          {isAdmin && openTeamInfo && <button type="button" className="ts-btn" onClick={() => openTeamModal(openTeamInfo)}>✎ Edit team</button>}
        </div>

        <div className="ts-bar">
          <div className="ts-bar-l">
            <button type="button" className="ts-btn ts-mine" onClick={() => setShowMine(true)}>👤 My Timesheet</button>
            {viewTabs}
            {view === "month" && (
              <div className="ts-tabs ts-tabs--sm" role="tablist" aria-label="Monthly layout">
                {[["grid", "Team grid"], ["calendar", "Calendars"]].map(([v, l]) => (
                  <button key={v} role="tab" aria-selected={layout === v} className="ts-tab" onClick={() => setLayout(v)}>{l}</button>
                ))}
              </div>
            )}
            {empId !== "all" && (
              <button className="ts-btn" onClick={() => setEmpId("all")}>{teamId === "all" ? "Show everyone" : "Show whole team"}</button>
            )}
          </div>
          {navBox}
        </div>
        </div>

        {list.length === 0 ? (
          <div className="ts-empty">No employees match these filters. Clear a filter or search to see everyone.</div>
        ) : view === "week" ? (
          <WeekView list={list} totals={totals} from={from} to={to} infoOf={infoOf} onPick={pick} onReview={setReviewId} onOpen={openDay} />
        ) : layout === "grid" ? (
          <TeamGrid list={list} totals={totals} from={from} to={to} infoOf={infoOf} onPick={pick} onOpen={openDay} showTeam={teamId === "all" && hasTeams} />
        ) : (
          <MonthCalendars list={list} totals={totals} from={from} to={to} infoOf={infoOf} onPick={pick} onOpen={openDay} />
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

      {reviewEmp && reviewDays.length > 0 && !detail && (
        <ReviewDays
          emp={reviewEmp}
          days={reviewDays}
          infoOf={infoOf}
          onApprove={approveDay}
          onApproveAll={approveAllOf}
          onSave={saveEdit}
          onClose={() => setReviewId(null)}
        />
      )}
      {detail && detailEmp && (
        <DayDetail
          key={`${detail.empId}:${keyOf(detail.day)}`}
          emp={detailEmp}
          day={detail.day}
          info={infoOf(detail.day, detailEmp)}
          locked={addDays(mondayOf(detail.day), 6) < LOCK_BEFORE}
          onClose={closeDay}
          onApprove={approveDay}
          onSave={saveEdit}
          onReset={resetEdit}
        />
      )}
      {teamModalEl}
    </div>
  );
}