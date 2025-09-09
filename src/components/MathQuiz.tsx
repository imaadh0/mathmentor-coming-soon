import React, {
  useState,
  useEffect,
  useRef,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import { round } from "mathjs";
import { userManager, type User } from "../utils/userManager";
import UserNameModal from "./UserNameModal";
import Leaderboard from "./Leaderboard";
import "./MathQuiz.css";
import { TrophyIcon } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  operation: string;
  type: "arithmetic" | "geometry";
  shape?: {
    type: "triangle" | "rectangle";
    dimensions: number[];
    svgPath?: string;
  };
}

// Animation state management using useReducer for better performance
interface AnimationState {
  showCelebration: boolean;
  showWrongPopup: boolean;
  showXpGain: boolean;
  xpGained: number;
  xpPosition: { x: number; y: number };
  xpAnimationKey: number;
}

type AnimationAction =
  | { type: "SHOW_CELEBRATION" }
  | { type: "HIDE_CELEBRATION" }
  | { type: "SHOW_WRONG" }
  | { type: "HIDE_WRONG" }
  | {
      type: "SHOW_XP";
      payload: { xp: number; position: { x: number; y: number } };
    }
  | { type: "HIDE_XP" }
  | { type: "RESET_ANIMATIONS" };

const animationReducer = (
  state: AnimationState,
  action: AnimationAction
): AnimationState => {
  switch (action.type) {
    case "SHOW_CELEBRATION":
      return { ...state, showCelebration: true };
    case "HIDE_CELEBRATION":
      return { ...state, showCelebration: false };
    case "SHOW_WRONG":
      return { ...state, showWrongPopup: true };
    case "HIDE_WRONG":
      return { ...state, showWrongPopup: false };
    case "SHOW_XP":
      return {
        ...state,
        showXpGain: true,
        xpGained: action.payload.xp,
        xpPosition: action.payload.position,
        xpAnimationKey: state.xpAnimationKey + 1,
      };
    case "HIDE_XP":
      return { ...state, showXpGain: false };
    case "RESET_ANIMATIONS":
      return {
        showCelebration: false,
        showWrongPopup: false,
        showXpGain: false,
        xpGained: 0,
        xpPosition: { x: 50, y: 50 },
        xpAnimationKey: 0,
      };
    default:
      return state;
  }
};

const initialAnimationState: AnimationState = {
  showCelebration: false,
  showWrongPopup: false,
  showXpGain: false,
  xpGained: 0,
  xpPosition: { x: 50, y: 50 },
  xpAnimationKey: 0,
};

const MathQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questionMode, setQuestionMode] = useState<
    "mixed" | "arithmetic" | "geometry"
  >("mixed");

  const [showUserNameModal, setShowUserNameModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Use reducer for animation state to prevent re-render cascades
  const [animationState, dispatchAnimation] = useReducer(
    animationReducer,
    initialAnimationState
  );

  // Animation state management refs
  const isProcessingAnswer = useRef(false);
  const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const xpTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextQuestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Note: Removed debug console.log to reduce console spam
  // Debug modal state changes
  useEffect(() => {
    console.log("showUserNameModal changed:", showUserNameModal);
  }, [showUserNameModal]);

  // Audio refs
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);

  // Generate random math questions based on selected mode
  const generateQuestion = (): Question => {
    let questionType: "arithmetic" | "geometry";

    switch (questionMode) {
      case "arithmetic":
        questionType = "arithmetic";
        break;
      case "geometry":
        questionType = "geometry";
        break;
      case "mixed":
      default:
        // 50% chance of geometry, 50% arithmetic in mixed mode
        questionType = Math.random() > 0.5 ? "geometry" : "arithmetic";
        break;
    }

    if (questionType === "geometry") {
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
      { symbol: "÷", name: "division" },
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

      if (
        wrongAnswer !== correctAnswer &&
        wrongAnswer > 0 &&
        !wrongAnswers.has(wrongAnswer)
      ) {
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
      type: "arithmetic",
    };
  };

  // Generate geometry questions with visual shapes
  const generateGeometryQuestion = (): Question => {
    const shapes = ["triangle", "rectangle"] as const;
    const questionTypes = ["area", "perimeter"];

    const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
    const questionType =
      questionTypes[Math.floor(Math.random() * questionTypes.length)];

    let dimensions: number[];
    let correctAnswer: number;
    let questionText: string;
    let svgPath: string;

    switch (shapeType) {
      case "triangle":
        if (questionType === "area") {
          const base = Math.floor(Math.random() * 10) + 3;
          const height = Math.floor(Math.random() * 8) + 3;
          dimensions = [base, height];
          correctAnswer = round((base * height) / 2, 1);
          questionText = `What is the area of this triangle?`;
          // Center the triangle in 240x120 viewBox (center at 120, 60)
          const triangleWidth = base * 8;
          const triangleHeight = height * 8;
          const startX = 120 - triangleWidth / 2;
          const startY = 60 - triangleHeight / 2;
          svgPath = `M ${startX} ${startY} L ${
            startX + triangleWidth
          } ${startY} L ${startX + triangleWidth / 2} ${
            startY + triangleHeight
          } Z`;
        } else {
          const side1 = Math.floor(Math.random() * 8) + 4;
          const side2 = Math.floor(Math.random() * 8) + 4;
          const side3 = Math.floor(Math.random() * 8) + 4;
          dimensions = [side1, side2, side3];
          correctAnswer = round(side1 + side2 + side3, 1);
          questionText = `What is the perimeter of this triangle?`;
          // Center the triangle in 240x120 viewBox (center at 120, 60)
          svgPath = `M 85 85 L 120 25 L 155 85 Z`;
        }
        break;

      case "rectangle":
        const length = Math.floor(Math.random() * 8) + 4;
        const width = Math.floor(Math.random() * 6) + 3;
        dimensions = [length, width];

        if (questionType === "area") {
          correctAnswer = round(length * width, 1);
          questionText = `What is the area of this rectangle?`;
        } else {
          correctAnswer = round(2 * (length + width), 1);
          questionText = `What is the perimeter of this rectangle?`;
        }

        // Center the rectangle in 240x120 viewBox (center at 120, 60)
        const rectWidth = length * 8;
        const rectHeight = width * 8;
        const startX = 120 - rectWidth / 2;
        const startY = 60 - rectHeight / 2;
        svgPath = `M ${startX} ${startY} L ${startX + rectWidth} ${startY} L ${
          startX + rectWidth
        } ${startY + rectHeight} L ${startX} ${startY + rectHeight} Z`;
        break;

      default:
        dimensions = [4, 3];
        correctAnswer = 12;
        questionText = "What is the area?";
        // Center the default rectangle in 240x120 viewBox (center at 120, 60)
        const defaultWidth = 4 * 8;
        const defaultHeight = 3 * 8;
        const defaultStartX = 120 - defaultWidth / 2;
        const defaultStartY = 60 - defaultHeight / 2;
        svgPath = `M ${defaultStartX} ${defaultStartY} L ${
          defaultStartX + defaultWidth
        } ${defaultStartY} L ${defaultStartX + defaultWidth} ${
          defaultStartY + defaultHeight
        } L ${defaultStartX} ${defaultStartY + defaultHeight} Z`;
    }

    // Generate wrong options
    const options: string[] = [];
    const wrongAnswers = new Set<number>();

    // Determine if correct answer is a whole number
    const isWholeNumber = correctAnswer === Math.floor(correctAnswer);

    // Add correct answer
    options.push(
      isWholeNumber ? correctAnswer.toString() : correctAnswer.toString()
    );

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

      if (
        wrongAnswer !== correctAnswer &&
        wrongAnswer > 0 &&
        !wrongAnswers.has(wrongAnswer)
      ) {
        wrongAnswers.add(wrongAnswer);
        options.push(
          isWholeNumber ? wrongAnswer.toString() : wrongAnswer.toString()
        );
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
      type: "geometry",
      shape: {
        type: shapeType,
        dimensions,
        svgPath,
      },
    };
  };

  // Initialize audio elements
  useEffect(() => {
    try {
      correctSoundRef.current = new Audio("/audio/correct.mp3");
      wrongSoundRef.current = new Audio("/audio/wrong.mp3");

      // Configure sound effects
      if (correctSoundRef.current) {
        correctSoundRef.current.volume = 0.6;
        correctSoundRef.current.preload = "auto";
      }
      if (wrongSoundRef.current) {
        wrongSoundRef.current.volume = 0.6;
        wrongSoundRef.current.preload = "auto";
      }

      console.log("Audio elements initialized");
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }
  }, []);

  // Initialize user and first question
  useEffect(() => {
    const user = userManager.getCurrentUser();
    console.log("Current user on init:", user);
    if (user) {
      setCurrentUser(user);
      setScore(user.correctAnswers);
      setQuestionsAnswered(user.totalQuestions);
    } else {
      console.log("No user found, showing name modal");
      setShowUserNameModal(true);
    }
    setCurrentQuestion(generateQuestion());
  }, []);

  // Update question when mode changes
  useEffect(() => {
    if (currentQuestion) {
      // Clear any ongoing animations when mode changes
      if (celebrationTimeoutRef.current)
        clearTimeout(celebrationTimeoutRef.current);
      if (xpTimeoutRef.current) clearTimeout(xpTimeoutRef.current);
      if (nextQuestionTimeoutRef.current)
        clearTimeout(nextQuestionTimeoutRef.current);

      // Reset animation states efficiently
      dispatchAnimation({ type: "RESET_ANIMATIONS" });
      setShowResult(false);
      setSelectedAnswer(null);
      isProcessingAnswer.current = false;

      // Generate question based on current mode
      let questionType: "arithmetic" | "geometry";

      switch (questionMode) {
        case "arithmetic":
          questionType = "arithmetic";
          break;
        case "geometry":
          questionType = "geometry";
          break;
        case "mixed":
        default:
          // 50% chance of geometry, 50% arithmetic in mixed mode
          questionType = Math.random() > 0.5 ? "geometry" : "arithmetic";
          break;
      }

      const newQuestion =
        questionType === "geometry"
          ? generateGeometryQuestion()
          : generateArithmeticQuestion();
      setCurrentQuestion(newQuestion);
    }
  }, [questionMode]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current)
        clearTimeout(celebrationTimeoutRef.current);
      if (xpTimeoutRef.current) clearTimeout(xpTimeoutRef.current);
      if (nextQuestionTimeoutRef.current)
        clearTimeout(nextQuestionTimeoutRef.current);
    };
  }, []);

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

  const handleAnswerClick = useCallback(
    async (optionIndex: number) => {
      // Prevent multiple answer processing
      if (
        selectedAnswer !== null ||
        !currentQuestion ||
        !currentUser ||
        isProcessingAnswer.current
      ) {
        return;
      }

      // Set processing flag to prevent multiple triggers
      isProcessingAnswer.current = true;

      // Clear any existing timeouts to prevent overlap
      if (celebrationTimeoutRef.current)
        clearTimeout(celebrationTimeoutRef.current);
      if (xpTimeoutRef.current) clearTimeout(xpTimeoutRef.current);
      if (nextQuestionTimeoutRef.current)
        clearTimeout(nextQuestionTimeoutRef.current);

      const correct = optionIndex === currentQuestion.correctAnswer;

      // Calculate XP based on question type and difficulty
      let xpEarned = 0;
      if (correct) {
        xpEarned = currentQuestion.type === "geometry" ? 15 : 10;
      }

      // Generate random position for XP popup
      const safeMargin = 15;
      const randomX = Math.random() * (100 - 2 * safeMargin) + safeMargin;
      const randomY = Math.random() * (100 - 2 * safeMargin) + safeMargin;

      // Single state update batch for immediate UI feedback
      React.startTransition(() => {
        setSelectedAnswer(optionIndex);
        setShowResult(true);
        setQuestionsAnswered((prev) => prev + 1);
        if (correct) {
          setScore((prev) => prev + 1);
          dispatchAnimation({ type: "SHOW_CELEBRATION" });
        } else {
          dispatchAnimation({ type: "SHOW_WRONG" });
        }
      });

      // Play sound effects
      if (correct) {
        playCorrectSound();

        // Schedule animations with reducer dispatch
        celebrationTimeoutRef.current = setTimeout(() => {
          dispatchAnimation({ type: "HIDE_CELEBRATION" });
        }, 1200);

        xpTimeoutRef.current = setTimeout(() => {
          dispatchAnimation({
            type: "SHOW_XP",
            payload: {
              xp: xpEarned,
              position: { x: randomX, y: randomY },
            },
          });

          // Auto-hide XP after animation
          setTimeout(() => {
            dispatchAnimation({ type: "HIDE_XP" });
          }, 2000);
        }, 300);
      } else {
        playWrongSound();
        setTimeout(() => {
          dispatchAnimation({ type: "HIDE_WRONG" });
        }, 1200);
      }

      // Update user stats asynchronously
      try {
        await userManager.updateUserStats(correct, xpEarned);
        const updatedUser = userManager.getCurrentUser();
        if (updatedUser) {
          setCurrentUser(updatedUser);
        }
      } catch (error) {
        console.error("Failed to update user stats:", error);
      }

      // Auto-advance to next question
      nextQuestionTimeoutRef.current = setTimeout(() => {
        setCurrentQuestion(generateQuestion());
        setSelectedAnswer(null);
        setShowResult(false);
        dispatchAnimation({ type: "HIDE_XP" }); // Ensure XP is hidden
        isProcessingAnswer.current = false; // Reset processing flag
      }, 2500);
    },
    [selectedAnswer, currentQuestion, currentUser, score, questionsAnswered]
  );

  const resetQuiz = async () => {
    // Clear all timeouts to prevent animations after reset
    if (celebrationTimeoutRef.current)
      clearTimeout(celebrationTimeoutRef.current);
    if (xpTimeoutRef.current) clearTimeout(xpTimeoutRef.current);
    if (nextQuestionTimeoutRef.current)
      clearTimeout(nextQuestionTimeoutRef.current);

    // Reset processing flag
    isProcessingAnswer.current = false;

    if (currentUser) {
      try {
        await userManager.resetUserData();
        const updatedUser = userManager.getCurrentUser();
        if (updatedUser) {
          setCurrentUser(updatedUser);
        }
      } catch (error) {
        console.error("Failed to reset user data:", error);
      }
    }

    // Reset all state efficiently
    React.startTransition(() => {
      setScore(0);
      setQuestionsAnswered(0);
      setSelectedAnswer(null);
      setShowResult(false);
      dispatchAnimation({ type: "RESET_ANIMATIONS" });
      setCurrentQuestion(generateQuestion());
    });
  };

  const handleUserNameSubmit = useCallback(async (name: string) => {
    try {
      const user = await userManager.createUser(name);
      setCurrentUser(user);
      setShowUserNameModal(false);
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  }, []);

  const handleFlipToLeaderboard = useCallback(() => {
    setShowLeaderboard(true);
  }, []);

  const handleFlipBackToQuiz = useCallback(() => {
    setShowLeaderboard(false);
  }, []);

  const handleModeChange = useCallback(
    (mode: "mixed" | "arithmetic" | "geometry") => {
      setQuestionMode(mode);
      // The useEffect will handle generating a new question when mode changes
    },
    []
  );

  // Memoized popup components to prevent unnecessary re-renders
  const CelebrationPopup = useMemo(
    () => (
      <div
        className={`celebration-popup ${
          animationState.showCelebration ? "show" : ""
        }`}
      >
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
    ),
    [animationState.showCelebration]
  );

  const WrongAnswerPopup = useMemo(
    () => (
      <div
        className={`wrong-popup ${animationState.showWrongPopup ? "show" : ""}`}
      >
        <div className="wrong-content">
          <div className="wrong-text">Not quite!</div>
          <div className="wrong-subtext">Keep going, you've got this!</div>
          <div className="wrong-answer-display">
            Answer: {currentQuestion?.options[currentQuestion.correctAnswer]}
          </div>
        </div>
      </div>
    ),
    [animationState.showWrongPopup, currentQuestion]
  );

  // XP gain component with consistent state management
  const XpGainPopup = useMemo(() => {
    // Only render when showXpGain is true to prevent DOM clutter
    if (!animationState.showXpGain) return null;

    return (
      <div
        key={animationState.xpAnimationKey}
        className={`xp-gain-popup ${animationState.showXpGain ? "active" : ""}`}
        style={{
          left: `${animationState.xpPosition.x}%`,
          top: `${animationState.xpPosition.y}%`,
        }}
      >
        <div className="xp-gain-content">
          <div className="xp-text">+{animationState.xpGained} XP</div>
          <div className="xp-subtext">Great job!</div>
        </div>
      </div>
    );
  }, [
    animationState.showXpGain,
    animationState.xpAnimationKey,
    animationState.xpPosition,
    animationState.xpGained,
  ]);

  // Component for rendering geometry shapes
  const GeometryShape: React.FC<{ shape: NonNullable<Question["shape"]> }> = ({
    shape,
  }) => {
    const { type, dimensions, svgPath } = shape;

    const renderDimensions = () => {
      switch (type) {
        case "triangle":
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
                <span>
                  Sides: {dimensions[0]}, {dimensions[1]}, {dimensions[2]} units
                </span>
              </div>
            );
          }
        case "rectangle":
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
        <svg
          width="240"
          height="120"
          viewBox="0 0 240 120"
          className="shape-svg"
        >
          <defs>
            <linearGradient
              id="shapeGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
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
          {type === "rectangle" && (
            <>
              {/* Top label for length - centered horizontally above the rectangle */}
              <text
                x={120}
                y={60 - (dimensions[1] * 8) / 2 - 5}
                fill="#fdcb3f"
                fontSize="10"
                textAnchor="middle"
              >
                {dimensions[0]}
              </text>
              {/* Left label for width - positioned to the left of the rectangle */}
              <text
                x={120 - (dimensions[0] * 8) / 2 - 10}
                y={60}
                fill="#fdcb3f"
                fontSize="10"
                textAnchor="middle"
              >
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

  // Show leaderboard if toggled
  if (showLeaderboard) {
    return <Leaderboard onFlipBack={handleFlipBackToQuiz} />;
  }

  return (
    <div className="math-quiz">
      <div className="quiz-header">
        <div className="header-top">
          <h2 className="quiz-title">Math Quest Challenge</h2>
          <button
            className="leaderboard-toggle-btn"
            onClick={handleFlipToLeaderboard}
          >
            <TrophyIcon /> Leaderboard
          </button>
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
              <button
                className={`mode-btn ${
                  questionMode === "mixed" ? "active" : ""
                }`}
                onClick={() => handleModeChange("mixed")}
              >
                Mixed
              </button>
              <button
                className={`mode-btn ${
                  questionMode === "arithmetic" ? "active" : ""
                }`}
                onClick={() => handleModeChange("arithmetic")}
              >
                Arithmetic
              </button>
              <button
                className={`mode-btn ${
                  questionMode === "geometry" ? "active" : ""
                }`}
                onClick={() => handleModeChange("geometry")}
              >
                Geometry
              </button>
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

      <div className="quiz-content">
        <div className="question-section">
          <div
            className={`question-card ${
              currentQuestion.type === "geometry" ? "geometry" : ""
            }`}
          >
            <div className="question-label">
              {currentQuestion.type === "geometry"
                ? "Solve this geometry problem:"
                : "Solve this equation:"}
            </div>
            <div className="question-text">{currentQuestion.question}</div>

            {currentQuestion.type === "geometry" && currentQuestion.shape && (
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
                      ? "correct"
                      : "incorrect"
                    : ""
                } ${
                  showResult && index === currentQuestion.correctAnswer
                    ? "highlight-correct"
                    : ""
                }`}
                onClick={() => handleAnswerClick(index)}
                disabled={selectedAnswer !== null}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="option-value">{option}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Optimized Popup Components */}
      {CelebrationPopup}
      {WrongAnswerPopup}
      {XpGainPopup}

      <div className="quiz-footer">
        <button className="reset-button" onClick={resetQuiz}>
          Reset Quest
        </button>
      </div>

      {/* User Name Modal */}
      <UserNameModal
        isOpen={showUserNameModal}
        onSubmit={handleUserNameSubmit}
      />
    </div>
  );
};

export default MathQuiz;
