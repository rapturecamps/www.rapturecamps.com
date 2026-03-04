import { useState, useCallback } from "react";
import type { DocumentActionProps } from "sanity";
import { Spinner, ErrorMessage, styles, useSeoAction } from "./seoActions";

interface ImageEntry {
  path: string;
  url: string;
  currentAlt: string;
  suggestedAlt?: string;
  applied?: boolean;
}

function findImages(obj: any, path = ""): ImageEntry[] {
  const images: ImageEntry[] = [];
  if (!obj || typeof obj !== "object") return images;

  if (obj._type === "image" && obj.asset?._ref) {
    const ref = obj.asset._ref;
    const match = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/);
    if (match) {
      const url = `https://cdn.sanity.io/images/ypmt1bmc/production/${match[1]}-${match[2]}.${match[3]}`;
      images.push({
        path,
        url,
        currentAlt: obj.alt || "",
      });
    }
    return images;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      images.push(...findImages(item, `${path}[${i}]`));
    });
  } else {
    for (const [key, val] of Object.entries(obj)) {
      if (key.startsWith("_")) continue;
      images.push(...findImages(val, path ? `${path}.${key}` : key));
    }
  }

  return images;
}

export function GenerateAltTextAction(props: DocumentActionProps) {
  const { id, draft, published } = props;
  const doc = draft || published;
  const [phase, setPhase] = useState<"idle" | "scanning" | "generating" | "results" | "error">("idle");
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState("");
  const seo = useSeoAction("/api/seo-alt");

  const pageContext = doc
    ? [
        (doc as any).name,
        (doc as any).title,
        (doc as any).heroTitle,
        (doc as any).tagline,
      ]
        .filter(Boolean)
        .join(" — ")
    : "";

  const handleScan = useCallback(async () => {
    if (!doc) return;
    setPhase("scanning");
    const found = findImages(doc);
    if (found.length === 0) {
      setError("No images found in this document.");
      setPhase("error");
      return;
    }

    const missing = found.filter((img) => !img.currentAlt);
    if (missing.length === 0) {
      setImages(found);
      setPhase("results");
      return;
    }

    setImages(found);
    setPhase("generating");
    setCurrent(0);

    for (let i = 0; i < found.length; i++) {
      if (found[i].currentAlt) continue;
      setCurrent(i);
      const res = await seo.run({
        imageUrl: found[i].url,
        context: pageContext,
      });
      if (res?.altText) {
        found[i].suggestedAlt = res.altText;
      }
    }

    setImages([...found]);
    setPhase("results");
  }, [doc, seo, pageContext]);

  return {
    label: phase === "generating" ? "Generating..." : "Alt Text",
    icon: () => <span style={{ fontSize: "1.1em" }}>🖼️</span>,
    disabled: phase === "scanning" || phase === "generating",
    onHandle: () => {
      setPhase("idle");
      setImages([]);
      setError("");
      handleScan();
    },
    dialog:
      phase !== "idle"
        ? {
            type: "dialog" as const,
            header: "AI Alt Text Generator",
            onClose: () => {
              setPhase("idle");
              setImages([]);
              setError("");
            },
            content:
              phase === "scanning" ? (
                <Spinner message="Scanning document for images..." />
              ) : phase === "generating" ? (
                <Spinner
                  message={`Generating alt text... (${current + 1}/${images.filter((i) => !i.currentAlt).length})`}
                />
              ) : phase === "error" ? (
                <ErrorMessage message={error} />
              ) : phase === "results" ? (
                <div style={{ ...styles.container, maxHeight: "70vh", overflowY: "auto" }}>
                  <div style={styles.section}>
                    <div style={styles.sectionTitle}>
                      {images.length} images found · {images.filter((i) => i.currentAlt).length} have alt text · {images.filter((i) => !i.currentAlt && i.suggestedAlt).length} suggestions generated
                    </div>
                  </div>

                  {images.map((img, i) => (
                    <div key={i} style={{
                      ...styles.card,
                      borderLeft: `3px solid ${img.currentAlt ? "#22c55e" : img.suggestedAlt ? "#f59e0b" : "#ef4444"}`,
                    }}>
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <img
                          src={`${img.url}?w=80&h=80&fit=crop`}
                          alt=""
                          style={{ width: 60, height: 60, borderRadius: 4, objectFit: "cover", flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: "#666", fontSize: "0.7em", marginBottom: "0.25rem" }}>{img.path}</p>
                          {img.currentAlt ? (
                            <p style={{ color: "#22c55e", fontSize: "0.85em" }}>
                              {img.currentAlt}
                            </p>
                          ) : img.suggestedAlt ? (
                            <div>
                              <p style={{ color: "#f59e0b", fontSize: "0.85em", marginBottom: "0.25rem" }}>
                                {img.suggestedAlt}
                              </p>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(img.suggestedAlt || "");
                                  const updated = [...images];
                                  updated[i].applied = true;
                                  setImages(updated);
                                }}
                                style={{
                                  ...styles.button,
                                  fontSize: "0.7em",
                                  padding: "0.2rem 0.5rem",
                                  background: img.applied ? "#22c55e" : "#1a1a2e",
                                  color: img.applied ? "#fff" : "#ccc",
                                }}
                              >
                                {img.applied ? "Copied!" : "Copy to clipboard"}
                              </button>
                            </div>
                          ) : (
                            <p style={{ color: "#ef4444", fontSize: "0.85em" }}>No alt text (generation failed)</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <p style={{ color: "#666", fontSize: "0.75em", marginTop: "0.75rem" }}>
                    Copy suggested alt text and paste it into the image's alt field manually. Sanity doesn't allow programmatic updates to nested image fields.
                  </p>
                </div>
              ) : null,
          }
        : undefined,
  };
}
