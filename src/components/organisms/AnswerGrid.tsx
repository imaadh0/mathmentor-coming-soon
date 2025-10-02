import React from 'react';
import { Button } from '@/components/atoms/Button';
import './AnswerGrid.css';

interface AnswerGridProps {
  options: string[];
  selectedAnswer: number | null;
  correctAnswer: number;
  showResult: boolean;
  onAnswerClick: (index: number) => void;
}

export const AnswerGrid: React.FC<AnswerGridProps> = ({
  options,
  selectedAnswer,
  correctAnswer,
  showResult,
  onAnswerClick,
}) => {
  return (
    <div className="answers-grid">
      {options.map((option, index) => (
        <Button
          key={index}
          className={`answer-option ${
            selectedAnswer === index
              ? index === correctAnswer
                ? "correct"
                : "incorrect"
              : ""
          } ${
            showResult && index === correctAnswer
              ? "highlight-correct"
              : ""
          }`}
          onClick={() => onAnswerClick(index)}
          disabled={selectedAnswer !== null}
        >
          <span className="option-letter">
            {String.fromCharCode(65 + index)}
          </span>
          <span className="option-value">{option}</span>
        </Button>
      ))}
    </div>
  );
};
