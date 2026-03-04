import { useState, useCallback } from "react";
import type { DocumentActionProps } from "sanity";
import {
  Spinner,
  ErrorMessage,
  CharCount,
  styles,
  useSeoAction,
} from "./seoActions";

export function GenerateMetaAction(props: DocumentActionProps) {
  const { id, draft, published } = props;
  const doc = draft || published;
  const [phase, setPhase] = useState<"idle" | "loading" | "preview" | "applying" | "done" | "error">("idle");
  const [result, setResult] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [error, setError] = useState("");
  const seo = useSeoAction("/api/seo-meta");

  const handleGenerate = useCallback(async () => {
    setPhase("loading");
    const res = await seo.run({ documentId: id });
    if (res) {
      setResult(res);
      setEditTitle(res.metaTitle);
      setEditDesc(res.metaDescription);
      setPhase("preview");
    } else {
      setError(seo.error);
      setPhase("error");
    }
  }, [id, seo]);

  const handleApply = useCallback(async () => {
    setPhase("applying");
    try {
      const baseUrl = window.location.origin;
      const patchRes = await fetch(`${baseUrl}/api/seo-meta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: id,
          metaTitle: editTitle,
          metaDescription: editDesc,
        }),
      });

      if (!patchRes.ok) {
        const data = await patchRes.json();
        setError(data.error || "Failed to apply");
        setPhase("error");
        return;
      }

      setPhase("done");
    } catch (err: any) {
      setError(err.message);
      setPhase("error");
    }
  }, [id, editTitle, editDesc]);

  if (!(doc as any)?.seo && (doc as any)?._type !== "blogPost" && (doc as any)?._type !== "page") {
    return null;
  }

  return {
    label: phase === "loading" ? "Generating..." : phase === "done" ? "Meta Updated!" : "Generate Meta Tags",
    icon: () => <span style={{ fontSize: "1.1em" }}>🏷️</span>,
    disabled: phase === "loading" || phase === "applying",
    tone: phase === "error" ? "critical" : phase === "done" ? "positive" : "primary",
    onHandle: () => {
      if (phase === "idle" || phase === "done" || phase === "error") {
        setPhase("idle");
        setResult(null);
        setError("");
      }
      handleGenerate();
    },
    dialog:
      phase !== "idle"
        ? {
            type: "dialog" as const,
            header: "AI Meta Tag Generator",
            onClose: () => {
              setPhase("idle");
              setResult(null);
              setError("");
            },
            content:
              phase === "loading" ? (
                <Spinner message="Analyzing content and generating meta tags..." />
              ) : phase === "error" ? (
                <ErrorMessage message={error} />
              ) : phase === "applying" ? (
                <Spinner message="Applying meta tags..." />
              ) : phase === "done" ? (
                <div style={styles.container}>
                  <p style={{ color: "#22c55e", fontWeight: 600 }}>Meta tags updated successfully!</p>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.85em", color: "#666" }}>
                    Close this dialog and refresh the document to see changes.
                  </p>
                </div>
              ) : phase === "preview" && result ? (
                <div style={styles.container}>
                  {result.currentMetaTitle && (
                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>Current Meta Title</div>
                      <p style={{ color: "#999", fontSize: "0.9em" }}>{result.currentMetaTitle}</p>
                    </div>
                  )}

                  <div style={styles.section}>
                    <div style={styles.sectionTitle}>Suggested Meta Title</div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={styles.input}
                    />
                    <CharCount value={editTitle} max={60} />
                  </div>

                  {result.currentMetaDescription && (
                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>Current Meta Description</div>
                      <p style={{ color: "#999", fontSize: "0.9em" }}>{result.currentMetaDescription}</p>
                    </div>
                  )}

                  <div style={styles.section}>
                    <div style={styles.sectionTitle}>Suggested Meta Description</div>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={3}
                      style={styles.textarea}
                    />
                    <CharCount value={editDesc} max={160} />
                  </div>

                  <div style={styles.section}>
                    <div style={styles.sectionTitle}>Primary Keyword</div>
                    <p style={{ color: "#0ea5e9", fontSize: "0.9em" }}>{result.primaryKeyword}</p>
                  </div>

                  <div style={styles.section}>
                    <div style={styles.sectionTitle}>Reasoning</div>
                    <p style={{ color: "#999", fontSize: "0.85em" }}>{result.reasoning}</p>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                    <button onClick={handleApply} style={styles.buttonPrimary}>
                      Apply Meta Tags
                    </button>
                    <button onClick={handleGenerate} style={styles.button}>
                      Regenerate
                    </button>
                  </div>
                </div>
              ) : null,
          }
        : undefined,
  };
}
