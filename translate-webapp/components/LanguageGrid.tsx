"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import type { LanguageSummary } from "@/types";
import { langName, QUIZ_THRESHOLD } from "@/lib/constants";

export default function LanguageGrid({ languages }: { languages: LanguageSummary[] }) {
  if (languages.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "96px 0", color: "var(--muted)" }}>
        <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: "48px", fontWeight: 300, color: "var(--border)" }}>
          empty
        </p>
        <p style={{ marginTop: "12px", fontSize: "14px" }}>
          Use the desktop app to capture and save translations.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
      {languages.map((lang, i) => (
        <LanguageRow key={lang.source_language} lang={lang} index={i} />
      ))}
    </div>
  );
}

function LanguageRow({ lang, index }: { lang: LanguageSummary; index: number }) {
  const pct = Math.round((lang.learned / lang.total) * 100);
  const allLearned = lang.learned >= lang.total;
  const name = langName(lang.source_language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: "32px",
        padding: "32px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Left: language name + progress */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: "16px" }}>
          <h2 style={{
            fontFamily: "'Fraunces', serif", fontStyle: "italic",
            fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 300,
            color: "var(--text)", letterSpacing: "-2px", lineHeight: 1,
          }}>
            {name}
          </h2>
          <span style={{
            fontFamily: "'Fira Code', monospace", fontSize: "11px",
            color: "var(--muted)", letterSpacing: "0.1em",
            padding: "2px 8px", background: "var(--surface)",
            border: "1px solid var(--border)", borderRadius: "4px",
          }}>
            {lang.source_language}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            flex: 1, maxWidth: "320px", height: "3px",
            background: "var(--border)", borderRadius: "99px", overflow: "hidden",
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, delay: index * 0.07 + 0.2, ease: "easeOut" }}
              style={{
                height: "100%", borderRadius: "99px",
                background: allLearned ? "var(--success)" : "var(--accent)",
              }}
            />
          </div>
          <span style={{
            fontFamily: "'Fira Code', monospace", fontSize: "12px",
            color: allLearned ? "var(--success)" : "var(--muted)",
          }}>
            {lang.learned}/{lang.total}
          </span>
          {allLearned && (
            <span style={{
              fontSize: "11px", fontFamily: "'Syne', sans-serif",
              color: "var(--success)", letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>all learned</span>
          )}
        </div>
      </div>

      {/* Right: action buttons */}
      <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
        {!allLearned && (
          <Link href={`/quiz/${lang.source_language}`} style={{ textDecoration: "none" }}>
            <QuizButton />
          </Link>
        )}
        <Link href={`/language/${lang.source_language}`} style={{ textDecoration: "none" }}>
          <GhostButton>View all</GhostButton>
        </Link>
      </div>
    </motion.div>
  );
}

function QuizButton() {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      style={{
        background: "var(--accent)", color: "#0d0e12",
        border: "none", borderRadius: "8px",
        padding: "9px 18px", cursor: "pointer",
        fontFamily: "'Syne', sans-serif", fontSize: "13px", fontWeight: 600,
        letterSpacing: "0.04em",
      }}
    >
      Quiz →
    </motion.button>
  );
}

function GhostButton({ children }: { children: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, borderColor: "var(--muted)" }}
      whileTap={{ scale: 0.97 }}
      style={{
        background: "transparent", color: "var(--muted)",
        border: "1px solid var(--border)", borderRadius: "8px",
        padding: "9px 18px", cursor: "pointer",
        fontFamily: "'Syne', sans-serif", fontSize: "13px",
        transition: "color 0.15s, border-color 0.15s",
      }}
    >
      {children}
    </motion.button>
  );
}
