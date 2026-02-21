/**
 * Strip w, h, fit, auto params from an Unsplash URL and return the clean base + path.
 */
function unsplashBase(src: string): string {
  const [path, qs] = src.split("?");
  if (!qs) return path;
  const kept = qs
    .split("&")
    .filter((p) => !/^(w|h|fit|auto)=/.test(p));
  return kept.length ? `${path}?${kept.join("&")}` : path;
}

/**
 * Generate responsive srcset for Unsplash images.
 * For non-Unsplash URLs, returns the original src unchanged.
 */
export function responsiveSrc(src: string, widths: number[] = [400, 800, 1200, 1920]) {
  if (!src.includes("images.unsplash.com")) return { src, srcset: undefined, sizes: undefined };

  const base = unsplashBase(src);
  const sep = base.includes("?") ? "&" : "?";

  const srcset = widths
    .map((w) => `${base}${sep}w=${w}&fit=crop&auto=format ${w}w`)
    .join(", ");

  return {
    src: `${base}${sep}w=${widths[widths.length - 1]}&fit=crop&auto=format`,
    srcset,
  };
}

/**
 * Rewrite an Unsplash URL to a specific width.
 */
export function unsplashWidth(src: string, width: number): string {
  if (!src.includes("images.unsplash.com")) return src;
  const base = unsplashBase(src);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}w=${width}&fit=crop&auto=format`;
}
