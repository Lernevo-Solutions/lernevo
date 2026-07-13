import { useState } from "react";

const sections = [
  {
    id: "acceptance",
    number: "01",
    title: "Acceptance of Terms",
    icon: "✦",
    content:
      "By accessing or using Lernevo Wellness, you confirm that you are at least 18 years of age and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. Your continued use of Lernevo constitutes acceptance of any updates to these terms.",
  },
  {
    id: "services",
    number: "02",
    title: "Our Services",
    icon: "◈",
    content:
      "Lernevo Wellness provides an AI-powered holistic well-being platform that integrates fitness, nutrition, mental health, and learning. The platform operates under a three-tier role system: Administrator, Trainer, and User. Each role carries specific access permissions and responsibilities as defined within the platform.",
  },
  {
    id: "accounts",
    number: "03",
    title: "User Accounts & Roles",
    icon: "◉",
    content:
      "Users are responsible for maintaining the confidentiality of their account credentials. Trainers must hold valid certifications as required by Lernevo. Administrators are granted elevated access for platform oversight. Any misuse of role-based privileges may result in immediate account suspension without prior notice.",
  },
  {
    id: "data",
    number: "04",
    title: "Data & Privacy",
    icon: "⬡",
    content:
      "We collect health, fitness, and behavioral data to power personalized AI recommendations. All communications between users and trainers are encrypted end-to-end. Your data is never sold to third parties. We comply with applicable data protection laws. Wearable device data synced to Lernevo is governed by our separate Privacy Policy.",
  },
  {
    id: "ai",
    number: "05",
    title: "AI Recommendations",
    icon: "◎",
    content:
      "Lernevo's AI suggestions are for informational and motivational purposes only and do not constitute medical advice. Always consult a qualified healthcare professional before making significant health decisions. Our human-in-the-loop model ensures trainer oversight of all AI-generated wellness plans.",
  },
  {
    id: "conduct",
    number: "06",
    title: "Acceptable Use",
    icon: "⬟",
    content:
      "You agree not to misuse the platform by uploading harmful content, attempting to breach security systems, impersonating other users, or using the messaging center for any unlawful purpose. Lernevo reserves the right to remove any content or suspend any account that violates these guidelines.",
  },
  {
    id: "ip",
    number: "07",
    title: "Intellectual Property",
    icon: "◆",
    content:
      "All platform content, design, AI models, branding, and technology are the exclusive intellectual property of Lernevo Wellness. Users retain ownership of personal data they input. Workout programs created by trainers on the platform are co-owned by the trainer and Lernevo under the terms of the Trainer Agreement.",
  },
];

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState("acceptance");
  const [accepted, setAccepted] = useState(false);

  const current = sections.find((s) => s.id === activeSection);
  const currentIdx = sections.findIndex((s) => s.id === activeSection);

  const goNext = () => { if (currentIdx < sections.length - 1) setActiveSection(sections[currentIdx + 1].id); };
  const goPrev = () => { if (currentIdx > 0) setActiveSection(sections[currentIdx - 1].id); };

  const progress = Math.round(((currentIdx + 1) / sections.length) * 100);

  return (
    <>
     <style>{`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #f0f6ff; }

        /* Scrollbar */
        .sidebar::-webkit-scrollbar { width: 4px; }
        .sidebar::-webkit-scrollbar-track { background: transparent; }
        .sidebar::-webkit-scrollbar-thumb { background: #c7d8f0; border-radius: 999px; }

        /* Sidebar nav buttons */
        .snav {
          display: flex; align-items: center; gap: 14px;
          padding: 13px 16px; border-radius: 12px;
          border: none; background: transparent;
          cursor: pointer; text-align: left; width: 100%;
          transition: all 0.2s ease;
        }
        .snav:hover { background: #eff6ff; }
        .snav.on {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          box-shadow: inset 4px 0 0 #1D4ED8;
        }

        /* Primary button */
        .bp {
          padding: 14px 32px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #1D4ED8, #2563EB);
          color: white; font-size: 17px; font-weight: 800;
          cursor: pointer; letter-spacing: 0.3px;
          box-shadow: 0 6px 20px rgba(29,78,216,0.3);
          transition: all 0.2s;
        }
        .bp:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(29,78,216,0.38); }
        .bp.done { background: linear-gradient(135deg, #059669, #10B981); box-shadow: 0 6px 20px rgba(5,150,105,0.3); }

        /* Secondary button */
        .bs {
          padding: 14px 28px; border-radius: 12px;
          border: 2px solid #dde6f5; background: white;
          color: #1e293b; font-size: 17px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }
        .bs:hover:not(:disabled) { background: #f8faff; border-color: #bfcfe8; }
        .bs:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Section tab (top) */
        .stab {
          padding: 9px 20px; border-radius: 999px;
          border: 2px solid transparent;
          background: white; cursor: pointer;
          font-size: 15px; font-weight: 700;
          color: #64748b;
          transition: all 0.2s; white-space: nowrap;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .stab:hover { color: #1D4ED8; border-color: #bfdbfe; }
        .stab.on {
          background: #1D4ED8; color: white;
          border-color: #1D4ED8;
          box-shadow: 0 4px 14px rgba(29,78,216,0.28);
        }

        .progress-bar { transition: width 0.45s cubic-bezier(0.4,0,0.2,1); }
        .card-anim { animation: fadeUp 0.3s ease; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .icard {
          flex: 1; display: flex; align-items: center; gap: 14px;
          background: white; border-radius: 16px;
          padding: 18px 20px;
          border: 1.5px solid #e2ecf9;
          box-shadow: 0 2px 10px rgba(29,78,216,0.05);
          transition: all 0.2s;
        }
        .icard:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(29,78,216,0.1); }
      `}</style>

      <div className="tos" style={{
        minHeight: "100vh",
        background: "linear-gradient(150deg, #dbeafe 0%, #eff6ff 35%, #f8faff 70%, #ffffff 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "36px 52px 28px",
        gap: "28px",
      }}>
        

        {/* ── TOP HEADER ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          {/* Left: Branding + title */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 14px rgba(29,78,216,0.35)",
                fontSize: "22px", fontWeight: "900", color: "white",
              }}></div>
              <div>
               
              </div>
            </div>
            <h1 style={{ fontSize: "52px", fontWeight: "900", color: "#0f172a", lineHeight: "1.05", letterSpacing: "-2px" }}>
              Terms of <span style={{ color: "#1D4ED8" }}>Service</span>
            </h1>
            <p style={{ fontSize: "18px", fontWeight: "500", color: "#64748b", marginTop: "10px", lineHeight: "1.5" }}>
              Please read all sections before using Lernevo Wellness.
            </p>
          </div>

          {/* Right: Meta */}
          <div style={{ textAlign: "right", paddingTop: "8px" }}>
            <div style={{
              display: "inline-block",
              background: "#eff6ff", borderRadius: "999px",
              padding: "8px 20px", marginBottom: "10px",
              border: "1.5px solid #bfdbfe",
            }}>
             
            </div>
           
          </div>
        </div>

        {/* ── SECTION TABS (scrollable row) ── */}
        <div style={{
          display: "flex", gap: "10px", overflowX: "auto",
          paddingBottom: "4px",
        }}>
          {sections.map((s) => (
            <button
              key={s.id}
              className={`stab ${activeSection === s.id ? "on" : ""}`}
              onClick={() => setActiveSection(s.id)}
            >
              {s.number}. {s.title}
            </button>
          ))}
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div style={{ display: "flex", gap: "24px", flex: 1, minHeight: 0 }}>

          {/* LEFT SIDEBAR */}
          <div className="sidebar" style={{
            width: "280px", flexShrink: 0,
            background: "white", borderRadius: "20px",
            border: "1.5px solid #dde6f5",
            boxShadow: "0 4px 20px rgba(29,78,216,0.06)",
            padding: "20px 12px",
            overflowY: "auto",
            display: "flex", flexDirection: "column", gap: "4px",
          }}>
            <p style={{
              fontSize: "12px", fontWeight: "800", color: "#94a3b8",
              letterSpacing: "2px", textTransform: "uppercase",
              padding: "0 8px 12px",
            }}>Contents</p>

            {sections.map((s, i) => (
              <button
                key={s.id}
                className={`snav ${activeSection === s.id ? "on" : ""}`}
                onClick={() => setActiveSection(s.id)}
              >
                <span style={{
                  fontSize: "13px", fontWeight: "800",
                  color: activeSection === s.id ? "#1D4ED8" : "#c4d0e0",
                  minWidth: "26px",
                }}>{s.number}</span>
                <span style={{
                  fontSize: "16px",
                  fontWeight: activeSection === s.id ? "800" : "600",
                  color: activeSection === s.id ? "#0f172a" : "#475569",
                  flex: 1, lineHeight: "1.3",
                }}>{s.title}</span>
                {activeSection === s.id && (
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1D4ED8", flexShrink: 0 }} />
                )}
              </button>
            ))}

            {/* Progress inside sidebar */}
            <div style={{ marginTop: "auto", padding: "16px 8px 4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Progress</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#1D4ED8" }}>{progress}%</span>
              </div>
              <div style={{ height: "6px", background: "#e2ecf9", borderRadius: "999px", overflow: "hidden" }}>
                <div className="progress-bar" style={{
                  height: "100%", width: `${progress}%`,
                  background: "linear-gradient(90deg, #1D4ED8, #60a5fa)",
                  borderRadius: "999px",
                }} />
              </div>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginTop: "8px" }}>
                {currentIdx + 1} of {sections.length} sections
              </p>
            </div>
          </div>

          {/* RIGHT: CONTENT */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "18px", minHeight: 0 }}>

            {/* Main content card */}
            <div
              key={activeSection}
              className="card-anim"
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "44px 52px",
                border: "1.5px solid #dde6f5",
                boxShadow: "0 6px 30px rgba(29,78,216,0.07)",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Section badge row */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px",
                  background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                  border: "1.5px solid #bfdbfe",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", color: "#1D4ED8", fontWeight: "900",
                }}>{current.icon}</div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "800", color: "#1D4ED8", letterSpacing: "1px", textTransform: "uppercase" }}>
                    Section {current.number}
                  </p>
                  <h2 style={{ fontSize: "36px", fontWeight: "900", color: "#0f172a", letterSpacing: "-1px", lineHeight: "1.1" }}>
                    {current.title}
                  </h2>
                </div>
              </div>

              {/* Decorative line */}
              <div style={{
                height: "3px", marginBottom: "28px",
                background: "linear-gradient(90deg, #1D4ED8 0%, #60a5fa 50%, transparent 100%)",
                borderRadius: "999px",
              }} />

              {/* Body */}
              <p style={{
                fontSize: "19px", fontWeight: "500",
                color: "#334155", lineHeight: "2",
                flex: 1,
              }}>{current.content}</p>

              {/* Nav buttons */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "36px" }}>
                <button className="bs" disabled={currentIdx === 0} onClick={goPrev}>
                  ← Previous
                </button>

                <div style={{ display: "flex", gap: "6px" }}>
                  {sections.map((s, i) => (
                    <div
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      style={{
                        width: activeSection === s.id ? "28px" : "10px",
                        height: "10px",
                        borderRadius: "999px",
                        background: activeSection === s.id ? "#1D4ED8" : "#dde6f5",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                      }}
                    />
                  ))}
                </div>

                {currentIdx < sections.length - 1 ? (
                  <button className="bp" onClick={goNext}>Next →</button>
                ) : (
                  <button className={`bp ${accepted ? "done" : ""}`} onClick={() => setAccepted(true)}>
                    {accepted ? "✓ Terms Accepted" : "Accept Terms"}
                  </button>
                )}
              </div>
            </div>

            {/* Info cards row */}
            <div style={{ display: "flex", gap: "16px" }}>
              {[
                { icon: "🔐", title: "End-to-End Encrypted", desc: "All trainer messages are fully secure" },
                { icon: "🤝", title: "Human-in-the-Loop", desc: "AI supervised by certified trainers" },
                { icon: "🛡️", title: "Your Data is Safe", desc: "Never sold to third parties" },
                
              ].map((c) => (
                <div key={c.title} className="icard">
                  <span style={{ fontSize: "26px" }}>{c.icon}</span>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", marginBottom: "3px" }}>{c.title}</p>
                    <p style={{ fontSize: "13px", fontWeight: "500", color: "#94a3b8" }}>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: "16px", borderTop: "1.5px solid #dde6f5",
        }}>
          <p style={{ fontSize: "15px", fontWeight: "600", color: "#94a3b8" }}>
            © 2026 Lernevo Wellness. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "28px" }}>
            {["Privacy Policy", "Contact Support", "About Us"].map((l) => (
              <span key={l} style={{ fontSize: "15px", fontWeight: "700", color: "#2563eb", cursor: "pointer" }}>{l}</span>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}