import { useState, useCallback, useEffect } from "react";
import type { DocumentActionProps } from "sanity";
import { useDocumentOperation } from "sanity";
import { Spinner, styles } from "./seoActions";

const STATUS_ICONS: Record<string, string> = {
  pass: "✅",
  warn: "⚠️",
  fail: "❌",
};

const STATUS_COLORS: Record<string, string> = {
  pass: "#22c55e",
  warn: "#f59e0b",
  fail: "#ef4444",
};

export function SeoPublishAction(props: DocumentActionProps) {
  const { id, type, draft, published, onComplete } = props;
  const { publish } = useDocumentOperation(id, type);
  const [phase, setPhase] = useState<"idle" | "checking" | "results" | "publishing">("idle");
  const [checks, setChecks] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const runCheck = useCallback(async () => {
    setPhase("checking");
    try {
      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/seo-precheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setChecks(data.checks);
        setSummary(data.summary);
        setPhase("results");
      } else {
        // If check fails, allow publish anyway
        setChecks([]);
        setSummary({ pass: 0, warn: 0, fail: 0, ready: true });
        setPhase("results");
      }
    } catch {
      setPhase("results");
      setChecks([]);
      setSummary({ pass: 0, warn: 0, fail: 0, ready: true });
    }
  }, [id]);

  const handlePublish = useCallback(() => {
    setPhase("publishing");
    publish.execute();
    if (onComplete) onComplete();
  }, [publish, onComplete]);

  if (!draft) {
    return {
      label: "Publish",
      disabled: true,
      onHandle: () => {},
    };
  }

  return {
    label: phase === "checking" ? "Checking SEO..." : phase === "publishing" ? "Publishing..." : "Publish",
    disabled: phase === "checking" || phase === "publishing" || publish.disabled,
    tone: "positive",
    onHandle: () => {
      runCheck();
    },
    dialog:
      phase === "checking"
        ? {
            type: "dialog" as const,
            header: "SEO Pre-Publish Check",
            onClose: () => setPhase("idle"),
            content: <Spinner message="Running SEO checks..." />,
          }
        : phase === "results"
          ? {
              type: "dialog" as const,
              header: "SEO Pre-Publish Check",
              onClose: () => setPhase("idle"),
              content: (
                <div style={styles.container}>
                  {checks.length > 0 ? (
                    <>
                      <div style={{
                        ...styles.card,
                        textAlign: "center",
                        borderColor: summary?.fail > 0 ? "#ef4444" : summary?.warn > 0 ? "#f59e0b" : "#22c55e",
                      }}>
                        <p style={{
                          fontSize: "1.1em",
                          fontWeight: 600,
                          color: summary?.fail > 0 ? "#ef4444" : summary?.warn > 0 ? "#f59e0b" : "#22c55e",
                        }}>
                          {summary?.fail > 0
                            ? `${summary.fail} issue${summary.fail > 1 ? "s" : ""} found`
                            : summary?.warn > 0
                              ? `${summary.warn} warning${summary.warn > 1 ? "s" : ""}`
                              : "All checks passed!"}
                        </p>
                      </div>

                      {checks.map((c: any, i: number) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.5rem 0",
                            borderBottom: i < checks.length - 1 ? "1px solid #222" : "none",
                          }}
                        >
                          <span>{STATUS_ICONS[c.status]}</span>
                          <span style={{ color: "#fff", fontSize: "0.9em", fontWeight: 500, flex: 1 }}>
                            {c.check}
                          </span>
                          <span style={{ color: STATUS_COLORS[c.status], fontSize: "0.8em" }}>
                            {c.detail}
                          </span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p style={{ color: "#999", fontSize: "0.9em" }}>Could not run checks — proceeding with publish.</p>
                  )}

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
                    <button onClick={handlePublish} style={styles.buttonPrimary}>
                      {summary?.fail > 0 ? "Publish Anyway" : "Publish"}
                    </button>
                    {summary?.fail > 0 && (
                      <button onClick={() => setPhase("idle")} style={styles.button}>
                        Fix First
                      </button>
                    )}
                  </div>
                </div>
              ),
            }
          : undefined,
  };
}
