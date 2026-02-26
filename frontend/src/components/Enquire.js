import React, { useState } from "react";
import {
  Heart,
  Sparkles,
  Brain,
  Activity,
  Apple,
  Moon,
  Shield,
  Users,
  Target,
  ChevronRight,
  Send,
} from "lucide-react";
import "./Enquire.css";

const Enquire = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    interestArea: "holistic",
    message: "",
    isTrainer: false,
    agreeToTerms: false,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const interestAreas = [
    { value: "holistic", label: "Holistic Wellness Journey", icon: Heart },
    { value: "fitness", label: "Fitness & Training", icon: Activity },
    { value: "nutrition", label: "Nutrition Guidance", icon: Apple },
    { value: "mental", label: "Mental Wellness", icon: Brain },
    { value: "sleep", label: "Sleep Optimization", icon: Moon },
    { value: "trainer", label: "Become a Trainer", icon: Users },
  ];

  const valueProps = [
    { icon: Sparkles, text: "AI-Powered Personalization" },
    { icon: Shield, text: "Secure & Private" },
    { icon: Target, text: "Mission Control for Your Health" },
  ];

  return (
    <div className="enquiry-page">
      <div className="enquiry-container">
        <div className="enquiry-left">
          <div className="brand">
            <Heart size={28} />
            <span>LERNEVO</span>
          </div>

          <h1>Your AI Companion for Holistic Wellness</h1>
          <p>
            One mission control center for your body, mind, and personal growth.
          </p>

          <div className="value-props">
            {valueProps.map((prop, index) => (
              <div key={index} className="value-item">
                <prop.icon size={16} />
                <span>{prop.text}</span>
              </div>
            ))}
          </div>

          <div className="why-section">
            <h3>Why Lernevo?</h3>
            <ul>
              <li><ChevronRight size={14} /> Unified health dashboard</li>
              <li><ChevronRight size={14} /> Certified trainer guidance</li>
              <li><ChevronRight size={14} /> AI that learns your patterns</li>
              <li><ChevronRight size={14} /> Community challenges</li>
            </ul>
          </div>
        </div>

        <div className="enquiry-right">
          <h2>Begin Your Wellness Journey</h2>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="interest-grid">
              {interestAreas.map((area) => (
                <label key={area.value} className="interest-option">
                  <input
                    type="radio"
                    name="interestArea"
                    value={area.value}
                    checked={formData.interestArea === area.value}
                    onChange={handleChange}
                  />
                  <area.icon size={14} />
                  <span>{area.label}</span>
                </label>
              ))}
            </div>

            <textarea
              name="message"
              placeholder="Tell us about your goals..."
              value={formData.message}
              onChange={handleChange}
            />

            <label className="checkbox">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
              />
              I agree to the Terms & Privacy Policy
            </label>

            <button type="submit" className="submit-btn">
              <Send size={16} />
              Begin My Journey
            </button>

            {isSubmitted && (
              <div className="success-message">
                ✨ Thank you! We’ll contact you soon.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Enquire;