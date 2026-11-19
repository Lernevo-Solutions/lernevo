import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Edit, { SlideView, norm, BRAND0 } from "./Edit";
import Preview from "./Preview";
import {
  ArrowRight, Check, Eye, Image,
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

/* Light pastel slide backgrounds: [background, text colour]. Used when a template is added to a course. */
const LIGHT_THEMES = {
  welcome: ["linear-gradient(135deg,#e8f0ff,#f3eaff)", "#1e1b4b"],
  overview: ["linear-gradient(135deg,#e0fbff,#e3eefe)", "#0c4a6e"],
  objectives: ["linear-gradient(135deg,#f6f1ff,#ffe9f4)", "#3b0764"],
  profile: ["linear-gradient(135deg,#e8f0ff,#eceaff)", "#1e1b4b"],
  info: ["linear-gradient(135deg,#e0f9f8,#e3eefe)", "#0c4a6e"],
  text: ["linear-gradient(135deg,#eef0ff,#f4eeff)", "#1e1b4b"],
  image: ["linear-gradient(135deg,#fff5ed,#ffe9f1)", "#7c2d12"],
  video: ["linear-gradient(135deg,#eceeff,#f6ecff)", "#312e81"],
  points: ["linear-gradient(135deg,#e6f8f1,#e0f2fe)", "#064e3b"],
  columns: ["linear-gradient(135deg,#e8eeff,#f3e9ff)", "#1e1b4b"],
  pdf: ["linear-gradient(135deg,#fff1f2,#fff3e6)", "#881337"],
  single: ["linear-gradient(135deg,#f1efff,#e8f3ff)", "#312e81"],
  multiple: ["linear-gradient(135deg,#f6edff,#ffeaf6)", "#3b0764"],
  truefalse: ["linear-gradient(135deg,#e6f8f1,#e6f0ff)", "#064e3b"],
  matching: ["linear-gradient(135deg,#fff4e8,#ffeaf1)", "#7c2d12"],
  short: ["linear-gradient(135deg,#e8eeff,#e0fbff)", "#0c4a6e"],
  passed: ["linear-gradient(135deg,#e6f9ee,#eefbe3)", "#14532d"],
  failed: ["linear-gradient(135deg,#fff3ea,#ffeef2)", "#7c2d12"],
  score: ["linear-gradient(135deg,#e8eeff,#e0fbff)", "#1e3a8a"],
  thanks: ["linear-gradient(135deg,#f3eaff,#e3f1ff)", "#3b0764"],
  summary: ["linear-gradient(135deg,#e8f0ff,#f3eaff)", "#1e1b4b"],
};

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
    defaultSettings: { background: (LIGHT_THEMES[layoutType] || ["#ffffff"])[0], textColor: (LIGHT_THEMES[layoutType] || [0, "#0f172a"])[1], fontSize: 28, fontFamily: "Inter", alignment: layoutType === "welcome" || layoutType === "thanks" ? "center" : "left", layout: layoutType === "image" ? "Split" : "Centered content" },
  };
});

/* ------------------------------------------------------------------
   The real slide for every template.
   Preview, the card thumbnail and "Use Template" all use THIS object,
   so what you preview is exactly what opens in the editor (Edit.js).
   Fields follow Edit.js: layout, title, body, items, points, cols, q, options...
------------------------------------------------------------------- */
const TEMPLATE_SLIDES = {
  welcome: { layout: "welcome", title: "Welcome to the Course", body: "Start your learning journey with a clear, friendly introduction.", align: "center" },
  overview: { layout: "overview", title: "Your Learning Path", body: "A quick look at the topics, timing and activities in this course.", items: ["20 minutes in total", "Short, practical sections", "A quick quiz at the end"] },
  objectives: { layout: "objectives", title: "What you’ll learn", body: "By the end of this course, you will be ready to put these ideas into practice.", points: [["Understand", "the key ideas"], ["Apply", "them in your daily work"], ["Share", "what you learn with your team"]] },
  profile: { layout: "content", title: "Meet your facilitator", body: "A short introduction to the people and experience guiding this course.", items: ["Name and role", "Years of experience", "How to reach them"] },
  info: { layout: "overview", title: "Course details", body: "Everything you need to know before you begin.", items: ["Duration: 20 minutes", "Audience: All learners", "Certificate on completion"] },
  text: { layout: "text", title: "A simple idea, clearly explained", body: "Use this space to introduce a concept in plain language. Keep paragraphs short and give learners room to reflect." },
  image: { layout: "content", title: "Bring the concept to life", body: "Connect a short explanation to a relevant image, diagram or example.", items: ["Add a relevant image", "Explain what it shows", "Link it to the lesson"] },
  video: { layout: "video", title: "Watch and learn", body: "Explore the idea in this short video, then reflect on one thing you can apply." },
  points: { layout: "points", title: "Remember these points", body: "A compact summary helps learners focus on what matters most.", points: [["Focus", "on what matters most"], ["Keep it", "short and clear"], ["Take", "one action away"]] },
  columns: { layout: "twocol", title: "Two ways to look at it", body: "Use parallel columns to compare approaches, examples or before and after.", cols: [["Option one", "Describe the first idea or approach."], ["Option two", "Describe the second idea or approach."]] },
  pdf: { layout: "content", title: "Download the resource", body: "Keep a practical reference close at hand as you work through the course.", items: ["Course reference guide.pdf", "Keep it close while you work", "Share it with your team"] },
  single: { layout: "mcq", title: "Quick check", q: "Which action best protects account access?", options: ["Share your password with a colleague", "Turn on multi-factor sign-in", "Use the same password everywhere"], answer: 1, explain: "Multi-factor sign-in blocks most account takeovers." },
  multiple: { layout: "multi", title: "Quick check", q: "Which details should be verified? Select all that apply.", options: ["The sender’s address", "Where the link really goes", "The font of the email", "The request itself"], answers: [0, 1, 3], explain: "Check the sender, the link and the request before you act." },
  truefalse: { layout: "tf", title: "True or false", q: "A strong password should be reused across work accounts.", answer: 1, explain: "Reusing a password puts every account at risk." },
  matching: { layout: "mcq", title: "Match the term", q: "Which description best matches the term “phishing”?", options: ["A fake message that tricks you into sharing details", "A tool that blocks spam", "A way to back up your files"], answer: 0, explain: "Phishing messages pretend to be someone you trust." },
  short: { layout: "short", title: "Short answer", q: "What would you do first if you received a suspicious email?", accepted: "report, report it", explain: "Report it and do not click anything." },
  passed: { layout: "result", title: "Congratulations!", passMsg: "You passed the assessment and completed this learning milestone.", failMsg: "Review the key ideas and try the assessment again when you are ready." },
  failed: { layout: "result", title: "Keep learning", passMsg: "Well done! You passed the assessment.", failMsg: "Review the key ideas and try the assessment again when you are ready." },
  score: { layout: "result", title: "Your results", passMsg: "A quick recap of your score, progress and recommended next step.", failMsg: "Review the key ideas and try again when you are ready." },
  thanks: { layout: "thanks", title: "Thank you for learning with us", body: "Your time and attention make a difference. Take these ideas into your next day.", align: "center" },
  summary: { layout: "takeaways", title: "Your key takeaways", body: "Bring the most useful ideas together and turn them into a practical next step.", items: ["Know the key ideas", "Use one idea today", "Share it with your team"] },
};

/* Slides 2 and 3 of each preview: the same layout with different sample content */
const TEMPLATE_MORE = {
  welcome: [{ title: "Welcome aboard", body: "We are glad you are here. This short course takes about 20 minutes." }, { title: "Let’s get started", body: "Take your time, ask questions and enjoy the journey." }],
  overview: [{ title: "What’s inside", body: "Three short sections, each with a quick activity.", items: ["Section 1: The basics", "Section 2: Real examples", "Section 3: Your action plan"] }, { title: "How long it takes", body: "Plan your time before you begin.", items: ["Reading: 10 minutes", "Activities: 5 minutes", "Quiz: 5 minutes"] }],
  objectives: [{ title: "By the end you can", body: "Three skills you will take away.", points: [["Explain", "the idea in your own words"], ["Spot", "it in everyday situations"], ["Act", "with confidence"]] }, { title: "How you will be assessed", body: "A short quiz checks your understanding.", points: [["Quiz", "5 quick questions"], ["Pass mark", "80%"], ["Retries", "Up to 3 attempts"]] }],
  profile: [{ title: "Your trainer’s background", body: "Share the experience that makes this course worth your time.", items: ["10 years in the field", "Trained 500+ learners", "Happy to answer questions"] }, { title: "How to reach your trainer", body: "Get help any time during the course.", items: ["Email or chat", "Weekly open Q&A", "Reply within one working day"] }],
  info: [{ title: "Who this course is for", body: "Check this is the right course for you.", items: ["New joiners and current staff", "No previous experience needed", "Works on any device"] }, { title: "What you receive", body: "Complete the course to earn:", items: ["A completion certificate", "A summary guide to keep", "Access to future updates"] }],
  text: [{ title: "One idea at a time", body: "Break big topics into small steps. Each step should be easy to read in under a minute." }, { title: "Make it personal", body: "Use everyday words and relate each idea to the learner’s own work. Short sentences help learners stay focused." }],
  image: [{ title: "Show, don’t just tell", body: "A good picture explains an idea faster than a paragraph.", items: ["Use a clear diagram", "Add a real photo", "Label the key parts"] }, { title: "Pick the right image", body: "Choose visuals that support the lesson.", items: ["Keep it simple", "Use high-quality files", "Add a short caption"] }],
  video: [{ title: "See it in action", body: "Watch the demo, then try it yourself." }, { title: "Video recap", body: "A two-minute recap of the key steps." }],
  points: [{ title: "Three habits to build", body: "Small habits make a big difference.", points: [["Pause", "before you act"], ["Check", "the details"], ["Ask", "when unsure"]] }, { title: "Quick reminders", body: "Keep these close at hand.", points: [["Be clear", "say what you mean"], ["Be brief", "one idea per slide"], ["Be kind", "support each other"]] }],
  columns: [{ title: "Before and after", body: "See the difference one change makes.", cols: [["Before", "Long, crowded slides that are hard to follow."], ["After", "Short, clear slides with one idea each."]] }, { title: "Do and don’t", body: "Simple rules for every learner.", cols: [["Do", "Ask questions and share examples."], ["Don’t", "Rush through without reflecting."]] }],
  pdf: [{ title: "What’s in the guide", body: "A one-page summary you can print or save.", items: ["Key steps at a glance", "Checklists to follow", "Links and contacts"] }, { title: "How to use the guide", body: "Keep it with you as you work.", items: ["Download it once", "Print or save it", "Share it with your team"] }],
  single: [{ q: "What should you do before clicking a link in an email?", options: ["Click it quickly", "Check where it really goes", "Forward it to everyone"], answer: 1, explain: "Hover over the link to see its real address." }, { q: "Which password is the strongest?", options: ["password123", "Your pet’s name", "A long phrase with numbers and symbols"], answer: 2, explain: "Length and variety make passwords hard to guess." }],
  multiple: [{ q: "Which are signs of a fake email? Select all that apply.", options: ["Urgent threats", "A misspelled sender address", "A message from a known colleague", "An unexpected attachment"], answers: [0, 1, 3], explain: "A normal message from a colleague is not a warning sign." }, { q: "Which keep your account safe? Select all that apply.", options: ["Multi-factor sign-in", "Sharing your password", "Locking your screen", "Using a unique password"], answers: [0, 2, 3], explain: "Never share your password with anyone." }],
  truefalse: [{ q: "You should report a suspicious email even if you did not click it.", answer: 0, explain: "Reporting helps protect everyone." }, { q: "It is safe to use public Wi-Fi for sensitive work without protection.", answer: 1, explain: "Use a secure connection for sensitive work." }],
  matching: [{ q: "Which description best matches “multi-factor sign-in”?", options: ["A second check to prove who you are", "A way to speed up your laptop", "A type of spam filter"], answer: 0, explain: "It adds a second step after your password." }, { q: "Which description best matches a “data breach”?", options: ["A planned system update", "When private data is seen by the wrong people", "A new company policy"], answer: 1, explain: "Report a breach as soon as you spot it." }],
  short: [{ q: "Name one thing you check before opening an attachment.", accepted: "sender, the sender", explain: "Always check who sent it first." }, { q: "Who do you contact if you think your account is hacked?", accepted: "it, it desk, it team", explain: "Contact the IT desk straight away." }],
  passed: [{ title: "Well done!", passMsg: "You passed with a great score. Your certificate is ready to download." }, { title: "You did it!", passMsg: "Great work. You have completed every section of this course." }],
  failed: [{ title: "Almost there", failMsg: "You were close. Review the slides you missed and try again." }, { title: "Try again", failMsg: "Every attempt helps you learn. You still have attempts left." }],
  score: [{ title: "Your score", passMsg: "You scored above the pass mark. Check your answers below." }, { title: "Your progress", passMsg: "Nice progress. Your next step is the final summary." }],
  thanks: [{ title: "Thanks for taking part", body: "Your feedback helps us make this course better." }, { title: "See you next time", body: "Keep learning and keep growing." }],
  summary: [{ title: "Before you go", body: "Three things worth remembering:", items: ["Start small", "Keep practising", "Ask for help early"] }, { title: "Your next steps", body: "Turn what you learned into action:", items: ["Pick one idea to use today", "Tell a colleague what you learned", "Review again in a week"] }],
};

/* a full Edit.js slide for a template (norm() fills in every other field) */
function buildSlide(template, section, id, part = 0) {
  const [bg, fg] = LIGHT_THEMES[template.layoutType] || ["#ffffff", "#0f172a"];
  return norm({
    ...TEMPLATE_SLIDES[template.layoutType],
    ...(part > 0 ? TEMPLATE_MORE[template.layoutType][part - 1] : {}),
    ...(id ? { id } : {}),
    templateId: template.id,
    sec: section || template.category,
    bg, fg, ownBrand: true,
  });
}

/* the real slide, scaled to fit whatever box it is placed in (card thumbnail or preview) */
function FitSlide({ template, section, part = 0, title = "Your course title" }) {
  const box = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const slide = useMemo(() => buildSlide(template, section, `preview-${template.id}-${part}`, part), [template, section, part]);
  return (
    <div className="live-slide" ref={box}>
      {width > 0 && <SlideView s={slide} n={1} title={title} edit={false} scale={width / 960} />}
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

const editKey = (course) => `lernevo.edit.${course.id}`;

export default function TemplatesPage({ onEditorOpenChange = NOOP, onPreview = NOOP }) {
  const [category, setCategory] = useState("Introduction");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null);
  const [courses, setCourses] = useState(loadTemplateCourses);
  const [editor, setEditor] = useState(null);
  const [previewSlide, setPreviewSlide] = useState(null);

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
    if (!active) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const dialogRef = useRef(null);
  /* native <dialog>: always opens in the browser's top layer, centred on the screen, whatever the page layout is */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (active && dialog && !dialog.open && dialog.showModal) dialog.showModal();
  }, [active]);

  const openPreview = (template) => setActive(template);

  const shown = useMemo(() => COURSE_TEMPLATES.filter((template) => template.category === category &&
    `${template.name} ${template.description} ${template.category}`.toLowerCase().includes(query.trim().toLowerCase())), [category, query]);

  /* Use Template: start a NEW course from this exact template and open it in the editor (no pop-up) */
  const startFromTemplate = (template) => {
    const slide = buildSlide(template, template.category, `template-slide-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
    const course = { id: Date.now(), title: "Untitled course", status: "Draft", slides: 1, edited: "just now" };
    try { localStorage.setItem(editKey(course), JSON.stringify({ v: 2, slides: [slide], brand: BRAND0 })); } catch { /* the editor falls back to its starter slides */ }
    const updated = [course, ...courses];
    setCourses(updated);
    try { localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(updated)); } catch { /* keep the new course for this session */ }
    setActive(null);
    setEditor({ courseId: String(course.id), slideId: slide.id });
  };

  const editorCourse = editor && courses.find((item) => String(item.id) === editor.courseId);
  useEffect(() => { onEditorOpenChange(Boolean(editorCourse)); }, [editorCourse, onEditorOpenChange]);
  /* the editor takes over the whole screen (no sidebar), the same as when a course is opened from the Courses page */
  useEffect(() => {
    if (!editorCourse) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [editorCourse]);
  if (editorCourse) return createPortal(<div className="tpl-editor-layer">{previewSlide !== null
    ? <Preview key={`${editorCourse.id}-${previewSlide}`} course={editorCourse} startSlide={previewSlide} onExit={() => setPreviewSlide(null)} onClose={() => setPreviewSlide(null)} />
    : <Edit key={editorCourse.id} course={editorCourse} startSlideId={editor.slideId} onBack={() => setEditor(null)} onPreview={(index) => setPreviewSlide(index)} />}</div>, document.body);

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
            <div className="template-thumb">
              <button type="button" className="thumb-open" aria-label={`Preview ${template.name}`} onClick={() => openPreview(template)}><FitSlide template={template} /></button>
              <span className="thumb-category">{template.category}</span>
              <button className="thumb-preview" aria-label={`Preview ${template.name}`} onClick={() => openPreview(template)}><Image size={15} /></button>
            </div>
            <div className="template-card-copy"><span className="card-category">{template.category}</span><h3>{template.name}</h3><p>{template.description}</p></div>
            <div className="template-card-actions"><button className="preview-button" onClick={() => openPreview(template)}><Eye size={14} /> Preview</button><button className="use-button" onClick={() => startFromTemplate(template)}>Use Template <ArrowRight size={14} /></button></div>
          </article>)}</div> : <div className="template-empty"><span><Search size={22} /></span><h3>No templates found</h3><p>Try a different search or clear your query to see all {category.toLowerCase()} templates.</p><button onClick={() => setQuery("")}>Clear search</button></div>}
        </section>
      </main>

      {active && <dialog ref={dialogRef} className="tpl-dialog" aria-label={`${active.name} preview`} onClose={() => setActive(null)} onClick={(event) => { if (event.target === event.currentTarget) setActive(null); }}>
        <div className="tpl-modal-card">
          <header className="tpl-modal-head">
            <div><small>{active.category} template</small><h2>{active.name}</h2></div>
            <button type="button" className="tpl-modal-close" aria-label="Close preview" onClick={() => setActive(null)}><X size={18} /></button>
          </header>
          <div className="tpl-modal-slide"><FitSlide template={active} /></div>
          <p className="tpl-modal-desc">{active.description}</p>
          <div className="tpl-modal-actions"><button className="preview-button" onClick={() => setActive(null)}>Close</button><button className="use-button" onClick={() => startFromTemplate(active)}>Use Template <ArrowRight size={14} /></button></div>
        </div>
      </dialog>}

    </div>
  );
}
