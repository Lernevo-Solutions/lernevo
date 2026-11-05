import React, { useMemo, useRef, useState } from "react";
import {
  UserPlus, Search, Eye, Pencil, Trash2, X, Copy, Check, RefreshCw,
  EyeOff, ShieldAlert, ChevronLeft, ChevronRight, Plus,
} from "lucide-react";
import { useOrganizations, useUsers } from "./Orgstore";
import { API_BASE_URL } from "../config";
import "./Usercreation.css";

const ROLES = ["Admin", "HR Manager", "Manager", "Trainer", "Employee"];
const PAGE_SIZE = 8;

// Django endpoint that creates the user AND emails the login details (see users_email_view.py).
// Adjust the path if your urls.py uses a different one.
const CREATE_USER_URL = `${API_BASE_URL}/users/create/`;

// false = no server call. The user is only added in the browser and no email is sent.
// Change to true once the backend endpoint is ready.
const USE_BACKEND = false;

function authHeaders() {
  const token =
    localStorage.getItem("access_token") || localStorage.getItem("access") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Names the built-in fields already use (extra fields can't reuse them)
const RESERVED_LABELS = [
  "name", "full name", "email", "phone", "role", "status", "organization",
  "department", "designation", "date of joining", "joining date", "user id", "password",
];
const newCustomField = () => ({ id: `cf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, label: "", value: "" });

// Field names shown in the form / table / view. Users can rename them with the pencil icon.
const DEFAULT_LABELS = {
  code: "User ID", name: "Full Name", email: "Email", phone: "Phone",
  designation: "Designation", joiningDate: "Date of Joining", role: "Role",
  status: "Status", organization: "Organization", department: "Department",
  password: "Temporary Password",
};
const LABELS_KEY = "uc_field_labels";
function loadLabels() {
  try { return { ...DEFAULT_LABELS, ...JSON.parse(localStorage.getItem(LABELS_KEY) || "{}") }; }
  catch (err) { return { ...DEFAULT_LABELS }; }
}

// Field name with a small pencil to rename it (click pencil -> type -> Enter / click away; Esc cancels)
function FieldLabel({ id, k, labels, onRename, required, rename }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const cancelled = useRef(false);
  const start = () => { cancelled.current = false; setDraft(labels[k]); setEditing(true); };
  const commit = () => { if (!cancelled.current) onRename(k, draft); setEditing(false); };

  if (editing) {
    return (
      <div className="uc-label-row">
        <input
          className="uc-label-input" autoFocus value={draft} maxLength={30}
          onChange={(e) => setDraft(e.target.value)} onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commit(); }
            else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); cancelled.current = true; setEditing(false); }
          }}
        />
      </div>
    );
  }
  return (
    <div className="uc-label-row">
      <label htmlFor={id}>{labels[k]}{required && <> <b>*</b></>}</label>
      {rename && (
        <button type="button" className="uc-label-edit" title="Rename this field" onClick={start}><Pencil size={12} /></button>
      )}
    </div>
  );
}

const EMPTY_FORM = {
  customFields: [],
  name: "", email: "", phone: "", role: "Employee",
  organization: "", department: "", designation: "", joiningDate: "",
  password: "", status: "Active", sendEmail: true, code: "",
};

// Same place Topbar reads the logged-in user from
function readRole() {
  try {
    const raw = localStorage.getItem("lernevo_user") || localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      return u.role || u.user_role || "";
    }
    return localStorage.getItem("role") || localStorage.getItem("user_role") || "";
  } catch (err) {
    return "";
  }
}

// 12-char temporary password (letters + digits + symbol, no look-alike characters)
function generatePassword() {
  const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnpqrstuvwxyz", "23456789", "@#$%&*!"];
  const all = sets.join("");
  const pick = (chars) => chars[crypto.getRandomValues(new Uint32Array(1))[0] % chars.length];
  const out = sets.map(pick);
  while (out.length < 12) out.push(pick(all));
  for (let i = out.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join("");
}

const initialsOf = (name) =>
  name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function UserCreation() {
  const [users, setUsers] = useUsers();
  const [organizations] = useOrganizations();

  const roleRaw = readRole();
  const roleKey = String(roleRaw).replace(/[\s-]+/g, "_").toUpperCase();
  // only block when we know the person is NOT a super admin
  const isSuperAdmin = !roleRaw || roleKey === "SUPER_ADMIN";

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // {mode: add|edit|view|delete|created, user?, credentials?}
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [apiError, setApiError] = useState("");
  const [labels, setLabels] = useState(loadLabels);
  const [renameMode, setRenameMode] = useState(false);

  const setLabel = (key, value) => {
    const v = value.trim() || DEFAULT_LABELS[key]; // empty -> back to the default name
    const clash = Object.entries(labels).some(([k, l]) => k !== key && l.toLowerCase() === v.toLowerCase());
    if (clash) return; // another field already uses this name
    setLabels((cur) => {
      const next = { ...cur, [key]: v };
      try { localStorage.setItem(LABELS_KEY, JSON.stringify(next)); } catch (err) { /* storage blocked */ }
      return next;
    });
  };

  const activeOrgs = useMemo(
    () => organizations.filter((o) => o.status === "Active"),
    [organizations]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        (!q || `${u.name} ${u.email} ${u.code} ${u.organization} ${u.department}`.toLowerCase().includes(q)) &&
        (roleFilter === "All" || u.role === roleFilter) &&
        (statusFilter === "All" || u.status === statusFilter)
    );
  }, [users, query, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const closeModal = () => { setModal(null); setForm(EMPTY_FORM); setErrors({}); setShowPwd(false); setCopied(false); setApiError(""); setSending(false); setRenameMode(false); };
  const openAdd = () => {
    setForm({ ...EMPTY_FORM, password: generatePassword() });
    setErrors({}); setShowPwd(true); setModal({ mode: "add" });
  };
  const openEdit = (user) => {
    setForm({ ...EMPTY_FORM, ...user, password: "", customFields: (user.customFields || []).map((c) => ({ ...c })) });
    setErrors({}); setModal({ mode: "edit", user });
  };
  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };
  // ----- extra (custom) fields -----
  const addCustomField = () =>
    setForm((f) => ({ ...f, customFields: [...f.customFields, newCustomField()] }));
  const updateCustomField = (id, key, value) => {
    setForm((f) => ({ ...f, customFields: f.customFields.map((c) => (c.id === id ? { ...c, [key]: value } : c)) }));
    setErrors((e) => ({ ...e, customFields: undefined }));
  };
  const removeCustomField = (id) => {
    setForm((f) => ({ ...f, customFields: f.customFields.filter((c) => c.id !== id) }));
    setErrors((e) => ({ ...e, customFields: undefined }));
  };

  const changeOrg = (name) => {
    const org = organizations.find((o) => o.name === name);
    setForm((f) => ({ ...f, organization: name, department: org ? org.department || "" : f.department }));
    setErrors((e) => ({ ...e, organization: undefined }));
  };

  const validate = () => {
    const e = {};
    const editingId = modal?.mode === "edit" ? modal.user.id : null;
    if (!form.name.trim()) e.name = `${labels.name} is required`;
    if (!form.email.trim()) e.email = `${labels.email} is required`;
    else if (!EMAIL_RE.test(form.email.trim())) e.email = `Enter a valid ${labels.email.toLowerCase()}`;
    else if (users.some((u) => u.id !== editingId && u.email.toLowerCase() === form.email.trim().toLowerCase()))
      e.email = `A user with this ${labels.email.toLowerCase()} already exists`;
    if (!form.organization) e.organization = `Select ${labels.organization.toLowerCase()}`;
    if (modal?.mode === "edit") {
      if (!form.code.trim()) e.code = `${labels.code} is required`;
      else if (users.some((u) => u.id !== editingId && String(u.code).toLowerCase() === form.code.trim().toLowerCase()))
        e.code = `This ${labels.code} is already used`;
    }
    if (modal?.mode === "add" && form.password.length < 8) e.password = `${labels.password} must be at least 8 characters`;
    const seen = new Set();
    const reserved = [...RESERVED_LABELS, ...Object.values(labels).map((l) => l.toLowerCase())];
    for (const c of form.customFields) {
      const label = c.label.trim().toLowerCase();
      if (!label && !c.value.trim()) continue; // empty row, ignored
      if (!label) { e.customFields = "Give a name to every extra field"; break; }
      if (reserved.includes(label)) { e.customFields = `“${c.label.trim()}” already exists as a normal field`; break; }
      if (seen.has(label)) { e.customFields = `“${c.label.trim()}” is added twice`; break; }
      seen.add(label);
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (sending || !validate()) return;
    const clean = {
      name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
      role: form.role, organization: form.organization,
      department: form.department.trim(), status: form.status,
      designation: form.designation.trim(), joiningDate: form.joiningDate,
      customFields: form.customFields
        .filter((c) => c.label.trim())
        .map((c) => ({ id: c.id, label: c.label.trim(), value: c.value.trim() })),
    };

    if (modal.mode === "edit") {
      setUsers((list) => list.map((u) => (u.id === modal.user.id ? { ...u, ...clean, code: form.code.trim() } : u)));
      closeModal();
      return;
    }

    // ----- create: server creates the account and emails the temporary password -----
    setSending(true);
    setApiError("");
    let emailSent = false;
    let serverCode = "";
    try {
      if (!USE_BACKEND) throw new Error("backend-off");
      const res = await fetch(CREATE_USER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ ...clean, password: form.password, send_email: form.sendEmail,
          // sent as { "Blood Group": "O+", ... } -> handle in Django (e.g. store in a JSONField)
          custom_fields: Object.fromEntries(clean.customFields.map((c) => [c.label, c.value])),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setApiError(data.error || data.detail || `Could not create the user (error ${res.status}).`);
        setSending(false);
        return;
      }
      emailSent = Boolean(data.email_sent);
      serverCode = data.user_code || "";
    } catch (err) {
      if (err.message !== "backend-off") {
        setApiError("Could not reach the server. Please check your connection and try again.");
        setSending(false);
        return;
      }
    }

    const next = users.reduce((m, u) => Math.max(m, parseInt(String(u.code).replace(/\D/g, ""), 10) || 0), 0) + 1;
    const user = {
      ...clean, id: Date.now(), code: serverCode || `USR-${String(next).padStart(4, "0")}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsers((list) => [user, ...list]);
    const credentials = { email: user.email, password: form.password };
    setForm(EMPTY_FORM); setErrors({}); setCopied(false); setSending(false);
    setModal({ mode: "created", user, credentials, emailSent, emailRequested: form.sendEmail, backendOff: !USE_BACKEND });
  };

  const confirmDelete = () => {
    setUsers((list) => list.filter((u) => u.id !== modal.user.id));
    closeModal();
  };

  const copyCredentials = async () => {
    const { email, password } = modal.credentials;
    try {
      await navigator.clipboard.writeText(`Email: ${email}\nTemporary password: ${password}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) { /* clipboard blocked */ }
  };

  const isForm = modal?.mode === "add" || modal?.mode === "edit";

  return (
    // Sidebar + Topbar come from <AdminLayout> (see the route in App.js), same as Timesheet / Payslip pages
    <>
      <main className="uc-page">
          {!isSuperAdmin ? (
            <div className="uc-denied">
              <ShieldAlert size={34} />
              <h2>Access restricted</h2>
              <p>Only a Super Admin can create users. Please contact your Super Admin.</p>
            </div>
          ) : (
            <>
              <header className="uc-header">
                <div className="uc-header-left">
                  <div className="uc-icon-box"><UserPlus /></div>
                  <div>
                    <h1 className="uc-title">User Creation</h1>
                    <p className="uc-subtitle">Create accounts and set the role, organization and department for each user.</p>
                  </div>
                </div>
                <button className="uc-add-btn" type="button" onClick={openAdd}>
                  <UserPlus size={16} /> Create User
                </button>
              </header>

              <section className="uc-toolbar">
                <div className="uc-search">
                  <Search />
                  <input
                    type="search" value={query} placeholder="Search by name, email or ID..."
                    onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  />
                </div>
                <div className="uc-filters">
                  <label>
                    <span>{labels.role}:</span>
                    <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
                      <option>All</option>
                      {ROLES.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>{labels.status}:</span>
                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                      <option>All</option><option>Active</option><option>Inactive</option>
                    </select>
                  </label>
                </div>
              </section>

              <div className="uc-table-wrap">
                <table className="uc-table">
                  <thead>
                    <tr>
                      <th>{labels.name}</th><th>{labels.code}</th><th>{labels.role}</th><th>{labels.organization}</th>
                      <th>{labels.department}</th><th>{labels.status}</th><th className="uc-actions-col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="uc-empty">
                          {users.length === 0 ? "No users yet. Click “Create User” to add the first one." : "No users match your filters."}
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div className="uc-user-cell">
                              <span className="uc-avatar">{initialsOf(u.name)}</span>
                              <div><b>{u.name}</b><small>{u.email}</small></div>
                            </div>
                          </td>
                          <td className="uc-dim">{u.code}</td>
                          <td><span className="uc-role">{u.role}</span></td>
                          <td>{u.organization}</td>
                          <td className="uc-dim">{u.department || "—"}</td>
                          <td>
                            <span className={`uc-badge ${u.status === "Active" ? "uc-badge-active" : "uc-badge-inactive"}`}>{u.status}</span>
                          </td>
                          <td className="uc-actions-col">
                            <button className="uc-icon-btn" title="View" onClick={() => setModal({ mode: "view", user: u })}><Eye size={15} /></button>
                            <button className="uc-icon-btn" title="Edit" onClick={() => openEdit(u)}><Pencil size={15} /></button>
                            <button className="uc-icon-btn uc-danger" title="Delete" onClick={() => setModal({ mode: "delete", user: u })}><Trash2 size={15} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <footer className="uc-footer">
                <span className="uc-showing">
                  Showing <strong>{pageRows.length}</strong> of <strong>{filtered.length}</strong> users
                </span>
                <div className="uc-pagination">
                  <button className="uc-page-btn" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={14} /> Prev</button>
                  <span className="uc-page-label">Page {currentPage} of {totalPages}</span>
                  <button className="uc-page-btn" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next <ChevronRight size={14} /></button>
                </div>
              </footer>
            </>
          )}
      </main>

      {/* ---------- Create / Edit ---------- */}
      {isForm && (
        <div className="uc-overlay" onMouseDown={closeModal}>
          <form className="uc-modal" onSubmit={handleSave} onMouseDown={(e) => e.stopPropagation()} noValidate>
            <div className="uc-modal-header">
              <h2>{modal.mode === "add" ? "Create User" : "Edit User"}</h2>
              <button type="button" className="uc-close" onClick={closeModal} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="uc-modal-body">
              <div className="uc-rename-bar">
                <button type="button" className={`uc-rename-toggle${renameMode ? " on" : ""}`} onClick={() => setRenameMode((v) => !v)}>
                  {renameMode ? <><Check size={13} /> Done renaming</> : <><Pencil size={13} /> Rename fields</>}
                </button>
                {renameMode && <span>Click the pencil next to a name to change it.</span>}
              </div>
              {modal.mode === "edit" && (
                <div className="uc-field">
                  <FieldLabel id="uc-code" k="code" labels={labels} onRename={setLabel} rename={renameMode} required />
                  <input id="uc-code" value={form.code} onChange={(e) => setField("code", e.target.value)} placeholder="e.g. USR-0001" />
                  {errors.code && <em>{errors.code}</em>}
                </div>
              )}
              <div className="uc-field">
                <FieldLabel id="uc-name" k="name" labels={labels} onRename={setLabel} rename={renameMode} required />
                <input id="uc-name" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Saranya P" autoFocus />
                {errors.name && <em>{errors.name}</em>}
              </div>
              <div className="uc-field">
                <FieldLabel id="uc-email" k="email" labels={labels} onRename={setLabel} rename={renameMode} required />
                <input id="uc-email" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="name@company.com" />
                {errors.email && <em>{errors.email}</em>}
              </div>
              <div className="uc-field">
                <FieldLabel id="uc-phone" k="phone" labels={labels} onRename={setLabel} rename={renameMode} />
                <input id="uc-phone" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="uc-row">
                <div className="uc-field">
                  <FieldLabel id="uc-designation" k="designation" labels={labels} onRename={setLabel} rename={renameMode} />
                  <input id="uc-designation" value={form.designation} onChange={(e) => setField("designation", e.target.value)} placeholder="e.g. React Developer" />
                </div>
                <div className="uc-field">
                  <FieldLabel id="uc-joining" k="joiningDate" labels={labels} onRename={setLabel} rename={renameMode} />
                  <input id="uc-joining" type="date" value={form.joiningDate} onChange={(e) => setField("joiningDate", e.target.value)} />
                </div>
              </div>
              <div className="uc-row">
                <div className="uc-field">
                  <FieldLabel id="uc-role" k="role" labels={labels} onRename={setLabel} rename={renameMode} required />
                  <select id="uc-role" value={form.role} onChange={(e) => setField("role", e.target.value)}>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="uc-field">
                  <FieldLabel id="uc-status" k="status" labels={labels} onRename={setLabel} rename={renameMode} />
                  <select id="uc-status" value={form.status} onChange={(e) => setField("status", e.target.value)}>
                    <option>Active</option><option>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="uc-field">
                <FieldLabel id="uc-org" k="organization" labels={labels} onRename={setLabel} rename={renameMode} required />
                <select id="uc-org" value={form.organization} onChange={(e) => changeOrg(e.target.value)}>
                  <option value="">Select organization</option>
                  {activeOrgs.map((o) => <option key={o.name} value={o.name}>{o.name}</option>)}
                  {form.organization && !activeOrgs.some((o) => o.name === form.organization) && (
                    <option value={form.organization}>{form.organization}</option>
                  )}
                </select>
                {errors.organization && <em>{errors.organization}</em>}
              </div>
              <div className="uc-field">
                <FieldLabel id="uc-dept" k="department" labels={labels} onRename={setLabel} rename={renameMode} />
                <input id="uc-dept" value={form.department} onChange={(e) => setField("department", e.target.value)} placeholder="Auto-filled from the organization" />
              </div>

              {/* ---------- Extra fields ---------- */}
              <div className="uc-extra">
                <div className="uc-extra-head">
                  <b>Extra fields</b>
                  <small>Add any detail that isn’t in the form above.</small>
                </div>
                {form.customFields.map((c) => (
                  <div className="uc-extra-row" key={c.id}>
                    <input
                      value={c.label} placeholder="Field name (e.g. Blood Group)"
                      onChange={(e) => updateCustomField(c.id, "label", e.target.value)}
                    />
                    <input
                      value={c.value} placeholder="Value"
                      onChange={(e) => updateCustomField(c.id, "value", e.target.value)}
                    />
                    <button type="button" className="uc-icon-btn uc-danger" title="Remove field" onClick={() => removeCustomField(c.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                {errors.customFields && <em className="uc-extra-error">{errors.customFields}</em>}
                <button type="button" className="uc-btn-secondary uc-extra-add" onClick={addCustomField}>
                  <Plus size={14} /> Add field
                </button>
              </div>

              {modal.mode === "add" && (
                <div className="uc-field">
                  <FieldLabel id="uc-password" k="password" labels={labels} onRename={setLabel} rename={renameMode} required />
                  <div className="uc-pwd">
                    <input
                      id="uc-password" type={showPwd ? "text" : "password"} value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                    />
                    <button type="button" title={showPwd ? "Hide" : "Show"} onClick={() => setShowPwd((v) => !v)}>
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button type="button" title="Generate new password" onClick={() => setField("password", generatePassword())}>
                      <RefreshCw size={15} />
                    </button>
                  </div>
                  {errors.password && <em>{errors.password}</em>}
                  <small>The user should change this after the first login.</small>
                </div>
              )}
              {modal.mode === "add" && (
                <label className="uc-option">
                  <input type="checkbox" checked={form.sendEmail} onChange={(e) => setField("sendEmail", e.target.checked)} />
                  <span className="uc-switch" aria-hidden="true" />
                  <span className="uc-option-text">
                    <b>Email the login details to the user</b>
                    <small>
                      Sends the email and temporary password to{" "}
                      <i>{form.email.trim() || "the user's email address"}</i>
                    </small>
                  </span>
                </label>
              )}
              {apiError && <div className="uc-api-error">{apiError}</div>}
            </div>
            <div className="uc-modal-footer">
              <button type="button" className="uc-btn-secondary" onClick={closeModal}>Cancel</button>
              <button type="submit" className="uc-btn-primary" disabled={sending}>
                {sending ? "Creating..." : modal.mode === "add" ? "Create User" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------- Created: show credentials once ---------- */}
      {modal?.mode === "created" && (
        <div className="uc-overlay">
          <div className="uc-modal uc-modal-small">
            <div className="uc-modal-header">
              <h2>User created</h2>
              <button type="button" className="uc-close" onClick={closeModal} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="uc-modal-body">
              <p className="uc-text"><b>{modal.user.name}</b> ({modal.user.code}) was added to <b>{modal.user.organization}</b>.</p>
              {modal.backendOff ? (
                <div className="uc-note uc-note-warn">Email sending will start working once the backend is connected.</div>
              ) : modal.emailSent ? (
                <div className="uc-note uc-note-ok"><Check size={15} /> Login details were emailed to <b>{modal.credentials.email}</b>.</div>
              ) : (
                <div className="uc-note uc-note-warn">
                  {modal.emailRequested
                    ? "The user was created, but the email could not be sent. Please share these login details manually."
                    : "No email was sent. Share these login details with the user."}
                </div>
              )}
              <p className="uc-text">The password will not be shown again.</p>
              <div className="uc-cred">
                <div><span>Email</span><b>{modal.credentials.email}</b></div>
                <div><span>Temporary password</span><b className="uc-mono">{modal.credentials.password}</b></div>
              </div>
            </div>
            <div className="uc-modal-footer">
              <button type="button" className="uc-btn-secondary" onClick={copyCredentials}>
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
              <button type="button" className="uc-btn-primary" onClick={closeModal}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- View ---------- */}
      {modal?.mode === "view" && (
        <div className="uc-overlay" onMouseDown={closeModal}>
          <div className="uc-modal uc-modal-small" onMouseDown={(e) => e.stopPropagation()}>
            <div className="uc-modal-header">
              <h2>User Details</h2>
              <button type="button" className="uc-close" onClick={closeModal} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="uc-modal-body">
              {[
                [labels.name, modal.user.name], [labels.code, modal.user.code], [labels.email, modal.user.email],
                [labels.phone, modal.user.phone || "—"], [labels.role, modal.user.role],
                [labels.designation, modal.user.designation || "—"], [labels.joiningDate, modal.user.joiningDate || "—"],
                [labels.organization, modal.user.organization], [labels.department, modal.user.department || "—"],
                [labels.status, modal.user.status], ["Created on", modal.user.createdAt],
                ...(modal.user.customFields || []).map((c) => [c.label, c.value || "—"]),
              ].map(([l, v]) => (
                <div className="uc-view-row" key={l}><span>{l}</span><b>{v}</b></div>
              ))}
            </div>
            <div className="uc-modal-footer">
              <button type="button" className="uc-btn-primary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Delete ---------- */}
      {modal?.mode === "delete" && (
        <div className="uc-overlay" onMouseDown={closeModal}>
          <div className="uc-modal uc-modal-small" onMouseDown={(e) => e.stopPropagation()}>
            <div className="uc-modal-header">
              <h2>Delete User</h2>
              <button type="button" className="uc-close" onClick={closeModal} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="uc-modal-body">
              <p className="uc-text">Are you sure you want to delete <b>{modal.user.name}</b>? This action cannot be undone.</p>
            </div>
            <div className="uc-modal-footer">
              <button type="button" className="uc-btn-secondary" onClick={closeModal}>Cancel</button>
              <button type="button" className="uc-btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}