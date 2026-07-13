import React, { useState, useEffect } from 'react';
import './Flashcard.css';

const Flashcard = ({ card, isFlipped, setIsFlipped }) => {
  const [inputValue, setInputValue] = useState('');

  // Reset input when card changes
  useEffect(() => {
    setInputValue('');
  }, [card]);

  const handleInputClick = (e) => {
    e.stopPropagation(); // Prevent card flip when clicking the input
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsFlipped(true);
    }
  };

  const isCloze = card.type === 'cloze';
  const isCorrect = isCloze && inputValue.toLowerCase().trim() === card.answer.toLowerCase();

  return (
    <div 
      className={`flashcard-container ${isFlipped ? 'flipped' : ''}`}
      onClick={() => setIsFlipped(true)}
    >
      <div className="flashcard">
        {/* Front */}
        <div className="flashcard-face flashcard-front">
          {card.image && card.imagePosition === 'front' && (
            <div className="card-image-container">
              <img src={card.image} alt="card visual" className="card-image" />
            </div>
          )}
          <div className="flashcard-content">
            {isCloze ? (
              <div className="cloze-front">
                <p className="cloze-question">{card.question}</p>
                <input 
                  type="text" 
                  className="cloze-input"
                  placeholder="Type your answer..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onClick={handleInputClick}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>
            ) : (
              <h2 className="word">{card.front}</h2>
            )}
            
            {!isFlipped && (
              <p className="tap-hint">{isCloze ? 'Press Enter or Tap to reveal' : 'Tap to reveal'}</p>
            )}
          </div>
        </div>
        
        {/* Back */}
        <div className="flashcard-face flashcard-back">
          {card.image && card.imagePosition === 'back' && (
            <div className="card-image-container">
              <img src={card.image} alt="card visual" className="card-image" />
            </div>
          )}
          <div className="flashcard-content">
            {isCloze ? (
              <>
                <h2 className={`cloze-answer ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {card.answer}
                </h2>
                {inputValue && !isCorrect && (
                  <p className="your-answer">You typed: <del>{inputValue}</del></p>
                )}
                <div className="divider"></div>
                <p className="meaning">{card.fullSentence}</p>
                {card.meaning && <p className="reading">{card.meaning}</p>}
              </>
            ) : (
              <>
                <h2 className="word">{card.back}</h2>
                <div className="divider"></div>
                {card.reading && <p className="reading">{card.reading}</p>}
                {card.meaning && <p className="meaning">{card.meaning}</p>}
                {card.example && <p className="example">{card.example}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
