import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './GetStartedFlow.css';
import api from '../api';

const GetStartedFlow = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null); // 'email' or 'phone'
  const [inputValue, setInputValue] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const otpRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (step === 3 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod);
    setStep(2);
  };

const handleSendOTP = async () => {
  if (!inputValue) return;

  try {
    const response = await api.post('/otp/', { email: inputValue });
    if (response.status === 200) {
      setStep(3); // OTP sent successfully — next step போ
    }
  } catch (error) {
    const msg = error.response?.data?.detail || 'Failed to send OTP';
    alert(msg);
  }
};

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

const handleVerify = async () => {
  if (!otp.every(digit => digit !== '')) return;

  const otpCode = otp.join('');

  try {
    const response = await api.post('/otp/', {
      email: inputValue,
      otp: otpCode,
    });
    if (response.status === 200) {
      setStep(4); // Verified — next step போ
    }
  } catch (error) {
    const msg = error.response?.data?.detail || 'Invalid OTP';
    alert(msg);
  }
};

  const resetFlow = () => {
    setStep(1);
    setMethod(null);
    setInputValue('');
    setOtp(['', '', '', '', '', '']);
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flow-step fade-in">
            <h2 className="flow-title">Welcome to Lernevo</h2>
            <p className="flow-subtitle">Start your personalized wellness journey</p>
            <div className="method-cards">
              <div className="method-card" onClick={() => handleMethodSelect('email')}>
                <div className="method-icon">
                  <Mail size={24} />
                </div>
                <span>Continue with Email</span>
              </div>
              <div className="method-card" onClick={() => handleMethodSelect('phone')}>
                <div className="method-icon">
                  <Phone size={24} />
                </div>
                <span>Continue with Phone</span>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flow-step slide-up">
            <button className="back-btn" onClick={() => setStep(1)}>
              <ArrowLeft size={20} />
            </button>
            <h2 className="flow-title">
              {method === 'email' ? 'What\'s your email?' : 'What\'s your number?'}
            </h2>
            <div className="input-container">
              {method === 'email' ? (
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoFocus
                  className="flow-input"
                />
              ) : (
                <div className="phone-input-wrapper">
                  <span className="country-code">+91</span>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    autoFocus
                    className="flow-input"
                  />
                </div>
              )}
            </div>
            <p className="helper-text">We'll send a 6-digit OTP to verify you.</p>
            <button 
              className="flow-cta-btn" 
              onClick={handleSendOTP}
              disabled={!inputValue}
            >
              Send OTP
            </button>
          </div>
        );
      case 3:
        return (
          <div className="flow-step slide-up">
            <button className="back-btn" onClick={() => setStep(2)}>
              <ArrowLeft size={20} />
            </button>
            <h2 className="flow-title">Verify it's you</h2>
            <p className="flow-subtitle">Enter the code sent to {inputValue}</p>
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="otp-input"
                />
              ))}
            </div>
            <div className="otp-footer">
              {timer > 0 ? (
                <p className="timer-text">Resend in {timer}s</p>
              ) : (
                <button className="resend-btn" onClick={() => setTimer(30)}>
                  Resend OTP
                </button>
              )}
            </div>
            <button 
              className="flow-cta-btn" 
              onClick={handleVerify}
              disabled={!otp.every(digit => digit !== '')}
            >
              Verify & Continue
            </button>
          </div>
        );
      case 4:
        return (
          <div className="flow-step success-step scale-in">
            <div className="success-icon-wrapper">
              <CheckCircle2 size={80} color="#3b82f6" />
            </div>
            <h2 className="flow-title">You're in!</h2>
            <p className="flow-subtitle">Let's get started on your wellness journey.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flow-overlay" onClick={resetFlow}>
      <div className="flow-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={resetFlow}>
          <X size={24} />
        </button>
        <div className="flow-content">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default GetStartedFlow;
