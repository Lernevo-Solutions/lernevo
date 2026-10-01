import React, { useMemo, useState, useEffect } from "react";
import { Download, Eye, FileText, Lock, Search, ShieldCheck, Trash2, X } from "lucide-react";
import Sidebar from "./Sidebar";
import "./Payslip.css";

// Shared key with Scheduler
const STORAGE_KEY = "schedules_v1";

const FALLBACK_SCHEDULES = [
  {
    id: "t1", employee: "Arav Kumar", employeeId: "EMP1001",
    homeRegion: "IN", scheduleStyle: "ROTA", workDate: "2026-09-08",
    checkIn: "2026-09-08T03:30:00Z", checkOut: "2026-09-08T12:00:00Z",
    breakMin: 45, status: "Approved", hourlyRate: 500,
  },
];

function computeHours(checkIn, checkOut, breakMin) {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, ms / 3600000 - breakMin / 60);
}
function fmtMoney(n) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
function monthLabel(isoDate) {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" })
    .format(new Date(isoDate));
}

// Auto-generate payslip from an approved shift
function buildPayslip(schedule) {
  const hours = computeHours(schedule.checkIn, schedule.checkOut, schedule.breakMin);
  const overtime = hours > 8 ? hours - 8 : 0;
  const rate = schedule.hourlyRate || 500;
  const gross = hours * rate + overtime * rate * 0.5; // OT at 1.5x
  const pf = gross * 0.12;
  const tax = gross * 0.05;
  const net = gross - pf - tax;
  return {
    id: `p-${schedule.id}`,
    scheduleId: schedule.id,
    employeeName: schedule.employee,
    employeeId: schedule.employeeId || "—",
    month: monthLabel(schedule.workDate),
    workDate: schedule.workDate,
    hours, overtime, rate,
    gross, pf, tax, net,
    status: schedule.status === "Approved" ? "Paid" : "Pending",
    generatedOn: new Date().toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    }),
  };
}

export default function Payslip() {
  const [schedules, setSchedules] = useState([]);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [modal, setModal] = useState(null);

  // Load schedules from Scheduler (localStorage bridge)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      setSchedules(parsed && parsed.length ? parsed : FALLBACK_SCHEDULES);
    } catch {
      setSchedules(FALLBACK_SCHEDULES);
    }
  }, []);

  // Auto-generate payslips from APPROVED schedules only
  const payslips = useMemo(() => {
    return schedules
      .filter((s) => s.status === "Approved" || s.status === "Submitted")
      .map(buildPayslip);
  }, [schedules]);

  const searchResults = useMemo(() => {
    const term = activeQuery.trim().toLowerCase();
    if (!term) return [];
    return payslips.filter((p) =>
      `${p.employeeName} ${p.employeeId} ${p.month} ${p.status}`
        .toLowerCase()
        .includes(term)
    );
  }, [payslips, activeQuery]);

  const runSearch = () => { setActiveQuery(query); setHasSearched(true); };
  const clearSearch = () => { setQuery(""); setActiveQuery(""); setHasSearched(false); };
  const closeModal = () => setModal(null);

  const downloadPayslip = (p) => {
    const text = `PAYSLIP — ${p.month}
-----------------------------
Employee: ${p.employeeName} (${p.employeeId})
Work Date: ${p.workDate}
Hours: ${p.hours.toFixed(2)}h  |  Overtime: ${p.overtime.toFixed(2)}h
Rate: ${fmtMoney(p.rate)}/hr

Gross Pay:   ${fmtMoney(p.gross)}
PF (12%):   -${fmtMoney(p.pf)}
Tax (5%):   -${fmtMoney(p.tax)}
-----------------------------
Net Pay:     ${fmtMoney(p.net)}
Status:      ${p.status}
Generated:   ${p.generatedOn}`;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `payslip-${p.employeeId}-${p.month.replace(" ", "-")}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="compliance-layout">
      <Sidebar />
      <div className="compliance-content-scroll">
        <main className="compliance-page">
          <header className="compliance-header">
            <div className="compliance-header-left">
              <div className="compliance-icon-box" aria-hidden="true"><FileText /></div>
              <div>
                <h1>Payslip</h1>
                <p>Auto-generated from approved scheduler shifts.</p>
              </div>
            </div>
            <span className="compliance-secure-badge"><Lock size={14} />Auto-generated</span>
          </header>

          <section className="compliance-search-row">
            <div className="compliance-search">
              <Search aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                type="search"
                placeholder="Search by employee name, ID, or month..."
              />
              {query && (
                <button type="button" className="compliance-search-clear"
                  onClick={clearSearch} aria-label="Clear"><X size={15} /></button>
              )}
            </div>
            <button type="button" className="compliance-search-button" onClick={runSearch}>
              <Search size={15} />Search
            </button>
          </section>

          <div className="compliance-auto-banner">
            <ShieldCheck size={16} />
            <span>
              <strong>{payslips.length}</strong> payslip{payslips.length !== 1 ? "s" : ""} ready —
              auto-generated from approved scheduler shifts.
            </span>
          </div>

          {!hasSearched && (
            <p className="compliance-search-hint">
              Enter a name or month above to view payslips.
            </p>
          )}

          {hasSearched && (
            <div className="compliance-table-wrap">
              <table className="compliance-table">
                <thead>
                  <tr>
                    <th>Employee</th><th>Month</th><th>Hours</th>
                    <th>Gross</th><th>Net Pay</th><th>Status</th>
                    <th className="compliance-actions-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.length === 0 ? (
                    <tr><td colSpan={7} className="compliance-empty">
                      No payslips found for "{activeQuery}".
                    </td></tr>
                  ) : searchResults.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="compliance-employee-cell">
                          <span className="compliance-employee-name">{p.employeeName}</span>
                          <span className="compliance-employee-id">{p.employeeId}</span>
                        </div>
                      </td>
                      <td className="compliance-muted-cell">{p.month}</td>
                      <td>{p.hours.toFixed(2)}h</td>
                      <td>{fmtMoney(p.gross)}</td>
                      <td><strong>{fmtMoney(p.net)}</strong></td>
                      <td>
                        <span className={`compliance-status ${p.status === "Pending" ? "compliance-status-pending" : ""}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="compliance-actions-column">
                        <button className="compliance-action" title="View"
                          onClick={() => setModal({ mode: "view", payslip: p })}><Eye size={15} /></button>
                        <button className="compliance-action" title="Download"
                          onClick={() => downloadPayslip(p)}><Download size={15} /></button>
                        <button className="compliance-action compliance-delete-action" title="Delete"
                          onClick={() => setModal({ mode: "delete", payslip: p })}><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {modal?.mode === "view" && (
        <div className="compliance-modal-overlay" onMouseDown={closeModal}>
          <section className="compliance-modal" onMouseDown={(e) => e.stopPropagation()}>
            <ModalHeader title="Payslip Details" onClose={closeModal} />
            <div className="compliance-view-body">
              <div className="compliance-view-row">
                <Detail label="Employee Name" value={modal.payslip.employeeName} />
                <Detail label="Employee ID" value={modal.payslip.employeeId} />
              </div>
              <div className="compliance-view-row">
                <Detail label="Month" value={modal.payslip.month} />
                <Detail label="Work Date" value={modal.payslip.workDate} />
              </div>
              <div className="compliance-view-row">
                <Detail label="Hours" value={`${modal.payslip.hours.toFixed(2)}h`} />
                <Detail label="Overtime" value={`${modal.payslip.overtime.toFixed(2)}h`} />
              </div>
              <div className="compliance-payslip-breakdown">
                <div className="compliance-payslip-line">
                  <span>Gross Pay</span><strong>{fmtMoney(modal.payslip.gross)}</strong>
                </div>
                <div className="compliance-payslip-line">
                  <span>PF (12%)</span><strong className="neg">-{fmtMoney(modal.payslip.pf)}</strong>
                </div>
                <div className="compliance-payslip-line">
                  <span>Tax (5%)</span><strong className="neg">-{fmtMoney(modal.payslip.tax)}</strong>
                </div>
                <div className="compliance-payslip-line total">
                  <span>Net Pay</span><strong>{fmtMoney(modal.payslip.net)}</strong>
                </div>
              </div>
              <Detail label="Status" value={modal.payslip.status} />
              <Detail label="Generated On" value={modal.payslip.generatedOn} />
            </div>
            <div className="compliance-modal-actions">
              <button type="button" className="compliance-download-button"
                onClick={() => downloadPayslip(modal.payslip)}>
                <Download size={14} />Download
              </button>
              <button type="button" className="compliance-save-button" onClick={closeModal}>Close</button>
            </div>
          </section>
        </div>
      )}

      {modal?.mode === "delete" && (
        <div className="compliance-modal-overlay" onMouseDown={closeModal}>
          <section className="compliance-modal compliance-confirm-modal" onMouseDown={(e) => e.stopPropagation()}>
            <ModalHeader title="Delete Payslip" onClose={closeModal} />
            <div className="compliance-confirm-body">
              Are you sure you want to delete the <strong>{modal.payslip.month}</strong> payslip for{" "}
              <strong>{modal.payslip.employeeName}</strong>? This action cannot be undone.
            </div>
            <div className="compliance-modal-actions">
              <button type="button" className="compliance-cancel-button" onClick={closeModal}>Cancel</button>
              <button type="button" className="compliance-delete-button" onClick={closeModal}>Delete</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div className="compliance-modal-header">
      <h2>{title}</h2>
      <button type="button" className="compliance-modal-close" onClick={onClose} aria-label="Close">
        <X size={19} />
      </button>
    </div>
  );
}
function Detail({ label, value }) {
  return <div><span>{label}</span><strong>{value || "—"}</strong></div>;
}