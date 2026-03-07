export const prerender = false;

import type { APIRoute } from "astro";
import glossaryContent from "../../../docs/translation-glossary-de.md?raw";

const PAGE_TYPE_LABELS: Record<string, string> = {
  blogPost: "Blog Post",
  camp: "Camp Landing Page",
  campSurfPage: "Camp Surf Page",
  campRoomsPage: "Camp Rooms Page",
  campFoodPage: "Camp Food Page",
  country: "Country Landing Page",
  homepage: "Homepage",
  page: "Static Page",
  faq: "FAQ",
};

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ glossary: glossaryContent, pageTypes: PAGE_TYPE_LABELS }),
    { headers: { "Content-Type": "application/json" } }
  );
};
