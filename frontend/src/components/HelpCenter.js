// HelpCenter.jsx
import React, { useState, useEffect } from 'react';
import './HelpCenter.css';

const HelpCenter = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;

  const tips = [
    {
      icon: '💡',
      title: 'Did you know?',
      description: 'You can connect unlimited wearable devices to sync all your health data in one place.'
    },
    {
      icon: '🎯',
      title: 'Pro Tip',
      description: 'Set weekly goals and our AI will automatically adjust your daily plans to keep you on track.'
    },
    {
      icon: '🔐',
      title: 'Privacy First',
      description: 'All your messages with trainers are end-to-end encrypted for maximum security.'
    },
    {
      icon: '⚡',
      title: 'Quick Start',
      description: 'New users typically complete their setup in under 5 minutes and get their first AI recommendation instantly.'
    },
    {
      icon: '🤝',
      title: 'Human Support',
      description: 'Every user gets a certified trainer assigned to guide their wellness journey personally.'
    }
  ];

  const quickLinks = [
    { icon: '🚀', title: 'Getting Started', desc: 'New to Lernevo? Learn how to set up your account and start your wellness journey.' },
    { icon: '💡', title: 'Feature Guides', desc: 'Discover how to use AI recommendations, track progress, and connect with trainers.' },
    { icon: '🔐', title: 'Account & Privacy', desc: 'Manage your profile, security settings, and understand how we protect your data.' },
    { icon: '⚙️', title: 'Troubleshooting', desc: 'Having issues? Find solutions to common problems and technical questions.' }
  ];

  const topics = [
    { q: 'How do I connect my fitness tracker?', a: 'Learn how to sync wearables and import your health data seamlessly.' },
    { q: 'How does AI personalization work?', a: 'Understand how Lernevo\'s AI learns from your habits to provide custom recommendations.' },
    { q: 'Can I message my trainer directly?', a: 'Yes! Use the secure messaging center to communicate with your assigned trainer.' },
    { q: 'How do I join a workout group?', a: 'Explore community groups created by trainers and admins to stay motivated.' },
    { q: 'Is my health data secure?', a: 'We use enterprise-grade encryption to protect all your personal and health information.' },
    { q: 'How do I track my nutrition?', a: 'Log meals, scan barcodes, and get AI-powered nutrition insights on your dashboard.' }
  ];

  const tutorials = [
    {
      num: 1,
      title: 'Setting Up Your Profile',
      desc: 'Get started with Lernevo by creating your personalized wellness profile.',
      steps: [
        'Sign up and verify your email address',
        'Complete your health & fitness goals',
        'Connect your wearable devices (optional)',
        'Meet your assigned certified trainer'
      ]
    },
    {
      num: 2,
      title: 'Using AI Recommendations',
      desc: 'Learn how to get personalized suggestions powered by our AI engine.',
      steps: [
        'Navigate to your Dashboard',
        'Review daily AI-generated workout & nutrition plans',
        'Track your progress and provide feedback',
        'Watch AI adapt to your habits in real-time'
      ]
    },
    {
      num: 3,
      title: 'Connecting Fitness Trackers',
      desc: 'Sync your wearables to get a complete view of your health data.',
      steps: [
        'Go to Settings → Connected Devices',
        'Select your device (Apple Watch, Fitbit, etc.)',
        'Authorize Lernevo to sync data',
        'View unified health metrics on your dashboard'
      ]
    },
    {
      num: 4,
      title: 'Messaging Your Trainer',
      desc: 'Stay connected with your trainer through secure, private messaging.',
      steps: [
        'Click on the Message Center icon',
        'Select your assigned trainer',
        'Ask questions or share progress updates',
        'Get real-time responses and personalized advice'
      ]
    },
    {
      num: 5,
      title: 'Joining Workout Groups',
      desc: 'Connect with a community and stay motivated together.',
      steps: [
        'Browse available workout groups',
        'Join groups that match your fitness level',
        'Participate in group challenges',
        'Track your group\'s collective progress'
      ]
    },
    {
      num: 6,
      title: 'Tracking Your Progress',
      desc: 'Monitor your wellness journey with detailed analytics and insights.',
      steps: [
        'Open your Analytics dashboard',
        'View nutrition, fitness, sleep & mood trends',
        'Set new goals based on your progress',
        'Share achievements with your trainer'
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="hero">
        <h1>How can we <span>help you?</span></h1>
        <p>Explore guides, tutorials, and resources to make the most of Lernevo.</p>
        
        {/* Tips Carousel */}
        <div className="tips-carousel">
          <div className="carousel-inner">
            {tips.map((tip, idx) => (
              <div key={idx} className={`tip-item ${currentSlide === idx ? 'active' : ''}`}>
                <span className="tip-icon">{tip.icon}</span>
                <div className="tip-title">{tip.title}</div>
                <div className="tip-description">{tip.description}</div>
              </div>
            ))}
          </div>

          <div className="carousel-dots">
            {tips.map((_, idx) => (
              <span
                key={idx}
                className={`dot ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => goToSlide(idx)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container">
        {/* Quick Links */}
        <div className="quick-links">
          {quickLinks.map((link, idx) => (
            <div key={idx} className="link-card">
              <div className="link-icon">{link.icon}</div>
              <h3>{link.title}</h3>
              <p>{link.desc}</p>
            </div>
          ))}
        </div>

        {/* Popular Topics */}
        <h2 className="section-title">Popular Topics</h2>
        <div className="topics-grid">
          {topics.map((topic, idx) => (
            <div key={idx} className="topic-item">
              <h4>{topic.q}</h4>
              <p>{topic.a}</p>
            </div>
          ))}
        </div>

        {/* Step-by-Step Tutorials */}
        <h2 className="section-title">Step-by-Step Tutorials</h2>
        <div className="tutorials-grid">
          {tutorials.map((tutorial) => (
            <div key={tutorial.num} className="tutorial-card">
              <div className="tutorial-number">{tutorial.num}</div>
              <h3>{tutorial.title}</h3>
              <p>{tutorial.desc}</p>
              <div className="tutorial-steps">
                {tutorial.steps.map((step, idx) => (
                  <div key={idx} className="step-item">
                    <div className="step-bullet"></div>
                    <div className="step-text">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Support Banner */}
        <div className="support-banner">
          <h2>Still need help?</h2>
          <p>Our support team is here for you. Get in touch and we'll respond as soon as possible.</p>
          <a href="#" className="support-btn">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;