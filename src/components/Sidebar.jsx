import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChartBar, Books, ChartLineUp, Sun, Moon, ChatCircleText, Gear, List, X, Brain } from '@phosphor-icons/react';
import './Sidebar.css';

const APP_VERSION = '3.0.0';

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

  const isEffectivelyCollapsed = isCollapsed && !isOpenOnMobile;

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: ChartBar },
    { id: 'library', label: 'My Decks', icon: Books },
    { id: 'stats', label: 'Statistics', icon: ChartLineUp },
  ];

  return (
    <>
      <nav 
        className={`permanent-sidebar ${isEffectivelyCollapsed ? 'collapsed' : ''} ${isOpenOnMobile ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="sidebar-brand">
          <button 
            className="collapse-btn" 
            onClick={isOpenOnMobile ? onCloseMobile : onToggle}
            aria-label={isOpenOnMobile ? 'Close menu' : (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar')}
            aria-expanded={!isEffectivelyCollapsed}
          >
            {isOpenOnMobile ? <X size={22} /> : <List size={22} />}
          </button>
          {!isEffectivelyCollapsed && (
            <div className="brand-lockup">
              <Brain size={24} weight="fill" className="brand-icon" />
              <h2>Kwamjum</h2>
            </div>
          )}
        </div>

        <div className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-icon">
                  <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                </span>
                {!isEffectivelyCollapsed && <span className="nav-label">{item.label}</span>}
              </button>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <button 
            className="nav-btn theme-toggle-btn" 
            title="Toggle Theme"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="nav-icon">{theme === 'light' ? <Sun size={22} weight="fill" /> : <Moon size={22} weight="fill" />}</span>
            {!isEffectivelyCollapsed && <span className="nav-label">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button 
            className="nav-btn feedback-btn" 
            title="Send Feedback"
            onClick={() => navigate('/help')}
          >
            <span className="nav-icon"><ChatCircleText size={22} /></span>
            {!isEffectivelyCollapsed && <span className="nav-label">Feedback</span>}
          </button>

          <button 
            className="nav-btn settings-btn" 
            title="Settings"
            onClick={() => navigate('/account')}
          >
            <span className="nav-icon"><Gear size={22} /></span>
            {!isEffectivelyCollapsed && <span className="nav-label">Settings</span>}
          </button>

          <div className="sidebar-divider"></div>
          
          <div className="user-profile-mini">
            <div className="avatar">
              {userProfile?.avatar || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!isEffectivelyCollapsed && (
              <div className="user-details">
                <span className="user-name">{userProfile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</span>
                <span className="user-email">{user?.email}</span>
              </div>
            )}
          </div>

          {!isEffectivelyCollapsed && (
            <div className="version-badge">v{APP_VERSION}</div>
          )}
        </div>
      </nav>
      {isOpenOnMobile && <div className="mobile-overlay" onClick={onCloseMobile} aria-hidden="true"></div>}
    </>
  );
};

export default Sidebar;
