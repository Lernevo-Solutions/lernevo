import React, { useState, useEffect, useRef } from 'react';
import './faq.css';
import Navbar from './Navbar';
import { 
  FaChevronDown, FaChevronUp, FaSearch, FaHeadset, 
  FaCog, FaShieldAlt, FaUserFriends, FaRocket, 
  FaMagic, FaMobileAlt, FaLock, FaCloud, 
  FaBell, FaChartPie, FaQuestionCircle, FaTools,
  FaBookOpen, FaVideo, FaComments, FaFileAlt
} from 'react-icons/fa';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [typingText, setTypingText] = useState('');

  const fullText = "How can we help you?";

  // Typing effect
  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypingText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);
    return () => clearInterval(typingInterval);
  }, []);

  // UPDATED CATEGORIES - Removed pricing and rating
  const categories = [
    { 
      name: "All", 
      icon: <FaRocket />, 
      count: 8,
      description: "Browse all questions"
    },
    { 
      name: "Getting Started", 
      icon: <FaQuestionCircle />, 
      count: 3,
      description: "Beginner guides and setup"
    },
    { 
      name: "Features", 
      icon: <FaMagic />, 
      count: 2,
      description: "Tools and capabilities"
    },
    { 
      name: "Account", 
      icon: <FaUserFriends />, 
      count: 1,
      description: "Profile and settings"
    },
    { 
      name: "Security", 
      icon: <FaLock />, 
      count: 1,
      description: "Privacy and protection"
    },
    { 
      name: "Support", 
      icon: <FaHeadset />, 
      count: 1,
      description: "Help and assistance"
    }
  ];

  // UPDATED FAQ ITEMS - No pricing or rating
  const faqItems = [
    {
      id: 1,
      question: "How do I get started with the platform?",
      answer: "Getting started is easy! Simply create an account, complete your profile setup, and follow our onboarding tutorial. You'll be guided through each step with clear instructions.",
      category: "Getting Started",
      tags: ["beginner", "setup", "onboarding"]
    },
    {
      id: 2,
      question: "What are the main features available?",
      answer: "Our platform offers a comprehensive suite of tools including project management, collaboration features, analytics dashboards, and integration capabilities. Explore our features section for detailed information.",
      category: "Features",
      tags: ["tools", "capabilities", "functions"]
    },
    {
      id: 3,
      question: "How do I update my account settings?",
      answer: "You can update your account settings by navigating to your profile page and selecting 'Account Settings'. From there, you can modify your preferences, notification settings, and personal information.",
      category: "Account",
      tags: ["profile", "settings", "preferences"]
    },
    {
      id: 4,
      question: "Is my data secure on the platform?",
      answer: "Absolutely. We use enterprise-grade encryption, regular security audits, and comply with data protection regulations. Your data's security is our top priority.",
      category: "Security",
      tags: ["privacy", "protection", "encryption"]
    },
    {
      id: 5,
      question: "How do I invite team members to collaborate?",
      answer: "From your dashboard, click 'Team Management' and then 'Invite Members'. Enter their email addresses and assign appropriate roles. They'll receive an invitation to join.",
      category: "Getting Started",
      tags: ["team", "collaboration", "invite"]
    },
    {
      id: 6,
      question: "Can I customize the platform to my needs?",
      answer: "Yes! Our platform offers extensive customization options including theme selection, layout adjustments, and workflow configurations. Visit the customization settings to explore options.",
      category: "Features",
      tags: ["customization", "personalization", "themes"]
    },
    {
      id: 7,
      question: "What support options are available?",
      answer: "We offer multiple support channels: 24/7 live chat, email support, detailed documentation, and video tutorials. Our support team is always ready to assist you.",
      category: "Support",
      tags: ["help", "assistance", "contact"]
    },
    {
      id: 8,
      question: "How do I export my data?",
      answer: "Navigate to Settings → Data Management → Export. You can export your data in various formats including CSV, PDF, and JSON. The process typically takes just a few minutes.",
      category: "Account",
      tags: ["data", "export", "backup"]
    }
  ];

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <div className="faq-page">
      {/* Hero Section */}
<div className="faq-hero light-hero">
  <div className="hero-content">

    <div className="hero-badge light-badge">
      <FaQuestionCircle />
      Help Center
    </div>

    <h1 className="hero-title light-title">
      We’re here to <span>guide you</span>
    </h1>

    <p className="hero-description light-desc">
      Simple answers, clear guidance, and everything you need to
      understand our platform — all in one place.
    </p>

    {/* Action Cards */}
    <div className="hero-actions">

      <div className="action-card light-card">
        <FaRocket className="action-icon blue-icon" />
        <h4>Getting Started</h4>
        <p>Learn how to begin and set up your account easily.</p>
      </div>

      <div className="action-card light-card">
        <FaTools className="action-icon blue-icon" />
        <h4>Using Features</h4>
        <p>Understand tools and how to use them effectively.</p>
      </div>

    </div>

  </div>
</div>


        {/* Main Content */}
        <div className="faq-container">
          <div className="faq-layout">
            {/* Categories Sidebar */}
            <div className="categories-sidebar">
              <h3 className="sidebar-title">
                <FaBookOpen className="title-icon" />
                Categories
              </h3>
              
              <div className="categories-list">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    className={`category-btn ${activeCategory === cat.name ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.name)}
                  >
                    <span className="category-icon">{cat.icon}</span>
                    <div className="category-info">
                      <span className="category-name">{cat.name}</span>
                      <span className="category-desc">{cat.description}</span>
                    </div>
                    <span className="category-count">{cat.count}</span>
                  </button>
                ))}
              </div>

              {/* Help Resources */}
              <div className="help-resources">
                <h4>More Help</h4>
                <div className="resource-links">
                  <a href="#" className="resource-link">
                    <FaVideo /> Video Tutorials
                  </a>
                  <a href="#" className="resource-link">
                    <FaFileAlt /> Documentation
                  </a>
                  <a href="#" className="resource-link">
                    <FaComments /> Community Forum
                  </a>
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="faq-content">
              <div className="faq-header">
                <h2>Frequently Asked Questions</h2>
                <p className="results-count">
                  {filteredFAQs.length} questions found
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
              </div>

              {/* FAQ Items */}
              <div className="faq-items">
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((item, index) => (
                    <div key={item.id} className="faq-card">
                      <div className="faq-question" onClick={() => toggleFAQ(index)}>
                        <div className="question-header">
                          <span className="question-category">{item.category}</span>
                          <div className="tags">
                            {item.tags.map((tag, i) => (
                              <span key={i} className="tag">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="question-content">
                          <h3>{item.question}</h3>
                          <div className="toggle-icon">
                            {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                          </div>
                        </div>
                      </div>

                      {openIndex === index && (
                        <div className="faq-answer">
                          <p>{item.answer}</p>
                          <div className="answer-actions">
                            <span className="helpful-text">Was this answer helpful?</span>
                            <div className="action-buttons">
                              <button className="action-btn">
                                <FaComments /> Ask Follow-up
                              </button>
                              <button className="action-btn">
                                <FaBookOpen /> Read More
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <h3>No questions found</h3>
                    <p>Try searching with different keywords or browse the categories.</p>
                    <button 
                      className="clear-search-btn"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;