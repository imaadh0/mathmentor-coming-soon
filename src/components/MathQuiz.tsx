import React, { useState, useEffect, useRef } from "react";
import { round } from "mathjs";
import "./MathQuiz.css";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  operation: string;
  type: 'arithmetic' | 'geometry';
  shape?: {
    type: 'triangle' | 'rectangle';
    dimensions: number[];
    svgPath?: string;
  };
}

const MathQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questionMode, setQuestionMode] = useState<'mixed' | 'arithmetic' | 'geometry'>('mixed');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showWrongPopup, setShowWrongPopup] = useState(false);
  
  // Audio refs
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);

  // Generate random math questions based on selected mode
  const generateQuestion = (): Question => {
    let questionType: 'arithmetic' | 'geometry';
    
    switch (questionMode) {
      case 'arithmetic':
        questionType = 'arithmetic';
        break;
      case 'geometry':
        questionType = 'geometry';
        break;
      case 'mixed':
      default:
        // 50% chance of geometry, 50% arithmetic in mixed mode
        questionType = Math.random() > 0.5 ? 'geometry' : 'arithmetic';
        break;
    }
    
    if (questionType === 'geometry') {
      return generateGeometryQuestion();
    } else {
      return generateArithmeticQuestion();
    }
  };

  // Generate arithmetic questions (original functionality)
  const generateArithmeticQuestion = (): Question => {
    const operations = [
      { symbol: "+", name: "addition" },
      { symbol: "-", name: "subtraction" },
      { symbol: "×", name: "multiplication" },
      { symbol: "÷", name: "division" }
    ];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1: number, num2: number, correctAnswer: number;
    
    switch (operation.symbol) {
      case "+":
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        correctAnswer = num1 + num2;
        break;
      case "-":
        num1 = Math.floor(Math.random() * 50) + 25;
        num2 = Math.floor(Math.random() * 25) + 1;
        correctAnswer = num1 - num2;
        break;
      case "×":
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        correctAnswer = num1 * num2;
        break;
      case "÷":
        num2 = Math.floor(Math.random() * 12) + 1;
        correctAnswer = Math.floor(Math.random() * 12) + 1;
        num1 = num2 * correctAnswer;
        break;
      default:
        num1 = 1;
        num2 = 1;
        correctAnswer = 2;
    }

    // Generate wrong options
    const options: string[] = [];
    const wrongAnswers = new Set<number>();
    
    // Determine if correct answer is a whole number
    const isWholeNumber = correctAnswer === Math.floor(correctAnswer);
    
    // Add correct answer
    options.push(correctAnswer.toString());
    
    // Generate 3 wrong answers
    while (wrongAnswers.size < 3) {
      let wrongAnswer: number;
      if (operation.symbol === "÷") {
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
      } else if (operation.symbol === "×") {
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10;
      } else {
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10;
      }
      
      // Ensure wrong answer matches the format of correct answer
      if (isWholeNumber) {
        wrongAnswer = Math.round(wrongAnswer);
      }
      
      if (wrongAnswer !== correctAnswer && wrongAnswer > 0 && !wrongAnswers.has(wrongAnswer)) {
        wrongAnswers.add(wrongAnswer);
        options.push(wrongAnswer.toString());
      }
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    const correctIndex = options.indexOf(correctAnswer.toString());

    return {
      id: Math.random(),
      question: `${num1} ${operation.symbol} ${num2} = ?`,
      options,
      correctAnswer: correctIndex,
      operation: operation.name,
      type: 'arithmetic'
    };
  };

  // Generate geometry questions with visual shapes
  const generateGeometryQuestion = (): Question => {
    const shapes = ['triangle', 'rectangle'] as const;
    const questionTypes = ['area', 'perimeter'];
    
    const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let dimensions: number[];
    let correctAnswer: number;
    let questionText: string;
    let svgPath: string;
    
    switch (shapeType) {
      case 'triangle':
        if (questionType === 'area') {
          const base = Math.floor(Math.random() * 10) + 3;
          const height = Math.floor(Math.random() * 8) + 3;
          dimensions = [base, height];
          correctAnswer = round((base * height) / 2, 1);
          questionText = `What is the area of this triangle?`;
          svgPath = `M 50 20 L ${50 + base * 8} 20 L ${50 + (base * 8) / 2} ${20 + height * 8} Z`;
        } else {
          const side1 = Math.floor(Math.random() * 8) + 4;
          const side2 = Math.floor(Math.random() * 8) + 4;
          const side3 = Math.floor(Math.random() * 8) + 4;
          dimensions = [side1, side2, side3];
          correctAnswer = round(side1 + side2 + side3, 1);
          questionText = `What is the perimeter of this triangle?`;
          svgPath = `M 50 80 L 120 20 L 180 80 Z`;
        }
        break;
        
      case 'rectangle':
        const length = Math.floor(Math.random() * 8) + 4;
        const width = Math.floor(Math.random() * 6) + 3;
        dimensions = [length, width];
        
        if (questionType === 'area') {
          correctAnswer = round(length * width, 1);
          questionText = `What is the area of this rectangle?`;
        } else {
          correctAnswer = round(2 * (length + width), 1);
          questionText = `What is the perimeter of this rectangle?`;
        }
        
        svgPath = `M 50 30 L ${50 + length * 8} 30 L ${50 + length * 8} ${30 + width * 8} L 50 ${30 + width * 8} Z`;
        break;
        
      default:
        dimensions = [4, 3];
        correctAnswer = 12;
        questionText = "What is the area?";
        svgPath = "M 50 30 L 82 30 L 82 54 L 50 54 Z";
    }
    
    // Generate wrong options
    const options: string[] = [];
    const wrongAnswers = new Set<number>();
    
    // Determine if correct answer is a whole number
    const isWholeNumber = correctAnswer === Math.floor(correctAnswer);
    
    // Add correct answer
    options.push(isWholeNumber ? correctAnswer.toString() : correctAnswer.toString());
    
    // Generate 3 wrong answers
    while (wrongAnswers.size < 3) {
      let wrongAnswer: number;
      if (correctAnswer < 10) {
        wrongAnswer = correctAnswer + (Math.random() * 6 - 3);
      } else if (correctAnswer < 50) {
        wrongAnswer = correctAnswer + (Math.random() * 20 - 10);
      } else {
        wrongAnswer = correctAnswer + (Math.random() * 40 - 20);
      }
      
      // Round to match the format of correct answer
      if (isWholeNumber) {
        wrongAnswer = Math.round(wrongAnswer);
      } else {
        wrongAnswer = round(wrongAnswer, 1);
      }
      
      if (wrongAnswer !== correctAnswer && wrongAnswer > 0 && !wrongAnswers.has(wrongAnswer)) {
        wrongAnswers.add(wrongAnswer);
        options.push(isWholeNumber ? wrongAnswer.toString() : wrongAnswer.toString());
      }
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    const correctIndex = options.indexOf(correctAnswer.toString());

    return {
      id: Math.random(),
      question: questionText,
      options,
      correctAnswer: correctIndex,
      operation: `geometry-${shapeType}-${questionType}`,
      type: 'geometry',
      shape: {
        type: shapeType,
        dimensions,
        svgPath
      }
    };
  };

  // Initialize audio elements
  useEffect(() => {
    try {
      correctSoundRef.current = new Audio('/audio/correct.mp3');
      wrongSoundRef.current = new Audio('/audio/wrong.mp3');
      
      // Configure sound effects
      if (correctSoundRef.current) {
        correctSoundRef.current.volume = 0.6;
        correctSoundRef.current.preload = 'auto';
      }
      if (wrongSoundRef.current) {
        wrongSoundRef.current.volume = 0.6;
        wrongSoundRef.current.preload = 'auto';
      }
      
      console.log('Audio elements initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }, []);

  // Initialize with first question
  useEffect(() => {
    setCurrentQuestion(generateQuestion());
  }, []);


  // Update question when mode changes
  useEffect(() => {
    if (currentQuestion) {
      // Generate question based on current mode
      let questionType: 'arithmetic' | 'geometry';
      
      switch (questionMode) {
        case 'arithmetic':
          questionType = 'arithmetic';
          break;
        case 'geometry':
          questionType = 'geometry';
          break;
        case 'mixed':
        default:
          // 50% chance of geometry, 50% arithmetic in mixed mode
          questionType = Math.random() > 0.5 ? 'geometry' : 'arithmetic';
          break;
      }
      
      const newQuestion = questionType === 'geometry' ? generateGeometryQuestion() : generateArithmeticQuestion();
      setCurrentQuestion(newQuestion);
    }
  }, [questionMode]);

  const playCorrectSound = () => {
    if (correctSoundRef.current) {
      correctSoundRef.current.currentTime = 0;
      correctSoundRef.current.play().catch(console.error);
    }
  };

  const playWrongSound = () => {
    if (wrongSoundRef.current) {
      wrongSoundRef.current.currentTime = 0;
      wrongSoundRef.current.play().catch(console.error);
    }
  };


  const handleAnswerClick = (optionIndex: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;
    
    setSelectedAnswer(optionIndex);
    const correct = optionIndex === currentQuestion.correctAnswer;
    setShowResult(true);
    
    if (correct) {
      setScore(score + 1);
      setShowCelebration(true);
      playCorrectSound();
      // Hide celebration after 1.2 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 1200);
    } else {
      setShowWrongPopup(true);
      playWrongSound();
      // Hide wrong popup after 1.2 seconds
      setTimeout(() => {
        setShowWrongPopup(false);
      }, 1200);
    }
    
    setQuestionsAnswered(questionsAnswered + 1);

    // Auto-advance to next question after 1.5 seconds (optimized timing)
    setTimeout(() => {
      setCurrentQuestion(generateQuestion());
      setSelectedAnswer(null);
      setShowResult(false);
    }, 1500);
  };

  const resetQuiz = () => {
    setScore(0);
    setQuestionsAnswered(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowCelebration(false);
    setShowWrongPopup(false);
    setCurrentQuestion(generateQuestion());
  };

  const handleModeChange = (mode: 'mixed' | 'arithmetic' | 'geometry') => {
    setQuestionMode(mode);
    // The useEffect will handle generating a new question when mode changes
  };


  // Component for celebration popup
  const CelebrationPopup: React.FC = () => {
    return (
      <div className={`celebration-popup ${showCelebration ? 'show' : ''}`}>
        <div className="celebration-content">
          <div className="celebration-icon">🎉</div>
          <div className="celebration-text">Correct!</div>
          <div className="celebration-subtext">Great job!</div>
          <div className="confetti-container">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`confetti confetti-${i + 1}`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Component for wrong answer popup
  const WrongAnswerPopup: React.FC = () => {
    return (
      <div className={`wrong-popup ${showWrongPopup ? 'show' : ''}`}>
        <div className="wrong-content">
          <div className="wrong-text">Not quite!</div>
          <div className="wrong-subtext">Keep going, you've got this!</div>
          <div className="wrong-answer-display">
            Answer: {currentQuestion?.options[currentQuestion.correctAnswer]}
          </div>
        </div>
      </div>
    );
  };

  // Component for rendering geometry shapes
  const GeometryShape: React.FC<{ shape: NonNullable<Question['shape']> }> = ({ shape }) => {
    const { type, dimensions, svgPath } = shape;
    
    const renderDimensions = () => {
      switch (type) {
        case 'triangle':
          if (dimensions.length === 2) {
            return (
              <div className="shape-dimensions">
                <span>Base: {dimensions[0]} units</span>
                <span>Height: {dimensions[1]} units</span>
              </div>
            );
          } else {
            return (
              <div className="shape-dimensions">
                <span>Sides: {dimensions[0]}, {dimensions[1]}, {dimensions[2]} units</span>
              </div>
            );
          }
        case 'rectangle':
          return (
            <div className="shape-dimensions">
              <span>Length: {dimensions[0]} units</span>
              <span>Width: {dimensions[1]} units</span>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="geometry-shape">
        <svg width="240" height="120" viewBox="0 0 240 120" className="shape-svg">
          <defs>
            <linearGradient id="shapeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdcb3f" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#b8941f" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path
            d={svgPath}
            fill="url(#shapeGradient)"
            stroke="#fdcb3f"
            strokeWidth="2"
            className="shape-path"
          />
          {/* Add dimension labels for better clarity */}
          {type === 'rectangle' && (
            <>
              <text x={50 + (dimensions[0] * 8) / 2} y={25} fill="#fdcb3f" fontSize="10" textAnchor="middle">
                {dimensions[0]}
              </text>
              <text x={45} y={30 + (dimensions[1] * 8) / 2} fill="#fdcb3f" fontSize="10" textAnchor="middle">
                {dimensions[1]}
              </text>
            </>
          )}
        </svg>
        {renderDimensions()}
      </div>
    );
  };

  if (!currentQuestion) {
    return <div className="math-quiz loading">Loading...</div>;
  }

  return (
    <div className="math-quiz">
      <div className="quiz-header">
        <h2 className="quiz-title">Math Quest Challenge</h2>
        
        <div className="question-mode-selector">
          <button 
            className={`mode-btn ${questionMode === 'mixed' ? 'active' : ''}`}
            onClick={() => handleModeChange('mixed')}
          >
            Mixed
          </button>
          <button 
            className={`mode-btn ${questionMode === 'arithmetic' ? 'active' : ''}`}
            onClick={() => handleModeChange('arithmetic')}
          >
            Arithmetic
          </button>
          <button 
            className={`mode-btn ${questionMode === 'geometry' ? 'active' : ''}`}
            onClick={() => handleModeChange('geometry')}
          >
            Geometry
          </button>
        </div>
        
        <div className="quiz-stats">
          <span className="score">Score: {score}</span>
          <span className="questions-count">Questions: {questionsAnswered}</span>
          <span className="accuracy">
            Accuracy: {questionsAnswered > 0 ? Math.round((score / questionsAnswered) * 100) : 0}%
          </span>
        </div>
      </div>

      <div className="quiz-content">
        <div className="question-section">
          <div className={`question-card ${currentQuestion.type === 'geometry' ? 'geometry' : ''}`}>
            <div className="question-label">
              {currentQuestion.type === 'geometry' ? 'Solve this geometry problem:' : 'Solve this equation:'}
            </div>
            <div className="question-text">{currentQuestion.question}</div>
            
            {currentQuestion.type === 'geometry' && currentQuestion.shape && (
              <GeometryShape shape={currentQuestion.shape} />
            )}
          </div>
        </div>

        <div className="answers-section">
          <div className="answers-grid">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`answer-option ${
                  selectedAnswer === index
                    ? index === currentQuestion.correctAnswer
                      ? 'correct'
                      : 'incorrect'
                    : ''
                } ${
                  showResult && index === currentQuestion.correctAnswer
                    ? 'highlight-correct'
                    : ''
                }`}
                onClick={() => handleAnswerClick(index)}
                disabled={selectedAnswer !== null}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-value">{option}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Celebration Popup */}
      <CelebrationPopup />
      
      {/* Wrong Answer Popup */}
      <WrongAnswerPopup />

      <div className="quiz-footer">
        <button className="reset-button" onClick={resetQuiz}>
            Reset Quest
        </button>
      </div>
    </div>
  );
};

export default MathQuiz;
