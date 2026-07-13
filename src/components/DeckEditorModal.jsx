import React, { useState, useRef, useEffect } from 'react';
import './DeckEditorModal.css';

const DeckEditorModal = ({ onClose, onSave, initialDeck = null }) => {
  const isEditMode = !!initialDeck;
  
  const [title, setTitle] = useState(initialDeck?.title || '');
  const [description, setDescription] = useState(initialDeck?.description || '');
  const [color, setColor] = useState(initialDeck?.color || '#3b82f6');
  
  const [cards, setCards] = useState(initialDeck?.cards || []);
  
  // Current card being drafted
  const [cardType, setCardType] = useState('basic');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [meaning, setMeaning] = useState('');
  
  // Cloze fields
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [fullSentence, setFullSentence] = useState('');
  
  // Image handling
  const [image, setImage] = useState(null);
  const [imagePosition, setImagePosition] = useState('front'); // 'front' or 'back'
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addCard = () => {
    let newCard = {};
    if (cardType === 'basic') {
      if (!front || !back) return alert('Front and Back are required!');
      newCard = { id: Date.now(), type: 'basic', front, back, meaning, image, imagePosition, dueDate: Date.now(), interval: 0, ease: 2.5 };
    } else {
      if (!question || !answer) return alert('Question and Answer are required for Cloze!');
      newCard = { id: Date.now(), type: 'cloze', question, answer, fullSentence, meaning, image, imagePosition, dueDate: Date.now(), interval: 0, ease: 2.5 };
    }
    
    setCards([...cards, newCard]);
    
    // Reset draft fields
    setFront(''); setBack(''); setMeaning('');
    setQuestion(''); setAnswer(''); setFullSentence('');
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeCard = (id) => {
    if(window.confirm('Are you sure you want to delete this card?')) {
      setCards(cards.filter(c => c.id !== id));
    }
  }

  const handleSave = () => {
    if (!title.trim()) return alert('Please enter a Deck Name');
    
    const savedDeck = {
      id: initialDeck?.id || Date.now(),
      title,
      description,
      color,
      cards: cards
    };
    onSave(savedDeck);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit Deck' : 'Create New Deck'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          {/* Deck Info */}
          <div className="section-block">
            <h3>Deck Details</h3>
            <div className="form-group">
              <input type="text" placeholder="Deck Name" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <input type="text" placeholder="Description (Optional)" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="form-group color-picker">
              <label>Theme Color:</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} />
            </div>
          </div>

          <div className="divider"></div>

          {/* Cards List Preview */}
          <div className="section-block">
            <h3>Cards in Deck ({cards.length})</h3>
            <div className="cards-preview-list">
              {cards.map((c, idx) => (
                <div key={c.id} className="mini-card">
                  <span className="card-idx">{idx + 1}</span>
                  <span className="card-snippet">
                    {c.type === 'basic' ? c.front : c.question}
                  </span>
                  {c.image && <span className="image-badge">📷</span>}
                  <button className="remove-card-btn" onClick={() => removeCard(c.id)}>🗑️</button>
                </div>
              ))}
              {cards.length === 0 && <p className="empty-text">No cards added yet.</p>}
            </div>
          </div>

          {/* Add Card Form */}
          <div className="section-block add-card-box">
            <h3>Add New Card</h3>
            
            <div className="type-selector">
              <button className={cardType === 'basic' ? 'active' : ''} onClick={() => setCardType('basic')}>Basic Card</button>
              <button className={cardType === 'cloze' ? 'active' : ''} onClick={() => setCardType('cloze')}>Fill-in-the-blank (Cloze)</button>
            </div>

            {cardType === 'basic' ? (
              <>
                <input type="text" placeholder="Front (e.g., Cat, 猫)" value={front} onChange={e => setFront(e.target.value)} />
                <input type="text" placeholder="Back (Answer)" value={back} onChange={e => setBack(e.target.value)} />
                <input type="text" placeholder="Meaning / Extra Info (Optional)" value={meaning} onChange={e => setMeaning(e.target.value)} />
              </>
            ) : (
              <>
                <input type="text" placeholder="Question (use [...] for blank, e.g. I am a [...])" value={question} onChange={e => setQuestion(e.target.value)} />
                <input type="text" placeholder="Answer (the hidden word)" value={answer} onChange={e => setAnswer(e.target.value)} />
                <input type="text" placeholder="Full Sentence (for back of card)" value={fullSentence} onChange={e => setFullSentence(e.target.value)} />
                <input type="text" placeholder="Meaning (Optional)" value={meaning} onChange={e => setMeaning(e.target.value)} />
              </>
            )}

            {/* Image Upload Area */}
            <div className="image-upload-area">
              <label className="upload-btn">
                📷 Upload Image
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} hidden />
              </label>
              
              {image && (
                <div className="image-preview-box">
                  <img src={image} alt="Preview" className="preview-img" />
                  <div className="image-controls">
                    <label>
                      <input type="radio" name="imgPos" checked={imagePosition === 'front'} onChange={() => setImagePosition('front')} /> 
                      Show on Front
                    </label>
                    <label>
                      <input type="radio" name="imgPos" checked={imagePosition === 'back'} onChange={() => setImagePosition('back')} /> 
                      Show on Back
                    </label>
                    <button className="remove-img-btn" onClick={removeImage}>Remove</button>
                  </div>
                </div>
              )}
            </div>

            <button className="add-card-btn" onClick={addCard}>+ Add Card to Deck</button>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-deck-btn" onClick={handleSave}>Save Deck</button>
        </div>
      </div>
    </div>
  );
};

export default DeckEditorModal;
