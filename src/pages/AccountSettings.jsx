import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './AccountSettings.css';

const AVATARS = ['🐶', '🐱', '🐼', '🦊', '🐧', '🐨', '🐯', '🦁', '🐵', '🐸', '🦄', '🐙'];

const AccountSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ username: '', avatar: '🐶' });
  const [loading, setLoading] = useState(true);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      if (data) {
        setProfile(data);
        setNewUsername(data.username);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = async (emoji) => {
    setProfile({ ...profile, avatar: emoji });
    await supabase.from('profiles').update({ avatar: emoji }).eq('id', user.id);
  };

  const handleSaveUsername = async () => {
    setProfile({ ...profile, username: newUsername });
    setIsEditingUsername(false);
    await supabase.from('profiles').update({ username: newUsername }).eq('id', user.id);
  };

  if (loading) return <div className="account-loading">Loading...</div>;

  return (
    <div className="account-page">
      <div className="account-header-nav">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      <h1 className="account-page-title">Personal Information</h1>

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

        {/* Username Section */}
        <div className="account-section info-section">
          <div className="info-content">
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
              <span className="info-value">{profile.username || 'Not set'}</span>
            )}
          </div>
          {!isEditingUsername && (
            <button className="edit-btn" onClick={() => setIsEditingUsername(true)}>Edit</button>
          )}
        </div>

        {/* Email Section */}
        <div className="account-section info-section">
          <div className="info-content">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <button className="edit-btn" disabled title="Email cannot be changed here">Edit</button>
        </div>

      </div>
    </div>
  );
};

export default AccountSettings;
