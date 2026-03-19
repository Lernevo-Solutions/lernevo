import React from 'react';

// ─── GalleryPreview ───────────────────────────────────────────────────────────
// Each case matches EXACTLY the uploaded screenshot for that template id/structure
//
// template_1  (id:1)  → classic-minimal  → Herman Walton: blue accent, photo top-right, SUMMARY/EXP/EDU/SKILLS/ADDITIONAL
// template_2  (id:2)  → serif-pro        → Arthur Sherman: huge name top-left, thin divider, left sidebar INFO/SKILLS/LANGS, right PROFILE/EMPLOYMENT
// templates3  (id:3)  → clean-centered   → Susan Stone: photo+name header, right col skills, PROFILE/EMPLOYMENT/EDU
// template_5  (id:5)  → data-pro-ats     → Andrew O'Sullivan: centered serif name, italic title, contact bar, PROFILE/EXP/EDU/SKILLS/LANGS/AWARDS
// template_6  (id:6)  → bold-two-col     → Jacob McLaren: centered name, SUMMARY/EDUCATION/WORK EXP/TECHNICAL EXPERTISE
// template_7  (id:7)  → minimalist-top   → Meghana Hegde: large bold name, italic title, pipe contact, full-width sections
// template_8  (id:8)  → section-shade    → Elio Giordano: circle photo + 2col left/right with shaded headers
// template_9  (id:9)  → photo-ats        → Anna Field: name top-left, 2-col grid, shaded section titles centered
// template_10 (id:10) → teal-split       → Andrew Kim: left sidebar (gray bg), right main
// template_11 (id:11) → two-column       → Anna Field (photo): blue top bar, photo+name header, date-left layout
// template_12 (id:12) → ashley-sidebar   → Andrew Sullivan: centered circle photo, 2-col body shaded
// template_13 (id:13) → graphic-split    → James Kayode: rect photo top-left, ALL-CAPS name, personal profile/exp/edu/cert
// template_14 (id:14) → serif-ats        → Zoey Walker: left main + right teal sidebar with photo
// template_17 (id:17) → navy-pro         → Layla Wyatt: navy header band + 2-col body
// template_18 (id:18) → civil-pro        → Mark Smith: triangle accent photo, sidebar+main

export default function GalleryPreview({ tpl, data, accentColor, font }) {
  const { personal, summary, experience, education, skills, projects, certifications, languages } = data;
  const col = accentColor || '#2563eb';

  const name  = personal.name  || 'Your Name';
  const title = personal.title || 'Your Professional Title';
  const photo = personal.photo;
  const fontStyle = { fontFamily: `'${font}', sans-serif` };

  // ── Shared helpers ──────────────────────────────────────────────────────────
  const PhotoCircle = ({ size = 64, style = {} }) => photo
    ? <img src={photo} alt="profile" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'block', ...style }} />
    : <div style={{ width: size, height: size, borderRadius: '50%', background: col + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', color: col, fontWeight: 800, fontSize: size * 0.36, flexShrink: 0, ...style }}>
        {name[0]?.toUpperCase()}
      </div>;

  const PhotoRect = ({ w = 90, h = 100, style = {} }) => photo
    ? <img src={photo} alt="profile" style={{ width: w, height: h, objectFit: 'cover', flexShrink: 0, ...style }} />
    : <div style={{ width: w, height: h, background: col + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: col, fontWeight: 800, fontSize: 22, flexShrink: 0, ...style }}>
        {name[0]?.toUpperCase()}
      </div>;

  const LevelDots = ({ filled, total = 5, dotCol = col, emptyCol = '#e2e8f0', size = 7 }) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ width: size, height: size, borderRadius: '50%', background: i < filled ? dotCol : emptyCol }} />
      ))}
    </div>
  );

  const profDots = p => p === 'Native' ? 5 : p === 'Fluent' ? 4 : p === 'Advanced' ? 3 : 2;

  const ExpItems = ({ compact = false }) => (
    <div>
      {experience.filter(e => e.company || e.role).map(e => (
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
      {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
    </div>
  );

  const EduBlock = () => (education.degree || education.college)
    ? <div>
        <strong style={{ fontSize: 9 }}>{education.degree}</strong>
        {education.college && <p style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>{education.college}</p>}
        {education.year && <p style={{ fontSize: 8, color: '#888' }}>{education.year}{education.gpa ? ` | GPA: ${education.gpa}` : ''}</p>}
      </div>
    : <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Education here…</p>;

  // ═══════════════════════════════════════════════════════════════════════════
  switch (tpl.structure) {

    // ─── BLANK ──────────────────────────────────────────────────────────────
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

    // ═══════════════════════════════════════════════════════════════════════════
    // template_1 (id:1) → structure: 'classic-minimal'
    // Herman Walton style: bold name top-left, photo top-right, blue accent underline sections
    // SUMMARY / PROFESSIONAL EXPERIENCE / EDUCATION / TECHNICAL SKILLS / ADDITIONAL INFORMATION
    // ═══════════════════════════════════════════════════════════════════════════
    case 'classic-minimal':
      return (
        <div style={{ ...fontStyle, background: '#fff', padding: '18px 22px', minHeight: 640 }}>
          {/* Header: name+title+contact LEFT, photo RIGHT */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{name}</h1>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '3px 0 6px', textTransform: 'uppercase', letterSpacing: 0.3 }}>{title}</h2>
              <p style={{ fontSize: 8, color: '#555' }}>
                {[personal.location, personal.phone, personal.email].filter(Boolean).join(' | ')}
              </p>
            </div>
            <PhotoRect w={72} h={72} style={{ borderRadius: 4, marginLeft: 12, flexShrink: 0 }} />
          </div>

          {/* SUMMARY */}
          {summary.text && (
            <div style={{ marginBottom: 10 }}>
              <h2 style={{ fontSize: 10, fontWeight: 800, color: col, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 5 }}>Summary</h2>
              <p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.65 }}>{summary.text}</p>
            </div>
          )}

          {/* PROFESSIONAL EXPERIENCE */}
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

          {/* EDUCATION */}
          <div style={{ marginBottom: 10 }}>
            <h2 style={{ fontSize: 10, fontWeight: 800, color: col, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Education</h2>
            {(education.degree || education.college) ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: 9 }}>{education.degree}</strong>
                  <span style={{ fontSize: 8, color: '#555' }}>{education.year}</span>
                </div>
                <p style={{ fontSize: 8.5, color: '#555' }}>{education.college}</p>
                {education.gpa && <p style={{ fontSize: 8.5, color: '#333', paddingLeft: 8 }}>• {education.gpa}</p>}
              </div>
            ) : <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Education here…</p>}
          </div>

          {/* TECHNICAL SKILLS */}
          {skills.some(s => s.name) && (
            <div style={{ marginBottom: 10 }}>
              <h2 style={{ fontSize: 10, fontWeight: 800, color: col, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Technical Skills</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '3px 12px' }}>
                {skills.filter(s => s.name).map(s => (
                  <p key={s.id} style={{ fontSize: 8.5, color: '#333' }}>{s.name}</p>
                ))}
              </div>
            </div>
          )}

          {/* ADDITIONAL INFORMATION */}
          {(languages.some(l => l.language) || certifications.some(c => c.name)) && (
            <div>
              <h2 style={{ fontSize: 10, fontWeight: 800, color: col, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Additional Information</h2>
              {languages.some(l => l.language) && (
                <p style={{ fontSize: 8.5, color: '#333', marginBottom: 3 }}>
                  <strong>Languages:</strong> {languages.filter(l => l.language).map(l => l.language).join(', ')}
                </p>
              )}
              {certifications.some(c => c.name) && (
                <p style={{ fontSize: 8.5, color: '#333', marginBottom: 3 }}>
                  <strong>Certificates:</strong> {certifications.filter(c => c.name).map(c => c.name).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      );

    // ═══════════════════════════════════════════════════════════════════════════
    // template_2 (id:2) → structure: 'serif-pro'
    // Arthur Sherman style: HUGE bold name top-left, thin subtitle, thin divider
    // Left col: INFO (address/phone/email) + SKILLS (bars) + LANGUAGES (bars)
    // Right col: PROFILE + EMPLOYMENT HISTORY (bullets)
    // ═══════════════════════════════════════════════════════════════════════════
    case 'serif-pro':
      return (
        <div style={{ ...fontStyle, background: '#fff', minHeight: 640 }}>
          {/* Big name top */}
          <div style={{ padding: '20px 20px 10px' }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111', margin: 0, lineHeight: 1.1, textTransform: 'uppercase' }}>{name}</h1>
            <p style={{ fontSize: 10, color: '#555', marginTop: 4, letterSpacing: 0.3 }}>{title}</p>
            <div style={{ height: 1, background: '#ddd', margin: '10px 0' }} />
          </div>

          {/* Two-col body */}
          <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr', minHeight: 540 }}>
            {/* LEFT: INFO / SKILLS / LANGUAGES */}
            <div style={{ padding: '0 16px 16px 20px', borderRight: '1px solid #e5e7eb' }}>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#111', marginBottom: 8, borderBottom: '2px solid #111', paddingBottom: 3 }}>Info</h3>
                <p style={{ fontSize: 8, fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Address</p>
                <p style={{ fontSize: 8.5, color: '#444', marginBottom: 8 }}>{personal.location || '—'}</p>
                <p style={{ fontSize: 8, fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Phone</p>
                <p style={{ fontSize: 8.5, color: '#444', marginBottom: 8 }}>{personal.phone || '—'}</p>
                <p style={{ fontSize: 8, fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Email</p>
                <p style={{ fontSize: 8.5, color: '#444', marginBottom: 8, wordBreak: 'break-all' }}>{personal.email || '—'}</p>
                {personal.linkedin && <>
                  <p style={{ fontSize: 8, fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>LinkedIn</p>
                  <p style={{ fontSize: 8.5, color: '#444' }}>{personal.linkedin}</p>
                </>}
              </div>

              {skills.some(s => s.name) && (
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#111', marginBottom: 8, borderBottom: '2px solid #111', paddingBottom: 3 }}>Skills</h3>
                  {skills.filter(s => s.name).map(s => {
                    const w = s.level === 'Expert' ? '90%' : s.level === 'Advanced' ? '72%' : s.level === 'Intermediate' ? '55%' : '35%';
                    return (
                      <div key={s.id} style={{ marginBottom: 7 }}>
                        <p style={{ fontSize: 8.5, color: '#111', marginBottom: 2 }}>{s.name}</p>
                        <div style={{ height: 4, background: '#e5e7eb', borderRadius: 0 }}>
                          <div style={{ width: w, height: 4, background: '#111' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {languages.some(l => l.language) && (
                <div>
                  <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#111', marginBottom: 8, borderBottom: '2px solid #111', paddingBottom: 3 }}>Languages</h3>
                  {languages.filter(l => l.language).map(l => {
                    const w = l.proficiency === 'Native' ? '100%' : l.proficiency === 'Fluent' ? '80%' : l.proficiency === 'Advanced' ? '62%' : '45%';
                    return (
                      <div key={l.id} style={{ marginBottom: 7 }}>
                        <p style={{ fontSize: 8.5, color: '#111', marginBottom: 2 }}>{l.language}</p>
                        <div style={{ height: 4, background: '#e5e7eb' }}>
                          <div style={{ width: w, height: 4, background: '#111' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT: PROFILE / EMPLOYMENT / EDUCATION */}
            <div style={{ padding: '0 20px 16px 16px' }}>
              {summary.text && (
                <div style={{ marginBottom: 14 }}>
                  <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#111', marginBottom: 6, borderBottom: '2px solid #111', paddingBottom: 3 }}>Profile</h3>
                  <p style={{ fontSize: 8.5, color: '#444', lineHeight: 1.7, textAlign: 'justify' }}>{summary.text}</p>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#111', marginBottom: 8, borderBottom: '2px solid #111', paddingBottom: 3 }}>Employment History</h3>
                {experience.filter(e => e.company || e.role).map(e => (
                  <div key={e.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: 9 }}>{e.role}{e.company ? `, ${e.company}` : ''}</strong>
                      <span style={{ fontSize: 8, color: '#888', whiteSpace: 'nowrap', marginLeft: 6 }}>{e.location}</span>
                    </div>
                    <p style={{ fontSize: 8, color: '#888', marginBottom: 3 }}>{e.duration}</p>
                    {e.description && e.description.split('\n').filter(Boolean).map((l, i) => (
                      <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 0, marginTop: 2 }}>• {l}</p>
                    ))}
                  </div>
                ))}
                {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
              </div>

              {(education.degree || education.college) && (
                <div>
                  <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#111', marginBottom: 8, borderBottom: '2px solid #111', paddingBottom: 3 }}>Education</h3>
                  <EduBlock />
                </div>
              )}
            </div>
          </div>
        </div>
      );

    // ═══════════════════════════════════════════════════════════════════════════
    // templates3 (id:3) → structure: 'clean-centered'
    // Susan Stone style: photo+name+title top-left, right col SKILLS with underline
    // Below: PROFILE / EMPLOYMENT HISTORY / EDUCATION
    // ═══════════════════════════════════════════════════════════════════════════
    case 'clean-centered':
     return (
        <div style={{ ...fontStyle, background: '#fff', padding: '20px 26px', minHeight: 640 }}>
          {/* Centered header */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <h1 style={{ fontSize: 21, fontWeight: 700, color: '#111', margin: 0 }}>{name}</h1>
            <p style={{ fontSize: 10, color: '#555', fontStyle: 'italic', marginTop: 3 }}>{title}</p>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 16px', fontSize: 8.5, color: '#333', marginTop: 6, borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '5px 0' }}>
              {personal.location && <span>📍 {personal.location}</span>}
              {personal.email    && <span>✉ {personal.email}</span>}
              {personal.phone    && <span>📞 {personal.phone}</span>}
              {personal.linkedin && <span>in {personal.linkedin}</span>}
            </div>
          </div>

          {/* PROFILE */}
          {summary.text && (
            <div style={{ marginBottom: 10 }}>
              <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 6, color: '#111' }}>Profile</h2>
              <p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.7, textAlign: 'justify' }}>{summary.text}</p>
            </div>
          )}

          {/* PROFESSIONAL EXPERIENCE */}
          <div style={{ marginBottom: 10 }}>
            <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 7, color: '#111' }}>Professional Experience</h2>
            {experience.filter(e => e.company || e.role).map(e => (
              <div key={e.id} style={{ marginBottom: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: 9 }}>{e.role}</strong>
                  <span style={{ fontSize: 8, color: '#555' }}>{e.duration}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>{e.company}</p>
                  {e.location && <span style={{ fontSize: 8, color: '#555' }}>{e.location}</span>}
                </div>
                {e.description && e.description.split('\n').filter(Boolean).map((l, i) => (
                  <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>
                ))}
              </div>
            ))}
            {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
          </div>

          {/* EDUCATION */}
          <div style={{ marginBottom: 10 }}>
            <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 7, color: '#111' }}>Education</h2>
            {(education.degree || education.college) ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: 9 }}>{education.degree}</strong>
                  <span style={{ fontSize: 8, color: '#555' }}>{education.year}</span>
                </div>
                <p style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>{education.college}</p>
                {education.gpa && <p style={{ fontSize: 8, color: '#777' }}>{education.gpa}</p>}
              </div>
            ) : <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Education here…</p>}
          </div>

          {/* SKILLS */}
          {skills.some(s => s.name) && (
            <div style={{ marginBottom: 10 }}>
              <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 7, color: '#111' }}>Skills</h2>
              {skills.filter(s => s.name).map(s => (
                <p key={s.id} style={{ fontSize: 8.5, color: '#333', marginBottom: 3 }}>• {s.name}</p>
              ))}
            </div>
          )}

          {/* LANGUAGES */}
          {languages.some(l => l.language) && (
            <div style={{ marginBottom: 10 }}>
              <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 7, color: '#111' }}>Languages</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px 0' }}>
                {languages.filter(l => l.language).map(l => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 8.5, color: '#333', minWidth: 45 }}>{l.language}</span>
                    <LevelDots filled={profDots(l.proficiency)} dotCol='#111' emptyCol='#ddd' size={6} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AWARDS */}
          {certifications.some(c => c.name) && (
            <div>
              <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 7, color: '#111' }}>Awards</h2>
              {certifications.filter(c => c.name).map(c => (
                <div key={c.id} style={{ marginBottom: 5 }}>
                  <strong style={{ fontSize: 9 }}>{c.name}</strong>
                  {c.issuer && <p style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>{c.issuer}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      );

    // ═══════════════════════════════════════════════════════════════════════════
    // template_5 (id:5) → structure: 'data-pro-ats'
    // Andrew O'Sullivan style: centered serif name, italic title, icon contact bar
    // PROFILE / PROFESSIONAL EXPERIENCE / EDUCATION / SKILLS / LANGUAGES / AWARDS
    // ═══════════════════════════════════════════════════════════════════════════
    case 'data-pro-ats':
      return (
        <div style={{ ...fontStyle, background: '#fff', minHeight: 640 }}>
          {/* Header row */}
          <div style={{ display: 'flex', gap: 14, padding: '18px 20px 12px', alignItems: 'flex-start' }}>
            <PhotoRect w={88} h={88} style={{ borderRadius: 4 }} />
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: col, margin: 0, lineHeight: 1.2 }}>
                {name}{title ? `, ${title}` : ''}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px', fontSize: 7.5, color: '#555', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {personal.location && <span>{personal.location}</span>}
                {personal.email    && <span>· {personal.email}</span>}
                {personal.phone    && <span>· {personal.phone}</span>}
              </div>
            </div>
            {/* Right col: SKILLS */}
            {skills.some(s => s.name) && (
              <div style={{ width: 155, flexShrink: 0, paddingLeft: 14 }}>
                <h3 style={{ fontSize: 8.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#111', marginBottom: 8 }}>Skills</h3>
                {skills.filter(s => s.name).map(s => (
                  <div key={s.id} style={{ marginBottom: 7 }}>
                    <p style={{ fontSize: 8.5, color: '#333', marginBottom: 3 }}>{s.name}</p>
                    <div style={{ height: 1, background: '#ccc' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ height: 1, background: '#e5e7eb', margin: '0 20px' }} />

          <div style={{ padding: '10px 20px' }}>
            {/* PROFILE */}
            {summary.text && (
              <div style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#111', marginBottom: 5 }}>Profile</h2>
                <p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.7, textAlign: 'justify' }}>{summary.text}</p>
              </div>
            )}

            {/* EMPLOYMENT HISTORY */}
            {experience.some(e => e.company || e.role) && (
              <div style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#111', marginBottom: 7 }}>Employment History</h2>
                {experience.filter(e => e.company || e.role).map(e => (
                  <div key={e.id} style={{ marginBottom: 10 }}>
                    <strong style={{ fontSize: 9 }}>{e.role}{e.company ? `, ${e.company}` : ''}</strong>
                    <p style={{ fontSize: 8, color: '#888', marginTop: 1, marginBottom: 3 }}>{e.duration}{e.location ? ` — ${e.location}` : ''}</p>
                    {e.description && e.description.split('\n').filter(Boolean).map((l, i) => (
                      <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* EDUCATION */}
            {(education.degree || education.college) && (
              <div>
                <h2 style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#111', marginBottom: 7 }}>Education</h2>
                <strong style={{ fontSize: 9 }}>{education.college}{education.degree ? `, ${education.degree}` : ''}</strong>
                <p style={{ fontSize: 8, color: '#888', marginTop: 1 }}>{education.year}{education.gpa ? ` — ${education.gpa}` : ''}</p>
                {education.gpa && <p style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {education.gpa}</p>}
              </div>
            )}
          </div>
        </div>
      );

    // ═══════════════════════════════════════════════════════════════════════════
    // template_6 (id:6) → structure: 'bold-two-col'
    // Jacob McLaren style: centered name (serif), icon contact bar, bold ALL-CAPS section titles
    // SUMMARY / EDUCATION / WORK EXPERIENCE / TECHNICAL EXPERTISE
    // ═══════════════════════════════════════════════════════════════════════════
    case 'bold-two-col':
      return (
        <div style={{ ...fontStyle, background: '#fff', padding: '20px 28px', minHeight: 640 }}>
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <h1 style={{ fontSize: 21, fontWeight: 700, color: '#111', margin: 0 }}>{name}</h1>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 18px', fontSize: 8.5, color: '#333', marginTop: 8 }}>
              {personal.location && <span>📍 {personal.location}</span>}
              {personal.email    && <span>✉ {personal.email}</span>}
              {personal.phone    && <span>📞 {personal.phone}</span>}
            </div>
          </div>

          {summary.text && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 6 }}>
                <strong style={{ fontSize: 10, letterSpacing: 0.5 }}>SUMMARY</strong>
              </div>
              <p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.65 }}>{summary.text}</p>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 7 }}>
              <strong style={{ fontSize: 10, letterSpacing: 0.5 }}>EDUCATION</strong>
            </div>
            {(education.degree || education.college) ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: 9, textTransform: 'uppercase' }}>{education.college},</strong>
                  <span style={{ fontSize: 8.5, color: '#555' }}>{education.year}</span>
                </div>
                <p style={{ fontSize: 8.5, fontStyle: 'italic', color: '#444' }}>{education.degree}</p>
                {education.gpa && <p style={{ fontSize: 8.5, color: '#333', paddingLeft: 8 }}>• GPA: {education.gpa}</p>}
              </div>
            ) : <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Education here…</p>}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 7 }}>
              <strong style={{ fontSize: 10, letterSpacing: 0.5 }}>WORK EXPERIENCE</strong>
            </div>
            {experience.filter(e => e.company || e.role).map(e => (
              <div key={e.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: 9, textTransform: 'uppercase' }}>{e.company},</strong>
                  <span style={{ fontSize: 8.5, color: '#555' }}>{e.duration}{e.location ? ` | ${e.location}` : ''}</span>
                </div>
                <p style={{ fontSize: 8.5, fontStyle: 'italic', color: '#555', marginBottom: 3 }}>{e.role}</p>
                {e.description && e.description.split('\n').filter(Boolean).map((l, i) => (
                  <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>
                ))}
              </div>
            ))}
            {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
          </div>

          {skills.some(s => s.name) && (
            <div>
              <div style={{ borderBottom: '1.5px solid #333', paddingBottom: 2, marginBottom: 7 }}>
                <strong style={{ fontSize: 10, letterSpacing: 0.5 }}>TECHNICAL EXPERTISE</strong>
              </div>
              <p style={{ fontSize: 8.5, color: '#333' }}>{skills.filter(s => s.name).map(s => s.name).join(', ')}</p>
            </div>
          )}
        </div>
      );

    // ═══════════════════════════════════════════════════════════════════════════
    // template_7 (id:7) → structure: 'minimalist-top'
    // Meghana Hegde style: large bold centered name, italic subtitle, pipe contact
    // PROFESSIONAL SUMMARY / WORK EXPERIENCE / EDUCATION / SKILLS / ACADEMIC PROJECTS / CERTIFICATIONS
    // ═══════════════════════════════════════════════════════════════════════════
    case 'minimalist-top':
      return (
        <div style={{ ...fontStyle, background: '#fff', padding: '18px 24px', minHeight: 640 }}>
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <h1 style={{ fontSize: 19, fontWeight: 800, color: '#111', margin: 0 }}>{name}</h1>
            <p style={{ fontSize: 10, fontStyle: 'italic', color: '#444', marginTop: 3 }}>{title}</p>
            <p style={{ fontSize: 8, color: '#333', marginTop: 5 }}>
              {[personal.email, personal.phone, personal.location, personal.linkedin, personal.github].filter(Boolean).join(' | ')}
            </p>
          </div>

          {summary.text && (
            <div style={{ marginBottom: 9 }}>
              <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 5, color: '#111' }}>Professional Summary</h2>
              <p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.65 }}>{summary.text}</p>
            </div>
          )}

          {experience.some(e => e.company || e.role) && (
            <div style={{ marginBottom: 9 }}>
              <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 6, color: '#111' }}>Work Experience</h2>
              {experience.filter(e => e.company || e.role).map(e => (
                <div key={e.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      <strong style={{ fontSize: 9 }}>{e.company}</strong>
                      {e.role && <span style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>, {e.role}</span>}
                    </span>
                    <span style={{ fontSize: 8, color: '#555', whiteSpace: 'nowrap' }}>{e.duration}{e.location ? ` | ${e.location}` : ''}</span>
                  </div>
                  {e.description && e.description.split('\n').filter(Boolean).map((l, i) => (
                    <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 10, marginTop: 2 }}>• {l}</p>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: 9 }}>
            <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 6, color: '#111' }}>Education</h2>
            {(education.degree || education.college) ? (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  <strong style={{ fontSize: 9 }}>{education.degree}</strong>
                  {education.college && <span style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>, {education.college}</span>}
                </span>
                <span style={{ fontSize: 8, color: '#555' }}>{education.year}</span>
              </div>
            ) : <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Education here…</p>}
          </div>

          {skills.some(s => s.name) && (
            <div style={{ marginBottom: 9 }}>
              <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 6, color: '#111' }}>Skills</h2>
              {skills.filter(s => s.name).map(s => (
                <p key={s.id} style={{ fontSize: 8.5, color: '#333', marginBottom: 2 }}>
                  <strong>{s.name}:</strong> {s.level}
                </p>
              ))}
            </div>
          )}

          {projects.some(p => p.name) && (
            <div style={{ marginBottom: 9 }}>
              <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 6, color: '#111' }}>Academic Projects</h2>
              {projects.filter(p => p.name).map(p => (
                <div key={p.id} style={{ marginBottom: 6 }}>
                  <span><strong style={{ fontSize: 9 }}>{p.name}</strong>{p.stack && <span style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>, {p.stack}</span>}</span>
                  {p.description && p.description.split('\n').filter(Boolean).map((l, i) => (
                    <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 10, marginTop: 2 }}>• {l}</p>
                  ))}
                </div>
              ))}
            </div>
          )}

          {certifications.some(c => c.name) && (
            <div>
              <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', borderBottom: '1.5px solid #111', paddingBottom: 2, marginBottom: 6, color: '#111' }}>Certifications</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 16px' }}>
                {certifications.filter(c => c.name).map(c => (
                  <p key={c.id} style={{ fontSize: 8.5, color: '#333' }}>• {c.name}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    // ═══════════════════════════════════════════════════════════════════════════
    // template_8 (id:8) → structure: 'section-shade'
    // Elio Giordano style: circle photo top-left + name + accent-colored title + contact
    // Left col: EDUCATION + SKILLS + LANGUAGES
    // Right col: WORK EXPERIENCE + PROJECTS
    // ═══════════════════════════════════════════════════════════════════════════
    case 'section-shade':
      return (
        <div style={{ ...fontStyle, background: '#fff', minHeight: 640 }}>
          {/* Header */}
          <div style={{ display: 'flex', gap: 14, padding: '14px 18px 10px', alignItems: 'flex-start' }}>
            <PhotoCircle size={72} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 19, fontWeight: 900, color: '#111', margin: 0 }}>{name}</h1>
                <span style={{ fontSize: 12, fontStyle: 'italic', color: '#555', fontWeight: 400 }}>{title}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', fontSize: 8, color: '#333', marginTop: 6 }}>
                {personal.email    && <span>✉ {personal.email}</span>}
                {personal.phone    && <span>📞 {personal.phone}</span>}
                {personal.location && <span>📍 {personal.location}</span>}
                {personal.linkedin && <span>in {personal.linkedin}</span>}
                {personal.github   && <span>⌥ {personal.github}</span>}
              </div>
            </div>
          </div>
          <div style={{ height: 2, background: col }} />

          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
            {/* LEFT */}
            <div style={{ padding: '12px 14px', borderRight: `2px solid ${col}` }}>
              <div style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 9, fontWeight: 800, color: col, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>🎓 Education</h2>
                <EduBlock />
              </div>
              {skills.some(s => s.name) && (
                <div style={{ marginBottom: 12 }}>
                  <h2 style={{ fontSize: 9, fontWeight: 800, color: col, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>⚙ Skills</h2>
                  {skills.filter(s => s.name).map(s => (
                    <p key={s.id} style={{ fontSize: 8.5, color: '#333', marginBottom: 4, lineHeight: 1.4 }}>
                      <strong>{s.name}:</strong> {s.level}
                    </p>
                  ))}
                </div>
              )}
              {languages.some(l => l.language) && (
                <div>
                  <h2 style={{ fontSize: 9, fontWeight: 800, color: col, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>🌐 Languages</h2>
                  {languages.filter(l => l.language).map(l => (
                    <div key={l.id} style={{ marginBottom: 4 }}>
                      <strong style={{ fontSize: 8.5, color: '#111' }}>{l.language}:</strong>
                      <span style={{ fontSize: 8, color: '#555' }}> {l.proficiency}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div style={{ padding: '12px 16px' }}>
              <div style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 9, fontWeight: 800, color: col, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, borderBottom: `1.5px solid ${col}`, paddingBottom: 3 }}>💼 Work Experience</h2>
                {experience.filter(e => e.company || e.role).map(e => (
                  <div key={e.id} style={{ marginBottom: 10 }}>
                    <strong style={{ fontSize: 9 }}>{e.role},</strong>
                    <span style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}> {e.company}</span>
                    <p style={{ fontSize: 8, color: '#777', marginTop: 1 }}>{e.duration}{e.location ? ` | ${e.location}` : ''}</p>
                    {e.description && e.description.split('\n').filter(Boolean).map((l, i) => (
                      <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>
                    ))}
                  </div>
                ))}
                {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
              </div>

              {projects.some(p => p.name) && (
                <div>
                  <h2 style={{ fontSize: 9, fontWeight: 800, color: col, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, borderBottom: `1.5px solid ${col}`, paddingBottom: 3 }}>🚀 Projects</h2>
                  {projects.filter(p => p.name).map(p => (
                    <div key={p.id} style={{ marginBottom: 10 }}>
                      <strong style={{ fontSize: 9 }}>{p.name},</strong>
                      {p.stack && <span style={{ fontSize: 8, color: '#555', fontStyle: 'italic' }}> {p.stack}</span>}
                      {p.description && p.description.split('\n').filter(Boolean).map((l, i) => (
                        <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );

    // ═══════════════════════════════════════════════════════════════════════════
    // template_9 (id:9) → structure: 'photo-ats'
    // Anna Field (no-photo) style: name top-left, 2-col contact grid, light shaded section titles centered
    // Profile / Work Experience / Education / Skills (2-col) / Languages
    // ═══════════════════════════════════════════════════════════════════════════
    case 'photo-ats':
      return (
        <div style={{ ...fontStyle, background: '#fff', padding: '18px 22px', minHeight: 640 }}>
          <div style={{ marginBottom: 12 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>{name}</h1>
            <p style={{ fontSize: 11, color: '#333', marginTop: 2 }}>{title}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px', marginTop: 8, fontSize: 8.5, color: '#333' }}>
              {personal.location && <span>📍 {personal.location}</span>}
              {personal.email    && <span>✉ {personal.email}</span>}
              {personal.phone    && <span>📞 {personal.phone}</span>}
              {personal.linkedin && <span>in {personal.linkedin}</span>}
            </div>
          </div>

          {[
            { label: 'Profile', el: summary.text ? <p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.7, textAlign: 'justify' }}>{summary.text}</p> : null },
            {
              label: 'Work Experience',
              el: (
                <div>
                  {experience.filter(e => e.company || e.role).map(e => (
                    <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0 8px', marginBottom: 9 }}>
                      <div>
                        <strong style={{ fontSize: 9 }}>{e.role}</strong>
                        {e.company && <span style={{ fontSize: 8.5, color: '#333' }}>, {e.company}</span>}
                      </div>
                      <div style={{ textAlign: 'right', fontSize: 8, color: '#555', whiteSpace: 'nowrap' }}>
                        <div>{e.duration}</div>
                        <div>{e.location}</div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        {e.description && e.description.split('\n').filter(Boolean).map((l, i) => (
                          <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                  {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
                </div>
              )
            },
            { label: 'Education', el: (education.degree || education.college) ? <div style={{ display: 'flex', justifyContent: 'space-between' }}><div><strong style={{ fontSize: 9 }}>{education.degree}</strong>{education.college && <span style={{ fontSize: 8.5, color: '#333' }}>, {education.college}</span>}</div><span style={{ fontSize: 8, color: '#555' }}>{education.year}</span></div> : null },
            { label: 'Skills', el: skills.some(s => s.name) ? <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 20px' }}>{skills.filter(s => s.name).map(s => <p key={s.id} style={{ fontSize: 8.5, color: '#333' }}>• {s.name}</p>)}</div> : null },
            { label: 'Languages', el: languages.some(l => l.language) ? <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 20px' }}>{languages.filter(l => l.language).map(l => <p key={l.id} style={{ fontSize: 8.5, color: '#333' }}>• {l.language}</p>)}</div> : null },
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

    // ═══════════════════════════════════════════════════════════════════════════
    // template_10 (id:10) → structure: 'teal-split'
    // Andrew Kim style: left gray sidebar (name+italic title+contact+Profile+Certs+Languages bar)
    // Right main: Professional Experience / Education / Skills (name+italic desc)
    // ═══════════════════════════════════════════════════════════════════════════
    case 'teal-split':
     return (
        <div style={{ ...fontStyle, background: '#fff', display: 'flex', minHeight: 640 }}>
          {/* LEFT SIDEBAR */}
          <div style={{ width: 165, background: '#f7f7f7', borderRight: '1px solid #e5e7eb', padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 14, flexShrink: 0 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111', margin: 0, lineHeight: 1.2 }}>{name}</h2>
              <p style={{ fontSize: 9, color: col, fontStyle: 'italic', marginTop: 3 }}>{title}</p>
            </div>
            <div>
              <h6 style={{ fontSize: 7.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: col, borderBottom: `1.5px solid ${col}`, paddingBottom: 2, marginBottom: 7 }}>Contact</h6>
              {personal.location && <p style={{ fontSize: 8, color: '#444', marginBottom: 4 }}>📍 {personal.location}</p>}
              {personal.email    && <p style={{ fontSize: 8, color: '#444', marginBottom: 4 }}>✉ {personal.email}</p>}
              {personal.phone    && <p style={{ fontSize: 8, color: '#444', marginBottom: 4 }}>📞 {personal.phone}</p>}
              {personal.linkedin && <p style={{ fontSize: 8, color: '#444', marginBottom: 4 }}>in {personal.linkedin}</p>}
              {personal.github   && <p style={{ fontSize: 8, color: '#444', marginBottom: 4 }}>⌥ {personal.github}</p>}
            </div>

            {summary.text && (
              <div>
                <h6 style={{ fontSize: 7.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: col, borderBottom: `1.5px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Profile</h6>
                <p style={{ fontSize: 8, color: '#444', lineHeight: 1.6 }}>{summary.text}</p>
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
                {languages.filter(l => l.language).map(l => {
                  const pct = l.proficiency === 'Native' ? 100 : l.proficiency === 'Fluent' ? 78 : l.proficiency === 'Advanced' ? 62 : 45;
                  return (
                    <div key={l.id} style={{ marginBottom: 7 }}>
                      <p style={{ fontSize: 8, fontWeight: 600, color: '#333' }}>{l.language}</p>
                      <p style={{ fontSize: 7.5, color: '#888', fontStyle: 'italic' }}>{l.proficiency}</p>
                      <div style={{ height: 3, background: '#ddd', borderRadius: 1, marginTop: 2 }}>
                        <div style={{ width: `${pct}%`, height: 3, background: col, borderRadius: 1 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT MAIN */}
          <div style={{ flex: 1, padding: '18px 16px' }}>
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: 11, fontWeight: 800, color: col, borderBottom: `1.5px solid ${col}`, paddingBottom: 3, marginBottom: 8 }}>Professional Experience</h2>
              {experience.filter(e => e.company || e.role).map(e => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <strong style={{ fontSize: 9 }}>{e.company}</strong>
                  <p style={{ fontSize: 8.5, fontStyle: 'italic', color: '#555' }}>{e.role}</p>
                  <p style={{ fontSize: 8, color: '#777', marginBottom: 3 }}>{e.duration}{e.location ? ` | ${e.location}` : ''}</p>
                  {e.description && e.description.split('\n').filter(Boolean).map((l, i) => (
                    <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>
                  ))}
                </div>
              ))}
              {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
            </div>
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: 11, fontWeight: 800, color: col, borderBottom: `1.5px solid ${col}`, paddingBottom: 3, marginBottom: 7 }}>Education</h2>
              {(education.degree || education.college) ? (
                <div>
                  <strong style={{ fontSize: 9 }}>{education.college}</strong>
                  <p style={{ fontSize: 8.5, fontStyle: 'italic', color: '#555' }}>{education.degree}</p>
                  <p style={{ fontSize: 8, color: '#777' }}>{education.year}{education.gpa ? ` | ${education.gpa}` : ''}</p>
                </div>
              ) : <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Education here…</p>}
            </div>
            {skills.some(s => s.name) && (
              <div>
                <h2 style={{ fontSize: 11, fontWeight: 800, color: col, borderBottom: `1.5px solid ${col}`, paddingBottom: 3, marginBottom: 7 }}>Skills</h2>
                {skills.filter(s => s.name).map(s => (
                  <div key={s.id} style={{ marginBottom: 5 }}>
                    <strong style={{ fontSize: 9 }}>{s.name}</strong>
                    {s.level && <p style={{ fontSize: 8, color: '#888', fontStyle: 'italic' }}>{s.level}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );

    // ═══════════════════════════════════════════════════════════════════════════
    // template_11 (id:11) → structure: 'two-column'
    // Anna Field (photo) style: blue top bar, photo+name+italic title+contact header
    // Profile / Professional Experience (date-left grid) / Education (date-left) / Skills 2-col / Languages dots
    // ═══════════════════════════════════════════════════════════════════════════
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
                {personal.email    && <span>✉ {personal.email}</span>}
                {personal.phone    && <span>📞 {personal.phone}</span>}
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: '#e5e7eb', margin: '0 18px' }} />

          <div style={{ padding: '10px 18px' }}>
            {summary.text && (
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 10, fontWeight: 800, color: '#111', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>🪪 Profile</h2>
                <p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.7, textAlign: 'justify' }}>{summary.text}</p>
              </div>
            )}
            {experience.some(e => e.company || e.role) && (
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 10, fontWeight: 800, color: '#111', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>💼 Professional Experience</h2>
                {experience.filter(e => e.company || e.role).map(e => (
                  <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0 10px', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 8, color: col }}>{e.duration}</p>
                      {e.location && <p style={{ fontSize: 8, color: col }}>{e.location}</p>}
                    </div>
                    <div>
                      <strong style={{ fontSize: 9 }}>{e.role}</strong>
                      <p style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>{e.company}</p>
                      {e.description && e.description.split('\n').filter(Boolean).map((l, i) => (
                        <p key={i} style={{ fontSize: 8.5, color: '#333', marginTop: 2 }}>• {l}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginBottom: 10 }}>
              <h2 style={{ fontSize: 10, fontWeight: 800, color: '#111', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>🎓 Education</h2>
              {(education.degree || education.college) ? (
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0 10px' }}>
                  <p style={{ fontSize: 8, color: col }}>{education.year}</p>
                  <div>
                    <strong style={{ fontSize: 9 }}>{education.degree}</strong>
                    <p style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}>{education.college}</p>
                  </div>
                </div>
              ) : <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Education here…</p>}
            </div>
            {skills.some(s => s.name) && (
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 10, fontWeight: 800, color: '#111', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>⚙ Skills</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                  {skills.filter(s => s.name).map(s => (
                    <p key={s.id} style={{ fontSize: 8.5, color: '#333' }}>✏ {s.name}</p>
                  ))}
                </div>
              </div>
            )}
            {languages.some(l => l.language) && (
              <div>
                <h2 style={{ fontSize: 10, fontWeight: 800, color: '#111', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>🌐 Languages</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px 0' }}>
                  {languages.filter(l => l.language).map(l => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 8.5, color: '#333', minWidth: 40 }}>{l.language}</span>
                      <LevelDots filled={profDots(l.proficiency)} dotCol={col} emptyCol='#ddd' size={6} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );

    // ═══════════════════════════════════════════════════════════════════════════
    // template_12 (id:12) → structure: 'ashley-sidebar'
    // Andrew Sullivan (centered circle photo, red accent, 2-col body)
    // Top: centered photo + bold name + contact line
    // Left col: Profile / Education / Languages bar / Awards — shaded headers
    // Right col: Professional Experience / Skills / Projects — shaded headers
    // ═══════════════════════════════════════════════════════════════════════════
    case 'ashley-sidebar':
      return (
        <div style={{ ...fontStyle, background: '#fff', minHeight: 640 }}>
          <div style={{ textAlign: 'center', padding: '14px 20px 10px' }}>
            <PhotoCircle size={70} style={{ margin: '0 auto 8px', border: `3px solid ${col}` }} />
            <h1 style={{ fontSize: 19, fontWeight: 800, color: '#111', margin: 0 }}>{name}</h1>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 14px', fontSize: 8, color: '#333', marginTop: 5 }}>
              {personal.location && <span>{personal.location}</span>}
              {personal.email    && <span>• {personal.email}</span>}
              {personal.phone    && <span>• {personal.phone}</span>}
            </div>
          </div>
          <div style={{ height: 1, background: '#eee' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 490 }}>
            {/* LEFT */}
            <div style={{ padding: '10px 13px', borderRight: '1px solid #eee' }}>
              {summary.text && (
                <div style={{ marginBottom: 9 }}>
                  <div style={{ background: '#f8f8f8', padding: '3px 8px', marginBottom: 5 }}>
                    <h2 style={{ fontSize: 9.5, fontWeight: 700, color: col, margin: 0, textAlign: 'center' }}>Profile</h2>
                  </div>
                  <p style={{ fontSize: 8.5, color: '#333', lineHeight: 1.65, textAlign: 'justify' }}>{summary.text}</p>
                </div>
              )}
              <div style={{ marginBottom: 9 }}>
                <div style={{ background: '#f8f8f8', padding: '3px 8px', marginBottom: 5 }}>
                  <h2 style={{ fontSize: 9.5, fontWeight: 700, color: col, margin: 0, textAlign: 'center' }}>Education</h2>
                </div>
                {(education.degree || education.college) ? (
                  <div>
                    <strong style={{ fontSize: 8.5 }}>{education.degree},</strong>
                    <span style={{ fontSize: 8, color: '#555', fontStyle: 'italic' }}> {education.college}</span>
                    <p style={{ fontSize: 8, color: '#777', marginTop: 1 }}>{education.year}</p>
                  </div>
                ) : <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Education here…</p>}
              </div>
              {languages.some(l => l.language) && (
                <div style={{ marginBottom: 9 }}>
                  <div style={{ background: '#f8f8f8', padding: '3px 8px', marginBottom: 5 }}>
                    <h2 style={{ fontSize: 9.5, fontWeight: 700, color: col, margin: 0, textAlign: 'center' }}>Languages</h2>
                  </div>
                  {languages.filter(l => l.language).map(l => {
                    const pct = l.proficiency === 'Native' ? 100 : l.proficiency === 'Fluent' ? 80 : l.proficiency === 'Advanced' ? 65 : 50;
                    return (
                      <div key={l.id} style={{ marginBottom: 6 }}>
                        <p style={{ fontSize: 8.5, color: '#333', marginBottom: 2 }}>{l.language}</p>
                        <div style={{ height: 3, background: '#eee', borderRadius: 2 }}>
                          <div style={{ width: `${pct}%`, height: 3, background: col, borderRadius: 2 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {certifications.some(c => c.name) && (
                <div>
                  <div style={{ background: '#f8f8f8', padding: '3px 8px', marginBottom: 5 }}>
                    <h2 style={{ fontSize: 9.5, fontWeight: 700, color: col, margin: 0, textAlign: 'center' }}>Awards</h2>
                  </div>
                  {certifications.filter(c => c.name).map(c => (
                    <div key={c.id} style={{ marginBottom: 5 }}>
                      <strong style={{ fontSize: 9 }}>{c.name},</strong>
                      {c.issuer && <span style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}> {c.issuer}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div style={{ padding: '10px 13px' }}>
              <div style={{ marginBottom: 9 }}>
                <div style={{ background: '#f8f8f8', padding: '3px 8px', marginBottom: 5 }}>
                  <h2 style={{ fontSize: 9.5, fontWeight: 700, color: col, margin: 0, textAlign: 'center' }}>Professional Experience</h2>
                </div>
                {experience.filter(e => e.company || e.role).map(e => (
                  <div key={e.id} style={{ marginBottom: 8 }}>
                    <strong style={{ fontSize: 9 }}>{e.role},</strong>
                    <span style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic' }}> {e.company}</span>
                    <p style={{ fontSize: 8, color: '#777', marginTop: 1 }}>{e.duration}{e.location ? ` | ${e.location}` : ''}</p>
                    {e.description && e.description.split('\n').filter(Boolean).map((l, i) => (
                      <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>
                    ))}
                  </div>
                ))}
                {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
              </div>
              {skills.some(s => s.name) && (
                <div style={{ marginBottom: 9 }}>
                  <div style={{ background: '#f8f8f8', padding: '3px 8px', marginBottom: 5 }}>
                    <h2 style={{ fontSize: 9.5, fontWeight: 700, color: col, margin: 0, textAlign: 'center' }}>Skills</h2>
                  </div>
                  {skills.filter(s => s.name).map(s => (
                    <p key={s.id} style={{ fontSize: 8.5, color: '#333', marginBottom: 3 }}>• {s.name}</p>
                  ))}
                </div>
              )}
              {projects.some(p => p.name) && (
                <div>
                  <div style={{ background: '#f8f8f8', padding: '3px 8px', marginBottom: 5 }}>
                    <h2 style={{ fontSize: 9.5, fontWeight: 700, color: col, margin: 0, textAlign: 'center' }}>Projects</h2>
                  </div>
                  {projects.filter(p => p.name).map(p => (
                    <div key={p.id} style={{ marginBottom: 6 }}>
                      <strong style={{ fontSize: 9 }}>{p.name}</strong>
                      {p.description && <p style={{ fontSize: 8.5, color: '#333', marginTop: 2, fontStyle: 'italic' }}>{p.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );

    // ═══════════════════════════════════════════════════════════════════════════
    // template_13 (id:13) → structure: 'graphic-split'
    // James Kayode Mark style: rect photo top-left + ALL-CAPS bold name + subtitle
    // Contact bar with borders, PERSONAL PROFILE / PROFESSIONAL EXPERIENCE / EDUCATION / CERTIFICATE
    // ═══════════════════════════════════════════════════════════════════════════
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
            {personal.phone    && <span>📞 {personal.phone}</span>}
            {personal.email    && <span>✉ {personal.email}</span>}
            {personal.location && <span>📍 {personal.location}</span>}
          </div>

          <div style={{ padding: '0 18px 14px' }}>
            {summary.text && (
              <div style={{ marginBottom: 11 }}>
                <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>👤 Personal Profile</h2>
                <div style={{ height: 3, background: '#e5e7eb', marginBottom: 5 }} />
                <p style={{ fontSize: 8.5, color: '#444', lineHeight: 1.65 }}>{summary.text}</p>
              </div>
            )}
            <div style={{ marginBottom: 11 }}>
              <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>💼 Professional Experience</h2>
              <div style={{ height: 3, background: '#e5e7eb', marginBottom: 6 }} />
              {experience.filter(e => e.company || e.role).map(e => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <strong style={{ fontSize: 9 }}>{e.role} – {e.company}</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#777', marginTop: 1, marginBottom: 3 }}>
                    <span>{e.location}</span>
                    <span>{e.duration}</span>
                  </div>
                  {e.description && e.description.split('\n').filter(Boolean).map((l, i) => (
                    <p key={i} style={{ fontSize: 8.5, color: '#333', paddingLeft: 8, marginTop: 2 }}>• {l}</p>
                  ))}
                </div>
              ))}
              {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
            </div>
            <div style={{ marginBottom: 11 }}>
              <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>🎓 Education</h2>
              <div style={{ height: 3, background: '#e5e7eb', marginBottom: 6 }} />
              {(education.degree || education.college) ? (
                <div>
                  <strong style={{ fontSize: 9 }}>{education.degree}</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#777', marginTop: 1 }}>
                    <span>{education.college}</span>
                    <span>{education.year}</span>
                  </div>
                </div>
              ) : <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Education here…</p>}
            </div>
            {certifications.some(c => c.name) && (
              <div>
                <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>✦ Certificate</h2>
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

    // ═══════════════════════════════════════════════════════════════════════════
    // template_14 (id:14) → structure: 'serif-ats'
    // Zoey Walker style: left main + right teal sidebar (photo on top)
    // Left: SUMMARY / EXPERIENCE / LANGUAGES / INTERESTS
    // Right teal: Photo + KEY ACHIEVEMENTS / EDUCATION / SKILLS / TRAINING
    // ═══════════════════════════════════════════════════════════════════════════
    case 'serif-ats':
      return (
        <div style={{ ...fontStyle, background: '#fff', display: 'flex', minHeight: 640 }}>
          {/* LEFT MAIN */}
          <div style={{ flex: 1, padding: '14px 16px', minWidth: 0 }}>
            <h1 style={{ fontSize: 15, fontWeight: 900, color: '#111', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{name}</h1>
            <p style={{ fontSize: 8.5, color: col, fontWeight: 600, marginBottom: 5 }}>{title}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 12px', fontSize: 8, color: '#555', marginBottom: 11 }}>
              {personal.email    && <span>@ {personal.email}</span>}
              {personal.linkedin && <span>🔗 LinkedIn</span>}
              {personal.location && <span>📍 {personal.location}</span>}
            </div>

            {summary.text && (
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '1px solid #ddd', paddingBottom: 2, marginBottom: 5 }}>Summary</h2>
                <p style={{ fontSize: 8, color: '#333', lineHeight: 1.65 }}>{summary.text}</p>
              </div>
            )}

            <div style={{ marginBottom: 10 }}>
              <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '1px solid #ddd', paddingBottom: 2, marginBottom: 6 }}>Experience</h2>
              {experience.filter(e => e.company || e.role).map(e => (
                <div key={e.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: 9, color: '#111' }}>{e.role}</strong>
                    <span style={{ fontSize: 7.5, color: '#888' }}>{e.duration}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 8, color: col, fontWeight: 600 }}>{e.company}</p>
                    {e.location && <p style={{ fontSize: 7.5, color: '#888' }}>{e.location}</p>}
                  </div>
                  {e.description && e.description.split('\n').filter(Boolean).map((l, i) => (
                    <p key={i} style={{ fontSize: 8, color: '#444', paddingLeft: 8, marginTop: 2 }}>• {l}</p>
                  ))}
                </div>
              ))}
              {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
            </div>

            {languages.some(l => l.language) && (
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '1px solid #ddd', paddingBottom: 2, marginBottom: 6 }}>Languages</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                  {languages.filter(l => l.language).map(l => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 8, color: '#333', minWidth: 45 }}>{l.language}</span>
                      <span style={{ fontSize: 7.5, color: '#888', minWidth: 44 }}>{l.proficiency}</span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1,2,3,4,5].map(d => (
                          <div key={d} style={{ width: 8, height: 4, background: d <= profDots(l.proficiency) ? col : '#e2e8f0', borderRadius: 2 }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projects.some(p => p.name) && (
              <div>
                <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '1px solid #ddd', paddingBottom: 2, marginBottom: 6 }}>Interests</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {projects.filter(p => p.name).map(p => (
                    <div key={p.id} style={{ display: 'flex', gap: 5 }}>
                      <span style={{ fontSize: 11, flexShrink: 0 }}>🔹</span>
                      <div>
                        <strong style={{ fontSize: 8.5 }}>{p.name}</strong>
                        {p.description && <p style={{ fontSize: 8, color: '#555', marginTop: 2, lineHeight: 1.4 }}>{p.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT TEAL SIDEBAR */}
          <div style={{ width: 145, background: col, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 11px 8px', display: 'flex', justifyContent: 'center' }}>
              <PhotoCircle size={62} style={{ border: '3px solid rgba(255,255,255,0.3)' }} />
            </div>
            <div style={{ padding: '0 11px 10px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
              <h6 style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 7 }}>Key Achievements</h6>
              {certifications.filter(c => c.name).map(c => (
                <div key={c.id} style={{ marginBottom: 7 }}>
                  <p style={{ fontSize: 8, fontWeight: 700, color: '#fff' }}>{c.name}</p>
                  {c.description && <p style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, marginTop: 1 }}>{c.description}</p>}
                </div>
              ))}
              {certifications.every(c => !c.name) && <p style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Achievements here…</p>}
            </div>
            <div style={{ padding: '8px 11px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
              <h6 style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 5 }}>Education</h6>
              {(education.degree || education.college) ? (
                <div>
                  <p style={{ fontSize: 8, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{education.degree}</p>
                  {education.college && <p style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{education.college}</p>}
                  {education.year   && <p style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>{education.year}</p>}
                </div>
              ) : <p style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Education here…</p>}
            </div>
            {skills.some(s => s.name) && (
              <div style={{ padding: '8px 11px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                <h6 style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 5 }}>Skills</h6>
                <p style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                  {skills.filter(s => s.name).map(s => s.name).join(' · ')}
                </p>
              </div>
            )}
            <div style={{ padding: '8px 11px' }}>
              <h6 style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 5 }}>Training / Courses</h6>
              {certifications.filter(c => c.name).slice(0, 2).map(c => (
                <div key={c.id} style={{ marginBottom: 6 }}>
                  <p style={{ fontSize: 8, fontWeight: 700, color: '#fff' }}>{c.name}</p>
                  {c.issuer && <p style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{c.issuer}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    // ═══════════════════════════════════════════════════════════════════════════
    // template_17 (id:17) → structure: 'navy-pro'
    // Layla Wyatt style: dark navy header band + 2-col body
    // Left: SUMMARY / EXPERIENCE / LANGUAGES
    // Right: SKILLS (tags) / TRAINING / EDUCATION / KEY ACHIEVEMENTS / INTERESTS
    // ═══════════════════════════════════════════════════════════════════════════
    case 'navy-pro':
      return (
        <div style={{ ...fontStyle, background: '#fff', minHeight: 640 }}>
          <div style={{ background: '#1e2d3d', padding: '12px 18px 10px' }}>
            <h1 style={{ fontSize: 15, fontWeight: 900, color: '#fff', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{name}</h1>
            <p style={{ fontSize: 8, color: '#5b9bd5', fontWeight: 600, marginBottom: 6 }}>{title}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', fontSize: 7.5, color: '#94a3b8' }}>
              {personal.email    && <span>@ {personal.email}</span>}
              {personal.linkedin && <span>🔗 LinkedIn</span>}
              {personal.github   && <span>🔗 Portfolio</span>}
              {personal.location && <span>📍 {personal.location}</span>}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', minHeight: 530 }}>
            <div style={{ padding: '11px 13px 11px 15px', borderRight: '1px solid #f1f5f9' }}>
              {summary.text && (
                <div style={{ marginBottom: 10 }}>
                  <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '2px solid #111', paddingBottom: 2, marginBottom: 5 }}>Summary</h2>
                  <p style={{ fontSize: 8, color: '#333', lineHeight: 1.65 }}>{summary.text}</p>
                </div>
              )}
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '2px solid #111', paddingBottom: 2, marginBottom: 6 }}>Experience</h2>
                {experience.filter(e => e.company || e.role).map(e => (
                  <div key={e.id} style={{ marginBottom: 8, borderBottom: '1px dashed #f1f5f9', paddingBottom: 6 }}>
                    <strong style={{ fontSize: 8.5, color: '#111' }}>{e.role}</strong>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '2px 0' }}>
                      <p style={{ fontSize: 8, color: '#5b9bd5', fontWeight: 600 }}>{e.company}</p>
                      {e.duration && <span style={{ fontSize: 7.5, color: '#888' }}>📅 {e.duration}</span>}
                      {e.location && <span style={{ fontSize: 7.5, color: '#888' }}>📍 {e.location}</span>}
                    </div>
                    {e.description && e.description.split('\n').filter(Boolean).map((l, i) => (
                      <p key={i} style={{ fontSize: 8, color: '#444', paddingLeft: 6, marginTop: 2 }}>• {l}</p>
                    ))}
                  </div>
                ))}
                {experience.every(e => !e.company && !e.role) && <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Experience here…</p>}
              </div>
              {languages.some(l => l.language) && (
                <div>
                  <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '2px solid #111', paddingBottom: 2, marginBottom: 6 }}>Languages</h2>
                  {languages.filter(l => l.language).map(l => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <div style={{ minWidth: 60 }}>
                        <p style={{ fontSize: 8.5, fontWeight: 600, color: '#111' }}>{l.language}</p>
                        <p style={{ fontSize: 7.5, color: '#888' }}>{l.proficiency}</p>
                      </div>
                      <LevelDots filled={profDots(l.proficiency)} dotCol='#1e2d3d' emptyCol='#e2e8f0' />
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
                      <span key={s.id} style={{ background: '#f1f5f9', color: '#334155', fontSize: 8, fontWeight: 600, padding: '2px 7px', borderRadius: 4 }}>{s.name}</span>
                    ))}
                  </div>
                </div>
              )}
              {certifications.some(c => c.name) && (
                <div style={{ marginBottom: 10 }}>
                  <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '2px solid #111', paddingBottom: 2, marginBottom: 6 }}>Training / Courses</h2>
                  {certifications.filter(c => c.name).map(c => (
                    <div key={c.id} style={{ marginBottom: 6, borderBottom: '1px dashed #f1f5f9', paddingBottom: 5 }}>
                      <p style={{ fontSize: 8.5, fontWeight: 700, color: '#5b9bd5' }}>{c.name}</p>
                      {c.description && <p style={{ fontSize: 7.5, color: '#555', lineHeight: 1.4, marginTop: 1 }}>{c.description}</p>}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '2px solid #111', paddingBottom: 2, marginBottom: 6 }}>Education</h2>
                {(education.degree || education.college) ? (
                  <div>
                    <p style={{ fontSize: 8.5, fontWeight: 700, color: '#111' }}>{education.degree}</p>
                    {education.college && <p style={{ fontSize: 8, color: '#5b9bd5', fontWeight: 600, marginTop: 1 }}>{education.college}</p>}
                    {education.year   && <p style={{ fontSize: 7.5, color: '#888', marginTop: 1 }}>📅 {education.year}</p>}
                  </div>
                ) : <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Education here…</p>}
              </div>
              {projects.some(p => p.name) && (
                <div>
                  <h2 style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#111', borderBottom: '2px solid #111', paddingBottom: 2, marginBottom: 6 }}>Key Achievements</h2>
                  {projects.filter(p => p.name).map(p => (
                    <div key={p.id} style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, flexShrink: 0 }}>✏️</span>
                      <div>
                        <p style={{ fontSize: 8.5, fontWeight: 700, color: '#111' }}>{p.name}</p>
                        {p.description && <p style={{ fontSize: 8, color: '#555', lineHeight: 1.4, marginTop: 1 }}>{p.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );

    // ═══════════════════════════════════════════════════════════════════════════
    // template_18 (id:18) → structure: 'civil-pro'
    // Mark Smith style: triangle accent photo + bold/light name + contact bar
    // Left sidebar: SKILLS / CERTIFICATIONS / KEY PROJECTS / LANGUAGES
    // Right main: PROFESSIONAL SUMMARY / EXPERIENCE (● bullets) / EDUCATION
    // ═══════════════════════════════════════════════════════════════════════════
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
                {name.split(' ').length > 1 ? (
                  <>
                    <span style={{ fontSize: 20, fontWeight: 900, color: col, letterSpacing: -0.5 }}>{name.split(' ')[0].toUpperCase()}</span>
                    <span style={{ fontSize: 20, fontWeight: 300, color: col, letterSpacing: -0.5 }}>{name.split(' ').slice(1).join(' ').toUpperCase()}</span>
                  </>
                ) : <span style={{ fontSize: 20, fontWeight: 900, color: col }}>{name.toUpperCase()}</span>}
              </div>
              <p style={{ fontSize: 9, color: '#555', fontStyle: 'italic', marginBottom: 5 }}>{title}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 13px', fontSize: 7.5 }}>
                {personal.phone    && <span style={{ color: '#333' }}>📞 {personal.phone}</span>}
                {personal.email    && <span style={{ color: '#333' }}>✉ {personal.email}</span>}
                {personal.linkedin && <span style={{ color: '#333' }}>🔗 {personal.linkedin}</span>}
                {personal.location && <span style={{ color: '#333' }}>📍 {personal.location}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flex: 1 }}>
            <div style={{ width: 152, flexShrink: 0, padding: '12px 11px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 9.5, fontWeight: 900, textTransform: 'uppercase', color: col, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Skills</h2>
                {skills.filter(s => s.name).length > 0 ? skills.filter(s => s.name).map(s => (
                  <p key={s.id} style={{ fontSize: 8, color: '#333', marginBottom: 3 }}><strong>{s.name}</strong></p>
                )) : <p style={{ fontSize: 8, color: '#ccc', fontStyle: 'italic' }}>Skills here…</p>}
              </div>
              {certifications.some(c => c.name) && (
                <div>
                  <h2 style={{ fontSize: 9.5, fontWeight: 900, textTransform: 'uppercase', color: col, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Certifications</h2>
                  {certifications.filter(c => c.name).map(c => (
                    <div key={c.id} style={{ marginBottom: 6 }}>
                      <p style={{ fontSize: 8, fontWeight: 700, color: '#111', lineHeight: 1.3 }}>{c.name}:</p>
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
                      {p.description && <p style={{ fontSize: 7.5, color: '#444', lineHeight: 1.5 }}>{p.description}</p>}
                    </div>
                  ))}
                </div>
              )}
              {languages.some(l => l.language) && (
                <div>
                  <h2 style={{ fontSize: 9.5, fontWeight: 900, textTransform: 'uppercase', color: col, borderBottom: `2px solid ${col}`, paddingBottom: 2, marginBottom: 6 }}>Languages</h2>
                  {languages.filter(l => l.language).map(l => (
                    <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 8, color: '#333' }}>{l.language}</span>
                      <span style={{ fontSize: 7.5, color: '#888', fontStyle: 'italic' }}>{l.proficiency}</span>
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
                {(education.degree || education.college) ? (
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#111', lineHeight: 1.4 }}>{education.degree}</p>
                    {education.college && <p style={{ fontSize: 8, color: '#555', fontStyle: 'italic', marginTop: 1 }}>{education.college}</p>}
                    {education.year   && <p style={{ fontSize: 8, fontWeight: 700, color: '#333', margin: '2px 0' }}>{education.year}</p>}
                    {education.gpa    && <p style={{ fontSize: 8, color: '#444', fontStyle: 'italic' }}>Relevant Coursework / GPA: {education.gpa}</p>}
                  </div>
                ) : <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 8 }}>Education here…</p>}
              </div>
            </div>
          </div>
        </div>
      );

    // ─── DEFAULT ────────────────────────────────────────────────────────────
    default:
      return (
        <div style={{ ...fontStyle, padding: 20, background: '#fff' }}>
          <h3 style={{ fontSize: 16, color: '#111' }}>{name}</h3>
          <p style={{ color: '#64748b', fontSize: 10, marginTop: 4 }}>{title}</p>
          {summary.text && <p style={{ fontSize: 8.5, color: '#333', marginTop: 12, lineHeight: 1.6 }}>{summary.text}</p>}
        </div>
      );
  }
}