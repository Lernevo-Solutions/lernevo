import React, { useMemo, useRef, useState } from "react";
import { Download, Eye, FileText, Pencil, Plus, Search, Trash2, Upload, Wallet, X } from "lucide-react";
import Sidebar from "./Sidebar";
import "./Payslip.css";


const STATUS_OPTIONS = ["Paid", "Pending"];

const EMPTY_FORM = { employeeName: "", employeeId: "", organization: "", month: "", status: "Paid", fileName: "", fileData: "", fileType: "" };

const INITIAL_PAYSLIPS = [
  { id: 1, employeeName: "Arun Kumar", employeeId: "EMP1001", organization: "Lernevo Tech", month: "August 2026", status: "Paid", fileName: "", fileData: "", fileType: "" },
  { id: 2, employeeName: "Priya S", employeeId: "EMP1002", organization: "Lernevo Tech", month: "August 2026", status: "Paid", fileName: "", fileData: "", fileType: "" },
  { id: 3, employeeName: "Karthik R", employeeId: "EMP1003", organization: "GreenLeaf Wellness", month: "August 2026", status: "Pending", fileName: "", fileData: "", fileType: "" },
];

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

export default function Payslip() {
  const [payslips, setPayslips] = useState(INITIAL_PAYSLIPS);
  const [query, setQuery] = useState("");
  const [organization, setOrganization] = useState("All");
  const [month, setMonth] = useState("All");
  const [status, setStatus] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const fileInputRef = useRef(null);

  const organizations = useMemo(() => ["All", ...new Set(payslips.map((item) => item.organization).filter(Boolean))], [payslips]);
  const months = useMemo(() => ["All", ...new Set(payslips.map((item) => item.month).filter(Boolean))], [payslips]);
  const filteredPayslips = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    return payslips.filter((item) =>
      (!searchTerm || `${item.employeeName} ${item.employeeId} ${item.organization} ${item.month}`.toLowerCase().includes(searchTerm)) &&
      (organization === "All" || item.organization === organization) &&
      (month === "All" || item.month === month) &&
      (status === "All" || item.status === status)
    );
  }, [payslips, month, organization, query, status]);

  const allVisibleSelected = filteredPayslips.length > 0 && filteredPayslips.every((item) => selectedIds.includes(item.id));
  const isFormModal = modal?.mode === "add" || modal?.mode === "edit";
  const closeModal = () => { setModal(null); setForm(EMPTY_FORM); };
  const openAdd = () => { setForm(EMPTY_FORM); setModal({ mode: "add" }); };
  const openEdit = (payslip) => { setForm({ ...payslip }); setModal({ mode: "edit", payslip }); };
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileData = await readFileAsDataUrl(file);
    setForm((current) => ({ ...current, fileName: file.name, fileData, fileType: file.type }));
  };
  const clearFile = () => { setForm((current) => ({ ...current, fileName: "", fileData: "", fileType: "" })); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const toggleAll = () => {
    const visibleIds = filteredPayslips.map((item) => item.id);
    setSelectedIds((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]);
  };
  const togglePayslip = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]);
  const handleSave = (event) => {
    event.preventDefault();
    if (!form.employeeName.trim() || !form.employeeId.trim() || !form.organization || !form.month.trim()) return;
    const payslip = { ...form, employeeName: form.employeeName.trim(), employeeId: form.employeeId.trim(), month: form.month.trim() };
    if (modal.mode === "add") setPayslips((current) => [...current, { ...payslip, id: Date.now() }]);
    else setPayslips((current) => current.map((item) => item.id === modal.payslip.id ? { ...payslip, id: item.id } : item));
    closeModal();
  };
  const confirmDelete = () => {
    const id = modal.payslip.id;
    setPayslips((current) => current.filter((item) => item.id !== id));
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
    closeModal();
  };
  const downloadFile = (item) => {
    if (!item.fileData) return;
    const link = document.createElement("a");
    link.href = item.fileData;
    link.download = item.fileName || `payslip-${item.employeeId}`;
    link.click();
  };

  return (
    <div className="payslip-layout"><Sidebar /><div className="payslip-content-scroll"><main className="payslip-page">
      <header className="payslip-header"><div className="payslip-header-left"><div className="payslip-icon-box" aria-hidden="true"><Wallet /></div><div><h1>Payslips</h1><p>Upload and manage employee payslips.</p></div></div><button className="payslip-add-button" type="button" onClick={openAdd}><Plus size={16} />Add Payslip</button></header>
      <section className="payslip-toolbar" aria-label="Payslip filters"><div className="payslip-search"><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search payslips..." aria-label="Search payslips" /></div><div className="payslip-filters"><label><span>Organization:</span><select value={organization} onChange={(event) => setOrganization(event.target.value)} aria-label="Filter by organization">{organizations.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label><span>Month:</span><select value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Filter by month">{months.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label><span>Status:</span><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option value="All">All</option>{STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></label></div></section>
      <div className="payslip-table-wrap"><table className="payslip-table"><thead><tr><th className="payslip-check-column"><input checked={allVisibleSelected} onChange={toggleAll} type="checkbox" aria-label="Select all visible payslips" /></th><th>Employee</th><th>Month</th><th>Payslip</th><th>Status</th><th className="payslip-actions-column">Actions</th></tr></thead><tbody>{filteredPayslips.length === 0 ? <tr><td colSpan={6} className="payslip-empty">No payslips found.</td></tr> : filteredPayslips.map((item) => <tr key={item.id}><td className="payslip-check-column"><input checked={selectedIds.includes(item.id)} onChange={() => togglePayslip(item.id)} type="checkbox" aria-label={`Select ${item.employeeName}`} /></td><td><div className="payslip-employee-cell"><span className="payslip-employee-name">{item.employeeName}</span><span className="payslip-employee-id">{item.employeeId}</span></div></td><td className="payslip-muted-cell">{item.month}</td><td>{item.fileData ? <button type="button" className="payslip-file-chip" onClick={() => setModal({ mode: "view", payslip: item })}>{item.fileType?.startsWith("image/") ? <img className="payslip-file-thumb" src={item.fileData} alt="" /> : <FileText size={15} />}<span>{item.fileName}</span></button> : <span className="payslip-file-missing">Not uploaded</span>}</td><td><span className={`payslip-status ${item.status === "Pending" ? "payslip-status-pending" : ""}`}>{item.status}</span></td><td className="payslip-actions-column"><button type="button" className="payslip-action" title={`View ${item.employeeName}`} aria-label={`View ${item.employeeName}`} onClick={() => setModal({ mode: "view", payslip: item })}><Eye size={15} /></button><button type="button" className="payslip-action" title={`Edit ${item.employeeName}`} aria-label={`Edit ${item.employeeName}`} onClick={() => openEdit(item)}><Pencil size={15} /></button><button type="button" className="payslip-action payslip-delete-action" title={`Delete ${item.employeeName}`} aria-label={`Delete ${item.employeeName}`} onClick={() => setModal({ mode: "delete", payslip: item })}><Trash2 size={15} /></button></td></tr>)}</tbody></table></div>
    </main></div>
    {isFormModal && <div className="payslip-modal-overlay" onMouseDown={closeModal}><form className="payslip-modal" onSubmit={handleSave} onMouseDown={(event) => event.stopPropagation()}><ModalHeader title={modal.mode === "add" ? "Add Payslip" : "Edit Payslip"} onClose={closeModal} /><div className="payslip-modal-body"><label className="payslip-field"><span>Employee Name <b>*</b></span><input value={form.employeeName} onChange={(event) => updateForm("employeeName", event.target.value)} required autoFocus /></label><label className="payslip-field"><span>Employee ID <b>*</b></span><input value={form.employeeId} onChange={(event) => updateForm("employeeId", event.target.value)} required /></label><label className="payslip-field"><span>Organization <b>*</b></span><select value={form.organization} onChange={(event) => updateForm("organization", event.target.value)} required><option value="" disabled>Select...</option>{organizations.filter((option) => option !== "All").map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label className="payslip-field"><span>Month <b>*</b></span><input value={form.month} onChange={(event) => updateForm("month", event.target.value)} placeholder="e.g. September 2026" required /></label><label className="payslip-field"><span>Status</span><select value={form.status} onChange={(event) => updateForm("status", event.target.value)} required>{STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label className="payslip-field"><span>Payslip File</span>{form.fileData ? <div className="payslip-upload-preview">{form.fileType?.startsWith("image/") ? <img src={form.fileData} alt="Payslip preview" /> : <div className="payslip-upload-file"><FileText size={18} /><span>{form.fileName}</span></div>}<button type="button" className="payslip-upload-remove" onClick={clearFile}><X size={14} />Remove</button></div> : <label className="payslip-upload-dropzone"><Upload size={18} /><span>Click to upload payslip (image or PDF)</span><input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleFileChange} hidden /></label>}</label></div><div className="payslip-modal-actions"><button type="button" className="payslip-cancel-button" onClick={closeModal}>Cancel</button><button type="submit" className="payslip-save-button">{modal.mode === "add" ? "Save Payslip" : "Save Changes"}</button></div></form></div>}
    {modal?.mode === "view" && <div className="payslip-modal-overlay" onMouseDown={closeModal}><section className="payslip-modal payslip-view-modal" onMouseDown={(event) => event.stopPropagation()}><ModalHeader title="Payslip Details" onClose={closeModal} /><div className="payslip-view-body"><div className="payslip-view-row"><Detail label="Employee Name" value={modal.payslip.employeeName} /><Detail label="Employee ID" value={modal.payslip.employeeId} /></div><div className="payslip-view-row"><Detail label="Organization" value={modal.payslip.organization} /><Detail label="Month" value={modal.payslip.month} /></div><Detail label="Status" value={modal.payslip.status} />{modal.payslip.fileData ? <div className="payslip-view-file">{modal.payslip.fileType?.startsWith("image/") ? <img src={modal.payslip.fileData} alt="Payslip" /> : <div className="payslip-upload-file"><FileText size={18} /><span>{modal.payslip.fileName}</span></div>}<button type="button" className="payslip-download-button" onClick={() => downloadFile(modal.payslip)}><Download size={14} />Download</button></div> : <p className="payslip-file-missing">No payslip file uploaded yet.</p>}</div><div className="payslip-modal-actions"><button type="button" className="payslip-save-button" onClick={closeModal}>Close</button></div></section></div>}
    {modal?.mode === "delete" && <div className="payslip-modal-overlay" onMouseDown={closeModal}><section className="payslip-modal payslip-confirm-modal" onMouseDown={(event) => event.stopPropagation()}><ModalHeader title="Delete Payslip" onClose={closeModal} /><div className="payslip-confirm-body">Are you sure you want to delete the payslip for <strong>{modal.payslip.employeeName}</strong> ({modal.payslip.month})? This action cannot be undone.</div><div className="payslip-modal-actions"><button type="button" className="payslip-cancel-button" onClick={closeModal}>Cancel</button><button type="button" className="payslip-delete-button" onClick={confirmDelete}>Delete</button></div></section></div>}
    </div>
  );
}

function ModalHeader({ title, onClose }) { return <div className="payslip-modal-header"><h2>{title}</h2><button type="button" className="payslip-modal-close" onClick={onClose} aria-label="Close"><X size={19} /></button></div>; }
function Detail({ label, value }) { return <div><span>{label}</span><strong>{value || "—"}</strong></div>; }