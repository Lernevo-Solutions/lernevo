import React, { useMemo, useRef, useState } from "react";
import { Download, Eye, FileText, Files, Lock, Search, ShieldCheck, Trash2, Upload, X } from "lucide-react";
import Sidebar from "./Sidebar";
import "./Payslip.css";

const STATUS_OPTIONS = ["Paid", "Pending"];

const EMPTY_FORM = { employeeName: "", employeeId: "", month: "", status: "Paid", fileName: "", fileData: "", fileType: "" };

const INITIAL_PAYSLIPS = [
  { id: 1, employeeName: "Arun Kumar", employeeId: "EMP1001", month: "August 2026", uploadedOn: "12 Sep 2026", status: "Paid", fileName: "", fileData: "", fileType: "" },
  { id: 2, employeeName: "Priya S", employeeId: "EMP1002", month: "August 2026", uploadedOn: "15 Sep 2026", status: "Paid", fileName: "", fileData: "", fileType: "" },
  { id: 3, employeeName: "Karthik R", employeeId: "EMP1003", month: "August 2026", uploadedOn: "18 Sep 2026", status: "Pending", fileName: "", fileData: "", fileType: "" },
];

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

const guessNameFromFile = (fileName) =>
  fileName.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

export default function Payslip() {
  const [payslips, setPayslips] = useState(INITIAL_PAYSLIPS);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [bulkMonth, setBulkMonth] = useState("");
  const [bulkStatus, setBulkStatus] = useState("Paid");
  const [bulkRows, setBulkRows] = useState([]);
  const [isBulkDragging, setIsBulkDragging] = useState(false);

  const searchResults = useMemo(() => {
    const term = activeQuery.trim().toLowerCase();
    if (!term) return [];
    return payslips.filter((item) =>
      `${item.employeeName} ${item.employeeId} ${item.month} ${item.status}`.toLowerCase().includes(term)
    );
  }, [payslips, activeQuery]);

  const runSearch = () => { setActiveQuery(query); setHasSearched(true); };
  const clearSearch = () => { setQuery(""); setActiveQuery(""); setHasSearched(false); };
  const closeModal = () => { setModal(null); setForm(EMPTY_FORM); setBulkMonth(""); setBulkStatus("Paid"); setBulkRows([]); };
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const canSaveBulk = bulkMonth.trim().length > 0 && bulkRows.length > 0 &&
    bulkRows.every((row) => row.employeeName.trim() && row.employeeId.trim());

  const ingestFile = async (file) => {
    if (!file) return;
    const fileData = await readFileAsDataUrl(file);
    setForm((current) => ({ ...current, fileName: file.name, fileData, fileType: file.type }));
  };
  const handleFileChange = (event) => ingestFile(event.target.files?.[0]);
  const clearFile = () => { setForm((current) => ({ ...current, fileName: "", fileData: "", fileType: "" })); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    ingestFile(event.dataTransfer.files?.[0]);
  };

  const ingestBulkFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const newRows = await Promise.all(files.map(async (file) => ({
      rowId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fileName: file.name,
      fileData: await readFileAsDataUrl(file),
      fileType: file.type,
      employeeName: guessNameFromFile(file.name),
      employeeId: "",
    })));
    setBulkRows((current) => [...current, ...newRows]);
  };
  const handleBulkFileChange = (event) => { ingestBulkFiles(event.target.files); event.target.value = ""; };
  const handleBulkDrop = (event) => {
    event.preventDefault();
    setIsBulkDragging(false);
    ingestBulkFiles(event.dataTransfer.files);
  };
  const updateBulkRow = (rowId, field, value) =>
    setBulkRows((current) => current.map((row) => (row.rowId === rowId ? { ...row, [field]: value } : row)));
  const removeBulkRow = (rowId) => setBulkRows((current) => current.filter((row) => row.rowId !== rowId));

  const handleSave = (event) => {
    event.preventDefault();
    if (!form.employeeName.trim() || !form.employeeId.trim() || !form.month.trim() || !form.fileData) return;
    const record = {
      ...form,
      employeeName: form.employeeName.trim(),
      employeeId: form.employeeId.trim(),
      month: form.month.trim(),
      uploadedOn: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    };
    setPayslips((current) => [...current, { ...record, id: Date.now() }]);
    closeModal();
  };

  const handleBulkSave = (event) => {
    event.preventDefault();
    if (!canSaveBulk) return;
    const uploadedOn = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const month = bulkMonth.trim();
    const newRecords = bulkRows.map((row, index) => ({
      id: Date.now() + index,
      employeeName: row.employeeName.trim(),
      employeeId: row.employeeId.trim(),
      month,
      uploadedOn,
      status: bulkStatus,
      fileName: row.fileName,
      fileData: row.fileData,
      fileType: row.fileType,
    }));
    setPayslips((current) => [...current, ...newRecords]);
    closeModal();
  };

  const confirmDelete = () => {
    const id = modal.payslip.id;
    setPayslips((current) => current.filter((item) => item.id !== id));
    closeModal();
  };

  const downloadFile = (item) => {
    if (!item.fileData) return;
    const link = window.document.createElement("a");
    link.href = item.fileData;
    link.download = item.fileName || `payslip-${item.employeeId}`;
    link.click();
  };

  return (
    <div className="compliance-layout"><Sidebar /><div className="compliance-content-scroll"><main className="compliance-page">
      <header className="compliance-header">
        <div className="compliance-header-left">
          <div className="compliance-icon-box" aria-hidden="true"><FileText /></div>
          <div><h1>Payslip</h1><p>Search and upload employee payslips securely.</p></div>
        </div>
        <span className="compliance-secure-badge"><Lock size={14} />Secure workspace</span>
      </header>

      <section className="compliance-search-row" aria-label="Search payslips">
        <div className="compliance-search">
          <Search aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && runSearch()}
            type="search"
            placeholder="Search payslips..."
            aria-label="Search payslips"
          />
          {query && <button type="button" className="compliance-search-clear" onClick={clearSearch} aria-label="Clear search"><X size={15} /></button>}
        </div>
        <button type="button" className="compliance-search-button" onClick={runSearch}><Search size={15} />Search</button>
      </section>

      <div
        className={`compliance-upload-dropzone ${isDragging ? "compliance-upload-dropzone-active" : ""}`}
        onClick={() => setModal({ mode: "add" })}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => { setModal({ mode: "add" }); handleDrop(event); }}
      >
        <div className="compliance-upload-icon"><Upload size={22} /></div>
        <span className="compliance-upload-eyebrow">Secure payslip upload</span>
        <h2>Upload Payslip</h2>
        <p>Drag and drop your file here or click to browse</p>
        <button type="button" className="compliance-choose-button" onClick={(event) => { event.stopPropagation(); setModal({ mode: "add" }); }}>
          <Upload size={16} />Choose File
        </button>
        <span className="compliance-upload-hint">Supports PDF, JPG, PNG (Max 10MB)</span>
      </div>

      <button type="button" className="compliance-bulk-link" onClick={() => setModal({ mode: "bulk" })}>
        <Files size={14} />Bulk upload multiple payslips
      </button>

      {!hasSearched && <p className="compliance-search-hint">  </p>}

      {hasSearched && (
        <div className="compliance-table-wrap">
          <table className="compliance-table">
            <thead><tr><th>Employee</th><th>Month</th><th>Uploaded On</th><th>Status</th><th className="compliance-actions-column">Actions</th></tr></thead>
            <tbody>
              {searchResults.length === 0 ? (
                <tr><td colSpan={5} className="compliance-empty">No payslips found for "{activeQuery}".</td></tr>
              ) : searchResults.map((item) => (
                <tr key={item.id}>
                  <td><div className="compliance-employee-cell"><span className="compliance-employee-name">{item.employeeName}</span><span className="compliance-employee-id">{item.employeeId}</span></div></td>
                  <td className="compliance-muted-cell">{item.month}</td>
                  <td className="compliance-muted-cell">{item.uploadedOn}</td>
                  <td><span className={`compliance-status ${item.status === "Pending" ? "compliance-status-pending" : ""}`}>{item.status}</span></td>
                  <td className="compliance-actions-column">
                    <button type="button" className="compliance-action" title={`View ${item.employeeName}`} aria-label={`View ${item.employeeName}`} onClick={() => setModal({ mode: "view", payslip: item })}><Eye size={15} /></button>
                    <button type="button" className="compliance-action" title={`Download ${item.employeeName}`} aria-label={`Download ${item.employeeName}`} onClick={() => downloadFile(item)}><Download size={15} /></button>
                    <button type="button" className="compliance-action compliance-delete-action" title={`Delete ${item.employeeName}`} aria-label={`Delete ${item.employeeName}`} onClick={() => setModal({ mode: "delete", payslip: item })}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main></div>

    {modal?.mode === "add" && (
      <div className="compliance-modal-overlay" onMouseDown={closeModal}>
        <form className="compliance-modal" onSubmit={handleSave} onMouseDown={(event) => event.stopPropagation()}>
          <ModalHeader title="Upload Payslip" onClose={closeModal} />
          <div className="compliance-modal-body">
            <label className="compliance-field"><span>Employee Name <b>*</b></span><input value={form.employeeName} onChange={(event) => updateForm("employeeName", event.target.value)} required autoFocus /></label>
            <label className="compliance-field"><span>Employee ID <b>*</b></span><input value={form.employeeId} onChange={(event) => updateForm("employeeId", event.target.value)} required /></label>
            <label className="compliance-field"><span>Month <b>*</b></span><input value={form.month} onChange={(event) => updateForm("month", event.target.value)} placeholder="e.g. September 2026" required /></label>
            <label className="compliance-field"><span>Status</span><select value={form.status} onChange={(event) => updateForm("status", event.target.value)}>{STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
            <label className="compliance-field"><span>File <b>*</b></span>
              {form.fileData ? (
                <div className="compliance-upload-preview">
                  {form.fileType?.startsWith("image/") ? <img src={form.fileData} alt="Document preview" /> : <div className="compliance-upload-file"><FileText size={18} /><span>{form.fileName}</span></div>}
                  <button type="button" className="compliance-upload-remove" onClick={clearFile}><X size={14} />Remove</button>
                </div>
              ) : (
                <label className="compliance-inline-dropzone">
                  <Upload size={18} /><span>Click to upload (image or PDF)</span>
                  <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleFileChange} hidden />
                </label>
              )}
            </label>
          </div>
          <div className="compliance-modal-actions">
            <button type="button" className="compliance-cancel-button" onClick={closeModal}>Cancel</button>
            <button type="submit" className="compliance-save-button">Save Payslip</button>
          </div>
        </form>
      </div>
    )}

    {modal?.mode === "bulk" && (
      <div className="compliance-modal-overlay" onMouseDown={closeModal}>
        <form className="compliance-modal compliance-bulk-modal" onSubmit={handleBulkSave} onMouseDown={(event) => event.stopPropagation()}>
          <ModalHeader title="Bulk Upload Payslips" onClose={closeModal} />
          <div className="compliance-modal-body">
            <div className="compliance-bulk-common-row">
              <label className="compliance-field"><span>Month <b>*</b></span><input value={bulkMonth} onChange={(event) => setBulkMonth(event.target.value)} placeholder="e.g. September 2026" autoFocus /></label>
              <label className="compliance-field"><span>Status</span><select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)}>{STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
            </div>
            <label className="compliance-field"><span>Files <b>*</b></span>
              <label
                className={`compliance-inline-dropzone ${isBulkDragging ? "compliance-inline-dropzone-active" : ""}`}
                onDragOver={(event) => { event.preventDefault(); setIsBulkDragging(true); }}
                onDragLeave={() => setIsBulkDragging(false)}
                onDrop={handleBulkDrop}
              >
                <Upload size={18} /><span>Click or drop multiple files (image or PDF)</span>
                <input type="file" accept="image/*,application/pdf" multiple onChange={handleBulkFileChange} hidden />
              </label>
            </label>
            {bulkRows.length > 0 && (
              <div className="compliance-bulk-list">
                {bulkRows.map((row) => (
                  <div className="compliance-bulk-row" key={row.rowId}>
                    <div className="compliance-bulk-row-file">
                      {row.fileType?.startsWith("image/") ? <img src={row.fileData} alt="" /> : <FileText size={16} />}
                      <span className="compliance-bulk-row-filename" title={row.fileName}>{row.fileName}</span>
                    </div>
                    <div className="compliance-bulk-row-fields">
                      <input value={row.employeeName} onChange={(event) => updateBulkRow(row.rowId, "employeeName", event.target.value)} placeholder="Employee name" aria-label={`Employee name for ${row.fileName}`} />
                      <input value={row.employeeId} onChange={(event) => updateBulkRow(row.rowId, "employeeId", event.target.value)} placeholder="Employee ID" aria-label={`Employee ID for ${row.fileName}`} />
                    </div>
                    <button type="button" className="compliance-bulk-remove" onClick={() => removeBulkRow(row.rowId)} aria-label={`Remove ${row.fileName}`}><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="compliance-modal-actions">
            {bulkRows.length > 0 && <span className="compliance-bulk-count">{bulkRows.length} file{bulkRows.length > 1 ? "s" : ""} ready</span>}
            <button type="button" className="compliance-cancel-button" onClick={closeModal}>Cancel</button>
            <button type="submit" className="compliance-save-button" disabled={!canSaveBulk}>Save All</button>
          </div>
        </form>
      </div>
    )}

    {modal?.mode === "view" && (
      <div className="compliance-modal-overlay" onMouseDown={closeModal}>
        <section className="compliance-modal" onMouseDown={(event) => event.stopPropagation()}>
          <ModalHeader title="Payslip Details" onClose={closeModal} />
          <div className="compliance-view-body">
            <div className="compliance-view-row"><Detail label="Employee Name" value={modal.payslip.employeeName} /><Detail label="Employee ID" value={modal.payslip.employeeId} /></div>
            <div className="compliance-view-row"><Detail label="Month" value={modal.payslip.month} /><Detail label="Uploaded On" value={modal.payslip.uploadedOn} /></div>
            <Detail label="Status" value={modal.payslip.status} />
            {modal.payslip.fileData ? (
              <div className="compliance-view-file">
                {modal.payslip.fileType?.startsWith("image/") ? <img src={modal.payslip.fileData} alt="Payslip" /> : <div className="compliance-upload-file"><FileText size={18} /><span>{modal.payslip.fileName}</span></div>}
                <button type="button" className="compliance-download-button" onClick={() => downloadFile(modal.payslip)}><Download size={14} />Download</button>
              </div>
            ) : <p className="compliance-file-missing">No file uploaded yet.</p>}
          </div>
          <div className="compliance-modal-actions"><button type="button" className="compliance-save-button" onClick={closeModal}>Close</button></div>
        </section>
      </div>
    )}

    {modal?.mode === "delete" && (
      <div className="compliance-modal-overlay" onMouseDown={closeModal}>
        <section className="compliance-modal compliance-confirm-modal" onMouseDown={(event) => event.stopPropagation()}>
          <ModalHeader title="Delete Payslip" onClose={closeModal} />
          <div className="compliance-confirm-body">Are you sure you want to delete the <strong>{modal.payslip.month}</strong> payslip for <strong>{modal.payslip.employeeName}</strong>? This action cannot be undone.</div>
          <div className="compliance-modal-actions">
            <button type="button" className="compliance-cancel-button" onClick={closeModal}>Cancel</button>
            <button type="button" className="compliance-delete-button" onClick={confirmDelete}>Delete</button>
          </div>
        </section>
      </div>
    )}
    </div>
  );
}

function ModalHeader({ title, onClose }) {
  return <div className="compliance-modal-header"><h2>{title}</h2><button type="button" className="compliance-modal-close" onClick={onClose} aria-label="Close"><X size={19} /></button></div>;
}
function Detail({ label, value }) {
  return <div><span>{label}</span><strong>{value || "—"}</strong></div>;
}