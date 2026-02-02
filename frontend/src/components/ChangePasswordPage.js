import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Save, Eye, EyeOff, Check, X } from 'lucide-react';
import ProfileLayout from './ProfileLayout';
import './ChangePasswordPage.css';
import api from '../api';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const passwordRules = {
    length: formData.newPassword.length >= 8,
    alphabet: /[a-zA-Z]/.test(formData.newPassword),
    number: /[0-9]/.test(formData.newPassword),
    special: /[!@#$%^&*]/.test(formData.newPassword)
  };

  const isPasswordStrong = Object.values(passwordRules).every(Boolean);
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.newPassword !== '';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (status.message) setStatus({ type: '', message: '' });
  };

  const getPasswordStrength = () => {
    if (!formData.newPassword) return { label: 'None', color: '#eee', width: '0%' };
    const score = Object.values(passwordRules).filter(Boolean).length;
    
    if (score <= 1) return { label: 'Very Weak', color: '#ff4d4d', width: '25%' };
    if (score === 2) return { label: 'Weak', color: '#ffa64d', width: '50%' };
    if (score === 3) return { label: 'Medium', color: '#fbbf24', width: '75%' };
    return { label: 'Strong', color: '#2eb82e', width: '100%' };
  };

  const strength = getPasswordStrength();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!isPasswordStrong) {
      setStatus({ type: 'error', message: 'New password does not meet requirements' });
      return;
    }

    if (!passwordsMatch) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      await api.put('/profile/change-password/', 
        { 
          old_password: formData.currentPassword,
          new_password: formData.newPassword 
        },
        { headers: { Authorization: `Token ${token}` } }
      );
      
      setStatus({ type: 'success', message: 'Password updated successfully!' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Password update error:', err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Current password is incorrect';
      setStatus({ 
        type: 'error', 
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProfileLayout
      title="Change Password"
      subtitle="Secure your account with a new strong password."
      showBack={false}
    >
      <div className="status-message-area">
        {status.message && (
          <div className={`status-alert ${status.type}`}>
            {status.type === 'success' ? <Check size={18} /> : <X size={18} />}
            {status.message}
          </div>
        )}
      </div>

      <form onSubmit={handleUpdatePassword} className="change-password-form">
        <div className="input-group">
          <label>Current Password</label>
          <div className="input-wrapper">
            <Lock size={20} className="input-icon" />
            <input
              type={showCurrent ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="Enter current password"
              required
            />
            <button 
              type="button" 
              className="eye-toggle" 
              onClick={() => setShowCurrent(!showCurrent)}
            >
              {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="input-group">
          <label>New Password</label>
          <div className="input-wrapper">
            <Lock size={20} className="input-icon" />
            <input
              type={showNew ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter new password"
              required
            />
            <button 
              type="button" 
              className="eye-toggle" 
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="strength-meter-container">
            <div className="strength-header">
              <span>Strength: <strong>{strength.label}</strong></span>
            </div>
            <div className="strength-bar">
              <div 
                className="strength-fill" 
                style={{ width: strength.width, backgroundColor: strength.color }}
              ></div>
            </div>
          </div>

          <div className="password-rules">
            <div className={`rule ${passwordRules.length ? 'met' : ''}`}>
              <Check size={14} /> 8+ chars
            </div>
            <div className={`rule ${passwordRules.alphabet ? 'met' : ''}`}>
              <Check size={14} /> Letter
            </div>
            <div className={`rule ${passwordRules.number ? 'met' : ''}`}>
              <Check size={14} /> Number
            </div>
            <div className={`rule ${passwordRules.special ? 'met' : ''}`}>
              <Check size={14} /> Special
            </div>
          </div>
        </div>

        <div className="input-group">
          <label>Confirm New Password</label>
          <div className="input-wrapper">
            <Lock size={20} className="input-icon" />
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Repeat new password"
              required
            />
            <button 
              type="button" 
              className="eye-toggle" 
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="change-actions">
          <button 
            type="submit" 
            className="save-btn full-width" 
            disabled={isSubmitting || !isPasswordStrong || !passwordsMatch || !formData.currentPassword}
          >
            {isSubmitting ? 'Updating...' : <><Save size={18} /> Update Password</>}
          </button>
        </div>
      </form>
    </ProfileLayout>
  );
};

export default ChangePasswordPage;
