export interface User {
  id: string;
  name: string;
  xp: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  lastPlayed: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  accuracy: number;
  totalQuestions: number;
  rank: number;
}
