import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import SidebarMenu from './SidebarMenu';
import ActivityHeatmap from './ActivityHeatmap';
import './Dashboard.css';

const Dashboard = ({ decks, startStudy, totalStudied, dailyGoal = 20, onNewDeck, onEditDeck, onViewStats, streak, reviewLogs }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 1. Calculate due cards
  const totalDueCards = decks.reduce((acc, deck) => acc + (deck.dueToday || 0), 0);
  const urgentDeck = decks.filter(d => d.dueToday > 0).sort((a, b) => b.dueToday - a.dueToday)[0];

  // 2. Card Statistics
  let newCards = 0;
  let learningCards = 0;
  let masteredCards = 0;
  let totalCardsCount = 0;

  decks.forEach(deck => {
    deck.cards.forEach(card => {
      totalCardsCount++;
      if (card.repetitions === 0) newCards++;
      else if (card.interval >= 21) masteredCards++;
      else learningCards++;
    });
  });

  const donutData = [
    { name: 'New', value: newCards, fill: '#8b5cf6' },
    { name: 'Learning', value: learningCards, fill: '#f59e0b' },
    { name: 'Mastered', value: masteredCards, fill: '#10b981' },
  ];

  // 3. Accuracy Rate
  let accuracy = 0;
  if (reviewLogs && reviewLogs.length > 0) {
    // Anki logic: good and easy are correct recalls
    const correctReviews = reviewLogs.filter(log => log.rating === 'good' || log.rating === 'easy').length;
    accuracy = Math.round((correctReviews / reviewLogs.length) * 100);
  }

  const handleStartReview = () => {
    if (urgentDeck) {
      startStudy(urgentDeck.id);
    } else if (decks.length > 0 && decks[0].cards.length > 0) {
      // Just pick the first deck with cards if nothing is due but they click it anyway
      startStudy(decks[0].id);
    }
  };

  return (
    <>
      <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <div className="dashboard-container">
        <header className="dashboard-header-simple">
          <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)}>☰</button>
          <div className="app-branding">Kwamjum</div>
        </header>

        {/* HERO CTA SECTION */}
        <section className="hero-cta-section">
          <h1 className="greeting">Welcome back! 👋</h1>
          <div className="cta-card">
            <div className="cta-content">
              {totalDueCards > 0 ? (
                <>
                  <h2 className="cta-title">You have <span className="highlight-text">{totalDueCards}</span> cards to review today.</h2>
                  <p className="cta-subtitle">Keep your streak alive and finish your daily goal!</p>
                  <button className="giant-start-btn" onClick={handleStartReview}>
                    ▶ Start Review
                  </button>
                </>
              ) : (
                <>
                  <h2 className="cta-title">You're all caught up! 🎉</h2>
                  <p className="cta-subtitle">Great job! You have 0 cards due right now.</p>
                  <button className="giant-start-btn secondary" onClick={onNewDeck}>
                    + Create New Deck
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* STATS & GAMIFICATION SECTION */}
        <section className="stats-gamification-grid">
          
          {/* Heatmap & Streak */}
          <div className="gamification-card">
            <div className="gamification-header">
              <h3>Activity & Streak</h3>
              <div className="streak-badge-fire">
                <span className="fire-emoji">🔥</span>
                <span className="streak-number">{streak}</span>
                <span className="streak-text">Days</span>
              </div>
            </div>
            <div className="heatmap-wrapper">
              <ActivityHeatmap logs={reviewLogs} />
            </div>
          </div>

          {/* Study Statistics (Donut & Accuracy) */}
          <div className="gamification-card stats-card" onClick={onViewStats} style={{ cursor: 'pointer' }} title="Click for Detailed Stats">
            <h3>Study Overview</h3>
            <div className="stats-overview-content">
              
              <div className="donut-chart-container">
                {totalCardsCount > 0 ? (
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={55}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} 
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-chart">No Cards</div>
                )}
              </div>
              
              <div className="stats-details">
                <div className="stat-detail-item">
                  <span className="detail-label">Total Cards</span>
                  <span className="detail-value">{totalCardsCount}</span>
                </div>
                <div className="stat-detail-item">
                  <span className="detail-label">Accuracy</span>
                  <span className="detail-value">{accuracy}%</span>
                </div>
                <div className="stat-detail-item">
                  <span className="detail-label">Reviews</span>
                  <span className="detail-value">{totalStudied} <span style={{fontSize: '12px', color:'var(--text-secondary)'}}>/ {dailyGoal}</span></span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* DECKS OVERVIEW */}
        <section className="decks-overview-section">
          <div className="section-header-flex">
            <h2>Your Decks</h2>
            <button className="add-deck-small-btn" onClick={onNewDeck}>+ New Deck</button>
          </div>

          <div className="decks-grid">
            {decks.map(deck => (
              <div key={deck.id} className="deck-card modern-deck-card" style={{ '--deck-color': deck.color }}>
                <div className="deck-card-header" onClick={() => deck.cards.length > 0 ? startStudy(deck.id) : null}>
                  <div className="deck-title-area">
                    <h3>{deck.title}</h3>
                    <span className="deck-description">{deck.description || 'No description'}</span>
                  </div>
                  {deck.dueToday > 0 && (
                    <div className="urgent-badge">{deck.dueToday} Due</div>
                  )}
                </div>

                <div className="deck-card-footer">
                  <span className="deck-card-count">{deck.cards.length} cards</span>
                  <div className="deck-card-actions">
                    <button className="deck-action-btn add-card-btn" onClick={() => onEditDeck(deck)}>
                      + Add Card
                    </button>
                    <button className="deck-action-btn edit-btn" onClick={() => onEditDeck(deck)}>
                      ⚙️ Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {decks.length === 0 && (
              <div className="empty-decks-state">
                <p>You don't have any decks yet. Create one to get started!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
