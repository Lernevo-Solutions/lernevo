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
} from "lucide-react";
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
      { id: "help", label: "Help & docs", icon: LifeBuoy },
    ],
  },
];

export default function Sidebar({ onNavigate }) {
  const [active, setActive] = useState("courses");
  const [collapsed, setCollapsed] = useState(false);

  const handleClick = (id) => {
    setActive(id);
    if (onNavigate) onNavigate(id);
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
              {section.items.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    type="button"
                    className={`sb__item ${active === id ? "is-active" : ""}`}
                    aria-current={active === id ? "page" : undefined}
                    title={collapsed ? label : undefined}
                    onClick={() => handleClick(id)}
                  >
                    <Icon size={15} strokeWidth={1.75} />
                    <span className="sb__item-text">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}