import React, { useMemo, useState } from "react";
import "./Document.css";

/**
 * ComplianceDocuments
 * -----------------------------------------------------------------------
 * Tracks employee compliance documents (contracts, ID proofs,
 * certifications, tax forms, insurance). Clicking a File Name opens a
 * preview modal showing the document's contents.
 *
 * In this demo, `fileUrl` is empty (no real file storage wired up), so
 * the preview modal renders a realistic placeholder built from the
 * document's type. Once you connect real file storage, just set
 * `fileUrl` on each record — the modal automatically switches to an
 * embedded <iframe>/<img> preview when a URL is present (see
 * renderPreviewBody below), no other changes needed.
 */

const DOC_TYPES = ["Contract", "ID Proof", "Certification", "Tax Form", "Insurance"];
const STATUSES = ["Valid", "Pending Review", "Expired"];

const INITIAL_DOCS = [
  {
    id: "d1",
    employee: "Arav Kumar",
    docType: "Contract",
    fileName: "arav_contract_2026.pdf",
    expiryDate: "2027-01-15",
    status: "Valid",
    fileUrl: "",
  },
  {
    id: "d2",
    employee: "Priya Sharma",
    docType: "ID Proof",
    fileName: "priya_id.pdf",
    expiryDate: "2026-11-01",
    status: "Valid",
    fileUrl: "",
  },
  {
    id: "d3",
    employee: "Meera Iyer",
    docType: "Certification",
    fileName: "meera_cert.pdf",
    expiryDate: "2026-09-20",
    status: "Pending Review",
    fileUrl: "",
  },
  {
    id: "d4",
    employee: "Rohan Das",
    docType: "Tax Form",
    fileName: "rohan_w9.pdf",
    expiryDate: "2026-08-30",
    status: "Expired",
    fileUrl: "",
  },
  {
    id: "d5",
    employee: "Sara Khan",
    docType: "Insurance",
    fileName: "sara_insurance.pdf",
    expiryDate: "2027-03-01",
    status: "Valid",
    fileUrl: "",
  },
];

const EMPTY_FORM = {
  employee: "",
  docType: "Contract",
  fileName: "",
  fileUrl: "",
  expiryDate: "",
  status: "Pending Review",
};

// Placeholder body content per document type, shown inside the preview
// modal when no real fileUrl is attached yet.
const MOCK_CONTENT = {
  Contract: [
    "EMPLOYMENT AGREEMENT",
    "This contract outlines the terms of employment, including role, compensation, working hours, and termination conditions.",
    "Section 1 — Position & Duties",
    "Section 2 — Compensation & Benefits",
    "Section 3 — Confidentiality & IP Assignment",
    "Section 4 — Termination & Notice Period",
  ],
  "ID Proof": [
    "GOVERNMENT-ISSUED IDENTIFICATION",
    "Type: National ID / Passport",
    "This document verifies the employee's identity on file with HR.",
    "Issue Date: —      Expiry Date: shown in the table",
  ],
  Certification: [
    "PROFESSIONAL CERTIFICATION",
    "This certifies that the employee has completed the required training/certification program.",
    "Issuing Body: —",
    "Renewal is required before the expiry date to remain compliant.",
  ],
  "Tax Form": [
    "TAX DOCUMENTATION",
    "Form type: W-9 / equivalent regional tax declaration.",
    "Used for payroll tax reporting and compliance recordkeeping.",
    "Must be re-filed if employment details change.",
  ],
  Insurance: [
    "INSURANCE POLICY DOCUMENT",
    "Covers: Health / Accident / Group insurance as applicable to the employee.",
    "Policy remains active until the expiry date shown in the table.",
  ],
};

function statusClass(status) {
  const map = { Valid: "valid", "Pending Review": "pending", Expired: "expired" };
  return `cd-status-pill cd-status-${map[status] || "pending"}`;
}

let nextId = 100;
function makeId() {
  nextId += 1;
  return `d${nextId}`;
}

export default function ComplianceDocuments() {
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | "preview" | "delete"
  const [activeDoc, setActiveDoc] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const rows = useMemo(() => {
    return docs.filter((d) => {
      const matchesSearch =
        d.employee.toLowerCase().includes(search.toLowerCase()) ||
        d.fileName.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || d.docType === typeFilter;
      const matchesStatus = statusFilter === "All" || d.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [docs, search, typeFilter, statusFilter]);

  function closeModal() {
    setModalMode(null);
    setActiveDoc(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError("");
    setActiveDoc(null);
    setModalMode("add");
  }

  function openEdit(doc) {
    setForm({
      employee: doc.employee,
      docType: doc.docType,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl || "",
      expiryDate: doc.expiryDate,
      status: doc.status,
    });
    setActiveDoc(doc);
    setFormError("");
    setModalMode("edit");
  }

  function openPreview(doc) {
    setActiveDoc(doc);
    setModalMode("preview");
  }

  function openDelete(doc) {
    setActiveDoc(doc);
    setModalMode("delete");
  }

  function handleFormChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Free the previously-selected blob (if any) before creating a new one.
    if (form.fileUrl && form.fileUrl.startsWith("blob:")) {
      URL.revokeObjectURL(form.fileUrl);
    }
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, fileName: file.name, fileUrl: url }));
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!form.employee.trim() || !form.fileName.trim() || !form.expiryDate) {
      setFormError("Please fill employee, upload a file, and set an expiry date.");
      return;
    }
    if (modalMode === "add") {
      const record = { id: makeId(), fileUrl: "", ...form, employee: form.employee.trim(), fileName: form.fileName.trim() };
      setDocs((prev) => [record, ...prev]);
    } else if (modalMode === "edit" && activeDoc) {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === activeDoc.id
            ? { ...d, ...form, employee: form.employee.trim(), fileName: form.fileName.trim() }
            : d
        )
      );
    }
    closeModal();
  }

  function confirmDelete() {
    if (activeDoc) {
      if (activeDoc.fileUrl && activeDoc.fileUrl.startsWith("blob:")) {
        URL.revokeObjectURL(activeDoc.fileUrl);
      }
      setDocs((prev) => prev.filter((d) => d.id !== activeDoc.id));
    }
    closeModal();
  }

  function renderPreviewBody(doc) {
    const ext = doc.fileName.split(".").pop().toLowerCase();
    if (doc.fileUrl) {
      if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
        return <img src={doc.fileUrl} alt={doc.fileName} className="cd-preview-img" />;
      }
      return <iframe src={doc.fileUrl} title={doc.fileName} className="cd-preview-frame" />;
    }
    const lines = MOCK_CONTENT[doc.docType] || ["No preview available for this document type."];
    return (
      <div className="cd-preview-mock">
        <div className="cd-preview-mock-badge">No file uploaded yet — showing a sample preview</div>
        <div className="cd-preview-page">
          {lines.map((line, i) => (
            <p key={i} className={i === 0 ? "cd-preview-heading" : ""}>{line}</p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cd-page">
      {/* Header */}
      <div className="cd-header">
        <div className="cd-header-left">
          <div className="cd-icon" aria-hidden="true">📄</div>
          <div>
            <h1>Compliance Documents</h1>
            <p>Track employee compliance and certifications.</p>
          </div>
        </div>
        <button className="cd-add-btn" type="button" onClick={openAdd}>
          <span aria-hidden="true">＋</span> Add Document
        </button>
      </div>

      {/* Toolbar */}
      <div className="cd-toolbar">
        <div className="cd-search">
          <span className="cd-search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="cd-filters">
          <div className="cd-filter">
            <label htmlFor="typeSelect">Type:</label>
            <select id="typeSelect" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="All">All</option>
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="cd-filter">
            <label htmlFor="statusSelect">Status:</label>
            <select id="statusSelect" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="cd-table-wrap">
        <table className="cd-table">
          <thead>
            <tr>
              <th className="cd-checkbox-col"><input type="checkbox" aria-label="Select all" /></th>
              <th>Employee</th>
              <th>Document Type</th>
              <th>File Name</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th className="cd-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id}>
                <td><input type="checkbox" aria-label={`Select ${d.employee}`} /></td>
                <td className="cd-name-cell">{d.employee}</td>
                <td className="cd-dim-cell">{d.docType}</td>
                <td>
                  <button
                    type="button"
                    className="cd-file-link"
                    onClick={() => openPreview(d)}
                    title="Open document preview"
                  >
                    {d.fileName}
                  </button>
                </td>
                <td className="cd-dim-cell">{d.expiryDate}</td>
                <td><span className={statusClass(d.status)}>{d.status}</span></td>
                <td className="cd-actions-col">
                  <button className="cd-icon-btn" title="View" type="button" onClick={() => openPreview(d)}>👁</button>
                  <button className="cd-icon-btn" title="Edit" type="button" onClick={() => openEdit(d)}>✏️</button>
                  <button className="cd-icon-btn" title="Delete" type="button" onClick={() => openDelete(d)}>🗑</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="cd-empty">No documents match this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="cd-footer">
        <span>Showing 1–{rows.length} of {rows.length}</span>
        <div className="cd-pagination">
          <button type="button" disabled>‹ Prev</button>
          <span>Page 1 / 1</span>
          <button type="button" disabled>Next ›</button>
        </div>
      </div>

      {/* Preview modal — opens when a File Name is clicked */}
      {modalMode === "preview" && activeDoc && (
        <div className="cd-modal-backdrop" onClick={closeModal}>
          <div className="cd-modal cd-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="cd-modal-header">
              <div>
                <h2>{activeDoc.fileName}</h2>
                <p className="cd-modal-subtitle">
                  {activeDoc.employee} · {activeDoc.docType} · Expires {activeDoc.expiryDate}
                </p>
              </div>
              <button className="cd-icon-btn" type="button" onClick={closeModal} aria-label="Close">✕</button>
            </div>

            <div className="cd-preview-body">{renderPreviewBody(activeDoc)}</div>

            <div className="cd-form-actions">
              <span className={statusClass(activeDoc.status)}>{activeDoc.status}</span>
              <div className="cd-form-actions-right">
                <button type="button" className="cd-btn-secondary" onClick={closeModal}>Close</button>
                <a
                  className="cd-btn-primary"
                  href={activeDoc.fileUrl || "#"}
                  onClick={(e) => { if (!activeDoc.fileUrl) e.preventDefault(); }}
                  download={activeDoc.fileName}
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {(modalMode === "add" || modalMode === "edit") && (
        <div className="cd-modal-backdrop" onClick={closeModal}>
          <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cd-modal-header">
              <h2>{modalMode === "add" ? "Add Document" : "Edit Document"}</h2>
              <button className="cd-icon-btn" type="button" onClick={closeModal} aria-label="Close">✕</button>
            </div>
            <form className="cd-form" onSubmit={handleFormSubmit}>
              <label>
                Employee
                <input
                  type="text"
                  value={form.employee}
                  onChange={(e) => handleFormChange("employee", e.target.value)}
                  placeholder="e.g. Arav Kumar"
                />
              </label>

              <div className="cd-form-row">
                <label>
                  Document Type
                  <select value={form.docType} onChange={(e) => handleFormChange("docType", e.target.value)}>
                    {DOC_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select value={form.status} onChange={(e) => handleFormChange("status", e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Upload File
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileSelect}
                />
              </label>
              {form.fileName && (
                <p className="cd-file-chosen">
                  Selected: <strong>{form.fileName}</strong>
                  {form.fileUrl && " — will open in the preview & Download for real"}
                </p>
              )}

              <label>
                Expiry Date
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => handleFormChange("expiryDate", e.target.value)}
                />
              </label>

              {formError && <p className="cd-form-error">{formError}</p>}

              <div className="cd-form-actions">
                <button type="button" className="cd-btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="cd-btn-primary">
                  {modalMode === "add" ? "Add Document" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {modalMode === "delete" && activeDoc && (
        <div className="cd-modal-backdrop" onClick={closeModal}>
          <div className="cd-modal cd-modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="cd-modal-header">
              <h2>Delete Document</h2>
              <button className="cd-icon-btn" type="button" onClick={closeModal} aria-label="Close">✕</button>
            </div>
            <p className="cd-delete-text">
              Delete "{activeDoc.fileName}" for {activeDoc.employee}? This can't be undone.
            </p>
            <div className="cd-form-actions">
              <button type="button" className="cd-btn-secondary" onClick={closeModal}>Cancel</button>
              <button type="button" className="cd-btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}