export default function GuidePage() {
  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "64px 32px" }}>
      <div style={{ marginBottom: "56px" }}>
        <p style={{
          fontFamily: "'Syne', sans-serif", fontSize: "11px",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--muted)", marginBottom: "16px",
        }}>
          how it works
        </p>
        <h1 style={{
          fontFamily: "'Fraunces', serif", fontStyle: "italic",
          fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 300,
          color: "var(--text)", letterSpacing: "-1px", lineHeight: 1.1,
        }}>
          Adding Words
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        <Step
          number="1"
          title="Trigger the hotkey"
          description={
            <>
              Press{" "}
              <Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>&apos;</Kbd>
              {" "}anywhere on your Mac — over a website, PDF, subtitle, image, anything.
            </>
          }
        />
        <Step
          number="2"
          title="Highlighted text is captured automatically"
          description="If you have text selected when you press the hotkey, it's captured instantly — no dragging needed. Works in browsers, documents, terminals."
        />
        <Step
          number="3"
          title="Or drag a region for OCR"
          description="If nothing is selected, the screen dims and you drag a rectangle over any text — even burned-in subtitles, menus, or text in images. The app reads it using Apple's built-in OCR."
        />
        <Step
          number="4"
          title="Review the translation"
          description="A compact popup appears showing the original text and its English translation. It doesn't steal focus from whatever you were doing."
        />
        <Step
          number="5"
          title="It saves automatically"
          description={
            <>
              Close the popup and the word is saved. Hit <strong style={{ color: "var(--text)" }}>Discard</strong> if you don't want to keep it — duplicates are skipped automatically.
            </>
          }
        />
        <Step
          number="6"
          title="Quiz yourself"
          description="Once you have words saved, use the Quiz button on the home page. Type the translation from memory. A word graduates (and stops appearing in quizzes) after 3 correct answers."
          last
        />
      </div>

      <div style={{
        marginTop: "56px",
        padding: "24px 28px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
      }}>
        <p style={{
          fontFamily: "'Syne', sans-serif", fontSize: "11px",
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: "var(--muted)", marginBottom: "12px",
        }}>
          Tips
        </p>
        <ul style={{
          display: "flex", flexDirection: "column", gap: "10px",
          listStyle: "none",
        }}>
          {[
            "The hotkey works even when the app isn't in the foreground — leave it running in the background.",
            "OCR works best on clean, high-contrast text. Zoom in on the source material if accuracy is low.",
            "Click anywhere outside the selection region to cancel without capturing.",
            "The app detects the source language automatically — Spanish, French, Japanese, and more.",
          ].map((tip, i) => (
            <li key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <span style={{
                fontFamily: "'Fira Code', monospace", fontSize: "11px",
                color: "var(--accent)", flexShrink: 0, marginTop: "2px",
              }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{
                fontFamily: "'Syne', sans-serif", fontSize: "14px",
                color: "var(--muted)", lineHeight: 1.6,
              }}>
                {tip}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Step({
  number, title, description, last = false,
}: {
  number: string;
  title: string;
  description: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "40px 1fr",
      gap: "0 20px",
      paddingBottom: last ? "0" : "0",
    }}>
      {/* Left: number + vertical line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          border: "1px solid var(--border)",
          background: "var(--surface)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Fira Code', monospace", fontSize: "12px",
          color: "var(--accent)", flexShrink: 0,
          zIndex: 1,
        }}>
          {number}
        </div>
        {!last && (
          <div style={{
            width: "1px", flex: 1, minHeight: "32px",
            background: "var(--border)",
          }} />
        )}
      </div>

      {/* Right: content */}
      <div style={{ paddingBottom: last ? "0" : "36px", paddingTop: "4px" }}>
        <p style={{
          fontFamily: "'Syne', sans-serif", fontSize: "15px",
          fontWeight: 600, color: "var(--text)", marginBottom: "8px",
        }}>
          {title}
        </p>
        <p style={{
          fontFamily: "'Syne', sans-serif", fontSize: "14px",
          color: "var(--muted)", lineHeight: 1.7,
        }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "2px 7px", borderRadius: "5px",
      background: "var(--lifted)", border: "1px solid var(--border)",
      fontFamily: "'Fira Code', monospace", fontSize: "13px",
      color: "var(--text)", lineHeight: 1.5,
      margin: "0 2px",
    }}>
      {children}
    </kbd>
  );
}
