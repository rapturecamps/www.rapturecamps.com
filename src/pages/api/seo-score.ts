export const prerender = false;

import type { APIRoute } from "astro";
import {
  sanityClient,
  askClaude,
  parseJsonResponse,
  extractDocumentText,
  extractHeadings,
  extractInternalLinks,
  wordCount,
  jsonResponse,
  errorResponse,
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

    const text = extractDocumentText(doc);
    const headings = extractHeadings(doc);
    const internalLinks = extractInternalLinks(doc);
    const words = wordCount(text);
    const metaTitle = doc.seo?.metaTitle || "";
    const metaDesc = doc.seo?.metaDescription || "";
    const pageTitle = doc.name || doc.title || doc.heroTitle || "";
    const pageType = doc._type;

    // Count images (rough — scan for resolved image URLs in document)
    const docStr = JSON.stringify(doc);
    const imageCount = (docStr.match(/resolvedImageUrl|"asset"/g) || []).length;

    const prompt = `You are an SEO auditor analyzing a page on Rapture Surfcamps (a surf camp website).

Score this page's SEO on a scale of 1-10 across each category and provide specific, actionable recommendations.

PAGE ANALYSIS DATA:
- Page type: ${pageType}
- Title: ${pageTitle}
- Meta title: ${metaTitle || "(missing)"}
- Meta title length: ${metaTitle.length} chars
- Meta description: ${metaDesc || "(missing)"}
- Meta description length: ${metaDesc.length} chars
- Word count: ${words}
- Heading structure: ${headings.length > 0 ? headings.map((h) => `${h.level}: ${h.text}`).join(" | ") : "(no headings found)"}
- Internal links: ${internalLinks.length} (${internalLinks.join(", ") || "none"})
- Approximate image count: ${imageCount}

CONTENT (first 2000 chars):
${text.slice(0, 2000)}

SCORING CATEGORIES:
1. Keyword Optimization (is primary keyword in title, H1, meta, first paragraph?)
2. Content Depth (word count, topical coverage, comprehensiveness)
3. Heading Structure (proper H1→H2→H3 hierarchy, keyword usage)
4. Meta Tags (title length 50-60, description length 120-160, compelling copy)
5. Internal Links (enough links? Do they point to relevant pages?)
6. Image SEO (images present? alt text coverage likely?)
7. Readability (sentence variety, paragraph length, scannability)

Return ONLY a JSON object:
{
  "overallScore": 7,
  "categories": [
    {
      "name": "Keyword Optimization",
      "score": 8,
      "status": "good",
      "finding": "Primary keyword 'surf camp bali' appears in title and H1",
      "recommendation": "Add keyword to meta description opening"
    }
  ],
  "topPriorities": [
    "Most important thing to fix first",
    "Second priority",
    "Third priority"
  ]
}

Status should be "good" (7-10), "warning" (4-6), or "critical" (1-3).`;

    const raw = await askClaude("sonnet", prompt, { maxTokens: 4096 });
    const result = parseJsonResponse(raw);

    return jsonResponse({
      success: true,
      pageTitle,
      pageType,
      wordCount: words,
      headingCount: headings.length,
      internalLinkCount: internalLinks.length,
      metaTitleLength: metaTitle.length,
      metaDescLength: metaDesc.length,
      ...result,
    });
  } catch (err: any) {
    console.error("[seo-score] Error:", err);
    return errorResponse(err.message || "Internal server error");
  }
};
