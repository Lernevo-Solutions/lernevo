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
} from "lucide-react";
import Sidebar from "./Sidebar";
import "./Organizations.css";

const ORGANIZATIONS = [
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

export default function Organizations() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusOpen, setStatusOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = ORGANIZATIONS.filter((org) => {
    const matchesQuery = org.name.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || org.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

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
        <button className="orgs-add-btn">
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
                  <button className="orgs-icon-btn">
                    <Eye size={15} />
                  </button>
                  <button className="orgs-icon-btn">
                    <Pencil size={15} />
                  </button>
                  <button className="orgs-icon-btn orgs-icon-btn-danger">
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
          Showing <strong>1–{filtered.length}</strong> of <strong>{ORGANIZATIONS.length}</strong>
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
    </div>
  );
}