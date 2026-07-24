import React, { useState, useEffect, useMemo } from 'react';
import Flashcard from './Flashcard';
import { calculateNextIntervals, formatTime, processReview } from '../lib/anki';
import { CheckCircle, HourglassHigh, FastForward, ArrowCounterClockwise } from '@phosphor-icons/react';
import './StudyView.css';

const StudyView = ({ deck, dueCards: initialDueCards, autoFlipSeconds = 0, onRating, onFinish }) => {
  // Initialize dynamic queue in memory
  // Map cards to include a local dueTime (timestamp)
  const [queue, setQueue] = useState(() => {
    return initialDueCards.map(c => ({
      ...c,
      localDueTime: new Date(c.due_date).getTime()
    })).sort((a, b) => a.localDueTime - b.localDueTime);
  });

  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [lastAction, setLastAction] = useState(null);

  const totalCards = initialDueCards.length;
  const completedCards = totalCards - queue.length;
  const progressPercentage = totalCards > 0 ? (completedCards / totalCards) * 100 : 100;

  // Update current time every second to handle "waiting" states
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentCard = queue.length > 0 ? queue[0] : null;
  const isWaiting = currentCard && currentCard.localDueTime > currentTime;

  // Auto-flip logic
  useEffect(() => {
    let timer;
    if (!isFlipped && currentCard && !isWaiting && autoFlipSeconds > 0) {
      timer = setTimeout(() => {
        setIsFlipped(true);
      }, autoFlipSeconds * 1000);
    }
    return () => clearTimeout(timer);
  }, [isFlipped, currentCard, isWaiting, autoFlipSeconds]);

  // Calculate dynamic intervals for the current card
  const nextIntervals = useMemo(() => {
    if (currentCard) {
      return calculateNextIntervals(currentCard);
    }
    return null;
  }, [currentCard]);

  const handleUndo = () => {
    if (!lastAction) return;
    setQueue(lastAction.previousQueue);
    setIsFlipped(false);
    setLastAction(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isFlipped && currentCard && !isWaiting) {
          setIsFlipped(true);
        }
      } else if (isFlipped) {
        if (e.key === '1') handleRatingClick('again');
        if (e.key === '2') handleRatingClick('hard');
        if (e.key === '3') handleRatingClick('good');
        if (e.key === '4') handleRatingClick('easy');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Clear lastAction after 10s
  useEffect(() => {
    let timer;
    if (lastAction) {
      timer = setTimeout(() => {
        setLastAction(null);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [lastAction]);

  // Calculate Anki-style counters (New, Learning, Review)
  const counts = useMemo(() => {
    let n = 0, l = 0, r = 0;
    queue.forEach(c => {
      if (c.repetitions === 0) n++;
      else if (c.interval < 1) l++;
      else r++;
    });
    return { new: n, learn: l, review: r };
  }, [queue]);

  const handleFinish = async () => {
    setSessionCompleted(true);
    if (onFinish) onFinish();
  };

  const handleRatingClick = (rating) => {
    // 1. Tell parent to save to DB (MainApp handles DB logic)
    onRating(currentCard.id, rating);
    
    // Save state for undo
    setLastAction({
      card: currentCard,
      previousQueue: [...queue]
    });

    // 2. Predict next state locally
    const simulatedNextState = processReview(currentCard, rating);
    const newIntervalDays = simulatedNextState.interval;
    
    setQueue(prevQueue => {
      const newQueue = [...prevQueue];
      newQueue.shift(); // Remove current card from front

      if (newIntervalDays < 1) {
        // Less than 1 day means it's a Learning Step (e.g. 1m or 10m)
        // Push it back into the queue for today!
        const futureMs = newIntervalDays * 24 * 60 * 60 * 1000;
        const updatedCard = {
          ...currentCard,
          ...simulatedNextState,
          localDueTime: Date.now() + futureMs
        };
        newQueue.push(updatedCard);
        // Sort queue so earliest due is first
        newQueue.sort((a, b) => a.localDueTime - b.localDueTime);
      }
      
      return newQueue;
    });

    setIsFlipped(false);
  };

  // State: No cards due initially
  if (initialDueCards.length === 0) {
    return (
      <div className="study-view-container empty-state">
        <div className="completion-card">
          <CheckCircle size={64} weight="duotone" color="var(--primary-color)" style={{ marginBottom: '16px' }} />
          <h2>You're all caught up!</h2>
          <p>No more cards due for <strong>{deck.title}</strong> right now.</p>
          <button className="finish-btn" onClick={handleFinish}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  // State: Queue finished completely!
  if (sessionCompleted || queue.length === 0) {
    return (
      <div className="study-view-container finished-state">
        <div className="completion-card">
          <CheckCircle size={64} weight="duotone" color="var(--success-color)" style={{ marginBottom: '16px' }} />
          <h2>Session Complete!</h2>
          <p>Great job studying <strong>{deck.title}</strong>.</p>
          <p>You have graduated all cards for today.</p>
          <button className="finish-btn" onClick={handleFinish}>Complete & Update Streak</button>
        </div>
      </div>
    );
  }

  // State: Waiting for cards to become due (Learning steps)
  if (isWaiting) {
    const waitSeconds = Math.ceil((currentCard.localDueTime - currentTime) / 1000);
    const waitMinutes = Math.floor(waitSeconds / 60);
    const displayWait = waitMinutes > 0 ? `${waitMinutes}m ${waitSeconds % 60}s` : `${waitSeconds}s`;

    return (
      <div className="study-view-container waiting-state">
        <div className="completion-card">
          <HourglassHigh size={64} weight="duotone" color="var(--warning-color)" style={{ marginBottom: '16px' }} />
          <h2>Waiting for Cards...</h2>
          <p>The next card is in a learning step and will be ready in:</p>
          <div className="wait-timer">{displayWait}</div>
          <div className="wait-actions">
            <button className="finish-btn outline" onClick={handleFinish}>Finish for Now</button>
            <button className="finish-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => {
              // Study ahead: artificially set dueTime to now
              setQueue(q => {
                const newQ = [...q];
                newQ[0].localDueTime = Date.now();
                return newQ;
              });
            }}>
              <FastForward size={20} weight="fill" /> Study Ahead
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="study-view-container">
      {totalCards > 0 && (
        <div className="study-progress-container">
          <div className="study-progress-text">
            {completedCards} of {totalCards} cards completed ({Math.round(progressPercentage)}%)
          </div>
          <div className="study-progress-bar">
            <div className="study-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
      )}

      <div className="study-header">
        <span className="deck-title">{deck.title}</span>
        {lastAction && (
          <button className="undo-btn" onClick={handleUndo}>
            <ArrowCounterClockwise size={16} /> Undo
          </button>
        )}
        <div className="anki-counters">
          <span className="count-new" title="New Cards">{counts.new}</span>
          <span className="count-learn" title="Learning Cards">{counts.learn}</span>
          <span className="count-review" title="Cards to Review">{counts.review}</span>
        </div>
      </div>

      <Flashcard 
        card={currentCard} 
        isFlipped={isFlipped} 
        setIsFlipped={setIsFlipped} 
      />

      {isFlipped ? (
        <>
          <div className="rating-buttons">
            <button className="rating-btn again" onClick={() => handleRatingClick('again')}>
              <span className="rating-time">{formatTime(nextIntervals.again)}</span>
              <span className="rating-label">Again</span>
            </button>
            <button className="rating-btn hard" onClick={() => handleRatingClick('hard')}>
              <span className="rating-time">{formatTime(nextIntervals.hard)}</span>
              <span className="rating-label">Hard</span>
            </button>
            <button className="rating-btn good" onClick={() => handleRatingClick('good')}>
              <span className="rating-time">{formatTime(nextIntervals.good)}</span>
              <span className="rating-label">Good</span>
            </button>
            <button className="rating-btn easy" onClick={() => handleRatingClick('easy')}>
              <span className="rating-time">{formatTime(nextIntervals.easy)}</span>
              <span className="rating-label">Easy</span>
            </button>
          </div>
          <div className="keyboard-hints">
            Keyboard: Space to flip · 1 Again · 2 Hard · 3 Good · 4 Easy
          </div>
        </>
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
