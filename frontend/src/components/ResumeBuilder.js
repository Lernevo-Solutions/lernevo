import React, { useState, useEffect } from "react";
import "./ResumeBuilder.css";

import PersonalForm from "./forms/PersonalForm";
import ExperienceForm from "./forms/ExperienceForm";
import EducationForm from "./forms/EducationForm";
import SkillsForm from "./forms/SkillsForm";

import ModernTemplate from "./templates/ModernTemplate";
import ProfessionalTemplate from "./templates/ProfessionalTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";

const ResumeBuilder = () => {

  const [resumeData, setResumeData] = useState({
    personal: {
      name: "John Doe",
      title: "Software Engineer",
      email: "john.doe@example.com",
      phone: "+1 234 567 890",
      summary:
        "Experienced software engineer with a passion for building scalable web applications.",
    },

    experience: [
      {
        company: "Tech Corp",
        position: "Senior Developer",
        startDate: "2022",
        endDate: "Present",
        description: "Leading frontend development team...",
      },
    ],

    education: [
      {
        school: "University of Technology",
        degree: "B.Sc.",
        field: "Computer Science",
        startDate: "2016",
        endDate: "2020",
      },
    ],

    skills: ["React", "JavaScript", "Node.js", "CSS"],

    template: "modern",
  });

  /* ----------------------- Update Functions ----------------------- */

  const updatePersonal = (data) => {
    setResumeData((prev) => ({ ...prev, personal: data }));
  };

  const updateExperience = (data) => {
    setResumeData((prev) => ({ ...prev, experience: data }));
  };

  const updateEducation = (data) => {
    setResumeData((prev) => ({ ...prev, education: data }));
  };

  const updateSkills = (data) => {
    setResumeData((prev) => ({ ...prev, skills: data }));
  };

  const setTemplate = (templateId) => {
    setResumeData((prev) => ({ ...prev, template: templateId }));
  };

  /* ----------------------- Save Resume ----------------------- */

  const saveResume = () => {

    const savedList = JSON.parse(localStorage.getItem("resumes") || "[]");

    const newResume = {
      id: Date.now(),
      data: resumeData,
      lastUpdated: new Date().toISOString(),
    };

    savedList.push(newResume);

    localStorage.setItem("resumes", JSON.stringify(savedList));
    localStorage.setItem("currentResume", JSON.stringify(resumeData));

    alert("Resume saved successfully!");
  };

  /* ----------------------- Load Resume ----------------------- */

  useEffect(() => {
    const saved = localStorage.getItem("currentResume");
    if (saved) {
      setResumeData(JSON.parse(saved));
    }
  }, []);

  /* ----------------------- Render Template ----------------------- */

  const renderTemplate = () => {
    switch (resumeData.template) {
      case "professional":
        return <ProfessionalTemplate data={resumeData} />;

      case "minimal":
        return <MinimalTemplate data={resumeData} />;

      default:
        return <ModernTemplate data={resumeData} />;
    }
  };

  /* ----------------------- UI ----------------------- */

  return (
    <div className="resume-builder-layout">

      {/* LEFT SIDE FORM */}
      <div className="resume-form-panel">

        <h1 className="resume-builder-title">Edit Your Resume</h1>

        {/* Template Selector */}
        <div className="template-selector">

          <button
            className={`template-btn ${
              resumeData.template === "modern" ? "active" : ""
            }`}
            onClick={() => setTemplate("modern")}
          >
            Modern
          </button>

          <button
            className={`template-btn ${
              resumeData.template === "professional" ? "active" : ""
            }`}
            onClick={() => setTemplate("professional")}
          >
            Professional
          </button>

          <button
            className={`template-btn ${
              resumeData.template === "minimal" ? "active" : ""
            }`}
            onClick={() => setTemplate("minimal")}
          >
            Minimal
          </button>

        </div>

        {/* Forms */}

        <PersonalForm
          data={resumeData.personal}
          onChange={updatePersonal}
        />

        <ExperienceForm
          data={resumeData.experience}
          onChange={updateExperience}
        />

        <EducationForm
          data={resumeData.education}
          onChange={updateEducation}
        />

        <SkillsForm
          data={resumeData.skills}
          onChange={updateSkills}
        />

        {/* Save Button */}

        <button
          className="save-resume-btn"
          onClick={saveResume}
        >
          💾 Save Resume
        </button>

      </div>


      {/* RIGHT SIDE PREVIEW */}

      <div className="resume-preview-panel">

        <h2 className="preview-title">Live Preview</h2>

        <div className="resume-preview-wrapper">

          <div className="resume-preview-card">
            {renderTemplate()}
          </div>

        </div>

      </div>

    </div>
  );
};

export default ResumeBuilder;