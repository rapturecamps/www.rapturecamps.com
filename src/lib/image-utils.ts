/**
 * Parse an Unsplash URL into base path and extracted w/h values.
 */
function parseUnsplash(src: string) {
  const [path, qs] = src.split("?");
  if (!qs) return { base: path, origW: 0, origH: 0 };

  let origW = 0;
  let origH = 0;
  const kept: string[] = [];

  for (const p of qs.split("&")) {
    if (p.startsWith("w=")) origW = parseInt(p.slice(2), 10);
    else if (p.startsWith("h=")) origH = parseInt(p.slice(2), 10);
    else if (!p.startsWith("fit=") && !p.startsWith("auto=")) kept.push(p);
  }

  const base = kept.length ? `${path}?${kept.join("&")}` : path;
  return { base, origW, origH };
}

/**
 * Generate responsive srcset for Unsplash images.
 * Preserves the original aspect ratio (w/h) across all breakpoints.
 * For non-Unsplash URLs, returns the original src unchanged.
 */
export function responsiveSrc(src: string, widths: number[] = [400, 800, 1200, 1920]) {
  if (!src.includes("images.unsplash.com")) return { src, srcset: undefined, sizes: undefined };

  const { base, origW, origH } = parseUnsplash(src);
  const sep = base.includes("?") ? "&" : "?";
  const ratio = origW && origH ? origH / origW : 0;

  function buildUrl(w: number) {
    const hParam = ratio ? `&h=${Math.round(w * ratio)}` : "";
    return `${base}${sep}w=${w}${hParam}&fit=crop&auto=format`;
  }

  const srcset = widths.map((w) => `${buildUrl(w)} ${w}w`).join(", ");

  return {
    src: buildUrl(widths[widths.length - 1]),
    srcset,
  };
}

/**
 * Rewrite an Unsplash URL to a specific width, preserving aspect ratio.
 */
export function unsplashWidth(src: string, width: number): string {
  if (!src.includes("images.unsplash.com")) return src;
  const { base, origW, origH } = parseUnsplash(src);
  const sep = base.includes("?") ? "&" : "?";
  const ratio = origW && origH ? origH / origW : 0;
  const hParam = ratio ? `&h=${Math.round(width * ratio)}` : "";
  return `${base}${sep}w=${width}${hParam}&fit=crop&auto=format`;
}
