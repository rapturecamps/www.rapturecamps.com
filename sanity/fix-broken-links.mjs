import { createClient } from "@sanity/client";
import fs from "fs";

const client = createClient({
  projectId: "ypmt1bmc",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const DRY_RUN = process.argv.includes("--dry-run");
const DOMAIN = "https://www.rapturecamps.com";

// ─── Step 1: Load all content from Sanity ───────────────────────────────
async function loadData() {
  const [posts, metas, camps] = await Promise.all([
    client.fetch(
      '*[_type == "blogPost"]{ _id, title, "slug": slug.current, language, body }'
    ),
    client.fetch(
      '*[_type == "translation.metadata"]{ translations }'
    ),
    client.fetch(
      '*[_type == "camp"]{ _id, "slug": slug.current, name, "countrySlug": country->slug.current, language }'
    ),
  ]);
  return { posts, metas, camps };
}

// ─── Step 2: Build URL rewrite map ──────────────────────────────────────
function buildRewriteMap(posts, metas, camps) {
  const idMap = {};
  for (const p of posts) idMap[p._id] = p;

  const enPosts = posts.filter((p) => (p.language || "en") === "en");
  const dePosts = posts.filter((p) => p.language === "de");

  const enSlugs = new Set(enPosts.map((p) => p.slug));
  const deSlugs = new Set(dePosts.map((p) => p.slug));

  // EN slug → DE slug via translation.metadata
  const enToDeSlug = {};
  for (const meta of metas) {
    if (!meta.translations) continue;
    const enRef = meta.translations.find((t) => t._key === "en");
    const deRef = meta.translations.find((t) => t._key === "de");
    if (enRef?.value?._ref && deRef?.value?._ref) {
      const enPost =
        idMap[enRef.value._ref] ||
        idMap[enRef.value._ref.replace(/^drafts\./, "")];
      const dePost =
        idMap[deRef.value._ref] ||
        idMap[deRef.value._ref.replace(/^drafts\./, "")];
      if (enPost?.slug && dePost?.slug) {
        enToDeSlug[enPost.slug] = dePost.slug;
      }
    }
  }

  // Build camp path set
  const enCamps = camps.filter((c) => (c.language || "en") === "en");
  const campPaths = new Set();
  for (const c of enCamps) {
    if (c.countrySlug && c.slug) {
      campPaths.add(`/surfcamp/${c.countrySlug}/${c.slug}`);
    }
  }

  // All slugs set for fuzzy matching
  const allEnSlugMap = {};
  for (const p of enPosts) allEnSlugMap[p.slug] = true;
  const allDeSlugMap = {};
  for (const p of dePosts) allDeSlugMap[p.slug] = true;

  // Dead external URLs to remove (keep anchor text)
  const deadExternalUrls = new Set([
    "https://neuroscience.stanford.edu/news/what-me-worry",
    "http://www.surfcamp.travel/bali/",
    "http://www.surfcampinportugal.com/",
    "https://www.indonesia.travel/in/en/trip-ideas/visa-free-for-169-countries-to-travel-to-indonesia",
    "https://www.ericeirablog.com/ericeira-and-its-king/",
    "https://www.bali.com/temple_Uluwatu_Pura-Luhur-Uluwatu_82.html",
    "https://balibelly.com/bingin/",
    "http://www.hotelclub.com/blog/10-of-the-worlds-best-surf-spots/",
    "http://edition.cnn.com/2013/06/30/travel/50-surf-spots/",
    "https://xgames.espn.go.com/article/7265532/eco-warrior-james-pribram-returns-uluwatu-mission",
    "https://vimeo.com/105491649",
    "http://surfcamp.travel/bali",
    "http://surfcamp.travel/portugal",
    "https://www.indonesia.travel/gb/en/news/additional-measures-of-the-indonesian-government-in-relation-to-covid-19-response",
    "https://apps.apple.com/pt/app/info-praia/id1467347173",
    "https://play.google.com/store/apps/details?id=pt.apambiente.info_praia&hl=pt_PT",
    "https://www.seasonstamarindo.net/",
    "https://tui.co.uk/flight/costa-rica-flights",
    "https://tuifly.be/en/destinos/portugal",
  ]);

  // Shop URLs to remove
  const shopPattern = /shop\.rapturecamps\.com/;

  return {
    enToDeSlug,
    enSlugs,
    deSlugs,
    campPaths,
    allEnSlugMap,
    allDeSlugMap,
    deadExternalUrls,
    shopPattern,
  };
}

// ─── Step 3: Normalize a URL to a path ──────────────────────────────────
function urlToPath(href) {
  if (!href) return null;
  let path = href;
  // Strip domain
  path = path
    .replace(/https?:\/\/(www\.)?rapturecamps\.com/, "")
    .replace(/https?:\/\/localhost:\d+/, "");
  // Strip trailing slash
  path = path.replace(/\/+$/, "");
  // Trim whitespace
  path = path.trim();
  return path || "/";
}

// ─── Step 4: Try to find a replacement URL ──────────────────────────────
function findReplacement(href, postLang, ctx) {
  const {
    enToDeSlug,
    enSlugs,
    deSlugs,
    campPaths,
    allEnSlugMap,
    deadExternalUrls,
    shopPattern,
  } = ctx;

  // Dead external → remove link entirely
  if (deadExternalUrls.has(href)) return { action: "unlink" };
  if (shopPattern.test(href)) return { action: "unlink" };
  if (href === "willkommen") return { action: "unlink" };

  const path = urlToPath(href);
  if (!path || path === "/") return null;

  // German post pointing to /de/blog/<english-slug> → /de/blog/<german-slug>
  const deEnBlogMatch = path.match(
    /^\/de\/blog\/([a-z0-9][a-z0-9-]*[a-z0-9])\/?$/
  );
  if (deEnBlogMatch) {
    const slug = deEnBlogMatch[1];
    if (enToDeSlug[slug]) {
      return { action: "replace", newHref: `/de/blog/${enToDeSlug[slug]}` };
    }
    // Slug exists as EN post but no DE translation → point to EN version
    if (allEnSlugMap[slug]) {
      return { action: "replace", newHref: `/blog/${slug}` };
    }
  }

  // Explicit blog slug overrides for known mismatches
  const blogSlugOverrides = {
    "/blog/7-of-portugals-best-surf-spots": "/blog/portugal-best-surf-spots",
    "/blog/surf-lessons-nicaragua-learn-to-surf": "/blog/surf-school-nicaragua",
    "/blog/nazare-mcnamaras-90ft-wave-rapture-surfcamps": "/blog",
  };
  if (blogSlugOverrides[path]) {
    return { action: "replace", newHref: blogSlugOverrides[path] };
  }

  // /blog/<slug> that doesn't exist → try fuzzy match
  const blogMatch = path.match(/^\/blog\/([a-z0-9][a-z0-9-]*[a-z0-9])\/?$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    if (!allEnSlugMap[slug]) {
      const match = fuzzyMatchSlug(slug, Object.keys(allEnSlugMap));
      if (match) {
        return { action: "replace", newHref: `/blog/${match}` };
      }
      return { action: "replace", newHref: "/blog" };
    }
  }

  // Explicit overrides for old WP landing pages → camp pages
  const wpLandingOverrides = {
    "/costa-rica-surfcamp": "/surfcamp/costa-rica",
    "/portugal-surfcamp": "/surfcamp/portugal",
    "/nicaragua-surfresort": "/surfcamp/nicaragua",
    "/bali-surfcamp": "/surfcamp/bali",
    "/bali-surf-lessons-promo": "/surfcamp/bali",
    "/packing-list-costa-rica-nicaragua": "/blog/what-to-pack-for-costa-rica-and-nicaragua",
    "/surfing-bali": "/surfcamp/bali",
    "/surf-holidays-vacation-portugal": "/surfcamp/portugal",
  };
  if (wpLandingOverrides[path]) {
    return { action: "replace", newHref: wpLandingOverrides[path] };
  }

  // Old WP URL without /blog/ prefix → try to find matching blog post
  if (
    path.startsWith("/") &&
    !path.startsWith("/blog") &&
    !path.startsWith("/surfcamp") &&
    !path.startsWith("/de/") &&
    !path.startsWith("/contact") &&
    !path.startsWith("/about") &&
    !path.startsWith("/faq")
  ) {
    const slug = path.replace(/^\//, "").replace(/\/$/, "");
    if (slug && !slug.includes("/")) {
      if (allEnSlugMap[slug]) {
        return { action: "replace", newHref: `/blog/${slug}` };
      }
      const match = fuzzyMatchSlug(slug, Object.keys(allEnSlugMap));
      if (match) {
        return { action: "replace", newHref: `/blog/${match}` };
      }
    }
  }

  // /de/surfcamp/.../surfen/ or /zimmer/ or /essen/ → strip sub-page
  const deCampSubMatch = path.match(
    /^\/de\/surfcamp\/([a-z-]+)\/([a-z-]+)\/(surfen|zimmer|essen|surfschule|surf|rooms|food)\/?/
  );
  if (deCampSubMatch) {
    const campBase = `/surfcamp/${deCampSubMatch[1]}/${deCampSubMatch[2]}`;
    if (campPaths.has(campBase)) {
      return { action: "replace", newHref: `/de${campBase}` };
    }
  }

  // EN camp sub-pages /surfcamp/.../rooms|surf|food → strip to camp page
  const enCampSubMatch = path.match(
    /^\/surfcamp\/([a-z-]+)\/([a-z-]+)\/(surf|rooms|food)\/?/
  );
  if (enCampSubMatch) {
    const campBase = `/surfcamp/${enCampSubMatch[1]}/${enCampSubMatch[2]}`;
    if (campPaths.has(campBase)) {
      return { action: "replace", newHref: campBase };
    }
  }

  // /surfcamp/bali/canggu → redirect to /surfcamp/bali (Canggu doesn't exist)
  if (path.startsWith("/surfcamp/bali/canggu")) {
    return { action: "replace", newHref: "/surfcamp/bali" };
  }
  if (path.startsWith("/de/surfcamp/bali/canggu")) {
    return { action: "replace", newHref: "/de/surfcamp/bali" };
  }

  // /de/kontakt → /de/contact or just /contact
  if (path === "/de/kontakt") {
    return { action: "replace", newHref: "/contact" };
  }
  if (path === "/meet-us-online") {
    return { action: "replace", newHref: "/contact" };
  }

  // /destinations/bali → /surfcamp/bali
  if (path === "/destinations/bali") {
    return { action: "replace", newHref: "/surfcamp/bali" };
  }

  // /de/blog/<english-slug-with-trailing-spaces-or-junk>
  const deBlogJunkMatch = path.match(/^\/de\/blog\/([^\s/]+)/);
  if (deBlogJunkMatch && path !== `/de/blog/${deBlogJunkMatch[1]}`) {
    const cleanSlug = deBlogJunkMatch[1];
    if (enToDeSlug[cleanSlug]) {
      return {
        action: "replace",
        newHref: `/de/blog/${enToDeSlug[cleanSlug]}`,
      };
    }
  }

  // Old WP German pages like /de/costa-rica-surfcamp/ → /de/surfcamp/costa-rica
  if (path === "/de/costa-rica-surfcamp") {
    return { action: "replace", newHref: "/de/surfcamp/costa-rica" };
  }
  if (path === "/de/bali-surfcamp/surfschule") {
    return { action: "replace", newHref: "/de/surfcamp/bali" };
  }
  if (path === "/de/bali-surfcamp/padang-padang-surfen") {
    return { action: "replace", newHref: "/de/surfcamp/bali/padang-padang" };
  }
  if (path === "/de/bali-surfcamp/uluwatu-surfen") {
    return { action: "replace", newHref: "/de/surfcamp/bali" };
  }
  if (path.match(/^\/de\/surfcamp\/marokko/)) {
    return { action: "replace", newHref: "/de/surfcamp/morocco" };
  }

  // Concatenated URLs like /blog/slug/https://...
  if (path.includes("/https://") || path.includes("/http://")) {
    const parts = path.split(/\/https?:\/\//);
    const firstPart = parts[0];
    if (firstPart.startsWith("/blog/")) {
      const slug = firstPart.replace("/blog/", "");
      if (allEnSlugMap[slug]) {
        return { action: "replace", newHref: `/blog/${slug}` };
      }
    }
  }

  return null;
}

// ─── Fuzzy slug matching ────────────────────────────────────────────────
function fuzzyMatchSlug(broken, candidates) {
  const brokenWords = new Set(broken.split("-").filter((w) => w.length > 2));
  let bestMatch = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    const candidateWords = new Set(
      candidate.split("-").filter((w) => w.length > 2)
    );
    let overlap = 0;
    for (const w of brokenWords) {
      if (candidateWords.has(w)) overlap++;
    }
    const score =
      (2 * overlap) / (brokenWords.size + candidateWords.size);
    if (score > bestScore && score >= 0.5) {
      bestScore = score;
      bestMatch = candidate;
    }
  }
  return bestMatch;
}

// ─── Step 5: Process body blocks and apply fixes ────────────────────────
function processBody(body, postLang, ctx) {
  if (!body || !Array.isArray(body)) return { body: null, fixes: [] };

  let changed = false;
  const fixes = [];
  const newBody = JSON.parse(JSON.stringify(body));

  for (const block of newBody) {
    if (block._type !== "block" || !block.markDefs) continue;

    for (let i = block.markDefs.length - 1; i >= 0; i--) {
      const markDef = block.markDefs[i];
      if (!markDef.href) continue;

      const result = findReplacement(markDef.href, postLang, ctx);
      if (!result) continue;

      if (result.action === "replace") {
        fixes.push({
          type: "replace",
          from: markDef.href,
          to: result.newHref,
        });
        markDef.href = result.newHref;
        changed = true;
      } else if (result.action === "unlink") {
        fixes.push({ type: "unlink", from: markDef.href });
        // Remove the mark from all children that reference it
        const markKey = markDef._key;
        if (block.children) {
          for (const child of block.children) {
            if (child.marks && child.marks.includes(markKey)) {
              child.marks = child.marks.filter((m) => m !== markKey);
            }
          }
        }
        // Remove the markDef
        block.markDefs.splice(i, 1);
        changed = true;
      }
    }
  }

  return { body: changed ? newBody : null, fixes };
}

// ─── Main ───────────────────────────────────────────────────────────────
async function main() {
  console.log(DRY_RUN ? "=== DRY RUN ===" : "=== LIVE RUN ===");
  console.log("Loading data from Sanity...");

  const { posts, metas, camps } = await loadData();
  const ctx = buildRewriteMap(posts, metas, camps);

  console.log(
    `Loaded ${posts.length} posts, ${Object.keys(ctx.enToDeSlug).length} EN→DE mappings, ${ctx.campPaths.size} camp paths`
  );

  let totalFixed = 0;
  let totalUnlinked = 0;
  let totalPostsPatched = 0;
  const allFixes = [];

  for (const post of posts) {
    const lang = post.language || "en";
    const { body, fixes } = processBody(post.body, lang, ctx);

    if (fixes.length === 0) continue;

    totalPostsPatched++;
    const replaced = fixes.filter((f) => f.type === "replace").length;
    const unlinked = fixes.filter((f) => f.type === "unlink").length;
    totalFixed += replaced;
    totalUnlinked += unlinked;

    allFixes.push({
      postId: post._id,
      postTitle: post.title,
      postLang: lang,
      fixes,
    });

    console.log(
      `\n${post.title} (${lang}) — ${replaced} replaced, ${unlinked} unlinked`
    );
    for (const f of fixes) {
      if (f.type === "replace") {
        console.log(`  ✓ ${f.from} → ${f.to}`);
      } else {
        console.log(`  ✕ removed link: ${f.from}`);
      }
    }

    if (!DRY_RUN && body) {
      await client.patch(post._id).set({ body }).commit();
      console.log(`  → Patched in Sanity`);
    }
  }

  console.log("\n════════════════════════════════════════");
  console.log(`Posts patched: ${totalPostsPatched}`);
  console.log(`Links replaced: ${totalFixed}`);
  console.log(`Links unlinked: ${totalUnlinked}`);
  console.log(`Total fixes: ${totalFixed + totalUnlinked}`);
  if (DRY_RUN) console.log("\nThis was a DRY RUN. Run without --dry-run to apply.");

  fs.writeFileSync(
    "/tmp/link-fixes-report.json",
    JSON.stringify(allFixes, null, 2)
  );
  console.log("Detailed report: /tmp/link-fixes-report.json");
}

main().catch(console.error);
