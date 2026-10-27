import { useMemo, useState } from "react";
import "./Performance.css";

/* Each review frequency gets its own colour so teams are easy to tell apart */
const CADENCES = {
  WEEKLY: { label: "Weekly", color: "#0d9488" },
  MONTHLY: { label: "Monthly", color: "#2f5bff" },
  QUARTERLY: { label: "Quarterly", color: "#7c5cff" },
  HALF_YEARLY: { label: "Half-yearly", color: "#d97706" },
  YEARLY: { label: "Yearly", color: "#d6336c" },
};
const DESC = { WEEKLY: "Quick check-ins for shift and operations teams", MONTHLY: "One-on-ones to track progress and blockers", QUARTERLY: "OKR reviews with goal alignment", HALF_YEARLY: "Mid-year growth and skill review", YEARLY: "Annual appraisal with compensation and career growth" };
const ORGS = ["All organizations", "Apex Retail", "Northwind Logistics", "Zenith Tech"];

const INITIAL = [
  { id: 1, org: "Apex Retail", name: "Store floor", cadence: "WEEKLY", employees: 128, signed: 96, overdue: 6, next: "30 Oct" },
  { id: 2, org: "Apex Retail", name: "Regional managers", cadence: "QUARTERLY", employees: 22, signed: 10, overdue: 1, next: "31 Dec" },
  { id: 3, org: "Northwind Logistics", name: "Warehouse shifts", cadence: "WEEKLY", employees: 210, signed: 150, overdue: 12, next: "30 Oct" },
  { id: 4, org: "Northwind Logistics", name: "Fleet operations", cadence: "MONTHLY", employees: 64, signed: 40, overdue: 3, next: "31 Oct" },
  { id: 5, org: "Zenith Tech", name: "Engineering", cadence: "QUARTERLY", employees: 86, signed: 52, overdue: 4, next: "31 Dec" },
  { id: 6, org: "Zenith Tech", name: "Product and design", cadence: "HALF_YEARLY", employees: 28, signed: 12, overdue: 0, next: "31 Dec" },
  { id: 7, org: "Zenith Tech", name: "Leadership", cadence: "YEARLY", employees: 12, signed: 4, overdue: 2, next: "15 Jan" },
];
const ATTENTION = [
  { id: "a", who: "Ravi Menon", where: "Warehouse shifts", note: "12 reviews overdue" },
  { id: "b", who: "Priya Shah", where: "Store floor", note: "6 reviews overdue" },
  { id: "c", who: "Karthik Raja", where: "Engineering", note: "4 reviews overdue" },
];
const CYCLES0 = [
  { id: 1, name: "Weekly sync, Week 43", cadence: "WEEKLY", start: "26 Oct", due: "30 Oct", done: 231, total: 338, status: "Active" },
  { id: 2, name: "Q4 2026 OKR review", cadence: "QUARTERLY", start: "1 Oct", due: "31 Dec", done: 62, total: 108, status: "Active" },
  { id: 3, name: "Annual appraisal 2026", cadence: "YEARLY", start: "1 Dec", due: "15 Jan", done: 0, total: 12, status: "Upcoming" },
];
const sum = (rows, k) => rows.reduce((a, r) => a + r[k], 0);
const pctOf = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const TXT = {
  en: {
    title: "Performance reviews", sub: "Choose how often each team is reviewed, and see who is falling behind.", create: "+ Create review cycle",
    ok: "Every review is on track", late: (n) => `${n} ${n === 1 ? "review is" : "reviews are"} overdue`,
    line: (p, n, o) => `${p}% of ${n} people have a signed-off review${o ? ` in ${o}` : ""}.`,
    signed: (n) => `${n} signed off`, signedS: "Manager and employee have both signed",
    wait: (n) => `${n} not signed yet`, waitS: "Still inside the due date",
    lateK: (n) => `${n} overdue`, lateS: "Past the due date and still open", ring: "signed off",
    focus: "Start here", focusT: (n) => `Send a reminder to ${n} ${n === 1 ? "manager" : "managers"} who ${n === 1 ? "is" : "are"} behind`, focusB: "Remind all", focusDone: "All reminders sent. Nice work!",
    hide: "Hide tips", steps: [["Choose how often", "Pick a review frequency for each team in the table below."], ["Start a review cycle", "Press Create review cycle. Everyone in the team gets their form."], ["Follow up", "Managers and employees fill in and sign. Late ones show under Needs attention."]],
    teams: "How often is each team reviewed?", teamsS: "Change the frequency from the dropdown. It saves straight away.", cols: ["Team", "Review how often", "Progress", "Next review"], all: "All", people: "people", of: "of", signedOff: "signed off", od: "overdue", next: "Next review: ", none: "No teams use this frequency yet.",
    att: "Needs attention", attS: "These managers have reviews past the due date.", remind: "Send reminder", reminded: "✓ Reminded", rem: (w) => `Reminder sent to ${w}`,
    cyc: "Review cycles", cycS: "Reviews that are running now or starting soon.", on: "Running now", soon: "Starts soon", done: (a, b, p) => `${a} of ${b} reviews done (${p}%)`, to: "to",
    changed: (l) => `Review frequency changed to ${l}`,
  },
};

const CSS = `
.sa.pf{--pf-ink:#14213d;--pf-mut:#5b6b8c;--pf-ln:#e1e8f7;--pf-blue:#2f5bff;--pf-ok:#12a37a;--pf-wait:#8fb0ff;--pf-bad:#e5484d;
  font-family:"Plus Jakarta Sans",system-ui,sans-serif;display:grid;gap:20px;width:100%;margin:0;padding:clamp(14px,2.4vw,32px);border-radius:0;background:#f4f6fc;color:var(--pf-ink);container-type:inline-size;font-size:14px;line-height:1.45}
.pf h1,.pf h2,.pf p{margin:0}
.pf-head{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;justify-content:space-between}
.pf-head h1{font-size:clamp(24px,3vw,32px);font-weight:800;letter-spacing:-.02em;color:#0f1b3d}
.pf-head p{margin-top:4px;max-width:52ch;color:var(--pf-mut);font-size:15px}
.pf-act{display:flex;flex-wrap:wrap;gap:10px}
.sa.pf .pf-sel{width:100%;padding:9px 12px;border:1.5px solid var(--pf-ln);border-radius:10px;background:#fff;color:var(--pf-ink);font-weight:600;font-size:14px}
.pf-act .pf-sel{width:auto;min-width:190px}
.sa.pf .pf-go{border:0;padding:12px 20px;border-radius:12px;background:var(--pf-blue);color:#fff;font-weight:700;box-shadow:0 8px 18px -8px rgba(47,91,255,.7);transition:background .15s}
.sa.pf .pf-go:hover{background:#1f45d6}

.pf-hero{padding:28px 30px;border-radius:22px;background:#0f1b3d;color:#fff}
.pf-hero h2{font-size:clamp(21px,2.6vw,30px);font-weight:800;letter-spacing:-.01em;line-height:1.2}
.pf-hero>p{margin-top:6px;color:#b9c6ea;font-size:15px}
.pf-seg{display:flex;gap:3px;height:18px;margin-top:22px;border-radius:99px;overflow:hidden;background:rgba(255,255,255,.1)}
.pf-seg i{display:block;height:100%;transition:width .4s}
.pf-seg .ok,.pf-mini .ok{background:#2fd4a0}.pf-seg .wait,.pf-mini .wait{background:#7ea3ff}.pf-seg .bad,.pf-mini .bad{background:#ff6b70}
.pf-key{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:16px;margin-top:20px}
.pf-key div{display:grid;grid-template-columns:12px 1fr;column-gap:10px;align-items:baseline}
.pf-key i{width:12px;height:12px;border-radius:4px}
.pf-key strong{font-size:15px;font-weight:700}
.pf-key small{grid-column:2;color:#b9c6ea;font-size:13px;line-height:1.35}

.pf-how{display:flex;flex-wrap:wrap;gap:16px 28px;align-items:center;padding:18px 22px;border-radius:18px;background:#fff;border:1px solid var(--pf-ln)}
.pf-how ol{display:flex;flex-wrap:wrap;gap:16px 28px;flex:1;margin:0;padding:0;list-style:none;counter-reset:s}
.pf-how li{display:flex;gap:12px;flex:1 1 220px;counter-increment:s}
.pf-how li:before{content:counter(s);flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#e8eeff;color:#1d3fd0;font-weight:800;font-size:13px}
.pf-how strong{display:block;font-size:14px}.pf-how small{color:var(--pf-mut);font-size:13px}
.sa.pf .pf-hide{border:0;background:transparent;color:var(--pf-mut);font-weight:600;padding:6px 10px;border-radius:8px}
.sa.pf .pf-hide:hover{background:#eef2ff;color:#1d3fd0}

.pf-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:20px;align-items:start}
@container (min-width:1000px){.pf-grid{grid-template-columns:minmax(0,1.7fr) minmax(300px,1fr)}}
.pf-side{display:grid;gap:20px}
.pf-card{padding:24px;border-radius:18px;background:#fff;border:1px solid var(--pf-ln);box-shadow:0 1px 2px rgba(20,33,61,.04)}
.pf-card h2{font-size:18px;font-weight:800;color:#0f1b3d}
.pf-sub{margin:2px 0 14px!important;color:var(--pf-mut);font-size:13.5px}

.pf-thead,.pf-trow{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(150px,1fr) minmax(150px,1fr) auto;gap:14px;align-items:center}
.pf-thead{padding:0 6px 8px;color:var(--pf-mut);font-size:13px;font-weight:600}
.pf-trow{padding:14px 6px;border-top:1px solid #edf1fb;border-radius:12px}
.pf-trow:hover{background:#f6f8fe}
.pf-team{display:flex;align-items:center;gap:12px;min-width:0}.pf-team>div{min-width:0}
.pf-sq{flex:none;width:42px;height:42px;border-radius:12px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:17px}
.pf-team strong{display:block;color:#0f1b3d}.pf-team small,.pf-cap,.pf-prog small{color:var(--pf-mut);font-size:12.5px;line-height:1.35}
.pf-cap{display:block;margin-top:5px}
.pf-mini{display:flex;gap:2px;height:8px;border-radius:9px;overflow:hidden;background:#edf1fb}
.pf-mini i{display:block;height:100%;transition:width .4s}
.pf-prog small{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin-top:6px}
.pf-prog b{color:#0f1b3d}
.pf-od{padding:2px 8px;border-radius:99px;background:#ffe8e8;color:#b42318;font-weight:700;font-size:12px}
.pf-date{justify-self:end;padding:6px 12px;border-radius:10px;background:#eef2ff;color:#1d3fd0;font-weight:700;font-size:13px;white-space:nowrap}
.pf-narrow{display:none}
@container (max-width:700px){.pf-thead{display:none}.pf-trow{grid-template-columns:minmax(0,1fr)}.pf-date{justify-self:start}.pf-narrow{display:inline}}

.pf-item{display:flex;align-items:center;gap:12px;padding:12px;margin-top:10px;border-radius:12px;background:#f6f8fe;border:1px solid #e8eeff}
.pf-item>div{flex:1;min-width:0}.pf-item strong{display:block}.pf-item small{color:var(--pf-mut);font-size:12.5px}
.pf-av{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:#e0e8ff;color:#1d3fd0;font-weight:800}
.sa.pf .pf-remind{border:0;padding:7px 14px;border-radius:99px;background:var(--pf-blue);color:#fff;font-weight:700;font-size:13px;white-space:nowrap}
.sa.pf .pf-remind:disabled{background:#dff5ea;color:#0b7a57;cursor:default}
.pf-cyc{padding:14px;margin-top:10px;border-radius:12px;border:1px solid var(--pf-ln)}
.pf-cyc-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.pf-cyc strong{display:block}.pf-cyc small{color:var(--pf-mut);font-size:12.5px}
.pf-tag{padding:3px 10px;border-radius:99px;color:#fff;font-size:12px;font-weight:600;white-space:nowrap}
.pf-cyc .pf-mini{margin-top:10px}.pf-cyc .pf-mini i{background:var(--pf-blue)}
.pf-state{font-weight:700}.pf-state.on{color:#0b7a57}.pf-state.soon{color:#b45309}
@media(prefers-reduced-motion:reduce){.pf-seg i,.pf-mini i{transition:none}}
.pf-hero{display:flex;flex-wrap:wrap;gap:24px 36px;align-items:center;justify-content:space-between;padding:30px 32px;border-radius:24px;color:#fff;background:radial-gradient(circle at 88% 15%,rgba(124,92,255,.55),transparent 50%),radial-gradient(circle at 5% 100%,rgba(47,212,160,.22),transparent 45%),#0f1b3d}
.pf-hero-main{flex:1 1 320px;min-width:0}
.pf-ring{flex:none;width:170px;height:170px}
.pf-key{margin-top:22px}
.pf-focus{display:flex;flex-wrap:wrap;align-items:center;gap:14px 18px;padding:18px 22px;border-radius:18px;background:#fff7e6;border:1.5px solid #ffd58a}
.pf-focus>div{flex:1 1 240px}.pf-focus strong{display:block;font-size:15px;color:#7a4a00}.pf-focus span{color:#5b4a2a}
.pf-focus-ic{font-size:28px}
.pf-chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}
.sa.pf .pf-chips button{--c:#0f1b3d;display:flex;align-items:center;gap:7px;padding:7px 14px;border-radius:99px;border:1.5px solid var(--pf-ln);background:#fff;color:var(--pf-ink);font-weight:600;font-size:13px}
.pf-chips b{padding:0 7px;border-radius:99px;background:#eef2ff;font-size:12px}
.sa.pf .pf-chips button.on{background:var(--c);border-color:var(--c);color:#fff}.pf-chips button.on b{background:rgba(255,255,255,.25)}
.pf-empty{padding:18px 6px;color:var(--pf-mut)}
.pf-trow{transition:background .15s}
.pf-sq{box-shadow:0 8px 16px -8px rgba(20,33,61,.5)}
`;

function Bar({ signed, wait, late, total, className }) {
  const w = (n) => `${total ? (n / total) * 100 : 0}%`;
  return (
    <div className={className} role="img" aria-label={`${signed} signed off, ${wait} not signed yet, ${late} overdue`}>
      <i className="ok" style={{ width: w(signed) }} /><i className="wait" style={{ width: w(wait) }} /><i className="bad" style={{ width: w(late) }} />
    </div>
  );
}

function Ring({ signed, wait, late, total, pct, label }) {
  const C = 2 * Math.PI * 54;
  let off = 0;
  const arcs = [[signed, "#2fd4a0"], [wait, "#7ea3ff"], [late, "#ff6b70"]].map(([n, c]) => {
    const len = total ? (n / total) * C : 0;
    const el = <circle key={c} cx="70" cy="70" r="54" fill="none" stroke={c} strokeWidth="14" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} />;
    off += len;
    return el;
  });
  return (
    <svg viewBox="0 0 140 140" className="pf-ring" role="img" aria-label={`${pct}% ${label}`}>
      <g transform="rotate(-90 70 70)"><circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="14" />{arcs}</g>
      <text x="70" y="72" textAnchor="middle" fontSize="30" fontWeight="800" fill="#fff">{pct}%</text>
      <text x="70" y="92" textAnchor="middle" fontSize="11" fontWeight="600" fill="#b9c6ea">{label}</text>
    </svg>
  );
}

export default function SuperAdminPerformance() {
  const [rows, setRows] = useState(INITIAL);
  const [org, setOrg] = useState(ORGS[0]);
  const [cad, setCad] = useState("ALL");
  const [cycles, setCycles] = useState(CYCLES0);
  const [wizard, setWizard] = useState(false);
  const [toast, setToast] = useState("");
  const [help, setHelp] = useState(true);
  const [reminded, setReminded] = useState({});

  const t = TXT.en;
  const cl = (k) => CADENCES[k].label;
  const ds = (k) => DESC[k];

  const inOrg = useMemo(() => (org === ORGS[0] ? rows : rows.filter((r) => r.org === org)), [rows, org]);
  const visible = cad === "ALL" ? inOrg : inOrg.filter((r) => r.cadence === cad);
  const emp = sum(inOrg, "employees");
  const signed = sum(inOrg, "signed");
  const late = sum(inOrg, "overdue");
  const wait = Math.max(0, emp - signed - late);
  const pct = pctOf(signed, emp);
  const behind = ATTENTION.filter((a) => !reminded[a.id]);

  const notify = (m) => { setToast(m); setTimeout(() => setToast(""), 2600); };
  const assign = (id, c) => { setRows((rs) => rs.map((r) => (r.id === id ? { ...r, cadence: c } : r))); notify(t.changed(cl(c))); };
  const remind = (a) => { setReminded((m) => ({ ...m, [a.id]: true })); notify(t.rem(a.who)); };
  const remindAll = () => { setReminded(Object.fromEntries(ATTENTION.map((a) => [a.id, true]))); notify(t.focusDone); };

  return (
    <div className="sa pf">
      <style>{CSS}</style>

      <header className="pf-head">
        <div><h1>{t.title}</h1><p>{t.sub}</p></div>
        <div className="pf-act">
          <select className="pf-sel" value={org} onChange={(e) => setOrg(e.target.value)} aria-label="Organization">{ORGS.map((o) => <option key={o}>{o}</option>)}</select>
          <button className="pf-go" onClick={() => setWizard(true)}>{t.create}</button>
        </div>
      </header>

      <section className="pf-hero" aria-label={t.title}>
        <div className="pf-hero-main">
          <h2>{late === 0 ? t.ok : t.late(late)}</h2>
          <p>{t.line(pct, emp, org === ORGS[0] ? "" : org)}</p>
          <div className="pf-key">
            <div><i style={{ background: "#2fd4a0" }} /><strong>{t.signed(signed)}</strong><small>{t.signedS}</small></div>
            <div><i style={{ background: "#7ea3ff" }} /><strong>{t.wait(wait)}</strong><small>{t.waitS}</small></div>
            <div><i style={{ background: "#ff6b70" }} /><strong>{t.lateK(late)}</strong><small>{t.lateS}</small></div>
          </div>
        </div>
        <Ring signed={signed} wait={wait} late={late} total={emp} pct={pct} label={t.ring} />
      </section>

      <section className="pf-focus" aria-live="polite">
        <span className="pf-focus-ic" aria-hidden="true">{behind.length ? "👉" : "🎉"}</span>
        <div><strong>{t.focus}</strong><span>{behind.length ? t.focusT(behind.length) : t.focusDone}</span></div>
        {behind.length > 0 && <button className="pf-go" onClick={remindAll}>{t.focusB}</button>}
      </section>

      {help && (
        <section className="pf-how">
          <ol>{t.steps.map(([a, d]) => <li key={a}><div><strong>{a}</strong><small>{d}</small></div></li>)}</ol>
          <button className="pf-hide" onClick={() => setHelp(false)}>{t.hide}</button>
        </section>
      )}

      <div className="pf-grid">
        <section className="pf-card">
          <h2><span aria-hidden="true">📅 </span>{t.teams}</h2>
          <p className="pf-sub">{t.teamsS}</p>
          <div className="pf-chips" role="group">
            {["ALL", ...Object.keys(CADENCES)].map((k) => {
              const n = k === "ALL" ? inOrg.length : inOrg.filter((r) => r.cadence === k).length;
              return <button key={k} className={cad === k ? "on" : ""} style={k !== "ALL" ? { "--c": CADENCES[k].color } : undefined} onClick={() => setCad(k)}>{k === "ALL" ? t.all : cl(k)} <b>{n}</b></button>;
            })}
          </div>
          <div className="pf-thead">{t.cols.map((c) => <span key={c}>{c}</span>)}</div>
          {visible.length === 0 && <p className="pf-empty">{t.none}</p>}
          {visible.map((r) => {
            const w = Math.max(0, r.employees - r.signed - r.overdue);
            return (
              <div key={r.id} className="pf-trow">
                <div className="pf-team">
                  <span className="pf-sq" style={{ background: CADENCES[r.cadence].color }}>{r.name[0]}</span>
                  <div><strong>{r.name}</strong><small>{r.org}, {r.employees} {t.people}</small></div>
                </div>
                <div>
                  <select className="pf-sel" value={r.cadence} onChange={(e) => assign(r.id, e.target.value)} aria-label={`${t.cols[1]}: ${r.name}`}>
                    {Object.keys(CADENCES).map((k) => <option key={k} value={k}>{cl(k)}</option>)}
                  </select>
                  <span className="pf-cap">{ds(r.cadence)}</span>
                </div>
                <div className="pf-prog">
                  <Bar className="pf-mini" signed={r.signed} wait={w} late={r.overdue} total={r.employees} />
                  <small><span><b>{r.signed}</b> {t.of} {r.employees} {t.signedOff}</span>{r.overdue > 0 && <em className="pf-od">{r.overdue} {t.od}</em>}</small>
                </div>
                <span className="pf-date"><span className="pf-narrow">{t.next}</span>{r.next}</span>
              </div>
            );
          })}
        </section>

        <div className="pf-side">
          <section className="pf-card">
            <h2><span aria-hidden="true">⚠️ </span>{t.att}</h2>
            <p className="pf-sub">{t.attS}</p>
            {ATTENTION.map((a) => (
              <div key={a.id} className="pf-item">
                <span className="pf-av">{a.who.split(" ").map((w) => w[0]).join("")}</span>
                <div><strong>{a.who}</strong><small>{a.where}: {a.note}</small></div>
                <button className="pf-remind" disabled={!!reminded[a.id]} onClick={() => remind(a)}>{reminded[a.id] ? t.reminded : t.remind}</button>
              </div>
            ))}
          </section>

          <section className="pf-card">
            <h2><span aria-hidden="true">🔄 </span>{t.cyc}</h2>
            <p className="pf-sub">{t.cycS}</p>
            {cycles.map((c) => {
              const p = pctOf(c.done, c.total);
              return (
                <div key={c.id} className="pf-cyc">
                  <div className="pf-cyc-top">
                    <div><strong>{c.name}</strong><small>{c.start} {t.to} {c.due}, <span className={`pf-state ${c.status === "Active" ? "on" : "soon"}`}>{c.status === "Active" ? t.on : t.soon}</span></small></div>
                    <span className="pf-tag" style={{ background: CADENCES[c.cadence].color }}>{cl(c.cadence)}</span>
                  </div>
                  <div className="pf-mini"><i style={{ width: `${p}%` }} /></div>
                  <small>{t.done(c.done, c.total, p)}</small>
                </div>
              );
            })}
          </section>
        </div>
      </div>

      {wizard && <Wizard rows={rows} onClose={() => setWizard(false)} onCreate={(c) => { setCycles((x) => [c, ...x]); setWizard(false); notify(`${c.name} created, reminders scheduled`); }} />}
      {toast && <div className="sa-toast" role="status">{toast}</div>}
    </div>
  );
}

/* ================= Cadence templates (drive the wizard and review form) ================= */
const TEMPLATES = {
  WEEKLY: { tag: "Weekly Check-in", title: "Weekly sync", days: 4, focus: "Immediate roadblocks and upcoming shifts",
    questions: ["What went well this week?", "Any roadblocks right now?", "What is planned for the upcoming shifts?"],
    comps: ["Attendance and punctuality", "Task quality", "Teamwork"], goals: ["Weekly target met", "Safety checklist completed"] },
  MONTHLY: { tag: "Monthly 1-on-1", title: "Monthly one-on-one", days: 29, focus: "Progress on priorities, blockers and support",
    questions: ["Progress on this month's priorities", "Blockers and support needed", "Wins worth celebrating"],
    comps: ["Ownership", "Communication", "Delivery"], goals: ["Monthly deliverables on track", "Skill plan progressing"] },
  QUARTERLY: { tag: "Quarterly OKR Review", title: "Quarterly OKR review", days: 89, focus: "OKR progress, strengths and areas to improve",
    questions: ["What went well?", "Areas for improvement", "What did you learn this quarter?"],
    comps: ["Goal delivery", "Collaboration", "Initiative", "Problem solving"], goals: ["OKR 1: Reduce customer churn", "OKR 2: Ship v3 on time", "OKR 3: Grow the team"] },
  HALF_YEARLY: { tag: "Half-Yearly Review", title: "Half-yearly review", days: 180, focus: "Mid-year growth, skills and development plan",
    questions: ["Key achievements this half", "Skill growth since January", "Support needed for the next half"],
    comps: ["Impact", "Skill growth", "Leadership", "Collaboration"], goals: ["Half-year priorities delivered", "Development plan on track"] },
  YEARLY: { tag: "Yearly Performance Appraisal", title: "Annual appraisal", days: 45, focus: "Compensation, career growth and macro OKRs",
    questions: ["Year highlights", "Career growth aspirations", "Compensation and promotion view"],
    comps: ["Business impact", "Leadership", "Strategic thinking", "Culture and values", "Mentoring"], goals: ["Annual macro OKR 1", "Annual macro OKR 2", "Career path milestone reached"] },
};

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (s, n) => { const d = new Date(`${s}T00:00:00`); d.setDate(d.getDate() + n); return iso(d); };
const fmt = (s) => { const d = new Date(`${s}T00:00:00`); return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })}`; };
const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);

/* ---------- Create review cycle wizard ---------- */
function Wizard({ rows, onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [cad, setCad] = useState("QUARTERLY");
  const [name, setName] = useState("");
  const [group, setGroup] = useState("all");
  const [start, setStart] = useState("2026-10-26");
  const [due, setDue] = useState(addDays("2026-10-26", TEMPLATES.QUARTERLY.days));
  const t = TEMPLATES[cad];
  const target = group === "all" ? sum(rows.filter((r) => r.cadence === cad), "employees") : rows.find((r) => String(r.id) === group)?.employees || 0;
  const pick = (k) => { setCad(k); setDue(addDays(start, TEMPLATES[k].days)); };
  const create = () => onCreate({ id: Date.now(), name: name.trim() || `${t.title}, ${fmt(start)}`, cadence: cad, start: fmt(start), due: fmt(due), done: 0, total: target, status: start <= "2026-10-26" ? "Active" : "Upcoming" });
  return (
    <div className="sa-modal-bg" onClick={onClose}>
      <div className="sa-modal" role="dialog" aria-modal="true" aria-label="Create review cycle" onClick={(e) => e.stopPropagation()}>
        <div className="wz-steps">{["Cadence", "Template", "Details"].map((s, i) => <span key={s} className={step === i + 1 ? "on" : step > i + 1 ? "done" : ""}><b>{step > i + 1 ? "✓" : i + 1}</b>{s}</span>)}</div>
        {step === 1 && (<>
          <h3>Choose a review cadence</h3>
          <div className="wz-pick">
            {Object.entries(CADENCES).map(([k, c]) => (
              <button key={k} className={cad === k ? "on" : ""} onClick={() => pick(k)}><i style={{ background: c.color }} /><strong>{TEMPLATES[k].tag}</strong><small>{DESC[k]}</small></button>
            ))}
          </div>
        </>)}
        {step === 2 && (<>
          <h3>{t.tag} template</h3>
          <p className="wz-focus">Focus: {t.focus}</p>
          <div className="wz-tpl">
            <div><h5>Text blocks</h5><ul>{t.questions.map((q) => <li key={q}>{q}</li>)}</ul></div>
            <div><h5>Rating scales (1 to 5)</h5><ul>{t.comps.map((q) => <li key={q}>{q}</li>)}</ul></div>
            <div><h5>Goal alignment toggles</h5><ul>{t.goals.map((q) => <li key={q}>{q}</li>)}</ul></div>
          </div>
          <p className="wz-note">Manager and employee fill their sections separately, then both use Lock and sign after the review meeting.</p>
        </>)}
        {step === 3 && (<>
          <h3>Cycle details</h3>
          <div className="wz-form">
            <label>Cycle name<input value={name} onChange={(e) => setName(e.target.value)} placeholder={`${t.title}, ${fmt(start)}`} /></label>
            <label>Applies to<select value={group} onChange={(e) => setGroup(e.target.value)}><option value="all">All groups on {CADENCES[cad].label}</option>{rows.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.org})</option>)}</select></label>
            <label>Start date<input type="date" value={start} onChange={(e) => { setStart(e.target.value); setDue(addDays(e.target.value, t.days)); }} /></label>
            <label>Due date<input type="date" value={due} min={start} onChange={(e) => setDue(e.target.value)} /></label>
          </div>
          <div className="wz-sum"><strong>{target}</strong> employees will get a <b>{t.tag}</b> from {fmt(start)} to {fmt(due)}. Reminders go out 2 days before the due date.</div>
        </>)}
        <div className="wz-foot">
          <button className="ghostbtn" onClick={step === 1 ? onClose : () => setStep(step - 1)}>{step === 1 ? "Cancel" : "Back"}</button>
          {step < 3 ? <button className="sa-btn" onClick={() => setStep(step + 1)}>Next</button> : <button className="sa-btn" disabled={!target} onClick={create}>Create cycle</button>}
        </div>
      </div>
    </div>
  );
}