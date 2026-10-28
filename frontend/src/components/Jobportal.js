import { useMemo, useState } from "react";
import "./Jobportal.css";

/* =====================================================================
   SAMPLE DATA  (backend API vandha idha replace pannunga)
   ===================================================================== */
const DEPARTMENTS = ["Engineering", "Human Resources", "Finance", "Sales", "Marketing", "Operations", "Design"];

const initialJobs = [
  {
    id: 1, code: "JD-101", title: "Frontend Developer", department: "Engineering", location: "Chennai",
    workMode: "Hybrid", type: "Full-time", expMin: 2, expMax: 5, salMin: 6, salMax: 10, openings: 2,
    postedOn: "2026-10-15", deadline: "2026-11-05", status: "Open", urgent: true, internalOpen: true,
    manager: "Arun Prakash", qualification: "B.E / B.Tech in CS or IT",
    skills: ["React.js", "CSS", "REST API", "Git"],
    description: "Build and maintain responsive web interfaces for our internal and customer products. Work closely with design and backend teams.",
  },
  {
    id: 2, code: "JD-102", title: "HR Executive", department: "Human Resources", location: "Ambattur",
    workMode: "On-site", type: "Full-time", expMin: 1, expMax: 3, salMin: 3, salMax: 5, openings: 1,
    postedOn: "2026-10-18", deadline: "2026-11-12", status: "Open", urgent: false, internalOpen: true,
    manager: "Lavanya R", qualification: "MBA (HR) preferred",
    skills: ["Recruitment", "Onboarding", "MS Excel", "Communication"],
    description: "Handle end-to-end recruitment, onboarding and employee engagement activities.",
  },
  {
    id: 3, code: "JD-103", title: "Accounts Intern", department: "Finance", location: "Remote",
    workMode: "Remote", type: "Internship", expMin: 0, expMax: 1, salMin: 1, salMax: 2, openings: 3,
    postedOn: "2026-09-28", deadline: "2026-10-20", status: "Closed", urgent: false, internalOpen: false,
    manager: "Senthil Kumar", qualification: "B.Com / M.Com",
    skills: ["Tally", "MS Excel", "GST basics"],
    description: "Support the finance team with daily bookkeeping, invoicing and reconciliations.",
  },
];

const initialApplicants = [
  { id: 1, jobId: 1, name: "Karthik Raj", email: "karthik@mail.com", phone: "9876543210", experience: 3, expectedCtc: 9, noticePeriod: "30 days", isEmployee: true, empId: "EMP-1042", designation: "Junior Developer", department: "Engineering", tenure: "2 yrs", status: "Shortlisted", appliedOn: "2026-10-22" },
  { id: 2, jobId: 1, name: "Divya Lakshmi", email: "divya@mail.com", phone: "9843012345", experience: 4, expectedCtc: 10, noticePeriod: "60 days", isEmployee: false, empId: "", designation: "", department: "", tenure: "", status: "Applied", appliedOn: "2026-10-24" },
  { id: 3, jobId: 2, name: "Suresh Kumar", email: "suresh@mail.com", phone: "9790011223", experience: 2, expectedCtc: 4, noticePeriod: "Immediate", isEmployee: false, empId: "", designation: "", department: "", tenure: "", status: "Applied", appliedOn: "2026-10-25" },
  { id: 4, jobId: 1, name: "Meena Priya", email: "meena@mail.com", phone: "9500123456", experience: 5, expectedCtc: 10, noticePeriod: "45 days", isEmployee: true, empId: "EMP-0877", designation: "Software Engineer", department: "Engineering", tenure: "4 yrs", status: "Applied", appliedOn: "2026-10-26" },
  { id: 5, jobId: 3, name: "Harini S", email: "harini@mail.com", phone: "9444012233", experience: 0, expectedCtc: 1.5, noticePeriod: "Immediate", isEmployee: false, empId: "", designation: "", department: "", tenure: "", status: "Hired", appliedOn: "2026-10-05" },
];

const emptyJob = {
  title: "", department: "Engineering", location: "", workMode: "On-site", type: "Full-time",
  expMin: 0, expMax: 2, salMin: 3, salMax: 6, openings: 1, deadline: "", status: "Open",
  urgent: false, internalOpen: true, manager: "", qualification: "", skills: "", description: "",
};

const STATUSES = ["Applied", "Shortlisted", "Hired", "Rejected"];

/* =====================================================================
   HELPERS
   ===================================================================== */
const initials = (name) => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const today = () => new Date().toISOString().slice(0, 10);
const daysLeft = (date) => Math.ceil((new Date(date) - new Date(today())) / 86400000);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const money = (a, b) => `₹${a}–${b} LPA`;

function deadlineInfo(job) {
  if (job.status !== "Open") return { text: "Closed", tone: "muted" };
  const d = daysLeft(job.deadline);
  if (d < 0) return { text: "Deadline passed", tone: "red" };
  if (d === 0) return { text: "Closes today", tone: "red" };
  if (d <= 3) return { text: `${d} days left`, tone: "red" };
  if (d <= 7) return { text: `${d} days left`, tone: "amber" };
  return { text: `${d} days left`, tone: "blue" };
}

function exportCsv(job, list) {
  const head = ["Name", "Email", "Phone", "Experience (yrs)", "Expected CTC (LPA)", "Notice period", "Current employee", "Emp ID", "Designation", "Department", "Status", "Applied on"];
  const rows = list.map((a) => [a.name, a.email, a.phone, a.experience, a.expectedCtc, a.noticePeriod, a.isEmployee ? "Yes" : "No", a.empId, a.designation, a.department, a.status, a.appliedOn]);
  const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${job.code}-applicants.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/* =====================================================================
   MODAL
   ===================================================================== */
function Modal({ title, subtitle, onClose, children, size = "md" }) {
  return (
    <div className="jp-overlay" onClick={onClose}>
      <div className={`jp-modal jp-modal--${size}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="jp-modal__head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="jp-icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* =====================================================================
   CREATE / EDIT VACANCY
   ===================================================================== */
function JobForm({ initial, onSave, onClose }) {
  const editing = Boolean(initial.id);
  const [form, setForm] = useState({ ...initial, skills: Array.isArray(initial.skills) ? initial.skills.join(", ") : initial.skills });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      expMin: Number(form.expMin), expMax: Number(form.expMax),
      salMin: Number(form.salMin), salMax: Number(form.salMax),
      openings: Number(form.openings),
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <Modal
      title={editing ? "Edit vacancy" : "Create vacancy"}
      subtitle={editing ? `${initial.code} · changes show immediately` : "Fill in the role details. Save as Draft to publish later."}
      onClose={onClose}
      size="lg"
    >
      <form className="jp-form" onSubmit={submit}>
        <p className="jp-form__group">Role details</p>
        <label className="jp-field jp-full">Job title
          <input required value={form.title} onChange={set("title")} placeholder="e.g. Backend Developer" />
        </label>
        <label className="jp-field">Department
          <select value={form.department} onChange={set("department")}>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="jp-field">Hiring manager
          <input required value={form.manager} onChange={set("manager")} placeholder="Manager name" />
        </label>
        <label className="jp-field">Location
          <input required value={form.location} onChange={set("location")} placeholder="Chennai" />
        </label>
        <label className="jp-field">Work mode
          <select value={form.workMode} onChange={set("workMode")}>
            <option>On-site</option><option>Hybrid</option><option>Remote</option>
          </select>
        </label>
        <label className="jp-field">Job type
          <select value={form.type} onChange={set("type")}>
            <option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option>
          </select>
        </label>
        <label className="jp-field">Openings
          <input type="number" min="1" required value={form.openings} onChange={set("openings")} />
        </label>

        <p className="jp-form__group">Requirements and pay</p>
        <label className="jp-field">Min experience (yrs)
          <input type="number" min="0" step="0.5" required value={form.expMin} onChange={set("expMin")} />
        </label>
        <label className="jp-field">Max experience (yrs)
          <input type="number" min="0" step="0.5" required value={form.expMax} onChange={set("expMax")} />
        </label>
        <label className="jp-field">Min salary (₹ LPA)
          <input type="number" min="0" step="0.5" required value={form.salMin} onChange={set("salMin")} />
        </label>
        <label className="jp-field">Max salary (₹ LPA)
          <input type="number" min="0" step="0.5" required value={form.salMax} onChange={set("salMax")} />
        </label>
        <label className="jp-field jp-full">Qualification
          <input required value={form.qualification} onChange={set("qualification")} placeholder="e.g. B.E / B.Tech" />
        </label>
        <label className="jp-field jp-full">Skills <small>(separate with commas)</small>
          <input value={form.skills} onChange={set("skills")} placeholder="React.js, CSS, REST API" />
        </label>
        <label className="jp-field jp-full">Job description
          <textarea rows="4" required value={form.description} onChange={set("description")} placeholder="Responsibilities and what the role involves" />
        </label>

        <p className="jp-form__group">Publishing</p>
        <label className="jp-field">Last date to apply
          <input type="date" required value={form.deadline} onChange={set("deadline")} />
        </label>
        <label className="jp-field">Status
          <select value={form.status} onChange={set("status")}>
            <option>Open</option><option>Draft</option><option>Closed</option>
          </select>
        </label>
        <label className="jp-check">
          <input type="checkbox" checked={form.urgent} onChange={set("urgent")} />
          Mark as urgent hiring
        </label>
        <label className="jp-check">
          <input type="checkbox" checked={form.internalOpen} onChange={set("internalOpen")} />
          Open to current employees
        </label>

        <div className="jp-actions jp-full">
          <button type="button" className="jp-btn jp-btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="jp-btn jp-btn--primary">{editing ? "Save changes" : "Create vacancy"}</button>
        </div>
      </form>
    </Modal>
  );
}

/* =====================================================================
   APPLICANTS
   ===================================================================== */
function Applicants({ job, applicants, onStatus, onClose }) {
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const empCount = applicants.filter((a) => a.isEmployee).length;

  const shown = applicants
    .filter((a) => tab === "All" || (tab === "Employees" ? a.isEmployee : !a.isEmployee))
    .filter((a) => `${a.name} ${a.email} ${a.empId}`.toLowerCase().includes(q.toLowerCase()));

  const count = (s) => applicants.filter((a) => a.status === s).length;

  return (
    <Modal title={job.title} subtitle={`${job.code} · ${job.department} · ${applicants.length} applications`} onClose={onClose} size="xl">
      <div className="jp-mini-stats">
        {STATUSES.map((s) => (
          <div key={s} className={`jp-mini jp-mini--${s.toLowerCase()}`}>
            <b>{count(s)}</b><span>{s}</span>
          </div>
        ))}
      </div>

      <div className="jp-applicants-bar">
        <div className="jp-tabs">
          {[["All", applicants.length], ["Employees", empCount], ["External", applicants.length - empCount]].map(([t, n]) => (
            <button key={t} className={`jp-tab ${tab === t ? "is-active" : ""}`} onClick={() => setTab(t)}>
              {t} <span>{n}</span>
            </button>
          ))}
        </div>
        <div className="jp-applicants-tools">
          <input className="jp-search jp-search--sm" placeholder="Search name, email or emp ID" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="jp-btn jp-btn--ghost" onClick={() => exportCsv(job, shown)} disabled={!shown.length}>Export CSV</button>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="jp-empty">No applicants match this list.</p>
      ) : (
        <div className="jp-table-wrap">
          <table className="jp-table">
            <thead>
              <tr>
                <th>Candidate</th><th>Experience</th><th>Working in company?</th>
                <th>Expected CTC</th><th>Applied on</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="jp-person">
                      <span className="jp-avatar">{initials(a.name)}</span>
                      <div>
                        <strong>{a.name}</strong>
                        <small>{a.email}</small>
                        <small>{a.phone}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{a.experience} {a.experience === 1 ? "yr" : "yrs"}</strong>
                    <small>Notice: {a.noticePeriod}</small>
                  </td>
                  <td>
                    {a.isEmployee ? (
                      <div className="jp-emp">
                        <span className="jp-pill jp-pill--emp">Current employee</span>
                        <small><b>{a.empId}</b> · {a.designation}</small>
                        <small>{a.department} · {a.tenure} in company</small>
                      </div>
                    ) : (
                      <span className="jp-pill jp-pill--ext">External candidate</span>
                    )}
                  </td>
                  <td><strong>₹{a.expectedCtc} LPA</strong></td>
                  <td>{fmtDate(a.appliedOn)}</td>
                  <td>
                    <select className={`jp-status jp-status--${a.status.toLowerCase()}`} value={a.status} onChange={(e) => onStatus(a.id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

/* =====================================================================
   MAIN PAGE  (Super Admin only)
   ===================================================================== */
export default function JobPortal() {
  const [jobs, setJobs] = useState(initialJobs);
  const [applicants, setApplicants] = useState(initialApplicants);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [dept, setDept] = useState("All");
  const [sort, setSort] = useState("newest");
  const [modal, setModal] = useState(null); // { type, job }
  const [toast, setToast] = useState("");

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };
  const appsOf = (id) => applicants.filter((a) => a.jobId === id);

  /* ---- stats ---- */
  const stats = useMemo(() => {
    const open = jobs.filter((j) => j.status === "Open");
    return {
      total: jobs.length,
      open: open.length,
      closing: open.filter((j) => { const d = daysLeft(j.deadline); return d >= 0 && d <= 7; }).length,
      applications: applicants.length,
      employees: applicants.filter((a) => a.isEmployee).length,
    };
  }, [jobs, applicants]);

  const pipeline = useMemo(() => {
    const total = applicants.length || 1;
    return STATUSES.map((s) => {
      const n = applicants.filter((a) => a.status === s).length;
      return { s, n, pct: (n / total) * 100 };
    });
  }, [applicants]);

  /* ---- filtered list ---- */
  const visible = useMemo(() => {
    const list = jobs
      .filter((j) => status === "All" || j.status === status)
      .filter((j) => dept === "All" || j.department === dept)
      .filter((j) => `${j.title} ${j.code} ${j.department} ${j.location} ${j.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
    const sorters = {
      newest: (a, b) => b.postedOn.localeCompare(a.postedOn),
      deadline: (a, b) => a.deadline.localeCompare(b.deadline),
      applicants: (a, b) => appsOf(b.id).length - appsOf(a.id).length,
    };
    return [...list].sort(sorters[sort]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, applicants, query, status, dept, sort]);

  /* ---- actions ---- */
  const saveJob = (data) => {
    if (data.id) {
      setJobs(jobs.map((j) => (j.id === data.id ? data : j)));
      notify("Vacancy updated");
    } else {
      const next = 101 + jobs.length + Math.floor(Math.random() * 900);
      setJobs([{ ...data, id: Date.now(), code: `JD-${next}`, postedOn: today() }, ...jobs]);
      notify(data.status === "Draft" ? "Saved as draft" : "Vacancy created");
    }
    setModal(null);
  };

  const duplicateJob = (job) => {
    const copy = { ...job, id: Date.now(), code: `JD-${200 + jobs.length}`, title: `${job.title} (copy)`, status: "Draft", postedOn: today() };
    setJobs([copy, ...jobs]);
    notify("Duplicated as draft");
  };

  const toggleStatus = (job) => {
    const next = job.status === "Open" ? "Closed" : "Open";
    setJobs(jobs.map((j) => (j.id === job.id ? { ...j, status: next } : j)));
    notify(next === "Open" ? "Vacancy reopened" : "Vacancy closed");
  };

  const deleteJob = (id) => {
    setJobs(jobs.filter((j) => j.id !== id));
    setApplicants(applicants.filter((a) => a.jobId !== id));
    setModal(null);
    notify("Vacancy deleted");
  };

  const changeStatus = (id, s) => setApplicants(applicants.map((a) => (a.id === id ? { ...a, status: s } : a)));

  return (
    <div className="jp">
      {/* ---------- Hero ---------- */}
      <section className="jp-hero">
        <div className="jp-hero__text">
          <h1>Manage every vacancy in one place</h1>
          <p>Create openings, track who applied, and see which applicants already work in the company.</p>
        </div>
        <button className="jp-btn jp-btn--cta" onClick={() => setModal({ type: "form", job: emptyJob })}>
          <span className="jp-plus">+</span> Create vacancy
        </button>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="jp-stats">
        <div className="jp-stat"><b>{stats.total}</b><span>Total vacancies</span></div>
        <div className="jp-stat"><b>{stats.open}</b><span>Open now</span></div>
        <div className="jp-stat jp-stat--warn"><b>{stats.closing}</b><span>Closing in 7 days</span></div>
        <div className="jp-stat"><b>{stats.applications}</b><span>Applications received</span></div>
        <div className="jp-stat jp-stat--accent"><b>{stats.employees}</b><span>From current employees</span></div>
      </section>

      {/* ---------- Pipeline ---------- */}
      <section className="jp-pipeline">
        <div className="jp-pipeline__head">
          <h2>Hiring pipeline</h2>
          <span>{applicants.length} applications across all vacancies</span>
        </div>
        <div className="jp-bar" role="img" aria-label="Hiring pipeline">
          {pipeline.map((p) => p.n > 0 && <i key={p.s} className={`jp-seg jp-seg--${p.s.toLowerCase()}`} style={{ width: `${p.pct}%` }} />)}
        </div>
        <div className="jp-legend">
          {pipeline.map((p) => (
            <span key={p.s}><i className={`jp-dot jp-seg--${p.s.toLowerCase()}`} />{p.s} <b>{p.n}</b></span>
          ))}
        </div>
      </section>

      {/* ---------- Toolbar ---------- */}
      <section className="jp-toolbar">
        <input className="jp-search" placeholder="Search by title, code, skill or location" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="jp-select" value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department">
          <option value="All">All departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="jp-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
          <option value="newest">Newest first</option>
          <option value="deadline">Closing soonest</option>
          <option value="applicants">Most applicants</option>
        </select>
        <div className="jp-chips">
          {["All", "Open", "Draft", "Closed"].map((f) => (
            <button key={f} className={`jp-chip ${status === f ? "is-active" : ""}`} onClick={() => setStatus(f)}>{f}</button>
          ))}
        </div>
      </section>

      {/* ---------- Vacancy list ---------- */}
      <main className="jp-list">
        {visible.length === 0 && (
          <div className="jp-emptybox">
            <h3>No vacancies found</h3>
            <p>Change the filters or create a new vacancy.</p>
            <button className="jp-btn jp-btn--primary" onClick={() => setModal({ type: "form", job: emptyJob })}>Create vacancy</button>
          </div>
        )}

        {visible.map((job) => {
          const apps = appsOf(job.id);
          const emps = apps.filter((a) => a.isEmployee).length;
          const shortlisted = apps.filter((a) => a.status === "Shortlisted").length;
          const hired = apps.filter((a) => a.status === "Hired").length;
          const dl = deadlineInfo(job);
          return (
            <article key={job.id} className={`jp-card jp-card--${job.status.toLowerCase()}`}>
              <div className="jp-card__main">
                <div className="jp-card__top">
                  <span className="jp-code">{job.code}</span>
                  <span className={`jp-badge jp-badge--${job.status.toLowerCase()}`}>{job.status}</span>
                  {job.urgent && <span className="jp-badge jp-badge--urgent">Urgent hiring</span>}
                  {job.internalOpen && <span className="jp-badge jp-badge--internal">Open to employees</span>}
                </div>

                <h2>{job.title}</h2>
                <p className="jp-card__meta">{job.department} · {job.location} · {job.type}</p>
                <p className="jp-card__desc">{job.description}</p>

                <div className="jp-skills">
                  {job.skills.map((s) => <span key={s}>{s}</span>)}
                </div>

                <dl className="jp-facts">
                  <div><dt>Salary</dt><dd>{money(job.salMin, job.salMax)}</dd></div>
                  <div><dt>Experience</dt><dd>{job.expMin}–{job.expMax} yrs</dd></div>
                  <div><dt>Work mode</dt><dd>{job.workMode}</dd></div>
                  <div><dt>Openings</dt><dd>{job.openings}</dd></div>
                  <div><dt>Qualification</dt><dd>{job.qualification}</dd></div>
                  <div><dt>Hiring manager</dt><dd>{job.manager}</dd></div>
                  <div><dt>Posted</dt><dd>{fmtDate(job.postedOn)}</dd></div>
                  <div><dt>Apply by</dt><dd>{fmtDate(job.deadline)} <em className={`jp-due jp-due--${dl.tone}`}>{dl.text}</em></dd></div>
                </dl>
              </div>

              <aside className="jp-card__side">
                <button className="jp-applied" onClick={() => setModal({ type: "applicants", job })}>
                  <div className="jp-applied__top">
                    <strong>{apps.length}</strong>
                    <span>{apps.length === 1 ? "application" : "applications"}</span>
                  </div>
                  <div className="jp-stack">
                    {apps.slice(0, 4).map((a) => <span key={a.id} className="jp-avatar jp-avatar--sm">{initials(a.name)}</span>)}
                    {apps.length > 4 && <span className="jp-avatar jp-avatar--sm jp-avatar--more">+{apps.length - 4}</span>}
                    {apps.length === 0 && <small>No one has applied yet</small>}
                  </div>
                  <ul>
                    <li><b>{emps}</b> current {emps === 1 ? "employee" : "employees"}</li>
                    <li><b>{shortlisted}</b> shortlisted</li>
                    <li><b>{hired}</b> hired</li>
                  </ul>
                  <span className="jp-applied__cta">View applicants</span>
                </button>

                <div className="jp-card__actions">
                  <button className="jp-btn jp-btn--ghost" onClick={() => setModal({ type: "form", job })}>Edit</button>
                  <button className="jp-btn jp-btn--ghost" onClick={() => duplicateJob(job)}>Duplicate</button>
                  <button className="jp-btn jp-btn--ghost" onClick={() => toggleStatus(job)}>
                    {job.status === "Open" ? "Close" : "Reopen"}
                  </button>
                  <button className="jp-btn jp-btn--danger" onClick={() => setModal({ type: "delete", job })}>Delete</button>
                </div>
              </aside>
            </article>
          );
        })}
      </main>

      {/* ---------- Modals ---------- */}
      {modal?.type === "form" && <JobForm initial={modal.job} onSave={saveJob} onClose={() => setModal(null)} />}
      {modal?.type === "applicants" && (
        <Applicants job={modal.job} applicants={appsOf(modal.job.id)} onStatus={changeStatus} onClose={() => setModal(null)} />
      )}
      {modal?.type === "delete" && (
        <Modal title="Delete this vacancy?" onClose={() => setModal(null)}>
          <p className="jp-confirm">
            “{modal.job.title}” ({modal.job.code}) and its {appsOf(modal.job.id).length} applications will be removed. This cannot be undone.
          </p>
          <div className="jp-actions">
            <button className="jp-btn jp-btn--ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="jp-btn jp-btn--danger-solid" onClick={() => deleteJob(modal.job.id)}>Delete vacancy</button>
          </div>
        </Modal>
      )}

      {toast && <div className="jp-toast" role="status">{toast}</div>}
    </div>
  );
}