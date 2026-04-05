"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Translation } from "@/types";
import QuizDots from "./QuizDots";

export default function TranslationTable({
  initialTranslations,
}: {
  initialTranslations: Translation[];
}) {
  const [items, setItems] = useState(initialTranslations);
  const [toast, setToast] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/translations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setItems(initialTranslations); // restore on error
      showToast("Failed to delete");
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  if (items.length === 0) {
    return (
      <p style={{ color: "var(--muted)", fontStyle: "italic", padding: "40px 0", textAlign: "center" }}>
        No translations yet.
      </p>
    );
  }

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position: "fixed", top: "70px", left: "50%", transform: "translateX(-50%)",
              background: "var(--danger-dim)", border: "1px solid var(--danger)",
              color: "var(--danger)", padding: "8px 20px", borderRadius: "8px",
              fontFamily: "'Syne', sans-serif", fontSize: "13px", zIndex: 100,
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Original", "Translation", "Progress", "Added", ""].map((h) => (
                <th key={h} style={{
                  padding: "10px 16px 10px 0",
                  textAlign: "left", fontFamily: "'Syne', sans-serif",
                  fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "var(--muted)",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {items.map((t) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.22 }}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td style={{ padding: "16px 16px 16px 0", maxWidth: "280px" }}>
                    <span style={{
                      fontFamily: "'Fraunces', serif", fontStyle: "italic",
                      fontSize: "16px", fontWeight: 300, color: "var(--text)",
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {t.original_text}
                    </span>
                  </td>
                  <td style={{ padding: "16px 16px 16px 0", maxWidth: "280px" }}>
                    <span style={{
                      fontFamily: "'Syne', sans-serif", fontSize: "14px",
                      color: "var(--text)", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {t.translated_text}
                    </span>
                  </td>
                  <td style={{ padding: "16px 16px 16px 0", whiteSpace: "nowrap" }}>
                    <QuizDots count={t.quiz_correct ?? 0} />
                  </td>
                  <td style={{ padding: "16px 16px 16px 0", whiteSpace: "nowrap" }}>
                    <span style={{
                      fontFamily: "'Fira Code', monospace", fontSize: "12px",
                      color: "var(--muted)",
                    }}>
                      {new Date(t.created_at).toLocaleDateString(undefined, {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </td>
                  <td style={{ padding: "16px 0", textAlign: "right" }}>
                    <DeleteButton onDelete={() => handleDelete(t.id)} />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </>
  );
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <motion.button
      onClick={onDelete}
      whileHover={{ scale: 1.1, color: "var(--danger)" }}
      whileTap={{ scale: 0.9 }}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: "var(--border)", padding: "4px 8px", borderRadius: "6px",
        fontSize: "16px", lineHeight: 1, transition: "color 0.15s",
      }}
      title="Delete translation"
    >
      ×
    </motion.button>
  );
}
