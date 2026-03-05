import { useState, useCallback } from "react";
import type { DocumentActionProps } from "sanity";
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
  const { id } = props;
  const [phase, setPhase] = useState<"idle" | "checking" | "results">("idle");
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
      } else {
        setChecks([]);
        setSummary({ pass: 0, warn: 0, fail: 0 });
      }
    } catch {
      setChecks([]);
      setSummary({ pass: 0, warn: 0, fail: 0 });
    }
    setPhase("results");
  }, [id]);

  return {
    label: "SEO Check",
    icon: () => <span style={{ fontSize: "1.1em" }}>🔍</span>,
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
                    <p style={{ color: "#999", fontSize: "0.9em" }}>Could not run checks.</p>
                  )}

                  <button onClick={() => setPhase("idle")} style={{ ...styles.button, marginTop: "1.25rem" }}>
                    Close
                  </button>
                </div>
              ),
            }
          : undefined,
  };
}
