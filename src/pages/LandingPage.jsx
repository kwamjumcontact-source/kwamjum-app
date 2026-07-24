import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, ChartLineUp, Infinity, CaretRight, ShieldCheck, CaretDown } from '@phosphor-icons/react';
import './LandingPage.css';

const faqData = [
  {
    q: 'How does spaced repetition work?',
    a: 'Our algorithm tracks how well you know each card and schedules reviews at the optimal time — right before you would forget. This maximizes long-term retention with minimal study time.'
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. All data is encrypted and stored securely in the cloud using Supabase (powered by PostgreSQL). Your flashcards are synced across all your devices in real-time.'
  },
  {
    q: 'Can I import my existing flashcards?',
    a: 'Yes! Kwamjum supports importing decks from JSON and CSV files. You can also export your decks at any time for backup or sharing.'
  },
  {
    q: 'Is Kwamjum free to use?',
    a: 'Yes, Kwamjum is completely free to use with all core features included. We believe effective learning tools should be accessible to everyone.'
  },
];

const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  if (loading) {
    return (
      <div className="landing-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-container">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <Brain size={28} weight="fill" color="var(--primary-color)" />
          <span>Kwamjum</span>
        </div>
        <div className="nav-actions">
          <button className="nav-login-btn" onClick={() => navigate('/login')}>Log In</button>
          <button className="nav-signup-btn" onClick={() => navigate('/login')}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-badge">Kwamjum v3.0 — Now with keyboard shortcuts</div>
        <h1 className="hero-title">
          Master any topic,
          <span className="text-gradient"> significantly faster.</span>
        </h1>
        <p className="hero-subtitle">
          The enterprise-grade flashcard engine powered by advanced spaced repetition algorithms. Built for serious learners, professionals, and students who demand the best.
        </p>
        <div className="hero-cta-group">
          <button className="hero-primary-btn" onClick={() => navigate('/login')}>
            Start Learning for Free <CaretRight size={20} weight="bold" />
          </button>
        </div>
        <div className="hero-trust">
          <ShieldCheck size={20} color="var(--success-color)" />
          <span>Secure, private, and synced across all your devices.</span>
        </div>
      </header>

      {/* Product Mockup Section */}
      <section className="mockup-section">
        <div className="mockup-container" aria-hidden="true">
          <div className="mockup-header">
            <div className="mockup-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
          <div className="mockup-body">
            <div className="mockup-sidebar"></div>
            <div className="mockup-content">
              <div className="mockup-card"></div>
              <div className="mockup-grid">
                <div className="mockup-box"></div>
                <div className="mockup-box"></div>
                <div className="mockup-box"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <h2>Why professionals choose Kwamjum</h2>
          <p>We stripped away the noise and built a scientifically proven learning tool.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Brain size={32} weight="duotone" color="var(--primary-color)" />
            </div>
            <h3>Spaced Repetition</h3>
            <p>Our algorithm predicts exactly when you are about to forget a card, maximizing your retention with minimal study time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <ChartLineUp size={32} weight="duotone" color="var(--primary-color)" />
            </div>
            <h3>Advanced Analytics</h3>
            <p>Track your learning streak, retention rates, and daily activity heatmaps to stay motivated and informed.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Infinity size={32} weight="duotone" color="var(--primary-color)" />
            </div>
            <h3>Limitless Creation</h3>
            <p>Import decks from CSV or JSON, create custom cards, and organize everything perfectly. No artificial limits.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="faq-header">
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq-list">
          {faqData.map((item, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                <span>{item.q}</span>
                <CaretDown size={20} weight="bold" className="faq-caret" />
              </button>
              <div className="faq-answer">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <Brain size={24} weight="fill" color="var(--primary-color)" />
            <span>Kwamjum</span>
          </div>
          <p className="footer-copyright">&copy; {new Date().getFullYear()} Kwamjum Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
