import React from "react";
import { useNavigate } from "react-router-dom";
import "./MyResumes.css";

const mockResumes = [
  {
    id: 1,
    name: "Software Engineer Resume",
    title: "Senior Full Stack Developer",
    template: "Modern",
    updated: "Apr 10, 2026",
  },
  {
    id: 2,
    name: "Product Manager Resume",
    title: "Product Strategy & Operations",
    template: "Professional",
    updated: "Apr 8, 2026",
  },
];

const MyResumes = () => {
  const navigate = useNavigate();

  return (
    <main className="my-resumes">
      <div className="container">
        <h1>My Resumes</h1>
        <p>Manage and edit your saved resumes, then continue building with AI-powered templates.</p>

        <div className="resumes-grid">
          {mockResumes.map((resume) => (
            <div key={resume.id} className="resume-card">
              <h2>{resume.name}</h2>
              <div className="resume-title">{resume.title}</div>
              <div className="meta">
                <span className="template-badge">{resume.template}</span>
                <span className="date">Updated {resume.updated}</span>
              </div>
              <div className="actions">
                <button className="btn-edit" onClick={() => navigate("/builder")}>Edit</button>
                <button className="btn-delete" type="button">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {mockResumes.length === 0 && (
          <div className="no-resumes">
            You don’t have any resumes yet. Start building one now.
          </div>
        )}
      </div>
    </main>
  );
};

export default MyResumes;
