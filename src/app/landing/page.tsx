import React from 'react';
import '@/styles/landing.css';

export default function Landing() {
  return (
    <main className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Your Campus. Smarter. Always One Step Ahead.</h1>
          <p className="hero-subtitle">
            AI-powered navigation that knows where your next class is, detects classroom changes in real time, and guides you there before you're late.
          </p>
          <div className="hero-cta">
            <a href="/app" className="cta-primary">Open Smart Navigation</a>
            <a href="#ai-explore" className="cta-secondary">Explore AI</a>
          </div>
        </div>
        {/* Placeholder for interactive campus map visualization */}
        <div className="hero-map" aria-label="Interactive campus map placeholder" role="img" />
      </section>
      {/* Additional sections will be added later */}
    </main>
  );
}
