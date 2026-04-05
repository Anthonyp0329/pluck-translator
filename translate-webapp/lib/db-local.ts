import Database from "better-sqlite3";
import path from "path";

const g = globalThis as unknown as { _db: Database.Database | undefined };

function openDb(): Database.Database {
  const dbPath = process.env.DB_PATH
    ? path.resolve(process.cwd(), process.env.DB_PATH)
    : path.resolve(process.cwd(), "../translations.db");

  const db = new Database(dbPath);

  // Ensure quiz_correct column exists (migration)
  try {
    db.exec("ALTER TABLE translations ADD COLUMN quiz_correct INTEGER DEFAULT 0");
  } catch {
    // Column already exists — ignore
  }

  return db;
}

export const db: Database.Database = g._db ?? (g._db = openDb());
