/**
 * Shared UI components and helpers for SEO document actions.
 */
import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif';

export const styles = {
  container: { padding: "1rem", fontFamily: FONT_STACK },
  section: { marginBottom: "1.25rem" },
  sectionTitle: {
    fontSize: "0.8em",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#999",
    marginBottom: "0.5rem",
  },
  card: {
    padding: "0.75rem 1rem",
    border: "1px solid #333",
    borderRadius: "6px",
    background: "#1a1a2e",
    marginBottom: "0.5rem",
  },
  button: {
    padding: "0.5rem 1rem",
    border: "1px solid #444",
    borderRadius: "6px",
    background: "#1a1a2e",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.9em",
  },
  buttonPrimary: {
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.9em",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "0.5rem 0.75rem",
    border: "1px solid #444",
    borderRadius: "6px",
    background: "#111",
    color: "#fff",
    fontSize: "0.9em",
    boxSizing: "border-box" as const,
  },
  textarea: {
    width: "100%",
    padding: "0.5rem 0.75rem",
    border: "1px solid #444",
    borderRadius: "6px",
    background: "#111",
    color: "#fff",
    fontSize: "0.9em",
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
  },
  badge: (color: string) => ({
    display: "inline-block",
    padding: "0.15rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.7em",
    fontWeight: 600,
    background: color,
    color: "#fff",
    marginRight: "0.35rem",
  }),
  charCount: (current: number, max: number) => ({
    fontSize: "0.75em",
    color: current > max ? "#ef4444" : current > max * 0.9 ? "#f59e0b" : "#666",
    marginTop: "0.25rem",
  }),
  progressBar: (pct: number, color: string) => ({
    height: "6px",
    borderRadius: "3px",
    background: "#333",
    overflow: "hidden" as const,
    marginTop: "0.25rem",
    position: "relative" as const,
  }),
  progressFill: (pct: number, color: string) => ({
    width: `${Math.min(pct, 100)}%`,
    height: "100%",
    background: color,
    borderRadius: "3px",
    transition: "width 0.3s ease",
  }),
};

// ---------------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------------
export function Spinner({ message }: { message: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", ...styles.container }}>
      <span
        style={{
          display: "inline-block",
          width: 16,
          height: 16,
          border: "2px solid #ccc",
          borderTopColor: "#333",
          borderRadius: "50%",
          animation: "seo-spin 0.6s linear infinite",
        }}
      />
      <span>{message}</span>
      <style>{`@keyframes seo-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score badge (red/yellow/green)
// ---------------------------------------------------------------------------
export function ScoreBadge({ score, max = 10 }: { score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <span style={styles.badge(color)}>
      {score}/{max}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------
export function ProgressBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={styles.progressBar(pct, color)}>
      <div style={styles.progressFill(pct, color)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Role badge for silo pages
// ---------------------------------------------------------------------------
const ROLE_COLORS: Record<string, string> = {
  pillar: "#8b5cf6",
  hub: "#2563eb",
  spoke: "#0ea5e9",
  supporting: "#6b7280",
};

export function RoleBadge({ role }: { role: string }) {
  return <span style={styles.badge(ROLE_COLORS[role] || "#6b7280")}>{role}</span>;
}

// ---------------------------------------------------------------------------
// Character counter for meta fields
// ---------------------------------------------------------------------------
export function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  return <div style={styles.charCount(len, max)}>{len}/{max} characters</div>;
}

// ---------------------------------------------------------------------------
// Result / Error states
// ---------------------------------------------------------------------------
export function SuccessMessage({ message, detail }: { message: string; detail?: string }) {
  return (
    <div style={styles.container}>
      <p style={{ color: "#22c55e" }}>{message}</p>
      {detail && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.85em", color: "#666" }}>{detail}</p>
      )}
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div style={styles.container}>
      <p style={{ color: "#ef4444" }}>{message}</p>
      <p style={{ marginTop: "0.5rem", fontSize: "0.85em", color: "#666" }}>
        Check that ANTHROPIC_API_KEY is set in your environment variables.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic SEO action hook
// ---------------------------------------------------------------------------
export function useSeoAction(apiPath: string) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const run = useCallback(
    async (body: Record<string, any>) => {
      setStatus("loading");
      setError("");
      setData(null);

      try {
        const baseUrl = window.location.origin;
        const res = await fetch(`${baseUrl}${apiPath}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const json = await res.json();

        if (!res.ok) {
          setStatus("error");
          setError(json.error || "Request failed");
          return null;
        }

        setStatus("success");
        setData(json);
        return json;
      } catch (err: any) {
        setStatus("error");
        setError(err.message || "Network error");
        return null;
      }
    },
    [apiPath],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setData(null);
    setError("");
  }, []);

  return { status, data, error, run, reset };
}
