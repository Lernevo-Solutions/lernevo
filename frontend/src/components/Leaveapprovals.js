import React, { useMemo, useState } from "react";
import "./Leaveapprovals.css";

/* =====================================================================
   Approvals (super admin): every employee's Leave + Permission request in one list.
   Controlled component: parent keeps `requests` and updates them in onDecide(id, status, note).
   Replace DEMO_REQUESTS with your API data.
   ===================================================================== */

const NOW = new Date();
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const rel = (n) => keyOf(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + n));
const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const dshort = (k) => { const d = parseKey(k); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const fmtHrs = (h) => { const m = Math.round(h * 60); return `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}`; };
const ago = (k) => { const n = Math.round((TODAY - parseKey(k)) / 864e5); return n <= 0 ? "today" : n === 1 ? "yesterday" : `${n} days ago`; };
const permHrs = (r) => (toMin(r.end) - toMin(r.start)) / 60;

const L = (id, name, team, kind, a, b, reason, applied, status = "Pending", note = "") =>
  ({ id, name, team, type: "Leave", kind, from: rel(a), to: rel(b), days: b - a + 1, reason, applied: rel(applied), status, note });
const P = (id, name, team, a, start, end, reason, applied, status = "Pending", note = "") =>
  ({ id, name, team, type: "Permission", kind: "Permission", from: rel(a), to: rel(a), start, end, reason, applied: rel(applied), status, note });

export const DEMO_REQUESTS = [
  L(1, "Arun", "Operations Team", "Casual leave", 6, 7, "Family function", -2),
  P(13, "Arun", "Operations Team", -9, "16:00", "17:00", "Bank work", -10, "Approved"),
  P(14, "Arun", "Operations Team", 4, "15:00", "16:00", "Passport photo", -1),
  L(12, "Lakshmi", "Operations Team", "Casual leave", 7, 8, "Temple visit", -2),
  P(6, "Hari", "Operations Team", 2, "10:00", "11:30", "Doctor appointment", 0),
  L(7, "Vikram", "Sales Team", "Earned leave", 20, 24, "Cousin's wedding", -5),
  L(2, "Divya", "Sales Team", "Sick leave", -1, 0, "Fever", -1),
  P(11, "Suresh", "Sales Team", 3, "11:00", "12:00", "Passport office", -1),
  P(3, "Ravi", "Support Team", 1, "15:00", "17:00", "Bank work", -1),
  L(5, "Sana", "Support Team", "Casual leave", 6, 6, "Personal work", -1),
  L(8, "Anitha", "Support Team", "Sick leave", -6, -5, "Viral fever", -7, "Approved"),
  L(4, "Karthik", "Finance & Admin Team", "Earned leave", 12, 16, "Trip to Kerala", -3),
  P(9, "Nisha", "Finance & Admin Team", -3, "16:00", "17:00", "School meeting", -4, "Approved"),
  L(10, "Priya", "Finance & Admin Team", "Casual leave", -8, -8, "Personal work", -10, "Rejected", "Month-end closing, please pick another day."),
];

const STATUSES = ["Pending", "Approved", "Rejected", "All"];

export default function LeaveApprovals({ requests = DEMO_REQUESTS, onDecide }) {
  const [status, setStatus] = useState("Pending");
  const [type, setType] = useState("all");
  const [team, setTeam] = useState("all");
  const [q, setQ] = useState("");
  const [rejecting, setRejecting] = useState(null); // request id whose reject note is open
  const [note, setNote] = useState("");

  const teams = useMemo(() => [...new Set(requests.map((r) => r.team))], [requests]);
  const base = useMemo(() => requests.filter((r) =>
    (type === "all" || r.type === type) && (team === "all" || r.team === team) && r.name.toLowerCase().includes(q.trim().toLowerCase())), [requests, type, team, q]);
  const countOf = (s) => base.filter((r) => s === "All" || r.status === s).length;
  const shown = useMemo(() => base.filter((r) => status === "All" || r.status === status)
    .sort((a, b) => (a.status === "Pending" && b.status === "Pending" ? a.applied.localeCompare(b.applied) : b.applied.localeCompare(a.applied))), [base, status]);

  const waiting = requests.filter((r) => r.status === "Pending");
  const waitDays = waiting.filter((r) => r.type === "Leave").reduce((s, r) => s + r.days, 0);
  const waitHrs = waiting.filter((r) => r.type === "Permission").reduce((s, r) => s + permHrs(r), 0);

  // other people in the same team who are also away on any of these days
  const clash = (r) => r.type !== "Leave" ? [] : requests.filter((o) =>
    o.id !== r.id && o.team === r.team && o.type === "Leave" && o.status !== "Rejected" && o.from <= r.to && o.to >= r.from).map((o) => o.name);

  const decide = (r, s, n = "") => { onDecide(r.id, s, n); setRejecting(null); setNote(""); };

  return (
    <div className="ap-wrap">
      <section className="ap-kpis" aria-label="Approval summary">
        <div><small>Waiting for you</small><b>{waiting.length}</b></div>
        <div><small>Leave days waiting</small><b>{waitDays}</b></div>
        <div><small>Permission hours waiting</small><b>{fmtHrs(waitHrs)}</b></div>
        <div><small>Decided so far</small><b>{requests.length - waiting.length}</b></div>
      </section>

      <div className="ap-filters">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by employee name" aria-label="Search employee" />
        <select value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Team">
          <option value="all">All teams</option>
          {teams.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Request type">
          <option value="all">Leave and permission</option>
          <option value="Leave">Leave only</option>
          <option value="Permission">Permission only</option>
        </select>
      </div>

      <div className="ap-bar">
        <div className="ap-seg" role="tablist" aria-label="Status">
          {STATUSES.map((s) => (
            <button key={s} role="tab" aria-selected={status === s} onClick={() => setStatus(s)}>{s} <b>{countOf(s)}</b></button>
          ))}
        </div>
        {status === "Pending" && shown.length > 1 && (
          <button type="button" className="ap-btn ap-btn--ok" onClick={() => shown.forEach((r) => onDecide(r.id, "Approved", ""))}>Approve all {shown.length} shown</button>
        )}
      </div>

      {shown.length === 0 && (
        <div className="ap-empty">{status === "Pending" ? "You are all caught up. No requests are waiting for approval." : "No requests match these filters."}</div>
      )}

      <ul className="ap-list">
        {shown.map((r) => {
          const clashes = r.status === "Pending" ? clash(r) : [];
          return (
            <li key={r.id} className={`ap-card ap-card--${r.status.toLowerCase()}`}>
              <span className="ap-av" style={{ "--h": (r.name.charCodeAt(0) * 37 + r.name.length * 11) % 360 }}>{r.name.slice(0, 2).toUpperCase()}</span>
              <div className="ap-who"><b>{r.name}</b><small>{r.team}</small></div>

              <div className="ap-main">
                <div className="ap-line">
                  <span className={`ap-type ap-type--${r.type.toLowerCase()}`}>{r.type === "Leave" ? r.kind : "Permission"}</span>
                  {r.type === "Leave"
                    ? <b>{r.days === 1 ? dshort(r.from) : `${dshort(r.from)} to ${dshort(r.to)}`} <em>({r.days} {r.days === 1 ? "day" : "days"})</em></b>
                    : <b>{DOW[parseKey(r.from).getDay()]}, {dshort(r.from)}, {r.start} to {r.end} <em>({fmtHrs(permHrs(r))})</em></b>}
                </div>
                <p>{r.reason}</p>
                <small className="ap-meta">Applied {ago(r.applied)}</small>
                {clashes.length > 0 && <small className="ap-warn">Also on leave in this team: {clashes.join(", ")}</small>}
                {r.status !== "Pending" && r.note && <small className="ap-note">Your note: {r.note}</small>}
              </div>

              <div className="ap-act">
                {r.status === "Pending" ? (
                  <>
                    <button type="button" className="ap-btn ap-btn--ok" onClick={() => decide(r, "Approved")}>Approve</button>
                    <button type="button" className="ap-btn ap-btn--no" onClick={() => { setRejecting(rejecting === r.id ? null : r.id); setNote(""); }}>Reject</button>
                  </>
                ) : <span className={`ap-tag ap-tag--${r.status.toLowerCase()}`}>{r.status}</span>}
              </div>

              {rejecting === r.id && (
                <div className="ap-reject">
                  <input autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tell them why (they will see this)" aria-label={`Reason for rejecting ${r.name}`} />
                  <button type="button" className="ap-btn ap-btn--no" disabled={!note.trim()} onClick={() => decide(r, "Rejected", note.trim())}>Confirm reject</button>
                  <button type="button" className="ap-link" onClick={() => setRejecting(null)}>Cancel</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}