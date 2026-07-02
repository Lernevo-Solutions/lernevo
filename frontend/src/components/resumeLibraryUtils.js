export const MAX_SAVED_RESUMES = 5;

export const DEFAULT_TEMPLATE_DESCRIPTOR = {
  id: 6,
  name: "Bold Two-Column",
  structure: "bold-two-col",
};

const TEMPLATE_BY_STRUCTURE = {
  "classic-minimal": { id: 1, name: "Classic Minimal", structure: "classic-minimal" },
  "serif-pro": { id: 2, name: "Serif Pro", structure: "serif-pro" },
  "clean-centered": { id: 3, name: "Clean Centered", structure: "clean-centered" },
  "data-pro-ats": { id: 5, name: "Data Pro ATS", structure: "data-pro-ats" },
  "bold-two-col": { id: 6, name: "Bold Two-Column", structure: "bold-two-col" },
  "minimalist-top": { id: 7, name: "Minimalist Top", structure: "minimalist-top" },
  "photo-ats": { id: 10, name: "Photo ATS", structure: "photo-ats" },
  "teal-split": { id: 11, name: "Teal Split", structure: "teal-split" },
  "two-column": { id: 12, name: "Two Column Modern", structure: "two-column" },
  "ashley-sidebar": { id: 13, name: "Ashley Sidebar", structure: "ashley-sidebar" },
  "graphic-split": { id: 14, name: "Graphic Split", structure: "graphic-split" },
  "navy-pro": { id: 17, name: "Navy Pro", structure: "navy-pro" },
  "civil-pro": { id: 18, name: "Civil Pro", structure: "civil-pro" },
  "blank-start": { id: 0, name: "Blank Resume", structure: "blank-start" },
};

const TEMPLATE_BY_LAYOUT = {
  "one-col": TEMPLATE_BY_STRUCTURE["clean-centered"],
  "two-col": TEMPLATE_BY_STRUCTURE["bold-two-col"],
  "sidebar-left": TEMPLATE_BY_STRUCTURE["graphic-split"],
};

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const cleanValue = (value) => (value === null || value === undefined ? "" : value);

export const formatResumeUpdatedAt = (value) => {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const getResumePageCount = (canvasStates = {}) => {
  if (!canvasStates || typeof canvasStates !== "object") return 1;

  if (Array.isArray(canvasStates.pages)) {
    return Math.max(1, canvasStates.pages.length);
  }

  if (typeof canvasStates.pageCount === "number" && Number.isFinite(canvasStates.pageCount)) {
    return Math.max(1, canvasStates.pageCount);
  }

  if (typeof canvasStates.extraPages === "number" && Number.isFinite(canvasStates.extraPages)) {
    return Math.max(1, canvasStates.extraPages + 1);
  }

  if (typeof canvasStates.pages === "number" && Number.isFinite(canvasStates.pages)) {
    return Math.max(1, canvasStates.pages + 1);
  }

  return 1;
};

export const resolveTemplateDescriptor = (resume = {}, fallback = DEFAULT_TEMPLATE_DESCRIPTOR) => {
  const directTemplate = resume?.template;
  if (isObject(directTemplate) && directTemplate.structure) {
    return {
      id: directTemplate.id ?? fallback.id,
      name: directTemplate.name || fallback.name,
      structure: directTemplate.structure,
    };
  }

  if (typeof directTemplate === "string" && TEMPLATE_BY_STRUCTURE[directTemplate]) {
    return TEMPLATE_BY_STRUCTURE[directTemplate];
  }

  const canvasTemplate = resume?.canvas_states?.template;
  if (isObject(canvasTemplate) && canvasTemplate.structure) {
    return {
      id: canvasTemplate.id ?? fallback.id,
      name: canvasTemplate.name || fallback.name,
      structure: canvasTemplate.structure,
    };
  }

  const canvasStructure =
    resume?.canvas_states?.template_structure ||
    resume?.canvas_states?.templateStructure ||
    resume?.template_structure ||
    resume?.templateStructure;

  if (canvasStructure && TEMPLATE_BY_STRUCTURE[canvasStructure]) {
    return TEMPLATE_BY_STRUCTURE[canvasStructure];
  }

  const canvasName =
    resume?.canvas_states?.template_name ||
    resume?.canvas_states?.templateName ||
    resume?.template_name ||
    resume?.templateName;

  if (canvasName) {
    const match = Object.values(TEMPLATE_BY_STRUCTURE).find(
      (template) => template.name.toLowerCase() === String(canvasName).toLowerCase()
    );
    if (match) return match;
  }

  if (resume?.layout && TEMPLATE_BY_LAYOUT[resume.layout]) {
    return TEMPLATE_BY_LAYOUT[resume.layout];
  }

  return fallback;
};

export const buildResumePreviewData = (resume = {}) => {
  const personalInfo = resume.personal_info || {};
  const summary = resume.summary || {};

  return {
    personal: {
      name: cleanValue(personalInfo.full_name),
      title: cleanValue(personalInfo.job_title),
      email: cleanValue(personalInfo.email),
      phone: cleanValue(personalInfo.phone),
      location: cleanValue(personalInfo.location),
      linkedin: cleanValue(personalInfo.linkedin),
      github: cleanValue(personalInfo.github),
      photo: cleanValue(personalInfo.photo),
    },
    summary: {
      text: cleanValue(summary.text),
    },
    experience: ensureArray(resume.experiences).map((item) => ({
      id: item.id ?? makeId(),
      company: cleanValue(item.company),
      role: cleanValue(item.role),
      duration: cleanValue(item.duration),
      location: cleanValue(item.location),
      description: cleanValue(item.description),
    })),
    education: {
      ug: ensureArray(resume.ug_education).map((item) => ({
        id: item.id ?? makeId(),
        college: cleanValue(item.college),
        degree: cleanValue(item.degree),
        branch: cleanValue(item.branch),
        graduatedYear: cleanValue(item.graduatedYear ?? item.graduated_year),
        gpa: cleanValue(item.gpa),
        highlights: cleanValue(item.highlights),
      })),
      school: ensureArray(resume.school_education).map((item) => ({
        id: item.id ?? makeId(),
        schoolName: cleanValue(item.schoolName ?? item.school_name),
        board: cleanValue(item.board),
        stream: cleanValue(item.stream),
        passingYear: cleanValue(item.passingYear ?? item.passing_year),
        percentage: cleanValue(item.percentage),
        highlights: cleanValue(item.highlights),
      })),
    },
    skills: ensureArray(resume.skills).map((item) => ({
      id: item.id ?? makeId(),
      name: cleanValue(item.name),
      level: Number.isFinite(Number(item.level)) ? Number(item.level) : 3,
      badge: cleanValue(item.badge) || "Intermediate",
    })),
    projects: ensureArray(resume.projects).map((item) => ({
      id: item.id ?? makeId(),
      name: cleanValue(item.name),
      stack: cleanValue(item.stack || item.tech),
      tech: cleanValue(item.tech || item.stack),
      description: cleanValue(item.description),
      link: cleanValue(item.link),
      date: cleanValue(item.date),
    })),
    certifications: ensureArray(resume.certifications).map((item) => ({
      id: item.id ?? makeId(),
      name: cleanValue(item.name),
      issuer: cleanValue(item.issuer),
      date: cleanValue(item.date),
      credentialId: cleanValue(item.credential_id || item.credentialId),
      description: cleanValue(item.description),
    })),
    languages: ensureArray(resume.languages).map((item) => ({
      id: item.id ?? makeId(),
      language: cleanValue(item.language),
      proficiency: cleanValue(item.proficiency) || "Intermediate",
      stars: Number.isFinite(Number(item.stars)) ? Number(item.stars) : 3,
    })),
  };
};

export const buildResumeEditorState = (resume = {}, template = DEFAULT_TEMPLATE_DESCRIPTOR) => {
  const previewData = buildResumePreviewData(resume);

  return {
    activeSection: "personal",
    personal: previewData.personal,
    summary: previewData.summary,
    experience: previewData.experience.length ? previewData.experience : [{ id: makeId(), company: "", role: "", duration: "", location: "", description: "" }],
    education: {
      ug: previewData.education.ug.length
        ? previewData.education.ug
        : [{
            id: makeId(),
            type: "ug",
            college: "",
            degree: "",
            branch: "",
            graduatedYear: "",
            gpa: "",
            highlights: "",
          }],
      school: previewData.education.school.length
        ? previewData.education.school
        : [{
            id: makeId(),
            type: "school",
            schoolName: "",
            board: "",
            stream: "",
            passingYear: "",
            percentage: "",
            highlights: "",
          }],
    },
    skills: previewData.skills.length ? previewData.skills : [{ id: makeId(), name: "", level: 3, badge: "Intermediate" }],
    projects: previewData.projects.length ? previewData.projects : [{ id: makeId(), name: "", tech: "", stack: "", description: "", link: "", date: "" }],
    certifications: previewData.certifications.length ? previewData.certifications : [{ id: makeId(), name: "", issuer: "", date: "", credentialId: "", description: "" }],
    languages: previewData.languages.length ? previewData.languages : [{ id: makeId(), language: "", proficiency: "Intermediate", stars: 3 }],
    styling: {
      font: cleanValue(resume.font) || "Inter",
      accentColor: cleanValue(resume.theme_color) || "#2563eb",
      layout: cleanValue(resume.layout) || template?.layout || "one-col",
      photoPosition: cleanValue(resume.photo_position) || "left",
      photoSize: cleanValue(resume.photo_size) || "medium",
      skillsDisplayMode: "level",
      skillsRatingStyle: "stars",
      languagesDisplayMode: "level",
      languagesRatingStyle: "stars",
    },
  };
};

export const buildResumeTemplatePayload = (resumeMeta = {}) => {
  if (!resumeMeta || typeof resumeMeta !== "object") return null;

  const template = resumeMeta.template;
  if (template && template.structure) {
    return {
      id: template.id ?? null,
      name: template.name || resumeMeta.templateName || DEFAULT_TEMPLATE_DESCRIPTOR.name,
      structure: template.structure,
    };
  }

  if (resumeMeta.templateStructure || resumeMeta.structure) {
    const structure = resumeMeta.templateStructure || resumeMeta.structure;
    return TEMPLATE_BY_STRUCTURE[structure] || {
      id: resumeMeta.templateId ?? null,
      name: resumeMeta.templateName || DEFAULT_TEMPLATE_DESCRIPTOR.name,
      structure,
    };
  }

  if (resumeMeta.templateName) {
    const match = Object.values(TEMPLATE_BY_STRUCTURE).find(
      (item) => item.name.toLowerCase() === String(resumeMeta.templateName).toLowerCase()
    );
    if (match) return match;
  }

  return null;
};
