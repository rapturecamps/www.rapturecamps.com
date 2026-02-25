import { useCallback, useEffect, useState } from "react";
import { set, unset, type StringInputProps } from "sanity";

type CheckState = "idle" | "checking" | "ok" | "warn" | "error";

export function PathInput(props: StringInputProps) {
  const { value, onChange, elementProps } = props;
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const checkUrl = useCallback(async (path: string) => {
    if (!path) {
      setCheckState("idle");
      setStatusCode(null);
      return;
    }
    setCheckState("checking");
    try {
      const base = window.location.origin;
      const res = await fetch(`${base}/api/check-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const data = await res.json();
      setStatusCode(data.status || null);
      if (data.ok) {
        setCheckState("ok");
      } else if (data.status === 404 || data.status === 410) {
        setCheckState("warn");
      } else {
        setCheckState("error");
      }
    } catch {
      setCheckState("error");
      setStatusCode(null);
    }
  }, []);

  useEffect(() => {
    if (!value) {
      setCheckState("idle");
      return;
    }
    const timer = setTimeout(() => checkUrl(value), 800);
    return () => clearTimeout(timer);
  }, [value, checkUrl]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.currentTarget.value;
      onChange(val ? set(val) : unset());
    },
    [onChange],
  );

  const badgeStyles: Record<CheckState, React.CSSProperties> = {
    idle: { display: "none" },
    checking: {
      color: "#999",
      fontSize: "0.8em",
      marginTop: "6px",
    },
    ok: {
      color: "#4caf50",
      fontSize: "0.8em",
      marginTop: "6px",
    },
    warn: {
      color: "#ff9800",
      fontSize: "0.8em",
      marginTop: "6px",
    },
    error: {
      color: "#f44336",
      fontSize: "0.8em",
      marginTop: "6px",
    },
  };

  const labels: Record<CheckState, string> = {
    idle: "",
    checking: "Checking...",
    ok: `✓ Resolves (${statusCode})`,
    warn: `⚠ Returns ${statusCode}`,
    error: statusCode
      ? `✗ Returns ${statusCode} — page may not exist`
      : "✗ Could not reach URL",
  };

  return (
    <div>
      <input
        {...elementProps}
        type="text"
        value={value || ""}
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "8px 12px",
          border: "1px solid var(--card-border-color, #333)",
          borderRadius: "3px",
          background: "var(--card-bg-color, transparent)",
          color: "inherit",
          fontSize: "inherit",
        }}
      />
      {checkState !== "idle" && (
        <div style={badgeStyles[checkState]}>{labels[checkState]}</div>
      )}
    </div>
  );
}
