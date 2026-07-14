import React, { useState, useRef } from 'react';
import { Translate, X } from '@phosphor-icons/react';
import './DictionaryTool.css';

// We will fetch the large dictionary dynamically to avoid bundling a 5MB JSON file.
let cachedDictionary = null;

const DictionaryTool = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef(null);

  const toggleTool = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleTranslate = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const word = inputText.trim().toLowerCase();
    setIsLoading(true);
    setResult(null);

    // Check if it's a sentence (simple check: spaces)
    if (word.split(' ').length > 2) {
      await fetchGoogleTranslate(word);
      setInputText('');
      setIsLoading(false);
      return;
    }

    // 1. Fetch POS and Example from Free Dictionary API
    let dictPos = '';
    let dictExample = '';
    
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data[0] && data[0].meanings) {
          const parts = [...new Set(data[0].meanings.map(m => m.partOfSpeech))];
          dictPos = parts.join(', ');
          
          for (const meaning of data[0].meanings) {
            for (const def of meaning.definitions) {
              if (def.example) {
                dictExample = def.example;
                break;
              }
            }
            if (dictExample) break;
          }
        }
      }
    } catch (error) {
      console.log("Dictionary API error:", error);
    }

    // 2. Fetch Thai Meaning (Lexitron or Google)
    if (!cachedDictionary) {
      try {
        const res = await fetch('/lexitron.json');
        cachedDictionary = await res.json();
      } catch (e) {
        cachedDictionary = {};
      }
    }

    const localResult = cachedDictionary[word];
    let finalMeaning = '';
    let finalPos = dictPos; // Prioritize English Dictionary API POS
    
    if (localResult) {
      finalMeaning = localResult.meaning;
      if (!finalPos) finalPos = localResult.pos;
    } else {
      try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=th&dt=t&q=${encodeURIComponent(word)}`);
        const data = await response.json();
        if (data && data[0]) {
          data[0].forEach(chunk => {
            if (chunk[0]) finalMeaning += chunk[0];
          });
        }
      } catch (err) {
        finalMeaning = "Not found";
      }
    }

    setResult(
      <div className="dict-result">
        <strong>{word}</strong> {finalPos && <span className="pos">({finalPos})</span>}
        <p className="meaning">Translation: {finalMeaning}</p>
        {dictExample && (
          <div className="example-box">
            <small>Example:</small>
            <p>"{dictExample}"</p>
          </div>
        )}
      </div>
    );
    
    setInputText('');
    setIsLoading(false);
  };

  const fetchGoogleTranslate = async (text) => {
    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=th&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      
      let translatedText = '';
      if (data && data[0]) {
        data[0].forEach(chunk => {
          if (chunk[0]) translatedText += chunk[0];
        });
      }
      
      setResult(
        <div className="dict-result">
          <strong>{text}</strong> <span className="pos">(Auto)</span>
          <p className="meaning">Translation: {translatedText}</p>
          <p className="example">*Google Translate</p>
        </div>
      );
    } catch (err) {
      console.error("Translation error", err);
      setResult(<div className="dict-error">Translation failed. Please try again.</div>);
    }
  };

  return (
    <div className="dictionary-tool-container">
      {isOpen && (
        <div className="dictionary-panel">
          <div className="dictionary-header">
            <h3>Dictionary</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>
          
          <div className="dictionary-content">
            {isLoading && <div className="dict-loading">Searching...</div>}
            {!isLoading && result && result}
            {!isLoading && !result && (
              <div className="dict-empty">
                Enter an English word or sentence to translate to Thai.
              </div>
            )}
          </div>
          
          <form onSubmit={handleTranslate} className="dictionary-form">
            <input 
              ref={inputRef}
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Search dictionary..."
              className="dictionary-input"
            />
            <button type="submit" className="dictionary-submit" disabled={isLoading || !inputText.trim()}>
              <Translate size={18} />
            </button>
          </form>
        </div>
      )}
      
      {!isOpen && (
        <button className="dictionary-fab" onClick={toggleTool} title="Dictionary">
          <Translate size={24} weight="bold" />
        </button>
      )}
    </div>
  );
};

export default DictionaryTool;
