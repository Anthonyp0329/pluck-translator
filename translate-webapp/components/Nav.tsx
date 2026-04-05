"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();
  const isHome = path === "/";

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(13,14,18,0.85)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
      padding: "0 32px", height: "52px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{
          fontFamily: "'Fraunces', serif", fontStyle: "italic",
          fontSize: "22px", fontWeight: 300, color: "var(--accent)",
          letterSpacing: "-0.5px",
        }}>Pluck</span>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "11px", color: "var(--muted)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          word collection
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <Link href="/guide" style={{
          fontFamily: "'Syne', sans-serif", fontSize: "13px",
          color: path === "/guide" ? "var(--text)" : "var(--muted)",
          textDecoration: "none", transition: "color 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={e => (e.currentTarget.style.color = path === "/guide" ? "var(--text)" : "var(--muted)")}
        >
          How to add words
        </Link>
        {!isHome && (
          <Link href="/" style={{
            fontFamily: "'Syne', sans-serif", fontSize: "13px",
            color: "var(--muted)", textDecoration: "none",
            display: "flex", alignItems: "center", gap: "6px",
            transition: "color 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
          >
            ← All languages
          </Link>
        )}
      </div>
    </nav>
  );
}
