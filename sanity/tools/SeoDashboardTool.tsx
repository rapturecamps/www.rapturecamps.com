import { useState, useCallback } from "react";
import { styles as s, Spinner, ScoreBadge, ProgressBar } from "../actions/seoActions";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function DeltaBadge({ value, invert, suffix = "" }: { value: number; invert?: boolean; suffix?: string }) {
  if (value === 0) return <span style={{ color: "#666", fontSize: "0.75em" }}>—</span>;
  const positive = invert ? value < 0 : value > 0;
  const color = positive ? "#22c55e" : "#ef4444";
  const arrow = value > 0 ? "▲" : "▼";
  const display = typeof value === "number" && !Number.isInteger(value) ? Math.abs(value).toFixed(1) : Math.abs(value);
  return (
    <span style={{ color, fontSize: "0.75em", fontWeight: 600 }}>
      {arrow} {display}{suffix}
    </span>
  );
}

function TableHeader({ columns }: { columns: { label: string; align?: string; width?: string }[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" "),
        padding: "0.5rem 0.75rem",
        borderBottom: "1px solid #333",
        position: "sticky",
        top: 0,
        background: "#101020",
        zIndex: 1,
      }}
    >
      {columns.map((col) => (
        <span
          key={col.label}
          style={{
            color: "#666",
            fontSize: "0.7em",
            textTransform: "uppercase",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textAlign: (col.align as any) || "left",
          }}
        >
          {col.label}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// GSC Performance Tab
// ---------------------------------------------------------------------------
type GscView = "pages" | "queries" | "quickWins" | "declining";

function GscTab() {
  const [gscStatus, setGscStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [gscData, setGscData] = useState<any>(null);
  const [gscError, setGscError] = useState("");
  const [gscView, setGscView] = useState<GscView>("pages");
  const [period, setPeriod] = useState(28);

  const loadGsc = useCallback(async (days = 28) => {
    setGscStatus("loading");
    setGscError("");
    try {
      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/seo-gsc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: days }),
      });
      const data = await res.json();
      if (data.success) {
        setGscData(data);
        setGscStatus("loaded");
      } else {
        setGscError(data.error || "Failed to fetch GSC data");
        setGscStatus("error");
      }
    } catch (err: any) {
      setGscError(err.message);
      setGscStatus("error");
    }
  }, []);

  const formatCtr = (v: number) => `${(v * 100).toFixed(1)}%`;
  const formatNum = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);

  if (gscStatus === "idle") {
    return (
      <div style={{ ...s.card, textAlign: "center", padding: "2rem" }}>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Fetch live performance data from Google Search Console.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1rem" }}>
          {[7, 28, 90].map((d) => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              style={{
                ...s.button,
                background: period === d ? "#2563eb" : "transparent",
                borderColor: period === d ? "#2563eb" : "#444",
                padding: "0.35rem 0.75rem",
                fontSize: "0.8em",
              }}
            >
              {d}d
            </button>
          ))}
        </div>
        <button onClick={() => loadGsc(period)} style={s.buttonPrimary}>
          Fetch GSC Data
        </button>
      </div>
    );
  }

  if (gscStatus === "loading") return <Spinner message="Fetching data from Google Search Console..." />;

  if (gscStatus === "error") {
    return (
      <div style={{ ...s.card, borderColor: "#ef4444" }}>
        <p style={{ color: "#ef4444", marginBottom: "0.5rem" }}>{gscError}</p>
        <p style={{ color: "#666", fontSize: "0.8em" }}>
          Ensure .gsc-credentials.json is in the project root and the service account has access to Search Console.
        </p>
      </div>
    );
  }

  const ov = gscData?.overview;

  return (
    <>
      {/* Overview cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ ...s.card, textAlign: "center" }}>
          <div style={{ fontSize: "2em", fontWeight: 700, color: "#3b82f6" }}>{formatNum(ov.clicks)}</div>
          <div style={{ color: "#666", fontSize: "0.7em", textTransform: "uppercase", marginBottom: "0.15rem" }}>Clicks</div>
          <DeltaBadge value={ov.clicksDelta} />
        </div>
        <div style={{ ...s.card, textAlign: "center" }}>
          <div style={{ fontSize: "2em", fontWeight: 700, color: "#8b5cf6" }}>{formatNum(ov.impressions)}</div>
          <div style={{ color: "#666", fontSize: "0.7em", textTransform: "uppercase", marginBottom: "0.15rem" }}>Impressions</div>
          <DeltaBadge value={ov.impressionsDelta} />
        </div>
        <div style={{ ...s.card, textAlign: "center" }}>
          <div style={{ fontSize: "2em", fontWeight: 700, color: "#22c55e" }}>{formatCtr(ov.ctr)}</div>
          <div style={{ color: "#666", fontSize: "0.7em", textTransform: "uppercase", marginBottom: "0.15rem" }}>CTR</div>
          <DeltaBadge value={ov.ctrDelta * 100} suffix="pp" />
        </div>
        <div style={{ ...s.card, textAlign: "center" }}>
          <div style={{ fontSize: "2em", fontWeight: 700, color: "#f59e0b" }}>{ov.position.toFixed(1)}</div>
          <div style={{ color: "#666", fontSize: "0.7em", textTransform: "uppercase", marginBottom: "0.15rem" }}>Avg Position</div>
          <DeltaBadge value={ov.positionDelta} invert />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <span style={{ color: "#666", fontSize: "0.75em" }}>{ov.dateRange}</span>
        <span style={{ color: "#444", fontSize: "0.75em" }}>vs previous {ov.period} days</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.35rem" }}>
          {[7, 28, 90].map((d) => (
            <button
              key={d}
              onClick={() => { setPeriod(d); loadGsc(d); }}
              style={{
                ...s.button,
                background: period === d ? "#2563eb" : "transparent",
                borderColor: period === d ? "#2563eb" : "#444",
                padding: "0.2rem 0.6rem",
                fontSize: "0.75em",
              }}
            >
              {d}d
            </button>
          ))}
          <button onClick={() => loadGsc(period)} style={{ ...s.button, padding: "0.2rem 0.6rem", fontSize: "0.75em" }}>
            Refresh
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: "0.35rem", marginBottom: "1rem" }}>
        {([
          ["pages", `Top Pages (${gscData.topPages?.length || 0})`],
          ["queries", `Top Queries (${gscData.topQueries?.length || 0})`],
          ["quickWins", `Quick Wins (${gscData.quickWins?.length || 0})`],
          ["declining", `Declining (${gscData.declining?.length || 0})`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setGscView(key as GscView)}
            style={{
              ...s.button,
              background: gscView === key ? "#2563eb" : "transparent",
              borderColor: gscView === key ? "#2563eb" : "#444",
              padding: "0.3rem 0.75rem",
              fontSize: "0.8em",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Top Pages */}
      {gscView === "pages" && (
        <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
          <TableHeader
            columns={[
              { label: "Page", width: "2.5fr" },
              { label: "Clicks", width: "0.7fr", align: "right" },
              { label: "Δ", width: "0.6fr", align: "right" },
              { label: "Impressions", width: "0.9fr", align: "right" },
              { label: "CTR", width: "0.6fr", align: "right" },
              { label: "Position", width: "0.7fr", align: "right" },
            ]}
          />
          <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
            {(gscData.topPages || []).map((row: any, i: number) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.5fr 0.7fr 0.6fr 0.9fr 0.6fr 0.7fr",
                  padding: "0.5rem 0.75rem",
                  borderBottom: "1px solid #222",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#0ea5e9", fontSize: "0.85em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row.page}>
                  {row.page}
                </span>
                <span style={{ color: "#fff", fontSize: "0.85em", textAlign: "right", fontWeight: 600 }}>{row.clicks}</span>
                <span style={{ textAlign: "right" }}><DeltaBadge value={row.clicksDelta} /></span>
                <span style={{ color: "#ccc", fontSize: "0.85em", textAlign: "right" }}>{formatNum(row.impressions)}</span>
                <span style={{ color: "#ccc", fontSize: "0.85em", textAlign: "right" }}>{formatCtr(row.ctr)}</span>
                <span style={{ color: row.position <= 10 ? "#22c55e" : row.position <= 20 ? "#f59e0b" : "#ef4444", fontSize: "0.85em", textAlign: "right", fontWeight: 600 }}>
                  {row.position}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Queries */}
      {gscView === "queries" && (
        <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
          <TableHeader
            columns={[
              { label: "Query", width: "2.5fr" },
              { label: "Clicks", width: "0.7fr", align: "right" },
              { label: "Δ", width: "0.6fr", align: "right" },
              { label: "Impressions", width: "0.9fr", align: "right" },
              { label: "CTR", width: "0.6fr", align: "right" },
              { label: "Position", width: "0.7fr", align: "right" },
            ]}
          />
          <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
            {(gscData.topQueries || []).map((row: any, i: number) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.5fr 0.7fr 0.6fr 0.9fr 0.6fr 0.7fr",
                  padding: "0.5rem 0.75rem",
                  borderBottom: "1px solid #222",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#fff", fontSize: "0.85em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {row.query}
                </span>
                <span style={{ color: "#fff", fontSize: "0.85em", textAlign: "right", fontWeight: 600 }}>{row.clicks}</span>
                <span style={{ textAlign: "right" }}><DeltaBadge value={row.clicksDelta} /></span>
                <span style={{ color: "#ccc", fontSize: "0.85em", textAlign: "right" }}>{formatNum(row.impressions)}</span>
                <span style={{ color: "#ccc", fontSize: "0.85em", textAlign: "right" }}>{formatCtr(row.ctr)}</span>
                <span style={{ color: row.position <= 10 ? "#22c55e" : row.position <= 20 ? "#f59e0b" : "#ef4444", fontSize: "0.85em", textAlign: "right", fontWeight: 600 }}>
                  {row.position}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Wins */}
      {gscView === "quickWins" && (
        <div>
          {(gscData.quickWins || []).length === 0 ? (
            <div style={{ ...s.card, textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "#666" }}>No quick win opportunities found for this period.</p>
            </div>
          ) : (
            (gscData.quickWins || []).map((row: any, i: number) => (
              <div key={i} style={{ ...s.card, borderLeft: `3px solid ${row.position <= 10 ? "#22c55e" : "#f59e0b"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ color: "#0ea5e9", fontSize: "0.85em" }}>{row.page}</span>
                  <span style={s.badge(row.position <= 10 ? "#22c55e" : "#f59e0b")}>
                    #{row.position}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "0.25rem" }}>
                  <span style={{ color: "#ccc", fontSize: "0.8em" }}>{formatNum(row.impressions)} impressions</span>
                  <span style={{ color: "#ccc", fontSize: "0.8em" }}>{row.clicks} clicks</span>
                  <span style={{ color: "#ccc", fontSize: "0.8em" }}>CTR {formatCtr(row.ctr)}</span>
                </div>
                <p style={{ color: "#999", fontSize: "0.8em" }}>{row.opportunity}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Declining */}
      {gscView === "declining" && (
        <div>
          {(gscData.declining || []).length === 0 ? (
            <div style={{ ...s.card, textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "#22c55e" }}>No pages with significant traffic loss. Looking good!</p>
            </div>
          ) : (
            <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
              <TableHeader
                columns={[
                  { label: "Page", width: "2.5fr" },
                  { label: "Clicks", width: "0.7fr", align: "right" },
                  { label: "Prev", width: "0.7fr", align: "right" },
                  { label: "Change", width: "0.7fr", align: "right" },
                  { label: "Position", width: "0.7fr", align: "right" },
                ]}
              />
              <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
                {(gscData.declining || []).map((row: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2.5fr 0.7fr 0.7fr 0.7fr 0.7fr",
                      padding: "0.5rem 0.75rem",
                      borderBottom: "1px solid #222",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#0ea5e9", fontSize: "0.85em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row.page}>
                      {row.page}
                    </span>
                    <span style={{ color: "#fff", fontSize: "0.85em", textAlign: "right" }}>{row.clicks}</span>
                    <span style={{ color: "#666", fontSize: "0.85em", textAlign: "right" }}>{row.prevClicks}</span>
                    <span style={{ color: "#ef4444", fontSize: "0.85em", textAlign: "right", fontWeight: 600 }}>{row.delta}</span>
                    <span style={{ color: "#ccc", fontSize: "0.85em", textAlign: "right" }}>{row.position}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

interface AssetItem {
  _id: string;
  url: string;
  originalFilename: string;
  altText: string;
  title: string;
  size: number;
  uploadedAt: string;
  generatedAlt?: string;
  generating?: boolean;
}

function ImagesTab() {
  const [imgStatus, setImgStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [imgError, setImgError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [generating, setGenerating] = useState<Set<string>>(new Set());

  const loadImages = useCallback(async () => {
    setImgStatus("loading");
    setImgError("");
    try {
      const baseUrl = window.location.origin;
      const projectId = "ypmt1bmc";
      const dataset = "production";
      const query = encodeURIComponent(
        `*[_type == "sanity.imageAsset"] | order(_createdAt desc) {
          _id, url, originalFilename, altText, title, size,
          "uploadedAt": _createdAt
        }`,
      );
      const res = await fetch(
        `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`,
      );
      const data = await res.json();
      if (data.result) {
        setAssets(data.result);
        setImgStatus("loaded");
      } else {
        setImgError("Failed to load assets");
        setImgStatus("error");
      }
    } catch (err: any) {
      setImgError(err.message);
      setImgStatus("error");
    }
  }, []);

  const handleGenerateAlt = useCallback(
    async (asset: AssetItem, index: number) => {
      setGenerating((prev) => new Set(prev).add(asset._id));
      try {
        const baseUrl = window.location.origin;
        const res = await fetch(`${baseUrl}/api/seo-alt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: asset.url,
            context: asset.originalFilename || "",
          }),
        });
        const data = await res.json();
        if (data.success && data.altText) {
          setAssets((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], generatedAlt: data.altText };
            return updated;
          });
        }
      } catch {
        // silently fail for individual images
      }
      setGenerating((prev) => {
        const next = new Set(prev);
        next.delete(asset._id);
        return next;
      });
    },
    [],
  );

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const missingAlt = assets.filter((a) => !a.altText);
  const withAlt = assets.filter((a) => a.altText);
  const displayAssets = showAll ? assets : missingAlt;

  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    if (bytes > 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  return (
    <div>
      {imgStatus === "idle" && (
        <div style={{ ...s.card, textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            Scan your media library for images missing alt text.
          </p>
          <button onClick={loadImages} style={s.buttonPrimary}>
            Scan Images
          </button>
        </div>
      )}

      {imgStatus === "loading" && <Spinner message="Loading image assets from Sanity..." />}

      {imgStatus === "error" && (
        <div style={{ ...s.card, borderColor: "#ef4444" }}>
          <p style={{ color: "#ef4444" }}>{imgError}</p>
        </div>
      )}

      {imgStatus === "loaded" && (
        <>
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ ...s.card, textAlign: "center" }}>
              <div style={{ fontSize: "2em", fontWeight: 700, color: "#fff" }}>{assets.length}</div>
              <div style={{ color: "#666", fontSize: "0.75em", textTransform: "uppercase" }}>Total Images</div>
            </div>
            <div style={{ ...s.card, textAlign: "center" }}>
              <div style={{ fontSize: "2em", fontWeight: 700, color: "#ef4444" }}>{missingAlt.length}</div>
              <div style={{ color: "#666", fontSize: "0.75em", textTransform: "uppercase" }}>Missing Alt Text</div>
            </div>
            <div style={{ ...s.card, textAlign: "center" }}>
              <div style={{ fontSize: "2em", fontWeight: 700, color: "#22c55e" }}>{withAlt.length}</div>
              <div style={{ color: "#666", fontSize: "0.75em", textTransform: "uppercase" }}>Have Alt Text</div>
            </div>
          </div>

          {/* Toggle */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <button
              onClick={() => setShowAll(false)}
              style={{
                ...s.button,
                background: !showAll ? "#2563eb" : "transparent",
                borderColor: !showAll ? "#2563eb" : "#444",
              }}
            >
              Missing Alt ({missingAlt.length})
            </button>
            <button
              onClick={() => setShowAll(true)}
              style={{
                ...s.button,
                background: showAll ? "#2563eb" : "transparent",
                borderColor: showAll ? "#2563eb" : "#444",
              }}
            >
              All Images ({assets.length})
            </button>
            <button onClick={loadImages} style={{ ...s.button, marginLeft: "auto" }}>
              Refresh
            </button>
          </div>

          {/* Image list */}
          <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
            {displayAssets.length === 0 ? (
              <div style={{ ...s.card, textAlign: "center", padding: "2rem" }}>
                <p style={{ color: "#22c55e", fontWeight: 600 }}>
                  All images have alt text!
                </p>
              </div>
            ) : (
              displayAssets.map((asset, i) => {
                const realIndex = assets.indexOf(asset);
                const isGenerating = generating.has(asset._id);
                return (
                  <div
                    key={asset._id}
                    style={{
                      ...s.card,
                      display: "flex",
                      gap: "0.75rem",
                      borderLeft: `3px solid ${asset.altText ? "#22c55e" : "#ef4444"}`,
                    }}
                  >
                    <img
                      src={`${asset.url}?w=100&h=100&fit=crop&auto=format`}
                      alt=""
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 4,
                        objectFit: "cover",
                        flexShrink: 0,
                        background: "#222",
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          color: "#ccc",
                          fontSize: "0.85em",
                          fontWeight: 500,
                          marginBottom: "0.15rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {asset.originalFilename || asset._id}
                      </p>
                      <p style={{ color: "#666", fontSize: "0.7em", marginBottom: "0.35rem" }}>
                        {formatSize(asset.size || 0)}
                        {asset.uploadedAt && ` · ${new Date(asset.uploadedAt).toLocaleDateString()}`}
                      </p>

                      {asset.altText ? (
                        <p style={{ color: "#22c55e", fontSize: "0.8em" }}>{asset.altText}</p>
                      ) : asset.generatedAlt ? (
                        <div>
                          <p style={{ color: "#f59e0b", fontSize: "0.8em", marginBottom: "0.25rem" }}>
                            {asset.generatedAlt}
                          </p>
                          <button
                            onClick={() => handleCopy(asset.generatedAlt || "")}
                            style={{ ...s.button, fontSize: "0.7em", padding: "0.15rem 0.4rem" }}
                          >
                            Copy
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateAlt(asset, realIndex)}
                          disabled={isGenerating}
                          style={{
                            ...s.button,
                            fontSize: "0.7em",
                            padding: "0.2rem 0.5rem",
                            opacity: isGenerating ? 0.6 : 1,
                          }}
                        >
                          {isGenerating ? "Generating..." : "Generate Alt Text"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function SeoDashboardTool() {
  const [status, setStatus] = useState<"idle" | "loading" | "results" | "error">("idle");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [tab, setTab] = useState<"issues" | "silos" | "images" | "gsc">("issues");

  const handleRun = useCallback(async (save = false) => {
    setStatus("loading");
    setError("");
    try {
      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/seo-dashboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ save }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setStatus("results");
      } else {
        setError(data.error || "Audit failed");
        setStatus("error");
      }
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  }, []);

  const filteredIssues = result?.issues?.filter((i: any) => {
    const matchCategory = filter === "all" || i.category === filter;
    const matchSeverity = severityFilter === "all" || i.severity === severityFilter;
    return matchCategory && matchSeverity;
  }) || [];

  const categories = [...new Set((result?.issues || []).map((i: any) => i.category))];

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: "1.4em", marginBottom: "0.25rem" }}>SEO Dashboard</h2>
          <p style={{ color: "#666", fontSize: "0.85em" }}>
            Site-wide SEO audit with silo health analysis.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(tab === "issues" || tab === "silos") && (
            <>
              <button onClick={() => handleRun(false)} disabled={status === "loading"} style={s.buttonPrimary}>
                {status === "loading" ? "Running..." : "Run Audit"}
              </button>
              {status === "results" && (
                <button onClick={() => handleRun(true)} style={s.button}>
                  Save Results
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Top-level tab selector (always visible) */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <button
          onClick={() => setTab("issues")}
          style={{
            ...s.button,
            background: tab === "issues" ? "#2563eb" : "transparent",
            borderColor: tab === "issues" ? "#2563eb" : "#444",
          }}
        >
          SEO Audit
        </button>
        <button
          onClick={() => setTab("silos")}
          style={{
            ...s.button,
            background: tab === "silos" ? "#2563eb" : "transparent",
            borderColor: tab === "silos" ? "#2563eb" : "#444",
          }}
        >
          Silo Health
        </button>
        <button
          onClick={() => setTab("images")}
          style={{
            ...s.button,
            background: tab === "images" ? "#2563eb" : "transparent",
            borderColor: tab === "images" ? "#2563eb" : "#444",
          }}
        >
          Image Alt Text
        </button>
        <button
          onClick={() => setTab("gsc")}
          style={{
            ...s.button,
            background: tab === "gsc" ? "#2563eb" : "transparent",
            borderColor: tab === "gsc" ? "#2563eb" : "#444",
          }}
        >
          GSC Performance
        </button>
      </div>

      {/* Standalone tabs */}
      {tab === "images" && <ImagesTab />}
      {tab === "gsc" && <GscTab />}

      {/* Audit-dependent tabs */}
      {(tab === "issues" || tab === "silos") && (
        <>
          {status === "idle" && (
            <div style={{ ...s.card, textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "#666", fontSize: "1em" }}>Click "Run Audit" to analyze your site's SEO health.</p>
            </div>
          )}

          {status === "loading" && <Spinner message="Analyzing all pages, building silo map, and running SEO checks..." />}

          {status === "error" && (
            <div style={{ ...s.card, borderColor: "#ef4444" }}>
              <p style={{ color: "#ef4444" }}>{error}</p>
            </div>
          )}

          {status === "results" && result && (
            <>
              {/* Summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ ...s.card, textAlign: "center" }}>
                  <div style={{ fontSize: "2em", fontWeight: 700, color: result.overallScore >= 70 ? "#22c55e" : result.overallScore >= 40 ? "#f59e0b" : "#ef4444" }}>
                    {result.overallScore}
                  </div>
                  <div style={{ color: "#666", fontSize: "0.75em", textTransform: "uppercase" }}>Overall Score</div>
                </div>
                <div style={{ ...s.card, textAlign: "center" }}>
                  <div style={{ fontSize: "2em", fontWeight: 700, color: "#fff" }}>{result.totalPages}</div>
                  <div style={{ color: "#666", fontSize: "0.75em", textTransform: "uppercase" }}>Pages Analyzed</div>
                </div>
                <div
                  onClick={() => { setTab("issues"); setSeverityFilter("critical"); }}
                  style={{ ...s.card, textAlign: "center", cursor: "pointer", outline: severityFilter === "critical" ? "2px solid #ef4444" : "none" }}
                >
                  <div style={{ fontSize: "2em", fontWeight: 700, color: "#ef4444" }}>
                    {result.issues.filter((i: any) => i.severity === "critical").length}
                  </div>
                  <div style={{ color: "#666", fontSize: "0.75em", textTransform: "uppercase" }}>Critical Issues</div>
                </div>
                <div
                  onClick={() => { setTab("issues"); setSeverityFilter("warning"); }}
                  style={{ ...s.card, textAlign: "center", cursor: "pointer", outline: severityFilter === "warning" ? "2px solid #f59e0b" : "none" }}
                >
                  <div style={{ fontSize: "2em", fontWeight: 700, color: "#f59e0b" }}>
                    {result.issues.filter((i: any) => i.severity === "warning").length}
                  </div>
                  <div style={{ color: "#666", fontSize: "0.75em", textTransform: "uppercase" }}>Warnings</div>
                </div>
              </div>

              {tab === "issues" && (
                <>
                  {/* Severity + Category filters */}
                  <div style={{ display: "flex", gap: "0.35rem", marginBottom: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ color: "#666", fontSize: "0.75em", textTransform: "uppercase", marginRight: "0.25rem" }}>Severity</span>
                    {(["all", "critical", "warning", "info"] as const).map((sev) => {
                      const count = sev === "all"
                        ? result.issues.length
                        : result.issues.filter((i: any) => i.severity === sev).length;
                      if (sev !== "all" && count === 0) return null;
                      const bg = severityFilter === sev
                        ? (sev === "critical" ? "#ef4444" : sev === "warning" ? "#f59e0b" : sev === "info" ? "#3b82f6" : "#2563eb")
                        : "#374151";
                      return (
                        <button
                          key={sev}
                          onClick={() => setSeverityFilter(sev)}
                          style={{ ...s.badge(bg), cursor: "pointer", border: "none", padding: "0.25rem 0.75rem" }}
                        >
                          {sev === "all" ? "All" : sev.charAt(0).toUpperCase() + sev.slice(1)} ({count})
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: "0.35rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ color: "#666", fontSize: "0.75em", textTransform: "uppercase", marginRight: "0.25rem" }}>Category</span>
                    <button
                      onClick={() => setFilter("all")}
                      style={{ ...s.badge(filter === "all" ? "#2563eb" : "#374151"), cursor: "pointer", border: "none", padding: "0.25rem 0.75rem" }}
                    >
                      All
                    </button>
                    {categories.map((cat: string) => (
                      <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        style={{ ...s.badge(filter === cat ? "#2563eb" : "#374151"), cursor: "pointer", border: "none", padding: "0.25rem 0.75rem" }}
                      >
                        {cat} ({result.issues.filter((i: any) => i.category === cat).length})
                      </button>
                    ))}
                  </div>

                  {/* Issue list */}
                  <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    {filteredIssues.map((issue: any, i: number) => (
                      <div key={i} style={{ ...s.card, borderLeft: `3px solid ${SEVERITY_COLORS[issue.severity]}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                          <span style={s.badge(SEVERITY_COLORS[issue.severity])}>{issue.severity}</span>
                          <span style={{ color: "#666", fontSize: "0.75em" }}>{issue.category}</span>
                        </div>
                        <p style={{ color: "#fff", fontSize: "0.9em", marginBottom: "0.25rem" }}>{issue.issue}</p>
                        <p style={{ color: "#0ea5e9", fontSize: "0.8em", marginBottom: "0.25rem" }}>{issue.pageUrl}</p>
                        <p style={{ color: "#999", fontSize: "0.8em" }}>💡 {issue.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tab === "silos" && (
                <div>
                  {result.siloHealth.map((silo: any, i: number) => (
                    <div key={i} style={s.card}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: "1em" }}>{silo.siloName}</span>
                        <ScoreBadge score={Math.round(silo.score / 10)} />
                      </div>
                      <ProgressBar value={silo.score / 10} />
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginTop: "0.75rem" }}>
                        <div>
                          <div style={{ color: "#666", fontSize: "0.7em", textTransform: "uppercase" }}>Total Pages</div>
                          <div style={{ color: "#fff", fontSize: "1em", fontWeight: 600 }}>{silo.totalPages}</div>
                        </div>
                        <div>
                          <div style={{ color: "#666", fontSize: "0.7em", textTransform: "uppercase" }}>Orphaned</div>
                          <div style={{ color: silo.orphanedPages > 0 ? "#f59e0b" : "#22c55e", fontSize: "1em", fontWeight: 600 }}>
                            {silo.orphanedPages}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: "#666", fontSize: "0.7em", textTransform: "uppercase" }}>Missing Uplinks</div>
                          <div style={{ color: silo.missingUplinks > 0 ? "#f59e0b" : "#22c55e", fontSize: "1em", fontWeight: 600 }}>
                            {silo.missingUplinks}
                          </div>
                        </div>
                      </div>
                      <p style={{ color: "#666", fontSize: "0.8em", marginTop: "0.5rem" }}>{silo.notes}</p>
                    </div>
                  ))}

                  {/* Page distribution */}
                  {result.siloMap?.pagesByRole && (
                    <div style={{ ...s.card, marginTop: "1rem" }}>
                      <div style={s.sectionTitle}>Site Structure</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
                        {Object.entries(result.siloMap.pagesByRole).map(([role, count]: [string, any]) => (
                          <div key={role}>
                            <div style={{ color: "#666", fontSize: "0.7em", textTransform: "uppercase" }}>{role}</div>
                            <div style={{ color: "#fff", fontSize: "1.2em", fontWeight: 600 }}>{count}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
