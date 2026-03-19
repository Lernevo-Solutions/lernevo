import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './AllTemplatesPage.css';

// ─── DIRECT IMPORTS ───────────────────────────────────────────────────────────
import imgTemplate1   from './template_1.avif';
import imgTemplate2   from './template_2.avif';
import imgTemplates3  from './templates3.jpg';
import imgTemplate5   from './template_5.avif';
import imgTemplate6   from './Template_6.webp';
import imgTemplate7   from './Template_7.webp';
import imgTemplate8   from './template_8.webp';
import imgTemplate9   from './template_9.webp';
import imgTemplate10  from './template_10.webp';
import imgTemplate11  from './template_11.webp';
import imgTemplate12  from './template_12.webp';
import imgTemplate13  from './template_13.webp';
import imgTemplate14  from './template_14.jpg';

import imgTemplate17  from './template_17.png';
import imgTemplate18 from './template_18.jpg';



const ACCENT = '#2563eb';

const ALL_TEMPLATES = [
  { id: 1,  name: 'Classic Minimal',   structure: 'classic-minimal', image: imgTemplate1  },
  { id: 2,  name: 'Serif Pro',         structure: 'serif-pro',       image: imgTemplate2  },
  { id: 3,  name: 'Clean Centered',    structure: 'clean-centered',  image: imgTemplates3 },
  { id: 5,  name: 'Data Pro ATS',      structure: 'data-pro-ats',    image: imgTemplate5  },
  { id: 6,  name: 'Bold Two-Column',   structure: 'bold-two-col',    image: imgTemplate6  },
  { id: 7,  name: 'Minimalist Top',    structure: 'minimalist-top',  image: imgTemplate7  },
  { id: 8,  name: 'Section Shade',     structure: 'section-shade',   image: imgTemplate8  },
  { id: 9,  name: 'Teal Sidebar',      structure: 'teal-sidebar',    image: imgTemplate9  },
  { id: 10, name: 'Photo ATS Pro',     structure: 'photo-ats',       image: imgTemplate10 },
  { id: 11, name: 'Two Column Modern', structure: 'two-column',      image: imgTemplate11 },
  { id: 12, name: 'Ashley Sidebar',    structure: 'ashley-sidebar',  image: imgTemplate12 },
  { id: 13, name: 'Graphic Split',     structure: 'graphic-split',   image: imgTemplate13 },
  { id: 14, name: 'Serif ATS',         structure: 'serif-ats',       image: imgTemplate14 },
  
  { id: 17, name: 'Navy Pro',          structure: 'navy-pro',        image: imgTemplate17 },
  { id: 18, name: 'Civil Pro',         structure: 'civil-pro',       image: imgTemplate18 },
  { id: 0,  name: 'Blank Resume',      structure: 'blank-start',     image: null          },
];





export default function AllTemplatesPage() {
  const navigate = useNavigate();
  const [previewTpl, setPreviewTpl] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  const handleUse = useCallback((tpl) => {
    navigate('/builder', { state: { template: tpl, selectedColor: ACCENT } });
  }, [navigate]);

  return (
    <div className="atp-root">

      {/* ── Hero ── */}
      <div className="atp-hero">
        <div className="atp-hero-bg" />

        {/* Left content */}
        <div className="atp-hero-inner">
          <span className="atp-eyebrow">Resume Builder</span>
          <h1 className="atp-hero-title">
            Pick your perfect<br /><em>resume template</em>
          </h1>
          <p className="atp-hero-sub">
            {ALL_TEMPLATES.length - 1} professionally designed templates — click any to preview, then start building.
          </p>
          <div className="atp-hero-stats">
            <div className="atp-stat"><span className="atp-stat-num">{ALL_TEMPLATES.length - 1}</span><span className="atp-stat-lbl">Templates</span></div>
            <div className="atp-stat-div" />
            <div className="atp-stat"><span className="atp-stat-num">ATS</span><span className="atp-stat-lbl">Optimised</span></div>
            <div className="atp-stat-div" />
            <div className="atp-stat"><span className="atp-stat-num">PDF</span><span className="atp-stat-lbl">1-click export</span></div>
          </div>
        </div>

        {/* Center animated illustration */}
        <div className="atp-hero-center" aria-hidden="true">
          <div className="atp-scene">

            {/* ─── MONITOR ─────────────────────────── */}
            <div className="atp-monitor">
              <div className="atp-monitor-screen">
                {/* resume doc on screen */}
                <div className="atp-doc">
                  <div className="atp-doc-header">
                    <div className="atp-doc-avatar" />
                    <div className="atp-doc-htext">
                      <div className="atp-doc-line atp-doc-line--name" />
                      <div className="atp-doc-line atp-doc-line--role" />
                    </div>
                  </div>
                  <div className="atp-doc-divider" />
                  <div className="atp-doc-section-lbl" />
                  <div className="atp-doc-line atp-tl-1" />
                  <div className="atp-doc-line atp-tl-2" />
                  <div className="atp-doc-line atp-tl-3" />
                  <div className="atp-doc-divider" />
                  <div className="atp-doc-section-lbl" />
                  <div className="atp-doc-line atp-tl-4" />
                  <div className="atp-doc-line atp-tl-5" />
                  {/* blinking cursor */}
                  <div className="atp-doc-cursor" />
                </div>
                {/* screen glow overlay */}
                <div className="atp-screen-glow" />
              </div>
              <div className="atp-monitor-neck" />
              <div className="atp-monitor-base" />
            </div>

            {/* ─── DESK ────────────────────────────── */}
            <div className="atp-desk">
              {/* keyboard */}
              <div className="atp-keyboard">
                {[0,1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className={`atp-key atp-key--${i}`} />
                ))}
              </div>
              {/* mouse */}
              <div className="atp-mouse">
                <div className="atp-mouse-line" />
              </div>
              {/* coffee cup */}
              <div className="atp-coffee">
                <div className="atp-steam atp-steam--1" />
                <div className="atp-steam atp-steam--2" />
                <div className="atp-steam atp-steam--3" />
              </div>
            </div>
            <div className="atp-desk-surface" />
            <div className="atp-desk-leg atp-desk-leg--l" />
            <div className="atp-desk-leg atp-desk-leg--r" />

            {/* ─── CHAIR ───────────────────────────── */}
            <div className="atp-chair">
              <div className="atp-chair-back" />
              <div className="atp-chair-seat" />
              <div className="atp-chair-pole" />
              <div className="atp-chair-base" />
            </div>

            {/* ─── PERSON ──────────────────────────── */}
            <div className="atp-person">
              {/* head */}
              <div className="atp-head">
                <div className="atp-hair" />
                <div className="atp-face">
                  <div className="atp-eyes">
                    <div className="atp-eye atp-eye--l">
                      <div className="atp-pupil" />
                    </div>
                    <div className="atp-eye atp-eye--r">
                      <div className="atp-pupil" />
                    </div>
                  </div>
                  <div className="atp-nose" />
                  <div className="atp-mouth" />
                  {/* cheeks */}
                  <div className="atp-cheek atp-cheek--l" />
                  <div className="atp-cheek atp-cheek--r" />
                </div>
                {/* headphones */}
                <div className="atp-headphone-band" />
                <div className="atp-headphone atp-headphone--l" />
                <div className="atp-headphone atp-headphone--r" />
              </div>
              {/* neck */}
              <div className="atp-neck" />
              {/* torso */}
              <div className="atp-torso">
                <div className="atp-shirt-detail" />
              </div>
              {/* arms */}
              <div className="atp-arm atp-arm--l">
                <div className="atp-forearm atp-forearm--l">
                  <div className="atp-hand atp-hand--l" />
                </div>
              </div>
              <div className="atp-arm atp-arm--r">
                <div className="atp-forearm atp-forearm--r">
                  <div className="atp-hand atp-hand--r" />
                </div>
              </div>
              {/* legs */}
              <div className="atp-leg atp-leg--l" />
              <div className="atp-leg atp-leg--r" />
            </div>

            {/* ─── FLOATING UI CHIPS ───────────────── */}
            <div className="atp-float-chip atp-float-chip--check">
              <span className="atp-chip-icon">✓</span>
              <span className="atp-chip-text">Resume saved!</span>
            </div>
            <div className="atp-float-chip atp-float-chip--star">
              <span className="atp-chip-icon">⭐</span>
              <span className="atp-chip-text">ATS Score 98%</span>
            </div>
            <div className="atp-float-chip atp-float-chip--pdf">
              <span className="atp-chip-icon">↓</span>
              <span className="atp-chip-text">PDF Ready</span>
            </div>

            {/* ─── SPARKLE DOTS ────────────────────── */}
            <div className="atp-dot atp-dot--1" />
            <div className="atp-dot atp-dot--2" />
            <div className="atp-dot atp-dot--3" />
            <div className="atp-dot atp-dot--4" />

          </div>
        </div>

        {/* Right animated visual */}
        <div className="atp-hero-visual" aria-hidden="true">
          {/* Floating glow rings */}
          <div className="atp-hero-ring atp-hero-ring--1" />
          <div className="atp-hero-ring atp-hero-ring--2" />

          {/* Stacked resume cards */}
          <div className="atp-card-stack">
            {/* Card 3 — furthest back */}
            <div className="atp-stack-card atp-stack-card--3">
              <div className="atp-sc-bar" style={{width:'55%'}} />
              <div className="atp-sc-bar atp-sc-bar--thin" style={{width:'40%'}} />
              <div className="atp-sc-gap" />
              <div className="atp-sc-bar" style={{width:'90%'}} />
              <div className="atp-sc-bar" style={{width:'75%'}} />
              <div className="atp-sc-bar" style={{width:'82%'}} />
            </div>

            {/* Card 2 — middle */}
            <div className="atp-stack-card atp-stack-card--2">
              <div className="atp-sc-toprow">
                <div className="atp-sc-avatar" />
                <div style={{flex:1}}>
                  <div className="atp-sc-bar" style={{width:'60%',marginBottom:5}} />
                  <div className="atp-sc-bar atp-sc-bar--thin" style={{width:'42%'}} />
                </div>
              </div>
              <div className="atp-sc-divider" />
              <div className="atp-sc-bar" style={{width:'88%'}} />
              <div className="atp-sc-bar" style={{width:'72%'}} />
              <div className="atp-sc-bar" style={{width:'80%'}} />
            </div>

            {/* Card 1 — front, most detailed */}
            <div className="atp-stack-card atp-stack-card--1">
              <div className="atp-sc-toprow">
                <div className="atp-sc-avatar atp-sc-avatar--accent" />
                <div style={{flex:1}}>
                  <div className="atp-sc-bar atp-sc-bar--accent" style={{width:'65%',marginBottom:5}} />
                  <div className="atp-sc-bar atp-sc-bar--thin" style={{width:'44%'}} />
                </div>
              </div>
              <div className="atp-sc-divider" />
              <div className="atp-sc-section-lbl">EXPERIENCE</div>
              <div className="atp-sc-bar" style={{width:'92%'}} />
              <div className="atp-sc-bar" style={{width:'76%'}} />
              <div className="atp-sc-bar" style={{width:'84%'}} />
              <div className="atp-sc-divider" />
              <div className="atp-sc-section-lbl">SKILLS</div>
              <div className="atp-sc-chips">
                <span className="atp-sc-chip" />
                <span className="atp-sc-chip atp-sc-chip--accent" />
                <span className="atp-sc-chip" />
                <span className="atp-sc-chip atp-sc-chip--accent" />
              </div>
            </div>
          </div>

          {/* Floating stat badges */}
          <div className="atp-hero-badge atp-hero-badge--1">
            <span className="atp-badge-icon">✦</span>
            <div>
              <p className="atp-badge-num">15+</p>
              <p className="atp-badge-lbl">Templates</p>
            </div>
          </div>

          <div className="atp-hero-badge atp-hero-badge--2">
            <span className="atp-badge-icon">⚡</span>
            <div>
              <p className="atp-badge-num">ATS</p>
              <p className="atp-badge-lbl">Friendly</p>
            </div>
          </div>

          <div className="atp-hero-badge atp-hero-badge--3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <div>
              <p className="atp-badge-num">PDF</p>
              <p className="atp-badge-lbl">1-click</p>
            </div>
          </div>
        </div>

      </div>

      {/* ── Grid ── */}
      <div className="atp-grid-wrap">
        <div className="atp-grid">
          {ALL_TEMPLATES.map((tpl, idx) => (
            <div
              key={tpl.id}
              className={`atp-card${activeCard === tpl.id ? ' atp-card--active' : ''}${!tpl.image ? ' atp-card--blank' : ''}`}
              onMouseEnter={() => setActiveCard(tpl.id)}
              onMouseLeave={() => setActiveCard(null)}
            >
              {/* Thumbnail */}
              <div
                className="atp-thumb"
                onClick={() => setPreviewTpl(tpl)}
              >
                {tpl.image ? (
                  <img
                    src={tpl.image}
                    alt={tpl.name}
                    className="atp-thumb-img"
                    loading="lazy"
                  />
                ) : (
                  /* Blank Resume skeleton */
                  <div className="atp-blank-body">
                    <div className="atp-blank-sheet">
                      <div className="atp-bs-name" />
                      <div className="atp-bs-sub" />
                      <div className="atp-bs-hr" />
                      {[88,72,80,60,88,68,76,55,82,70].map((w,i) => (
                        <div key={i} className="atp-bs-line" style={{width:`${w}%`}} />
                      ))}
                    </div>
                    <div className="atp-blank-cta">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Start from Scratch
                    </div>
                  </div>
                )}

                {/* Index badge */}
                <span className="atp-idx">{String(idx + 1).padStart(2,'0')}</span>

                {/* Hover overlay */}
                <div className="atp-overlay">
                  <button className="atp-overlay-btn" onClick={() => setPreviewTpl(tpl)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Preview
                  </button>
                </div>
              </div>

              {/* Card footer */}
              <div className="atp-card-foot">
                <p className="atp-card-name">{tpl.name}</p>
                <div className="atp-card-btns">
                  <button className="atp-btn-use" onClick={() => handleUse(tpl)}>
                    Use
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                  <button className="atp-btn-pdf">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {previewTpl && (
        <div className="atp-modal-bg" onClick={() => setPreviewTpl(null)}>
          <div className="atp-modal" onClick={e => e.stopPropagation()}>

            {/* ── Left info panel ── */}
            <div className="atp-modal-left">
              {/* Close button */}
              <button className="atp-modal-close" onClick={() => setPreviewTpl(null)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>

              {/* Template icon */}
              <div className="atp-modal-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="14" y2="12"/><line x1="8" y1="16" x2="11" y2="16"/></svg>
              </div>

              <p className="atp-modal-label">Template Preview</p>
              <h2 className="atp-modal-name">{previewTpl.name}</h2>
              <p className="atp-modal-hint">
                A professionally designed template. Click <strong>Use Template</strong> to start building your resume with this layout.
              </p>

              {/* Feature pills */}
              <div className="atp-modal-pills">
                <span className="atp-modal-pill">⚡ ATS Friendly</span>
                <span className="atp-modal-pill">📄 PDF Export</span>
                <span className="atp-modal-pill">🎨 Customisable</span>
              </div>

              {/* CTA buttons */}
              <div className="atp-modal-btns">
                <button className="atp-modal-use" onClick={() => handleUse(previewTpl)}>
                  Use Template
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
                <button className="atp-modal-pdf">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download PDF
                </button>
              </div>
            </div>

            {/* ── Right: template image ── */}
            <div className="atp-modal-right">
              <div className="atp-modal-img-wrap">
                {previewTpl.image ? (
                  <img
                    src={previewTpl.image}
                    alt={previewTpl.name}
                    className="atp-modal-img"
                  />
                ) : (
                  <div className="atp-modal-blank-preview">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="14" y2="12"/><line x1="8" y1="16" x2="11" y2="16"/></svg>
                    <p>Blank Resume</p>
                    <p style={{fontSize:11,color:'#94a3b8'}}>Start from scratch</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}