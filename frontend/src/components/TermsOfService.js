import { useState } from "react";

const sections = [
  {
    id: "acceptance",
    icon: "✦",
    title: "1. Acceptance of Terms",
    content: `By creating an account or accessing Lernevo Wellness ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform. These Terms constitute a legally binding agreement between you and Lernevo Wellness ("Lernevo," "we," "us," or "our").

These Terms apply to all users of the Platform, including end users, certified trainers, and administrators. Your continued use of the Platform constitutes ongoing acceptance of any updates to these Terms.`,
  },
  {
    id: "platform",
    icon: "◈",
    title: "2. Platform Description",
    content: `Lernevo Wellness is an AI-powered holistic well-being companion that integrates learning, fitness, nutrition, and mental health support into your daily routine. The Platform operates on a three-tier access model:

**Users** receive personalized AI-driven recommendations, goal tracking, holistic health monitoring, and direct communication with assigned trainers via our secure Message Centre.

**Trainers** are certified professionals who access client health data, provide real-time coaching, manage workout programs, and create community workout groups.

**Administrators** have aggregate platform access for business analytics, engagement management, and overall system oversight.

The Platform is powered by an AI engine that analyzes lifestyle habits, health records, and behavioral patterns to provide hyper-personalized wellness strategies.`,
  },
  {
    id: "eligibility",
    icon: "◇",
    title: "3. Eligibility & Account",
    content: `You must be at least 18 years of age to use the Platform. By registering, you represent that all information provided is accurate and complete. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.

You agree to notify us immediately of any unauthorized use of your account. Lernevo reserves the right to suspend or terminate accounts that violate these Terms, provide false information, or engage in conduct harmful to other users or the Platform.`,
  },
  {
    id: "data",
    icon: "⬡",
    title: "4. Health Data & Privacy",
    content: `Lernevo collects and processes sensitive health and wellness data, including fitness metrics, nutrition logs, sleep data, mood tracking, and data from connected wearable devices. By using the Platform, you consent to the collection, processing, and storage of this data as described in our Privacy Policy.

All communications between users and trainers are conducted through an encrypted, HIPAA-compliant secure Message Centre. We maintain strict access controls — trainers may only access data of their assigned clients, and administrators access only aggregate, anonymized platform metrics.

You retain ownership of your personal health data. You may request data export or deletion at any time, subject to applicable legal retention requirements.`,
  },
  {
    id: "ai",
    icon: "⟡",
    title: "5. AI Recommendations",
    content: `The AI-powered recommendations provided by Lernevo are for informational and wellness purposes only and do not constitute medical advice, diagnosis, or treatment. The Platform operates on a "human-in-the-loop" model — all AI suggestions are intended to complement, not replace, the professional judgment of your assigned certified trainer.

You acknowledge that AI recommendations are generated based on data you provide and may not account for individual medical conditions or contraindications. Always consult a qualified healthcare professional before making significant changes to your health or fitness regimen. Lernevo is not liable for outcomes resulting from following AI-generated recommendations without appropriate professional guidance.`,
  },
  {
    id: "conduct",
    icon: "△",
    title: "6. User Conduct",
    content: `You agree to use the Platform only for its intended wellness purposes and in compliance with all applicable laws. You must not: share your account with others; upload false, misleading, or harmful content; attempt to access data belonging to other users; reverse-engineer or tamper with the Platform's AI systems; use the secure messaging system for purposes unrelated to wellness guidance; or engage in harassing, abusive, or discriminatory conduct toward trainers, administrators, or other users.

Violations may result in immediate account suspension, termination, and potential legal action.`,
  },
  {
    id: "ip",
    icon: "◉",
    title: "7. Intellectual Property",
    content: `All content, technology, AI models, algorithms, branding, and materials on the Platform are the exclusive intellectual property of Lernevo Wellness and its licensors, protected by applicable copyright, trademark, and intellectual property laws.

You are granted a limited, non-exclusive, non-transferable license to access and use the Platform for personal wellness purposes. You may not reproduce, distribute, modify, create derivative works from, or commercially exploit any Platform content without our express written consent.

Content you upload to the Platform (such as progress photos or journal entries) remains your property, but you grant Lernevo a license to use such content to provide and improve the Platform services.`,
  },
  {
    id: "liability",
    icon: "⊕",
    title: "8. Limitation of Liability",
    content: `To the maximum extent permitted by law, Lernevo Wellness, its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, personal injury, or health outcomes arising from use of the Platform.

Lernevo's total cumulative liability for any claims arising under these Terms shall not exceed the amount you paid for the Platform in the twelve (12) months preceding the claim. Some jurisdictions do not allow limitation of liability for personal injury — in such jurisdictions, the above limitations may not apply.`,
  },
  {
    id: "governing",
    icon: "⊞",
    title: "9. Governing Law & Disputes",
    content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from or relating to these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.

Prior to initiating any formal legal proceedings, you agree to contact us to attempt to resolve the dispute informally. Lernevo will use reasonable efforts to resolve disputes within 30 days of receiving written notice.`,
  },
  {
    id: "changes",
    icon: "◐",
    title: "10. Changes to Terms",
    content: `Lernevo reserves the right to modify these Terms at any time. We will provide reasonable notice of material changes via email or prominent Platform notification. Your continued use of the Platform after the effective date of changes constitutes acceptance of the revised Terms.

If you do not agree to the revised Terms, you must discontinue use of the Platform and may request account deletion by contacting our support team.`,
  },
];

const B = {
  50:  "#eff6ff",
  100: "#dbeafe",
  200: "#bfdbfe",
  300: "#93c5fd",
  400: "#60a5fa",
  500: "#3b82f6",
  600: "#2563eb",
  700: "#1d4ed8",
  800: "#1e40af",
  900: "#1e3a8a",
};

function renderContent(text) {
  return text.split("\n\n").map((para, i) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j} style={{ color: B[800], fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    return (
      <p key={i} style={{ marginBottom: "14px", lineHeight: "1.8", color: "#374151" }}>{parts}</p>
    );
  });
}

export default function LernevoToS() {
  const [active, setActive] = useState("acceptance");
  const [agreed, setAgreed] = useState(false);
  const [modal, setModal] = useState(false);

  const data = sections.find(s => s.id === active);
  const idx  = sections.findIndex(s => s.id === active);

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Georgia','Times New Roman',serif", background:"#f0f7ff", overflow:"hidden" }}>

      {/* ── Modal ── */}
      {modal && (
        <div onClick={() => setModal(false)} style={{ position:"fixed", inset:0, background:"rgba(30,58,138,0.3)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background:"white", borderRadius:"20px", padding:"48px", maxWidth:"400px", width:"90%", textAlign:"center", boxShadow:`0 24px 60px ${B[200]}`, border:`1px solid ${B[100]}` }}>
            <div style={{ fontSize:"3rem", marginBottom:"14px" }}>🎉</div>
            <div style={{ fontSize:"1.45rem", fontWeight:700, color:B[900], marginBottom:"10px" }}>Terms Accepted!</div>
            <p style={{ color:"#6b7280", fontSize:"0.88rem", fontFamily:"sans-serif", lineHeight:"1.65", marginBottom:"28px" }}>
              Welcome to Lernevo Wellness. You've successfully accepted our Terms of Service. Your wellness journey begins now.
            </p>
            <button onClick={() => setModal(false)} style={{ padding:"11px 36px", background:`linear-gradient(135deg,${B[600]},${B[800]})`, color:"white", border:"none", borderRadius:"10px", fontSize:"0.88rem", fontWeight:700, cursor:"pointer", fontFamily:"sans-serif", boxShadow:`0 4px 14px ${B[300]}` }}>
              Get Started →
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ background:`linear-gradient(135deg,${B[700]} 0%,${B[600]} 55%,${B[500]} 100%)`, color:"white", padding:"16px 40px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, boxShadow:`0 4px 18px ${B[300]}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"40px", height:"40px", background:"rgba(255,255,255,0.18)", border:"1.5px solid rgba(255,255,255,0.4)", borderRadius:"11px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", fontWeight:900, fontFamily:"sans-serif" }}>L</div>
          <div>
            <div style={{ fontSize:"1.15rem", fontWeight:700, letterSpacing:"-0.3px" }}>Lernevo Wellness</div>
            <div style={{ fontSize:"0.67rem", opacity:0.75, letterSpacing:"2px", textTransform:"uppercase", fontFamily:"sans-serif" }}>AI Wellness Platform</div>
          </div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.35)", padding:"6px 18px", borderRadius:"20px", fontSize:"0.68rem", letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:"sans-serif" }}>
          Terms of Service
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* Sidebar */}
        <div style={{ width:"252px", background:"white", borderRight:`1px solid ${B[100]}`, overflowY:"auto", flexShrink:0, padding:"18px 0" }}>
          <div style={{ fontSize:"0.6rem", letterSpacing:"2px", textTransform:"uppercase", color:B[400], padding:"0 18px 12px", fontFamily:"sans-serif", borderBottom:`1px solid ${B[50]}`, marginBottom:"6px" }}>
            Sections
          </div>
          {sections.map(s => {
            const on = active === s.id;
            return (
              <div key={s.id} onClick={() => setActive(s.id)} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 18px 9px 15px", cursor:"pointer", background: on ? B[50] : "transparent", color: on ? B[700] : "#4b5563", borderLeft:`3px solid ${on ? B[500] : "transparent"}`, transition:"all 0.17s", fontSize:"0.79rem", fontFamily:"sans-serif", fontWeight: on ? 600 : 400, borderRadius:"0 8px 8px 0", marginRight:"8px" }}>
                <span style={{ fontSize:"0.82rem", opacity: on ? 1 : 0.4, color: on ? B[500] : "inherit", width:"15px", textAlign:"center" }}>{s.icon}</span>
                <span style={{ flex:1, lineHeight:"1.35" }}>{s.title}</span>
              </div>
            );
          })}
        </div>

        {/* Main */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ flex:1, overflowY:"auto", padding:"36px 48px" }}>

            {/* Section heading */}
            <div style={{ display:"flex", alignItems:"flex-start", gap:"18px", marginBottom:"26px", paddingBottom:"20px", borderBottom:`2px solid ${B[100]}` }}>
              <div style={{ width:"50px", height:"50px", background:`linear-gradient(135deg,${B[600]},${B[800]})`, borderRadius:"13px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", color:"white", flexShrink:0, boxShadow:`0 4px 14px ${B[200]}` }}>
                {data.icon}
              </div>
              <div>
                <div style={{ fontSize:"1.5rem", fontWeight:700, color:B[900], letterSpacing:"-0.4px", lineHeight:1.2, marginBottom:"5px" }}>{data.title}</div>
                <div style={{ fontSize:"0.68rem", color:B[400], letterSpacing:"1px", textTransform:"uppercase", fontFamily:"sans-serif" }}>
                  Section {idx + 1} of {sections.length} · Lernevo Wellness · Effective Feb 24, 2026
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth:"680px", fontSize:"0.95rem" }}>{renderContent(data.content)}</div>

            {/* Prev / Next */}
            <div style={{ display:"flex", gap:"12px", marginTop:"36px", paddingTop:"22px", borderTop:`1px solid ${B[100]}` }}>
              {idx > 0 && (
                <button onClick={() => setActive(sections[idx - 1].id)} style={{ padding:"10px 22px", background:"white", border:`1.5px solid ${B[200]}`, borderRadius:"8px", cursor:"pointer", fontSize:"0.8rem", fontFamily:"sans-serif", color:B[600], fontWeight:500 }}>
                  ← Previous
                </button>
              )}
              {idx < sections.length - 1 && (
                <button onClick={() => setActive(sections[idx + 1].id)} style={{ padding:"10px 22px", background:`linear-gradient(135deg,${B[600]},${B[700]})`, border:"none", borderRadius:"8px", cursor:"pointer", fontSize:"0.8rem", fontFamily:"sans-serif", color:"white", fontWeight:600, boxShadow:`0 3px 12px ${B[200]}` }}>
                  Next Section →
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ background:"white", borderTop:`1px solid ${B[100]}`, padding:"13px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"0.72rem", color:B[400], fontFamily:"sans-serif" }}>
              <span>{idx + 1} / {sections.length}</span>
              <div style={{ width:"110px", height:"4px", background:B[100], borderRadius:"2px", overflow:"hidden" }}>
                <div style={{ height:"100%", background:`linear-gradient(90deg,${B[400]},${B[600]})`, width:`${((idx + 1) / sections.length) * 100}%`, transition:"width 0.4s ease", borderRadius:"2px" }} />
              </div>
              <span>sections read</span>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:"18px" }}>
              <div onClick={() => setAgreed(!agreed)} style={{ display:"flex", alignItems:"center", gap:"9px", cursor:"pointer" }}>
                <div style={{ width:"18px", height:"18px", borderRadius:"4px", border:`2px solid ${agreed ? B[500] : "#d1d5db"}`, background: agreed ? B[500] : "white", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", flexShrink:0 }}>
                  {agreed && <span style={{ color:"white", fontSize:"11px", fontWeight:"bold", lineHeight:1 }}>✓</span>}
                </div>
                <span style={{ fontSize:"0.79rem", color:"#4b5563", fontFamily:"sans-serif" }}>
                  I have read and agree to all Terms of Service
                </span>
              </div>

              <button
                disabled={!agreed}
                onClick={() => agreed && setModal(true)}
                style={{ padding:"11px 26px", background: agreed ? `linear-gradient(135deg,${B[500]},${B[700]})` : "#e5e7eb", color: agreed ? "white" : "#9ca3af", border:"none", borderRadius:"9px", fontSize:"0.82rem", fontWeight:700, cursor: agreed ? "pointer" : "not-allowed", fontFamily:"sans-serif", transition:"all 0.3s", boxShadow: agreed ? `0 4px 14px ${B[300]}` : "none" }}
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}