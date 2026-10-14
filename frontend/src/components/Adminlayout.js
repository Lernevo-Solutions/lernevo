import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Adminlayout.css";

/**
 * AdminLayout
 * -----------------------------------------------------------------------
 * Wraps any admin/HR page with the Sidebar and Topbar, laid out
 * side-by-side using flex. Individual pages (Timesheet, Organizations,
 * UserAssignments, ...) should NOT import <Sidebar /> themselves — doing
 * that inside a plain block <div> stacks the full-height sidebar ABOVE the
 * page content (a huge blank gap bug).
 *
 * Usage in App.js:
 *   <Route path="/timesheet" element={<AdminLayout><Timesheet /></AdminLayout>} />
 */
export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-body">
        <Topbar />
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}