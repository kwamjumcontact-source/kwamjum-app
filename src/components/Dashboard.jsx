import React, { useState } from 'react';
import SidebarMenu from './SidebarMenu';
import './Dashboard.css';

const Dashboard = ({ decks, startStudy, totalStudied, dailyGoal = 20, onNewDeck, onEditDeck, onViewStats, streak }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)}>
              ☰
            </button>
            <div>
              <div className="app-branding" style={{color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px'}}>
                Kwamjum
              </div>
              <h1 className="greeting">Welcome back! 👋</h1>
              <p className="subtitle">Ready to learn something new today?</p>
            </div>
          </div>
          <div className="global-stats" style={{ cursor: 'pointer' }} onClick={onViewStats} title="View Detailed Stats">
          <div className="stat-box">
            <span className="stat-value">{totalStudied} <span style={{fontSize: '14px', color: 'var(--text-secondary)'}}>/ {dailyGoal}</span></span>
            <span className="stat-label">Reviewed</span>
          </div>
          <div className="stat-box streak-box">
            <span className="stat-value">🔥 {streak}</span>
            <span className="stat-label">Day Streak</span>
          </div>
        </div>
      </header>

      <section className="decks-section">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Your Decks</h2>
          <button className="new-deck-btn" onClick={onNewDeck} style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            + New Deck
          </button>
        </div>
        
        <div className="decks-grid">
          {decks.map(deck => (
            <div 
              key={deck.id} 
              className="deck-card"
              style={{ '--deck-color': deck.color }}
            >
              <div className="deck-info" onClick={() => deck.cards.length > 0 ? startStudy(deck.id) : null} style={{ cursor: 'pointer', flex: 1 }}>
                <h3>{deck.title}</h3>
                <p>{deck.description}</p>
              </div>
              <div className="deck-footer" style={{ gap: '15px' }}>
                <div className="deck-stats">
                  <span className={`due-badge ${deck.dueToday > 0 ? 'has-due' : ''}`}>
                    {deck.dueToday} Due
                  </span>
                  <span className="total-badge">{deck.cards.length} Total</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEditDeck(deck); }}
                    style={{ background: 'var(--hover-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: '500' }}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className={`start-btn ${deck.cards.length === 0 ? 'disabled' : ''}`}
                    disabled={deck.cards.length === 0}
                    onClick={() => startStudy(deck.id)}
                  >
                    {deck.cards.length > 0 ? 'Study' : 'Empty'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {decks.length === 0 && (
            <p style={{ color: 'var(--text-secondary)' }}>You don't have any decks yet. Create one!</p>
          )}
        </div>
      </section>
    </div>
    </>
  );
};

export default Dashboard;
