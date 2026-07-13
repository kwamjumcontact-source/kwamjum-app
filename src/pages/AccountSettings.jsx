import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../lib/db';
import { useNavigate } from 'react-router-dom';
import './AccountSettings.css';

const AVATARS = ['🐶', '🐱', '🐼', '🦊', '🐧', '🐨', '🐯', '🦁', '🐵', '🐸', '🦄', '🐙'];

const AccountSettings = () => {
  const { user, updateProfileContext } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ 
    username: '', 
    avatar: '🐶',
    daily_goal: 20,
    max_reviews_per_day: 100,
    max_interval_days: 365,
    ui_theme: 'dark',
    font_size: 'medium',
    auto_flip_seconds: 0
  });
  const [loading, setLoading] = useState(true);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const data = await getProfile(user.id);
      if (data) {
        setProfile({
          ...profile,
          ...data
        });
        setNewUsername(data.username);
        // Apply theme/font immediately if loaded
        if (data.ui_theme) {
          document.documentElement.setAttribute('data-theme', data.ui_theme);
          localStorage.setItem('kwamjum_theme', data.ui_theme);
        }
        if (data.font_size) {
          document.documentElement.setAttribute('data-font-size', data.font_size);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = async (emoji) => {
    const updated = { ...profile, avatar: emoji };
    setProfile(updated);
    updateProfileContext(updated);
    await updateProfile(user.id, { avatar: emoji });
  };

  const handleSaveUsername = async () => {
    const updated = { ...profile, username: newUsername };
    setProfile(updated);
    updateProfileContext(updated);
    setIsEditingUsername(false);
    await updateProfile(user.id, { username: newUsername });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(user.id, {
        daily_goal: profile.daily_goal,
        max_reviews_per_day: profile.max_reviews_per_day,
        max_interval_days: profile.max_interval_days,
        ui_theme: profile.ui_theme,
        font_size: profile.font_size,
        auto_flip_seconds: profile.auto_flip_seconds
      });
      // Update global context so other parts of the UI update instantly
      updateProfileContext({
        ...profile,
        daily_goal: profile.daily_goal,
        max_reviews_per_day: profile.max_reviews_per_day,
        max_interval_days: profile.max_interval_days,
        ui_theme: profile.ui_theme,
        font_size: profile.font_size,
        auto_flip_seconds: profile.auto_flip_seconds
      });
      
      // Apply theme locally immediately
      document.documentElement.setAttribute('data-theme', profile.ui_theme);
      localStorage.setItem('kwamjum_theme', profile.ui_theme);
      document.documentElement.setAttribute('data-font-size', profile.font_size);

      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="account-loading">Loading...</div>;

  return (
    <div className="account-page">
      <div className="account-header-nav">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      <h1 className="account-page-title">Settings</h1>

      <div className="account-card">
        
        {/* Profile Picture Section */}
        <div className="account-section avatar-section">
          <div className="avatar-header">
            <h3>Profile picture</h3>
          </div>
          <div className="avatar-content">
            <div className="current-avatar">
              <span className="emoji">{profile.avatar}</span>
            </div>
            <div className="avatar-grid">
              {AVATARS.map((emoji) => (
                <button 
                  key={emoji} 
                  className={`avatar-option ${profile.avatar === emoji ? 'selected' : ''}`}
                  onClick={() => handleAvatarSelect(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Account Info Section */}
        <div className="account-section">
          <h3>Account Information</h3>
          <div className="info-content" style={{ marginTop: '15px' }}>
            <span className="info-label">Username</span>
            {isEditingUsername ? (
              <div className="edit-input-group">
                <input 
                  type="text" 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="edit-input"
                  autoFocus
                />
                <button onClick={handleSaveUsername} className="save-btn">Save</button>
                <button onClick={() => setIsEditingUsername(false)} className="cancel-btn">Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span className="info-value">{profile.username || 'Not set'}</span>
                <button className="edit-btn" onClick={() => setIsEditingUsername(true)}>Edit</button>
              </div>
            )}
          </div>
          
          <div className="info-content" style={{ marginTop: '15px' }}>
            <span className="info-label">Email</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span className="info-value">{user?.email}</span>
              <button className="edit-btn" disabled title="Email cannot be changed here">Edit</button>
            </div>
          </div>
        </div>

        {/* Global Settings Form */}
        <form onSubmit={handleSaveSettings}>
          
          <div className="account-section">
            <h3>Study Preferences</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label>Daily New Cards Goal</label>
                <input type="number" name="daily_goal" value={profile.daily_goal} onChange={handleChange} min="1" max="500" />
                <p className="setting-hint">Target number of cards to study per day.</p>
              </div>
              
              <div className="setting-item">
                <label>Max Reviews / Day</label>
                <input type="number" name="max_reviews_per_day" value={profile.max_reviews_per_day} onChange={handleChange} min="10" max="2000" />
                <p className="setting-hint">Maximum old cards to review daily.</p>
              </div>
              
              <div className="setting-item">
                <label>Auto-flip (seconds)</label>
                <input type="number" name="auto_flip_seconds" value={profile.auto_flip_seconds} onChange={handleChange} min="0" max="60" />
                <p className="setting-hint">Set to 0 to disable automatic flipping.</p>
              </div>
            </div>
          </div>

          <div className="account-section">
            <h3>Algorithm Tuning</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label>Max Interval (Days)</label>
                <input type="number" name="max_interval_days" value={profile.max_interval_days} onChange={handleChange} min="30" max="36500" />
                <p className="setting-hint">Cap the maximum wait time for a well-known card.</p>
              </div>
            </div>
          </div>

          <div className="account-section">
            <h3>Appearance</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label>UI Theme</label>
                <select name="ui_theme" value={profile.ui_theme} onChange={handleChange}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              
              <div className="setting-item">
                <label>Font Size</label>
                <select name="font_size" value={profile.font_size} onChange={handleChange}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="submit" className="save-settings-btn" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AccountSettings;
