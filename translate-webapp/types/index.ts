export interface Translation {
  id: number;
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  created_at: string;
  quiz_correct: number;
}

export interface LanguageSummary {
  source_language: string;
  total: number;
  learned: number;
}

export interface QuizCard {
  id: number;
  original_text: string;
  translated_text: string;
  source_language: string;
  quiz_correct: number;
}

export type CardResult = "correct" | "missed";
