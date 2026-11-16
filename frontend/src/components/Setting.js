import React, { useState, useEffect, createContext, useContext } from "react";
import {
  Palette,
  Globe,
  Bell,
  ShieldCheck,
  Database,
  Check,
  Eye,
  EyeOff,
  Search,
  Mail,
  Smartphone,
  Monitor,
  Download,
  RotateCcw,
  KeyRound,
  BellRing,
  Timer,
  ShieldAlert,
} from "lucide-react";

/* ==================================================================== */
/*  APPEARANCE ENGINE (theme + display)                                  */
/*  Call initAppearance() ONCE in src/index.js (or App.js) so the saved  */
/*  look is applied on every page and after every refresh:               */
/*                                                                       */
/*     import { initAppearance } from "./pages/Settings";                */
/*     initAppearance();                                                 */
/* ==================================================================== */
const APPEARANCE_KEY = "lv-appearance";
const STYLE_ID = "lv-appearance-style";

export const APPEARANCE_DEFAULTS = {
  theme: "system", // "light" | "dark" | "system"
  accent: "#2f6bff",
  scale: 100, // 90 | 100 | 110
  density: "comfortable", // "comfortable" | "compact"
  reduceMotion: false,
};

export function loadAppearance() {
  try {
    return { ...APPEARANCE_DEFAULTS, ...JSON.parse(localStorage.getItem(APPEARANCE_KEY) || "{}") };
  } catch (err) {
    return APPEARANCE_DEFAULTS;
  }
}

/* App-wide CSS for theme/display. Sidebar is covered here. For the top bar
   and other pages add rules under  html[data-lv-theme="dark"] ...         */
const GLOBAL_CSS = `
  html[data-lv-theme="dark"] { color-scheme: dark; }
  html[data-lv-theme="dark"] body { background: #0b1220; color: #e6ecfa; }

  .lv-sidebar .lv-item[data-active="true"] {
    background: linear-gradient(135deg, var(--lv-accent, #2f6bff), color-mix(in srgb, var(--lv-accent, #2f6bff) 78%, #ffffff));
    box-shadow: 0 6px 18px color-mix(in srgb, var(--lv-accent, #2f6bff) 30%, transparent);
  }
  .lv-sidebar .lv-item[data-active="true"]::before { background: var(--lv-accent, #2f6bff); }
  .lv-sidebar .lv-section-header:hover .lv-section-label,
  .lv-sidebar .lv-section-header[data-open="true"] .lv-section-label { color: var(--lv-accent, #2f6bff); }

  html[data-lv-theme="dark"] .lv-sidebar {
    --bg: #0f1830; --bg-soft: #0b1325; --border: rgba(140, 170, 255, 0.14);
    --text: #e6ecfa; --text-dim: #a3b2d1; --text-faint: #7b8cb0;
  }
  html[data-lv-theme="dark"] .lv-sidebar .lv-item:hover,
  html[data-lv-theme="dark"] .lv-sidebar .lv-section-header:hover { background: rgba(120, 160, 255, 0.12); }
  html[data-lv-theme="dark"] .lv-sidebar .lv-role-btn { background: #16223f; }
  html[data-lv-theme="dark"] .lv-sidebar .lv-role-btn:hover { background: #1b2a4d; }
  html[data-lv-theme="dark"] .lv-sidebar .lv-role-menu { background: #121c36; box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5); }
  html[data-lv-theme="dark"] .lv-sidebar .lv-role-option:hover { background: rgba(120, 160, 255, 0.12); }
  html[data-lv-theme="dark"] .lv-sidebar .lv-role-option[data-selected="true"] { background: rgba(91, 141, 255, 0.2); color: #8db0ff; }

  html[data-lv-density="compact"] .lv-sidebar .lv-item { padding-top: 6px; padding-bottom: 6px; }
  html[data-lv-density="compact"] .lv-sidebar .lv-section-header { padding-top: 5px; padding-bottom: 5px; }

  html[data-lv-scale="on"] .lv-sidebar,
  html[data-lv-scale="on"] .lv-sidebar-slot { height: calc(100vh / var(--lv-zoom, 1)); }

  html[data-lv-motion="reduce"] *, html[data-lv-motion="reduce"] *::before, html[data-lv-motion="reduce"] *::after {
    transition: none !important; animation: none !important; scroll-behavior: auto !important;
  }
`;

let systemQuery = null;
let systemHandler = null;

export function applyAppearance(a) {
  try {
    const root = document.documentElement;
    if (!document.getElementById(STYLE_ID)) {
      const s = document.createElement("style");
      s.id = STYLE_ID;
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
    const darkNow = () => window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = a.theme === "system" ? (darkNow() ? "dark" : "light") : a.theme;

    root.setAttribute("data-lv-theme", resolved);
    root.style.setProperty("--lv-accent", a.accent);
    root.style.setProperty("--lv-zoom", String(a.scale / 100));
    root.setAttribute("data-lv-scale", a.scale !== 100 ? "on" : "off");
    root.setAttribute("data-lv-density", a.density);
    root.setAttribute("data-lv-motion", a.reduceMotion ? "reduce" : "full");
    if (document.body) document.body.style.zoom = a.scale === 100 ? "" : String(a.scale / 100);

    if (systemQuery && systemHandler) systemQuery.removeEventListener("change", systemHandler);
    systemQuery = null;
    systemHandler = null;
    if (a.theme === "system" && window.matchMedia) {
      systemQuery = window.matchMedia("(prefers-color-scheme: dark)");
      systemHandler = () => root.setAttribute("data-lv-theme", darkNow() ? "dark" : "light");
      systemQuery.addEventListener("change", systemHandler);
    }
  } catch (err) {
    /* ignore */
  }
}

export function initAppearance() {
  applyAppearance(loadAppearance());
}

/* ==================================================================== */
/*  PREFERENCES (stored on this device until you connect an API)         */
/* ==================================================================== */
const STORAGE_KEY = "lv-settings-v2";
const SAVED_AT_KEY = "lv-settings-saved-at";

const NOTIF_ROWS = [
  { id: "leave", label: "Leave and permissions", hint: "Requests and decisions" },
  { id: "timesheet", label: "Timesheets", hint: "Reminders and approvals" },
  { id: "payslip", label: "Payslips", hint: "When a new payslip is ready" },
  { id: "reviews", label: "Performance and goals", hint: "Review cycles and feedback" },
  { id: "announcements", label: "Announcements", hint: "News from your organization" },
];
const CHANNELS = [
  { id: "email", label: "Email", icon: Mail },
  { id: "inapp", label: "In-app", icon: Bell },
  { id: "push", label: "Push", icon: Smartphone },
];

const DEFAULTS = {
  region: {
    language: "English",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
    weekStart: "Monday",
  },
  notifications: {
    matrix: {
      leave: { email: true, inapp: true, push: false },
      timesheet: { email: true, inapp: true, push: false },
      payslip: { email: true, inapp: true, push: false },
      reviews: { email: true, inapp: true, push: false },
      announcements: { email: false, inapp: true, push: false },
    },
    quietOn: false,
    quietFrom: "22:00",
    quietTo: "07:00",
    digest: "Daily",
  },
  security: { twoFactor: false, loginAlerts: true, sessionTimeout: "30" },
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const merged = {};
    Object.keys(DEFAULTS).forEach((k) => {
      merged[k] = { ...DEFAULTS[k], ...(saved[k] || {}) };
    });
    merged.notifications.matrix = { ...DEFAULTS.notifications.matrix, ...((saved.notifications || {}).matrix || {}) };
    return merged;
  } catch (err) {
    return DEFAULTS;
  }
}

function persistSettings(data, stamp) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (stamp) localStorage.setItem(SAVED_AT_KEY, stamp);
  } catch (err) {
    /* ignore */
  }
}

/* ---------- Tabs + search index ---------- */
const TABS = [
  { id: "appearance", label: "Appearance", icon: Palette, tint: "#2f6bff",
    title: "Make Lernevo look like you", desc: "Pick a theme, an accent color and how much fits on screen." },
  { id: "region", label: "Language & region", icon: Globe, tint: "#0f8fb5",
    title: "Language, time and dates", desc: "Show times and dates the way you read them." },
  { id: "notifications", label: "Notifications", icon: Bell, tint: "#d9820b",
    title: "Stay informed, not interrupted", desc: "Choose what reaches you, where, and when." },
  { id: "security", label: "Privacy & security", icon: ShieldCheck, tint: "#e0445a",
    title: "Keep your account safe", desc: "Sign-in protection, your password and your devices." },
  { id: "data", label: "Data & storage", icon: Database, tint: "#7a4dff",
    title: "Your settings, your data", desc: "Export your preferences or start fresh." },
];

const SEARCH_INDEX = [
  { label: "Theme", tab: "appearance", words: "light dark system night mode" },
  { label: "Accent color", tab: "appearance", words: "color colour blue green brand" },
  { label: "Interface size", tab: "appearance", words: "font text zoom bigger larger smaller" },
  { label: "Spacing", tab: "appearance", words: "compact density comfortable" },
  { label: "Reduce motion", tab: "appearance", words: "animation transitions accessibility" },
  { label: "Language", tab: "region", words: "tamil hindi english translate" },
  { label: "Time zone", tab: "region", words: "timezone clock ist" },
  { label: "Date format", tab: "region", words: "dd/mm/yyyy" },
  { label: "Time format", tab: "region", words: "12 hour 24 hour clock" },
  { label: "First day of week", tab: "region", words: "monday sunday calendar" },
  { label: "Notification channels", tab: "notifications", words: "email push in-app alerts leave payslip timesheet" },
  { label: "Quiet hours", tab: "notifications", words: "mute pause night do not disturb" },
  { label: "Email summary", tab: "notifications", words: "digest daily weekly" },
  { label: "Two-factor authentication", tab: "security", words: "2fa code login" },
  { label: "Sign-in alerts", tab: "security", words: "new device email" },
  { label: "Sign out when inactive", tab: "security", words: "timeout idle session" },
  { label: "Change password", tab: "security", words: "reset new password strength" },
  { label: "Signed-in devices", tab: "security", words: "sessions browser logout" },
  { label: "Export my settings", tab: "data", words: "download backup json" },
  { label: "Reset all settings", tab: "data", words: "default clear restore" },
];

const ACCENTS = [
  { value: "#2f6bff", name: "Blue" },
  { value: "#7a4dff", name: "Violet" },
  { value: "#0f8fb5", name: "Ocean" },
  { value: "#12946f", name: "Green" },
  { value: "#e8730c", name: "Orange" },
  { value: "#e0445a", name: "Rose" },
];

const LANGUAGES = [
  { value: "English", title: "English", sub: "English" },
  { value: "Tamil", title: "தமிழ்", sub: "Tamil" },
  { value: "Hindi", title: "हिन्दी", sub: "Hindi" },
  { value: "Telugu", title: "తెలుగు", sub: "Telugu" },
  { value: "Malayalam", title: "മലയാളം", sub: "Malayalam" },
  { value: "Kannada", title: "ಕನ್ನಡ", sub: "Kannada" },
];

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India (IST, UTC+5:30)" },
  { value: "Asia/Dubai", label: "Dubai (GST, UTC+4)" },
  { value: "Asia/Singapore", label: "Singapore (SGT, UTC+8)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST, UTC+9)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Berlin", label: "Central Europe (CET/CEST)" },
  { value: "America/New_York", label: "New York (ET)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PT)" },
];

/* ---------- date helpers for the live examples ---------- */
function fmtDate(d, tz, fmt) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "2-digit", month: "2-digit", year: "numeric" }).formatToParts(d);
  const g = (t) => parts.find((p) => p.type === t).value;
  if (fmt === "MM/DD/YYYY") return `${g("month")}/${g("day")}/${g("year")}`;
  if (fmt === "YYYY-MM-DD") return `${g("year")}-${g("month")}-${g("day")}`;
  return `${g("day")}/${g("month")}/${g("year")}`;
}
function fmtTime(d, tz, h12) {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: h12 }).format(d);
}
function fmtLong(d, tz, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
}

function deviceLabel() {
  try {
    const ua = navigator.userAgent;
    const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Unknown OS";
    const br = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
    return `${br} on ${os}`;
  } catch (err) {
    return "This browser";
  }
}

function strengthOf(pw) {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 8) score++;
  return { score, label: ["Too weak", "Weak", "Fair", "Good", "Strong"][score] };
}

/* ==================================================================== */
/*  LANGUAGE & REGION ENGINE                                             */
/*  - Settings page translates live from the language you pick.          */
/*  - "Save changes" applies it app-wide (html lang + an event).         */
/*  Use in any other page / the top bar:                                 */
/*     import { useRegion, formatTime, formatDate, translate } from     */
/*       "./pages/Settings";                                             */
/*     const region = useRegion();   // re-renders when it changes       */
/*     formatTime(new Date(), region) // time in the chosen zone/format  */
/*  Call initRegion() once in src/index.js next to initAppearance().     */
/* ==================================================================== */
const LANG_CODES = { English: "en", Tamil: "ta", Hindi: "hi", Telugu: "te", Malayalam: "ml", Kannada: "kn" };
const LANG_LOCALES = { English: "en-US", Tamil: "ta-IN", Hindi: "hi-IN", Telugu: "te-IN", Malayalam: "ml-IN", Kannada: "kn-IN" };

/* Languages missing here fall back to English text (dates still localise). */
const STRINGS = {
  Tamil: {
 "Appearance": "தோற்றம்",
 "Language & region": "மொழி & பிராந்தியம்",
 "Notifications": "அறிவிப்புகள்",
 "Privacy & security": "தனியுரிமை & பாதுகாப்பு",
 "Data & storage": "தரவு & சேமிப்பு",
 "Make Lernevo look like you": "Lernevo-வை உங்கள் பாணியில் மாற்றுங்கள்",
 "Language, time and dates": "மொழி, நேரம் மற்றும் தேதிகள்",
 "Stay informed, not interrupted": "தகவல் பெறுங்கள், தொந்தரவு வேண்டாம்",
 "Keep your account safe": "உங்கள் கணக்கைப் பாதுகாப்பாக வைத்திருங்கள்",
 "Your settings, your data": "உங்கள் அமைப்புகள், உங்கள் தரவு",
 "Pick a theme, an accent color and how much fits on screen.": "தீம், அழுத்த நிறம், திரையில் எவ்வளவு தெரிய வேண்டும் என்பதைத் தேர்வுசெய்யுங்கள்.",
 "Show times and dates the way you read them.": "நேரத்தையும் தேதியையும் நீங்கள் படிக்கும் முறையில் காட்டுங்கள்.",
 "Choose what reaches you, where, and when.": "எது, எங்கே, எப்போது உங்களுக்கு வர வேண்டும் என்பதைத் தேர்வுசெய்யுங்கள்.",
 "Sign-in protection, your password and your devices.": "உள்நுழைவு பாதுகாப்பு, உங்கள் கடவுச்சொல் மற்றும் சாதனங்கள்.",
 "Export your preferences or start fresh.": "உங்கள் விருப்பங்களை ஏற்றுமதி செய்யுங்கள் அல்லது புதிதாகத் தொடங்குங்கள்.",
 "Saved automatically": "தானாகச் சேமிக்கப்பட்டது",
 "Unsaved changes": "சேமிக்காத மாற்றங்கள்",
 "Up to date": "புதுப்பிக்கப்பட்டது",
 "You have unsaved changes": "சேமிக்காத மாற்றங்கள் உள்ளன",
 "Discard": "நிராகரி",
 "Save changes": "மாற்றங்களைச் சேமி",
 "Search settings": "அமைப்புகளைத் தேடு",
 "Live example": "நேரலை எடுத்துக்காட்டு",
 "Short date:": "குறுகிய தேதி:",
 "Example:": "எடுத்துக்காட்டு:",
 "No settings match": "பொருந்தும் அமைப்புகள் இல்லை",
 "Language": "மொழி",
 "Menus and labels switch as translations become available.": "மொழிபெயர்ப்புகள் கிடைக்கும்போது மெனுக்களும் லேபிள்களும் மாறும்.",
 "Time zone": "நேர மண்டலம்",
 "Used by the scheduler, timesheets and reminders.": "அட்டவணை, நேரத்தாள்கள், நினைவூட்டல்களில் பயன்படுத்தப்படும்.",
 "Your time zone": "உங்கள் நேர மண்டலம்",
 "Dates and time": "தேதிகளும் நேரமும்",
 "Pick the style you find easiest to read.": "படிக்க எளிதான வடிவத்தைத் தேர்வுசெய்யுங்கள்.",
 "Date format": "தேதி வடிவம்",
 "Time format": "நேர வடிவம்",
 "First day of the week": "வாரத்தின் முதல் நாள்",
 "First day of week": "வாரத்தின் முதல் நாள்",
 "Used in calendars and the scheduler.": "நாட்காட்டிகளிலும் அட்டவணையிலும் பயன்படும்.",
 "12-hour": "12 மணி",
 "24-hour": "24 மணி",
 "Mon": "திங்",
 "Sun": "ஞாயி",
 "Sat": "சனி",
 "Live preview": "நேரடி முன்னோட்டம்",
 "See your choices together as you make them.": "உங்கள் தேர்வுகளை உடனுக்குடன் ஒன்றாகப் பாருங்கள்.",
 "Theme": "தீம்",
 "Choose how Lernevo looks. Changes apply instantly.": "Lernevo எப்படித் தெரிய வேண்டும் எனத் தேர்வுசெய்யுங்கள். மாற்றங்கள் உடனே பொருந்தும்.",
 "Light": "ஒளி",
 "Dark": "இருள்",
 "System": "சிஸ்டம்",
 "Bright and clear": "பிரகாசமான, தெளிவான",
 "Easy on the eyes at night": "இரவில் கண்களுக்கு இதமானது",
 "Match your device setting": "உங்கள் சாதன அமைப்பைப் பின்பற்றும்",
 "Accent color": "அழுத்த நிறம்",
 "Used for the active menu item, buttons and switches.": "செயலில் உள்ள மெனு, பொத்தான்கள், ஸ்விட்ச்களுக்குப் பயன்படும்.",
 "Blue": "நீலம்",
 "Violet": "ஊதா",
 "Ocean": "கடல்",
 "Green": "பச்சை",
 "Orange": "ஆரஞ்சு",
 "Rose": "ரோஜா",
 "Display": "காட்சி",
 "Adjust size and spacing to what's comfortable for you.": "உங்களுக்கு வசதியான அளவு, இடைவெளியை அமைக்கவும்.",
 "Interface size": "இடைமுக அளவு",
 "Scales text and controls across the app.": "செயலி முழுவதும் எழுத்து, கட்டுப்பாடுகளின் அளவை மாற்றும்.",
 "Small": "சிறியது",
 "Default": "இயல்பு",
 "Large": "பெரியது",
 "Spacing": "இடைவெளி",
 "Compact fits more on screen.": "நெருக்கமான அமைப்பில் திரையில் அதிகம் தெரியும்.",
 "Comfortable": "வசதியானது",
 "Compact": "நெருக்கம்",
 "Reduce motion": "அசைவைக் குறை",
 "Turn off animations and transitions.": "அனிமேஷன்கள், மாற்றங்களை நிறுத்தும்.",
 "Reset appearance": "தோற்றத்தை மீட்டமை",
 "Appearance reset": "தோற்றம் மீட்டமைக்கப்பட்டது",
 "Notification channels": "அறிவிப்பு வழிகள்",
 "Choose where each kind of update should reach you.": "ஒவ்வொரு வகை அறிவிப்பும் எங்கே வர வேண்டும் எனத் தேர்வுசெய்யுங்கள்.",
 "Update": "அறிவிப்பு",
 "Email": "மின்னஞ்சல்",
 "In-app": "செயலியில்",
 "Push": "புஷ்",
 "Leave and permissions": "விடுப்பு & அனுமதிகள்",
 "Requests and decisions": "கோரிக்கைகளும் முடிவுகளும்",
 "Timesheets": "நேரத்தாள்கள்",
 "Reminders and approvals": "நினைவூட்டல்களும் ஒப்புதல்களும்",
 "Payslips": "சம்பளச் சீட்டுகள்",
 "When a new payslip is ready": "புதிய சம்பளச் சீட்டு தயாரானதும்",
 "Performance and goals": "செயல்திறன் & இலக்குகள்",
 "Review cycles and feedback": "மதிப்பாய்வு சுழற்சிகளும் கருத்துகளும்",
 "Announcements": "அறிவிப்புச் செய்திகள்",
 "News from your organization": "உங்கள் நிறுவனத்தின் செய்திகள்",
 "Quiet hours": "அமைதி நேரம்",
 "Pause push and in-app alerts while you're off.": "நீங்கள் ஓய்வில் இருக்கும்போது புஷ், செயலி அறிவிப்புகளை நிறுத்தும்.",
 "Turn on quiet hours": "அமைதி நேரத்தை இயக்கு",
 "Email still arrives; you'll see everything when quiet hours end.": "மின்னஞ்சல் தொடர்ந்து வரும்; அமைதி நேரம் முடிந்ததும் அனைத்தையும் காண்பீர்கள்.",
 "Quiet between": "இந்த நேரத்தில் அமைதி",
 "to": "வரை",
 "Email summary": "மின்னஞ்சல் சுருக்கம்",
 "Prefer fewer emails? Bundle them together.": "குறைவான மின்னஞ்சல்கள் வேண்டுமா? அவற்றை ஒன்றாக இணையுங்கள்.",
 "Send my emails": "என் மின்னஞ்சல்களை அனுப்பு",
 "Applies to every update that has Email turned on.": "மின்னஞ்சல் இயக்கப்பட்ட ஒவ்வொரு அறிவிப்புக்கும் பொருந்தும்.",
 "Instant": "உடனடியாக",
 "Daily": "தினமும்",
 "Weekly": "வாரந்தோறும்",
 "Two-factor authentication is on": "இரு-காரணி அங்கீகாரம் இயக்கப்பட்டுள்ளது",
 "Sign-in alerts are on": "உள்நுழைவு எச்சரிக்கைகள் இயக்கப்பட்டுள்ளன",
 "Auto sign-out within 30 minutes": "30 நிமிடங்களுக்குள் தானாக வெளியேறும்",
 "Turn on": "இயக்கு",
 "Set 30 min": "30 நிமிடம் அமை",
 "Strong": "வலிமையானது",
 "Good": "நன்று",
 "Needs attention": "கவனம் தேவை",
 "Your account is well protected.": "உங்கள் கணக்கு நன்கு பாதுகாக்கப்பட்டுள்ளது.",
 "One more step makes your account safer.": "இன்னும் ஒரு படி உங்கள் கணக்கை மேலும் பாதுகாப்பாக்கும்.",
 "Turn on a few protections to stay safe.": "பாதுகாப்பாக இருக்க சில பாதுகாப்புகளை இயக்குங்கள்.",
 "Based on {n} quick checks.": "{n} விரைவு சோதனைகளின் அடிப்படையில்.",
 "Two-factor authentication": "இரு-காரணி அங்கீகாரம்",
 "Ask for a code from your phone each time you sign in.": "ஒவ்வொரு முறை உள்நுழையும்போதும் தொலைபேசியிலிருந்து குறியீடு கேட்கும்.",
 "Sign-in alerts": "உள்நுழைவு எச்சரிக்கைகள்",
 "Email me when my account is used on a new device.": "புதிய சாதனத்தில் என் கணக்கு பயன்படுத்தப்பட்டால் மின்னஞ்சல் அனுப்பு.",
 "Sign out when inactive": "செயலற்று இருந்தால் வெளியேறு",
 "You'll be signed out after this much idle time.": "இவ்வளவு நேரம் செயலற்று இருந்தால் வெளியேற்றப்படுவீர்கள்.",
 "On": "இயக்கம்",
 "Off": "நிறுத்தம்",
 "15 minutes": "15 நிமிடங்கள்",
 "30 minutes": "30 நிமிடங்கள்",
 "1 hour": "1 மணி நேரம்",
 "4 hours": "4 மணி நேரம்",
 "Password": "கடவுச்சொல்",
 "A strong, unique password is your first line of defence.": "வலுவான, தனித்துவமான கடவுச்சொல்தான் உங்கள் முதல் பாதுகாப்பு.",
 "Account password": "கணக்கு கடவுச்சொல்",
 "Choose one you don't use anywhere else.": "வேறெங்கும் பயன்படுத்தாத ஒன்றைத் தேர்வுசெய்யுங்கள்.",
 "Change password": "கடவுச்சொல்லை மாற்று",
 "Current password": "தற்போதைய கடவுச்சொல்",
 "New password": "புதிய கடவுச்சொல்",
 "Confirm new password": "புதிய கடவுச்சொல்லை உறுதிசெய்",
 "At least 8 characters. Mix upper and lower case, numbers and symbols.": "குறைந்தது 8 எழுத்துகள். பெரிய, சிறிய எழுத்துகள், எண்கள், குறியீடுகளைக் கலக்கவும்.",
 "Cancel": "ரத்துசெய்",
 "Update password": "கடவுச்சொல்லைப் புதுப்பி",
 "Enter your current password.": "தற்போதைய கடவுச்சொல்லை உள்ளிடவும்.",
 "New password must be at least 8 characters.": "புதிய கடவுச்சொல் குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும்.",
 "New password and confirmation don't match.": "புதிய கடவுச்சொல்லும் உறுதிப்படுத்தலும் பொருந்தவில்லை.",
 "Too weak": "மிகவும் பலவீனம்",
 "Weak": "பலவீனம்",
 "Fair": "சராசரி",
 "Signed-in devices": "உள்நுழைந்த சாதனங்கள்",
 "Where your account is open right now.": "உங்கள் கணக்கு இப்போது எங்கே திறந்துள்ளது.",
 "This device": "இந்தச் சாதனம்",
 "Active now": "இப்போது செயலில்",
 "Sign out of other devices": "மற்ற சாதனங்களிலிருந்து வெளியேறு",
 "Signed out of other devices": "மற்ற சாதனங்களிலிருந்து வெளியேறினீர்கள்",
 "Password updated": "கடவுச்சொல் புதுப்பிக்கப்பட்டது",
 "Your data": "உங்கள் தரவு",
 "Take a copy of your preferences or clear them.": "உங்கள் விருப்பங்களின் நகலை எடுங்கள் அல்லது அழியுங்கள்.",
 "Export my settings": "என் அமைப்புகளை ஏற்றுமதி செய்",
 "Downloads your theme, region, notification and security choices as a JSON file.": "உங்கள் தீம், பிராந்தியம், அறிவிப்பு, பாதுகாப்பு தேர்வுகளை JSON கோப்பாகப் பதிவிறக்கும்.",
 "Download": "பதிவிறக்கு",
 "Reset all settings": "அனைத்து அமைப்புகளையும் மீட்டமை",
 "Puts every preference back to its default. This can't be undone.": "ஒவ்வொரு விருப்பத்தையும் இயல்புக்குத் திருப்பும். இதைத் திரும்பப் பெற முடியாது.",
 "Reset everything": "அனைத்தையும் மீட்டமை",
 "Click again to confirm": "உறுதிசெய்ய மீண்டும் கிளிக் செய்",
 "Where settings are kept": "அமைப்புகள் எங்கே சேமிக்கப்படுகின்றன",
 "So you know what happens to your choices.": "உங்கள் தேர்வுகளுக்கு என்ன நடக்கிறது என்பதை அறிய.",
 "Your preferences are stored on this device, so they stay put after a refresh but won't follow you to another browser yet.": "உங்கள் விருப்பங்கள் இந்தச் சாதனத்தில் சேமிக்கப்படுகின்றன; ரெஃப்ரெஷ் செய்தாலும் இருக்கும், ஆனால் இன்னும் வேறு உலாவிக்குத் தொடராது.",
 "Settings saved": "அமைப்புகள் சேமிக்கப்பட்டன",
 "All settings reset": "அனைத்து அமைப்புகளும் மீட்டமைக்கப்பட்டன",
 "Settings exported": "அமைப்புகள் ஏற்றுமதி செய்யப்பட்டன",
 "Couldn't export settings": "அமைப்புகளை ஏற்றுமதி செய்ய முடியவில்லை"
},
  Hindi: {
 "Appearance": "दिखावट",
 "Language & region": "भाषा और क्षेत्र",
 "Notifications": "सूचनाएँ",
 "Privacy & security": "गोपनीयता और सुरक्षा",
 "Data & storage": "डेटा और स्टोरेज",
 "Make Lernevo look like you": "Lernevo को अपने अंदाज़ में बनाएँ",
 "Language, time and dates": "भाषा, समय और तारीख़ें",
 "Stay informed, not interrupted": "जानकारी पाएँ, बाधा नहीं",
 "Keep your account safe": "अपना अकाउंट सुरक्षित रखें",
 "Your settings, your data": "आपकी सेटिंग, आपका डेटा",
 "Pick a theme, an accent color and how much fits on screen.": "थीम, एक्सेंट रंग और स्क्रीन पर कितना दिखे, यह चुनें।",
 "Show times and dates the way you read them.": "समय और तारीख़ अपनी पसंद के तरीके से देखें।",
 "Choose what reaches you, where, and when.": "क्या, कहाँ और कब आप तक पहुँचे, यह चुनें।",
 "Sign-in protection, your password and your devices.": "साइन-इन सुरक्षा, आपका पासवर्ड और आपके डिवाइस।",
 "Export your preferences or start fresh.": "अपनी पसंद एक्सपोर्ट करें या नए सिरे से शुरू करें।",
 "Saved automatically": "अपने आप सहेजा गया",
 "Unsaved changes": "बिना सहेजे बदलाव",
 "Up to date": "अप टू डेट",
 "You have unsaved changes": "आपके बदलाव सहेजे नहीं गए हैं",
 "Discard": "रद्द करें",
 "Save changes": "बदलाव सहेजें",
 "Search settings": "सेटिंग खोजें",
 "Live example": "लाइव उदाहरण",
 "Short date:": "संक्षिप्त तारीख़:",
 "Example:": "उदाहरण:",
 "No settings match": "कोई सेटिंग नहीं मिली",
 "Language": "भाषा",
 "Menus and labels switch as translations become available.": "अनुवाद उपलब्ध होते ही मेन्यू और लेबल बदल जाएँगे।",
 "Time zone": "समय क्षेत्र",
 "Used by the scheduler, timesheets and reminders.": "शेड्यूलर, टाइमशीट और रिमाइंडर में उपयोग होता है।",
 "Your time zone": "आपका समय क्षेत्र",
 "Dates and time": "तारीख़ और समय",
 "Pick the style you find easiest to read.": "वह शैली चुनें जो पढ़ने में आसान लगे।",
 "Date format": "तारीख़ का प्रारूप",
 "Time format": "समय का प्रारूप",
 "First day of the week": "सप्ताह का पहला दिन",
 "First day of week": "सप्ताह का पहला दिन",
 "Used in calendars and the scheduler.": "कैलेंडर और शेड्यूलर में उपयोग होता है।",
 "12-hour": "12 घंटे",
 "24-hour": "24 घंटे",
 "Mon": "सोम",
 "Sun": "रवि",
 "Sat": "शनि",
 "Live preview": "लाइव प्रीव्यू",
 "See your choices together as you make them.": "अपने चुनाव करते ही साथ में देखें।",
 "Theme": "थीम",
 "Choose how Lernevo looks. Changes apply instantly.": "चुनें कि Lernevo कैसा दिखे। बदलाव तुरंत लागू होते हैं।",
 "Light": "लाइट",
 "Dark": "डार्क",
 "System": "सिस्टम",
 "Bright and clear": "चमकदार और साफ़",
 "Easy on the eyes at night": "रात में आँखों के लिए आरामदायक",
 "Match your device setting": "आपके डिवाइस की सेटिंग के अनुसार",
 "Accent color": "एक्सेंट रंग",
 "Used for the active menu item, buttons and switches.": "सक्रिय मेन्यू, बटन और स्विच के लिए उपयोग होता है।",
 "Blue": "नीला",
 "Violet": "बैंगनी",
 "Ocean": "ओशन",
 "Green": "हरा",
 "Orange": "नारंगी",
 "Rose": "गुलाबी",
 "Display": "डिस्प्ले",
 "Adjust size and spacing to what's comfortable for you.": "आकार और स्पेसिंग अपनी सुविधा के अनुसार सेट करें।",
 "Interface size": "इंटरफ़ेस का आकार",
 "Scales text and controls across the app.": "पूरे ऐप में टेक्स्ट और कंट्रोल का आकार बदलता है।",
 "Small": "छोटा",
 "Default": "डिफ़ॉल्ट",
 "Large": "बड़ा",
 "Spacing": "स्पेसिंग",
 "Compact fits more on screen.": "कॉम्पैक्ट में स्क्रीन पर ज़्यादा दिखता है।",
 "Comfortable": "आरामदायक",
 "Compact": "कॉम्पैक्ट",
 "Reduce motion": "मोशन कम करें",
 "Turn off animations and transitions.": "एनिमेशन और ट्रांज़िशन बंद करें।",
 "Reset appearance": "दिखावट रीसेट करें",
 "Appearance reset": "दिखावट रीसेट हुई",
 "Notification channels": "सूचना चैनल",
 "Choose where each kind of update should reach you.": "हर तरह का अपडेट आप तक कहाँ पहुँचे, यह चुनें।",
 "Update": "अपडेट",
 "Email": "ईमेल",
 "In-app": "ऐप में",
 "Push": "पुश",
 "Leave and permissions": "छुट्टी और अनुमतियाँ",
 "Requests and decisions": "अनुरोध और फ़ैसले",
 "Timesheets": "टाइमशीट",
 "Reminders and approvals": "रिमाइंडर और स्वीकृतियाँ",
 "Payslips": "पे-स्लिप",
 "When a new payslip is ready": "नई पे-स्लिप तैयार होने पर",
 "Performance and goals": "प्रदर्शन और लक्ष्य",
 "Review cycles and feedback": "रिव्यू चक्र और फ़ीडबैक",
 "Announcements": "घोषणाएँ",
 "News from your organization": "आपके संगठन की खबरें",
 "Quiet hours": "शांत घंटे",
 "Pause push and in-app alerts while you're off.": "आपके ऑफ़ रहने पर पुश और ऐप अलर्ट रोकें।",
 "Turn on quiet hours": "शांत घंटे चालू करें",
 "Email still arrives; you'll see everything when quiet hours end.": "ईमेल फिर भी आएगा; शांत घंटे खत्म होने पर आपको सब दिखेगा।",
 "Quiet between": "इन घंटों में शांत",
 "to": "तक",
 "Email summary": "ईमेल सारांश",
 "Prefer fewer emails? Bundle them together.": "कम ईमेल चाहिए? उन्हें एक साथ जोड़ें।",
 "Send my emails": "मेरे ईमेल भेजें",
 "Applies to every update that has Email turned on.": "ईमेल चालू वाले हर अपडेट पर लागू होता है।",
 "Instant": "तुरंत",
 "Daily": "रोज़",
 "Weekly": "साप्ताहिक",
 "Two-factor authentication is on": "टू-फ़ैक्टर ऑथेंटिकेशन चालू है",
 "Sign-in alerts are on": "साइन-इन अलर्ट चालू हैं",
 "Auto sign-out within 30 minutes": "30 मिनट में अपने आप साइन-आउट",
 "Turn on": "चालू करें",
 "Set 30 min": "30 मिनट सेट करें",
 "Strong": "मज़बूत",
 "Good": "अच्छा",
 "Needs attention": "ध्यान दें",
 "Your account is well protected.": "आपका अकाउंट अच्छी तरह सुरक्षित है।",
 "One more step makes your account safer.": "एक और कदम आपके अकाउंट को और सुरक्षित बनाएगा।",
 "Turn on a few protections to stay safe.": "सुरक्षित रहने के लिए कुछ सुरक्षा चालू करें।",
 "Based on {n} quick checks.": "{n} त्वरित जाँचों पर आधारित।",
 "Two-factor authentication": "टू-फ़ैक्टर ऑथेंटिकेशन",
 "Ask for a code from your phone each time you sign in.": "हर साइन-इन पर आपके फ़ोन से कोड माँगे।",
 "Sign-in alerts": "साइन-इन अलर्ट",
 "Email me when my account is used on a new device.": "नए डिवाइस पर अकाउंट इस्तेमाल होने पर मुझे ईमेल करें।",
 "Sign out when inactive": "निष्क्रिय होने पर साइन-आउट",
 "You'll be signed out after this much idle time.": "इतने समय निष्क्रिय रहने पर आप साइन-आउट हो जाएँगे।",
 "On": "चालू",
 "Off": "बंद",
 "15 minutes": "15 मिनट",
 "30 minutes": "30 मिनट",
 "1 hour": "1 घंटा",
 "4 hours": "4 घंटे",
 "Password": "पासवर्ड",
 "A strong, unique password is your first line of defence.": "मज़बूत, अनोखा पासवर्ड आपकी सुरक्षा की पहली पंक्ति है।",
 "Account password": "अकाउंट पासवर्ड",
 "Choose one you don't use anywhere else.": "ऐसा चुनें जो कहीं और इस्तेमाल न करते हों।",
 "Change password": "पासवर्ड बदलें",
 "Current password": "वर्तमान पासवर्ड",
 "New password": "नया पासवर्ड",
 "Confirm new password": "नए पासवर्ड की पुष्टि करें",
 "At least 8 characters. Mix upper and lower case, numbers and symbols.": "कम से कम 8 अक्षर। अपर-लोअर केस, अंक और चिह्न मिलाएँ।",
 "Cancel": "रद्द करें",
 "Update password": "पासवर्ड अपडेट करें",
 "Enter your current password.": "वर्तमान पासवर्ड दर्ज करें।",
 "New password must be at least 8 characters.": "नया पासवर्ड कम से कम 8 अक्षर का होना चाहिए।",
 "New password and confirmation don't match.": "नया पासवर्ड और पुष्टि मेल नहीं खाते।",
 "Too weak": "बहुत कमज़ोर",
 "Weak": "कमज़ोर",
 "Fair": "ठीक-ठाक",
 "Signed-in devices": "साइन-इन किए डिवाइस",
 "Where your account is open right now.": "आपका अकाउंट अभी कहाँ खुला है।",
 "This device": "यह डिवाइस",
 "Active now": "अभी सक्रिय",
 "Sign out of other devices": "अन्य डिवाइस से साइन-आउट करें",
 "Signed out of other devices": "अन्य डिवाइस से साइन-आउट हुए",
 "Password updated": "पासवर्ड अपडेट हुआ",
 "Your data": "आपका डेटा",
 "Take a copy of your preferences or clear them.": "अपनी पसंद की कॉपी लें या उन्हें साफ़ करें।",
 "Export my settings": "मेरी सेटिंग एक्सपोर्ट करें",
 "Downloads your theme, region, notification and security choices as a JSON file.": "आपकी थीम, क्षेत्र, सूचना और सुरक्षा की पसंद JSON फ़ाइल के रूप में डाउनलोड होगी।",
 "Download": "डाउनलोड",
 "Reset all settings": "सभी सेटिंग रीसेट करें",
 "Puts every preference back to its default. This can't be undone.": "हर पसंद को डिफ़ॉल्ट पर लौटाता है। इसे वापस नहीं किया जा सकता।",
 "Reset everything": "सब रीसेट करें",
 "Click again to confirm": "पुष्टि के लिए फिर क्लिक करें",
 "Where settings are kept": "सेटिंग कहाँ रखी जाती हैं",
 "So you know what happens to your choices.": "ताकि आप जानें कि आपकी पसंद का क्या होता है।",
 "Your preferences are stored on this device, so they stay put after a refresh but won't follow you to another browser yet.": "आपकी पसंद इसी डिवाइस पर रखी जाती है, इसलिए रीफ़्रेश के बाद भी रहती है, पर अभी दूसरे ब्राउज़र में नहीं जाएगी।",
 "Settings saved": "सेटिंग सहेजी गईं",
 "All settings reset": "सभी सेटिंग रीसेट हुईं",
 "Settings exported": "सेटिंग एक्सपोर्ट हुईं",
 "Couldn't export settings": "सेटिंग एक्सपोर्ट नहीं हो सकीं"
},
};

export function translate(text, language) {
  const lang = language || loadSettings().region.language;
  const table = STRINGS[lang];
  return (table && table[text]) || text;
}

const LangContext = createContext("English");
function useT() {
  const lang = useContext(LangContext);
  return (text) => translate(text, lang);
}

export function applyRegion(region) {
  try {
    const root = document.documentElement;
    root.setAttribute("lang", LANG_CODES[region.language] || "en");
    root.setAttribute("data-lv-lang", region.language);
    window.dispatchEvent(new CustomEvent("lv-region-change", { detail: region }));
  } catch (err) {
    /* ignore */
  }
}

export function initRegion() {
  applyRegion(loadSettings().region);
}

export function useRegion() {
  const [region, setRegion] = useState(() => loadSettings().region);
  useEffect(() => {
    const handler = (e) => setRegion(e.detail);
    window.addEventListener("lv-region-change", handler);
    return () => window.removeEventListener("lv-region-change", handler);
  }, []);
  return region;
}

export function formatDate(date = new Date(), region = loadSettings().region) {
  return fmtDate(date, region.timezone, region.dateFormat);
}
export function formatTime(date = new Date(), region = loadSettings().region) {
  return fmtTime(date, region.timezone, region.timeFormat === "12h");
}

/* ==================================================================== */
/*  Building blocks                                                      */
/* ==================================================================== */
function Group({ title, desc, children }) {
  const t = useT();
  return (
    <section className="st-group">
      <div className="st-group-head">
        <h3 className="st-group-title">{t(title)}</h3>
        {desc && <p className="st-group-desc">{t(desc)}</p>}
      </div>
      <div className="st-group-body">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }) {
  const t = useT();
  return (
    <div className="st-row">
      <div className="st-row-text">
        <div className="st-row-label">{t(label)}</div>
        {hint && <div className="st-row-hint">{t(hint)}</div>}
      </div>
      <div className="st-row-control">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
      className="st-toggle" data-on={checked} onClick={() => onChange(!checked)}>
      <span className="st-toggle-knob"><Check /></span>
    </button>
  );
}

function Select({ value, onChange, options, label }) {
  const t = useT();
  return (
    <select className="st-input st-select" value={value} aria-label={label} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => {
        const val = typeof o === "string" ? o : o.value;
        const text = typeof o === "string" ? o : o.label;
        return <option key={val} value={val}>{t(text)}</option>;
      })}
    </select>
  );
}

function Segmented({ value, onChange, options, label }) {
  const t = useT();
  return (
    <div className="st-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.value)} type="button" role="radio" aria-checked={value === o.value}
          className="st-seg-btn" data-on={value === o.value} onClick={() => onChange(o.value)}>
          {t(o.label)}
        </button>
      ))}
    </div>
  );
}

function ChoiceGrid({ value, onChange, options, label, cols = 3 }) {
  return (
    <div className="st-choices" style={{ "--cols": cols }} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value}
          className="st-choice" data-on={value === o.value} onClick={() => onChange(o.value)}>
          <span className="st-choice-title">{o.title}</span>
          <span className="st-choice-sub">{o.sub}</span>
          <span className="st-choice-check" aria-hidden="true"><Check /></span>
        </button>
      ))}
    </div>
  );
}

function PasswordField({ value, onChange, label, name }) {
  const [show, setShow] = useState(false);
  return (
    <div className="st-pw-field">
      <input className="st-input" type={show ? "text" : "password"} name={name} autoComplete="new-password"
        data-lpignore="true" data-1p-ignore="true" aria-label={label}
        value={value} onChange={(e) => onChange(e.target.value)} />
      <button type="button" className="st-pw-eye" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((s) => !s)}>
        {show ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}

/* ==================================================================== */
/*  Panels                                                               */
/* ==================================================================== */
function MiniWindow({ mode }) {
  return (
    <span className="st-mini" data-mode={mode} aria-hidden="true">
      <span className="st-mini-side" />
      <span className="st-mini-main">
        <span className="st-mini-line st-mini-line--a" />
        <span className="st-mini-line st-mini-line--b" />
        <span className="st-mini-chip" />
      </span>
    </span>
  );
}

function ThemeCard({ id, label, desc, selected, onSelect }) {
  const t = useT();
  return (
    <button type="button" role="radio" aria-checked={selected} className="st-theme" data-selected={selected} onClick={() => onSelect(id)}>
      <span className="st-theme-preview">
        {id === "system" ? (<><MiniWindow mode="light" /><MiniWindow mode="dark" /></>) : (<MiniWindow mode={id} />)}
      </span>
      <span className="st-theme-info">
        <span className="st-theme-name">{t(label)}</span>
        <span className="st-theme-desc">{t(desc)}</span>
      </span>
      <span className="st-theme-check" aria-hidden="true"><Check /></span>
    </button>
  );
}

function LivePreview() {
  return (
    <div className="st-pv" aria-hidden="true">
      <div className="st-pv-side">
        <div className="st-pv-brand"><i /><b /></div>
        <div className="st-pv-item st-pv-item--on"><i /><b /></div>
        <div className="st-pv-item"><i /><b /></div>
        <div className="st-pv-item"><i /><b /></div>
        <div className="st-pv-item"><i /><b /></div>
      </div>
      <div className="st-pv-main">
        <div className="st-pv-top"><b /><span /></div>
        <div className="st-pv-stats">
          {[70, 45, 85].map((w, i) => (
            <div className="st-pv-stat" key={i}>
              <b />
              <div className="st-pv-bar"><i style={{ width: `${w}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="st-pv-actions">
          <span className="st-pv-btn">Primary action</span>
          <span className="st-pv-btn st-pv-btn--soft">Secondary</span>
        </div>
      </div>
    </div>
  );
}

function AppearancePanel({ value, onChange, onReset }) {
  const t = useT();
  return (
    <>
      <section className="st-stage">
        <div className="st-stage-head">
          <h3 className="st-group-title">{t("Live preview")}</h3>
          <p className="st-group-desc">{t("See your choices together as you make them.")}</p>
        </div>
        <div className="st-pv-wrap"><LivePreview /></div>
      </section>

      <Group title="Theme" desc="Choose how Lernevo looks. Changes apply instantly.">
        <div className="st-theme-grid" role="radiogroup" aria-label="Theme">
          <ThemeCard id="light" label="Light" desc="Bright and clear" selected={value.theme === "light"} onSelect={(t) => onChange({ theme: t })} />
          <ThemeCard id="dark" label="Dark" desc="Easy on the eyes at night" selected={value.theme === "dark"} onSelect={(t) => onChange({ theme: t })} />
          <ThemeCard id="system" label="System" desc="Match your device setting" selected={value.theme === "system"} onSelect={(t) => onChange({ theme: t })} />
        </div>
      </Group>

      <Group title="Accent color" desc="Used for the active menu item, buttons and switches.">
        <div className="st-swatches" role="radiogroup" aria-label="Accent color">
          {ACCENTS.map((c) => (
            <button key={c.value} type="button" role="radio" aria-checked={value.accent === c.value} aria-label={c.name}
              className="st-swatch" data-on={value.accent === c.value} style={{ "--sw": c.value }}
              onClick={() => onChange({ accent: c.value })}>
              <span className="st-swatch-dot"><Check /></span>
              <span className="st-swatch-name">{t(c.name)}</span>
            </button>
          ))}
        </div>
      </Group>

      <Group title="Display" desc="Adjust size and spacing to what's comfortable for you.">
        <Row label="Interface size" hint="Scales text and controls across the app.">
          <Segmented label="Interface size" value={value.scale} onChange={(v) => onChange({ scale: v })}
            options={[{ value: 90, label: "Small" }, { value: 100, label: "Default" }, { value: 110, label: "Large" }]} />
        </Row>
        <Row label="Spacing" hint="Compact fits more on screen.">
          <Segmented label="Spacing" value={value.density} onChange={(v) => onChange({ density: v })}
            options={[{ value: "comfortable", label: "Comfortable" }, { value: "compact", label: "Compact" }]} />
        </Row>
        <Row label="Reduce motion" hint="Turn off animations and transitions.">
          <Toggle label="Reduce motion" checked={value.reduceMotion} onChange={(v) => onChange({ reduceMotion: v })} />
        </Row>
        <div className="st-foot-row">
          <button type="button" className="st-btn st-btn-secondary st-btn-icon" onClick={onReset}>
            <RotateCcw /> {t("Reset appearance")}
          </button>
        </div>
      </Group>
    </>
  );
}

function RegionPanel({ data, set }) {
  const t = useT();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  const h12 = data.timeFormat === "12h";

  return (
    <>
      <div className="st-live">
        <div className="st-live-time">{fmtTime(now, data.timezone, h12)}</div>
        <div className="st-live-meta">
          <div className="st-live-date">{fmtLong(now, data.timezone, LANG_LOCALES[data.language] || "en-US")}</div>
          <div className="st-live-sub">{t("Short date:")} {fmtDate(now, data.timezone, data.dateFormat)}</div>
        </div>
        <span className="st-live-tag">{t("Live example")}</span>
      </div>

      <Group title="Language" desc="Menus and labels switch as translations become available.">
        <div className="st-pad">
          <ChoiceGrid label="Language" value={data.language} onChange={(v) => set("language", v)} options={LANGUAGES} />
          {data.language !== "English" && !STRINGS[data.language] && (
            <p className="st-lang-note">
              {data.language} menus aren't translated yet, so labels stay in English for now. Dates and the clock already follow {data.language}.
            </p>
          )}
        </div>
      </Group>

      <Group title="Time zone" desc="Used by the scheduler, timesheets and reminders.">
        <Row label="Your time zone">
          <Select label="Time zone" value={data.timezone} onChange={(v) => set("timezone", v)} options={TIMEZONES} />
        </Row>
      </Group>

      <Group title="Dates and time" desc="Pick the style you find easiest to read.">
        <div className="st-pad">
          <div className="st-sub-label">{t("Date format")}</div>
          <ChoiceGrid label="Date format" value={data.dateFormat} onChange={(v) => set("dateFormat", v)}
            options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map((f) => ({ value: f, title: fmtDate(now, data.timezone, f), sub: f }))} />
        </div>
        <Row label="Time format" hint={`${t("Example:")} ${fmtTime(now, data.timezone, h12)}`}>
          <Segmented label="Time format" value={data.timeFormat} onChange={(v) => set("timeFormat", v)}
            options={[{ value: "12h", label: "12-hour" }, { value: "24h", label: "24-hour" }]} />
        </Row>
        <Row label="First day of the week" hint="Used in calendars and the scheduler.">
          <Segmented label="First day of the week" value={data.weekStart} onChange={(v) => set("weekStart", v)}
            options={[{ value: "Monday", label: "Mon" }, { value: "Sunday", label: "Sun" }, { value: "Saturday", label: "Sat" }]} />
        </Row>
      </Group>
    </>
  );
}

function NotificationsPanel({ data, set }) {
  const t = useT();
  const toggleCell = (rid, cid) =>
    set("matrix", { ...data.matrix, [rid]: { ...data.matrix[rid], [cid]: !data.matrix[rid][cid] } });

  const toggleColumn = (cid) => {
    const allOn = NOTIF_ROWS.every((r) => data.matrix[r.id][cid]);
    const next = {};
    NOTIF_ROWS.forEach((r) => { next[r.id] = { ...data.matrix[r.id], [cid]: !allOn }; });
    set("matrix", next);
  };

  return (
    <>
      <Group title="Notification channels" desc="Choose where each kind of update should reach you.">
        <div className="st-matrix" role="table" aria-label="Notification channels">
          <div className="st-matrix-head" role="row">
            <span role="columnheader" className="st-matrix-corner">{t("Update")}</span>
            {CHANNELS.map((c) => {
              const Icon = c.icon;
              return (
                <button key={c.id} type="button" role="columnheader" className="st-matrix-col"
                  title={`Turn ${c.label} on or off for everything`} onClick={() => toggleColumn(c.id)}>
                  <Icon /> {t(c.label)}
                </button>
              );
            })}
          </div>
          {NOTIF_ROWS.map((r) => (
            <div className="st-matrix-row" role="row" key={r.id}>
              <div className="st-matrix-text" role="rowheader">
                <div className="st-row-label">{t(r.label)}</div>
                <div className="st-row-hint">{t(r.hint)}</div>
              </div>
              {CHANNELS.map((c) => (
                <div className="st-matrix-cell" role="cell" key={c.id}>
                  <button type="button" role="checkbox" aria-checked={data.matrix[r.id][c.id]}
                    aria-label={`${r.label} by ${c.label}`} className="st-check"
                    data-on={data.matrix[r.id][c.id]} onClick={() => toggleCell(r.id, c.id)}>
                    <Check />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Group>

      <Group title="Quiet hours" desc="Pause push and in-app alerts while you're off.">
        <Row label="Turn on quiet hours" hint="Email still arrives; you'll see everything when quiet hours end.">
          <Toggle label="Quiet hours" checked={data.quietOn} onChange={(v) => set("quietOn", v)} />
        </Row>
        {data.quietOn && (
          <Row label="Quiet between">
            <div className="st-inline">
              <input className="st-input" type="time" aria-label="Quiet hours start" value={data.quietFrom} onChange={(e) => set("quietFrom", e.target.value)} />
              <span className="st-inline-sep">{t("to")}</span>
              <input className="st-input" type="time" aria-label="Quiet hours end" value={data.quietTo} onChange={(e) => set("quietTo", e.target.value)} />
            </div>
          </Row>
        )}
      </Group>

      <Group title="Email summary" desc="Prefer fewer emails? Bundle them together.">
        <Row label="Send my emails" hint="Applies to every update that has Email turned on.">
          <Select label="Email summary" value={data.digest} onChange={(v) => set("digest", v)} options={["Instant", "Daily", "Weekly"]} />
        </Row>
      </Group>
    </>
  );
}

function SecurityScore({ data, set }) {
  const t = useT();
  const checks = [
    { id: "twoFactor", label: "Two-factor authentication is on", ok: data.twoFactor, action: "Turn on", run: () => set("twoFactor", true) },
    { id: "loginAlerts", label: "Sign-in alerts are on", ok: data.loginAlerts, action: "Turn on", run: () => set("loginAlerts", true) },
    { id: "timeout", label: "Auto sign-out within 30 minutes", ok: Number(data.sessionTimeout) <= 30, action: "Set 30 min", run: () => set("sessionTimeout", "30") },
  ];
  const done = checks.filter((c) => c.ok).length;
  const pct = Math.round((done / checks.length) * 100);
  const level =
    done === checks.length
      ? { label: "Strong", color: "#12946f", msg: "Your account is well protected." }
      : done === checks.length - 1
      ? { label: "Good", color: "#e8a317", msg: "One more step makes your account safer." }
      : { label: "Needs attention", color: "#e0445a", msg: "Turn on a few protections to stay safe." };
  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <div className="st-score" style={{ "--ring": level.color }}>
      <div className="st-ring" role="img" aria-label={`Security level ${level.label}, ${pct} percent`}>
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle className="st-ring-bg" cx="60" cy="60" r={R} />
          <circle className="st-ring-fg" cx="60" cy="60" r={R} strokeDasharray={`${(C * pct) / 100} ${C}`} />
        </svg>
        <div className="st-ring-text"><b>{pct}%</b><span>{t(level.label)}</span></div>
      </div>
      <div className="st-score-main">
        <h3 className="st-score-title">{t(level.msg)}</h3>
        <p className="st-score-sub">{t("Based on {n} quick checks.").replace("{n}", checks.length)}</p>
        <ul className="st-cl">
          {checks.map((c) => (
            <li key={c.id} className="st-cl-item" data-ok={c.ok}>
              <span className="st-cl-ic">{c.ok ? <Check /> : <ShieldAlert />}</span>
              <span className="st-cl-label">{t(c.label)}</span>
              {!c.ok && <button type="button" className="st-link-btn" onClick={c.run}>{t(c.action)}</button>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SecurityPanel({ data, set, notify }) {
  const t = useT();
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState(null);
  const strength = strengthOf(pw.next);

  const closePw = () => {
    setPwOpen(false);
    setPw({ current: "", next: "", confirm: "" });
    setPwMsg(null);
  };

  const updatePassword = () => {
    if (!pw.current) return setPwMsg({ type: "error", text: "Enter your current password." });
    if (pw.next.length < 8) return setPwMsg({ type: "error", text: "New password must be at least 8 characters." });
    if (pw.next !== pw.confirm) return setPwMsg({ type: "error", text: "New password and confirmation don't match." });
    // TODO: call your change-password API here
    closePw();
    notify("Password updated");
  };

  return (
    <>
      <SecurityScore data={data} set={set} />

      <div className="st-sec-grid">
        <div className="st-sec-card" data-on={data.twoFactor}>
          <span className="st-sec-icon"><Smartphone /></span>
          <div className="st-sec-title">{t("Two-factor authentication")}</div>
          <div className="st-sec-desc">{t("Ask for a code from your phone each time you sign in.")}</div>
          <div className="st-sec-control">
            <span className="st-sec-state" data-on={data.twoFactor}>{t(data.twoFactor ? "On" : "Off")}</span>
            <Toggle label="Two-factor authentication" checked={data.twoFactor} onChange={(v) => set("twoFactor", v)} />
          </div>
        </div>

        <div className="st-sec-card" data-on={data.loginAlerts}>
          <span className="st-sec-icon"><BellRing /></span>
          <div className="st-sec-title">{t("Sign-in alerts")}</div>
          <div className="st-sec-desc">{t("Email me when my account is used on a new device.")}</div>
          <div className="st-sec-control">
            <span className="st-sec-state" data-on={data.loginAlerts}>{t(data.loginAlerts ? "On" : "Off")}</span>
            <Toggle label="Sign-in alerts" checked={data.loginAlerts} onChange={(v) => set("loginAlerts", v)} />
          </div>
        </div>

        <div className="st-sec-card" data-on="true">
          <span className="st-sec-icon"><Timer /></span>
          <div className="st-sec-title">{t("Sign out when inactive")}</div>
          <div className="st-sec-desc">{t("You'll be signed out after this much idle time.")}</div>
          <div className="st-sec-control">
            <Select label="Sign out when inactive" value={data.sessionTimeout} onChange={(v) => set("sessionTimeout", v)}
              options={[
                { value: "15", label: "15 minutes" },
                { value: "30", label: "30 minutes" },
                { value: "60", label: "1 hour" },
                { value: "240", label: "4 hours" },
              ]} />
          </div>
        </div>
      </div>

      <Group title="Password" desc="A strong, unique password is your first line of defence.">
        {!pwOpen ? (
          <div className="st-device">
            <span className="st-device-icon"><KeyRound /></span>
            <div className="st-device-text">
              <div className="st-row-label">{t("Account password")}</div>
              <div className="st-row-hint">{t("Choose one you don't use anywhere else.")}</div>
            </div>
            <button type="button" className="st-btn st-btn-secondary" onClick={() => setPwOpen(true)}>{t("Change password")}</button>
          </div>
        ) : (
          <div className="st-pw-form">
            <div className="st-field">
              <span className="st-field-label">{t("Current password")}</span>
              <PasswordField name="lv-cp-current" label="Current password" value={pw.current} onChange={(v) => setPw({ ...pw, current: v })} />
            </div>
            <div className="st-field">
              <span className="st-field-label">{t("New password")}</span>
              <PasswordField name="lv-cp-new" label="New password" value={pw.next} onChange={(v) => setPw({ ...pw, next: v })} />
              {pw.next && (
                <div className="st-meter" data-score={strength.score} aria-live="polite">
                  <div className="st-meter-bars">{[1, 2, 3, 4].map((i) => <span key={i} data-filled={strength.score >= i} />)}</div>
                  <span className="st-meter-label">{t(strength.label)}</span>
                </div>
              )}
              <span className="st-field-hint">{t("At least 8 characters. Mix upper and lower case, numbers and symbols.")}</span>
            </div>
            <div className="st-field">
              <span className="st-field-label">{t("Confirm new password")}</span>
              <PasswordField name="lv-cp-confirm" label="Confirm new password" value={pw.confirm} onChange={(v) => setPw({ ...pw, confirm: v })} />
            </div>
            <div className="st-pw-actions2">
              {pwMsg && <span className="st-pw-msg" data-type={pwMsg.type} role="status">{t(pwMsg.text)}</span>}
              <button type="button" className="st-btn st-btn-secondary" onClick={closePw}>{t("Cancel")}</button>
              <button type="button" className="st-btn st-btn-primary" onClick={updatePassword}>{t("Update password")}</button>
            </div>
          </div>
        )}
      </Group>

      <Group title="Signed-in devices" desc="Where your account is open right now.">
        <div className="st-device">
          <span className="st-device-icon"><Monitor /></span>
          <div className="st-device-text">
            <div className="st-row-label">{deviceLabel()}</div>
            <div className="st-row-hint">{t("This device")}</div>
          </div>
          <span className="st-device-badge"><i /> {t("Active now")}</span>
        </div>
        <div className="st-foot-row">
          <button type="button" className="st-btn st-btn-secondary"
            onClick={() => notify("Signed out of other devices")} /* TODO: call your sign-out-all API */>
            {t("Sign out of other devices")}
          </button>
        </div>
      </Group>
    </>
  );
}

function DataPanel({ onExport, onResetAll }) {
  const t = useT();
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (!confirm) return;
    const t = setTimeout(() => setConfirm(false), 4000);
    return () => clearTimeout(t);
  }, [confirm]);

  return (
    <>
      <Group title="Your data" desc="Take a copy of your preferences or clear them.">
        <Row label="Export my settings" hint="Downloads your theme, region, notification and security choices as a JSON file.">
          <button type="button" className="st-btn st-btn-secondary st-btn-icon" onClick={onExport}>
            <Download /> {t("Download")}
          </button>
        </Row>
        <Row label="Reset all settings" hint="Puts every preference back to its default. This can't be undone.">
          <button type="button" className={`st-btn st-btn-icon ${confirm ? "st-btn-danger" : "st-btn-secondary"}`}
            onClick={() => { if (confirm) { onResetAll(); setConfirm(false); } else setConfirm(true); }}>
            <RotateCcw /> {t(confirm ? "Click again to confirm" : "Reset everything")}
          </button>
        </Row>
      </Group>

      <Group title="Where settings are kept" desc="So you know what happens to your choices.">
        <div className="st-note">
          {t("Your preferences are stored on this device, so they stay put after a refresh but won't follow you to another browser yet.")}
        </div>
      </Group>
    </>
  );
}

/* ==================================================================== */
/*  Page                                                                 */
/* ==================================================================== */
export default function Settings() {
  const [saved, setSaved] = useState(loadSettings);
  const [draft, setDraft] = useState(saved);
  const [appearance, setAppearance] = useState(loadAppearance);
  const [activeTab, setActiveTab] = useState("appearance");
  const [query, setQuery] = useState("");
  const [searchReady, setSearchReady] = useState(false);
  const [toast, setToast] = useState("");
  const t = (text) => translate(text, draft.region.language);

  useEffect(() => { applyAppearance(appearance); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { applyRegion(saved.region); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const changeAppearance = (patch) => {
    const next = { ...appearance, ...patch };
    setAppearance(next);
    applyAppearance(next);
    try { localStorage.setItem(APPEARANCE_KEY, JSON.stringify(next)); } catch (err) { /* ignore */ }
  };
  const resetAppearance = () => {
    setAppearance(APPEARANCE_DEFAULTS);
    applyAppearance(APPEARANCE_DEFAULTS);
    try { localStorage.setItem(APPEARANCE_KEY, JSON.stringify(APPEARANCE_DEFAULTS)); } catch (err) { /* ignore */ }
    setToast("Appearance reset");
  };

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const setField = (section) => (key, value) =>
    setDraft((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));

  const save = () => {
    const stamp = new Date().toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    persistSettings(draft, stamp);
    applyRegion(draft.region);
    setSaved(draft);
    setToast("Settings saved");
  };
  const discard = () => setDraft(saved);

  const resetAll = () => {
    setDraft(DEFAULTS);
    setSaved(DEFAULTS);
    persistSettings(DEFAULTS);
    applyRegion(DEFAULTS.region);
    setAppearance(APPEARANCE_DEFAULTS);
    applyAppearance(APPEARANCE_DEFAULTS);
    try { localStorage.setItem(APPEARANCE_KEY, JSON.stringify(APPEARANCE_DEFAULTS)); } catch (err) { /* ignore */ }
    setToast("All settings reset");
  };

  const exportData = () => {
    try {
      const payload = { exportedAt: new Date().toISOString(), settings: saved, appearance };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lernevo-settings.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setToast("Settings exported");
    } catch (err) {
      setToast("Couldn't export settings");
    }
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const current = TABS.find((t) => t.id === activeTab) || TABS[0];

  const q = query.trim().toLowerCase();
  const results = q
    ? SEARCH_INDEX.filter((i) => (i.label + " " + i.words).toLowerCase().includes(q)).slice(0, 7)
    : [];
  const goTo = (tab) => { setActiveTab(tab); setQuery(""); };

  const panels = {
    appearance: <AppearancePanel value={appearance} onChange={changeAppearance} onReset={resetAppearance} />,
    region: <RegionPanel data={draft.region} set={setField("region")} />,
    notifications: <NotificationsPanel data={draft.notifications} set={setField("notifications")} />,
    security: <SecurityPanel data={draft.security} set={setField("security")} notify={setToast} />,
    data: <DataPanel onExport={exportData} onResetAll={resetAll} />,
  };

  return (
    <LangContext.Provider value={draft.region.language}>
    <div className="st-page">
      <style>{`
        .st-page {
          --accent: var(--lv-accent, #2f6bff);
          --page-bg: #f2f5f8;
          --surface: #ffffff;
          --surface-soft: #f6f8fb;
          --ink: #12202e;
          --dim: #546478;
          --faint: #8794a6;
          --line: #e3e8ee;
          --field: #cfd8e3;
          --field-hover: #aab7c7;
          --input-bg: #ffffff;
          --hover: #eef2f6;
          --track: #cfd8e3;
          --seg-on: #ffffff;
          --shadow: 0 1px 2px rgba(18, 32, 46, 0.04);

          padding: 28px 0 120px;
          min-height: calc(100vh - 72px);
          background: transparent;
          color: var(--ink);
          font-family: inherit;
        }
        html[data-lv-theme="dark"] .st-page {
          --page-bg: #0b1220; --surface: #121b30; --surface-soft: #16213a; --ink: #e6ecfa; --dim: #a3b2d1;
          --faint: #7b8cb0; --line: rgba(140, 170, 255, 0.14); --field: #2a3858; --field-hover: #3a4b73;
          --input-bg: #0e1627; --hover: rgba(120, 160, 255, 0.1); --track: #33436a; --seg-on: #24325a; --shadow: none;
          background: var(--page-bg);
        }
        .st-page *, .st-page *::before, .st-page *::after { box-sizing: border-box; }
        .st-page svg { flex-shrink: 0; }
        .st-wrap { max-width: 1240px; margin: 0; }

        /* ---------- Header (title left, search + status right) ---------- */
        .st-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; flex-wrap: wrap; padding: 2px 0 20px; }
        .st-head-title { margin: 0; font-size: 28px; line-height: 1.15; font-weight: 700; letter-spacing: -0.02em; }
        .st-head-desc { margin: 7px 0 0; font-size: 15px; color: var(--dim); max-width: 60ch; }
        .st-head-tools { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .st-status { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 14px; border-radius: 999px; font-size: 13px; font-weight: 600; color: var(--dim); background: var(--surface); border: 1px solid var(--line); white-space: nowrap; }
        .st-status i { width: 7px; height: 7px; border-radius: 50%; background: #12946f; }
        .st-status[data-dirty="true"] { color: var(--ink); }
        .st-status[data-dirty="true"] i { background: #e8a317; }

        .st-search { position: relative; width: 280px; }
        .st-search > svg { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--faint); pointer-events: none; }
        .st-search input {
          width: 100%; height: 40px; padding: 0 14px 0 38px; border-radius: 10px; border: 1px solid var(--line);
          background: var(--surface); color: var(--ink); font: inherit; font-size: 14px;
        }
        .st-search input::placeholder { color: var(--faint); }
        .st-search input:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent); }
        .st-results { position: absolute; top: calc(100% + 6px); left: 0; right: 0; min-width: 260px; z-index: 30; display: flex; flex-direction: column; gap: 2px; padding: 6px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; box-shadow: 0 14px 34px rgba(18, 32, 46, 0.16); }
        .st-result { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; width: 100%; padding: 9px 12px; border: none; border-radius: 8px; background: none; font: inherit; text-align: left; cursor: pointer; color: var(--ink); }
        .st-result:hover { background: var(--hover); }
        .st-result:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 28%, transparent); }
        .st-result-label { font-size: 14px; font-weight: 600; }
        .st-result-tab { font-size: 12.5px; color: var(--dim); }
        .st-empty { padding: 14px 12px; font-size: 13.5px; color: var(--dim); }

        /* ---------- Tabs (replace the in-page sidebar) ---------- */
        .st-tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid var(--line); overflow-x: auto; overflow-y: hidden; }
        .st-tab { position: relative; display: flex; align-items: center; gap: 9px; padding: 12px 14px; border: none; border-radius: 8px 8px 0 0; background: none; font: inherit; font-size: 14.5px; font-weight: 600; color: var(--dim); cursor: pointer; white-space: nowrap; transition: background 0.12s ease, color 0.12s ease; }
        .st-tab svg { width: 17px; height: 17px; color: var(--tint); }
        .st-tab:hover { background: var(--hover); color: var(--ink); }
        .st-tab:focus-visible { outline: none; box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent); }
        .st-tab[aria-selected="true"] { color: var(--ink); }
        .st-tab[aria-selected="true"]::after { content: ""; position: absolute; left: 10px; right: 10px; bottom: 0; height: 3px; border-radius: 3px 3px 0 0; background: var(--accent); }
        .st-content { min-width: 0; }

        /* ---------- Sheet (all sections in one surface) ---------- */
        .st-sheet { overflow: hidden; background: var(--surface); border: 1px solid var(--line); border-radius: 16px; box-shadow: var(--shadow); }
        .st-sheet > * + * { border-top: 1px solid var(--line); }

        .st-group { display: grid; grid-template-columns: 230px minmax(0, 1fr); gap: 32px; padding: 28px 32px; }
        .st-group-head { padding: 0; }
        .st-group-title { margin: 0; font-size: 15px; font-weight: 650; }
        .st-group-desc { margin: 5px 0 0; font-size: 13px; line-height: 1.5; color: var(--dim); }
        .st-group-body { min-width: 0; padding: 0; }
        .st-pad { padding: 0 0 18px; }
        .st-pad:last-child { padding-bottom: 0; }
        .st-lang-note { margin: 12px 0 0; font-size: 13px; line-height: 1.5; color: var(--dim); }
        .st-sub-label { font-size: 13px; font-weight: 600; color: var(--dim); margin-bottom: 10px; }
        html[data-lv-density="compact"] .st-group { padding: 18px 32px; }

        .st-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 24px; align-items: center; padding: 15px 0; border-top: 1px solid var(--line); }
        .st-group-body > .st-row:first-child { border-top: 0; padding-top: 0; }
        .st-group-body > .st-row:last-child { padding-bottom: 0; }
        html[data-lv-density="compact"] .st-row { padding: 9px 0; }
        .st-row-label { font-size: 14.5px; font-weight: 600; }
        .st-row-hint { font-size: 13px; color: var(--dim); margin-top: 3px; line-height: 1.45; }
        .st-row-control { display: flex; justify-content: flex-end; min-width: 0; }
        .st-row-control > .st-input, .st-row-control > .st-inline { width: 280px; max-width: 100%; }
        .st-row-control .st-btn { min-width: 176px; justify-content: center; }
        .st-row-hint { max-width: 56ch; }
        .st-foot-row { display: flex; align-items: center; justify-content: flex-start; gap: 14px; padding: 16px 0 0; border-top: 1px solid var(--line); }

        .st-input {
          width: 100%; height: 40px; padding: 0 12px; border: 1px solid var(--field); border-radius: 9px; background: var(--input-bg);
          font: inherit; font-size: 14px; color: var(--ink); transition: border-color 0.12s ease, box-shadow 0.12s ease;
        }
        .st-input:hover { border-color: var(--field-hover); }
        .st-input:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent); }
        .st-select {
          appearance: none; -webkit-appearance: none; padding-right: 36px; cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238a9ac0' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center;
        }
        .st-inline { display: flex; align-items: center; gap: 10px; width: 100%; }
        .st-inline-sep { color: var(--dim); font-size: 13px; }

        /* Segmented */
        .st-seg { display: inline-flex; padding: 3px; gap: 2px; border-radius: 10px; background: var(--hover); }
        .st-seg-btn { height: 32px; padding: 0 14px; border: none; border-radius: 8px; background: none; color: var(--dim); font: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: background 0.12s ease, color 0.12s ease; }
        .st-seg-btn:hover { color: var(--ink); }
        .st-seg-btn[data-on="true"] { background: var(--seg-on); color: var(--ink); box-shadow: 0 1px 3px rgba(18, 32, 46, 0.16); }
        .st-seg-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent); }

        /* Toggle */
        .st-toggle { position: relative; width: 44px; height: 26px; padding: 0; border: none; border-radius: 999px; background: var(--track); cursor: pointer; flex-shrink: 0; transition: background 0.18s ease; }
        .st-toggle[data-on="true"] { background: var(--accent); }
        .st-toggle-knob { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(18, 32, 46, 0.3); display: flex; align-items: center; justify-content: center; transition: transform 0.18s ease; }
        .st-toggle-knob svg { width: 11px; height: 11px; color: var(--accent); opacity: 0; transition: opacity 0.15s ease; }
        .st-toggle[data-on="true"] .st-toggle-knob { transform: translateX(18px); }
        .st-toggle[data-on="true"] .st-toggle-knob svg { opacity: 1; }
        .st-toggle:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 32%, transparent); }

        /* Choice tiles (language, date format) */
        .st-choices { display: grid; grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr)); gap: 10px; }
        .st-choice {
          position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 12px 14px; text-align: left;
          border: 1px solid var(--line); border-radius: 12px; background: var(--surface); color: var(--ink); font: inherit; cursor: pointer;
          transition: border-color 0.12s ease, background 0.12s ease, box-shadow 0.12s ease;
        }
        .st-choice:hover { border-color: var(--field-hover); }
        .st-choice[data-on="true"] { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); background: color-mix(in srgb, var(--accent) 6%, var(--surface)); }
        .st-choice:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 32%, transparent); }
        .st-choice-title { font-size: 16px; font-weight: 650; }
        .st-choice-sub { font-size: 12.5px; color: var(--dim); }
        .st-choice-check { position: absolute; top: 10px; right: 10px; width: 18px; height: 18px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; opacity: 0; transform: scale(0.6); transition: opacity 0.15s ease, transform 0.15s ease; }
        .st-choice-check svg { width: 11px; height: 11px; }
        .st-choice[data-on="true"] .st-choice-check { opacity: 1; transform: scale(1); }

        /* Live clock */
        .st-live { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; padding: 28px 32px; position: relative; background: color-mix(in srgb, var(--accent) 6%, var(--surface-soft)); }
        .st-live-time { font-size: 44px; line-height: 1; font-weight: 700; letter-spacing: -0.03em; color: var(--accent); font-variant-numeric: tabular-nums; }
        .st-live-date { font-size: 16px; font-weight: 600; }
        .st-live-sub { font-size: 13px; color: var(--dim); margin-top: 3px; }
        .st-live-tag { margin-left: auto; padding: 4px 11px; border-radius: 999px; font-size: 12.5px; font-weight: 600; color: var(--dim); background: var(--surface); border: 1px solid var(--line); }

        /* Theme cards */
        .st-theme-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
        .st-theme { position: relative; display: flex; flex-direction: column; gap: 10px; padding: 8px 8px 12px; text-align: left; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); color: var(--ink); font: inherit; cursor: pointer; transition: border-color 0.12s ease, box-shadow 0.12s ease; }
        .st-theme:hover { border-color: var(--field-hover); }
        .st-theme[data-selected="true"] { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
        .st-theme:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent); }
        .st-theme-preview { display: flex; height: 100px; border-radius: 9px; overflow: hidden; border: 1px solid rgba(120, 140, 190, 0.22); }
        .st-theme-info { display: flex; flex-direction: column; gap: 1px; padding: 0 4px; }
        .st-theme-name { font-size: 14.5px; font-weight: 650; }
        .st-theme-desc { font-size: 12.5px; color: var(--dim); }
        .st-theme-check { position: absolute; top: 16px; right: 16px; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--accent); color: #fff; opacity: 0; transform: scale(0.6); transition: opacity 0.15s ease, transform 0.15s ease; }
        .st-theme-check svg { width: 13px; height: 13px; }
        .st-theme[data-selected="true"] .st-theme-check { opacity: 1; transform: scale(1); }
        .st-mini { flex: 1; display: flex; min-width: 0; }
        .st-mini[data-mode="light"] { --pv-bg: #f1f5ff; --pv-panel: #ffffff; --pv-line: #d9e2f5; }
        .st-mini[data-mode="dark"] { --pv-bg: #0b1220; --pv-panel: #1a2542; --pv-line: #33436a; }
        .st-mini { background: var(--pv-bg); }
        .st-mini-side { width: 26%; background: var(--pv-panel); border-right: 1px solid var(--pv-line); }
        .st-mini-main { flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 14px 12px; }
        .st-mini-line { display: block; height: 8px; border-radius: 4px; background: var(--pv-line); }
        .st-mini-line--a { width: 80%; }
        .st-mini-line--b { width: 55%; }
        .st-mini-chip { display: block; width: 34px; height: 14px; border-radius: 7px; background: var(--accent); margin-top: auto; }

        /* Live preview stage (the one expressive element on the page) */
        .st-stage { padding: 28px 32px 32px; background: color-mix(in srgb, var(--accent) 7%, var(--surface-soft)); }
        .st-stage-head { margin-bottom: 18px; }
        .st-pv-wrap { padding: 0; }
        .st-pv { display: flex; height: 230px; border-radius: 12px; overflow: hidden; border: 1px solid var(--line); background: var(--page-bg); box-shadow: 0 18px 40px rgba(18, 32, 46, 0.14); }
        .st-pv-side { width: 150px; padding: 14px 12px; display: flex; flex-direction: column; gap: 6px; background: var(--surface); border-right: 1px solid var(--line); }
        .st-pv-brand { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .st-pv-brand i { width: 22px; height: 22px; border-radius: 7px; background: var(--accent); }
        .st-pv-brand b { width: 50px; height: 8px; border-radius: 4px; background: var(--ink); opacity: 0.75; }
        .st-pv-item { display: flex; align-items: center; gap: 8px; padding: 8px 9px; border-radius: 9px; }
        .st-pv-item i { width: 13px; height: 13px; border-radius: 4px; background: var(--faint); opacity: 0.7; }
        .st-pv-item b { width: 56px; height: 7px; border-radius: 4px; background: var(--faint); opacity: 0.6; }
        .st-pv-item--on { background: var(--accent); }
        .st-pv-item--on i, .st-pv-item--on b { background: #fff; opacity: 0.95; }
        .st-pv-main { flex: 1; min-width: 0; padding: 14px 16px; display: flex; flex-direction: column; gap: 14px; }
        .st-pv-top { display: flex; align-items: center; justify-content: space-between; }
        .st-pv-top b { width: 90px; height: 10px; border-radius: 5px; background: var(--ink); opacity: 0.8; }
        .st-pv-top span { width: 24px; height: 24px; border-radius: 50%; background: var(--accent); opacity: 0.85; }
        .st-pv-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .st-pv-stat { padding: 12px; border-radius: 10px; background: var(--surface); border: 1px solid var(--line); display: flex; flex-direction: column; gap: 10px; }
        .st-pv-stat b { width: 40%; height: 9px; border-radius: 5px; background: var(--dim); opacity: 0.5; }
        .st-pv-bar { height: 7px; border-radius: 4px; background: var(--track); overflow: hidden; }
        .st-pv-bar i { display: block; height: 100%; background: var(--accent); border-radius: 4px; }
        .st-pv-actions { display: flex; gap: 10px; margin-top: auto; }
        .st-pv-btn { padding: 8px 14px; border-radius: 9px; font-size: 12.5px; font-weight: 600; background: var(--accent); color: #fff; }
        .st-pv-btn--soft { background: color-mix(in srgb, var(--accent) 14%, var(--surface)); color: var(--accent); }

        /* Accent swatches */
        .st-swatches { display: flex; flex-wrap: wrap; gap: 6px; margin: -8px 0 0 -8px; }
        .st-swatch { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 76px; padding: 10px 0 8px; border: none; border-radius: 12px; background: none; color: var(--dim); font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: background 0.12s ease; }
        .st-swatch:hover { background: var(--hover); }
        .st-swatch:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--sw) 40%, transparent); }
        .st-swatch-dot { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--sw); color: #fff; transition: box-shadow 0.12s ease; }
        .st-swatch-dot svg { width: 16px; height: 16px; opacity: 0; }
        .st-swatch[data-on="true"] { color: var(--ink); }
        .st-swatch[data-on="true"] .st-swatch-dot { box-shadow: 0 0 0 3px var(--surface), 0 0 0 5px var(--sw); }
        .st-swatch[data-on="true"] .st-swatch-dot svg { opacity: 1; }

        /* Notification matrix */
        .st-matrix { padding: 0; }
        .st-matrix-head, .st-matrix-row { display: grid; grid-template-columns: minmax(0, 1fr) repeat(3, 84px); align-items: center; }
        .st-matrix-head { padding-bottom: 10px; }
        .st-matrix-corner { font-size: 13px; font-weight: 600; color: var(--faint); }
        .st-matrix-col { display: flex; align-items: center; justify-content: center; gap: 6px; height: 32px; margin: 0 2px; border: none; border-radius: 8px; background: none; color: var(--dim); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
        .st-matrix-col:hover { background: var(--hover); color: var(--accent); }
        .st-matrix-col:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent); }
        .st-matrix-col svg { width: 15px; height: 15px; }
        .st-matrix-row { padding: 14px 0; border-top: 1px solid var(--line); }
        .st-matrix-row:last-child { padding-bottom: 0; }
        .st-matrix-cell { display: flex; justify-content: center; }
        .st-check { width: 24px; height: 24px; padding: 0; border-radius: 7px; border: 1.5px solid var(--field); background: var(--input-bg); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.12s ease, border-color 0.12s ease; }
        .st-check svg { width: 15px; height: 15px; opacity: 0; }
        .st-check:hover { border-color: var(--accent); }
        .st-check[data-on="true"] { background: var(--accent); border-color: var(--accent); }
        .st-check[data-on="true"] svg { opacity: 1; }
        .st-check:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 32%, transparent); }

        /* Password */
        .st-pw-field { position: relative; width: 100%; }
        .st-pw-field .st-input { padding-right: 44px; }
        .st-pw-eye { position: absolute; right: 3px; top: 3px; width: 34px; height: 34px; border: none; border-radius: 7px; background: none; color: var(--dim); cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .st-pw-eye:hover { background: var(--hover); color: var(--ink); }
        .st-pw-eye:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent); }
        .st-pw-eye svg { width: 17px; height: 17px; }
        .st-pw-stack { width: 100%; display: flex; flex-direction: column; gap: 9px; }
        .st-meter { display: flex; align-items: center; gap: 10px; }
        .st-meter-bars { display: flex; gap: 5px; flex: 1; }
        .st-meter-bars span { flex: 1; height: 5px; border-radius: 3px; background: var(--track); transition: background 0.15s ease; }
        .st-meter[data-score="1"] span[data-filled="true"] { background: #e0445a; }
        .st-meter[data-score="2"] span[data-filled="true"] { background: #f0a020; }
        .st-meter[data-score="3"] span[data-filled="true"] { background: #4fb36b; }
        .st-meter[data-score="4"] span[data-filled="true"] { background: #12946f; }
        .st-meter-label { font-size: 12.5px; font-weight: 600; color: var(--dim); min-width: 56px; text-align: right; }
        .st-pw-msg { font-size: 13px; font-weight: 500; }
        .st-pw-msg[data-type="error"] { color: #e0445a; }
        .st-pw-msg[data-type="ok"] { color: #12946f; }

        /* ---------- Security ---------- */
        .st-score { display: flex; align-items: center; gap: 32px; flex-wrap: wrap; padding: 28px 32px; }
        .st-ring { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
        .st-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
        .st-ring circle { fill: none; stroke-width: 10; }
        .st-ring-bg { stroke: var(--track); }
        .st-ring-fg { stroke: var(--ring); stroke-linecap: round; transition: stroke-dasharray 0.4s ease, stroke 0.2s ease; }
        .st-ring-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; }
        .st-ring-text b { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; }
        .st-ring-text span { font-size: 12px; font-weight: 650; color: var(--ring); }
        .st-score-main { flex: 1; min-width: 260px; }
        .st-score-title { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
        .st-score-sub { margin: 3px 0 14px; font-size: 13.5px; color: var(--dim); }
        .st-cl { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
        .st-cl-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 10px; background: var(--surface-soft); border: 1px solid var(--line); }
        .st-cl-ic { width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(224, 68, 90, 0.14); color: #e0445a; }
        .st-cl-item[data-ok="true"] .st-cl-ic { background: rgba(18, 148, 111, 0.16); color: #12946f; }
        .st-cl-ic svg { width: 13px; height: 13px; }
        .st-cl-label { flex: 1; font-size: 14px; font-weight: 500; }
        .st-link-btn { border: none; background: none; color: var(--accent); font: inherit; font-size: 13px; font-weight: 650; cursor: pointer; padding: 5px 10px; border-radius: 8px; }
        .st-link-btn:hover { background: var(--hover); }
        .st-link-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent); }

        .st-sec-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; padding: 28px 32px; }
        .st-sec-card { display: flex; flex-direction: column; gap: 6px; padding: 18px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); transition: border-color 0.15s ease; }
        .st-sec-card[data-on="true"] { border-color: color-mix(in srgb, var(--accent) 45%, var(--line)); }
        .st-sec-icon { width: 38px; height: 38px; border-radius: 10px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--accent) 11%, var(--surface)); color: var(--accent); }
        .st-sec-icon svg { width: 19px; height: 19px; }
        .st-sec-title { font-size: 15px; font-weight: 650; }
        .st-sec-desc { flex: 1; font-size: 13px; line-height: 1.45; color: var(--dim); }
        .st-sec-control { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line); }
        .st-sec-state { font-size: 13px; font-weight: 650; color: var(--faint); }
        .st-sec-state[data-on="true"] { color: var(--accent); }

        .st-pw-summary { display: flex; align-items: center; gap: 14px; }
        .st-pw-form { display: grid; gap: 18px; max-width: 460px; }
        .st-field { display: flex; flex-direction: column; gap: 7px; }
        .st-field-label { font-size: 13.5px; font-weight: 600; }
        .st-field-hint { font-size: 12.5px; color: var(--dim); }
        .st-pw-actions2 { display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-wrap: wrap; padding-top: 4px; }
        .st-pw-actions2 .st-pw-msg { margin-right: auto; }

        /* Device */
        .st-device { display: flex; align-items: center; gap: 14px; padding: 0 0 16px; }
        .st-device-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: var(--surface-soft); color: var(--accent); border: 1px solid var(--line); }
        .st-device-icon svg { width: 19px; height: 19px; }
        .st-device-text { flex: 1; min-width: 0; }
        .st-device-badge { display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 12px; border-radius: 999px; font-size: 12.5px; font-weight: 600; color: #12946f; background: rgba(18, 148, 111, 0.12); }
        .st-device-badge i { width: 7px; height: 7px; border-radius: 50%; background: #12946f; }
        .st-group-body > .st-device:only-child { padding-bottom: 0; }
        .st-note { font-size: 14px; line-height: 1.6; color: var(--dim); max-width: 62ch; }

        /* Buttons */
        .st-btn { height: 40px; padding: 0 18px; border-radius: 10px; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: background 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease; }
        .st-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 32%, transparent); }
        .st-btn-icon { display: inline-flex; align-items: center; gap: 8px; }
        .st-btn-icon svg { width: 16px; height: 16px; }
        .st-btn-primary { background: var(--accent); color: #fff; }
        .st-btn-primary:hover { filter: brightness(0.92); }
        .st-btn-secondary { background: var(--surface); color: var(--ink); border-color: var(--field); }
        .st-btn-secondary:hover { background: var(--hover); }
        .st-btn-danger { background: #e0445a; color: #fff; }
        .st-btn-danger:hover { filter: brightness(0.92); }
        .st-btn-ghost { background: transparent; color: #c9d4ee; }
        .st-btn-ghost:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }

        /* Floating save bar + toast */
        .st-savebar-wrap { position: sticky; bottom: 22px; display: flex; justify-content: center; pointer-events: none; z-index: 20; margin-top: 16px; }
        .st-savebar { pointer-events: auto; display: flex; align-items: center; gap: 12px; padding: 8px 8px 8px 18px; border-radius: 14px; background: #12202e; color: #fff; font-size: 14px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 16px 40px rgba(18, 32, 46, 0.3); animation: st-rise 0.22s ease; }
        .st-savebar .st-btn { height: 36px; }
        .st-savebar-dot { width: 8px; height: 8px; border-radius: 50%; background: #ffcf5c; }
        @keyframes st-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .st-toast { position: fixed; top: 84px; right: 30px; z-index: 60; display: flex; align-items: center; gap: 9px; padding: 11px 16px; border-radius: 12px; background: var(--surface, #fff); color: var(--ink, #12202e); font-size: 14px; font-weight: 600; border: 1px solid rgba(18, 148, 111, 0.35); box-shadow: 0 12px 30px rgba(18, 32, 46, 0.18); animation: st-rise 0.2s ease; }
        .st-toast svg { width: 17px; height: 17px; color: #12946f; }

        /* ---------- Responsive ---------- */
        @media (max-width: 1000px) {
          .st-group { grid-template-columns: 1fr; gap: 18px; }
        }
        @media (max-width: 760px) {
          .st-page { padding: 18px 0 120px; }
          .st-head-title { font-size: 24px; }
          .st-head-tools { width: 100%; }
          .st-search { flex: 1; width: auto; min-width: 0; }
          .st-group, .st-stage, .st-live, .st-score, .st-sec-grid { padding-left: 18px; padding-right: 18px; }
          .st-row { grid-template-columns: 1fr; gap: 10px; }
          .st-row-control { justify-content: flex-start; }
          .st-row-control > .st-input, .st-row-control > .st-inline { width: 100%; }
          .st-theme-grid { grid-template-columns: 1fr; }
          .st-choices { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .st-matrix-head, .st-matrix-row { grid-template-columns: minmax(0, 1fr) repeat(3, 56px); }
          .st-matrix-col { font-size: 0; gap: 0; margin: 0 2px; }
          .st-matrix-col svg { width: 17px; height: 17px; }
          .st-pv-side { width: 90px; }
          .st-pv-item b, .st-pv-brand b { display: none; }
          .st-live-time { font-size: 34px; }
          .st-toast { right: 14px; }
        }
      
`}</style>

      <div className="st-wrap">
        <header className="st-head">
          <div>
            <h1 className="st-head-title">{t(current.title)}</h1>
            <p className="st-head-desc">{t(current.desc)}</p>
          </div>
          <div className="st-head-tools">
            <div className="st-search">
              <Search />
              <input type="text" name="lv-settings-filter" autoComplete="off" spellCheck={false}
                data-lpignore="true" data-1p-ignore="true" readOnly={!searchReady}
                onFocus={() => setSearchReady(true)}
                placeholder={t("Search settings")} aria-label="Search settings"
                value={query} onChange={(e) => setQuery(e.target.value)} />
              {q && (
                <div className="st-results" role="listbox" aria-label="Search results">
                  {results.length === 0 && <div className="st-empty">{t("No settings match")} "{query}".</div>}
                  {results.map((r) => (
                    <button key={r.label} type="button" className="st-result" onClick={() => goTo(r.tab)}>
                      <span className="st-result-label">{t(r.label)}</span>
                      <span className="st-result-tab">{t(TABS.find((x) => x.id === r.tab).label)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="st-status" data-dirty={current.id !== "appearance" && dirty} role="status">
              <i />
              {t(current.id === "appearance"
                ? "Saved automatically"
                : dirty ? "Unsaved changes" : "Up to date")}
            </span>
          </div>
        </header>

        <nav className="st-tabs" role="tablist" aria-label="Settings sections">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} role="tab" className="st-tab" aria-selected={current.id === tab.id}
                onClick={() => setActiveTab(tab.id)} style={{ "--tint": tab.tint }}>
                <Icon />
                <span>{t(tab.label)}</span>
              </button>
            );
          })}
        </nav>

        <div className="st-content" role="tabpanel" aria-label={current.label}>
          <div className="st-sheet">{panels[current.id]}</div>

          {dirty && (
            <div className="st-savebar-wrap">
              <div className="st-savebar" role="region" aria-label="Unsaved changes">
                <span className="st-savebar-dot" />
                <span>{t("You have unsaved changes")}</span>
                <button type="button" className="st-btn st-btn-ghost" onClick={discard}>{t("Discard")}</button>
                <button type="button" className="st-btn st-btn-primary" onClick={save}>{t("Save changes")}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="st-toast" role="status">
          <Check />
          {t(toast)}
        </div>
      )}
    </div>
    </LangContext.Provider>
  );
}