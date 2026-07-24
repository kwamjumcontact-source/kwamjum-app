import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Auth.css'; // Reuse auth styling

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user has an active session (which happens automatically after clicking the reset link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('Invalid or expired reset link. Please try resetting your password again.');
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;
      
      alert('Password updated successfully! You can now access your account.');
      navigate('/dashboard');
    } catch (err) {
      const rawMsg = err.message || '';
      const msg = rawMsg.includes('Failed to fetch')
        ? 'Cannot connect to database server. Please check your network connection or Supabase URL.'
        : (rawMsg || 'Error updating password.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-brand">KWAMJUM</h1>
        <h2 className="auth-title">Set New Password</h2>
        
        {error ? (
          <div className="auth-error">
            {error}
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => navigate('/login')} className="toggle-btn" style={{ fontSize: '14px' }}>
                Go to Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                placeholder="Min 6 characters"
              />
            </div>
            
            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                placeholder="Type password again"
              />
            </div>
            
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
