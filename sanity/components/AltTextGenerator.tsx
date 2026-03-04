import { useState, useCallback } from "react";

/**
 * Standalone Alt Text Generator button component.
 * Can be used alongside image fields in Sanity Studio.
 * Call from a document action or embed in custom input.
 */
interface AltTextGeneratorProps {
  imageUrl: string;
  context?: string;
  onApply: (altText: string) => void;
}

export function AltTextGenerator({ imageUrl, context, onApply }: AltTextGeneratorProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "preview" | "error">("idle");
  const [result, setResult] = useState<{ altText: string; altTextShort: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/seo-alt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, context }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setEditValue(data.altText);
        setStatus("preview");
      } else {
        setError(data.error || "Failed");
        setStatus("error");
      }
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  }, [imageUrl, context]);

  if (!imageUrl) return null;

  return (
    <div style={{ marginTop: "0.5rem" }}>
      {status === "idle" && (
        <button
          onClick={handleGenerate}
          style={{
            padding: "0.35rem 0.75rem",
            border: "1px solid #444",
            borderRadius: "4px",
            background: "#1a1a2e",
            color: "#ccc",
            cursor: "pointer",
            fontSize: "0.8em",
          }}
        >
          🤖 Generate Alt Text
        </button>
      )}

      {status === "loading" && (
        <span style={{ color: "#999", fontSize: "0.8em" }}>Generating alt text...</span>
      )}

      {status === "error" && (
        <div>
          <span style={{ color: "#ef4444", fontSize: "0.8em" }}>{error}</span>
          <button
            onClick={handleGenerate}
            style={{
              marginLeft: "0.5rem",
              padding: "0.2rem 0.5rem",
              border: "1px solid #444",
              borderRadius: "4px",
              background: "transparent",
              color: "#ccc",
              cursor: "pointer",
              fontSize: "0.75em",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {status === "preview" && result && (
        <div style={{ marginTop: "0.25rem" }}>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            style={{
              width: "100%",
              padding: "0.4rem 0.6rem",
              border: "1px solid #444",
              borderRadius: "4px",
              background: "#111",
              color: "#fff",
              fontSize: "0.85em",
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.35rem" }}>
            <button
              onClick={() => {
                onApply(editValue);
                setStatus("idle");
              }}
              style={{
                padding: "0.25rem 0.6rem",
                border: "none",
                borderRadius: "4px",
                background: "#2563eb",
                color: "#fff",
                cursor: "pointer",
                fontSize: "0.75em",
              }}
            >
              Apply
            </button>
            <button
              onClick={handleGenerate}
              style={{
                padding: "0.25rem 0.6rem",
                border: "1px solid #444",
                borderRadius: "4px",
                background: "transparent",
                color: "#ccc",
                cursor: "pointer",
                fontSize: "0.75em",
              }}
            >
              Regenerate
            </button>
            <button
              onClick={() => setStatus("idle")}
              style={{
                padding: "0.25rem 0.6rem",
                border: "1px solid #444",
                borderRadius: "4px",
                background: "transparent",
                color: "#999",
                cursor: "pointer",
                fontSize: "0.75em",
              }}
            >
              Cancel
            </button>
          </div>
          <div style={{ marginTop: "0.25rem", fontSize: "0.7em", color: "#666" }}>
            {editValue.length}/125 characters
          </div>
        </div>
      )}
    </div>
  );
}
