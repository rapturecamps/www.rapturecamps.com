export const prerender = false;

import type { APIRoute } from "astro";
import {
  sanityClient,
  askClaude,
  parseJsonResponse,
  extractDocumentText,
  jsonResponse,
  errorResponse,
} from "./_seo-shared";

/** Strip HTML to plain text. */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract title from HTML. */
function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
  return match ? match[1].trim() : "";
}

/** Extract meta description from HTML. */
function extractMetaDesc(html: string): string {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  return match ? match[1].trim() : "";
}

/** Extract headings from HTML. */
function extractHtmlHeadings(html: string): { level: string; text: string }[] {
  const headings: { level: string; text: string }[] = [];
  const regex = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (text) headings.push({ level: match[1].toLowerCase(), text });
  }
  return headings;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { competitorUrl, documentId } = await request.json();
    if (!competitorUrl) return errorResponse("Missing competitorUrl", 400);

    // Fetch competitor page
    let competitorHtml: string;
    try {
      const res = await fetch(competitorUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RaptureSEO/1.0)" },
      });
      if (!res.ok) return errorResponse(`Failed to fetch competitor page: ${res.status}`, 400);
      competitorHtml = await res.text();
    } catch (err: any) {
      return errorResponse(`Cannot reach competitor URL: ${err.message}`, 400);
    }

    const competitorText = htmlToText(competitorHtml).slice(0, 5000);
    const competitorTitle = extractTitle(competitorHtml);
    const competitorMetaDesc = extractMetaDesc(competitorHtml);
    const competitorHeadings = extractHtmlHeadings(competitorHtml);

    // Fetch our page if documentId provided
    let ourText = "";
    let ourTitle = "";
    let ourMetaDesc = "";
    if (documentId) {
      const doc = await sanityClient.fetch(
        `*[_id == $id || _id == "drafts." + $id][0]`,
        { id: documentId },
      );
      if (doc) {
        ourText = extractDocumentText(doc).slice(0, 5000);
        ourTitle = doc.seo?.metaTitle || doc.name || doc.title || "";
        ourMetaDesc = doc.seo?.metaDescription || "";
      }
    }

    const prompt = `You are an SEO competitor analyst for Rapture Surfcamps.

COMPETITOR PAGE:
- URL: ${competitorUrl}
- Title: ${competitorTitle}
- Meta Description: ${competitorMetaDesc}
- Headings: ${competitorHeadings.map((h) => `${h.level}: ${h.text}`).join(" | ")}
- Content (first 5000 chars):
${competitorText}

${ourText ? `OUR PAGE:
- Title: ${ourTitle}
- Meta Description: ${ourMetaDesc}
- Content (first 5000 chars):
${ourText}` : "OUR PAGE: (no specific page selected for comparison)"}

ANALYSIS TASKS:
1. Identify the competitor's target keywords
2. Analyze their content structure and depth
3. Find content gaps — topics they cover that we don't (or vice versa)
4. Assess their meta tag optimization
5. Note their heading hierarchy strategy
6. Identify keyword opportunities we're missing
7. Suggest specific improvements for our content

Return ONLY a JSON object:
{
  "competitorSummary": {
    "title": "...",
    "targetKeywords": ["keyword1", "keyword2"],
    "wordCount": 1500,
    "headingCount": 12,
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"]
  },
  "contentGaps": [
    { "topic": "Topic they cover", "importance": "high/medium/low", "suggestion": "How we should address it" }
  ],
  "keywordOpportunities": [
    { "keyword": "...", "searchIntent": "informational/transactional", "suggestion": "How to target it" }
  ],
  "structuralInsights": [
    { "aspect": "Heading structure / Content depth / etc", "theirApproach": "...", "recommendation": "..." }
  ],
  "actionItems": [
    "Most impactful thing to do first",
    "Second action",
    "Third action"
  ]
}`;

    const raw = await askClaude("opus", prompt, { maxTokens: 8192 });
    const result = parseJsonResponse(raw);

    return jsonResponse({
      success: true,
      competitorUrl,
      ...result,
    });
  } catch (err: any) {
    console.error("[seo-competitor] Error:", err);
    return errorResponse(err.message || "Internal server error");
  }
};
