export const prerender = false;

import type { APIRoute } from "astro";
import {
  sanityClient,
  askClaude,
  parseJsonResponse,
  buildSiloMap,
  jsonResponse,
  errorResponse,
} from "./_seo-shared";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { keyword, contentType, audience } = await request.json();
    if (!keyword) return errorResponse("Missing keyword", 400);

    const siloMap = await buildSiloMap();

    // Get existing content titles to avoid duplication
    const existingContent = siloMap.pages.map((p) => ({
      title: p.title,
      url: p.url,
      type: p._type,
      silo: p.siloId,
      role: p.role,
    }));

    const siloContext = siloMap.silos
      .map((s) => `- ${s.name} (${s.id}): pillar at ${s.pillarUrl}`)
      .join("\n");

    const prompt = `You are an SEO content strategist for Rapture Surfcamps, a network of surf camps in Bali (Indonesia), Portugal (Ericeira), and Costa Rica.

Generate a comprehensive content brief for a new piece of content.

TARGET KEYWORD: ${keyword}
CONTENT TYPE: ${contentType || "blog post"}
TARGET AUDIENCE: ${audience || "surf enthusiasts, travelers, beginners to advanced surfers"}

EXISTING SITE STRUCTURE (silos):
${siloContext}

EXISTING CONTENT (${existingContent.length} pages):
${JSON.stringify(existingContent.slice(0, 80), null, 0)}

TASK:
Create a detailed content brief that:
1. Analyzes search intent for the keyword
2. Determines which silo this content belongs to
3. Suggests a title and H1 optimized for the keyword
4. Outlines H2/H3 heading structure
5. Lists key topics and questions to cover
6. Identifies internal pages to link TO from this content (prioritizing silo structure)
7. Identifies existing pages that should link BACK to this new content
8. Suggests target word count
9. Notes any existing content that might overlap (cannibalization risk)

Return ONLY a JSON object:
{
  "searchIntent": "informational/transactional/navigational",
  "suggestedSilo": "silo id this content belongs to",
  "title": "SEO-optimized title",
  "h1": "H1 heading",
  "outline": [
    { "heading": "H2 heading", "level": "h2", "notes": "What to cover" },
    { "heading": "H3 subheading", "level": "h3", "notes": "What to cover" }
  ],
  "keyTopics": ["topic 1", "topic 2"],
  "questionsToAnswer": ["question 1", "question 2"],
  "linksToInclude": [
    { "url": "/surfcamp/...", "anchorSuggestion": "text to use", "reason": "why" }
  ],
  "pagesLinkingBack": [
    { "url": "/blog/...", "title": "Page Title", "reason": "why it should link here" }
  ],
  "targetWordCount": 1500,
  "cannibalizationRisk": [
    { "url": "/blog/...", "title": "Existing page", "overlap": "description of overlap" }
  ],
  "competitorAngle": "What angle or unique value to bring vs generic content"
}`;

    const raw = await askClaude("sonnet", prompt, { maxTokens: 8192 });
    const result = parseJsonResponse(raw);

    return jsonResponse({ success: true, keyword, ...result });
  } catch (err: any) {
    console.error("[seo-brief] Error:", err);
    return errorResponse(err.message || "Internal server error");
  }
};
