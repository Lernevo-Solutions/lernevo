import { useEffect, useMemo, useState } from "react";
import TemplatesCourseEditor from "./TemplatesCourseEditor";
import {
  ArrowRight, Check, Eye, FileText, Image,
  Layers3, LayoutTemplate, Play, Search, Sparkles, X,
} from "lucide-react";
import "./TemplatesPage.css";

const categories = ["Introduction", "Content", "Questions", "Result", "Conclusion"];
const fallbackCourses = [
  { id: 1, status: "Published", title: "Data Protection Essentials", slides: 16 },
  { id: 2, status: "Draft", title: "Product Knowledge: The Lernevo Pulse Suite", slides: 14 },
  { id: 3, status: "Draft", title: "New Joiner Onboarding", slides: 7 },
  { id: 4, status: "In Review", title: "Phishing Awareness: Spot the Fake", slides: 11 },
];
const COURSE_STORAGE_KEY = "content-studio-courses";
const NOOP = () => {};

function loadTemplateCourses() {
  try {
    const stored = JSON.parse(localStorage.getItem(COURSE_STORAGE_KEY));
    return Array.isArray(stored) && stored.length ? stored : fallbackCourses;
  } catch {
    return fallbackCourses;
  }
}

const definitions = [
  ["Welcome Slide", "A warm opener that sets the tone for a new learning journey.", "welcome", "Welcome to the Course", "Start your learning journey with a clear, friendly introduction.", "Introduction"],
  ["Course Overview", "Give learners a clear map of what they will explore.", "overview", "Your Learning Path", "A quick look at the topics, timing and activities in this course.", "Introduction"],
  ["Learning Objectives", "Make the outcomes easy to understand and remember.", "objectives", "What you’ll learn", "By the end of this course, you will be ready to put these ideas into practice.", "Introduction"],
  ["Trainer Introduction", "Introduce the facilitator and establish a human connection.", "profile", "Meet your facilitator", "A short introduction to the people and experience guiding this course.", "Introduction"],
  ["Course Information", "Share duration, audience and completion details up front.", "info", "Course details", "Everything you need to know before you begin.", "Introduction"],
  ["Text Only", "A focused, readable layout for a single key idea.", "text", "A simple idea, clearly explained", "Use this space to introduce a concept in plain language. Keep paragraphs short and give learners room to reflect.", "Content"],
  ["Text with Image", "Pair a concise explanation with a supporting visual.", "image", "Bring the concept to life", "Connect a short explanation to a relevant image, diagram or example.", "Content"],
  ["Video Learning", "Set context for a video lesson with a clear play area.", "video", "Watch and learn", "Explore the idea in this short video, then reflect on one thing you can apply.", "Content"],
  ["Key Points", "Turn essential takeaways into a scannable list.", "points", "Remember these points", "A compact summary helps learners focus on what matters most.", "Content"],
  ["Two Column Layout", "Compare two related ideas side by side.", "columns", "Two ways to look at it", "Use parallel columns to compare approaches, examples or before and after.", "Content"],
  ["PDF Resource", "Present a downloadable guide alongside useful context.", "pdf", "Download the resource", "Keep a practical reference close at hand as you work through the course.", "Content"],
  ["Single Choice Question", "Check understanding with one correct answer.", "single", "Which action best protects account access?", "Choose one answer.", "Questions"],
  ["Multiple Answer Question", "Let learners select every answer that applies.", "multiple", "Which details should be verified?", "Select all that apply.", "Questions"],
  ["True or False", "A quick confidence check on a core statement.", "truefalse", "A strong password should be reused across work accounts.", "Is this statement true or false?", "Questions"],
  ["Matching Question", "Connect related terms and descriptions.", "matching", "Match each term to its meaning", "Drag each concept to the description that fits.", "Questions"],
  ["Short Answer Question", "Invite learners to explain an idea in their own words.", "short", "What would you do first?", "Write a short response using what you have learned.", "Questions"],
  ["Congratulations – Passed", "Celebrate completion and reinforce the achievement.", "passed", "Congratulations!", "You passed the assessment and completed this learning milestone.", "Result"],
  ["Assessment Failed", "Encourage another attempt with constructive guidance.", "failed", "Keep learning", "Review the key ideas and try the assessment again when you are ready.", "Result"],
  ["Quiz Score Summary", "Show a clear score and a next step after assessment.", "score", "Your results", "A quick recap of your score, progress and recommended next step.", "Result"],
  ["Thank You Slide", "Close the course with a polished thank you.", "thanks", "Thank you for learning with us", "Your time and attention make a difference. Take these ideas into your next day.", "Conclusion"],
  ["Course Summary", "Revisit the ideas learners should carry forward.", "summary", "Your key takeaways", "Bring the most useful ideas together and turn them into a practical next step.", "Conclusion"],
];

export const COURSE_TEMPLATES = definitions.map(([name, description, layoutType, heading, content, category], index) => {
  const editableFields = { heading, description: content };
  if (["welcome", "overview", "objectives", "points", "summary", "thanks"].includes(layoutType)) editableFields.bullets = ["A clear first step", "One useful example", "A practical next action"];
  if (["single", "multiple", "truefalse", "matching"].includes(layoutType)) {
    editableFields.options = layoutType === "truefalse" ? ["True", "False"] : ["Review the request", "Verify the source", "Share it right away"];
    if (layoutType === "multiple") editableFields.correctAnswers = [0, 1];
    else editableFields.correctAnswer = layoutType === "truefalse" ? 0 : 1;
    editableFields.marks = 1;
  }
  if (layoutType === "image") editableFields.imageUrl = "";
  if (layoutType === "video") editableFields.videoUrl = "";
  if (["passed", "failed", "score"].includes(layoutType)) editableFields.score = "92%";
  if (layoutType === "columns") Object.assign(editableFields, { leftHeading: "Option one", leftBody: "Describe the first idea or approach.", rightHeading: "Option two", rightBody: "Describe the second idea or approach." });
  if (layoutType === "info") Object.assign(editableFields, { duration: "20 minutes", audience: "All learners" });
  if (layoutType === "pdf") editableFields.resourceName = "Course reference guide.pdf";
  return {
    id: `${category.toLowerCase()}-${index + 1}`,
    name, category, description, layoutType, heading, content, editableFields,
    defaultSettings: { background: "#ffffff", textColor: "#0f172a", fontSize: 28, fontFamily: "Inter", alignment: layoutType === "welcome" || layoutType === "thanks" ? "center" : "left", layout: layoutType === "image" ? "Split" : "Centered content" },
  };
});

function MiniPreview({ template, large = false }) {
  const type = template.layoutType;
  return (
    <div className={`tpl-mini ${large ? "tpl-mini-large" : ""} layout-${type}`}>
      <div className="mini-brand"><span>L</span><i /></div>
      <div className="mini-content">
        <div className="mini-copy">
          <b>{template.heading}</b>
          <i /><i /><i className="short" />
        </div>
        {(["image", "video", "profile", "pdf", "overview"].includes(type)) && <div className={`mini-media ${type}`}>
          {type === "video" ? <Play size={large ? 32 : 18} fill="currentColor" /> : type === "pdf" ? <FileText size={large ? 38 : 22} /> : type === "profile" ? <span>LM</span> : <><i /><i /><i /></>}
        </div>}
        {(["objectives", "points", "summary"].includes(type)) && <div className="mini-list"><i /><i /><i /></div>}
        {(["single", "multiple", "truefalse", "matching", "short"].includes(type)) && <div className="mini-options"><i /><i /><i /><i /></div>}
        {(["passed", "failed", "score"].includes(type)) && <div className="mini-score"><b>{type === "failed" ? "TRY" : "92%"}</b><i /></div>}
        {(["welcome", "thanks"].includes(type)) && <div className="mini-pill"><Sparkles size={10} /> {type === "welcome" ? "LET'S BEGIN" : "COURSE COMPLETE"}</div>}
        {type === "columns" && <div className="mini-columns"><i /><i /></div>}
        {type === "info" && <div className="mini-info"><i /><i /><i /></div>}
      </div>
      <div className="mini-footer"><i /><i /></div>
    </div>
  );
}

function HeroArt() {
  return (
    <div className="templates-art" aria-hidden="true">
      <div className="template-orbit orbit-a" /><div className="template-orbit orbit-b" />
      <div className="art-sheet sheet-back"><span /><i /><i /><i /></div>
      <div className="art-sheet sheet-main"><div className="sheet-top"><span>L</span><small>COURSE DESIGN</small><i /></div><div className="sheet-hero"><b>Build a course<br />learners love</b><span><Play size={13} fill="currentColor" /></span></div><div className="sheet-lines"><i /><i /><i /></div><div className="sheet-tiles"><span /><span /><span /></div></div>
      <div className="art-float art-check"><Check size={18} /><span><b>Objectives</b><i /><i /></span></div>
      <div className="art-float art-quiz"><span className="quiz-mark">?</span><span><b>Quick quiz</b><i /><i /></span></div>
      <div className="art-float art-icon"><LayoutTemplate size={21} /></div>
      <span className="art-star star-one">✦</span><span className="art-star star-two">✧</span>
    </div>
  );
}

export default function TemplatesPage({ onEditorOpenChange = NOOP }) {
  const [category, setCategory] = useState("Introduction");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null);
  const [slide, setSlide] = useState(0);
  const [useTemplate, setUseTemplate] = useState(null);
  const [courseId, setCourseId] = useState("");
  const [section, setSection] = useState("");
  const [courses, setCourses] = useState(loadTemplateCourses);
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    const syncCourses = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(COURSE_STORAGE_KEY));
        if (Array.isArray(saved) && saved.length) setCourses(saved);
      } catch { /* Keep the current demo courses when storage is unavailable. */ }
    };
    window.addEventListener("focus", syncCourses);
    return () => window.removeEventListener("focus", syncCourses);
  }, []);

  useEffect(() => {
    if (!active && !useTemplate) return undefined;
    const onKey = (event) => { if (event.key === "Escape") { setActive(null); setUseTemplate(null); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, useTemplate]);

  const shown = useMemo(() => COURSE_TEMPLATES.filter((template) => template.category === category &&
    `${template.name} ${template.description} ${template.category}`.toLowerCase().includes(query.trim().toLowerCase())), [category, query]);
  const openUseTemplate = (template) => {
    setActive(null);
    setUseTemplate(template);
    setCourseId(String(courses[0]?.id ?? ""));
    setSection(template.category);
  };
  const addTemplateToCourse = () => {
    if (!useTemplate || !courseId || !section) return;
    const course = courses.find((item) => String(item.id) === String(courseId));
    if (!course) return;
    const templateSlides = course.templateSlides || [];
    const uniqueSlides = templateSlides.filter((item, index) => templateSlides.findIndex((candidate) => (candidate.templateId || candidate.id) === (item.templateId || item.id)) === index);
    const existingSlide = uniqueSlides.find((item) => item.templateId === useTemplate.id);
    if (existingSlide) {
      if (uniqueSlides.length !== templateSlides.length) {
        const cleanedCourse = { ...course, templateSlides: uniqueSlides, slides: Math.max(0, (course.slides || 0) - (templateSlides.length - uniqueSlides.length)) };
        const cleanedCourses = courses.map((item) => String(item.id) === String(courseId) ? cleanedCourse : item);
        setCourses(cleanedCourses);
        try { localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(cleanedCourses)); } catch { /* Keep the de-duplicated course available for this session. */ }
      }
      setEditor({ courseId: String(courseId), slideId: existingSlide.id });
      setUseTemplate(null);
      return;
    }
    const insertedSlide = {
      id: `template-slide-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      templateId: useTemplate.id,
      name: useTemplate.name,
      description: useTemplate.description,
      layoutType: useTemplate.layoutType,
      section,
      content: JSON.parse(JSON.stringify(useTemplate.editableFields)),
      settings: { ...useTemplate.defaultSettings },
    };
    const updatedCourse = { ...course, templateSlides: [...(course.templateSlides || []), insertedSlide], selectedSlideId: insertedSlide.id, slides: (course.slides || 0) + 1, edited: "just now" };
    const updatedCourses = courses.map((item) => String(item.id) === String(courseId) ? updatedCourse : item);
    setCourses(updatedCourses);
    try { localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(updatedCourses)); } catch { /* Keep the inserted slide available for this session. */ }
    setEditor({ courseId: String(courseId), slideId: insertedSlide.id });
    setUseTemplate(null);
  };

  const editorCourse = editor && courses.find((item) => String(item.id) === editor.courseId);
  const editorSlide = editorCourse?.templateSlides?.find((item) => item.id === editor.slideId);
  useEffect(() => { onEditorOpenChange(Boolean(editorCourse && editorSlide)); }, [editorCourse, editorSlide, onEditorOpenChange]);
  if (editorCourse && editorSlide) return <TemplatesCourseEditor course={editorCourse} selectedSlide={editorSlide} onBack={() => setEditor(null)} />;

  return (
    <div className="templates-page">
      <main className="templates-main">
        <section className="templates-hero">
          <div className="templates-hero-copy">
            <span className="templates-eyebrow"><Sparkles size={13} /> TEMPLATE LIBRARY</span>
            <h1>Ready-to-Use<br /><em>Course Templates</em></h1>
            <p>Create engaging learning experiences with professionally designed templates for every stage of your course.</p>
            <div className="hero-support"><span><Check size={13} /></span> 21+ Ready-Made Layouts Across Five Course Sections</div>
          </div>
          <HeroArt />
        </section>

        <section className="template-library" aria-label="Template library">
          <div className="library-heading"><div><h2>Explore templates</h2><p>Start with a layout, then make it your own.</p></div><span className="total-count"><Layers3 size={15} /> {shown.length} templates</span></div>
          <div className="template-controls">
            <label className="template-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search templates..." aria-label="Search templates" />{query && <button aria-label="Clear search" onClick={() => setQuery("")}><X size={15} /></button>}</label>
            <div className="template-tabs" role="tablist" aria-label="Template categories">{categories.map((item) => <button type="button" role="tab" aria-selected={category === item} className={category === item ? "selected" : ""} key={item} onClick={() => setCategory(item)}>{item}<span>{COURSE_TEMPLATES.filter((template) => template.category === item).length}</span></button>)}</div>
          </div>
          {shown.length ? <div className="template-grid">{shown.map((template) => <article className={`template-card template-card-${template.layoutType}`} key={template.id}>
            <div className="template-thumb"><MiniPreview template={template} /><span className="thumb-category">{template.category}</span><button className="thumb-preview" aria-label={`Preview ${template.name}`} onClick={() => { setActive(template); setSlide(0); }}><Image size={15} /></button></div>
            <div className="template-card-copy"><span className="card-category">{template.category}</span><h3>{template.name}</h3><p>{template.description}</p></div>
            <div className="template-card-actions"><button className="preview-button" onClick={() => { setActive(template); setSlide(0); }}><Eye size={14} /> Preview</button><button className="use-button" onClick={() => openUseTemplate(template)}>Use Template <ArrowRight size={14} /></button></div>
          </article>)}</div> : <div className="template-empty"><span><Search size={22} /></span><h3>No templates found</h3><p>Try a different search or clear your query to see all {category.toLowerCase()} templates.</p><button onClick={() => setQuery("")}>Clear search</button></div>}
        </section>
      </main>

      {active && <div className="template-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}>
        <section className="template-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title">
          <header className="modal-header"><div><span className="modal-kicker">{active.category} TEMPLATE</span><h2 id="preview-title">{active.name}</h2></div><button className="modal-close" onClick={() => setActive(null)} aria-label="Close preview"><X size={20} /></button></header>
          <div className="modal-stage"><div className="slide-preview"><div className="slide-preview-head"><span><b>L</b> LERNEVO ACADEMY</span><small>{active.category} · {String(slide + 1).padStart(2, "0")}</small></div><div className={`slide-preview-body preview-${active.layoutType}`}><span className="preview-label">{active.category.toUpperCase()}</span><h3>{slide === 0 ? active.heading : `${active.heading} · Part ${slide + 1}`}</h3><p>{slide === 0 ? active.content : "Explore the next idea, reflect on what you have learned and choose one action to take forward."}</p><MiniPreview template={active} large /></div><div className="slide-preview-foot"><span>LEARNING EXPERIENCE</span><i /></div></div></div>
          <div className="modal-details"><div><span className="modal-kicker">ABOUT THIS LAYOUT</span><p>{active.description}</p></div><div className="preview-pager"><button aria-label="Previous preview slide" disabled={slide === 0} onClick={() => setSlide((value) => Math.max(0, value - 1))}>‹</button><span>{slide + 1} / 3</span><button aria-label="Next preview slide" disabled={slide === 2} onClick={() => setSlide((value) => Math.min(2, value + 1))}>›</button></div></div>
          <footer className="modal-footer"><button className="preview-button" onClick={() => setActive(null)}>Close</button><button className="use-button" onClick={() => openUseTemplate(active)}>Use Template <ArrowRight size={14} /></button></footer>
        </section>
      </div>}

      {useTemplate && <div className="template-use-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setUseTemplate(null); }}>
        <section className="template-use-dialog" role="dialog" aria-modal="true" aria-labelledby="template-use-title">
          <button className="template-use-close" onClick={() => setUseTemplate(null)} aria-label="Close template selection"><X size={19} /></button>
          <h2 id="template-use-title">Use “{useTemplate.name}”</h2>
          <p>Pick where this slide should go.</p>
          <label>Course<select value={courseId} onChange={(event) => setCourseId(event.target.value)} aria-label="Course">{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
          <label>Section<select value={section} onChange={(event) => setSection(event.target.value)} aria-label="Section">{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <footer><button className="preview-button" onClick={() => setUseTemplate(null)}>Cancel</button><button className="use-button" disabled={!courseId || !section} onClick={addTemplateToCourse}>Add Template <ArrowRight size={14} /></button></footer>
        </section>
      </div>}
    </div>
  );
}