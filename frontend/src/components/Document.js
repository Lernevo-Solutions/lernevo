import { useEffect, useMemo, useRef, useState } from "react";
import "./Document.css";

/*
  Connecting the backend:
  - Instead of buildSampleDocs(), call your API inside useEffect and then setDocs(data).
  - Add API calls in addDoc / updateStatus / saveDoc / deleteDoc.
  - fileUrl = URL of the file the employee uploaded.
    Set "Content-Disposition: inline" on the server so the file opens in the browser.
  - To keep popups/viewer from covering your app header & sidebar, change
    --sad-app-header-h and --sad-app-sidebar-w at the top of the CSS.
  Doc format:
  { id, empId, name, email, team, docType, fileName, fileUrl, uploadedOn, status, remarks, rejectReason,
    history: [{ text, note?, at }] }
*/

const DOC_TYPES = [
  "Medical Certificate (Doctor)",
  "Prescription",
  "Hospital Discharge Summary",
  "Lab / Medical Report",
  "Fitness Certificate",
  "Leave Application Form",
  "ID Proof",
  "Address Proof",
  "Other",
];

const DOC_ICONS = {
  "Medical Certificate (Doctor)": "🩺",
  Prescription: "💊",
  "Hospital Discharge Summary": "🏥",
  "Lab / Medical Report": "🧪",
  "Fitness Certificate": "💪",
  "Leave Application Form": "📝",
  "ID Proof": "🪪",
  "Address Proof": "🏠",
  Other: "📄",
};

const DEFAULT_TEAMS = ["Engineering", "Finance", "HR", "Marketing", "Operations", "Sales"];
const STATUSES = ["Pending", "Approved", "Rejected"];
const ALL_TEAMS = "All";
const PAGE_SIZE = 8;

const AVATAR_COLORS = [
  ["#f3f6c9", "#5b6200"],
  ["#fbd5e3", "#8a1d4a"],
  ["#dcdcfb", "#2f2f9e"],
  ["#d6e6fd", "#1a4a94"],
  ["#cff7f1", "#0c6b62"],
  ["#d4f5dd", "#1b6b3a"],
  ["#ffe8c7", "#8a5200"],
];

/* ---------------------------------- helpers ---------------------------------- */

const initials = (name) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

const avatarStyle = (key) => {
  const sum = [...key].reduce((a, c) => a + c.charCodeAt(0), 0);
  const [bg, fg] = AVATAR_COLORS[sum % AVATAR_COLORS.length];
  return { background: bg, color: fg };
};

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

const daysSince = (iso) =>
  iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)) : 0;

const stamp = (text, note = "") => ({ text, note, at: new Date().toISOString() });

const formatStamp = (iso = "") =>
  iso.includes("T")
    ? `${formatDate(iso)}, ${new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
    : formatDate(iso);

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const REMARK_PRESETS = [
  "Verified with hospital",
  "Verified with employee",
  "Original copy required",
  "Follow up with HR",
];

const fileKind = (fileName = "") => {
  const ext = fileName.split(".").pop().toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  return "other";
};

/* Demo file preview (not needed once a real file URL is available) */
const sampleFile = (title, name) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="620" height="820" viewBox="0 0 620 820">
      <rect width="620" height="820" fill="#ffffff"/>
      <rect width="620" height="110" fill="#1d4ed8"/>
      <text x="40" y="68" font-family="Arial" font-size="28" font-weight="700" fill="#ffffff">${title}</text>
      <text x="40" y="190" font-family="Arial" font-size="20" fill="#17233b">Name: ${name}</text>
      <text x="40" y="230" font-family="Arial" font-size="16" fill="#5c6b87">Sample document preview</text>
      <g fill="#e3edff">
        <rect x="40" y="290" width="540" height="14" rx="7"/>
        <rect x="40" y="326" width="500" height="14" rx="7"/>
        <rect x="40" y="362" width="520" height="14" rx="7"/>
        <rect x="40" y="398" width="420" height="14" rx="7"/>
        <rect x="40" y="470" width="540" height="14" rx="7"/>
        <rect x="40" y="506" width="480" height="14" rx="7"/>
      </g>
      <text x="400" y="720" font-family="Arial" font-size="16" fill="#1d4ed8">Signature</text>
      <line x1="400" y1="700" x2="580" y2="700" stroke="#1d4ed8" stroke-width="2"/>
    </svg>`
  );

const PEOPLE = [
  ["EMP001", "Arun Kumar", "Engineering"],
  ["EMP007", "Meena Sundaram", "Engineering"],
  ["EMP012", "Lakshmi Narayanan", "Engineering"],
  ["EMP014", "Priya Lakshmi", "HR"],
  ["EMP018", "Hari Prasad", "HR"],
  ["EMP021", "Karthik Raja", "Finance"],
  ["EMP024", "Nandhini Devi", "Finance"],
  ["EMP033", "Divya Bharathi", "Marketing"],
  ["EMP038", "Vikram Singh", "Marketing"],
  ["EMP045", "Suresh Babu", "Operations"],
  ["EMP049", "Anitha Rani", "Operations"],
  ["EMP052", "Vignesh Raj", "Sales"],
];

const SAMPLE_UPLOADS = [
  ["EMP001", "Medical Certificate (Doctor)", "2026-10-20", "Pending", ""],
  ["EMP001", "Prescription", "2026-10-20", "Pending", ""],
  ["EMP007", "Medical Certificate (Doctor)", "2026-10-16", "Approved", ""],
  ["EMP007", "Lab / Medical Report", "2026-10-17", "Approved", "Verified with hospital"],
  ["EMP012", "Fitness Certificate", "2026-10-19", "Approved", ""],
  ["EMP012", "ID Proof", "2026-10-02", "Approved", ""],
  ["EMP014", "Prescription", "2026-10-19", "Approved", ""],
  ["EMP014", "Leave Application Form", "2026-10-18", "Approved", ""],
  ["EMP018", "Medical Certificate (Doctor)", "2026-10-21", "Pending", ""],
  ["EMP021", "Medical Certificate (Doctor)", "2026-10-14", "Approved", ""],
  ["EMP021", "Hospital Discharge Summary", "2026-10-18", "Pending", ""],
  ["EMP024", "Fitness Certificate", "2026-10-14", "Pending", "Doctor sign missing?"],
  ["EMP033", "Fitness Certificate", "2026-10-15", "Rejected", "Certificate date missing"],
  ["EMP033", "Leave Application Form", "2026-10-15", "Pending", ""],
  ["EMP038", "Prescription", "2026-10-11", "Approved", ""],
  ["EMP038", "Lab / Medical Report", "2026-10-11", "Approved", ""],
  ["EMP045", "Lab / Medical Report", "2026-10-12", "Approved", ""],
  ["EMP045", "Address Proof", "2026-09-28", "Approved", ""],
  ["EMP049", "Medical Certificate (Doctor)", "2026-10-22", "Pending", ""],
  ["EMP052", "Medical Certificate (Doctor)", "2026-10-21", "Pending", ""],
  ["EMP052", "Leave Application Form", "2026-10-21", "Approved", ""],
];

const buildSampleDocs = () =>
  SAMPLE_UPLOADS.map(([empId, docType, uploadedOn, status, remarks], i) => {
    const [, name, team] = PEOPLE.find((p) => p[0] === empId);
    const first = name.split(" ")[0].toLowerCase();
    return {
      id: i + 1,
      empId,
      name,
      email: `${first}.${empId.toLowerCase()}@company.com`,
      team,
      docType,
      fileName: `${first}_${docType.split(" ")[0].toLowerCase()}.jpg`,
      fileUrl: sampleFile(docType, name),
      uploadedOn,
      status,
      remarks: status === "Rejected" ? "" : remarks,
      rejectReason: status === "Rejected" ? remarks : "",
      history: [
        { text: "Uploaded", note: "", at: uploadedOn },
        ...(status === "Pending" ? [] : [{ text: status, note: status === "Rejected" ? remarks : "", at: uploadedOn }]),
      ],
    };
  });

const EMPTY_DOC = {
  empId: "",
  name: "",
  email: "",
  team: "",
  docType: DOC_TYPES[0],
  fileName: "",
  fileUrl: "",
  uploadedOn: new Date().toISOString().slice(0, 10),
  status: "Pending",
  remarks: "",
  rejectReason: "",
  history: [],
};

/* ------------------------- In-page file viewer (open, no download) ------------------------- */

function FileViewer({ doc, onClose }) {
  const kind = fileKind(doc.fileName);
  const hasFile = Boolean(doc.fileUrl);
  const [zoom, setZoom] = useState(1);
  const changeZoom = (delta) => setZoom((z) => Math.min(3, Math.max(0.5, Math.round((z + delta) * 100) / 100)));

  return (
    <div className="sad-overlay sad-overlay-viewer" onClick={onClose}>
      <div className="sad-viewer" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="sad-viewer-head">
          <div className="sad-viewer-title">
            <span className="sad-doc-icon">{DOC_ICONS[doc.docType] || "📄"}</span>
            <div>
              <strong>{doc.docType}</strong>
              <small>{doc.name} · {doc.empId} · {doc.fileName || "No file"}</small>
            </div>
          </div>
          <div className="sad-viewer-actions">
            {hasFile && kind === "image" && (
              <div className="sad-zoom" role="group" aria-label="Zoom">
                <button onClick={() => changeZoom(-0.25)} aria-label="Zoom out">−</button>
                <button className="sad-zoom-val" onClick={() => setZoom(1)} aria-label="Reset zoom">{Math.round(zoom * 100)}%</button>
                <button onClick={() => changeZoom(0.25)} aria-label="Zoom in">+</button>
              </div>
            )}
            {hasFile && kind !== "image" && (
              <a className="sad-btn sad-btn-ghost" href={doc.fileUrl} target="_blank" rel="noreferrer">
                Open in new tab
              </a>
            )}
            <button className="sad-close sad-close-light" aria-label="Close viewer" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="sad-viewer-body">
          {!hasFile ? (
            <div className="sad-viewer-empty"><span>📭</span><p>No file has been uploaded for this document.</p></div>
          ) : kind === "image" ? (
            <img
              src={doc.fileUrl}
              alt={`${doc.docType} - ${doc.name}`}
              style={zoom === 1 ? undefined : { width: `${zoom * 100}%`, maxWidth: "none", maxHeight: "none" }}
            />
          ) : kind === "pdf" ? (
            <iframe title={doc.fileName} src={doc.fileUrl} />
          ) : (
            <div className="sad-viewer-empty">
              <span>📄</span>
              <p>This file type can't be previewed here.</p>
              <a className="sad-btn sad-btn-primary" href={doc.fileUrl} target="_blank" rel="noreferrer">Open in new tab</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Modal (details / edit / add) ---------------------------- */

function DocModal({ initial, liveDoc, startEditing, startRemark, teams, onClose, onSave, onDelete, onOpenFile, onStatus, onReject, onRemark }) {
  const isNew = !initial.id;
  const [editing, setEditing] = useState(startEditing);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [remarkEditing, setRemarkEditing] = useState(Boolean(startRemark));
  const [remarkDraft, setRemarkDraft] = useState(initial.remarks || "");
  const history = liveDoc?.history || [];
  const waitingDays = form.status === "Pending" ? daysSince(form.uploadedOn) : 0;

  const openRemark = () => { setRemarkDraft(form.remarks || ""); setRemarkEditing(true); };
  const addRemarkPreset = (text) =>
    setRemarkDraft((r) => (r.trim() ? `${r.trim()}\n${text}` : text).slice(0, 300));
  const saveRemark = () => {
    const text = remarkDraft.trim();
    onRemark(form.id, text);
    setForm((f) => ({ ...f, remarks: text }));
    setRemarkEditing(false);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setForm((f) => ({ ...f, fileName: file.name, fileUrl: URL.createObjectURL(file) }));
  };

  const save = () => {
    const err = {};
    if (!form.empId.trim()) err.empId = "Enter the employee ID";
    if (!form.name.trim()) err.name = "Enter the name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Enter a valid email address";
    if (!form.team.trim()) err.team = "Please select or type a team";
    if (form.status === "Rejected" && !form.rejectReason.trim()) err.rejectReason = "Enter a rejection reason";
    setErrors(err);
    if (Object.keys(err).length === 0) {
      onSave({
        ...form,
        empId: form.empId.trim(),
        name: form.name.trim(),
        team: form.team.trim(),
        rejectReason: form.status === "Rejected" ? form.rejectReason.trim() : "",
      });
    }
  };

  const quickStatus = (status) => {
    onStatus(form.id, status);
    setForm((f) => ({ ...f, status }));
  };

  const field = (label, key, props = {}) => (
    <label className="sad-field">
      <span>{label}</span>
      <input
        className={`sad-input ${errors[key] ? "sad-input-error" : ""}`}
        value={form[key]}
        onChange={set(key)}
        {...props}
      />
      {errors[key] && <em className="sad-error">{errors[key]}</em>}
    </label>
  );

  return (
    <div className="sad-overlay" onClick={onClose}>
      <div
        className={`sad-modal ${!isNew && !editing ? `sad-modal-st-${form.status.toLowerCase()}` : ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sad-modal-head">
          <div className="sad-modal-title">
            {!isNew && <span className="sad-avatar sad-avatar-lg" style={avatarStyle(form.empId)}>{initials(form.name)}</span>}
            <div>
              <h2>{isNew ? "New document" : editing ? "Edit document" : form.name}</h2>
              {!isNew && !editing && <p>{form.empId} · {form.team}</p>}
            </div>
          </div>
          <button className="sad-close" aria-label="Close" onClick={onClose}>×</button>
        </div>

        {editing ? (
          <>
            <div className="sad-form">
              {field("Employee ID", "empId", { placeholder: "EMP001" })}
              {field("Name", "name", { placeholder: "Employee name" })}
              {field("Email", "email", { type: "email", placeholder: "name@company.com" })}

              <label className="sad-field">
                <span>Team</span>
                <input
                  className={`sad-input ${errors.team ? "sad-input-error" : ""}`}
                  list="sad-team-list"
                  value={form.team}
                  onChange={set("team")}
                  placeholder="Select or type new team"
                />
                <datalist id="sad-team-list">
                  {teams.map((t) => <option key={t} value={t} />)}
                </datalist>
                {errors.team && <em className="sad-error">{errors.team}</em>}
              </label>

              <label className="sad-field">
                <span>Document type</span>
                <select className="sad-input" value={form.docType} onChange={set("docType")}>
                  {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>

              {field("Uploaded on", "uploadedOn", { type: "date" })}

              <label className="sad-field">
                <span>Status</span>
                <select className="sad-input" value={form.status} onChange={set("status")}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <div />

              {form.status === "Rejected" && (
                <label className="sad-field sad-field-wide">
                  <span>Rejection reason</span>
                  <textarea
                    className={`sad-input sad-textarea ${errors.rejectReason ? "sad-input-error" : ""}`}
                    rows="3"
                    maxLength={300}
                    value={form.rejectReason}
                    onChange={set("rejectReason")}
                    placeholder="Explain why this document is rejected"
                  />
                  {errors.rejectReason && <em className="sad-error">{errors.rejectReason}</em>}
                </label>
              )}

              <div className="sad-field sad-field-wide">
                <span>File</span>
                <div className="sad-file">
                  <span className="sad-file-name">{form.fileName || "No file selected"}</span>
                  <label className="sad-btn sad-btn-outline sad-file-btn">
                    {form.fileName ? "Replace file" : "Choose file"}
                    <input type="file" hidden onChange={handleFile} />
                  </label>
                </div>
              </div>

              <label className="sad-field sad-field-wide">
                <span>Remarks</span>
                <textarea
                  className="sad-input sad-textarea"
                  rows="3"
                  value={form.remarks}
                  onChange={set("remarks")}
                  placeholder="Super admin note (optional)"
                />
              </label>
            </div>
            {!isNew && (
              <p className="sad-hint">
                If you change the Employee ID, name, email or team, it applies to all documents of that employee.
              </p>
            )}
          </>
        ) : (
          <dl className="sad-details">
            <dt>Email</dt><dd>{form.email}</dd>
            <dt>Document type</dt><dd>{DOC_ICONS[form.docType]} {form.docType}</dd>
            <dt>File</dt><dd>{form.fileName || "-"}</dd>
            <dt>Uploaded on</dt><dd>{formatDate(form.uploadedOn)}</dd>
            <dt>Status</dt>
            <dd>
              <span className={`sad-badge sad-badge-${form.status.toLowerCase()}`}>{form.status}</span>
              {waitingDays > 0 && (
                <span className={`sad-wait ${waitingDays >= 3 ? "sad-wait-late" : ""}`}>
                  Waiting {waitingDays} day{waitingDays === 1 ? "" : "s"}
                </span>
              )}
            </dd>
            {form.status === "Rejected" && (
              <>
                <dt>Rejection reason</dt>
                <dd className="sad-reason-full">{form.rejectReason || "-"}</dd>
              </>
            )}
          </dl>
        )}

        {!editing && !isNew && (
          <>
            <section className={`sad-remarks ${remarkEditing ? "is-editing" : ""}`}>
              <div className="sad-remarks-head">
                <strong>💬 Remarks</strong>
                {!remarkEditing && (
                  <button className="sad-link-btn" onClick={openRemark}>
                    {form.remarks ? "Edit remark" : "+ Add remark"}
                  </button>
                )}
              </div>

              {remarkEditing ? (
                <>
                  <textarea
                    className="sad-input sad-textarea"
                    rows="3"
                    maxLength={300}
                    autoFocus
                    value={remarkDraft}
                    onChange={(e) => setRemarkDraft(e.target.value)}
                    placeholder="Write a note for your team (optional)"
                  />
                  <div className="sad-reason-meta">
                    <span />
                    <small>{remarkDraft.length}/300</small>
                  </div>
                  <div className="sad-presets">
                    {REMARK_PRESETS.map((t) => (
                      <button key={t} type="button" className="sad-preset" onClick={() => addRemarkPreset(t)}>+ {t}</button>
                    ))}
                  </div>
                  <div className="sad-remark-actions">
                    <button className="sad-btn sad-btn-sm sad-btn-outline" onClick={() => setRemarkEditing(false)}>Cancel</button>
                    <button className="sad-btn sad-btn-sm sad-btn-primary" onClick={saveRemark}>Save remark</button>
                  </div>
                </>
              ) : form.remarks ? (
                <p className="sad-remark-text">{form.remarks}</p>
              ) : (
                <p className="sad-remark-empty">No remarks yet. Add a note such as “Verified with hospital”.</p>
              )}
            </section>

            {history.length > 0 && (
              <section className="sad-activity">
                <strong>Activity</strong>
                <ol>
                  {history.slice(-5).reverse().map((h, i) => (
                    <li key={`${h.at}-${i}`}>
                      <span className="sad-dot" />
                      <div>
                        <b>{h.text}</b>
                        {h.note && <p>{h.note}</p>}
                        <small>{formatStamp(h.at)}</small>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </>
        )}

        <div className="sad-modal-actions">
          {editing ? (
            <>
              <span className="sad-spacer" />
              <button
                className="sad-btn sad-btn-outline"
                onClick={isNew ? onClose : () => { setForm(initial); setErrors({}); setEditing(false); }}
              >
                Cancel
              </button>
              <button className="sad-btn sad-btn-primary" onClick={save}>
                {isNew ? "Add document" : "Save changes"}
              </button>
            </>
          ) : (
            <>
              <button className="sad-btn sad-btn-primary" onClick={() => onOpenFile(form)}>Open file</button>
              <button className="sad-btn sad-btn-ok" onClick={() => quickStatus("Approved")}>Approve</button>
              <button className="sad-btn sad-btn-danger" onClick={() => onReject(form)}>Reject</button>
              <span className="sad-spacer" />
              <button className="sad-btn sad-btn-danger" onClick={() => onDelete(initial)}>Delete</button>
              <button className="sad-btn sad-btn-outline" onClick={() => setEditing(true)}>Edit</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Reject with reason modal ------------------------------ */

const REASON_PRESETS = [
  "Doctor signature missing",
  "Date missing / incorrect",
  "File is not clear (blurry)",
  "Wrong document uploaded",
  "Document has expired",
];

function RejectModal({ doc, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const addPreset = (text) => {
    setReason((r) => (r.trim() ? `${r.trim()}\n${text}` : text));
    setError("");
  };

  const confirm = () => {
    const value = reason.trim();
    if (value.length < 5) return setError("Enter a rejection reason (minimum 5 characters)");
    onConfirm(value);
  };

  return (
    <div className="sad-overlay sad-overlay-top" onClick={onClose}>
      <div className="sad-modal sad-modal-sm" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2 className="sad-modal-h">Reject document</h2>
        <p className="sad-confirm-text">
          {doc.name} ({doc.empId}) · {doc.docType}
        </p>

        <label className="sad-field">
          <span>Rejection reason</span>
          <textarea
            className={`sad-input sad-textarea ${error ? "sad-input-error" : ""}`}
            rows="4"
            maxLength={300}
            autoFocus
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(""); }}
            placeholder="Eg: Doctor signature missing, please upload again"
          />
          <div className="sad-reason-meta">
            {error ? <em className="sad-error">{error}</em> : <span />}
            <small>{reason.length}/300</small>
          </div>
        </label>

        <div className="sad-presets">
          {REASON_PRESETS.map((t) => (
            <button key={t} type="button" className="sad-preset" onClick={() => addPreset(t)}>
              + {t}
            </button>
          ))}
        </div>

        <div className="sad-modal-actions sad-modal-actions-top">
          <span className="sad-spacer" />
          <button className="sad-btn sad-btn-outline" onClick={onClose}>Cancel</button>
          <button className="sad-btn sad-btn-danger-solid" onClick={confirm}>Reject document</button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- New team modal --------------------------------- */

function TeamModal({ existing, onClose, onSave }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const save = () => {
    const value = name.trim();
    if (!value) return setError("Enter a team name");
    if (existing.some((t) => t.toLowerCase() === value.toLowerCase())) return setError("This team already exists");
    onSave(value);
  };

  return (
    <div className="sad-overlay" onClick={onClose}>
      <div className="sad-modal sad-modal-sm" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2 className="sad-modal-h">New team</h2>
        <label className="sad-field">
          <span>Team name</span>
          <input
            className={`sad-input ${error ? "sad-input-error" : ""}`}
            value={name}
            autoFocus
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="Eg: Customer Support"
          />
          {error && <em className="sad-error">{error}</em>}
        </label>
        <div className="sad-modal-actions sad-modal-actions-top">
          <span className="sad-spacer" />
          <button className="sad-btn sad-btn-outline" onClick={onClose}>Cancel</button>
          <button className="sad-btn sad-btn-primary" onClick={save}>Add team</button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Team picker --------------------------------- */

function TeamPicker({ value, onChange, teams, docs }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const options = useMemo(() => {
    const count = (list) => ({ total: list.length, pending: list.filter((d) => d.status === "Pending").length });
    return [
      { value: ALL_TEAMS, label: "All teams", all: true, ...count(docs) },
      ...teams.map((t) => ({ value: t, label: t, ...count(docs.filter((d) => d.team === t)) })),
    ];
  }, [docs, teams]);

  const current = options.find((o) => o.value === value) || options[0];

  const badge = (o) =>
    o.all ? (
      <span className="sad-tp-badge sad-tp-badge-all">🌐</span>
    ) : (
      <span className="sad-tp-badge" style={avatarStyle(o.label)}>{initials(o.label)}</span>
    );

  return (
    <div className="sad-filter sad-tp" ref={ref}>
      <span className="sad-filter-label">TEAM</span>
      <button
        type="button"
        className={`sad-tp-trigger ${open ? "is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {badge(current)}
        <span className="sad-tp-name">{current.label}</span>
        <span className="sad-tp-count">{current.total}</span>
        <span className="sad-tp-chevron" aria-hidden="true">⌄</span>
      </button>

      {open && (
        <div className="sad-tp-menu" role="listbox" aria-label="Select team">
          {options.map((o, i) => (
            <div key={o.value}>
              {i === 1 && <div className="sad-tp-sep">Teams</div>}
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={`sad-tp-item ${o.value === value ? "is-selected" : ""}`}
                onClick={() => { onChange(o.value); setOpen(false); }}
              >
                {badge(o)}
                <span className="sad-tp-text">
                  <b>{o.label}</b>
                  <small>{o.total} document{o.total === 1 ? "" : "s"}</small>
                </span>
                {o.pending > 0 && <span className="sad-tp-pending">{o.pending} pending</span>}
                <span className="sad-tp-tick" aria-hidden="true">{o.value === value ? "✓" : ""}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------- Filter pill --------------------------------- */

function FilterPill({ label, icon, value, onChange, allLabel, options }) {
  return (
    <label className="sad-filter">
      <span className="sad-filter-label">{label}</span>
      <span className="sad-pill">
        <span className="sad-pill-icon">{icon}</span>
        <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
          {allLabel && <option value="All">{allLabel}</option>}
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      </span>
    </label>
  );
}

/* ---------------------------------- Main page ---------------------------------- */

export default function SuperAdminDocuments() {
  const [docs, setDocs] = useState(buildSampleDocs);
  const [extraTeams, setExtraTeams] = useState([]);
  const [teamFilter, setTeamFilter] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [teamModal, setTeamModal] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [confirmDoc, setConfirmDoc] = useState(null);
  const [rejectDoc, setRejectDoc] = useState(null);
  const [toast, setToast] = useState("");
  const nextId = useRef(SAMPLE_UPLOADS.length + 1);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  /* Esc closes the top-most popup */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (viewerDoc) setViewerDoc(null);
      else if (rejectDoc) setRejectDoc(null);
      else if (confirmDoc) setConfirmDoc(null);
      else if (teamModal) setTeamModal(false);
      else if (modal) setModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerDoc, rejectDoc, confirmDoc, teamModal, modal]);

  const teams = useMemo(
    () => Array.from(new Set([...DEFAULT_TEAMS, ...extraTeams, ...docs.map((d) => d.team)])).sort(),
    [docs, extraTeams]
  );

  /* Default = all teams; pick a single team from the dropdown to narrow down */
  const activeTeam = teamFilter === ALL_TEAMS || teams.includes(teamFilter) ? teamFilter : ALL_TEAMS;
  const isAll = activeTeam === ALL_TEAMS;
  const teamLabel = isAll ? "All teams" : activeTeam;

  useEffect(() => setPage(1), [search, activeTeam, typeFilter, statusFilter]);

  const teamDocs = useMemo(() => (isAll ? docs : docs.filter((d) => d.team === activeTeam)), [docs, activeTeam, isAll]);

  const stats = useMemo(
    () => ({
      total: teamDocs.length,
      people: new Set(teamDocs.map((d) => d.empId)).size,
      pending: teamDocs.filter((d) => d.status === "Pending").length,
      approved: teamDocs.filter((d) => d.status === "Approved").length,
      rejected: teamDocs.filter((d) => d.status === "Rejected").length,
    }),
    [teamDocs]
  );

  const matches = (d, q) =>
    (!q || `${d.empId} ${d.name} ${d.email} ${d.docType} ${d.fileName}`.toLowerCase().includes(q)) &&
    (typeFilter === "All" || d.docType === typeFilter) &&
    (statusFilter === "All" || d.status === statusFilter);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return teamDocs
      .filter((d) => matches(d, q))
      .sort((a, b) => (isAll ? a.team.localeCompare(b.team) : 0) || a.name.localeCompare(b.name) || a.docType.localeCompare(b.docType));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamDocs, search, typeFilter, statusFilter, isAll]);

  /* if there is no search match, show whether it exists in another team */
  const otherTeamMatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (isAll || !q || filtered.length > 0) return [];
    const map = {};
    docs.forEach((d) => {
      if (d.team !== activeTeam && matches(d, q)) map[d.team] = (map[d.team] || 0) + 1;
    });
    return Object.entries(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs, activeTeam, search, typeFilter, statusFilter, filtered]);

  /* pagination */
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const from = totalItems === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, totalItems);
  const pageDocs = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* actions */
  const addDoc = (data) => {
    setDocs((prev) => [{ ...data, id: nextId.current++, history: [stamp("Document added")] }, ...prev]);
    setModal(null);
    showToast("Document added");
  };

  /* Selecting Rejected does not change the status directly; a popup opens to ask for the reason */
  const updateStatus = (id, status) => {
    if (status === "Rejected") {
      setRejectDoc(docs.find((d) => d.id === id) || null);
      return;
    }
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id && d.status !== status
          ? { ...d, status, rejectReason: "", history: [...(d.history || []), stamp(status === "Pending" ? "Moved back to Pending" : status)] }
          : d
      )
    );
    showToast(`Status - ${status}`);
  };

  const confirmReject = (reason) => {
    // Backend: API call goes here - PUT /documents/:id  { status: "Rejected", rejectReason: reason }
    setDocs((prev) =>
      prev.map((d) =>
        d.id === rejectDoc.id
          ? { ...d, status: "Rejected", rejectReason: reason, history: [...(d.history || []), stamp("Rejected", reason)] }
          : d
      )
    );
    showToast(`${rejectDoc.name} - Rejected`);
    setRejectDoc(null);
    setModal(null);
  };

  const saveRemark = (id, text) => {
    // Backend: API call goes here - PUT /documents/:id  { remarks: text }
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              remarks: text,
              history: [...(d.history || []), stamp(text ? (d.remarks ? "Remark updated" : "Remark added") : "Remark removed")],
            }
          : d
      )
    );
    showToast(text ? "Remark saved" : "Remark removed");
  };

  const exportCsv = () => {
    const head = ["Employee ID", "Name", "Email", "Team", "Document", "File", "Uploaded on", "Status", "Rejection reason", "Remarks"];
    const rows = filtered.map((d) => [d.empId, d.name, d.email, d.team, d.docType, d.fileName, d.uploadedOn, d.status, d.rejectReason, d.remarks]);
    const csv = [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${teamLabel.toLowerCase().replace(/\s+/g, "-")}-documents.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${rows.length} document${rows.length === 1 ? "" : "s"}`);
  };

  const saveDoc = (data) => {
    if (!data.id) return addDoc(data);
    const original = docs.find((d) => d.id === data.id);
    const trail = [...(original?.history || [])];
    if (original && original.status !== data.status) {
      trail.push(stamp(data.status === "Rejected" ? "Rejected" : data.status, data.status === "Rejected" ? data.rejectReason : ""));
    }
    if (original && (original.remarks || "") !== (data.remarks || "")) trail.push(stamp("Remark updated"));
    setDocs((prev) =>
      prev.map((d) => {
        if (d.id === data.id) return { ...data, history: trail };
        if (original && d.empId === original.empId) {
          return { ...d, empId: data.empId, name: data.name, email: data.email, team: data.team };
        }
        return d;
      })
    );
    setModal(null);
    showToast("Changes saved");
  };

  const deleteDoc = (id) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    setConfirmDoc(null);
    setModal(null);
    showToast("Document deleted");
  };

  const openNew = () => setModal({ doc: { ...EMPTY_DOC, team: isAll ? "" : activeTeam }, editing: true });

  const peopleLabel = `${stats.people} employee${stats.people === 1 ? "" : "s"}`;
  const pendingAll = docs.filter((d) => d.status === "Pending").length;
  const pct = (n) => (stats.total ? (n / stats.total) * 100 : 0);

  return (
    <div className="sad-page">
      {/* Header */}
      <header className="sad-card sad-header">
        <div>
          {pendingAll > 0 && (
            <button
              type="button"
              className="sad-hero-chip"
              onClick={() => { setTeamFilter(ALL_TEAMS); setStatusFilter("Pending"); }}
            >
              <i /> {pendingAll} document{pendingAll === 1 ? "" : "s"} waiting for review
            </button>
          )}
          <h1>Compliance Documents</h1>
          <p>
            Select a team to see its medical and compliance documents, open the file,
            and edit or approve it any time.
          </p>
        </div>
        <div className="sad-header-actions">
          <button className="sad-btn sad-btn-soft" onClick={openNew}>＋ New document</button>
          <button className="sad-btn sad-btn-white" onClick={() => setTeamModal(true)}>👥 New team</button>
          <button className="sad-btn sad-btn-white" onClick={exportCsv} disabled={filtered.length === 0}>⬇ Export CSV</button>
        </div>
      </header>

      {/* Stats (selected team) */}
      <section className="sad-stats">
        {[
          { key: "All", icon: "🗂️", label: "Total documents", num: stats.total, sub: `from ${peopleLabel}` },
          { key: "Pending", icon: "⏳", label: "Pending review", num: stats.pending, sub: "waiting for your decision" },
          { key: "Approved", icon: "✅", label: "Approved", num: stats.approved, sub: "verified documents" },
          { key: "Rejected", icon: "🚫", label: "Rejected", num: stats.rejected, sub: "employee must re-upload" },
        ].map((c) => (
          <button
            key={c.key}
            type="button"
            aria-pressed={statusFilter === c.key}
            className={`sad-card sad-stat sad-stat-btn sad-stat-${c.key.toLowerCase()} ${statusFilter === c.key ? "is-active" : ""}`}
            onClick={() => setStatusFilter(c.key)}
          >
            <span className="sad-stat-icon">{c.icon}</span>
            <div>
              <span className="sad-stat-label">{c.label}</span>
              <span className="sad-stat-num">{c.num}</span>
              <span className="sad-stat-sub">{c.sub}</span>
            </div>
          </button>
        ))}
      </section>

      {/* Filters */}
      <section className="sad-filters">
        <TeamPicker value={activeTeam} onChange={setTeamFilter} teams={teams} docs={docs} />
        <span className="sad-filter-sep" />
        <FilterPill label="DOCUMENT" icon="📄" value={typeFilter} onChange={setTypeFilter} allLabel="All documents" options={DOC_TYPES} />
        <span className="sad-filter-sep" />
        <FilterPill label="STATUS" icon="●" value={statusFilter} onChange={setStatusFilter} allLabel="All statuses" options={STATUSES} />
      </section>

      {/* Selected team documents */}
      <section className="sad-card sad-boardcard">
        <div className="sad-boardbar">
          <div className="sad-team-head">
            <span className="sad-team-badge">{isAll ? "🌐" : initials(activeTeam)}</span>
            <div>
              <strong>{teamLabel}</strong>
              <small>
                {isAll ? `${teams.length} teams · ` : ""}{peopleLabel} · {stats.total} document{stats.total === 1 ? "" : "s"}
              </small>
              {stats.total > 0 && (
                <div className="sad-progress" title={`${stats.approved} approved, ${stats.pending} pending, ${stats.rejected} rejected`}>
                  <div className="sad-progress-bar" aria-hidden="true">
                    <i className="ok" style={{ width: `${pct(stats.approved)}%` }} />
                    <i className="pending" style={{ width: `${pct(stats.pending)}%` }} />
                    <i className="rejected" style={{ width: `${pct(stats.rejected)}%` }} />
                  </div>
                  <span>{Math.round(pct(stats.approved))}% approved</span>
                </div>
              )}
            </div>
          </div>
          <input
            className="sad-input sad-search"
            type="search"
            placeholder={`Search in ${teamLabel.toLowerCase()}: name, ID, email`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {teamDocs.length === 0 ? (
          <div className="sad-empty">
            <span>🗂️</span>
            <h3>{isAll ? "No documents yet" : `No documents in the ${activeTeam} team yet`}</h3>
            <p>Add a new document.</p>
            <button className="sad-btn sad-btn-primary" onClick={openNew}>＋ New document</button>
          </div>
        ) : totalItems === 0 ? (
          <div className="sad-empty">
            <span>🔍</span>
            <h3>No matching documents</h3>
            <p>Try changing the search or filter.</p>
            {otherTeamMatches.length > 0 && (
              <div className="sad-empty-links">
                <small>Found in another team:</small>
                {otherTeamMatches.map(([team, n]) => (
                  <button key={team} className="sad-btn sad-btn-sm sad-btn-soft" onClick={() => setTeamFilter(team)}>
                    {team} ({n})
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="sad-table-scroll">
            <table className="sad-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  {isAll && <th>Team</th>}
                  <th>Email</th>
                  <th>Document</th>
                  <th>Uploaded</th>
                  <th>Status</th>
                  <th className="sad-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageDocs.map((d) => (
                  <tr key={d.id} className={`sad-row-${d.status.toLowerCase()}`}>
                    <td>
                      <div className="sad-person">
                        <span className="sad-avatar" style={avatarStyle(d.empId)}>{initials(d.name)}</span>
                        <div>
                          <div className="sad-person-name">{d.name}</div>
                          <div className="sad-person-sub">{d.empId}</div>
                        </div>
                      </div>
                    </td>
                    {isAll && (
                      <td><span className="sad-team-chip" style={avatarStyle(d.team)}>{d.team}</span></td>
                    )}
                    <td className="sad-email">{d.email}</td>
                    <td>
                      <span className="sad-doc-pill"><span>{DOC_ICONS[d.docType]}</span>{d.docType}</span>
                      {d.remarks ? (
                        <button
                          className="sad-remark-chip"
                          title={d.remarks}
                          onClick={() => setModal({ doc: d, editing: false })}
                        >
                          💬 {d.remarks}
                        </button>
                      ) : (
                        <button
                          className="sad-remark-add"
                          onClick={() => setModal({ doc: d, editing: false, remark: true })}
                        >
                          + Add remark
                        </button>
                      )}
                    </td>
                    <td className="sad-nowrap">
                      {formatDate(d.uploadedOn)}
                      {d.status === "Pending" && daysSince(d.uploadedOn) >= 3 && (
                        <div className="sad-late">Waiting {daysSince(d.uploadedOn)} days</div>
                      )}
                    </td>
                    <td>
                      <select
                        className={`sad-status sad-status-${d.status.toLowerCase()}`}
                        value={d.status}
                        onChange={(e) => updateStatus(d.id, e.target.value)}
                        aria-label={`Status for ${d.name}`}
                      >
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      {d.status === "Rejected" && d.rejectReason && (
                        <div className="sad-reason" title={d.rejectReason}>Reason: {d.rejectReason}</div>
                      )}
                    </td>
                    <td>
                      <div className="sad-actions">
                        <button className="sad-btn sad-btn-sm sad-btn-primary" onClick={() => setViewerDoc(d)}>Open file</button>
                        <button className="sad-btn sad-btn-sm sad-btn-outline" onClick={() => setModal({ doc: d, editing: false })}>Details</button>
                        <button className="sad-btn sad-btn-sm sad-btn-outline" onClick={() => setModal({ doc: d, editing: true })}>Edit</button>
                        <button className="sad-icon-btn" aria-label={`Delete ${d.name}`} onClick={() => setConfirmDoc(d)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalItems > 0 && (
          <div className="sad-footer">
            <span>
              Showing <b>{from}–{to}</b> of {totalItems} documents
            </span>
            <div className="sad-pager">
              <button disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>‹ Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={n === safePage ? "active" : ""} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>Next ›</button>
            </div>
          </div>
        )}
      </section>

      {/* Details / Edit / Add */}
      {modal && (
        <DocModal
          key={modal.doc.id || "new"}
          initial={modal.doc}
          liveDoc={docs.find((d) => d.id === modal.doc.id)}
          startEditing={modal.editing}
          startRemark={Boolean(modal.remark)}
          teams={teams}
          onClose={() => setModal(null)}
          onSave={saveDoc}
          onDelete={(d) => setConfirmDoc(d)}
          onOpenFile={(d) => setViewerDoc(d)}
          onStatus={updateStatus}
          onReject={(d) => setRejectDoc(d)}
          onRemark={saveRemark}
        />
      )}

      {teamModal && (
        <TeamModal
          existing={teams}
          onClose={() => setTeamModal(false)}
          onSave={(name) => {
            setExtraTeams((t) => [...t, name]);
            setTeamFilter(name);
            setTeamModal(false);
            showToast(`${name} team added`);
          }}
        />
      )}

      {rejectDoc && (
        <RejectModal doc={rejectDoc} onClose={() => setRejectDoc(null)} onConfirm={confirmReject} />
      )}

      {viewerDoc && <FileViewer doc={viewerDoc} onClose={() => setViewerDoc(null)} />}

      {confirmDoc && (
        <div className="sad-overlay sad-overlay-top" onClick={() => setConfirmDoc(null)}>
          <div className="sad-modal sad-modal-sm" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2 className="sad-modal-h">Delete document?</h2>
            <p className="sad-confirm-text">
              The {confirmDoc.docType} of {confirmDoc.name} ({confirmDoc.empId}) will be deleted. This cannot be undone.
            </p>
            <div className="sad-modal-actions">
              <span className="sad-spacer" />
              <button className="sad-btn sad-btn-outline" onClick={() => setConfirmDoc(null)}>Cancel</button>
              <button className="sad-btn sad-btn-danger-solid" onClick={() => deleteDoc(confirmDoc.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="sad-toast" role="status">{toast}</div>}
    </div>
  );
}