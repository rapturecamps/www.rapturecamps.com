/**
 * Data fetching layer: provides the same shapes as data.ts but sourced from Sanity.
 * Falls back to hardcoded data.ts when Sanity fields are missing (e.g. images).
 * All camp/country functions accept an optional `lang` parameter (defaults to "en").
 */

import { sanityClient } from "./sanity";
import {
  ALL_COUNTRIES,
  ALL_CAMPS,
  CAMPS_BY_COUNTRY,
  CAMP_BY_SLUG,
  COUNTRY_BY_SLUG,
  SITE_SETTINGS,
  PAGE_BY_SLUG,
  HOMEPAGE,
  LINKIN_BIO,
  FAQS_BY_CAMP,
} from "./queries";
import {
  destinations as hardcodedDestinations,
  countries as hardcodedCountries,
  navigation as hardcodedNavigation,
  stats as hardcodedStats,
} from "./data";
import type { Destination, StatItem } from "./types";

// ─── Countries ─────────────────────────────────────────────────────────────

export async function getCountries(lang = "en") {
  try {
    const sanityCountries = await sanityClient.fetch(ALL_COUNTRIES, { lang });
    if (sanityCountries?.length) return sanityCountries;
  } catch (e) {
    console.warn("[sanity] Failed to fetch countries, using fallback", e);
  }
  return hardcodedCountries;
}

// ─── Country by slug ───────────────────────────────────────────────────────

export async function getCountryBySlug(slug: string, lang = "en") {
  try {
    const country = await sanityClient.fetch(COUNTRY_BY_SLUG, { slug, lang });
    if (country) return country;
  } catch (e) {
    console.warn(`[sanity] Failed to fetch country ${slug}, using fallback`, e);
  }
  return null;
}

// ─── All destinations (camps) ──────────────────────────────────────────────

export async function getDestinations(lang = "en"): Promise<Destination[]> {
  try {
    const sanityCamps = await sanityClient.fetch(ALL_CAMPS, { lang });
    if (sanityCamps?.length) {
      return sanityCamps.map((camp: any) => mergeWithHardcoded(camp));
    }
  } catch (e) {
    console.warn("[sanity] Failed to fetch camps, using fallback", e);
  }
  return hardcodedDestinations;
}

// ─── Camps by country ──────────────────────────────────────────────────────

export async function getCampsByCountry(countrySlug: string, lang = "en") {
  try {
    const camps = await sanityClient.fetch(CAMPS_BY_COUNTRY, { countrySlug, lang });
    if (camps?.length) {
      return camps.map((camp: any) => mergeWithHardcoded(camp));
    }
  } catch (e) {
    console.warn(`[sanity] Failed to fetch camps for ${countrySlug}`, e);
  }
  return hardcodedDestinations.filter(
    (d) => d.country.toLowerCase().replace(" ", "-") === countrySlug
  );
}

// ─── Camp by slug ──────────────────────────────────────────────────────────

export async function getCampBySlug(slug: string, lang = "en") {
  try {
    const camp = await sanityClient.fetch(CAMP_BY_SLUG, { slug, lang });
    if (camp) {
      const merged = mergeWithHardcoded(camp);
      (merged as any).pageBuilder = camp.pageBuilder || null;
      (merged as any).surfPageBuilder = camp.surfPageBuilder || null;
      (merged as any).roomsPageBuilder = camp.roomsPageBuilder || null;
      (merged as any).foodPageBuilder = camp.foodPageBuilder || null;
      (merged as any)._translations = camp._translations || [];
      return merged;
    }
  } catch (e) {
    console.warn(`[sanity] Failed to fetch camp ${slug}`, e);
  }
  if (lang === "en") {
    return hardcodedDestinations.find((d) => d.slug.endsWith(slug)) || null;
  }
  return null;
}

// ─── Site settings ─────────────────────────────────────────────────────────

export async function getSiteSettings() {
  try {
    const settings = await sanityClient.fetch(SITE_SETTINGS);
    if (settings) {
      return {
        title: settings.title || "Rapture Surfcamps",
        description: settings.description || "",
        navigation: settings.navigation?.length
          ? {
              main: settings.navigation.map((n: any) => ({
                label: n.label,
                href: n.href,
              })),
              destinations: hardcodedNavigation.destinations,
            }
          : hardcodedNavigation,
        stats: settings.stats?.length
          ? settings.stats.map((s: any) => ({
              label: s.label,
              value: formatStatValue(s.value, s.suffix),
              prefix: s.suffix ? "More than" : undefined,
            }))
          : hardcodedStats,
        socialLinks: settings.socialLinks || {},
        contact: settings.contact || {},
        ogImage: settings.ogImage || null,
      };
    }
  } catch (e) {
    console.warn("[sanity] Failed to fetch site settings, using fallback", e);
  }
  return {
    title: "Rapture Surfcamps",
    description: "",
    navigation: hardcodedNavigation,
    stats: hardcodedStats,
    socialLinks: {},
    contact: {},
    ogImage: null,
  };
}

// ─── Page by slug ──────────────────────────────────────────────────────────

export async function getPageBySlug(slug: string, lang = "en") {
  try {
    const page = await sanityClient.fetch(PAGE_BY_SLUG, { slug, lang });
    if (page) return page;
  } catch (e) {
    console.warn(`[sanity] Failed to fetch page ${slug}`, e);
  }
  return null;
}

// ─── Homepage ──────────────────────────────────────────────────────────────

export async function getHomepage(lang = "en") {
  try {
    const homepage = await sanityClient.fetch(HOMEPAGE, { lang });
    if (homepage) return homepage;
  } catch (e) {
    console.warn("[sanity] Failed to fetch homepage", e);
  }
  return null;
}

// ─── Link in Bio ───────────────────────────────────────────────────────────

export async function getLinkinBio(lang = "en") {
  try {
    const bio = await sanityClient.fetch(LINKIN_BIO, { lang });
    if (bio) return bio;
  } catch (e) {
    console.warn("[sanity] Failed to fetch linkin bio", e);
  }
  return null;
}

// ─── FAQs by Camp ───────────────────────────────────────────────────────────

export async function getFaqsByCamp(
  campSlug: string,
  lang = "en"
): Promise<Record<string, { question: string; answer: string }[]> | null> {
  try {
    // Always look up the English camp doc for the reference ID —
    // German FAQs reference the same camp documents
    const campDoc = await sanityClient.fetch(
      `*[_type == "camp" && slug.current == $slug && (language == "en" || !defined(language))][0]{ _id }`,
      { slug: campSlug }
    );
    if (!campDoc?._id) return null;

    const faqs = await sanityClient.fetch(FAQS_BY_CAMP, {
      campRef: campDoc._id,
      lang,
    });
    if (!faqs?.length) return null;

    const grouped: Record<string, { question: string; answer: string }[]> = {};
    for (const faq of faqs) {
      const cat = faq.categoryName || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({ question: faq.question, answer: faq.answer });
    }
    return grouped;
  } catch (e) {
    console.warn(`[sanity] Failed to fetch FAQs for camp ${campSlug}`, e);
  }
  return null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatStatValue(value: number, suffix?: string): string {
  if (suffix === "k") return `${Math.round(value / 1000)}k`;
  return String(value);
}

function mergeWithHardcoded(sanityCamp: any): Destination {
  const hardcoded = hardcodedDestinations.find(
    (d) =>
      d.slug.endsWith(sanityCamp.slug) ||
      d.name === sanityCamp.name
  );

  return {
    name: sanityCamp.name || hardcoded?.name || "",
    country: sanityCamp.country || hardcoded?.country || "",
    slug: hardcoded?.slug || `/surfcamp/${sanityCamp.countrySlug}/${sanityCamp.slug}`,
    image: sanityCamp.image || hardcoded?.image || "",
    location: sanityCamp.location || hardcoded?.location || "",
    tagline: sanityCamp.tagline || hardcoded?.tagline,
    rating: sanityCamp.rating ?? hardcoded?.rating,
    reviewCount: sanityCamp.reviewCount ?? hardcoded?.reviewCount,
    amenities: sanityCamp.amenities?.length
      ? sanityCamp.amenities
      : hardcoded?.amenities,
    bookingUrl: sanityCamp.bookingUrl || hardcoded?.bookingUrl,
    heroImages: sanityCamp.heroImages?.length
      ? sanityCamp.heroImages
      : hardcoded?.heroImages,
    latitude: sanityCamp.latitude ?? hardcoded?.latitude,
    longitude: sanityCamp.longitude ?? hardcoded?.longitude,
    elfsightId: sanityCamp.elfsightId || hardcoded?.elfsightId,
  };
}
