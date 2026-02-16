import React, { useState, useEffect } from 'react';
import './MyResumes.css';

const MyResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('resumes');
    if (stored) {
      setResumes(JSON.parse(stored));
    }
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      const updated = resumes.filter(r => r.id !== id);
      localStorage.setItem('resumes', JSON.stringify(updated));
      setResumes(updated);
    }
  };

  const filtered = resumes.filter(resume =>
    resume.data.personal.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="my-resumes">
      <div className="container">
        <h1>My Resumes</h1>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        {filtered.length === 0 ? (
          <p className="no-resumes">No resumes found. Start building one!</p>
        ) : (
          <div className="resumes-grid">
            {filtered.map(resume => (
              <div key={resume.id} className="resume-card">
                <h2>{resume.data.personal.name || 'Untitled'}</h2>
                <p className="resume-title">{resume.data.personal.title}</p>
                <div className="meta">
                  <span className="template-badge">{resume.data.template}</span>
                  <span className="date">Updated: {new Date(resume.lastUpdated).toLocaleDateString()}</span>
                </div>
                <div className="actions">
                  <a href={`/builder?id=${resume.id}`} className="btn-edit">Edit</a>
                  <button onClick={() => handleDelete(resume.id)} className="btn-delete">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyResumes;