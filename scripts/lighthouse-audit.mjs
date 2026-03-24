#!/usr/bin/env node
/**
 * Run Lighthouse SEO + Accessibility audits on key pages.
 * Outputs a CSV summary + individual JSON reports.
 *
 * Usage: node scripts/lighthouse-audit.mjs
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const BASE = "http://localhost:4321";
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT_DIR = "docs/lighthouse";

const PAGES = [
  { name: "Homepage", url: "/" },
  { name: "Surfcamp Index", url: "/surfcamp" },
  { name: "Country: Bali", url: "/surfcamp/bali" },
  { name: "Camp: Green Bowl", url: "/surfcamp/bali/green-bowl" },
  { name: "Camp Surf: Green Bowl", url: "/surfcamp/bali/green-bowl/surf" },
  { name: "Camp Rooms: Green Bowl", url: "/surfcamp/bali/green-bowl/rooms" },
  { name: "Camp Food: Green Bowl", url: "/surfcamp/bali/green-bowl/food" },
  { name: "Blog Index", url: "/blog" },
  { name: "Blog Post", url: "/blog/best-surf-spots-in-bali" },
  { name: "Blog Category", url: "/blog/category/bali" },
  { name: "FAQ", url: "/faq" },
  { name: "FAQ Location", url: "/faq/green-bowl" },
  { name: "About", url: "/about" },
  { name: "Contact", url: "/contact" },
  { name: "DE: Homepage", url: "/de" },
  { name: "DE: Camp", url: "/de/surfcamp/bali/green-bowl" },
  { name: "DE: Blog Post", url: "/de/blog/die-besten-surfspots-auf-bali" },
];

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const results = [];

for (const page of PAGES) {
  const fullUrl = `${BASE}${page.url}`;
  const slug = page.url.replace(/\//g, "_").replace(/^_/, "") || "home";
  const jsonPath = path.join(OUT_DIR, `${slug}.json`);

  console.log(`\nAuditing: ${page.name} (${page.url})`);

  try {
    execSync(
      `npx lighthouse "${fullUrl}" ` +
        `--only-categories=seo,accessibility,best-practices ` +
        `--output=json --output-path="${jsonPath}" ` +
        `--chrome-flags="--headless --no-sandbox --disable-gpu" ` +
        `--quiet ` +
        `--preset=desktop`,
      {
        env: { ...process.env, CHROME_PATH },
        timeout: 120000,
        stdio: "pipe",
      }
    );

    const report = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const cats = report.categories;
    const seo = Math.round((cats.seo?.score || 0) * 100);
    const a11y = Math.round((cats.accessibility?.score || 0) * 100);
    const bp = Math.round((cats["best-practices"]?.score || 0) * 100);

    // Extract failed audits
    const failedSeo = Object.values(report.audits)
      .filter((a) => a.scoreDisplayMode !== "notApplicable" && a.score === 0 && cats.seo?.auditRefs?.some((r) => r.id === a.id))
      .map((a) => a.title);
    const failedA11y = Object.values(report.audits)
      .filter((a) => a.scoreDisplayMode !== "notApplicable" && a.score === 0 && cats.accessibility?.auditRefs?.some((r) => r.id === a.id))
      .map((a) => a.title);

    results.push({
      name: page.name,
      url: page.url,
      seo,
      a11y,
      bp,
      failedSeo: failedSeo.join("; ") || "None",
      failedA11y: failedA11y.join("; ") || "None",
    });

    console.log(`  SEO: ${seo} | Accessibility: ${a11y} | Best Practices: ${bp}`);
    if (failedSeo.length > 0) console.log(`  SEO issues: ${failedSeo.join(", ")}`);
    if (failedA11y.length > 0) console.log(`  A11y issues: ${failedA11y.join(", ")}`);
  } catch (err) {
    console.log(`  ERROR: ${err.message?.slice(0, 200)}`);
    results.push({
      name: page.name,
      url: page.url,
      seo: "ERR",
      a11y: "ERR",
      bp: "ERR",
      failedSeo: "Error running audit",
      failedA11y: "Error running audit",
    });
  }
}

// Write CSV summary
const csvHeader = "Page,URL,SEO,Accessibility,Best Practices,SEO Issues,Accessibility Issues";
const csvRows = results.map(
  (r) =>
    `"${r.name}","${r.url}",${r.seo},${r.a11y},${r.bp},"${r.failedSeo}","${r.failedA11y}"`
);
const csv = [csvHeader, ...csvRows].join("\n");
fs.writeFileSync(path.join(OUT_DIR, "summary.csv"), csv);

console.log("\n" + "=".repeat(70));
console.log("SUMMARY");
console.log("=".repeat(70));
console.log(`${"Page".padEnd(30)} ${"SEO".padStart(5)} ${"A11y".padStart(5)} ${"BP".padStart(5)}`);
console.log("-".repeat(50));
for (const r of results) {
  console.log(
    `${r.name.padEnd(30)} ${String(r.seo).padStart(5)} ${String(r.a11y).padStart(5)} ${String(r.bp).padStart(5)}`
  );
}
console.log("-".repeat(50));

const avgSeo = Math.round(results.filter((r) => typeof r.seo === "number").reduce((s, r) => s + r.seo, 0) / results.filter((r) => typeof r.seo === "number").length);
const avgA11y = Math.round(results.filter((r) => typeof r.a11y === "number").reduce((s, r) => s + r.a11y, 0) / results.filter((r) => typeof r.a11y === "number").length);
const avgBp = Math.round(results.filter((r) => typeof r.bp === "number").reduce((s, r) => s + r.bp, 0) / results.filter((r) => typeof r.bp === "number").length);
console.log(`${"AVERAGE".padEnd(30)} ${String(avgSeo).padStart(5)} ${String(avgA11y).padStart(5)} ${String(avgBp).padStart(5)}`);

console.log(`\nDetailed reports: ${OUT_DIR}/`);
console.log(`Summary CSV: ${OUT_DIR}/summary.csv`);
