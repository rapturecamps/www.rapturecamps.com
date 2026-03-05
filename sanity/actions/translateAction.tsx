import { useState, useCallback } from "react";
import type { DocumentActionProps } from "sanity";

const LANGUAGES: Record<string, string> = {
  de: "German",
  en: "English",
};

type Provider = "claude" | "openai";

const PROVIDER_META: Record<Provider, { label: string; icon: string; model: string }> = {
  claude: { label: "Claude (Anthropic)", icon: "🟣", model: "claude-sonnet-4" },
  openai: { label: "ChatGPT (OpenAI)", icon: "🟢", model: "gpt-4o" },
};

const DEFAULT_INSTRUCTIONS: Record<string, string> = {
  de: `Do NOT do a word-for-word translation. Read and understand the full content first, then rewrite it in natural, fluent German as if you were writing the article yourself for a German-speaking audience.

Key rules:
- Use informal "du" instead of formal "Sie" throughout
- Restructure sentences where needed — German has different natural sentence flow than English
- Use idiomatic German expressions instead of direct translations (e.g. "Worauf wartest du?" not "Was wartest du auf?")
- Keep the surf/travel lifestyle tone: enthusiastic, personal, inspiring — like a friend telling you about their trip
- Preserve the original meaning and key information, but feel free to adjust phrasing, word order, and emphasis to sound native
- Avoid "Denglisch" — don't leave English words where a natural German equivalent exists, except for established surf terms (Surfcamp, Surfspot, Lineup, etc.)`,
};

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif';

export function TranslateAction(props: DocumentActionProps) {
  const { id, draft, published } = props;
  const doc = draft || published;
  const [status, setStatus] = useState<
    "idle" | "pick-provider" | "pick-mode" | "translating" | "success" | "error"
  >("idle");
  const [provider, setProvider] = useState<Provider>("claude");
  const [message, setMessage] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");

  const currentLang = (doc as any)?.language || "en";
  const isNonEnglish = currentLang !== "en";
  const targetLangs = isNonEnglish
    ? [currentLang]
    : Object.keys(LANGUAGES).filter((l) => l !== "en");

  const handleTranslate = useCallback(
    async (targetLang: string, forceOverwrite: boolean) => {
      setStatus("translating");
      const meta = PROVIDER_META[provider];
      setMessage(`Translating to ${LANGUAGES[targetLang]} with ${meta.label}...`);

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
            customInstructions: customInstructions.trim() || undefined,
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
    [id, provider]
  );

  if (targetLangs.length === 0) return null;

  const btnBase = {
    padding: "0.75rem 1rem",
    border: "1px solid #333",
    borderRadius: "6px",
    cursor: "pointer",
    textAlign: "left" as const,
    fontFamily: FONT_STACK,
    width: "100%",
  };

  return {
    label:
      status === "translating"
        ? "Translating..."
        : status === "success"
          ? "Translated!"
          : isNonEnglish
            ? "Translate from English"
            : "Translate with AI",
    icon: () => (
      <span style={{ fontSize: "1.1em" }} role="img" aria-label="translate">
        🌐
      </span>
    ),
    disabled: status === "translating",
    tone:
      status === "error"
        ? "critical"
        : status === "success"
          ? "positive"
          : "primary",
    onHandle: () => {
      setStatus("pick-provider");
    },
    dialog:
      status === "pick-provider"
        ? {
            type: "dialog" as const,
            header: "AI Translation — Choose Provider",
            onClose: () => {
              setStatus("idle");
              setMessage("");
            },
            content: (
              <div style={{ padding: "1rem", fontFamily: FONT_STACK }}>
                <p style={{ marginBottom: "1rem", fontSize: "0.95em", color: "#ccc" }}>
                  Which AI provider would you like to use?
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {(["claude", "openai"] as Provider[]).map((p) => {
                    const meta = PROVIDER_META[p];
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setProvider(p);
                          if (!customInstructions) {
                            setCustomInstructions(DEFAULT_INSTRUCTIONS[targetLangs[0]] || "");
                          }
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
                          Model: {meta.model}
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
              onClose: () => {
                setStatus("idle");
                setMessage("");
              },
              content: (
                <div style={{ padding: "1rem", fontFamily: FONT_STACK }}>
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
                      Custom Instructions (optional)
                    </label>
                    <textarea
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder='e.g. Use informal "du" instead of "Sie"'
                      rows={3}
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
                      These instructions are sent to the AI alongside the translation prompt.
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <button
                      onClick={() => handleTranslate(targetLangs[0], false)}
                      style={{ ...btnBase, background: "#1a1a2e", color: "#fff" }}
                    >
                      <strong>Translate new content only</strong>
                      <br />
                      <span style={{ fontSize: "0.85em", color: "#999" }}>
                        Only translates fields that are empty or haven't been translated yet.
                        Existing translations are preserved.
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
                  </div>
                </div>
              ),
            }
          : status !== "idle"
            ? {
                type: "dialog" as const,
                header: "AI Translation",
                onClose: () => {
                  setStatus("idle");
                  setMessage("");
                },
                content: (
                  <div style={{ padding: "1rem", fontFamily: FONT_STACK }}>
                    {status === "translating" && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
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
                        <p
                          style={{
                            marginTop: "0.5rem",
                            fontSize: "0.85em",
                            color: "#666",
                          }}
                        >
                          Close this dialog and refresh the translation document to
                          see changes.
                        </p>
                      </div>
                    )}
                    {status === "error" && (
                      <div>
                        <p style={{ color: "red" }}>{message}</p>
                        <p
                          style={{
                            marginTop: "0.5rem",
                            fontSize: "0.85em",
                            color: "#666",
                          }}
                        >
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
