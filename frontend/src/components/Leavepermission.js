import React, { useMemo, useState } from "react";
import "./Leavepermission.css";
import LeaveApprovals, { DEMO_REQUESTS } from "./Leaveapprovals";

/* =====================================================================
   Leave & Permission page
   - Holidays: India + foreign countries (filter by country)
   - Permission: short time off during the work day (apply, balance, history)
   Replace COUNTRIES / HOLIDAYS / LEAVES / SEED_REQUESTS with your API data.
   ===================================================================== */

const NOW = new Date();
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const rel = (n) => keyOf(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + n));
const daysFromToday = (d) => Math.round((d - TODAY) / 864e5);
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const fmtHrs = (h) => { const m = Math.round(h * 60); return `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}`; };
const longDate = (d) => `${DOW[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
const when = (n) => (n === 0 ? "Today" : n === 1 ? "Tomorrow" : n > 1 ? `In ${n} days` : "Passed");

/* ---------- Demo data ---------- */
const COUNTRIES = {
  IN: { name: "India", flag: "🇮🇳" },
  US: { name: "United States", flag: "🇺🇸" },
  GB: { name: "United Kingdom", flag: "🇬🇧" },
  AE: { name: "UAE", flag: "🇦🇪" },
  SG: { name: "Singapore", flag: "🇸🇬" },
};
const HOLIDAYS = [
  ["IN", "2026-01-15", "Pongal"], ["IN", "2026-01-26", "Republic Day"], ["IN", "2026-04-14", "Tamil New Year"],
  ["IN", "2026-08-15", "Independence Day"], ["IN", "2026-10-02", "Gandhi Jayanti"], ["IN", "2026-10-20", "Dussehra"],
  ["IN", "2026-11-08", "Diwali"], ["IN", "2026-12-25", "Christmas"],
  ["US", "2026-01-01", "New Year's Day"], ["US", "2026-01-19", "Martin Luther King Jr. Day"], ["US", "2026-05-25", "Memorial Day"],
  ["US", "2026-07-04", "Independence Day"], ["US", "2026-09-07", "Labor Day"], ["US", "2026-11-26", "Thanksgiving"], ["US", "2026-12-25", "Christmas"],
  ["GB", "2026-01-01", "New Year's Day"], ["GB", "2026-04-03", "Good Friday"], ["GB", "2026-04-06", "Easter Monday"],
  ["GB", "2026-05-04", "Early May bank holiday"], ["GB", "2026-05-25", "Spring bank holiday"], ["GB", "2026-08-31", "Summer bank holiday"],
  ["GB", "2026-12-25", "Christmas Day"], ["GB", "2026-12-28", "Boxing Day (substitute)"],
  ["AE", "2026-03-20", "Eid al-Fitr", true], ["AE", "2026-05-27", "Eid al-Adha", true], ["AE", "2026-12-02", "National Day"], ["AE", "2026-12-03", "National Day"],
  ["SG", "2026-01-01", "New Year's Day"], ["SG", "2026-02-17", "Chinese New Year"], ["SG", "2026-02-18", "Chinese New Year"],
  ["SG", "2026-04-03", "Good Friday"], ["SG", "2026-05-01", "Labour Day"], ["SG", "2026-12-25", "Christmas Day"],
].map(([country, date, name, approx]) => ({ country, date, name, approx: Boolean(approx) }));

const LEAVES = [
  { name: "Casual leave", used: 3, total: 12 },
  { name: "Sick leave", used: 1, total: 8 },
  { name: "Earned leave", used: 4, total: 15 },
];

const SHIFT = { start: "09:00", end: "18:00" };
const QUOTA = { hours: 6, maxPerRequest: 2, count: 4 }; // per month
const REASONS = ["Doctor / medical", "Bank / government work", "Family function", "Personal work", "Other"];

/* ---------- Holidays ---------- */
function Holidays({ homeCountry, holidays }) {
  const [country, setCountry] = useState("all");
  const [hidePast, setHidePast] = useState(false);

  const items = useMemo(() => holidays
    .filter((h) => country === "all" || h.country === country)
    .map((h) => { const d = parseKey(h.date); return { ...h, d, diff: daysFromToday(d) }; })
    .filter((h) => !hidePast || h.diff >= 0)
    .sort((a, b) => a.d - b.d || a.country.localeCompare(b.country)), [holidays, country, hidePast]);

  const next = items.find((h) => h.diff >= 0);
  const countOf = (c) => holidays.filter((h) => c === "all" || h.country === c).length;
  const order = [homeCountry, ...Object.keys(COUNTRIES).filter((c) => c !== homeCountry)];
  const groups = [];
  items.forEach((h) => {
    const label = `${MONTHS[h.d.getMonth()]} ${h.d.getFullYear()}`;
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.rows.push(h); else groups.push({ label, rows: [h] });
  });

  return (
    <div>
      <div className="lp-chips" role="group" aria-label="Filter by country">
        {["all", ...order].map((c) => (
          <button key={c} type="button" className="lp-chip" aria-pressed={country === c} onClick={() => setCountry(c)}>
            <span aria-hidden="true">{c === "all" ? "🌍" : COUNTRIES[c].flag}</span>
            {c === "all" ? "All countries" : COUNTRIES[c].name}
            <b>{countOf(c)}</b>
          </button>
        ))}
        <label className="lp-switch">
          <input type="checkbox" checked={hidePast} onChange={(e) => setHidePast(e.target.checked)} /> Hide past holidays
        </label>
      </div>

      {next && (
        <div className="lp-next">
          <span className="lp-next__flag" aria-hidden="true">{COUNTRIES[next.country].flag}</span>
          <div>
            <small>Next holiday</small>
            <b>{next.name}</b>
            <span>{COUNTRIES[next.country].name}, {longDate(next.d)}</span>
          </div>
          <span className="lp-next__when">{when(next.diff)}</span>
        </div>
      )}

      {groups.length === 0 && <div className="lp-empty">No holidays to show. Turn off "Hide past holidays" or pick another country.</div>}
      {groups.map((g) => (
        <section key={g.label} className="lp-month">
          <h3>{g.label}</h3>
          <ul className="lp-hgrid">
            {g.rows.map((h) => {
              const weekend = h.d.getDay() === 0 || h.d.getDay() === 6;
              return (
                <li key={h.country + h.date + h.name} className={`lp-hcard ${h.diff < 0 ? "is-past" : ""} ${next && next === h ? "is-next" : ""}`}>
                  <div className="lp-hcard__date"><small>{DOW[h.d.getDay()]}</small><b>{h.d.getDate()}</b></div>
                  <div className="lp-hcard__main">
                    <b>{h.name}{h.approx ? " (approx.)" : ""}</b>
                    <span>{COUNTRIES[h.country].flag} {COUNTRIES[h.country].name}{weekend ? ", falls on a weekend" : ""}</span>
                  </div>
                  <span className="lp-hcard__when">{when(h.diff)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* ---------- Apply permission popup (modal) ---------- */
function ApplyPermissionModal({ me, mine, onClose, onApply }) {
  const [date, setDate] = useState(keyOf(TODAY));
  const [from, setFrom] = useState("10:00");
  const [to, setTo] = useState("11:00");
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const monthKey = keyOf(TODAY).slice(0, 7);
  const usedHrs = mine.filter((r) => r.from.startsWith(monthKey) && r.status !== "Rejected").reduce((s, r) => s + (toMin(r.end) - toMin(r.start)) / 60, 0);
  const usedCount = mine.filter((r) => r.from.startsWith(monthKey) && r.status !== "Rejected").length;
  const left = Math.max(0, QUOTA.hours - usedHrs);
  const usedPct = Math.min(100, Math.round((100 * usedHrs) / QUOTA.hours));
  const asking = (toMin(to) - toMin(from)) / 60;

  const submit = () => {
    setDone("");
    if (!date || parseKey(date) < TODAY) return setError("Pick today or a future date.");
    if (!(asking > 0)) return setError("End time must be after start time.");
    if (toMin(from) < toMin(SHIFT.start) || toMin(to) > toMin(SHIFT.end)) return setError(`Permission must be within your shift, ${SHIFT.start} to ${SHIFT.end}.`);
    if (asking > QUOTA.maxPerRequest) return setError(`One permission can be at most ${QUOTA.maxPerRequest} hours.`);
    const d = parseKey(date);
    const sameMonth = mine.filter((r) => r.from.slice(0, 7) === date.slice(0, 7) && r.status !== "Rejected");
    const usedThere = sameMonth.reduce((s, r) => s + (toMin(r.end) - toMin(r.start)) / 60, 0);
    if (sameMonth.length >= QUOTA.count) return setError(`You have used all ${QUOTA.count} permissions for ${MONTHS[d.getMonth()]}.`);
    if (usedThere + asking > QUOTA.hours + 0.001) return setError(`Only ${fmtHrs(Math.max(0, QUOTA.hours - usedThere))} left for ${MONTHS[d.getMonth()]}.`);
    if (mine.some((r) => r.from === date && r.status !== "Rejected" && toMin(from) < toMin(r.end) && toMin(to) > toMin(r.start))) return setError("You already have a permission at this time.");
    const req = { id: Date.now(), name: me.name, team: me.team, type: "Permission", kind: "Permission", from: date, to: date, start: from, end: to, reason, note: "", applied: keyOf(TODAY), status: "Pending" };
    if (onApply) onApply({ ...req, comment: note.trim() });
    setError(""); setNote("");
    setDone(`Sent to your manager: ${longDate(d)}, ${from} to ${to}.`);
  };

  return (
    <div className="lp-ov" onClick={onClose}>
      <div className="lp-modal" role="dialog" aria-modal="true" aria-label="Apply permission" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lp-x" onClick={onClose} aria-label="Close">×</button>
        <h3 className="lp-modal__title">Apply for permission</h3>

        <div className="lp-bal">
          <div className="lp-ring" style={{ "--p": usedPct }} role="img" aria-label={`${fmtHrs(usedHrs)} of ${QUOTA.hours} hours used this month`}>
            <div><b>{fmtHrs(left)}</b><small>left</small></div>
          </div>
          <p>{MONTHS[TODAY.getMonth()]}: {fmtHrs(usedHrs)} used of {QUOTA.hours}h, {usedCount} of {QUOTA.count} requests.</p>
        </div>

        <div className="lp-form">
          <div className="lp-form__grid">
            <label className="lp-span">Date<input type="date" min={keyOf(TODAY)} value={date} onChange={(e) => { setDate(e.target.value); setError(""); }} /></label>
            <label>From<input type="time" value={from} onChange={(e) => { setFrom(e.target.value); setError(""); }} /></label>
            <label>To<input type="time" value={to} onChange={(e) => { setTo(e.target.value); setError(""); }} /></label>
            <label className="lp-span">Reason
              <select value={reason} onChange={(e) => setReason(e.target.value)}>{REASONS.map((r) => <option key={r}>{r}</option>)}</select>
            </label>
            <label className="lp-span">Note for your manager (optional)
              <textarea rows="2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Where are you going, and when will you be back?" />
            </label>
          </div>
          <div className="lp-form__foot">
            <span className="lp-form__len">{asking > 0 ? `Asking for ${fmtHrs(asking)}` : "Choose start and end time"}</span>
            <button type="button" className="lp-btn" onClick={submit}>Send for approval</button>
          </div>
          {error && <p className="lp-msg lp-msg--err" role="alert">{error}</p>}
          {done && <p className="lp-msg lp-msg--ok" role="status">{done}</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------- Permission: full-width list + many filters + approve/reject ---------- */
const permHrs = (r) => (toMin(r.end) - toMin(r.start)) / 60;
const hueOf = (name) => (name.charCodeAt(0) * 37 + name.length * 11) % 360;

function Permission({ queue, me, onRemove, onApply, onDecide }) {
  // All permission requests except mine (super admin)
  const all = useMemo(
    () => queue.filter((r) => r.type === "Permission" && r.name !== me.name),
    [queue, me.name]
  );
  const mine = useMemo(
    () => queue.filter((r) => r.type === "Permission" && r.name === me.name),
    [queue, me.name]
  );

  const [status, setStatus] = useState("All");
  const [team, setTeam] = useState("all");
  const [q, setQ] = useState("");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showApply, setShowApply] = useState(false);
  const [rejecting, setRejecting] = useState(null);
  const [note, setNote] = useState("");

  const teams = [...new Set(all.map((r) => r.team))];
  const base = all.filter((r) => {
    if (team !== "all" && r.team !== team) return false;
    if (reasonFilter !== "all" && r.reason !== reasonFilter) return false;
    if (dateFrom && r.from < dateFrom) return false;
    if (dateTo && r.from > dateTo) return false;
    if (q.trim() && !r.name.toLowerCase().includes(q.trim().toLowerCase())) return false;
    return true;
  });
  const countOf = (s) => base.filter((r) => s === "All" || r.status === s).length;
  const rows = base.filter((r) => status === "All" || r.status === status)
    .sort((a, b) => b.from.localeCompare(a.from) || b.start.localeCompare(a.start));
  const outToday = all.filter((r) => r.from === keyOf(TODAY) && r.status !== "Rejected");

  const decide = (r, s, n = "") => {
    if (onDecide) onDecide(r.id, s, n);
    setRejecting(null);
    setNote("");
  };

  const clearFilters = () => {
    setQ(""); setTeam("all"); setStatus("All"); setReasonFilter("all"); setDateFrom(""); setDateTo("");
  };

  return (
    <div className="lp-perm">
      <div className="lp-ptop">
        <div className="lp-ptop__title">
          <h3>Permission requests</h3>
          <small>{rows.length} of {all.length} shown</small>
        </div>
        <button type="button" className="lp-btn" onClick={() => setShowApply(true)}>＋ Apply permission</button>
      </div>

      {outToday.length > 0 && (
        <div className="lp-out">
          <b>Out on permission today</b>
          <span>{outToday.map((r) => `${r.name} ${r.start}–${r.end}${r.status === "Pending" ? " (pending)" : ""}`).join(", ")}</span>
        </div>
      )}

      <div className="lp-pfilters">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by employee name" aria-label="Search employee" />
        <select value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Team">
          <option value="all">All teams</option>
          {teams.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value)} aria-label="Reason">
          <option value="all">All reasons</option>
          {REASONS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <label className="lp-dfilter">From
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="From date" />
        </label>
        <label className="lp-dfilter">To
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="To date" />
        </label>
        <button type="button" className="lp-link" onClick={clearFilters}>Clear filters</button>
      </div>

      <div className="lp-chips" role="group" aria-label="Filter by status">
        {["All", "Pending", "Approved", "Rejected"].map((s) => (
          <button key={s} type="button" className="lp-chip" aria-pressed={status === s} onClick={() => setStatus(s)}>{s}<b>{countOf(s)}</b></button>
        ))}
      </div>

      {rows.length === 0 && <div className="lp-empty">No permission requests match these filters.</div>}
      <ul className="lp-plist">
        {rows.map((r) => (
          <li key={r.id} className={`lp-prow lp-prow--${r.status.toLowerCase()}`}>
            <span className="lp-pav" style={{ "--h": hueOf(r.name) }}>{r.name.slice(0, 2).toUpperCase()}</span>
            <div className="lp-pwho"><b>{r.name}</b><small>{r.team}</small></div>
            <div className="lp-pwhen"><b>{longDate(parseKey(r.from))}</b><span>{r.start} to {r.end} ({fmtHrs(permHrs(r))})</span></div>
            <div className="lp-preason">{r.reason}</div>
            <span className={`lp-tag lp-tag--${r.status.toLowerCase()}`}>{r.status}</span>

            {r.status === "Pending" ? (
              <div className="lp-pact">
                <button type="button" className="lp-btn lp-btn--ok" onClick={() => decide(r, "Approved")}>Approve</button>
                <button type="button" className="lp-btn lp-btn--no" onClick={() => { setRejecting(rejecting === r.id ? null : r.id); setNote(""); }}>Reject</button>
              </div>
            ) : (
              r.note && <small className="lp-pnote">Note: {r.note}</small>
            )}

            {rejecting === r.id && (
              <div className="lp-reject">
                <input autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tell them why (they will see this)" aria-label={`Reason for rejecting ${r.name}`} />
                <button type="button" className="lp-btn lp-btn--no" disabled={!note.trim()} onClick={() => decide(r, "Rejected", note.trim())}>Confirm reject</button>
                <button type="button" className="lp-link" onClick={() => setRejecting(null)}>Cancel</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {showApply && (
        <ApplyPermissionModal
          me={me}
          mine={mine}
          onClose={() => setShowApply(false)}
          onApply={onApply}
        />
      )}
    </div>
  );
}

/* ---------- Page ---------- */
export default function LeavePermission({ homeCountry = "IN", holidays = HOLIDAYS, leaves = LEAVES, onApplyPermission, isAdmin = false, approvals = DEMO_REQUESTS, onDecision, me = { name: "Arun", team: "Operations Team" } }) {
  const [tab, setTab] = useState("holidays");
  const [queue, setQueue] = useState(approvals);
  const removeReq = (id) => setQueue((qs) => qs.filter((r) => r.id !== id));
  const waiting = queue.filter((r) => r.status === "Pending" && r.name !== me.name).length;
  const decide = (id, status, note) => {
    setQueue((qs) => qs.map((r) => (r.id === id ? { ...r, status, note } : r)));
    if (onDecision) onDecision(id, status, note);
  };

  return (
    <div className="lp-page">
      <header className="lp-hero">
        <h1>Leave &amp; Permission</h1>
        <p>See every holiday across your offices, check your leave balance and ask for permission when you need a few hours off.</p>
        <div className="lp-leaves">
          {leaves.map((l) => (
            <div key={l.name} className="lp-leave">
              <span>{l.name}</span>
              <b>{l.total - l.used}<small> of {l.total} left</small></b>
              <i aria-hidden="true"><u style={{ width: `${(100 * (l.total - l.used)) / l.total}%` }} /></i>
            </div>
          ))}
        </div>
      </header>

      <div className="lp-tabs" role="tablist">
        <button role="tab" aria-selected={tab === "holidays"} onClick={() => setTab("holidays")}>Holidays</button>
        <button role="tab" aria-selected={tab === "permission"} onClick={() => setTab("permission")}>Permission</button>
        {isAdmin && (
          <button role="tab" aria-selected={tab === "approvals"} onClick={() => setTab("approvals")}>
            Approvals{waiting > 0 && <b className="lp-badge">{waiting}</b>}
          </button>
        )}
      </div>

      {tab === "holidays" && <Holidays homeCountry={homeCountry} holidays={holidays} />}
      {tab === "permission" && <Permission queue={queue} me={me} onRemove={removeReq} onApply={onApplyPermission} onDecide={decide} />}
      {tab === "approvals" && isAdmin && <LeaveApprovals requests={queue} onDecide={decide} />}
    </div>
  );
}