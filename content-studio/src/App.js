
import React from "react";
import { useState } from "react";

import Sidebar from "./component/Sidebar";
import Course from "./component/course";
import HomePage from "./component/HomePage";
import TemplatesPage from "./component/TemplatesPage";

import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

export default function App() {
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const location = useLocation();
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar */}
      {!(templateEditorOpen && location.pathname === "/templates") && <Sidebar />}

      {/* Page Content */}
      <main style={{ flex: 1, minWidth: 0 }}>

        <Routes>

          {/* Home Page */}
          <Route
            path="/"
            element={<HomePage />}
          />

          {/* Courses Page */}
          <Route
            path="/courses"
            element={<Course />}
          />

          {/* Other Pages */}
          <Route
            path="/templates"
            element={<TemplatesPage onEditorOpenChange={setTemplateEditorOpen} />}
          />

          <Route
            path="/questions"
            element={<h2>Question Bank</h2>}
          />

          <Route
            path="/media"
            element={<h2>Media Library</h2>}
          />

          <Route
            path="/studio"
            element={<h2>Content Studio</h2>}
          />

          <Route
            path="/branding"
            element={<h2>Branding</h2>}
          />

          <Route
            path="/settings"
            element={<h2>Settings</h2>}
          />

          <Route
            path="/help"
            element={<h2>Help & Documentation</h2>}
          />

          {/* Default Route */}
          <Route
            path="*"
            element={<Navigate to="/courses" replace />}
          />

        </Routes>

      </main>

    </div>
  );
}
