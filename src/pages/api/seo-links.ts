export const prerender = false;

import type { APIRoute } from "astro";
import {
  sanityClient,
  askClaude,
  parseJsonResponse,
  extractDocumentText,
  extractInternalLinks,
  buildSiloMap,
  getSiloPages,
  getInboundLinks,
  jsonResponse,
  errorResponse,
  type SiloPage,
} from "./_seo-shared";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { documentId } = await request.json();
    if (!documentId) return errorResponse("Missing documentId", 400);

    const doc = await sanityClient.fetch(
      `*[_id == $id || _id == "drafts." + $id][0]`,
      { id: documentId },
    );
    if (!doc) return errorResponse("Document not found", 404);

    const siloMap = await buildSiloMap();
    const text = extractDocumentText(doc);
    const existingLinks = extractInternalLinks(doc);

    // Find the current page in the silo map
    const currentPage = siloMap.pages.find((p) => p._id === doc._id || p._id === documentId);
    const currentRole = currentPage?.role || "supporting";
    const currentSilo = currentPage?.siloId || "global";
    const currentUrl = currentPage?.url || "";

    // Build the site map context for Claude
    const sitePages = siloMap.pages
      .filter((p) => p._id !== doc._id && p._id !== documentId)
      .map((p) => ({
        title: p.title,
        url: p.url,
        role: p.role,
        silo: p.siloId,
        type: p._type,
      }));

    const siloContext = siloMap.silos
      .map((s) => `- ${s.name} (${s.id}): pillar at ${s.pillarUrl}`)
      .join("\n");

    // Detect silo warnings
    const siloWarnings: string[] = [];

    if (currentRole === "supporting") {
      const siloPages = getSiloPages(siloMap, currentSilo);
      const pillar = siloPages.find((p) => p.role === "pillar");
      const hubs = siloPages.filter((p) => p.role === "hub");

      if (pillar && !existingLinks.includes(pillar.url)) {
        siloWarnings.push(`This page doesn't link to its silo pillar (${pillar.title} at ${pillar.url})`);
      }
      if (hubs.length > 0 && !hubs.some((h) => existingLinks.includes(h.url))) {
        siloWarnings.push(`This page doesn't link to any hub pages in the ${currentSilo} silo`);
      }
    }

    if (currentRole === "hub") {
      const siloPages = getSiloPages(siloMap, currentSilo);
      const pillar = siloPages.find((p) => p.role === "pillar");
      if (pillar && !existingLinks.includes(pillar.url)) {
        siloWarnings.push(`This hub page doesn't link up to its pillar (${pillar.title} at ${pillar.url})`);
      }
    }

    if (currentRole === "spoke") {
      const siloPages = getSiloPages(siloMap, currentSilo);
      const hubs = siloPages.filter((p) => p.role === "hub");
      if (hubs.length > 0 && !hubs.some((h) => existingLinks.includes(h.url))) {
        siloWarnings.push(`This spoke page doesn't link back to its hub page`);
      }
    }

    // Detect orphan pillar (no inbound from supporting)
    if (currentRole === "pillar") {
      const inbound = getInboundLinks(siloMap, currentUrl);
      const supportingInbound = inbound.filter((p) => p.role === "supporting");
      if (supportingInbound.length === 0) {
        siloWarnings.push(`No blog posts link to this pillar page — it has weak topical authority`);
      }
    }

    const prompt = `You are an SEO specialist analyzing internal linking for Rapture Surfcamps.

CURRENT PAGE:
- Title: ${currentPage?.title || doc.name || doc.title}
- URL: ${currentUrl}
- Role: ${currentRole} (in ${currentSilo} silo)
- Existing internal links: ${existingLinks.length > 0 ? existingLinks.join(", ") : "(none)"}

SILO STRUCTURE:
${siloContext}

ALL SITE PAGES (available link targets):
${JSON.stringify(sitePages.slice(0, 100), null, 0)}

CURRENT PAGE CONTENT (first 3000 chars):
${text.slice(0, 3000)}

TASK:
Identify 5-15 phrases in the content that should become internal links. For each:
1. Find the exact phrase in the content
2. Match it to the most relevant target page
3. Classify the link type based on silo roles
4. Prioritize links that strengthen the silo structure

LINK TYPE PRIORITY (highest to lowest):
1. supporting→pillar (blog linking up to country page)
2. supporting→hub (blog linking to camp page)
3. hub→pillar (camp linking to country page)
4. spoke→hub (sub-page linking to camp overview)
5. cross-spoke (surf page → rooms page of same camp)
6. pillar→hub (country page linking to camps)
7. strategic cross-silo (only if topically justified)

Return ONLY a JSON object:
{
  "suggestions": [
    {
      "phrase": "exact text from content",
      "targetUrl": "/surfcamp/...",
      "targetTitle": "Page Title",
      "linkType": "supporting→pillar",
      "priority": 1,
      "reason": "Why this link strengthens SEO"
    }
  ]
}

Sort by priority (1 = highest). Skip pages that are already linked.`;

    const raw = await askClaude("sonnet", prompt, { maxTokens: 4096 });
    const parsed = parseJsonResponse(raw);

    return jsonResponse({
      success: true,
      currentPage: {
        title: currentPage?.title || doc.name || doc.title,
        url: currentUrl,
        role: currentRole,
        siloId: currentSilo,
        siloName: siloMap.silos.find((s) => s.id === currentSilo)?.name || currentSilo,
      },
      existingLinks,
      suggestions: parsed.suggestions || [],
      siloWarnings,
    });
  } catch (err: any) {
    console.error("[seo-links] Error:", err);
    return errorResponse(err.message || "Internal server error");
  }
};
