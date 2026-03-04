import { useState, useCallback } from "react";
import type { DocumentActionProps } from "sanity";
import {
  Spinner,
  ErrorMessage,
  RoleBadge,
  styles,
  useSeoAction,
} from "./seoActions";

const LINK_TYPE_COLORS: Record<string, string> = {
  "supporting→pillar": "#8b5cf6",
  "supporting→hub": "#2563eb",
  "hub→pillar": "#7c3aed",
  "spoke→hub": "#0ea5e9",
  "cross-spoke": "#06b6d4",
  "pillar→hub": "#6366f1",
  "strategic cross-silo": "#f59e0b",
};

export function SuggestLinksAction(props: DocumentActionProps) {
  const { id } = props;
  const [phase, setPhase] = useState<"idle" | "loading" | "results" | "error">("idle");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const seo = useSeoAction("/api/seo-links");

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
    label: phase === "loading" ? "Analyzing..." : "Suggest Links",
    icon: () => <span style={{ fontSize: "1.1em" }}>🔗</span>,
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
            header: "Silo-Aware Internal Link Suggestions",
            onClose: () => {
              setPhase("idle");
              setResult(null);
              setError("");
            },
            content:
              phase === "loading" ? (
                <Spinner message="Building silo map and analyzing content..." />
              ) : phase === "error" ? (
                <ErrorMessage message={error} />
              ) : phase === "results" && result ? (
                <div style={{ ...styles.container, maxHeight: "70vh", overflowY: "auto" }}>
                  {/* Silo context */}
                  <div style={styles.section}>
                    <div style={styles.sectionTitle}>Page Context</div>
                    <div style={styles.card}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <RoleBadge role={result.currentPage.role} />
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.9em" }}>
                          {result.currentPage.title}
                        </span>
                      </div>
                      <p style={{ color: "#666", fontSize: "0.8em" }}>
                        {result.currentPage.siloName} silo · {result.existingLinks.length} existing internal links
                      </p>
                    </div>
                  </div>

                  {/* Silo warnings */}
                  {result.siloWarnings.length > 0 && (
                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>Silo Warnings</div>
                      {result.siloWarnings.map((w: string, i: number) => (
                        <div
                          key={i}
                          style={{
                            ...styles.card,
                            borderColor: "#f59e0b",
                            background: "#1a1a0e",
                          }}
                        >
                          <p style={{ color: "#f59e0b", fontSize: "0.85em" }}>⚠️ {w}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Link suggestions */}
                  <div style={styles.section}>
                    <div style={styles.sectionTitle}>
                      Suggested Links ({result.suggestions.length})
                    </div>
                    {result.suggestions.map((s: any, i: number) => (
                      <div key={i} style={styles.card}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                          <span
                            style={{
                              ...styles.badge(LINK_TYPE_COLORS[s.linkType] || "#6b7280"),
                              fontSize: "0.65em",
                            }}
                          >
                            {s.linkType}
                          </span>
                          <span style={{ color: "#666", fontSize: "0.7em" }}>
                            Priority {s.priority}
                          </span>
                        </div>
                        <p style={{ color: "#fff", fontSize: "0.9em", marginBottom: "0.25rem" }}>
                          "<strong>{s.phrase}</strong>"
                        </p>
                        <p style={{ color: "#0ea5e9", fontSize: "0.8em", marginBottom: "0.25rem" }}>
                          → {s.targetTitle}{" "}
                          <button
                            onClick={() => navigator.clipboard.writeText(s.targetUrl)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#666",
                              cursor: "pointer",
                              fontSize: "0.9em",
                            }}
                            title="Copy URL"
                          >
                            📋
                          </button>
                        </p>
                        <p style={{ color: "#666", fontSize: "0.75em" }}>{s.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null,
          }
        : undefined,
  };
}
