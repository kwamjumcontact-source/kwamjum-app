import React from 'react';
import './Sidebar.css';

const Sidebar = ({ currentView, setCurrentView, user, isCollapsed, onToggle }) => {
  return (
    <div className={`permanent-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <button className="collapse-btn" onClick={onToggle}>☰</button>
        {!isCollapsed && <h2>Kwamjum</h2>}
      </div>

      <div className="sidebar-nav">
        <button 
          className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
          title="Overview"
        >
          <span className="nav-icon">📊</span>
          {!isCollapsed && "Overview"}
        </button>
        
        <button 
          className={`nav-btn ${currentView === 'library' ? 'active' : ''}`}
          onClick={() => setCurrentView('library')}
          title="My Decks"
        >
          <span className="nav-icon">📚</span>
          {!isCollapsed && "My Decks"}
        </button>

        <button 
          className={`nav-btn ${currentView === 'stats' ? 'active' : ''}`}
          onClick={() => setCurrentView('stats')}
          title="Statistics"
        >
          <span className="nav-icon">📈</span>
          {!isCollapsed && "Statistics"}
        </button>
      </div>

      <div className="sidebar-footer">
        <a 
          href="mailto:support@kwamjum.com?subject=Kwamjum%20Feedback" 
          className="nav-btn feedback-btn" 
          title="Send Feedback"
          style={{ textDecoration: 'none', display: 'flex' }}
        >
          <span className="nav-icon">💬</span>
          {!isCollapsed && "Send Feedback"}
        </a>
        
        <div className="user-profile-mini">
          <div className="avatar">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <span className="user-name">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
