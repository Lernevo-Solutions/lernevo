import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import GalleryPreview from "./GalleryPreview";
import { API_BASE_URL } from "../config";
import {
  MAX_SAVED_RESUMES,
  buildResumePreviewData,
  formatResumeUpdatedAt,
  getResumePageCount,
  resolveTemplateDescriptor,
} from "./resumeLibraryUtils";
import "./MyResumes.css";

const EMPTY_ERROR = "";

function ResumePreviewCard({ resume, onOpen, onEdit, onDelete }) {
  const frameRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(0.34);

  const template = resolveTemplateDescriptor(resume);
  const previewData = buildResumePreviewData(resume);
  const extraPages = Math.max(0, getResumePageCount(resume.canvas_states) - 1);
  const accentColor = resume.theme_color || "#2563eb";
  const font = resume.font || "Inter";

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;
    if (typeof ResizeObserver === "undefined") return undefined;

    const recalc = () => {
      const availableWidth = frame.clientWidth || 1;
      const nextScale = Math.min(0.38, Math.max(0.24, (availableWidth - 24) / 595));
      setScale(nextScale);
      if (innerRef.current) {
        const naturalHeight = innerRef.current.scrollHeight || 842;
        frame.style.height = `${Math.max(320, naturalHeight * nextScale)}px`;
      }
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(frame);
    if (innerRef.current) observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <article className="resume-card resume-card--preview">
      <button
        type="button"
        className="resume-preview-shell"
        onClick={onOpen}
        aria-label={`Open ${resume.name}`}
      >
        <div className="resume-preview-frame" ref={frameRef}>
          <div
            className="resume-preview-inner"
            ref={innerRef}
            style={{
              width: 595,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              height: "auto",
            }}
          >
            <GalleryPreview
              tpl={template}
              data={previewData}
              accentColor={accentColor}
              font={font}
              extraPages={extraPages}
            />
          </div>
        </div>
      </button>

      <div className="resume-card-body">
        <div className="resume-card-top">
          <div className="resume-card-copy">
            <span className="resume-pill">{template.name}</span>
            <h2>{resume.name}</h2>
            <p>{resume.title}</p>
          </div>
          <span className="resume-open">Open</span>
        </div>

        <div className="resume-meta">
          <span>Last updated {formatResumeUpdatedAt(resume.updatedAt || resume.updated)}</span>
          <span>{extraPages > 0 ? `${extraPages + 1} pages` : "1 page"}</span>
        </div>

        <div className="actions">
          <button className="btn-open" type="button" onClick={onOpen}>
            Open
          </button>
          <button className="btn-edit" type="button" onClick={onEdit}>
            Edit
          </button>
          <button className="btn-delete" type="button" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

const mapResume = (resume) => {
  const template = resolveTemplateDescriptor(resume);
  const title =
    resume.personal_info?.full_name ||
    resume.personal_info?.job_title ||
    resume.title ||
    "My Resume";

  return {
    ...resume,
    name: title,
    title: resume.personal_info?.job_title || resume.title || "Resume draft",
    template,
    updatedAt: resume.updated_at || resume.created_at,
  };
};

const MyResumes = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(EMPTY_ERROR);

  useEffect(() => {
    const loadResumes = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Sign in to view and manage your saved resumes.");
        setResumes([]);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/resumes/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        const items = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.results)
            ? response.data.results
            : [];

        setResumes(items.slice(0, MAX_SAVED_RESUMES).map(mapResume));
        setError(EMPTY_ERROR);
      } catch (err) {
        setError("We couldn't load your saved resumes right now. Please try again in a moment.");
        setResumes([]);
      } finally {
        setLoading(false);
      }
    };

    loadResumes();
  }, []);

  const resumeCount = resumes.length;
  const limitReached = resumeCount >= MAX_SAVED_RESUMES;

  const handleCreateNew = () => {
    if (limitReached) {
      setError("You can save up to 5 resumes. Please delete one before creating another.");
      return;
    }

    localStorage.removeItem("resumeId");
    navigate("/templates");
  };

  const handleEdit = (resume) => {
    localStorage.setItem("resumeId", resume.id);
    navigate("/builder", { state: { resumeId: resume.id } });
  };

  const handleOpen = handleEdit;

  const handleDelete = async (resumeId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${API_BASE_URL}/resumes/${resumeId}/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      setResumes((current) => current.filter((resume) => String(resume.id) !== String(resumeId)));
      if (String(localStorage.getItem("resumeId")) === String(resumeId)) {
        localStorage.removeItem("resumeId");
      }
      setError(EMPTY_ERROR);
    } catch (err) {
      setError("We couldn't delete that resume right now. Please try again.");
    }
  };

  const emptyState = (
    <div className="no-resumes">
      <h2>{error ? "Nothing to show yet" : "No resumes yet"}</h2>
      <p>
        {error ||
          "You can store up to 5 resumes. Start building your first one and it will appear here."}
      </p>
      <button className="my-resumes-create" type="button" onClick={handleCreateNew}>
        Start Building
      </button>
    </div>
  );

  return (
    <main className="my-resumes">
      <div className="my-resumes-shell">
        <section className="my-resumes-hero">
          <div>
            <span className="my-resumes-badge">Saved workspace</span>
            <h1>My Resumes</h1>
            <p>
              Manage, reopen, and keep track of your saved resume drafts. The newest 5 resumes stay
              in your library at a time.
            </p>
          </div>

          <div className="my-resumes-cta">
            <div className="my-resumes-count">
              <strong>{resumeCount}</strong>
              <span>of {MAX_SAVED_RESUMES} saved</span>
            </div>
            <button
              className="my-resumes-create"
              type="button"
              onClick={handleCreateNew}
              disabled={limitReached}
            >
              Create New Resume
            </button>
          </div>
        </section>

        {error && resumeCount > 0 ? <div className="my-resumes-alert">{error}</div> : null}

        {loading ? (
          <div className="my-resumes-loading">Loading your resumes...</div>
        ) : resumes.length === 0 ? (
          emptyState
        ) : (
          <>
            {limitReached && (
              <div className="my-resumes-limit">
                You’ve reached the 5-resume limit. Delete one before creating another.
              </div>
            )}
            <div className="resumes-grid">
              {resumes.map((resume) => (
                <ResumePreviewCard
                  key={resume.id}
                  resume={resume}
                  onOpen={() => handleOpen(resume)}
                  onEdit={() => handleEdit(resume)}
                  onDelete={() => handleDelete(resume.id)}
                />
              ))}
            </div>
          </>
        )}

        <div className="my-resumes-footer">
          <Link to="/home" className="my-resumes-link">
            Back to Resume Builder
          </Link>
        </div>
      </div>
    </main>
  );
};

export default MyResumes;
