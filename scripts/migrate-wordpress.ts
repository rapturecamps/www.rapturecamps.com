/**
 * WordPress to Storyblok Migration Script
 *
 * This script fetches all content from the WordPress REST API
 * and creates corresponding stories in Storyblok.
 *
 * Usage:
 *   npx tsx scripts/migrate-wordpress.ts
 *
 * Required environment variables:
 *   WORDPRESS_API_URL - WordPress REST API base URL
 *   STORYBLOK_MANAGEMENT_TOKEN - Storyblok Management API token
 *   STORYBLOK_SPACE_ID - Your Storyblok space ID
 */

const WP_API = process.env.WORDPRESS_API_URL || "https://www.rapturecamps.com/wp-json/wp/v2";
const SB_TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN;
const SB_SPACE_ID = process.env.STORYBLOK_SPACE_ID;
const SB_API = "https://mapi.storyblok.com/v1";

interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  featured_media: number;
  categories: number[];
  tags: number[];
  yoast_head_json?: {
    title: string;
    description: string;
    og_image?: { url: string }[];
  };
}

interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  description: string;
}

interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  title: { rendered: string };
  media_details: {
    width: number;
    height: number;
    sizes: Record<string, { source_url: string }>;
  };
}

// --- WordPress Fetch Helpers ---

async function fetchAllPaginated<T>(endpoint: string): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${WP_API}/${endpoint}?per_page=100&page=${page}`;
    console.log(`  Fetching ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 400) break;
      throw new Error(`Failed to fetch ${endpoint} page ${page}: ${response.status}`);
    }

    const data = (await response.json()) as T[];
    all.push(...data);

    const totalPages = parseInt(response.headers.get("X-WP-TotalPages") || "1");
    hasMore = page < totalPages;
    page++;

    await sleep(200);
  }

  return all;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

// --- Storyblok Helpers ---

async function sbRequest(method: string, path: string, body?: unknown) {
  const url = `${SB_API}/spaces/${SB_SPACE_ID}${path}`;
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: SB_TOKEN!,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Storyblok API error ${response.status}: ${errorText}`);
  }

  await sleep(250);
  return response.json();
}

async function createFolder(name: string, parentId?: number) {
  try {
    const result = await sbRequest("POST", "/story_folders", {
      story_folder: { name, parent_id: parentId || 0 },
    });
    console.log(`  Created folder: ${name}`);
    return result.story_folder;
  } catch (error) {
    console.log(`  Folder "${name}" may already exist, skipping.`);
    return null;
  }
}

async function createStory(
  name: string,
  slug: string,
  content: Record<string, unknown>,
  parentId?: number
) {
  const story = {
    story: {
      name,
      slug,
      parent_id: parentId || 0,
      content: {
        component: content.component,
        ...content,
      },
    },
  };

  const result = await sbRequest("POST", "/stories", story);
  console.log(`  Created story: ${name} (${slug})`);
  return result.story;
}

// --- Migration Steps ---

async function migrateCategories(categories: WPCategory[]) {
  console.log("\n=== Migrating Categories ===");

  const folder = await createFolder("Blog Categories");
  const categoryMap = new Map<number, string>();

  for (const cat of categories) {
    if (cat.slug === "uncategorized") continue;

    const story = await createStory(
      cat.name,
      cat.slug,
      {
        component: "blog_category",
        name: cat.name,
        slug: cat.slug,
        description: stripHtml(cat.description || ""),
      },
      folder?.id
    );

    categoryMap.set(cat.id, story.uuid);
  }

  return categoryMap;
}

async function migratePosts(
  posts: WPPost[],
  categoryMap: Map<number, string>,
  mediaMap: Map<number, string>
) {
  console.log("\n=== Migrating Blog Posts ===");

  const folder = await createFolder("Blog");

  for (const post of posts) {
    const featuredImageUrl = mediaMap.get(post.featured_media) || "";
    const categoryUuids = post.categories
      .map((id) => categoryMap.get(id))
      .filter(Boolean) as string[];

    const seo = post.yoast_head_json;

    await createStory(
      stripHtml(post.title.rendered),
      post.slug,
      {
        component: "blog_post",
        title: stripHtml(post.title.rendered),
        slug: post.slug,
        excerpt: stripHtml(post.excerpt.rendered),
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Content imported from WordPress. Rich text conversion may need manual review.",
                },
              ],
            },
          ],
        },
        featured_image: featuredImageUrl
          ? { filename: featuredImageUrl, alt: stripHtml(post.title.rendered) }
          : null,
        categories: categoryUuids,
        published_date: post.date,
        seo_title: seo?.title || "",
        seo_description: seo?.description || "",
        og_image: seo?.og_image?.[0]?.url
          ? { filename: seo.og_image[0].url }
          : null,
        _wp_html_content: post.content.rendered,
      },
      folder?.id
    );
  }
}

async function buildMediaMap(posts: WPPost[]): Promise<Map<number, string>> {
  console.log("\n=== Building Media Map ===");

  const mediaIds = [...new Set(posts.map((p) => p.featured_media).filter(Boolean))];
  const mediaMap = new Map<number, string>();

  for (let i = 0; i < mediaIds.length; i += 100) {
    const batch = mediaIds.slice(i, i + 100);
    const url = `${WP_API}/media?include=${batch.join(",")}&per_page=100`;
    const response = await fetch(url);
    if (response.ok) {
      const media = (await response.json()) as WPMedia[];
      for (const m of media) {
        mediaMap.set(m.id, m.source_url);
      }
    }
    await sleep(200);
  }

  console.log(`  Mapped ${mediaMap.size} media items`);
  return mediaMap;
}

// --- Main ---

async function main() {
  if (!SB_TOKEN || !SB_SPACE_ID) {
    console.error("Missing STORYBLOK_MANAGEMENT_TOKEN or STORYBLOK_SPACE_ID");
    console.error("Set these in .env.local before running the migration.");
    process.exit(1);
  }

  console.log("Starting WordPress to Storyblok migration...");
  console.log(`WordPress API: ${WP_API}`);
  console.log(`Storyblok Space: ${SB_SPACE_ID}`);

  // Step 1: Fetch all WordPress content
  console.log("\n=== Fetching WordPress Content ===");

  const [posts, categories] = await Promise.all([
    fetchAllPaginated<WPPost>("posts"),
    fetchAllPaginated<WPCategory>("categories"),
  ]);

  console.log(`  Found ${posts.length} posts`);
  console.log(`  Found ${categories.length} categories`);

  // Step 2: Build media lookup
  const mediaMap = await buildMediaMap(posts);

  // Step 3: Migrate categories
  const categoryMap = await migrateCategories(categories);

  // Step 4: Migrate posts
  await migratePosts(posts, categoryMap, mediaMap);

  console.log("\n=== Migration Complete ===");
  console.log(`  Migrated ${categories.length - 1} categories`);
  console.log(`  Migrated ${posts.length} blog posts`);
  console.log("\nNotes:");
  console.log("  - Blog post content was stored as raw HTML in _wp_html_content");
  console.log("  - Rich text conversion may need manual review");
  console.log("  - Images reference WordPress URLs - upload to Storyblok assets separately");
  console.log("  - Camp/country pages need manual creation in Storyblok");
}

main().catch(console.error);
