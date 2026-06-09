export interface QuizOption {
  label: string;
  value: string;
}

export interface QuizStep {
  question: string;
  optionA: QuizOption;
  optionB: QuizOption;
}

export interface QuizResult {
  personality: string;
  productIds: number[];
}

export interface QuizData {
  steps: QuizStep[];
  resultMap: Record<string, QuizResult>;
}
