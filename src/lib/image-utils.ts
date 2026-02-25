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
 * Check if a URL is a Sanity CDN image (cdn.sanity.io/images/...).
 */
function isSanityCdn(src: string): boolean {
  return src.includes("cdn.sanity.io/images/");
}

/**
 * Strip existing query params from a Sanity CDN URL and return the base.
 */
function parseSanity(src: string) {
  const [base] = src.split("?");
  const dimMatch = base.match(/-(\d+)x(\d+)\.\w+$/);
  const origW = dimMatch ? parseInt(dimMatch[1], 10) : 0;
  const origH = dimMatch ? parseInt(dimMatch[2], 10) : 0;
  return { base, origW, origH };
}

/**
 * Generate responsive srcset for Unsplash and Sanity CDN images.
 * Preserves the original aspect ratio across all breakpoints.
 * For other URLs, returns the original src unchanged.
 */
export function responsiveSrc(src: string, widths: number[] = [400, 800, 1200, 1920]) {
  if (src.includes("images.unsplash.com")) {
    const { base, origW, origH } = parseUnsplash(src);
    const sep = base.includes("?") ? "&" : "?";
    const ratio = origW && origH ? origH / origW : 0;

    function buildUrl(w: number) {
      const hParam = ratio ? `&h=${Math.round(w * ratio)}` : "";
      return `${base}${sep}w=${w}${hParam}&fit=crop&auto=format`;
    }

    return {
      src: buildUrl(widths[widths.length - 1]),
      srcset: widths.map((w) => `${buildUrl(w)} ${w}w`).join(", "),
    };
  }

  if (isSanityCdn(src)) {
    const { base, origW, origH } = parseSanity(src);
    const ratio = origW && origH ? origH / origW : 0;

    function buildUrl(w: number) {
      const capped = origW ? Math.min(w, origW) : w;
      const hParam = ratio ? `&h=${Math.round(capped * ratio)}` : "";
      return `${base}?w=${capped}${hParam}&fit=crop&auto=format`;
    }

    return {
      src: buildUrl(widths[widths.length - 1]),
      srcset: widths.map((w) => `${buildUrl(w)} ${w}w`).join(", "),
    };
  }

  return { src, srcset: undefined, sizes: undefined };
}

/**
 * Rewrite an image URL to a specific width, preserving aspect ratio.
 * Works with both Unsplash and Sanity CDN URLs.
 */
export function resizeWidth(src: string, width: number): string {
  if (src.includes("images.unsplash.com")) {
    const { base, origW, origH } = parseUnsplash(src);
    const sep = base.includes("?") ? "&" : "?";
    const ratio = origW && origH ? origH / origW : 0;
    const hParam = ratio ? `&h=${Math.round(width * ratio)}` : "";
    return `${base}${sep}w=${width}${hParam}&fit=crop&auto=format`;
  }

  if (isSanityCdn(src)) {
    const { base, origW, origH } = parseSanity(src);
    const capped = origW ? Math.min(width, origW) : width;
    const ratio = origW && origH ? origH / origW : 0;
    const hParam = ratio ? `&h=${Math.round(capped * ratio)}` : "";
    return `${base}?w=${capped}${hParam}&fit=crop&auto=format`;
  }

  return src;
}

/** @deprecated Use resizeWidth instead */
export const unsplashWidth = resizeWidth;
