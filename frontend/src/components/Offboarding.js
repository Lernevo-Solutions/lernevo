import { useEffect, useMemo, useState } from "react";
import "./Offboarding.css";

/* ---------- Sample data (backend API vandha replace pannunga) ---------- */
const DEPARTMENTS = ["Engineering", "Human Resources", "Finance", "Sales", "Marketing", "Operations", "Design"];
const EXIT_TYPES = ["Resignation", "Termination", "Retirement", "Contract end", "Mutual separation"];
const FNF = ["Pending", "Processing", "Paid"];
const CHECKLIST = [
  { key: "itAssets", label: "Laptop and assets returned", owner: "IT" },
  { key: "access", label: "Email and system access revoked", owner: "IT" },
  { key: "knowledge", label: "Knowledge transfer completed", owner: "Manager" },
  { key: "finance", label: "Dues and loans cleared", owner: "Finance" },
  { key: "documents", label: "ID card and documents collected", owner: "HR" },
  { key: "exitInterview", label: "Exit interview done", owner: "HR" },
];

const list = (...done) => Object.fromEntries(CHECKLIST.map((c) => [c.key, done.includes(c.key)]));
const ALL = CHECKLIST.map((c) => c.key);

const initialEmployees = [
  { id: 1, empId: "EMP-0412", name: "Ravi Shankar", email: "ravi@company.com", phone: "9884012345", designation: "Senior Developer", department: "Engineering", manager: "Arun Prakash", joinedOn: "2021-06-14", resignedOn: "2026-10-20", lastWorkingDay: "2026-12-04", exitType: "Resignation", reason: "Better opportunity", checklist: list(), relievedOn: "", fnfAmount: 185000, fnfStatus: "Pending", letters: { relieving: false, experience: false }, rating: 0, rehire: "Yes", feedback: "" },
  { id: 2, empId: "EMP-0655", name: "Anitha K", email: "anitha@company.com", phone: "9790088112", designation: "HR Executive", department: "Human Resources", manager: "Lavanya R", joinedOn: "2023-02-01", resignedOn: "2026-09-15", lastWorkingDay: "2026-10-31", exitType: "Resignation", reason: "Higher studies", checklist: list("itAssets", "access", "knowledge", "documents"), relievedOn: "", fnfAmount: 62000, fnfStatus: "Processing", letters: { relieving: false, experience: false }, rating: 0, rehire: "Yes", feedback: "" },
  { id: 3, empId: "EMP-0231", name: "Mohan Das", email: "mohan@company.com", phone: "9444123987", designation: "Accounts Manager", department: "Finance", manager: "Senthil Kumar", joinedOn: "2018-03-05", resignedOn: "2026-08-25", lastWorkingDay: "2026-10-10", exitType: "Resignation", reason: "Relocating to another city", checklist: list(...ALL), relievedOn: "2026-10-10", fnfAmount: 240000, fnfStatus: "Paid", letters: { relieving: true, experience: true }, rating: 4, rehire: "Yes", feedback: "Loved the team. Left only due to relocation." },
  { id: 4, empId: "EMP-0788", name: "Preethi N", email: "preethi@company.com", phone: "9500455667", designation: "Sales Executive", department: "Sales", manager: "Karthik V", joinedOn: "2025-01-06", resignedOn: "2026-10-05", lastWorkingDay: "2026-11-04", exitType: "Contract end", reason: "Contract completed", checklist: list("itAssets"), relievedOn: "", fnfAmount: 28000, fnfStatus: "Pending", letters: { relieving: false, experience: false }, rating: 0, rehire: "Maybe", feedback: "" },
];

const blank = { empId: "", name: "", email: "", phone: "", designation: "", department: "Engineering", manager: "", joinedOn: "", resignedOn: "", lastWorkingDay: "", exitType: "Resignation", reason: "", fnfAmount: 0, fnfStatus: "Pending" };

/* ---------- Helpers ---------- */
const today = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.ceil((new Date(b) - new Date(a)) / 86400000);
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const rupees = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const doneCount = (e) => CHECKLIST.filter((c) => e.checklist[c.key]).length;
const statusOf = (e) => (e.relievedOn ? "Relieved" : doneCount(e) > 0 ? "Clearance" : "Notice Period");
const stageKey = (e) => statusOf(e).split(" ")[0].toLowerCase();
const fnfTone = (s) => (s === "Paid" ? "green" : s === "Processing" ? "amber" : "red");

function tenure(from, to) {
  if (!from || !to) return "—";
  const m = Math.max(0, Math.round(daysBetween(from, to) / 30.4));
  const y = Math.floor(m / 12);
  return `${y ? `${y} yr${y > 1 ? "s" : ""} ` : ""}${m % 12} mo`;
}
function dueInfo(e) {
  if (e.relievedOn) return { text: "Relieved", tone: "green" };
  const d = daysBetween(today(), e.lastWorkingDay);
  if (d < 0) return { text: `${-d} ${-d === 1 ? "day" : "days"} overdue`, tone: "red" };
  if (d === 0) return { text: "Last day today", tone: "red" };
  return { text: `${d} ${d === 1 ? "day" : "days"} left`, tone: d <= 3 ? "red" : d <= 7 ? "amber" : "neutral" };
}
function useEscape(fn) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && fn();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fn]);
}

/* ---------- Modal (forms and confirmations) ---------- */
function Modal({ title, subtitle, onClose, size = "md", children }) {
  useEscape(onClose);
  return (
    <div className="ob-overlay" onClick={onClose}>
      <div className={`ob-modal ob-modal--${size}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="ob-modal__head">
          <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
          <button className="ob-icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Add / Edit form ---------- */
function EmployeeForm({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => { e.preventDefault(); onSave({ ...f, fnfAmount: Number(f.fnfAmount) }); };
  const text = (k, label, props = {}) => (
    <label className="ob-field">{label}<input required value={f[k]} onChange={set(k)} {...props} /></label>
  );
  return (
    <Modal title={initial.id ? "Edit exit details" : "Initiate offboarding"} subtitle="Employee details and exit schedule" onClose={onClose} size="lg">
      <form className="ob-form" onSubmit={submit}>
        <p className="ob-form__group">Employee</p>
        {text("name", "Full name")}
        {text("empId", "Employee ID", { placeholder: "EMP-0000" })}
        {text("email", "Email", { type: "email" })}
        {text("phone", "Phone")}
        {text("designation", "Designation")}
        <label className="ob-field">Department
          <select value={f.department} onChange={set("department")}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select>
        </label>
        {text("manager", "Reporting manager")}
        {text("joinedOn", "Joining date", { type: "date" })}

        <p className="ob-form__group">Exit details</p>
        <label className="ob-field">Exit type
          <select value={f.exitType} onChange={set("exitType")}>{EXIT_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        {text("reason", "Reason for leaving")}
        {text("resignedOn", "Resignation date", { type: "date" })}
        {text("lastWorkingDay", "Last working day", { type: "date" })}
        <label className="ob-field">Full and final amount (₹)
          <input type="number" min="0" value={f.fnfAmount} onChange={set("fnfAmount")} />
        </label>
        <label className="ob-field">F&amp;F status
          <select value={f.fnfStatus} onChange={set("fnfStatus")}>{FNF.map((s) => <option key={s}>{s}</option>)}</select>
        </label>

        <div className="ob-actions ob-full">
          <button type="button" className="ob-btn ob-btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="ob-btn ob-btn--primary">{initial.id ? "Save changes" : "Start offboarding"}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Inline details panel (opens under the row) ---------- */
function Details({ emp, patch, onRelieve, onClose }) {
  const done = doneCount(emp);
  const locked = statusOf(emp) === "Relieved";
  const toggle = (key) => patch({ checklist: { ...emp.checklist, [key]: !emp.checklist[key] } });

  const steps = [
    { label: "Resigned", note: fmt(emp.resignedOn), on: true },
    { label: "Clearance", note: `${done} of ${CHECKLIST.length} done`, on: done > 0 || locked },
    { label: "Last day", note: fmt(emp.lastWorkingDay), on: locked },
    { label: "Relieved", note: locked ? fmt(emp.relievedOn) : "Pending", on: locked },
  ];
  const F = (k, label, props = {}) => (
    <label key={k} className="ob-field">{label}
      <input value={emp[k] ?? ""} onChange={(e) => patch({ [k]: e.target.value })} {...props} />
    </label>
  );
  const S = (k, label, options) => (
    <label key={k} className="ob-field">{label}
      <select value={emp[k]} onChange={(e) => patch({ [k]: e.target.value })}>{options.map((o) => <option key={o}>{o}</option>)}</select>
    </label>
  );

  return (
    <div className="ob-panel">
      <ol className="ob-steps">
        {steps.map((s) => (
          <li key={s.label} className={s.on ? "is-done" : ""}><b>{s.label}</b><span>{s.note}</span></li>
        ))}
      </ol>

      <div className="ob-panel__grid">
        <div className="ob-panel__col">
          <section className="ob-block">
            <div className="ob-block__head"><h3>Clearance checklist</h3><span>{done} of {CHECKLIST.length}</span></div>
            <div className="ob-meter" aria-hidden="true"><i style={{ width: `${(done / CHECKLIST.length) * 100}%` }} /></div>
            {CHECKLIST.map((c) => (
              <label key={c.key} className={`ob-task ${emp.checklist[c.key] ? "is-done" : ""}`}>
                <input type="checkbox" checked={emp.checklist[c.key]} onChange={() => toggle(c.key)} />
                <span>{c.label}</span><em>{c.owner}</em>
              </label>
            ))}
          </section>

          <section className="ob-block">
            <div className="ob-block__head"><h3>Letters</h3></div>
            {[["relieving", "Relieving letter issued"], ["experience", "Experience letter issued"]].map(([k, label]) => (
              <label key={k} className={`ob-task ${emp.letters[k] ? "is-done" : ""}`}>
                <input type="checkbox" checked={emp.letters[k]} onChange={() => patch({ letters: { ...emp.letters, [k]: !emp.letters[k] } })} />
                <span>{label}</span>
              </label>
            ))}
          </section>

          <section className="ob-block">
            <div className="ob-block__head"><h3>Exit interview</h3></div>
            <div className="ob-pair">
              <div className="ob-field">
                Rating
                <div className="ob-stars" role="radiogroup" aria-label="Exit interview rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={emp.rating === n} aria-label={`${n} of 5`}
                      className={n <= emp.rating ? "is-on" : ""} onClick={() => patch({ rating: emp.rating === n ? 0 : n })}>★</button>
                  ))}
                </div>
              </div>
              <label className="ob-field">Eligible for rehire
                <select value={emp.rehire} onChange={(e) => patch({ rehire: e.target.value })}>
                  <option>Yes</option><option>Maybe</option><option>No</option>
                </select>
              </label>
            </div>
            <label className="ob-field">Feedback notes
              <textarea rows="3" value={emp.feedback} onChange={(e) => patch({ feedback: e.target.value })} placeholder="Why is the employee leaving? Suggestions for the company?" />
            </label>
          </section>
        </div>

        <div className="ob-panel__col">
          <section className="ob-block">
            <div className="ob-block__head"><h3>Employee</h3><span>Tenure {tenure(emp.joinedOn, emp.relievedOn || emp.lastWorkingDay)}</span></div>
            <div className="ob-editgrid">
              {F("name", "Full name")}
              {F("empId", "Employee ID")}
              {F("designation", "Designation")}
              {S("department", "Department", DEPARTMENTS)}
              {F("manager", "Reporting manager")}
              {F("joinedOn", "Joined on", { type: "date" })}
              {F("phone", "Phone", { type: "tel" })}
              {F("email", "Email", { type: "email" })}
            </div>
          </section>

          <section className="ob-block">
            <div className="ob-block__head"><h3>Exit details</h3></div>
            <div className="ob-editgrid">
              {S("exitType", "Exit type", EXIT_TYPES)}
              {F("reason", "Reason for leaving")}
            </div>
            <div className="ob-editgrid ob-editgrid--dates">
              {F("resignedOn", "Resignation date", { type: "date" })}
              {F("lastWorkingDay", "Last working day", { type: "date" })}
              {locked && F("relievedOn", "Relieved on", { type: "date" })}
            </div>
          </section>

          <section className="ob-block">
            <div className="ob-block__head"><h3>Full and final settlement</h3><strong className="ob-amount">{rupees(emp.fnfAmount || 0)}</strong></div>
            <div className="ob-pair">
              <label className="ob-field">Amount (₹)
                <input type="number" min="0" value={emp.fnfAmount} onChange={(e) => patch({ fnfAmount: e.target.value })} />
              </label>
              <label className="ob-field">Status
                <select value={emp.fnfStatus} onChange={(e) => patch({ fnfStatus: e.target.value })}>
                  {FNF.map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
            </div>
          </section>
        </div>
      </div>

      <div className="ob-panel__foot">
        <button className="ob-btn ob-btn--ghost" onClick={onClose}>Collapse</button>
        {locked
          ? <button className="ob-btn ob-btn--ghost" onClick={() => patch({ relievedOn: "" })}>Reopen offboarding</button>
          : <button className="ob-btn ob-btn--primary" onClick={onRelieve}>Mark as relieved</button>}
      </div>
    </div>
  );
}

/* ---------- Main page ---------- */
export default function Offboarding() {
  const [emps, setEmps] = useState(initialEmployees);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [dept, setDept] = useState("All");
  const [type, setType] = useState("All");
  const [sort, setSort] = useState("lwd");
  const [modal, setModal] = useState(null); // { type, id?, emp? }
  const [openId, setOpenId] = useState(null); // row expanded inline
  const [toast, setToast] = useState("");

  const notify = (m) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const patch = (id, p) => setEmps((all) => all.map((e) => (e.id === id ? { ...e, ...p } : e)));
  const active = modal?.id ? emps.find((e) => e.id === modal.id) : null;

  const count = (s) => emps.filter((e) => statusOf(e) === s).length;
  const stats = {
    notice: count("Notice Period"),
    clearance: count("Clearance"),
    soon: emps.filter((e) => !e.relievedOn && daysBetween(today(), e.lastWorkingDay) <= 7).length,
    relieved: count("Relieved"),
    fnf: emps.filter((e) => e.fnfStatus !== "Paid").length,
  };

  const visible = useMemo(() => {
    const sorters = {
      lwd: (a, b) => a.lastWorkingDay.localeCompare(b.lastWorkingDay),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return emps
      .filter((e) => status === "All" || statusOf(e) === status)
      .filter((e) => dept === "All" || e.department === dept)
      .filter((e) => type === "All" || e.exitType === type)
      .filter((e) => `${e.name} ${e.empId} ${e.designation}`.toLowerCase().includes(q.toLowerCase()))
      .sort(sorters[sort]);
  }, [emps, q, status, dept, type, sort]);

  const save = (data) => {
    if (data.id) { patch(data.id, data); notify("Exit details updated"); }
    else { setEmps([{ ...data, id: Date.now(), checklist: list(), relievedOn: "", letters: { relieving: false, experience: false }, rating: 0, rehire: "Yes", feedback: "" }, ...emps]); notify("Offboarding started"); }
    setModal(null);
  };
  const relieve = (e) => {
    if (doneCount(e) < CHECKLIST.length) return notify("Complete all clearance items first");
    if (e.fnfStatus !== "Paid") return notify("Mark full and final settlement as Paid first");
    patch(e.id, { relievedOn: today() });
    notify(`${e.name} relieved`);
  };
  const remove = (id) => { setEmps(emps.filter((e) => e.id !== id)); setModal(null); if (openId === id) setOpenId(null); notify("Record deleted"); };
  const filtersOn = q || dept !== "All" || type !== "All" || status !== "All";
  const clearFilters = () => { setQ(""); setDept("All"); setType("All"); setStatus("All"); };

  const summary = (() => {
    if (!stats.soon && !stats.fnf) return "Nobody leaves in the next 7 days and every settlement is paid.";
    const bits = [];
    if (stats.soon) bits.push(`${stats.soon} ${stats.soon === 1 ? "person leaves" : "people leave"} within 7 days`);
    if (stats.fnf) bits.push(`${stats.fnf} full and final ${stats.fnf === 1 ? "settlement is" : "settlements are"} unpaid`);
    return `${bits.join(" and ")}.`;
  })();

  const tabs = [
    { key: "All", label: "Everyone", n: emps.length },
    { key: "Notice Period", label: "Serving notice", n: stats.notice },
    { key: "Clearance", label: "In clearance", n: stats.clearance },
    { key: "Relieved", label: "Relieved", n: stats.relieved },
  ];

  return (
    <div className="ob">
      <header className="ob-top">
        <div>
          <h1>Offboarding</h1>
          <p>{summary}</p>
        </div>
        <button className="ob-btn ob-btn--primary ob-btn--lg" onClick={() => setModal({ type: "form", emp: blank })}>
          <span className="ob-plus" aria-hidden="true">+</span> Start offboarding
        </button>
      </header>

      <div className="ob-tabs" role="tablist" aria-label="Offboarding stage">
        {tabs.map((t) => (
          <button key={t.key} role="tab" aria-selected={status === t.key} className="ob-tab" onClick={() => setStatus(t.key)}>
            <b>{t.n}</b> {t.label}
          </button>
        ))}
      </div>

      <section className="ob-toolbar">
        <input className="ob-search" type="search" placeholder="Search by name, employee ID or designation" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="ob-select" value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department">
          <option value="All">All departments</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="ob-select" value={type} onChange={(e) => setType(e.target.value)} aria-label="Exit type">
          <option value="All">All exit types</option>{EXIT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="ob-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="lwd">Leaving soonest</option><option value="name">Name A–Z</option>
        </select>
        {filtersOn && <button className="ob-btn ob-btn--quiet" onClick={clearFilters}>Clear filters</button>}
      </section>

      <main className="ob-table">
        {visible.length > 0 && (
          <div className="ob-tr ob-tr--head" aria-hidden="true">
            <span>Employee</span><span>Progress</span><span>Last working day</span><span>Full and final</span><span />
          </div>
        )}

        {visible.length === 0 && (
          <div className="ob-emptybox">
            <h3>No one matches these filters</h3>
            <p>Clear the filters to see everyone, or start a new offboarding.</p>
            <button className="ob-btn ob-btn--ghost" onClick={clearFilters}>Clear filters</button>
          </div>
        )}

        {visible.map((e) => {
          const st = statusOf(e);
          const key = stageKey(e);
          const done = doneCount(e);
          const due = dueInfo(e);
          const open = openId === e.id;
          const toggleRow = () => setOpenId(open ? null : e.id);
          return (
            <div key={e.id} className={`ob-item ${open ? "is-open" : ""}`}>
              <article className={`ob-tr ob-tr--${key}`} onClick={toggleRow}>
                <div className="ob-td ob-person">
                  <span className="ob-avatar">{initials(e.name)}</span>
                  <div>
                    <button className="ob-name" aria-expanded={open} onClick={(ev) => { ev.stopPropagation(); toggleRow(); }}>{e.name}</button>
                    <p>{e.designation}, {e.department}</p>
                    <small>{e.empId}, {e.exitType}</small>
                  </div>
                </div>

                <div className="ob-td" data-label="Progress">
                  <span className={`ob-stage ob-stage--${key}`}>{st}</span>
                  <div className="ob-pips" aria-hidden="true">
                    {CHECKLIST.map((c, i) => <i key={c.key} className={i < done ? "is-on" : ""} />)}
                  </div>
                  <small>{done} of {CHECKLIST.length} cleared</small>
                </div>

                <div className="ob-td" data-label="Last working day">
                  <strong>{fmt(e.lastWorkingDay)}</strong>
                  <span className={`ob-chip-due ob-chip-due--${due.tone}`}>{due.text}</span>
                </div>

                <div className="ob-td" data-label="Full and final">
                  <strong>{rupees(e.fnfAmount)}</strong>
                  <span className={`ob-chip-due ob-chip-due--${fnfTone(e.fnfStatus)}`}>{e.fnfStatus}</span>
                </div>

                <div className="ob-td ob-rowactions">
                  <button className="ob-btn ob-btn--quiet" onClick={(ev) => { ev.stopPropagation(); setModal({ type: "form", emp: e }); }}>Edit</button>
                  <button className="ob-btn ob-btn--quiet ob-btn--danger-text" onClick={(ev) => { ev.stopPropagation(); setModal({ type: "delete", id: e.id }); }}>Delete</button>
                  <button className="ob-btn ob-btn--quiet ob-chevron" aria-label={open ? "Collapse details" : "Expand details"} aria-expanded={open} onClick={(ev) => { ev.stopPropagation(); toggleRow(); }}>▾</button>
                </div>
              </article>

              {open && <Details emp={e} patch={(p) => patch(e.id, p)} onRelieve={() => relieve(e)} onClose={() => setOpenId(null)} />}
            </div>
          );
        })}
      </main>

      {modal?.type === "form" && <EmployeeForm initial={modal.emp} onSave={save} onClose={() => setModal(null)} />}
      {modal?.type === "delete" && active && (
        <Modal title="Delete this record?" onClose={() => setModal(null)}>
          <p className="ob-confirm">The offboarding record of {active.name} ({active.empId}) will be removed permanently.</p>
          <div className="ob-actions">
            <button className="ob-btn ob-btn--ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="ob-btn ob-btn--danger-solid" onClick={() => remove(active.id)}>Delete record</button>
          </div>
        </Modal>
      )}

      {toast && <div className="ob-toast" role="status">{toast}</div>}
    </div>
  );
}