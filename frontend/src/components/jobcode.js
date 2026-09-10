// jobcode.js
import React, { useState } from "react";
import "./jobcode.css";

const JOB_CODES = [
  {
    code: "DES-3",
    title: "Senior Product Designer",
    department: "Design",
    level: "Senior",
    description: "Leads end-to-end design for core experiences.",
    employees: 1,
    icon: "🎨",
  },
  {
    code: "ENG-2",
    title: "Software Engineer II",
    department: "Engineering",
    level: "Mid",
    description: "Builds and ships product features across the stack.",
    employees: 2,
    icon: "🛠️",
  },
  {
    code: "ENG-4",
    title: "Staff Engineer",
    department: "Engineering",
    level: "Lead",
    description: "Owns technical direction for a product area.",
    employees: 1,
    icon: "🧭",
  },
  {
    code: "MKT-3",
    title: "Growth Marketing Manager",
    department: "Marketing",
    level: "Senior",
    description: "Runs acquisition and lifecycle campaigns.",
    employees: 1,
    icon: "📈",
  },
  {
    code: "PPL-1",
    title: "People Operations Coordinator",
    department: "People",
    level: "Junior",
    description: "Supports onboarding, benefits and employee programs.",
    employees: 1,
    icon: "🤝",
  },
];

export default function JobCodesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobCodes, setJobCodes] = useState(JOB_CODES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJob, setNewJob] = useState({
    code: "",
    title: "",
    department: "",
    level: "Mid",
    description: "",
    employees: 1,
    icon: "💼",
  });

  const totalEmployees = jobCodes.reduce((sum, j) => sum + j.employees, 0);
  const totalDepartments = new Set(jobCodes.map((j) => j.department)).size;

  const filteredJobs = jobCodes.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddJob = () => {
    if (!newJob.code || !newJob.title || !newJob.department) {
      alert("Please fill in Code, Title, and Department");
      return;
    }
    setJobCodes([...jobCodes, { ...newJob, employees: parseInt(newJob.employees) }]);
    setNewJob({
      code: "",
      title: "",
      department: "",
      level: "Mid",
      description: "",
      employees: 1,
      icon: "💼",
    });
    setShowAddForm(false);
  };

  const handleDeleteJob = (codeToDelete) => {
    if (window.confirm(`Delete job code ${codeToDelete}?`)) {
      setJobCodes(jobCodes.filter((job) => job.code !== codeToDelete));
    }
  };

  return (
    <div className="jc-page">
      <div className="jc-container">
        {/* ===== BANNER ===== */}
        <div className="jc-banner">
          <div className="jc-org-block">
            <div className="jc-logo">NC</div>
            <div>
              <p className="jc-org-label">Organization</p>
              <h1 className="jc-org-name">Northwind Collective</h1>
              <p className="jc-org-sub">
                Software &amp; Services · San Francisco, CA · 51-200 employees
              </p>
            </div>
          </div>
          <div className="jc-header-actions">
            <button className="jc-btn">
              <i className="fas fa-pen" /> Edit company
            </button>
            <button className="jc-btn jc-btn-icon-only" title="Log out">
              <i className="fas fa-sign-out-alt" />
            </button>
          </div>
        </div>

        {/* ===== STATS ===== */}
        <div className="jc-stats">
          <div className="jc-stat">
            <span className="jc-stat-value">{jobCodes.length}</span>
            <span className="jc-stat-label">Job codes</span>
          </div>
          <div className="jc-stat-divider" />
          <div className="jc-stat">
            <span className="jc-stat-value">{totalDepartments}</span>
            <span className="jc-stat-label">Departments</span>
          </div>
          <div className="jc-stat-divider" />
          <div className="jc-stat">
            <span className="jc-stat-value">{totalEmployees}</span>
            <span className="jc-stat-label">Employees classified</span>
          </div>
        </div>

        {/* ===== TOOLBAR WITH SEARCH & ADD BUTTON ===== */}
        <div className="jc-toolbar">
          <div>
            <h2 className="jc-toolbar-title">Job Codes</h2>
            <p className="jc-toolbar-sub">
              Standardized roles used to classify employees.
            </p>
          </div>
          <div className="jc-toolbar-actions">
            <div className="nav-search">
              <i className="fas fa-search" />
              <input
                type="text"
                placeholder="Search job codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="jc-btn jc-btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <i className="fas fa-plus" /> {showAddForm ? "Cancel" : "Add job code"}
            </button>
          </div>
        </div>

        {/* ===== ADD FORM ===== */}
        {showAddForm && (
          <div className="jc-add-form">
            <div className="jc-form-grid">
              <div className="jc-form-group">
                <label>Job Code *</label>
                <input
                  type="text"
                  placeholder="e.g., ENG-5"
                  value={newJob.code}
                  onChange={(e) => setNewJob({ ...newJob, code: e.target.value })}
                />
              </div>
              <div className="jc-form-group">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="Job title"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                />
              </div>
              <div className="jc-form-group">
                <label>Department *</label>
                <input
                  type="text"
                  placeholder="Department"
                  value={newJob.department}
                  onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                />
              </div>
              <div className="jc-form-group">
                <label>Level</label>
                <select
                  value={newJob.level}
                  onChange={(e) => setNewJob({ ...newJob, level: e.target.value })}
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
              <div className="jc-form-group jc-form-full">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="Brief description"
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                />
              </div>
              <div className="jc-form-group">
                <label>Employees</label>
                <input
                  type="number"
                  min="1"
                  value={newJob.employees}
                  onChange={(e) => setNewJob({ ...newJob, employees: e.target.value })}
                />
              </div>
              <div className="jc-form-group">
                <label>Icon (emoji)</label>
                <input
                  type="text"
                  placeholder="🎯"
                  value={newJob.icon}
                  onChange={(e) => setNewJob({ ...newJob, icon: e.target.value })}
                />
              </div>
            </div>
            <div className="jc-form-actions">
              <button className="jc-btn jc-btn-secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button className="jc-btn jc-btn-primary" onClick={handleAddJob}>
                <i className="fas fa-save" /> Save Job Code
              </button>
            </div>
          </div>
        )}

        {/* ===== CARDS ===== */}
        <div className="jc-grid">
          {filteredJobs.length === 0 ? (
            <div className="jc-empty-state">
              <i className="fas fa-search" />
              <p>No job codes found matching "{searchTerm}"</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div className="jc-card" key={job.code} data-dept={job.department}>
                <button
                  className="jc-card-delete"
                  onClick={() => handleDeleteJob(job.code)}
                  title="Delete job code"
                >
                  <i className="fas fa-trash-alt" />
                </button>
                <div className="jc-card-top">
                  <span className="jc-card-icon">{job.icon}</span>
                  <span className="jc-code-tag">{job.code}</span>
                </div>
                <h3 className="jc-card-title">{job.title}</h3>
                <p className="jc-card-meta">
                  {job.department} <span className="jc-dot">•</span> {job.level}
                </p>
                <p className="jc-card-desc">{job.description}</p>
                <div className="jc-card-footer">
                  <span className="jc-avatar-stack">
                    {Array.from({ length: Math.min(job.employees, 3) }).map(
                      (_, i) => (
                        <span className="jc-avatar" key={i} />
                      )
                    )}
                  </span>
                  <span className="jc-employee-count">
                    <i className="fas fa-user" /> {job.employees} employee{job.employees !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Add new card - only show if no form */}
          {!showAddForm && (
            <button
              className="jc-card jc-card-add"
              onClick={() => setShowAddForm(true)}
            >
              <span className="jc-add-icon"><i className="fas fa-plus-circle" /></span>
              <span className="jc-add-text">Add a new job code</span>
            </button>
          )}
        </div>

      
      </div>
    </div>
  );
}