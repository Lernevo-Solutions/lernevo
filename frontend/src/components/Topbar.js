import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Globe, Bell, ChevronDown, Check } from "lucide-react";
import { NAV_SECTIONS, ROUTE_MAP } from "./Sidebar";

// ---------------------------------------------------------------------
// Logged-in user (comes from your Django LoginView response).
// After a successful login, AuthPage saves it like this:
//   localStorage.setItem("lernevo_user", JSON.stringify({
//     name, user_name, email, role, user_code
//   }));
// The helper below reads it back. It also tries a few common key names,
// in case your AuthPage already saves the values separately.
// ---------------------------------------------------------------------
const FALLBACK_USER = { name: "User", role: "", email: "", user_code: "" };

// "SUPER_ADMIN" -> "Super Admin", "TRAINER" -> "Trainer"
function formatRole(role) {
  if (!role) return "";
  return String(role)
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem("lernevo_user") || localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      return {
        name: u.name || u.user_name || u.username || u.email || FALLBACK_USER.name,
        role: u.role || u.user_role || "",
        email: u.email || "",
        user_code: u.user_code || "",
      };
    }
    const get = (...keys) => {
      for (const k of keys) {
        const v = localStorage.getItem(k);
        if (v) return v;
      }
      return "";
    };
    return {
      name: get("name", "user_name", "username", "email") || FALLBACK_USER.name,
      role: get("role", "user_role", "userRole"),
      email: get("email"),
      user_code: get("user_code"),
    };
  } catch (e) {
    return FALLBACK_USER;
  }
}

// TODO: replace with notifications from your API.
// Each item: { id, name, role, text, time, read, link }
const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    name: "Arun",
    role: "Team Lead · Operations",
    text: "submitted timesheet for 12 Oct – 18 Oct 2026. Waiting for your approval.",
    time: "5 min ago",
    read: false,
    link: "/timesheet",
  },
  {
    id: 2,
    name: "Divya",
    role: "Executive · Sales",
    text: "submitted timesheet for 12 Oct – 18 Oct 2026. Waiting for your approval.",
    time: "32 min ago",
    read: false,
    link: "/timesheet",
  },
  {
    id: 3,
    name: "Meena",
    role: "Supervisor · Operations",
    text: "requested leave on 15 Oct 2026. Waiting for your approval.",
    time: "1 hr ago",
    read: false,
    link: "/timesheet",
  },
  {
    id: 4,
    name: "Karthik",
    role: "Analyst · Finance",
    text: "submitted timesheet for 05 Oct – 11 Oct 2026. Approved by you.",
    time: "Yesterday",
    read: true,
    link: "/timesheet",
  },
];

const TIMEZONE = "Asia/Kolkata";

const AVATAR_COLORS = ["#2f6bff", "#16a34a", "#d97706", "#9333ea", "#e11d48", "#0d9488"];

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function colorFor(name) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export default function Topbar({
  user: userProp,
  initialNotifications = DUMMY_NOTIFICATIONS,
}) {
  // Real logged-in user (from login response). A `user` prop still overrides it.
  const [storedUser] = useState(readStoredUser);
  const user = userProp || storedUser;
  const location = useLocation();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Live clock - updates every 30 seconds
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // Close the notification panel on outside click or Escape
  useEffect(() => {
    if (!notifOpen) return;
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [notifOpen]);

  // Close the panel when the page changes
  useEffect(() => {
    setNotifOpen(false);
  }, [location.pathname, location.search]);

  const markAllRead = () =>
    setNotifications((list) => list.map((n) => ({ ...n, read: true })));

  const openNotification = (n) => {
    setNotifications((list) =>
      list.map((x) => (x.id === n.id ? { ...x, read: true } : x))
    );
    setNotifOpen(false);
    if (n.link) navigate(n.link);
  };

  // Find which sidebar item matches the current URL
  // /timesheet without ?tab= opens the Scheduler (same rule as the Sidebar)
  const currentUrl =
    location.pathname === "/timesheet" && !location.search
      ? "/timesheet?tab=scheduler"
      : location.pathname + location.search;
  const matchedLabel =
    Object.keys(ROUTE_MAP).find((label) => ROUTE_MAP[label] === currentUrl) ||
    Object.keys(ROUTE_MAP).find((label) => ROUTE_MAP[label] === location.pathname);

  const section = NAV_SECTIONS.find((s) =>
    s.items.some((it) => it.label === matchedLabel)
  );

  const sectionLabel = section ? section.label : "";
  const pageTitle = matchedLabel || "Dashboard";

  const time = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIMEZONE,
  });

  return (
    <header className="lv-topbar">
      <style>{`
        .lv-topbar {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: #ffffff;
          border-bottom: 1px solid rgba(31, 76, 176, 0.1);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
          /* fixed = always stays at the top, same as the sidebar */
          position: fixed;
          top: 0;
          left: 272px;   /* sidebar width */
          right: 0;
          z-index: 90;
          box-sizing: border-box;
        }

        .lv-topbar-section {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #8fa0bf;
          text-transform: uppercase;
        }

        .lv-topbar-title {
          font-size: 16px;
          font-weight: 700;
          color: #14213d;
          line-height: 1.2;
        }

        .lv-topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .lv-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 12px;
          border: 1px solid rgba(31, 76, 176, 0.12);
          border-radius: 10px;
          background: #fff;
        }

        .lv-chip svg { width: 15px; height: 15px; color: #2f6bff; }
        .lv-chip-time { font-size: 12px; font-weight: 700; color: #14213d; }
        .lv-chip-time span { font-weight: 400; color: #5b6b8c; }
        .lv-chip-zone { font-size: 10px; color: #8fa0bf; }

        /* ---------- Notifications ---------- */
        .lv-notif { position: relative; }

        .lv-bell {
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(31, 76, 176, 0.12);
          border-radius: 10px;
          background: #fff;
          cursor: pointer;
          padding: 0;
        }

        .lv-bell:hover,
        .lv-bell[aria-expanded="true"] { background: #eef3ff; }
        .lv-bell svg { width: 16px; height: 16px; color: #5b6b8c; }

        .lv-bell-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: 9px;
          background: #f43f5e;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lv-notif-panel {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 380px;
          max-width: calc(100vw - 32px);
          background: #fff;
          border: 1px solid rgba(31, 76, 176, 0.12);
          border-radius: 14px;
          box-shadow: 0 18px 40px rgba(20, 33, 61, 0.16);
          overflow: hidden;
        }

        .lv-notif-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(31, 76, 176, 0.08);
        }

        .lv-notif-head h4 { margin: 0; font-size: 14px; font-weight: 700; color: #14213d; }
        .lv-notif-head small { color: #8fa0bf; font-weight: 500; margin-left: 6px; }

        .lv-notif-markall {
          display: flex;
          align-items: center;
          gap: 4px;
          border: none;
          background: none;
          font-size: 12px;
          font-weight: 600;
          color: #2f6bff;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 6px;
        }

        .lv-notif-markall:hover { background: #eef3ff; }
        .lv-notif-markall svg { width: 13px; height: 13px; }

        .lv-notif-list { max-height: 360px; overflow-y: auto; }

        .lv-notif-item {
          display: flex;
          gap: 12px;
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          border: none;
          border-bottom: 1px solid rgba(31, 76, 176, 0.06);
          background: #fff;
          cursor: pointer;
          font-family: inherit;
        }

        .lv-notif-item:hover { background: #f4f8ff; }
        .lv-notif-item[data-read="false"] { background: #f4f8ff; }
        .lv-notif-item[data-read="false"]:hover { background: #eaf1ff; }

        .lv-notif-avatar {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: 50%;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lv-notif-body { flex: 1; min-width: 0; }
        .lv-notif-text { font-size: 13px; color: #5b6b8c; line-height: 1.4; }
        .lv-notif-text b { color: #14213d; font-weight: 700; }
        .lv-notif-meta { font-size: 11px; color: #8fa0bf; margin-top: 3px; }

        .lv-notif-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2f6bff;
          flex-shrink: 0;
          margin-top: 6px;
        }

        .lv-notif-empty {
          padding: 32px 16px;
          text-align: center;
          font-size: 13px;
          color: #8fa0bf;
        }

        .lv-notif-foot {
          width: 100%;
          padding: 12px;
          border: none;
          background: #fff;
          font-size: 13px;
          font-weight: 600;
          color: #2f6bff;
          cursor: pointer;
          font-family: inherit;
        }

        .lv-notif-foot:hover { background: #eef3ff; }

        /* ---------- User ---------- */
        .lv-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 10px 5px 6px;
          border: 1px solid rgba(31, 76, 176, 0.12);
          border-radius: 10px;
          background: #fff;
          cursor: pointer;
        }

        .lv-user:hover { background: #eef3ff; }

        .lv-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2f6bff, #5b8dff);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lv-user-name { font-size: 12px; font-weight: 700; color: #14213d; line-height: 1.2; }
        .lv-user-role { font-size: 10px; color: #8fa0bf; }
        .lv-user > svg { width: 14px; height: 14px; color: #8fa0bf; }
      `}</style>

      {/* LEFT: section + page title (changes on every sidebar click) */}
      <div>
        {sectionLabel && <div className="lv-topbar-section">{sectionLabel}</div>}
        <div className="lv-topbar-title">{pageTitle}</div>
      </div>

      {/* RIGHT: time, notifications, user */}
      <div className="lv-topbar-right">
        <div className="lv-chip">
          <Globe />
          <div>
            <div className="lv-chip-time">
              {time} <span>IST</span>
            </div>
            <div className="lv-chip-zone">{TIMEZONE} · GMT+05:30</div>
          </div>
        </div>

        {/* Notification bell + dropdown */}
        <div className="lv-notif" ref={notifRef}>
          <button
            type="button"
            className="lv-bell"
            title="Notifications"
            aria-label={`Notifications, ${unreadCount} unread`}
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Bell />
            {unreadCount > 0 && <span className="lv-bell-badge">{unreadCount}</span>}
          </button>

          {notifOpen && (
            <div className="lv-notif-panel" role="dialog" aria-label="Notifications">
              <div className="lv-notif-head">
                <h4>
                  Notifications
                  {unreadCount > 0 && <small>{unreadCount} new</small>}
                </h4>
                {unreadCount > 0 && (
                  <button type="button" className="lv-notif-markall" onClick={markAllRead}>
                    <Check /> Mark all as read
                  </button>
                )}
              </div>

              <div className="lv-notif-list">
                {notifications.length === 0 ? (
                  <div className="lv-notif-empty">You're all caught up. No notifications.</div>
                ) : (
                  notifications.map((n) => (
                    <button
                      type="button"
                      key={n.id}
                      className="lv-notif-item"
                      data-read={n.read}
                      onClick={() => openNotification(n)}
                    >
                      <div className="lv-notif-avatar" style={{ background: colorFor(n.name) }}>
                        {getInitials(n.name)}
                      </div>
                      <div className="lv-notif-body">
                        <div className="lv-notif-text">
                          <b>{n.name}</b> {n.text}
                        </div>
                        <div className="lv-notif-meta">
                          {n.role} · {n.time}
                        </div>
                      </div>
                      {!n.read && <span className="lv-notif-dot" />}
                    </button>
                  ))
                )}
              </div>

              <button
                type="button"
                className="lv-notif-foot"
                onClick={() => {
                  setNotifOpen(false);
                  navigate("/timesheet");
                }}
              >
                View all timesheets
              </button>
            </div>
          )}
        </div>

        <div className="lv-user">
          <div className="lv-avatar">{getInitials(user.name)}</div>
          <div>
            <div className="lv-user-name">{user.name}</div>
            <div className="lv-user-role">{formatRole(user.role) || "Member"}</div>
          </div>
          <ChevronDown />
        </div>
      </div>
    </header>
  );
}