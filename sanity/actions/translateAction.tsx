import { useState, useCallback } from "react";
import {
  useDocumentOperation,
  useCurrentUser,
  type DocumentActionProps,
} from "sanity";

const LANGUAGES: Record<string, string> = {
  de: "German",
  en: "English",
};

export function TranslateAction(props: DocumentActionProps) {
  const { id, type, draft, published } = props;
  const doc = draft || published;
  const [status, setStatus] = useState<
    "idle" | "confirm" | "translating" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const currentLang = (doc as any)?.language || "en";
  const isNonEnglish = currentLang !== "en";
  const targetLangs = isNonEnglish
    ? [currentLang]
    : Object.keys(LANGUAGES).filter((l) => l !== "en");

  const handleTranslate = useCallback(
    async (targetLang: string, forceOverwrite: boolean) => {
      setStatus("translating");
      setMessage(`Translating to ${LANGUAGES[targetLang]}...`);

      try {
        const baseUrl = window.location.origin;
        const res = await fetch(`${baseUrl}/api/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: id,
            targetLang,
            forceOverwrite,
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
            `Translated ${data.fieldsTranslated} fields to ${LANGUAGES[targetLang]}.`
          );
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Network error");
      }
    },
    [id]
  );

  if (targetLangs.length === 0) return null;

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
    tone: status === "error" ? "critical" : status === "success" ? "positive" : "primary",
    onHandle: () => {
      setStatus("confirm");
    },
    dialog:
      status === "confirm"
        ? {
            type: "dialog" as const,
            header: "AI Translation",
            onClose: () => {
              setStatus("idle");
              setMessage("");
            },
            content: (
              <div style={{ padding: "1rem" }}>
                <p style={{ marginBottom: "1rem", fontSize: "0.95em" }}>
                  How would you like to translate?
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <button
                    onClick={() => handleTranslate(targetLangs[0], false)}
                    style={{
                      padding: "0.75rem 1rem",
                      border: "1px solid #333",
                      borderRadius: "6px",
                      background: "#1a1a2e",
                      color: "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
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
                    style={{
                      padding: "0.75rem 1rem",
                      border: "1px solid #333",
                      borderRadius: "6px",
                      background: "transparent",
                      color: "#ccc",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
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
                <div style={{ padding: "1rem" }}>
                  {status === "translating" && (
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
                        Close this dialog and refresh the translation document to see changes.
                      </p>
                    </div>
                  )}
                  {status === "error" && (
                    <div>
                      <p style={{ color: "red" }}>{message}</p>
                      <p style={{ marginTop: "0.5rem", fontSize: "0.85em", color: "#666" }}>
                        Check that ANTHROPIC_API_KEY is set in your environment variables.
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
