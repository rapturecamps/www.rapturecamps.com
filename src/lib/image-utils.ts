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
 * Generate responsive srcset for Sanity CDN images.
 * Preserves the original aspect ratio across all breakpoints.
 * For other URLs, returns the original src unchanged.
 */
export function responsiveSrc(src: string | null | undefined, widths: number[] = [400, 800, 1200, 1920]) {
  if (!src) return { src: "", srcset: undefined, sizes: undefined };

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
 * Works with Sanity CDN URLs; returns other URLs unchanged.
 */
export function resizeWidth(src: string | null | undefined, width: number): string {
  if (!src) return "";

  if (isSanityCdn(src)) {
    const { base, origW, origH } = parseSanity(src);
    const capped = origW ? Math.min(width, origW) : width;
    const ratio = origW && origH ? origH / origW : 0;
    const hParam = ratio ? `&h=${Math.round(capped * ratio)}` : "";
    return `${base}?w=${capped}${hParam}&fit=crop&auto=format`;
  }

  return src;
}
