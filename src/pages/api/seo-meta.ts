export const prerender = false;

import type { APIRoute } from "astro";
import {
  sanityClient,
  askClaude,
  parseJsonResponse,
  extractDocumentText,
  extractHeadings,
  jsonResponse,
  errorResponse,
} from "./_seo-shared";

export const PUT: APIRoute = async ({ request }) => {
  try {
    const { documentId, metaTitle, metaDescription } = await request.json();
    if (!documentId) return errorResponse("Missing documentId", 400);

    const patchId =
      (await sanityClient.fetch(
        `*[_id == $id || _id == "drafts." + $id][0]._id`,
        { id: documentId },
      )) || documentId;

    await sanityClient
      .patch(patchId)
      .set({
        "seo.metaTitle": metaTitle,
        "seo.metaDescription": metaDescription,
      })
      .commit();

    return jsonResponse({ success: true });
  } catch (err: any) {
    console.error("[seo-meta PUT] Error:", err);
    return errorResponse(err.message || "Internal server error");
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { documentId } = await request.json();
    if (!documentId) return errorResponse("Missing documentId", 400);

    const doc = await sanityClient.fetch(
      `*[_id == $id || _id == "drafts." + $id][0]`,
      { id: documentId },
    );
    if (!doc) return errorResponse("Document not found", 404);

    const text = extractDocumentText(doc);
    const headings = extractHeadings(doc);
    const currentMeta = doc.seo || {};
    const pageTitle = doc.name || doc.title || doc.heroTitle || "";
    const pageType = doc._type;

    const prompt = `You are an SEO expert for Rapture Surfcamps, a network of surf camps in Bali, Portugal, and Costa Rica.

Generate an optimized meta title and meta description for this page.

PAGE TYPE: ${pageType}
PAGE TITLE: ${pageTitle}
HEADINGS: ${headings.map((h) => `${h.level}: ${h.text}`).join("\n")}
CURRENT META TITLE: ${currentMeta.metaTitle || "(none)"}
CURRENT META DESCRIPTION: ${currentMeta.metaDescription || "(none)"}

CONTENT (first 2000 chars):
${text.slice(0, 2000)}

RULES:
- Meta title: max 60 characters, include primary keyword naturally, include brand "Rapture Surfcamps" or "Rapture" if space allows
- Meta description: max 160 characters, compelling call-to-action, include primary keyword
- Target keywords related to: surf camp, surf lessons, surf holiday + the specific location/topic
- Tone: exciting, aspirational, action-oriented
- For camp pages, include location (Bali, Portugal, Costa Rica, etc.)
- For blog posts, focus on the main topic and search intent

Return ONLY a JSON object with this exact shape:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "primaryKeyword": "...",
  "reasoning": "Brief explanation of keyword/intent choices"
}`;

    const raw = await askClaude("haiku", prompt);
    const result = parseJsonResponse(raw);

    return jsonResponse({
      success: true,
      metaTitle: result.metaTitle,
      metaDescription: result.metaDescription,
      primaryKeyword: result.primaryKeyword,
      reasoning: result.reasoning,
      currentMetaTitle: currentMeta.metaTitle || "",
      currentMetaDescription: currentMeta.metaDescription || "",
    });
  } catch (err: any) {
    console.error("[seo-meta] Error:", err);
    return errorResponse(err.message || "Internal server error");
  }
};
