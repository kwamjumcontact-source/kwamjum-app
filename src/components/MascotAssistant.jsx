import React, { useState, useEffect } from 'react';
import './MascotAssistant.css';

const MascotAssistant = ({ currentView, streak, totalStudied }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [showBubble, setShowBubble] = useState(true);

  // Dynamic messages based on context
  useEffect(() => {
    let newMessage = '';
    if (currentView === 'dashboard') {
      if (streak > 0) {
        newMessage = `Welcome back! You're on a ${streak}-day streak! 🔥`;
      } else {
        newMessage = `Hello! Ready to learn something new today? 🚀`;
      }
    } else if (currentView === 'study') {
      newMessage = `Focus time! Read carefully, I'm cheering for you! 🧠`;
    } else if (currentView === 'stats') {
      newMessage = `Look at those numbers! You're making great progress! 📈`;
    }

    if (newMessage) {
      setShowBubble(false);
      setTimeout(() => {
        setMessage(newMessage);
        setShowBubble(true);
      }, 300);
    }
  }, [currentView, streak]);

  return (
    <div className={`mascot-container ${isMinimized ? 'minimized' : ''}`}>
      {!isMinimized && showBubble && message && (
        <div className="speech-bubble">
          {message}
          <button className="close-bubble" onClick={() => setShowBubble(false)}>×</button>
        </div>
      )}
      
      <div className="mascot-character" onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? "Click to wake up!" : "Click to hide"}>
        <img src="/mascot.jpg" alt="Assistant Mascot" className="mascot-img" />
        {isMinimized && <div className="mascot-badge">!</div>}
      </div>
    </div>
  );
};

export default MascotAssistant;
