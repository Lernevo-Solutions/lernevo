import React, { useState } from 'react';
import './faq.css';
import Navbar from './Navbar';
import { 
  FaChevronDown, FaChevronUp, FaSearch, FaRocket, 
  FaMagic, FaUserFriends, FaLock, FaRobot, FaDumbbell, FaHeartbeat,
  FaTwitter, FaInstagram, FaLinkedin, FaYoutube // Added these for the footer
} from 'react-icons/fa';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Getting Started');

const categories = [
    { name: "Getting Started", icon: <FaRocket />, color: "#6366f1" },
    { name: "Your Custom Plan", icon: <FaMagic />, color: "#ec4899" },
    { name: "The AI Experience", icon: <FaRobot />, color: "#10b981" },
    { name: "Support & Coaching", icon: <FaUserFriends />, color: "#f59e0b" },
    { name: "Lifestyle & Habits", icon: <FaHeartbeat />, color: "#ef4444" }, // 👈 "Holistic Wellbeing" mela "Lifestyle & Habits" nu mathi iruken
    { name: "Privacy & Security", icon: <FaLock />, color: "#3b82f6" }
  ];

  const getHighlightedText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? 
          <mark key={i} className="highlight-mark">{part}</mark> : part
        )}
      </span>
    );
  };

  const faqItems = [
    // Getting Started
    { category: "Getting Started", question: "How do I begin my wellness journey?", answer: "Simply complete your digital intake form. Tell us about your physical profile, lifestyle, and specific goals. Our Gemini AI will then combine your preferences with our expert database to build your custom plan." },
    { category: "Getting Started", question: "What is the 'mandatory information' for?", answer: "We ask for your health details and goals to ensure your workout and meal plans are safe, effective, and tailored exactly to your body type and fitness level." },
    { category: "Getting Started", question: "Can I use Lernevo on multiple devices?", answer: "Yes, you can access your account from any smartphone, tablet, or computer. Your progress stays synced in real-time across all platforms." },
    { category: "Getting Started", question: "How long does it take to see my first plan?", answer: "Immediately! Once you complete the intake process, our AI engine generates your personalized roadmap in seconds." },

    // Your Custom Plan
    { category: "Your Custom Plan", question: "How personalized is my plan?", answer: "Highly personalized. Unlike generic apps, we use AI to factor in your specific food dislikes, preferred exercise methods, and the exact number of days you want to spend achieving your goal." },
    { category: "Your Custom Plan", question: "What's included in my 'Package'?", answer: "You get a 4-in-1 holistic roadmap: a structured Workout Plan, a Meal Plan (with daily variety), Mental Health exercises, and Learning Modules to help you understand your body better." },
    { category: "Your Custom Plan", question: "Can I adjust my goals later?", answer: "Absolutely. You can update your target weight, fitness level, or dietary preferences at any time, and the AI will recalibrate your entire plan accordingly." },
    { category: "Your Custom Plan", question: "What if I have an injury or physical limitation?", answer: "You can specify limitations in your profile. The AI will exclude exercises that might aggravate your condition and suggest safer alternatives." },

    // The AI Experience
    { category: "The AI Experience", question: "Why do I have to check in every day?", answer: "Your daily input tells the AI how you're doing. If you miss a task, don't worry—the AI calculates a 'Compensation Plan' to help you catch up without feeling overwhelmed." },
    { category: "The AI Experience", question: "How does the AI handle missed tasks?", answer: "If you miss a workout or a meal, the AI adjusts your next few days. It might suggest a shorter, more intense routine or a lighter meal to keep you aligned with your long-term goal." },
    { category: "The AI Experience", question: "Does the AI learn from my feedback?", answer: "Yes! If you find a workout too easy or a meal not tasty, tell the AI. It learns your style and improves its suggestions over time." },
    { category: "The AI Experience", question: "Is the AI guidance available 24/7?", answer: "Yes, the AI engine is always active. Whether it's 2 AM or 2 PM, you can get updates, feedback, and guidance whenever you need it." },

    // Support & Coaching
    { category: "Support & Coaching", question: "Who are the Trainers?", answer: "Trainers are wellness experts assigned by your organization. They can see your progress, send you motivational messages, and help you fine-tune your AI-generated plan." },
    { category: "Support & Coaching", question: "Can I talk to my Admin or Trainer?", answer: "Yes! You have access to a Personalised Message Centre where you can communicate directly with your assigned Trainer or Admin for human guidance and support." },
    { category: "Support & Coaching", question: "Are my conversations with trainers private?", answer: "Yes, your 1-on-1 chats are confidential and encrypted, ensuring a safe space for you to discuss your health and fitness journey." },
    { category: "Support & Coaching", question: "Can trainers change my AI plan?", answer: "Yes, trainers have the ability to manually adjust your routine if they feel a specific modification will help you reach your goals more effectively." },

    // Lifestyle & Habits (Updated from Holistic Wellbeing)
    { category: "Lifestyle & Habits", question: "Is this just for weight loss?", answer: "No. Lernevo is for overall lifestyle improvement. We focus equally on mental health, sleep quality, and daily habit formation to ensure you feel better every day." },
    { category: "Lifestyle & Habits", question: "How is my daily progress tracked?", answer: "We track your task completion, activity levels, and habit milestones. You can see your 'Whole Week Activity' at a glance to stay consistent with your routine." },
    { category: "Lifestyle & Habits", question: "Does Lernevo help with sleep and recovery?", answer: "Yes, we provide sleep hygiene tips, guided wind-down routines, and recovery techniques to help you wake up feeling refreshed." },
    { category: "Lifestyle & Habits", question: "Are there modules for focus and productivity?", answer: "Absolutely. We include mindfulness and mental clarity exercises designed to help you maintain focus and manage stress throughout your workday." },

    // Privacy & Security
    { category: "Privacy & Security", question: "Who can see my personal data?", answer: "Your data is kept strictly within your organization's portal. Only your designated Admin and Trainer can view your progress to support you. We never share your data with third parties." },
    { category: "Privacy & Security", question: "Is my meal preference respected?", answer: "Absolutely. When you list your preferred foods or dietary restrictions, the AI filters our database to ensure every suggested meal is something you’ll actually enjoy eating." },
    { category: "Privacy & Security", question: "How is my data protected?", answer: "We use industry-standard encryption and follow strict data protection protocols to ensure your personal and health information is always secure." },
    { category: "Privacy & Security", question: "Can I delete my account data?", answer: "Yes, you have full control over your information. You can request to deactivate your account and remove your personalized history at any time." }
  ];
  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="faq-page-wrapper">
      <Navbar />
      
      {/* Wrapper for main content to push footer down */}
      <div className="faq-content-wrapper">
        <div className="faq-main-container">
          {/* Left Sidebar */}
          <aside className="faq-sidebar-left">
            <div className="sidebar-sticky-box">
              <h3 className="sidebar-label">Categories</h3>
              <div className="categories-list">
                {categories.map((cat, idx) => (
                  <button 
                    key={idx} 
                    className={`cat-btn-modern ${activeCategory === cat.name ? 'active' : ''}`}
                    onClick={() => {setActiveCategory(cat.name); setOpenIndex(null);}}
                    style={{ "--accent": cat.color }}
                  >
                    <div className="icon-box">{cat.icon}</div>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Content */}
          <main className="faq-content-right">
            <div className="content-search-area">
              <div className="modern-search-box">
                <FaSearch className="s-icon" />
                <input 
                  type="text" 
                  placeholder={`Search in ${activeCategory}...`} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="faq-results-header">
               <h2>{activeCategory}</h2>
            </div>

            <div className="questions-grid">
              {filteredFAQs.map((item, index) => (
                <div 
                  key={index} 
                  className={`premium-faq-card ${openIndex === index ? 'active' : ''}`}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <div className="card-q-header">
                    <h3>{getHighlightedText(item.question, searchTerm)}</h3>
                    <div className="arrow-circle">
                      {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </div>
                  <div className={`card-a-body ${openIndex === index ? 'show' : ''}`}>
                     <p>{getHighlightedText(item.answer, searchTerm)}</p>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* FOOTER SECTION */}
      {/* ========== FAQ PAGE FOOTER (UNIQUE FIX) ========== */}
      <footer className="faq-footer-section">
        <div className="faq-footer-container">
          <div className="faq-footer-top">

            {/* BRAND */}
            <div className="faq-footer-brand">

              <p className="faq-footer-desc">
                Your AI-powered wellness companion helping you build
                healthier habits across body, mind, and lifestyle.
              </p>

              <div className="faq-footer-social">
                <a className="faq-social-twitter" href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                <a className="faq-social-instagram" href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                <a className="faq-social-linkedin" href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                <a className="faq-social-youtube" href="https://youtube.com" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
              </div>
            </div>

            {/* PRODUCT */}
            <div className="faq-footer-col">
              <h4>Product</h4>
              <a>AI Coaching</a>
              <a>Fitness</a>
              <a>Mental Wellness</a>
              <a>Nutrition</a>
            </div>

            {/* COMPANY */}
            <div className="faq-footer-col">
              <h4>Company</h4>
              <a>About</a>
              <a>Careers</a>
              <a>Blog</a>
              <a>Contact</a>
            </div>

            {/* SUPPORT */}
             <div className="link-col">
                <h4>Support</h4>
                <a>Help Center</a>
                <a>Privacy Policy</a>
                <a>Terms of Service</a>
                <a>Trust & Safety</a>
              </div>

            {/* BUSINESS */}
            <div className="link-col">
                <h4>Business</h4>
                <a>Business Dashboard</a>
                <a>Partnerships</a>
                <a>Book a demo</a>
                <a>Enquire</a>

              </div>

          </div>

          <div className="faq-footer-bottom">
            <p>© {new Date().getFullYear()} Lernevo Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FAQ;