export interface Question {
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

export interface AnimationState {
  showCelebration: boolean;
  showWrongPopup: boolean;
  showXpGain: boolean;
  xpGained: number;
  xpPosition: { x: number; y: number };
  xpAnimationKey: number;
}

export type AnimationAction =
  | { type: "SHOW_CELEBRATION" }
  | { type: "HIDE_CELEBRATION" }
  | { type: "SHOW_WRONG" }
  | { type: "HIDE_WRONG" }
  | { type: "SHOW_XP"; payload: { xp: number; position: { x: number; y: number } } }
  | { type: "HIDE_XP" }
  | { type: "RESET_ANIMATIONS" };
