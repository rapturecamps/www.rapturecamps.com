import { useState, useCallback } from "react";
import { styles as s, Spinner } from "../actions/seoActions";

const IMPORTANCE_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#3b82f6",
};

export function CompetitorTool() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "results" | "error">("idle");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) return;
    setStatus("loading");
    setError("");
    try {
      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/seo-competitor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitorUrl: url.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setStatus("results");
      } else {
        setError(data.error || "Analysis failed");
        setStatus("error");
      }
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  }, [url]);

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <h2 style={{ color: "#fff", fontSize: "1.4em", marginBottom: "0.25rem" }}>Competitor Analysis</h2>
      <p style={{ color: "#666", fontSize: "0.85em", marginBottom: "1.5rem" }}>
        Analyze competitor pages to find content gaps and keyword opportunities.
      </p>

      {/* Input */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.competitor.com/their-page"
          style={{ ...s.input, flex: 1 }}
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
        />
        <button
          onClick={handleAnalyze}
          disabled={!url.trim() || status === "loading"}
          style={{
            ...s.buttonPrimary,
            opacity: !url.trim() || status === "loading" ? 0.5 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {status === "loading" ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {status === "loading" && (
        <Spinner message="Fetching competitor page and analyzing with AI..." />
      )}

      {status === "error" && (
        <div style={{ ...s.card, borderColor: "#ef4444" }}>
          <p style={{ color: "#ef4444" }}>{error}</p>
        </div>
      )}

      {status === "results" && result && (
        <>
          {/* Competitor summary */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Competitor Overview</div>
            <div style={s.card}>
              <h3 style={{ color: "#fff", fontSize: "1em", marginBottom: "0.5rem" }}>
                {result.competitorSummary?.title || result.competitorUrl}
              </h3>
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                <span style={s.badge("#374151")}>{result.competitorSummary?.wordCount || "?"} words</span>
                <span style={s.badge("#374151")}>{result.competitorSummary?.headingCount || "?"} headings</span>
              </div>
              {result.competitorSummary?.targetKeywords?.length > 0 && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{ color: "#666", fontSize: "0.75em" }}>Target Keywords: </span>
                  {result.competitorSummary.targetKeywords.map((kw: string, i: number) => (
                    <span key={i} style={{ ...s.badge("#1e3a5f"), fontSize: "0.7em" }}>{kw}</span>
                  ))}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.75rem" }}>
                <div>
                  <div style={{ color: "#22c55e", fontSize: "0.75em", fontWeight: 600, marginBottom: "0.35rem" }}>Strengths</div>
                  {(result.competitorSummary?.strengths || []).map((s2: string, i: number) => (
                    <p key={i} style={{ color: "#ccc", fontSize: "0.8em", marginBottom: "0.25rem" }}>• {s2}</p>
                  ))}
                </div>
                <div>
                  <div style={{ color: "#ef4444", fontSize: "0.75em", fontWeight: 600, marginBottom: "0.35rem" }}>Weaknesses</div>
                  {(result.competitorSummary?.weaknesses || []).map((s2: string, i: number) => (
                    <p key={i} style={{ color: "#ccc", fontSize: "0.8em", marginBottom: "0.25rem" }}>• {s2}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content gaps */}
          {result.contentGaps?.length > 0 && (
            <div style={s.section}>
              <div style={s.sectionTitle}>Content Gaps</div>
              {result.contentGaps.map((gap: any, i: number) => (
                <div key={i} style={{ ...s.card, borderLeft: `3px solid ${IMPORTANCE_COLORS[gap.importance] || "#666"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                    <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.9em" }}>{gap.topic}</span>
                    <span style={s.badge(IMPORTANCE_COLORS[gap.importance] || "#666")}>{gap.importance}</span>
                  </div>
                  <p style={{ color: "#999", fontSize: "0.8em" }}>{gap.suggestion}</p>
                </div>
              ))}
            </div>
          )}

          {/* Keyword opportunities */}
          {result.keywordOpportunities?.length > 0 && (
            <div style={s.section}>
              <div style={s.sectionTitle}>Keyword Opportunities</div>
              {result.keywordOpportunities.map((kw: any, i: number) => (
                <div key={i} style={s.card}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.9em" }}>{kw.keyword}</span>
                    <span style={s.badge("#374151")}>{kw.searchIntent}</span>
                  </div>
                  <p style={{ color: "#999", fontSize: "0.8em" }}>{kw.suggestion}</p>
                </div>
              ))}
            </div>
          )}

          {/* Structural insights */}
          {result.structuralInsights?.length > 0 && (
            <div style={s.section}>
              <div style={s.sectionTitle}>Structural Insights</div>
              {result.structuralInsights.map((ins: any, i: number) => (
                <div key={i} style={s.card}>
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.85em", marginBottom: "0.35rem" }}>{ins.aspect}</p>
                  <p style={{ color: "#999", fontSize: "0.8em", marginBottom: "0.25rem" }}>
                    <strong>Their approach:</strong> {ins.theirApproach}
                  </p>
                  <p style={{ color: "#0ea5e9", fontSize: "0.8em" }}>💡 {ins.recommendation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Action items */}
          {result.actionItems?.length > 0 && (
            <div style={s.section}>
              <div style={s.sectionTitle}>Priority Actions</div>
              <div style={s.card}>
                <ol style={{ margin: 0, paddingLeft: "1.25rem" }}>
                  {result.actionItems.map((a: string, i: number) => (
                    <li key={i} style={{ color: "#fff", fontSize: "0.9em", marginBottom: "0.35rem" }}>{a}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
