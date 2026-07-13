import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDecks, getCardsForDeck, createDeck, updateDeck, deleteDeck, createCard, updateCard, deleteCard, saveCardReview, logReview, getReviewLogs } from '../lib/db';
import Dashboard from '../components/Dashboard';
import Flashcard from '../components/Flashcard';
import StatsView from '../components/StatsView';
import DeckEditorModal from '../components/DeckEditorModal';
import '../App.css'; // Inherited from prototype

const MainApp = () => {
  const { user, signOut } = useAuth();
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeDeckId, setActiveDeckId] = useState(null);
  
  // Database State
  const [decks, setDecks] = useState([]);
  const [reviewLogs, setReviewLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  
  // Simulation / Time
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const fetchedDecks = await getDecks(user.id);
      
      // We need to fetch cards for each deck to show counts/due
      const decksWithCards = await Promise.all(
        fetchedDecks.map(async (deck) => {
          const cards = await getCardsForDeck(deck.id);
          const dueToday = cards.filter(c => new Date(c.due_date) <= currentDate).length;
          return { ...deck, cards, dueToday };
        })
      );
      
      setDecks(decksWithCards);

      // Fetch review logs
      const logs = await getReviewLogs(user.id, 7);
      setReviewLogs(logs);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, currentDate]);

  // SM-2 Logic ported to work with async DB
  const handleRating = async (cardId, rating) => {
    const deck = decks.find(d => d.id === activeDeckId);
    const card = deck.cards.find(c => c.id === cardId);
    
    let { repetitions, ease, interval } = card;
    let quality = 0;

    switch(rating) {
      case 'again': quality = 0; break;
      case 'hard': quality = 3; break;
      case 'good': quality = 4; break;
      case 'easy': quality = 5; break;
      default: quality = 0;
    }

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * ease);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1; // Actually in our old SM-2 we did 0.001 for again, but let's keep it simple or exact
      if(quality === 0) interval = 0.001;
    }

    ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (ease < 1.3) ease = 1.3;

    // Calculate new due date based on simulated currentDate
    const newDueDate = new Date(currentDate.getTime() + interval * 24 * 60 * 60 * 1000);

    // Save to Supabase
    try {
      await logReview(user.id, deckId, cardId, rating);
      await saveCardReview(cardId, {
        repetitions,
        ease,
        interval,
        due_date: newDueDate.toISOString()
      });
      // Refresh data to reflect new due dates
      await fetchData();
    } catch (error) {
      console.error("Error saving review:", error);
    }
  };

  const simulateNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  // Deck Management
  const handleSaveDeck = async (deckData) => {
    try {
      if (editingDeck?.id) {
        await updateDeck(editingDeck.id, deckData.title, deckData.description, deckData.color);
      } else {
        await createDeck(user.id, deckData.title, deckData.description, deckData.color);
      }
      setIsEditorOpen(false);
      fetchData();
    } catch (e) {
      console.error("Save deck failed", e);
    }
  };

  const handleDeleteDeck = async (deckId) => {
    if(window.confirm('Are you sure you want to delete this deck?')) {
      await deleteDeck(deckId);
      setIsEditorOpen(false);
      fetchData();
    }
  };

  // Render Views
  if (loading) {
    return <div style={{color:'white', display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>Loading your decks...</div>;
  }

  const activeDeck = decks.find(d => d.id === activeDeckId);

  return (
    <div className="app-wrapper">
      {currentView === 'dashboard' && (
        <Dashboard 
          decks={decks}
          streak={0} // To be implemented with user profile later
          totalStudied={0}
          onNewDeck={() => { setEditingDeck(null); setIsEditorOpen(true); }}
          onEditDeck={(deck) => { setEditingDeck(deck); setIsEditorOpen(true); }}
          startStudy={(id) => { setActiveDeckId(id); setCurrentView('study'); }}
          onViewStats={() => setCurrentView('stats')}
        />
      )}

      {currentView === 'study' && activeDeck && (
        <div className="study-container">
          <button className="back-btn" onClick={() => setCurrentView('dashboard')}>
            ← Back to Dashboard
          </button>
          
          <Flashcard 
            deck={activeDeck}
            onRating={handleRating}
            currentDate={currentDate}
          />
        </div>
      )}

      {currentView === 'stats' && (
        <StatsView 
          decks={decks}
          streak={0}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {isEditorOpen && (
        <DeckEditorModal
          deck={editingDeck}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveDeck}
          onDelete={handleDeleteDeck}
          // Note: Full card editing within modal needs to be wired to Supabase too (omitted for brevity here but structure is ready)
        />
      )}
    </div>
  );
};

export default MainApp;
