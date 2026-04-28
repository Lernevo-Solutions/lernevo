import React, { useState } from "react";
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
import { API_BASE_URL } from "../config";

const BookaDemo = () => {

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    preferred_date: "",
    preferred_time: "",
    questions: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/book-demo/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Demo booked successfully ✅");
        setFormData({
          full_name: "",
          email: "",
          preferred_date: "",
          preferred_time: "",
          questions: "",
        });
      } else {
        alert("Error submitting form ❌");
        console.log(data);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error ❌");
    }

    setLoading(false);
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
                <input
                  type="text"
                  name="full_name"
                  placeholder="Full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <Calendar size={18} />
                <input
                  type="date"
                  name="preferred_date"
                  value={formData.preferred_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <Clock size={18} />
                <select
                  name="preferred_time"
                  value={formData.preferred_time}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a time</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                </select>
              </div>

              <div className="textarea-group">
                <MessageSquare size={18} />
                <textarea
                  rows="2"
                  name="questions"
                  placeholder="Questions?"
                  value={formData.questions}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Submitting..." : "Book your demo"} <ArrowRight size={18} />
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
