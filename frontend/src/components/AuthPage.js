import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { CheckCircle, Eye, EyeOff, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import './AuthPage.css';
import wellnessImg from './holistic.png';
import api from '../api';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const invitationToken = new URLSearchParams(location.search).get('invitation_token');
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
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Country code states
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  
  // AuthPage states
  const [mustUpdatePassword, setMustUpdatePassword] = useState(false);
  const [updatePasswords, setUpdatePasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    emailOtp: '',
    username: '',
    password: '',
    confirmPassword: '',
    userId: '',
    role: 'USER'
  });

  // Country codes with specific phone number lengths
  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳', minLength: 10, maxLength: 10, example: '9876543210' },
    { code: '+1', country: 'USA/Canada', flag: '🇺🇸', minLength: 10, maxLength: 10, example: '2125551234' },
    { code: '+44', country: 'UK', flag: '🇬🇧', minLength: 10, maxLength: 10, example: '7123456789' },
    { code: '+61', country: 'Australia', flag: '🇦🇺', minLength: 9, maxLength: 10, example: '412345678' },
    { code: '+971', country: 'UAE', flag: '🇦🇪', minLength: 9, maxLength: 9, example: '501234567' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', minLength: 9, maxLength: 9, example: '512345678' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬', minLength: 8, maxLength: 8, example: '91234567' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾', minLength: 9, maxLength: 10, example: '123456789' },
    { code: '+86', country: 'China', flag: '🇨🇳', minLength: 11, maxLength: 11, example: '13812345678' },
    { code: '+81', country: 'Japan', flag: '🇯🇵', minLength: 10, maxLength: 10, example: '9012345678' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷', minLength: 10, maxLength: 11, example: '1012345678' },
    { code: '+49', country: 'Germany', flag: '🇩🇪', minLength: 10, maxLength: 11, example: '15123456789' },
    { code: '+33', country: 'France', flag: '🇫🇷', minLength: 9, maxLength: 9, example: '612345678' },
    { code: '+39', country: 'Italy', flag: '🇮🇹', minLength: 10, maxLength: 10, example: '3123456789' },
    { code: '+34', country: 'Spain', flag: '🇪🇸', minLength: 9, maxLength: 9, example: '612345678' },
    { code: '+7', country: 'Russia', flag: '🇷🇺', minLength: 10, maxLength: 10, example: '9123456789' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷', minLength: 10, maxLength: 11, example: '11987654321' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽', minLength: 10, maxLength: 10, example: '5512345678' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦', minLength: 9, maxLength: 9, example: '712345678' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬', minLength: 10, maxLength: 10, example: '8021234567' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰', minLength: 10, maxLength: 10, example: '3123456789' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩', minLength: 10, maxLength: 10, example: '1712345678' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', minLength: 9, maxLength: 9, example: '712345678' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵', minLength: 10, maxLength: 10, example: '9812345678' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩', minLength: 10, maxLength: 12, example: '81234567890' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭', minLength: 9, maxLength: 9, example: '812345678' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳', minLength: 9, maxLength: 10, example: '912345678' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭', minLength: 10, maxLength: 10, example: '9123456789' },
  ];

  // Verification & Validation States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [userRole, setUserRole] = useState('USER');
  const [invitationData, setInvitationData] = useState(null);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [invitationError, setInvitationError] = useState('');
  const [invitationForm, setInvitationForm] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });

  const userIdSectionRef = useRef(null);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // Helper function for Navigation based on Role
  const redirectBasedOnRole = (role) => {
    const normalizedRole = (role || 'USER').toUpperCase();
    if (normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN') {
      navigate('/admin/dashboard');
    } else if (normalizedRole === 'TRAINER') {
      navigate('/trainer/dashboard'); // 👈 Change path according to your App.js routes
    } else {
      navigate('/');
    }
  };

  const getCurrentCountryConfig = () => {
    return countryCodes.find(c => c.code === selectedCountryCode) || countryCodes[0];
  };

  const validatePhoneNumber = (phone) => {
    const country = getCurrentCountryConfig();
    if (!phone) return true;
    
    const phoneDigits = phone.replace(/\D/g, '');
    const isValid = phoneDigits.length >= country.minLength && phoneDigits.length <= country.maxLength;
    
    if (!isValid) {
      setPhoneError(`Phone number must be ${country.minLength}${country.minLength !== country.maxLength ? `-${country.maxLength}` : ''} digits for ${country.country}`);
    } else {
      setPhoneError('');
    }
    
    return isValid;
  };

  useEffect(() => {
    if (invitationToken) {
      setIsLogin(false);
    }

    if (location.search.includes('mode=login')) {
      setIsLogin(true);
    }
    const existingToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (!invitationToken && existingToken && existingToken !== 'undefined' && existingToken !== 'null') {
      const storedRole = localStorage.getItem('user_role') || 'USER';
      redirectBasedOnRole(storedRole);
      return;
    }
    setIsAuthenticated(false);
    setUser(null);
  }, [invitationToken, location.search, navigate]);

  useEffect(() => {
    if (!invitationToken) return;

    const loadInvitation = async () => {
      setInvitationLoading(true);
      setInvitationError('');
      try {
        const res = await api.get(`/roles/invitation/${invitationToken}/`);
        setInvitationData(res.data.invitation || null);
      } catch (err) {
        setInvitationError(err.response?.data?.detail || 'Invitation is unavailable');
      } finally {
        setInvitationLoading(false);
      }
    };

    loadInvitation();
  }, [invitationToken]);

  const passwordRules = {
    length: formData.password.length >= 8,
    alphabet: /[a-zA-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*]/.test(formData.password),
    noSpace: !/\s/.test(formData.password)
  };

  const isPasswordStrong = Object.values(passwordRules).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== '';

  const isStep1Valid = formData.name && formData.email && formData.phone && emailAvailable && phoneAvailable && !phoneError;
  const isStep2Valid = isEmailVerified;
  const isStep3Valid = isUsernameAvailable === true && isPasswordStrong && passwordsMatch;

  const getFullPhoneNumber = () => {
    return `${selectedCountryCode}${formData.phone}`;
  };

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

  useEffect(() => {
    if (!formData.email && !formData.phone) return;

    const timer = setTimeout(async () => {
      setIsCheckingAvailability(true);
      try {
        const fullPhone = getFullPhoneNumber();
        const res = await api.post('/check-availability/', {
          email: formData.email,
          phone: fullPhone
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
  }, [formData.email, formData.phone, selectedCountryCode]);

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

  const handleGenerateUserId = async () => {
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
    
    if (!validatePhoneNumber(formData.phone)) {
      alert(phoneError);
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage('Creating your account... Please wait');
    
    const generatedId = Math.floor(100000 + Math.random() * 900000).toString();
    const fullPhoneNumber = getFullPhoneNumber();
    
    try {
      const res = await api.post('/register/', {
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        username: formData.username.toLowerCase(),
        password: formData.password,
        mobile: fullPhoneNumber,
        country_code: selectedCountryCode,
        user_code: generatedId,
        role: formData.role,
      });

      const { token, user_code: issuedUserCode } = res.data;
      
      if (token) {
        const role = res.data.role || 'USER';

        localStorage.setItem('token', token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_code', issuedUserCode || generatedId);
        localStorage.setItem('user_name', formData.username);
        localStorage.setItem('user_email', formData.email);
        localStorage.setItem('user_mobile', fullPhoneNumber);
        localStorage.setItem('country_code', selectedCountryCode);
        localStorage.setItem('user_role', role);
        
        setUserRole(role);
        setIsAuthenticated(true);
        setUser(formData.name);
        setFormData(prev => ({ ...prev, userId: issuedUserCode || generatedId }));

        setTimeout(() => {
          userIdSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        alert('✅ Registration successful! Redirecting...');
        
        setTimeout(() => {
          setIsRedirecting(true);
          setTimeout(() => {
            redirectBasedOnRole(role);
          }, 1200);
        }, 800);
      } else {
        throw new Error('No token received from server');
      }
    } catch (err) {
      console.error('Registration error:', err);
      let errorMsg = 'Registration failed. ';
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else {
        errorMsg = err.response?.data?.message || 'Please try again.';
      }
      alert(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // 🔥 LOGIN HANDLER WITH ROLE-BASED REDIRECT FIX
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
        const role = res.data.role || 'USER';
        
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('user_name', res.data.user_name || payload.username);
        localStorage.setItem('user_email', res.data.email || '');
        localStorage.setItem('user_code', res.data.user_code || '');
        localStorage.setItem('user_role', role);
        setUserRole(role);

        if (res.data.needs_password_reset) {
          setIsLoading(false);
          setLoadingMessage('');
          setMustUpdatePassword(true); 
          setUpdatePasswords(prev => ({ ...prev, currentPassword: loginData.password })); 
          return; 
        }

        alert('✅ Login successful! Redirecting...');
        
        // 🚀 ROLE BASED REDIRECT CALL
        redirectBasedOnRole(role);

      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMsg = err.response?.data?.detail || 'Invalid login credentials';
      alert(`❌ ${errorMsg}`);
    } finally {
      if (!mustUpdatePassword) {
        setIsLoading(false);
        setLoadingMessage('');
      }
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const country = getCurrentCountryConfig();
    
    if (value.length <= country.maxLength) {
      handleInputChange({ target: { name: 'phone', value } });
      validatePhoneNumber(value);
    }
  };

  const handleCountryChange = (country) => {
    setSelectedCountryCode(country.code);
    setShowCountryDropdown(false);
    setFormData(prev => ({ ...prev, phone: '' }));
    setPhoneError('');
  };

  const handleForceUpdateSubmit = async (e) => {
    e.preventDefault();
    if (updatePasswords.newPassword !== updatePasswords.confirmNewPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (updatePasswords.newPassword.length < 6) {
      alert("Password must be longer");
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Updating forced password reset rule...');

    try {
      await api.put('auth/force-update-password/', {
        old_password: updatePasswords.currentPassword,
        new_password: updatePasswords.newPassword
      });
      alert('Password updated successfully! Logged in.');
      setMustUpdatePassword(false);
      
      const storedRole = localStorage.getItem('user_role') || 'USER';
      redirectBasedOnRole(storedRole);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed updating');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 INVITATION ACCEPTANCE WITH ROLE-BASED REDIRECT FIX
  const handleAcceptInvitation = async (e) => {
    e.preventDefault();

    if (!invitationData?.token && !invitationToken) {
      alert('Invitation token is missing');
      return;
    }

    if (!invitationForm.name.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!invitationForm.password || invitationForm.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    if (invitationForm.password !== invitationForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Creating your account...');

    try {
      const res = await api.post('/roles/accept/', {
        token: invitationData?.token || invitationToken,
        name: invitationForm.name.trim(),
        password: invitationForm.password
      });

      if (res.data?.token) {
        const assignedRole = res.data.user?.role || invitationData?.role || 'USER';

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('user_email', res.data.user?.email || invitationData?.principal_email || '');
        localStorage.setItem('user_name', res.data.user?.name || invitationForm.name.trim());
        localStorage.setItem('user_role', assignedRole);
        setUserRole(assignedRole);
        
        alert('Invitation accepted successfully');
        
        // 🚀 REDIRECT DEPENDING ON INVITATION ROLE (TRAINER / ADMIN / USER)
        redirectBasedOnRole(assignedRole);
      } else {
        throw new Error('No authentication token returned');
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to accept invitation');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountryDropdown && !event.target.closest('.country-code-selector')) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showCountryDropdown]);

  const getRoleBadgeColor = (role) => {
    const roleMap = {
      'ADMIN': '#7c3aed',
      'TRAINER': '#d97706',
      'USER': '#10b981',
    };
    return roleMap[role] || '#6b7280';
  };

  const getRoleIcon = (role) => {
    const iconMap = {
      'ADMIN': '🛡️',
      'TRAINER': '🏋️‍♂️',
      'USER': '👤',
    };
    return iconMap[role] || '👤';
  };

  const getRoleDescription = (role) => {
    const descMap = {
      'ADMIN': 'You have administrative access to manage users and system settings.',
      'TRAINER': 'Trainer access with permissions to view clients and fitness modules.',
      'USER': 'Standard user with access to all wellness features.',
    };
    return descMap[role] || 'Standard user with access to all wellness features.';
  };

  const currentCountry = getCurrentCountryConfig();

  if (invitationToken) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
        padding: '24px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '560px',
          background: '#fff',
          borderRadius: '24px',
          boxShadow: '0 28px 80px rgba(15, 23, 42, 0.12)',
          overflow: 'hidden',
          border: '1px solid rgba(148, 163, 184, 0.18)'
        }}>
          <div style={{
            padding: '26px 28px',
            background: 'linear-gradient(135deg, #111827 0%, #4f46e5 100%)',
            color: '#fff'
          }}>
            <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '11px', fontWeight: 800, opacity: 0.8 }}>
              Invitation
            </div>
            <h1 style={{ margin: '8px 0 6px', fontSize: '28px', lineHeight: 1.05 }}>Accept your invite</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6 }}>
              Create your account to join Lernevo with the role assigned by your admin.
            </p>
          </div>

          <div style={{ padding: '28px' }}>
            {invitationLoading ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Loader2 size={38} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
                <div>Loading invitation...</div>
              </div>
            ) : invitationError ? (
              <div style={{
                padding: '18px',
                borderRadius: '16px',
                background: '#fef2f2',
                color: '#b91c1c',
                fontWeight: 700
              }}>
                {invitationError}
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gap: '10px',
                  marginBottom: '20px',
                  padding: '16px',
                  borderRadius: '18px',
                  background: '#f8fafc',
                  border: '1px solid rgba(148, 163, 184, 0.18)'
                }}>
                  <div><strong>Email:</strong> {invitationData?.principal_email || '-'}</div>
                  <div><strong>Role:</strong> {invitationData?.role || 'USER'}</div>
                </div>

                <form onSubmit={handleAcceptInvitation} style={{ display: 'grid', gap: '14px' }}>
                  <label style={{ display: 'grid', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Name</span>
                    <input
                      type="text"
                      value={invitationForm.name}
                      onChange={(e) => setInvitationForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your name"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '13px 14px',
                        borderRadius: '14px',
                        border: '1px solid #cbd5e1',
                        outline: 'none'
                      }}
                      required
                    />
                  </label>
                  <label style={{ display: 'grid', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Password</span>
                    <input
                      type="password"
                      value={invitationForm.password}
                      onChange={(e) => setInvitationForm((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Create a strong password"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '13px 14px',
                        borderRadius: '14px',
                        border: '1px solid #cbd5e1',
                        outline: 'none'
                      }}
                      required
                    />
                  </label>
                  <label style={{ display: 'grid', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Confirm Password</span>
                    <input
                      type="password"
                      value={invitationForm.confirmPassword}
                      onChange={(e) => setInvitationForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm password"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '13px 14px',
                        borderRadius: '14px',
                        border: '1px solid #cbd5e1',
                        outline: 'none'
                      }}
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    style={{
                      marginTop: '6px',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '15px',
                      cursor: 'pointer'
                    }}
                  >
                    Create Account
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-container">
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
            {mustUpdatePassword ? (
              <form className="login-form step-fade-in" onSubmit={handleForceUpdateSubmit}>
                <h3 style={{ marginBottom: '5px' }}>Strict Password Reset Required</h3>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
                  An administrator has initiated a hard reset on your profile. You must change your temporary password now.
                </p>

                <div className="input-group">
                  <label>Current Temporary Password</label>
                  <input 
                    type="password" 
                    value={updatePasswords.currentPassword} 
                    onChange={(e) => setUpdatePasswords({ ...updatePasswords, currentPassword: e.target.value })} 
                    required 
                  />
                </div>

                <div className="input-group">
                  <label>New Secure Password</label>
                  <input 
                    type="password" 
                    placeholder="Min 8 characters" 
                    value={updatePasswords.newPassword} 
                    onChange={(e) => setUpdatePasswords({ ...updatePasswords, newPassword: e.target.value })} 
                    required 
                  />
                </div>

                <div className="input-group">
                  <label>Confirm New Secure Password</label>
                  <input 
                    type="password" 
                    placeholder="Repeat password" 
                    value={updatePasswords.confirmNewPassword} 
                    onChange={(e) => setUpdatePasswords({ ...updatePasswords, confirmNewPassword: e.target.value })} 
                    required 
                  />
                </div>

                <button type="submit" className="login-btn primary">Update Password & Login</button>
              </form>
            ) : isLogin ? (
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
            ) : (
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
                        <div className="phone-input-wrapper">
                          <div className="country-code-selector">
                            <button 
                              type="button"
                              className="country-code-btn"
                              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                              disabled={isLoading}
                            >
                              <span className="flag-emoji">{currentCountry.flag}</span>
                              <span className="code-text">{selectedCountryCode}</span>
                              <span className="dropdown-arrow">▼</span>
                            </button>
                            {showCountryDropdown && (
                              <div className="country-dropdown">
                                {countryCodes.map((country) => (
                                  <button
                                    key={country.code}
                                    type="button"
                                    className="country-option"
                                    onClick={() => handleCountryChange(country)}
                                  >
                                    <span className="flag-emoji">{country.flag}</span>
                                    <span className="country-name">{country.country}</span>
                                    <span className="country-code">{country.code}</span>
                                    <span className="phone-length">{country.minLength}{country.minLength !== country.maxLength ? `-${country.maxLength}` : ''} digits</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="phone-input-field">
                            <input
                              type="tel"
                              name="phone"
                              placeholder={`Enter ${currentCountry.minLength}${currentCountry.minLength !== currentCountry.maxLength ? `-${currentCountry.maxLength}` : ''} digits`}
                              value={formData.phone}
                              onChange={handlePhoneChange}
                              disabled={isLoading}
                            />
                            {currentCountry.example && formData.phone && (
                              <div className="phone-example">
                                Example: {currentCountry.example}
                              </div>
                            )}
                          </div>
                        </div>
                        {phoneError && (
                          <span className="error-text">{phoneError}</span>
                        )}
                        {formData.phone && !phoneError && !phoneAvailable && !isCheckingAvailability && formData.phone.length >= currentCountry.minLength && (
                          <span className="error-text">Phone number already registered</span>
                        )}
                        {formData.phone && !phoneError && phoneAvailable && !isCheckingAvailability && formData.phone.length >= currentCountry.minLength && (
                          <span className="success-text">✓ Phone number available</span>
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
                    <div className="input-group">
                      <label>Role</label>
                      <select 
                        name="role" 
                        value={formData.role} 
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="role-select-dropdown"
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #ccc',
                          backgroundColor: 'white',
                          fontSize: '14px'
                        }}
                      >
                        <option value="USER">User</option>
                        <option value="TRAINER">Trainer</option>
                        <option value="ADMIN">Admin</option>
                      </select>
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
                            
                            <div className="role-display-container">
                              <div className="role-badge">
                                <span className="role-icon">{getRoleIcon(userRole)}</span>
                                <span className="role-label">Your Role:</span>
                                <span 
                                  className={`role-value ${userRole.toLowerCase()}`}
                                  style={{
                                    backgroundColor: getRoleBadgeColor(userRole),
                                    color: 'white'
                                  }}
                                >
                                  {userRole}
                                </span>
                              </div>
                              <p className="role-description">
                                {getRoleDescription(userRole)}
                              </p>
                              {userRole === 'ADMIN' && (
                                <div className="role-admin-badge">
                                  ⚡ You have admin privileges - You can manage users from the admin panel
                                </div>
                              )}
                            </div>
                            
                            {isRedirecting && (
                              <p className="redirect-text">
                                Redirecting you to {userRole === 'TRAINER' ? 'Trainer Dashboard' : userRole === 'ADMIN' ? 'Admin Dashboard' : 'Home'}...
                              </p>
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