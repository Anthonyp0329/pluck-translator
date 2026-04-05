"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { QuizCard, CardResult } from "@/types";
import { langName } from "@/lib/constants";

type Phase = "question" | "revealed" | "done";

interface State {
  cards: QuizCard[];
  index: number;
  phase: Phase;
  results: CardResult[];
  toast: string | null;
  typed: string;
  wasCorrect: boolean | null;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function QuizClient({
  initialCards,
  lang,
}: {
  initialCards: QuizCard[];
  lang: string;
}) {
  const [state, setState] = useState<State>({
    cards: initialCards,
    index: 0,
    phase: initialCards.length === 0 ? "done" : "question",
    results: [],
    toast: null,
    typed: "",
    wasCorrect: null,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const card = state.cards[state.index];

  // Focus input when a new question appears
  useEffect(() => {
    if (state.phase === "question") {
      inputRef.current?.focus();
    }
  }, [state.index, state.phase]);

  const handleSubmit = useCallback(() => {
    if (!card || state.phase !== "question") return;
    const correct = normalize(state.typed) === normalize(card.translated_text);
    setState((s) => ({ ...s, phase: "revealed", wasCorrect: correct }));
  }, [card, state.phase, state.typed]);

  const handleNext = useCallback(async (correct: boolean) => {
    if (!card) return;

    const [res] = await Promise.all([
      fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: card.id, correct }),
      }).then((r) => r.json()),
      delay(280),
    ]);

    const toast = correct && res.graduated ? "Graduated! 🎓" : null;

    setState((s) => {
      const results = [...s.results, correct ? "correct" : "missed"] as CardResult[];
      const isLast = s.index >= s.cards.length - 1;
      return {
        ...s,
        results,
        toast,
        typed: "",
        wasCorrect: null,
        phase: isLast ? "done" : "question",
        index: isLast ? s.index : s.index + 1,
      };
    });

    if (toast) {
      setTimeout(() => setState((s) => ({ ...s, toast: null })), 1800);
    }
  }, [card]);

  const handleAgain = async () => {
    const res = await fetch(`/api/quiz/${lang}`);
    const newCards: QuizCard[] = await res.json();
    setState({
      cards: newCards,
      index: 0,
      phase: newCards.length === 0 ? "done" : "question",
      results: [],
      toast: null,
      typed: "",
      wasCorrect: null,
    });
  };

  if (state.phase === "done" || state.cards.length === 0) {
    return (
      <QuizSummary
        results={state.results}
        cards={state.cards}
        lang={lang}
        onAgain={handleAgain}
      />
    );
  }

  const total = state.cards.length;
  const current = state.index + 1;

  return (
    <div style={{
      minHeight: "calc(100vh - 52px)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px", gap: "32px",
    }}>
      {/* Toast */}
      <AnimatePresence>
        {state.toast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: "fixed", top: "70px", left: "50%", transform: "translateX(-50%)",
              background: "var(--accent-dim)", border: "1px solid var(--accent)",
              color: "var(--accent)", padding: "10px 24px", borderRadius: "10px",
              fontFamily: "'Syne', sans-serif", fontSize: "14px", fontWeight: 600,
              zIndex: 100,
            }}
          >
            {state.toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {state.cards.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === state.index ? "24px" : "8px",
                height: "8px", borderRadius: "99px",
                background:
                  i < state.index
                    ? state.results[i] === "correct" ? "var(--success)" : "var(--danger)"
                    : i === state.index
                    ? "var(--accent)"
                    : "var(--border)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
        <span style={{
          fontFamily: "'Fira Code', monospace", fontSize: "12px",
          color: "var(--muted)",
        }}>
          {current} of {total}
        </span>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.index}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "48px 40px",
            maxWidth: "560px", width: "100%",
            display: "flex", flexDirection: "column",
            gap: "32px",
          }}
        >
          {/* Prompt */}
          <div>
            <p style={{
              fontFamily: "'Syne', sans-serif", fontSize: "11px",
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: "var(--muted)", marginBottom: "12px",
            }}>
              {langName(lang)}
            </p>
            <p style={{
              fontFamily: "'Fraunces', serif", fontStyle: "italic",
              fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 300,
              color: "var(--text)", lineHeight: 1.45,
            }}>
              {card.original_text}
            </p>
          </div>

          {/* Input / Result */}
          {state.phase === "question" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{
                fontFamily: "'Syne', sans-serif", fontSize: "11px",
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "var(--muted)",
              }}>
                Translation
              </p>
              <input
                ref={inputRef}
                value={state.typed}
                onChange={(e) => setState((s) => ({ ...s, typed: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                placeholder="Type your translation…"
                autoComplete="off"
                spellCheck={false}
                style={{
                  background: "var(--lifted)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  color: "var(--text)",
                  fontFamily: "'Syne', sans-serif", fontSize: "16px",
                  outline: "none",
                  transition: "border-color 0.15s",
                  width: "100%",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!state.typed.trim()}
                style={{
                  background: state.typed.trim() ? "var(--accent)" : "var(--lifted)",
                  border: state.typed.trim() ? "none" : "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "14px 24px",
                  color: state.typed.trim() ? "#0d0e12" : "var(--muted)",
                  cursor: state.typed.trim() ? "pointer" : "default",
                  fontFamily: "'Syne', sans-serif", fontSize: "14px",
                  fontWeight: 600, letterSpacing: "0.04em",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                Check →
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Result feedback */}
              <div style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "28px",
                marginBottom: "28px",
              }}>
                {/* User's answer */}
                <div style={{ marginBottom: "20px" }}>
                  <p style={{
                    fontFamily: "'Syne', sans-serif", fontSize: "11px",
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: state.wasCorrect ? "var(--success)" : "var(--danger)",
                    marginBottom: "8px",
                  }}>
                    {state.wasCorrect ? "Correct ✓" : "Incorrect ✗"}
                  </p>
                  <p style={{
                    fontFamily: "'Syne', sans-serif", fontSize: "16px",
                    color: state.wasCorrect ? "var(--success)" : "var(--danger)",
                    textDecoration: state.wasCorrect ? "none" : "line-through",
                    opacity: state.wasCorrect ? 1 : 0.7,
                  }}>
                    {state.typed}
                  </p>
                </div>

                {/* Correct answer (always shown) */}
                {!state.wasCorrect && (
                  <div>
                    <p style={{
                      fontFamily: "'Syne', sans-serif", fontSize: "11px",
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: "var(--muted)", marginBottom: "8px",
                    }}>
                      Correct answer
                    </p>
                    <p style={{
                      fontFamily: "'Syne', sans-serif", fontSize: "18px",
                      fontWeight: 600, color: "var(--text)", lineHeight: 1.5,
                    }}>
                      {card.translated_text}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px" }}>
                {state.wasCorrect ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleNext(true)}
                    style={{
                      flex: 1, background: "var(--success-dim)",
                      border: "1px solid var(--success)", borderRadius: "10px",
                      padding: "14px", cursor: "pointer",
                      fontFamily: "'Syne', sans-serif", fontSize: "14px",
                      fontWeight: 600, color: "var(--success)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Next →
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleNext(false)}
                      style={{
                        flex: 1, background: "var(--danger-dim)",
                        border: "1px solid var(--danger)", borderRadius: "10px",
                        padding: "14px", cursor: "pointer",
                        fontFamily: "'Syne', sans-serif", fontSize: "14px",
                        fontWeight: 600, color: "var(--danger)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Got it wrong
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleNext(true)}
                      style={{
                        flex: 1, background: "var(--lifted)",
                        border: "1px solid var(--border)", borderRadius: "10px",
                        padding: "14px", cursor: "pointer",
                        fontFamily: "'Syne', sans-serif", fontSize: "14px",
                        color: "var(--muted)", letterSpacing: "0.04em",
                      }}
                    >
                      Close enough
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function QuizSummary({
  results, cards, lang, onAgain,
}: {
  results: CardResult[];
  cards: QuizCard[];
  lang: string;
  onAgain: () => void;
}) {
  const correct = results.filter((r) => r === "correct").length;
  const missed = results.filter((r) => r === "missed").length;
  const allLearned = results.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        minHeight: "calc(100vh - 52px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "20px", padding: "48px 40px",
        maxWidth: "560px", width: "100%",
      }}>
        {allLearned ? (
          <div style={{ textAlign: "center" }}>
            <p style={{
              fontFamily: "'Fraunces', serif", fontStyle: "italic",
              fontSize: "52px", fontWeight: 300, color: "var(--success)",
              marginBottom: "12px",
            }}>
              All done!
            </p>
            <p style={{ color: "var(--muted)", fontSize: "15px", marginBottom: "32px" }}>
              You&apos;ve learned everything in {langName(lang)}.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
              <div style={{
                flex: 1, background: "var(--success-dim)",
                border: "1px solid var(--success)",
                borderRadius: "12px", padding: "20px",
                textAlign: "center",
              }}>
                <p style={{
                  fontFamily: "'Fraunces', serif", fontStyle: "italic",
                  fontSize: "40px", fontWeight: 300, color: "var(--success)",
                }}>
                  {correct}
                </p>
                <p style={{ fontSize: "12px", color: "var(--success)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "4px" }}>
                  correct
                </p>
              </div>
              <div style={{
                flex: 1, background: "var(--danger-dim)",
                border: "1px solid var(--danger)",
                borderRadius: "12px", padding: "20px",
                textAlign: "center",
              }}>
                <p style={{
                  fontFamily: "'Fraunces', serif", fontStyle: "italic",
                  fontSize: "40px", fontWeight: 300, color: "var(--danger)",
                }}>
                  {missed}
                </p>
                <p style={{ fontSize: "12px", color: "var(--danger)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "4px" }}>
                  missed
                </p>
              </div>
            </div>

            {results.length > 0 && (
              <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {results.map((result, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: "12px",
                    padding: "12px 0",
                    borderBottom: i < results.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <span style={{
                      fontSize: "14px",
                      color: result === "correct" ? "var(--success)" : "var(--danger)",
                      flexShrink: 0, marginTop: "2px",
                    }}>
                      {result === "correct" ? "✓" : "✗"}
                    </span>
                    <div>
                      <p style={{
                        fontFamily: "'Fraunces', serif", fontStyle: "italic",
                        fontSize: "14px", color: "var(--muted)", marginBottom: "2px",
                      }}>
                        {cards[i]?.original_text}
                      </p>
                      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "14px", color: "var(--text)" }}>
                        {cards[i]?.translated_text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          {!allLearned && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onAgain}
              style={{
                flex: 1, background: "var(--accent)", color: "#0d0e12",
                border: "none", borderRadius: "10px", padding: "14px",
                cursor: "pointer", fontFamily: "'Syne', sans-serif",
                fontSize: "14px", fontWeight: 600, letterSpacing: "0.04em",
              }}
            >
              Quiz again →
            </motion.button>
          )}
          <a
            href={`/language/${lang}`}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              background: "var(--lifted)", border: "1px solid var(--border)",
              borderRadius: "10px", padding: "14px",
              color: "var(--muted)", textDecoration: "none",
              fontFamily: "'Syne', sans-serif", fontSize: "14px",
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "var(--text)";
              e.currentTarget.style.borderColor = "var(--muted)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "var(--muted)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            View all words
          </a>
        </div>
      </div>
    </motion.div>
  );
}
