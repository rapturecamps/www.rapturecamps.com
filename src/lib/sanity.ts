import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: import.meta.env.SANITY_API_VERSION || "2024-01-01",
  useCdn: true,
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
