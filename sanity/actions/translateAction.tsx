import { useState, useCallback, useEffect } from "react";
import type { DocumentActionProps } from "sanity";
import { useClient } from "sanity";

const LANGUAGES: Record<string, string> = {
  de: "German",
  en: "English",
};

type Provider = "claude" | "openai" | "deepl";
type RefineProvider = "claude" | "openai";

const PROVIDER_META: Record<Provider, { label: string; icon: string; model: string; description?: string }> = {
  deepl: { label: "DeepL + AI Refinement", icon: "🔵", model: "Hybrid", description: "DeepL translates, then AI refines with glossary & brand voice" },
  claude: { label: "Claude (Anthropic)", icon: "🟣", model: "claude-sonnet-4", description: "Full AI translation with glossary & tone rules" },
  openai: { label: "ChatGPT (OpenAI)", icon: "🟢", model: "gpt-4o", description: "Full AI translation with glossary & tone rules" },
};

const REFINE_META: Record<RefineProvider, { label: string; icon: string }> = {
  claude: { label: "Claude", icon: "🟣" },
  openai: { label: "ChatGPT", icon: "🟢" },
};

const PAGE_TYPE_LABELS: Record<string, string> = {
  blogPost: "Blog Post",
  camp: "Camp Landing Page",
  campSurfPage: "Camp Surf Page",
  campRoomsPage: "Camp Rooms Page",
  campFoodPage: "Camp Food Page",
  country: "Country Landing Page",
  homepage: "Homepage",
  page: "Static Page",
  faq: "FAQ",
};

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif';

interface ReviewSuggestion {
  index: number;
  field: string;
  current: string;
  suggested: string;
  reason: string;
}

export function TranslateAction(props: DocumentActionProps) {
  const { id, draft, published, type: docType } = props;
  const doc = draft || published;
  const sanityClient = useClient({ apiVersion: "2024-01-01" });

  const [status, setStatus] = useState<
    "idle" | "pick-provider" | "pick-mode" | "translating" | "reviewing" | "review-results" | "success" | "error"
  >("idle");
  const [provider, setProvider] = useState<Provider>("claude");
  const [refineProvider, setRefineProvider] = useState<RefineProvider>("claude");
  const [message, setMessage] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [glossaryExpanded, setGlossaryExpanded] = useState(false);
  const [glossaryContent, setGlossaryContent] = useState("");
  const [suggestions, setSuggestions] = useState<ReviewSuggestion[]>([]);
  const [acceptedIndices, setAcceptedIndices] = useState<Set<number>>(new Set());
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);

  const currentLang = (doc as any)?.language || "en";
  const isGerman = currentLang === "de";
  const isNonEnglish = currentLang !== "en";
  const targetLangs = isNonEnglish
    ? [currentLang]
    : Object.keys(LANGUAGES).filter((l) => l !== "en");

  const pageTypeLabel = PAGE_TYPE_LABELS[docType] || "Page";

  useEffect(() => {
    const baseUrl = window.location.origin;
    fetch(`${baseUrl}/api/translate-meta`)
      .then((r) => r.json())
      .then((data) => {
        if (data.glossary) setGlossaryContent(data.glossary);
      })
      .catch(() => {});
  }, []);

  const handleTranslate = useCallback(
    async (targetLang: string, forceOverwrite: boolean) => {
      setStatus("translating");
      const meta = PROVIDER_META[provider];
      setMessage(
        provider === "deepl"
          ? `Step 1/2: Translating with DeepL... Step 2: ${REFINE_META[refineProvider].label} refinement will follow.`
          : `Translating to ${LANGUAGES[targetLang]} with ${meta.label}...`
      );

      try {
        const baseUrl = window.location.origin;
        const res = await fetch(`${baseUrl}/api/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: id,
            targetLang,
            forceOverwrite,
            provider,
            refineProvider: provider === "deepl" ? refineProvider : undefined,
            customInstructions: additionalNotes.trim() || undefined,
            mode: "translate",
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Translation failed");
          return;
        }

        if (data.preview) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("success");
          setMessage(
            `Translated ${data.fieldsTranslated} fields to ${LANGUAGES[targetLang]} using ${meta.label}.`
          );
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Network error");
      }
    },
    [id, provider, refineProvider, additionalNotes]
  );

  const handleReview = useCallback(async () => {
    setStatus("reviewing");
    const meta = PROVIDER_META[provider];
    setMessage(`Reviewing German translation with ${meta.label}...`);
    setSuggestions([]);
    setAcceptedIndices(new Set());

    try {
      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: id,
          targetLang: "de",
          provider,
          mode: "review",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Review failed");
        return;
      }

      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setStatus("review-results");
        setMessage(`Found ${data.suggestions.length} suggestion${data.suggestions.length === 1 ? "" : "s"} across ${data.totalReviewed} fields.`);
      } else {
        setStatus("success");
        setMessage(`Reviewed ${data.totalReviewed} fields — no improvements needed. The translation looks great!`);
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Network error");
    }
  }, [id, provider]);

  const applySuggestion = useCallback(async (suggestion: ReviewSuggestion, idx: number) => {
    setApplyingIndex(idx);
    try {
      const docId = (await sanityClient.fetch(
        `*[_id == $id || _id == "drafts." + $id][0]._id`,
        { id }
      )) || id;

      await sanityClient.patch(docId).set({ [suggestion.field]: suggestion.suggested }).commit();
      setAcceptedIndices((prev) => new Set([...prev, idx]));
    } catch (err: any) {
      console.error("Failed to apply suggestion:", err);
    }
    setApplyingIndex(null);
  }, [id, sanityClient]);

  const applyAll = useCallback(async () => {
    setApplyingIndex(-1);
    try {
      const docId = (await sanityClient.fetch(
        `*[_id == $id || _id == "drafts." + $id][0]._id`,
        { id }
      )) || id;

      const patch: Record<string, string> = {};
      suggestions.forEach((s, idx) => {
        if (!acceptedIndices.has(idx)) {
          patch[s.field] = s.suggested;
        }
      });

      if (Object.keys(patch).length > 0) {
        await sanityClient.patch(docId).set(patch).commit();
      }

      const allIndices = new Set(suggestions.map((_, idx) => idx));
      setAcceptedIndices(allIndices);
    } catch (err: any) {
      console.error("Failed to apply all:", err);
    }
    setApplyingIndex(null);
  }, [id, sanityClient, suggestions, acceptedIndices]);

  if (targetLangs.length === 0) return null;

  const btnBase: React.CSSProperties = {
    padding: "0.75rem 1rem",
    border: "1px solid #333",
    borderRadius: "6px",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: FONT_STACK,
    width: "100%",
  };

  const pillStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "0.2rem 0.6rem",
    borderRadius: "9999px",
    fontSize: "0.7em",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    background: "#1a3a5c",
    color: "#5dade2",
    marginBottom: "0.75rem",
  };

  return {
    label:
      status === "translating" || status === "reviewing"
        ? "Working..."
        : status === "success"
          ? "Done!"
          : isNonEnglish
            ? "Translate from English"
            : "Translate with AI",
    icon: () => (
      <span style={{ fontSize: "1.1em" }} role="img" aria-label="translate">
        🌐
      </span>
    ),
    disabled: status === "translating" || status === "reviewing",
    tone: (
      status === "error"
        ? "critical"
        : status === "success"
          ? "positive"
          : "primary"
    ) as "critical" | "positive" | "primary",
    onHandle: () => {
      setStatus("pick-provider");
    },
    dialog:
      status === "pick-provider"
        ? {
            type: "dialog" as const,
            header: "AI Translation — Choose Provider",
            onClose: () => { setStatus("idle"); setMessage(""); },
            content: (
              <div style={{ padding: "1rem", fontFamily: FONT_STACK }}>
                <div style={pillStyle}>{pageTypeLabel}</div>
                <p style={{ marginBottom: "1rem", fontSize: "0.95em", color: "#ccc" }}>
                  Which AI provider would you like to use?
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {(["deepl", "claude", "openai"] as Provider[]).map((p) => {
                    const meta = PROVIDER_META[p];
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setProvider(p);
                          setStatus("pick-mode");
                        }}
                        style={{
                          ...btnBase,
                          background: provider === p ? "#1a1a2e" : "transparent",
                          color: "#fff",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "1.2em" }}>{meta.icon}</span>
                          <strong>{meta.label}</strong>
                        </div>
                        <span style={{ fontSize: "0.8em", color: "#999", marginTop: "0.25rem", display: "block" }}>
                          {meta.model}{meta.description ? ` — ${meta.description}` : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ),
          }
        : status === "pick-mode"
          ? {
              type: "dialog" as const,
              header: `Translate with ${PROVIDER_META[provider].label}`,
              onClose: () => { setStatus("idle"); setMessage(""); },
              content: (
                <div style={{ padding: "1rem", fontFamily: FONT_STACK }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <span style={pillStyle}>{pageTypeLabel}</span>
                  </div>

                  <p style={{ marginBottom: "0.5rem", fontSize: "0.95em", color: "#ccc" }}>
                    How would you like to translate?
                  </p>
                  <p style={{ marginBottom: "1rem", fontSize: "0.8em", color: "#666" }}>
                    Provider: {PROVIDER_META[provider].icon} {PROVIDER_META[provider].label}
                    {" · "}
                    <button
                      onClick={() => setStatus("pick-provider")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0ea5e9",
                        cursor: "pointer",
                        fontSize: "1em",
                        padding: 0,
                        fontFamily: FONT_STACK,
                      }}
                    >
                      Change
                    </button>
                  </p>

                  {/* Glossary preview */}
                  <div style={{ marginBottom: "1rem" }}>
                    <button
                      onClick={() => setGlossaryExpanded(!glossaryExpanded)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#999",
                        cursor: "pointer",
                        fontSize: "0.8em",
                        fontWeight: 600,
                        padding: 0,
                        fontFamily: FONT_STACK,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <span style={{ transform: glossaryExpanded ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.15s", display: "inline-block" }}>▶</span>
                      Translation Glossary & Style Guide
                    </button>
                    {glossaryExpanded && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.75rem",
                          border: "1px solid #333",
                          borderRadius: "6px",
                          background: "#0a0a0a",
                          maxHeight: "200px",
                          overflow: "auto",
                          fontSize: "0.75em",
                          color: "#888",
                          whiteSpace: "pre-wrap",
                          fontFamily: "monospace",
                          lineHeight: 1.5,
                        }}
                      >
                        {glossaryContent || "Loading glossary..."}
                      </div>
                    )}
                  </div>

                  {/* Additional notes */}
                  <div style={{ marginBottom: "1rem" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8em",
                        fontWeight: 600,
                        color: "#999",
                        marginBottom: "0.35rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Additional Notes (optional)
                    </label>
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder='e.g. "This post is about Portugal — emphasize Ericeira"'
                      rows={2}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.75rem",
                        border: "1px solid #333",
                        borderRadius: "6px",
                        background: "#111",
                        color: "#fff",
                        fontSize: "0.9em",
                        fontFamily: FONT_STACK,
                        resize: "vertical",
                        lineHeight: 1.4,
                        boxSizing: "border-box",
                      }}
                    />
                    <p style={{ fontSize: "0.75em", color: "#666", marginTop: "0.25rem" }}>
                      {provider === "deepl"
                        ? "One-off overrides sent to Claude during the refinement step."
                        : "One-off overrides sent alongside the glossary and page-type instructions."}
                    </p>
                  </div>

                  {provider === "deepl" && (
                    <>
                      <div style={{ marginBottom: "0.75rem", padding: "0.75rem", border: "1px solid #1a3a5c", borderRadius: "6px", background: "#0a1525" }}>
                        <p style={{ fontSize: "0.85em", color: "#5dade2", margin: 0, lineHeight: 1.5 }}>
                          <strong>Hybrid mode:</strong> DeepL translates first for natural German fluency, then AI refines the output using your glossary, brand voice, and page-type instructions.
                        </p>
                      </div>
                      <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", fontSize: "0.8em", fontWeight: 600, color: "#999", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Refinement AI
                        </label>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          {(["claude", "openai"] as RefineProvider[]).map((rp) => {
                            const meta = REFINE_META[rp];
                            const isActive = refineProvider === rp;
                            return (
                              <button
                                key={rp}
                                onClick={() => setRefineProvider(rp)}
                                style={{
                                  flex: 1,
                                  padding: "0.5rem 0.75rem",
                                  border: `1px solid ${isActive ? "#5dade2" : "#333"}`,
                                  borderRadius: "6px",
                                  background: isActive ? "#1a3a5c" : "transparent",
                                  color: isActive ? "#5dade2" : "#999",
                                  cursor: "pointer",
                                  fontSize: "0.85em",
                                  fontWeight: isActive ? 600 : 400,
                                  fontFamily: FONT_STACK,
                                  textAlign: "center",
                                }}
                              >
                                {meta.icon} {meta.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <button
                      onClick={() => handleTranslate(targetLangs[0], false)}
                      style={{ ...btnBase, background: "#1a1a2e", color: "#fff" }}
                    >
                      <strong>Translate new content only</strong>
                      <br />
                      <span style={{ fontSize: "0.85em", color: "#999" }}>
                        Only translates fields that are empty or haven't been translated yet.
                      </span>
                    </button>
                    <button
                      onClick={() => handleTranslate(targetLangs[0], true)}
                      style={{ ...btnBase, background: "transparent", color: "#ccc" }}
                    >
                      <strong>Re-translate everything</strong>
                      <br />
                      <span style={{ fontSize: "0.85em", color: "#999" }}>
                        Overwrites all existing translations with fresh ones from the English source.
                      </span>
                    </button>

                    {isGerman && (
                      <button
                        onClick={handleReview}
                        style={{ ...btnBase, background: "transparent", color: "#ccc", borderColor: "#2a4a6a" }}
                      >
                        <strong style={{ color: "#5dade2" }}>Review translation</strong>
                        <br />
                        <span style={{ fontSize: "0.85em", color: "#999" }}>
                          AI reviews the existing German content for quality, consistency, and localization issues.
                          {provider === "deepl" && " (Uses Claude for review)"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ),
            }
          : status === "review-results"
            ? {
                type: "dialog" as const,
                header: "Translation Review Results",
                onClose: () => { setStatus("idle"); setMessage(""); setSuggestions([]); setAcceptedIndices(new Set()); },
                content: (
                  <div style={{ padding: "1rem", fontFamily: FONT_STACK }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <p style={{ fontSize: "0.9em", color: "#ccc" }}>{message}</p>
                      {suggestions.length > 0 && acceptedIndices.size < suggestions.length && (
                        <button
                          onClick={applyAll}
                          disabled={applyingIndex !== null}
                          style={{
                            padding: "0.4rem 0.8rem",
                            borderRadius: "6px",
                            border: "1px solid #2a4a6a",
                            background: "#1a3a5c",
                            color: "#5dade2",
                            cursor: applyingIndex !== null ? "wait" : "pointer",
                            fontSize: "0.8em",
                            fontWeight: 600,
                            fontFamily: FONT_STACK,
                            flexShrink: 0,
                          }}
                        >
                          {applyingIndex === -1 ? "Applying..." : "Apply All"}
                        </button>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "60vh", overflow: "auto" }}>
                      {suggestions.map((s, idx) => {
                        const isAccepted = acceptedIndices.has(idx);
                        const isApplying = applyingIndex === idx;

                        return (
                          <div
                            key={idx}
                            style={{
                              border: `1px solid ${isAccepted ? "#2d5a3d" : "#333"}`,
                              borderRadius: "8px",
                              padding: "0.75rem",
                              background: isAccepted ? "#0a1f12" : "#111",
                              opacity: isAccepted ? 0.7 : 1,
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                              <span style={{ fontSize: "0.7em", color: "#666", fontFamily: "monospace" }}>
                                {s.field}
                              </span>
                              {isAccepted ? (
                                <span style={{ fontSize: "0.75em", color: "#4ade80", fontWeight: 600 }}>✓ Applied</span>
                              ) : (
                                <button
                                  onClick={() => applySuggestion(s, idx)}
                                  disabled={isApplying || applyingIndex === -1}
                                  style={{
                                    padding: "0.25rem 0.6rem",
                                    borderRadius: "4px",
                                    border: "1px solid #333",
                                    background: "#1a1a2e",
                                    color: "#fff",
                                    cursor: isApplying ? "wait" : "pointer",
                                    fontSize: "0.75em",
                                    fontFamily: FONT_STACK,
                                    flexShrink: 0,
                                  }}
                                >
                                  {isApplying ? "..." : "Accept"}
                                </button>
                              )}
                            </div>

                            <div style={{ fontSize: "0.85em", marginBottom: "0.35rem" }}>
                              <span style={{ color: "#f87171" }}>Current: </span>
                              <span style={{ color: "#ccc" }}>{s.current}</span>
                            </div>
                            <div style={{ fontSize: "0.85em", marginBottom: "0.35rem" }}>
                              <span style={{ color: "#4ade80" }}>Suggested: </span>
                              <span style={{ color: "#ccc" }}>{s.suggested}</span>
                            </div>
                            <div style={{ fontSize: "0.75em", color: "#888", fontStyle: "italic" }}>
                              {s.reason}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {acceptedIndices.size === suggestions.length && suggestions.length > 0 && (
                      <p style={{ marginTop: "1rem", fontSize: "0.85em", color: "#4ade80", textAlign: "center" }}>
                        All suggestions applied. Close this dialog and refresh to see changes.
                      </p>
                    )}
                  </div>
                ),
              }
            : status !== "idle"
              ? {
                  type: "dialog" as const,
                  header: "AI Translation",
                  onClose: () => { setStatus("idle"); setMessage(""); },
                  content: (
                    <div style={{ padding: "1rem", fontFamily: FONT_STACK }}>
                      {(status === "translating" || status === "reviewing") && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              border: "2px solid #ccc",
                              borderTopColor: "#333",
                              borderRadius: "50%",
                              animation: "spin 0.6s linear infinite",
                            }}
                          />
                          <span>{message}</span>
                        </div>
                      )}
                      {status === "success" && (
                        <div>
                          <p style={{ color: "green" }}>{message}</p>
                          <p style={{ marginTop: "0.5rem", fontSize: "0.85em", color: "#666" }}>
                            Close this dialog and refresh the document to see changes.
                          </p>
                        </div>
                      )}
                      {status === "error" && (
                        <div>
                          <p style={{ color: "red" }}>{message}</p>
                          <p style={{ marginTop: "0.5rem", fontSize: "0.85em", color: "#666" }}>
                            Check that your API key is set in environment variables.
                          </p>
                        </div>
                      )}
                      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                    </div>
                  ),
                }
              : undefined,
  };
}
