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
    "idle" | "translating" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const currentLang = (doc as any)?.language || "en";

  const targetLangs = Object.keys(LANGUAGES).filter((l) => l !== currentLang);

  const handleTranslate = useCallback(
    async (targetLang: string) => {
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
          : "Translate with AI",
    icon: () => (
      <span style={{ fontSize: "1.1em" }} role="img" aria-label="translate">
        🌐
      </span>
    ),
    disabled: status === "translating",
    tone: status === "error" ? "critical" : status === "success" ? "positive" : "primary",
    onHandle: () => {
      if (targetLangs.length === 1) {
        handleTranslate(targetLangs[0]);
      } else {
        handleTranslate(targetLangs[0]);
      }
    },
    dialog:
      status !== "idle"
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
