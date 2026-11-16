import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight, BookOpen, Download,
  FileQuestion, LayoutGrid, Palette, Play, Plus, Shuffle,
  Sparkles, ChartNoAxesColumnIncreasing, Layers, SquarePen, CircleCheck,
} from "lucide-react";
import "./HomePageStudio.css";

const ROUTES = {
  home: "/",
  courses: "/courses",
  templates: "/templates",
  questions: "/questions",
  media: "/media",
  studio: "/studio",
  branding: "/branding",
  settings: "/settings",
  help: "/help",
  export: "/courses",
};

const courseData = [
  { status: "published", slides: 18 },
  { status: "draft", slides: 12 },
  { status: "published", slides: 24 },
  { status: "draft", slides: 9 },
  { status: "published", slides: 16 },
];

const quickActions = [
  { id: "studio", label: "Create New Course", detail: "Start with a blank canvas", icon: Plus },
  { id: "templates", label: "Browse Templates", detail: "Explore ready-made layouts", icon: LayoutGrid },
  { id: "questions", label: "Question Bank", detail: "Build engaging assessments", icon: FileQuestion },
  { id: "branding", label: "Global Branding", detail: "Manage your brand kit", icon: Palette },
  { id: "export", label: "Export Course", detail: "Publish or download a course", icon: Download },
  { id: "help", label: "Help & Docs", detail: "Find answers and guidance", icon: BookOpen },
];

const highlights = [
  { title: "Multiple Question Types", text: "MCQ, Multiple Answer, Short Answer, Drag & Drop, Matching", icon: FileQuestion },
  { title: "Smart Assessments", text: "Attempts, Partial Scoring, Shuffle & Random Questions", icon: Shuffle },
  { title: "Rich Media Learning", text: "Text, Images, Voice-over, Video & Streaming", icon: Play },
  { title: "Track Progress", text: "Slide Progress, Course Completion & Results", icon: ChartNoAxesColumnIncreasing },
];

function HeroIllustration() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <div className="art-glow" />
     
<img
  className="hero-art-image"
  src="/assets/content-studio-hero.png"
  alt="Content Studio"
 />

      <span className="art-spark spark-a">✦</span>
      <span className="art-spark spark-b">✦</span>
    </div>
  );
}

function Dashboard({ onNavigate }) {
  const stats = useMemo(
    () => [
      { title: "Total Courses", value: courseData.length, icon: Layers, tone: "blue" },
      { title: "Drafts", value: courseData.filter((c) => c.status === "draft").length, icon: SquarePen, tone: "orange" },
      { title: "Published", value: courseData.filter((c) => c.status === "published").length, icon: CircleCheck, tone: "green" },
      { title: "Total Slides", value: courseData.reduce((sum, c) => sum + c.slides, 0), icon: Layers, tone: "purple" },
    ],
    []
  );

  return (
    <div className="dashboard">
      <section className="hero-banner">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={14} /> YOUR LEARNING WORKSPACE
          </div>
          <h1>
            Create Engaging
            <br />
            <span>Learning Courses</span>
          </h1>
          <p>Design, assess and publish interactive training courses for your organization.</p>
          <div className="hero-buttons">
            <button className="button-primary" onClick={() => onNavigate("studio")}>
              <Plus size={17} /> Create New Course
            </button>
            <button className="button-secondary" onClick={() => onNavigate("templates")}>
              Browse Templates <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
        <HeroIllustration />
      </section>

      <section className="stats-grid" aria-label="Course statistics">
        {stats.map(({ title, value, icon: Icon, tone }) => (
          <article className="stat-card" key={title}>
            <div className={`stat-icon ${tone}`}>
              <Icon size={18} strokeWidth={1.8} />
            </div>
            <div>
              <p>{title}</p>
              <strong>{value}</strong>
            </div>
            <span className="stat-dot" />
          </article>
        ))}
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Quick Actions</h2>
        </div>
        <div className="actions-grid">
          {quickActions.map(({ id, label, icon: Icon }) => (
            <button className="action-card" key={id} onClick={() => onNavigate(id)}>
              <span className="action-icon">
                <Icon size={25} strokeWidth={1.8} />
              </span>
              <span className="action-label">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="content-section highlights-section">
        <div className="highlights-card">
          <h2>Platform Highlights</h2>
          {highlights.map(({ title, text, icon: Icon }) => (
            <article className="highlight-item" key={title}>
              <span className="highlight-icon">
                <Icon size={23} strokeWidth={1.8} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  const routerNavigate = useNavigate();
  const navigate = (id) => routerNavigate(ROUTES[id] || "/");

  return (
    <div className="main-shell">

      <Dashboard onNavigate={navigate} />
    </div>
  );
}