import { useState } from "react";

const sections = [
  {
    id: "collection",
    icon: "🗂️",
    tag: "01",
    title: "Data We Collect",
    short: "What we gather from you",
    content:
      "We collect information you provide directly — such as your name, email, fitness goals, health metrics, and wearable device data. Our AI engine also learns from your behavioral patterns, workout logs, nutrition entries, sleep data, and mood tracking to deliver hyper-personalized wellness plans tailored to you.",
    color: "#2563eb",
    light: "#eff6ff",
  },
  {
    id: "usage",
    icon: "⚙️",
    tag: "02",
    title: "How We Use It",
    short: "Powering your experience",
    content:
      "Your data powers your personalized AI companion experience — generating real-time fitness, nutrition, and mental health recommendations. It also enables your assigned trainer to monitor your progress and provide professional, data-driven guidance. We never use your data for advertising purposes.",
    color: "#0369a1",
    light: "#f0f9ff",
  },
  {
    id: "sharing",
    icon: "🔗",
    tag: "03",
    title: "Data Sharing",
    short: "Who can see your info",
    content:
      "Your personal health data is shared only with your assigned certified trainer on the platform, within our role-based access system (Admin → Trainer → User). We do not sell, trade, or rent your information to third parties. Aggregate, anonymized data may be used internally for product improvement.",
    color: "#1d4ed8",
    light: "#eef2ff",
  },
  {
    id: "security",
    icon: "🔐",
    tag: "04",
    title: "Security & Encryption",
    short: "How we protect you",
    content:
      "All communications between users and trainers are end-to-end encrypted through our secure Message Centre. We employ enterprise-grade encryption, audit trails, and strict access controls — built to meet stringent digital health compliance standards, far beyond consumer-grade messaging applications.",
    color: "#1e40af",
    light: "#e8f0fe",
  },
  {
    id: "rights",
    icon: "⚖️",
    tag: "05",
    title: "Your Rights",
    short: "Control over your data",
    content:
      "You have the right to access, correct, or delete your personal data at any time. You may request a full export of your health data or withdraw consent for specific data processing activities. Requests are processed within 30 days. Contact our support team to exercise these rights.",
    color: "#3b82f6",
    light: "#f0f6ff",
  },
];

const tickerItems = [
  "🌿 Lernevo Wellness", "◆", "🔒 Privacy First", "◆",
  "🌿 Lernevo Wellness", "◆", "💙 Your Data, Protected", "◆",
  "🌿 Lernevo Wellness", "◆", "⚡ AI-Powered Wellness", "◆",
  "🌿 Lernevo Wellness", "◆", "🛡️ Enterprise Encryption", "◆",
  "🌿 Lernevo Wellness", "◆", "🤝 Human + AI Care", "◆",
  "🌿 Lernevo Wellness", "◆", "🔒 Privacy First", "◆",
  "🌿 Lernevo Wellness", "◆", "💙 Your Data, Protected", "◆",
  "🌿 Lernevo Wellness", "◆", "⚡ AI-Powered Wellness", "◆",
];

export default function PrivacyPolicy() {
  const [active, setActive] = useState(null);

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "#ffffff",
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-wrap { animation: ticker 30s linear infinite; }
        .ticker-wrap:hover { animation-play-state: paused; }

        @keyframes slideIn {
          from { opacity: 0; max-height: 0; transform: translateY(-8px); }
          to { opacity: 1; max-height: 200px; transform: translateY(0); }
        }
        .answer-open {
          animation: slideIn 0.35s ease forwards;
          overflow: hidden;
        }

        .row-item {
          transition: background 0.2s ease;
        }
        .row-item:hover {
          background: #f8faff !important;
        }
        .row-item.open {
          background: #f0f6ff !important;
        }
      `}</style>

      {/* TOP TICKER */}
      <div style={{
        background: "#1e3a8a",
        height: 150,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        position: "relative",
        flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 60,
          background: "linear-gradient(90deg, #1e3a8a, transparent)",
          zIndex: 2, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: 60,
          background: "linear-gradient(-90deg, #1e3a8a, transparent)",
          zIndex: 2, pointerEvents: "none",
        }} />
        <div className="ticker-wrap" style={{ display: "flex", width: "max-content" }}>
          {tickerItems.map((item, i) => (
            <span key={i} style={{
              padding: "0 18px",
              fontSize: "0.75rem",
              fontWeight: item === "◆" ? 400 : (item.includes("Lernevo") ? 800 : 600),
              color: item === "◆" ? "rgba(147,197,253,0.5)" :
                     item.includes("Lernevo") ? "#93c5fd" : "rgba(255,255,255,0.85)",
              letterSpacing: item.includes("Lernevo") ? "-0.2px" : "0.5px",
              whiteSpace: "nowrap",
            }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* MAIN AREA — split layout */}
      <div style={{
        flex: 1,
        display: "flex",
        overflow: "hidden",
      }}>

        {/* LEFT — Bold brand panel */}
        <div style={{
          width: 340,
          flexShrink: 0,
          background: "linear-gradient(160deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "44px 36px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative circles */}
          <div style={{
            position: "absolute", bottom: -60, right: -60,
            width: 260, height: 260, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -20, right: -20,
            width: 160, height: 160, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: 120, left: -80,
            width: 200, height: 200, borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            pointerEvents: "none",
          }} />

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>🌿</div>
            <span style={{
              color: "white", fontWeight: 800, fontSize: "1rem",
              letterSpacing: "-0.3px",
            }}>Lernevo Wellness</span>
          </div>

          {/* Headline */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.12)",
              borderRadius: 6, padding: "4px 12px",
              marginBottom: 20,
            }}>
              <span style={{ fontSize: "0.7rem", color: "#93c5fd", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
                Legal
              </span>
            </div>

            <h1 style={{
              fontSize: "2.6rem",
              fontWeight: 900,
              color: "white",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
              marginBottom: 20,
            }}>
              Privacy<br />Policy
            </h1>

            <div style={{
              width: 40, height: 3,
              background: "rgba(255,255,255,0.3)",
              borderRadius: 2, marginBottom: 24,
            }} />

            <p style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.88rem",
              lineHeight: 1.7,
              maxWidth: 230,
            }}>
              We believe transparency is the foundation of trust. Here's exactly how we handle your data.
            </p>
          </div>

          {/* Bottom meta */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13,
              }}>📧</div>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem" }}>
               Lernevo123@gmail.com
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13,
              }}>🕐</div>
              
            </div>
          </div>
        </div>

        {/* RIGHT — Accordion list */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#ffffff",
        }}>
          {/* Column headers */}
          <div style={{
            display: "flex",
            alignItems: "center",
            padding: "0 36px",
            height: 48,
            borderBottom: "2px solid #1e3a8a",
            background: "#f8faff",
            flexShrink: 0,
          }}>
            <span style={{
              width: 48, fontSize: "0.65rem", fontWeight: 800,
              color: "#93c5fd", letterSpacing: "2px", textTransform: "uppercase",
            }}>#</span>
            <span style={{
              flex: 1, fontSize: "0.65rem", fontWeight: 800,
              color: "#93c5fd", letterSpacing: "2px", textTransform: "uppercase",
            }}>Section</span>
            <span style={{
              width: 200, fontSize: "0.65rem", fontWeight: 800,
              color: "#93c5fd", letterSpacing: "2px", textTransform: "uppercase",
            }}>Summary</span>
            <span style={{
              width: 32, fontSize: "0.65rem", fontWeight: 800,
              color: "#93c5fd", letterSpacing: "2px", textTransform: "uppercase",
            }}></span>
          </div>

          {/* Accordion rows */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {sections.map((sec, idx) => {
              const isOpen = active === sec.id;
              return (
                <div key={sec.id}>
                  {/* Row */}
                  <div
                    className={`row-item ${isOpen ? "open" : ""}`}
                    onClick={() => setActive(isOpen ? null : sec.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "0 36px",
                      height: 72,
                      borderBottom: "1px solid #e8f0fe",
                      cursor: "pointer",
                      background: isOpen ? "#f0f6ff" : "white",
                    }}
                  >
                    {/* Number */}
                    <div style={{
                      width: 48,
                      display: "flex", alignItems: "center",
                    }}>
                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        color: isOpen ? sec.color : "#cbd5e1",
                        letterSpacing: "0.5px",
                      }}>{sec.tag}</span>
                    </div>

                    {/* Icon + Title */}
                    <div style={{
                      flex: 1,
                      display: "flex", alignItems: "center", gap: 14,
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: isOpen ? sec.light : "#f8faff",
                        border: `1px solid ${isOpen ? sec.color + "33" : "#e8f0fe"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18,
                        transition: "all 0.2s",
                      }}>
                        {sec.icon}
                      </div>
                      <span style={{
                        fontSize: "1rem",
                        fontWeight: isOpen ? 800 : 600,
                        color: isOpen ? "#1e3a8a" : "#374151",
                        letterSpacing: "-0.3px",
                        transition: "all 0.2s",
                      }}>
                        {sec.title}
                      </span>
                    </div>

                    {/* Short desc */}
                    <div style={{ width: 200 }}>
                      <span style={{
                        fontSize: "0.82rem",
                        color: "#94a3b8",
                        fontStyle: "italic",
                      }}>{sec.short}</span>
                    </div>

                    {/* Chevron */}
                    <div style={{
                      width: 32, height: 32,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 8,
                      background: isOpen ? sec.color : "transparent",
                      transition: "all 0.25s ease",
                    }}>
                      <svg
                        width="14" height="14" viewBox="0 0 14 14"
                        style={{
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.25s ease",
                        }}
                      >
                        <path
                          d="M2 4.5L7 9.5L12 4.5"
                          stroke={isOpen ? "white" : "#94a3b8"}
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isOpen && (
                    <div
                      className="answer-open"
                      style={{
                        borderBottom: `2px solid ${sec.color}22`,
                        background: sec.light,
                        padding: "0 36px 28px 36px",
                      }}
                    >
                      <div style={{
                        display: "flex",
                        gap: 24,
                        paddingTop: 20,
                      }}>
                        {/* Left accent bar */}
                        <div style={{
                          width: 3,
                          borderRadius: 2,
                          background: `linear-gradient(180deg, ${sec.color}, ${sec.color}44)`,
                          flexShrink: 0,
                          marginLeft: 60,
                        }} />
                        <p style={{
                          fontSize: "0.95rem",
                          color: "#374151",
                          lineHeight: 1.8,
                          maxWidth: 580,
                        }}>
                          {sec.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom bar */}
          <div style={{
            height: 52,
            borderTop: "1px solid #dbeafe",
            background: "#f8faff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 36px",
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500,
            }}>
              {active
                ? `Viewing: ${sections.find(s => s.id === active)?.title}`
                : "Select a section to read more"}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {sections.map((sec) => (
                <div
                  key={sec.id}
                  onClick={() => setActive(active === sec.id ? null : sec.id)}
                  style={{
                    width: active === sec.id ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: active === sec.id ? "#2563eb" : "#bfdbfe",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}