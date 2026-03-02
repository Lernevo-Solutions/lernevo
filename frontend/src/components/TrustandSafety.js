import { useState } from "react";

/* ================= ICONS ================= */

const Shield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "100%", height: "100%" }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const Lock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "100%", height: "100%" }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const Eye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "100%", height: "100%" }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const Users = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "100%", height: "100%" }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "100%", height: "100%" }}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const Zap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "100%", height: "100%" }}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

/* ================= DATA ================= */

const pillars = [
  {
    icon: <Lock />,
    title: "End-to-End Encryption",
    desc: "Every message between you and your trainer is fully encrypted. Your private conversations remain private — always.",
  },
  {
    icon: <Eye />,
    title: "Transparent Data Use",
    desc: "We only use your health data to improve your personalized experience. We never sell or share your information with third parties.",
  },
  {
    icon: <Users />,
    title: "Role-Based Access Control",
    desc: "Your data is protected by strict role-based permissions. Only your assigned trainer can view your health metrics — no exceptions.",
  },
  {
    icon: <Zap />,
    title: "Real-Time Threat Monitoring",
    desc: "Our security infrastructure monitors for threats around the clock, ensuring your account and data stay protected 24/7.",
  },
  {
    icon: <CheckCircle />,
    title: "Compliance & Audit Trails",
    desc: "Lernevo maintains complete audit trails and operates under stringent compliance frameworks for digital health platforms.",
  },
  {
    icon: <Shield />,
    title: "Human-in-the-Loop AI",
    desc: "Our AI never acts alone. Every critical decision is reviewed and guided by certified human trainers for your safety.",
  },
];

const badges = [
  { label: "256-bit AES Encryption", icon: "🔐" },
  { label: "GDPR Compliant", icon: "🛡️" },
  { label: "ISO 27001 Aligned", icon: "✅" },
  { label: "Zero Data Selling", icon: "🚫" },
];

/* ================= COMPONENT ================= */

export default function TrustSafetyPage() {
  const [hovered, setHovered] = useState(null);

  return (
    <div
      style={{
        width: "100%",
        background:
          "linear-gradient(135deg, #f0f6ff 0%, #e8f0fe 50%, #f5f8ff 100%)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ===== CONTAINER ===== */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "100px 40px 80px",
        }}
      >
        {/* ===== HEADER ===== */}
        <div style={{ textAlign: "center", marginBottom: "70px" }}>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
              fontWeight: 900,
              marginBottom: "20px",
              letterSpacing: "-1px",
              color: "#0f172a",
            }}
          >
            Trust &{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Safety
            </span>
          </h1>

          <p
            style={{
              maxWidth: "760px",
              margin: "0 auto",
              fontSize: "1.15rem",
              lineHeight: 1.7,
              color: "#475569",
            }}
          >
            Your health data is sacred. We've built Lernevo from the ground up
            with security, privacy, and human oversight at its core.
          </p>
        </div>

        {/* ===== BADGES ===== */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "14px",
            marginBottom: "80px",
          }}
        >
          {badges.map((b) => (
            <div
              key={b.label}
              style={{
                background: "white",
                border: "1.5px solid #bfdbfe",
                borderRadius: "999px",
                padding: "10px 22px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#1e40af",
                boxShadow: "0 4px 14px rgba(37,99,235,0.08)",
              }}
            >
              {b.icon} {b.label}
            </div>
          ))}
        </div>

        {/* ===== GRID ===== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "32px",
          }}
        >
          {pillars.map((p, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: "white",
                borderRadius: "24px",
                padding: "36px 32px",
                border:
                  hovered === i
                    ? "1.5px solid #93c5fd"
                    : "1.5px solid #e2e8f0",
                boxShadow:
                  hovered === i
                    ? "0 20px 50px rgba(37,99,235,0.15)"
                    : "0 6px 20px rgba(0,0,0,0.06)",
                transform:
                  hovered === i
                    ? "translateY(-6px)"
                    : "translateY(0)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, #2563eb, #4f46e5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  marginBottom: "20px",
                  boxShadow:
                    "0 6px 20px rgba(37,99,235,0.25)",
                }}
              >
                {p.icon}
              </div>

              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  marginBottom: "12px",
                  color: "#0f172a",
                }}
              >
                {p.title}
              </h3>

              <p
                style={{
                  fontSize: "0.95rem",
                  lineHeight: 1.7,
                  color: "#64748b",
                }}
              >
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ===== CTA ===== */}
        <div
          style={{
            marginTop: "110px",
            background:
              "linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)",
            borderRadius: "32px",
            padding: "70px 80px",
            textAlign: "center",
            boxShadow:
              "0 30px 70px rgba(37,99,235,0.35)",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>
            🛡️
          </div>

          <h2
            style={{
              color: "white",
              fontSize: "1.8rem",
              fontWeight: 900,
              marginBottom: "16px",
            }}
          >
            Have a security concern?
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              marginBottom: "28px",
            }}
          >
            Our security team is available 24/7. We respond within 24 hours.
          </p>

          <button
            style={{
              background: "white",
              color: "#1d4ed8",
              border: "none",
              borderRadius: "14px",
              padding: "16px 44px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.target.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.target.style.transform = "scale(1)")
            }
          >
            Contact Security Team →
          </button>
        </div>
      </div>
    </div>
  );
}