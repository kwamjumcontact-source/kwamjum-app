import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import './Sidebar.css';

const Sidebar = ({ currentView, setCurrentView, user, isCollapsed, onToggle }) => {
  const navigate = useNavigate();
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
