/**
 * Shared utilities for all SEO API routes.
 * Provides Sanity client, Claude client factory, content extraction,
 * and silo map builder.
 */
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@sanity/client";

// ---------------------------------------------------------------------------
// Sanity client (reused across all SEO routes)
// ---------------------------------------------------------------------------
export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc",
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: import.meta.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// ---------------------------------------------------------------------------
// Claude client factory (tiered model selection)
// ---------------------------------------------------------------------------
const MODELS = {
  haiku: "claude-haiku-4-5",
  sonnet: "claude-sonnet-4-6",
  opus: "claude-opus-4-6",
} as const;

export type ModelTier = keyof typeof MODELS;

export function createClaude() {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey });
}

export function getModelId(tier: ModelTier): string {
  return MODELS[tier];
}

export async function askClaude(
  tier: ModelTier,
  prompt: string,
  opts: { maxTokens?: number; system?: string } = {},
) {
  const client = createClaude();
  const message = await client.messages.create({
    model: getModelId(tier),
    max_tokens: opts.maxTokens ?? 4096,
    ...(opts.system ? { system: opts.system } : {}),
    messages: [{ role: "user", content: prompt }],
  });
  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

export function parseJsonResponse<T = any>(raw: string): T {
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

// ---------------------------------------------------------------------------
// Content extraction helpers
// ---------------------------------------------------------------------------

/** Convert Portable Text blocks to plain text. */
export function portableTextToPlain(blocks: any[]): string {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .filter((b) => b._type === "block" && b.children)
    .map((b) =>
      b.children
        .filter((c: any) => c._type === "span")
        .map((c: any) => c.text || "")
        .join(""),
    )
    .join("\n\n");
}

/** Extract all text content from a Sanity document (title, body, headings, etc.) */
export function extractDocumentText(doc: any): string {
  const parts: string[] = [];

  if (doc.name) parts.push(doc.name);
  if (doc.title) parts.push(doc.title);
  if (doc.introHeading) parts.push(doc.introHeading);
  if (doc.tagline) parts.push(doc.tagline);
  if (doc.description) parts.push(doc.description);
  if (doc.excerpt) parts.push(doc.excerpt);
  if (doc.heroTitle) parts.push(doc.heroTitle);
  if (doc.heroSubtitle) parts.push(doc.heroSubtitle);
  if (doc.aboutHeading) parts.push(doc.aboutHeading);

  if (doc.introBody && Array.isArray(doc.introBody)) {
    parts.push(portableTextToPlain(doc.introBody));
  }
  if (doc.body && Array.isArray(doc.body)) {
    parts.push(portableTextToPlain(doc.body));
  }

  if (doc.pageBuilder && Array.isArray(doc.pageBuilder)) {
    for (const block of doc.pageBuilder) {
      if (block.heading) parts.push(block.heading);
      if (block.text) parts.push(block.text);
      if (block.body && Array.isArray(block.body)) {
        parts.push(portableTextToPlain(block.body));
      }
      if (block.content && Array.isArray(block.content)) {
        parts.push(portableTextToPlain(block.content));
      }
    }
  }

  return parts.filter(Boolean).join("\n\n");
}

/** Extract headings from Portable Text and pageBuilder blocks. */
export function extractHeadings(doc: any): { level: string; text: string }[] {
  const headings: { level: string; text: string }[] = [];

  function scanBlocks(blocks: any[]) {
    if (!Array.isArray(blocks)) return;
    for (const b of blocks) {
      if (b._type === "block" && b.style?.startsWith("h")) {
        const text = b.children
          ?.filter((c: any) => c._type === "span")
          .map((c: any) => c.text || "")
          .join("");
        if (text) headings.push({ level: b.style, text });
      }
    }
  }

  if (doc.body) scanBlocks(doc.body);
  if (doc.introBody) scanBlocks(doc.introBody);

  if (doc.pageBuilder) {
    for (const block of doc.pageBuilder) {
      if (block.heading) {
        headings.push({ level: block.headingLevel || "h2", text: block.heading });
      }
      if (block.body) scanBlocks(block.body);
      if (block.content) scanBlocks(block.content);
    }
  }

  return headings;
}

/** Count words in text. */
export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Extract internal links from Portable Text body. */
export function extractInternalLinks(doc: any): string[] {
  const links: string[] = [];

  function scanBlocks(blocks: any[]) {
    if (!Array.isArray(blocks)) return;
    for (const b of blocks) {
      if (b.markDefs) {
        for (const md of b.markDefs) {
          if (md._type === "link" && md.href?.startsWith("/")) {
            links.push(md.href);
          }
        }
      }
    }
  }

  if (doc.body) scanBlocks(doc.body);
  if (doc.introBody) scanBlocks(doc.introBody);
  if (doc.pageBuilder) {
    for (const block of doc.pageBuilder) {
      if (block.body) scanBlocks(block.body);
      if (block.content) scanBlocks(block.content);
    }
  }

  return [...new Set(links)];
}

// ---------------------------------------------------------------------------
// Silo map builder
// ---------------------------------------------------------------------------

export interface SiloPage {
  _id: string;
  _type: string;
  title: string;
  url: string;
  role: "pillar" | "hub" | "spoke" | "supporting";
  siloId: string; // country slug or "global"
  internalLinksTo: string[];
  wordCount: number;
}

export interface SiloMap {
  pages: SiloPage[];
  silos: { id: string; name: string; pillarUrl: string | null }[];
}

const PUBLISHED_FILTER = '!(_id in path("drafts.**"))';

const SILO_QUERY = `{
  "countries": *[_type == "country" && (language == "en" || !defined(language)) && ${PUBLISHED_FILTER}] {
    _id, name, "slug": slug.current,
    "heroTitle": heroTitle
  },
  "camps": *[_type == "camp" && (language == "en" || !defined(language)) && ${PUBLISHED_FILTER}] {
    _id, name, "slug": slug.current, tagline, location,
    "countrySlug": country->slug.current,
    "countryName": country->name,
    introBody, body, pageBuilder
  },
  "surfPages": *[_type == "campSurfPage" && (language == "en" || !defined(language)) && ${PUBLISHED_FILTER}] {
    _id, "campSlug": camp->slug.current,
    "countrySlug": camp->country->slug.current,
    heroTitle, pageBuilder, body
  },
  "roomsPages": *[_type == "campRoomsPage" && (language == "en" || !defined(language)) && ${PUBLISHED_FILTER}] {
    _id, "campSlug": camp->slug.current,
    "countrySlug": camp->country->slug.current,
    heroTitle, pageBuilder, body
  },
  "foodPages": *[_type == "campFoodPage" && (language == "en" || !defined(language)) && ${PUBLISHED_FILTER}] {
    _id, "campSlug": camp->slug.current,
    "countrySlug": camp->country->slug.current,
    heroTitle, pageBuilder, body
  },
  "blogPosts": *[_type == "blogPost" && (language == "en" || !defined(language)) && ${PUBLISHED_FILTER}] {
    _id, title, "slug": slug.current, excerpt,
    body, tags, publishedAt,
    "topicClusterSlug": topicCluster->slug.current,
    "siloSlug": silo->slug.current,
    "siloIsCountry": silo->isCountry,
    "categories": categories[]->{ name, "slug": slug.current }
  },
  "pages": *[_type == "page" && (language == "en" || !defined(language)) && ${PUBLISHED_FILTER}] {
    _id, title, "slug": slug.current, body
  }
}`;

export async function buildSiloMap(): Promise<SiloMap> {
  const data = await sanityClient.fetch(SILO_QUERY);
  const pages: SiloPage[] = [];
  const silos: SiloMap["silos"] = [];

  // Countries → pillars
  for (const c of data.countries || []) {
    const url = `/surfcamp/${c.slug}`;
    silos.push({ id: c.slug, name: c.name, pillarUrl: url });
    pages.push({
      _id: c._id,
      _type: "country",
      title: c.name,
      url,
      role: "pillar",
      siloId: c.slug,
      internalLinksTo: [],
      wordCount: 0,
    });
  }

  // Camps → hubs
  for (const camp of data.camps || []) {
    const url = `/surfcamp/${camp.countrySlug}/${camp.slug}`;
    const text = extractDocumentText(camp);
    pages.push({
      _id: camp._id,
      _type: "camp",
      title: camp.name,
      url,
      role: "hub",
      siloId: camp.countrySlug || "global",
      internalLinksTo: extractInternalLinks(camp),
      wordCount: wordCount(text),
    });
  }

  // Sub-pages → spokes
  const subPageTypes = [
    { items: data.surfPages, suffix: "surf", type: "campSurfPage" },
    { items: data.roomsPages, suffix: "rooms", type: "campRoomsPage" },
    { items: data.foodPages, suffix: "food", type: "campFoodPage" },
  ];
  for (const { items, suffix, type } of subPageTypes) {
    for (const sp of items || []) {
      const url = `/surfcamp/${sp.countrySlug}/${sp.campSlug}/${suffix}`;
      const text = extractDocumentText(sp);
      pages.push({
        _id: sp._id,
        _type: type,
        title: sp.heroTitle || suffix,
        url,
        role: "spoke",
        siloId: sp.countrySlug || "global",
        internalLinksTo: extractInternalLinks(sp),
        wordCount: wordCount(text),
      });
    }
  }

  // Blog posts → supporting (assign to silo via silo field, topicCluster, or content)
  for (const post of data.blogPosts || []) {
    const url = `/blog/${post.slug}`;
    const text = extractDocumentText(post);
    let siloId = post.siloSlug || post.topicClusterSlug || "global";

    // Auto-detect silo from content if no explicit cluster
    if (siloId === "global") {
      const textLower = text.toLowerCase();
      for (const silo of silos) {
        const nameL = silo.name.toLowerCase();
        if (textLower.includes(nameL) || post.title?.toLowerCase().includes(nameL)) {
          siloId = silo.id;
          break;
        }
      }
    }

    const contentLinks = extractInternalLinks(post);

    // BlogSurfcampCTA: country-silo posts link to /surfcamp/{country}
    if (post.siloIsCountry && post.siloSlug) {
      const countryUrl = `/surfcamp/${post.siloSlug}`;
      if (!contentLinks.includes(countryUrl)) contentLinks.push(countryUrl);
    }

    pages.push({
      _id: post._id,
      _type: "blogPost",
      title: post.title,
      url,
      role: "supporting",
      siloId,
      internalLinksTo: contentLinks,
      wordCount: wordCount(text),
    });
  }

  // Static pages → supporting (global)
  for (const p of data.pages || []) {
    const url = `/${p.slug}`;
    const text = extractDocumentText(p);
    pages.push({
      _id: p._id,
      _type: "page",
      title: p.title,
      url,
      role: "supporting",
      siloId: "global",
      internalLinksTo: extractInternalLinks(p),
      wordCount: wordCount(text),
    });
  }

  // -----------------------------------------------------------------------
  // Add structural/component-level links rendered by Astro components
  // (CampSubnav, OtherCamps, RelatedBlogPosts, etc.)
  // -----------------------------------------------------------------------
  const pagesByUrl = new Map(pages.map((p) => [p.url, p]));

  for (const page of pages) {
    if (page._type === "camp") {
      // CampSubnav: camp overview → /surf, /rooms, /food sub-pages
      for (const suffix of ["surf", "rooms", "food"]) {
        const subUrl = `${page.url}/${suffix}`;
        if (pagesByUrl.has(subUrl) && !page.internalLinksTo.includes(subUrl)) {
          page.internalLinksTo.push(subUrl);
        }
      }
      // CampSubnav: camp overview → country pillar page
      const pillarUrl = `/surfcamp/${page.siloId}`;
      if (pagesByUrl.has(pillarUrl) && !page.internalLinksTo.includes(pillarUrl)) {
        page.internalLinksTo.push(pillarUrl);
      }
      // OtherCamps: camp → sibling camps in same country
      for (const other of pages) {
        if (other._type === "camp" && other.siloId === page.siloId && other.url !== page.url) {
          if (!page.internalLinksTo.includes(other.url)) {
            page.internalLinksTo.push(other.url);
          }
        }
      }
    }

    if (page._type === "campSurfPage" || page._type === "campRoomsPage" || page._type === "campFoodPage") {
      // CampSubnav: sub-pages → camp overview + sibling sub-pages
      const parentUrl = page.url.replace(/\/(surf|rooms|food)$/, "");
      if (pagesByUrl.has(parentUrl) && !page.internalLinksTo.includes(parentUrl)) {
        page.internalLinksTo.push(parentUrl);
      }
      for (const suffix of ["surf", "rooms", "food"]) {
        const siblingUrl = `${parentUrl}/${suffix}`;
        if (siblingUrl !== page.url && pagesByUrl.has(siblingUrl) && !page.internalLinksTo.includes(siblingUrl)) {
          page.internalLinksTo.push(siblingUrl);
        }
      }
    }
  }

  return { pages, silos };
}

/** Get pages that link to a given URL. */
export function getInboundLinks(siloMap: SiloMap, targetUrl: string): SiloPage[] {
  return siloMap.pages.filter((p) => p.internalLinksTo.includes(targetUrl));
}

/** Get all pages in a specific silo. */
export function getSiloPages(siloMap: SiloMap, siloId: string): SiloPage[] {
  return siloMap.pages.filter((p) => p.siloId === siloId);
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------
export function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(error: string, status = 500) {
  return jsonResponse({ error }, status);
}
