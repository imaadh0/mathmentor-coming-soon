import { useState, useCallback } from 'react';
import { Question } from '@/types/quiz';
import { round } from 'mathjs';

type QuestionMode = 'mixed' | 'arithmetic' | 'geometry';

export const useQuizQuestion = (initialMode: QuestionMode = 'mixed') => {
  const [questionMode, setQuestionMode] = useState<QuestionMode>(initialMode);

  const generateArithmeticQuestion = useCallback((): Question => {
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

    const options: string[] = [];
    const wrongAnswers = new Set<number>();
    const isWholeNumber = correctAnswer === Math.floor(correctAnswer);

    options.push(correctAnswer.toString());

    while (wrongAnswers.size < 3) {
      let wrongAnswer: number;
      if (operation.symbol === "÷") {
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
      } else if (operation.symbol === "×") {
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10;
      } else {
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10;
      }

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
  }, []);

  const generateGeometryQuestion = useCallback((): Question => {
    const shapes = ["triangle", "rectangle"] as const;
    const questionTypes = ["area", "perimeter"];

    const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

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
          const triangleWidth = base * 8;
          const triangleHeight = height * 8;
          const startX = 120 - triangleWidth / 2;
          const startY = 60 - triangleHeight / 2;
          svgPath = `M ${startX} ${startY} L ${startX + triangleWidth} ${startY} L ${
            startX + triangleWidth / 2
          } ${startY + triangleHeight} Z`;
        } else {
          const side1 = Math.floor(Math.random() * 8) + 4;
          const side2 = Math.floor(Math.random() * 8) + 4;
          const side3 = Math.floor(Math.random() * 8) + 4;
          dimensions = [side1, side2, side3];
          correctAnswer = round(side1 + side2 + side3, 1);
          questionText = `What is the perimeter of this triangle?`;
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

    const options: string[] = [];
    const wrongAnswers = new Set<number>();
    const isWholeNumber = correctAnswer === Math.floor(correctAnswer);

    options.push(correctAnswer.toString());

    while (wrongAnswers.size < 3) {
      let wrongAnswer: number;
      if (correctAnswer < 10) {
        wrongAnswer = correctAnswer + (Math.random() * 6 - 3);
      } else if (correctAnswer < 50) {
        wrongAnswer = correctAnswer + (Math.random() * 20 - 10);
      } else {
        wrongAnswer = correctAnswer + (Math.random() * 40 - 20);
      }

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
  }, []);

  const generateQuestion = useCallback((): Question => {
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
        questionType = Math.random() > 0.5 ? "geometry" : "arithmetic";
        break;
    }

    return questionType === "geometry"
      ? generateGeometryQuestion()
      : generateArithmeticQuestion();
  }, [questionMode, generateArithmeticQuestion, generateGeometryQuestion]);

  return {
    questionMode,
    setQuestionMode,
    generateQuestion,
  };
};
