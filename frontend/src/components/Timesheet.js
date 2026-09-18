import React, { useMemo, useState } from "react";
import "./Timesheet.css";

/**
 * Timesheets
 * -----------------------------------------------------------------------
 * Recreates the "Timesheets" review screen (All / Draft / Submitted /
 * Approved / Rejected) and adds multi-timezone support so a manager
 * sitting in any region can view every employee's Check In / Check Out
 * in their own local time.
 *
 * Each employee record stores its check-in/out as a UTC instant (the
 * only safe way to store time when your workforce spans regions). The
 * "Viewing timezone" selector re-renders every row's Check In / Check
 * Out converted into whichever timezone the manager picks — India,
 * London, US (Eastern) or UK.
 *
 * Every employee also carries a home "scheduling style" tag, drawn from
 * the six global scheduling models (Fixed, Rotational/Rota, Dynamic,
 * Split-Shift, On-Call, Compressed) so the table doubles as a quick
 * reference for which governance rules apply to that row.
 */

// ---------------------------------------------------------------------
// Timezone config — each has an IANA zone (for correct DST handling)
// and a short label used in the UI.
// ---------------------------------------------------------------------
const TIMEZONES = [
  { id: "IN", label: "India (IST)", zone: "Asia/Kolkata" },
  { id: "US", label: "US (Eastern)", zone: "America/New_York" },
  { id: "UK", label: "UK (GMT/BST)", zone: "Europe/London" },
];

// Scheduling styles from the six global scheduling models.
const SCHEDULE_STYLES = {
  FIXED: { label: "Fixed", hint: "Same hours every day — corporate/admin roles." },
  ROTA: { label: "Rotational (Rota)", hint: "Cycled shifts — 24/7 coverage, WTD/Shift A-B-C rules apply." },
  DYNAMIC: { label: "Dynamic", hint: "Demand-based shifts — retail/hospitality traffic patterns." },
  SPLIT: { label: "Split-Shift", hint: "Two working blocks in a day, separated by an unpaid gap." },
  ONCALL: { label: "On-Call", hint: "Self-scheduled from an open shift pool." },
  COMPRESSED: { label: "Compressed", hint: "Full-time hours in fewer, longer days (e.g. 4x10)." },
};

// ---------------------------------------------------------------------
// Mock data — checkIn/checkOut are real UTC ISO instants so timezone
// conversion is accurate. `homeZone` is where the shift was logged.
// ---------------------------------------------------------------------
const INITIAL_TIMESHEETS = [
  {
    id: "t1",
    employee: "Arav Kumar",
    homeRegion: "IN",
    scheduleStyle: "ROTA",
    workDate: "2026-09-08",
    checkIn: "2026-09-08T03:30:00Z", // 09:00 IST
    checkOut: "2026-09-08T12:00:00Z", // 17:30 IST
    breakMin: 45,
    status: "Submitted",
  },
  {
    id: "t2",
    employee: "Priya Sharma",
    homeRegion: "IN",
    scheduleStyle: "FIXED",
    workDate: "2026-09-08",
    checkIn: "2026-09-08T03:00:00Z", // 08:30 IST
    checkOut: "2026-09-08T11:30:00Z", // 17:00 IST
    breakMin: 30,
    status: "Approved",
  },
  {
    id: "t3",
    employee: "Meera Iyer",
    homeRegion: "UK",
    scheduleStyle: "ROTA",
    workDate: "2026-09-07",
    checkIn: "2026-09-07T08:15:00Z", // 09:15 BST
    checkOut: "2026-09-07T17:45:00Z", // 18:45 BST
    breakMin: 60,
    status: "Submitted",
  },
  {
    id: "t4",
    employee: "Rohan Das",
    homeRegion: "IN",
    scheduleStyle: "COMPRESSED",
    workDate: "2026-09-07",
    checkIn: "2026-09-07T04:30:00Z", // 10:00 IST
    checkOut: "2026-09-07T10:30:00Z", // 16:00 IST
    breakMin: 30,
    status: "Draft",
  },
  {
    id: "t5",
    employee: "Sara Khan",
    homeRegion: "US",
    scheduleStyle: "DYNAMIC",
    workDate: "2026-09-06",
    checkIn: "2026-09-06T13:00:00Z", // 09:00 ET
    checkOut: "2026-09-06T19:00:00Z", // 15:00 ET
    breakMin: 30,
    status: "Rejected",
  },
  {
    id: "t6",
    employee: "Arav Kumar",
    homeRegion: "IN",
    scheduleStyle: "ROTA",
    workDate: "2026-09-06",
    checkIn: "2026-09-06T03:30:00Z", // 09:00 IST
    checkOut: "2026-09-06T11:30:00Z", // 17:00 IST
    breakMin: 45,
    status: "Approved",
  },
];

const TABS = ["All", "Draft", "Submitted", "Approved", "Rejected"];

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
function formatInZone(isoUtc, zone) {
  const d = new Date(isoUtc);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: zone,
  }).format(d);
}

function dateInZone(isoUtc, zone) {
  const d = new Date(isoUtc);
  return new Intl.DateTimeFormat("en-CA", { timeZone: zone }).format(d); // YYYY-MM-DD
}

function computeHours(checkIn, checkOut, breakMin) {
  const ms = new Date(checkOut) - new Date(checkIn);
  const hrs = ms / 3600000 - breakMin / 60;
  return Math.max(0, hrs);
}

function computeOvertime(hours) {
  const ot = hours - 8;
  return ot > 0 ? ot : 0;
}

function fmtHours(h) {
  return `${h.toFixed(2).replace(/\.00$/, "")}h`;
}

let nextId = 100;
function makeId() {
  nextId += 1;
  return `t${nextId}`;
}

// Converts a "YYYY-MM-DD" + "HH:mm" wall-clock time, as read in `zone`,
// into a correct UTC ISO instant — so data entered by a manager in any
// timezone is stored consistently regardless of who views it later.
function localToUtcIso(dateStr, timeStr, zone) {
  if (!dateStr || !timeStr) return null;
  // Find the zone's current UTC offset near this date using a probe.
  const probe = new Date(`${dateStr}T${timeStr}:00Z`);
  const zoned = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(probe).reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  const asIfUtc = Date.UTC(
    Number(zoned.year), Number(zoned.month) - 1, Number(zoned.day),
    Number(zoned.hour), Number(zoned.minute), Number(zoned.second)
  );
  const offsetMs = asIfUtc - probe.getTime();
  return new Date(probe.getTime() - offsetMs).toISOString();
}

const EMPTY_FORM = {
  employee: "",
  homeRegion: "IN",
  scheduleStyle: "FIXED",
  workDate: "",
  checkInTime: "",
  checkOutTime: "",
  breakMin: 30,
  status: "Draft",
};

export default function Timesheets() {
  const [timesheets, setTimesheets] = useState(INITIAL_TIMESHEETS);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewZoneId, setViewZoneId] = useState("IN");

  // modalMode: null | "add" | "edit" | "view" | "delete"
  const [modalMode, setModalMode] = useState(null);
  const [activeRecord, setActiveRecord] = useState(null); // record being edited/viewed/deleted
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const viewZone = TIMEZONES.find((z) => z.id === viewZoneId);

  const rows = useMemo(() => {
    return timesheets.filter((t) => {
      const matchesTab = activeTab === "All" || t.status === activeTab;
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesSearch = t.employee.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesStatus && matchesSearch;
    }).map((t) => {
      const hours = computeHours(t.checkIn, t.checkOut, t.breakMin);
      const overtime = computeOvertime(hours);
      return {
        ...t,
        displayDate: dateInZone(t.checkIn, viewZone.zone),
        displayCheckIn: formatInZone(t.checkIn, viewZone.zone),
        displayCheckOut: formatInZone(t.checkOut, viewZone.zone),
        hours,
        overtime,
      };
    });
  }, [timesheets, activeTab, search, statusFilter, viewZoneId]);

  const statusClass = (status) => `status-pill status-${status.toLowerCase()}`;

  // ---- Modal helpers -----------------------------------------------
  function closeModal() {
    setModalMode(null);
    setActiveRecord(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError("");
    setActiveRecord(null);
    setModalMode("add");
  }

  function openView(record) {
    setActiveRecord(record);
    setModalMode("view");
  }

  function openEdit(record) {
    const zone = TIMEZONES.find((z) => z.id === record.homeRegion)?.zone || "UTC";
    setForm({
      employee: record.employee,
      homeRegion: record.homeRegion,
      scheduleStyle: record.scheduleStyle,
      workDate: record.workDate,
      checkInTime: formatInZone(record.checkIn, zone),
      checkOutTime: formatInZone(record.checkOut, zone),
      breakMin: record.breakMin,
      status: record.status,
    });
    setActiveRecord(record);
    setFormError("");
    setModalMode("edit");
  }

  function openDelete(record) {
    setActiveRecord(record);
    setModalMode("delete");
  }

  function handleFormChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!form.employee.trim() || !form.workDate || !form.checkInTime || !form.checkOutTime) {
      setFormError("Please fill employee name, work date, check in and check out.");
      return;
    }
    const zone = TIMEZONES.find((z) => z.id === form.homeRegion)?.zone || "UTC";
    const checkIn = localToUtcIso(form.workDate, form.checkInTime, zone);
    let checkOut = localToUtcIso(form.workDate, form.checkOutTime, zone);
    if (new Date(checkOut) <= new Date(checkIn)) {
      // Check-out crosses midnight — push to the next day.
      const nextDay = new Date(new Date(form.workDate).getTime() + 86400000)
        .toISOString().slice(0, 10);
      checkOut = localToUtcIso(nextDay, form.checkOutTime, zone);
    }

    if (modalMode === "add") {
      const record = {
        id: makeId(),
        employee: form.employee.trim(),
        homeRegion: form.homeRegion,
        scheduleStyle: form.scheduleStyle,
        workDate: form.workDate,
        checkIn,
        checkOut,
        breakMin: Number(form.breakMin) || 0,
        status: form.status,
      };
      setTimesheets((prev) => [record, ...prev]);
    } else if (modalMode === "edit" && activeRecord) {
      setTimesheets((prev) =>
        prev.map((t) =>
          t.id === activeRecord.id
            ? {
                ...t,
                employee: form.employee.trim(),
                homeRegion: form.homeRegion,
                scheduleStyle: form.scheduleStyle,
                workDate: form.workDate,
                checkIn,
                checkOut,
                breakMin: Number(form.breakMin) || 0,
                status: form.status,
              }
            : t
        )
      );
    }
    closeModal();
  }

  function confirmDelete() {
    if (activeRecord) {
      setTimesheets((prev) => prev.filter((t) => t.id !== activeRecord.id));
    }
    closeModal();
  }

  return (
    <div className="ts-page">
        {/* Header */}
        <div className="ts-header">
          <div className="ts-header-left">
            <div className="ts-icon" aria-hidden="true">🕒</div>
            <div>
              <h1>Timesheets</h1>
              <p>Review and manage employee timesheets across every region.</p>
            </div>
          </div>
          <button className="ts-add-btn" type="button" onClick={openAdd}>
            <span aria-hidden="true">＋</span> Add Timesheet
          </button>
        </div>

        {/* Timezone strip */}
        <div className="ts-tz-strip">
          <span className="ts-tz-label">Viewing times in</span>
          <div className="ts-tz-options">
            {TIMEZONES.map((z) => (
              <button
                key={z.id}
                type="button"
                className={`ts-tz-chip ${viewZoneId === z.id ? "active" : ""}`}
                onClick={() => setViewZoneId(z.id)}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="ts-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`ts-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search + status filter */}
        <div className="ts-toolbar">
          <div className="ts-search">
            <span className="ts-search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              placeholder="Search by employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="ts-status-filter">
            <label htmlFor="statusSelect">Status:</label>
            <select
              id="statusSelect"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {TABS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="ts-table-wrap">
          <table className="ts-table">
            <thead>
              <tr>
                <th className="ts-checkbox-col"><input type="checkbox" aria-label="Select all" /></th>
                <th>Employee</th>
                <th>Work Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Break (min)</th>
                <th>Hours</th>
                <th>Overtime</th>
                <th>Status</th>
                <th className="ts-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const style = SCHEDULE_STYLES[t.scheduleStyle];
                const homeZone = TIMEZONES.find((z) => z.id === t.homeRegion);
                return (
                  <tr key={t.id}>
                    <td><input type="checkbox" aria-label={`Select ${t.employee}`} /></td>
                    <td>
                      <div className="ts-employee-name">{t.employee}</div>
                      <div className="ts-employee-meta">
                        <span className="ts-region-tag">{homeZone?.label.split(" ")[0]}</span>
                        <span
                          className={`ts-style-tag ts-style-${t.scheduleStyle.toLowerCase()}`}
                          title={style.hint}
                        >
                          {style.label}
                        </span>
                      </div>
                    </td>
                    <td>{t.displayDate}</td>
                    <td>{t.displayCheckIn}</td>
                    <td>{t.displayCheckOut}</td>
                    <td>{t.breakMin}</td>
                    <td>{fmtHours(t.hours)}</td>
                    <td>{t.overtime > 0 ? fmtHours(t.overtime) : "—"}</td>
                    <td>
                      <span className={statusClass(t.status)}>{t.status}</span>
                    </td>
                    <td className="ts-actions-col">
                      <button className="ts-icon-btn" title="View" type="button" onClick={() => openView(t)}>👁</button>
                      <button className="ts-icon-btn" title="Edit" type="button" onClick={() => openEdit(t)}>✏️</button>
                      <button className="ts-icon-btn" title="Delete" type="button" onClick={() => openDelete(t)}>🗑</button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="ts-empty">No timesheets match this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="ts-footer">
          <span>Showing 1–{rows.length} of {rows.length}</span>
          <div className="ts-pagination">
            <button type="button" disabled>‹ Prev</button>
            <span>Page 1 / 1</span>
            <button type="button" disabled>Next ›</button>
          </div>
        </div>

      {(modalMode === "add" || modalMode === "edit") && (
        <div className="ts-modal-backdrop" onClick={closeModal}>
          <div className="ts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ts-modal-header">
              <h2>{modalMode === "add" ? "Add Timesheet" : "Edit Timesheet"}</h2>
              <button className="ts-icon-btn" type="button" onClick={closeModal} aria-label="Close">✕</button>
            </div>
            <form className="ts-form" onSubmit={handleFormSubmit}>
              <label>
                Employee
                <input
                  type="text"
                  value={form.employee}
                  onChange={(e) => handleFormChange("employee", e.target.value)}
                  placeholder="e.g. Arav Kumar"
                />
              </label>

              <div className="ts-form-row">
                <label>
                  Region
                  <select
                    value={form.homeRegion}
                    onChange={(e) => handleFormChange("homeRegion", e.target.value)}
                  >
                    {TIMEZONES.map((z) => (
                      <option key={z.id} value={z.id}>{z.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Scheduling style
                  <select
                    value={form.scheduleStyle}
                    onChange={(e) => handleFormChange("scheduleStyle", e.target.value)}
                  >
                    {Object.entries(SCHEDULE_STYLES).map(([key, s]) => (
                      <option key={key} value={key}>{s.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Work date
                <input
                  type="date"
                  value={form.workDate}
                  onChange={(e) => handleFormChange("workDate", e.target.value)}
                />
              </label>

              <div className="ts-form-row">
                <label>
                  Check in ({TIMEZONES.find((z) => z.id === form.homeRegion)?.label})
                  <input
                    type="time"
                    value={form.checkInTime}
                    onChange={(e) => handleFormChange("checkInTime", e.target.value)}
                  />
                </label>
                <label>
                  Check out
                  <input
                    type="time"
                    value={form.checkOutTime}
                    onChange={(e) => handleFormChange("checkOutTime", e.target.value)}
                  />
                </label>
              </div>

              <div className="ts-form-row">
                <label>
                  Break (min)
                  <input
                    type="number"
                    min="0"
                    value={form.breakMin}
                    onChange={(e) => handleFormChange("breakMin", e.target.value)}
                  />
                </label>
                <label>
                  Status
                  <select
                    value={form.status}
                    onChange={(e) => handleFormChange("status", e.target.value)}
                  >
                    {TABS.filter((t) => t !== "All").map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>

              {formError && <p className="ts-form-error">{formError}</p>}

              <div className="ts-form-actions">
                <button type="button" className="ts-btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="ts-btn-primary">
                  {modalMode === "add" ? "Add Timesheet" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalMode === "view" && activeRecord && (
        <div className="ts-modal-backdrop" onClick={closeModal}>
          <div className="ts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ts-modal-header">
              <h2>Timesheet Details</h2>
              <button className="ts-icon-btn" type="button" onClick={closeModal} aria-label="Close">✕</button>
            </div>
            <div className="ts-view-grid">
              <div><span>Employee</span><strong>{activeRecord.employee}</strong></div>
              <div><span>Region</span><strong>{TIMEZONES.find((z) => z.id === activeRecord.homeRegion)?.label}</strong></div>
              <div><span>Scheduling style</span><strong>{SCHEDULE_STYLES[activeRecord.scheduleStyle].label}</strong></div>
              <div><span>Work date</span><strong>{activeRecord.workDate}</strong></div>
              <div><span>Check in</span><strong>{formatInZone(activeRecord.checkIn, viewZone.zone)} ({viewZone.label})</strong></div>
              <div><span>Check out</span><strong>{formatInZone(activeRecord.checkOut, viewZone.zone)} ({viewZone.label})</strong></div>
              <div><span>Break</span><strong>{activeRecord.breakMin} min</strong></div>
              <div><span>Status</span><strong>{activeRecord.status}</strong></div>
            </div>
            <div className="ts-form-actions">
              <button type="button" className="ts-btn-primary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {modalMode === "delete" && activeRecord && (
        <div className="ts-modal-backdrop" onClick={closeModal}>
          <div className="ts-modal ts-modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="ts-modal-header">
              <h2>Delete Timesheet</h2>
              <button className="ts-icon-btn" type="button" onClick={closeModal} aria-label="Close">✕</button>
            </div>
            <p className="ts-delete-text">
              Delete {activeRecord.employee}'s timesheet for {activeRecord.workDate}? This can't be undone.
            </p>
            <div className="ts-form-actions">
              <button type="button" className="ts-btn-secondary" onClick={closeModal}>Cancel</button>
              <button type="button" className="ts-btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}