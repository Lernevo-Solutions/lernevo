import { useMemo, useState } from "react";
import {
  ArrowUpRight, Bell, BookOpen, ChevronDown, CircleHelp, Download,
  FileQuestion, LayoutGrid, Menu, Palette, Play,
  Plus, Search, Shuffle, Sparkles, X, ChartNoAxesColumnIncreasing, Home,
  LayoutTemplate, ListChecks, Settings, PanelLeft, UserRound, Layers,
  SquarePen, CircleCheck,
} from "lucide-react";
import "./HomePage.css";

const navigationSections = [
  { label: "Workspace", items: [["home", "Home", Home], ["courses", "My Courses", BookOpen], ["templates", "Templates", LayoutTemplate], ["questions", "Question Bank", ListChecks]] },
  { label: "Authoring", items: [["studio", "Content Studio", Sparkles], ["branding", "Branding", Palette]] },
  { label: "Workspace Settings", items: [["settings", "Settings", Settings], ["help", "Help & Docs", CircleHelp]] },
];

function Sidebar({ active, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  return <aside className={`sb ${collapsed ? "sb--collapsed" : ""}`}>
    <div className="sb__header"><div className="sb__logo" aria-hidden="true"><span className="sb__logo-inner" /></div><div className="sb__brand"><span className="sb__title">Content Studio</span><span className="sb__subtitle">Lernevo Academy</span></div><button type="button" className="sb__collapse" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed((value) => !value)}><PanelLeft size={14} /></button></div>
    <nav className="sb__nav" aria-label="Main">{navigationSections.map((section) => <div className="sb__section" key={section.label}><div className="sb__section-label"><span>{section.label}</span><i /></div><ul className="sb__list">{section.items.map(([id, label, Icon]) => <li key={id}><button type="button" className={`sb__item ${active === id ? "is-active" : ""}`} aria-current={active === id ? "page" : undefined} title={collapsed ? label : undefined} onClick={() => onNavigate(id)}><Icon size={15} strokeWidth={1.75} /><span className="sb__item-text">{label}</span></button></li>)}</ul></div>)}</nav>
    <div className="sb__profile"><div className="sb__avatar">AM</div><div className="sb__profile-copy"><strong>Arjun Mehta</strong><span>Content Creator</span></div><UserRound className="sb__profile-mark" size={15} /></div>
  </aside>;
}

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
      <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
      <div className="art-glow" />
      <img className="hero-art-image" src={`${process.env.PUBLIC_URL}/assets/content-studio-hero.png`} alt="" />
      <span className="art-spark spark-a">✦</span><span className="art-spark spark-b">✦</span>
    </div>
  );
}

function Dashboard({ onNavigate }) {
  const stats = useMemo(() => [
    { title: "Total Courses", value: courseData.length, icon: Layers, tone: "blue" },
    { title: "Drafts", value: courseData.filter((course) => course.status === "draft").length, icon: SquarePen, tone: "orange" },
    { title: "Published", value: courseData.filter((course) => course.status === "published").length, icon: CircleCheck, tone: "green" },
    { title: "Total Slides", value: courseData.reduce((sum, course) => sum + course.slides, 0), icon: Layers, tone: "purple" },
  ], []);

  return (
    <div className="dashboard">
      <section className="hero-banner">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> YOUR LEARNING WORKSPACE</div>
          <h1>Create Engaging<br /><span>Learning Courses</span></h1>
          <p>Design, assess and publish interactive training courses for your organization.</p>
          <div className="hero-buttons">
            <button className="button-primary" onClick={() => onNavigate("studio")}><Plus size={17} /> Create New Course</button>
            <button className="button-secondary" onClick={() => onNavigate("templates")}>Browse Templates <ArrowUpRight size={15} /></button>
          </div>
        </div>
        <HeroIllustration />
      </section>

      <section className="stats-grid" aria-label="Course statistics">
        {stats.map(({ title, value, icon: Icon, tone }) => <article className="stat-card" key={title}>
          <div className={`stat-icon ${tone}`}><Icon size={18} strokeWidth={1.8} /></div>
          <div><p>{title}</p><strong>{value}</strong></div><span className="stat-dot" />
        </article>)}
      </section>

      <section className="content-section">
        <div className="section-heading"><h2>Quick Actions</h2></div>
        <div className="actions-grid">{quickActions.map(({ id, label, icon: Icon }) => <button className="action-card" key={id} onClick={() => onNavigate(id)}>
          <span className="action-icon"><Icon size={25} strokeWidth={1.8} /></span><span className="action-label">{label}</span>
        </button>)}</div>
      </section>

      <section className="content-section highlights-section">
        <div className="highlights-card"><h2>Platform Highlights</h2>{highlights.map(({ title, text, icon: Icon }) => <article className="highlight-item" key={title}><span className="highlight-icon"><Icon size={23} strokeWidth={1.8} /></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      </section>
    </div>
  );
}

export default function HomePage() {
  const [page, setPage] = useState("home");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState(false);
  const navigate = (id) => { setPage(id); setMobileNavOpen(false); };
  const pageName = ({ courses: "My Courses", templates: "Templates", questions: "Question Bank", studio: "Content Studio", branding: "Branding", settings: "Settings", help: "Help & Docs", media: "Media Library", export: "Export Course" })[page] || "Home";

  return <div className="app-shell">
    {mobileNavOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
    <div className={`sidebar-wrap ${mobileNavOpen ? "sidebar-wrap-open" : ""}`}><Sidebar active={page} onNavigate={navigate} /></div>
    <main className="main-shell">
      <header className="topbar">
        <div className="topbar-left"><button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={19} /></button></div>
        <label className="global-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") navigate("courses"); }} placeholder="Search courses, templates, questions..." /><kbd>⌘ K</kbd></label>
        <div className="topbar-tools"><button className="tool-button" aria-label="Notifications" onClick={() => setNotice((v) => !v)}><Bell size={18} /><i /></button><button className="tool-button" aria-label="Help" onClick={() => navigate("help")}><CircleHelp size={18} /></button><div className="profile-wrap"><button className="profile-button" onClick={() => setProfileOpen((v) => !v)} aria-expanded={profileOpen}><span className="avatar">AM</span><span className="profile-name">Arjun Mehta</span><ChevronDown size={14} /></button>{profileOpen && <div className="profile-menu"><div className="profile-menu-head"><span className="avatar">AM</span><span><b>Arjun Mehta</b><small>Content Creator</small></span></div><button onClick={() => { setProfileOpen(false); navigate("settings"); }}>Account settings</button><button onClick={() => setProfileOpen(false)}>Sign out</button></div>}</div></div>
        {notice && <div className="notice-popover"><span className="notice-dot" /><span><b>You're all caught up</b><small>No new notifications</small></span><button aria-label="Dismiss notifications" onClick={() => setNotice(false)}><X size={14} /></button></div>}
      </header>
      {page === "home" ? <Dashboard onNavigate={navigate} /> : <section className="destination-page"><span className="destination-icon"><Sparkles size={22} /></span><span className="section-kicker">CONTENT STUDIO</span><h2>{pageName}</h2><p>{page === "courses" ? "Search for a course to view its details." : page === "export" ? "Choose a course in My Courses to start an export." : `Your ${pageName.toLowerCase()} workspace is ready.`}</p>{page === "courses" && <label className="destination-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses..." /></label>}{page !== "courses" && <button className="button-primary" onClick={() => navigate(page === "templates" ? "studio" : "home")}><Plus size={16} />{page === "templates" ? "Create from a template" : "Back to Home"}</button>}</section>}
    </main>
  </div>;
}
