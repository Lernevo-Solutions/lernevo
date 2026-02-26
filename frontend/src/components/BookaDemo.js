import React from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  MessageSquare,
  ArrowRight,
  Target,
  Heart,
  Users,
} from "lucide-react";
import "./BookaDemo.css";

const BookaDemo = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Demo request submitted! (Demo simulation)");
  };

  return (
    <div className="demo-page">
      <header className="demo-header">
        <div className="brand">
          <span className="brand-name">lernevo</span>
          <span className="brand-badge">AI companion</span>
        </div>
      </header>

      <main className="demo-main">
        <div className="demo-container">
          
          {/* LEFT */}
          <div className="demo-left">
            <h1>
              Your <span>mission control</span> for holistic health
            </h1>
            <p className="subtitle">
              Experience the AI-powered companion integrating fitness,
              nutrition, learning & mental health.
            </p>

            <div className="features">
              <div className="feature">
                <div className="icon-box"><Target size={18} /></div>
                <div>
                  <h3>Unified dashboard</h3>
                  <p>All wellness data in one place.</p>
                </div>
              </div>

              <div className="feature">
                <div className="icon-box"><Heart size={18} /></div>
                <div>
                  <h3>Human-in-the-loop</h3>
                  <p>Certified trainers guide your journey.</p>
                </div>
              </div>

              <div className="feature">
                <div className="icon-box"><Users size={18} /></div>
                <div>
                  <h3>Community support</h3>
                  <p>Group challenges & accountability.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="demo-form-wrapper">
            <h2>Book a demo</h2>
            <p className="form-subtext">
              See how Lernevo becomes your co-pilot.
            </p>

            <form onSubmit={handleSubmit} className="demo-form">
              <div className="input-group">
                <User size={18} />
                <input type="text" placeholder="Full name" required />
              </div>

              <div className="input-group">
                <Mail size={18} />
                <input type="email" placeholder="Email address" required />
              </div>

              <div className="input-group">
                <Calendar size={18} />
                <input type="date" required />
              </div>

              <div className="input-group">
                <Clock size={18} />
                <select required>
                  <option value="">Select a time</option>
                  <option>9:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>2:00 PM</option>
                  <option>3:00 PM</option>
                  <option>4:00 PM</option>
                </select>
              </div>

              <div className="textarea-group">
                <MessageSquare size={18} />
                <textarea rows="2" placeholder="Questions?" />
              </div>

              <button type="submit" className="submit-btn">
                Book your demo <ArrowRight size={18} />
              </button>

              <p className="trust-note">
                ✦ Secure communication. Your data is protected. ✦
              </p>
            </form>
          </div>
        </div>
      </main>

      <div className="demo-footer">
        © 2025 Lernevo — AI companion for holistic health
      </div>
    </div>
  );
};

export default BookaDemo;