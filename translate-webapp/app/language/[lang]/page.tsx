import { getTranslationsByLanguage } from "@/lib/queries";
import { langName } from "@/lib/constants";
import TranslationTable from "@/components/TranslationTable";
import { notFound } from "next/navigation";

export default async function LanguagePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const translations = getTranslationsByLanguage(lang);

  if (translations.length === 0) {
    notFound();
  }

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "64px 32px" }}>
      <div style={{ marginBottom: "48px" }}>
        <p style={{
          fontFamily: "'Syne', sans-serif", fontSize: "11px",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--muted)", marginBottom: "12px",
        }}>
          {lang}
        </p>
        <h1 style={{
          fontFamily: "'Fraunces', serif", fontStyle: "italic",
          fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 300,
          color: "var(--text)", letterSpacing: "-2px", lineHeight: 1,
        }}>
          {langName(lang)}
        </h1>
        <p style={{
          fontFamily: "'Fira Code', monospace", fontSize: "12px",
          color: "var(--muted)", marginTop: "16px",
        }}>
          {translations.length} word{translations.length !== 1 ? "s" : ""}
        </p>
      </div>
      <TranslationTable initialTranslations={translations} />
    </div>
  );
}
