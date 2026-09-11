import React, { useState } from "react";
import {
  Search,
  Plus,
  Building2,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Sidebar from "./Sidebar";
import "./Organizations.css";

const INITIAL_ORGANIZATIONS = [
  {
    name: "Lernevo Tech",
    industry: "Technology",
    country: "United States",
    website: "https://lernevo.tech",
    status: "Active",
  },
  {
    name: "GreenLeaf Wellness",
    industry: "Health & Wellness",
    country: "Canada",
    website: "https://greenleaf.ca",
    status: "Active",
  },
  {
    name: "Northwind Logistics",
    industry: "Logistics",
    country: "United Kingdom",
    website: "https://northwind.co.uk",
    status: "Active",
  },
  {
    name: "Acme Retail",
    industry: "Retail",
    country: "Australia",
    website: "https://acme.com.au",
    status: "Inactive",
  },
];

const STATUS_OPTIONS = ["All", "Active", "Inactive"];

const EMPTY_FORM = {
  name: "",
  industry: "",
  country: "",
  website: "",
  status: "Active",
};

export default function Organizations() {
  const [organizations, setOrganizations] = useState(INITIAL_ORGANIZATIONS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusOpen, setStatusOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // modal: { mode: "add" | "edit" | "view" | "delete", org?: original org being edited/viewed/deleted }
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = organizations.filter((org) => {
    const matchesQuery = org.name.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || org.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal({ mode: "add" });
  };

  const openEdit = (org) => {
    setForm({ ...org });
    setModal({ mode: "edit", org });
  };

  const openView = (org) => {
    setModal({ mode: "view", org });
  };

  const openDelete = (org) => {
    setModal({ mode: "delete", org });
  };

  const closeModal = () => {
    setModal(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;

    if (modal.mode === "add") {
      setOrganizations((prev) => [...prev, { ...form }]);
    } else if (modal.mode === "edit") {
      setOrganizations((prev) =>
        prev.map((o) => (o === modal.org ? { ...form } : o))
      );
      if (selected === modal.org.name && modal.org.name !== form.name) {
        setSelected(form.name);
      }
    }
    closeModal();
  };

  const handleConfirmDelete = () => {
    setOrganizations((prev) => prev.filter((o) => o !== modal.org));
    if (selected === modal.org.name) setSelected(null);
    closeModal();
  };

  const isFormMode = modal && (modal.mode === "add" || modal.mode === "edit");

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: "auto", height: "100vh" }}>
        <div className="orgs-page">
          <div className="orgs-header">
            <div className="orgs-header-left">
              <div className="orgs-icon-box">
                <Building2 />
              </div>
              <div>
                <div className="orgs-title">Organizations</div>
                <div className="orgs-subtitle">Manage organizations across the platform.</div>
              </div>
            </div>
            <button className="orgs-add-btn" onClick={openAdd}>
              <Plus size={16} />
              Add Organization
            </button>
          </div>

          <div className="orgs-toolbar">
            <div className="orgs-search">
              <Search />
              <input
                type="text"
                placeholder="Search organizations..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="orgs-status-filter">
              <span className="orgs-status-label">Status:</span>
              <div className="orgs-status-select">
                <button
                  className="orgs-status-btn"
                  onClick={() => setStatusOpen((v) => !v)}
                >
                  {statusFilter}
                  <ChevronDown size={14} />
                </button>
                {statusOpen && (
                  <div className="orgs-status-menu">
                    {STATUS_OPTIONS.map((s) => (
                      <div
                        key={s}
                        className="orgs-status-option"
                        onClick={() => {
                          setStatusFilter(s);
                          setStatusOpen(false);
                        }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="orgs-table-wrap">
            <table className="orgs-table">
              <thead>
                <tr>
                  <th className="orgs-checkbox-col"></th>
                  <th>Name</th>
                  <th>Industry</th>
                  <th>Country</th>
                  <th>Website</th>
                  <th>Status</th>
                  <th className="orgs-actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="orgs-empty-row">
                      No organizations found.
                    </td>
                  </tr>
                )}
                {filtered.map((org) => (
                  <tr key={org.name}>
                    <td className="orgs-checkbox-col">
                      <button
                        className={`orgs-radio ${selected === org.name ? "orgs-radio-checked" : ""}`}
                        onClick={() =>
                          setSelected(selected === org.name ? null : org.name)
                        }
                      />
                    </td>
                    <td className="orgs-name-cell">{org.name}</td>
                    <td className="orgs-dim-cell">{org.industry}</td>
                    <td className="orgs-dim-cell">{org.country}</td>
                    <td>
                      <a
                        className="orgs-link-cell"
                        href={org.website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {org.website}
                      </a>
                    </td>
                    <td>
                      <span
                        className={`orgs-status-badge ${
                          org.status === "Active" ? "orgs-status-active" : "orgs-status-inactive"
                        }`}
                      >
                        {org.status}
                      </span>
                    </td>
                    <td className="orgs-actions-col">
                      <button
                        className="orgs-icon-btn"
                        title="View"
                        onClick={() => openView(org)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="orgs-icon-btn"
                        title="Edit"
                        onClick={() => openEdit(org)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="orgs-icon-btn orgs-icon-btn-danger"
                        title="Delete"
                        onClick={() => openDelete(org)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="orgs-footer">
            <div className="orgs-showing">
              Showing <strong>{filtered.length === 0 ? 0 : 1}–{filtered.length}</strong> of{" "}
              <strong>{organizations.length}</strong>
            </div>
            <div className="orgs-pagination">
              <button className="orgs-page-btn" disabled>
                <ChevronLeft size={14} />
                Prev
              </button>
              <span className="orgs-page-label">Page 1 / 1</span>
              <button className="orgs-page-btn" disabled>
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit modal */}
      {isFormMode && (
        <div className="orgs-modal-overlay" onClick={closeModal}>
          <div className="orgs-modal" onClick={(e) => e.stopPropagation()}>
            <div className="orgs-modal-header">
              <div className="orgs-modal-title">
                {modal.mode === "add" ? "Add Organization" : "Edit Organization"}
              </div>
              <button className="orgs-modal-close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="orgs-modal-body">
              <label className="orgs-field">
                <span>Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="Organization name"
                  autoFocus
                />
              </label>

              <label className="orgs-field">
                <span>Industry</span>
                <input
                  type="text"
                  value={form.industry}
                  onChange={(e) => handleFormChange("industry", e.target.value)}
                  placeholder="e.g. Technology"
                />
              </label>

              <label className="orgs-field">
                <span>Country</span>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => handleFormChange("country", e.target.value)}
                  placeholder="e.g. United States"
                />
              </label>

              <label className="orgs-field">
                <span>Website</span>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => handleFormChange("website", e.target.value)}
                  placeholder="https://example.com"
                />
              </label>

              <label className="orgs-field">
                <span>Status</span>
                <select
                  value={form.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>

            <div className="orgs-modal-footer">
              <button className="orgs-btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="orgs-btn-primary"
                onClick={handleSave}
                disabled={!form.name.trim()}
              >
                {modal.mode === "add" ? "Add Organization" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View modal */}
      {modal && modal.mode === "view" && (
        <div className="orgs-modal-overlay" onClick={closeModal}>
          <div className="orgs-modal" onClick={(e) => e.stopPropagation()}>
            <div className="orgs-modal-header">
              <div className="orgs-modal-title">Organization Details</div>
              <button className="orgs-modal-close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="orgs-modal-body">
              <div className="orgs-view-row">
                <span className="orgs-view-label">Name</span>
                <span className="orgs-view-value">{modal.org.name}</span>
              </div>
              <div className="orgs-view-row">
                <span className="orgs-view-label">Industry</span>
                <span className="orgs-view-value">{modal.org.industry}</span>
              </div>
              <div className="orgs-view-row">
                <span className="orgs-view-label">Country</span>
                <span className="orgs-view-value">{modal.org.country}</span>
              </div>
              <div className="orgs-view-row">
                <span className="orgs-view-label">Website</span>
                <a
                  className="orgs-view-value orgs-link-cell"
                  href={modal.org.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  {modal.org.website}
                </a>
              </div>
              <div className="orgs-view-row">
                <span className="orgs-view-label">Status</span>
                <span
                  className={`orgs-status-badge ${
                    modal.org.status === "Active" ? "orgs-status-active" : "orgs-status-inactive"
                  }`}
                >
                  {modal.org.status}
                </span>
              </div>
            </div>

            <div className="orgs-modal-footer">
              <button className="orgs-btn-secondary" onClick={closeModal}>
                Close
              </button>
              <button
                className="orgs-btn-primary"
                onClick={() => openEdit(modal.org)}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {modal && modal.mode === "delete" && (
        <div className="orgs-modal-overlay" onClick={closeModal}>
          <div className="orgs-modal orgs-modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="orgs-modal-header">
              <div className="orgs-modal-title">Delete Organization</div>
              <button className="orgs-modal-close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="orgs-modal-body">
              <p className="orgs-confirm-text">
                Are you sure you want to delete <strong>{modal.org.name}</strong>? This
                action cannot be undone.
              </p>
            </div>

            <div className="orgs-modal-footer">
              <button className="orgs-btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button className="orgs-btn-danger" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}