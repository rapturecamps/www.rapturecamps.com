export const prerender = false;

import type { APIRoute } from "astro";
import {
  sanityClient,
  extractDocumentText,
  extractHeadings,
  extractInternalLinks,
  wordCount,
  jsonResponse,
  errorResponse,
} from "./_seo-shared";

/**
 * Lightweight SEO pre-publish check. No Claude call — pure heuristics for speed.
 */
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
    const internalLinks = extractInternalLinks(doc);
    const words = wordCount(text);
    const metaTitle = doc.seo?.metaTitle || "";
    const metaDesc = doc.seo?.metaDescription || "";

    const checks: { check: string; status: "pass" | "warn" | "fail"; detail: string }[] = [];

    // Meta title
    if (!metaTitle) {
      checks.push({ check: "Meta Title", status: "fail", detail: "No meta title set" });
    } else if (metaTitle.length > 60) {
      checks.push({ check: "Meta Title", status: "warn", detail: `${metaTitle.length} chars (recommended: ≤60)` });
    } else {
      checks.push({ check: "Meta Title", status: "pass", detail: `${metaTitle.length} chars` });
    }

    // Meta description
    if (!metaDesc) {
      checks.push({ check: "Meta Description", status: "fail", detail: "No meta description set" });
    } else if (metaDesc.length > 160) {
      checks.push({ check: "Meta Description", status: "warn", detail: `${metaDesc.length} chars (recommended: ≤160)` });
    } else if (metaDesc.length < 70) {
      checks.push({ check: "Meta Description", status: "warn", detail: `${metaDesc.length} chars (recommended: 70-160)` });
    } else {
      checks.push({ check: "Meta Description", status: "pass", detail: `${metaDesc.length} chars` });
    }

    // Word count
    if (words < 100) {
      checks.push({ check: "Content Length", status: "fail", detail: `${words} words (very thin content)` });
    } else if (words < 300) {
      checks.push({ check: "Content Length", status: "warn", detail: `${words} words (consider expanding)` });
    } else {
      checks.push({ check: "Content Length", status: "pass", detail: `${words} words` });
    }

    // Headings
    if (headings.length === 0) {
      checks.push({ check: "Headings", status: "warn", detail: "No headings found in content" });
    } else {
      checks.push({ check: "Headings", status: "pass", detail: `${headings.length} headings found` });
    }

    // Internal links
    if (internalLinks.length === 0) {
      checks.push({ check: "Internal Links", status: "warn", detail: "No internal links found" });
    } else {
      checks.push({ check: "Internal Links", status: "pass", detail: `${internalLinks.length} internal links` });
    }

    // OG image
    if (doc.seo?.ogImage?.asset || doc.featuredImage?.asset || doc.image?.asset) {
      checks.push({ check: "OG Image", status: "pass", detail: "Image set for social sharing" });
    } else {
      checks.push({ check: "OG Image", status: "warn", detail: "No OG image set — social shares will use default" });
    }

    const failCount = checks.filter((c) => c.status === "fail").length;
    const warnCount = checks.filter((c) => c.status === "warn").length;
    const passCount = checks.filter((c) => c.status === "pass").length;

    return jsonResponse({
      success: true,
      checks,
      summary: {
        pass: passCount,
        warn: warnCount,
        fail: failCount,
        ready: failCount === 0,
      },
    });
  } catch (err: any) {
    console.error("[seo-precheck] Error:", err);
    return errorResponse(err.message || "Internal server error");
  }
};
