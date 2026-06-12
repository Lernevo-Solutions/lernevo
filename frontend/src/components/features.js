import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './features.css';

const Features = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const chipsRef = useRef([]);
  const cursorGlowRef = useRef(null);

  // Mouse position for parallax and spotlight
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  

  // Ripples + confetti
  const [ripples, setRipples] = useState([]);
  const [confetti, setConfetti] = useState([]);

  const handleProtectedNavigation = (path, featureName) => {
    const token = localStorage.getItem('token');
    const isAuthenticated =
      token && token !== 'undefined' && token !== 'null' && token.trim() !== '';

    if (!isAuthenticated) {
      window.alert(`Please signup or login to access ${featureName}.`);
      navigate('/get-started?mode=login');
      return;
    }

    navigate(path);
  };

  // Intersection Observer for fade-up
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px' }
    );
    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Update mouse position + CSS variables for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      setMousePos({ x: clientX, y: clientY });
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.transform = `translate(${clientX}px, ${clientY}px)`;
      }
      if (sectionRef.current) {
        const { left, top, width, height } = sectionRef.current.getBoundingClientRect();
        const x = (clientX - left) / width - 0.5;
        const y = (clientY - top) / height - 0.5;
        sectionRef.current.style.setProperty('--mouse-x', x);
        sectionRef.current.style.setProperty('--mouse-y', y);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 3D Tilt + magnetic effect on cards
  useEffect(() => {
    const handleMouseMoveCard = (e, card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;
      const moveX = ((x - centerX) / centerX) * 5;
      const moveY = ((y - centerY) / centerY) * 5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${moveX}px, ${moveY}px) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeaveCard = (card) => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate(0,0) scale3d(1,1,1)';
    };

    cardsRef.current.forEach((card) => {
      if (!card) return;
      card.addEventListener('mousemove', (e) => handleMouseMoveCard(e, card));
      card.addEventListener('mouseleave', () => handleMouseLeaveCard(card));
    });

    return () => {
      cardsRef.current.forEach((card) => {
        if (!card) return;
        card.removeEventListener('mousemove', handleMouseMoveCard);
        card.removeEventListener('mouseleave', handleMouseLeaveCard);
      });
    };
  }, []);

  // Magnetic effect on chips
  useEffect(() => {
    const handleMouseMoveChip = (e) => {
      chipsRef.current.forEach((chip) => {
        if (!chip) return;
        const rect = chip.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;
        const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
        const maxDistance = 200;
        if (distance < maxDistance) {
          const strength = (1 - distance / maxDistance) * 15;
          const moveX = (distanceX / distance) * strength;
          const moveY = (distanceY / distance) * strength;
          chip.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
        } else {
          chip.style.transform = '';
        }
      });
    };
    window.addEventListener('mousemove', handleMouseMoveChip);
    return () => window.removeEventListener('mousemove', handleMouseMoveChip);
  }, []);

  // Ripple + confetti on card click
  const handleCardClick = (e, cardIndex) => {
    const card = cardsRef.current[cardIndex];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Ripple with random neon color
    const colors = ['#ff0080', '#00ffff', '#ffaa00', '#aa00ff', '#00ffaa'];
    const rippleId = Date.now() + Math.random();
    setRipples((prev) => [
      ...prev,
      { id: rippleId, x, y, cardIndex, color: colors[Math.floor(Math.random() * colors.length)] },
    ]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 800);

    // Confetti
    for (let i = 0; i < 20; i++) {
      const confettiId = Date.now() + i + Math.random();
      const angle = Math.random() * Math.PI * 2;
      const velocity = 5 + Math.random() * 10;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      setConfetti((prev) => [
        ...prev,
        {
          id: confettiId,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          vx,
          vy,
          life: 1,
          color: `hsl(${Math.random() * 360}, 100%, 60%)`,
        },
      ]);
    }

    // Animation loop
    const interval = setInterval(() => {
      setConfetti((prev) =>
        prev
          .map((c) => ({
            ...c,
            x: c.x + c.vx,
            y: c.y + c.vy,
            vy: c.vy + 0.1,
            life: c.life - 0.01,
          }))
          .filter((c) => c.life > 0)
      );
    }, 30);
    setTimeout(() => clearInterval(interval), 1500);

    if (cardIndex === 0) {
      setTimeout(() => navigate('/resume-builder'), 180);
    }

    if (cardIndex === 1) {
      setTimeout(
        () => handleProtectedNavigation('/skill-gap-analyzer', 'Skill Gap Analyzer'),
        180
      );
    }
  };

  // Typewriter effect for subtitle
  const subtitleText =
    'From fitness to career growth — Lernevo is built to support every dimension of your life with AI that truly works for you.';
  const [displayedSubtitle, setDisplayedSubtitle] = useState('');
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  useEffect(() => {
    if (subtitleIndex < subtitleText.length) {
      const timeout = setTimeout(() => {
        setDisplayedSubtitle((prev) => prev + subtitleText[subtitleIndex]);
        setSubtitleIndex((prev) => prev + 1);
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [subtitleIndex, subtitleText]);

  // Split title into letters
  const titleText = 'Everything You Need, All in One Place';
  const titleWords = titleText.split(' ');

  return (
    <section className="features-section" ref={sectionRef}>
      {/* Cursor glow */}
      <div className="cursor-glow" ref={cursorGlowRef}></div>

      {/* Background geometric shapes (no floating particles) */}
      <div className="bg-shape shape1"></div>
      <div className="bg-shape shape2"></div>
      <div className="bg-shape shape3"></div>
      <div className="bg-grid"></div>

      {/* Confetti */}
      {confetti.map((c) => (
        <span
          key={c.id}
          className="confetti"
          style={{
            left: c.x,
            top: c.y,
            opacity: c.life,
            backgroundColor: c.color,
          }}
        />
      ))}

      {/* Header */}
      <div className="features-header">
        <span className="section-label fade-up">
          <span className="label-icon">⚡</span> Why Lernevo
        </span>
        <h1 className="section-title fade-up">
          {titleWords.map((word, wordIndex) => (
            <span key={wordIndex} className="title-word">
              {word.split('').map((char, charIndex) => (
                <span
                  key={charIndex}
                  className="title-char"
                  style={{ animationDelay: `${wordIndex * 0.15 + charIndex * 0.02}s` }}
                >
                  {char}
                </span>
              ))}
              {wordIndex < titleWords.length - 1 && ' '}
            </span>
          ))}
        </h1>
        <p className="section-sub fade-up">
          {displayedSubtitle}
          <span className="cursor-blink">|</span>
        </p>
      </div>

      {/* Feature Showcase */}
      <div className="feature-showcase">
        {/* Main Info Card */}
        <div
          className="card-main fade-up"
          ref={(el) => (cardsRef.current[0] = el)}
          onClick={(e) => handleCardClick(e, 0)}
        >
          {ripples
            .filter((r) => r.cardIndex === 0)
            .map((ripple) => (
              <span
                key={ripple.id}
                className="ripple"
                style={{ left: ripple.x, top: ripple.y, backgroundColor: ripple.color }}
              />
            ))}
          <div className="card-content">
            <div className="badge-coming-soon">
              <span className="dot-live"></span>
              <span>Feature Spotlight</span>
              <span className="badge-icon">→</span>
            </div>
            <h2>
              Resume Builder <br />
              Feature Page
            </h2>
            <p>
              See what the builder does, how it works, and why it helps before you enter the
              actual resume editor.
            </p>
            <ul className="feature-list">
              {[
                'Clear walkthrough before the editor opens',
                'ATS-optimized formatting and keyword support',
                'Template previews and guided onboarding',
                'Start building only when you are ready',
                'Designed to reduce setup friction',
              ].map((text, i) => (
                <li key={i}>
                  <div className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          {/* Shine overlay */}
          <div className="card-shine"></div>
        </div>

        {/* Preview Card */}
        <div
          className="card-preview fade-up"
          ref={(el) => (cardsRef.current[1] = el)}
          onClick={(e) => handleCardClick(e, 1)}
        >
          {ripples
            .filter((r) => r.cardIndex === 1)
            .map((ripple) => (
              <span
                key={ripple.id}
                className="ripple"
                style={{ left: ripple.x, top: ripple.y, backgroundColor: ripple.color }}
              />
            ))}
          <span className="preview-label">✨ Preview</span>

          {/* Blurred Resume Mockup */}
          <div className="resume-mockup">
            <div className="resume-header">
              <div className="resume-avatar"></div>
              <div className="resume-lines">
                <div className="line line-dark"></div>
                <div className="line line-light"></div>
              </div>
            </div>
            <div className="resume-section"></div>
            <div className="resume-line w-full"></div>
            <div className="resume-line w-75"></div>
            <div className="resume-line w-50"></div>
            <div className="resume-section"></div>
            <div className="resume-line w-full"></div>
            <div className="resume-line w-75"></div>
            <div className="skill-chips">
              <span className="skill-chip">Leadership</span>
              <span className="skill-chip">AI Tools</span>
              <span className="skill-chip">Design</span>
              <span className="skill-chip">Analytics</span>
            </div>

            {/* Overlay */}
            <div className="mockup-overlay">
              <div className="lock-icon">🔒</div>
              <span className="overlay-text">Unlocking Soon</span>
            </div>
          </div>

          {/* AI Feature Chips */}
          <div className="ai-chips">
            {[
              { icon: '🤖', text: 'AI Writing' },
              { icon: '📄', text: 'Templates' },
              { icon: '🔍', text: 'Skill Gap' },
              { icon: '⚡', text: 'Instant Export' },
            ].map((chip, i) => (
              <div
                key={i}
                className="ai-chip"
                ref={(el) => (chipsRef.current[i] = el)}
              >
                <span>{chip.icon}</span> {chip.text}
              </div>
            ))}
          </div>

          {/* "Be the First" Banner */}
          <div className="be-first-banner">
            <div className="banner-left">
              <div className="banner-icon">🚀</div>
              <div>
                <div className="banner-text-top">Launching Soon</div>
                <div className="banner-text-main">Be the First to Use It</div>
              </div>
            </div>
            <div className="ticker-wrap">
              <div className="ticker-track">
                <span>✦ Coming Soon</span>
                <span>✦ Stay Tuned</span>
                <span>✦ Almost Ready</span>
                <span>✦ Coming Soon</span>
                <span>✦ Stay Tuned</span>
                <span>✦ Almost Ready</span>
              </div>
            </div>
            <div className="sparkles"></div>
          </div>
          <div className="card-shine"></div>
        </div>
      </div>
    </section>
  );
};

export default Features;
