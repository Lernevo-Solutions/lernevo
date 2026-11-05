// orgStore.js
// One shared data store for Organizations + User Assignments.
// Organizations page, User Assignments page, Timesheet and Scheduler all read
// from here, so anything created in one page shows up in the others.
// Data is kept in localStorage so it survives page refresh / navigation.

import { useSyncExternalStore } from "react";

const ORG_KEY = "lv-organizations";
const ASG_KEY = "lv-assignments";

const SEED_ORGS = [
  { name: "Lernevo Tech", department: "Engineering", industry: "Technology", country: "United States", website: "https://lernevo.tech", status: "Active" },
  { name: "GreenLeaf Wellness", department: "Operations", industry: "Health & Wellness", country: "Canada", website: "https://greenleaf.ca", status: "Active" },
  { name: "Northwind Logistics", department: "Logistics", industry: "Logistics", country: "United Kingdom", website: "https://northwind.co.uk", status: "Active" },
  { name: "Acme Retail", department: "Sales", industry: "Retail", country: "Australia", website: "https://acme.com.au", status: "Inactive" },
];

const SEED_ASSIGNMENTS = [
  { id: 1, userName: "Saranya P", email: "saranyapandiyarajan30@gmail.com", organization: "Lernevo Tech", jobCode: "React Developer", startDate: "2025-04-01", endDate: "", status: "Active" },
  { id: 2, userName: "Thanga Janani", email: "thangajanani6@gmail.com", organization: "Lernevo Tech", jobCode: "UI Designer", startDate: "2025-05-15", endDate: "", status: "Active" },
];

function load(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (err) { /* ignore */ }
  return seed;
}

function makeStore(key, seed) {
  let value = load(key, seed);
  const listeners = new Set();
  const emit = () => listeners.forEach((l) => l());

  // other browser tabs
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (e.key === key) { value = load(key, seed); emit(); }
    });
  }

  return {
    get: () => value,
    set: (next) => {
      value = typeof next === "function" ? next(value) : next;
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) { /* ignore */ }
      emit();
    },
    subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
  };
}

const orgStore = makeStore(ORG_KEY, SEED_ORGS);
const asgStore = makeStore(ASG_KEY, SEED_ASSIGNMENTS);

const useStore = (store) => [
  useSyncExternalStore(store.subscribe, store.get),
  store.set,
];

export const useOrganizations = () => useStore(orgStore);
export const useAssignments = () => useStore(asgStore);

// Assignment id -> Timesheet/Scheduler employee id (offset so it never clashes with the demo employees)
export const ASSIGNED_ID_OFFSET = 1000000;

// Turn assignments into the "employee" shape Timesheet + Scheduler use.
export function assignmentsToPeople(assignments, organizations) {
  const deptOf = Object.fromEntries(organizations.map((o) => [o.name, o.department]));
  return assignments
    .filter((a) => a.userName && a.status !== "Inactive")
    .map((a) => ({
      id: ASSIGNED_ID_OFFSET + Number(a.id),
      assignmentId: a.id,
      name: a.userName,
      email: a.email,
      role: a.jobCode || "Associate",
      dept: deptOf[a.organization] || "General",
      org: a.organization || "",
      startDate: a.startDate || "",
      rule: "general",
      leaves: [],
    }));
}