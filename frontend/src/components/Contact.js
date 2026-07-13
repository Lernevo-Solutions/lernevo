import React, { useState } from "react";
import {
  Heart,
  Mail,
  Send,
  Clock,
  MessageCircle,
  HelpCircle,
  Sparkles,
  CheckCircle,
  Users,
  Target,
  Brain,
  Apple,
  Activity
} from "lucide-react";
import "./Contact.css";
import { API_BASE_URL } from "../config";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${API_BASE_URL}/contact/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        inquiry_type: formData.inquiryType, // IMPORTANT: match Django field name
      }),
    });
    

    if (response.ok) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        inquiryType: "general",
      });
    } else {
      const errorData = await response.json();
      console.error("Error:", errorData);
      alert("Something went wrong!");
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("Server not reachable!");
  }
};
  const inquiryTypes = [
    { value: "general", label: "General Inquiry", icon: HelpCircle },
    { value: "support", label: "Customer Support", icon: MessageCircle },
    { value: "partnership", label: "Partnership", icon: Users },
    { value: "demo", label: "Book a Demo", icon: Sparkles }
  ];

  const quickLinks = [
    { icon: Brain, text: "Mental Wellness" },
    { icon: Activity, text: "Fitness" },
    { icon: Apple, text: "Nutrition" },
    { icon: Target, text: "AI Coaching" }
  ];

  return (
    <div className="contact-page">
      <div className="contact-container">

        {/* Left Section */}
        <div className="contact-left">
          <div className="brand">
            <Heart size={22} />
            <span>LERNEVO</span>
          </div>

          <h1>We'd love to hear from you!</h1>
          <p>
            Whether you have questions, need support, or want to explore
            partnerships — we're here for you.
          </p>

          <div className="contact-card">
            <Mail size={20} />
            <div>
              <h4>Email Us</h4>
              <p>Lernevo123@gmail.com</p>
              <small><Clock size={12} /> Within 24 hours</small>
            </div>
          </div>

          <div className="quick-links">
            {quickLinks.map((link, index) => (
              <button key={index} className="quick-link">
                <link.icon size={14} />
                {link.text}
              </button>
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="contact-right">
          <h2>Send us a message</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="inquiry-grid">
              {inquiryTypes.map((type) => (
                <label key={type.value} className="inquiry-option">
                  <input
                    type="radio"
                    name="inquiryType"
                    value={type.value}
                    checked={formData.inquiryType === type.value}
                    onChange={handleChange}
                  />
                  <type.icon size={14} />
                  {type.label}
                </label>
              ))}
            </div>

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />

            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
            />

            <button type="submit" className="submit-btn">
              <Send size={14} />
              Send Message
            </button>

            {isSubmitted && (
              <div className="success-message">
                <CheckCircle size={14} />
                Message sent successfully!
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;
