import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <section className="hero-section" id="home">
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="highlight">Light Blue</span> Paradise
          </h1>
          <p className="hero-subtitle">
            Create stunning landing pages with beautiful light blue themes that 
            captivate your audience and boost conversions.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary hero-btn">
              Start Free Trial
            </button>
            <button className="btn-secondary hero-btn">
              <span className="play-icon">▶</span> Watch Demo
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <h3>10K+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-item">
              <h3>99%</h3>
              <p>Satisfaction Rate</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>Support Available</p>
            </div>
          </div>
        </div>
        
        <div className="hero-image float-animation">
          <div className="image-placeholder">
            <div className="mockup-screen">
              <div className="screen-header">
                <div className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="screen-content">
                <div className="content-line"></div>
                <div className="content-line short"></div>
                <div className="content-line"></div>
                <div className="content-line short"></div>
                <div className="content-line"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="floating-circle circle-1"></div>
      <div className="floating-circle circle-2"></div>
      <div className="floating-circle circle-3"></div>
    </section>
  );
}

const Hero = () => {
  const [heroImage, setHeroImage] = useState(null);

  useEffect(() => {
    const random = images[Math.floor(Math.random() * images.length)];
    setHeroImage(random);
  }, []);

  return (
    <section className="hero-section" id="home">
      <div className="hero-container">

        <div className="hero-left">
          ...
        </div>

        <div className="hero-right">
          {heroImage && (
            <img
              src={heroImage}
              alt="Wellness Lifestyle"
              className="hero-image"
            />
          )}
        </div>

      </div>
    </section>
  );
};
