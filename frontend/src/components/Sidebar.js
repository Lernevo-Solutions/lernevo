import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown,
  LayoutGrid,
  Users,
  Building2,
  Briefcase,
  UserCog,
  Clock,
  Wallet,
  FileText,
  BookOpen,
  Library,
  GraduationCap,
  Dumbbell,
  ClipboardList,
  Utensils,
  Salad,
  Brain,
  HeartPulse,
  Tag,
  Link2,
  Settings,
  User,
} from "lucide-react";

// Maps sidebar item labels to actual app routes.
// Add an entry here whenever a real page exists for that item.
const ROUTE_MAP = {
  Dashboard: "/admin-dashboard",
  Users: "/user-assignments",
  Organizations: "/organizations",
  "Job Codes": "/job",
  Timesheets: "/timesheet",
  Payslips: "/payslip",
  "Compliance Documents": "/document",
  Profile: "/profile",
};

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ icon: LayoutGrid, label: "Dashboard" }],
  },
  {
    label: "People & Organization",
    items: [
      { icon: Building2, label: "Organizations" },
      { icon: Users, label: "Users" },
      { icon: Briefcase, label: "Job Codes" },
    ],
  },
  {
    label: "HR Operations",
    items: [
      { icon: Clock, label: "Timesheets" },
      { icon: Wallet, label: "Payslips" },
      { icon: FileText, label: "Compliance Documents" },
    ],
  },
  {
    label: "Learning",
    items: [
      { icon: BookOpen, label: "Courses" },
      { icon: Library, label: "Library" },
      { icon: GraduationCap, label: "Curriculum" },
    ],
  },
  {
    label: "Fitness",
    items: [
      { icon: Dumbbell, label: "Workouts" },
      { icon: ClipboardList, label: "Workout Plans" },
    ],
  },
  {
    label: "Nutrition",
    items: [
      { icon: Utensils, label: "Meals" },
      { icon: Salad, label: "Meal Plans" },
    ],
  },
  {
    label: "Mental Health",
    items: [
      { icon: Brain, label: "Mental Health Items" },
      { icon: HeartPulse, label: "Mental Health Plans" },
    ],
  },
  {
    label: "Personalization",
    items: [
      { icon: Tag, label: "Keywords" },
      { icon: Link2, label: "Entity Keywords" },
    ],
  },
  {
    label: "System",
    items: [
      { icon: Settings, label: "Settings" },
      { icon: User, label: "Profile" },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState("Dashboard");
  const [role, setRole] = useState("Super Admin");
  const [roleOpen, setRoleOpen] = useState(false);

  // Track which sections are expanded (dropdown open)
  const [openSections, setOpenSections] = useState({
    Overview: true,
    "People & Organization": true,
  });

  const roles = ["Super Admin", "Org Admin", "Manager", "Employee"];

  // Keep the highlighted item in sync with the current URL
  useEffect(() => {
    const matchedLabel = Object.keys(ROUTE_MAP).find(
      (label) => ROUTE_MAP[label] === location.pathname
    );
    if (matchedLabel) {
      setActive(matchedLabel);
      // Auto-open the section that contains the active item
      const section = NAV_SECTIONS.find((s) =>
        s.items.some((it) => it.label === matchedLabel)
      );
      if (section) {
        setOpenSections((prev) => ({ ...prev, [section.label]: true }));
      }
    }
  }, [location.pathname]);

  const handleItemClick = (label) => {
    setActive(label);
    const path = ROUTE_MAP[label];
    if (path) {
      navigate(path);
    }
  };

  const toggleSection = (label) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <div className="lv-sidebar">
      <style>{`
        .lv-sidebar {
          --bg: #ffffff;
          --bg-soft: #f4f8ff;
          --border: rgba(31, 76, 176, 0.1);
          --text: #14213d;
          --text-dim: #5b6b8c;
          --text-faint: #8fa0bf;
          --blue-1: #2f6bff;
          --blue-2: #5b8dff;
          --blue-glow: rgba(47, 107, 255, 0.25);

          width: 272px;
          height: 100vh;
          background: linear-gradient(180deg, var(--bg) 0%, var(--bg-soft) 100%);
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border);
          box-sizing: border-box;
        }

        .lv-sidebar * { box-sizing: border-box; }

        .lv-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 22px 20px 18px 20px;
        }

        .lv-brand-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .lv-brand-icon svg { color: white; width: 20px; height: 20px; }

        .lv-brand-logo {
          height: 34px;
          width: auto;
          object-fit: contain;
        }

        .lv-brand-text-title {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        .lv-brand-text-sub {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--blue-2);
          margin-top: 2px;
        }

        .lv-role-block {
          padding: 0 20px 18px 20px;
        }

        .lv-role-label {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.07em;
          color: var(--text-faint);
          margin-bottom: 8px;
        }

        .lv-role-select {
          position: relative;
          width: 100%;
        }

        .lv-role-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 10px;
          background: #eef3ff;
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
        }

        .lv-role-btn:hover { background: #e2ebff; }

        .lv-role-btn svg {
          width: 15px; height: 15px; color: var(--text-dim);
          transition: transform 0.15s ease;
        }

        .lv-role-btn[data-open="true"] svg { transform: rotate(180deg); }

        .lv-role-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 6px;
          z-index: 10;
          box-shadow: 0 12px 28px rgba(20, 33, 61, 0.14);
        }

        .lv-role-option {
          padding: 8px 10px;
          border-radius: 7px;
          font-size: 13px;
          color: var(--text-dim);
          cursor: pointer;
        }

        .lv-role-option:hover { background: #f0f4ff; color: var(--text); }
        .lv-role-option[data-selected="true"] { color: var(--blue-1); background: rgba(47,107,255,0.1); font-weight: 600; }

        .lv-nav {
          flex: 1;
          overflow-y: auto;
          padding: 4px 14px 20px 14px;
        }

        .lv-nav::-webkit-scrollbar { width: 6px; }
        .lv-nav::-webkit-scrollbar-thumb { background: rgba(47,107,255,0.15); border-radius: 3px; }

        .lv-section { margin-top: 8px; }
        .lv-section:first-child { margin-top: 4px; }

        /* Clickable section header (acts as dropdown toggle) */
        .lv-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          user-select: none;
          transition: background 0.12s ease;
        }

        .lv-section-header:hover {
          background: #eef3ff;
        }

        .lv-section-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-faint);
        }

        .lv-section-header:hover .lv-section-label {
          color: var(--blue-1);
        }

        .lv-section-chevron {
          width: 14px;
          height: 14px;
          color: var(--text-faint);
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }

        .lv-section-header[data-open="true"] .lv-section-chevron {
          transform: rotate(180deg);
        }

        .lv-section-header[data-open="true"] .lv-section-label {
          color: var(--blue-1);
        }

        /* Smooth expand/collapse of items */
        .lv-section-items {
          overflow: hidden;
          transition: max-height 0.25s ease, opacity 0.2s ease;
        }

        .lv-section-items[data-open="false"] {
          max-height: 0;
          opacity: 0;
        }

        .lv-section-items[data-open="true"] {
          max-height: 500px;
          opacity: 1;
          margin-top: 4px;
        }

        .lv-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 12px;
          border-radius: 10px;
          margin-bottom: 2px;
          cursor: pointer;
          font-size: 13.8px;
          font-weight: 500;
          color: var(--text-dim);
          position: relative;
          transition: background 0.12s ease, color 0.12s ease;
        }

        .lv-item svg {
          width: 17px;
          height: 17px;
          flex-shrink: 0;
        }

        .lv-item:hover {
          background: #eef3ff;
          color: var(--text);
        }

        .lv-item[data-active="true"] {
          background: linear-gradient(135deg, var(--blue-1), #4d7dff);
          color: #ffffff;
          box-shadow: 0 6px 18px var(--blue-glow);
        }

        .lv-item[data-active="true"]::before {
          content: "";
          position: absolute;
          left: -14px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 18px;
          background: var(--blue-2);
          border-radius: 2px;
        }
      `}</style>

      <div className="lv-brand">
        <div className="lv-brand-icon">
          <img src="/logo.png" alt="Lernevo logo" className="lv-brand-logo" />
        </div>
        <div>
          <div className="lv-brand-text-title">Lernevo</div>
          <div className="lv-brand-text-sub">INTEGRATED PLATFORM</div>
        </div>
      </div>

      <div className="lv-role-block">
        <div className="lv-role-label">SIGNED IN AS</div>
        <div className="lv-role-select">
          <button
            className="lv-role-btn"
            data-open={roleOpen}
            onClick={() => setRoleOpen((v) => !v)}
          >
            {role}
            <ChevronDown />
          </button>
          {roleOpen && (
            <div className="lv-role-menu">
              {roles.map((r) => (
                <div
                  key={r}
                  className="lv-role-option"
                  data-selected={r === role}
                  onClick={() => {
                    setRole(r);
                    setRoleOpen(false);
                  }}
                >
                  {r}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="lv-nav">
        {NAV_SECTIONS.map((section) => {
          const isOpen = !!openSections[section.label];
          return (
            <div className="lv-section" key={section.label}>
              {/* Section header - click to toggle dropdown */}
              <div
                className="lv-section-header"
                data-open={isOpen}
                onClick={() => toggleSection(section.label)}
              >
                <span className="lv-section-label">
                  {section.label.toUpperCase()}
                </span>
                <ChevronDown className="lv-section-chevron" />
              </div>

              {/* Sub-items (dropdown content) */}
              <div className="lv-section-items" data-open={isOpen}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.label;
                  return (
                    <div
                      className="lv-item"
                      data-active={isActive}
                      key={item.label}
                      onClick={() => handleItemClick(item.label)}
                    >
                      <Icon />
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}