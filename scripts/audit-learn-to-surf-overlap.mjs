/**
 * Audit blog posts for topic overlap with Learn to Surf content.
 * Outputs a markdown file with redirect recommendations.
 *
 * Usage: node scripts/audit-learn-to-surf-overlap.mjs
 */

import { createClient } from "@sanity/client";
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = createClient({
  projectId: "ypmt1bmc",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const BLOG_QUERY = `*[_type == "blogPost" && (language == "en" || !defined(language))] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  tags,
  publishedAt,
  "categories": categories[]->{ name, "slug": slug.current },
  "silo": silo->{ name, "slug": slug.current },
  "hub": hub->{ name, "slug": slug.current },
  "seo": seo { metaTitle, metaDescription }
}`;

// Load all learn-to-surf topics from content files
function loadTopics() {
  const contentDir = join(__dirname, "content");
  const topics = [];
  const files = readdirSync(contentDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(contentDir, file), "utf-8"));
    const clusterSlug = data.cluster.slug;
    const clusterTitle = data.cluster.title;

    for (const lesson of data.lessons) {
      topics.push({
        title: lesson.title,
        slug: lesson.slug,
        clusterSlug,
        clusterTitle,
        url: `/learn-to-surf/${clusterSlug}/${lesson.slug}`,
        keywords: extractKeywords(lesson.title),
      });
    }
  }

  return topics;
}

function extractKeywords(title) {
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "how", "what",
    "when", "where", "why", "who", "which", "that", "this", "these",
    "those", "your", "you", "it", "its", "vs", "every", "best", "top",
    "guide", "complete", "ultimate", "tips", "everything", "need", "know",
    "surf", "surfing", "surfer", "surfers", "surfcamp", "surfcamps",
    "wave", "waves", "board", "ocean", "beach", "water",
    "beginners", "beginner", "pro", "new",
  ]);

  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/[\s-]+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

function calculateOverlap(blogPost, topic) {
  const blogKeywords = extractKeywords(blogPost.title);
  const blogSlugWords = blogPost.slug.split("-").filter((w) => w.length > 2);
  const blogTags = (blogPost.tags || []).map((t) => t.toLowerCase());
  const allBlogTerms = [...new Set([...blogKeywords, ...blogSlugWords, ...blogTags])];

  const topicKeywords = topic.keywords;
  const topicSlugWords = topic.slug.split("-").filter((w) => w.length > 2);
  const allTopicTerms = [...new Set([...topicKeywords, ...topicSlugWords])];

  if (allTopicTerms.length === 0) return { score: 0, matchCount: 0, matches: [] };

  let matchCount = 0;
  const matches = [];

  for (const term of allTopicTerms) {
    for (const blogTerm of allBlogTerms) {
      // Require exact match only (no substring matching)
      if (term === blogTerm) {
        matchCount++;
        matches.push(`${blogTerm}↔${term}`);
        break;
      }
    }
  }

  const score = matchCount / allTopicTerms.length;

  return { score, matchCount, matches };
}

async function main() {
  console.log("Fetching blog posts from Sanity...");
  const blogPosts = await client.fetch(BLOG_QUERY);
  console.log(`Found ${blogPosts.length} blog posts`);

  const topics = loadTopics();
  console.log(`Loaded ${topics.length} Learn to Surf topics`);

  const overlaps = [];

  for (const post of blogPosts) {
    for (const topic of topics) {
      const { score, matchCount, matches } = calculateOverlap(post, topic);
      if (score >= 0.5 && matchCount >= 2) {
        overlaps.push({
          blogTitle: post.title,
          blogSlug: post.slug,
          blogUrl: `/blog/${post.slug}`,
          blogCategories: (post.categories || []).map((c) => c.name).join(", "),
          blogTags: (post.tags || []).join(", "),
          topicTitle: topic.title,
          topicUrl: topic.url,
          clusterTitle: topic.clusterTitle,
          score,
          matchCount,
          matches: matches.join(", "),
          recommendation: score >= 0.7 ? "301 REDIRECT" : score >= 0.5 ? "REVIEW — likely redirect" : "CROSS-LINK",
        });
      }
    }
  }

  overlaps.sort((a, b) => b.score - a.score);

  // Generate markdown report
  let md = `# Learn to Surf — Blog Overlap Audit\n\n`;
  md += `**Generated:** ${new Date().toISOString().split("T")[0]}\n`;
  md += `**Blog posts analyzed:** ${blogPosts.length}\n`;
  md += `**Learn to Surf topics:** ${topics.length}\n`;
  md += `**Overlaps found:** ${overlaps.length}\n\n`;
  md += `---\n\n`;

  // Group by recommendation
  const redirects = overlaps.filter((o) => o.recommendation === "301 REDIRECT");
  const reviews = overlaps.filter((o) => o.recommendation === "REVIEW — likely redirect");
  const crossLinks = overlaps.filter((o) => o.recommendation === "CROSS-LINK");

  md += `## 301 Redirects (High Confidence — Score ≥ 0.7)\n\n`;
  if (redirects.length === 0) {
    md += `_No direct overlaps found._\n\n`;
  } else {
    md += `These blog posts cover substantially the same topic as a Learn to Surf lesson. Recommend 301 redirecting the blog URL to the new lesson page.\n\n`;
    md += `| Blog Post | Blog URL | → Redirect To | Score |\n`;
    md += `|-----------|----------|---------------|-------|\n`;
    for (const o of redirects) {
      md += `| ${o.blogTitle} | \`${o.blogUrl}\` | \`${o.topicUrl}\` | ${(o.score * 100).toFixed(0)}% |\n`;
    }
    md += `\n`;
  }

  md += `## Review — Likely Redirects (Score 0.5–0.7)\n\n`;
  if (reviews.length === 0) {
    md += `_None found._\n\n`;
  } else {
    md += `These blog posts have significant topic overlap. Review manually and decide: redirect or keep with cross-links.\n\n`;
    md += `| Blog Post | Blog URL | Overlapping Topic | Score | Matching Terms |\n`;
    md += `|-----------|----------|--------------------|-------|----------------|\n`;
    for (const o of reviews) {
      md += `| ${o.blogTitle} | \`${o.blogUrl}\` | ${o.topicTitle} (\`${o.topicUrl}\`) | ${(o.score * 100).toFixed(0)}% | ${o.matches} |\n`;
    }
    md += `\n`;
  }

  md += `## Cross-Link Opportunities (Score 0.4–0.5)\n\n`;
  if (crossLinks.length === 0) {
    md += `_None found._\n\n`;
  } else {
    md += `These blog posts touch related topics. Add internal links from the blog post to the Learn to Surf lesson (and vice versa) to build topical authority.\n\n`;
    md += `| Blog Post | Blog URL | Related Topic | Score |\n`;
    md += `|-----------|----------|---------------|-------|\n`;
    for (const o of crossLinks) {
      md += `| ${o.blogTitle} | \`${o.blogUrl}\` | ${o.topicTitle} (\`${o.topicUrl}\`) | ${(o.score * 100).toFixed(0)}% |\n`;
    }
    md += `\n`;
  }

  // Vercel redirect config
  md += `---\n\n## Redirect Implementation\n\n`;
  md += `Add these to \`vercel.json\` under the \`redirects\` array:\n\n`;
  md += "```json\n";
  const allRedirects = [...redirects, ...reviews.filter((r) => r.score >= 0.6)];
  if (allRedirects.length > 0) {
    const redirectConfig = allRedirects.map((o) => ({
      source: o.blogUrl,
      destination: o.topicUrl,
      permanent: true,
    }));
    md += JSON.stringify(redirectConfig, null, 2);
  } else {
    md += "[]";
  }
  md += "\n```\n";

  const outputPath = join(__dirname, "..", "docs", "learn-to-surf-redirects.md");
  writeFileSync(outputPath, md);
  console.log(`\nAudit report written to: docs/learn-to-surf-redirects.md`);
  console.log(`  Redirects: ${redirects.length}`);
  console.log(`  Reviews: ${reviews.length}`);
  console.log(`  Cross-links: ${crossLinks.length}`);
}

main().catch(console.error);
