import { db } from "./db";
import { QUIZ_THRESHOLD, QUIZ_SIZE } from "./constants";
import type { LanguageSummary, Translation, QuizCard } from "@/types";

export function getLanguageSummaries(): LanguageSummary[] {
  return db
    .prepare(
      `SELECT source_language,
              COUNT(*) AS total,
              SUM(CASE WHEN quiz_correct >= ? THEN 1 ELSE 0 END) AS learned
       FROM translations
       GROUP BY source_language
       ORDER BY total DESC`
    )
    .all(QUIZ_THRESHOLD) as LanguageSummary[];
}

export function getTranslationsByLanguage(lang: string): Translation[] {
  return db
    .prepare(
      `SELECT * FROM translations
       WHERE source_language = ?
       ORDER BY created_at DESC`
    )
    .all(lang) as Translation[];
}

export function getQuizCards(lang: string): QuizCard[] {
  return db
    .prepare(
      `SELECT id, original_text, translated_text, source_language, quiz_correct
       FROM translations
       WHERE source_language = ? AND quiz_correct < ?
       ORDER BY quiz_correct ASC, RANDOM()
       LIMIT ?`
    )
    .all(lang, QUIZ_THRESHOLD, QUIZ_SIZE) as QuizCard[];
}

export function deleteTranslation(id: number): void {
  db.prepare("DELETE FROM translations WHERE id = ?").run(id);
}

export function incrementQuizCorrect(id: number): boolean {
  db.prepare(
    `UPDATE translations
     SET quiz_correct = MIN(quiz_correct + 1, ?)
     WHERE id = ?`
  ).run(QUIZ_THRESHOLD, id);

  const row = db
    .prepare("SELECT quiz_correct FROM translations WHERE id = ?")
    .get(id) as { quiz_correct: number } | undefined;

  return (row?.quiz_correct ?? 0) >= QUIZ_THRESHOLD;
}
