import React from "react";
import "./TrustandSafety.css";

const TrustandSafety = () => {
  return (
    <div className="trust-page">
      {/* Header */}
      <header className="trust-header">
        <h1 className="trust-title">Trust & Safety</h1>
        <p className="trust-subtitle">
          At Lernevo Wellness, your confidence and security are the foundation
          of everything we build. Here's how we protect our community—
          transparent, ethical, and always human-centered.
        </p>
      </header>

      {/* 2x2 Grid */}
      <div className="trust-grid">
        {/* Card 1 */}
        <div className="trust-card">
          <span className="card-icon">🔒</span>
          <h3 className="card-title">Data security & privacy</h3>
          <p className="card-text">
            <strong>End-to-end encrypted</strong> messaging and strict
            role-based access controls. Your data never leaves our compliant
            infrastructure.
          </p>
          <ul className="card-list">
            <li>✔ Audit trails & access logs</li>
            <li>✔ User data never sold</li>
            <li>✔ Biometric & health info encrypted</li>
          </ul>
          <div className="divider" />
          <span className="badge">GDPR / HIPAA ready</span>
        </div>

        {/* Card 2 */}
        <div className="trust-card">
          <span className="card-icon">🧠</span>
          <h3 className="card-title">Ethical AI, human heart</h3>
          <p className="card-text">
            Our AI supports—never replaces—real trainers. Every recommendation
            is reviewed by certified professionals.
          </p>
          <ul className="card-list">
            <li>✔ Human oversight on all health plans</li>
            <li>✔ AI is a co-pilot, not an autopilot</li>
            <li>✔ Continuous bias monitoring</li>
          </ul>
          <div className="divider" />
          <span className="badge">Human-in-the-loop since day one</span>
        </div>

        {/* Card 3 */}
        <div className="trust-card">
          <span className="card-icon">🛡️</span>
          <h3 className="card-title">Platform integrity</h3>
          <p className="card-text">
            Multi-tier access: users, trainers, admins. Each role sees only what
            they need. No data fragmentation—just secure collaboration.
          </p>
          <ul className="card-list">
            <li>✔ Trainers see client health metrics</li>
            <li>✔ Admins view only aggregated analytics</li>
            <li>✔ Secure message centre, audit-ready</li>
          </ul>
          <div className="divider" />
          <span className="badge">Role-based access (RBAC)</span>
        </div>

        {/* Card 4 */}
        <div className="trust-card">
          <span className="card-icon">✅</span>
          <h3 className="card-title">Your peace of mind</h3>
          <p className="card-text">
            From data protection to ethical practices, we design everything to
            protect you and our users. Leadership is always accessible.
          </p>
          <ul className="card-list">
            <li>✔ Direct message channel to leadership</li>
            <li>✔ Whistleblower protection in culture</li>
            <li>✔ Regular security training for all</li>
          </ul>
          <div className="divider" />
          <span className="badge">#buildwithtrust</span>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="trust-footer">
        🔐 Lernevo Wellness — your holistic health, our highest priority.
      </div>
    </div>
  );
};

export default TrustandSafety;