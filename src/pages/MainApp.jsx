import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDecks, getCardsForDeck, createDeck, updateDeck, deleteDeck, createCard, deleteCard, saveCardReview, logReview, getReviewLogs, getProfile, updateStreak, exportDeck, importDeck } from '../lib/db';
import Dashboard from '../components/Dashboard';
import LibraryView from '../components/LibraryView';
import Sidebar from '../components/Sidebar';
import StudyView from '../components/StudyView';
import StatsView from '../components/StatsView';
import DeckEditorModal from '../components/DeckEditorModal';
import DictionaryTool from '../components/DictionaryTool';
import { processReview } from '../lib/anki';
import '../App.css'; // Inherited from prototype

const MainApp = () => {
  const { user } = useAuth();
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeDeckId, setActiveDeckId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Database State
  const [decks, setDecks] = useState([]);
  const [reviewLogs, setReviewLogs] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [totalStudied, setTotalStudied] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  


  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedDecks = await getDecks(user.id);
      
      // We need to fetch cards for each deck to show counts/due
      const decksWithCards = await Promise.all(
        fetchedDecks.map(async (deck) => {
          const cards = await getCardsForDeck(deck.id);
          const now = new Date();
          const dueToday = cards.filter(c => new Date(c.due_date) <= now).length;
          return { ...deck, cards, dueToday };
        })
      );
      
      setDecks(decksWithCards);

      // Fetch review logs & stats (90 days for heatmap)
      const logs = await getReviewLogs(user.id, 90);
      setReviewLogs(logs);
      setTotalStudied(logs.length);

      // Fetch Profile for Streak & Settings
      const profile = await getProfile(user.id);
      if (profile) {
        setUserProfile(profile);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [user, fetchData]);

  // SM-2 Algorithm Integration (Anki Style)
  const handleRating = async (cardId, rating) => {
    const deck = decks.find(d => d.id === activeDeckId);
    const card = deck.cards.find(c => c.id === cardId);
    
    // Process new state using Anki logic
    const { repetitions, ease, interval } = processReview(card, rating);

    // Apply max interval constraint
    const maxInterval = userProfile?.max_interval_days || 365;
    const finalInterval = Math.min(interval, maxInterval);

    // Calculate new due date based on real time
    // interval is returned in DAYS from processReview
    const newDueDate = new Date(Date.now() + finalInterval * 24 * 60 * 60 * 1000);

    // Optimistically update the decks state immediately to prevent race conditions
    setDecks(prevDecks => prevDecks.map(d => {
      if (d.id === activeDeckId) {
        const updatedCards = d.cards.map(c => {
          if (c.id === cardId) {
            return {
              ...c,
              repetitions,
              ease: parseFloat(ease.toFixed(2)),
              interval: finalInterval,
              due_date: newDueDate.toISOString()
            };
          }
          return c;
        });
        const now = new Date();
        const dueToday = updatedCards.filter(c => new Date(c.due_date) <= now).length;
        return { ...d, cards: updatedCards, dueToday };
      }
      return d;
    }));

    // Save to Supabase
    localStorage.setItem(`kwamjum_due_${cardId}`, newDueDate.getTime().toString());

    // Save to Supabase
    try {
      await logReview(user.id, activeDeckId, cardId, rating);
      await saveCardReview(cardId, {
        repetitions,
        ease: parseFloat(ease.toFixed(2)),
        interval: finalInterval,
        due_date: newDueDate.toISOString()
      });
      // We will not call fetchData() here to avoid resetting StudyView's internal state.
      // StudyView will manage the active session's queue in memory.
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Error saving review to database: " + error.message);
    }
  };


  // Deck Management
  const handleSaveDeck = async (deckData) => {
    try {
      let savedDeckId = editingDeck?.id;
      if (savedDeckId) {
        await updateDeck(savedDeckId, deckData.title, deckData.description, deckData.color, deckData.category);
      } else {
        const newDeck = await createDeck(user.id, deckData.title, deckData.description, deckData.color, deckData.category);
        savedDeckId = newDeck.id;
      }

      // Sync Cards
      const currentCards = editingDeck?.cards || [];
      const newCards = deckData.cards || [];

      // Delete removed cards
      for (const oldCard of currentCards) {
        if (!newCards.find(c => c.id === oldCard.id)) {
          await deleteCard(oldCard.id);
        }
      }

      // Add new cards
      for (const card of newCards) {
        if (typeof card.id === 'number') {
          await createCard(user.id, savedDeckId, card);
        }
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

  const handleExportDeck = async (deckId) => {
    try {
      const data = await exportDeck(deckId);
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.deck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
      alert("Failed to export deck");
    }
  };

  const handleImportDeck = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          await importDeck(user.id, content, file.name);
          fetchData(); 
          alert("Deck imported successfully!");
        } catch (err) {
          console.error("Import failed:", err);
          alert("Failed to import deck: " + err.message);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      console.error("File read failed:", err);
    }
  };

  // Render Views
  if (loading) {
    return <div style={{color:'white', display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>Loading your decks...</div>;
  }

  const activeDeck = decks.find(d => d.id === activeDeckId);

  return (
    <div className="app-layout-wrapper" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)', flexDirection: 'column' }}>
      
      {/* Mobile Header (Only visible on small screens) */}
      <div className="mobile-header">
        <button className="hamburger-btn" onClick={() => setIsMobileSidebarOpen(true)}>☰</button>
        <h2>Kwamjum</h2>
      </div>

      <div style={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          user={user} 
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isOpenOnMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        
        <div className={`main-content-area ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {currentView === 'dashboard' && (
          <Dashboard 
            decks={decks}
            streak={userProfile?.current_streak || 0}
            totalStudied={totalStudied}
            dailyGoal={userProfile?.daily_goal || 20}
            reviewLogs={reviewLogs}
            startStudy={(id) => { setActiveDeckId(id); setCurrentView('study'); }}
            onViewStats={() => setCurrentView('stats')}
          />
        )}

        {currentView === 'library' && (
          <LibraryView 
            decks={decks}
            onNewDeck={() => { setEditingDeck(null); setIsEditorOpen(true); }}
            onEditDeck={(deck) => { setEditingDeck(deck); setIsEditorOpen(true); }}
            startStudy={(id) => { setActiveDeckId(id); setCurrentView('study'); }}
            onExportDeck={handleExportDeck}
            onImportDeck={handleImportDeck}
          />
        )}

      {currentView === 'study' && activeDeck && (
        <StudyView 
          deck={activeDeck}
          dueCards={activeDeck.cards.filter(c => new Date(c.due_date) <= new Date())}
          autoFlipSeconds={userProfile?.auto_flip_seconds || 0}
          onRating={handleRating}
          onFinish={async () => {
            // Update streak on completion
            const profile = await updateStreak(user.id);
            if (profile) setUserProfile(profile);
            setCurrentView('dashboard');
          }}
        />
      )}

      {currentView === 'stats' && (
        <StatsView 
          decks={decks}
          streak={userProfile?.current_streak || 0}
          reviewLogs={reviewLogs}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {isEditorOpen && (
        <DeckEditorModal
          initialDeck={editingDeck}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveDeck}
          onDelete={handleDeleteDeck}
        />
      )}

      <DictionaryTool />
      
        </div> {/* End main-content-area */}
      </div> {/* End flex row */}
    </div>
  );
};

export default MainApp;
