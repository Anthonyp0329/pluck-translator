import sqlite3
import datetime
from config import DATABASE_PATH


def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS translations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                original_text TEXT NOT NULL,
                translated_text TEXT NOT NULL,
                source_language TEXT NOT NULL,
                target_language TEXT NOT NULL,
                created_at TEXT NOT NULL,
                quiz_correct INTEGER DEFAULT 0
            )
        """)
        # Migration: add quiz_correct to existing databases
        try:
            conn.execute("ALTER TABLE translations ADD COLUMN quiz_correct INTEGER DEFAULT 0")
        except Exception:
            pass
        conn.commit()


def save_translation(original_text, translated_text, source_language, target_language):
    with get_connection() as conn:
        exists = conn.execute(
            "SELECT 1 FROM translations WHERE original_text = ? AND translated_text = ?",
            (original_text, translated_text),
        ).fetchone()
        if exists:
            return None
        created_at = datetime.datetime.now().isoformat()
        cursor = conn.execute(
            """
            INSERT INTO translations (original_text, translated_text, source_language, target_language, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (original_text, translated_text, source_language, target_language, created_at),
        )
        conn.commit()
        return cursor.lastrowid


def get_all_translations():
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM translations ORDER BY created_at DESC"
        ).fetchall()
        return [dict(row) for row in rows]


def delete_translation(translation_id):
    with get_connection() as conn:
        conn.execute("DELETE FROM translations WHERE id = ?", (translation_id,))
        conn.commit()
