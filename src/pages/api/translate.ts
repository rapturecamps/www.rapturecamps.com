export const prerender = false;

import type { APIRoute } from "astro";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@sanity/client";

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
  "location",
  "description",
  "intro",
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
  "amenities",
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
      } else if (
        key === "amenities" &&
        value.every((v: any) => typeof v === "string")
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
      if (key === "seo") {
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

function buildTranslationPrompt(
  content: Record<string, any>,
  targetLang: string
): string {
  const langName = targetLang === "de" ? "German" : targetLang;
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

  if (entries.length === 0) return "";

  const lines = entries
    .map((e, i) => `[${i}] PATH: ${e.key}\nTEXT: ${e.value}`)
    .join("\n\n");

  return `Translate the following text entries from English to ${langName}.
This is content for a surf camp website (Rapture Surfcamps).
Keep the tone casual, friendly, and exciting — matching the surf/travel lifestyle brand voice.
Preserve any HTML tags, markdown formatting, or special characters exactly as they are.
Do NOT translate proper nouns like camp names, place names, or brand names (Rapture, Green Bowl, etc.).

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

export const POST: APIRoute = async ({ request }) => {
  try {
    const { documentId, targetLang, forceOverwrite = false } = await request.json();

    if (!documentId || !targetLang) {
      return new Response(
        JSON.stringify({ error: "Missing documentId or targetLang" }),
        { status: 400 }
      );
    }

    const apiKey = import.meta.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
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

    const translatableContent = extractTranslatableContent(sourceDoc);

    const sourceSlug = sourceDoc.slug?.current;
    const sourceTitle = sourceDoc.title;

    const prompt = buildTranslationPrompt(translatableContent, targetLang);

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "No translatable content found" }),
        { status: 400 }
      );
    }

    const slugPrompt = sourceTitle
      ? `\n\nAlso translate this page title into a URL-friendly slug in ${targetLang === "de" ? "German" : targetLang}. Use only lowercase letters, numbers, and hyphens. No special characters (ä→ae, ö→oe, ü→ue, ß→ss). Return it as the LAST element in the JSON array with index 9999 and key "slug".\nTitle: ${sourceTitle}`
      : "";

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt + slugPrompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";
    let translations: { index: number; translation: string }[];

    try {
      const cleaned = responseText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      translations = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ error: "Failed to parse translation response", raw: responseText }),
        { status: 500 }
      );
    }

    let translatedSlug: string | null = null;
    const slugEntry = translations.find((t) => t.index === 9999);
    if (slugEntry?.translation) {
      translatedSlug = slugEntry.translation
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    translations = translations.filter((t) => t.index !== 9999);

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

    const translationMap = new Map<string, string>();
    translations.forEach((t) => {
      if (t.index < entries.length) {
        translationMap.set(entries[t.index].key, t.translation);
      }
    });

    const translatedDoc = applyTranslations(
      sourceDoc,
      translatableContent,
      translationMap
    );

    if (targetDocId) {
      const fieldsToUpdate = { ...translatedDoc };
      delete fieldsToUpdate._id;
      delete fieldsToUpdate._rev;
      delete fieldsToUpdate._createdAt;
      delete fieldsToUpdate._updatedAt;
      delete fieldsToUpdate._type;
      delete fieldsToUpdate.language;

      if (translatedSlug) {
        fieldsToUpdate.slug = { _type: "slug", current: translatedSlug };
      }

      const patchId = (await sanityClient.fetch(
        `*[_id == $id || _id == "drafts." + $id][0]._id`,
        { id: targetDocId }
      )) || targetDocId;

      const existingTarget = await fetchDoc(targetDocId);

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
