import { useState } from "react";

import {
  Home,
  BookOpen,
  LayoutTemplate,
  ListChecks,
  Image,
  Sparkles,
  Palette,
  Settings,
  LifeBuoy,
  PanelLeft,
  UserRound,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

import "./Sidebar.css";

const SECTIONS = [
  {
    label: "Workspace",
    items: [
      { id: "home", label: "Home", icon: Home },
      { id: "courses", label: "My Courses", icon: BookOpen },
      { id: "templates", label: "Templates", icon: LayoutTemplate },
      { id: "questions", label: "Question Bank", icon: ListChecks },
      { id: "media", label: "Media Library", icon: Image },
    ],
  },
  {
    label: "Authoring",
    items: [
      { id: "studio", label: "Content Studio", icon: Sparkles },
      { id: "branding", label: "Branding", icon: Palette },
    ],
  },
  {
    label: "Workspace Settings",
    items: [
      { id: "settings", label: "Settings", icon: Settings },
      { id: "help", label: "Help & Docs", icon: LifeBuoy },
    ],
  },
];

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
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  const handleClick = (id) => {
    navigate(ROUTES[id]);
  };

  return (
    <aside className={`sb ${collapsed ? "sb--collapsed" : ""}`}>
      {/* Header */}
      <div className="sb__header">
        <div className="sb__logo" aria-hidden="true">
          <span className="sb__logo-inner" />
        </div>

        <div className="sb__brand">
          <span className="sb__title">Content Studio</span>
          <span className="sb__subtitle">Lernevo Academy</span>
        </div>

        <button
          type="button"
          className="sb__collapse"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((c) => !c)}
        >
          <PanelLeft size={14} strokeWidth={1.75} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sb__nav" aria-label="Main">
        {SECTIONS.map((section) => (
          <div className="sb__section" key={section.label}>
            <div className="sb__section-label">
              <span>{section.label}</span>
              <i />
            </div>

            <ul className="sb__list">
              {section.items.map(({ id, label, icon: Icon }) => {
                const isActive = location.pathname === ROUTES[id];

                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={`sb__item ${isActive ? "is-active" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                      title={collapsed ? label : undefined}
                      onClick={() => handleClick(id)}
                    >
                      <Icon size={15} strokeWidth={1.75} />
                      <span className="sb__item-text">{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Profile card (bottom) */}
      <div className="sb__profile">
        <div className="sb__avatar">AM</div>
        <div className="sb__profile-copy">
          <strong>Arjun Mehta</strong>
          <span>Content Creator</span>
        </div>
        <UserRound className="sb__profile-mark" size={15} />
      </div>
    </aside>
  );
}