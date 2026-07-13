import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Extra fields for Sign Up
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email address');
    
    setLoading(true);
    setError('');
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      setError(err.message || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/dashboard');
      } else {
        // Pass extra metadata (username, date_of_birth)
        const { error } = await signUp(email, password, {
          username: username,
          date_of_birth: dob
        });
        if (error) throw error;
        alert('Registration successful! You can now log in.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-brand">KWAMJUM</h1>
        <h2 className="auth-title">
          {isForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create an Account')}
        </h2>
        
        {error && <div className="auth-error">{error}</div>}
        {resetSent && <div className="auth-success" style={{ color: '#10b981', marginBottom: '15px', textAlign: 'center' }}>Check your email for the reset link!</div>}
        
        {isForgotPassword ? (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="auth-toggle" style={{ marginTop: '15px' }}>
              <button type="button" onClick={() => { setIsForgotPassword(false); setResetSent(false); }} className="toggle-btn">
                Back to Login
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
            <>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  placeholder="e.g. Kong292"
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input 
                  type="date" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)} 
                  required 
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Min 6 characters"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                placeholder="Type password again"
              />
            </div>
          )}
          
          {isLogin && (
            <div style={{ textAlign: 'right', marginBottom: '15px' }}>
              <button 
                type="button" 
                className="toggle-btn" 
                style={{ fontSize: '12px' }}
                onClick={() => setIsForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </div>
          )}
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        )}
        
        {!isForgotPassword && (
          <p className="auth-toggle">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;
