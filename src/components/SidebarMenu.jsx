import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './SidebarMenu.css';

const SidebarMenu = ({ isOpen, onClose }) => {
  const [theme, setTheme] = useState(localStorage.getItem('kwamjum_theme') || 'dark');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kwamjum_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleItemClick = (itemName) => {
    alert(`The "${itemName}" feature is coming soon!`);
    onClose();
  };

  const goToAccount = () => {
    onClose();
    navigate('/account');
  };

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose} 
      />
      
      <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Kwamjum</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <nav className="sidebar-nav">
          <button className="menu-item" onClick={toggleTheme}>
            <span className={`icon theme-icon ${theme === 'light' ? 'is-light' : ''}`}>
              {theme === 'light' ? '☀️' : '🌙'}
            </span>
            {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="menu-item" onClick={() => handleItemClick('Settings')}>
            <span className="icon">⚙️</span>
            Settings
          </button>
          <button className="menu-item" onClick={() => handleItemClick('Info')}>
            <span className="icon">ℹ️</span>
            Info
          </button>
          <button className="menu-item" onClick={() => handleItemClick('Help and Feedback')}>
            <span className="icon">❓</span>
            Help and Feedback
          </button>
        </nav>
        
        <div className="sidebar-account-section">
          <div className="account-info" onClick={goToAccount} style={{ cursor: 'pointer' }} title="Go to Account Settings">
            <span className="icon">👤</span>
            <div className="account-details">
              <span className="account-title">Account</span>
              <span className="account-email">{user?.email}</span>
            </div>
          </div>
          <button className="logout-btn-sidebar" onClick={signOut}>
            <span className="icon">🚪</span>
            Log Out
          </button>
        </div>
        
        <div className="sidebar-footer">
          <p>Kwamjum v1.0.0 (Production)</p>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
