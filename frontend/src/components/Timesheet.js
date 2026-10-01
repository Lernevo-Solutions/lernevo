import { useEffect, useMemo, useState } from "react";
import "./Timesheet.css";

/* NOTE: every CSS class in this file starts with "lx-" so it can never clash with
   your project's global styles (.step, .card, .btn, .tabs ...). */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// Sept 2026 -> 1st is Tuesday. Showing days 1-10.
const DAYS = Array.from({ length: 10 }, (_, i) => ({ d: i + 1, w: DAY_NAMES[(2 + i) % 7] }));
const isWeekend = (w) => w === "Sat" || w === "Sun";
const weekday = (day) => DAY_NAMES[(2 + day - 1) % 7];

/* ---------- Company policy (change these numbers to match your HR policy) ---------- */
const POLICY = {
  required: 8,          // net working hours per day (break NOT included)
  breakMin: 60,         // unpaid break in minutes
  otMin: 0.5,           // overtime counts only after this many extra hours (30 min)
  otStep: 0.25,         // overtime is rounded down to 15-minute steps
  otMax: 4,             // max overtime hours per day
  officeStart: "09:00", // Office (Fixed) schedule
  officeEnd: "18:00",
};
const hm = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const fmtHM = (mins) => { const m = Math.round(Math.abs(mins)); return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`; };
const clock = (mins) => { const t = ((mins % 1440) + 1440) % 1440; const h = Math.floor(t / 60); return `${h % 12 || 12}:${String(t % 60).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; };
const legacyOt = (x) => (x >= POLICY.required + POLICY.otMin ? Math.floor((x - POLICY.required) / POLICY.otStep) * POLICY.otStep : 0);

// Hours + overtime for one day.
//  Office (Fixed 9-6): overtime counts only AFTER the scheduled end time (6 PM).
//  WFH (Flexible):     overtime starts once you have worked 8 net hours after login + break.
const computeWork = ({ mode, inT, outT, brk }) => {
  if (!inT || !outT) return { valid: false };
  const a = hm(inT); let b = hm(outT);
  const next = b <= a; if (next) b += 1440;            // logout after midnight = next day
  const span = b - a, br = +brk || 0, netMin = span - br, reqMin = POLICY.required * 60;
  let otMin = Math.max(0, netMin - reqMin), otStart;
  if (mode === "Office") { const end = hm(POLICY.officeEnd); otStart = end; otMin = Math.min(otMin, Math.max(0, b - end)); }
  else otStart = a + reqMin + br;
  let ot = otMin / 60, capped = false;
  ot = ot < POLICY.otMin ? 0 : Math.floor(ot / POLICY.otStep) * POLICY.otStep;
  if (ot > POLICY.otMax) { ot = POLICY.otMax; capped = true; }
  return { valid: netMin > 0, span, br, netMin, net: +(netMin / 60).toFixed(2), ot: +ot.toFixed(2), otStart, short: Math.max(0, reqMin - netMin), next, capped,
    late: mode === "Office" ? Math.max(0, a - hm(POLICY.officeStart)) : 0 };
};

const LOC = { EMP004: ["USA – East", "ET"], EMP007: ["USA – East", "ET"], EMP005: ["USA – West", "PT"] };
const EMP = [
  { id: "EMP001", name: "Priya S", dept: "Human Resources", role: "HR Executive", o: {} },
  { id: "EMP002", name: "Arun Kumar", dept: "Engineering", role: "Software Engineer", o: { 4: 9.5, 8: 10 } },
  { id: "EMP003", name: "Divya R", dept: "Finance", role: "Accountant", o: { 10: "L" } },
  { id: "EMP004", name: "Karthik M", dept: "Engineering", role: "QA Analyst", o: { 2: 8.4, 9: 9 } },
  { id: "EMP005", name: "Sneha V", dept: "Design", role: "UI Designer", o: { 9: "HD" } },
  { id: "EMP006", name: "Vignesh S", dept: "Operations", role: "Support Lead", o: { 3: "L", 4: "L" } },
  { id: "EMP007", name: "Mohamed I", dept: "Sales", role: "Sales Executive", o: { 7: 9.8 } },
  { id: "EMP008", name: "Lakshmi P", dept: "Human Resources", role: "Recruiter", o: {} },
].map((e, i) => {
  const [loc, tz] = LOC[e.id] || ["India", "IST"];
  return { ...e, loc, tz, idx: i, mode: e.id === "EMP002" || e.id === "EMP005" ? "WFH" : "Office", status: i === 0 || i === 1 || i === 4 ? "Pending" : i === 7 ? "Rejected" : "Approved" };
});

// demo holidays (HR can add more from the Holidays tab)
const HOLIDAYS = [
  { id: "h1", day: 4, name: "Krishna Janmashtami", region: "India", type: "Public" },
  { id: "h2", day: 7, name: "Labor Day", region: "USA", type: "Public" },
  { id: "h3", day: 14, name: "Ganesh Chaturthi", region: "India", type: "Public" },
  { id: "h4", day: 25, name: "Quarterly Team Day", region: "All", type: "Optional" },
];
const regionOf = (e) => (e.loc === "India" ? "India" : "USA");

const calc = (e, hols) => {
  const hmap = {}, meta = {};
  hols.forEach((h) => { if (h.region === "All" || h.region === regionOf(e)) hmap[h.day] = h.name; });
  const days = DAYS.map(({ d, w }) => {
    if (isWeekend(w)) return "WO";
    if (hmap[d]) return "H";
    const o = e.o[d];
    if (o === "L") return "L";
    if (o === "HD") return 4;
    if (o && typeof o === "object") { meta[d] = o; return o.net; }
    if (typeof o === "number") return o;
    if (e.custom) return "—";                       // new employees: only show what was really logged
    return +(8 + (((d * 7 + e.idx * 3) % 5) - 2) / 10).toFixed(1);
  });
  const otArr = days.map((x, i) => (meta[DAYS[i].d] ? meta[DAYS[i].d].ot : typeof x === "number" ? legacyOt(x) : 0));
  const nums = days.filter((x) => typeof x === "number");
  const workingDays = DAYS.filter((x) => !isWeekend(x.w) && !hmap[x.d]).length;
  return {
    days, otArr, hmap, meta, workingDays,
    total: +nums.reduce((a, b) => a + b, 0).toFixed(1),
    expected: workingDays * 8,
    present: nums.length,
    leave: days.filter((x) => x === "L").length,
    half: days.filter((x) => x === 4).length,
    ot: +otArr.reduce((a, b) => a + b, 0).toFixed(2),
  };
};

const KEY = "lx-timesheet-v2";
const ROLES = ["HR", "Manager", "Admin", "Super Admin"];
const CAN_APPROVE = ["Admin", "Super Admin"];
const kind = (v, ot = 0) => (v === "—" ? "nil" : v === "WO" ? "wo" : v === "H" ? "hol" : v === "L" ? "lv" : v === 4 ? "hd" : ot > 0 ? "ot" : v < 8 ? "lo" : "ok");
const label = (v) => (typeof v === "number" ? v.toFixed(1) + "h" : v);

const I = ({ n }) => {
  const p = {
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M18 14a6 6 0 013.5 6" /></>,
    file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 13h6M9 17h6" /></>,
    hour: <path d="M6 3h12M6 21h12M7 3c0 6 10 6 10 18M17 3c0 6-10 6-10 18" />,
    check: <path d="M5 12l5 5 9-10" />,
    x: <path d="M6 6l12 12M18 6L6 18" />,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    dl: <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />,
    lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
    cal: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
    bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  }[n];
  return <svg className="lx-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{p}</svg>;
};

const Avatar = ({ e, big }) => (
  <span className={"lx-av lx-c" + (e.idx % 5) + (big ? " lx-av-lg" : "")}>{e.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}</span>
);
const Badge = ({ s }) => <span className={"lx-bd lx-bd-" + s.toLowerCase()}>{s === "Pending" ? "Pending Approval" : s}</span>;
const Who = ({ e }) => (
  <div className="lx-who">
    <Avatar e={e} />
    <div><b>{e.name}</b><span className={"lx-tz lx-tz-" + e.tz}>{e.loc} · {e.tz}</span></div>
  </div>
);

/* ---------- Approval queue card ---------- */
function ApprovalCard({ r, can, checked, onCheck, onAct, onView, pending }) {
  const pct = Math.min(100, Math.round((r.total / r.expected) * 100));
  return (
    <article className={"lx-qcard" + (checked ? " lx-qcard-on" : "")}>
      <header>
        {pending && <input type="checkbox" checked={checked} onChange={onCheck} />}
        <Avatar e={r} big />
        <div className="lx-qwho"><b>{r.name}</b><small>{r.id} · {r.role}</small></div>
        <Badge s={r.status} />
      </header>

      <div className="lx-qhours">
        <div><small>Total hours</small><strong>{r.total}<em>h</em></strong></div>
        <div className="lx-qbar">
          <div className="lx-qbar-top"><span>{pct}% of {r.expected}h expected</span>{r.ot > 0 && <span className="lx-ot"><I n="bolt" />{r.ot}h OT</span>}</div>
          <div className="lx-track"><i style={{ width: pct + "%" }} /></div>
        </div>
      </div>

      <div className="lx-qstats">
        <div><b>{r.present}</b><small>Present</small></div>
        <div><b>{r.leave}</b><small>Leave</small></div>
        <div><b>{r.half}</b><small>Half day</small></div>
        <div><b>{r.workingDays}</b><small>Working</small></div>
      </div>

      <div className="lx-strip" title="Sep 1 – 10">
        {r.days.map((v, i) => <i key={i} className={"lx-dot lx-" + kind(v, r.otArr[i])} title={`Sep ${i + 1}: ${label(v)}${r.otArr[i] ? " · OT " + r.otArr[i] + "h" : ""}`} />)}
      </div>

      <footer>
        <button className="lx-b lx-b-soft" onClick={onView}><I n="eye" /> Details</button>
        {pending && (
          <>
            <button className="lx-b lx-b-red" onClick={() => onAct([r.id], "Rejected")}><I n="x" /> Reject</button>
            <button className="lx-b lx-b-green" onClick={() => onAct([r.id], "Approved")}><I n={can ? "check" : "lock"} /> Approve</button>
          </>
        )}
      </footer>
    </article>
  );
}

/* ---------- Details drawer ---------- */
function Drawer({ r, can, onClose, onAct }) {
  return (
    <div className="lx-ov" onClick={onClose}>
      <aside className="lx-drawer" onClick={(e) => e.stopPropagation()}>
        <button className="lx-x" onClick={onClose}><I n="x" /></button>
        <div className="lx-dhead">
          <Avatar e={r} big />
          <div><h3>{r.name}</h3><p>{r.id} · {r.role} · {r.dept}</p><span className={"lx-tz lx-tz-" + r.tz}>{r.loc} · {r.tz}</span></div>
        </div>
        <Badge s={r.status} />
        <div className="lx-dstats">
          <div><small>Total hours</small><b>{r.total}h</b></div>
          <div><small>Overtime</small><b>{r.ot}h</b></div>
          <div><small>Present</small><b>{r.present} / {r.workingDays}</b></div>
          <div><small>Leave</small><b>{r.leave}</b></div>
        </div>
        <h4>Daily hours · Sep 1 – 10 · <span className="lx-mode">{r.mode === "WFH" ? "🏠 WFH (Flexible)" : "🏢 Office (Fixed 9–6)"}</span></h4>
        <div className="lx-bars">
          {r.days.map((v, i) => (
            <div key={i} className="lx-bar">
              <div className="lx-bar-col">
                {typeof v === "number" ? <i className={"lx-" + kind(v, r.otArr[i])} style={{ height: Math.min(100, (v / 12) * 100) + "%" }} /> : <span className={"lx-tagx lx-" + kind(v)}>{v}</span>}
              </div>
              <small>{String(i + 1).padStart(2, "0")}</small>
              <small className="lx-dim">{DAYS[i].w}</small>
            </div>
          ))}
        </div>
        {Object.keys(r.meta).length > 0 && (
          <>
            <h4>Logged entries</h4>
            <div className="lx-ent">
              {Object.entries(r.meta).map(([d, m]) => (
                <div key={d} className="lx-ent-row">
                  <b>Sep {String(d).padStart(2, "0")}</b>
                  <span>{m.mode === "WFH" ? "🏠 WFH" : "🏢 Office"} · {clock(hm(m.inT))} → {clock(hm(m.outT))}{m.next ? " (+1d)" : ""} · break {m.brk}m</span>
                  <em>{m.net.toFixed(1)}h{m.ot > 0 ? ` · OT ${m.ot}h` : ""}</em>
                </div>
              ))}
            </div>
          </>
        )}
        {r.status === "Pending" && (
          <div className="lx-dact">
            <button className="lx-b lx-b-red" onClick={() => onAct([r.id], "Rejected")}><I n="x" /> Reject</button>
            <button className="lx-b lx-b-green" onClick={() => onAct([r.id], "Approved")}><I n={can ? "check" : "lock"} /> Approve</button>
          </div>
        )}
      </aside>
    </div>
  );
}

export default function Timesheet() {
  const [base, setBase] = useState(() => {
    try { const st = JSON.parse(localStorage.getItem(KEY) || "null"); if (st && st.base) return [...EMP.map((e) => (st.base[e.id] ? { ...e, ...st.base[e.id] } : e)), ...(st.custom || [])]; } catch (err) { /* ignore */ }
    return EMP;
  });
  const [holidays, setHolidays] = useState(() => {
    try { const st = JSON.parse(localStorage.getItem(KEY) || "null"); if (st && st.holidays) return st.holidays; } catch (err) { /* ignore */ }
    return HOLIDAYS;
  });
  const [flash, setFlash] = useState(null);
  // keep saved timesheets after refresh (replace with your API call in the real app)
  useEffect(() => {
    try {
      const b = {}; base.filter((e) => !e.custom).forEach((e) => { b[e.id] = { o: e.o, status: e.status }; });
      localStorage.setItem(KEY, JSON.stringify({ base: b, custom: base.filter((e) => e.custom), holidays }));
    } catch (err) { /* ignore */ }
  }, [base, holidays]);
  const [tab, setTab] = useState("timesheets");
  const [sub, setSub] = useState("Pending");
  const [role, setRole] = useState("Admin");
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All Departments");
  const [loc, setLoc] = useState("All Locations");
  const [status, setStatus] = useState("All");
  const [applied, setApplied] = useState(null); // null = nothing searched -> no employee data shown
  const [sel, setSel] = useState([]);
  const [open, setOpen] = useState(null);
  const [hf, setHf] = useState("All");
  const [nh, setNh] = useState({ name: "", day: "", region: "India", type: "Public" });
  const [toast, setToast] = useState("");
  const [menu, setMenu] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const blank = { q: "", empId: "", day: "", type: "Work", mode: "Office", inT: "09:00", outT: "18:00", brk: POLICY.breakMin, newDept: "Engineering", newLoc: "India" };
  const [f, setF] = useState(blank);
  const [ferr, setFerr] = useState("");
  useEffect(() => { setFerr(""); }, [f]);

  const rows = useMemo(() => base.map((e) => ({ ...e, ...calc(e, holidays) })), [base, holidays]);
  const can = CAN_APPROVE.includes(role);
  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const shown = useMemo(
    () => !applied ? [] : rows.filter((r) =>
      (r.name + r.id).toLowerCase().includes(applied.q.trim().toLowerCase()) &&
      (applied.dept === "All Departments" || r.dept === applied.dept) &&
      (applied.loc === "All Locations" || r.loc === applied.loc) &&
      (applied.status === "All" || r.status === applied.status)),
    [rows, applied]
  );
  const countAll = (s) => rows.filter((r) => r.status === s).length;
  const count = (s) => shown.filter((r) => r.status === s).length;
  const queue = shown.filter((r) => r.status === sub);
  const queueHours = +queue.reduce((a, r) => a + r.total, 0).toFixed(1);
  const queueOt = +queue.reduce((a, r) => a + r.ot, 0).toFixed(1);
  const openRow = open ? rows.find((r) => r.id === open) : null;


  /* ---------- Export (CSV) ---------- */
  const csv = (rowsArr) => "\uFEFF" + rowsArr.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const download = (name, rowsArr) => {
    const url = URL.createObjectURL(new Blob([csv(rowsArr)], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const exportData = (type) => {
    setMenu(false);
    if (!applied || !shown.length) return say("Search employees first, then export the results");
    if (type === "grid") {
      download("timesheet-grid-sep-2026.csv", [
        ["Employee ID", "Name", "Department", "Location", "Timezone", "Default Mode", ...DAYS.map((d) => `Sep ${String(d.d).padStart(2, "0")} (${d.w})`), "Total Hours", "Overtime", "Present", "Leave", "Half Day", "Status"],
        ...shown.map((r) => [r.id, r.name, r.dept, r.loc, r.tz, r.mode, ...r.days.map((v, i) => label(v) + (r.otArr[i] ? ` (OT ${r.otArr[i]}h)` : "")), r.total, r.ot, r.present, r.leave, r.half, r.status]),
      ]);
    } else {
      download("timesheet-approval-summary-sep-2026.csv", [
        ["Employee ID", "Name", "Department", "Working Days", "Present", "Leave", "Half Day", "Total Hours", "Expected Hours", "Overtime", "Status"],
        ...shown.map((r) => [r.id, r.name, r.dept, r.workingDays, r.present, r.leave, r.half, r.total, r.expected, r.ot, r.status]),
      ]);
    }
    say(`Exported ${shown.length} record(s) as CSV`);
  };

  /* ---------- Add Timesheet ---------- */
  const modeTimes = (mode) => (mode === "WFH" ? { inT: "11:00", outT: "20:00" } : { inT: POLICY.officeStart, outT: POLICY.officeEnd });
  const w = f.type === "Work" ? computeWork(f) : null;
  const matches = f.q.trim().length >= 2 && !f.empId
    ? rows.filter((r) => (r.name + r.id).toLowerCase().includes(f.q.trim().toLowerCase())).slice(0, 5) : [];
  const fEmp = f.empId ? rows.find((r) => r.id === f.empId) : null;
  const dayState = (d, wd) => (isWeekend(wd) ? "Week off" : fEmp && fEmp.hmap[d] ? "Holiday" : "");
  const openAdd = () => { setF(blank); setAddOpen(true); setMenu(false); };
  const pickEmp = (m) => setF({ ...f, empId: m.id, q: m.name, day: "", mode: m.mode, ...modeTimes(m.mode) });
  const createEmp = () => {
    const name = f.q.trim().split(/\s+/).map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase()).join(" ");
    let n = base.length + 1; while (base.some((e) => e.id === "EMP" + String(n).padStart(3, "0"))) n++;
    const id = "EMP" + String(n).padStart(3, "0");
    const tz = { "India": "IST", "USA – East": "ET", "USA – West": "PT" }[f.newLoc];
    setBase((bs) => [...bs, { id, name, dept: f.newDept, role: "Employee", o: {}, loc: f.newLoc, tz, idx: bs.length, mode: "Office", status: "Pending", custom: true }]);
    setF({ ...f, empId: id, q: name, day: "", mode: "Office", ...modeTimes("Office") });
    say(`${name} added as ${id}`);
  };
  const saveTimesheet = () => {
    if (!fEmp) return setFerr("Select an employee first – type a name and pick from the list, or add the person as a new employee.");
    if (!f.day) return setFerr("Choose a date for this timesheet.");
    let val;
    if (f.type === "Leave") val = "L";
    else if (f.type === "Half Day") val = "HD";
    else {
      if (!w.valid) return setFerr("Net hours must be above 0 – check login, logout and break.");
      if (w.net > 16) return setFerr("Net hours look too high – please check the times.");
      val = { mode: f.mode, inT: f.inT, outT: f.outT, brk: +f.brk || 0, next: w.next, net: w.net, ot: w.ot };
    }
    const day = +f.day;
    setBase((bs) => bs.map((e) => (e.id === fEmp.id ? { ...e, o: { ...e.o, [day]: val }, status: "Pending" } : e)));
    // show the saved record straight away: auto-search this employee and highlight the saved day
    setQ(fEmp.id); setDept("All Departments"); setLoc("All Locations"); setStatus("All");
    setApplied({ q: fEmp.id, dept: "All Departments", loc: "All Locations", status: "All" });
    setTab("timesheets"); setSel([]); setAddOpen(false);
    setFlash({ id: fEmp.id, day }); setTimeout(() => setFlash(null), 4000);
    const extra = val && val.ot > 0 ? ` · OT ${val.ot}h` : w && w.short > 0 ? ` · short by ${fmtHM(w.short)}` : "";
    say(`Saved: ${fEmp.name} · Sep ${day}${extra}`);
  };

  const doSearch = () => {
    if (!q.trim() && dept === "All Departments" && loc === "All Locations") return say("Enter a name / ID, or choose a department / location");
    setApplied({ q, dept, loc, status }); setSel([]);
  };
  const clear = () => { setApplied(null); setQ(""); setDept("All Departments"); setLoc("All Locations"); setStatus("All"); setSel([]); };
  const act = (ids, s) => {
    if (!can) return say("Only Admin / Super Admin can approve or reject");
    setBase((bs) => bs.map((r) => (ids.includes(r.id) ? { ...r, status: s } : r)));
    setSel([]); setOpen(null);
    say(s === "Approved" ? `${ids.length} timesheet(s) approved` : `${ids.length} timesheet(s) rejected`);
  };
  const addHoliday = () => {
    const day = +nh.day;
    if (!nh.name.trim() || !(day >= 1 && day <= 30)) return say("Enter a holiday name and a day between 1 and 30");
    setHolidays((h) => [...h, { id: "h" + Date.now(), day, name: nh.name.trim(), region: nh.region, type: nh.type, custom: true }]);
    setNh({ name: "", day: "", region: "India", type: "Public" });
    say("Holiday added – timesheets updated");
  };

  return (
    <div className="lx">
      {/* Hero */}
      <header className="lx-hero">
        <div className="lx-hero-l">
          <span className="lx-logo"><I n="clock" /></span>
          <div>
            <h1>Timesheets</h1>
            <p>Track hours, leave and overtime from assigned schedules, then approve in one place.</p>
            <div className="lx-chips">
              <span><I n="cal" /> Fixed / Static</span>
              <span>Office 9:00 AM – 6:00 PM</span>
              <span>WFH flexible · 8h + 1h break</span>
              <span><I n="globe" /> Local time per region</span>
            </div>
          </div>
        </div>
        <div className="lx-hero-r">
          <label className="lx-role">Viewing as
            <select value={role} onChange={(e) => setRole(e.target.value)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
          </label>
          <div className="lx-menuwrap">
            <button className="lx-b lx-b-glass" onClick={() => setMenu((m) => !m)}><I n="dl" /> Export</button>
            {menu && (
              <>
                <div className="lx-menu-bg" onClick={() => setMenu(false)} />
                <div className="lx-menu">
                  <button onClick={() => exportData("grid")}><I n="file" /><div><b>Timesheet grid</b><small>Day-wise hours · CSV</small></div></button>
                  <button onClick={() => exportData("approval")}><I n="check" /><div><b>Approval summary</b><small>Totals, leave, overtime · CSV</small></div></button>
                  <button onClick={() => { setBase(EMP); setHolidays(HOLIDAYS); try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ } setMenu(false); say("Demo data reset"); }}><I n="x" /><div><b>Reset demo data</b><small>Clear saved timesheets</small></div></button>
                  <p>{applied ? `${shown.length} record(s) from your search` : "Search first to enable export"}</p>
                </div>
              </>
            )}
          </div>
          <button className="lx-b lx-b-white" onClick={openAdd}><I n="plus" /> Add Timesheet</button>
        </div>
      </header>

      {/* Overview stats */}
      <section className="lx-stats">
        {[
          ["users", "Total Employees", rows.length, "blue"],
          ["file", "Timesheets Filled", rows.length, "green"],
          ["hour", "Pending Approval", countAll("Pending"), "orange"],
          ["check", "Approved", countAll("Approved"), "pink"],
        ].map(([i, l, v, c]) => (
          <div className={"lx-stat lx-stat-" + c} key={l}>
            <span><I n={i} /></span>
            <div><small>{l}</small><strong>{v}</strong></div>
          </div>
        ))}
      </section>

      {/* Search */}
      <section className="lx-panel lx-search">
        <div><label>Department</label>
          <select value={dept} onChange={(e) => setDept(e.target.value)}>
            <option>All Departments</option>
            {[...new Set(EMP.map((e) => e.dept))].map((d) => <option key={d}>{d}</option>)}
          </select></div>
        <div><label>Location</label>
          <select value={loc} onChange={(e) => setLoc(e.target.value)}>
            <option>All Locations</option><option>India</option><option>USA – East</option><option>USA – West</option>
          </select></div>
        <div className="lx-grow"><label>Employee</label>
          <div className="lx-input"><I n="search" />
            <input placeholder="Search employee name or ID…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch()} />
          </div></div>
        <div><label>Month</label><select><option>September 2026</option></select></div>
        <div><label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option>
          </select></div>
        <button className="lx-b lx-b-blue" onClick={doSearch}><I n="search" /> Search</button>
        {applied && <button className="lx-b lx-b-soft" onClick={clear}>Clear</button>}
      </section>

      {/* Main */}
      <section className="lx-panel lx-main">
        <nav className="lx-tabs">
          <button className={tab === "timesheets" ? "on" : ""} onClick={() => setTab("timesheets")}>Employee Timesheets</button>
          <button className={tab === "holidays" ? "on" : ""} onClick={() => setTab("holidays")}>Holidays <em className="lx-em-g">{holidays.length}</em></button>
          <button className={tab === "approval" ? "on" : ""} onClick={() => setTab("approval")}>Approval View <em className="lx-em-r">{countAll("Pending")}</em></button>
        </nav>

        {!applied && tab !== "holidays" && (
          <div className="lx-prompt">
            <span><I n="search" /></span>
            <h3>Search to view timesheets</h3>
            <p>Employee data is hidden by default. Enter a name / ID or choose a department / location, then press <b>Search</b>.</p>
          </div>
        )}

        {/* ---- Timesheets grid ---- */}
        {applied && tab === "timesheets" && (
          <>
            <div className="lx-note"><I n="globe" /> Hours, weekly-offs and overtime are calculated in each employee’s <b>schedule timezone</b> (IST / ET / PT).</div>
            <div className="lx-policy">
              <div><b>🏢 Office · Fixed</b><span>9:00 AM – 6:00 PM · overtime only after 6:00 PM</span></div>
              <div><b>🏠 WFH · Flexible</b><span>Login any time · 8h net work + 1h break · overtime after that</span></div>
              <div><b>⚡ Overtime rule</b><span>Min 30 min · 15-min steps · max 4h/day</span></div>
            </div>
            <div className="lx-legend">
              <span><i className="lx-k lx-ok" />Full day</span><span><i className="lx-k lx-ot" />Overtime</span><span><i className="lx-k lx-hd" />Half day</span>
              <span><i className="lx-k lx-lv" />Leave</span><span><i className="lx-k lx-hol" />Holiday</span><span><i className="lx-k lx-wo" />Week off</span><span><i className="lx-k lx-wfhk" />WFH entry</span>
            </div>
            <div className="lx-scroll">
              <table className="lx-table">
                <thead>
                  <tr>
                    <th>Employee</th><th>ID</th>
                    {DAYS.map((d) => <th key={d.d} className="lx-dh"><b>{String(d.d).padStart(2, "0")}</b><small>{d.w}</small></th>)}
                    <th>Total</th><th>Status</th><th />
                  </tr>
                </thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.id}>
                      <td><Who e={r} /></td>
                      <td className="lx-idc">{r.id}</td>
                      {r.days.map((v, i) => {
                        const d = DAYS[i].d, m = r.meta[d], o = r.otArr[i];
                        const tip = v === "H" ? r.hmap[d] : m ? `${m.mode === "WFH" ? "WFH" : "Office"} ${clock(hm(m.inT))} → ${clock(hm(m.outT))}${m.next ? " (+1d)" : ""} · break ${m.brk}m · net ${m.net}h${o ? " · OT " + o + "h" : ""}` : o ? `OT ${o}h` : undefined;
                        return (
                          <td key={i} className="lx-dc">
                            <span className={"lx-cell lx-" + kind(v, o) + (m && m.mode === "WFH" ? " lx-wfh" : "") + (flash && flash.id === r.id && flash.day === d ? " lx-flash" : "")} title={tip}>
                              {label(v)}{o > 0 && <sup>+{o}</sup>}
                            </span>
                          </td>
                        );
                      })}
                      <td className="lx-tot">{r.total}h</td>
                      <td><Badge s={r.status} /></td>
                      <td><button className="lx-b lx-b-soft" onClick={() => setOpen(r.id)}><I n="eye" /> View</button></td>
                    </tr>
                  ))}
                  {!shown.length && <tr><td colSpan="15" className="lx-empty">No timesheets found</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ---- Approval (card queue) ---- */}
        {applied && tab === "approval" && (
          <div className="lx-appr">
            <div className="lx-appr-top">
              <div className="lx-appr-title">
                <span className="lx-badge2">2</span>
                <div><h2>Approve Timesheets</h2><p>Review each submission, then approve or reject. Only Admin / Super Admin can take action.</p></div>
              </div>
              <button className="lx-b lx-b-blue" disabled={!sel.length} onClick={() => act(sel, "Approved")}>
                <I n={can ? "check" : "lock"} /> Approve Selected{sel.length ? ` (${sel.length})` : ""}
              </button>
            </div>

            {!can && <div className="lx-lock"><I n="lock" /> You are viewing as <b>{role}</b>. Approval actions are restricted to <b>Admin / Super Admin</b>.</div>}

            <div className="lx-appr-bar">
              <div className="lx-seg">
                {["Pending", "Approved", "Rejected"].map((s) => (
                  <button key={s} className={sub === s ? "on" : ""} onClick={() => { setSub(s); setSel([]); }}>{s} <em className={"lx-em-" + s}>{count(s)}</em></button>
                ))}
              </div>
              <div className="lx-sums">
                <span><small>Hours to review</small><b>{queueHours}h</b></span>
                <span><small>Overtime</small><b>{queueOt}h</b></span>
                {sub === "Pending" && queue.length > 0 && (
                  <label className="lx-all"><input type="checkbox" checked={sel.length === queue.length} onChange={() => setSel(sel.length === queue.length ? [] : queue.map((r) => r.id))} /> Select all</label>
                )}
              </div>
            </div>

            <div className="lx-qgrid">
              {queue.map((r) => (
                <ApprovalCard key={r.id} r={r} can={can} pending={sub === "Pending"}
                  checked={sel.includes(r.id)}
                  onCheck={() => setSel((s) => s.includes(r.id) ? s.filter((x) => x !== r.id) : [...s, r.id])}
                  onAct={act} onView={() => setOpen(r.id)} />
              ))}
            </div>
            {!queue.length && <div className="lx-empty lx-empty-lg">Nothing in {sub.toLowerCase()} 🎉</div>}
          </div>
        )}

        {/* ---- Holidays ---- */}
        {tab === "holidays" && (
          <div className="lx-hols">
            <div className="lx-hhead">
              <div><h2>Holiday Calendar · September 2026</h2>
                <p>Region-wise holidays. India employees follow India dates, US employees follow USA dates. Holidays are paid and not counted as leave.</p></div>
              <div className="lx-seg">{["All", "India", "USA"].map((f) => <button key={f} className={hf === f ? "on" : ""} onClick={() => setHf(f)}>{f}</button>)}</div>
            </div>
            <div className="lx-hadd">
              <input placeholder="Holiday name" value={nh.name} onChange={(e) => setNh({ ...nh, name: e.target.value })} />
              <input type="number" min="1" max="30" placeholder="Day (1-30)" value={nh.day} onChange={(e) => setNh({ ...nh, day: e.target.value })} />
              <select value={nh.region} onChange={(e) => setNh({ ...nh, region: e.target.value })}><option>India</option><option>USA</option><option>All</option></select>
              <select value={nh.type} onChange={(e) => setNh({ ...nh, type: e.target.value })}><option>Public</option><option>Optional</option></select>
              <button className="lx-b lx-b-blue" onClick={addHoliday}><I n="plus" /> Add Holiday</button>
            </div>
            <div className="lx-hgrid">
              {holidays.filter((h) => hf === "All" || h.region === hf || h.region === "All").sort((a, b) => a.day - b.day).map((h) => (
                <div className={"lx-hcard lx-h-" + h.region} key={h.id}>
                  <div className="lx-hdate"><b>{String(h.day).padStart(2, "0")}</b><small>Sep · {weekday(h.day)}</small></div>
                  <div className="lx-hinfo">
                    <b>{h.name}</b>
                    <span>{h.region === "India" ? "🇮🇳 India" : h.region === "USA" ? "🇺🇸 USA" : "🌐 All regions"} · {rows.filter((e) => h.region === "All" || h.region === regionOf(e)).length} employees</span>
                    <div><em className={"lx-ht-" + h.type}>{h.type}</em>{isWeekend(weekday(h.day)) && <em className="lx-ht-Weekend">Falls on weekend</em>}</div>
                  </div>
                  {h.custom && <button className="lx-hx" title="Remove" onClick={() => setHolidays((x) => x.filter((y) => y.id !== h.id))}><I n="x" /></button>}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {addOpen && (
        <div className="lx-ov lx-ov-c" onClick={() => setAddOpen(false)}>
          <div className="lx-modal" onClick={(e) => e.stopPropagation()}>
            <button className="lx-x" onClick={() => setAddOpen(false)}><I n="x" /></button>
            <div className="lx-mhead"><span className="lx-logo-sm"><I n="plus" /></span>
              <div><h3>Add Timesheet</h3><p>Log a day for an employee · September 2026</p></div></div>

            <label className="lx-f">Employee
              {fEmp ? (
                <div className="lx-picked"><Who e={fEmp} /><button onClick={() => setF({ ...f, empId: "", q: "", day: "" })}>Change</button></div>
              ) : (
                <div className="lx-input"><I n="search" /><input autoFocus placeholder="Type name or ID (min 2 letters)" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} /></div>
              )}
            </label>
            {matches.length > 0 && (
              <div className="lx-sugg">
                {matches.map((m) => (
                  <button key={m.id} onClick={() => pickEmp(m)}><Who e={m} /><small>{m.id}</small></button>
                ))}
              </div>
            )}

            {!fEmp && f.q.trim().length >= 2 && matches.length === 0 && (
              <div className="lx-nomatch">
                <p>No employee found for <b>“{f.q.trim()}”</b>. Add as a new employee to log their timesheet:</p>
                <div className="lx-frow">
                  <label className="lx-f">Department
                    <select value={f.newDept} onChange={(e) => setF({ ...f, newDept: e.target.value })}>
                      {[...new Set(EMP.map((e) => e.dept))].map((d) => <option key={d}>{d}</option>)}
                    </select></label>
                  <label className="lx-f">Location
                    <select value={f.newLoc} onChange={(e) => setF({ ...f, newLoc: e.target.value })}><option>India</option><option>USA – East</option><option>USA – West</option></select></label>
                </div>
                <button className="lx-b lx-b-blue" onClick={createEmp}><I n="plus" /> Add “{f.q.trim()}” as new employee</button>
              </div>
            )}

            <div className="lx-frow">
              <label className="lx-f">Date
                <select value={f.day} disabled={!fEmp} onChange={(e) => setF({ ...f, day: e.target.value })}>
                  <option value="">{fEmp ? "Select date" : "Select employee first"}</option>
                  {DAYS.map((d) => { const st = dayState(d.d, d.w); return <option key={d.d} value={d.d} disabled={!!st}>{`Sep ${String(d.d).padStart(2, "0")} · ${d.w}${st ? " (" + st + ")" : ""}`}</option>; })}
                </select>
              </label>
              <label className="lx-f">Entry type
                <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option>Work</option><option>Half Day</option><option>Leave</option></select>
              </label>
            </div>

            {f.type === "Work" && (
              <>
                <div className="lx-modes">
                  <button className={f.mode === "Office" ? "on" : ""} onClick={() => setF({ ...f, mode: "Office", ...modeTimes("Office") })}>
                    <b>🏢 Office</b><small>Fixed 9:00 AM – 6:00 PM</small></button>
                  <button className={f.mode === "WFH" ? "on" : ""} onClick={() => setF({ ...f, mode: "WFH", ...modeTimes("WFH") })}>
                    <b>🏠 Work From Home</b><small>Flexible · 8h net + 1h break</small></button>
                </div>
                <div className="lx-frow3">
                  <label className="lx-f">Login<input type="time" value={f.inT} onChange={(e) => setF({ ...f, inT: e.target.value })} /></label>
                  <label className="lx-f">Logout<input type="time" value={f.outT} onChange={(e) => setF({ ...f, outT: e.target.value })} /></label>
                  <label className="lx-f">Break (min)<input type="number" min="0" max="240" value={f.brk} onChange={(e) => setF({ ...f, brk: e.target.value })} /></label>
                </div>

                {w.valid ? (
                  <div className="lx-brk">
                    <div><span>Login → Logout{w.next ? " (next day)" : ""}</span><b>{fmtHM(w.span)}</b></div>
                    <div><span>Break (unpaid)</span><b>− {fmtHM(w.br)}</b></div>
                    <div className="lx-brk-net"><span>Net worked</span><b>{fmtHM(w.netMin)}</b></div>
                    <div><span>Required per day</span><b>{POLICY.required}h 00m</b></div>
                    {w.short > 0 ? (
                      <div className="lx-brk-short"><span>Short by</span><b>{fmtHM(w.short)}</b></div>
                    ) : (
                      <div className={"lx-brk-ot" + (w.ot > 0 ? " on" : "")}><span><I n="bolt" /> Overtime{w.capped ? " (capped)" : ""}</span><b>{w.ot > 0 ? fmtHM(w.ot * 60) : "None"}</b></div>
                    )}
                    <p>
                      {f.mode === "WFH"
                        ? <>Overtime starts at <b>{clock(w.otStart)}</b> (login + 8h work + {f.brk || 0}m break).</>
                        : <>Office overtime counts only after <b>{clock(w.otStart)}</b>{w.late > 0 ? <> · logged in {fmtHM(w.late)} late</> : null}.</>}
                      {" "}Min {POLICY.otMin * 60} min, 15-min steps, max {POLICY.otMax}h/day.
                    </p>
                  </div>
                ) : (
                  <div className="lx-brk lx-brk-bad">Net hours must be above 0. Check login, logout and break.</div>
                )}
              </>
            )}
            {f.type === "Half Day" && <div className="lx-calc"><span>Counted as</span><b>4.0h</b></div>}
            {f.type === "Leave" && <div className="lx-calc lx-calc-bad"><span>Counted as</span><b>Leave (0h)</b></div>}

            <p className="lx-fnote">After saving, the timesheet shows in the list and goes to <b>Pending Approval</b>. An entry for the same date is replaced.</p>
            {ferr && <div className="lx-ferr"><I n="x" /> {ferr}</div>}
            <div className="lx-mact">
              <button className="lx-b lx-b-soft" onClick={() => setAddOpen(false)}>Cancel</button>
              <button className="lx-b lx-b-blue" onClick={saveTimesheet}><I n="check" /> Save Timesheet</button>
            </div>
          </div>
        </div>
      )}
      {openRow && <Drawer r={openRow} can={can} onClose={() => setOpen(null)} onAct={act} />}
      {toast && <div className="lx-toast"><I n="check" /> {toast}</div>}
    </div>
  );
}