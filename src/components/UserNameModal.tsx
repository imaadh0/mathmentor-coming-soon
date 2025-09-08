import React, { useState } from "react";
import "./UserNameModal.css";

interface UserNameModalProps {
  isOpen: boolean;
  onSubmit: (name: string) => void;
}

const UserNameModal: React.FC<UserNameModalProps> = ({ isOpen, onSubmit }) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return;

    setIsSubmitting(true);
    onSubmit(name.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim().length >= 2) {
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`user-name-modal-overlay ${isOpen ? "show" : ""}`}>
      <div className="user-name-modal">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-icon">🎯</div>
            <h2 className="modal-title">Welcome, Hero!</h2>
            <p className="modal-subtitle">
              Enter your name to begin your math quest and track your progress
            </p>
          </div>

          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="hero-name" className="input-label">
                Your Hero Name
              </label>
              <input
                id="hero-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your name..."
                className="name-input"
                maxLength={20}
                autoFocus
                disabled={isSubmitting}
              />
              <div className="input-hint">{name.length}/20 characters</div>
            </div>

            <div className="modal-actions">
              <button
                type="submit"
                className="start-quest-btn"
                disabled={name.trim().length < 2 || isSubmitting}
              >
                {isSubmitting ? "Starting..." : "Start Quest!"}
              </button>
            </div>
          </form>

          <div className="modal-footer">
            <div className="quest-info">
              <div className="info-item">
                <span className="info-icon">⚔️</span>
                <span className="info-text">Earn XP for correct answers</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🏆</span>
                <span className="info-text">Compete on the leaderboard</span>
              </div>
              <div className="info-item">
                <span className="info-icon">📊</span>
                <span className="info-text">Track your progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNameModal;
