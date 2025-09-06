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
        <div className="torch-left">
          <img src="/images/torch.png" alt="Left torch" />
        </div>
        <div className="hero-content">
          <h1 className="coming-soon-title">COMING SOON !!</h1>
          <p className="hero-subtitle">
            Heroes will rise... Guides will lead... Alliances
            <br />
            will be formed... The MathMentor
            <br />
            awaits
          </p>
          <div className="yellow-border-decoration">
            <img src="/images/yellow-border.png" alt="Decorative border" />
          </div>
        </div>
        <div className="torch-right">
          <img src="/images/torch.png" alt="Right torch" />
        </div>
      </section>

      {/* Section 2: Game Content Area */}
      <section className="game-content-section">
        <div className="game-content-placeholder">
          <p>Game content</p>
        </div>
      </section>

      {/* Section 3: Contact Us */}
      <section className="contact-us-section">
        <div className="bg-element-1">
          <img src="/images/bg-element-1.png" alt="Background element" />
        </div>
        <div className="contact-us-container">
          <div className="contact-us-background">
            <img src="/images/contactus-bg.png" alt="Contact us background" />
          </div>

          {/* NEW: Headline + Subtitle on the parchment */}
          <div className="contact-copy">
            <h2 className="contact-title">Join the Quest Early !</h2>
            <p className="contact-subtitle">
              Add your name to the adventure scroll!
              <br />
              And be the first to know about{" "}
              <span className="brand">MathMentor</span>
            </p>
          </div>

          <div className="contact-form">
            <input type="text" placeholder="Name" className="form-input" />
            <input type="email" placeholder="Email" className="form-input" />
            <button type="submit" className="contact-button">
              <img
                src="/images/Contact-us-btn-bg.png"
                alt="Contact us button"
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComingSoonBackground;
