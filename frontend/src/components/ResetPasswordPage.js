import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2, Mail } from 'lucide-react';
import './AuthPage.css'; 
import './ResetPasswordPage.css';
import wellnessImg from './holistic.png';
import api from '../api';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/password-reset/', { email });
      setIsSubmitted(true);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('This email is not registered with us.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-left-panel">
        <div className="auth-image-content">
          <img src={wellnessImg} alt="Holistic Wellness" className="wellness-diagram" />
          <div className="trust-points">
            <div className="trust-point">
              <CheckCircle size={18} className="trust-icon" />
              <span>Complete Holistic Wellness Approach</span>
            </div>
            <div className="trust-point">
              <CheckCircle size={18} className="trust-icon" />
              <span>Data-Driven Personalized Insights</span>
            </div>
            <div className="trust-point">
              <CheckCircle size={18} className="trust-icon" />
              <span>Secure & Private Growth Journey</span>
            </div>
            <div className="trust-point">
              <CheckCircle size={18} className="trust-icon" />
              <span>Expert Human-Guided AI Support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right-panel">
        <div className="auth-card reset-password-card">
          <div className="auth-content-area reset-content-padding">
            {!isSubmitted ? (
              <div className="step-fade-in">
                <div className="reset-header">
                  <h2>Reset your password</h2>
                  <p>Enter your registered email address. We’ll send you a reset link.</p>
                </div>

                <form onSubmit={handleResetRequest} className="input-grid">
                  <div className="input-group">
                    <label className="uppercase-label">EMAIL ADDRESS</label>
                    <div className="reset-input-wrapper">
                      <input 
                        type="email" 
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Mail size={18} className="reset-input-icon" />
                    </div>
                    {error && <span className="error-text">{error}</span>}
                  </div>

                  <div className="step-footer reset-footer-margin">
                    <button 
                      type="submit"
                      className="next-btn primary full-width-btn" 
                      disabled={isLoading || !email}
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>Send Reset Link <ArrowRight size={18} className="ml-8" /></>
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-30">
                  <Link to="/get-started?mode=login" className="back-to-login-link">
                    <span className="mr-8">←</span> Back to Login
                  </Link>
                </div>
              </div>
            ) : (
              <div className="step-fade-in success-state-container">
                <div className="success-icon-wrapper">
                  <CheckCircle size={48} color="#22c55e" />
                </div>
                <h2>Check your email</h2>
                <p className="success-subtext">
                  We’ve sent a password reset link to your email address.
                </p>
                <button 
                  onClick={() => navigate('/get-started?mode=login')}
                  className="next-btn primary full-width-btn"
                >
                  Back to Login
                </button>
              </div>
            )}

            <div className="security-trust-microcopy">
              <span>🔒</span> Your account security is our priority.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
