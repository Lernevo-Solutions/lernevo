import React, { useState } from 'react';
import './HomePage.css';

const AllTemplatesPage = () => {
  // ---------- 21 Unique Template Definitions ----------
  const templates = [
    // 1. Classic Sidebar (structure: sidebar-left)
    {
      id: 1,
      name: 'Classic Sidebar',
      layoutClass: 'layout-sidebar',
      structure: 'sidebar-left',
      photo: true,
      contact: true
    },
    // 2. Modern Centered (structure: top-centered)
    {
      id: 2,
      name: 'Modern Centered',
      layoutClass: 'layout-modern-centered',
      structure: 'top-centered',
      photo: true,
      contact: true
    },
    // 3. Minimal Clean (structure: minimal-no-photo)
    {
      id: 3,
      name: 'Minimal Clean',
      layoutClass: 'layout-minimal-clean',
      structure: 'minimal-no-photo',
      photo: false,
      contact: false
    },
    // 4. Executive Grid (structure: executive-grid)
    {
      id: 4,
      name: 'Executive Grid',
      layoutClass: 'layout-executive-grid',
      structure: 'executive-grid',
      photo: true,
      contact: true
    },
    // 5. Top Bar Bold (structure: header-bg)
    {
      id: 5,
      name: 'Top Bar Bold',
      layoutClass: 'layout-top-bar',
      structure: 'header-bg',
      photo: false,
      contact: true
    },
    // 6. Creative Asymmetry (structure: asymmetric)
    {
      id: 6,
      name: 'Creative Asymmetry',
      layoutClass: 'layout-creative',
      structure: 'asymmetric',
      photo: true,
      contact: true
    },
    // 7. Professional Card (structure: professional-card)
    {
      id: 7,
      name: 'Professional Card',
      layoutClass: 'layout-professional-card',
      structure: 'professional-card',
      photo: true,
      contact: true
    },
    // 8. Technical Compact (structure: compact)
    {
      id: 8,
      name: 'Technical Compact',
      layoutClass: 'layout-compact',
      structure: 'compact',
      photo: true,
      contact: true
    },
    // 9. Infographic Style (structure: infographic)
    {
      id: 9,
      name: 'Infographic Style',
      layoutClass: 'layout-infographic',
      structure: 'infographic',
      photo: true,
      contact: false
    },
    // 10. Minimalist No Photo (structure: minimal-no-photo)
    {
      id: 10,
      name: 'Minimalist No Photo',
      layoutClass: 'layout-minimal-no-photo',
      structure: 'minimal-no-photo',
      photo: false,
      contact: false
    },
    // 11. Two Column Modern (structure: two-column)
    {
      id: 11,
      name: 'Two Column Modern',
      layoutClass: 'layout-two-column-modern',
      structure: 'two-column',
      photo: true,
      contact: true
    },
    // 12. Sidebar Right (structure: sidebar-right)
    {
      id: 12,
      name: 'Sidebar Right',
      layoutClass: 'layout-sidebar-right',
      structure: 'sidebar-right',
      photo: true,
      contact: true
    },
    // 13. Header with Background (structure: header-bg)
    {
      id: 13,
      name: 'Header with Background',
      layoutClass: 'layout-header-bg',
      structure: 'header-bg',
      photo: false,
      contact: true
    },
    // 14. Bold Dark Sidebar (structure: sidebar-left)
    {
      id: 14,
      name: 'Bold Dark Sidebar',
      layoutClass: 'layout-bold-dark',
      structure: 'sidebar-left',
      photo: true,
      contact: true
    },
    // 15. Light Pastel (structure: pastel)
    {
      id: 15,
      name: 'Light Pastel',
      layoutClass: 'layout-light-pastel',
      structure: 'pastel',
      photo: true,
      contact: true
    },
    // 16. Card Style (structure: card-style)
    {
      id: 16,
      name: 'Card Style',
      layoutClass: 'layout-card-style',
      structure: 'card-style',
      photo: true,
      contact: true
    },
    // 17. Timeline Experience (structure: timeline)
    {
      id: 17,
      name: 'Timeline Experience',
      layoutClass: 'layout-timeline',
      structure: 'timeline',
      photo: true,
      contact: true
    },
    // 18. Grid Skills (structure: grid-skills)
    {
      id: 18,
      name: 'Grid Skills',
      layoutClass: 'layout-grid-skills',
      structure: 'grid-skills',
      photo: true,
      contact: true
    },
    // 19. Minimal with Accent (structure: minimal-accent)
    {
      id: 19,
      name: 'Minimal with Accent',
      layoutClass: 'layout-minimal-accent',
      structure: 'minimal-accent',
      photo: false,
      contact: false
    },
    // 20. Creative Stack (structure: creative-stack)
    {
      id: 20,
      name: 'Creative Stack',
      layoutClass: 'layout-creative-stack',
      structure: 'creative-stack',
      photo: true,
      contact: true
    },
    // 21. Executive Premium (structure: executive-grid)
    {
      id: 21,
      name: 'Executive Premium',
      layoutClass: 'layout-executive-premium',
      structure: 'executive-grid',
      photo: true,
      contact: true
    }
  ];

  // ---------- Tamil Nadu Profile ----------
  const tnProfile = {
    name: "M. SENTHIL KUMAR",
    title: "Senior Software Engineer",
    summary: "Dedicated professional from Chennai with 7+ years of experience in Zoho and Freshworks. Specialized in building scalable web applications for the Tamil Nadu tech industry.",
    contact: {
      phone: "+91 98745 61230",
      location: "Chennai, TN"
    },
    experience: "Lead Developer at Zoho Corporation (2019-Present)",
    skills: ["React.js", "Node.js", "Cloud Tech", "Team Management"]
  };

  // State for color dots
  const [selectedColors, setSelectedColors] = useState({});

  // Helper to get avatar image (different for each template using id offset)
  const getPhotoUrl = (id) =>
    `https://xsgames.co/randomusers/assets/avatars/male/${(id * 3 + 17) % 75}.jpg`;

  // ---------- Render functions for each structure ----------
  const renderResumeContent = (tpl, currentColor) => {
    const photoUrl = getPhotoUrl(tpl.id);

    switch (tpl.structure) {
      case 'sidebar-left':
        return (
          <div className="res-content">
            <div className="res-sidebar">
              {tpl.photo && <img src={photoUrl} alt="profile" className="res-img" />}
              {tpl.contact && (
                <div className="res-side-sec">
                  <h6 style={{ color: currentColor }}>CONTACT</h6>
                  <p>{tnProfile.contact.phone}</p>
                  <p>{tnProfile.contact.location}</p>
                </div>
              )}
            </div>
            <div className="res-main">
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SUMMARY</h6>
                <p>{tnProfile.summary}</p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>EXPERIENCE</h6>
                <p><strong>{tnProfile.experience}</strong></p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SKILLS</h6>
                <div className="skill-tags">
                  {tnProfile.skills.map(s => (
                    <span key={s} style={{ border: `1px solid ${currentColor}`, color: currentColor }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'sidebar-right':
        return (
          <div className="res-content" style={{ flexDirection: 'row-reverse' }}>
            <div className="res-sidebar">
              {tpl.photo && <img src={photoUrl} alt="profile" className="res-img" />}
              {tpl.contact && (
                <div className="res-side-sec">
                  <h6 style={{ color: currentColor }}>CONTACT</h6>
                  <p>{tnProfile.contact.phone}</p>
                  <p>{tnProfile.contact.location}</p>
                </div>
              )}
            </div>
            <div className="res-main">
              {/* same as sidebar-left main */}
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SUMMARY</h6>
                <p>{tnProfile.summary}</p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>EXPERIENCE</h6>
                <p><strong>{tnProfile.experience}</strong></p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SKILLS</h6>
                <div className="skill-tags">
                  {tnProfile.skills.map(s => (
                    <span key={s} style={{ border: `1px solid ${currentColor}`, color: currentColor }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'top-centered':
        return (
          <div className="res-content" style={{ flexDirection: 'column' }}>
            {tpl.photo && <img src={photoUrl} alt="profile" className="res-img-small centered" />}
            <div className="res-main">
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SUMMARY</h6>
                <p>{tnProfile.summary}</p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>EXPERIENCE</h6>
                <p><strong>{tnProfile.experience}</strong></p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SKILLS</h6>
                <div className="skill-tags">
                  {tnProfile.skills.map(s => (
                    <span key={s} style={{ border: `1px solid ${currentColor}`, color: currentColor }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'minimal-no-photo':
        return (
          <div className="res-content">
            <div className="res-main" style={{ padding: '25px' }}>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SUMMARY</h6>
                <p>{tnProfile.summary}</p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>EXPERIENCE</h6>
                <p><strong>{tnProfile.experience}</strong></p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SKILLS</h6>
                <div className="skill-tags">
                  {tnProfile.skills.map(s => (
                    <span key={s} style={{ border: `1px solid ${currentColor}`, color: currentColor }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'executive-grid':
        return (
          <div className="res-content">
            <div className="res-main">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  {tpl.photo && <img src={photoUrl} alt="profile" className="res-img-small" />}
                  {tpl.contact && (
                    <>
                      <h6 style={{ color: currentColor }}>CONTACT</h6>
                      <p>{tnProfile.contact.phone}</p>
                      <p>{tnProfile.contact.location}</p>
                    </>
                  )}
                </div>
                <div>
                  <h6 style={{ color: currentColor }}>SUMMARY</h6>
                  <p>{tnProfile.summary}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div>
                  <h6 style={{ color: currentColor }}>EXPERIENCE</h6>
                  <p><strong>{tnProfile.experience}</strong></p>
                </div>
                <div>
                  <h6 style={{ color: currentColor }}>SKILLS</h6>
                  <div className="skill-tags">
                    {tnProfile.skills.map(s => (
                      <span key={s} style={{ border: `1px solid ${currentColor}`, color: currentColor }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'header-bg':
        return (
          <div className="res-content">
            <div className="res-main">
              {tpl.contact && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span>{tnProfile.contact.phone}</span>
                  <span>{tnProfile.contact.location}</span>
                </div>
              )}
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SUMMARY</h6>
                <p>{tnProfile.summary}</p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>EXPERIENCE</h6>
                <p><strong>{tnProfile.experience}</strong></p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SKILLS</h6>
                <div className="skill-tags">
                  {tnProfile.skills.map(s => (
                    <span key={s} style={{ border: `1px solid ${currentColor}`, color: currentColor }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'asymmetric':
        return (
          <div className="res-content" style={{ display: 'block', position: 'relative' }}>
            <img src={photoUrl} alt="profile" style={{ width: '80px', height: '80px', borderRadius: '50%', float: 'right', margin: '0 0 15px 15px' }} />
            <div className="res-main" style={{ padding: '15px' }}>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SUMMARY</h6>
                <p>{tnProfile.summary}</p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>EXPERIENCE</h6>
                <p><strong>{tnProfile.experience}</strong></p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SKILLS</h6>
                <div className="skill-tags">
                  {tnProfile.skills.map(s => (
                    <span key={s} style={{ border: `1px solid ${currentColor}`, color: currentColor }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'professional-card':
        return (
          <div className="res-content">
            <div className="res-main" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                {tpl.photo && <img src={photoUrl} alt="profile" style={{ width: '60px', height: '60px', borderRadius: '12px' }} />}
                <div>
                  <h3 style={{ margin: 0 }}>{tnProfile.name}</h3>
                  <p>{tnProfile.title}</p>
                </div>
              </div>
              <div className="res-sec" style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', marginBottom: '15px' }}>
                <h6 style={{ color: currentColor }}>SUMMARY</h6>
                <p>{tnProfile.summary}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="res-sec" style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                  <h6 style={{ color: currentColor }}>EXPERIENCE</h6>
                  <p><strong>{tnProfile.experience}</strong></p>
                </div>
                <div className="res-sec" style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                  <h6 style={{ color: currentColor }}>SKILLS</h6>
                  <div className="skill-tags">
                    {tnProfile.skills.map(s => (
                      <span key={s} style={{ border: `1px solid ${currentColor}`, color: currentColor }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'compact':
        return (
          <div className="res-content">
            <div className="res-main" style={{ padding: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                {tpl.photo && <img src={photoUrl} alt="profile" style={{ width: '50px', height: '50px', borderRadius: '8px' }} />}
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px' }}>{tnProfile.name}</h4>
                  <p style={{ fontSize: '10px' }}>{tnProfile.title}</p>
                </div>
              </div>
              <div className="res-sec" style={{ fontSize: '9px' }}>
                <p>{tnProfile.summary}</p>
              </div>
              <div className="res-sec" style={{ fontSize: '9px' }}>
                <strong>Exp:</strong> {tnProfile.experience}
              </div>
              <div className="skill-tags" style={{ marginTop: '8px' }}>
                {tnProfile.skills.map(s => (
                  <span key={s} style={{ fontSize: '8px', padding: '2px 4px', border: `1px solid ${currentColor}`, color: currentColor }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'infographic':
        return (
          <div className="res-content">
            <div className="res-main">
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                {tpl.photo && <img src={photoUrl} alt="profile" style={{ width: '70px', height: '70px', borderRadius: '50%' }} />}
                <div>
                  <h3>{tnProfile.name}</h3>
                  <p>{tnProfile.title}</p>
                </div>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SUMMARY</h6>
                <p>{tnProfile.summary}</p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>EXPERIENCE</h6>
                <p><strong>{tnProfile.experience}</strong></p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SKILLS</h6>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tnProfile.skills.map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '70px', fontSize: '10px' }}>{s}</span>
                      <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                        <div style={{ width: `${Math.random() * 40 + 60}%`, height: '100%', background: currentColor, borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'two-column':
        return (
          <div className="res-content">
            <div className="res-main">
              {tpl.photo && <img src={photoUrl} alt="profile" className="res-img-small left" />}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h6 style={{ color: currentColor }}>SUMMARY</h6>
                  <p>{tnProfile.summary}</p>
                </div>
                <div>
                  <h6 style={{ color: currentColor }}>CONTACT</h6>
                  <p>{tnProfile.contact.phone}</p>
                  <p>{tnProfile.contact.location}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div>
                  <h6 style={{ color: currentColor }}>EXPERIENCE</h6>
                  <p><strong>{tnProfile.experience}</strong></p>
                </div>
                <div>
                  <h6 style={{ color: currentColor }}>SKILLS</h6>
                  <div className="skill-tags">
                    {tnProfile.skills.map(s => (
                      <span key={s} style={{ border: `1px solid ${currentColor}`, color: currentColor }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pastel':
        return (
          <div className="res-content">
            <div className="res-main" style={{ background: '#fdf2f8', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                {tpl.photo && <img src={photoUrl} alt="profile" style={{ width: '60px', height: '60px', borderRadius: '30px' }} />}
                <div>
                  <h3 style={{ margin: 0 }}>{tnProfile.name}</h3>
                  <p>{tnProfile.title}</p>
                </div>
              </div>
              <div className="res-sec" style={{ background: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '15px' }}>
                <h6 style={{ color: currentColor }}>SUMMARY</h6>
                <p>{tnProfile.summary}</p>
              </div>
              <div className="res-sec" style={{ background: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '15px' }}>
                <h6 style={{ color: currentColor }}>EXPERIENCE</h6>
                <p><strong>{tnProfile.experience}</strong></p>
              </div>
              <div className="res-sec" style={{ background: '#fff', padding: '12px', borderRadius: '12px' }}>
                <h6 style={{ color: currentColor }}>SKILLS</h6>
                <div className="skill-tags">
                  {tnProfile.skills.map(s => (
                    <span key={s} style={{ border: `1px solid ${currentColor}`, color: currentColor }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'card-style':
        return (
          <div className="res-content">
            <div className="res-main" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#fff', padding: '15px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {tpl.photo && <img src={photoUrl} alt="profile" style={{ width: '60px', height: '60px', borderRadius: '16px' }} />}
                <div>
                  <h3 style={{ margin: 0 }}>{tnProfile.name}</h3>
                  <p>{tnProfile.title}</p>
                </div>
              </div>
              <div style={{ background: '#fff', padding: '15px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h6 style={{ color: currentColor }}>SUMMARY</h6>
                <p>{tnProfile.summary}</p>
              </div>
              <div style={{ background: '#fff', padding: '15px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h6 style={{ color: currentColor }}>EXPERIENCE</h6>
                <p><strong>{tnProfile.experience}</strong></p>
              </div>
              <div style={{ background: '#fff', padding: '15px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h6 style={{ color: currentColor }}>SKILLS</h6>
                <div className="skill-tags">
                  {tnProfile.skills.map(s => (
                    <span key={s} style={{ border: `1px solid ${currentColor}`, color: currentColor }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="res-content">
            <div className="res-main">
              {tpl.photo && <img src={photoUrl} alt="profile" className="res-img-small left" />}
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SUMMARY</h6>
                <p>{tnProfile.summary}</p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>EXPERIENCE</h6>
                <div style={{ borderLeft: `2px solid ${currentColor}`, paddingLeft: '15px', marginLeft: '5px' }}>
                  <p><strong>{tnProfile.experience}</strong></p>
                  <p style={{ fontSize: '8px' }}>2019 - Present</p>
                </div>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SKILLS</h6>
                <div className="skill-tags">
                  {tnProfile.skills.map(s => (
                    <span key={s} style={{ border: `1px solid ${currentColor}`, color: currentColor }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'grid-skills':
        return (
          <div className="res-content">
            <div className="res-main">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                {tpl.photo && <img src={photoUrl} alt="profile" style={{ width: '100%', borderRadius: '8px' }} />}
                <div>
                  <h3>{tnProfile.name}</h3>
                  <p>{tnProfile.title}</p>
                </div>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SUMMARY</h6>
                <p>{tnProfile.summary}</p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>EXPERIENCE</h6>
                <p><strong>{tnProfile.experience}</strong></p>
              </div>
              <div className="res-sec">
                <h6 style={{ color: currentColor }}>SKILLS</h6>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {tnProfile.skills.map(s => (
                    <span key={s} style={{ border: `1px solid ${currentColor}`, color: currentColor, padding: '4px', textAlign: 'center', borderRadius: '4px' }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'minimal-accent':
        return (
          <div className="res-content">
            <div className="res-main" style={{ padding: '20px' }}>
              <div style={{ borderBottom: `3px solid ${currentColor}`, marginBottom: '15px', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0 }}>{tnProfile.name}</h2>
                <p>{tnProfile.title}</p>
              </div>
              <div className="res-sec">
                <p>{tnProfile.summary}</p>
              </div>
              <div className="res-sec">
                <p><strong>{tnProfile.experience}</strong></p>
              </div>
              <div className="res-sec">
                <div className="skill-tags">
                  {tnProfile.skills.map(s => (
                    <span key={s} style={{ background: currentColor, color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '9px' }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'creative-stack':
        return (
          <div className="res-content">
            <div className="res-main" style={{ padding: '15px' }}>
              <div style={{ position: 'relative', marginBottom: '30px' }}>
                {tpl.photo && <img src={photoUrl} alt="profile" style={{ width: '70px', height: '70px', borderRadius: '16px', position: 'absolute', top: '-10px', left: '-10px', border: `3px solid ${currentColor}` }} />}
                <div style={{ marginLeft: '70px', background: '#f1f5f9', padding: '15px', borderRadius: '16px' }}>
                  <h3 style={{ margin: 0 }}>{tnProfile.name}</h3>
                  <p>{tnProfile.title}</p>
                </div>
              </div>
              <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '16px', marginBottom: '15px' }}>
                <h6 style={{ color: currentColor }}>SUMMARY</h6>
                <p>{tnProfile.summary}</p>
              </div>
              <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '16px', marginBottom: '15px' }}>
                <h6 style={{ color: currentColor }}>EXPERIENCE</h6>
                <p><strong>{tnProfile.experience}</strong></p>
              </div>
              <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '16px' }}>
                <h6 style={{ color: currentColor }}>SKILLS</h6>
                <div className="skill-tags">
                  {tnProfile.skills.map(s => (
                    <span key={s} style={{ border: `1px solid ${currentColor}`, color: currentColor }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="rb-all-templates-page">
      <div className="rb-container">
        <header className="rb-page-header">
          <h1>Resume Gallery</h1>
          <p>Choose your perfect style – every design is distinct.</p>
        </header>

        <div className="rb-all-templates-grid">
          {templates.map((tpl) => {
            const currentColor = selectedColors[tpl.id] || '#2563eb'; // fallback blue

            return (
              <div className="rb-template-full-card" key={tpl.id}>
                <div className={`rb-card-preview-area ${tpl.layoutClass}`}>
                  <div className="resume-canvas">
                    {/* Header with dynamic color */}
                    <div className="res-header" style={{ backgroundColor: currentColor }}>
                      <h2>{tnProfile.name}</h2>
                      <p>{tnProfile.title}</p>
                    </div>

                    {/* Render content based on structure */}
                    {renderResumeContent(tpl, currentColor)}
                  </div>

                  {/* Hover overlay */}
                  <div className="rb-hover-overlay">
                    <button className="use-btn" style={{ backgroundColor: currentColor }}>
                      Use Design
                    </button>
                  </div>
                </div>

                {/* Footer controls */}
                <div className="rb-card-footer">
                  <div className="color-dots">
                    {['#1e293b', '#2563eb', '#059669', '#dc2626'].map(c => (
                      <span
                        key={c}
                        className={`dot ${selectedColors[tpl.id] === c ? 'active-dot' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setSelectedColors({ ...selectedColors, [tpl.id]: c })}
                      />
                    ))}
                  </div>
                  <div className="action-btns">
                    <button className="btn-dl">PDF</button>
                    <button className="btn-dl">DOCX</button>
                  </div>
                </div>
                <div className="tpl-label">{tpl.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AllTemplatesPage;