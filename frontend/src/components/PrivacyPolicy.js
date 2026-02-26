import React from 'react';
import './PrivacyPolicy.css'; // We'll create this CSS file next

const PrivacyPolicy = () => {
  return (
    <div className="policy-wrapper">
      <PolicyHeader />
      <div className="policy-grid">
        <TableOfContents />
        <MainContent />
      </div>
    </div>
  );
};

// Header Component
const PolicyHeader = () => (
  <div className="policy-header">
    <div className="title-section">
      <h1>Privacy & data policy</h1>
      <span className="badge">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        GDPR compliant
      </span>
    </div>
    
    </div>
 
);

// Table of Contents Component
const TableOfContents = () => (
  <aside className="toc-sidebar" aria-label="table of contents">
    <div className="toc-title">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
      contents
    </div>
    <ul className="toc-links">
      <li><a href="#collection">📘 1. Data collection</a></li>
      <li><a href="#usage">🔧 2. How we use it</a></li>
      <li><a href="#cookies">🍪 3. Cookies & tracking</a></li>
      <li><a href="#sharing">🤝 4. Information sharing</a></li>
      <li><a href="#rights">🛡️ 5. Your rights</a></li>
      <li><a href="#retention">⏳ 6. Data retention</a></li>
      <li><a href="#contact">📬 7. Contact</a></li>
    </ul>
    <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#6385aa', borderLeft: '2px solid #c9ddec', paddingLeft: '0.8rem' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2a6291" style={{ display: 'inline', marginRight: '6px' }}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
      we respect your privacy
    </div>
  </aside>
);

// Main Content Component
const MainContent = () => (
  <main className="policy-card">
    <Section
      id="collection"
      icon={<CollectionIcon />}
      title="1. What we collect"
    >
      <p>We collect information to provide better services to all our users. You can browse without telling us who you are, but for certain features we need data.</p>
      <div className="data-types">
        <span className="data-badge">📇 name & email</span>
        <span className="data-badge">📞 phone (optional)</span>
        <span className="data-badge">🏢 company / role</span>
        <span className="data-badge">📄 messages & support</span>
      </div>
      <p><strong>Usage data:</strong> pages visited, clicks, time spent, and referral links (always anonymized after 26 months).</p>
    </Section>

    <Section
      id="usage"
      icon={<UsageIcon />}
      title="2. How we use it"
    >
      <ul>
        <li>✅ provide, operate & maintain the website</li>
        <li>✅ improve, personalize your experience</li>
        <li>✅ communicate updates, security alerts</li>
        <li>📊 analyze usage with aggregated statistics</li>
      </ul>
      <div className="highlight-box">
        ⚖️ Legal basis: performance of contract, legitimate interest, or your consent (you can withdraw anytime).
      </div>
    </Section>

    <Section
      id="cookies"
      icon={<CookiesIcon />}
      title="3. Cookies & similar tech"
    >
      <p>We use cookies to keep you logged in, remember preferences, and track site usage. You can control them via browser settings.</p>
      <div className="two-col-cookies">
        <div className="cookie-col">
          <p>🍪 Essential (always on)</p>
          <p style={{ fontSize: '0.9rem', color: '#3e5f7e' }}>session, security, load balancing – no personal info</p>
        </div>
        <div className="cookie-col">
          <p>📈 Analytics & performance</p>
          <p style={{ fontSize: '0.9rem', color: '#3e5f7e' }}>privacy-friendly, aggregated (opt-out available)</p>
        </div>
      </div>
      <p>Third‑party embeds (videos, maps) may set their own cookies – please refer to their policies.</p>
    </Section>

    <Section
      id="sharing"
      icon={<SharingIcon />}
      title="4. Information sharing"
    >
      <p>We <strong>do not sell</strong> your personal data. We may share with trusted service providers (hosting, analytics) who adhere to strict data protection terms. If required by law, we may disclose information to authorities.</p>
    </Section>

    <Section
      id="rights"
      icon={<RightsIcon />}
      title="5. Your privacy rights"
    >
      <ul>
        <li>🔍 Right to access / rectification</li>
        <li>🧹 Right to erasure (“right to be forgotten”)</li>
        <li>⏸️ Right to restriction / objection</li>
        <li>📤 Data portability</li>
      </ul>
      <p>To exercise rights, just <a href="#contact" style={{ color: '#1a5e9c', textDecoration: 'underline', textUnderlineOffset: '3px' }}>contact us</a> – we’ll respond within 30 days.</p>
    </Section>

    <Section
      id="retention"
      icon={<RetentionIcon />}
      title="6. Data retention"
    >
      <p>We store personal data only as long as necessary: account information until closure, usage logs up to 12 months, and cookie identifiers max 13 months. Anonymized aggregates may be kept longer.</p>
    </Section>

    <Section
      id="contact"
      icon={<ContactIcon />}
      title="7. Contact & DPO"
    >
      <p>Have questions? Our Data Protection Officer is happy to help:</p>
      <div className="contact-chip" style={{ margin: '1.2rem 0 0.5rem' }}>
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        privacy@yourdomain.com
      </div>
      <div className="contact-chip">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
        +1 (800) 555‑0199
      </div>
      <p style={{ marginTop: '1.5rem' }}>or write to: <span style={{ background: '#edf4fd', padding: '0.2rem 1rem', borderRadius: '40px' }}>Legal Dept., 123 Data Street, SV 98765</span></p>
    </Section>

    <hr />
    <div className="footer-note">
      <span>🔒 This document is a binding part of our Terms of Service.</span>
      <span style={{ display: 'flex', gap: '1rem' }}>
        <span>📄 v2.3</span>
        <span>🌐 available in 6 languages</span>
      </span>
    </div>
  </main>
);

// Section wrapper component
const Section = ({ id, icon, title, children }) => (
  <section id={id} className="policy-section">
    <div className="section-head">
      <span className="section-icon">{icon}</span>
      <h2>{title}</h2>
    </div>
    <div className="section-content">{children}</div>
  </section>
);

// Icon components (simplified SVG wrappers)
const CollectionIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2">
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const UsageIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2">
    <path d="M2 12h4l3-9 4 18 3-9h4" />
  </svg>
);

const CookiesIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4l2 2" />
  </svg>
);

const SharingIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2">
    <path d="M20 12H4M12 4v16" />
  </svg>
);

const RightsIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const RetentionIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ContactIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2">
    <path d="M22 16.92v3a1.999 1.999 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8 10a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

export default PrivacyPolicy;