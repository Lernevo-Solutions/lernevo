import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";
import "./ResetPasswordConfirmPage.css"; // Import the CSS

const ResetPasswordConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email");
  const otp = searchParams.get("otp");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password strength checker
  const checkPasswordStrength = (pass) => {
    if (pass.length === 0) return { strength: "", label: "" };
    if (pass.length < 6) return { strength: "weak", label: "Weak" };
    
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    
    let score = 0;
    if (pass.length >= 8) score++;
    if (hasLetter) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    if (pass.length >= 12) score++;
    
    if (score <= 2) return { strength: "weak", label: "Weak" };
    if (score <= 4) return { strength: "medium", label: "Medium" };
    return { strength: "strong", label: "Strong" };
  };

  const passwordStrength = checkPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      await api.post("/password-reset-confirm/", {
        email,
        otp,
        new_password: password,
      });

      setSuccess("Password reset successfully! Redirecting to login...");
      
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        navigate("/get-started?mode=login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        err.response?.data?.error || 
        "Reset link invalid or expired. Please request a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!email || !otp) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <h2>Invalid Reset Link</h2>
            <p>The password reset link is invalid or has expired. Please request a new password reset.</p>
            <button 
              className="reset-button" 
              onClick={() => navigate("/forgot-password")}
              style={{ marginTop: "20px" }}
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h2>Set New Password</h2>
          <p>Enter a strong password for your account</p>
        </div>

        <form className="reset-password-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="password-input"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            
            {password && (
              <div className="password-strength">
                <span>Strength: {passwordStrength.label}</span>
                <div className="strength-bar">
                  <div className={`strength-fill strength-${passwordStrength.strength}`} />
                </div>
              </div>
            )}
          </div>

          <div className="input-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="password-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button 
            type="submit" 
            className="reset-button" 
            disabled={loading || passwordStrength.strength === "weak"}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordConfirmPage;