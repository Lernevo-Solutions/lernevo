import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';
import './ProfileLayout.css';

const ProfileLayout = ({ children, title, subtitle, backTo = '/', backText = 'Back to Home', showBack = true }) => {
  const navigate = useNavigate();

  return (
    <div className="profile-layout-container">
      <Navbar />
      <div className="profile-layout-content">
        <div className="profile-layout-card-wrapper">
          {showBack && (
            <button className="profile-layout-back-link" onClick={() => navigate(backTo)}>
              <ArrowLeft size={18} /> {backText}
            </button>
          )}
          
          <div className="profile-layout-card">
            {(title || subtitle) && (
              <div className="profile-layout-header">
                {title && <h1 className="profile-layout-title">{title}</h1>}
                {subtitle && <p className="profile-layout-subtitle">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
