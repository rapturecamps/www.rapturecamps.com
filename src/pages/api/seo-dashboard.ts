export const prerender = false;

import type { APIRoute } from "astro";
import {
  sanityClient,
  askClaude,
  parseJsonResponse,
  buildSiloMap,
  getSiloPages,
  getInboundLinks,
  wordCount,
  jsonResponse,
  errorResponse,
  type SiloMap,
  type SiloPage,
} from "./_seo-shared";

interface Issue {
  severity: "critical" | "warning" | "info";
  category: string;
  pageUrl: string;
  pageTitle: string;
  issue: string;
  recommendation: string;
}

function runHeuristicAudit(siloMap: SiloMap, metaData: any[]): Issue[] {
  const issues: Issue[] = [];

  for (const page of siloMap.pages) {
    const meta = metaData.find((m) => m._id === page._id);

    // Missing meta title
    if (!meta?.metaTitle) {
      issues.push({
        severity: "critical",
        category: "Meta Tags",
        pageUrl: page.url,
        pageTitle: page.title,
        issue: "Missing meta title",
        recommendation: "Add a unique, keyword-optimized meta title (50-60 characters)",
      });
    } else if (meta.metaTitle.length > 60) {
      issues.push({
        severity: "warning",
        category: "Meta Tags",
        pageUrl: page.url,
        pageTitle: page.title,
        issue: `Meta title too long (${meta.metaTitle.length} chars)`,
        recommendation: "Shorten to 60 characters or less to avoid truncation in SERPs",
      });
    }

    // Missing meta description
    if (!meta?.metaDescription) {
      issues.push({
        severity: "critical",
        category: "Meta Tags",
        pageUrl: page.url,
        pageTitle: page.title,
        issue: "Missing meta description",
        recommendation: "Add a compelling meta description (120-160 characters) with primary keyword",
      });
    } else if (meta.metaDescription.length > 160) {
      issues.push({
        severity: "warning",
        category: "Meta Tags",
        pageUrl: page.url,
        pageTitle: page.title,
        issue: `Meta description too long (${meta.metaDescription.length} chars)`,
        recommendation: "Shorten to 160 characters to avoid truncation",
      });
    }

    // Thin content
    if (page.wordCount > 0 && page.wordCount < 200 && page._type !== "country") {
      issues.push({
        severity: "warning",
        category: "Content Depth",
        pageUrl: page.url,
        pageTitle: page.title,
        issue: `Thin content (${page.wordCount} words)`,
        recommendation: "Expand content to at least 300+ words for better topical coverage",
      });
    }

    // No internal links
    if (page.internalLinksTo.length === 0 && page._type !== "country") {
      issues.push({
        severity: "warning",
        category: "Internal Links",
        pageUrl: page.url,
        pageTitle: page.title,
        issue: "No internal links in content",
        recommendation: "Add 2-5 relevant internal links to strengthen site structure",
      });
    }

    // Orphan pages (no inbound links)
    const inbound = getInboundLinks(siloMap, page.url);
    if (inbound.length === 0 && page.role !== "pillar") {
      issues.push({
        severity: "warning",
        category: "Internal Links",
        pageUrl: page.url,
        pageTitle: page.title,
        issue: "Orphan page — no other pages link here",
        recommendation: "Add links to this page from related content to improve discoverability",
      });
    }
  }

  // Silo-specific checks
  for (const silo of siloMap.silos) {
    const siloPages = getSiloPages(siloMap, silo.id);
    const supporting = siloPages.filter((p) => p.role === "supporting");
    const pillar = siloPages.find((p) => p.role === "pillar");
    const hubs = siloPages.filter((p) => p.role === "hub");

    if (pillar) {
      const pillarInbound = supporting.filter((sp) =>
        sp.internalLinksTo.includes(pillar.url),
      );
      if (pillarInbound.length === 0 && supporting.length > 0) {
        issues.push({
          severity: "critical",
          category: "Silo Health",
          pageUrl: pillar.url,
          pageTitle: `${silo.name} pillar`,
          issue: `No supporting blog posts link to this pillar page (${supporting.length} posts in silo)`,
          recommendation: "Add links from blog posts in this silo back to the country page",
        });
      }
    }

    for (const hub of hubs) {
      const hubInbound = supporting.filter((sp) =>
        sp.internalLinksTo.includes(hub.url),
      );
      if (hubInbound.length === 0 && supporting.length > 2) {
        issues.push({
          severity: "warning",
          category: "Silo Health",
          pageUrl: hub.url,
          pageTitle: hub.title,
          issue: "No blog posts link to this camp page",
          recommendation: `Add internal links from related blog posts to strengthen this hub's authority`,
        });
      }
    }
  }

  return issues;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const saveResults = body.save === true;

    const siloMap = await buildSiloMap();

    // Fetch meta data for all pages
    const metaQuery = `*[_type in ["camp", "country", "blogPost", "campSurfPage", "campRoomsPage", "campFoodPage", "page", "homepage"] && (language == "en" || !defined(language))] {
      _id, _type, "metaTitle": seo.metaTitle, "metaDescription": seo.metaDescription
    }`;
    const metaData = await sanityClient.fetch(metaQuery);

    // Run heuristic audit
    const issues = runHeuristicAudit(siloMap, metaData);

    // Calculate silo health
    const siloHealth = siloMap.silos.map((silo) => {
      const pages = getSiloPages(siloMap, silo.id);
      const pillar = pages.find((p) => p.role === "pillar");
      const supporting = pages.filter((p) => p.role === "supporting");
      const hubs = pages.filter((p) => p.role === "hub");

      const orphaned = pages.filter((p) => {
        if (p.role === "pillar") return false;
        return getInboundLinks(siloMap, p.url).length === 0;
      });

      const missingUplinks = supporting.filter((sp) => {
        const linksToSilo = sp.internalLinksTo.some((link) =>
          pages.some((p) => p.url === link && (p.role === "pillar" || p.role === "hub")),
        );
        return !linksToSilo;
      });

      const score = Math.max(0, Math.min(100,
        100
        - (orphaned.length * 5)
        - (missingUplinks.length * 3)
        - (pillar && getInboundLinks(siloMap, pillar.url).filter((p) => p.role === "supporting").length === 0 ? 20 : 0),
      ));

      return {
        siloName: silo.name,
        siloId: silo.id,
        score,
        totalPages: pages.length,
        orphanedPages: orphaned.length,
        missingUplinks: missingUplinks.length,
        notes: `${hubs.length} hubs, ${supporting.length} supporting posts`,
      };
    });

    const overallScore = Math.round(
      siloHealth.reduce((sum, s) => sum + s.score, 0) / Math.max(siloHealth.length, 1),
    );

    const criticalCount = issues.filter((i) => i.severity === "critical").length;
    const warningCount = issues.filter((i) => i.severity === "warning").length;

    const summary = `Found ${issues.length} issues: ${criticalCount} critical, ${warningCount} warnings. ${siloMap.pages.length} pages across ${siloMap.silos.length} silos analyzed.`;

    // Optionally save to Sanity
    if (saveResults) {
      await sanityClient.create({
        _type: "seoInsight",
        title: `SEO Audit — ${new Date().toLocaleDateString()}`,
        runDate: new Date().toISOString(),
        overallScore,
        summary,
        issues: issues.slice(0, 100),
        siloHealth,
      });
    }

    return jsonResponse({
      success: true,
      overallScore,
      summary,
      totalPages: siloMap.pages.length,
      siloCount: siloMap.silos.length,
      issues,
      siloHealth,
      siloMap: {
        silos: siloMap.silos,
        pagesByRole: {
          pillar: siloMap.pages.filter((p) => p.role === "pillar").length,
          hub: siloMap.pages.filter((p) => p.role === "hub").length,
          spoke: siloMap.pages.filter((p) => p.role === "spoke").length,
          supporting: siloMap.pages.filter((p) => p.role === "supporting").length,
        },
      },
    });
  } catch (err: any) {
    console.error("[seo-dashboard] Error:", err);
    return errorResponse(err.message || "Internal server error");
  }
};
