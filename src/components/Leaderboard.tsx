import React, { useState, useEffect } from "react";
import { userManager, type LeaderboardEntry } from "../utils/userManager";
import "./Leaderboard.css";
import { BarChart3Icon, Crown, Medal } from "lucide-react";

interface LeaderboardProps {
  onFlipBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onFlipBack }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser] = useState(userManager.getCurrentUser());
  const [userRank, setUserRank] = useState<number>(0);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const entries = await userManager.getLeaderboard(10);
      setLeaderboard(entries);

      if (currentUser) {
        const rank = await userManager.getUserRank(currentUser.id);
        setUserRank(rank);
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  };

  const getRankIcon = (rank: number): React.ReactNode => {
    switch (rank) {
      case 1:
        return <Crown />;
      case 2:
        return <Medal />;
      case 3:
        return <Medal />;
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return "#FFD700";
      case 2:
        return "#C0C0C0";
      case 3:
        return "#CD7F32";
      default:
        return "#fdcb3f";
    }
  };

  const formatXP = (xp: number): string => {
    if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}K`;
    }
    return xp.toString();
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2 className="leaderboard-title">Hall of Heroes</h2>
        <button className="flip-back-btn" onClick={onFlipBack}>
          ← Back to Quest
        </button>
      </div>

      <div className="leaderboard-content">
        {leaderboard.length === 0 ? (
          <div className="no-data">
            <div className="no-data-icon">
              <BarChart3Icon />{" "}
            </div>
            <div className="no-data-text">No heroes yet!</div>
            <div className="no-data-subtext">
              Complete some math quests to appear on the leaderboard
            </div>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`leaderboard-entry ${
                  entry.id === currentUser?.id ? "current-user" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="rank-section">
                  <div
                    className="rank-icon"
                    style={{ color: getRankColor(entry.rank) }}
                  >
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="rank-number">#{entry.rank}</div>
                </div>

                <div className="user-info">
                  <div className="user-name">
                    {entry.name}
                    {entry.id === currentUser?.id && (
                      <span className="you-badge">(You)</span>
                    )}
                  </div>
                  <div className="user-stats">
                    <span className="stat">
                      <span className="stat-label">XP:</span>
                      <span className="stat-value xp">
                        {formatXP(entry.xp)}
                      </span>
                    </span>
                    <span className="stat">
                      <span className="stat-label">Accuracy:</span>
                      <span className="stat-value accuracy">
                        {entry.accuracy}%
                      </span>
                    </span>
                    <span className="stat">
                      <span className="stat-label">Questions:</span>
                      <span className="stat-value questions">
                        {entry.totalQuestions}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="xp-bar-container">
                  <div className="xp-bar">
                    <div
                      className="xp-fill"
                      style={{
                        width: `${Math.min(
                          (entry.xp /
                            Math.max(leaderboard[0]?.xp || 1, entry.xp)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentUser && (
        <div className="current-user-summary">
          <div className="summary-title">Your Quest Progress</div>
          <div className="summary-stats">
            <div className="summary-stat">
              <span className="summary-label">Total XP:</span>
              <span className="summary-value">{formatXP(currentUser.xp)}</span>
            </div>
            <div className="summary-stat">
              <span className="summary-label">Rank:</span>
              <span className="summary-value">#{userRank}</span>
            </div>
            <div className="summary-stat">
              <span className="summary-label">Accuracy:</span>
              <span className="summary-value">{currentUser.accuracy}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="leaderboard-footer">
        <div className="footer-text">Keep solving to climb the ranks!</div>
      </div>
    </div>
  );
};

export default Leaderboard;
