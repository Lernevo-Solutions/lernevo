import React from "react";
import "./HelpCenter.css";

const HelpCenter = () => {
  const faqs = [
    {
      id: 1,
      question: "How does Lernevo personalize my wellness journey?",
      answer:
        "Our AI continuously learns from your inputs, wearables, and behavioral patterns to provide real-time recommendations for fitness, nutrition, and mental health — all in one unified dashboard."
    },
    {
      id: 2,
      question: "Can I talk directly to a certified trainer?",
      answer:
        "Yes! You have a private, secure message center to chat with your assigned trainer anytime."
    },
    {
      id: 3,
      question: "What devices does Lernevo integrate with?",
      answer:
        "Lernevo connects with smartwatches, sleep trackers, and other wearables to unify your health data."
    },
    {
      id: 4,
      question: "Is my health data private and secure?",
      answer:
        "Absolutely. Role-based access controls ensure that only you and your trainer can access your data."
    },
    {
      id: 5,
      question: "What makes Lernevo different?",
      answer:
        "It’s your mission control for body, mind, and performance — all in one AI-powered platform."
    }
  ];

  const supportCategories = [
    {
      title: "Account & Billing",
      description: "Manage subscription and account settings.",
      icon: "💰"
    },
    {
      title: "Trainer Support",
      description: "Messaging, scheduling and trainer help.",
      icon: "👤"
    },
    {
      title: "Device & Data",
      description: "Sync wearables and health metrics.",
      icon: "📲"
    },
    {
      title: "AI Recommendations",
      description: "Understand how AI personalizes plans.",
      icon: "🤖"
    }
  ];

  return (
    <div className="help-container">
      <div className="help-header">
        <h1>How can we help you?</h1>
        <p>
          Your well-being is our mission. Explore support topics or get help instantly.
        </p>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search for articles or topics..." />
        <span>🔍</span>
      </div>

      <div className="support-grid">
        {supportCategories.map((cat, index) => (
          <div key={index} className="support-card">
            <div className="icon">{cat.icon}</div>
            <h3>{cat.title}</h3>
            <p>{cat.description}</p>
          </div>
        ))}
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          {faqs.map((faq) => (
            <div key={faq.id} className="faq-card">
              <h4>{faq.question}</h4>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="help-contact">
        <div className="contact-left">
          <span>💬</span>
          <div>
            <h4>Still have questions?</h4>
            <p>Chat with your trainer or support team directly.</p>
          </div>
        </div>
        <div className="contact-buttons">
          <button className="secondary-btn">Message Trainer</button>
          <button className="primary-btn">Contact Support</button>
        </div>
      </div>

      <p className="help-footer">
        Lernevo — your AI companion for holistic health © 2025
      </p>
    </div>
  );
};

export default HelpCenter;