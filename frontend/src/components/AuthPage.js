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
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null); // null, true, or false
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const userIdSectionRef = useRef(null);

  useEffect(() => {
    if (location.search.includes('mode=login')) {
      setIsLogin(true);
    }
    // Force logged-out state on AuthPage load
    localStorage.clear();
    sessionStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
  }, [location.search]);

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
  const isStep1Valid =
  formData.name &&
  formData.email &&
  formData.phone &&
  emailAvailable &&
  phoneAvailable;

  const isStep2Valid = isEmailVerified;
  const isStep3Valid = isUsernameAvailable === true && isPasswordStrong && passwordsMatch && formData.userId;

  // Username Availability Simulation
  useEffect(() => {
    if (!formData.username) {
      setIsUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(() => {
      setIsCheckingUsername(true);
      // Simulate API call
      setTimeout(() => {
        const takenUsernames = ['admin', 'user', 'lernevo', 'test'];
        setIsUsernameAvailable(!takenUsernames.includes(formData.username.toLowerCase()));
        setIsCheckingUsername(false);
      }, 800);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleGenerateUserId = async () => {
    const generatedId = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      // 1. Register user with the generated ID
      const res = await api.post('/register/', {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        mobile: formData.phone,
        user_code: generatedId,
      });

      const { token } = res.data;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user_code', generatedId);
        localStorage.setItem('user_name', formData.username);
        
        // onSignupSuccess
        setIsAuthenticated(true);
        setUser(formData.name);
      } else {
        localStorage.clear();
        throw new Error('No token received from server');
      }

      // 2. Set ID in state to trigger UI update
      setFormData(prev => ({ ...prev, userId: generatedId }));

      // 3. Smooth scroll to the ID section
      setTimeout(() => {
        userIdSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // 4. Handle redirect logic
      setTimeout(() => {
        setIsRedirecting(true);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }, 1000);

    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };
  
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

  const handleVerifyEmail = async () => {
  try {
    await api.post('/otp/', {
      email: formData.email,
      otp: formData.emailOtp, // backend will verify
    });

    setIsEmailVerified(true);
  } catch (err) {
    alert('Invalid OTP');
  }
};


const handleLogin = async (e) => {
  e.preventDefault();
  const username = e.target[0].value;
  try {
    const res = await api.post('/login/', {
      username: username,
      password: e.target[1].value,
    });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_name', res.data.name || username);
      
      // onLoginSuccess
      setIsAuthenticated(true);
      setUser(res.data.name || username);
      
      alert('Login successful');
      navigate('/');
    } else {
      localStorage.clear();
      alert('Login failed: No token received');
    }
  } catch (err) {
    localStorage.clear();
    alert(err.response?.data?.detail || 'Invalid login credentials');
  }
};
const handleSendOtp = async () => {
  try {
    await api.post('/otp/', {
      email: formData.email
    });
    alert('OTP sent to email');
  } catch (err) {
    alert('Failed to send OTP');
  }
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
                        <div className="email-input-wrapper">
                          <input 
                            type="email" 
                            name="email" 
                            placeholder="example@mail.com"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                          {isEmailVerified && <CheckCircle size={18} className="success-tick" />}
                        </div>
                      </div>
                      {formData.email && !emailAvailable && (
  <span className="error-text">Email already registered</span>
)}

                       <div className="input-group">
        <label>Phone Number</label>
        <input
          type="tel"
          name="phone"
          placeholder="Enter phone number"
          value={formData.phone}
          onChange={handleInputChange}
        />
      </div>
      {formData.phone && !phoneAvailable && (
  <span className="error-text">Phone number already registered</span>
)}

    
                    </div>
                    <div className="step-footer">
                      <button 
                       className="next-btn primary" 
  disabled={!isStep1Valid || isCheckingAvailability}
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
                            <button className="get-otp-btn" onClick={handleSendOtp}>
                              Get OTP
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
                            disabled={isEmailVerified}
                          />
                          {!isEmailVerified && (
                            <button 
                              className={`verify-action ${formData.emailOtp.length >= 4 ? 'active' : ''}`} 
                              onClick={handleVerifyEmail}
                              disabled={formData.emailOtp.length < 4}
                            >
                              Verify
                            </button>
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
                            disabled={!(isUsernameAvailable === true && isPasswordStrong && passwordsMatch)}
                          >
                            Generate User ID
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
                      <button className="back-btn" onClick={prevStep}>Back</button>
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
                  <Link to="/reset-password" style={{ textDecoration: 'none' }}>
                    <p className="forgot-pw">Forgot Password?</p>
                  </Link>
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