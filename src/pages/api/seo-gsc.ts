export const prerender = false;

import type { APIRoute } from "astro";
import { google } from "googleapis";
import { jsonResponse, errorResponse } from "./_seo-shared";
import fs from "node:fs";
import path from "node:path";

function getAuth() {
  const envJson = import.meta.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (envJson) {
    const creds = JSON.parse(envJson);
    return new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });
  }

  const filePath = path.resolve(process.cwd(), ".gsc-credentials.json");
  if (fs.existsSync(filePath)) {
    const creds = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });
  }

  throw new Error(
    "No GSC credentials found. Set GOOGLE_SERVICE_ACCOUNT_JSON env var or place .gsc-credentials.json in project root.",
  );
}

const SITE_URL = "https://www.rapturecamps.com/";

function dateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function queryGsc(
  searchconsole: ReturnType<typeof google.searchconsole>,
  dimensions: string[],
  startDate: string,
  endDate: string,
  rowLimit = 100,
): Promise<GscRow[]> {
  const res = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions,
      rowLimit,
    },
  });
  return (res.data.rows || []).map((r) => ({
    keys: r.keys || [],
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: r.ctr || 0,
    position: r.position || 0,
  }));
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const period = body.period || 28;

    const auth = getAuth();
    const searchconsole = google.searchconsole({ version: "v1", auth });

    const currentEnd = dateDaysAgo(3); // GSC data has ~3-day lag
    const currentStart = dateDaysAgo(period + 3);
    const prevEnd = dateDaysAgo(period + 3);
    const prevStart = dateDaysAgo(period * 2 + 3);

    const [currentPages, prevPages, currentQueries, prevQueries] =
      await Promise.all([
        queryGsc(searchconsole, ["page"], currentStart, currentEnd, 500),
        queryGsc(searchconsole, ["page"], prevStart, prevEnd, 500),
        queryGsc(searchconsole, ["query"], currentStart, currentEnd, 200),
        queryGsc(searchconsole, ["query"], prevStart, prevEnd, 200),
      ]);

    const currentTotals = currentPages.reduce(
      (acc, r) => ({
        clicks: acc.clicks + r.clicks,
        impressions: acc.impressions + r.impressions,
      }),
      { clicks: 0, impressions: 0 },
    );
    const prevTotals = prevPages.reduce(
      (acc, r) => ({
        clicks: acc.clicks + r.clicks,
        impressions: acc.impressions + r.impressions,
      }),
      { clicks: 0, impressions: 0 },
    );

    const avgPosition =
      currentPages.length > 0
        ? currentPages.reduce((s, r) => s + r.position * r.impressions, 0) /
          Math.max(currentTotals.impressions, 1)
        : 0;
    const prevAvgPosition =
      prevPages.length > 0
        ? prevPages.reduce((s, r) => s + r.position * r.impressions, 0) /
          Math.max(prevTotals.impressions, 1)
        : 0;

    const avgCtr =
      currentTotals.impressions > 0
        ? currentTotals.clicks / currentTotals.impressions
        : 0;
    const prevAvgCtr =
      prevTotals.impressions > 0
        ? prevTotals.clicks / prevTotals.impressions
        : 0;

    const overview = {
      clicks: currentTotals.clicks,
      clicksDelta: currentTotals.clicks - prevTotals.clicks,
      impressions: currentTotals.impressions,
      impressionsDelta: currentTotals.impressions - prevTotals.impressions,
      ctr: avgCtr,
      ctrDelta: avgCtr - prevAvgCtr,
      position: avgPosition,
      positionDelta: avgPosition - prevAvgPosition,
      period,
      dateRange: `${currentStart} → ${currentEnd}`,
    };

    const topPages = currentPages
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 25)
      .map((r) => {
        const prev = prevPages.find((p) => p.keys[0] === r.keys[0]);
        return {
          page: r.keys[0].replace(SITE_URL, "/").replace(/\/$/, "") || "/",
          clicks: r.clicks,
          clicksDelta: prev ? r.clicks - prev.clicks : r.clicks,
          impressions: r.impressions,
          ctr: r.ctr,
          position: Math.round(r.position * 10) / 10,
        };
      });

    const topQueries = currentQueries
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 25)
      .map((r) => {
        const prev = prevQueries.find((p) => p.keys[0] === r.keys[0]);
        return {
          query: r.keys[0],
          clicks: r.clicks,
          clicksDelta: prev ? r.clicks - prev.clicks : r.clicks,
          impressions: r.impressions,
          ctr: r.ctr,
          position: Math.round(r.position * 10) / 10,
        };
      });

    // Quick wins: high impressions but low CTR or position 5-20
    const quickWins = currentPages
      .filter(
        (r) =>
          r.impressions >= 50 && (r.position >= 5 && r.position <= 20),
      )
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 15)
      .map((r) => ({
        page: r.keys[0].replace(SITE_URL, "/").replace(/\/$/, "") || "/",
        impressions: r.impressions,
        clicks: r.clicks,
        ctr: r.ctr,
        position: Math.round(r.position * 10) / 10,
        opportunity:
          r.position <= 10
            ? "Improve CTR — already on page 1"
            : "Push to page 1 — close to ranking",
      }));

    // Declining pages: lost clicks vs previous period
    const declining = currentPages
      .map((r) => {
        const prev = prevPages.find((p) => p.keys[0] === r.keys[0]);
        if (!prev) return null;
        const delta = r.clicks - prev.clicks;
        return delta < -2 ? { ...r, delta, prevClicks: prev.clicks } : null;
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.delta - b.delta)
      .slice(0, 10)
      .map((r: any) => ({
        page: r.keys[0].replace(SITE_URL, "/").replace(/\/$/, "") || "/",
        clicks: r.clicks,
        prevClicks: r.prevClicks,
        delta: r.delta,
        position: Math.round(r.position * 10) / 10,
      }));

    return jsonResponse({
      success: true,
      overview,
      topPages,
      topQueries,
      quickWins,
      declining,
    });
  } catch (err: any) {
    console.error("[seo-gsc] Error:", err);
    return errorResponse(err.message || "Failed to fetch GSC data");
  }
};
