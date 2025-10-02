import { useReducer, useRef } from 'react';
import { AnimationState, AnimationAction } from '@/types/quiz';

const initialAnimationState: AnimationState = {
  showCelebration: false,
  showWrongPopup: false,
  showXpGain: false,
  xpGained: 0,
  xpPosition: { x: 50, y: 50 },
  xpAnimationKey: 0,
};

const animationReducer = (state: AnimationState, action: AnimationAction): AnimationState => {
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
      return initialAnimationState;
    default:
      return state;
  }
};

export const useQuizAnimation = () => {
  const [animationState, dispatchAnimation] = useReducer(animationReducer, initialAnimationState);
  const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const xpTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimeouts = () => {
    if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current);
    if (xpTimeoutRef.current) clearTimeout(xpTimeoutRef.current);
  };

  const showCorrectAnimation = (xpEarned: number) => {
    clearTimeouts();

    // Generate random position for XP popup
    const safeMargin = 15;
    const randomX = Math.random() * (100 - 2 * safeMargin) + safeMargin;
    const randomY = Math.random() * (100 - 2 * safeMargin) + safeMargin;

    dispatchAnimation({ type: "SHOW_CELEBRATION" });

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

      setTimeout(() => {
        dispatchAnimation({ type: "HIDE_XP" });
      }, 1200);
    }, 300);
  };

  const showWrongAnimation = () => {
    clearTimeouts();
    dispatchAnimation({ type: "SHOW_WRONG" });
    
    celebrationTimeoutRef.current = setTimeout(() => {
      dispatchAnimation({ type: "HIDE_WRONG" });
    }, 1200);
  };

  const resetAnimations = () => {
    clearTimeouts();
    dispatchAnimation({ type: "RESET_ANIMATIONS" });
  };

  return {
    animationState,
    showCorrectAnimation,
    showWrongAnimation,
    resetAnimations,
  };
};
