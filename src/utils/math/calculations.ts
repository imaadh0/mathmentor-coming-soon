import { round } from 'mathjs';

export const calculateAccuracy = (correctAnswers: number, totalQuestions: number): number => {
  return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
};

export const formatNumber = (value: number, precision: number = 1): string => {
  return round(value, precision).toString();
};

export const formatXP = (xp: number): string => {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
};
