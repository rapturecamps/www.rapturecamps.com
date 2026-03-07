export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@sanity/client";

const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc",
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: import.meta.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

interface CampWithPlaceId {
  _id: string;
  name: string;
  googlePlaceId: string;
  rating: number | null;
  reviewCount: number | null;
}

interface PlaceRating {
  rating?: number;
  userRatingCount?: number;
}

async function fetchGoogleRating(
  placeId: string,
  apiKey: string,
): Promise<PlaceRating | null> {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount",
      },
    },
  );

  if (!res.ok) {
    const err = await res.text();
    console.warn(`[update-reviews] Places API error for ${placeId}:`, res.status, err);
    return null;
  }

  return await res.json();
}

export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get("authorization");
  const cronSecret = import.meta.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const apiKey = import.meta.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GOOGLE_PLACES_API_KEY not configured" }),
      { status: 500 },
    );
  }

  const camps: CampWithPlaceId[] = await sanityClient.fetch(
    `*[_type == "camp" && defined(googlePlaceId) && language != "de"]{
      _id, name, googlePlaceId, rating, reviewCount
    }`,
  );

  if (!camps.length) {
    return new Response(
      JSON.stringify({ message: "No camps with Google Place IDs found", updated: 0 }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const results: Array<{
    camp: string;
    oldRating: number | null;
    newRating: number | undefined;
    oldCount: number | null;
    newCount: number | undefined;
    patched: boolean;
  }> = [];

  for (const camp of camps) {
    const place = await fetchGoogleRating(camp.googlePlaceId, apiKey);
    if (!place) {
      results.push({
        camp: camp.name,
        oldRating: camp.rating,
        newRating: undefined,
        oldCount: camp.reviewCount,
        newCount: undefined,
        patched: false,
      });
      continue;
    }

    const newRating = place.rating;
    const newCount = place.userRatingCount;

    const ratingChanged =
      newRating !== undefined && newRating !== camp.rating;
    const countChanged =
      newCount !== undefined && newCount !== camp.reviewCount;

    if (ratingChanged || countChanged) {
      const patch: Record<string, number> = {};
      if (ratingChanged) patch.rating = newRating!;
      if (countChanged) patch.reviewCount = newCount!;

      await sanityClient.patch(camp._id).set(patch).commit();

      // Find and patch all language variants via translation.metadata
      try {
        const variants: Array<{ _ref: string }> = await sanityClient.fetch(
          `*[_type == "translation.metadata" && references($id)][0]
            .translations[].value{ _ref }`,
          { id: camp._id },
        );
        if (variants?.length) {
          for (const v of variants) {
            if (v._ref && v._ref !== camp._id) {
              await sanityClient.patch(v._ref).set(patch).commit();
            }
          }
        }
      } catch {
        // Translation metadata may not exist for all camps
      }
    }

    results.push({
      camp: camp.name,
      oldRating: camp.rating,
      newRating,
      oldCount: camp.reviewCount,
      newCount,
      patched: ratingChanged || countChanged,
    });
  }

  const updated = results.filter((r) => r.patched).length;

  return new Response(
    JSON.stringify({
      message: `Checked ${results.length} camps, updated ${updated}`,
      results,
      timestamp: new Date().toISOString(),
    }),
    { headers: { "Content-Type": "application/json" } },
  );
};
