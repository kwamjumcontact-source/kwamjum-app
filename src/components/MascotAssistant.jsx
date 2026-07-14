import React, { useState, useEffect, useRef } from 'react';
import './MascotAssistant.css';

// We will fetch the large dictionary dynamically to avoid bundling a 5MB JSON file.
let cachedDictionary = null;

const MascotAssistant = ({ currentView, streak, totalStudied, userName, decks, startStudy }) => {
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
    // Random periodic messages (every 1 min)
    const interval = setInterval(() => {
      if (chatMode) return;
      
      const randomMessages = [
        `สู้ๆ นะ ${userName}! พักสายตาบ้างล่ะ 👀`,
        `คุณมี Streak ติดต่อกัน ${streak} วันแล้ว เจ๋งมาก! 🔥`,
        `วันนี้คุณเรียนไป ${totalStudied} การ์ดแล้วนะ เก่งสุดๆ! 🚀`,
        `มีศัพท์คำไหนไม่เข้าใจ กดปุ่ม T หรือคลิกที่ตัวผมเพื่อถามได้เลยนะ! 🤓`,
        `แวะมาทักทายครับ ${userName}! ขอให้เป็นวันที่ดีนะ 🌟`,
        `ลืมอะไรไปรึเปล่า? ทบทวนศัพท์บ่อยๆ จะทำให้จำแม่นขึ้นนะ! 🧠`
      ];
      
      const randomIndex = Math.floor(Math.random() * randomMessages.length);
      setMessage(randomMessages[randomIndex]);
      setShowBubble(true);
      
      // Auto hide bubble after 10 seconds if not clicked
      setTimeout(() => setShowBubble(false), 10000);
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [currentView, chatMode, streak, totalStudied, userName]);

  const handleMascotClick = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setShowBubble(true);
    } else {
      setChatMode(!chatMode);
      if (!chatMode) {
        setMessage('สวัสดีครับ มีคำศัพท์อะไรอยากให้ผมแปล พิมพ์บอกได้เลย! 🤖');
      } else {
        setMessage('กลับมาสู่โหมดปกติแล้วครับ! ทบทวนศัพท์ต่อได้เลย 📚');
      }
    }
  };

  const handleStudyFirstDeck = (e) => {
    e.stopPropagation(); // Prevent opening chat
    if (decks && decks.length > 0) {
      startStudy(decks[0].id);
      setMessage('เริ่มลุยเรียนการ์ดกองแรกกันเลย! 🚀');
    } else {
      setMessage('ยังไม่มี Deck เลยครับ ลองสร้างดูก่อนนะ! 📝');
      setTimeout(() => setShowBubble(false), 4000);
    }
  };

  const handleTranslate = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const word = inputText.trim().toLowerCase();

    // Check if it's a sentence (simple check: spaces)
    if (word.split(' ').length > 2) {
      setMessage(`กำลังค้นหาคำแปลของประโยคนี้... 🔍`);
      await fetchGoogleTranslate(word);
      setInputText('');
      return;
    }

    // Load Lexitron dictionary if not loaded
    if (!cachedDictionary) {
      setMessage(`กำลังโหลดพจนานุกรม Lexitron (5MB) ครั้งแรก... 📚`);
      try {
        const res = await fetch('/lexitron.json');
        cachedDictionary = await res.json();
      } catch (e) {
        console.error("Failed to load lexitron", e);
        cachedDictionary = {};
      }
    }

    const localResult = cachedDictionary[word];
    if (localResult) {
      setMessage(
        <div className="dict-result">
          <strong>{word}</strong> <span className="pos">({localResult.pos})</span>
          <p className="meaning">แปลว่า: {localResult.meaning}</p>
        </div>
      );
    } else {
      // Fallback to Google Translate API
      setMessage(`ค้นหาคำว่า "${word}" ในระบบ... 🔍`);
      await fetchGoogleTranslate(word);
    }
    
    setInputText('');
  };

  const fetchGoogleTranslate = async (text) => {
    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=th&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      
      // Google Translate API sometimes returns multiple chunks for sentences
      let translatedText = '';
      if (data && data[0]) {
        data[0].forEach(chunk => {
          if (chunk[0]) translatedText += chunk[0];
        });
      }
      
      setMessage(
        <div className="dict-result">
          <strong>{text}</strong> <span className="pos">(Auto)</span>
          <p className="meaning">แปลว่า: {translatedText}</p>
          <p className="example" style={{fontSize: '0.75rem', marginTop: '10px'}}>*แปลด้วย Google Translate</p>
        </div>
      );
    } catch (err) {
      console.error("Translation error", err);
      setMessage(`❌ ขออภัยครับ ผมค้นหาคำว่า "${text}" ไม่สำเร็จ ลองใหม่อีกครั้งนะ`);
    }
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
      
      <div className="mascot-character" onClick={handleMascotClick}>
          <img src="/mascot.jpg" alt="Mascot" className="mascot-img" />
          {streak > 3 && <div className="mascot-badge">🔥</div>}
          
          {/* Radial Menu */}
          {!isMinimized && (
            <div className="radial-menu">
              <button 
                className="radial-btn btn-translate" 
                onClick={(e) => { e.stopPropagation(); setChatMode(true); setMessage('พิมพ์คำศัพท์ที่อยากให้ผมแปลได้เลยครับ! 🤖'); }}
                title="Translate"
              >
                T
              </button>
              <button 
                className="radial-btn btn-study" 
                onClick={handleStudyFirstDeck}
                title="Study First Deck"
              >
                S
              </button>
            </div>
          )}
        </div>
    </div>
  );
};

export default MascotAssistant;
