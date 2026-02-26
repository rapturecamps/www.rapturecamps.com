import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc",
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: import.meta.env.SANITY_API_VERSION || "2024-01-01",
  useCdn: import.meta.env.PROD,
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Generate a responsive image URL with srcset for Sanity images.
 */
export function sanityImageProps(
  source: SanityImageSource,
  {
    widths = [400, 800, 1200, 1920],
    sizes = "100vw",
    alt = "",
  }: {
    widths?: number[];
    sizes?: string;
    alt?: string;
  } = {}
) {
  const srcset = widths
    .map((w) => `${urlFor(source).width(w).auto("format").url()} ${w}w`)
    .join(", ");

  return {
    src: urlFor(source).width(widths[widths.length - 1]).auto("format").url(),
    srcset,
    sizes,
    alt,
  };
}

/**
 * Portable Text serializer types for rendering Sanity rich text in Astro.
 * Extend as needed when adding custom block types.
 */
export type { SanityImageSource };

export const BUNNY_CDN_PULL_ZONE = "vz-79cee76e-e6d.b-cdn.net";
export const BUNNY_STREAM_LIBRARY_ID = "605576";

export function bunnyVideoUrl(videoId: string, resolution = "720p") {
  return `https://${BUNNY_CDN_PULL_ZONE}/${videoId}/play_${resolution}.mp4`;
}

export function bunnyThumbnailUrl(videoId: string) {
  return `https://${BUNNY_CDN_PULL_ZONE}/${videoId}/thumbnail.jpg`;
}

export function bunnyEmbedUrl(videoId: string, options: {
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
} = {}) {
  const params = new URLSearchParams({
    autoplay: String(options.autoplay ?? false),
    preload: "true",
    responsive: "true",
  });
  if (options.loop) params.set("loop", "true");
  if (options.muted) params.set("muted", "true");
  return `https://iframe.mediadelivery.net/embed/${BUNNY_STREAM_LIBRARY_ID}/${videoId}?${params}`;
}
