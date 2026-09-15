import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, Trash2, UserCog, X } from "lucide-react";
import Sidebar from "./Sidebar";
import "./Organizations.css";
import "./UserAssignments.css";

const OPTIONS = {
  users: [{ id: "1", name: "Arav Kumar", user_code: "USR-001" }, { id: "2", name: "Meera Iyer", user_code: "USR-002" }, { id: "3", name: "Priya Sharma", user_code: "USR-003" }, { id: "4", name: "Dev Patel", user_code: "USR-004" }],
  organizations: [{ id: "1", name: "Lernevo Tech" }, { id: "2", name: "GreenLeaf Wellness" }, { id: "3", name: "Northwind Logistics" }, { id: "4", name: "Acme Retail" }],
  job_codes: [{ id: "1", code: "ENG-2", title: "Software Engineer II", organization: "1" }, { id: "2", code: "PPL-1", title: "People Operations Coordinator", organization: "2" }, { id: "3", code: "DES-3", title: "Senior Product Designer", organization: "3" }, { id: "4", code: "MKT-3", title: "Growth Marketing Manager", organization: "4" }],
  statuses: [{ value: "ACTIVE", label: "Active" }, { value: "PENDING", label: "Pending" }, { value: "INACTIVE", label: "Inactive" }],
};
const INITIAL_ASSIGNMENTS = [
  { id: 1, user: "1", user_name: "Arav Kumar", user_code: "USR-001", organization: "1", organization_name: "Lernevo Tech", job_code: "1", job_code_value: "ENG-2", start_date: "2026-01-15", end_date: "", status: "ACTIVE", status_label: "Active" },
  { id: 2, user: "2", user_name: "Meera Iyer", user_code: "USR-002", organization: "2", organization_name: "GreenLeaf Wellness", job_code: "2", job_code_value: "PPL-1", start_date: "2026-02-01", end_date: "", status: "ACTIVE", status_label: "Active" },
  { id: 3, user: "3", user_name: "Priya Sharma", user_code: "USR-003", organization: "3", organization_name: "Northwind Logistics", job_code: "3", job_code_value: "DES-3", start_date: "2026-03-10", end_date: "2026-08-31", status: "INACTIVE", status_label: "Inactive" },
  { id: 4, user: "4", user_name: "Dev Patel", user_code: "USR-004", organization: "4", organization_name: "Acme Retail", job_code: "4", job_code_value: "MKT-3", start_date: "2026-04-04", end_date: "", status: "PENDING", status_label: "Pending" },
];
const EMPTY_FORM = { user: "", organization: "", job_code: "", start_date: "", end_date: "", status: "ACTIVE" };
const PAGE_SIZE = 8;
const formatDate = (value) => value ? new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "—";
const toForm = (item) => ({ user: item.user, organization: item.organization, job_code: item.job_code, start_date: item.start_date, end_date: item.end_date || "", status: item.status });

export default function UserAssignments() {
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [query, setQuery] = useState("");
  const [organization, setOrganization] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const filtered = useMemo(() => assignments.filter((item) => {
    const text = `${item.user_name} ${item.user_code} ${item.organization_name} ${item.job_code_value}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (!organization || item.organization === organization) && (!status || item.status === status);
  }), [assignments, query, organization, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const resetPage = (setter) => (event) => { setter(event.target.value); setPage(1); };
  const remove = (item) => { if (window.confirm(`Delete the assignment for ${item.user_name}?`)) setAssignments((current) => current.filter((assignment) => assignment.id !== item.id)); };
  const saveAssignment = (form, source) => {
    const user = OPTIONS.users.find((item) => item.id === form.user);
    const org = OPTIONS.organizations.find((item) => item.id === form.organization);
    const job = OPTIONS.job_codes.find((item) => item.id === form.job_code);
    const state = OPTIONS.statuses.find((item) => item.value === form.status);
    const next = { ...form, id: source?.id || Date.now(), user_name: user.name, user_code: user.user_code, organization_name: org.name, job_code_value: job.code, status_label: state.label };
    setAssignments((current) => source ? current.map((item) => item.id === source.id ? next : item) : [next, ...current]);
  };
  return <div style={{ display: "flex" }}><Sidebar /><div style={{ flex: 1, overflowY: "auto", height: "100vh" }}><main className="orgs-page user-assignments-page">
    <div className="orgs-header"><div className="orgs-header-left"><div className="orgs-icon-box"><UserCog /></div><div><div className="orgs-title">User Assignments</div><div className="orgs-subtitle">Assign users to organizations and job codes.</div></div></div><button className="orgs-add-btn" type="button" onClick={() => setModal({ mode: "add", form: EMPTY_FORM })}><Plus size={16} /> Add Assignment</button></div>
    <div className="orgs-toolbar"><div className="orgs-search"><Search /><input value={query} onChange={resetPage(setQuery)} type="search" placeholder="Search assignments..." aria-label="Search assignments" /></div><div className="user-assignments-filters"><label className="orgs-status-filter"><span className="orgs-status-label">Organization:</span><select className="orgs-status-btn user-assignments-filter-select" value={organization} onChange={resetPage(setOrganization)}><option value="">All</option>{OPTIONS.organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="orgs-status-filter"><span className="orgs-status-label">Status:</span><select className="orgs-status-btn user-assignments-filter-select" value={status} onChange={resetPage(setStatus)}><option value="">All</option>{OPTIONS.statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div></div>
    <div className="orgs-table-wrap"><table className="orgs-table user-assignments-table"><thead><tr><th>User</th><th>Organization</th><th>Job Code</th><th>Start Date</th><th>End Date</th><th>Status</th><th className="orgs-actions-col">Actions</th></tr></thead><tbody>{rows.length === 0 ? <tr><td className="orgs-empty-row" colSpan={7}>No assignments found.</td></tr> : rows.map((item) => <tr key={item.id}><td className="user-assignments-user-cell"><span className="orgs-name-cell">{item.user_name}</span><span>{item.user_code}</span></td><td className="orgs-dim-cell">{item.organization_name}</td><td><span className="user-assignments-code">{item.job_code_value}</span></td><td className="orgs-dim-cell">{formatDate(item.start_date)}</td><td className="orgs-dim-cell">{formatDate(item.end_date)}</td><td><span className={`orgs-status-badge ${item.status === "ACTIVE" ? "orgs-status-active" : "orgs-status-inactive"}`}>{item.status_label}</span></td><td className="orgs-actions-col"><button className="orgs-icon-btn" type="button" title="View assignment" onClick={() => setModal({ mode: "view", assignment: item, form: toForm(item) })}><Eye size={15} /></button><button className="orgs-icon-btn" type="button" title="Edit assignment" onClick={() => setModal({ mode: "edit", assignment: item, form: toForm(item) })}><Pencil size={15} /></button><button className="orgs-icon-btn orgs-icon-btn-danger" type="button" title="Delete assignment" onClick={() => remove(item)}><Trash2 size={15} /></button></td></tr>)}</tbody></table></div>
    <div className="orgs-footer"><div className="orgs-showing">Showing <strong>{filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong></div><div className="orgs-pagination"><button className="orgs-page-btn" type="button" disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={14} /> Prev</button><span className="orgs-page-label">Page {currentPage} / {pageCount}</span><button className="orgs-page-btn" type="button" disabled={currentPage === pageCount} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight size={14} /></button></div></div>
  </main></div>{modal && <AssignmentModal modal={modal} onClose={() => setModal(null)} onSaved={saveAssignment} />}</div>;
}

function AssignmentModal({ modal, onClose, onSaved }) {
  const [form, setForm] = useState(modal.form);
  const [error, setError] = useState("");
  const viewOnly = modal.mode === "view";
  const selectedUser = OPTIONS.users.find((item) => item.id === form.user);
  const jobCodes = OPTIONS.job_codes.filter((item) => !form.organization || item.organization === form.organization);
  const change = (field) => (event) => { setForm((current) => ({ ...current, [field]: event.target.value, ...(field === "organization" ? { job_code: "" } : {}) })); };
  const save = (event) => { event.preventDefault(); if (form.end_date && form.end_date < form.start_date) return setError("End date cannot be before start date."); onSaved(form, modal.assignment); onClose(); };
  const title = viewOnly ? "Assignment Details" : modal.mode === "add" ? "Add Assignment" : "Edit Assignment";
  return <div className="orgs-modal-overlay" onClick={onClose}><section className="orgs-modal" aria-modal="true" aria-labelledby="assignment-modal-title" role="dialog" onClick={(event) => event.stopPropagation()}><div className="orgs-modal-header"><div className="orgs-modal-title" id="assignment-modal-title">{title}</div><button className="orgs-modal-close" type="button" aria-label="Close" onClick={onClose}><X size={18} /></button></div><form onSubmit={save}><div className="orgs-modal-body">{error && <div className="user-assignments-message" role="alert">{error}</div>}<label className="orgs-field"><span>User Name *</span><select required disabled={viewOnly} value={form.user} onChange={change("user")}><option value="">Select a user</option>{OPTIONS.users.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="orgs-field"><span>User ID</span><input type="text" value={selectedUser?.user_code || ""} placeholder="Selected user ID" readOnly /></label><label className="orgs-field"><span>Organization *</span><select required disabled={viewOnly} value={form.organization} onChange={change("organization")}><option value="">Select an organization</option>{OPTIONS.organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="orgs-field"><span>Job Code *</span><select required disabled={viewOnly} value={form.job_code} onChange={change("job_code")}><option value="">Select a job code</option>{jobCodes.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.title}</option>)}</select></label><div className="user-assignments-date-grid"><label className="orgs-field"><span>Start Date *</span><input required disabled={viewOnly} type="date" value={form.start_date} onChange={change("start_date")} /></label><label className="orgs-field"><span>End Date</span><input disabled={viewOnly} type="date" value={form.end_date} onChange={change("end_date")} /></label></div><label className="orgs-field"><span>Status *</span><select required disabled={viewOnly} value={form.status} onChange={change("status")}>{OPTIONS.statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div><div className="orgs-modal-footer"><button className="orgs-btn-secondary" type="button" onClick={onClose}>{viewOnly ? "Close" : "Cancel"}</button>{!viewOnly && <button className="orgs-btn-primary" type="submit">Save Assignment</button>}</div></form></section></div>;
}
