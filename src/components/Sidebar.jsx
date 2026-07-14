import React from 'react';
import './Sidebar.css';

const Sidebar = ({ currentView, setCurrentView, user }) => {
  return (
    <div className="permanent-sidebar">
      <div className="sidebar-brand">
        <h2>Kwamjum</h2>
      </div>

      <div className="sidebar-nav">
        <button 
          className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <span className="nav-icon">📊</span>
          Overview
        </button>
        
        <button 
          className={`nav-btn ${currentView === 'library' ? 'active' : ''}`}
          onClick={() => setCurrentView('library')}
        >
          <span className="nav-icon">📚</span>
          My Decks
        </button>

        <button 
          className={`nav-btn ${currentView === 'stats' ? 'active' : ''}`}
          onClick={() => setCurrentView('stats')}
        >
          <span className="nav-icon">📈</span>
          Statistics
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-mini">
          <div className="avatar">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
