import React from "react";
import "./ComingSoonBackground.css";

const ComingSoonBackground: React.FC = () => {
  return (
    <div className="coming-soon-background">
      {/* Base Color Fill */}
      <div className="base-color-fill" />

      {/* Grouped Background Image */}
      <div className="bg-image grouped-bg" />

      {/* Dark Overlay with Center Fade */}
      <div className="dark-overlay" />

      {/* Section 1: Coming Soon Header */}
      <section className="hero-section">
        <div className="torch-left">🔥</div>
        <div className="hero-content">
          <h1 className="coming-soon-title">COMING SOON !!</h1>
          <p className="hero-subtitle">
            Heroes will rise... Guides will lead... Alliances
            <br />
            will be formed... The <span className="highlight">MATHMENTOR</span>
            <br />
            awaits
          </p>
        </div>
        <div className="torch-right">🔥</div>
      </section>

      {/* Section 2: Game Content Area */}
      <section className="game-content-section">
        <div className="game-content-placeholder">
          <p>Game content</p>
        </div>
      </section>

      {/* Section 3: Join Quest Early */}
      <section className="join-quest-section">
        <div className="parchment-container">
          <h2 className="quest-title">Join the Quest Early !</h2>
          <p className="quest-subtitle">
            Add your name to the adventure scroll
            <br />
            And be the first to know when MathMentor
            <br />
            arrives
          </p>
          <form className="quest-form">
            <input type="text" placeholder="Name" className="form-input" />
            <input type="email" placeholder="Email" className="form-input" />
            <button type="submit" className="join-button">
              JOIN
            </button>
          </form>
        </div>
        <div className="treasure-map-decoration">⚔️</div>
      </section>
    </div>
  );
};

export default ComingSoonBackground;
