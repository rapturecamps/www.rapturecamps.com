/**
 * Generate responsive srcset for Unsplash images.
 * For non-Unsplash URLs, returns the original src unchanged.
 */
export function responsiveSrc(src: string, widths: number[] = [400, 800, 1200, 1920]) {
  if (!src.includes("images.unsplash.com")) return { src, srcset: undefined, sizes: undefined };

  const base = src.replace(/[?&]w=\d+/, "").replace(/[?&]h=\d+/, "");
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
 * Rewrite an Unsplash URL to a specific width (useful for hero background-image).
 */
export function unsplashWidth(src: string, width: number): string {
  if (!src.includes("images.unsplash.com")) return src;
  return src.replace(/w=\d+/, `w=${width}`);
}
