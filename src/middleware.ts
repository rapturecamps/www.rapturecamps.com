import { defineMiddleware } from "astro:middleware";
import { createClient } from "@sanity/client";

const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc",
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

let redirectCache: Map<string, { toPath: string; statusCode: number }> | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function getRedirects() {
  const now = Date.now();
  if (redirectCache && now - cacheTime < CACHE_TTL) return redirectCache;

  try {
    const results = await sanityClient.fetch<
      Array<{ fromPath: string; toPath: string; statusCode: number }>
    >(`*[_type == "redirect" && isActive == true]{ fromPath, toPath, statusCode }`);

    redirectCache = new Map();
    for (const r of results) {
      if (r.fromPath) {
        redirectCache.set(r.fromPath, {
          toPath: r.toPath,
          statusCode: r.statusCode || 301,
        });
      }
    }
    cacheTime = now;
  } catch {
    if (!redirectCache) redirectCache = new Map();
  }

  return redirectCache;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // Skip studio, api, and static asset paths
  if (
    pathname.startsWith("/studio") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_") ||
    pathname.includes(".")
  ) {
    return next();
  }

  const redirects = await getRedirects();

  // Try exact match first
  let redirect = redirects.get(pathname);

  // Try with trailing slash
  if (!redirect) redirect = redirects.get(pathname + "/");

  // Try without trailing slash
  if (!redirect && pathname.endsWith("/") && pathname !== "/") {
    redirect = redirects.get(pathname.slice(0, -1));
  }

  if (redirect) {
    return context.redirect(redirect.toPath, redirect.statusCode);
  }

  return next();
});
