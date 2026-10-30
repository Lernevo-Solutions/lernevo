import { useEffect, useMemo, useRef, useState } from "react";
import "./Jobportal.css";

/* =====================================================================
   SAMPLE DATA  (backend API vandha idha replace pannunga)
   ===================================================================== */
const DEFAULT_DEPARTMENTS = ["Engineering", "Human Resources", "Finance", "Sales", "Marketing", "Operations", "Design"];

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

const defaultUi = {
  title: "Manage every vacancy in one place",
  sub: "Create openings, track who applied, and see which applicants already work in the company.",
  theme: "blue",
  labels: {
    total: "Total vacancies", open: "Open now", closing: "Closing in 7 days",
    applications: "Applications received", employees: "From current employees",
  },
};

const emptyJob = {
  title: "", department: "", location: "", workMode: "On-site", type: "Full-time",
  expMin: 0, expMax: 2, salMin: 3, salMax: 6, openings: 1, deadline: "", status: "Open",
  urgent: false, internalOpen: true, manager: "", qualification: "", skills: "", description: "",
};

const emptyApplicant = {
  name: "", email: "", phone: "", experience: 0, expectedCtc: 3, noticePeriod: "30 days",
  isEmployee: false, empId: "", designation: "", department: "", tenure: "", status: "Applied", appliedOn: "",
};

const Svg = ({ children }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const STAT_ICONS = {
  total: <Svg><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></Svg>,
  open: <Svg><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></Svg>,
  closing: <Svg><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Svg>,
  applications: <Svg><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" /></Svg>,
  employees: <Svg><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" /></Svg>,
};

const STATUSES = ["Applied", "Shortlisted", "Hired", "Rejected"];

/* =====================================================================
   HELPERS
   ===================================================================== */
const initials = (name) => name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
const today = () => new Date().toISOString().slice(0, 10);
const daysLeft = (date) => Math.ceil((new Date(date) - new Date(today())) / 86400000);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

function deadlineInfo(job) {
  if (job.status !== "Open") return { text: job.status === "Draft" ? "Draft" : "Closed", tone: "muted" };
  if (!job.deadline) return { text: "No deadline", tone: "muted" };
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

/* Data refresh pannaalum poga koodathu - browser la save aagum */
function usePersisted(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full / blocked */ }
  }, [key, value]);
  return [value, setValue];
}

/* =====================================================================
   SMALL REUSABLE PIECES
   ===================================================================== */
function Avatar({ name, small, more }) {
  return <span className={`jp-avatar ${small ? "jp-avatar--sm" : ""} ${more ? "jp-avatar--more" : ""}`}>{more || initials(name)}</span>;
}

/* Click panni appadiye type pannalaam. Enter = save, Esc = cancel */
function Editable({ value, onSave, multiline = false, as: Tag = "span", className = "", placeholder = "Click to add", type = "text", allowEmpty = false }) {
  const [on, setOn] = useState(false);
  const [draft, setDraft] = useState(value);
  const cancelled = useRef(false);

  const start = () => { cancelled.current = false; setDraft(value); setOn(true); };
  const commit = () => {
    if (cancelled.current) return;
    setOn(false);
    const v = String(draft).trim();
    if ((v || allowEmpty) && v !== String(value)) onSave(type === "number" ? Number(v) : v);
  };
  const onKey = (e) => {
    if (e.key === "Escape") { cancelled.current = true; setOn(false); }
    if (e.key === "Enter" && (!multiline || e.ctrlKey || e.metaKey)) { e.preventDefault(); commit(); }
  };

  if (on) {
    const Field = multiline ? "textarea" : "input";
    return (
      <Field
        autoFocus className={`jp-inline ${className}`} value={draft} type={multiline ? undefined : type}
        rows={multiline ? 3 : undefined} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={onKey}
      />
    );
  }
  return (
    <Tag className={`jp-editable ${className}`} onClick={start} onKeyDown={(e) => e.key === "Enter" && start()} tabIndex={0} role="button" title="Click to edit">
      {value === "" || value === undefined ? <em>{placeholder}</em> : value}
    </Tag>
  );
}

/* Chinna number box - type pannitu Enter / veliya click panna save aagum */
function NumInput({ value, onSave, step = 1, min = 0, label }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const n = Number(draft);
    if (draft.trim() === "" || Number.isNaN(n) || n < min) return setDraft(String(value));
    if (n !== value) onSave(n);
  };
  return (
    <input
      className="jp-mini-input jp-mini-input--num" type="number" min={min} step={step} value={draft} aria-label={label}
      onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
    />
  );
}

function SkillEditor({ skills, onChange }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const add = () => {
    const v = text.trim();
    if (v && !skills.includes(v)) onChange([...skills, v]);
    setText(""); setAdding(false);
  };
  return (
    <div className="jp-skills">
      {skills.map((s) => (
        <span key={s}>{s}<button aria-label={`Remove ${s}`} onClick={() => onChange(skills.filter((x) => x !== s))}>✕</button></span>
      ))}
      {adding ? (
        <input
          autoFocus className="jp-skill-input" value={text} placeholder="Skill name" onChange={(e) => setText(e.target.value)} onBlur={add}
          onKeyDown={(e) => { if (e.key === "Enter") add(); if (e.key === "Escape") { setText(""); setAdding(false); } }}
        />
      ) : (
        <button className="jp-skill-add" onClick={() => setAdding(true)}>+ Skill</button>
      )}
    </div>
  );
}

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
function JobForm({ initial, departments, onSave, onClose }) {
  const editing = Boolean(initial.id);
  const deptOptions = departments.includes(initial.department) || !initial.department ? departments : [initial.department, ...departments];
  const [form, setForm] = useState({
    ...initial,
    department: initial.department || deptOptions[0] || "",
    skills: Array.isArray(initial.skills) ? initial.skills.join(", ") : initial.skills,
  });
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
            {deptOptions.map((d) => <option key={d}>{d}</option>)}
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
   ADD / EDIT APPLICANT
   ===================================================================== */
function ApplicantForm({ initial, departments, onSave, onClose }) {
  const editing = Boolean(initial.id);
  const [form, setForm] = useState({ ...initial, appliedOn: initial.appliedOn || today() });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const base = { ...form, experience: Number(form.experience), expectedCtc: Number(form.expectedCtc) };
    onSave(form.isEmployee ? base : { ...base, empId: "", designation: "", department: "", tenure: "" });
  };

  return (
    <Modal title={editing ? "Edit applicant" : "Add applicant"} subtitle={editing ? initial.name : "Enter the candidate's details"} onClose={onClose} size="lg">
      <form className="jp-form" onSubmit={submit}>
        <p className="jp-form__group">Candidate</p>
        <label className="jp-field jp-full">Full name
          <input required value={form.name} onChange={set("name")} placeholder="e.g. Priya Sharma" />
        </label>
        <label className="jp-field">Email
          <input type="email" required value={form.email} onChange={set("email")} placeholder="name@mail.com" />
        </label>
        <label className="jp-field">Phone
          <input required value={form.phone} onChange={set("phone")} placeholder="98765 43210" />
        </label>
        <label className="jp-field">Experience (yrs)
          <input type="number" min="0" step="0.5" required value={form.experience} onChange={set("experience")} />
        </label>
        <label className="jp-field">Expected CTC (₹ LPA)
          <input type="number" min="0" step="0.5" required value={form.expectedCtc} onChange={set("expectedCtc")} />
        </label>
        <label className="jp-field">Notice period
          <input value={form.noticePeriod} onChange={set("noticePeriod")} placeholder="30 days" />
        </label>
        <label className="jp-field">Applied on
          <input type="date" required value={form.appliedOn} onChange={set("appliedOn")} />
        </label>
        <label className="jp-field">Status
          <select value={form.status} onChange={set("status")}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
        <label className="jp-check">
          <input type="checkbox" checked={form.isEmployee} onChange={set("isEmployee")} />
          Currently works in our company
        </label>

        {form.isEmployee && (
          <>
            <p className="jp-form__group">Employee details</p>
            <label className="jp-field">Employee ID
              <input required value={form.empId} onChange={set("empId")} placeholder="EMP-1001" />
            </label>
            <label className="jp-field">Current designation
              <input required value={form.designation} onChange={set("designation")} placeholder="Software Engineer" />
            </label>
            <label className="jp-field">Department
              <select value={form.department || departments[0]} onChange={set("department")}>
                {departments.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label className="jp-field">Time in company
              <input value={form.tenure} onChange={set("tenure")} placeholder="2 yrs" />
            </label>
          </>
        )}

        <div className="jp-actions jp-full">
          <button type="button" className="jp-btn jp-btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="jp-btn jp-btn--primary">{editing ? "Save changes" : "Add applicant"}</button>
        </div>
      </form>
    </Modal>
  );
}

/* =====================================================================
   DEPARTMENTS MANAGER  (add / rename / delete)
   ===================================================================== */
function DepartmentManager({ departments, jobs, onAdd, onRename, onDelete, onClose }) {
  const [name, setName] = useState("");
  const usedIn = (d) => jobs.filter((j) => j.department === d).length;
  const add = (e) => { e.preventDefault(); if (name.trim()) { onAdd(name.trim()); setName(""); } };

  return (
    <Modal title="Departments" subtitle="Rename, add or remove departments used in vacancies" onClose={onClose}>
      <ul className="jp-deptlist">
        {departments.map((d) => (
          <li key={d}>
            <Editable value={d} onSave={(v) => onRename(d, v)} className="jp-deptname" />
            <small>{usedIn(d)} {usedIn(d) === 1 ? "vacancy" : "vacancies"}</small>
            <button className="jp-btn jp-btn--danger jp-btn--xs" disabled={usedIn(d) > 0} title={usedIn(d) > 0 ? "Move its vacancies first" : "Delete department"} onClick={() => onDelete(d)}>Delete</button>
          </li>
        ))}
      </ul>
      <form className="jp-adddept" onSubmit={add}>
        <input className="jp-search jp-search--sm" placeholder="New department name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="jp-btn jp-btn--primary" type="submit">Add department</button>
      </form>
    </Modal>
  );
}

/* =====================================================================
   APPLICANTS
   ===================================================================== */
function Applicants({ job, applicants, onStatus, onAdd, onEdit, onDelete, onClose }) {
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
          <button className="jp-btn jp-btn--primary" onClick={onAdd}>+ Add applicant</button>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="jp-empty">No applicants in this list yet. Use “Add applicant” to enter one.</p>
      ) : (
        <div className="jp-table-wrap">
          <table className="jp-table">
            <thead>
              <tr>
                <th>Candidate</th><th>Experience</th><th>Working in company?</th>
                <th>Expected CTC</th><th>Applied on</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="jp-person">
                      <Avatar name={a.name} />
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
                  <td>
                    <div className="jp-rowactions">
                      <button className="jp-btn jp-btn--ghost jp-btn--xs" onClick={() => onEdit(a)}>Edit</button>
                      <button className="jp-btn jp-btn--danger jp-btn--xs" onClick={() => onDelete(a)}>Delete</button>
                    </div>
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
  const [jobs, setJobs] = usePersisted("jp:jobs", initialJobs);
  const [applicants, setApplicants] = usePersisted("jp:applicants", initialApplicants);
  const [departments, setDepartments] = usePersisted("jp:departments", DEFAULT_DEPARTMENTS);
  const [ui, setUi] = usePersisted("jp:ui", defaultUi);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [dept, setDept] = useState("All");
  const [sort, setSort] = useState("newest");
  const [modal, setModal] = useState(null); // { type, job }
  const [sub, setSub] = useState(null);     // { type, app } - applicants popup mele varra chinna popup
  const [toast, setToast] = useState("");

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };
  const appsOf = (id) => applicants.filter((a) => a.jobId === id);
  const liveJob = (m) => jobs.find((j) => j.id === m.job.id) || m.job;
  const labels = { ...defaultUi.labels, ...ui.labels };

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

  /* ---- vacancy actions ---- */
  const patchJob = (id, patch) => setJobs(jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)));

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
    patchJob(job.id, { status: next });
    notify(next === "Open" ? "Vacancy reopened" : "Vacancy closed");
  };

  const deleteJob = (id) => {
    setJobs(jobs.filter((j) => j.id !== id));
    setApplicants(applicants.filter((a) => a.jobId !== id));
    setModal(null);
    notify("Vacancy deleted");
  };

  /* ---- applicant actions ---- */
  const changeStatus = (id, s) => setApplicants(applicants.map((a) => (a.id === id ? { ...a, status: s } : a)));

  const saveApplicant = (data) => {
    if (data.id) {
      setApplicants(applicants.map((a) => (a.id === data.id ? data : a)));
      notify("Applicant updated");
    } else {
      setApplicants([...applicants, { ...data, id: Date.now(), jobId: modal.job.id }]);
      notify("Applicant added");
    }
    setSub(null);
  };

  const deleteApplicant = (id) => {
    setApplicants(applicants.filter((a) => a.id !== id));
    setSub(null);
    notify("Applicant removed");
  };

  /* ---- department actions ---- */
  const addDept = (name) => {
    if (departments.some((d) => d.toLowerCase() === name.toLowerCase())) return notify("Department already exists");
    setDepartments([...departments, name]);
    notify("Department added");
  };
  const renameDept = (from, to) => {
    if (departments.some((d) => d !== from && d.toLowerCase() === to.toLowerCase())) return notify("Department already exists");
    setDepartments(departments.map((d) => (d === from ? to : d)));
    setJobs(jobs.map((j) => (j.department === from ? { ...j, department: to } : j)));
    if (dept === from) setDept(to);
    notify("Department renamed");
  };
  const deleteDept = (name) => {
    setDepartments(departments.filter((d) => d !== name));
    if (dept === name) setDept("All");
    notify("Department deleted");
  };

  /* ---- page text / theme ---- */
  const setLabel = (k) => (v) => setUi({ ...ui, labels: { ...labels, [k]: v } });
  const resetAll = () => {
    setJobs(initialJobs); setApplicants(initialApplicants); setDepartments(DEFAULT_DEPARTMENTS); setUi(defaultUi);
    setModal(null); notify("Everything reset to sample data");
  };

  return (
    <div className="jp">
      {/* ---------- Hero ---------- */}
      <section className="jp-hero">
        <div className="jp-hero__text">
          <Editable as="h1" value={ui.title} onSave={(v) => setUi({ ...ui, title: v })} />
          <Editable as="p" multiline value={ui.sub} onSave={(v) => setUi({ ...ui, sub: v })} />
          <span className="jp-hero__hint">✎ Click the heading or this text to edit it</span>
        </div>
        <div className="jp-hero__side">
          <div className="jp-hero__btns">
            <button className="jp-btn jp-btn--cta" onClick={() => setModal({ type: "form", job: emptyJob })}>
              <span className="jp-plus">+</span> Create vacancy
            </button>
          </div>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="jp-stats">
        {Object.keys(labels).map((k) => (
          <div key={k} className={`jp-stat ${k === "closing" ? "jp-stat--warn" : ""} ${k === "employees" ? "jp-stat--accent" : ""}`}>
            <span className="jp-stat__icon">{STAT_ICONS[k]}</span>
            <div>
              <b>{stats[k]}</b>
              <Editable value={labels[k]} onSave={setLabel(k)} />
            </div>
          </div>
        ))}
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
          {departments.map((d) => <option key={d}>{d}</option>)}
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

                <Editable as="h2" value={job.title} onSave={(v) => patchJob(job.id, { title: v })} />
                <p className="jp-card__meta">{job.department} · {job.location} · {job.type}</p>
                <Editable as="p" multiline className="jp-card__desc" value={job.description} onSave={(v) => patchJob(job.id, { description: v })} />

                <SkillEditor skills={job.skills} onChange={(skills) => patchJob(job.id, { skills })} />

                <dl className="jp-facts">
                  <div>
                    <dt>Salary (₹ LPA)</dt>
                    <dd className="jp-range">
                      <NumInput label="Minimum salary" step={0.5} value={job.salMin} onSave={(v) => patchJob(job.id, { salMin: v })} />
                      <span>–</span>
                      <NumInput label="Maximum salary" step={0.5} value={job.salMax} onSave={(v) => patchJob(job.id, { salMax: v })} />
                    </dd>
                  </div>
                  <div>
                    <dt>Experience (yrs)</dt>
                    <dd className="jp-range">
                      <NumInput label="Minimum experience" step={0.5} value={job.expMin} onSave={(v) => patchJob(job.id, { expMin: v })} />
                      <span>–</span>
                      <NumInput label="Maximum experience" step={0.5} value={job.expMax} onSave={(v) => patchJob(job.id, { expMax: v })} />
                    </dd>
                  </div>
                  <div>
                    <dt>Work mode</dt>
                    <dd>
                      <select className="jp-mini-input jp-mini-select" value={job.workMode} aria-label="Work mode" onChange={(e) => patchJob(job.id, { workMode: e.target.value })}>
                        <option>On-site</option><option>Hybrid</option><option>Remote</option>
                      </select>
                    </dd>
                  </div>
                  <div>
                    <dt>Openings</dt>
                    <dd><NumInput label="Openings" min={1} value={job.openings} onSave={(v) => patchJob(job.id, { openings: Math.max(1, Math.round(v)) })} /></dd>
                  </div>
                  <div>
                    <dt>Qualification</dt>
                    <dd><Editable value={job.qualification} onSave={(v) => patchJob(job.id, { qualification: v })} /></dd>
                  </div>
                  <div>
                    <dt>Hiring manager</dt>
                    <dd><Editable value={job.manager} onSave={(v) => patchJob(job.id, { manager: v })} /></dd>
                  </div>
                  <div>
                    <dt>Posted</dt>
                    <dd><input className="jp-mini-input jp-mini-input--date" type="date" value={job.postedOn} aria-label="Posted on" onChange={(e) => e.target.value && patchJob(job.id, { postedOn: e.target.value })} /></dd>
                  </div>
                  <div>
                    <dt>Apply by</dt>
                    <dd>
                      <input className="jp-mini-input jp-mini-input--date" type="date" value={job.deadline} aria-label="Last date to apply" onChange={(e) => patchJob(job.id, { deadline: e.target.value })} />
                      <em className={`jp-due jp-due--${dl.tone}`}>{dl.text}</em>
                    </dd>
                  </div>
                </dl>
              </div>

              <aside className="jp-card__side">
                <button className="jp-applied" onClick={() => setModal({ type: "applicants", job })}>
                  <div className="jp-applied__top">
                    <strong>{apps.length}</strong>
                    <span>{apps.length === 1 ? "application" : "applications"}</span>
                  </div>
                  <div className="jp-stack">
                    {apps.slice(0, 4).map((a) => <Avatar key={a.id} name={a.name} small />)}
                    {apps.length > 4 && <Avatar name="more" small more={`+${apps.length - 4}`} />}
                    {apps.length === 0 && <small>No one has applied yet</small>}
                  </div>
                  <ul>
                    <li><b>{emps}</b> current {emps === 1 ? "employee" : "employees"}</li>
                    <li><b>{shortlisted}</b> shortlisted</li>
                    <li><b>{hired}</b> hired</li>
                  </ul>
                  <span className="jp-applied__cta">View and edit applicants</span>
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

      <footer className="jp-footer">
        <span>Changes are saved in this browser automatically.</span>
        <button className="jp-btn jp-btn--ghost jp-btn--xs" onClick={() => setModal({ type: "reset" })}>Reset to sample data</button>
      </footer>

      {/* ---------- Modals ---------- */}
      {modal?.type === "form" && <JobForm initial={modal.job} departments={departments} onSave={saveJob} onClose={() => setModal(null)} />}
      {modal?.type === "depts" && (
        <DepartmentManager departments={departments} jobs={jobs} onAdd={addDept} onRename={renameDept} onDelete={deleteDept} onClose={() => setModal(null)} />
      )}
      {modal?.type === "applicants" && (
        <Applicants
          job={liveJob(modal)} applicants={appsOf(modal.job.id)} onStatus={changeStatus}
          onAdd={() => setSub({ type: "appForm", app: emptyApplicant })}
          onEdit={(a) => setSub({ type: "appForm", app: a })}
          onDelete={(a) => setSub({ type: "delApp", app: a })}
          onClose={() => { setSub(null); setModal(null); }}
        />
      )}
      {sub?.type === "appForm" && <ApplicantForm initial={sub.app} departments={departments} onSave={saveApplicant} onClose={() => setSub(null)} />}
      {sub?.type === "delApp" && (
        <Modal title="Remove this applicant?" onClose={() => setSub(null)}>
          <p className="jp-confirm">{sub.app.name}’s application will be removed from this vacancy. This cannot be undone.</p>
          <div className="jp-actions">
            <button className="jp-btn jp-btn--ghost" onClick={() => setSub(null)}>Cancel</button>
            <button className="jp-btn jp-btn--danger-solid" onClick={() => deleteApplicant(sub.app.id)}>Remove applicant</button>
          </div>
        </Modal>
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
      {modal?.type === "reset" && (
        <Modal title="Reset to sample data?" onClose={() => setModal(null)}>
          <p className="jp-confirm">All vacancies, applicants, departments, texts and theme will go back to the original sample. Your edits will be lost.</p>
          <div className="jp-actions">
            <button className="jp-btn jp-btn--ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="jp-btn jp-btn--danger-solid" onClick={resetAll}>Reset everything</button>
          </div>
        </Modal>
      )}

      {toast && <div className="jp-toast" role="status">{toast}</div>}
    </div>
  );
}