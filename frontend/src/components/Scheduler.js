import React, { useEffect, useMemo, useState } from "react";
import "./Scheduler.css";

/* =====================================================================
   Scheduler
   - Super admin: gives plans to a person or a whole team, edits / deletes them,
     creates / edits teams.
   - Employee: sees only their own upcoming plans and can acknowledge them.
   Props come from <Timesheet/> so both tabs share the same teams, people and plans.
   ===================================================================== */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const NOW = new Date();
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());

const pad = (n) => String(n).padStart(2, "0");
const keyOf = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
const parseKey = (k) => { const [y, m, dd] = k.split("-").map(Number); return new Date(y, m - 1, dd); };
const addDays = (dt, n) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n);
const mondayOf = (dt) => addDays(dt, -((dt.getDay() + 6) % 7));
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const clock = (t) => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}${m ? `:${pad(m)}` : ""} ${h < 12 ? "AM" : "PM"}`; };
const timeSpan = (p) => `${clock(p.start)} – ${clock(p.end)}`;
const hueOf = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);
const diffDays = (k) => Math.round((parseKey(k) - TODAY) / 864e5);
const relDay = (k) => {
  const n = diffDays(k);
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n === -1) return "Yesterday";
  return FULL_DAYS[parseKey(k).getDay()];
};
const niceDate = (k) => { const x = parseKey(k); return `${x.getDate()} ${MONTHS[x.getMonth()].slice(0, 3)} ${x.getFullYear()}`; };

export const PLAN_TYPES = {
  project: { label: "Project work", icon: "💼" },
  meeting: { label: "Meeting", icon: "🤝" },
  training: { label: "Training", icon: "🎓" },
  visit: { label: "Client visit", icon: "📍" },
  shift: { label: "Shift change", icon: "🔄" },
  other: { label: "Other", icon: "✨" },
};

/** Demo plans, relative to today (past 10 days to next 16 days). Replace with your API data (same shape).
 *  Every working day is a FULL 9:00 AM – 6:00 PM plan (back-to-back, lunch 1–2 PM). Each team has 2 day layouts. */
const LUNCH = ["other", "Lunch break", "13:00", "14:00", "Take a proper break."];
const DAY_PLANS = {
  Operations: [
    [
      ["meeting", "Daily stand-up", "09:00", "09:30", "Quick round of today's targets."],
      ["project", "Shift handover report", "09:30", "11:00", "Update the handover sheet before you leave."],
      ["training", "Safety drill", "11:00", "13:00", "Mandatory for everyone on the floor."],
      LUNCH,
      ["project", "Inventory audit", "14:00", "16:30", "Count zone B and C, report mismatches."],
      ["meeting", "End-of-day review", "16:30", "18:00", "Share progress and blockers."],
    ],
    [
      ["meeting", "Daily stand-up", "09:00", "09:30", "Quick round of today's targets."],
      ["visit", "Vendor warehouse visit", "09:30", "13:00", "Carry your ID card. Cab is arranged."],
      LUNCH,
      ["project", "Dispatch & stock planning", "14:00", "16:30", "Plan tomorrow's dispatch list."],
      ["project", "Handover sheet update", "16:30", "18:00", "Close out today's open items."],
    ],
  ],
  Sales: [
    [
      ["meeting", "Sales huddle", "09:00", "09:30", "Targets and priorities for the day."],
      ["project", "Proposal drafting", "09:30", "13:00", "Share the draft with your manager by evening."],
      LUNCH,
      ["visit", "Client demo", "14:00", "16:00", "Demo deck is in the shared folder."],
      ["meeting", "Pipeline review", "16:00", "17:00", "Update your deals before the call."],
      ["project", "CRM update", "17:00", "18:00", "Log today's calls and next steps."],
    ],
    [
      ["meeting", "Sales huddle", "09:00", "09:30", "Targets and priorities for the day."],
      ["training", "Product knowledge session", "09:30", "13:00", "Certificate is issued at the end."],
      LUNCH,
      ["visit", "Customer follow-up visit", "14:00", "17:00", "Carry brochures and the price list."],
      ["project", "Update deals & notes", "17:00", "18:00", ""],
    ],
  ],
  Support: [
    [
      ["meeting", "Escalation review", "09:00", "10:00", "Bring your open tickets."],
      ["project", "Knowledge-base update", "10:00", "13:00", "Rewrite the top 10 outdated articles."],
      LUNCH,
      ["training", "New helpdesk tool training", "14:00", "16:00", "Login details will be mailed."],
      ["other", "Ticket backlog clean-up", "16:00", "18:00", ""],
    ],
    [
      ["meeting", "Escalation review", "09:00", "09:45", "Bring your open tickets."],
      ["other", "Ticket handling", "09:45", "13:00", "Clear the oldest tickets first."],
      LUNCH,
      ["project", "Knowledge-base articles", "14:00", "16:30", ""],
      ["meeting", "Team sync", "16:30", "17:00", "Hand over pending tickets."],
      ["other", "Ticket backlog clean-up", "17:00", "18:00", ""],
    ],
  ],
  Finance: [
    [
      ["meeting", "Finance huddle", "09:00", "09:30", "Priorities for the day."],
      ["project", "Month-end closing", "09:30", "13:00", "Reconcile all open ledgers."],
      LUNCH,
      ["project", "Invoice approvals", "14:00", "15:30", ""],
      ["meeting", "Budget review", "15:30", "17:00", "Bring the variance report."],
      ["project", "Variance report", "17:00", "18:00", "Send the final copy to your manager."],
    ],
    [
      ["other", "Vendor payments run", "09:00", "12:00", "Needs two-person sign-off."],
      ["project", "Invoice approvals", "12:00", "13:00", ""],
      LUNCH,
      ["training", "GST filing update", "14:00", "16:00", "Mandatory for the finance team."],
      ["project", "Ledger reconciliation", "16:00", "18:00", ""],
    ],
  ],
  Admin: [
    [
      ["meeting", "Office planning", "09:00", "10:00", ""],
      ["project", "Asset register update", "10:00", "13:00", "Tag all new laptops."],
      LUNCH,
      ["visit", "Facility inspection", "14:00", "16:00", ""],
      ["other", "Visitor pass audit", "16:00", "18:00", ""],
    ],
    [
      ["meeting", "Office planning", "09:00", "09:30", ""],
      ["training", "First-aid refresher", "09:30", "13:00", "Mandatory."],
      LUNCH,
      ["project", "Vendor & supplies follow-up", "14:00", "16:30", ""],
      ["other", "Visitor pass audit", "16:30", "18:00", ""],
    ],
  ],
};
const GENERIC = DAY_PLANS.Operations;
const rnd = (i, off, k) => Math.abs(Math.sin(i * 12.9898 + off * 78.233 + k * 37.719) * 43758.5453) % 1;

const WEEKEND = [
  ["shift", "Weekend on-call", "09:00", "17:00", "Keep your phone on. Comp-off is added."],
  ["other", "Overtime cover", "10:00", "16:00", "Approved overtime."],
  ["training", "Weekend workshop", "10:00", "13:00", "Optional but recommended."],
  ["visit", "Client event support", "11:00", "15:00", "Dress code: formals."],
];

// Every person gets a full 9 AM – 6 PM plan on every working day (past 10 days to next 16 days).
// Weekends keep a single optional plan.
export function seedPlans(employees) {
  const out = [];
  let n = 1;
  employees.forEach((e, i) => {
    const layouts = DAY_PLANS[e.dept] || GENERIC;
    for (let off = -10; off <= 16; off++) {
      const day = addDays(TODAY, off);
      const weekend = day.getDay() === 0 || day.getDay() === 6;
      const picks = weekend
        ? [WEEKEND[Math.floor(rnd(i, off, 2) * WEEKEND.length)]]
        : layouts[Math.floor(rnd(i, off, 2) * layouts.length)];
      picks.forEach((s, j) => out.push({
        id: `p${n++}`, empId: e.id, date: keyOf(day), type: s[0], title: s[1], start: s[2], end: s[3], note: s[4],
        ack: off < 0 ? true : off <= 1 ? (i + off + j) % 2 === 0 : rnd(i, off, 5 + j) < 0.2,
      }));
    }
  });
  return out;
}

function useEscape(fn) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") fn(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fn]);
}

const Avatar = ({ emp }) => (
  <span className="ts-av sc-av" style={{ "--h": (emp.id * 67) % 360 }}>{emp.name.slice(0, 2).toUpperCase()}</span>
);

/* ---------------------------------------------------------------------
   Pager: shows PAGE_SIZE rows at a time, Next / Prev for the rest
   --------------------------------------------------------------------- */
const PAGE_SIZE = 4;

function Pager({ page, total, size = PAGE_SIZE, label, onPage, compact }) {
  const pages = Math.ceil(total / size);
  if (pages <= 1) return null;
  const from = page * size + 1;
  const to = Math.min(total, (page + 1) * size);
  // 1 … 4 5 6 … 20   (first, last and the pages around the current one)
  const nums = [];
  for (let i = 0; i < pages; i++) {
    if (i === 0 || i === pages - 1 || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  return (
    <div className={`sc-pager ${compact ? "sc-pager--sm" : ""}`}>
      <span className="sc-pg-info">Showing <b>{from}–{to}</b> of {total} {label}</span>
      <div className="sc-pg-btns">
        <button type="button" className="sc-pg" disabled={page === 0} onClick={() => onPage(page - 1)} aria-label="Previous">‹{!compact && " Prev"}</button>
        {!compact && nums.map((n, i) => n === "…"
          ? <span key={`d${i}`} className="sc-pg-dots">…</span>
          : <button type="button" key={n} className={`sc-pg sc-pg--n ${n === page ? "is-on" : ""}`} onClick={() => onPage(n)} aria-current={n === page ? "page" : undefined}>{n + 1}</button>)}
        <button type="button" className="sc-pg" disabled={page >= pages - 1} onClick={() => onPage(page + 1)} aria-label="Next">{!compact && "Next "}›</button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Plan popup (super admin): create for a person / whole team, or edit
   --------------------------------------------------------------------- */
function PlanModal({ plan, prefill, people, teams, onSave, onDelete, onClose }) {
  const editing = Boolean(plan);
  const [target, setTarget] = useState(
    editing ? `e:${plan.empId}` : prefill && prefill.empId ? `e:${prefill.empId}` : people[0] ? `e:${people[0].id}` : ""
  );
  const [date, setDate] = useState((plan && plan.date) || (prefill && prefill.date) || keyOf(TODAY));
  const [start, setStart] = useState((plan && plan.start) || "09:00");
  const [end, setEnd] = useState((plan && plan.end) || "10:00");
  const [type, setType] = useState((plan && plan.type) || "project");
  const [title, setTitle] = useState((plan && plan.title) || "");
  const [note, setNote] = useState((plan && plan.note) || "");
  const [err, setErr] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  useEscape(onClose);

  const submit = (ev) => {
    ev.preventDefault();
    if (!target) return setErr("Choose who this plan is for.");
    if (!title.trim()) return setErr("Give the plan a title.");
    if (!date) return setErr("Pick a date.");
    if (toMin(end) <= toMin(start)) return setErr("End time must be after the start time.");
    onSave({ date, start, end, type, title: title.trim(), note: note.trim() }, target, plan);
  };

  const teamsWithPeople = teams.filter((t) => people.some((e) => e.team === t.id));

  return (
    <div className="sc-ov" onClick={onClose}>
      <form className="sc-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit} role="dialog" aria-modal="true" aria-label={editing ? "Edit plan" : "New plan"}>
        <button type="button" className="sc-x" onClick={onClose} aria-label="Close">×</button>
        <h3>{editing ? "Edit plan" : "Give a new plan"}</h3>
        <p className="sc-sub">{editing ? "Changes are sent to the employee and they will need to acknowledge again." : "Assign work to one person or to a whole team."}</p>

        <label className="sc-f">
          <span>Assign to</span>
          <select value={target} onChange={(e) => setTarget(e.target.value)} disabled={editing}>
            {teamsWithPeople.length > 0 && !editing && (
              <optgroup label="Whole team">
                {teamsWithPeople.map((t) => (
                  <option key={t.id} value={`t:${t.id}`}>👥 {t.name} ({people.filter((e) => e.team === t.id).length} people)</option>
                ))}
              </optgroup>
            )}
            <optgroup label="Individual">
              {people.map((e) => <option key={e.id} value={`e:${e.id}`}>{e.name} · {e.role}</option>)}
            </optgroup>
          </select>
        </label>

        <div className="sc-f">
          <span>Type</span>
          <div className="sc-types">
            {Object.entries(PLAN_TYPES).map(([k, v]) => (
              <button type="button" key={k} className={`sc-typebtn sc-t-${k}`} aria-pressed={type === k} onClick={() => setType(k)}>
                <span aria-hidden="true">{v.icon}</span> {v.label}
              </button>
            ))}
          </div>
        </div>

        <label className="sc-f">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Client demo preparation" maxLength={80} autoFocus />
        </label>

        <div className="sc-row3">
          <label className="sc-f"><span>Date</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label className="sc-f"><span>From</span><input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></label>
          <label className="sc-f"><span>To</span><input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        </div>

        <label className="sc-f">
          <span>Note for the employee <em>(optional)</em></span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Anything they should know or bring" maxLength={300} />
        </label>

        {err && <p className="sc-err" role="alert">{err}</p>}

        <div className="sc-actions">
          {editing && !confirmDel && <button type="button" className="sc-btn sc-btn--danger" onClick={() => setConfirmDel(true)}>Delete</button>}
          {editing && confirmDel && (
            <>
              <button type="button" className="sc-btn sc-btn--danger sc-btn--solid" onClick={() => onDelete(plan)}>Yes, delete</button>
              <button type="button" className="sc-btn" onClick={() => setConfirmDel(false)}>Keep</button>
            </>
          )}
          <span className="sc-spacer" />
          <button type="button" className="sc-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="sc-btn sc-btn--pri">{editing ? "Save changes" : "Give plan"}</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Day popup (super admin): everything planned for one person on one day
   --------------------------------------------------------------------- */
function DayModal({ emp, date, items, onEdit, onAdd, onClose }) {
  useEscape(onClose);
  const mins = items.reduce((a, p) => a + toMin(p.end) - toMin(p.start), 0);
  const hrs = `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ""}`;
  return (
    <div className="sc-ov" onClick={onClose}>
      <div className="sc-modal sc-modal--day" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${emp.name} plans on ${niceDate(date)}`}>
        <button type="button" className="sc-x" onClick={onClose} aria-label="Close">×</button>
        <div className="sc-dm-head">
          <Avatar emp={emp} />
          <div><b>{emp.name}</b><small>{emp.role} · {emp.dept}</small></div>
        </div>
        <div className="sc-dm-date">
          <b>{relDay(date)}</b> · {FULL_DAYS[parseKey(date).getDay()]}, {niceDate(date)}
          <span>{items.length} {items.length === 1 ? "plan" : "plans"} · {hrs}</span>
        </div>
        <ul className="sc-dm-list">
          {items.map((p) => (
            <li key={p.id}>
              <button type="button" className={`sc-dm-item sc-t-${p.type}`} onClick={() => onEdit(p)}>
                <span className="sc-time"><b>{clock(p.start)}</b><small>{clock(p.end)}</small></span>
                <span className="sc-body">
                  <b>{PLAN_TYPES[p.type].icon} {p.title}</b>
                  <small>{PLAN_TYPES[p.type].label}{p.note ? ` · ${p.note}` : ""}</small>
                </span>
                <span className={`sc-ack ${p.ack ? "is-ok" : ""}`}>{p.ack ? "✓ Got it" : "Waiting"}</span>
                <span className="sc-pen" aria-hidden="true">✎</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="sc-actions">
          <span className="sc-spacer" />
          <button type="button" className="sc-btn" onClick={onClose}>Close</button>
          <button type="button" className="sc-btn sc-btn--pri" onClick={onAdd}>＋ Add plan</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Team popup (super admin): create or edit a team and pick its people
   --------------------------------------------------------------------- */
export function TeamModal({ team, people, teams, onSave, onDelete, onClose }) {
  const editing = Boolean(team);
  const [name, setName] = useState((team && team.name) || "");
  const [lead, setLead] = useState(team && team.lead != null ? String(team.lead) : "");
  const [members, setMembers] = useState(() => new Set(team ? people.filter((e) => e.team === team.id).map((e) => e.id) : []));
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  useEscape(onClose);

  const toggle = (id) => setMembers((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const teamName = (id) => (teams.find((t) => t.id === id) || {}).name;

  const submit = (ev) => {
    ev.preventDefault();
    const nm = name.trim();
    if (!nm) return setErr("Give the team a name.");
    if (teams.some((t) => t.name.toLowerCase() === nm.toLowerCase() && (!team || t.id !== team.id))) return setErr("A team with this name already exists.");
    if (members.size === 0 && !lead) return setErr("Add at least one person to the team.");
    const all = new Set(members);
    if (lead) all.add(Number(lead));
    const leadId = lead ? Number(lead) : [...all][0];
    onSave({ id: team && team.id, name: nm, lead: leadId, members: [...all] });
  };

  const shown = people.filter((e) => `${e.name} ${e.role} ${e.dept}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="sc-ov" onClick={onClose}>
      <form className="sc-modal sc-modal--wide" onClick={(e) => e.stopPropagation()} onSubmit={submit} role="dialog" aria-modal="true" aria-label={editing ? "Edit team" : "Create team"}>
        <button type="button" className="sc-x" onClick={onClose} aria-label="Close">×</button>
        <h3>{editing ? "Edit team" : "Create a new team"}</h3>
        <p className="sc-sub">A person belongs to one team. Picking someone from another team moves them here.</p>

        <div className="sc-row2">
          <label className="sc-f"><span>Team name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Marketing Team" maxLength={40} autoFocus /></label>
          <label className="sc-f">
            <span>Team lead</span>
            <select value={lead} onChange={(e) => setLead(e.target.value)}>
              <option value="">Select a lead</option>
              {people.map((e) => <option key={e.id} value={e.id}>{e.name} · {e.role}</option>)}
            </select>
          </label>
        </div>

        <div className="sc-f">
          <span>Members <b className="sc-count">{new Set([...members, ...(lead ? [Number(lead)] : [])]).size} selected</b></span>
          <input className="sc-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people" aria-label="Search people" />
          <ul className="sc-people">
            {shown.map((e) => {
              const on = members.has(e.id) || String(e.id) === lead;
              const from = e.team && (!team || e.team !== team.id) ? teamName(e.team) : "";
              return (
                <li key={e.id}>
                  <label className={on ? "is-on" : ""}>
                    <input type="checkbox" checked={on} disabled={String(e.id) === lead} onChange={() => toggle(e.id)} />
                    <Avatar emp={e} />
                    <span className="sc-pn"><b>{e.name}</b><small>{e.role} · {e.dept}</small></span>
                    {String(e.id) === lead && <em className="sc-lead">Lead</em>}
                    {from && on && String(e.id) !== lead && <em className="sc-moves">moves from {from}</em>}
                    {from && !on && <em className="sc-in">in {from}</em>}
                  </label>
                </li>
              );
            })}
            {shown.length === 0 && <li className="sc-none">No one matches “{q}”.</li>}
          </ul>
        </div>

        {err && <p className="sc-err" role="alert">{err}</p>}

        <div className="sc-actions">
          {editing && !confirmDel && <button type="button" className="sc-btn sc-btn--danger" onClick={() => setConfirmDel(true)}>Delete team</button>}
          {editing && confirmDel && (
            <>
              <button type="button" className="sc-btn sc-btn--danger sc-btn--solid" onClick={() => onDelete(team.id)}>Yes, delete</button>
              <button type="button" className="sc-btn" onClick={() => setConfirmDel(false)}>Keep</button>
            </>
          )}
          <span className="sc-spacer" />
          <button type="button" className="sc-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="sc-btn sc-btn--pri">{editing ? "Save team" : "Create team"}</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Super admin view
   --------------------------------------------------------------------- */
function AdminScheduler({ people, teams, plans, setPlans, onTeam, onMine }) {
  const [teamFilter, setTeamFilter] = useState("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState("board");
  const [anchor, setAnchor] = useState(TODAY);
  const [modal, setModal] = useState(null); // { plan } | { prefill } | {}
  const [page, setPage] = useState(0);      // board: people page
  const [listPage, setListPage] = useState(0);
  const [teamPage, setTeamPage] = useState(0);
  useEffect(() => { setPage(0); setListPage(0); }, [teamFilter, q, view]);

  const todayKey = keyOf(TODAY);
  const weekStart = mondayOf(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekLabel = `${days[0].getDate()} ${MONTHS[days[0].getMonth()].slice(0, 3)} – ${days[6].getDate()} ${MONTHS[days[6].getMonth()].slice(0, 3)} ${days[6].getFullYear()}`;

  const inTeam = useMemo(() => people.filter((e) => teamFilter === "all" || e.team === teamFilter), [people, teamFilter]);
  const scoped = useMemo(() => inTeam.filter((e) => e.name.toLowerCase().includes(q.trim().toLowerCase())), [inTeam, q]);
  const scopedIds = useMemo(() => new Set(scoped.map((e) => e.id)), [scoped]);
  const empById = useMemo(() => Object.fromEntries(people.map((e) => [e.id, e])), [people]);

  const byCell = useMemo(() => {
    const m = {};
    plans.forEach((p) => {
      const k = `${p.empId}:${p.date}`;
      if (!m[k]) m[k] = [];
      m[k].push(p);
    });
    Object.values(m).forEach((a) => a.sort((x, y) => toMin(x.start) - toMin(y.start)));
    return m;
  }, [plans]);

  const dayCount = (k) => plans.filter((p) => p.date === k && scopedIds.has(p.empId)).length;

  // KPIs follow the team filter
  const teamIds = new Set(inTeam.map((e) => e.id));
  const upcoming = plans.filter((p) => teamIds.has(p.empId) && p.date >= todayKey);
  const wkFrom = keyOf(mondayOf(TODAY));
  const wkTo = keyOf(addDays(mondayOf(TODAY), 6));
  const thisWeek = upcoming.filter((p) => p.date >= wkFrom && p.date <= wkTo).length;
  const planned = new Set(upcoming.map((p) => p.empId)).size;
  const waiting = upcoming.filter((p) => !p.ack).length;

  const savePlan = (data, target, existing) => {
    if (existing) {
      setPlans((prev) => prev.map((x) => (x.id === existing.id ? { ...x, ...data, ack: false } : x)));
    } else {
      const ids = target.startsWith("t:") ? people.filter((e) => e.team === target.slice(2)).map((e) => e.id) : [Number(target.slice(2))];
      const stamp = Date.now().toString(36);
      setPlans((prev) => [...prev, ...ids.map((id) => ({ id: `p${stamp}-${id}`, empId: id, ack: false, ...data }))]);
    }
    setModal(null);
  };
  const deletePlan = (p) => { setPlans((prev) => prev.filter((x) => x.id !== p.id)); setModal(null); };

  const listPlans = plans
    .filter((p) => scopedIds.has(p.empId) && p.date >= todayKey)
    .sort((a, b) => (a.date === b.date ? toMin(a.start) - toMin(b.start) : a.date < b.date ? -1 : 1));
  const boardPages = Math.max(1, Math.ceil(scoped.length / PAGE_SIZE));
  const pg = Math.min(page, boardPages - 1);
  const pageRows = scoped.slice(pg * PAGE_SIZE, pg * PAGE_SIZE + PAGE_SIZE);

  const listPages = Math.max(1, Math.ceil(listPlans.length / PAGE_SIZE));
  const lpg = Math.min(listPage, listPages - 1);
  const groups = [];
  listPlans.slice(lpg * PAGE_SIZE, lpg * PAGE_SIZE + PAGE_SIZE).forEach((p) => {
    const g = groups[groups.length - 1];
    if (g && g.date === p.date) g.items.push(p); else groups.push({ date: p.date, items: [p] });
  });

  const teamPages = Math.max(1, Math.ceil(teams.length / PAGE_SIZE));
  const tpg = Math.min(teamPage, teamPages - 1);
  const pageTeams = teams.slice(tpg * PAGE_SIZE, tpg * PAGE_SIZE + PAGE_SIZE);

  const kpis = [
    ["📅", "blue", "Upcoming plans", upcoming.length, "from today onwards"],
    ["🗓", "violet", "This week", thisWeek, "plans on the calendar"],
    ["👥", "teal", "People planned", `${planned}/${inTeam.length}`, "have something upcoming"],
    ["⏳", "amber", "Awaiting “Got it”", waiting, "not acknowledged yet"],
  ];

  return (
    <div className="sc">
      <header className="sc-hero">
        <div>
          <span className="sc-eyebrow">Super admin</span>
          <h1>Scheduler</h1>
          <p>Plan the work for every team, give it to a person or a whole team, and edit it any time.</p>
        </div>
        <div className="sc-hero-btns">
          <button type="button" className="sc-hbtn sc-hbtn--solid" onClick={() => setModal({})}>＋ New plan</button>
          <button type="button" className="sc-hbtn" onClick={() => onTeam(null)}>👥 New team</button>
          <button type="button" className="sc-hbtn" onClick={onMine}>👤 My Timesheet</button>
        </div>
      </header>

      <section className="sc-kpis" aria-label="Scheduler summary">
        {kpis.map(([ic, tone, label, val, sub]) => (
          <div key={label} className={`sc-kpi sc-kpi--${tone}`}>
            <span className="sc-kic" aria-hidden="true">{ic}</span>
            <div><small>{label}</small><b>{val}</b><em>{sub}</em></div>
          </div>
        ))}
      </section>

      <div className="sc-layout">
        <aside className="sc-teams" aria-label="Teams">
          <div className="sc-th">
            <h2>Teams</h2>
            <button type="button" className="sc-mini" onClick={() => onTeam(null)}>＋ New</button>
          </div>
          <button type="button" className={`sc-team ${teamFilter === "all" ? "is-on" : ""}`} onClick={() => setTeamFilter("all")}>
            <span className="sc-tic sc-tic--all">★</span>
            <span className="sc-tt"><b>All people</b><small>{people.length} in {teams.length} {teams.length === 1 ? "team" : "teams"}</small></span>
          </button>
          {pageTeams.map((t) => {
            const mem = people.filter((e) => e.team === t.id);
            const lead = empById[t.lead];
            return (
              <div key={t.id} className={`sc-team ${teamFilter === t.id ? "is-on" : ""}`}>
                <button type="button" className="sc-team-main" onClick={() => setTeamFilter(t.id)}>
                  <span className="sc-tic" style={{ "--h": hueOf(t.id) }}>{t.name.slice(0, 2).toUpperCase()}</span>
                  <span className="sc-tt"><b>{t.name}</b><small>{mem.length} {mem.length === 1 ? "person" : "people"}{lead ? ` · Lead ${lead.name}` : ""}</small></span>
                </button>
                <button type="button" className="sc-edit" onClick={() => onTeam(t)} aria-label={`Edit ${t.name}`} title="Edit team">✎</button>
              </div>
            );
          })}
          {teams.length === 0 && <p className="sc-hint">No teams yet. Create your first team to start planning.</p>}
          <Pager page={tpg} total={teams.length} label="teams" onPage={setTeamPage} compact />
        </aside>

        <main className="sc-main">
          <div className="sc-toolbar">
            <div className="sc-seg" role="tablist" aria-label="Scheduler view">
              {[["board", "Week board"], ["list", "Upcoming list"]].map(([v, l]) => (
                <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}>{l}</button>
              ))}
            </div>
            <input className="sc-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people" aria-label="Search people" />
            {view === "board" && (
              <div className="sc-wnav">
                <button type="button" className="sc-btn" onClick={() => setAnchor(addDays(anchor, -7))} aria-label="Previous week">‹</button>
                <span>{weekLabel}</span>
                <button type="button" className="sc-btn" onClick={() => setAnchor(addDays(anchor, 7))} aria-label="Next week">›</button>
                <button type="button" className="sc-btn sc-btn--pri" onClick={() => setAnchor(TODAY)}>Today</button>
              </div>
            )}
          </div>

          {scoped.length === 0 ? (
            <div className="sc-empty">No one to show here. Pick another team or clear the search.</div>
          ) : view === "board" ? (
            <div className="sc-scroll">
              <div className="sc-board">
                <div className="sc-brow sc-brow--head">
                  <div className="sc-bwho sc-corner">{scoped.length} {scoped.length === 1 ? "person" : "people"}</div>
                  {days.map((day) => (
                    <div key={keyOf(day)} className={`sc-bday ${keyOf(day) === todayKey ? "is-today" : ""}`}>
                      <small>{DAYS[day.getDay()]}</small><b>{day.getDate()}</b>
                      <span className="sc-load">{dayCount(keyOf(day))} {dayCount(keyOf(day)) === 1 ? "plan" : "plans"}</span>
                    </div>
                  ))}
                </div>
                {pageRows.map((e) => (
                  <div className="sc-brow" key={e.id}>
                    <div className="sc-bwho">
                      <Avatar emp={e} />
                      <span><b>{e.name}</b><small>{e.role}</small></span>
                    </div>
                    {days.map((day) => {
                      const k = keyOf(day);
                      const items = byCell[`${e.id}:${k}`] || [];
                      const first = items[0];
                      const cls = `sc-bcell ${k === todayKey ? "is-today" : ""} ${k < todayKey ? "is-past" : ""} ${day.getDay() % 6 === 0 ? "is-wknd" : ""}`;
                      return (
                        <button
                          type="button" key={k} className={cls}
                          onClick={() => setModal(items.length ? { day: { empId: e.id, date: k } } : { prefill: { empId: e.id, date: k } })}
                          title={items.length ? items.map((p) => `${clock(p.start)} ${p.title}`).join("\n") : "Add a plan"}
                          aria-label={items.length ? `${e.name}, ${niceDate(k)}: ${items.length} plans. Click to view` : `Add plan for ${e.name} on ${niceDate(k)}`}
                        >
                          {first ? (
                            <>
                              <span className={`sc-mchip sc-t-${first.type}`}>{PLAN_TYPES[first.type].icon} {clock(first.start)}</span>
                              {items.length > 1 && <span className="sc-more">+{items.length - 1}</span>}
                              {items.every((p) => p.ack) && <i className="sc-tick" title="All acknowledged">✓</i>}
                            </>
                          ) : <span className="sc-addhint">＋</span>}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : groups.length === 0 ? (
            <div className="sc-empty">No upcoming plans. Use “New plan” to give someone their next task.</div>
          ) : (
            <div className="sc-agenda">
              {groups.map((g) => (
                <section key={g.date} className="sc-day">
                  <h3><b>{relDay(g.date)}</b><span>{niceDate(g.date)}</span><em>{g.items.length}</em></h3>
                  {g.items.map((p) => {
                    const e = empById[p.empId];
                    if (!e) return null;
                    return (
                      <button type="button" key={p.id} className={`sc-item sc-t-${p.type}`} onClick={() => setModal({ plan: p })}>
                        <span className="sc-time"><b>{clock(p.start)}</b><small>{clock(p.end)}</small></span>
                        <span className="sc-body">
                          <b>{PLAN_TYPES[p.type].icon} {p.title}</b>
                          {p.note && <small>{p.note}</small>}
                        </span>
                        <span className="sc-who"><Avatar emp={e} /><span>{e.name}</span></span>
                        <span className={`sc-ack ${p.ack ? "is-ok" : ""}`}>{p.ack ? "✓ Got it" : "Waiting"}</span>
                        <span className="sc-pen" aria-hidden="true">✎</span>
                      </button>
                    );
                  })}
                </section>
              ))}
            </div>
          )}
          {scoped.length > 0 && view === "board" && (
            <div className="sc-legend">
              {Object.entries(PLAN_TYPES).map(([k, v]) => <span key={k} className={`sc-t-${k}`}><i />{v.icon} {v.label}</span>)}
              <span className="sc-lg-ack"><b>✓</b> All acknowledged</span>
              <span className="sc-lg-hint">Click a box to see the day's plans</span>
            </div>
          )}
          {scoped.length > 0 && view === "board" && <Pager page={pg} total={scoped.length} label="people" onPage={setPage} />}
          {scoped.length > 0 && view === "list" && <Pager page={lpg} total={listPlans.length} label="plans" onPage={setListPage} />}
        </main>
      </div>

      {modal && modal.day && empById[modal.day.empId] && (
        <DayModal
          emp={empById[modal.day.empId]} date={modal.day.date}
          items={byCell[`${modal.day.empId}:${modal.day.date}`] || []}
          onEdit={(p) => setModal({ plan: p })}
          onAdd={() => setModal({ prefill: { empId: modal.day.empId, date: modal.day.date } })}
          onClose={() => setModal(null)}
        />
      )}
      {modal && !modal.day && (
        <PlanModal plan={modal.plan} prefill={modal.prefill} people={people} teams={teams} onSave={savePlan} onDelete={deletePlan} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Employee view: only my upcoming plans
   --------------------------------------------------------------------- */
function startsIn(p) {
  const n = diffDays(p.date);
  if (n === 0) {
    const t = new Date();
    const nowM = t.getHours() * 60 + t.getMinutes();
    if (nowM >= toMin(p.end)) return "Completed";
    if (nowM >= toMin(p.start)) return "In progress now";
    const m = toMin(p.start) - nowM;
    return `Starts in ${m >= 60 ? `${Math.floor(m / 60)}h ` : ""}${m % 60}m`;
  }
  return n === 1 ? "Tomorrow" : `In ${n} days`;
}

function EmployeeScheduler({ me, people, teams, plans, setPlans, onMine }) {
  const [sel, setSel] = useState(null);
  const todayKey = keyOf(TODAY);
  const team = teams.find((t) => t.id === me.team);
  const lead = team ? people.find((e) => e.id === team.lead) : null;

  const mine = useMemo(
    () => plans.filter((p) => p.empId === me.id && p.date >= todayKey)
      .sort((a, b) => (a.date === b.date ? toMin(a.start) - toMin(b.start) : a.date < b.date ? -1 : 1)),
    [plans, me.id, todayKey]
  );
  const open = mine.filter((p) => startsIn(p) !== "Completed");
  const next = open[0];
  const strip = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i));
  const countOn = (k) => mine.filter((p) => p.date === k).length;
  const shown = sel ? mine.filter((p) => p.date === sel) : mine;
  const groups = [];
  shown.forEach((p) => {
    const g = groups[groups.length - 1];
    if (g && g.date === p.date) g.items.push(p); else groups.push({ date: p.date, items: [p] });
  });
  const ack = (id) => setPlans((prev) => prev.map((x) => (x.id === id ? { ...x, ack: true } : x)));
  const waiting = mine.filter((p) => !p.ack).length;

  return (
    <div className="sc">
      <header className="sc-hero sc-hero--me">
        <div>
          <span className="sc-eyebrow">{team ? team.name : "Your schedule"}</span>
          <h1>Hi {me.name} 👋</h1>
          <p>{open.length ? `You have ${open.length} upcoming ${open.length === 1 ? "plan" : "plans"}${waiting ? `, ${waiting} waiting for your “Got it”` : ", all acknowledged"}.` : "Nothing planned yet. Your admin will add plans here."}</p>
        </div>
        <div className="sc-hero-btns">
          <button type="button" className="sc-hbtn sc-hbtn--solid" onClick={onMine}>👤 My Timesheet</button>
        </div>
        {lead && lead.id !== me.id && <div className="sc-lead-card"><Avatar emp={lead} /><span><small>Team lead</small><b>{lead.name}</b></span></div>}
      </header>

      {next && (
        <section className={`sc-next sc-t-${next.type}`} aria-label="Next up">
          <div className="sc-next-l">
            <span className="sc-pill">{startsIn(next)}</span>
            <h2>{PLAN_TYPES[next.type].icon} {next.title}</h2>
            <p className="sc-next-when">{relDay(next.date)}, {niceDate(next.date)} · {timeSpan(next)}</p>
            {next.note && <p className="sc-next-note">{next.note}</p>}
          </div>
          <div className="sc-next-r">
            <span className="sc-next-type">{PLAN_TYPES[next.type].label}</span>
            {next.ack
              ? <span className="sc-gotit">✓ You acknowledged this</span>
              : <button type="button" className="sc-hbtn sc-hbtn--solid" onClick={() => ack(next.id)}>Got it ✓</button>}
          </div>
        </section>
      )}

      <section className="sc-strip" aria-label="Next 7 days">
        {strip.map((day) => {
          const k = keyOf(day);
          const c = countOn(k);
          return (
            <button type="button" key={k} className={`sc-sday ${sel === k ? "is-on" : ""} ${k === todayKey ? "is-today" : ""}`} onClick={() => setSel(sel === k ? null : k)} aria-pressed={sel === k}>
              <small>{k === todayKey ? "Today" : DAYS[day.getDay()]}</small>
              <b>{day.getDate()}</b>
              <span className="sc-dots" aria-label={`${c} plans`}>
                {c === 0 ? <i className="sc-dot sc-dot--none" /> : Array.from({ length: Math.min(c, 3) }, (_, i) => <i key={i} className="sc-dot" />)}
              </span>
            </button>
          );
        })}
      </section>

      <section className="sc-agenda sc-agenda--me">
        <div className="sc-ah">
          <h2>{sel ? `${relDay(sel)} · ${niceDate(sel)}` : "All upcoming plans"}</h2>
          {sel && <button type="button" className="sc-mini" onClick={() => setSel(null)}>Show all</button>}
        </div>
        {groups.length === 0 && <div className="sc-empty">{sel ? "Nothing planned for this day." : "No upcoming plans."}</div>}
        {groups.map((g) => (
          <div key={g.date} className="sc-day">
            <h3><b>{relDay(g.date)}</b><span>{niceDate(g.date)}</span><em>{g.items.length}</em></h3>
            {g.items.map((p) => (
              <div key={p.id} className={`sc-item sc-item--me sc-t-${p.type}`}>
                <span className="sc-time"><b>{clock(p.start)}</b><small>{clock(p.end)}</small></span>
                <span className="sc-body">
                  <b>{PLAN_TYPES[p.type].icon} {p.title}</b>
                  <small>{PLAN_TYPES[p.type].label}{p.note ? ` · ${p.note}` : ""}</small>
                </span>
                {p.ack ? <span className="sc-ack is-ok">✓ Got it</span> : <button type="button" className="sc-btn sc-btn--pri sc-btn--sm" onClick={() => ack(p.id)}>Got it</button>}
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}

export default function Scheduler({ role = "superadmin", me, people, teams, plans, setPlans, onTeam, onMine }) {
  return role === "superadmin"
    ? <AdminScheduler people={people} teams={teams} plans={plans} setPlans={setPlans} onTeam={onTeam} onMine={onMine} />
    : <EmployeeScheduler me={me} people={people} teams={teams} plans={plans} setPlans={setPlans} onMine={onMine} />;
}