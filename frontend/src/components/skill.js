// skill.js - Fixed Token Handling
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './skill.css';
import f1 from "./f1.png";
import f2 from "./f2.png";
import f3 from "./f3.png";
import f4 from "./f4.png";
import f5 from "./f5.png";
import f6 from "./f6.png";
import f7 from "./f7.png";
import f8 from "./f8.png";

const SkillGapAnalyzer = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef(null);

  const getAuthToken = () => {
    const token = localStorage.getItem('auth_token') || 
                  sessionStorage.getItem('auth_token') ||
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('token');
    return token;
  };

  const downloadReportAsPDF = async () => {
    if (!analysisResult) {
      alert('Please analyze your resume first before downloading the report.');
      return;
    }
    setIsDownloading(true);
    try {
      const element = document.querySelector('.sgap-ats-dashboard-container');
      if (!element) {
        alert('Report container not found. Please run analysis first.');
        return;
      }
      const originalOverflow = element.style.overflow;
      const originalHeight = element.style.height;
      element.style.overflow = 'visible';
      element.style.height = 'auto';
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let position = 0;
      let heightLeft = imgHeight;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      pdf.save(`ATS_Report_${new Date().toLocaleDateString()}.pdf`);
      element.style.overflow = originalOverflow;
      element.style.height = originalHeight;
      alert('✅ Report downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    if (file.type === 'application/pdf') {
      setResumeFile(file);
      setFileName(file.name);
      setUploadStatus({
        type: 'success',
        message: `📄 ${file.name} attached successfully.`,
      });
    } else if (file.type === 'text/plain') {
      setResumeFile(file);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target.result || '');
        setUploadStatus({
          type: 'success',
          message: 'TXT file loaded successfully.',
        });
      };
      reader.readAsText(file);
    } else {
      alert('Please upload PDF or TXT files only');
    }
  };

  const analyzeGap = async () => {
    if (!resumeFile && !resumeText.trim()) {
      alert('Please upload a resume file or enter resume text.');
      return;
    }
    if (!jobDescription.trim()) {
      alert('Please provide a job description.');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      
      if (resumeFile) {
        formData.append('resume', resumeFile);
      } else {
        const textBlob = new Blob([resumeText], { type: 'text/plain' });
        formData.append('resume', textBlob, 'pasted_resume.txt');
      }

      formData.append('job_description', jobDescription);
      formData.append('job_title', '');
      formData.append('company_name', '');

      const response = await fetch('https://lernevo-backend-237359549871.us-central1.run.app/api/analyze-skill-gap/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        setUploadStatus({
          type: 'error',
          message: 'Authentication error. Please try again.',
        });
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      console.log("API Response:", result);
      
      if (result.success) {
        const analysisData = result.data;
        
        // ✅ CRITICAL: Get the extracted text from backend response
        // This is the text that will be used for AI detection
        const extractedResumeText = analysisData.extracted_resume_text || resumeText;
        
        console.log("========================================");
        console.log("EXTRACTED RESUME TEXT LENGTH:", extractedResumeText.length);
        console.log("EXTRACTED TEXT PREVIEW:", extractedResumeText.substring(0, 200));
        console.log("========================================");
        
        // ✅ Save detection data
        if (analysisData.resume_detection) {
          localStorage.setItem("resumeDetection", JSON.stringify(analysisData.resume_detection));
          console.log("Detection saved");
        }
        
        // ✅ CRITICAL: Save the extracted text to localStorage
        localStorage.setItem("resumeText", extractedResumeText);
        localStorage.setItem("jobDescription", jobDescription);
        localStorage.setItem("latest_analysis_id", analysisData.id);
        localStorage.setItem("latest_analysis", JSON.stringify(analysisData));
        
        // ✅ Verify localStorage was set
        console.log("Verification - resumeText in localStorage:", localStorage.getItem("resumeText")?.length, "characters");

        navigate('/skilldashboard', {
          state: { 
            analysis: analysisData,
            detection: analysisData.resume_detection,
            resumeText: extractedResumeText  // ✅ Pass the text
          }
        });
      } else {
        setUploadStatus({
          type: 'error',
          message: result.message || result.error || 'Analysis processing failed.',
        });
      }
    } catch (error) {
      console.error('API Interaction Failed:', error);
      setUploadStatus({
        type: 'error',
        message: 'Cannot reach backend server.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sgap-app">
      <div className="sgap-bg-decoration">
        <div className="sgap-circle sgap-circle-1"></div>
        <div className="sgap-circle sgap-circle-2"></div>
        <div className="sgap-circle sgap-circle-3"></div>
        <div className="sgap-dots-pattern"></div>
      </div>

      <div className="wellness-layout-wrapper">
        <div className="side-ad left-ad">
          <div className="ad-track move-down">
            {[f1, f2, f3, f4, f5, f1, f2, f3, f4, f5].map((img, index) => (
              <img key={index} src={img} alt="Ad" />
            ))}
          </div>
        </div>

        <div className="side-ad right-ad">
          <div className="ad-track move-up">
            {[f6, f7, f8, f1, f6, f7, f8, f1].map((img, index) => (
              <img key={index} src={img} alt="Ad" />
            ))}
          </div>
        </div>

        <div className="sgap-container">
          {analysisResult && (
            <div className="sgap-download-report-btn-container">
              <button
                className="sgap-download-report-btn"
                onClick={downloadReportAsPDF}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <div className="sgap-spinner-small"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>📥 Download Report as PDF</>
                )}
              </button>
            </div>
          )}

          <div className="sgap-hero">
            <div className="sgap-hero-badge-top">
              <span className="sgap-badge-spark">✨</span>
              <span>AI-Powered Career Intelligence</span>
            </div>

            <div className="sgap-hero-title-section">
              <h1 className="sgap-hero-main-title">
                <span className="sgap-title-line-1">Bridge Your</span>
                <span className="sgap-title-line-2 gradient-text"> Skill Gap</span>
              </h1>
              <div className="sgap-hero-breadcrumb">
                <span className="sgap-breadcrumb-dot"></span>
                <span>Resume → Analyze → Grow</span>
                <span className="sgap-breadcrumb-dot"></span>
              </div>
            </div>

            <p className="sgap-hero-description-simple">
              Upload your resume (PDF or TXT) and job description — get instant skill gap analysis,
              personalized learning recommendations, and ATS optimization tips to land your dream role.
            </p>
          </div>

          <div className="sgap-cards-grid">
            <div className="sgap-card">
              <div className="sgap-card-header">
                <div className="sgap-card-icon">📄</div>
                <div>
                  <h3>Your Resume</h3>
                  <p>Upload PDF or TXT to extract your resume</p>
                </div>
              </div>
              <div className="card-body">
                <div
                  className={`sgap-drop-zone ${isDragging ? 'sgap-dragging' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { 
                    e.preventDefault(); 
                    setIsDragging(false); 
                    handleFileUpload(e.dataTransfer.files[0]); 
                  }}
                >
                  <div className="sgap-drop-icon">📁</div>
                  <p>Drag & drop or <span>browse</span></p>
                  <small>PDF or TXT files only</small>
                  {fileName && <div className="sgap-file-name">{fileName}</div>}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />
                </div>
                <textarea
                  className="sgap-textarea"
                  placeholder="Or paste the raw text of your resume directly here..."
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    if(resumeFile && !fileName.endsWith('.txt')) {
                      setResumeFile(null);
                      setFileName('');
                    }
                  }}
                  rows={10}
                />
                <div className="sgap-textarea-footer">
                  <span>{resumeText.length} characters</span>
                  <span className="sgap-badge">{fileName ? 'File Selected' : 'Ready'}</span>
                </div>
                {uploadStatus && (
                  <div
                    className="sgap-upload-status"
                    style={{
                      marginTop: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      background: uploadStatus.type === 'success' ? '#ecfdf5' : '#fef2f2',
                      color: uploadStatus.type === 'success' ? '#047857' : '#b91c1c',
                      border: uploadStatus.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fca5a5',
                    }}
                  >
                    {uploadStatus.message}
                  </div>
                )}
              </div>
            </div>

            <div className="sgap-card">
              <div className="sgap-card-header">
                <div className="sgap-card-icon">💼</div>
                <div>
                  <h3>Job Description</h3>
                  <p>Paste job description here</p>
                </div>
              </div>
              <div className="card-body">
                <textarea
                  className="sgap-textarea"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={12}
                />
                <div className="sgap-textarea-footer">
                  <span>{jobDescription.length} characters</span>
                  <span className="sgap-badge">Ready</span>
                </div>
              </div>
            </div>
          </div>

          <button
            className="sgap-analyze-btn"
            onClick={analyzeGap}
            disabled={isLoading || (!resumeText.trim() && !resumeFile) || !jobDescription.trim()}
          >
            {isLoading ? (
              <><div className="sgap-spinner"></div> Querying AI Engine...</>
            ) : (
              <>✨ Analyze & Get ATS Score →</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalyzer;