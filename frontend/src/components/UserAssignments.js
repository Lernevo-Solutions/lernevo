// UserAssignments.js
// User Assignments page: assign users to organizations / job codes with
// start dates. Separate from the Users master list.

import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  UserCog,
  Search,
  Download,
  Upload,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import "./UserAssignments.css";
import Sidebar from "./Sidebar";
const PAGE_SIZE = 10;

/* ============================== EXCEL HELPERS ============================== */

function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function mapRow(row, keyMap) {
  const normalize = (s) => String(s).trim().toLowerCase().replace(/\s+/g, "");
  const rowKeysNormalized = {};
  Object.keys(row).forEach((k) => {
    rowKeysNormalized[normalize(k)] = row[k];
  });
  const result = {};
  Object.entries(keyMap).forEach(([internalKey, possibleHeaders]) => {
    const match = possibleHeaders.map(normalize).find((h) => h in rowKeysNormalized);
    result[internalKey] = match !== undefined ? rowKeysNormalized[match] : "";
  });
  return result;
}

function uniqueValues(rows, key) {
  return Array.from(new Set(rows.map((r) => r[key]).filter(Boolean)));
}

function initials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/* ============================== SEED DATA ============================== */

const seedAssignments = [
  {
    id: 1,
    userName: "Saranya P",
    email: "saranyapandiyarajan30@gmail.com",
    organization: "Lernevo Tech",
    jobCode: "React Developer",
    startDate: "2025-04-01",
    endDate: "",
    status: "Active",
  },
  {
    id: 2,
    userName: "Thanga Janani",
    email: "thangajanani6@gmail.com",
    organization: "Lernevo Tech",
    jobCode: "UI Designer",
    startDate: "2025-05-15",
    endDate: "",
    status: "Active",
  },
];

/* ============================== SMALL BITS ============================== */

function StatusBadge({ status }) {
  const cls =
    status === "Active" ? "badge badge-success" :
    status === "Pending" ? "badge badge-warning" :
    status === "Inactive" ? "badge badge-muted" : "badge badge-neutral";
  return <span className={cls}>{status || "—"}</span>;
}

function Dash({ value }) {
  return value ? <span>{value}</span> : <span className="muted">—</span>;
}

function Filter({ label, value, onChange, options }) {
  return (
    <div className="admin-filter">
      <span>{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option>All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function Footer({ countLabel, page, totalPages, onPrev, onNext }) {
  return (
    <div className="admin-footer">
      <span>{countLabel}</span>
      <div className="pagination">
        <button onClick={onPrev} disabled={page <= 1}><ChevronLeft size={13} /> Prev</button>
        <span className="page-label">Page {page} / {totalPages}</span>
        <button onClick={onNext} disabled={page >= totalPages}>Next <ChevronRight size={13} /></button>
      </div>
    </div>
  );
}

/* ============================== ASSIGN MODAL ============================== */

function AssignModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(
    initial || {
      userName: "",
      email: "",
      organization: "",
      jobCode: "",
      startDate: "",
      endDate: "",
      status: "Active",
    }
  );

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>{initial ? "Edit Assignment" : "Assign User"}</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="admin-modal-body">
          <label>
            User Name
            <input
              value={form.userName}
              onChange={(e) => update("userName", e.target.value)}
              placeholder="e.g. Saranya P"
            />
          </label>
          <label>
            Email
            <input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="name@company.com"
            />
          </label>
          <label>
            Organization
            <input
              value={form.organization}
              onChange={(e) => update("organization", e.target.value)}
              placeholder="e.g. Lernevo Tech"
            />
          </label>
          <label>
            Job Code
            <input
              value={form.jobCode}
              onChange={(e) => update("jobCode", e.target.value)}
              placeholder="e.g. React Developer"
            />
          </label>

          {/* End Date removed — Start Date only */}
          <label>
            Start Date
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
            />
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option>Active</option>
              <option>Pending</option>
              <option>Inactive</option>
            </select>
          </label>
        </div>

        <div className="admin-modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!form.userName.trim()) return;
              onSave(form);
            }}
          >
            {initial ? "Save Changes" : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================== USER ASSIGNMENTS PAGE ============================== */

export default function UserAssignments() {
  const [assignments, setAssignments] = useState(seedAssignments);
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("All");
  const [jobFilter, setJobFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [importError, setImportError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const fileInputRef = useRef(null);

  const orgs = useMemo(() => uniqueValues(assignments, "organization"), [assignments]);
  const jobs = useMemo(() => uniqueValues(assignments, "jobCode"), [assignments]);
  const statuses = useMemo(() => uniqueValues(assignments, "status"), [assignments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignments.filter((a) => {
      const matchesSearch =
        !q ||
        a.userName?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q);
      const matchesOrg = orgFilter === "All" || a.organization === orgFilter;
      const matchesJob = jobFilter === "All" || a.jobCode === jobFilter;
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      return matchesSearch && matchesOrg && matchesJob && matchesStatus;
    });
  }, [assignments, search, orgFilter, jobFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError("");
    try {
      const rows = await readExcelFile(file);
      const mapped = rows.map((r) =>
        mapRow(r, {
          userName: ["User Name", "Name", "User"],
          email: ["Email"],
          organization: ["Organization", "Org"],
          jobCode: ["Job Code", "JobCode"],
          startDate: ["Start Date", "StartDate"],
          endDate: ["End Date", "EndDate"],
          status: ["Status"],
        })
      );
      setAssignments(mapped.map((m, i) => ({ ...m, id: i + 1 })));
      setPage(1);
    } catch (err) {
      setImportError("Couldn't read that file. Please upload a valid Excel (.xlsx) file.");
    } finally {
      e.target.value = "";
    }
  }

  function exportCsv() {
    const headers = ["User Name", "Email", "Organization", "Job Code", "Start Date", "End Date", "Status"];
    const lines = [headers.join(",")].concat(
      filtered.map((a) =>
        [a.userName, a.email, a.organization, a.jobCode, a.startDate, a.endDate, a.status]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user-assignments.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSave(form) {
    if (editing) {
      setAssignments((list) => list.map((a) => (a.id === editing.id ? { ...a, ...form } : a)));
    } else {
      setAssignments((list) => [
        { ...form, id: Date.now() },
        ...list,
      ]);
    }
    setModalOpen(false);
    setEditing(null);
  }

  function handleDelete(id) {
    setAssignments((list) => list.filter((a) => a.id !== id));
  }

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        {/* ===== Header ===== */}
        <div className="admin-header">
          <div className="admin-header-left">
            <div className="admin-icon-badge"><UserCog size={20} /></div>
            <div>
              <h1 className="admin-title">User Assignments</h1>
              <p className="admin-subtitle">Assign users to organizations and job codes.</p>
            </div>
          </div>
          <div className="admin-header-actions">
            <button className="btn" onClick={exportCsv}><Download size={15} /> Export</button>
            <label className="btn">
              <Upload size={15} /> Import Excel
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} />
            </label>
            <button className="btn btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
              <Plus size={15} /> Assign User
            </button>
          </div>
        </div>

        {importError && <div className="import-error">{importError}</div>}

        {/* ===== Toolbar ===== */}
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={15} />
            <input
              placeholder="Search by user name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="admin-filters">
            <Filter label="Org" value={orgFilter} onChange={setOrgFilter} options={orgs} />
            <Filter label="Job Code" value={jobFilter} onChange={setJobFilter} options={jobs} />
            <Filter label="Status" value={statusFilter} onChange={setStatusFilter} options={statuses} />
          </div>
        </div>

        {/* ===== Table ===== */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="col-check"><input type="checkbox" className="checkbox" /></th>
                <th>User</th>
                <th>Email</th>
                <th>Organization</th>
                <th>Job Code</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={9} className="admin-empty">No assignments found.</td></tr>
              ) : (
                pageRows.map((a) => (
                  <tr key={a.id}>
                    <td><input type="checkbox" className="checkbox" /></td>
                    <td>
                      <div className="name-cell">
                        <span className="avatar">{initials(a.userName)}</span>
                        {a.userName}
                      </div>
                    </td>
                    <td className="email-cell">{a.email}</td>
                    <td><Dash value={a.organization} /></td>
                    <td><Dash value={a.jobCode} /></td>
                    <td><Dash value={a.startDate} /></td>
                    <td><Dash value={a.endDate} /></td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>
                      <div className="actions-cell">
                        <button className="icon-btn" title="View"><Eye size={16} /></button>
                        <button
                          className="icon-btn"
                          title="Edit"
                          onClick={() => { setEditing(a); setModalOpen(true); }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-btn danger"
                          title="Delete"
                          onClick={() => handleDelete(a.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===== Footer ===== */}
        <Footer
          countLabel={`Showing ${filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}\u2013${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />

        {/* ===== Modal ===== */}
        {modalOpen && (
          <AssignModal
            initial={editing}
            onClose={() => { setModalOpen(false); setEditing(null); }}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}