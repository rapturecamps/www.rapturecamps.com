import { useState, useCallback } from "react";
import { styles as s, Spinner } from "../actions/seoActions";

export function ContentBriefTool() {
  const [keyword, setKeyword] = useState("");
  const [contentType, setContentType] = useState("blog post");
  const [audience, setAudience] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "results" | "error">("idle");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    if (!keyword.trim()) return;
    setStatus("loading");
    setError("");
    try {
      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/seo-brief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: keyword.trim(),
          contentType,
          audience: audience.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setStatus("results");
      } else {
        setError(data.error || "Failed to generate brief");
        setStatus("error");
      }
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  }, [keyword, contentType, audience]);

  const copyBrief = useCallback(() => {
    if (!result) return;
    const text = [
      `# Content Brief: ${result.title}`,
      `\nKeyword: ${result.keyword}`,
      `Search Intent: ${result.searchIntent}`,
      `Silo: ${result.suggestedSilo}`,
      `Target Word Count: ${result.targetWordCount}`,
      `\n## H1: ${result.h1}`,
      `\n## Outline`,
      ...(result.outline || []).map((o: any) => `${"  ".repeat(o.level === "h3" ? 1 : 0)}- ${o.heading}: ${o.notes}`),
      `\n## Key Topics`,
      ...(result.keyTopics || []).map((t: string) => `- ${t}`),
      `\n## Questions to Answer`,
      ...(result.questionsToAnswer || []).map((q: string) => `- ${q}`),
      `\n## Internal Links to Include`,
      ...(result.linksToInclude || []).map((l: any) => `- [${l.anchorSuggestion}](${l.url}) — ${l.reason}`),
      `\n## Competitor Angle`,
      result.competitorAngle,
    ].join("\n");
    navigator.clipboard.writeText(text);
  }, [result]);

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <h2 style={{ color: "#fff", fontSize: "1.4em", marginBottom: "0.5rem" }}>Content Brief Generator</h2>
      <p style={{ color: "#666", fontSize: "0.9em", marginBottom: "1.5rem" }}>
        Generate SEO-optimized content briefs with silo-aware internal linking suggestions.
      </p>

      {/* Input form */}
      <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <label style={{ ...s.sectionTitle, display: "block", marginBottom: "0.35rem" }}>Target Keyword</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g., surf camp bali beginners"
            style={s.input}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ ...s.sectionTitle, display: "block", marginBottom: "0.35rem" }}>Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              style={{ ...s.input, cursor: "pointer" }}
            >
              <option value="blog post">Blog Post</option>
              <option value="landing page">Landing Page</option>
              <option value="guide">Comprehensive Guide</option>
              <option value="listicle">Listicle</option>
              <option value="FAQ page">FAQ Page</option>
            </select>
          </div>
          <div>
            <label style={{ ...s.sectionTitle, display: "block", marginBottom: "0.35rem" }}>Target Audience (optional)</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., beginner surfers aged 25-35"
              style={s.input}
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!keyword.trim() || status === "loading"}
          style={{
            ...s.buttonPrimary,
            opacity: !keyword.trim() || status === "loading" ? 0.5 : 1,
            width: "fit-content",
          }}
        >
          {status === "loading" ? "Generating..." : "Generate Brief"}
        </button>
      </div>

      {status === "loading" && <Spinner message="Analyzing site content and generating brief..." />}

      {status === "error" && (
        <div style={{ ...s.card, borderColor: "#ef4444" }}>
          <p style={{ color: "#ef4444" }}>{error}</p>
        </div>
      )}

      {status === "results" && result && (
        <div>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ color: "#fff", fontSize: "1.1em" }}>{result.title}</h3>
            <button onClick={copyBrief} style={s.button}>📋 Copy Brief</button>
          </div>

          {/* Meta row */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            <span style={s.badge("#8b5cf6")}>{result.searchIntent}</span>
            <span style={s.badge("#2563eb")}>Silo: {result.suggestedSilo}</span>
            <span style={s.badge("#0ea5e9")}>{result.targetWordCount} words</span>
          </div>

          {/* H1 */}
          <div style={s.section}>
            <div style={s.sectionTitle}>H1 Heading</div>
            <p style={{ color: "#fff", fontSize: "1em", fontWeight: 600 }}>{result.h1}</p>
          </div>

          {/* Outline */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Content Outline</div>
            <div style={s.card}>
              {(result.outline || []).map((o: any, i: number) => (
                <div key={i} style={{ marginBottom: "0.5rem", paddingLeft: o.level === "h3" ? "1.5rem" : 0 }}>
                  <span style={{ color: "#fff", fontWeight: o.level === "h2" ? 600 : 400, fontSize: "0.9em" }}>
                    {o.level === "h3" ? "└ " : ""}{o.heading}
                  </span>
                  <span style={{ color: "#666", fontSize: "0.8em", marginLeft: "0.5rem" }}> — {o.notes}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key topics */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Key Topics to Cover</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {(result.keyTopics || []).map((t: string, i: number) => (
                <span key={i} style={{ ...s.badge("#374151"), color: "#ddd" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Questions */}
          {result.questionsToAnswer?.length > 0 && (
            <div style={s.section}>
              <div style={s.sectionTitle}>Questions to Answer</div>
              <div style={s.card}>
                {result.questionsToAnswer.map((q: string, i: number) => (
                  <p key={i} style={{ color: "#ccc", fontSize: "0.85em", marginBottom: "0.35rem" }}>• {q}</p>
                ))}
              </div>
            </div>
          )}

          {/* Internal links */}
          {result.linksToInclude?.length > 0 && (
            <div style={s.section}>
              <div style={s.sectionTitle}>Internal Links to Include</div>
              {result.linksToInclude.map((l: any, i: number) => (
                <div key={i} style={{ ...s.card, padding: "0.5rem 0.75rem" }}>
                  <p style={{ color: "#0ea5e9", fontSize: "0.85em" }}>
                    "{l.anchorSuggestion}" → {l.url}
                  </p>
                  <p style={{ color: "#666", fontSize: "0.75em" }}>{l.reason}</p>
                </div>
              ))}
            </div>
          )}

          {/* Cannibalization risk */}
          {result.cannibalizationRisk?.length > 0 && (
            <div style={s.section}>
              <div style={s.sectionTitle}>⚠️ Cannibalization Risk</div>
              {result.cannibalizationRisk.map((r: any, i: number) => (
                <div key={i} style={{ ...s.card, borderColor: "#f59e0b" }}>
                  <p style={{ color: "#f59e0b", fontSize: "0.85em" }}>{r.title}</p>
                  <p style={{ color: "#666", fontSize: "0.75em" }}>{r.url} — {r.overlap}</p>
                </div>
              ))}
            </div>
          )}

          {/* Competitor angle */}
          {result.competitorAngle && (
            <div style={s.section}>
              <div style={s.sectionTitle}>Unique Angle</div>
              <div style={s.card}>
                <p style={{ color: "#ccc", fontSize: "0.85em" }}>{result.competitorAngle}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
