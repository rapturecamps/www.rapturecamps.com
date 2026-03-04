import { useState, useCallback } from "react";
import type { DocumentActionProps } from "sanity";
import {
  Spinner,
  ErrorMessage,
  ScoreBadge,
  ProgressBar,
  styles,
  useSeoAction,
} from "./seoActions";

const STATUS_COLORS: Record<string, string> = {
  good: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
};

export function SeoScoreAction(props: DocumentActionProps) {
  const { id } = props;
  const [phase, setPhase] = useState<"idle" | "loading" | "results" | "error">("idle");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const seo = useSeoAction("/api/seo-score");

  const handleRun = useCallback(async () => {
    setPhase("loading");
    const res = await seo.run({ documentId: id });
    if (res) {
      setResult(res);
      setPhase("results");
    } else {
      setError(seo.error);
      setPhase("error");
    }
  }, [id, seo]);

  return {
    label: phase === "loading" ? "Scoring..." : "SEO Check",
    icon: () => <span style={{ fontSize: "1.1em" }}>📊</span>,
    disabled: phase === "loading",
    tone: phase === "error" ? "critical" : "primary",
    onHandle: () => {
      setPhase("idle");
      setResult(null);
      setError("");
      handleRun();
    },
    dialog:
      phase !== "idle"
        ? {
            type: "dialog" as const,
            header: "SEO Quality Score",
            onClose: () => {
              setPhase("idle");
              setResult(null);
              setError("");
            },
            content:
              phase === "loading" ? (
                <Spinner message="Analyzing page SEO quality..." />
              ) : phase === "error" ? (
                <ErrorMessage message={error} />
              ) : phase === "results" && result ? (
                <div style={{ ...styles.container, maxHeight: "70vh", overflowY: "auto" }}>
                  {/* Overall score */}
                  <div style={{
                    ...styles.card,
                    textAlign: "center",
                    padding: "1.25rem",
                    borderColor: STATUS_COLORS[result.overallScore >= 7 ? "good" : result.overallScore >= 4 ? "warning" : "critical"],
                  }}>
                    <div style={{ fontSize: "2.5em", fontWeight: 700, color: "#fff" }}>
                      {result.overallScore}<span style={{ fontSize: "0.4em", color: "#666" }}>/10</span>
                    </div>
                    <p style={{ color: "#999", fontSize: "0.85em", marginTop: "0.25rem" }}>
                      {result.pageTitle} · {result.wordCount} words · {result.headingCount} headings · {result.internalLinkCount} links
                    </p>
                  </div>

                  {/* Category scores */}
                  <div style={{ ...styles.section, marginTop: "1rem" }}>
                    <div style={styles.sectionTitle}>Category Scores</div>
                    {(result.categories || []).map((cat: any, i: number) => (
                      <div key={i} style={{ ...styles.card, borderLeft: `3px solid ${STATUS_COLORS[cat.status] || "#666"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                          <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.9em" }}>{cat.name}</span>
                          <ScoreBadge score={cat.score} />
                        </div>
                        <ProgressBar value={cat.score} />
                        <p style={{ color: "#999", fontSize: "0.8em", marginTop: "0.35rem" }}>{cat.finding}</p>
                        {cat.recommendation && (
                          <p style={{ color: "#0ea5e9", fontSize: "0.8em", marginTop: "0.25rem" }}>
                            💡 {cat.recommendation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Top priorities */}
                  {result.topPriorities && result.topPriorities.length > 0 && (
                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>Top Priorities</div>
                      <div style={styles.card}>
                        <ol style={{ margin: 0, paddingLeft: "1.25rem" }}>
                          {result.topPriorities.map((p: string, i: number) => (
                            <li key={i} style={{ color: "#fff", fontSize: "0.85em", marginBottom: "0.35rem" }}>
                              {p}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: "1rem" }}>
                    <button onClick={handleRun} style={styles.button}>
                      Re-analyze
                    </button>
                  </div>
                </div>
              ) : null,
          }
        : undefined,
  };
}
