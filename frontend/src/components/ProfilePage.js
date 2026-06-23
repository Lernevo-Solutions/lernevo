import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Shield, Pencil, Check, X, Camera } from 'lucide-react';
import ProfileLayout from './ProfileLayout';
import './ProfilePage.css';
import api from '../api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: localStorage.getItem('user_name') || 'User',
    email: 'loading...',
    phone: 'loading...',
    role: '',
    profileImage: localStorage.getItem('profile_image') || null
  });

  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/profile/', {
          headers: { Authorization: `Token ${token}` }
        });
        setUserData({
          username: response.data.username || localStorage.getItem('user_name'),
          email: response.data.email,
          phone: response.data.mobile || response.data.phone,
          role: response.data.role || localStorage.getItem('user_role') || 'USER'
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setUserData(prev => ({
          ...prev,
          email: 'Not available',
          phone: 'Not available'
        }));
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = (field, value) => {
    setEditingField(field);
    setEditValue(value || '');
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSave = async () => {
    if (!editingField) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {};
      if (editingField === 'username') payload.username = editValue;
      if (editingField === 'email') payload.email = editValue;
      if (editingField === 'phone') payload.mobile = editValue;

      const response = await api.put('/profile/', payload, {
        headers: { Authorization: `Token ${token}` }
      });

      setUserData(prev => ({
        ...prev,
        [editingField]: editingField === 'phone' ? (response.data.mobile || editValue) : (response.data[editingField] || editValue)
      }));

      if (editingField === 'username') {
        localStorage.setItem('user_name', editValue);
      }

      setMessage({ type: 'success', text: `${editingField.charAt(0).toUpperCase() + editingField.slice(1)} updated successfully!` });
      setEditingField(null);
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

 const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    setMessage({ type: 'error', text: 'Image size should be less than 2MB' });
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("profile_image", file);

    const response = await api.put(
      "/profile/upload-image/",
      formData,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // ✅ backend returns image URL
    const imageUrl = response.data.profile_image;

    setUserData(prev => ({
      ...prev,
      profileImage: imageUrl
    }));

    localStorage.setItem("profile_image", imageUrl);

    // Navbar update
    window.dispatchEvent(new Event("storage"));

    setMessage({ type: 'success', text: 'Profile picture updated successfully!' });

  } catch (error) {
    console.error("Image upload failed:", error);
    setMessage({ type: 'error', text: 'Failed to upload image' });
  }
};

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <ProfileLayout showBack={false}>
      {message.text && (
        <div className={`profile-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-header-content">
        <div className="profile-avatar-container">
          <div className="profile-avatar-large">
            {userData.profileImage ? (
              <img src={userData.profileImage} alt="Profile" className="avatar-image" />
            ) : (
              getInitial(userData.username)
            )}
          </div>
          <label htmlFor="avatar-upload" className="avatar-edit-badge">
            <Camera size={16} />
            <input 
              type="file" 
              id="avatar-upload" 
              accept="image/*" 
              onChange={handleImageChange} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
        <h1 className="profile-display-name">{userData.username}</h1>
        
        {/* ✅ FIXED: Pure authentic dynamically generated state verification look */}
        <span 
          className="profile-badge" 
          style={{
            textTransform: 'uppercase',
            fontWeight: '700',
            letterSpacing: '0.5px',
            backgroundColor: userData.role === 'ADMIN' ? '#7c3aed' : '#10b981',
            color: 'white',
            padding: '4px 14px',
            borderRadius: '12px',
            fontSize: '11px',
            display: 'inline-block',
            marginTop: '5px'
          }}
        >
          {userData.role ? userData.role : 'USER'}
        </span>
      </div>

      <div className="profile-details">
        <div className="detail-row">
          <div className="detail-label">
            <User size={18} />
            <span>Username</span>
          </div>
          <div className="detail-value-container">
            {editingField === 'username' ? (
              <div className="edit-input-group">
                <input 
                  type="text" 
                  value={editValue} 
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                />
                <button onClick={handleSave} disabled={loading} className="btn-save"><Check size={16} /></button>
                <button onClick={handleCancel} className="btn-cancel"><X size={16} /></button>
              </div>
            ) : (
              <div className="detail-value-row">
                <span className="detail-value">{userData.username}</span>
                <button className="btn-edit" onClick={() => handleEdit('username', userData.username)}>
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-label">
            <Mail size={18} />
            <span>Email Address</span>
          </div>
          <div className="detail-value-container">
            {editingField === 'email' ? (
              <div className="edit-input-group">
                <input 
                  type="email" 
                  value={editValue} 
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                />
                <button onClick={handleSave} disabled={loading} className="btn-save"><Check size={16} /></button>
                <button onClick={handleCancel} className="btn-cancel"><X size={16} /></button>
              </div>
            ) : (
              <div className="detail-value-row">
                <span className="detail-value">{userData.email}</span>
                <button className="btn-edit" onClick={() => handleEdit('email', userData.email)}>
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-label">
            <Phone size={18} />
            <span>Phone Number</span>
          </div>
          <div className="detail-value-container">
            {editingField === 'phone' ? (
              <div className="edit-input-group">
                <input 
                  type="text" 
                  value={editValue} 
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                />
                <button onClick={handleSave} disabled={loading} className="btn-save"><Check size={16} /></button>
                <button onClick={handleCancel} className="btn-cancel"><X size={16} /></button>
              </div>
            ) : (
              <div className="detail-value-row">
                <span className="detail-value">{userData.phone}</span>
                <button className="btn-edit" onClick={() => handleEdit('phone', userData.phone)}>
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="profile-actions-bottom">
        <button className="btn-done-changes" onClick={() => navigate('/')}>
          Done Changes
        </button>
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;
