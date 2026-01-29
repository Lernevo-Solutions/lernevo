import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import './AuthPage.css';
import wellnessImg from './holistic.png';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    emailOtp: '',
    phoneOtp: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  // Verification States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // Validation
  const isStep1Valid = formData.name && formData.email && formData.phone;
  const isStep2Valid = isEmailVerified && isPhoneVerified;
  const isStep3Valid = formData.username && formData.password && formData.password === formData.confirmPassword && formData.password.length >= 8;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { label: 'None', color: '#eee', width: '0%' };
    if (password.length < 6) return { label: 'Weak', color: '#ff4d4d', width: '33%' };
    if (password.length < 10) return { label: 'Medium', color: '#ffa64d', width: '66%' };
    return { label: 'Strong', color: '#2eb82e', width: '100%' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleVerifyEmail = () => {
    if (formData.emailOtp === '1234') {
      setIsEmailVerified(true);
    } else {
      alert('Invalid Email OTP (Try 1234)');
    }
  };

  const handleVerifyPhone = () => {
    if (formData.phoneOtp === '1234') {
      setIsPhoneVerified(true);
    } else {
      alert('Invalid Phone OTP (Try 1234)');
    }
  };

  const handleCreateAccount = () => {
    alert('Account Created Successfully!');
    navigate('/');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    alert('Logged in successfully!');
    navigate('/');
  };

  return (
    <div className="auth-page-container">
      {/* Left Side - 40% (Fixed, No Scroll) */}
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

      {/* Right Side - 60% (Fixed, No Scroll) */}
      <div className="auth-right-panel">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-toggle">
              <button 
                className={`toggle-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => {setIsLogin(false); setStep(1);}}
              >
                Signup
              </button>
              <button 
                className={`toggle-btn ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
            </div>

            {!isLogin && (
              <div className="horizontal-stepper">
                <div className={`step-indicator ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
                  <div className="step-num">{step > 1 ? <Check size={14} /> : '1'}</div>
                  <span>User Details</span>
                </div>
                <div className="step-line"></div>
                <div className={`step-indicator ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
                  <div className="step-num">{step > 2 ? <Check size={14} /> : '2'}</div>
                  <span>Verification</span>
                </div>
                <div className="step-line"></div>
                <div className={`step-indicator ${step === 3 ? 'active' : ''}`}>
                  <div className="step-num">3</div>
                  <span>Credentials</span>
                </div>
              </div>
            )}
          </div>

          <div className="auth-content-area">
            {!isLogin ? (
              <div className={`signup-step-content step-${step}`}>
                {step === 1 && (
                  <div className="step-fade-in">
                    <div className="input-grid">
                      <div className="input-group">
                        <label>Full Name</label>
                        <input 
                          type="text" 
                          name="name" 
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="input-group">
                        <label>Email ID</label>
                        <input 
                          type="email" 
                          name="email" 
                          placeholder="example@mail.com"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="input-group">
                        <label>Phone Number</label>
                        <input 
                          type="tel" 
                          name="phone" 
                          placeholder="+1 234 567 890"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="step-footer">
                      <button 
                        className="next-btn primary" 
                        disabled={!isStep1Valid}
                        onClick={nextStep}
                      >
                        Next Step <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="step-fade-in">
                    <div className="verification-container">
                      <div className="input-group">
                        <label>Email OTP (Try 1234)</label>
                        <div className="otp-row">
                          <input 
                            type="text" 
                            name="emailOtp" 
                            placeholder="OTP"
                            value={formData.emailOtp}
                            onChange={handleInputChange}
                            disabled={isEmailVerified}
                          />
                          {isEmailVerified ? (
                            <div className="verified-badge"><CheckCircle size={18} /> Verified</div>
                          ) : (
                            <button className="verify-action" onClick={handleVerifyEmail}>Verify</button>
                          )}
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Phone OTP (Try 1234)</label>
                        <div className="otp-row">
                          <input 
                            type="text" 
                            name="phoneOtp" 
                            placeholder="OTP"
                            value={formData.phoneOtp}
                            onChange={handleInputChange}
                            disabled={isPhoneVerified}
                          />
                          {isPhoneVerified ? (
                            <div className="verified-badge"><CheckCircle size={18} /> Verified</div>
                          ) : (
                            <button className="verify-action" onClick={handleVerifyPhone}>Verify</button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="step-footer">
                      <button className="back-btn" onClick={prevStep}>Back</button>
                      <button 
                        className="next-btn primary" 
                        disabled={!isStep2Valid}
                        onClick={nextStep}
                      >
                        Next Step <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="step-fade-in">
                    <div className="input-grid">
                      <div className="input-group">
                        <label>Username</label>
                        <input 
                          type="text" 
                          name="username" 
                          placeholder="Choose username"
                          value={formData.username}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="input-group">
                        <label>Password</label>
                        <div className="pw-wrapper">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            placeholder="Min 8 characters"
                            value={formData.password}
                            onChange={handleInputChange}
                          />
                          <button className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <div className="strength-container">
                          <div className="strength-bar-bg">
                            <div className="strength-bar-fill" style={{ width: strength.width, backgroundColor: strength.color }}></div>
                          </div>
                          <span className="strength-text">Strength: {strength.label}</span>
                        </div>
                      </div>
                      <div className="input-group">
                        <label>Confirm Password</label>
                        <div className="pw-wrapper">
                          <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            name="confirmPassword" 
                            placeholder="Repeat password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                          />
                          <button className="pw-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="step-footer">
                      <button className="back-btn" onClick={prevStep}>Back</button>
                      <button 
                        className="create-btn primary" 
                        disabled={!isStep3Valid}
                        onClick={handleCreateAccount}
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form className="login-form step-fade-in" onSubmit={handleLogin}>
                <div className="input-group">
                  <label>Username or Email</label>
                  <input type="text" placeholder="Enter your credentials" required />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <div className="pw-wrapper">
                    <input type={showPassword ? "text" : "password"} placeholder="Enter password" required />
                    <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="login-actions">
                  <button type="submit" className="login-btn primary">Login to Account</button>
                  <p className="forgot-pw">Forgot Password?</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
