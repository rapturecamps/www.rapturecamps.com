export const prerender = false;

import type { APIRoute } from "astro";
import { askClaude, parseJsonResponse, jsonResponse, errorResponse } from "./_seo-shared";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { imageUrl, context } = await request.json();
    if (!imageUrl) return errorResponse("Missing imageUrl", 400);

    const prompt = `You are writing alt text for images on Rapture Surfcamps, a network of surf camps in Bali, Portugal, and Costa Rica.

IMAGE URL: ${imageUrl}
CONTEXT (surrounding content): ${context || "(no context provided)"}

Generate descriptive, SEO-friendly alt text for this image.

RULES:
- Be specific and descriptive (not "photo of beach" but "Surfers walking toward the lineup at Padang Padang reef break at sunset")
- Include location context if available from the surrounding content
- Keep under 125 characters
- Don't start with "Image of" or "Photo of"
- Include relevant surfing/travel keywords naturally
- Make it useful for screen reader users

Return ONLY a JSON object:
{
  "altText": "...",
  "altTextShort": "shorter version under 60 chars"
}`;

    const raw = await askClaude("haiku", prompt);
    const result = parseJsonResponse(raw);

    return jsonResponse({
      success: true,
      altText: result.altText,
      altTextShort: result.altTextShort,
    });
  } catch (err: any) {
    console.error("[seo-alt] Error:", err);
    return errorResponse(err.message || "Internal server error");
  }
};
