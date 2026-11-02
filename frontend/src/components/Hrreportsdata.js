/* =====================================================================
   HR REPORTS - DATA LAYER
   One place that collects numbers from every HR Operations tab.

   LIVE sources (read straight from your app):
     - Scheduler  -> seedPlans / SHIFTS / PLAN_TYPES (imported from ./Scheduler)
     - Job Portal -> localStorage "jp:jobs" and "jp:applicants"

   SNAPSHOT sources (same seed data as the module files):
     - Timesheets, Leave, Payslips, Performance, Goals, Offboarding
     These modules keep data in component state, so a sibling page cannot
     see it. When your API is ready, pass real data:
         buildReportData({ leaveRequests, payslips, goals, exits, ... })
   ===================================================================== */
import { seedPlans, SHIFTS, PLAN_TYPES } from "./Scheduler";

/* ---------- tiny helpers ---------- */
const NOW = new Date();
export const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
const pad = (n) => String(n).padStart(2, "0");
const keyOf = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
const addDays = (dt, n) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n);
const mondayOf = (dt) => addDays(dt, -((dt.getDay() + 6) % 7));
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const dayDiff = (k) => Math.round((new Date(`${k}T00:00:00`) - TODAY) / 864e5);
const sum = (a, f = (x) => x) => a.reduce((s, x) => s + f(x), 0);
const r1 = (n) => Math.round(n * 10) / 10;
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const countBy = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
const readLS = (key, fallback) => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch { return fallback; } };
const rel = (offset) => keyOf(addDays(TODAY, offset));
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* =====================================================================
   SNAPSHOTS (copied from the module files)
   ===================================================================== */

/* ---- Timesheet.js ---- */
const TS_HOLIDAYS = { "2026-10-02": "Gandhi Jayanti", "2026-10-20": "Dussehra", "2026-11-08": "Diwali", "2026-12-25": "Christmas" };
const ROTA_OFF = [[0, 1], [2], [6, 0]];
const TS_SHIFTS = {
  general: { workDays: [1, 2, 3, 4, 5], start: "09:00", end: "18:00", brk: 1 },
  early: { workDays: [1, 2, 3, 4, 5, 6], start: "06:00", end: "14:00", brk: 0.5 },
  late: { workDays: [1, 2, 3, 4, 5, 6], start: "14:00", end: "22:00", brk: 0.5 },
  rota: { rota: true, start: "09:00", end: "18:00", brk: 1 },
};
const TS_TEAMS = [
  { id: "ops", name: "Operations Team", lead: 1 },
  { id: "sales", name: "Sales Team", lead: 8 },
  { id: "support", name: "Support Team", lead: 12 },
  { id: "fin", name: "Finance & Admin Team", lead: 3 },
];
const TS_EMPLOYEES = [
  { id: 1, name: "Arun", role: "Team Lead", dept: "Operations", team: "ops", rule: "general", leaves: [rel(6)] },
  { id: 5, name: "Meena", role: "Supervisor", dept: "Operations", team: "ops", rule: "early", leaves: [rel(1)] },
  { id: 9, name: "Lakshmi", role: "Associate", dept: "Operations", team: "ops", rule: "early", leaves: [rel(-4)] },
  { id: 14, name: "Hari", role: "Associate", dept: "Operations", team: "ops", rule: "late", leaves: [] },
  { id: 8, name: "Vikram", role: "Manager", dept: "Sales", team: "sales", rule: "rota", leaves: [rel(1)] },
  { id: 2, name: "Divya", role: "Executive", dept: "Sales", team: "sales", rule: "general", leaves: [rel(-1)] },
  { id: 10, name: "Suresh", role: "Executive", dept: "Sales", team: "sales", rule: "general", leaves: [rel(3)] },
  { id: 12, name: "Bala", role: "Team Lead", dept: "Support", team: "support", rule: "general", leaves: [] },
  { id: 6, name: "Ravi", role: "Associate", dept: "Support", team: "support", rule: "late", leaves: [rel(-2)] },
  { id: 7, name: "Sana", role: "Associate", dept: "Support", team: "support", rule: "rota", leaves: [] },
  { id: 11, name: "Anitha", role: "Associate", dept: "Support", team: "support", rule: "late", leaves: [rel(-6)] },
  { id: 3, name: "Karthik", role: "Analyst", dept: "Finance", team: "fin", rule: "general", leaves: [rel(-10)] },
  { id: 13, name: "Nisha", role: "Accountant", dept: "Finance", team: "fin", rule: "general", leaves: [] },
  { id: 4, name: "Priya", role: "Coordinator", dept: "Admin", team: "fin", rule: "general", leaves: [] },
];

/* ---- Leavepermission.js ---- */
const LEAVE_HOLIDAYS = [
  { date: "2026-01-14", name: "Pongal", type: "Regional" }, { date: "2026-01-15", name: "Thiruvalluvar Day", type: "Regional" },
  { date: "2026-01-26", name: "Republic Day", type: "National" }, { date: "2026-03-08", name: "Maha Shivaratri", type: "Regional" },
  { date: "2026-04-14", name: "Tamil New Year", type: "Regional" }, { date: "2026-08-15", name: "Independence Day", type: "National" },
  { date: "2026-10-02", name: "Gandhi Jayanti", type: "National" },
];
const LEAVE_REQUESTS = [
  { id: 1, name: "Ananya S", team: "Frontend Team", department: "Engineering", date: "2026-09-14", duration: 1.5, reason: "Doctor appointment", status: "Pending", used: 4.5, limit: 12 },
  { id: 2, name: "Ravi Kumar", team: "Backend Team", department: "Engineering", date: "2026-09-14", duration: 1.5, reason: "Personal work", status: "Approved", used: 3, limit: 12 },
  { id: 3, name: "Priya Sharma", team: "HR Team", department: "HR", date: "2026-09-13", duration: 2, reason: "Bank work", status: "Rejected", used: 2, limit: 12 },
  { id: 4, name: "Karthik T", team: "Accounts Team", department: "Finance", date: "2026-09-12", duration: 2, reason: "Personal errand", status: "Pending", used: 1.5, limit: 12 },
  { id: 5, name: "Nithya S", team: "Operations Team", department: "Operations", date: "2026-09-11", duration: 1, reason: "School meeting", status: "Approved", used: 2, limit: 12 },
  { id: 6, name: "Arun P", team: "Frontend Team", department: "Engineering", date: "2026-09-15", duration: 1.5, reason: "Medical appointment", status: "Pending", used: 3, limit: 12 },
];
const LEAVE_ASSIGNMENTS = [
  { id: 1, set: "India – National Holidays", to: "Frontend Team", type: "Team", status: "Active" },
  { id: 2, set: "United States – Federal Holidays", to: "Design Team", type: "Team", status: "Active" },
  { id: 3, set: "India – Tamil Nadu", to: "Ravi Kumar", type: "Individual", status: "Active" },
  { id: 4, set: "India – National Holidays", to: "Backend Team", type: "Team", status: "Upcoming" },
  { id: 5, set: "United Kingdom – Public Holidays", to: "Priya Sharma", type: "Individual", status: "Active" },
];
const LEAVE_SET_COUNT = 4;

/* ---- Payslip.js ---- */
const PAYSLIP_ROWS = [
  ["Janani S", "EMP001", "Engineering", 32000, 12000, 4500, 2400, 200, 300, "Approved", "Generated", "Sent", 1800],
  ["Arun Kumar", "EMP002", "Design", 28000, 10000, 3500, 2100, 200, 150, "Approved", "Generated", "Not Sent", 0],
  ["Meena P", "EMP003", "Product", 41000, 16000, 6000, 3000, 200, 500, "Pending approval", "Pending", "Not Sent", 0],
  ["Karthik R", "EMP004", "Marketing", 30000, 12000, 4200, 2200, 200, 200, "Approved", "Generated", "Not Sent", 900],
  ["Priya S", "EMP005", "HR", 26000, 10000, 3200, 1900, 200, 100, "Approved", "Pending", "Not Sent", 0],
  ["Vijay T", "EMP006", "Sales", 29000, 11000, 5500, 2200, 200, 800, "Approved", "Generated", "Not Sent", 2400],
  ["Nisha R", "EMP007", "Engineering", 27000, 10500, 3200, 2000, 200, 100, "Approved", "Pending", "Not Sent", 0],
  ["Rahul M", "EMP008", "Design", 31000, 12000, 3800, 2300, 200, 250, "Approved", "Generated", "Not Sent", 0],
  ["Divya K", "EMP009", "Product", 35000, 14000, 4800, 2600, 200, 300, "Missing timesheet", "Pending", "Not Sent", 0],
  ["Sanjay V", "EMP010", "Sales", 33000, 12500, 4700, 2450, 200, 350, "Approved", "Generated", "Not Sent", 0],
  ["Anita D", "EMP011", "HR", 25000, 9500, 3000, 1800, 200, 100, "Missing payroll data", "Pending", "Not Sent", 0],
  ["Rohit B", "EMP012", "Marketing", 29000, 11000, 3900, 2100, 200, 250, "Approved", "Generated", "Failed", 0],
].map(([name, id, department, basic, hra, special, pf, tax, other, approval, status, email, overtime]) => ({
  name, id, department, approval, status, email, overtime,
  gross: basic + hra + special + overtime,
  deductions: pf + tax + other,
}));

/* ---- Performance.js ---- */
const PERF_TEAMS = [
  { id: "dev", name: "Development", color: "#315efb", onTime: 78 },
  { id: "product", name: "Product", color: "#8a5cf6", onTime: 80 },
  { id: "design", name: "Design", color: "#e16a9a", onTime: 86 },
  { id: "marketing", name: "Marketing", color: "#e79a28", onTime: 83 },
  { id: "qa", name: "QA", color: "#20a889", onTime: 90 },
];
const PERF_STAFF = [
  ["Janani", "Frontend Developer", "dev", 4.5], ["Aravind", "Backend Developer", "dev", 4.0], ["Sneha", "UI/UX Designer", "dev", 4.2],
  ["Karthik", "DevOps Engineer", "dev", 3.8], ["Priya", "QA Engineer", "dev", 4.5], ["Meera Shah", "Product Manager", "product", 4.2],
  ["Rahul Verma", "Product Analyst", "product", 4.0], ["Aisha Khan", "Business Analyst", "product", 3.9], ["Dev Patel", "Product Operations", "product", 3.9],
  ["Nisha Reddy", "Product Designer", "design", 4.4], ["Varun Pillai", "Visual Designer", "design", 4.2], ["Tara Bose", "UX Researcher", "design", 4.3],
  ["Rohan Kulkarni", "Marketing Lead", "marketing", 4.1], ["Pooja Menon", "Content Strategist", "marketing", 3.9], ["Aman Gill", "Growth Marketer", "marketing", 3.8],
  ["Ishita Sen", "Social Media Manager", "marketing", 3.8], ["Sanjay Rao", "QA Lead", "qa", 4.5], ["Divya Krishnan", "Automation Engineer", "qa", 4.4],
  ["Naveen Thomas", "QA Analyst", "qa", 4.3],
].map(([name, role, teamId, rating], i) => ({ i, name, role, teamId, rating }));
/* Same rule as seedReviews: first review is the Q3 quarterly one, every 5th (from 3rd) is still pending */
const PERF_REVIEWS = PERF_STAFF.flatMap((e) => {
  const types = ["Quarterly", "Monthly", ...(e.i % 3 === 0 ? ["Weekly"] : []), ...(e.i % 4 === 0 ? ["Yearly"] : [])];
  return types.map((type, j) => ({
    employee: e.name, teamId: e.teamId, type, current: j === 0,
    rating: Math.round((e.rating + (j % 2 ? -0.2 : 0)) * 10) / 10,
    status: j === 0 && e.i % 5 === 2 ? "Pending" : "Completed",
  }));
});

/* ---- GoalsReview.js ---- */
const GOAL_PEOPLE = [
  { id: "e1", name: "Arun Kumar", department: "Engineering" }, { id: "e2", name: "Priya S", department: "Product" },
  { id: "e3", name: "Meena V", department: "Engineering" }, { id: "e4", name: "Karthik R", department: "Product" },
  { id: "e5", name: "Ananya Rao", department: "Design" }, { id: "e6", name: "Divya Nair", department: "Customer Success" },
  { id: "e7", name: "Rohan Das", department: "HR" }, { id: "e8", name: "Isha Patel", department: "Engineering" },
];
const GOAL_TITLES = ["Improve API response time by 30%", "Launch employee onboarding flow", "Complete security training", "Increase user activation rate to 60%", "Reduce support resolution time by 20%", "Ship quarterly roadmap milestones", "Improve design system adoption", "Build a repeatable hiring process", "Increase test automation coverage", "Publish customer insights report", "Deliver manager enablement sessions", "Improve product discovery completion"];
const GOAL_FLAGS = ["On Track", "At Risk", "Completed", "On Track", "At Risk", "On Track", "Completed", "On Track", "At Risk", "On Track", "On Track", "On Track"];
const GOALS = Array.from({ length: 48 }, (_, index) => {
  const person = GOAL_PEOPLE[index % GOAL_PEOPLE.length];
  const flag = GOAL_FLAGS[index % 12];
  const progress = flag === "Completed" ? 100 : flag === "On Track" ? [68, 74, 56, 82, 42][index % 5] : [30, 42, 22, 35][index % 4];
  const status = progress >= 100 ? "Completed" : progress === 0 ? "Not Started" : flag === "At Risk" ? "At Risk" : "On Track";
  return {
    id: `G-${String(index + 1).padStart(3, "0")}`, title: GOAL_TITLES[index % GOAL_TITLES.length], owner: person.name, department: person.department,
    type: index % 4 === 3 ? "Team" : "Individual", progress, status,
    dueDate: `2026-${index % 3 === 0 ? "12" : index % 3 === 1 ? "11" : "10"}-${String(10 + ((index * 3) % 19)).padStart(2, "0")}`,
  };
});

/* ---- Offboarding.js ---- */
export const EXIT_CHECKLIST = [
  { key: "itAssets", label: "Assets returned" }, { key: "access", label: "Access revoked" }, { key: "knowledge", label: "Knowledge transfer" },
  { key: "finance", label: "Dues cleared" }, { key: "documents", label: "Documents collected" }, { key: "exitInterview", label: "Exit interview" },
];
const done = (...k) => Object.fromEntries(EXIT_CHECKLIST.map((c) => [c.key, k.includes(c.key)]));
const EXITS = [
  { id: 1, empId: "EMP-0412", name: "Ravi Shankar", designation: "Senior Developer", department: "Engineering", exitType: "Resignation", reason: "Better opportunity", lastWorkingDay: "2026-12-04", checklist: done(), relievedOn: "", fnfAmount: 185000, fnfStatus: "Pending" },
  { id: 2, empId: "EMP-0655", name: "Anitha K", designation: "HR Executive", department: "Human Resources", exitType: "Resignation", reason: "Higher studies", lastWorkingDay: "2026-10-31", checklist: done("itAssets", "access", "knowledge", "documents"), relievedOn: "", fnfAmount: 62000, fnfStatus: "Processing" },
  { id: 3, empId: "EMP-0231", name: "Mohan Das", designation: "Accounts Manager", department: "Finance", exitType: "Resignation", reason: "Relocating", lastWorkingDay: "2026-10-10", checklist: done(...EXIT_CHECKLIST.map((c) => c.key)), relievedOn: "2026-10-10", fnfAmount: 240000, fnfStatus: "Paid" },
  { id: 4, empId: "EMP-0788", name: "Preethi N", designation: "Sales Executive", department: "Sales", exitType: "Contract end", reason: "Contract completed", lastWorkingDay: "2026-11-04", checklist: done("itAssets"), relievedOn: "", fnfAmount: 28000, fnfStatus: "Pending" },
];

/* ---- Jobportal.js (fallback seed; live data comes from localStorage) ---- */
const JOB_SEED = [
  { id: 1, code: "JD-101", title: "Frontend Developer", department: "Engineering", openings: 2, deadline: "2026-11-05", status: "Open", urgent: true },
  { id: 2, code: "JD-102", title: "HR Executive", department: "Human Resources", openings: 1, deadline: "2026-11-12", status: "Open", urgent: false },
  { id: 3, code: "JD-103", title: "Accounts Intern", department: "Finance", openings: 3, deadline: "2026-10-20", status: "Closed", urgent: false },
];
const APPLICANT_SEED = [
  { id: 1, jobId: 1, name: "Karthik Raj", isEmployee: true, status: "Shortlisted" }, { id: 2, jobId: 1, name: "Divya Lakshmi", isEmployee: false, status: "Applied" },
  { id: 3, jobId: 2, name: "Suresh Kumar", isEmployee: false, status: "Applied" }, { id: 4, jobId: 1, name: "Meena Priya", isEmployee: true, status: "Applied" },
  { id: 5, jobId: 3, name: "Harini S", isEmployee: false, status: "Hired" },
];

/* =====================================================================
   SELECTORS
   ===================================================================== */

/* Timesheets: same demo rules as Timesheet.js getDayInfo */
const stdHours = (r) => ((toMin(r.end) - toMin(r.start) + 1440) % 1440) / 60 - r.brk;
function dayInfo(date, emp) {
  const r = TS_SHIFTS[emp.rule];
  const k = keyOf(date);
  if (TS_HOLIDAYS[k]) return { type: "holiday" };
  const weekNo = Math.floor((mondayOf(date) - new Date(2026, 0, 5)) / 6048e5);
  const off = r.rota ? ROTA_OFF[(((weekNo + emp.id) % 3) + 3) % 3].includes(date.getDay()) : !r.workDays.includes(date.getDay());
  if (off) return { type: "off" };
  if (emp.leaves.includes(k)) return { type: "leave" };
  const std = stdHours(r);
  const diff = Math.round((date - TODAY) / 864e5);
  if (diff > 0) return { type: "scheduled" };
  if (diff < 0 && (date.getDate() + emp.id) % 23 === 1) return { type: "missing" };
  const hours = std + [0, 0.25, 0, 0.5, 0][(date.getDate() + emp.id) % 5];
  return { type: "work", hours, ot: hours - std, status: diff >= -2 ? "Pending" : "Approved" };
}

function rangeStats(from, to, employees, teams) {
  const days = [];
  for (let x = from; x <= to; x = addDays(x, 1)) days.push(x);
  const perEmp = employees.map((e) => {
    const t = { hours: 0, ot: 0, leave: 0, missing: 0, pending: 0, workDays: 0 };
    days.forEach((day) => {
      const i = dayInfo(day, e);
      if (i.type === "work") { t.hours += i.hours; t.ot += i.ot; t.workDays++; if (i.status === "Pending") t.pending++; }
      else if (i.type === "leave") t.leave++;
      else if (i.type === "missing") t.missing++;
    });
    const base = t.workDays + t.leave + t.missing;
    return { id: e.id, name: e.name, role: e.role, team: e.team, teamName: (teams.find((x) => x.id === e.team) || {}).name || "No team", ...t, attendance: base ? Math.round((100 * (t.workDays + t.leave)) / base) : 100 };
  });
  const roll = (list) => {
    const s = { hours: 0, ot: 0, leave: 0, missing: 0, pending: 0, workDays: 0 };
    list.forEach((p) => Object.keys(s).forEach((k) => { s[k] += p[k]; }));
    const base = s.workDays + s.leave + s.missing;
    return { ...s, hours: r1(s.hours), ot: r1(s.ot), attendance: base ? Math.round((100 * (s.workDays + s.leave)) / base) : 100 };
  };
  return {
    total: roll(perEmp),
    perEmp,
    perTeam: teams.map((t) => ({ id: t.id, name: t.name.replace(" Team", ""), people: perEmp.filter((p) => p.team === t.id).length, ...roll(perEmp.filter((p) => p.team === t.id)) })),
  };
}

function lastDays(n, employees) {
  const out = [];
  for (let off = -(n - 1); off <= 0; off++) {
    const day = addDays(TODAY, off);
    const c = { label: `${DAY_SHORT[day.getDay()]} ${day.getDate()}`, work: 0, leave: 0, missing: 0, hours: 0 };
    employees.forEach((e) => {
      const i = dayInfo(day, e);
      if (i.type === "work") { c.work++; c.hours += i.hours; }
      else if (i.type === "leave") c.leave++;
      else if (i.type === "missing") c.missing++;
    });
    out.push(c);
  }
  return out;
}

/* Scheduler: real seedPlans from Scheduler.js */
function schedulerStats(employees, plansIn) {
  const plans = plansIn || seedPlans(employees);
  const weekEnd = rel(6);
  const week = plans.filter((p) => p.date >= rel(0) && p.date <= weekEnd);
  const past = plans.filter((p) => p.date < rel(0));
  const shiftOfHour = (h) => (SHIFTS.find((s) => (s.from < s.to ? h >= s.from && h < s.to : h >= s.from || h < s.to)) || SHIFTS[0]).id;
  const nameOf = (id) => (employees.find((e) => e.id === id) || {}).name || "—";
  const perDay = Array.from({ length: 7 }, (_, i) => {
    const k = rel(i); const d = addDays(TODAY, i);
    return { label: i === 0 ? "Today" : `${DAY_SHORT[d.getDay()]} ${d.getDate()}`, count: week.filter((p) => p.date === k).length };
  });
  const typeCount = countBy(week, (p) => (PLAN_TYPES[p.type] || PLAN_TYPES.other).label);
  const shiftCount = countBy(week, (p) => shiftOfHour(Math.floor(toMin(p.start) / 60)));
  return {
    week: week.length,
    ackRate: pct(past.filter((p) => p.ack).length, past.length),
    unackSoon: plans.filter((p) => p.date >= rel(0) && p.date <= rel(1) && !p.ack).length,
    perDay,
    byType: Object.entries(typeCount).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
    byShift: SHIFTS.map((s) => ({ label: `${s.icon} ${s.label}`, value: shiftCount[s.id] || 0 })),
    upcoming: week.filter((p) => ["visit", "training", "meeting"].includes(p.type)).slice(0, 6).map((p) => ({ who: nameOf(p.empId), title: p.title, type: (PLAN_TYPES[p.type] || {}).label, date: p.date, start: p.start })),
  };
}

/* =====================================================================
   MAIN BUILDER
   ===================================================================== */
export function buildReportData(overrides = {}) {
  const employees = overrides.employees || TS_EMPLOYEES;
  const teams = overrides.teams || TS_TEAMS;
  const leaveRequests = overrides.leaveRequests || LEAVE_REQUESTS;
  const payslips = overrides.payslips || PAYSLIP_ROWS;
  const goals = overrides.goals || GOALS;
  const exits = overrides.exits || EXITS;
  const jobs = overrides.jobs || readLS("jp:jobs", JOB_SEED);
  const applicants = overrides.applicants || readLS("jp:applicants", APPLICANT_SEED);
  const reviews = overrides.reviews || PERF_REVIEWS;

  /* ---- Workforce ---- */
  const deptCount = countBy(employees, (e) => e.dept);
  const workforce = {
    headcount: employees.length,
    byDept: Object.entries(deptCount).map(([label, value]) => ({ label, value })),
    teams: teams.length,
  };

  /* ---- Attendance + Scheduler ---- */
  const attendance = {
    week: rangeStats(mondayOf(TODAY), addDays(mondayOf(TODAY), 6), employees, teams),
    month: rangeStats(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1), new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0), employees, teams),
    daily: lastDays(14, employees),
  };
  const scheduler = schedulerStats(employees, overrides.plans);

  /* ---- Leave ---- */
  const lStatus = countBy(leaveRequests, (r) => r.status);
  const teamHours = {};
  leaveRequests.forEach((r) => { teamHours[r.team] = (teamHours[r.team] || 0) + r.duration; });
  const holidayMap = {};
  [...LEAVE_HOLIDAYS, ...Object.entries(TS_HOLIDAYS).map(([date, name]) => ({ date, name, type: "Company" }))].forEach((h) => { holidayMap[h.date] = h; });
  const holidays = Object.values(holidayMap).sort((a, b) => a.date.localeCompare(b.date));
  const leave = {
    pending: lStatus.Pending || 0, approved: lStatus.Approved || 0, rejected: lStatus.Rejected || 0, total: leaveRequests.length,
    decided: (lStatus.Approved || 0) + (lStatus.Rejected || 0),
    approvalRate: pct(lStatus.Approved || 0, (lStatus.Approved || 0) + (lStatus.Rejected || 0)),
    hours: r1(sum(leaveRequests, (r) => r.duration)),
    byTeam: Object.entries(teamHours).map(([label, value]) => ({ label: label.replace(" Team", ""), value })),
    requests: leaveRequests,
    upcomingHolidays: holidays.filter((h) => h.date >= rel(0)).slice(0, 5),
    assignments: LEAVE_ASSIGNMENTS,
    sets: LEAVE_SET_COUNT,
    activeAssignments: LEAVE_ASSIGNMENTS.filter((a) => a.status === "Active").length,
  };

  /* ---- Payroll ---- */
  const byDeptPay = {};
  payslips.forEach((p) => { byDeptPay[p.department] = (byDeptPay[p.department] || 0) + (p.gross - p.deductions); });
  const approvals = countBy(payslips, (p) => (p.approval === "Approved" ? "Approved" : p.approval));
  const payroll = {
    count: payslips.length,
    gross: sum(payslips, (p) => p.gross), deductions: sum(payslips, (p) => p.deductions), net: sum(payslips, (p) => p.gross - p.deductions),
    overtime: sum(payslips, (p) => p.overtime),
    approved: approvals.Approved || 0,
    blocked: payslips.filter((p) => p.approval !== "Approved").length,
    emailSent: payslips.filter((p) => p.email === "Sent").length,
    emailFailed: payslips.filter((p) => p.email === "Failed").length,
    generated: payslips.filter((p) => p.status === "Generated").length,
    byDept: Object.entries(byDeptPay).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
    approvalMix: Object.entries(approvals).map(([label, value]) => ({ label, value })),
    rows: payslips.map((p) => ({ ...p, net: p.gross - p.deductions })),
  };

  /* ---- Performance ---- */
  const current = reviews.filter((r) => r.current);
  const completedCur = current.filter((r) => r.status === "Completed");
  const teamRatings = PERF_TEAMS.map((t) => {
    const list = completedCur.filter((r) => r.teamId === t.id);
    return { ...t, rating: list.length ? r1(sum(list, (r) => r.rating) / list.length) : 0, people: list.length };
  });
  const bucket = (r) => (r >= 4.5 ? "Outstanding" : r >= 4 ? "Strong" : r >= 3.5 ? "Solid" : "Needs support");
  const dist = countBy(completedCur, (r) => bucket(r.rating));
  const performance = {
    avg: completedCur.length ? r1(sum(completedCur, (r) => r.rating) / completedCur.length) : 0,
    done: reviews.filter((r) => r.status === "Completed").length,
    pending: reviews.filter((r) => r.status === "Pending").length,
    total: reviews.length,
    currentDone: completedCur.length, currentTotal: current.length,
    byTeam: teamRatings,
    distribution: ["Outstanding", "Strong", "Solid", "Needs support"].map((label) => ({ label, value: dist[label] || 0 })),
    top: [...completedCur].sort((a, b) => b.rating - a.rating).slice(0, 5).map((r) => ({ name: r.employee, team: (PERF_TEAMS.find((t) => t.id === r.teamId) || {}).name, rating: r.rating })),
  };

  /* ---- Goals ---- */
  const gStatus = countBy(goals, (g) => g.status);
  const gDept = {};
  goals.forEach((g) => { (gDept[g.department] = gDept[g.department] || []).push(g.progress); });
  const goalsOut = {
    total: goals.length,
    completed: gStatus.Completed || 0, onTrack: gStatus["On Track"] || 0, atRisk: gStatus["At Risk"] || 0, notStarted: gStatus["Not Started"] || 0,
    avgProgress: goals.length ? Math.round(sum(goals, (g) => g.progress) / goals.length) : 0,
    statusMix: ["Completed", "On Track", "At Risk", "Not Started"].map((label) => ({ label, value: gStatus[label] || 0 })),
    byDept: Object.entries(gDept).map(([label, v]) => ({ label, value: Math.round(sum(v) / v.length) })).sort((a, b) => b.value - a.value),
    dueSoon: goals.filter((g) => g.status !== "Completed" && dayDiff(g.dueDate) >= 0 && dayDiff(g.dueDate) <= 30).length,
    risky: goals.filter((g) => g.status === "At Risk").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6),
  };

  /* ---- Hiring ---- */
  const aStatus = countBy(applicants, (a) => a.status);
  const jobDays = (j) => Math.ceil((new Date(j.deadline) - new Date(keyOf(TODAY))) / 864e5);
  const jobRows = jobs.map((j) => {
    const list = applicants.filter((a) => a.jobId === j.id);
    const s = countBy(list, (a) => a.status);
    return { id: j.id, code: j.code, title: j.title, department: j.department, openings: Number(j.openings) || 0, status: j.status, urgent: !!j.urgent, deadline: j.deadline, daysLeft: jobDays(j), applicants: list.length, shortlisted: s.Shortlisted || 0, hired: s.Hired || 0 };
  });
  const open = jobs.filter((j) => j.status === "Open");
  const hiring = {
    openRoles: open.length,
    openings: sum(open, (j) => Number(j.openings) || 0),
    applicants: applicants.length,
    shortlisted: aStatus.Shortlisted || 0, hired: aStatus.Hired || 0, rejected: aStatus.Rejected || 0, inReview: aStatus.Applied || 0,
    internal: applicants.filter((a) => a.isEmployee).length,
    statusMix: ["Applied", "Shortlisted", "Hired", "Rejected"].map((label) => ({ label, value: aStatus[label] || 0 })),
    jobs: jobRows,
    closingSoon: jobRows.filter((j) => j.status === "Open" && j.daysLeft >= 0 && j.daysLeft <= 7),
  };

  /* ---- Offboarding ---- */
  const exitDone = (e) => EXIT_CHECKLIST.filter((c) => e.checklist[c.key]).length;
  const stageOf = (e) => (e.relievedOn ? "Relieved" : exitDone(e) > 0 ? "Clearance" : "Notice period");
  const active = exits.filter((e) => !e.relievedOn);
  const typeMix = countBy(exits, (e) => e.exitType);
  const exitsOut = {
    total: exits.length, active: active.length, relieved: exits.length - active.length,
    fnfDue: sum(exits.filter((e) => e.fnfStatus !== "Paid"), (e) => e.fnfAmount),
    fnfOpen: exits.filter((e) => e.fnfStatus !== "Paid").length,
    checklistPct: pct(sum(exits, exitDone), exits.length * EXIT_CHECKLIST.length),
    typeMix: Object.entries(typeMix).map(([label, value]) => ({ label, value })),
    itemProgress: EXIT_CHECKLIST.map((c) => ({ label: c.label, value: pct(exits.filter((e) => e.checklist[c.key]).length, exits.length) })),
    rows: exits.map((e) => ({ ...e, stage: stageOf(e), done: exitDone(e), total: EXIT_CHECKLIST.length, daysToLwd: dayDiff(e.lastWorkingDay) })),
  };
  exitsOut.leavingSoon = exitsOut.rows.filter((e) => !e.relievedOn && e.daysToLwd <= 14);

  /* ---- Needs attention (cross-module) ---- */
  const attention = [];
  const add = (module, tab, severity, title, detail) => attention.push({ module, tab, severity, title, detail });
  const missing14 = sum(attendance.daily, (d) => d.missing);
  if (missing14) add("Timesheets", "attendance", "med", `${missing14} missing timesheet ${missing14 > 1 ? "days" : "day"}`, "In the last 14 days");
  if (attendance.week.total.pending) add("Timesheets", "attendance", "low", `${attendance.week.total.pending} days awaiting approval`, "Logged this week, not yet signed off");
  if (scheduler.unackSoon) add("Scheduler", "attendance", "low", `${scheduler.unackSoon} plans not acknowledged`, "Starting today or tomorrow");
  if (leave.pending) add("Leave", "leave", "med", `${leave.pending} permission ${leave.pending > 1 ? "requests need" : "request needs"} a decision`, leaveRequests.filter((r) => r.status === "Pending").map((r) => r.name).join(", "));
  if (payroll.blocked) add("Payslips", "payroll", "high", `${payroll.blocked} ${payroll.blocked > 1 ? "payslips are" : "payslip is"} blocked`, payslips.filter((p) => p.approval !== "Approved").map((p) => `${p.name.split(" ")[0]}: ${p.approval.toLowerCase()}`).join(" · "));
  if (payroll.emailFailed) add("Payslips", "payroll", "med", `${payroll.emailFailed} payslip ${payroll.emailFailed > 1 ? "emails" : "email"} failed to send`, payslips.filter((p) => p.email === "Failed").map((p) => p.name).join(", "));
  if (performance.pending) add("Performance", "performance", "med", `${performance.pending} ${performance.pending > 1 ? "reviews are" : "review is"} still pending`, "Q3 2026 cycle");
  if (goalsOut.atRisk) add("Goals", "performance", "med", `${goalsOut.atRisk} goals are at risk`, `${goalsOut.dueSoon} goals fall due within 30 days`);
  if (hiring.closingSoon.length) add("Job Portal", "hiring", "med", `${hiring.closingSoon.length} ${hiring.closingSoon.length > 1 ? "roles close" : "role closes"} within 7 days`, hiring.closingSoon.map((j) => j.title).join(", "));
  if (hiring.inReview) add("Job Portal", "hiring", "low", `${hiring.inReview} ${hiring.inReview > 1 ? "applicants are" : "applicant is"} waiting for review`, "Status is still “Applied”");
  const lateFnf = exitsOut.leavingSoon.filter((e) => e.fnfStatus !== "Paid");
  if (lateFnf.length) add("Offboarding", "exits", "high", `${lateFnf.length} ${lateFnf.length > 1 ? "exits have" : "exit has"} F&F unpaid`, lateFnf.map((e) => `${e.name} (${e.daysToLwd < 0 ? `${-e.daysToLwd}d past` : `${e.daysToLwd}d to`} last day)`).join(" · "));
  const lateClear = exitsOut.leavingSoon.filter((e) => e.done < e.total);
  if (lateClear.length) add("Offboarding", "exits", "med", `${lateClear.length} ${lateClear.length > 1 ? "clearances are" : "clearance is"} incomplete`, lateClear.map((e) => `${e.name} ${e.done}/${e.total}`).join(" · "));
  const order = { high: 0, med: 1, low: 2 };
  attention.sort((a, b) => order[a.severity] - order[b.severity]);

  /* ---- Overview scorecard: one headline per module ---- */
  const wk = attendance.month.total;
  const scorecard = [
    { module: "Scheduler", tab: "attendance", label: "Plans this week", value: scheduler.week, caption: `${scheduler.ackRate}% acknowledged`, progress: scheduler.ackRate },
    { module: "Timesheets", tab: "attendance", label: "Attendance this month", value: `${wk.attendance}%`, caption: `${wk.hours} hrs logged`, progress: wk.attendance },
    { module: "Leave", tab: "leave", label: "Pending requests", value: leave.pending, caption: `${leave.approvalRate}% approval rate`, progress: leave.approvalRate },
    { module: "Payslips", tab: "payroll", label: "Payslips approved", value: `${payroll.approved}/${payroll.count}`, caption: `${payroll.generated} generated`, progress: pct(payroll.approved, payroll.count) },
    { module: "Performance", tab: "performance", label: "Average rating", value: `${performance.avg} / 5`, caption: `${performance.currentDone}/${performance.currentTotal} Q3 reviews done`, progress: pct(performance.currentDone, performance.currentTotal) },
    { module: "Goals", tab: "performance", label: "Average progress", value: `${goalsOut.avgProgress}%`, caption: `${goalsOut.atRisk} at risk`, progress: goalsOut.avgProgress },
    { module: "Job Portal", tab: "hiring", label: "Open roles", value: hiring.openRoles, caption: `${hiring.applicants} applicants`, progress: pct(hiring.hired, Math.max(hiring.openings + hiring.hired, 1)) },
    { module: "Offboarding", tab: "exits", label: "Exits in progress", value: exitsOut.active, caption: `${exitsOut.checklistPct}% checklist done`, progress: exitsOut.checklistPct },
  ];

  /* ---- Flat rows for CSV export ---- */
  const exportRows = [
    ["Workforce", "Active employees", workforce.headcount],
    ["Timesheets", "Attendance this month (%)", wk.attendance], ["Timesheets", "Hours logged this month", wk.hours], ["Timesheets", "Overtime hours this month", wk.ot],
    ["Scheduler", "Plans this week", scheduler.week], ["Scheduler", "Acknowledged (%)", scheduler.ackRate],
    ["Leave", "Pending requests", leave.pending], ["Leave", "Approved", leave.approved], ["Leave", "Rejected", leave.rejected],
    ["Payslips", "Gross pay (INR)", payroll.gross], ["Payslips", "Deductions (INR)", payroll.deductions], ["Payslips", "Net pay (INR)", payroll.net], ["Payslips", "Approved payslips", `${payroll.approved}/${payroll.count}`],
    ["Performance", "Average rating", performance.avg], ["Performance", "Pending reviews", performance.pending],
    ["Goals", "Average progress (%)", goalsOut.avgProgress], ["Goals", "At risk", goalsOut.atRisk], ["Goals", "Completed", goalsOut.completed],
    ["Job Portal", "Open roles", hiring.openRoles], ["Job Portal", "Applicants", hiring.applicants], ["Job Portal", "Hired", hiring.hired],
    ["Offboarding", "Exits in progress", exitsOut.active], ["Offboarding", "F&F due (INR)", exitsOut.fnfDue], ["Offboarding", "Checklist done (%)", exitsOut.checklistPct],
  ];

  return { workforce, attendance, scheduler, leave, payroll, performance, goals: goalsOut, hiring, exits: exitsOut, attention, scorecard, exportRows, builtAt: new Date() };
}