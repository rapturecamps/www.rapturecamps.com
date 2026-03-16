export const prerender = false;

import type { APIRoute } from "astro";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createClient } from "@sanity/client";
import glossaryContent from "../../../docs/translation-glossary-de.md?raw";

interface TermReplacement {
  wrong: RegExp;
  correct: string;
}

function parseGlossaryReplacements(): TermReplacement[] {
  const replacements: TermReplacement[] = [];
  const lines = glossaryContent.split("\n");

  let inTable = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.includes("---|")) {
      inTable = true;
      continue;
    }
    if (trimmed.startsWith("|") && inTable) {
      const cells = trimmed.split("|").map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 2) {
        const englishTerm = cells[0].toLowerCase();
        const germanTarget = cells[1].split("/")[0].trim();

        if (!germanTarget) continue;

        const germanVariants = generateWrongVariants(englishTerm, germanTarget);
        for (const variant of germanVariants) {
          replacements.push({
            wrong: new RegExp(`\\b${escapeRegex(variant)}\\b`, "gi"),
            correct: germanTarget,
          });
        }
      }
    } else if (!trimmed.startsWith("|") && trimmed !== "") {
      inTable = false;
    }
  }

  return replacements;
}

function generateWrongVariants(englishTerm: string, correctGerman: string): string[] {
  const variants: string[] = [];
  const compoundPrefixes: Record<string, string[]> = {
    "ocean waves": ["Meereswellen", "Ozeanwellen"],
    "ocean swells": ["Meereswellen", "Ozeanwellen", "Meeresdünung"],
    "swells": ["Dünung", "Meeresdünung"],
    "wave": ["Meereswelle", "Ozeanwelle"],
    "surf lesson": ["Surflektion", "Surf-Lektion"],
    "surf course": ["Surf-Kurs"],
    "accommodation": ["Übernachtung", "Beherbergung"],
    "shared room": ["Geteiltes Zimmer", "Gemeinschaftszimmer", "Doppelzimmer"],
    "surf conditions": ["Surfkonditionen", "Surf-Konditionen"],
    "surf forecast": ["Surf-Vorhersage", "Wellenvorhersage"],
    "guest review": ["Gastrezension", "Gastbewertung"],
    "travel itinerary": ["Reiseplan", "Reiseverlauf"],
    "free cancellation": ["freie Stornierung", "Gratisstornierung"],
    "airport transfer": ["Flughafen-Transfer", "Airporttransfer"],
    "video analysis": ["Video-Analyse"],
  };

  if (compoundPrefixes[englishTerm]) {
    variants.push(...compoundPrefixes[englishTerm]);
  }

  return variants;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyGlossaryReplacements(text: string, replacements: TermReplacement[]): string {
  let result = text;
  for (const r of replacements) {
    result = result.replace(r.wrong, (match) => {
      if (match[0] === match[0].toUpperCase()) {
        return r.correct.charAt(0).toUpperCase() + r.correct.slice(1);
      }
      return r.correct;
    });
  }
  return result;
}

const glossaryReplacements = parseGlossaryReplacements();

function fixColonSpacing(text: string): string {
  return text.replace(/:([^\s:/\\])/g, ": $1");
}

function postProcessTranslations(translationMap: Map<string, string>): Map<string, string> {
  const processed = new Map<string, string>();
  for (const [key, value] of translationMap) {
    let fixed = applyGlossaryReplacements(value, glossaryReplacements);
    fixed = fixColonSpacing(fixed);
    processed.set(key, fixed);
  }
  return processed;
}

const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc",
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: import.meta.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const TRANSLATABLE_STRING_FIELDS = [
  "name",
  "tagline",
  "introHeading",
  "location",
  "description",
  "heading",
  "text",
  "body",
  "buttonText",
  "subtext",
  "alt",
  "imageAlt",
  "caption",
  "label",
  "excerpt",
  "question",
  "answer",
  "title",
  "metaTitle",
  "metaDescription",
  "heroTagline",
  "heroTitle",
  "heroSubtitle",
  "aboutHeading",
  "aboutSubtext",
  "aboutLinkText",
  "surfLevels",
  "minStay",
  "groupSize",
  "subtitle",
  "outcome",
  "level",
  "value",
  "tag",
  "cardTitle",
  "cardNote",
  "eyebrow",
  "dayName",
  "theme",
  "time",
  "authorRole",
  "prefix",
  "quote",
  "desc",
  "item",
  "note",
  "day",
  "starter",
  "main",
  "dessert",
  "activity",
  "meal",
  "type",
  "extra",
];

const SKIP_FIELDS = [
  "_id",
  "_type",
  "_rev",
  "_createdAt",
  "_updatedAt",
  "_key",
  "language",
  "slug",
  "image",
  "heroImages",
  "bookingUrl",
  "latitude",
  "longitude",
  "elfsightId",
  "rating",
  "reviewCount",
  "country",
  "background",
  "category",
  "headingLevel",
  "reverse",
  "height",
  "imageUrl",
  "resolvedImageUrl",
  "icon",
  "video",
  "bunnyVideoId",
  "bunnyLibraryId",
  "bunnyPullZone",
  "spokenLanguages",
  "videoType",
  "videoId",
  "videoPoster",
];

function extractTranslatableContent(obj: any, path = ""): Record<string, any> {
  const result: Record<string, any> = {};
  if (!obj || typeof obj !== "object") return result;

  for (const [key, value] of Object.entries(obj)) {
    if (SKIP_FIELDS.includes(key)) continue;
    const currentPath = path ? `${path}.${key}` : key;

    if (typeof value === "string" && value.trim()) {
      if (TRANSLATABLE_STRING_FIELDS.includes(key) || key === "title") {
        result[currentPath] = value;
      }
    } else if (Array.isArray(value)) {
      if (key === "body" || key === "content") {
        result[currentPath] = value;
      } else       if (
        value.every((v: any) => typeof v === "string") &&
        ["amenities", "features", "highlights", "items", "values"].includes(key)
      ) {
        result[currentPath] = value;
      } else {
        const pageBuilderKeys = [
          "pageBuilder",
        ];
        if (pageBuilderKeys.includes(key)) {
          value.forEach((item: any, i: number) => {
            const nested = extractTranslatableContent(
              item,
              `${currentPath}[${i}]`
            );
            Object.assign(result, nested);
          });
        } else if (
          value.length > 0 &&
          typeof value[0] === "object" &&
          !Array.isArray(value[0])
        ) {
          value.forEach((item: any, i: number) => {
            const nested = extractTranslatableContent(
              item,
              `${currentPath}[${i}]`
            );
            Object.assign(result, nested);
          });
        }
      }
    } else if (typeof value === "object" && value !== null) {
      if (key === "seo" || key === "comparison") {
        const nested = extractTranslatableContent(value, currentPath);
        Object.assign(result, nested);
      }
    }
  }
  return result;
}

function extractPortableTextStrings(
  blocks: any[]
): { path: string; text: string }[] {
  const strings: { path: string; text: string }[] = [];
  blocks.forEach((block, bi) => {
    if (block._type === "block" && block.children) {
      block.children.forEach((child: any, ci: number) => {
        if (child._type === "span" && child.text?.trim()) {
          strings.push({ path: `[${bi}].children[${ci}].text`, text: child.text });
        }
      });
    }
  });
  return strings;
}

const PAGE_TYPE_LABELS: Record<string, string> = {
  blogPost: "Blog Post",
  camp: "Camp Landing Page",
  campSurfPage: "Camp Surf Page",
  campRoomsPage: "Camp Rooms Page",
  campFoodPage: "Camp Food Page",
  country: "Country Landing Page",
  homepage: "Homepage",
  page: "Static Page",
  faq: "FAQ",
};

const PAGE_TYPE_INSTRUCTIONS: Record<string, string> = {
  blogPost: `This is a BLOG POST. Focus on:
- TITLES AND HEADINGS: Do NOT literally translate. Rewrite them as a German copywriter would — short, punchy, benefit-driven. Example: "How To Hike Arenal Volcano: Best Trails & Tips" should become "Arenal Vulkan Wanderung: Die besten Trails & Tipps" — NOT "Wie man den Vulkan Arenal erwandert: Beste Wege & Tipps"
- Natural editorial tone — informative, engaging, easy to read
- SEO keyword awareness — weave German keywords naturally into headings and body
- Readable flow with varied sentence length
- Keep the personal, storytelling quality of the original
- Avoid "Wie man..." or "Was ist..." patterns for titles — use the direct noun-phrase style common in German online media`,

  camp: `This is a CAMP LANDING PAGE (main conversion page). Focus on:
- Strong, benefit-driven headlines that make readers want to book
- Powerful CTAs — every call-to-action must sound compelling in German
- Highlight unique selling points clearly
- Create urgency and excitement without being pushy`,

  campSurfPage: `This is a CAMP SURF PAGE. Focus on:
- Accurate surf terminology (keep established English surf terms)
- Exciting descriptions of waves and conditions
- Make skill levels and progression feel achievable and motivating`,

  campRoomsPage: `This is a CAMP ROOMS PAGE. Focus on:
- Comfort and lifestyle benefits over feature lists
- Make accommodation descriptions feel inviting and aspirational
- Translate amenity lists accurately`,

  campFoodPage: `This is a CAMP FOOD PAGE. Focus on:
- Sensory, appetizing descriptions
- Keep dish names and local food terms authentic
- Convey the social dining experience`,

  country: `This is a COUNTRY LANDING PAGE. Focus on:
- Destination-level excitement and travel inspiration
- Strong benefit statements about why this country is great for surfing
- SEO keywords: "Surfcamp [Country]", "Surfen in [Country]"`,

  homepage: `This is the HOMEPAGE. Focus on:
- Maximum impact — every word counts
- Brand voice consistency — inspiring, premium, adventurous
- CTAs must be irresistible
- Statistics and social proof should sound natural, not translated`,

  faq: `This is an FAQ. Focus on:
- Direct, conversational answers — as if responding to a friend
- Keep answers concise and scannable
- Use "du" naturally in questions and answers`,

  page: `This is a STATIC PAGE (e.g. About, Legal, Terms). Focus on:
- Legal/policy pages: formal but clear, legally accurate
- About pages: warm, brand-aligned storytelling
- Adapt tone based on the page content`,
};

function getPageTypeLabel(docType: string): string {
  return PAGE_TYPE_LABELS[docType] || "Page";
}

function buildContentEntries(content: Record<string, any>): { key: string; value: string }[] {
  const entries: { key: string; value: string }[] = [];
  for (const [path, value] of Object.entries(content)) {
    if (typeof value === "string") {
      entries.push({ key: path, value });
    } else if (Array.isArray(value)) {
      if (value.every((v: any) => typeof v === "string")) {
        value.forEach((v, i) => entries.push({ key: `${path}[${i}]`, value: v }));
      } else {
        const ptStrings = extractPortableTextStrings(value);
        ptStrings.forEach((s) =>
          entries.push({ key: `${path}${s.path}`, value: s.text })
        );
      }
    }
  }
  return entries;
}

function buildTranslationPrompt(
  content: Record<string, any>,
  targetLang: string,
  documentType: string,
  customInstructions?: string
): string {
  const langName = targetLang === "de" ? "German" : targetLang;
  const entries = buildContentEntries(content);

  if (entries.length === 0) return "";

  const lines = entries
    .map((e, i) => `[${i}] PATH: ${e.key}\nTEXT: ${e.value}`)
    .join("\n\n");

  const pageLabel = getPageTypeLabel(documentType);
  const pageInstructions = PAGE_TYPE_INSTRUCTIONS[documentType] || PAGE_TYPE_INSTRUCTIONS["page"];

  const additionalNotes = customInstructions?.trim()
    ? `\nADDITIONAL NOTES FROM THE EDITOR:\n${customInstructions}\n`
    : "";

  return `You are a native ${langName} copywriter for Rapture Surfcamps, a surf camp brand.
Your job is to take English content and rewrite it in natural, fluent ${langName} — NOT translate it word-for-word.

DOCUMENT TYPE: ${pageLabel}
${pageInstructions}

TRANSLATION GLOSSARY AND STYLE GUIDE — MANDATORY RULES:
${glossaryContent}

${additionalNotes}
CORE RULES (in priority order):

1. GLOSSARY TERM PREFERENCES ARE MANDATORY. The glossary above contains a "German Term Preferences" table. You MUST use the exact German terms specified. For example, if the glossary says "ocean waves → Wellen", you must write "Wellen" — never "Meereswellen", "Ozeanwellen", or other variants. Scan your output for any glossary violations before returning.

2. Read the full meaning of each text entry, then write it as a native ${langName} speaker would naturally express it. Restructure sentences where needed.

3. Use idiomatic expressions — follow the few-shot examples in the glossary above.

4. Preserve any HTML tags, markdown formatting, or special characters exactly as they are.

5. Do NOT translate proper nouns, camp names, place names, or brand names listed in the glossary.

6. Ensure headlines sound like native ${langName} marketing copy, not translated English.

7. Meta titles must stay under 60 characters, meta descriptions under 160.

Return ONLY a JSON array where each element is: { "index": <number>, "translation": "<translated text>" }
No explanations, no markdown code fences, just the raw JSON array.

${lines}`;
}

function applyTranslations(
  doc: any,
  content: Record<string, any>,
  translationMap: Map<string, string>
): any {
  const result = JSON.parse(JSON.stringify(doc));

  for (const [path, originalValue] of Object.entries(content)) {
    if (typeof originalValue === "string") {
      const translated = translationMap.get(path);
      if (translated) setNestedValue(result, path, translated);
    } else if (Array.isArray(originalValue)) {
      if (originalValue.every((v: any) => typeof v === "string")) {
        const translated = originalValue.map(
          (_, i) => translationMap.get(`${path}[${i}]`) || originalValue[i]
        );
        setNestedValue(result, path, translated);
      } else {
        const ptStrings = extractPortableTextStrings(originalValue);
        const blocks = getNestedValue(result, path);
        if (Array.isArray(blocks)) {
          ptStrings.forEach((s) => {
            const fullKey = `${path}${s.path}`;
            const translated = translationMap.get(fullKey);
            if (translated) setNestedValue(result, fullKey, translated);
          });
        }
      }
    }
  }

  return result;
}

function setNestedValue(obj: any, path: string, value: any) {
  const parts = parsePath(path);
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined) return;
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

function getNestedValue(obj: any, path: string): any {
  const parts = parsePath(path);
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

function parsePath(path: string): (string | number)[] {
  const parts: (string | number)[] = [];
  const regex = /([^.\[\]]+)|\[(\d+)\]/g;
  let match;
  while ((match = regex.exec(path)) !== null) {
    if (match[1] !== undefined) parts.push(match[1]);
    else if (match[2] !== undefined) parts.push(parseInt(match[2], 10));
  }
  return parts;
}

function fixPortableTextSpanSpacing(doc: any) {
  function fixBlocks(blocks: any[]) {
    if (!Array.isArray(blocks)) return;
    for (const block of blocks) {
      if (block.children && Array.isArray(block.children)) {
        for (let i = 0; i < block.children.length - 1; i++) {
          const curr = block.children[i];
          const next = block.children[i + 1];
          if (!curr.text || !next.text || next.text.length === 0) continue;
          const currHasMarks = curr.marks && curr.marks.length > 0;
          const nextHasMarks = next.marks && next.marks.length > 0;
          if (currHasMarks === nextHasMarks) continue;
          if (curr.text.endsWith(" ") || next.text.startsWith(" ")) continue;
          if (/[.,;:!?)\]}]/.test(next.text[0])) continue;
          if (/[(\[{"']/.test(curr.text[curr.text.length - 1])) continue;
          curr.text += " ";
        }
      }
    }
  }

  if (doc.pageBuilder && Array.isArray(doc.pageBuilder)) {
    for (const block of doc.pageBuilder) {
      if (block.body) fixBlocks(block.body);
    }
  }
  if (doc.comparison) {
    for (const camp of doc.comparison.camps || []) {
      if (camp.body) fixBlocks(camp.body);
    }
  }
}

function buildReviewPrompt(
  content: Record<string, any>,
  documentType: string
): string {
  const entries = buildContentEntries(content);
  if (entries.length === 0) return "";

  const pageLabel = getPageTypeLabel(documentType);
  const lines = entries
    .map((e, i) => `[${i}] PATH: ${e.key}\nTEXT: ${e.value}`)
    .join("\n\n");

  return `You are a senior German-language editor and localization expert reviewing translated content for Rapture Surfcamps.

DOCUMENT TYPE: ${pageLabel}

GLOSSARY AND STYLE GUIDE FOR REFERENCE:
${glossaryContent}

YOUR TASK:
Review the German text below and identify issues. Only flag fields that genuinely need improvement. Do NOT suggest changes for text that is already good.

Check for:
1. ANGLICISMS — awkward English words/phrases where natural German exists (per the glossary)
2. UNNATURAL PHRASING — sentences that sound like translated English rather than native German
3. HEADLINE/CTA STRENGTH — do headlines and CTAs sound like native German marketing copy?
4. TERMINOLOGY CONSISTENCY — are surf terms, brand terms, and form of address (du/ihr) used consistently?
5. SEO METADATA — meta titles under 60 chars, meta descriptions under 160 chars, German keywords present
6. WEAK BENEFIT STATEMENTS — vague or generic phrasing that could be more compelling

Return ONLY a JSON array of suggestions. Each suggestion must have this exact format:
{ "index": <number matching the entry index>, "field": "<field path>", "current": "<current German text>", "suggested": "<improved German text>", "reason": "<brief explanation>" }

If everything looks good and no improvements are needed, return an empty array: []
No explanations, no markdown code fences, just the raw JSON array.

GERMAN CONTENT TO REVIEW:

${lines}`;
}

async function handleReview(
  targetDocId: string,
  documentType: string,
  provider: string,
  anthropicKey: string | undefined,
  openaiKey: string | undefined,
): Promise<Response> {
  const targetDoc = await sanityClient.fetch(
    `*[_id == $id || _id == "drafts." + $id][0]`,
    { id: targetDocId }
  );

  if (!targetDoc) {
    return new Response(
      JSON.stringify({ error: "German document not found" }),
      { status: 404 }
    );
  }

  const content = extractTranslatableContent(targetDoc);
  const prompt = buildReviewPrompt(content, documentType);

  if (!prompt) {
    return new Response(
      JSON.stringify({ error: "No translatable content to review" }),
      { status: 400 }
    );
  }

  let responseText = "";

  if (provider === "openai") {
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500 }
      );
    }
    const openai = new OpenAI({ apiKey: openaiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 16384,
      messages: [{ role: "user", content: prompt }],
    });
    responseText = completion.choices[0]?.message?.content || "";
  } else {
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500 }
      );
    }
    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16384,
      messages: [{ role: "user", content: prompt }],
    });
    responseText = message.content[0].type === "text" ? message.content[0].text : "";
  }

  let suggestions: any[];
  try {
    const cleaned = responseText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    suggestions = JSON.parse(cleaned);
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to parse review response", raw: responseText }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      mode: "review",
      targetDocId,
      suggestions,
      totalReviewed: Object.keys(content).length,
    })
  );
}


export const POST: APIRoute = async ({ request }) => {
  try {
    const { documentId, targetLang, forceOverwrite = false, provider = "claude", customInstructions, mode = "translate" } = await request.json();

    if (!documentId || !targetLang) {
      return new Response(
        JSON.stringify({ error: "Missing documentId or targetLang" }),
        { status: 400 }
      );
    }

    const anthropicKey = import.meta.env.ANTHROPIC_API_KEY;
    const openaiKey = import.meta.env.OPENAI_API_KEY;

    if (provider === "openai" && !openaiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500 }
      );
    }
    if (provider === "claude" && !anthropicKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500 }
      );
    }

    async function fetchDoc(id: string) {
      return (
        await sanityClient.fetch(`*[_id == $id || _id == "drafts." + $id][0]`, { id })
      );
    }

    const currentDoc = await fetchDoc(documentId);
    if (!currentDoc) {
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        { status: 404 }
      );
    }

    const currentDocLang = currentDoc.language || "en";
    const isTargetDoc = currentDocLang === targetLang;

    let sourceDoc: any;
    let targetDocId: string | null = null;

    const metaDoc = await sanityClient.fetch(
      `*[_type == "translation.metadata" && (references($id) || references("drafts." + $id))][0]`,
      { id: documentId }
    );

    if (isTargetDoc) {
      let sourceId: string | null = null;
      if (metaDoc?.translations) {
        const sourceRef = metaDoc.translations.find((t: any) => t._key === "en");
        if (sourceRef?.value?._ref) sourceId = sourceRef.value._ref;
      }

      if (!sourceId) {
        return new Response(
          JSON.stringify({ error: "English source document not found in translation metadata" }),
          { status: 404 }
        );
      }

      sourceDoc = await fetchDoc(sourceId);
      targetDocId = documentId;
    } else {
      sourceDoc = currentDoc;
      if (metaDoc?.translations) {
        const targetRef = metaDoc.translations.find((t: any) => t._key === targetLang);
        if (targetRef?.value?._ref) targetDocId = targetRef.value._ref;
      }
    }

    if (!sourceDoc) {
      return new Response(
        JSON.stringify({ error: "Source document not found" }),
        { status: 404 }
      );
    }

    const documentType = sourceDoc._type || "page";
    const translatableContent = extractTranslatableContent(sourceDoc);

    const sourceSlug = sourceDoc.slug?.current;
    const sourceTitle = sourceDoc.title;

    if (mode === "review") {
      const reviewProvider = provider;
      if (reviewProvider === "claude" && !anthropicKey) {
        return new Response(
          JSON.stringify({ error: "Review requires Claude or OpenAI. ANTHROPIC_API_KEY not configured." }),
          { status: 500 }
        );
      }
      return handleReview(targetDocId || documentId, documentType, reviewProvider, anthropicKey, openaiKey);
    }

    let translationMap: Map<string, string>;
    let translatedSlug: string | null = null;

    {
      const prompt = buildTranslationPrompt(translatableContent, targetLang, documentType, customInstructions);

      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "No translatable content found" }),
          { status: 400 }
        );
      }

      const slugPrompt = sourceTitle
        ? `\n\nAlso translate this page title into a URL-friendly slug in ${targetLang === "de" ? "German" : targetLang}. Use only lowercase letters, numbers, and hyphens. No special characters (ä→ae, ö→oe, ü→ue, ß→ss). Return it as the LAST element in the JSON array using this exact format: { "index": 9999, "translation": "the-translated-slug" }\nTitle: ${sourceTitle}`
        : "";

      let responseText = "";

      if (provider === "openai") {
        const openai = new OpenAI({ apiKey: openaiKey });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          max_tokens: 16384,
          messages: [{ role: "user", content: prompt + slugPrompt }],
        });
        responseText = completion.choices[0]?.message?.content || "";
      } else {
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 16384,
          messages: [{ role: "user", content: prompt + slugPrompt }],
        });
        responseText = message.content[0].type === "text" ? message.content[0].text : "";
      }

      let translations: { index: number; translation: string }[];
      try {
        const cleaned = responseText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        translations = JSON.parse(cleaned);
      } catch (parseErr: any) {
        console.error("[translate] Failed to parse response. Length:", responseText.length, "First 500 chars:", responseText.substring(0, 500));
        return new Response(
          JSON.stringify({ error: "Failed to parse translation response", raw: responseText.substring(0, 1000) }),
          { status: 500 }
        );
      }

      const slugEntry = translations.find((t: any) => t.index === 9999);
      const rawSlug = slugEntry?.translation || (slugEntry as any)?.slug;
      if (rawSlug) {
        translatedSlug = rawSlug
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      translations = translations.filter((t: any) => t.index !== 9999);

      const entries: { key: string; value: string }[] = [];
      for (const [path, value] of Object.entries(translatableContent)) {
        if (typeof value === "string") {
          entries.push({ key: path, value });
        } else if (Array.isArray(value)) {
          if (value.every((v: any) => typeof v === "string")) {
            value.forEach((v, i) =>
              entries.push({ key: `${path}[${i}]`, value: v })
            );
          } else {
            const ptStrings = extractPortableTextStrings(value);
            ptStrings.forEach((s) =>
              entries.push({ key: `${path}${s.path}`, value: s.text })
            );
          }
        }
      }

      translationMap = new Map<string, string>();
      translations.forEach((t) => {
        if (t.index < entries.length) {
          translationMap.set(entries[t.index].key, t.translation);
        }
      });
    }

    const finalTranslationMap = postProcessTranslations(translationMap);

    const translatedDoc = applyTranslations(
      sourceDoc,
      translatableContent,
      finalTranslationMap
    );

    fixPortableTextSpanSpacing(translatedDoc);

    if (targetDocId) {
      const fieldsToUpdate = { ...translatedDoc };
      delete fieldsToUpdate._id;
      delete fieldsToUpdate._rev;
      delete fieldsToUpdate._createdAt;
      delete fieldsToUpdate._updatedAt;
      delete fieldsToUpdate._type;
      delete fieldsToUpdate.language;

      const patchId = (await sanityClient.fetch(
        `*[_id == $id || _id == "drafts." + $id][0]._id`,
        { id: targetDocId }
      )) || targetDocId;

      const existingTarget = await fetchDoc(targetDocId);

      if (translatedSlug) {
        fieldsToUpdate.slug = { _type: "slug", current: translatedSlug };
      } else if (existingTarget?.slug?.current) {
        fieldsToUpdate.slug = existingTarget.slug;
      } else {
        delete fieldsToUpdate.slug;
      }

      if (existingTarget && !forceOverwrite) {
        const fieldsSkipped: string[] = [];
        for (const [path, _] of Object.entries(translatableContent)) {
          const existingVal = getNestedValue(existingTarget, path);
          if (existingVal !== undefined && existingVal !== null && existingVal !== "") {
            const isNonEmptyArray = Array.isArray(existingVal) && existingVal.length > 0;
            const isNonEmptyString = typeof existingVal === "string" && existingVal.trim() !== "";
            if (isNonEmptyString || isNonEmptyArray) {
              const topField = path.split(".")[0].split("[")[0];
              setNestedValue(fieldsToUpdate, path, existingVal);
              fieldsSkipped.push(topField);
            }
          }
        }

        const uniqueSkipped = [...new Set(fieldsSkipped)];
        if (uniqueSkipped.length > 0) {
          console.log(`[translate] Preserved ${uniqueSkipped.length} already-translated fields: ${uniqueSkipped.join(", ")}`);
        }
      }

      await sanityClient
        .patch(patchId)
        .set(fieldsToUpdate)
        .commit();

      return new Response(
        JSON.stringify({
          success: true,
          targetDocId,
          fieldsTranslated: translationMap.size,
          slugTranslated: translatedSlug || undefined,
        })
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        preview: true,
        fieldsTranslated: translationMap.size,
        message:
          "Translation ready. Create the language version in Studio first, then run translate again to apply.",
      })
    );
  } catch (err: any) {
    console.error("[translate] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500 }
    );
  }
};
