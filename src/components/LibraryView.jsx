import React, { useState, useMemo, useRef } from 'react';
import { Books, PencilSimple, Plus, UploadSimple, DownloadSimple, Stack } from '@phosphor-icons/react';
import './LibraryView.css';

const LibraryView = ({ decks, onNewDeck, onEditDeck, startStudy, onExportDeck, onImportDeck }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onImportDeck) {
      onImportDeck(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = null;
  };

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
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept=".json,.csv"
          />
          <button className="secondary-btn import-btn" onClick={() => fileInputRef.current?.click()}>
            <UploadSimple size={20} weight="bold" /> Import
          </button>
          <button className="primary-btn" onClick={onNewDeck}>
            <Plus size={20} weight="bold" /> Create Deck
          </button>
        </div>
      </div>

      <div className="library-content">
        {Object.keys(categories).length === 0 ? (
          <div className="empty-library">
            <div className="empty-illustration">
              <Books size={64} weight="duotone" color="var(--primary-color)" />
            </div>
            <h3>No decks found</h3>
            <p>Create a new deck to start learning, or try a different search term.</p>
          </div>
        ) : (
          Object.keys(categories).sort().map(category => (
            <div key={category} className="category-section">
              <h2 className="category-title">{category}</h2>
              <div className="decks-grid">
                {categories[category].map(deck => (
                  <div key={deck.id} className="deck-card radical" style={{ '--deck-color': deck.color || 'var(--primary-color)' }} onClick={() => startStudy(deck.id)}>
                    <div className="deck-card-cover">
                      <div className="cover-icon">
                        <Stack size={48} weight="duotone" />
                      </div>
                      <div className="deck-actions">
                        <button className="edit-btn action-circle" onClick={(e) => { e.stopPropagation(); onExportDeck && onExportDeck(deck.id); }} title="Export Deck">
                          <DownloadSimple size={18} />
                        </button>
                        <button className="edit-btn action-circle" onClick={(e) => { e.stopPropagation(); onEditDeck(deck); }} title="Edit Deck">
                          <PencilSimple size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="deck-card-content">
                      <h3 className="deck-title">{deck.title}</h3>
                      <p className="deck-description">{deck.description || "No description provided."}</p>
                      <div className="deck-stats">
                        <span className="card-count">{deck.cards?.length || 0} cards</span>
                        {deck.dueToday > 0 ? (
                          <span className="due-badge">{deck.dueToday} due today</span>
                        ) : (
                          <span className="up-to-date-badge">Up to date</span>
                        )}
                      </div>
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
