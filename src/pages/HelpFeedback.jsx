import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './HelpFeedback.css';

const HelpFeedback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');
  // We use standard HTML form submission to FormSubmit so that the initial activation UI works.
  const handleFeedbackChange = (e) => setFeedback(e.target.value);

  return (
    <div className="help-page">
      <div className="help-header-nav">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      <h1 className="help-page-title">Help & Feedback</h1>

      <div className="help-content-grid">
        {/* FAQ Section */}
        <div className="help-card faq-section">
          <h2>Frequently Asked Questions</h2>
          
          <div className="faq-item">
            <h3>🧠 How does the spaced repetition algorithm work?</h3>
            <p>
              We use a modified version of the SM-2 algorithm (similar to Anki). 
              When you rate a card "Easy", the interval before you see it again increases significantly. 
              If you rate it "Again", it resets to a learning phase so you can master it quickly.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>📝 How do I use Fill-in-the-blank (Cloze) cards?</h3>
            <p>
              When creating a Cloze card, put the hidden word in the "Answer" field. 
              In the "Question" field, use <code>[...]</code> to represent where the blank should be. 
              For example: <em>"The capital of Japan is [...]."</em>
            </p>
          </div>
          
          <div className="faq-item">
            <h3>⚙️ What does "Auto-flip" do?</h3>
            <p>
              In Settings, you can set "Auto-flip" to a number of seconds. 
              When studying, the card will automatically flip and reveal the answer after that many seconds, 
              keeping you focused and saving you a click!
            </p>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="help-card feedback-section">
          <h2>Send Feedback</h2>
          <p className="feedback-desc">Have a suggestion or found a bug? Let us know!</p>
          
          <form action="https://formsubmit.co/kwamjum.contact@gmail.com" method="POST" target="_blank" className="feedback-form">
            <input type="hidden" name="_subject" value="New Feedback from Kwamjum App" />
            <input type="hidden" name="email" value={user?.email || "no-reply@kwamjum.com"} />
            <input type="hidden" name="name" value={user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Kwamjum User"} />
            
            <textarea 
              name="message"
              placeholder="Tell us what you think..." 
              value={feedback}
              onChange={handleFeedbackChange}
              rows="5"
              required
            />
            <button type="submit" className="submit-feedback-btn" disabled={!feedback.trim()}>
              Send Feedback
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HelpFeedback;
