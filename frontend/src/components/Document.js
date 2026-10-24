import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, FileText, UploadCloud, FileImage, File, Download, Eye, ArrowLeft, CheckCircle2, AlertCircle, Trash2, FolderOpen, Plus, CalendarDays, Users } from "lucide-react";
import "./Document.css";

const EMPLOYEES = [
  { id: "EMP001", name: "Arun Kumar", email: "arun.emp001@company.com", team: "Engineering" },
  { id: "EMP002", name: "Priya Sharma", email: "priya.emp002@company.com", team: "People Operations" },
  { id: "EMP003", name: "Rahul Dev", email: "rahul.emp003@company.com", team: "Finance" },
];
const TYPES = ["Medical Certificate", "Doctor Certificate", "Prescription", "Payslip", "Government ID", "Address Proof", "Educational Certificate", "Experience Letter", "Offer Letter", "Employment Contract", "Insurance Document", "Other"];
const KEY = "lernevo-compliance-documents-v1";
const seed = [
  ["EMP001", "Medical Certificate", "medical-certificate.pdf", "2026-10-20"],
  ["EMP001", "Payslip", "October-payslip.pdf", "2026-10-18"],
  ["EMP001", "Address Proof", "address-proof.jpg", "2026-10-12"],
  ["EMP002", "Doctor Certificate", "doctor-certificate.pdf", "2026-10-17"],
  ["EMP002", "Government ID", "government-id.png", "2026-10-08"],
  ["EMP003", "Experience Letter", "experience-letter.pdf", "2026-10-10"],
].map(([employeeId, type, name, date], i) => ({ id: `sample-${i}`, refNumber: `DOC-${1001 + i}`, employeeId, type, name, date, dataUrl: "", size: 0 }));
const loadDocs = () => {
  try { const saved = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(saved) ? saved : seed; }
  catch { return seed; }
};
const initials = (name) => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const formatSize = (bytes = 0) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

function useDocuments() {
  const [docs, setDocs] = useState(loadDocs);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(docs)); } catch { /* Keep the current session usable if browser storage is full. */ } }, [docs]);
  return [docs, setDocs];
}

function DocumentCards({ documents, onView }) {
  if (!documents.length) return <div className="cd-empty cd-empty-docs"><span className="cd-empty-icon"><FileText size={25}/></span><h3>No documents uploaded yet</h3><p>Upload your first document using the form above.</p></div>;
  return <div className="cd-grid">{documents.map((doc) => <article className="cd-doc-card" key={doc.id}>
    <div className={`cd-file-icon ${doc.name.toLowerCase().endsWith(".pdf") ? "is-pdf" : "is-image"}`}>{doc.name.toLowerCase().endsWith(".pdf") ? <FileText size={22}/> : <FileImage size={22}/>}</div>
    <div className="cd-doc-meta"><span className="cd-type">{doc.type}</span><strong title={doc.name}>{doc.name}</strong><small>Uploaded {formatDate(doc.date)}{doc.refNumber ? ` · Ref ${doc.refNumber}` : ""}</small></div>
    <div className="cd-card-actions"><button className="cd-button cd-button-light" onClick={() => onView(doc)}><Eye size={16}/> View</button>{doc.dataUrl && <a className="cd-icon-button" href={doc.dataUrl} download={doc.name} aria-label={`Download ${doc.name}`}><Download size={17}/></a>}</div>
  </article>)}</div>;
}

function Preview({ doc, close }) {
  useEffect(() => { const key = (event) => event.key === "Escape" && close(); window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key); }, [close]);
  if (!doc) return null;
  const isImage = /\.(jpe?g|png)$/i.test(doc.name);
  const isPdf = /\.pdf$/i.test(doc.name);
  return <div className="cd-overlay" onMouseDown={(event) => event.target === event.currentTarget && close()}><section className="cd-preview" role="dialog" aria-modal="true" aria-label="Document preview">
    <header><div><h2>{doc.type}</h2><p>{doc.name} · Uploaded {formatDate(doc.date)}</p></div><button className="cd-icon-button" onClick={close} aria-label="Close preview"><X size={20}/></button></header>
    <div className="cd-preview-body">{doc.dataUrl && isImage ? <img src={doc.dataUrl} alt={doc.name}/> : doc.dataUrl && isPdf ? <iframe title={`Preview of ${doc.name}`} src={doc.dataUrl}/> : <div className="cd-no-preview"><File size={36}/><strong>Preview unavailable</strong><span>{doc.dataUrl ? "This file type cannot be previewed here." : "Sample file only. Upload a real file to enable preview and download."}</span></div>}</div>
    <footer>{doc.dataUrl && <a className="cd-button cd-button-primary" href={doc.dataUrl} download={doc.name}><Download size={16}/> Download</a>}<button className="cd-button cd-button-light" onClick={close}>Close</button></footer>
  </section></div>;
}

function AdminUploadModal({ employees, onClose, onUpload }) {
  const [employeeName, setEmployeeName] = useState("");
  const [type, setType] = useState("");
  const [customType, setCustomType] = useState("");
  const [addingType, setAddingType] = useState(false);
  const [newType, setNewType] = useState("");
  const [types, setTypes] = useState(TYPES.filter((item) => item !== "Other"));
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const employee = employees.find((item) => item.name.toLowerCase() === employeeName.trim().toLowerCase());
  const validateFile = (candidate) => {
    if (!candidate) return;
    if (!/\.(pdf|jpe?g|png)$/i.test(candidate.name)) { setError("Choose a PDF, JPG, JPEG, or PNG file."); return; }
    if (candidate.size > 10 * 1024 * 1024) { setError("File size must be 10 MB or less."); return; }
    setError(""); setFile(candidate);
  };
  const addType = () => {
    const value = newType.trim();
    if (!value) { setError("Enter a document type first."); return; }
    if (!types.some((item) => item.toLowerCase() === value.toLowerCase())) setTypes((items) => [...items, value]);
    setType(value); setNewType(""); setAddingType(false); setError("");
  };
  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (!employeeName.trim()) { setError("Enter an employee name."); return; }
    if (!type) { setError("Select or add a document type."); return; }
    if (type === "Other" && !customType.trim()) { setError("Enter a custom document type."); return; }
    if (!file) { setError("Choose a file to upload."); return; }
    const dataUrl = await new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => resolve(""); reader.readAsDataURL(file); });
    onUpload({ id: `admin-upload-${Date.now()}`, refNumber: `DOC-${Date.now().toString().slice(-6)}`, employeeId: employee?.id || "", type: type === "Other" ? customType.trim() : type, name: file.name, date: new Date().toISOString(), dataUrl, size: file.size });
  };
  return <div className="cd-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="cd-upload-modal" role="dialog" aria-modal="true" aria-labelledby="cd-modal-title" onSubmit={submit}>
    <header><div><h2 id="cd-modal-title">Upload employee document</h2><p>Add a document to the selected employee’s records.</p></div><button type="button" className="cd-icon-button" aria-label="Close upload dialog" onClick={onClose}><X size={20}/></button></header>
    <div className="cd-modal-content">
      <label htmlFor="cd-modal-employee">Employee name <span>*</span></label><input id="cd-modal-employee" value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} placeholder="Enter employee name" required/>
      <div className="cd-modal-employee-fields"><div><label>Employee ID</label><input value={employee?.id || ""} placeholder="Selected employee ID" readOnly/></div><div><label>Team name</label><input value={employee?.team || ""} placeholder="Selected employee team" readOnly/></div></div>
      <div className="cd-modal-type-label"><label htmlFor="cd-modal-type">Document type <span>*</span></label><button type="button" className="cd-add-type" onClick={() => { setAddingType((value) => !value); setError(""); }}><Plus size={14}/> Add type</button></div>
      {addingType && <div className="cd-add-type-row"><input autoFocus value={newType} onChange={(event) => setNewType(event.target.value)} placeholder="New document type"/><button type="button" className="cd-button cd-button-light" onClick={addType}>Add</button></div>}
      <select id="cd-modal-type" value={type} onChange={(event) => setType(event.target.value)}><option value="">Select a document type</option>{types.map((item) => <option key={item}>{item}</option>)}<option value="Other">Other</option></select>
      {type === "Other" && <><label htmlFor="cd-modal-custom-type">Custom document type <span>*</span></label><input id="cd-modal-custom-type" value={customType} onChange={(event) => setCustomType(event.target.value)} placeholder="Enter document type"/></>}
      <label>Upload file <span>*</span></label><div className="cd-dropzone cd-modal-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); validateFile(event.dataTransfer.files[0]); }}>
        <input ref={fileRef} className="cd-file-input" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => validateFile(event.target.files[0])}/>
        {file ? <div className="cd-picked-file"><span className="cd-file-icon is-image"><FileText size={20}/></span><span><strong>{file.name}</strong><small>{formatSize(file.size)}</small></span><button type="button" className="cd-button cd-button-light" onClick={() => fileRef.current?.click()}>Replace</button><button type="button" className="cd-icon-button" aria-label="Remove file" onClick={() => { setFile(null); fileRef.current.value = ""; }}><Trash2 size={16}/></button></div> : <><span className="cd-upload-icon"><UploadCloud size={23}/></span><strong>Drag &amp; drop your file here</strong><small>PDF, JPG, JPEG, PNG · Maximum 10 MB</small><button type="button" className="cd-button cd-button-light" onClick={() => fileRef.current?.click()}>Browse file</button></>}
      </div>
      {error && <p className="cd-message cd-error"><AlertCircle size={15}/>{error}</p>}
    </div>
    <footer><button type="button" className="cd-button cd-button-light" onClick={onClose}>Cancel</button><button type="submit" className="cd-button cd-button-primary"><UploadCloud size={16}/> Upload Document</button></footer>
  </form></div>;
}

export default function SuperAdminDocuments() {
  const [docs, setDocs] = useDocuments();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadNotice, setUploadNotice] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const searchRef = useRef(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const matches = useMemo(() => query.trim() ? EMPLOYEES.filter((person) => {
    const textMatch = `${person.name} ${person.id} ${person.email}`.toLowerCase().includes(query.trim().toLowerCase());
    const employeeDocs = docs.filter((doc) => doc.employeeId === person.id);
    const referenceMatch = employeeDocs.some((doc) => (doc.refNumber || "").toLowerCase().includes(query.trim().toLowerCase()));
    const filterMatch = (!typeFilter || employeeDocs.some((doc) => doc.type === typeFilter)) && (!dateFilter || employeeDocs.some((doc) => doc.date?.slice(0, 10) === dateFilter));
    return (textMatch || referenceMatch) && filterMatch && (!teamFilter || person.team === teamFilter);
  }) : [], [query, docs, typeFilter, teamFilter, dateFilter]);
  const employeeDocs = selected ? docs.filter((doc) => doc.employeeId === selected.id) : [];
  const documents = employeeDocs.filter((doc) => (!typeFilter || doc.type === typeFilter) && (!dateFilter || doc.date?.slice(0, 10) === dateFilter) && (!teamFilter || selected?.team === teamFilter));
  const choose = (person) => { setSelected(person); setQuery(person.name); setSuggestionsOpen(false); };
  const clear = () => { setSelected(null); setQuery(""); setTypeFilter(""); setTeamFilter(""); setDateFilter(""); setSuggestionsOpen(false); };
  const uploadDocument = (document) => { setDocs((previous) => [document, ...previous]); setUploadOpen(false); setUploadNotice("Document uploaded successfully."); setTimeout(() => setUploadNotice(""), 4000); };
  return <div className="cd-page">
    <header className="cd-page-header"><div className="cd-heading-mark"><FileText size={21}/></div><div><h1>Compliance Documents</h1><p>Search for an employee to view uploaded documents or upload a new document.</p></div></header>
    {uploadNotice && <p className="cd-upload-toast"><CheckCircle2 size={16}/>{uploadNotice}</p>}
    <section className="cd-search-panel"><label htmlFor="cd-search">Find employee documents</label><div className="cd-search-row"><div className="cd-search-wrap"><Search size={19}/><input ref={searchRef} id="cd-search" value={query} placeholder="Search by employee name, Employee ID, email or reference number" onFocus={() => setSuggestionsOpen(true)} onChange={(event) => { setQuery(event.target.value); setSelected(null); setSuggestionsOpen(true); }}/>{query && <button className="cd-search-clear" aria-label="Clear search" onClick={clear}><X size={17}/></button>}</div><button className="cd-button cd-button-primary cd-search-submit" onClick={() => { setSuggestionsOpen(true); searchRef.current?.focus(); }}><Search size={16}/> Search</button><button className="cd-button cd-button-light cd-search-reset" onClick={clear}>Clear</button></div>
      <div className="cd-filter-row"><label><span><FileText size={14}/> Document type</span><select value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); if (query.trim()) setSuggestionsOpen(true); }}><option value="">All document types</option>{TYPES.filter((item) => item !== "Other").map((item) => <option key={item}>{item}</option>)}</select></label><label><span><Users size={14}/> Team</span><select value={teamFilter} onChange={(event) => { setTeamFilter(event.target.value); if (query.trim()) setSuggestionsOpen(true); }}><option value="">All teams</option>{[...new Set(EMPLOYEES.map((person) => person.team))].map((item) => <option key={item}>{item}</option>)}</select></label><label><span><CalendarDays size={14}/> Upload date</span><input type="date" value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); if (query.trim()) setSuggestionsOpen(true); }}/></label></div>
      {suggestionsOpen && query.trim() && <div className="cd-suggestions">{matches.length ? matches.map((person) => <button key={person.id} onClick={() => choose(person)}><span className="cd-avatar">{initials(person.name)}</span><span className="cd-suggestion-copy"><strong>{person.name}</strong><small>{person.id} · {person.email} · {person.team}</small></span><span className="cd-suggestion-arrow">↗</span></button>) : <p>No employees match “{query}” and the selected filters.</p>}</div>}
    </section>
    {!selected ? <div className="cd-empty cd-search-empty"><div className="cd-empty-illustration"><span className="cd-empty-main-icon"><FolderOpen size={35}/></span><span className="cd-empty-search-icon"><Search size={19}/></span><span className="cd-empty-file-icon"><FileText size={18}/></span></div><span className="cd-empty-eyebrow">EMPLOYEE DOCUMENTS</span><h2>Find Employee Documents</h2><p>Search by employee name, Employee ID, email or reference number to securely view their submitted documents.</p><span className="cd-empty-divider"><i/> OR <i/></span><button className="cd-button cd-button-primary cd-empty-upload" onClick={() => setUploadOpen(true)}><Plus size={17}/> Upload Document</button><small className="cd-empty-footnote">Add a document directly to an employee’s record.</small></div> : <section className="cd-employee-view">
      <button className="cd-back" onClick={clear}><ArrowLeft size={16}/> Back to search</button>
      <div className="cd-employee-card"><span className="cd-avatar cd-avatar-large">{initials(selected.name)}</span><div><h2>{selected.name}</h2><p>{selected.id} <span>·</span> <a href={`mailto:${selected.email}`}>{selected.email}</a> <span>·</span> {selected.team}</p></div></div>
      <div className="cd-section-title"><div><h2>Uploaded Documents</h2><p>Documents submitted by this employee, organized by document type.</p></div><span className="cd-count">{documents.length} {documents.length === 1 ? "document" : "documents"}</span></div>
      {documents.length ? <DocumentCards documents={documents} onView={setPreview}/> : <div className="cd-empty cd-empty-docs"><span className="cd-empty-icon"><FileText size={25}/></span><h3>No documents uploaded yet</h3><p>This employee has not added any documents.</p></div>}
    </section>}
    {uploadOpen && <AdminUploadModal employees={EMPLOYEES} onClose={() => setUploadOpen(false)} onUpload={uploadDocument}/>}
    <Preview doc={preview} close={() => setPreview(null)}/>
  </div>;
}

export function EmployeeComplianceDocuments() {
  const [docs, setDocs] = useDocuments();
  const employee = EMPLOYEES[0];
  const myDocs = docs.filter((doc) => doc.employeeId === employee.id);
  const [type, setType] = useState("");
  const [customType, setCustomType] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const validateFile = (candidate) => {
    if (!candidate) return;
    if (!/\.(pdf|jpe?g|png)$/i.test(candidate.name)) { setError("Choose a PDF, JPG, JPEG, or PNG file."); return; }
    if (candidate.size > 10 * 1024 * 1024) { setError("File size must be 10 MB or less."); return; }
    setError(""); setFile(candidate);
  };
  const submit = async (event) => {
    event.preventDefault(); setError(""); setNotice("");
    if (!type) { setError("Select a document type."); return; }
    if (type === "Other" && !customType.trim()) { setError("Enter a name for this document type."); return; }
    if (!file) { setError("Choose a file to upload."); return; }
    const dataUrl = await new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => resolve(""); reader.readAsDataURL(file); });
    const uploadId = Date.now();
    const record = { id: `upload-${uploadId}`, refNumber: `DOC-${String(uploadId).slice(-6)}`, employeeId: employee.id, type: type === "Other" ? customType.trim() : type, name: file.name, date: new Date().toISOString(), dataUrl, size: file.size };
    setDocs((previous) => [record, ...previous]); setType(""); setCustomType(""); setFile(null); if (inputRef.current) inputRef.current.value = ""; setNotice("Your document was uploaded successfully.");
  };
  const onDrop = (event) => { event.preventDefault(); setDragging(false); validateFile(event.dataTransfer.files[0]); };
  return <div className="cd-page cd-employee-page">
    <header className="cd-page-header"><div className="cd-heading-mark"><FileText size={21}/></div><div><h1>My Compliance Documents</h1><p>Upload and manage your documents. Keep your information up to date.</p></div></header>
    <form className="cd-upload-panel" onSubmit={submit}>
      <div className="cd-section-title"><div><h2>Upload a document</h2><p>Share a clear, up-to-date copy with your HR team.</p></div><span className="cd-required">* Required</span></div>
      <label htmlFor="cd-type">Document type <span>*</span></label><select id="cd-type" value={type} onChange={(event) => setType(event.target.value)}><option value="">Select a document type</option>{TYPES.map((item) => <option key={item}>{item}</option>)}</select>
      {type === "Other" && <><label htmlFor="cd-custom-type">Custom document type <span>*</span></label><input id="cd-custom-type" value={customType} onChange={(event) => setCustomType(event.target.value)} placeholder="Enter document type"/></>}
      <label>Upload file <span>*</span></label><div className={`cd-dropzone ${dragging ? "is-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
        <input ref={inputRef} className="cd-file-input" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => validateFile(event.target.files[0])}/>
        {file ? <div className="cd-picked-file"><span className="cd-file-icon is-image"><FileText size={21}/></span><span><strong>{file.name}</strong><small>{formatSize(file.size)}</small></span><button type="button" className="cd-button cd-button-light" onClick={() => inputRef.current?.click()}>Replace</button><button type="button" className="cd-icon-button" aria-label="Remove selected file" onClick={() => { setFile(null); inputRef.current.value = ""; }}><Trash2 size={17}/></button></div> : <><span className="cd-upload-icon"><UploadCloud size={25}/></span><strong>Drag &amp; drop your file here</strong><span>or</span><button type="button" className="cd-button cd-button-light" onClick={() => inputRef.current?.click()}>Browse file</button><small>PDF, JPG, JPEG, PNG · Maximum file size 10 MB</small></>}
      </div>
      {error && <p className="cd-message cd-error"><AlertCircle size={16}/>{error}</p>}{notice && <p className="cd-message cd-success"><CheckCircle2 size={16}/>{notice}</p>}
      <div className="cd-upload-footer"><span>Your files are stored in this browser for demo purposes.</span><button className="cd-button cd-button-primary" type="submit"><UploadCloud size={17}/> Upload Document</button></div>
    </form>
    <section className="cd-my-documents"><div className="cd-section-title"><div><h2>My Documents</h2><p>Your documents are organized and ready whenever you need them.</p></div><span className="cd-count">{myDocs.length} {myDocs.length === 1 ? "document" : "documents"}</span></div><DocumentCards documents={myDocs} onView={setPreview}/></section>
    <Preview doc={preview} close={() => setPreview(null)}/>
  </div>;
}
