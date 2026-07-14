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

  const handleTranslate = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const word = inputText.trim().toLowerCase();
    
    const localResult = dictionary[word];
    if (localResult) {
      setMessage(
        <div className="dict-result">
          <strong>{word}</strong> <span className="pos">({localResult.pos})</span>
          <p className="meaning">แปลว่า: {localResult.meaning}</p>
          <p className="example">" {localResult.example} "</p>
        </div>
      );
    } else {
      // Fallback to Google Translate API
      setMessage(`กำลังค้นหาคำว่า "${word}"... 🔍`);
      try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=th&dt=t&q=${encodeURIComponent(word)}`);
        const data = await response.json();
        const translatedText = data[0][0][0];
        
        setMessage(
          <div className="dict-result">
            <strong>{word}</strong> <span className="pos">(Auto)</span>
            <p className="meaning">แปลว่า: {translatedText}</p>
            <p className="example" style={{fontSize: '0.75rem', marginTop: '10px'}}>*แปลด้วย Google Translate</p>
          </div>
        );
      } catch (err) {
        console.error("Translation error", err);
        setMessage(`❌ ขออภัยครับ ผมค้นหาคำว่า "${word}" ไม่สำเร็จ ลองใหม่อีกครั้งนะ`);
      }
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
