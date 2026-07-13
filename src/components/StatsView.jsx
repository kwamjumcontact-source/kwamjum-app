import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './StatsView.css';

const MOCK_ACTIVITY_DATA = [
  { name: 'Mon', cards: 15 },
  { name: 'Tue', cards: 28 },
  { name: 'Wed', cards: 12 },
  { name: 'Thu', cards: 45 },
  { name: 'Fri', cards: 35 },
  { name: 'Sat', cards: 52 },
  { name: 'Today', cards: 20 },
];

const StatsView = ({ decks, streak, onBack }) => {
  const [note, setNote] = useState(localStorage.getItem('kwamjum_note') || '');

  const saveNote = (e) => {
    setNote(e.target.value);
    localStorage.setItem('kwamjum_note', e.target.value);
  };

  return (
    <div className="stats-container">
      <div className="stats-header-bar">
        <button className="back-btn" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <div className="streak-badge-large">
          <span className="fire-icon">🔥</span>
          {streak} Day Streak
        </div>
      </div>

      {/* Activity Chart Section */}
      <div className="chart-section">
        <h2>Study Activity (Last 7 Days)</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={MOCK_ACTIVITY_DATA}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCards" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.3)" 
                tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#60a5fa' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="cards" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCards)" 
                activeDot={{ r: 6, fill: '#60a5fa', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="stats-content">
        <div className="left-panel">
          <h2>Deck Progress</h2>
          <div className="progress-list">
            {decks.map(deck => {
              const total = deck.cards.length;
              // A card is considered 'learned' if its interval > 0
              const learned = deck.cards.filter(c => c.interval > 0).length;
              const percentage = total === 0 ? 0 : Math.round((learned / total) * 100);
              
              return (
                <div key={deck.id} className="deck-progress-card">
                  <div className="dp-header">
                    <span className="dp-title">{deck.title}</span>
                    <span className="dp-percent">{percentage}% Learned</span>
                  </div>
                  <div className="dp-bar-bg">
                    <div 
                      className="dp-bar-fill" 
                      style={{ width: `${percentage}%`, backgroundColor: deck.color }}
                    ></div>
                  </div>
                  <div className="dp-stats">
                    <span>{learned} mastered</span>
                    <span>{total - learned} to go</span>
                  </div>
                </div>
              );
            })}
            {decks.length === 0 && <p className="empty-text">No decks available.</p>}
          </div>
        </div>

        <div className="right-panel">
          <h2>Personal Notes</h2>
          <div className="notes-container">
            <textarea 
              className="notes-area" 
              placeholder="Write down your goals, mnemonics, or things you want to remember..."
              value={note}
              onChange={saveNote}
            ></textarea>
            <p className="notes-hint">Notes are auto-saved locally.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
