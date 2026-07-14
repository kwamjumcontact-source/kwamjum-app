import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import SidebarMenu from './SidebarMenu';
import ActivityHeatmap from './ActivityHeatmap';
import './Dashboard.css';

const Dashboard = ({ decks, startStudy, totalStudied, dailyGoal = 20, onNewDeck, onEditDeck, onViewStats, streak, reviewLogs }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
  let accuracyText = "-";
  if (reviewLogs && reviewLogs.length > 0) {
    const correctReviews = reviewLogs.filter(log => log.rating === 'good' || log.rating === 'easy').length;
    accuracyText = `${Math.round((correctReviews / reviewLogs.length) * 100)}%`;
  } else if (totalStudied === 0) {
    accuracyText = "-";
  }

  // Filter Decks
  const filteredDecks = useMemo(() => {
    return decks.filter(deck => 
      deck.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (deck.description && deck.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [decks, searchTerm]);

  const handleStartReview = () => {
    if (urgentDeck) {
      startStudy(urgentDeck.id);
    } else if (decks.length > 0 && decks[0].cards.length > 0) {
      startStudy(decks[0].id);
    }
  };

  // Gamification Progress
  const goalProgress = Math.min(100, Math.round((totalStudied / dailyGoal) * 100)) || 0;
  // A fake goal for new cards (could be dynamic later)
  const newCardsGoal = 5;
  const newCardsStudied = reviewLogs?.filter(log => {
    // Basic approximation for "new cards" reviewed today
    const isToday = new Date(log.reviewed_at).toDateString() === new Date().toDateString();
    return isToday && log.rating !== 'again'; // simplified logic
  }).length || 0;
  const newCardsProgress = Math.min(100, Math.round((newCardsStudied / newCardsGoal) * 100)) || 0;

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
                  <h2 className="cta-title">
                    You have <span className="highlight-text">{totalDueCards}</span> {totalDueCards === 1 ? 'card' : 'cards'} due today.
                  </h2>
                  <p className="cta-subtitle">Finish this to keep your {streak}-day streak alive! 🔥</p>
                  <button className="giant-start-btn" onClick={handleStartReview}>
                    ▶ Start Review
                  </button>
                </>
              ) : (
                <>
                  <h2 className="cta-title">You're all caught up! 🎉</h2>
                  <p className="cta-subtitle">Great job! Master your skills today by creating a new deck.</p>
                  <button className="giant-start-btn secondary" onClick={onNewDeck}>
                    + Create New Deck
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 4-PANEL GAMIFICATION GRID */}
        <section className="stats-gamification-grid">
          
          {/* Panel 1: Heatmap & Streak */}
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
              <ActivityHeatmap logs={reviewLogs} dailyGoal={dailyGoal} />
            </div>
            <p className="panel-hint">Study every day to fill the board!</p>
          </div>

          {/* Panel 2: Study Overview */}
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
                  <span className="detail-label">Mastered</span>
                  <span className="detail-value text-success">{masteredCards}</span>
                </div>
                <div className="stat-detail-item">
                  <span className="detail-label">Accuracy</span>
                  <span className="detail-value">{accuracyText}</span>
                </div>
                {accuracyText === "-" && (
                  <div className="accuracy-hint">Will update after your first review</div>
                )}
              </div>
            </div>
          </div>

          {/* Panel 3: Daily Goals */}
          <div className="gamification-card goals-card">
            <h3>Daily Goals</h3>
            
            <div className="goal-item">
              <div className="goal-header">
                <span className="goal-title">Daily Review</span>
                <span className="goal-stats">{totalStudied} / {dailyGoal}</span>
              </div>
              <div className="goal-progress-bg">
                <div className="goal-progress-fill" style={{ width: `${goalProgress}%`, backgroundColor: 'var(--accent-color)' }}></div>
              </div>
            </div>

            <div className="goal-item">
              <div className="goal-header">
                <span className="goal-title">New Cards</span>
                <span className="goal-stats">{newCardsStudied} / {newCardsGoal}</span>
              </div>
              <div className="goal-progress-bg">
                <div className="goal-progress-fill" style={{ width: `${newCardsProgress}%`, backgroundColor: '#8b5cf6' }}></div>
              </div>
            </div>
          </div>



        </section>

        {/* DECKS OVERVIEW */}
        <section className="decks-overview-section">
          <div className="section-header-flex">
            <h2>Your Decks</h2>
            <div className="deck-actions-right">
              <input 
                type="text" 
                className="deck-search-input" 
                placeholder="Search decks..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="add-deck-small-btn" onClick={onNewDeck}>+ New Deck</button>
            </div>
          </div>

          <div className="decks-grid">
            {filteredDecks.map(deck => {
              const total = deck.cards.length;
              const mastered = deck.cards.filter(c => c.interval >= 21).length;
              const progressPercent = total === 0 ? 0 : Math.round((mastered / total) * 100);

              return (
                <div key={deck.id} className="deck-card modern-deck-card" style={{ '--deck-color': deck.color || 'var(--accent-color)' }}>
                  <div className="deck-card-header" onClick={() => deck.cards.length > 0 ? startStudy(deck.id) : null}>
                    <div className="deck-header-top">
                      <div className="deck-icon">{deck.title.charAt(0).toUpperCase()}</div>
                      <div className="deck-mini-donut" style={{ background: `conic-gradient(var(--deck-color, var(--accent-color)) 0% ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}% 100%)` }}></div>
                    </div>
                    <div className="deck-title-area mt-3">
                      <h3>{deck.title}</h3>
                      <span className="deck-description">{deck.description || 'No description'}</span>
                    </div>
                  </div>

                  <div className="deck-card-footer">
                    <span className="deck-card-stats">
                      <span className={deck.dueToday > 0 ? 'text-warning font-bold' : ''}>{deck.dueToday} Due</span> <span className="separator">|</span> {total} Total
                    </span>
                    <div className="deck-card-actions">
                      <button className="deck-action-btn add-card-btn" onClick={(e) => { e.stopPropagation(); onEditDeck(deck); }}>
                        + Add Card
                      </button>
                      <button className="deck-action-btn edit-btn" onClick={(e) => { e.stopPropagation(); onEditDeck(deck); }}>
                        ⚙️ Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredDecks.length === 0 && (
              <div className="empty-decks-state">
                <p>{searchTerm ? 'No decks found matching your search.' : "You don't have any decks yet. Create one to get started!"}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
