import React, { useState, useEffect } from 'react';
import Flashcard from './Flashcard';
import { calculateNextIntervals, formatTime } from '../lib/anki';
import './StudyView.css';

const StudyView = ({ deck, dueCards, autoFlipSeconds = 0, onRating, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // If no cards are due at all
  if (dueCards.length === 0) {
    return (
      <div className="study-view-container empty-state">
        <div className="completion-card">
          <h2>🎉 You're all caught up!</h2>
          <p>No more cards due for <strong>{deck.title}</strong> right now.</p>
          <button className="finish-btn" onClick={onFinish}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  // If finished studying the queue
  if (sessionCompleted || currentIndex >= dueCards.length) {
    return (
      <div className="study-view-container finished-state">
        <div className="completion-card">
          <h2>🎉 Session Complete!</h2>
          <p>Great job studying <strong>{deck.title}</strong>.</p>
          <p>You've reviewed {dueCards.length} cards.</p>
          <button className="finish-btn" onClick={onFinish}>Complete & Update Streak</button>
        </div>
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];
  
  // Calculate dynamic intervals for the current card
  let nextIntervals = null;
  if (currentCard) {
    nextIntervals = calculateNextIntervals(currentCard);
  }

  // Auto-flip logic
  useEffect(() => {
    let timer;
    if (!isFlipped && currentCard && autoFlipSeconds > 0) {
      timer = setTimeout(() => {
        setIsFlipped(true);
      }, autoFlipSeconds * 1000);
    }
    return () => clearTimeout(timer);
  }, [currentIndex, isFlipped, currentCard, autoFlipSeconds]);

  const handleRatingClick = (rating) => {
    onRating(currentCard.id, rating);
    
    // Move to next card
    setIsFlipped(false);
    if (currentIndex + 1 >= dueCards.length) {
      setSessionCompleted(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="study-view-container">
      <div className="study-header">
        <span className="deck-title">{deck.title}</span>
        <span className="progress-counter">
          {currentIndex + 1} / {dueCards.length}
        </span>
      </div>

      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${((currentIndex) / dueCards.length) * 100}%` }}
        />
      </div>

      <Flashcard 
        card={currentCard} 
        isFlipped={isFlipped} 
        setIsFlipped={setIsFlipped} 
      />

      {isFlipped ? (
        <div className="rating-buttons">
          <button className="rating-btn again" onClick={() => handleRatingClick('again')}>
            <span className="rating-label">Again</span>
            <span className="rating-time">{formatTime(nextIntervals.again)}</span>
          </button>
          <button className="rating-btn hard" onClick={() => handleRatingClick('hard')}>
            <span className="rating-label">Hard</span>
            <span className="rating-time">{formatTime(nextIntervals.hard)}</span>
          </button>
          <button className="rating-btn good" onClick={() => handleRatingClick('good')}>
            <span className="rating-label">Good</span>
            <span className="rating-time">{formatTime(nextIntervals.good)}</span>
          </button>
          <button className="rating-btn easy" onClick={() => handleRatingClick('easy')}>
            <span className="rating-label">Easy</span>
            <span className="rating-time">{formatTime(nextIntervals.easy)}</span>
          </button>
        </div>
      ) : (
        <div className="show-answer-container">
          {autoFlipSeconds > 0 && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Auto-flipping in {autoFlipSeconds}s...
            </div>
          )}
          <button className="show-answer-btn" onClick={() => setIsFlipped(true)}>
            Show Answer
          </button>
        </div>
      )}
    </div>
  );
};

export default StudyView;
