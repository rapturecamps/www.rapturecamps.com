import { useState, useCallback } from "react";
import type { DocumentActionProps } from "sanity";
import { useClient } from "sanity";
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

const FIX_LABELS: Record<string, string> = {
  metaTitle: "Meta Title",
  metaDescription: "Meta Description",
  focusKeyword: "Focus Keyword",
  seoH1: "SEO H1 Heading",
  excerpt: "Excerpt",
};

const FIX_PATHS: Record<string, string> = {
  metaTitle: "seo.metaTitle",
  metaDescription: "seo.metaDescription",
  focusKeyword: "seo.focusKeyword",
  seoH1: "seoH1",
  excerpt: "excerpt",
};

const SUGGESTION_TYPE_LABELS: Record<string, string> = {
  heading_rewrite: "Heading Rewrite",
  paragraph_addition: "Add Paragraph",
  paragraph_rewrite: "Rewrite Paragraph",
  internal_link: "Internal Link",
  cta_improvement: "CTA Improvement",
};

const SUGGESTION_TYPE_ICONS: Record<string, string> = {
  heading_rewrite: "✏️",
  paragraph_addition: "➕",
  paragraph_rewrite: "🔄",
  internal_link: "🔗",
  cta_improvement: "🎯",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      style={{
        ...styles.button,
        fontSize: "0.7em",
        padding: "0.25rem 0.5rem",
        background: copied ? "#22c55e22" : "#1a1a2e",
        borderColor: copied ? "#22c55e" : "#444",
        color: copied ? "#22c55e" : "#fff",
      }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

export function SeoScoreAction(props: DocumentActionProps) {
  const { id } = props;
  const [phase, setPhase] = useState<"idle" | "loading" | "results" | "error">("idle");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [appliedFixes, setAppliedFixes] = useState<Set<string>>(new Set());
  const [applyingFix, setApplyingFix] = useState<string | null>(null);
  const seo = useSeoAction("/api/seo-score");
  const client = useClient({ apiVersion: "2024-01-01" });

  const handleRun = useCallback(async () => {
    setPhase("loading");
    setAppliedFixes(new Set());
    setApplyingFix(null);
    const res = await seo.run({ documentId: id });
    if (res) {
      setResult(res);
      setPhase("results");
    } else {
      setError(seo.error);
      setPhase("error");
    }
  }, [id, seo]);

  const applyFix = useCallback(async (fixKey: string, value: string) => {
    const path = FIX_PATHS[fixKey];
    if (!path) return;

    setApplyingFix(fixKey);
    try {
      const docId = id.startsWith("drafts.") ? id : `drafts.${id}`;
      await client.patch(docId).set({ [path]: value }).commit();
      setAppliedFixes((prev) => new Set([...prev, fixKey]));
    } catch (err: any) {
      console.error(`Failed to apply ${fixKey}:`, err);
    }
    setApplyingFix(null);
  }, [id, client]);

  const applyAllFixes = useCallback(async (fixes: Record<string, string>) => {
    setApplyingFix("all");
    try {
      const docId = id.startsWith("drafts.") ? id : `drafts.${id}`;
      const patch: Record<string, string> = {};
      for (const [key, value] of Object.entries(fixes)) {
        const path = FIX_PATHS[key];
        if (path && !appliedFixes.has(key)) {
          patch[path] = value;
        }
      }
      if (Object.keys(patch).length > 0) {
        await client.patch(docId).set(patch).commit();
        setAppliedFixes((prev) => new Set([...prev, ...Object.keys(fixes)]));
      }
    } catch (err: any) {
      console.error("Failed to apply fixes:", err);
    }
    setApplyingFix(null);
  }, [id, client, appliedFixes]);

  const fixes = result?.suggestedFixes || {};
  const fixKeys = Object.keys(fixes).filter((k) => FIX_PATHS[k]);
  const unappliedCount = fixKeys.filter((k) => !appliedFixes.has(k)).length;
  const contentSuggestions = result?.contentSuggestions || [];

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

                  {/* Auto-applicable fixes */}
                  {fixKeys.length > 0 && (
                    <div style={{ ...styles.section, marginTop: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <div style={styles.sectionTitle}>Auto-Apply Improvements</div>
                        {unappliedCount > 1 && (
                          <button
                            onClick={() => applyAllFixes(fixes)}
                            disabled={applyingFix !== null}
                            style={{
                              ...styles.buttonPrimary,
                              fontSize: "0.75em",
                              padding: "0.35rem 0.75rem",
                              opacity: applyingFix ? 0.6 : 1,
                            }}
                          >
                            {applyingFix === "all" ? "Applying..." : `Apply All (${unappliedCount})`}
                          </button>
                        )}
                      </div>

                      {fixKeys.map((key) => {
                        const isApplied = appliedFixes.has(key);
                        const isApplying = applyingFix === key || applyingFix === "all";
                        return (
                          <div key={key} style={{
                            ...styles.card,
                            borderLeft: `3px solid ${isApplied ? "#22c55e" : "#2563eb"}`,
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                              <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.85em" }}>
                                {FIX_LABELS[key] || key}
                              </span>
                              <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                                {isApplied ? (
                                  <span style={{ color: "#22c55e", fontSize: "0.8em", fontWeight: 600 }}>✓ Applied</span>
                                ) : (
                                  <button
                                    onClick={() => applyFix(key, fixes[key])}
                                    disabled={isApplying}
                                    style={{
                                      ...styles.buttonPrimary,
                                      fontSize: "0.75em",
                                      padding: "0.3rem 0.6rem",
                                      opacity: isApplying ? 0.6 : 1,
                                    }}
                                  >
                                    {isApplying ? "Applying..." : "Apply"}
                                  </button>
                                )}
                              </div>
                            </div>
                            <p style={{
                              color: "#ccc",
                              fontSize: "0.8em",
                              background: "#111",
                              padding: "0.5rem 0.75rem",
                              borderRadius: "4px",
                              margin: "0.35rem 0 0",
                              lineHeight: 1.4,
                              wordBreak: "break-word",
                            }}>
                              {fixes[key]}
                            </p>
                            <p style={{ color: "#666", fontSize: "0.7em", marginTop: "0.25rem" }}>
                              {fixes[key].length} characters
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Content suggestions (copy-paste) */}
                  {contentSuggestions.length > 0 && (
                    <div style={{ ...styles.section, marginTop: "1rem" }}>
                      <div style={styles.sectionTitle}>Content Suggestions (Copy &amp; Paste)</div>
                      {contentSuggestions.map((s: any, i: number) => (
                        <div key={i} style={{
                          ...styles.card,
                          borderLeft: `3px solid #8b5cf6`,
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                            <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.85em" }}>
                              {SUGGESTION_TYPE_ICONS[s.type] || "💡"}{" "}
                              {SUGGESTION_TYPE_LABELS[s.type] || s.type}
                            </span>
                            <CopyButton text={s.suggested || ""} />
                          </div>

                          {s.location && (
                            <p style={{ color: "#a78bfa", fontSize: "0.75em", marginBottom: "0.35rem" }}>
                              📍 {s.location}
                            </p>
                          )}

                          {s.current && (
                            <div style={{ marginBottom: "0.35rem" }}>
                              <span style={{ color: "#666", fontSize: "0.7em", textTransform: "uppercase", letterSpacing: "0.05em" }}>Current:</span>
                              <p style={{
                                color: "#999",
                                fontSize: "0.8em",
                                background: "#0a0a0a",
                                padding: "0.4rem 0.6rem",
                                borderRadius: "4px",
                                margin: "0.2rem 0 0",
                                textDecoration: "line-through",
                                lineHeight: 1.4,
                              }}>
                                {s.current}
                              </p>
                            </div>
                          )}

                          <div>
                            <span style={{ color: "#666", fontSize: "0.7em", textTransform: "uppercase", letterSpacing: "0.05em" }}>Suggested:</span>
                            <p style={{
                              color: "#ccc",
                              fontSize: "0.8em",
                              background: "#111",
                              padding: "0.5rem 0.75rem",
                              borderRadius: "4px",
                              margin: "0.2rem 0 0",
                              lineHeight: 1.4,
                              wordBreak: "break-word",
                            }}>
                              {s.suggested}
                            </p>
                          </div>

                          {s.url && (
                            <p style={{ color: "#0ea5e9", fontSize: "0.75em", marginTop: "0.3rem" }}>
                              Link to: {s.url}  →  Anchor: "{s.anchor}"
                            </p>
                          )}

                          {s.reason && (
                            <p style={{ color: "#999", fontSize: "0.75em", marginTop: "0.3rem", fontStyle: "italic" }}>
                              {s.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

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
