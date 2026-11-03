import React, { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, Check, ChevronDown, CircleAlert, ClipboardCheck, Filter, Flag, MessageSquare, MoreHorizontal, Pencil, Plus, Search, Target, Trash2, TrendingUp, Users, X } from "lucide-react";
import "./GoalsReview.css";

const employees = [
  { id: "e1", name: "Arun Kumar", department: "Engineering", role: "Software Engineer" },
  { id: "e2", name: "Priya S", department: "Product", role: "Product Manager" },
  { id: "e3", name: "Meena V", department: "Engineering", role: "Security Analyst" },
  { id: "e4", name: "Karthik R", department: "Product", role: "Product Designer" },
  { id: "e5", name: "Ananya Rao", department: "Design", role: "UX Designer" },
  { id: "e6", name: "Divya Nair", department: "Customer Success", role: "Customer Success Lead" },
  { id: "e7", name: "Rohan Das", department: "HR", role: "People Partner" },
  { id: "e8", name: "Isha Patel", department: "Engineering", role: "QA Engineer" },
];
const titles = ["Improve API response time by 30%", "Launch employee onboarding flow", "Complete security training", "Increase user activation rate to 60%", "Reduce support resolution time by 20%", "Ship quarterly roadmap milestones", "Improve design system adoption", "Build a repeatable hiring process", "Increase test automation coverage", "Publish customer insights report", "Deliver manager enablement sessions", "Improve product discovery completion"];
const descriptions = ["Reduce average response time from 800ms to 560ms", "Design and launch a new onboarding experience", "Finish advanced security module and certification", "Improve new user activation from 40% to 60%"];
const targetStatuses = ["Completed", "On Track", "At Risk", "Not Started"];
const defaultReviewQuestions = [
  { id: "achievement", section: "self", label: "What did you achieve?", placeholder: "Summarize the outcomes you delivered..." },
  { id: "challenges", section: "self", label: "What challenges did you face?", placeholder: "Describe challenges or blockers..." },
  { id: "support", section: "self", label: "What helped you make progress?", placeholder: "Mention resources, collaboration or support..." },
  { id: "improve", section: "self", label: "What would you improve next time?", placeholder: "Share a lesson for the next cycle..." },
  { id: "feedback", section: "manager", label: "Manager feedback", placeholder: "Add clear, constructive feedback..." },
];
const loadReviewQuestions = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("lernevo-goal-review-questions") || "null");
    return Array.isArray(saved) ? saved : defaultReviewQuestions;
  } catch { return defaultReviewQuestions; }
};
const initialGoals = Array.from({ length: 48 }, (_, index) => {
  const employee = employees[index % employees.length];
  const status = ["On Track", "At Risk", "Completed", "On Track", "At Risk", "On Track", "Completed", "On Track", "At Risk", "On Track", "On Track", "On Track"][index % 12];
  const progress = status === "Completed" ? 100 : status === "On Track" ? [68, 74, 56, 82, 42][index % 5] : [30, 42, 22, 35][index % 4];
  return { id: `G-${String(index + 1).padStart(3, "0")}`, title: titles[index % titles.length], description: descriptions[index % descriptions.length], employeeId: employee.id, department: employee.department, type: index % 4 === 3 ? "Team" : "Individual", category: index % 2 ? "Growth" : "Performance", progress, status, dueDate: `2026-${index % 3 === 0 ? "12" : index % 3 === 1 ? "11" : "10"}-${String(10 + (index * 3) % 19).padStart(2, "0")}`, target: "30% improvement", actual: progress === 100 ? "Target achieved" : "In progress", keyResults: [{ id: `K-${index}-1`, title: "Optimize database queries", done: progress === 100 }, { id: `K-${index}-2`, title: "Implement caching", done: progress > 60 }, { id: `K-${index}-3`, title: "Load testing and validation", done: progress === 100 }], updates: [{ id: `U-${index}`, date: "2026-12-01", text: progress === 100 ? "Goal completed successfully" : "Progress updated with the team" }], comments: [], review: null };
});

const statusColors = { Completed: "#08a66a", "On Track": "#1685f8", "At Risk": "#f28a26", "Not Started": "#94a3b8" };
const employeeFor = (id) => employees.find((person) => person.id === id) || employees[0];
const initialForm = { title: "", description: "", employeeId: employees[0].id, type: "Individual", category: "Performance", target: "", dueDate: "2026-12-31" };
const formatDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const formatShortDate = (date) => date ? new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
const computedStatus = (goal) => goal.progress >= 100 ? "Completed" : goal.progress === 0 ? "Not Started" : goal.status === "At Risk" ? "At Risk" : "On Track";

export default function GoalsReview() {
  const [goals, setGoals] = useState(initialGoals);
  const [currentRole, setCurrentRole] = useState(() => {
    try { return localStorage.getItem("lv-role") || "Super Admin"; } catch { return "Super Admin"; }
  });
  const [reviewQuestions, setReviewQuestions] = useState(loadReviewQuestions);
  const isSuperAdmin = ["superadmin", "super_admin", "super admin"].includes(String(currentRole).toLowerCase().replace(/\s+/g, " ").trim()) || String(currentRole).toLowerCase().replace(/[\s_-]/g, "") === "superadmin";
  const [tab, setTab] = useState("Overview");
  const [quarter, setQuarter] = useState("Q4 2026");
  const [dateRange, setDateRange] = useState(null);
  const [dateRangeDraft, setDateRangeDraft] = useState({ start: "", end: "" });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [department, setDepartment] = useState("All Departments");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Statuses");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedEmployee, setSelectedEmployee] = useState("e1");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [updateText, setUpdateText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const [menuGoal, setMenuGoal] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionDraft, setQuestionDraft] = useState("");
  const [reviewForm, setReviewForm] = useState({ achievement: "", challenges: "", support: "", improve: "", rating: 4, finalStatus: "On Track", feedback: "", answers: {}, selfSubmitted: false, managerSubmitted: false });
  useEffect(() => {
    const syncRole = () => {
      try { setCurrentRole(localStorage.getItem("lv-role") || "Super Admin"); } catch { setCurrentRole("Super Admin"); }
    };
    window.addEventListener("lv-role", syncRole);
    window.addEventListener("storage", syncRole);
    return () => {
      window.removeEventListener("lv-role", syncRole);
      window.removeEventListener("storage", syncRole);
    };
  }, []);
  useEffect(() => {
    try { localStorage.setItem("lernevo-goal-review-questions", JSON.stringify(reviewQuestions)); } catch { /* storage is optional */ }
  }, [reviewQuestions]);
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(""), 2800); };
  const filteredGoals = useMemo(() => goals.filter((goal) => {
    const person = employeeFor(goal.employeeId);
    const query = search.trim().toLowerCase();
    const [quarterName, year] = quarter.split(" ");
    const month = Number(goal.dueDate.slice(5, 7));
    const goalQuarter = `Q${Math.ceil(month / 3)} ${goal.dueDate.slice(0, 4)}`;
    const matchesDateRange = !dateRange || (( !dateRange.start || goal.dueDate >= dateRange.start) && (!dateRange.end || goal.dueDate <= dateRange.end));
    const matchesQuarter = dateRange || quarter === "All Quarters" || goalQuarter === `${quarterName} ${year}`;
    return matchesQuarter && matchesDateRange && (department === "All Departments" || goal.department === department) && (filterStatus === "All Statuses" || computedStatus(goal) === filterStatus) && (!query || `${goal.title} ${person.name} ${goal.department}`.toLowerCase().includes(query));
  }).sort((a, b) => {
    const value = (goal) => ({ title: goal.title, employee: employeeFor(goal.employeeId).name, department: goal.department, type: goal.type, progress: goal.progress, status: computedStatus(goal), dueDate: goal.dueDate })[sortBy];
    const comparison = typeof value(a) === "number" ? value(a) - value(b) : String(value(a)).localeCompare(String(value(b)));
    return sortDirection === "asc" ? comparison : -comparison;
  }), [goals, department, filterStatus, search, quarter, dateRange, sortBy, sortDirection]);
  const stats = useMemo(() => ({ total: filteredGoals.length, completed: filteredGoals.filter((g) => computedStatus(g) === "Completed").length, onTrack: filteredGoals.filter((g) => computedStatus(g) === "On Track").length, atRisk: filteredGoals.filter((g) => computedStatus(g) === "At Risk").length, notStarted: filteredGoals.filter((g) => computedStatus(g) === "Not Started").length }), [filteredGoals]);
  const pageGoals = filteredGoals.slice((page - 1) * 6, page * 6);
  const setGoal = (id, updater) => setGoals((current) => current.map((goal) => goal.id === id ? updater(goal) : goal));
  const openCreate = (goal = null) => { setForm(goal ? { ...goal, employeeId: goal.employeeId } : initialForm); setModal(goal ? { kind: "edit", id: goal.id } : { kind: "create" }); };
  const saveGoal = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    const person = employeeFor(form.employeeId);
    if (modal.kind === "edit") setGoals((current) => current.map((goal) => goal.id === modal.id ? { ...goal, ...form, department: person.department } : goal));
    else setGoals((current) => [{ ...initialGoals[0], ...form, id: `G-${Date.now()}`, department: person.department, employeeId: person.id, progress: 0, status: "Not Started", keyResults: [], updates: [], comments: [], review: null }, ...current]);
    setModal(null); notify(modal.kind === "edit" ? "Goal updated" : "Goal created");
  };
  const showGoal = (goal, kind = "details") => {
    setModal({ kind, id: goal.id });
    setEditingQuestionId(null);
    setQuestionDraft("");
    const savedReview = goal.review || {};
    setReviewForm({ achievement: "", challenges: "", support: "", improve: "", rating: 4, finalStatus: computedStatus(goal), feedback: "", selfSubmitted: false, managerSubmitted: false, ...savedReview, answers: { achievement: savedReview.achievement || "", challenges: savedReview.challenges || "", support: savedReview.support || "", improve: savedReview.improve || "", feedback: savedReview.feedback || "", ...(savedReview.answers || {}) } });
  };
  const saveReview = (event, submitted) => {
    event.preventDefault();
    if (!selectedGoal) return;
    setGoal(selectedGoal.id, (goal) => ({
      ...goal,
      review: {
        ...reviewForm,
        selfSubmitted: submitted || Boolean(reviewForm.selfSubmitted),
        managerSubmitted: submitted || Boolean(reviewForm.managerSubmitted),
      },
    }));
    setModal(null);
    notify(submitted ? "Goal review submitted" : "Goal review saved");
  };
  const updateReviewQuestion = (id, patch) => setReviewQuestions((current) => current.map((question) => question.id === id ? { ...question, ...patch } : question));
  const addReviewQuestion = (section) => {
    const id = `question-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setReviewQuestions((current) => [...current, { id, section, label: "", placeholder: "Write your response..." }]);
    setEditingQuestionId(id);
    setQuestionDraft("");
  };
  const saveQuestionEdit = (id) => {
    if (!questionDraft.trim()) return;
    updateReviewQuestion(id, { label: questionDraft.trim() });
    setEditingQuestionId(null);
    setQuestionDraft("");
  };
  const cancelQuestionEdit = (question) => {
    if (!question.label.trim()) removeReviewQuestion(question.id);
    setEditingQuestionId(null);
    setQuestionDraft("");
  };
  const removeReviewQuestion = (id) => {
    setReviewQuestions((current) => current.filter((question) => question.id !== id));
    setReviewForm((current) => {
      const answers = { ...(current.answers || {}) };
      delete answers[id];
      return { ...current, answers };
    });
  };
  const renderReviewQuestions = (section) => reviewQuestions.filter((question) => question.section === section).map((question) => (
    <div key={question.id} className="gr-review-question">
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {isSuperAdmin && editingQuestionId === question.id ? <>
          <input autoFocus aria-label="Review question" value={questionDraft} onChange={(event) => setQuestionDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); saveQuestionEdit(question.id); } if (event.key === "Escape") cancelQuestionEdit(question); }} />
          <button type="button" className="gr-icon-btn" aria-label="Save question" disabled={!questionDraft.trim()} onClick={() => saveQuestionEdit(question.id)}><Check size={15} /></button>
          <button type="button" className="gr-icon-btn" aria-label="Cancel question edit" onClick={() => cancelQuestionEdit(question)}><X size={15} /></button>
        </> : <>
          <span style={{ flex: 1, color: "#3f5070", fontSize: 13, fontWeight: 600 }}>{question.label}</span>
          {isSuperAdmin && <button type="button" className="gr-icon-btn" aria-label={`Edit question: ${question.label}`} onClick={() => { setEditingQuestionId(question.id); setQuestionDraft(question.label); }}><Pencil size={14} /></button>}
          {isSuperAdmin && <button type="button" className="gr-icon-btn" aria-label={`Delete question: ${question.label}`} onClick={() => removeReviewQuestion(question.id)}><Trash2 size={14} /></button>}
        </>}
      </div>
      <textarea value={reviewForm.answers?.[question.id] ?? reviewForm[question.id] ?? ""} placeholder={question.placeholder} onChange={(event) => setReviewForm((current) => ({ ...current, answers: { ...(current.answers || {}), [question.id]: event.target.value } }))} />
    </div>
  ));
  const selectedGoal = modal?.id ? goals.find((goal) => goal.id === modal.id) : null;

  const Status = ({ value }) => <span className={`gr-status gr-status-${value.toLowerCase().replaceAll(" ", "-")}`}><i />{value}</span>;
  const GoalTable = ({ rows = pageGoals }) => <div className="gr-table-wrap"><table className="gr-table"><thead><tr>{[["title", "Goal"], ["employee", "Employee"], ["department", "Department"], ["type", "Type"], ["progress", "Progress"], ["status", "Status"], ["dueDate", "Due Date"]].map(([key, label]) => <th key={key}><button className="gr-sort-button" onClick={() => { setSortDirection(sortBy === key && sortDirection === "asc" ? "desc" : "asc"); setSortBy(key); }}>{label}<span>{sortBy === key ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}</span></button></th>)}<th>Actions</th></tr></thead><tbody>{rows.map((goal) => { const person = employeeFor(goal.employeeId); return <tr key={goal.id}><td><button className="gr-goal-name" onClick={() => showGoal(goal)}>{goal.title}</button><small>{goal.description}</small></td><td><span className="gr-person"><span className="gr-avatar">{person.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>{person.name}</span></td><td>{goal.department}</td><td>{goal.type}</td><td><div className="gr-progress"><b>{goal.progress}%</b><span><i style={{ width: `${goal.progress}%` }} /></span></div></td><td><Status value={computedStatus(goal)} /></td><td>{formatDate(goal.dueDate)}</td><td className="gr-action-cell"><button className="gr-icon-btn" aria-label="Goal actions" onClick={() => setMenuGoal(menuGoal === goal.id ? null : goal.id)}><MoreHorizontal size={17} /></button>{menuGoal === goal.id && <div className="gr-row-menu"><button onClick={() => { showGoal(goal); setMenuGoal(null); }}>View details</button><button onClick={() => { openCreate(goal); setMenuGoal(null); }}>Edit goal</button><button onClick={() => { showGoal(goal, "progress"); setMenuGoal(null); }}>Update progress</button><button className="danger" onClick={() => { setModal({ kind: "delete", id: goal.id }); setMenuGoal(null); }}>Delete goal</button></div>}</td></tr>; })}{rows.length === 0 && <tr><td colSpan="8" className="gr-empty">No goals match these filters.</td></tr>}</tbody></table></div>;

  return <div className="goals-review-page">
    <header className="gr-page-head"><div><div className="gr-eyebrow">PEOPLE &amp; PERFORMANCE</div><h1>Goals Review</h1><p>Set, track and review employee goals to align individual growth with company objectives.</p></div><div className="gr-head-controls"><div className="gr-quarter-filter"><div className="gr-select gr-quarter-control"><button type="button" className={`gr-quarter-calendar-trigger ${dateRange ? "active" : ""}`} aria-label="Choose date range" title={dateRange ? `${formatShortDate(dateRange.start)} – ${formatShortDate(dateRange.end)}` : "Choose date range"} aria-expanded={calendarOpen} onClick={() => { setDateRangeDraft(dateRange || { start: "", end: "" }); setCalendarOpen((open) => !open); }}><CalendarDays size={15} /></button><select value={quarter} onChange={(event) => { setQuarter(event.target.value); setDateRange(null); setDateRangeDraft({ start: "", end: "" }); setPage(1); }}><option>Q4 2026</option><option>Q3 2026</option><option>Q2 2026</option><option>Q1 2026</option><option>All Quarters</option></select><ChevronDown size={14} /></div>{calendarOpen && <div className="gr-date-range-popover" role="dialog" aria-label="Choose a goal due date range"><strong>Select date range</strong><label>From<input type="date" value={dateRangeDraft.start} max={dateRangeDraft.end || undefined} onChange={(event) => setDateRangeDraft((range) => ({ ...range, start: event.target.value }))} /></label><label>To<input type="date" value={dateRangeDraft.end} min={dateRangeDraft.start || undefined} onChange={(event) => setDateRangeDraft((range) => ({ ...range, end: event.target.value }))} /></label><div className="gr-date-range-actions"><button type="button" className="gr-button subtle" onClick={() => { setDateRange(null); setDateRangeDraft({ start: "", end: "" }); setPage(1); setCalendarOpen(false); }}>Clear</button><button type="button" className="gr-button primary" disabled={!dateRangeDraft.start || !dateRangeDraft.end} onClick={() => { setDateRange(dateRangeDraft); setPage(1); setCalendarOpen(false); }}>Apply</button></div></div>}</div><label className="gr-select"><Users size={15} /><select value={department} onChange={(event) => { setDepartment(event.target.value); setPage(1); }}><option>All Departments</option>{[...new Set(employees.map((person) => person.department))].map((name) => <option key={name}>{name}</option>)}</select><ChevronDown size={14} /></label><button className="gr-button primary" onClick={() => openCreate()}><Plus size={17} /> Set Goals</button></div></header>
    <nav className="gr-tabs" aria-label="Goals review sections">{["Overview", "Team Goals", "My Goals", "Reviews"].map((name) => <button key={name} className={tab === name ? "active" : ""} onClick={() => setTab(name)}>{name}{name === "Reviews" && <span className="gr-tab-count">6</span>}</button>)}</nav>
    {tab === "Overview" && <>
      <section className="gr-kpis">{[{ label: "Total Goals", value: stats.total, foot: "12% from last quarter", icon: Target, tone: "blue" }, { label: "On Track", value: stats.onTrack, foot: `${stats.total ? Math.round(stats.onTrack / stats.total * 100) : 0}% of total goals`, icon: TrendingUp, tone: "green" }, { label: "At Risk", value: stats.atRisk, foot: `${stats.total ? Math.round(stats.atRisk / stats.total * 100) : 0}% of total goals`, icon: CircleAlert, tone: "orange" }, { label: "Completed", value: stats.completed, foot: `${stats.total ? Math.round(stats.completed / stats.total * 100) : 0}% of total goals`, icon: Flag, tone: "purple" }].map(({ label, value, foot, icon: Icon, tone }) => <article className={`gr-kpi ${tone}`} key={label}><span className="gr-kpi-icon"><Icon size={22} /></span><div><span>{label}</span><strong>{value}</strong><small>{label === "Total Goals" && <ArrowUpRight size={13} />}{foot}</small></div></article>)}</section>
      <section className="gr-card gr-goal-list"><div className="gr-list-head"><div><h2>Goals</h2><p>Monitor goals and progress across your organization</p></div><div className="gr-list-tools"><label className="gr-search"><Search size={15} /><input value={search} placeholder="Search goals, employees..." onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label><label className="gr-filter"><Filter size={14} /><select value={filterStatus} onChange={(event) => { setFilterStatus(event.target.value); setPage(1); }}><option>All Statuses</option>{targetStatuses.map((s) => <option key={s}>{s}</option>)}</select></label></div></div><div className="gr-segment-tabs"><button className="active">All Goals ({filteredGoals.length})</button><button onClick={() => { setTab("Team Goals"); }}>My Team ({goals.length})</button><button onClick={() => setTab("My Goals")}>My Goals ({goals.filter((goal) => goal.employeeId === selectedEmployee).length})</button></div><GoalTable /><div className="gr-pagination"><span>Showing {filteredGoals.length ? (page - 1) * 6 + 1 : 0}–{Math.min(page * 6, filteredGoals.length)} of {filteredGoals.length} goals</span><div><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button disabled={page * 6 >= filteredGoals.length} onClick={() => setPage(page + 1)}>Next</button></div></div></section>
    </>}
    {tab === "Team Goals" && <section className="gr-card gr-view-panel"><div className="gr-view-heading"><div><span className="gr-eyebrow">TEAM PERFORMANCE</span><h2>Team Goals</h2><p>Review progress and support your team in reaching their goals.</p></div><label className="gr-search"><Search size={15} /><input value={search} placeholder="Search goals, employees..." onChange={(event) => setSearch(event.target.value)} /></label></div><div className="gr-summary-strip"><span><b>{stats.total}</b> goals across <b>{employees.length}</b> employees</span><span><b>{stats.completed}</b> completed</span><span><b>{stats.atRisk}</b> need attention</span></div><GoalTable rows={filteredGoals} /></section>}
    {tab === "My Goals" && <section className="gr-view-panel"><div className="gr-view-heading"><div><span className="gr-eyebrow">EMPLOYEE WORKSPACE</span><h2>My Goals</h2><p>View your commitments and share a progress update.</p></div><label className="gr-select"><Users size={15} /><select value={selectedEmployee} onChange={(event) => setSelectedEmployee(event.target.value)}>{employees.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select><ChevronDown size={14} /></label></div><div className="gr-kpis gr-my-kpis">{[{ label: "My Total Goals", value: goals.filter((goal) => goal.employeeId === selectedEmployee).length }, { label: "On Track", value: goals.filter((goal) => goal.employeeId === selectedEmployee && computedStatus(goal) === "On Track").length }, { label: "At Risk", value: goals.filter((goal) => goal.employeeId === selectedEmployee && computedStatus(goal) === "At Risk").length }, { label: "Completed", value: goals.filter((goal) => goal.employeeId === selectedEmployee && computedStatus(goal) === "Completed").length }].map((card) => <article className="gr-mini-stat" key={card.label}><span>{card.label}</span><b>{card.value}</b></article>)}</div><div className="gr-my-goals">{goals.filter((goal) => goal.employeeId === selectedEmployee).map((goal) => <article className="gr-card gr-my-goal" key={goal.id}><div className="gr-my-goal-top"><span className="gr-goal-symbol"><Target size={19} /></span><Status value={computedStatus(goal)} /></div><h3>{goal.title}</h3><p>{goal.description}</p><div className="gr-my-outcome"><span>Target outcome</span><b>{goal.target}</b></div><div className="gr-my-progress"><div><span>Progress</span><b>{goal.progress}%</b></div><div className="gr-progress-track"><i style={{ width: `${goal.progress}%` }} /></div></div><div className="gr-my-meta"><span><CalendarDays size={14} /> Due {formatDate(goal.dueDate)}</span><span>Next: {goal.keyResults.find((result) => !result.done)?.title || "Goal achieved"}</span></div><div className="gr-my-updated">Last update · {goal.updates[goal.updates.length - 1]?.text || "No updates yet"}</div><div className="gr-my-actions"><button className="gr-button subtle" onClick={() => showGoal(goal)}>View Details</button><button className="gr-button primary" onClick={() => showGoal(goal, "progress")}>Update Progress</button><button className="gr-icon-btn" onClick={() => showGoal(goal, "review")} aria-label="View feedback"><MessageSquare size={16} /></button></div></article>)}</div></section>}
    {tab === "Reviews" && <section className="gr-view-panel"><div className="gr-view-heading"><div><span className="gr-eyebrow">END OF CYCLE</span><h2>Reviews &amp; Feedback</h2><p>Reflect on outcomes and share clear, actionable feedback.</p></div><button className="gr-button primary" onClick={() => showGoal(goals.find((goal) => !goal.review) || goals[0], "review")}><ClipboardCheck size={16} /> Start a Review</button></div><div className="gr-review-stats">{[{ label: "Reviews Due", value: goals.filter((goal) => !goal.review).length }, { label: "Pending Employee Self-Reviews", value: goals.filter((goal) => !goal.review).length }, { label: "Pending Manager Reviews", value: goals.filter((goal) => goal.review && !goal.review.managerSubmitted).length }, { label: "Completed Goal Reviews", value: goals.filter((goal) => goal.review?.managerSubmitted).length }].map((card) => <article className="gr-card" key={card.label}><span>{card.label}</span><b>{card.value}</b></article>)}</div><article className="gr-card gr-cycle"><div className="gr-card-title"><div><h2>Review Cycle</h2><p>Q4 2026 · Current stage: Manager Review</p></div><Status value="On Track" /></div><div className="gr-cycle-steps">{["Goal Setting", "Progress Tracking", "Employee Self-Review", "Manager Review", "Goal Cycle Closed"].map((step, index) => <div className={index < 3 ? "done" : index === 3 ? "current" : ""} key={step}><span>{index < 3 ? <Check size={14} /> : index + 1}</span><b>{step}</b></div>)}</div></article><article className="gr-card gr-goal-list"><div className="gr-list-head"><div><h2>Goal Reviews</h2><p>Complete self and manager reviews for the period.</p></div><label className="gr-search"><Search size={15} /><input value={search} placeholder="Search employee or goal..." onChange={(event) => setSearch(event.target.value)} /></label></div><div className="gr-table-wrap"><table className="gr-table gr-review-table"><thead><tr><th>Employee / Goal</th><th>Target</th><th>Actual Result</th><th>Achievement</th><th>Self-Review</th><th>Manager Review</th><th>Final Status</th><th>Action</th></tr></thead><tbody>{filteredGoals.slice(0, 12).map((goal) => <tr key={goal.id}><td><span className="gr-person"><span className="gr-avatar">{employeeFor(goal.employeeId).name.slice(0, 1)}</span>{employeeFor(goal.employeeId).name}</span><small>{goal.title}</small></td><td>{goal.target}</td><td>{goal.actual}</td><td>{goal.progress}%</td><td>{goal.review?.selfSubmitted ? <Status value="Completed" /> : <span className="gr-pending">Pending</span>}</td><td>{goal.review?.managerSubmitted ? <Status value="Completed" /> : <span className="gr-pending">Pending</span>}</td><td><Status value={goal.review?.finalStatus || computedStatus(goal)} /></td><td>{isSuperAdmin ? <button className="gr-button mini" onClick={() => showGoal(goal, "review")}>View Review</button> : <button className="gr-button mini" onClick={() => showGoal(goal, "review")}>{goal.review ? "Continue" : "Review"}</button>}</td></tr>)}</tbody></table></div></article></section>}

    {modal && <div className="gr-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModal(null)}><section className="gr-modal" role="dialog" aria-modal="true" aria-labelledby="gr-modal-title"><header className="gr-modal-head"><div><span className="gr-eyebrow">GOALS REVIEW</span><h2 id="gr-modal-title">{modal.kind === "create" ? "Set a New Goal" : modal.kind === "edit" ? "Edit Goal" : modal.kind === "delete" ? "Delete Goal" : modal.kind === "progress" ? "Update Progress" : modal.kind === "review" ? "Goal Review & Feedback" : "Goal Details"}</h2></div><button className="gr-icon-btn" onClick={() => setModal(null)} aria-label="Close"><X size={18} /></button></header>
      {(modal.kind === "create" || modal.kind === "edit") && <form className="gr-modal-form" onSubmit={saveGoal}><label>Goal title *<input required autoFocus value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Improve API response time by 30%" /></label><label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe the expected outcome and context..." /></label><div className="gr-form-row"><label>Employee<select value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })}>{employees.map((person) => <option value={person.id} key={person.id}>{person.name}</option>)}</select></label><label>Goal type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option>Individual</option><option>Team</option></select></label></div><div className="gr-form-row"><label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Performance</option><option>Growth</option><option>Development</option><option>Business</option></select></label><label>Due date<input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label></div><label>Target value / outcome<input value={form.target} onChange={(event) => setForm({ ...form, target: event.target.value })} placeholder="e.g. Reduce response time to 560ms" /></label><footer><button type="button" className="gr-button subtle" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="gr-button primary">{modal.kind === "edit" ? "Save Changes" : "Create Goal"}</button></footer></form>}
      {selectedGoal && modal.kind === "details" && <div className="gr-details"><div className="gr-details-title"><div><h3>{selectedGoal.title}</h3><p>{selectedGoal.description}</p></div><Status value={computedStatus(selectedGoal)} /></div><div className="gr-details-meta"><span>Owner<b>{employeeFor(selectedGoal.employeeId).name}</b></span><span>Department<b>{selectedGoal.department}</b></span><span>Due date<b>{formatDate(selectedGoal.dueDate)}</b></span></div><div className="gr-my-progress"><div><span>Overall progress</span><b>{selectedGoal.progress}%</b></div><div className="gr-progress-track"><i style={{ width: `${selectedGoal.progress}%` }} /></div></div><h4>Key Results</h4>{selectedGoal.keyResults.map((result) => <div className="gr-key-result" key={result.id}><span className={result.done ? "checked" : ""}>{result.done && <Check size={13} />}</span>{result.title}<small>{result.done ? "Completed" : "In Progress"}</small></div>)}<h4>Recent updates</h4>{selectedGoal.updates.map((update) => <div className="gr-update-line" key={update.id}><i /><div><b>{formatDate(update.date)}</b><p>{update.text}</p></div></div>)}<h4>Comments</h4>{selectedGoal.comments.map((comment) => <p className="gr-comment" key={comment.id}><b>{comment.author}</b> {comment.text}</p>)}<form className="gr-comment-form" onSubmit={(event) => { event.preventDefault(); if (!commentText.trim()) return; setGoal(selectedGoal.id, (goal) => ({ ...goal, comments: [...goal.comments, { id: `C-${Date.now()}`, author: "Thanga Janani", text: commentText }] })); setCommentText(""); notify("Comment added"); }}><input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Add a comment..." /><button className="gr-button primary">Post</button></form><footer><button className="gr-button subtle" onClick={() => openCreate(selectedGoal)}>Edit Goal</button><button className="gr-button primary" onClick={() => showGoal(selectedGoal, "progress")}>Update Progress</button></footer></div>}
      {selectedGoal && modal.kind === "progress" && <form className="gr-modal-form" onSubmit={(event) => { event.preventDefault(); const match = updateText.match(/(?:^|\s)(\d{1,3})\s*%?/); const progress = match ? Math.min(100, Math.max(0, Number(match[1]))) : Math.min(100, selectedGoal.progress + 10); setGoal(selectedGoal.id, (goal) => ({ ...goal, progress, status: progress === 100 ? "Completed" : progress < 45 ? "At Risk" : "On Track", updates: [...goal.updates, { id: `U-${Date.now()}`, date: new Date().toISOString().slice(0, 10), text: updateText.replace(/\b\d{1,3}\s*%?\b/, "").trim() || `Progress updated to ${progress}%` }] })); setModal(null); setUpdateText(""); notify("Progress update posted"); }}><div className="gr-progress-summary"><span className="gr-avatar">{employeeFor(selectedGoal.employeeId).name.slice(0, 1)}</span><div><b>{selectedGoal.title}</b><small>{employeeFor(selectedGoal.employeeId).name} · Current progress {selectedGoal.progress}%</small></div></div><label>Progress update<textarea required value={updateText} onChange={(event) => setUpdateText(event.target.value)} placeholder="Share a progress update and include the new completion percentage (for example, 70%)..." /></label><p className="gr-help-text">Include a percentage in your update to set the new progress. Without one, progress increases by 10%.</p><footer><button type="button" className="gr-button subtle" onClick={() => setModal(null)}>Cancel</button><button className="gr-button primary">Post Update</button></footer></form>}
      {selectedGoal && modal.kind === "review" && <form className="gr-modal-form gr-review-form" onSubmit={(event) => saveReview(event, true)}><div className="gr-progress-summary"><span className="gr-avatar">{employeeFor(selectedGoal.employeeId).name.slice(0, 1)}</span><div><b>{selectedGoal.title}</b><small>{employeeFor(selectedGoal.employeeId).name} · Target: {selectedGoal.target} · Actual: {selectedGoal.actual}</small></div><Status value={computedStatus(selectedGoal)} /></div><h3>Employee Self-Review</h3>{renderReviewQuestions("self")}{isSuperAdmin && <button type="button" className="gr-button subtle" onClick={() => addReviewQuestion("self")}><Plus size={13} /> Add question</button>}<h3>Manager Review</h3>{renderReviewQuestions("manager")}{isSuperAdmin && <button type="button" className="gr-button subtle" onClick={() => addReviewQuestion("manager")}><Plus size={13} /> Add question</button>}<label>Final goal status<select value={reviewForm.finalStatus} onChange={(event) => setReviewForm({ ...reviewForm, finalStatus: event.target.value })}><option>Achieved</option><option>Partially Achieved</option><option>Not Achieved</option><option>Cancelled / Revised</option></select></label><footer><button type="button" className="gr-button subtle" onClick={(event) => saveReview(event, false)}>Save Draft</button><button type="submit" className="gr-button primary">Submit Review</button></footer></form>}
      {selectedGoal && modal.kind === "delete" && <div className="gr-delete-confirm"><span className="gr-delete-icon"><Trash2 size={22} /></span><p>Delete <b>{selectedGoal.title}</b>? This action will remove the goal from this mock session.</p><footer><button className="gr-button subtle" onClick={() => setModal(null)}>Cancel</button><button className="gr-button danger-button" onClick={() => { setGoals((current) => current.filter((goal) => goal.id !== selectedGoal.id)); setModal(null); notify("Goal deleted"); }}>Delete Goal</button></footer></div>}
    </section></div>}
    {toast && <div className="gr-toast"><Check size={16} />{toast}</div>}
  </div>;
}
