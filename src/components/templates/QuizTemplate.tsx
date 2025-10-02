import React from 'react';
import { QuizHeader } from '@/components/organisms/QuizHeader';
import { QuestionCard } from '@/components/molecules/QuestionCard';
import { GeometryShape } from '@/components/molecules/GeometryShape';
import { AnswerGrid } from '@/components/organisms/AnswerGrid';
import { Button } from '@/components/atoms/Button';
import { Question } from '@/types/quiz';
import { User } from '@/types/user';
import './QuizTemplate.css';

interface QuizTemplateProps {
  currentUser: User | null;
  currentQuestion: Question;
  score: number;
  questionsAnswered: number;
  selectedAnswer: number | null;
  showResult: boolean;
  questionMode: 'mixed' | 'arithmetic' | 'geometry';
  onModeChange: (mode: 'mixed' | 'arithmetic' | 'geometry') => void;
  onAnswerClick: (index: number) => void;
  onLeaderboardClick: () => void;
  onResetClick: () => void;
}

export const QuizTemplate: React.FC<QuizTemplateProps> = ({
  currentUser,
  currentQuestion,
  score,
  questionsAnswered,
  selectedAnswer,
  showResult,
  questionMode,
  onModeChange,
  onAnswerClick,
  onLeaderboardClick,
  onResetClick,
}) => {
  return (
    <div className="math-quiz">
      <QuizHeader
        currentUser={currentUser}
        score={score}
        questionsAnswered={questionsAnswered}
        questionMode={questionMode}
        onModeChange={onModeChange}
        onLeaderboardClick={onLeaderboardClick}
      />

      <div className="quiz-content">
        <div className="question-section">
          <QuestionCard question={currentQuestion}>
            {currentQuestion.type === "geometry" && currentQuestion.shape && (
              <GeometryShape shape={currentQuestion.shape} />
            )}
          </QuestionCard>
        </div>

        <div className="answers-section">
          <AnswerGrid
            options={currentQuestion.options}
            selectedAnswer={selectedAnswer}
            correctAnswer={currentQuestion.correctAnswer}
            showResult={showResult}
            onAnswerClick={onAnswerClick}
          />
        </div>
      </div>

      <div className="quiz-footer">
        <Button
          variant="secondary"
          className="reset-button"
          onClick={onResetClick}
        >
          Reset Quest
        </Button>
      </div>
    </div>
  );
};
