import { getLanguageSummaries } from "@/lib/queries";
import LanguageGrid from "@/components/LanguageGrid";

export default function Home() {
  const languages = getLanguageSummaries();

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "64px 32px" }}>
      <div style={{ marginBottom: "64px" }}>
        <p style={{
          fontFamily: "'Syne', sans-serif", fontSize: "11px",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--muted)", marginBottom: "16px",
        }}>
          your words
        </p>
        <h1 style={{
          fontFamily: "'Fraunces', serif", fontStyle: "italic",
          fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 300,
          color: "var(--text)", letterSpacing: "-1px", lineHeight: 1.1,
        }}>
          Language Collection
        </h1>
      </div>
      <LanguageGrid languages={languages} />
    </div>
  );
}
