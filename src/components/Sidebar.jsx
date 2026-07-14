import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ currentView, setCurrentView, user, isCollapsed, onToggle, isOpenOnMobile, onCloseMobile }) => {
  const navigate = useNavigate();
  const { signOut, userProfile } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('kwamjum_theme') || 'dark');

  useEffect(() => {
    // Sync with userProfile if available on load
    if (userProfile?.ui_theme && userProfile.ui_theme !== theme) {
      setTheme(userProfile.ui_theme);
    }
  }, [userProfile?.ui_theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kwamjum_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleNavClick = (view) => {
    setCurrentView(view);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      <div className={`permanent-sidebar ${isCollapsed ? 'collapsed' : ''} ${isOpenOnMobile ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <button className="collapse-btn" onClick={onToggle}>☰</button>
        {!isCollapsed && <h2>Kwamjum</h2>}
      </div>

      <div className="sidebar-nav">
        <button 
          className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavClick('dashboard')}
          title="Overview"
        >
          <span className="nav-icon">📊</span>
          {!isCollapsed && "Overview"}
        </button>
        
        <button 
          className={`nav-btn ${currentView === 'library' ? 'active' : ''}`}
          onClick={() => handleNavClick('library')}
          title="My Decks"
        >
          <span className="nav-icon">📚</span>
          {!isCollapsed && "My Decks"}
        </button>

        <button 
          className={`nav-btn ${currentView === 'stats' ? 'active' : ''}`}
          onClick={() => handleNavClick('stats')}
          title="Statistics"
        >
          <span className="nav-icon">📈</span>
          {!isCollapsed && "Statistics"}
        </button>
      </div>

      <div className="sidebar-footer">
        <button 
          className="nav-btn theme-toggle-btn" 
          title="Toggle Theme"
          onClick={toggleTheme}
        >
          <span className="nav-icon">{theme === 'light' ? '☀️' : '🌙'}</span>
          {!isCollapsed && (theme === 'light' ? 'Light Mode' : 'Dark Mode')}
        </button>
        <button 
          className="nav-btn feedback-btn" 
          title="Send Feedback"
          onClick={() => navigate('/help')}
        >
          <span className="nav-icon">💬</span>
          {!isCollapsed && "Send Feedback"}
        </button>

        <button 
          className="nav-btn settings-btn" 
          title="Settings"
          onClick={() => navigate('/account')}
          style={{ marginBottom: '20px' }}
        >
          <span className="nav-icon">⚙️</span>
          {!isCollapsed && "Settings"}
        </button>
        
        <div className="user-profile-mini">
          <div className="avatar">
            {userProfile?.avatar || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <span className="user-name">{userProfile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          )}
        </div>
        
        <button 
          className="nav-btn logout-btn" 
          title="Log Out"
          onClick={signOut}
          style={{ marginTop: '10px', color: '#f43f5e' }}
        >
          <span className="nav-icon">🚪</span>
          {!isCollapsed && "Log Out"}
        </button>
      </div>
    </div>
    {isOpenOnMobile && <div className="mobile-overlay" onClick={onCloseMobile}></div>}
    </>
  );
};

export default Sidebar;
