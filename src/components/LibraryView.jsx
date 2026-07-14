import React, { useState, useMemo } from 'react';
import './LibraryView.css';

const LibraryView = ({ decks, onNewDeck, onEditDeck, startStudy }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Group decks by category
  const categories = useMemo(() => {
    const groups = {};
    decks.forEach(deck => {
      // Apply search filter if active
      if (searchTerm) {
        const matchesTitle = deck.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDesc = deck.description?.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesTitle && !matchesDesc) return;
      }

      const cat = deck.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(deck);
    });
    return groups;
  }, [decks, searchTerm]);

  return (
    <div className="library-container">
      <div className="library-header">
        <div>
          <h1>My Decks</h1>
          <p className="library-subtitle">Manage and organize your flashcard collection.</p>
        </div>
        <div className="library-actions">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search decks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="primary-btn" onClick={onNewDeck}>+ Create Deck</button>
        </div>
      </div>

      <div className="library-content">
        {Object.keys(categories).length === 0 ? (
          <div className="empty-library">
            <div className="empty-illustration">📚</div>
            <h3>No decks found</h3>
            <p>Create a new deck to start learning, or try a different search term.</p>
          </div>
        ) : (
          Object.keys(categories).sort().map(category => (
            <div key={category} className="category-section">
              <h2 className="category-title">{category}</h2>
              <div className="decks-grid">
                {categories[category].map(deck => (
                  <div key={deck.id} className="deck-card" onClick={() => startStudy(deck.id)}>
                    <div className="deck-card-header" style={{ borderBottomColor: deck.color }}>
                      <h3>{deck.title}</h3>
                      <button className="edit-btn" onClick={(e) => { e.stopPropagation(); onEditDeck(deck); }}>✏️</button>
                    </div>
                    <p className="deck-description">{deck.description || "No description"}</p>
                    <div className="deck-stats">
                      <span>{deck.cards?.length || 0} cards</span>
                      {deck.dueToday > 0 ? (
                        <span className="due-badge">{deck.dueToday} due today</span>
                      ) : (
                        <span className="up-to-date-badge">Up to date</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LibraryView;
