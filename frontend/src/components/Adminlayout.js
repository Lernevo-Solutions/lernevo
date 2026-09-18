import React from "react";
import Sidebar from "./Sidebar";
import "./Adminlayout.css";

/**
 * AdminLayout
 * -----------------------------------------------------------------------
 * Wraps any admin/HR page with the Sidebar, laid out side-by-side using
 * flex. Individual pages (Timesheet, Organizations, UserAssignments, ...)
 * should NOT import <Sidebar /> themselves — doing that inside a plain
 * block <div> stacks the full-height sidebar ABOVE the page content
 * (since a 100vh block element pushes everything after it down by its
 * own height), which is exactly the huge blank gap bug.
 *
 * Usage in App.js:
 *   <Route path="/timesheet" element={<AdminLayout><Timesheet /></AdminLayout>} />
 */
export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}