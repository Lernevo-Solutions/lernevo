import React from 'react';

// ─── Templates that support "+ Add Page" ─────────────────────────────────────
const MULTI_PAGE_OK = new Set([
  'classic-minimal',
  'clean-centered',
  'bold-two-col',
  'minimalist-top',
  'minimalist-pro',
  'photo-ats',
  'graphic-split',
]);

// ─── Reusable blank-page primitives ──────────────────────────────────────────

const GhostLines = ({ count = 4, indent = 0 }) => (
  <div style={{ paddingLeft: indent }}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        style={{
          height: 1,
          background: i === 0 ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.035)',
          marginTop: i === 0 ? 0 : 9,
          width: `${90 - (i % 3) * 12}%`,
          borderRadius: 1,
        }}
      />
    ))}
  </div>
);

const GhostSection = ({ children, borderColor = 'rgba(0,0,0,0.08)', style = {} }) => (
  <div
    style={{
      fontSize: 9,
      fontWeight: 700,
      color: 'rgba(0,0,0,0.13)',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderBottom: `1.5px solid ${borderColor}`,
      paddingBottom: 3,
      marginBottom: 10,
      ...style,
    }}
  >
    {children}
  </div>
);

const ContinuePrompt = ({ style = {} }) => (
  <div
    style={{
      marginTop: 22,
      padding: '10px 14px',
      border: '1.5px dashed rgba(0,0,0,0.09)',
      borderRadius: 6,
      textAlign: 'center',
      ...style,
    }}
  >
    <p style={{ fontSize: 8.5, color: 'rgba(0,0,0,0.18)', margin: 0, fontStyle: 'italic' }}>
      Continue your resume content here
    </p>
  </div>
);

// ─── Continuation-page slim header (per template) ────────────────────────────
function ContinuationHeader({ structure, personal, accentColor, font }) {
  const col = accentColor || '#2563eb';
  const name = personal.name || 'Your Name';
  const title = personal.title || '';
  const fs = { fontFamily: `'${font}',sans-serif` };

  switch (structure) {
    case 'classic-minimal':
      return (
        <div style={{ ...fs, borderBottom: `2px solid ${col}`, padding: '10px 22px 6px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#111', textTransform: 'uppercase', letterSpacing: 0.5 }}>{name}</span>
          <span style={{ fontSize: 8, color: '#555' }}>{personal.email}</span>
        </div>
      );
    case 'clean-centered':
      return (
        <div style={{ ...fs, textAlign: 'center', borderBottom: '1px solid #ddd', padding: '8px 22px 6px', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{name}</span>
          {title && <span style={{ fontSize: 9, color: '#555', marginLeft: 8, fontStyle: 'italic' }}>{title}</span>}
        </div>
      );
    case 'bold-two-col':
      return (
        <div style={{ ...fs, textAlign: 'center', padding: '10px 28px 6px', marginBottom: 10, borderBottom: '1.5px solid #333' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{name}</span>
        </div>
      );
    case 'minimalist-top':
      return (
        <div style={{ ...fs, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 24px 5px', borderBottom: '1.5px solid #111', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#111' }}>{name}</span>
          {title && <span style={{ fontSize: 9, fontStyle: 'italic', color: '#444' }}>{title}</span>}
        </div>
      );
    case 'minimalist-pro':
      return (
        <div style={{ ...fs }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px 4px' }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#111' }}>{name}</span>
            {title && <span style={{ fontSize: 9, color: '#555', fontStyle: 'italic' }}>— {title}</span>}
          </div>
          <div style={{ height: 2, background: col, marginBottom: 0 }} />
        </div>
      );
    case 'photo-ats':
      return (
        <div style={{ ...fs, padding: '8px 22px 6px', marginBottom: 8 }}>
          <div style={{ background: '#f1f5f9', padding: '4px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#111' }}>{name}</span>
            {title && <span style={{ fontSize: 9, color: '#555' }}>{title}</span>}
          </div>
        </div>
      );
    case 'graphic-split':
      return (
        <div style={{ ...fs, padding: '8px 18px 0', marginBottom: 8 }}>
          <div style={{ borderTop: '1.5px solid #333', borderBottom: '1.5px solid #333', padding: '4px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: '#111' }}>{name}</span>
            {personal.phone && <span style={{ fontSize: 8, color: '#333' }}>📞 {personal.phone}</span>}
          </div>
        </div>
      );
    default:
      return (
        <div style={{ ...fs, borderBottom: `1px solid ${col}`, padding: '8px 18px 5px', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>{name}</span>
        </div>
      );
  }
}

// ─── Template-aware blank body for continuation pages ─────────────────────────
function BlankBody({ structure, accentColor, font }) {
  const col = accentColor || '#2563eb';
  const colFaded = col + '22';
  const fs = { fontFamily: `'${font}',sans-serif` };

  switch (structure) {
    case 'classic-minimal':
      return (
        <div style={{ ...fs, padding: '0 22px 18px', flex: 1 }}>
          {['Professional Experience', 'Education', 'Technical Skills'].map((label) => (
            <div key={label} style={{ marginBottom: 20 }}>
              <GhostSection borderColor={colFaded}>{label}</GhostSection>
              <GhostLines count={label === 'Professional Experience' ? 5 : 3} />
            </div>
          ))}
          <ContinuePrompt />
        </div>
      );
    case 'clean-centered':
      return (
        <div style={{ ...fs, padding: '0 26px 18px', flex: 1 }}>
          {['Professional Experience', 'Education', 'Skills', 'Languages'].map((label) => (
            <div key={label} style={{ marginBottom: 20 }}>
              <GhostSection borderColor="rgba(0,0,0,0.08)" style={{ fontWeight: 800 }}>{label}</GhostSection>
              <GhostLines count={label === 'Professional Experience' ? 5 : 3} />
            </div>
          ))}
          <ContinuePrompt />
        </div>
      );
    case 'bold-two-col':
      return (
        <div style={{ ...fs, padding: '0 28px 18px', flex: 1 }}>
          {['Work Experience', 'Education', 'Technical Expertise'].map((label) => (
            <div key={label} style={{ marginBottom: 22 }}>
              <div style={{ borderBottom: '1.5px solid rgba(0,0,0,0.08)', paddingBottom: 2, marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: 'rgba(0,0,0,0.13)', textTransform: 'uppercase' }}>{label}</span>
              </div>
              <GhostLines count={label === 'Work Experience' ? 6 : 3} />
            </div>
          ))}
          <ContinuePrompt />
        </div>
      );
    case 'minimalist-top':
      return (
        <div style={{ ...fs, padding: '0 24px 18px', flex: 1 }}>
          {['Work Experience', 'Education', 'Skills', 'Certifications'].map((label) => (
            <div key={label} style={{ marginBottom: 18 }}>
              <GhostSection borderColor="rgba(0,0,0,0.08)" style={{ fontWeight: 800, fontSize: 9.5 }}>{label}</GhostSection>
              <GhostLines count={label === 'Work Experience' ? 5 : 3} />
            </div>
          ))}
          <ContinuePrompt />
        </div>
      );
    case 'minimalist-pro':
      return (
        <div style={{ ...fs, display: 'grid', gridTemplateColumns: '180px 1fr', flex: 1, minHeight: 500 }}>
          <div style={{ padding: '12px 14px', borderRight: `2px solid ${col}20` }}>
            {['Education', 'Skills', 'Languages'].map((label) => (
              <div key={label} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: colFaded, textTransform: 'uppercase', marginBottom: 8 }}>
                  {label === 'Education' && '🎓 '}
                  {label === 'Skills' && '⚙ '}
                  {label === 'Languages' && '🌐 '}
                  <span style={{ color: 'rgba(0,0,0,0.12)' }}>{label}</span>
                </div>
                <GhostLines count={3} />
              </div>
            ))}
            <ContinuePrompt style={{ marginTop: 14 }} />
          </div>
          <div style={{ padding: '12px 16px' }}>
            {['Work Experience', 'Projects'].map((label) => (
              <div key={label} style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(0,0,0,0.12)', textTransform: 'uppercase', marginBottom: 8, borderBottom: `1.5px solid ${col}18`, paddingBottom: 3 }}>
                  {label === 'Work Experience' ? '💼 ' : '🚀 '}{label}
                </div>
                <GhostLines count={label === 'Work Experience' ? 7 : 4} />
              </div>
            ))}
            <ContinuePrompt />
          </div>
        </div>
      );
    case 'photo-ats':
      return (
        <div style={{ ...fs, padding: '0 22px 18px', flex: 1 }}>
          {['Work Experience', 'Education', 'Skills', 'Languages'].map((label) => (
            <div key={label} style={{ marginBottom: 18 }}>
              <div style={{ background: 'rgba(241,245,249,0.5)', padding: '4px 10px', marginBottom: 8, textAlign: 'center' }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(0,0,0,0.12)', textTransform: 'uppercase' }}>{label}</span>
              </div>
              <GhostLines count={label === 'Work Experience' ? 5 : 3} />
            </div>
          ))}
          <ContinuePrompt />
        </div>
      );
    case 'graphic-split':
      return (
        <div style={{ ...fs, padding: '0 18px 14px', flex: 1 }}>
          {['Professional Experience', 'Education', 'Certificate'].map((label) => (
            <div key={label} style={{ marginBottom: 20 }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: 'rgba(0,0,0,0.12)' }}>
                  {label === 'Professional Experience' && '💼 '}
                  {label === 'Education' && '🎓 '}
                  {label === 'Certificate' && '✦ '}
                  {label}
                </span>
              </div>
              <div style={{ height: 3, background: 'rgba(229,231,235,0.45)', marginBottom: 8 }} />
              <GhostLines count={label === 'Professional Experience' ? 6 : 3} />
            </div>
          ))}
          <ContinuePrompt />
        </div>
      );
    default:
      return (
        <div style={{ ...fs, padding: '0 22px 18px', flex: 1 }}>
          <GhostLines count={18} />
          <ContinuePrompt />
        </div>
      );
  }
}

// ─── Page footer ─────────────────────────────────────────────────────────────
function PageFooter({ cur, total, font }) {
  return (
    <div style={{ textAlign: 'center', padding: '6px 0 8px', fontSize: 8, color: 'rgba(0,0,0,0.28)', letterSpacing: 0.3, fontFamily: `'${font}',sans-serif` }}>
      Page {cur} of {total}
    </div>
  );
}

// ─── PageBreakDivider ─────────────────────────────────────────────────────────
function PageBreakDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: 22, background: 'transparent' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.10)', marginLeft: 8 }} />
      <span style={{ fontSize: 9, color: 'rgba(0,0,0,0.25)', padding: '0 10px', letterSpacing: 0.3, fontStyle: 'italic' }}>
        page break
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.10)', marginRight: 8 }} />
    </div>
  );
}

// ─── DATA NORMALISER ─────────────────────────────────────────────────────────
// Converts the new education {ug:[], school:[]} format into a flat object
// that all template renderers can use without any changes to their JSX.
function normaliseData(data) {
  const raw = data || {};

  // ── Education ──────────────────────────────────────────────────────────────
  // New format: { ug: [{college, degree, branch, graduatedYear, gpa, highlights}], school: [...] }
  // Old/flat format: { degree, college, year, gpa }
  let edu = { degree: '', college: '', year: '', gpa: '', highlights: '', items: [] };

  if (raw.education) {
    const e = raw.education;
    const ugItems = Array.isArray(e.ug)
      ? e.ug
          .filter((item) => item?.degree || item?.college || item?.highlights)
          .map((item) => ({
            id: item.id,
            title: [item.degree, item.branch].filter(Boolean).join(' — '),
            subtitle: item.college || '',
            meta: [item.graduatedYear, item.gpa ? `GPA: ${item.gpa}` : ''].filter(Boolean).join(' | '),
            highlights: item.highlights || '',
          }))
      : [];

    const schoolItems = Array.isArray(e.school)
      ? e.school
          .filter((item) => item?.schoolName || item?.highlights)
          .map((item) => ({
            id: item.id,
            title: item.schoolName || '',
            subtitle: [item.board, item.stream].filter(Boolean).join(' • '),
            meta: [item.passingYear, item.percentage ? `Score: ${item.percentage}` : ''].filter(Boolean).join(' | '),
            highlights: item.highlights || '',
          }))
      : [];

    edu.items = [...ugItems, ...schoolItems];

    if (edu.items.length > 0) {
      const first = edu.items[0];
      edu.degree = first.title || '';
      edu.college = first.subtitle || '';
      edu.year = first.meta || '';
      edu.highlights = first.highlights || '';
    } else if (e.degree || e.college) {
      // Old flat format (backwards compat)
      edu = {
        ...edu,
        ...e,
        items: [
          {
            id: 'legacy-education',
            title: e.degree || '',
            subtitle: e.college || '',
            meta: [e.year, e.gpa ? `GPA: ${e.gpa}` : ''].filter(Boolean).join(' | '),
            highlights: e.highlights || '',
          },
        ],
      };
    }
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  // New format: [{ id, name, level:number, badge:string }]
  // Old format: [{ id, name, level:string }]  e.g. level = "Advanced"
  const BADGE_LEVEL_MAP = {
    Beginner: 1, Elementary: 2, Intermediate: 3, Advanced: 4, Expert: 5,
  };
  const rawSkills = Array.isArray(raw.skills) ? raw.skills : [];
  const skills = rawSkills.map(s => {
    const lvlNum = typeof s.level === 'number' ? s.level
      : typeof s.level === 'string' ? (BADGE_LEVEL_MAP[s.level] || 3) : 3;
    const badge  = s.badge || (
      lvlNum <= 1 ? 'Beginner' :
      lvlNum === 2 ? 'Elementary' :
      lvlNum === 3 ? 'Intermediate' :
      lvlNum === 4 ? 'Advanced' : 'Expert'
    );
    return { ...s, level: badge, levelNum: lvlNum, badge };
  });

  // ── Projects ──────────────────────────────────────────────────────────────
  // New format: [{ id, name, tech, keywords, date, description }]
  // Old format: [{ id, name, stack, description }]
  const rawProjects = Array.isArray(raw.projects) ? raw.projects : [];
  const projects = rawProjects.map(p => ({
    ...p,
    stack: p.stack || p.tech || '',   // normalise to 'stack' for templates
  }));

  // ── Certifications ────────────────────────────────────────────────────────
  const certifications = Array.isArray(raw.certifications)
    ? raw.certifications.map((cert) => ({
        ...cert,
        description: cert.description || cert.highlights || cert.keyHighlights || '',
      }))
    : [];

  // ── Languages ────────────────────────────────────────────────────────────
  // New format: [{ id, language, proficiency, stars }]
  const languages = Array.isArray(raw.languages) ? raw.languages : [];

  // ── Experience ────────────────────────────────────────────────────────────
  const experience = Array.isArray(raw.experience) ? raw.experience : [];

  // ── Personal ─────────────────────────────────────────────────────────────
  const personal = raw.personal || {};

  // ── Summary ───────────────────────────────────────────────────────────────
  const summary = raw.summary || { text: '' };

  return { personal, summary, experience, education: edu, skills, projects, certifications, languages };
}

// ─── GalleryPreview ───────────────────────────────────────────────────────────
function escapeHtml(text = '') {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function stripHtml(html = '') {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|p|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+\n/g, '\n')
    .trim();
}

function plainTextToHtml(text = '') {
  if (!text) return '';
  return text.split(/\r?\n/).map((line) => escapeHtml(line) || '<br>').join('<br>');
}

function sanitizeRichText(html = '') {
  if (!html) return '';
  const normalized = /<[a-z][\s\S]*>/i.test(html) ? html : plainTextToHtml(html);
  return normalized
    .replace(/<(?!\/?(strong|b|em|i|u|br|p|div)\b)[^>]*>/gi, '')
    .replace(/ on\w+="[^"]*"/gi, '')
    .replace(/ on\w+='[^']*'/gi, '');
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function chunkText(text = '', wordsPerChunk = 70) {
  const words = stripHtml(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const chunks = [];
  for (let index = 0; index < words.length; index += wordsPerChunk) {
    chunks.push(words.slice(index, index + wordsPerChunk).join(' '));
  }
  return chunks;
}

export default function GalleryPreview({
  tpl,
  data,
  accentColor,
  font,
  skillsDisplayMode = 'level',
  skillsRatingStyle = 'stars',
  languagesDisplayMode = 'level',
  languagesRatingStyle = 'stars',
  extraPages = 0,
}) {
  // Normalise incoming data so all template renderers get a consistent shape
  const { personal, summary, experience, education, skills, projects, certifications, languages } = normaliseData(data);

  const col = accentColor || '#2563eb';
  const name  = personal.name  || 'Your Name';
  const title = personal.title || 'Your Professional Title';
  const photo = personal.photo;
  const fontStyle = { fontFamily: `'${font}', sans-serif` };
  const skillMode = skillsDisplayMode === 'rating' ? 'rating' : 'level';
  const skillRating = ['stars', 'dots', 'bars', 'blocks'].includes(skillsRatingStyle)
    ? skillsRatingStyle
    : 'stars';
  const languageMode = languagesDisplayMode === 'rating' ? 'rating' : 'level';
  const languageRating = ['stars', 'dots', 'bars', 'blocks'].includes(languagesRatingStyle)
    ? languagesRatingStyle
    : 'stars';

  // Only show extra pages for supported templates
  const supportsExtra   = MULTI_PAGE_OK.has(tpl.structure);
  const validExtraPages = supportsExtra ? extraPages : 0;
  const totalPages      = 1 + validExtraPages;

  // ── Shared helpers ──────────────────────────────────────────────────────────
  const PhotoCircle = ({ size = 64, style = {} }) =>
    photo ? (
      <img src={photo} alt="profile" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'block', ...style }} />
    ) : (
      <div style={{ width: size, height: size, borderRadius: '50%', background: col + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', color: col, fontWeight: 800, fontSize: size * 0.36, flexShrink: 0, ...style }}>
        {name[0]?.toUpperCase()}
      </div>
    );

  const PhotoRect = ({ w = 90, h = 100, style = {} }) =>
    photo ? (
      <img src={photo} alt="profile" style={{ width: w, height: h, objectFit: 'cover', flexShrink: 0, ...style }} />
    ) : (
      <div style={{ width: w, height: h, background: col + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: col, fontWeight: 800, fontSize: 22, flexShrink: 0, ...style }}>
        {name[0]?.toUpperCase()}
      </div>
    );

  const LevelDots = ({ filled, total = 5, dotCol = col, emptyCol = '#e2e8f0', size = 7 }) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ width: size, height: size, borderRadius: '50%', background: i < filled ? dotCol : emptyCol }} />
      ))}
    </div>
  );

  // Mini star display for skills
  const MiniStars = ({ levelNum }) => (
    <span style={{ fontSize: 8, letterSpacing: 1 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= levelNum ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </span>
  );

  // Badge colour map for skills
  const BADGE_COLORS = {
    Beginner: '#16a34a', Elementary: '#0284c7', Intermediate: '#7c3aed',
    Advanced: '#d97706', Expert: '#dc2626',
  };
  const LANGUAGE_BADGE_COLORS = {
    Basic: '#16a34a',
    Elementary: '#0284c7',
    Intermediate: '#7c3aed',
    Advanced: '#d97706',
    Fluent: '#0f766e',
    Native: '#dc2626',
  };

  const profDots = (p) => p === 'Native' ? 5 : p === 'Fluent' ? 4 : p === 'Advanced' ? 3 : 2;

  const SkillRatingDisplay = ({
    levelNum,
    badge,
    activeColor,
    emptyColor = '#d1d5db',
    badgeBg,
    badgeTextColor,
    badgeBorderColor,
  }) => {
    const filled = Math.max(0, Math.min(5, Number(levelNum) || 0));
    const tone = activeColor || BADGE_COLORS[badge] || col;

    if (skillMode !== 'rating') {
      if (!badge) return null;
      return (
        <span
          style={{
            fontSize: 7,
            fontWeight: 700,
            color: badgeTextColor || tone,
            background: badgeBg || `${tone}18`,
            border: badgeBorderColor ? `1px solid ${badgeBorderColor}` : 'none',
            padding: '1px 5px',
            borderRadius: 99,
            flexShrink: 0,
          }}
        >
          {badge}
        </span>
      );
    }

    if (skillRating === 'dots') {
      return <LevelDots filled={filled} dotCol={tone} emptyCol={emptyColor} size={6} />;
    }

    if (skillRating === 'bars') {
      return (
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 12 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              style={{
                width: 5,
                height: 3 + (n * 2),
                borderRadius: '2px 2px 0 0',
                background: n <= filled ? tone : emptyColor,
              }}
            />
          ))}
        </div>
      );
    }

    if (skillRating === 'blocks') {
      return (
        <div style={{ display: 'flex', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: n <= filled ? tone : emptyColor,
              }}
            />
          ))}
        </div>
      );
    }

    return <MiniStars levelNum={filled} />;
  };

  const LanguageRatingDisplay = ({
    language,
    activeColor,
    emptyColor = '#d1d5db',
    badgeBg,
    badgeTextColor,
    badgeBorderColor,
  }) => {
    const filled = Math.max(0, Math.min(5, Number(language?.stars) || profDots(language?.proficiency)));
    const tone = activeColor || LANGUAGE_BADGE_COLORS[language?.proficiency] || col;

    if (languageMode !== 'rating') {
      if (!language?.proficiency) return null;
      return (
        <span
          style={{
            fontSize: 7,
            fontWeight: 700,
            color: badgeTextColor || tone,
            background: badgeBg || `${tone}18`,
            border: badgeBorderColor ? `1px solid ${badgeBorderColor}` : 'none',
            padding: '1px 5px',
            borderRadius: 99,
            flexShrink: 0,
          }}
        >
          {language.proficiency}
        </span>
      );
    }

    if (languageRating === 'dots') {
      return <LevelDots filled={filled} dotCol={tone} emptyCol={emptyColor} size={6} />;
    }

    if (languageRating === 'bars') {
      return (
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 12 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              style={{
                width: 5,
                height: 3 + (n * 2),
                borderRadius: '2px 2px 0 0',
                background: n <= filled ? tone : emptyColor,
              }}
            />
          ))}
        </div>
      );
    }

    if (languageRating === 'blocks') {
      return (
        <div style={{ display: 'flex', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: n <= filled ? tone : emptyColor,
              }}
            />
          ))}
        </div>
      );
    }

    return <MiniStars levelNum={filled} />;
  };

  const estimateBlockHeight = (block) => {
    switch (block.type) {
      case 'summary':
        return 90 + Math.ceil(stripHtml(block.html).length / 3.6);
      case 'education':
        return 90 + Math.ceil(((block.item.highlights || '').length) / 5);
      case 'experience':
        return 112 + Math.ceil((block.description || '').length / 3.3);
      case 'skills':
        return 70 + (block.items.length * 16);
      case 'projects':
        return 90 + Math.ceil(stripHtml(block.item.description || '').length / 4.2);
      case 'languages':
        return 60 + (block.items.length * 16);
      default:
        return 80;
    }
  };

  const buildBoldTwoColPages = () => {
    const blocks = [];

    chunkText(summary.text || '', 85).forEach((text, index) => {
      blocks.push({ key: `summary-${index}`, type: 'summary', html: plainTextToHtml(text) });
    });

    (education.items || []).forEach((item, index) => {
      if (item.title || item.subtitle || item.highlights) {
        blocks.push({ key: `education-${item.id || index}`, type: 'education', item });
      }
    });

    experience
      .filter((item) => item.company || item.role || item.description)
      .forEach((item, index) => {
        const descriptionChunks = chunkText(item.description || '', 48);
        if (!descriptionChunks.length) {
          blocks.push({ key: `experience-${item.id || index}-0`, type: 'experience', item, description: '' });
          return;
        }
        descriptionChunks.forEach((chunk, chunkIndex) => {
          blocks.push({
            key: `experience-${item.id || index}-${chunkIndex}`,
            type: 'experience',
            item,
            description: chunk,
            isContinuation: chunkIndex > 0,
          });
        });
      });

    chunkArray(skills.filter((item) => item.name), 10).forEach((items, index) => {
      if (items.length) blocks.push({ key: `skills-${index}`, type: 'skills', items });
    });

    projects.filter((item) => item.name || item.description).forEach((item, index) => {
      blocks.push({ key: `projects-${item.id || index}`, type: 'projects', item });
    });

    chunkArray(languages.filter((item) => item.language), 6).forEach((items, index) => {
      if (items.length) blocks.push({ key: `languages-${index}`, type: 'languages', items });
    });

    const pageLimit = 760;
    const headerHeight = 88;
    const pages = [];
    let page = [];
    let used = headerHeight;

    blocks.forEach((block) => {
      const blockHeight = estimateBlockHeight(block);
      if (page.length > 0 && used + blockHeight > pageLimit) {
        pages.push(page);
        page = [block];
        used = headerHeight + blockHeight;
      } else {
        page.push(block);
        used += blockHeight;
      }
    });

    if (page.length || !pages.length) pages.push(page);
    while (pages.length < 1 + validExtraPages) pages.push([]);
    return pages;
  };

  const renderBoldTwoColBlock = (block) => {
    switch (block.type) {
      case 'summary':
        return (
          <div key={block.key} style={{ marginBottom: 12 }}>
            <div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 6 }}><strong style={{ fontSize: 10, letterSpacing: 0.5 }}>SUMMARY</strong></div>
            <div style={{ fontSize: 8.5, color: '#333', lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: sanitizeRichText(block.html) }} />
          </div>
        );
      case 'education':
        return (
          <div key={block.key} style={{ marginBottom: 12 }}>
            <div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 7 }}><strong style={{ fontSize: 10, letterSpacing: 0.5 }}>EDUCATION</strong></div>
            {block.item.title && <strong style={{ fontSize: 9 }}>{block.item.title}</strong>}
            {block.item.subtitle && <p style={{ fontSize: 8.5, fontStyle: 'italic', color: '#555', marginTop: 2 }}>{block.item.subtitle}</p>}
            {block.item.meta && <p style={{ fontSize: 8, color: '#777', marginTop: 2 }}>{block.item.meta}</p>}
            {block.item.highlights && <div style={{ fontSize: 8.5, color: '#333', marginTop: 3, lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: sanitizeRichText(block.item.highlights) }} />}
          </div>
        );
      case 'experience':
        return (
          <div key={block.key} style={{ marginBottom: 12 }}>
            <div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 7 }}><strong style={{ fontSize: 10, letterSpacing: 0.5 }}>WORK EXPERIENCE</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: 9, textTransform: 'uppercase' }}>{block.item.company || block.item.role || 'Experience'}</strong>
              <span style={{ fontSize: 8.5, color: '#555' }}>{block.item.duration}{block.item.location ? ` | ${block.item.location}` : ''}</span>
            </div>
            {block.item.role && <p style={{ fontSize: 8.5, fontStyle: 'italic', color: '#555', marginBottom: 3 }}>{block.isContinuation ? `${block.item.role} (cont.)` : block.item.role}</p>}
            {block.description && <div style={{ fontSize: 8.5, color: '#333', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: sanitizeRichText(plainTextToHtml(block.description)) }} />}
          </div>
        );
      case 'skills':
        return (
          <div key={block.key} style={{ marginBottom: 12 }}>
            <div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 7 }}><strong style={{ fontSize: 10, letterSpacing: 0.5 }}>TECHNICAL EXPERTISE</strong></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
              {block.items.map((item) => (
                <span key={item.id} style={{ fontSize: 8, background: '#f1f5f9', padding: '2px 7px', borderRadius: 4, color: '#333', border: '1px solid #e5e7eb', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span>{item.name}</span>
                  <SkillRatingDisplay levelNum={item.levelNum} badge={item.badge} />
                </span>
              ))}
            </div>
          </div>
        );
      case 'projects':
        return (
          <div key={block.key} style={{ marginBottom: 12 }}>
            <div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 7 }}><strong style={{ fontSize: 10, letterSpacing: 0.5 }}>PROJECTS</strong></div>
            <strong style={{ fontSize: 9 }}>{block.item.name}</strong>
            {block.item.stack && <span style={{ fontSize: 8, color: '#555', fontStyle: 'italic' }}> · {block.item.stack}</span>}
            {block.item.description && <div style={{ fontSize: 8.5, color: '#333', marginTop: 2, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: sanitizeRichText(block.item.description) }} />}
          </div>
        );
      case 'languages':
        return (
          <div key={block.key} style={{ marginBottom: 12 }}>
            <div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 7 }}><strong style={{ fontSize: 10, letterSpacing: 0.5 }}>LANGUAGES</strong></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
              {block.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 8.5, color: '#333' }}>{item.language}</span>
                  <LanguageRatingDisplay language={item} activeColor="#333" emptyColor="#ddd" />
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (tpl.structure === 'bold-two-col') {
    const pages = buildBoldTwoColPages();
    const totalPages = pages.length;

    return (
      <>
        {pages.map((pageBlocks, index) => (
          <React.Fragment key={`bold-two-col-page-${index}`}>
            {index > 0 && <PageBreakDivider />}
            <div style={{ position: 'relative', minHeight: 842, background: '#fff', padding: '20px 28px', fontFamily: `'${font}', sans-serif` }}>
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <h1 style={{ fontSize: 21, fontWeight: 700, color: '#111', margin: 0 }}>{name}</h1>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 18px', fontSize: 8.5, color: '#333', marginTop: 8 }}>
                  {personal.location && <span>📍 {personal.location}</span>}
                  {personal.email && <span>✉ {personal.email}</span>}
                  {personal.phone && <span>📞 {personal.phone}</span>}
                </div>
              </div>
              {pageBlocks.length ? pageBlocks.map(renderBoldTwoColBlock) : <BlankBody structure="bold-two-col" accentColor="#333" font={font} />}
              <div style={{ marginTop: 'auto' }}>
                <PageFooter cur={index + 1} total={totalPages} font={font} />
              </div>
            </div>
          </React.Fragment>
        ))}
      </>
    );
  }

  const ExpItems = ({ compact = false }) => (
    <div>
      {experience.filter((e) => e.company || e.role).map((e) => (
        <div key={e.id} style={{ marginBottom: compact ? 6 : 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <strong style={{ fontSize: 9 }}>{e.role}</strong>
            <span style={{ fontSize: 8, color: '#888', whiteSpace: 'nowrap' }}>{e.duration}</span>
          </div>
          <p style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>{e.company}{e.location ? `, ${e.location}` : ''}</p>
          {!compact && e.description && e.description.split('\n').filter(Boolean).map((l, i) => (
            <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>
          ))}
        </div>
      ))}
      {experience.every((e) => !e.company && !e.role) && (
        <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>
      )}
    </div>
  );

  const EduBlock = () => {
    const items = Array.isArray(education.items)
      ? education.items.filter((item) => item.title || item.subtitle || item.highlights)
      : [];

    if (items.length > 0) {
      return (
        <div>
          {items.map((item, index) => (
            <div key={item.id || `${item.title}-${index}`} style={{ marginBottom: index === items.length - 1 ? 0 : 8 }}>
              {item.title && <strong style={{ fontSize: 9 }}>{item.title}</strong>}
              {item.subtitle && <p style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>{item.subtitle}</p>}
              {item.meta && <p style={{ fontSize: 8, color: '#888' }}>{item.meta}</p>}
              {item.highlights && <p style={{ fontSize: 8, color: '#555', marginTop: 2, lineHeight: 1.5 }}>{item.highlights}</p>}
            </div>
          ))}
        </div>
      );
    }

    return education.degree || education.college ? (
      <div>
        <strong style={{ fontSize: 9 }}>{education.degree}</strong>
        {education.college && <p style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>{education.college}</p>}
        {education.year && <p style={{ fontSize: 8, color: '#888' }}>{education.year}{education.gpa ? ` | GPA: ${education.gpa}` : ''}</p>}
        {education.highlights && <p style={{ fontSize: 8, color: '#555', marginTop: 2, lineHeight: 1.5 }}>{education.highlights}</p>}
      </div>
    ) : (
      <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Education here…</p>
    );
  };

  // ── Page 1 rendering ───────────────────────────────────────────────────────
  const renderPage1 = () => {
    switch (tpl.structure) {
      case 'blank-start':
        return (
          <div style={{ ...fontStyle, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 500 }}>
            <div style={{ textAlign: 'center', color: '#cbd5e1' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>+</div>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Start from Scratch</p>
              <p style={{ fontSize: 10, marginTop: 4 }}>Add your details to build a custom resume</p>
            </div>
          </div>
        );

      case 'classic-minimal':
        return (
          <div style={{ ...fontStyle, background: '#fff', padding: '18px 22px', minHeight: 640 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{name}</h1>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '3px 0 6px', textTransform: 'uppercase', letterSpacing: 0.3 }}>{title}</h2>
                <p style={{ fontSize: 8, color: '#555' }}>{[personal.location, personal.phone, personal.email].filter(Boolean).join(' | ')}</p>
              </div>
              <PhotoRect w={72} h={72} style={{ borderRadius: 4, marginLeft: 12, flexShrink: 0 }} />
            </div>
            {summary.text && (
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 10, fontWeight: 800, color: col, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 5 }}>Summary</h2>
                <p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.65 }}>{summary.text}</p>
              </div>
            )}
            <div style={{ marginBottom: 10 }}>
              <h2 style={{ fontSize: 10, fontWeight: 800, color: col, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Professional Experience</h2>
              {experience.filter(e => e.company || e.role).map(e => (
                <div key={e.id} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: 9 }}>{e.role}, {e.company}</strong>
                    <span style={{ fontSize: 8, color: '#555', whiteSpace: 'nowrap' }}>{e.duration}</span>
                  </div>
                  {e.location && <p style={{ fontSize: 8, color: '#777' }}>{e.location}</p>}
                  {e.description && e.description.split('\n').filter(Boolean).map((l, i) => (
                    <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>
                  ))}
                </div>
              ))}
              {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
            </div>
            <div style={{ marginBottom: 10 }}>
              <h2 style={{ fontSize: 10, fontWeight: 800, color: col, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Education</h2>
              <EduBlock />
            </div>
            {skills.some(s => s.name) && (
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 10, fontWeight: 800, color: col, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Technical Skills</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                  {skills.filter(s => s.name).map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 8.5, color: '#333' }}>• {s.name}</p>
                      <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(languages.some(l => l.language) || certifications.some(c => c.name)) && (
              <div>
                <h2 style={{ fontSize: 10, fontWeight: 800, color: col, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Additional Information</h2>
                {languages.some(l => l.language) && (
                  <div style={{ marginBottom: 3 }}>
                    <strong style={{ fontSize: 8.5, color: '#333' }}>Languages:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', marginTop: 4 }}>
                      {languages.filter(l => l.language).map((l) => (
                        <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 8.5, color: '#333' }}>{l.language}</span>
                          <LanguageRatingDisplay language={l} activeColor={col} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {certifications.some(c => c.name) && <p style={{ fontSize: 8.5, color: '#333', marginBottom: 3 }}><strong>Certificates:</strong> {certifications.filter(c => c.name).map(c => c.name).join(', ')}</p>}
              </div>
            )}
          </div>
        );

      case 'serif-pro':
        return (
          <div style={{ ...fontStyle, background: '#fff', minHeight: 640 }}>
            <div style={{ padding: '20px 20px 10px' }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111', margin: 0, lineHeight: 1.1, textTransform: 'uppercase' }}>{name}</h1>
              <p style={{ fontSize: 10, color: '#555', marginTop: 4, letterSpacing: 0.3 }}>{title}</p>
              <div style={{ height: 1, background: '#ddd', margin: '10px 0' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr', minHeight: 540 }}>
              <div style={{ padding: '0 16px 16px 20px', borderRight: '1px solid #e5e7eb' }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#111', marginBottom: 8, borderBottom: '2px solid #111', paddingBottom: 3 }}>Info</h3>
                  {[['Address', personal.location], ['Phone', personal.phone], ['Email', personal.email]].map(([lbl, val]) => val && (
                    <div key={lbl} style={{ marginBottom: 8 }}>
                      <p style={{ fontSize: 8, fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{lbl}</p>
                      <p style={{ fontSize: 8.5, color: '#444', wordBreak: 'break-all' }}>{val}</p>
                    </div>
                  ))}
                </div>
                {skills.some(s => s.name) && (
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#111', marginBottom: 8, borderBottom: '2px solid #111', paddingBottom: 3 }}>Skills</h3>
                    {skills.filter(s => s.name).map(s => {
                      return (
                        <div key={s.id} style={{ marginBottom: 7 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <p style={{ fontSize: 8.5, color: '#111', marginBottom: 2 }}>{s.name}</p>
                            <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} activeColor="#111" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {languages.some(l => l.language) && (
                  <div>
                    <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#111', marginBottom: 8, borderBottom: '2px solid #111', paddingBottom: 3 }}>Languages</h3>
                    {languages.filter(l => l.language).map((l) => (
                      <div key={l.id} style={{ marginBottom: 7, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <p style={{ fontSize: 8.5, color: '#111', marginBottom: 0 }}>{l.language}</p>
                        <LanguageRatingDisplay language={l} activeColor="#111" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ padding: '0 20px 16px 16px' }}>
                {summary.text && <div style={{ marginBottom: 14 }}><h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#111', marginBottom: 6, borderBottom: '2px solid #111', paddingBottom: 3 }}>Profile</h3><p style={{ fontSize: 8.5, color: '#444', lineHeight: 1.7, textAlign: 'justify' }}>{summary.text}</p></div>}
                <div style={{ marginBottom: 14 }}>
                  <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#111', marginBottom: 8, borderBottom: '2px solid #111', paddingBottom: 3 }}>Employment History</h3>
                  {experience.filter(e => e.company || e.role).map(e => (
                    <div key={e.id} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: 9 }}>{e.role}{e.company ? `, ${e.company}` : ''}</strong>
                        <span style={{ fontSize: 8, color: '#888', whiteSpace: 'nowrap', marginLeft: 6 }}>{e.location}</span>
                      </div>
                      <p style={{ fontSize: 8, color: '#888', marginBottom: 3 }}>{e.duration}</p>
                      {e.description && e.description.split('\n').filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 8.5, color: '#333', marginTop: 2 }}>• {l}</p>)}
                    </div>
                  ))}
                  {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
                </div>
                {(education.degree || education.college) && <div><h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#111', marginBottom: 8, borderBottom: '2px solid #111', paddingBottom: 3 }}>Education</h3><EduBlock /></div>}
                {certifications.some(c => c.name) && (
                  <div style={{ marginTop: 14 }}>
                    <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#111', marginBottom: 8, borderBottom: '2px solid #111', paddingBottom: 3 }}>Certifications</h3>
                    {certifications.filter(c => c.name).map(c => (
                      <div key={c.id} style={{ marginBottom: 6 }}>
                        <strong style={{ fontSize: 9 }}>{c.name}</strong>
                        {c.issuer && <p style={{ fontSize: 8, color: '#555', fontStyle: 'italic' }}>{c.issuer}{c.date ? ` · ${c.date}` : ''}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'clean-centered':
        return (
          <div style={{ ...fontStyle, background: '#fff', padding: '20px 26px', minHeight: 640 }}>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <h1 style={{ fontSize: 21, fontWeight: 700, color: '#111', margin: 0 }}>{name}</h1>
              <p style={{ fontSize: 10, color: '#555', fontStyle: 'italic', marginTop: 3 }}>{title}</p>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 16px', fontSize: 8.5, color: '#333', marginTop: 6, borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '5px 0' }}>
                {personal.location && <span>📍 {personal.location}</span>}
                {personal.email && <span>✉ {personal.email}</span>}
                {personal.phone && <span>📞 {personal.phone}</span>}
                {personal.linkedin && <span>in {personal.linkedin}</span>}
              </div>
            </div>
            {summary.text && <div style={{ marginBottom: 10 }}><h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 6, color: '#111' }}>Profile</h2><p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.7, textAlign: 'justify' }}>{summary.text}</p></div>}
            <div style={{ marginBottom: 10 }}>
              <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 7, color: '#111' }}>Professional Experience</h2>
              {experience.filter(e => e.company || e.role).map(e => (
                <div key={e.id} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ fontSize: 9 }}>{e.role}</strong><span style={{ fontSize: 8, color: '#555' }}>{e.duration}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><p style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>{e.company}</p>{e.location && <span style={{ fontSize: 8, color: '#555' }}>{e.location}</span>}</div>
                  {e.description && e.description.split('\n').filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>)}
                </div>
              ))}
              {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
            </div>
            <div style={{ marginBottom: 10 }}>
              <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 7, color: '#111' }}>Education</h2>
              <EduBlock />
            </div>
            {skills.some(s => s.name) && (
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 7, color: '#111' }}>Skills</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                  {skills.filter(s => s.name).map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 8.5, color: '#333' }}>• {s.name}</p>
                      <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {languages.some(l => l.language) && (
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 7, color: '#111' }}>Languages</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px 0' }}>
                  {languages.filter(l => l.language).map(l => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 8.5, color: '#333', minWidth: 45 }}>{l.language}</span>
                      <LanguageRatingDisplay language={l} activeColor="#111" emptyColor="#ddd" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {certifications.some(c => c.name) && (
              <div>
                <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 7, color: '#111' }}>Certifications</h2>
                {certifications.filter(c => c.name).map(c => (
                  <div key={c.id} style={{ marginBottom: 5 }}>
                    <strong style={{ fontSize: 9 }}>{c.name}</strong>
                    {c.issuer && <p style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>{c.issuer}{c.date ? ` · ${c.date}` : ''}</p>}
                    {c.description && <p style={{ fontSize: 8, color: '#555', marginTop: 2, lineHeight: 1.5 }}>{c.description}</p>}
                  </div>
                ))}
              </div>
            )}
            {projects.some(p => p.name) && (
              <div style={{ marginTop: 10 }}>
                <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 7, color: '#111' }}>Projects</h2>
                {projects.filter(p => p.name).map(p => (
                  <div key={p.id} style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: 9 }}>{p.name}</strong>
                      {p.stack && <span style={{ fontSize: 8, color: '#555' }}>{p.stack}</span>}
                    </div>
                    {p.description && <p style={{ fontSize: 8.5, color: '#333', marginTop: 2, lineHeight: 1.5 }}>{p.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'data-pro-ats':
        return (
          <div style={{ ...fontStyle, background: '#fff', minHeight: 640 }}>
            <div style={{ display: 'flex', gap: 14, padding: '18px 20px 12px', alignItems: 'flex-start' }}>
              <PhotoRect w={88} h={88} style={{ borderRadius: 4 }} />
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: col, margin: 0, lineHeight: 1.2 }}>{name}{title ? `, ${title}` : ''}</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px', fontSize: 7.5, color: '#555', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {personal.location && <span>{personal.location}</span>}
                  {personal.email && <span>· {personal.email}</span>}
                  {personal.phone && <span>· {personal.phone}</span>}
                </div>
              </div>
              {skills.some(s => s.name) && (
                <div style={{ width: 155, flexShrink: 0, paddingLeft: 14 }}>
                  <h3 style={{ fontSize: 8.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#111', marginBottom: 8 }}>Skills</h3>
                  {skills.filter(s => s.name).map(s => (
                    <div key={s.id} style={{ marginBottom: 7 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <p style={{ fontSize: 8.5, color: '#333' }}>{s.name}</p>
                        <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} />
                      </div>
                      {skillMode === 'rating' ? (
                        <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} />
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ height: 1, background: '#e5e7eb', margin: '0 20px' }} />
            <div style={{ padding: '10px 20px' }}>
              {summary.text && <div style={{ marginBottom: 12 }}><h2 style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#111', marginBottom: 5 }}>Profile</h2><p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.7, textAlign: 'justify' }}>{summary.text}</p></div>}
              {experience.some(e => e.company || e.role) && <div style={{ marginBottom: 12 }}><h2 style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#111', marginBottom: 7 }}>Employment History</h2>{experience.filter(e => e.company || e.role).map(e => <div key={e.id} style={{ marginBottom: 10 }}><strong style={{ fontSize: 9 }}>{e.role}{e.company ? `, ${e.company}` : ''}</strong><p style={{ fontSize: 8, color: '#888', marginTop: 1, marginBottom: 3 }}>{e.duration}{e.location ? ` — ${e.location}` : ''}</p>{e.description && e.description.split('\n').filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>)}</div>)}</div>}
              {(education.degree || education.college) && <div style={{ marginBottom: 12 }}><h2 style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#111', marginBottom: 7 }}>Education</h2><EduBlock /></div>}
              {certifications.some(c => c.name) && (
                <div style={{ marginBottom: 12 }}>
                  <h2 style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#111', marginBottom: 7 }}>Certifications</h2>
                  {certifications.filter(c => c.name).map(c => (
                    <div key={c.id} style={{ marginBottom: 5 }}>
                      <strong style={{ fontSize: 9 }}>{c.name}</strong>
                      {c.issuer && <span style={{ fontSize: 8, color: '#555' }}> · {c.issuer}</span>}
                    </div>
                  ))}
                </div>
              )}
              {projects.some(p => p.name) && (
                <div>
                  <h2 style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#111', marginBottom: 7 }}>Projects</h2>
                  {projects.filter(p => p.name).map(p => (
                    <div key={p.id} style={{ marginBottom: 8 }}>
                      <strong style={{ fontSize: 9 }}>{p.name}</strong>
                      {p.stack && <span style={{ fontSize: 8, color: '#555' }}> · {p.stack}</span>}
                      {p.description && <p style={{ fontSize: 8.5, color: '#333', marginTop: 2 }}>{p.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'bold-two-col':
        return (
          <div style={{ ...fontStyle, background: '#fff', padding: '20px 28px', minHeight: 640 }}>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <h1 style={{ fontSize: 21, fontWeight: 700, color: '#111', margin: 0 }}>{name}</h1>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 18px', fontSize: 8.5, color: '#333', marginTop: 8 }}>
                {personal.location && <span>📍 {personal.location}</span>}
                {personal.email && <span>✉ {personal.email}</span>}
                {personal.phone && <span>📞 {personal.phone}</span>}
              </div>
            </div>
            {summary.text && <div style={{ marginBottom: 12 }}><div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 6 }}><strong style={{ fontSize: 10, letterSpacing: 0.5 }}>SUMMARY</strong></div><p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.65 }}>{summary.text}</p></div>}
            <div style={{ marginBottom: 12 }}>
              <div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 7 }}><strong style={{ fontSize: 10, letterSpacing: 0.5 }}>EDUCATION</strong></div>
              <EduBlock />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 7 }}><strong style={{ fontSize: 10, letterSpacing: 0.5 }}>WORK EXPERIENCE</strong></div>
              {experience.filter(e => e.company || e.role).map(e => <div key={e.id} style={{ marginBottom: 10 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ fontSize: 9, textTransform: 'uppercase' }}>{e.company},</strong><span style={{ fontSize: 8.5, color: '#555' }}>{e.duration}{e.location ? ` | ${e.location}` : ''}</span></div><p style={{ fontSize: 8.5, fontStyle: 'italic', color: '#555', marginBottom: 3 }}>{e.role}</p>{e.description && e.description.split('\n').filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>)}</div>)}
              {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
            </div>
            {skills.some(s => s.name) && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 7 }}><strong style={{ fontSize: 10, letterSpacing: 0.5 }}>TECHNICAL EXPERTISE</strong></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
                  {skills.filter(s => s.name).map(s => (
                    <span key={s.id} style={{ fontSize: 8, background: '#f1f5f9', padding: '2px 7px', borderRadius: 4, color: '#333', border: '1px solid #e5e7eb', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span>{s.name}</span>
                      <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} />
                    </span>
                  ))}
                </div>
              </div>
            )}
            {projects.some(p => p.name) && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 7 }}><strong style={{ fontSize: 10, letterSpacing: 0.5 }}>PROJECTS</strong></div>
                {projects.filter(p => p.name).map(p => (
                  <div key={p.id} style={{ marginBottom: 7 }}>
                    <strong style={{ fontSize: 9 }}>{p.name}</strong>
                    {p.stack && <span style={{ fontSize: 8, color: '#555', fontStyle: 'italic' }}> · {p.stack}</span>}
                    {p.description && <p style={{ fontSize: 8.5, color: '#333', marginTop: 2 }}>{p.description}</p>}
                  </div>
                ))}
              </div>
            )}
            {languages.some(l => l.language) && (
              <div>
                <div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 7 }}><strong style={{ fontSize: 10, letterSpacing: 0.5 }}>LANGUAGES</strong></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                  {languages.filter(l => l.language).map((l) => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 8.5, color: '#333' }}>{l.language}</span>
                      <LanguageRatingDisplay language={l} activeColor="#333" emptyColor="#ddd" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'minimalist-top':
        return (
          <div style={{ ...fontStyle, background: '#fff', padding: '18px 24px', minHeight: 640 }}>
            <div style={{ textAlign: 'center', marginBottom: 10 }}>
              <h1 style={{ fontSize: 19, fontWeight: 800, color: '#111', margin: 0 }}>{name}</h1>
              <p style={{ fontSize: 10, fontStyle: 'italic', color: '#444', marginTop: 3 }}>{title}</p>
              <p style={{ fontSize: 8, color: '#333', marginTop: 5 }}>{[personal.email, personal.phone, personal.location, personal.linkedin, personal.github].filter(Boolean).join(' | ')}</p>
            </div>
            {summary.text && <div style={{ marginBottom: 9 }}><h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 5, color: '#111' }}>Professional Summary</h2><p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.65 }}>{summary.text}</p></div>}
            {experience.some(e => e.company || e.role) && <div style={{ marginBottom: 9 }}><h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 6, color: '#111' }}>Work Experience</h2>{experience.filter(e => e.company || e.role).map(e => <div key={e.id} style={{ marginBottom: 8 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span><strong style={{ fontSize: 9 }}>{e.company}</strong>{e.role && <span style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>, {e.role}</span>}</span><span style={{ fontSize: 8, color: '#555', whiteSpace: 'nowrap' }}>{e.duration}{e.location ? ` | ${e.location}` : ''}</span></div>{e.description && e.description.split('\n').filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 10, marginTop: 2 }}>• {l}</p>)}</div>)}</div>}
            <div style={{ marginBottom: 9 }}>
              <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 6, color: '#111' }}>Education</h2>
              <EduBlock />
            </div>
            {skills.some(s => s.name) && (
              <div style={{ marginBottom: 9 }}>
                <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 6, color: '#111' }}>Skills</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                  {skills.filter(s => s.name).map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 8.5, color: '#333' }}>• {s.name}</p>
                      <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {projects.some(p => p.name) && (
              <div style={{ marginBottom: 9 }}>
                <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 6, color: '#111' }}>Projects</h2>
                {projects.filter(p => p.name).map(p => (
                  <div key={p.id} style={{ marginBottom: 6 }}>
                    <span><strong style={{ fontSize: 9 }}>{p.name}</strong>{p.stack && <span style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>, {p.stack}</span>}</span>
                    {p.description && p.description.split('\n').filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 10, marginTop: 2 }}>• {l}</p>)}
                  </div>
                ))}
              </div>
            )}
            {certifications.some(c => c.name) && (
              <div style={{ marginBottom: 9 }}>
                <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 6, color: '#111' }}>Certifications</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 16px' }}>
                  {certifications.filter(c => c.name).map(c => (
                    <div key={c.id}>
                      <p style={{ fontSize: 8.5, color: '#333' }}>• {c.name}</p>
                      {c.issuer && <p style={{ fontSize: 8, color: '#777', paddingLeft: 8 }}>{c.issuer}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {languages.some(l => l.language) && (
              <div>
                <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 6, color: '#111' }}>Languages</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                  {languages.filter(l => l.language).map((l) => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 8.5, color: '#333' }}>{l.language}</span>
                      <LanguageRatingDisplay language={l} activeColor="#111" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'minimalist-pro':
      case 'section-shade':
        return (
          <div style={{ ...fontStyle, background: '#fff', minHeight: 640 }}>
            <div style={{ display: 'flex', gap: 14, padding: '14px 18px 10px', alignItems: 'flex-start' }}>
              <PhotoCircle size={72} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: 19, fontWeight: 900, color: '#111', margin: 0 }}>{name}</h1>
                  <span style={{ fontSize: 12, fontStyle: 'italic', color: '#555', fontWeight: 400 }}>{title}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', fontSize: 8, color: '#333', marginTop: 6 }}>
                  {personal.email && <span>✉ {personal.email}</span>}
                  {personal.phone && <span>📞 {personal.phone}</span>}
                  {personal.location && <span>📍 {personal.location}</span>}
                  {personal.linkedin && <span>in {personal.linkedin}</span>}
                  {personal.github && <span>⌥ {personal.github}</span>}
                </div>
              </div>
            </div>
            <div style={{ height: 2, background: col }} />
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
              <div style={{ padding: '12px 14px', borderRight: `2px solid ${col}` }}>
                <div style={{ marginBottom: 12 }}>
                  <h2 style={{ fontSize: 9, fontWeight: 800, color: col, textTransform: 'uppercase', marginBottom: 6 }}>🎓 Education</h2>
                  <EduBlock />
                </div>
                {skills.some(s => s.name) && (
                  <div style={{ marginBottom: 12 }}>
                    <h2 style={{ fontSize: 9, fontWeight: 800, color: col, textTransform: 'uppercase', marginBottom: 6 }}>⚙ Skills</h2>
                    {skills.filter(s => s.name).map(s => (
                      <div key={s.id} style={{ marginBottom: 5 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ fontSize: 8.5, color: '#333' }}>{s.name}</p>
                          <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {languages.some(l => l.language) && (
                  <div style={{ marginBottom: 12 }}>
                    <h2 style={{ fontSize: 9, fontWeight: 800, color: col, textTransform: 'uppercase', marginBottom: 6 }}>🌐 Languages</h2>
                    {languages.filter(l => l.language).map(l => (
                      <div key={l.id} style={{ marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <strong style={{ fontSize: 8.5, color: '#111' }}>{l.language}:</strong>
                          <LanguageRatingDisplay language={l} activeColor={col} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {certifications.some(c => c.name) && (
                  <div>
                    <h2 style={{ fontSize: 9, fontWeight: 800, color: col, textTransform: 'uppercase', marginBottom: 6 }}>🏆 Certs</h2>
                    {certifications.filter(c => c.name).map(c => (
                      <div key={c.id} style={{ marginBottom: 5 }}>
                        <p style={{ fontSize: 8, fontWeight: 700, color: '#111' }}>{c.name}</p>
                        {c.issuer && <p style={{ fontSize: 7.5, color: '#777' }}>{c.issuer}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ padding: '12px 16px' }}>
                <div style={{ marginBottom: 12 }}>
                  <h2 style={{ fontSize: 9, fontWeight: 800, color: col, textTransform: 'uppercase', marginBottom: 8, borderBottom: `1.5px solid ${col}`, paddingBottom: 3 }}>💼 Work Experience</h2>
                  {experience.filter(e => e.company || e.role).map(e => (
                    <div key={e.id} style={{ marginBottom: 10 }}>
                      <strong style={{ fontSize: 9 }}>{e.role},</strong>
                      <span style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}> {e.company}</span>
                      <p style={{ fontSize: 8, color: '#777', marginTop: 1 }}>{e.duration}{e.location ? ` | ${e.location}` : ''}</p>
                      {e.description && e.description.split('\n').filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>)}
                    </div>
                  ))}
                  {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
                </div>
                {projects.some(p => p.name) && (
                  <div>
                    <h2 style={{ fontSize: 9, fontWeight: 800, color: col, textTransform: 'uppercase', marginBottom: 8, borderBottom: `1.5px solid ${col}`, paddingBottom: 3 }}>🚀 Projects</h2>
                    {projects.filter(p => p.name).map(p => (
                      <div key={p.id} style={{ marginBottom: 10 }}>
                        <strong style={{ fontSize: 9 }}>{p.name}</strong>
                        {p.stack && <span style={{ fontSize: 8, color: '#555', fontStyle: 'italic' }}> · {p.stack}</span>}
                        {p.description && p.description.split('\n').filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'photo-ats':
        return (
          <div style={{ ...fontStyle, background: '#fff', padding: '18px 22px', minHeight: 640 }}>
            <div style={{ marginBottom: 12 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>{name}</h1>
              <p style={{ fontSize: 11, color: '#333', marginTop: 2 }}>{title}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px', marginTop: 8, fontSize: 8.5, color: '#333' }}>
                {personal.location && <span>📍 {personal.location}</span>}
                {personal.email && <span>✉ {personal.email}</span>}
                {personal.phone && <span>📞 {personal.phone}</span>}
                {personal.linkedin && <span>in {personal.linkedin}</span>}
              </div>
            </div>
            {[
              { label: 'Profile', el: summary.text ? <p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.7 }}>{summary.text}</p> : null },
              {
                label: 'Work Experience',
                el: (
                  <div>
                    {experience.filter(e => e.company || e.role).map(e => (
                      <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0 8px', marginBottom: 9 }}>
                        <div><strong style={{ fontSize: 9 }}>{e.role}</strong>{e.company && <span style={{ fontSize: 8.5, color: '#333' }}>, {e.company}</span>}</div>
                        <div style={{ textAlign: 'right', fontSize: 8, color: '#555', whiteSpace: 'nowrap' }}><div>{e.duration}</div><div>{e.location}</div></div>
                        <div style={{ gridColumn: '1 / -1' }}>{e.description && e.description.split('\n').filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>)}</div>
                      </div>
                    ))}
                    {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
                  </div>
                )
              },
              { label: 'Education', el: (education.degree || education.college) ? <EduBlock /> : null },
              {
                label: 'Skills',
                el: skills.some(s => s.name) ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 20px' }}>
                    {skills.filter(s => s.name).map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: 8.5, color: '#333' }}>• {s.name}</p>
                        <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} />
                      </div>
                    ))}
                  </div>
                ) : null
              },
              {
                label: 'Projects',
                el: projects.some(p => p.name) ? (
                  <div>
                    {projects.filter(p => p.name).map(p => (
                      <div key={p.id} style={{ marginBottom: 6 }}>
                        <strong style={{ fontSize: 9 }}>{p.name}</strong>
                        {p.stack && <span style={{ fontSize: 8, color: '#555' }}> · {p.stack}</span>}
                        {p.description && <p style={{ fontSize: 8.5, color: '#333', marginTop: 2 }}>{p.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : null
              },
              {
                label: 'Certifications',
                el: certifications.some(c => c.name) ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 20px' }}>
                    {certifications.filter(c => c.name).map(c => <p key={c.id} style={{ fontSize: 8.5, color: '#333' }}>• {c.name}</p>)}
                  </div>
                ) : null
              },
              {
                label: 'Languages',
                el: languages.some(l => l.language) ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 20px' }}>
                    {languages.filter(l => l.language).map((l) => (
                      <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <p style={{ fontSize: 8.5, color: '#333' }}>• {l.language}</p>
                        <LanguageRatingDisplay language={l} activeColor={col} />
                      </div>
                    ))}
                  </div>
                ) : null
              },
            ].filter(s => s.el).map(({ label, el }) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ background: '#f1f5f9', padding: '4px 10px', marginBottom: 7 }}>
                  <h2 style={{ fontSize: 9.5, fontWeight: 700, color: '#111', margin: 0, textAlign: 'center' }}>{label}</h2>
                </div>
                {el}
              </div>
            ))}
          </div>
        );

      case 'teal-split':
        return (
          <div style={{ ...fontStyle, background: '#fff', display: 'flex', minHeight: 640 }}>
            <div style={{ width: 165, background: '#f7f7f7', borderRight: '1px solid #e5e7eb', padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 14, flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111', margin: 0, lineHeight: 1.2 }}>{name}</h2>
                <p style={{ fontSize: 9, color: col, fontStyle: 'italic', marginTop: 3 }}>{title}</p>
              </div>
              <div>
                <h6 style={{ fontSize: 7.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: col, borderBottom: `1.5px solid ${col}`, paddingBottom: 2, marginBottom: 7 }}>Contact</h6>
                {personal.location && <p style={{ fontSize: 8, color: '#444', marginBottom: 4 }}>📍 {personal.location}</p>}
                {personal.email && <p style={{ fontSize: 8, color: '#444', marginBottom: 4 }}>✉ {personal.email}</p>}
                {personal.phone && <p style={{ fontSize: 8, color: '#444', marginBottom: 4 }}>📞 {personal.phone}</p>}
                {personal.linkedin && <p style={{ fontSize: 8, color: '#444', marginBottom: 4 }}>in {personal.linkedin}</p>}
              </div>
              {summary.text && (
                <div>
                  <h6 style={{ fontSize: 7.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: col, borderBottom: `1.5px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Profile</h6>
                  <p style={{ fontSize: 8, color: '#444', lineHeight: 1.6 }}>{summary.text}</p>
                </div>
              )}
              {skills.some(s => s.name) && (
                <div>
                  <h6 style={{ fontSize: 7.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: col, borderBottom: `1.5px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Skills</h6>
                  {skills.filter(s => s.name).map(s => (
                    <div key={s.id} style={{ marginBottom: 5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <p style={{ fontSize: 8, fontWeight: 600, color: '#333' }}>{s.name}</p>
                        <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} />
                      </div>
                      {skillMode === 'rating' ? (
                        <div style={{ marginTop: 2 }}>
                          <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
              {certifications.some(c => c.name) && (
                <div>
                  <h6 style={{ fontSize: 7.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: col, borderBottom: `1.5px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Certificates</h6>
                  {certifications.filter(c => c.name).map(c => (
                    <div key={c.id} style={{ marginBottom: 5 }}>
                      <strong style={{ fontSize: 8 }}>{c.name}</strong>
                      {c.issuer && <p style={{ fontSize: 7.5, color: '#888', fontStyle: 'italic' }}>{c.issuer}</p>}
                    </div>
                  ))}
                </div>
              )}
              {languages.some(l => l.language) && (
                <div>
                  <h6 style={{ fontSize: 7.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: col, borderBottom: `1.5px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Languages</h6>
                  {languages.filter(l => l.language).map((l) => (
                    <div key={l.id} style={{ marginBottom: 7, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <p style={{ fontSize: 8, fontWeight: 600, color: '#333' }}>{l.language}</p>
                      <LanguageRatingDisplay language={l} activeColor={col} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ flex: 1, padding: '18px 16px' }}>
              <div style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 11, fontWeight: 800, color: col, borderBottom: `1.5px solid ${col}`, paddingBottom: 3, marginBottom: 8 }}>Professional Experience</h2>
                {experience.filter(e => e.company || e.role).map(e => <div key={e.id} style={{ marginBottom: 10 }}><strong style={{ fontSize: 9 }}>{e.company}</strong><p style={{ fontSize: 8.5, fontStyle: 'italic', color: '#555' }}>{e.role}</p><p style={{ fontSize: 8, color: '#777', marginBottom: 3 }}>{e.duration}{e.location ? ` | ${e.location}` : ''}</p>{e.description && e.description.split('\n').filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>)}</div>)}
                {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
              </div>
              <div style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 11, fontWeight: 800, color: col, borderBottom: `1.5px solid ${col}`, paddingBottom: 3, marginBottom: 7 }}>Education</h2>
                <EduBlock />
              </div>
              {projects.some(p => p.name) && (
                <div>
                  <h2 style={{ fontSize: 11, fontWeight: 800, color: col, borderBottom: `1.5px solid ${col}`, paddingBottom: 3, marginBottom: 7 }}>Projects</h2>
                  {projects.filter(p => p.name).map(p => (
                    <div key={p.id} style={{ marginBottom: 7 }}>
                      <strong style={{ fontSize: 9 }}>{p.name}</strong>
                      {p.stack && <span style={{ fontSize: 8, color: '#555', fontStyle: 'italic' }}> · {p.stack}</span>}
                      {p.description && <p style={{ fontSize: 8.5, color: '#333', marginTop: 2 }}>{p.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'two-column':
        return (
          <div style={{ ...fontStyle, background: '#fff', minHeight: 640 }}>
            <div style={{ height: 4, background: col }} />
            <div style={{ display: 'flex', gap: 14, padding: '14px 18px 10px', alignItems: 'center' }}>
              <PhotoCircle size={68} />
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 17, fontWeight: 800, color: '#111', margin: 0 }}>{name}</h1>
                <p style={{ fontSize: 9, color: '#555', fontStyle: 'italic', marginTop: 2 }}>{title}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', fontSize: 8, color: '#333', marginTop: 5 }}>
                  {personal.location && <span>📍 {personal.location}</span>}
                  {personal.email && <span>✉ {personal.email}</span>}
                  {personal.phone && <span>📞 {personal.phone}</span>}
                </div>
              </div>
            </div>
            <div style={{ height: 1, background: '#e5e7eb', margin: '0 18px' }} />
            <div style={{ padding: '10px 18px' }}>
              {summary.text && <div style={{ marginBottom: 10 }}><h2 style={{ fontSize: 10, fontWeight: 800, color: '#111', marginBottom: 6 }}>🪪 Profile</h2><p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.7 }}>{summary.text}</p></div>}
              {experience.some(e => e.company || e.role) && <div style={{ marginBottom: 10 }}><h2 style={{ fontSize: 10, fontWeight: 800, color: '#111', marginBottom: 8 }}>💼 Professional Experience</h2>{experience.filter(e => e.company || e.role).map(e => <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0 10px', marginBottom: 10 }}><div><p style={{ fontSize: 8, color: col }}>{e.duration}</p>{e.location && <p style={{ fontSize: 8, color: col }}>{e.location}</p>}</div><div><strong style={{ fontSize: 9 }}>{e.role}</strong><p style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>{e.company}</p>{e.description && e.description.split('\n').filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 8.5, color: '#333', marginTop: 2 }}>• {l}</p>)}</div></div>)}</div>}
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 10, fontWeight: 800, color: '#111', marginBottom: 8 }}>🎓 Education</h2>
                <EduBlock />
              </div>
              {skills.some(s => s.name) && (
                <div style={{ marginBottom: 10 }}>
                  <h2 style={{ fontSize: 10, fontWeight: 800, color: '#111', marginBottom: 8 }}>⚙ Skills</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                    {skills.filter(s => s.name).map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: 8.5, color: '#333' }}>✏ {s.name}</p>
                        <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {certifications.some(c => c.name) && (
                <div style={{ marginBottom: 10 }}>
                  <h2 style={{ fontSize: 10, fontWeight: 800, color: '#111', marginBottom: 8 }}>🏆 Certifications</h2>
                  {certifications.filter(c => c.name).map(c => (
                    <div key={c.id} style={{ marginBottom: 5 }}>
                      <strong style={{ fontSize: 9 }}>{c.name}</strong>
                      {c.issuer && <p style={{ fontSize: 8, color: '#555' }}>{c.issuer}</p>}
                    </div>
                  ))}
                </div>
              )}
              {projects.some(p => p.name) && (
                <div style={{ marginBottom: 10 }}>
                  <h2 style={{ fontSize: 10, fontWeight: 800, color: '#111', marginBottom: 8 }}>🚀 Projects</h2>
                  {projects.filter(p => p.name).map(p => (
                    <div key={p.id} style={{ marginBottom: 6 }}>
                      <strong style={{ fontSize: 9 }}>{p.name}</strong>
                      {p.stack && <span style={{ fontSize: 8, color: '#555' }}> · {p.stack}</span>}
                      {p.description && <p style={{ fontSize: 8.5, color: '#333', marginTop: 2 }}>{p.description}</p>}
                    </div>
                  ))}
                </div>
              )}
                {languages.some(l => l.language) && (
                  <div>
                    <h2 style={{ fontSize: 10, fontWeight: 800, color: '#111', marginBottom: 8 }}>🌐 Languages</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px 0' }}>
                      {languages.filter(l => l.language).map((l) => (
                        <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 8.5, color: '#333', minWidth: 40 }}>{l.language}</span>
                          <LanguageRatingDisplay language={l} activeColor={col} emptyColor="#ddd" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        );

      case 'ashley-sidebar':
        return (
          <div style={{ ...fontStyle, background: '#fff', minHeight: 640 }}>
            <div style={{ textAlign: 'center', padding: '14px 20px 10px' }}>
              <PhotoCircle size={70} style={{ margin: '0 auto 8px', border: `3px solid ${col}` }} />
              <h1 style={{ fontSize: 19, fontWeight: 800, color: '#111', margin: 0 }}>{name}</h1>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 14px', fontSize: 8, color: '#333', marginTop: 5 }}>
                {personal.location && <span>{personal.location}</span>}
                {personal.email && <span>• {personal.email}</span>}
                {personal.phone && <span>• {personal.phone}</span>}
              </div>
            </div>
            <div style={{ height: 1, background: '#eee' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 490 }}>
              <div style={{ padding: '10px 13px', borderRight: '1px solid #eee' }}>
                {summary.text && <div style={{ marginBottom: 9 }}><div style={{ background: '#f8f8f8', padding: '3px 8px', marginBottom: 5 }}><h2 style={{ fontSize: 9.5, fontWeight: 700, color: col, margin: 0, textAlign: 'center' }}>Profile</h2></div><p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.65 }}>{summary.text}</p></div>}
                <div style={{ marginBottom: 9 }}>
                  <div style={{ background: '#f8f8f8', padding: '3px 8px', marginBottom: 5 }}><h2 style={{ fontSize: 9.5, fontWeight: 700, color: col, margin: 0, textAlign: 'center' }}>Education</h2></div>
                  <EduBlock />
                </div>
                {languages.some(l => l.language) && (
                  <div style={{ marginBottom: 9 }}>
                    <div style={{ background: '#f8f8f8', padding: '3px 8px', marginBottom: 5 }}>
                      <h2 style={{ fontSize: 9.5, fontWeight: 700, color: col, margin: 0, textAlign: 'center' }}>Languages</h2>
                    </div>
                    {languages.filter(l => l.language).map((l) => (
                      <div key={l.id} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <p style={{ fontSize: 8.5, color: '#333', marginBottom: 0 }}>{l.language}</p>
                        <LanguageRatingDisplay language={l} activeColor={col} />
                      </div>
                    ))}
                  </div>
                )}
                {certifications.some(c => c.name) && <div><div style={{ background: '#f8f8f8', padding: '3px 8px', marginBottom: 5 }}><h2 style={{ fontSize: 9.5, fontWeight: 700, color: col, margin: 0, textAlign: 'center' }}>Certifications</h2></div>{certifications.filter(c => c.name).map(c => <div key={c.id} style={{ marginBottom: 5 }}><strong style={{ fontSize: 9 }}>{c.name}</strong>{c.issuer && <span style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}> · {c.issuer}</span>}</div>)}</div>}
              </div>
              <div style={{ padding: '10px 13px' }}>
                <div style={{ marginBottom: 9 }}>
                  <div style={{ background: '#f8f8f8', padding: '3px 8px', marginBottom: 5 }}><h2 style={{ fontSize: 9.5, fontWeight: 700, color: col, margin: 0, textAlign: 'center' }}>Professional Experience</h2></div>
                  {experience.filter(e => e.company || e.role).map(e => <div key={e.id} style={{ marginBottom: 8 }}><strong style={{ fontSize: 9 }}>{e.role},</strong><span style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}> {e.company}</span><p style={{ fontSize: 8, color: '#777', marginTop: 1 }}>{e.duration}{e.location ? ` | ${e.location}` : ''}</p>{e.description && e.description.split('\n').filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>)}</div>)}
                  {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
                </div>
                {skills.some(s => s.name) && (
                  <div style={{ marginBottom: 9 }}>
                    <div style={{ background: '#f8f8f8', padding: '3px 8px', marginBottom: 5 }}><h2 style={{ fontSize: 9.5, fontWeight: 700, color: col, margin: 0, textAlign: 'center' }}>Skills</h2></div>
                    {skills.filter(s => s.name).map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <p style={{ fontSize: 8.5, color: '#333' }}>• {s.name}</p>
                        <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} />
                      </div>
                    ))}
                  </div>
                )}
                {projects.some(p => p.name) && (
                  <div>
                    <div style={{ background: '#f8f8f8', padding: '3px 8px', marginBottom: 5 }}><h2 style={{ fontSize: 9.5, fontWeight: 700, color: col, margin: 0, textAlign: 'center' }}>Projects</h2></div>
                    {projects.filter(p => p.name).map(p => (
                      <div key={p.id} style={{ marginBottom: 6 }}>
                        <strong style={{ fontSize: 9 }}>{p.name}</strong>
                        {p.stack && <span style={{ fontSize: 8, color: '#555', fontStyle: 'italic' }}> · {p.stack}</span>}
                        {p.description && <p style={{ fontSize: 8.5, color: '#333', marginTop: 2 }}>{p.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'graphic-split':
        return (
          <div style={{ ...fontStyle, background: '#fff', minHeight: 640 }}>
            <div style={{ display: 'flex', gap: 16, padding: '14px 18px 0', alignItems: 'flex-start' }}>
              <PhotoRect w={90} h={100} />
              <div style={{ flex: 1, paddingTop: 6 }}>
                <h1 style={{ fontSize: 18, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', color: '#111', margin: 0 }}>{name}</h1>
                <p style={{ fontSize: 10, color: '#555', marginTop: 3 }}>{title}</p>
              </div>
            </div>
            <div style={{ borderTop: '1.5px solid #333', borderBottom: '1.5px solid #333', margin: '10px 18px', padding: '4px 0', display: 'flex', gap: 16, fontSize: 8, color: '#333' }}>
              {personal.phone && <span>📞 {personal.phone}</span>}
              {personal.email && <span>✉ {personal.email}</span>}
              {personal.location && <span>📍 {personal.location}</span>}
            </div>
            <div style={{ padding: '0 18px 14px' }}>
              {summary.text && <div style={{ marginBottom: 11 }}><h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', marginBottom: 4 }}>👤 Personal Profile</h2><div style={{ height: 3, background: '#e5e7eb', marginBottom: 5 }} /><p style={{ fontSize: 8.5, color: '#444', lineHeight: 1.65 }}>{summary.text}</p></div>}
              <div style={{ marginBottom: 11 }}>
                <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', marginBottom: 4 }}>💼 Professional Experience</h2>
                <div style={{ height: 3, background: '#e5e7eb', marginBottom: 6 }} />
                {experience.filter(e => e.company || e.role).map(e => <div key={e.id} style={{ marginBottom: 10 }}><strong style={{ fontSize: 9 }}>{e.role} – {e.company}</strong><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#777', marginTop: 1, marginBottom: 3 }}><span>{e.location}</span><span>{e.duration}</span></div>{e.description && e.description.split('\n').filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>)}</div>)}
                {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
              </div>
              <div style={{ marginBottom: 11 }}>
                <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', marginBottom: 4 }}>🎓 Education</h2>
                <div style={{ height: 3, background: '#e5e7eb', marginBottom: 6 }} />
                <EduBlock />
              </div>
              {skills.some(s => s.name) && (
                <div style={{ marginBottom: 11 }}>
                  <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', marginBottom: 4 }}>⚙ Skills</h2>
                  <div style={{ height: 3, background: '#e5e7eb', marginBottom: 6 }} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
                    {skills.filter(s => s.name).map(s => (
                      <span key={s.id} style={{ fontSize: 8, background: '#f8fafc', border: '1px solid #e5e7eb', padding: '2px 7px', borderRadius: 4, color: '#333', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span>{s.name}</span>
                        <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} />
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {projects.some(p => p.name) && (
                <div style={{ marginBottom: 11 }}>
                  <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', marginBottom: 4 }}>🚀 Projects</h2>
                  <div style={{ height: 3, background: '#e5e7eb', marginBottom: 6 }} />
                  {projects.filter(p => p.name).map(p => (
                    <div key={p.id} style={{ marginBottom: 7 }}>
                      <strong style={{ fontSize: 9 }}>{p.name}</strong>
                      {p.stack && <span style={{ fontSize: 8, color: '#555' }}> · {p.stack}</span>}
                      {p.description && <p style={{ fontSize: 8.5, color: '#333', marginTop: 2 }}>{p.description}</p>}
                    </div>
                  ))}
                </div>
              )}
              {certifications.some(c => c.name) && (
                <div>
                  <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', marginBottom: 4 }}>✦ Certifications</h2>
                  <div style={{ height: 3, background: '#e5e7eb', marginBottom: 6 }} />
                  {certifications.filter(c => c.name).map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ fontSize: 9 }}>{c.name}</strong>
                      {c.date && <span style={{ fontSize: 8, color: '#777' }}>{c.date}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'serif-ats':
        return (
          <div style={{ ...fontStyle, background: '#fff', display: 'flex', minHeight: 640 }}>
            <div style={{ flex: 1, padding: '14px 16px', minWidth: 0 }}>
              <h1 style={{ fontSize: 15, fontWeight: 900, color: '#111', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{name}</h1>
              <p style={{ fontSize: 8.5, color: col, fontWeight: 600, marginBottom: 5 }}>{title}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 12px', fontSize: 8, color: '#555', marginBottom: 11 }}>
                {personal.email && <span>@ {personal.email}</span>}
                {personal.linkedin && <span>🔗 LinkedIn</span>}
                {personal.location && <span>📍 {personal.location}</span>}
              </div>
              {summary.text && <div style={{ marginBottom: 10 }}><h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '1px solid #ddd', paddingBottom: 2, marginBottom: 5 }}>Summary</h2><p style={{ fontSize: 8, color: '#333', lineHeight: 1.65 }}>{summary.text}</p></div>}
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '1px solid #ddd', paddingBottom: 2, marginBottom: 6 }}>Experience</h2>
                {experience.filter(e => e.company || e.role).map(e => <div key={e.id} style={{ marginBottom: 8 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ fontSize: 9, color: '#111' }}>{e.role}</strong><span style={{ fontSize: 7.5, color: '#888' }}>{e.duration}</span></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><p style={{ fontSize: 8, color: col, fontWeight: 600 }}>{e.company}</p>{e.location && <p style={{ fontSize: 7.5, color: '#888' }}>{e.location}</p>}</div>{e.description && e.description.split('\n').filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 8, color: '#444', paddingLeft: 8, marginTop: 2 }}>• {l}</p>)}</div>)}
                {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
              </div>
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '1px solid #ddd', paddingBottom: 2, marginBottom: 6 }}>Education</h2>
                <EduBlock />
              </div>
              {languages.some(l => l.language) && (
                <div style={{ marginBottom: 10 }}>
                  <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '1px solid #ddd', paddingBottom: 2, marginBottom: 6 }}>Languages</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                    {languages.filter(l => l.language).map((l) => (
                      <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 8, color: '#333', minWidth: 45 }}>{l.language}</span>
                        <LanguageRatingDisplay language={l} activeColor={col} emptyColor="#e2e8f0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {projects.some(p => p.name) && <div><h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '1px solid #ddd', paddingBottom: 2, marginBottom: 6 }}>Projects</h2><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{projects.filter(p => p.name).map(p => <div key={p.id} style={{ display: 'flex', gap: 5 }}><span style={{ fontSize: 11, flexShrink: 0 }}>🔹</span><div><strong style={{ fontSize: 8.5 }}>{p.name}</strong>{p.stack && <p style={{ fontSize: 8, color: '#555', marginTop: 1 }}>{p.stack}</p>}{p.description && <p style={{ fontSize: 8, color: '#555', marginTop: 2, lineHeight: 1.4 }}>{p.description}</p>}</div></div>)}</div></div>}
            </div>
            <div style={{ width: 145, background: col, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '14px 11px 8px', display: 'flex', justifyContent: 'center' }}><PhotoCircle size={62} style={{ border: '3px solid rgba(255,255,255,0.3)' }} /></div>
              <div style={{ padding: '0 11px 10px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                <h6 style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 7 }}>Skills</h6>
                {skills.filter(s => s.name).map(s => (
                  <div key={s.id} style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <p style={{ fontSize: 8, fontWeight: 700, color: '#fff' }}>{s.name}</p>
                      <SkillRatingDisplay
                        levelNum={s.levelNum}
                        badge={s.badge}
                        activeColor="#ffffff"
                        emptyColor="rgba(255,255,255,0.3)"
                        badgeBg="rgba(255,255,255,0.16)"
                        badgeTextColor="#ffffff"
                      />
                    </div>
                    {skillMode === 'rating' ? (
                      <div style={{ marginTop: 2 }}>
                        <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} activeColor="#ffffff" emptyColor="rgba(255,255,255,0.3)" />
                      </div>
                    ) : null}
                  </div>
                ))}
                {skills.every(s => !s.name) && <p style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Skills here…</p>}
              </div>
              <div style={{ padding: '8px 11px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                <h6 style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 5 }}>Education</h6>
                {(education.degree || education.college) ? (
                  <div>
                    <p style={{ fontSize: 8, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{education.degree}</p>
                    {education.college && <p style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{education.college}</p>}
                    {education.year && <p style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>{education.year}</p>}
                  </div>
                ) : <p style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Education here…</p>}
              </div>
              {certifications.some(c => c.name) && (
                <div style={{ padding: '8px 11px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                  <h6 style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 5 }}>Certifications</h6>
                  {certifications.filter(c => c.name).map(c => (
                    <div key={c.id} style={{ marginBottom: 6 }}>
                      <p style={{ fontSize: 8, fontWeight: 700, color: '#fff' }}>{c.name}</p>
                      {c.issuer && <p style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{c.issuer}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'navy-pro':
        return (
          <div style={{ ...fontStyle, background: '#fff', minHeight: 640 }}>
            <div style={{ background: '#1e2d3d', padding: '12px 18px 10px' }}>
              <h1 style={{ fontSize: 15, fontWeight: 900, color: '#fff', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{name}</h1>
              <p style={{ fontSize: 8, color: '#5b9bd5', fontWeight: 600, marginBottom: 6 }}>{title}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', fontSize: 7.5, color: '#94a3b8' }}>
                {personal.email && <span>@ {personal.email}</span>}
                {personal.linkedin && <span>🔗 LinkedIn</span>}
                {personal.github && <span>🔗 Portfolio</span>}
                {personal.location && <span>📍 {personal.location}</span>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', minHeight: 530 }}>
              <div style={{ padding: '11px 13px 11px 15px', borderRight: '1px solid #f1f5f9' }}>
                {summary.text && <div style={{ marginBottom: 10 }}><h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '2px solid #111', paddingBottom: 2, marginBottom: 5 }}>Summary</h2><p style={{ fontSize: 8, color: '#333', lineHeight: 1.65 }}>{summary.text}</p></div>}
                <div style={{ marginBottom: 10 }}><h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '2px solid #111', paddingBottom: 2, marginBottom: 6 }}>Experience</h2>{experience.filter(e => e.company || e.role).map(e => <div key={e.id} style={{ marginBottom: 8, borderBottom: '1px dashed #f1f5f9', paddingBottom: 6 }}><strong style={{ fontSize: 8.5, color: '#111' }}>{e.role}</strong><div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '2px 0' }}><p style={{ fontSize: 8, color: '#5b9bd5', fontWeight: 600 }}>{e.company}</p>{e.duration && <span style={{ fontSize: 7.5, color: '#888' }}>📅 {e.duration}</span>}{e.location && <span style={{ fontSize: 7.5, color: '#888' }}>📍 {e.location}</span>}</div>{e.description && e.description.split('\n').filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 8, color: '#444', paddingLeft: 6, marginTop: 2 }}>• {l}</p>)}</div>)}{experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}</div>
                {languages.some(l => l.language) && (
                  <div>
                    <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '2px solid #111', paddingBottom: 2, marginBottom: 6 }}>Languages</h2>
                    {languages.filter(l => l.language).map((l) => (
                      <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        <div style={{ minWidth: 60 }}>
                          <p style={{ fontSize: 8.5, fontWeight: 600, color: '#111' }}>{l.language}</p>
                        </div>
                        <LanguageRatingDisplay language={l} activeColor="#1e2d3d" emptyColor="#e2e8f0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ padding: '11px 13px 11px 11px' }}>
                {skills.some(s => s.name) && (
                  <div style={{ marginBottom: 10 }}>
                    <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '2px solid #111', paddingBottom: 2, marginBottom: 6 }}>Skills</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {skills.filter(s => s.name).map(s => (
                        <span key={s.id} style={{ background: '#f1f5f9', color: '#334155', fontSize: 8, fontWeight: 600, padding: '2px 7px', borderRadius: 4, border: `1px solid ${(BADGE_COLORS[s.badge] || '#6366f1')}33`, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span>{s.name}</span>
                          <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} />
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ marginBottom: 10 }}>
                  <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '2px solid #111', paddingBottom: 2, marginBottom: 6 }}>Education</h2>
                  <EduBlock />
                </div>
                {certifications.some(c => c.name) && <div style={{ marginBottom: 10 }}><h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '2px solid #111', paddingBottom: 2, marginBottom: 6 }}>Certifications</h2>{certifications.filter(c => c.name).map(c => <div key={c.id} style={{ marginBottom: 6, borderBottom: '1px dashed #f1f5f9', paddingBottom: 5 }}><p style={{ fontSize: 8.5, fontWeight: 700, color: '#5b9bd5' }}>{c.name}</p>{c.issuer && <p style={{ fontSize: 7.5, color: '#555' }}>{c.issuer}</p>}{c.description && <p style={{ fontSize: 7.5, color: '#555', lineHeight: 1.4, marginTop: 1 }}>{c.description}</p>}</div>)}</div>}
                {projects.some(p => p.name) && <div><h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '2px solid #111', paddingBottom: 2, marginBottom: 6 }}>Projects</h2>{projects.filter(p => p.name).map(p => <div key={p.id} style={{ display: 'flex', gap: 5, marginBottom: 6 }}><span style={{ fontSize: 10, flexShrink: 0 }}>✏️</span><div><p style={{ fontSize: 8.5, fontWeight: 700, color: '#111' }}>{p.name}</p>{p.stack && <p style={{ fontSize: 8, color: '#5b9bd5' }}>{p.stack}</p>}{p.description && <p style={{ fontSize: 8, color: '#555', lineHeight: 1.4, marginTop: 1 }}>{p.description}</p>}</div></div>)}</div>}
              </div>
            </div>
          </div>
        );

      case 'civil-pro':
        return (
          <div style={{ ...fontStyle, display: 'flex', flexDirection: 'column', background: '#fff', minHeight: 640 }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '13px 17px 10px 13px', gap: 13, borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ position: 'relative', flexShrink: 0, width: 74, height: 74 }}>
                <div style={{ position: 'absolute', left: -5, top: -5, width: 38, height: 38, background: col, clipPath: 'polygon(0 0, 100% 0, 0 100%)', zIndex: 0 }} />
                <PhotoCircle size={74} style={{ position: 'relative', zIndex: 1, border: `2px solid ${col}33` }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 3 }}>
                  {name.split(' ').length > 1
                    ? <><span style={{ fontSize: 20, fontWeight: 900, color: col, letterSpacing: -0.5 }}>{name.split(' ')[0].toUpperCase()}</span><span style={{ fontSize: 20, fontWeight: 300, color: col, letterSpacing: -0.5 }}>{name.split(' ').slice(1).join(' ').toUpperCase()}</span></>
                    : <span style={{ fontSize: 20, fontWeight: 900, color: col }}>{name.toUpperCase()}</span>}
                </div>
                <p style={{ fontSize: 9, color: '#555', fontStyle: 'italic', marginBottom: 5 }}>{title}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 13px', fontSize: 7.5 }}>
                  {personal.phone && <span style={{ color: '#333' }}>📞 {personal.phone}</span>}
                  {personal.email && <span style={{ color: '#333' }}>✉ {personal.email}</span>}
                  {personal.linkedin && <span style={{ color: '#333' }}>🔗 {personal.linkedin}</span>}
                  {personal.location && <span style={{ color: '#333' }}>📍 {personal.location}</span>}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flex: 1 }}>
              <div style={{ width: 152, flexShrink: 0, padding: '12px 11px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 9.5, fontWeight: 900, textTransform: 'uppercase', color: col, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Skills</h2>
                  {skills.filter(s => s.name).length > 0
                    ? skills.filter(s => s.name).map(s => (
                        <div key={s.id} style={{ marginBottom: 5 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: 8, color: '#333' }}><strong>{s.name}</strong></p>
                            <SkillRatingDisplay levelNum={s.levelNum} badge={s.badge} />
                          </div>
                        </div>
                      ))
                    : <p style={{ fontSize: 8, color: '#ccc', fontStyle: 'italic' }}>Skills here…</p>}
                </div>
                {certifications.some(c => c.name) && (
                  <div>
                    <h2 style={{ fontSize: 9.5, fontWeight: 900, textTransform: 'uppercase', color: col, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Certifications</h2>
                    {certifications.filter(c => c.name).map(c => (
                      <div key={c.id} style={{ marginBottom: 6 }}>
                        <p style={{ fontSize: 8, fontWeight: 700, color: '#111', lineHeight: 1.3 }}>{c.name}</p>
                        {c.issuer && <p style={{ fontSize: 7.5, color: '#555', marginTop: 1 }}>{c.issuer}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {projects.some(p => p.name) && (
                  <div>
                    <h2 style={{ fontSize: 9.5, fontWeight: 900, textTransform: 'uppercase', color: col, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Key Projects</h2>
                    {projects.filter(p => p.name).map(p => (
                      <div key={p.id} style={{ marginBottom: 7 }}>
                        <p style={{ fontSize: 8, fontWeight: 700, color: '#111', marginBottom: 2 }}>{p.name}</p>
                        {p.stack && <p style={{ fontSize: 7.5, color: '#555' }}>{p.stack}</p>}
                        {p.description && <p style={{ fontSize: 7.5, color: '#444', lineHeight: 1.5 }}>{p.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {languages.some(l => l.language) && (
                  <div>
                    <h2 style={{ fontSize: 9.5, fontWeight: 900, textTransform: 'uppercase', color: col, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Languages</h2>
                    {languages.filter(l => l.language).map((l) => (
                      <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 8, color: '#333' }}>{l.language}</span>
                        <LanguageRatingDisplay language={l} activeColor={col} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, padding: '12px 15px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {summary.text && (
                  <div>
                    <h2 style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: col, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Professional Summary</h2>
                    <p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.7 }}>{summary.text}</p>
                  </div>
                )}
                <div>
                  <h2 style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: col, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 7 }}>Professional Experience</h2>
                  {experience.filter(e => e.company || e.role).map(e => (
                    <div key={e.id} style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: '#111' }}>{e.role}{e.company ? ` – ${e.company}` : ''}</p>
                      {e.location && <p style={{ fontSize: 8, color: '#555', fontStyle: 'italic' }}>{e.location}</p>}
                      {e.duration && <p style={{ fontSize: 8, color: '#555', fontStyle: 'italic', marginBottom: 3 }}>{e.duration}</p>}
                      {e.description && e.description.split('\n').filter(Boolean).map((line, i) => (
                        <div key={i} style={{ display: 'flex', gap: 5, marginTop: 3 }}>
                          <span style={{ color: col, fontSize: 9, flexShrink: 0 }}>●</span>
                          <p style={{ fontSize: 8, color: '#333', lineHeight: 1.6 }}>{line}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                  {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
                </div>
                <div>
                  <h2 style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: col, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Education</h2>
                  <EduBlock />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div style={{ ...fontStyle, padding: 20, background: '#fff' }}>
            <h3 style={{ fontSize: 16, color: '#111' }}>{name}</h3>
            <p style={{ color: '#64748b', fontSize: 10, marginTop: 4 }}>{title}</p>
            {summary.text && <p style={{ fontSize: 8.5, color: '#333', marginTop: 12, lineHeight: 1.6 }}>{summary.text}</p>}
          </div>
        );
    }
  };

  // ─── Final render ──────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Page 1: Real resume content ── */}
      <div style={{ position: 'relative', minHeight: 842, background: '#fff' }}>
        {renderPage1()}
        {totalPages > 1 && <PageFooter cur={1} total={totalPages} font={font} />}
      </div>

      {/* ── Pages 2+: Blank continuation skeleton only ── */}
      {validExtraPages > 0 &&
        Array.from({ length: validExtraPages }).map((_, i) => (
          <React.Fragment key={`continuation-page-${i}`}>
            <PageBreakDivider />
            <div style={{ background: '#fff', minHeight: 842, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
              <ContinuationHeader structure={tpl.structure} personal={personal} accentColor={col} font={font} />
              <BlankBody structure={tpl.structure} accentColor={col} font={font} />
              <div style={{ marginTop: 'auto' }}>
                <PageFooter cur={i + 2} total={totalPages} font={font} />
              </div>
            </div>
          </React.Fragment>
        ))}
    </>
  );
}
