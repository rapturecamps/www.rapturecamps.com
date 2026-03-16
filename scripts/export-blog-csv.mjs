import { createClient } from "@sanity/client";
import { writeFileSync, readFileSync } from "fs";

const envFile = readFileSync(".env", "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const BASE = "https://www.rapturecamps.com";

const enPosts = await client.fetch(`*[_type == "blogPost" && language == "en"] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  "metaTitle": seo.metaTitle,
  "metaDescription": seo.metaDescription,
  "isDraft": _id match "drafts.**"
}`);

const metaDocs = await client.fetch(`*[_type == "translation.metadata" && references(*[_type == "blogPost" && language == "en"]._id)] {
  translations[] { _key, "ref": value._ref }
}`);

const enToDeMap = new Map();
for (const meta of metaDocs) {
  const en = meta.translations?.find((t) => t._key === "en");
  const de = meta.translations?.find((t) => t._key === "de");
  if (en?.ref && de?.ref) {
    enToDeMap.set(en.ref.replace("drafts.", ""), de.ref.replace("drafts.", ""));
  }
}

const deIds = [...new Set(enToDeMap.values())];
const dePosts = deIds.length > 0
  ? await client.fetch(`*[_type == "blogPost" && language == "de" && _id in $ids] {
      _id,
      title,
      "slug": slug.current,
      "metaTitle": seo.metaTitle,
      "metaDescription": seo.metaDescription,
      "isDraft": _id match "drafts.**"
    }`, { ids: deIds })
  : [];

const dePostMap = new Map();
for (const p of dePosts) {
  dePostMap.set(p._id.replace("drafts.", ""), p);
}

function esc(val) {
  if (!val) return "";
  const s = String(val).replace(/"/g, '""');
  return `"${s}"`;
}

const header = "EN URL,DE URL,EN Meta Title,EN Meta Description,DE Meta Title,DE Meta Description,EN Status,DE Status";
const rows = [header];

for (const en of enPosts) {
  const enId = en._id.replace("drafts.", "");
  const deId = enToDeMap.get(enId);
  const de = deId ? dePostMap.get(deId) : null;

  const enUrl = en.slug ? `${BASE}/blog/${en.slug}/` : "";
  const deUrl = de?.slug ? `${BASE}/de/blog/${de.slug}/` : "";
  const enStatus = en.isDraft ? "Draft" : "Published";
  const deStatus = de ? (de.isDraft ? "Draft" : "Published") : "Missing";

  rows.push([
    esc(enUrl),
    esc(deUrl),
    esc(en.metaTitle || en.title),
    esc(en.metaDescription || ""),
    esc(de?.metaTitle || de?.title || ""),
    esc(de?.metaDescription || ""),
    esc(enStatus),
    esc(deStatus),
  ].join(","));
}

const outPath = "docs/blog-posts-en-de.csv";
writeFileSync(outPath, rows.join("\n"), "utf-8");
console.log(`Exported ${enPosts.length} EN posts to ${outPath}`);
console.log(`  - With DE translation: ${[...enToDeMap.values()].filter(id => dePostMap.has(id)).length}`);
console.log(`  - Missing DE: ${enPosts.length - [...enToDeMap.values()].filter(id => dePostMap.has(id)).length}`);
