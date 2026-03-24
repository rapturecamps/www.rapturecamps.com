#!/usr/bin/env node
/**
 * Translate the Legal Notice and Terms & Conditions pages from EN to DE.
 * Preserves Portable Text structure, generates new _keys for DE docs.
 *
 * Usage:
 *   node scripts/translate-legal-terms.mjs          # dry-run (prints but doesn't patch)
 *   node scripts/translate-legal-terms.mjs --apply   # patch German docs in Sanity
 */
import { createClient } from "@sanity/client";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import crypto from "crypto";

// Load .env
try {
  const envFile = fs.readFileSync(new URL("../.env", import.meta.url), "utf-8");
  for (const line of envFile.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}

const sanity = createClient({
  projectId: "ypmt1bmc",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const apply = process.argv.includes("--apply");

function newKey() {
  return crypto.randomBytes(6).toString("hex");
}

function extractTexts(body) {
  const texts = [];
  for (const block of body) {
    if (block._type === "block" && block.children) {
      for (const child of block.children) {
        if (child._type === "span" && child.text) {
          texts.push(child.text);
        }
      }
    }
  }
  return texts;
}

async function translateBatch(texts, context, tone = "formal") {
  const glossary = fs.readFileSync(
    new URL("../docs/translation-glossary-de.md", import.meta.url),
    "utf-8"
  );

  const numbered = texts.map((t, i) => `<seg id="${i}">\n${t}\n</seg>`).join("\n");

  const toneInstructions =
    tone === "formal"
      ? `- Use formal German (Sie-form) and standard German legal terminology
- "Terms and Conditions" = "Allgemeine Geschäftsbedingungen (AGB)"
- "booking" = "Buchung", "cancellation" = "Stornierung", "invoice" = "Rechnung"
- "customer/guest/client" = "Kunde/Gast", "contract" = "Vertrag"
- "disclaimer" = "Haftungsausschluss", "liability" = "Haftung"
- "refund" = "Erstattung/Rückerstattung"`
      : `- Use informal, warm German (du-Form) suitable for marketing/storytelling content
- Keep the tone friendly, personal, and engaging — like talking to a fellow surfer
- "surf camp" = "Surfcamp", "booking" = "Buchung"`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 16000,
    system: `You are a professional German translator for a surf camp company (Rapture Surfcamps). 
Translate the following texts from English to German.

CRITICAL RULES:
- Keep brand names untranslated: Rapturecamps, RAPTURECAMPS, Rapture, etc.
- Keep company legal names exactly as-is (e.g., "Rapturecamps Unipessoal LDA", "PT. Rise Shine Bali", etc.)
- Keep addresses, VAT IDs, tax IDs, registration numbers, phone numbers, URLs, and email addresses EXACTLY as-is
- Keep location and country names as-is (Funchal, Bali, Ericeira, Morocco, Portugal, Costa Rica, Nicaragua, Australia, Austria, etc.)
- Preserve all newline characters in the text exactly as they appear
${toneInstructions}

${glossary}

OUTPUT FORMAT: Return each translated segment wrapped in <seg id="N"> tags, exactly matching the input IDs. Example:
<seg id="0">
Übersetzter Text 0
</seg>
<seg id="1">
Übersetzter Text 1
</seg>`,
    messages: [
      {
        role: "user",
        content: `Context: ${context}\n\nTranslate these ${texts.length} text segments:\n\n${numbered}`,
      },
    ],
  });

  const raw = response.content[0].text;
  const results = [];
  const regex = /<seg id="(\d+)">\n?([\s\S]*?)\n?<\/seg>/g;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const id = parseInt(match[1], 10);
    const text = match[2].trim();
    results[id] = text;
  }

  // Verify all segments present
  for (let i = 0; i < texts.length; i++) {
    if (results[i] === undefined) {
      console.warn(`  WARNING: Missing translation for segment ${i}, using English fallback`);
      results[i] = texts[i];
    }
  }

  return results;
}

function buildTranslatedBody(enBody, translations) {
  let idx = 0;
  const deBody = [];

  for (const block of enBody) {
    if (block._type === "block" && block.children) {
      const newBlock = {
        ...block,
        _key: newKey(),
        markDefs: (block.markDefs || []).map((md) => ({ ...md, _key: newKey() })),
        children: [],
      };

      // Build mark key mapping (old key → new key)
      const markKeyMap = {};
      (block.markDefs || []).forEach((oldMd, i) => {
        markKeyMap[oldMd._key] = newBlock.markDefs[i]._key;
      });

      for (const child of block.children) {
        if (child._type === "span" && child.text) {
          const newMarks = (child.marks || []).map((m) => markKeyMap[m] || m);
          newBlock.children.push({
            ...child,
            _key: newKey(),
            text: translations[idx] || child.text,
            marks: newMarks,
          });
          idx++;
        } else {
          newBlock.children.push({ ...child, _key: newKey() });
        }
      }

      deBody.push(newBlock);
    } else {
      deBody.push({ ...block, _key: newKey() });
    }
  }

  return deBody;
}

async function main() {
  console.log(`Mode: ${apply ? "APPLY" : "DRY-RUN"}\n`);

  const allPages = [
    {
      enId: "page-legal",
      deId: "98ae8f5a-aed7-4b76-a915-231a3f2eb5d8",
      context: "Legal Notice / Impressum page",
      deTitle: "Impressum",
      tone: "formal",
      deSeo: {
        _type: "seo",
        title: "Impressum | Rapture Surfcamps",
        metaTitle: "Impressum · Rapture",
        description: "Impressum und rechtliche Hinweise für Rapture Surfcamps.",
        metaDescription:
          "Impressum und Unternehmensinformationen für Rapture Camps. Hier finden Sie unsere Firmenadresse, Unternehmensdaten und regulatorische Informationen.",
      },
    },
    {
      enId: "page-terms",
      deId: "a0f604d5-af57-4c04-b9fe-277710f8e96b",
      context: "Terms & Conditions / AGB page for a surf camp company",
      deTitle: "Allgemeine Geschäftsbedingungen",
      tone: "formal",
      deSeo: {
        _type: "seo",
        title: "AGB | Rapture Surfcamps",
        metaTitle: "AGB · Rapture",
        description:
          "Allgemeine Geschäftsbedingungen für Buchungen bei Rapture Surfcamps.",
        metaDescription:
          "Allgemeine Geschäftsbedingungen für Buchungen bei Rapture Camps. Umfasst Stornierungsbedingungen, Zahlungsmodalitäten, Haftung und alles, was Sie vor der Buchung wissen müssen.",
      },
    },
    {
      enId: "page-about",
      deId: "7d7c10f2-914b-46ab-aabc-e7d5b7e8c289",
      context: "About Us / Our Story page — warm storytelling tone about how the surf camp was founded",
      deTitle: "Unsere Geschichte",
      tone: "informal",
      deSeo: {
        _type: "seo",
        title: "Über uns | Rapture Surfcamps",
        metaTitle: "Unsere Geschichte: Wie Rapture Surfcamps entstand · Rapture",
        description:
          "Gegründet 2003 von einem australischen Fotografen und einem österreichischen Unternehmer, ist Rapture Surfcamps zu einem globalen Netzwerk von 8 Surfcamps in 5 Ländern gewachsen.",
        metaDescription:
          "Lerne das Team hinter Rapture Camps kennen. Von einem einzelnen Surfhaus auf Bali zu Camps in Portugal, Costa Rica und Indonesien – erfahre, was uns antreibt und warum wir tun, was wir tun.",
      },
    },
    {
      enId: "page-privacy-policy",
      deId: null, // will be created
      slug: "privacy-policy",
      context: "Privacy Policy / Datenschutzerklärung — formal legal privacy and data protection page",
      deTitle: "Datenschutzerklärung",
      tone: "formal",
      deSeo: {
        _type: "seo",
        title: "Datenschutzerklärung | Rapture Surfcamps",
        metaTitle: "Datenschutzerklärung · Rapture",
        description:
          "Datenschutzerklärung und Informationen zur Datensicherheit für Rapture Surfcamps.",
        metaDescription:
          "Erfahren Sie, wie Rapture Camps Ihre personenbezogenen Daten erhebt, verwendet und schützt. Unsere Datenschutzerklärung umfasst Cookies, Buchungsdaten und Ihre Rechte gemäß DSGVO.",
      },
    },
  ];

  // Filter to only the page requested via --page=<slug>, or all if not specified
  const pageFilter = process.argv.find((a) => a.startsWith("--page="))?.split("=")[1];
  const pages = pageFilter
    ? allPages.filter((p) => p.enId.includes(pageFilter))
    : allPages;

  for (const page of pages) {
    console.log(`\n=== Translating: ${page.context} ===`);

    const enDoc = await sanity.fetch(`*[_id == $id][0]`, { id: page.enId });
    if (!enDoc?.body) {
      console.log(`  No body found for ${page.enId}, skipping.`);
      continue;
    }

    const texts = extractTexts(enDoc.body);
    console.log(`  Found ${texts.length} text segments to translate`);

    // Translate in batches of 30 to avoid token limits
    const batchSize = 30;
    const allTranslations = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      console.log(
        `  Translating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)} (${batch.length} segments)...`
      );
      const translated = await translateBatch(batch, page.context, page.tone);
      allTranslations.push(...translated);
    }

    console.log(`  Translated ${allTranslations.length} segments`);

    // Show a few examples
    for (let i = 0; i < Math.min(5, texts.length); i++) {
      console.log(`  [${i}] EN: "${texts[i].slice(0, 80)}..."`);
      console.log(`       DE: "${(allTranslations[i] || "").slice(0, 80)}..."`);
    }

    const deBody = buildTranslatedBody(enDoc.body, allTranslations);

    if (apply) {
      if (page.deId) {
        console.log(`  Patching ${page.deId}...`);
        await sanity
          .patch(page.deId)
          .set({
            title: page.deTitle,
            body: deBody,
            seo: page.deSeo,
          })
          .commit();
      } else {
        console.log(`  Creating new DE document for "${page.deTitle}"...`);
        const created = await sanity.create({
          _type: "page",
          language: "de",
          title: page.deTitle,
          slug: { _type: "slug", current: page.slug },
          body: deBody,
          seo: page.deSeo,
          lastUpdated: new Date().toISOString().split("T")[0],
        });
        console.log(`  Created: ${created._id}`);
      }
      console.log(`  Done.`);
    } else {
      const action = page.deId ? `Would patch ${page.deId}` : `Would CREATE new DE doc (slug: ${page.slug})`;
      console.log(`  ${action} with ${deBody.length} blocks`);
      console.log(`  Title: "${page.deTitle}"`);
      console.log(`  SEO title: "${page.deSeo.metaTitle}"`);
    }
  }

  console.log("\nFinished.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
