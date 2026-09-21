import React, { useRef, useState } from "react";
import { FileText, LockKeyhole, Search, ShieldCheck, Upload, X } from "lucide-react";
import "./Document.css";

export default function ComplianceDocuments() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  function chooseFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event) {
    const [file] = event.target.files;
    if (file) setSelectedFile(file);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    const [file] = event.dataTransfer.files;
    if (file) setSelectedFile(file);
  }

  return (
    <section className="cd-page">
      <header className="cd-header">
        <div className="cd-header-icon" aria-hidden="true"><FileText /></div>
        <div className="cd-header-copy">
          <h1>Compliance Documents</h1>
          <p>Search and upload your compliance documents securely.</p>
        </div>
        <div className="cd-secure-badge"><LockKeyhole aria-hidden="true" /> Secure workspace</div>
      </header>

      <form className="cd-search-panel" onSubmit={(event) => event.preventDefault()}>
        <div className="cd-search-field">
          <Search aria-hidden="true" />
          <input aria-label="Search documents" type="search" placeholder="Search documents..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        </div>
        <button type="submit" className="cd-search-button"><Search aria-hidden="true" />Search</button>
      </form>

      <div className="cd-upload-card">
        <div className="cd-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          <div className="cd-upload-icon" aria-hidden="true"><Upload /></div>
          <span className="cd-upload-kicker">Secure document upload</span>
          <h2>Upload Document</h2>
          <p>Drag and drop your file here or click to browse</p>
          <input ref={fileInputRef} className="cd-file-input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
          <button type="button" className="cd-choose-button" onClick={chooseFile}><Upload aria-hidden="true" />Choose File</button>
          {selectedFile && (
            <div className="cd-selected-file" aria-live="polite">
              <span>{selectedFile.name}</span>
              <button type="button" onClick={() => setSelectedFile(null)} aria-label="Remove selected file"><X /></button>
            </div>
          )}
          <small>Supports PDF, JPG, PNG (Max 10MB)</small>
        </div>
      </div>

      <footer className="cd-security-note">
        <span />
        <div><ShieldCheck aria-hidden="true" /><p>Your documents are securely stored and accessible only to authorized personnel.</p></div>
        <span />
      </footer>
    </section>
  );
}
