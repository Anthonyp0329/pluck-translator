import { QUIZ_THRESHOLD } from "@/lib/constants";

export default function QuizDots({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
      {Array.from({ length: QUIZ_THRESHOLD }).map((_, i) => (
        <div
          key={i}
          style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: i < count ? "var(--accent)" : "var(--border)",
            transition: "background 0.2s",
          }}
        />
      ))}
    </div>
  );
}
