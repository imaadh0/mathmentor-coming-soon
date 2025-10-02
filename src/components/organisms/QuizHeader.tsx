import React from 'react';
import { TrophyIcon } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { User } from '@/types/user';
import './QuizHeader.css';

interface QuizHeaderProps {
  currentUser: User | null;
  score: number;
  questionsAnswered: number;
  questionMode: 'mixed' | 'arithmetic' | 'geometry';
  onModeChange: (mode: 'mixed' | 'arithmetic' | 'geometry') => void;
  onLeaderboardClick: () => void;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({
  currentUser,
  score,
  questionsAnswered,
  questionMode,
  onModeChange,
  onLeaderboardClick,
}) => {
  return (
    <div className="quiz-header">
      <div className="header-top">
        <h2 className="quiz-title">Math Quest Challenge</h2>
        <Button
          variant="icon"
          className="leaderboard-toggle-btn"
          onClick={onLeaderboardClick}
        >
          <TrophyIcon /> Leaderboard
        </Button>
      </div>

      <div className="stats-container">
        <div className="player-info-row">
          {currentUser && (
            <>
              <div className="user-name">Hero: {currentUser.name}</div>
              <div className="user-xp">XP: {currentUser.xp}</div>
            </>
          )}
        </div>

        <div className="mode-stats-row">
          <div className="question-mode-selector">
            <Button
              variant={questionMode === "mixed" ? "primary" : "secondary"}
              onClick={() => onModeChange("mixed")}
            >
              Mixed
            </Button>
            <Button
              variant={questionMode === "arithmetic" ? "primary" : "secondary"}
              onClick={() => onModeChange("arithmetic")}
            >
              Arithmetic
            </Button>
            <Button
              variant={questionMode === "geometry" ? "primary" : "secondary"}
              onClick={() => onModeChange("geometry")}
            >
              Geometry
            </Button>
          </div>

          <div className="quiz-stats">
            <span className="score">Score: {score}</span>
            <span className="questions-count">
              Questions: {questionsAnswered}
            </span>
            <span className="accuracy">
              Accuracy:{" "}
              {questionsAnswered > 0
                ? Math.round((score / questionsAnswered) * 100)
                : 0}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
