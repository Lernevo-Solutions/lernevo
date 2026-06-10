import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { CheckCircle, Eye, EyeOff, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import './AuthPage.css';
import wellnessImg from './holistic.png';
import api from '../api';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(location.search.includes('mode=login'));
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(true);
  const [phoneAvailable, setPhoneAvailable] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // ✅ NEW: Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    emailOtp: '',
    username: '',
    password: '',
    confirmPassword: '',
    userId: ''
  });

  // Verification & Validation States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const userIdSectionRef = useRef(null);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    if (location.search.includes('mode=login')) {
      setIsLogin(true);
    }
    const existingToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (existingToken && existingToken !== 'undefined' && existingToken !== 'null') {
      navigate('/');
      return;
    }
    setIsAuthenticated(false);
    setUser(null);
  }, [location.search, navigate]);

  // Password Rules States
  const passwordRules = {
    length: formData.password.length >= 8,
    alphabet: /[a-zA-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*]/.test(formData.password),
    noSpace: !/\s/.test(formData.password)
  };

  const isPasswordStrong = Object.values(passwordRules).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== '';

  // Validation
  const isStep1Valid = formData.name && formData.email && formData.phone && emailAvailable && phoneAvailable;
  const isStep2Valid = isEmailVerified;
  const isStep3Valid = isUsernameAvailable === true && isPasswordStrong && passwordsMatch;

  // Username Availability Check
  useEffect(() => {
    if (!formData.username) {
      setIsUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(() => {
      setIsCheckingUsername(true);
      setTimeout(() => {
        const takenUsernames = ['admin', 'user', 'lernevo', 'test'];
        setIsUsernameAvailable(!takenUsernames.includes(formData.username.toLowerCase()));
        setIsCheckingUsername(false);
      }, 800);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  // Check email/phone availability
  useEffect(() => {
    if (!formData.email && !formData.phone) return;

    const timer = setTimeout(async () => {
      setIsCheckingAvailability(true);
      try {
        const res = await api.post('/check-availability/', {
          email: formData.email,
          phone: formData.phone
        });
        setEmailAvailable(res.data.email_available);
        setPhoneAvailable(res.data.phone_available);
      } catch (err) {
        console.error(err);
        setEmailAvailable(true);
        setPhoneAvailable(true);
      } finally {
        setIsCheckingAvailability(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, formData.phone]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const getPasswordStrength = () => {
    if (!formData.password) return { label: 'None', color: '#eee', width: '0%' };
    const score = Object.values(passwordRules).filter(Boolean).length;
    if (score <= 2) return { label: 'Weak', color: '#ff4d4d', width: '33%' };
    if (score <= 4) return { label: 'Medium', color: '#ffa64d', width: '66%' };
    return { label: 'Strong', color: '#2eb82e', width: '100%' };
  };

  const strength = getPasswordStrength();

  // ✅ FIXED: Send OTP
  const handleSendOtp = async () => {
    if (!formData.email) {
      alert('Please enter email first');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage('Sending OTP to your email...');
    
    try {
      await api.post('/otp/', {
        email: formData.email.trim().toLowerCase()
      });
      alert('✅ OTP sent to your email! Please check inbox/spam folder.');
    } catch (err) {
      console.error('OTP send error:', err);
      alert(err.response?.data?.detail || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // ✅ FIXED: Verify OTP
  const handleVerifyEmail = async () => {
    if (!formData.emailOtp || formData.emailOtp.length < 6) {
      alert('Please enter valid 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage('Verifying OTP...');
    
    try {
      await api.post('/otp/', {
        email: formData.email.trim().toLowerCase(),
        otp: formData.emailOtp,
      });
      setIsEmailVerified(true);
      alert('✅ Email verified successfully!');
    } catch (err) {
      console.error('Verification error:', err);
      alert(err.response?.data?.detail || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // ✅ FIXED: Register User
  const handleGenerateUserId = async () => {
    // Validation checks
    if (!isUsernameAvailable) {
      alert('Please choose an available username');
      return;
    }
    
    if (!isPasswordStrong) {
      alert('Please choose a stronger password (8+ chars, letters, numbers, special characters)');
      return;
    }
    
    if (!passwordsMatch) {
      alert('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage('Creating your account... Please wait (may take 30-60 seconds)');
    
    const generatedId = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      const res = await api.post('/register/', {
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        username: formData.username.toLowerCase(),
        password: formData.password,
        mobile: formData.phone,
        user_code: generatedId,
      });

      const { token, user_code: issuedUserCode } = res.data;
      
      if (token) {
        // Store all user data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_code', issuedUserCode || generatedId);
        localStorage.setItem('user_name', formData.username);
        localStorage.setItem('user_email', formData.email);
        localStorage.setItem('user_mobile', formData.phone);
        
        setIsAuthenticated(true);
        setUser(formData.name);
        setFormData(prev => ({ ...prev, userId: issuedUserCode || generatedId }));

        // Scroll to show user ID
        setTimeout(() => {
          userIdSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        alert('✅ Registration successful! Redirecting to home...');
        
        // Redirect to home
        setTimeout(() => {
          setIsRedirecting(true);
          setTimeout(() => {
            navigate('/');
          }, 1500);
        }, 1000);
      } else {
        throw new Error('No token received from server');
      }
    } catch (err) {
      console.error('Registration error:', err);
      let errorMsg = 'Registration failed. ';
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMsg = 'Server is slow. Please try again in a moment.';
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.response?.data?.email) {
        errorMsg = 'Email already registered';
      } else if (err.response?.data?.username) {
        errorMsg = 'Username already taken';
      } else if (err.response?.data?.mobile) {
        errorMsg = 'Phone number already registered';
      } else {
        errorMsg = err.response?.data?.message || 'Please try again.';
      }
      
      alert(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // ✅ FIXED: Login User
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginData.username || !loginData.password) {
      alert('Please enter both username/email and password');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage('Logging in... Please wait');

    const payload = {
      username: loginData.username.trim().toLowerCase(), 
      password: loginData.password
    };

    try {
      const res = await api.post('/login/', payload);

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('user_name', res.data.user_name || payload.username);
        localStorage.setItem('user_email', res.data.email || '');
        localStorage.setItem('user_code', res.data.user_code || '');

        alert('✅ Login successful! Redirecting...');
        navigate('/');
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMsg = 'Login failed. ';
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMsg = 'Server is slow. Please try again in a moment.';
      } else if (err.response?.status === 404) {
        errorMsg = 'User not found. Please register first.';
      } else if (err.response?.status === 400) {
        errorMsg = err.response?.data?.detail || 'Invalid credentials';
      } else {
        errorMsg = err.response?.data?.detail || 'Invalid login credentials';
      }
      
      alert(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="auth-page-container">
      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            textAlign: 'center',
            minWidth: '250px'
          }}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '15px' }} />
            <p style={{ marginTop: '10px', fontSize: '16px', color: '#333' }}>{loadingMessage}</p>
            <small style={{ color: '#666', display: 'block', marginTop: '10px' }}>Please don't close this window</small>
          </div>
        </div>
      )}

      {/* Left Side */}
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

      {/* Right Side */}
      <div className="auth-right-panel">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-toggle">
              <button 
                className={`toggle-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => {setIsLogin(false); setStep(1);}}
                disabled={isLoading}
              >
                Signup
              </button>
              <button 
                className={`toggle-btn ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
                disabled={isLoading}
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
                          disabled={isLoading}
                        />
                      </div>
                      <div className="input-group">
                        <label>Email ID</label>
                        <div className="email-input-wrapper">
                          <input 
                            type="email" 
                            name="email" 
                            placeholder="example@mail.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isLoading}
                          />
                          {isEmailVerified && <CheckCircle size={18} className="success-tick" />}
                        </div>
                        {formData.email && !emailAvailable && !isCheckingAvailability && (
                          <span className="error-text">Email already registered</span>
                        )}
                      </div>
                      <div className="input-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Enter phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={isLoading}
                        />
                        {formData.phone && !phoneAvailable && !isCheckingAvailability && (
                          <span className="error-text">Phone number already registered</span>
                        )}
                      </div>
                    </div>
                    <div className="step-footer">
                      <button 
                        className="next-btn primary" 
                        disabled={!isStep1Valid || isCheckingAvailability || isLoading}
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
                        <label>Email ID</label>
                        <div className="email-status-row">
                          <input 
                            type="email" 
                            value={formData.email} 
                            readOnly 
                            className="email-read-only"
                          />
                          {!isEmailVerified ? (
                            <button 
                              className="get-otp-btn" 
                              onClick={handleSendOtp}
                              disabled={isLoading || !formData.email}
                            >
                              {isLoading && loadingMessage.includes('Sending') ? 'Sending...' : 'Get OTP'}
                            </button>
                          ) : (
                            <CheckCircle size={18} className="success-tick" />
                          )}
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Email OTP</label>
                        <div className="otp-row">
                          <input 
                            type="text" 
                            name="emailOtp" 
                            placeholder="Enter OTP"
                            value={formData.emailOtp}
                            onChange={handleInputChange}
                            disabled={isEmailVerified || isLoading}
                          />
                          {!isEmailVerified && (
                            <button 
                              className={`verify-action ${formData.emailOtp.length >= 6 ? 'active' : ''}`} 
                              onClick={handleVerifyEmail}
                              disabled={formData.emailOtp.length < 6 || isLoading}
                            >
                              {isLoading && loadingMessage.includes('Verifying') ? 'Verifying...' : 'Verify'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="step-footer">
                      <button className="back-btn" onClick={prevStep} disabled={isLoading}>Back</button>
                      <button 
                        className="next-btn primary" 
                        disabled={!isStep2Valid || isLoading}
                        onClick={nextStep}
                      >
                        Next Step <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="step-fade-in">
                    <div className="input-grid credentials-grid">
                      <div className="input-group">
                        <label>Username</label>
                        <div className="username-wrapper">
                          <input 
                            type="text" 
                            name="username" 
                            placeholder="Choose username"
                            value={formData.username}
                            onChange={handleInputChange}
                            disabled={isLoading}
                          />
                          {isCheckingUsername && <Loader2 size={16} className="username-loader" />}
                        </div>
                        {formData.username && !isCheckingUsername && (
                          <div className={`availability-status ${isUsernameAvailable ? 'available' : 'taken'}`}>
                            {isUsernameAvailable ? (
                              <><Check size={14} /> Username available</>
                            ) : (
                              <><X size={14} /> Username already taken</>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="input-row">
                        <div className="input-group">
                          <label>Password</label>
                          <div className="pw-wrapper">
                            <input 
                              type={showPassword ? "text" : "password"} 
                              name="password" 
                              placeholder="Min 8 characters"
                              value={formData.password}
                              onChange={handleInputChange}
                              disabled={isLoading}
                            />
                            <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
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
                              disabled={isLoading}
                            />
                            <button type="button" className="pw-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {formData.confirmPassword && !passwordsMatch && (
                            <span className="error-text">Passwords do not match</span>
                          )}
                        </div>
                      </div>

                      <div className="password-checklist">
                        <div className={`check-item ${passwordRules.length ? 'valid' : ''}`}>
                          <CheckCircle size={14} /> 8 characters minimum
                        </div>
                        <div className={`check-item ${passwordRules.alphabet ? 'valid' : ''}`}>
                          <CheckCircle size={14} /> Contains letter (A-Z)
                        </div>
                        <div className={`check-item ${passwordRules.number ? 'valid' : ''}`}>
                          <CheckCircle size={14} /> Contains number (0-9)
                        </div>
                        <div className={`check-item ${passwordRules.special ? 'valid' : ''}`}>
                          <CheckCircle size={14} /> Special character (!@#$%^&*)
                        </div>
                      </div>

                      <div className="user-id-section" ref={userIdSectionRef}>
                        <div className="divider-line"></div>
                        <p className="welcome-line">Welcome to Lernevo 👋</p>
                        
                        {!formData.userId ? (
                          <button 
                            className="generate-id-btn"
                            onClick={handleGenerateUserId}
                            disabled={!(isUsernameAvailable === true && isPasswordStrong && passwordsMatch) || isLoading}
                          >
                            {isLoading ? loadingMessage : 'Generate User ID'}
                          </button>
                        ) : (
                          <div className="step-fade-in">
                            <div className="input-group">
                              <label>Your User ID</label>
                              <input 
                                type="text" 
                                className="user-id-display" 
                                value={formData.userId} 
                                readOnly 
                                disabled
                              />
                            </div>
                            {isRedirecting && (
                              <p className="redirect-text">Redirecting you to Home...</p>
                            )}
                          </div>
                        )}
                        <div className="divider-line"></div>
                      </div>
                    </div>

                    <div className="step-footer">
                      <button className="back-btn" onClick={prevStep} disabled={isLoading}>Back</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form className="login-form step-fade-in" onSubmit={handleLogin}>
                <div className="input-group">
                  <label>Username or Email</label>
                  <input
                    type="text"
                    placeholder="Enter your credentials"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className="pw-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      className="pw-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="login-actions">
                  <button type="submit" className="login-btn primary" disabled={isLoading}>
                    {isLoading ? loadingMessage : 'Login to Account'}
                  </button>
                  <Link to="/reset-password" style={{ textDecoration: 'none' }}>
                    <p className="forgot-pw">Forgot Password?</p>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;