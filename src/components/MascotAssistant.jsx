import React, { useState, useEffect, useRef } from 'react';
import dictionary from '../lib/dictionary.json';
import './MascotAssistant.css';

const MascotAssistant = ({ currentView, streak, totalStudied }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [message, setMessage] = useState('');
  const [showBubble, setShowBubble] = useState(true);
  const [inputText, setInputText] = useState('');
  
  const inputRef = useRef(null);

  // Dynamic messages based on context (Only trigger if not in chat mode)
  useEffect(() => {
    if (chatMode) return;
    
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
  }, [currentView, streak, chatMode]);

  const handleMascotClick = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setShowBubble(true);
    } else {
      // Toggle chat mode instead of minimizing immediately
      if (!chatMode) {
        setChatMode(true);
        setMessage("พิมพ์คำศัพท์ภาษาอังกฤษที่อยากให้แปลได้เลยครับ!");
        setShowBubble(true);
        setTimeout(() => {
          if(inputRef.current) inputRef.current.focus();
        }, 100);
      } else {
        setChatMode(false);
        setIsMinimized(true);
      }
    }
  };

  const handleTranslate = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const word = inputText.trim().toLowerCase();
    
    // Check if it's a sentence (simple check: spaces)
    if (word.split(' ').length > 2) {
      setMessage(`ตอนนี้ผมแปลได้ทีละคำ (Dictionary) ครับ ลองพิมพ์คำสั้นๆ ดูก่อนนะ!`);
      setInputText('');
      return;
    }

    const result = dictionary[word];
    if (result) {
      setMessage(
        <div className="dict-result">
          <strong>{word}</strong> <span className="pos">({result.pos})</span>
          <p className="meaning">แปลว่า: {result.meaning}</p>
          <p className="example">" {result.example} "</p>
        </div>
      );
    } else {
      setMessage(`❌ ขออภัยครับ ผมยังไม่รู้จักคำว่า "${word}"`);
    }
    
    setInputText('');
  };

  return (
    <div className={`mascot-container ${isMinimized ? 'minimized' : ''}`}>
      {!isMinimized && showBubble && message && (
        <div className={`speech-bubble ${chatMode ? 'chat-mode-bubble' : ''}`}>
          <div className="bubble-content">
            {message}
          </div>
          
          {chatMode && (
            <form onSubmit={handleTranslate} className="mascot-chat-form">
              <input 
                ref={inputRef}
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a word..."
                className="mascot-input"
              />
              <button type="submit" className="mascot-submit">→</button>
            </form>
          )}

          <button className="close-bubble" onClick={(e) => {
            e.stopPropagation();
            setShowBubble(false);
            setChatMode(false);
          }}>×</button>
        </div>
      )}
      
      <div 
        className="mascot-character" 
        onClick={handleMascotClick} 
        title={isMinimized ? "Click to wake up!" : "Click to chat or minimize"}
      >
        <img src="/mascot.jpg" alt="Assistant Mascot" className="mascot-img" />
        {isMinimized && <div className="mascot-badge">!</div>}
      </div>
    </div>
  );
};

export default MascotAssistant;
