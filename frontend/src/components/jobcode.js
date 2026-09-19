import React, { useMemo, useState } from "react";
import { BriefcaseBusiness, Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Sidebar from "./Sidebar";
import "./jobcode.css";

const CATEGORY_OPTIONS = [
  { value: "Primary", label: "Core Role", className: "job-codes-category-primary" },
  { value: "Mandatory", label: "Mandatory Role", className: "job-codes-category-mandatory" },
  { value: "Optional", label: "Flex Role", className: "job-codes-category-optional" },
];
const categoryMeta = (value) => CATEGORY_OPTIONS.find((option) => option.value === value) || CATEGORY_OPTIONS[0];

const INITIAL_JOB_CODES = [
  { id: 1, title: "Python Full Stack Developer", department: "Engineering", description: "Build and maintain full-stack Python applications.", status: "Active", organization: "Lernevo Tech", category: "Primary" },
  { id: 2, title: "Frontend Engineer", department: "Engineering", description: "Craft user interfaces with React and modern tooling.", status: "Active", organization: "Lernevo Tech", category: "Primary" },
  { id: 3, title: "HR Specialist", department: "People Ops", description: "Manage employee relations and compliance.", status: "Active", organization: "GreenLeaf Wellness", category: "Primary" },
  { id: 4, title: "Team Leader Training", department: "Engineering", description: "Leadership and people-management training for promoted developers.", status: "Active", organization: "Lernevo Tech", category: "Mandatory" },
  { id: 5, title: "Operations Manager", department: "Operations", description: "Oversee logistics and warehouse operations.", status: "Active", organization: "Northwind Logistics", category: "Mandatory" },
  { id: 6, title: "Fitness Coach", department: "Wellness", description: "Lead fitness and training programs.", status: "Active", organization: "GreenLeaf Wellness", category: "Optional" },
];

const EMPTY_FORM = { title: "", department: "", description: "", organization: "", status: "Active", category: "Primary" };

export default function JobCode() {
  const [jobCodes, setJobCodes] = useState(INITIAL_JOB_CODES);
  const [query, setQuery] = useState("");
  const [organization, setOrganization] = useState("All");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const organizations = useMemo(() => ["All", ...new Set(jobCodes.map((item) => item.organization).filter(Boolean))], [jobCodes]);
  const filteredJobCodes = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    return jobCodes.filter((item) =>
      (!searchTerm || `${item.title} ${item.department} ${item.description} ${item.organization}`.toLowerCase().includes(searchTerm)) &&
      (organization === "All" || item.organization === organization) &&
      (status === "All" || item.status === status) &&
      (category === "All" || item.category === category)
    );
  }, [jobCodes, category, organization, query, status]);

  const allVisibleSelected = filteredJobCodes.length > 0 && filteredJobCodes.every((item) => selectedIds.includes(item.id));
  const isFormModal = modal?.mode === "add" || modal?.mode === "edit";
  const closeModal = () => { setModal(null); setForm(EMPTY_FORM); };
  const openAdd = () => { setForm(EMPTY_FORM); setModal({ mode: "add" }); };
  const openEdit = (jobCode) => { setForm({ ...jobCode }); setModal({ mode: "edit", jobCode }); };
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const toggleAll = () => {
    const visibleIds = filteredJobCodes.map((item) => item.id);
    setSelectedIds((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]);
  };
  const toggleJobCode = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]);
  const handleSave = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.organization || !form.status) return;
    const jobCode = { ...form, title: form.title.trim(), department: form.department.trim(), description: form.description.trim() };
    if (modal.mode === "add") setJobCodes((current) => [...current, { ...jobCode, id: Date.now() }]);
    else setJobCodes((current) => current.map((item) => item.id === modal.jobCode.id ? { ...jobCode, id: item.id } : item));
    closeModal();
  };
  const confirmDelete = () => {
    const id = modal.jobCode.id;
    setJobCodes((current) => current.filter((item) => item.id !== id));
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
    closeModal();
  };

  return (
    <div className="job-codes-layout"><Sidebar /><div className="job-codes-content-scroll"><main className="job-codes-page">
      <header className="job-codes-header"><div className="job-codes-header-left"><div className="job-codes-icon-box" aria-hidden="true"><BriefcaseBusiness /></div><div><h1>Job Codes</h1><p>Define job titles and departments.</p></div></div><button className="job-codes-add-button" type="button" onClick={openAdd}><Plus size={16} />Add Job Code</button></header>
      <section className="job-codes-toolbar" aria-label="Job code filters"><div className="job-codes-search"><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search job codes..." aria-label="Search job codes" /></div><div className="job-codes-filters"><label><span>Organization:</span><select value={organization} onChange={(event) => setOrganization(event.target.value)} aria-label="Filter by organization">{organizations.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label><span>Status:</span><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option value="All">All</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label></div></section>
      <div className="job-codes-category-tabs" role="tablist" aria-label="Filter by category">{["All", ...CATEGORY_OPTIONS.map((option) => option.value)].map((value) => { const meta = value === "All" ? null : categoryMeta(value); return <button key={value} type="button" role="tab" aria-selected={category === value} className={`job-codes-category-tab ${category === value ? "job-codes-category-tab-active" : ""} ${meta ? meta.className : ""}`} onClick={() => setCategory(value)}>{value === "All" ? "All" : meta.label}</button>; })}</div>
      <div className="job-codes-table-wrap"><table className="job-codes-table"><thead><tr><th className="job-codes-check-column"><input checked={allVisibleSelected} onChange={toggleAll} type="checkbox" aria-label="Select all visible job codes" /></th><th>Title</th><th>Department</th><th>Description</th><th>Status</th><th className="job-codes-actions-column">Actions</th></tr></thead><tbody>{filteredJobCodes.length === 0 ? <tr><td colSpan={6} className="job-codes-empty">No job codes found.</td></tr> : filteredJobCodes.map((item) => <tr key={item.id}><td className="job-codes-check-column"><input checked={selectedIds.includes(item.id)} onChange={() => toggleJobCode(item.id)} type="checkbox" aria-label={`Select ${item.title}`} /></td><td className="job-codes-title-cell">{item.title}</td><td className="job-codes-muted-cell">{item.department}</td><td className="job-codes-description-cell">{item.description}</td><td><span className={`job-codes-status ${item.status === "Inactive" ? "job-codes-status-inactive" : ""}`}>{item.status}</span></td><td className="job-codes-actions-column"><button type="button" className="job-codes-action" title={`View ${item.title}`} aria-label={`View ${item.title}`} onClick={() => setModal({ mode: "view", jobCode: item })}><Eye size={15} /></button><button type="button" className="job-codes-action" title={`Edit ${item.title}`} aria-label={`Edit ${item.title}`} onClick={() => openEdit(item)}><Pencil size={15} /></button><button type="button" className="job-codes-action job-codes-delete-action" title={`Delete ${item.title}`} aria-label={`Delete ${item.title}`} onClick={() => setModal({ mode: "delete", jobCode: item })}><Trash2 size={15} /></button></td></tr>)}</tbody></table></div>
    </main></div>
    {isFormModal && <div className="job-codes-modal-overlay" onMouseDown={closeModal}><form className="job-codes-modal" onSubmit={handleSave} onMouseDown={(event) => event.stopPropagation()}><ModalHeader title={modal.mode === "add" ? "Add Job Code" : "Edit Job Code"} onClose={closeModal} /><div className="job-codes-modal-body"><label className="job-codes-field"><span>Job Title <b>*</b></span><input value={form.title} onChange={(event) => updateForm("title", event.target.value)} required autoFocus /></label><label className="job-codes-field"><span>Department</span><input value={form.department} onChange={(event) => updateForm("department", event.target.value)} /></label><label className="job-codes-field"><span>Description</span><textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} /></label><label className="job-codes-field"><span>Organization</span><select value={form.organization} onChange={(event) => updateForm("organization", event.target.value)} required><option value="" disabled>Select...</option>{organizations.filter((option) => option !== "All").map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label className="job-codes-field"><span>Category <b>*</b></span><select value={form.category} onChange={(event) => updateForm("category", event.target.value)} required>{CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="job-codes-field"><span>Status</span><select value={form.status} onChange={(event) => updateForm("status", event.target.value)} required><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label></div><div className="job-codes-modal-actions"><button type="button" className="job-codes-cancel-button" onClick={closeModal}>Cancel</button><button type="submit" className="job-codes-save-button">{modal.mode === "add" ? "Save Job Code" : "Save Changes"}</button></div></form></div>}
    {modal?.mode === "view" && <div className="job-codes-modal-overlay" onMouseDown={closeModal}><section className="job-codes-modal job-codes-view-modal" onMouseDown={(event) => event.stopPropagation()}><ModalHeader title="Job Code Details" onClose={closeModal} /><div className="job-codes-view-body"><Detail label="Job Title" value={modal.jobCode.title} /><Detail label="Department" value={modal.jobCode.department} /><Detail label="Description" value={modal.jobCode.description} paragraph /><Detail label="Organization" value={modal.jobCode.organization} /><Detail label="Category" value={categoryMeta(modal.jobCode.category).label} /><Detail label="Status" value={modal.jobCode.status} /></div><div className="job-codes-modal-actions"><button type="button" className="job-codes-save-button" onClick={closeModal}>Close</button></div></section></div>}
    {modal?.mode === "delete" && <div className="job-codes-modal-overlay" onMouseDown={closeModal}><section className="job-codes-modal job-codes-confirm-modal" onMouseDown={(event) => event.stopPropagation()}><ModalHeader title="Delete Job Code" onClose={closeModal} /><div className="job-codes-confirm-body">Are you sure you want to delete <strong>{modal.jobCode.title}</strong>? This action cannot be undone.</div><div className="job-codes-modal-actions"><button type="button" className="job-codes-cancel-button" onClick={closeModal}>Cancel</button><button type="button" className="job-codes-delete-button" onClick={confirmDelete}>Delete</button></div></section></div>}
    </div>
  );
}

function ModalHeader({ title, onClose }) { return <div className="job-codes-modal-header"><h2>{title}</h2><button type="button" className="job-codes-modal-close" onClick={onClose} aria-label="Close"><X size={19} /></button></div>; }
function Detail({ label, value, paragraph }) { return <div><span>{label}</span>{paragraph ? <p>{value || "—"}</p> : <strong>{value || "—"}</strong>}</div>; }