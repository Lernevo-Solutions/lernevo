import { useState } from "react";

const topics = [
  {
    icon: "🔗",
    q: "How do I connect my fitness tracker?",
    a: "🚧 Coming Soon! Wearable device integration is currently in development and will be available in a future update. Stay tuned!",
    tag: "Coming Soon",
  },
  {
    icon: "🤖",
    q: "How does AI personalization work?",
    a: "Our AI engine continuously learns from your inputs, behavioral patterns, and activity history to deliver real-time, customized recommendations for fitness, nutrition, and mental health.",
    tag: "AI",
  },
  {
    icon: "💬",
    q: "Can I message my trainer directly?",
    a: "Yes! Use the secure Message Center to chat with your assigned trainer. All conversations are end-to-end encrypted for your privacy.",
    tag: "Communication",
  },
  {
    icon: "👥",
    q: "How do I join a workout group?",
    a: "Browse groups created by trainers and admins from your dashboard. Join groups that match your fitness level and participate in challenges.",
    tag: "Community",
  },
  {
    icon: "🔐",
    q: "Is my health data secure?",
    a: "Absolutely. All your data is protected with enterprise-grade encryption, strict access controls, and audit trails — meeting the highest standards in digital health security.",
    tag: "Privacy",
  },
  {
    icon: "🥗",
    q: "How do I track my nutrition?",
    a: "Log your meals manually or use smart input options available in the app. View AI-powered nutrition insights and trends on your personal dashboard.",
    tag: "Nutrition",
  },
];

const tutorials = [
  {
    num: "01",
    title: "Setting Up Your Profile",
    desc: "Create your personalized wellness profile in minutes.",
    steps: [
      { text: "Sign up & verify your email address", soon: false },
      { text: "Complete your health & fitness goals", soon: false },
      { text: "Meet your assigned certified trainer", soon: false },
      { text: "Wearable device sync — coming soon! 🚧", soon: true },
    ],
  },
  {
    num: "02",
    title: "AI Recommendations",
    desc: "Get personalized daily plans powered by our AI engine.",
    steps: [
      { text: "Navigate to your Dashboard", soon: false },
      { text: "Review AI-generated workout & nutrition plans", soon: false },
      { text: "Track your progress and give feedback", soon: false },
      { text: "Watch the AI adapt to your habits in real-time", soon: false },
    ],
  },
  {
    num: "03",
    title: "Messaging Your Trainer",
    desc: "Stay connected through a private, secure channel.",
    steps: [
      { text: "Click on the Message Center icon", soon: false },
      { text: "Select your assigned trainer", soon: false },
      { text: "Ask questions or share progress updates", soon: false },
      { text: "Get real-time personalized advice", soon: false },
    ],
  },
  {
    num: "04",
    title: "Joining Workout Groups",
    desc: "Build accountability by joining the community.",
    steps: [
      { text: "Browse available workout groups", soon: false },
      { text: "Join groups that match your fitness level", soon: false },
      { text: "Participate in group challenges", soon: false },
      { text: "Track your group's collective progress", soon: false },
    ],
  },
];

const quickLinks = [
  { icon: "🚀", title: "Getting Started", desc: "Set up your account and begin your wellness journey." },
  { icon: "💡", title: "Feature Guides", desc: "Discover AI recommendations, nutrition tracking, trainer messaging & more." },
  { icon: "🔐", title: "Account & Privacy", desc: "Manage your profile, security settings and data preferences." },
  { icon: "⚙️", title: "Troubleshooting", desc: "Find solutions to common problems and technical questions." },
];

const tips = [
  { icon: "🚧", label: "Coming Soon", text: "Wearable device sync is on its way! Connect fitness trackers & smartwatches in a future update." },
  { icon: "🎯", label: "Pro Tip", text: "Set weekly goals and our AI will automatically adjust your daily plans to keep you on track." },
  { icon: "🔐", label: "Privacy First", text: "All your messages with trainers are end-to-end encrypted for maximum security." },
  { icon: "⚡", label: "Quick Start", text: "Setup takes under 5 minutes and your first AI recommendation arrives instantly." },
  { icon: "🤝", label: "Human Support", text: "Every user gets a certified trainer personally assigned to guide their wellness journey." },
];

const tagColors = {
  "Coming Soon": { bg: "#fef9c3", color: "#854d0e" },
  AI:            { bg: "#ede9fe", color: "#5b21b6" },
  Communication: { bg: "#dcfce7", color: "#166534" },
  Community:     { bg: "#dbeafe", color: "#1d4ed8" },
  Privacy:       { bg: "#fee2e2", color: "#991b1b" },
  Nutrition:     { bg: "#d1fae5", color: "#065f46" },
};

export default function HelpCenter() {
  const [activeTip, setActiveTip] = useState(0);
  const [activeTab, setActiveTab] = useState("topics");
  const [expandedTopic, setExpandedTopic] = useState(null);

  return (
    <div style={{
  position: "relative",
  minHeight: "50vh",
  background: "#f0f6ff",
  overflow: "hidden",
}}>

      {/* BG blobs */}
      <div style={{
        position: "absolute", top: -160, right: -160, width: 520, height: 520,
        borderRadius: "50%", background: "radial-gradient(circle, #dbeafe 0%, transparent 68%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "absolute", bottom: -120, left: -100, width: 440, height: 440,
        borderRadius: "50%", background: "radial-gradient(circle, #bfdbfe 0%, transparent 68%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1080, margin: "0 auto", padding: "0 32px 72px" }}>

        {/* ── HERO ── */}
        <div style={{
  textAlign: "center",
  padding: "90px 0 30px"   // 👈 increase top padding
}}>

  <div style={{
  position: "relative",
  textAlign: "center",
  padding: "10px 0 -0px"
}}>
  {/* glow here */}
</div>
          <div style={{
            display: "inline-block", background: "#dbeafe", color: "#1d4ed8",
            padding: "5px 18px", borderRadius: 99, fontSize: "0.7rem",
            fontWeight: 700, letterSpacing: 1.8, marginBottom: 18,
            fontFamily: "'Helvetica Neue', sans-serif", textTransform: "uppercase",
          }}>Help Center</div>
          <h1 style={{
            fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 700,
            color: "#0f2d5a", margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-2px",
          }}>
            How can we <span style={{ color: "#2563eb" }}>help you?</span>
          </h1>
          <p style={{
            color: "#5b7fa8", fontSize: "1.05rem", maxWidth: 500, margin: "0 auto",
            fontFamily: "'Helvetica Neue', sans-serif", lineHeight: 1.75,
          }}>
            Browse guides, tutorials & resources to make the most of Lernevo Wellness.
          </p>
        </div>

        {/* ── TIPS TICKER ── */}
        <div style={{
          background: "white", borderRadius: 16, padding: "16px 26px",
          display: "flex", alignItems: "center", gap: 18, marginBottom: 48,
          boxShadow: "0 2px 18px #1d4ed812", border: "1.5px solid #e0eeff",
        }}>
          <div style={{
            background: "#eff6ff", color: "#1d4ed8", padding: "6px 16px",
            borderRadius: 8, fontSize: "0.7rem", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 1.2, flexShrink: 0,
            fontFamily: "'Helvetica Neue', sans-serif", whiteSpace: "nowrap",
          }}>
            {tips[activeTip].icon} {tips[activeTip].label}
          </div>
          <span style={{ color: "#4b7ab8", fontSize: "0.88rem", flex: 1, fontFamily: "'Helvetica Neue', sans-serif", lineHeight: 1.55 }}>
            {tips[activeTip].text}
          </span>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {tips.map((_, i) => (
              <button key={i} onClick={() => setActiveTip(i)} style={{
                width: i === activeTip ? 24 : 8, height: 8, borderRadius: 4,
                border: "none", cursor: "pointer", padding: 0,
                background: i === activeTip ? "#2563eb" : "#bfdbfe",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
        </div>

        {/* ── QUICK LINKS ── */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 700, color: "#0f2d5a", marginBottom: 22, letterSpacing: "-0.5px" }}>
            Quick Links
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
            {quickLinks.map((card, i) => (
              <div key={i}
                style={{
                  background: "white", borderRadius: 18, padding: "26px 22px",
                  boxShadow: "0 2px 14px #1d4ed80e", border: "1.5px solid #e8f0fe",
                  cursor: "pointer", transition: "all 0.22s ease",
                  display: "flex", flexDirection: "column", gap: 14,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 10px 30px #2563eb1a";
                  e.currentTarget.style.borderColor = "#93c5fd";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 14px #1d4ed80e";
                  e.currentTarget.style.borderColor = "#e8f0fe";
                }}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: 14,
                  background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem",
                }}>{card.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f2d5a", marginBottom: 6 }}>{card.title}</div>
                  <div style={{ color: "#6b8db5", fontSize: "0.8rem", lineHeight: 1.65, fontFamily: "'Helvetica Neue', sans-serif" }}>{card.desc}</div>
                </div>
                <div style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.78rem", fontFamily: "'Helvetica Neue', sans-serif" }}>Explore →</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #bfdbfe, transparent)", marginBottom: 48 }} />

        {/* ── TABS ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          {[
            { key: "topics", label: "🙋 Popular Topics" },
            { key: "tutorials", label: "📖 Tutorials" },
          ].map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setExpandedTopic(null); }} style={{
              padding: "11px 26px", borderRadius: 11, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: "0.88rem", fontFamily: "inherit",
              background: activeTab === tab.key ? "#2563eb" : "white",
              color: activeTab === tab.key ? "white" : "#4b7ab8",
              boxShadow: activeTab === tab.key ? "0 4px 14px #2563eb35" : "0 1px 6px #1d4ed810",
              transition: "all 0.2s ease",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ── POPULAR TOPICS ── */}
        {activeTab === "topics" && (
          <section style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 56 }}>
            {topics.map((t, i) => {
              const tag = tagColors[t.tag] || { bg: "#eff6ff", color: "#1d4ed8" };
              const isOpen = expandedTopic === i;
              return (
                <div key={i}
                  onClick={() => setExpandedTopic(isOpen ? null : i)}
                  style={{
                    background: "white", borderRadius: 14, overflow: "hidden",
                    border: `1.5px solid ${isOpen ? "#2563eb" : "#e8f0fe"}`,
                    boxShadow: isOpen ? "0 4px 22px #2563eb16" : "0 2px 10px #1d4ed808",
                    cursor: "pointer", transition: "all 0.22s ease",
                  }}>
                  {/* Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 26px" }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 11,
                      background: "#f0f6ff", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "1.25rem", flexShrink: 0,
                    }}>{t.icon}</div>
                    <span style={{
                      fontWeight: 700, fontSize: "0.93rem", color: "#0f2d5a",
                      flex: 1, fontFamily: "'Helvetica Neue', sans-serif", lineHeight: 1.4,
                    }}>{t.q}</span>
                    <span style={{
                      background: tag.bg, color: tag.color, padding: "3px 12px",
                      borderRadius: 99, fontSize: "0.68rem", fontWeight: 700,
                      fontFamily: "'Helvetica Neue', sans-serif", flexShrink: 0, letterSpacing: 0.3,
                    }}>{t.tag}</span>
                    <span style={{
                      color: isOpen ? "#2563eb" : "#93c5fd", fontSize: "0.78rem", flexShrink: 0,
                      display: "inline-block", transition: "transform 0.22s ease",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}>▼</span>
                  </div>
                  {/* Answer */}
                  {isOpen && (
                    <div style={{
                      borderTop: "1px solid #eff6ff",
                      padding: "16px 26px 20px 82px",
                      color: "#4b7ab8", fontSize: "0.88rem",
                      fontFamily: "'Helvetica Neue', sans-serif", lineHeight: 1.75,
                    }}>{t.a}</div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* ── TUTORIALS ── */}
        {activeTab === "tutorials" && (
          <section style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
            gap: 22, marginBottom: 56,
          }}>
            {tutorials.map((t, i) => (
              <div key={i} style={{
                background: "white", borderRadius: 18, padding: "30px",
                boxShadow: "0 2px 16px #1d4ed80d", border: "1.5px solid #e8f0fe",
                display: "flex", flexDirection: "column", gap: 18,
              }}>
                {/* Card Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 13,
                    background: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: 900, fontSize: "0.9rem",
                    fontFamily: "'Helvetica Neue', sans-serif", flexShrink: 0,
                    boxShadow: "0 4px 12px #2563eb30",
                  }}>{t.num}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0f2d5a" }}>{t.title}</div>
                    <div style={{ color: "#6b8db5", fontSize: "0.78rem", fontFamily: "'Helvetica Neue', sans-serif", marginTop: 3 }}>{t.desc}</div>
                  </div>
                </div>

                {/* Steps */}
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {t.steps.map((step, j) => (
                    <div key={j} style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "10px 14px",
                      background: step.soon ? "#fefce8" : "#f7faff",
                      borderRadius: 10,
                      border: step.soon ? "1px solid #fde68a" : "1px solid transparent",
                    }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                        background: step.soon ? "#fde68a" : "linear-gradient(135deg, #2563eb, #60a5fa)",
                        color: step.soon ? "#92400e" : "white",
                        fontSize: "0.62rem", fontWeight: 900,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Helvetica Neue', sans-serif",
                      }}>{j + 1}</div>
                      <span style={{
                        color: step.soon ? "#92400e" : "#4b7ab8",
                        fontSize: "0.84rem", fontFamily: "'Helvetica Neue', sans-serif", lineHeight: 1.55,
                      }}>{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ── SUPPORT BANNER ── */}
        <div style={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #60a5fa 100%)",
          borderRadius: 22, padding: "42px 52px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 12px 44px #1d4ed82a", gap: 28,
          flexWrap: "wrap",
        }}>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: "1.5rem", marginBottom: 10, letterSpacing: "-0.5px" }}>
              Still need help?
            </div>
            <div style={{ color: "#bfdbfe", fontSize: "0.9rem", fontFamily: "'Helvetica Neue', sans-serif", lineHeight: 1.7, maxWidth: 400 }}>
              Our support team is here for you. Get in touch and we'll respond as soon as possible.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={{
              background: "rgba(255,255,255,0.15)", color: "white",
              border: "1.5px solid rgba(255,255,255,0.35)", padding: "13px 28px",
              borderRadius: 12, cursor: "pointer", fontWeight: 600,
              fontSize: "0.88rem", fontFamily: "inherit",
            }}>📧 Email Us</button>
            <button style={{
              background: "white", color: "#1d4ed8", border: "none",
              padding: "13px 28px", borderRadius: 12, cursor: "pointer",
              fontWeight: 700, fontSize: "0.88rem", fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            }}>Contact Support →</button>
          </div>
        </div>

      </div>
    </div>
  );
}