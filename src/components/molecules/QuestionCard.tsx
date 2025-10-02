import React from 'react';
import { Question } from '@/types/quiz';
import './QuestionCard.css';

interface QuestionCardProps {
  question: Question;
  children?: React.ReactNode;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, children }) => {
  return (
    <div className={`question-card ${question.type === "geometry" ? "geometry" : ""}`}>
      <div className="question-label">
        {question.type === "geometry"
          ? "Solve this geometry problem:"
          : "Solve this equation:"}
      </div>
      <div className="question-text">{question.question}</div>
      {children}
    </div>
  );
};
