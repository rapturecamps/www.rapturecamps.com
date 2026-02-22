export const SUPPORTED_LANGS = ["en", "de"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

const translations: Record<string, Record<Lang, string>> = {
  "nav.overview": { en: "Overview", de: "Überblick" },
  "nav.surf": { en: "Surf", de: "Surfen" },
  "nav.rooms": { en: "Rooms", de: "Zimmer" },
  "nav.food": { en: "Food", de: "Essen" },

  "cta.book": { en: "Book Your Trip", de: "Reise buchen" },
  "cta.headline": {
    en: "All You Have Is Now. Start Surfing Today.",
    de: "Alles was zählt ist Jetzt. Fang heute an zu surfen.",
  },
  "cta.text": {
    en: "Book your surf camp experience today and join thousands of happy surfers who chose Rapture as their gateway to the perfect wave.",
    de: "Buche dein Surfcamp-Erlebnis noch heute und werde Teil von tausenden glücklichen Surfern, die Rapture als ihr Tor zur perfekten Welle gewählt haben.",
  },

  "camp.highlights": { en: "Highlights", de: "Highlights" },
  "camp.inclusions": { en: "Included in every stay", de: "In jedem Aufenthalt inklusive" },
  "camp.surfSpots": { en: "Surf Spots Nearby", de: "Surfspots in der Nähe" },
  "camp.reviews": { en: "Reviews", de: "Bewertungen" },
  "camp.rating": { en: "rating", de: "Bewertung" },
  "camp.basedOn": { en: "Based on", de: "Basierend auf" },
  "camp.reviews_count": { en: "reviews", de: "Bewertungen" },
  "camp.surf_title": { en: "Surf at", de: "Surfen in" },
  "camp.rooms_title": { en: "Rooms at", de: "Zimmer in" },
  "camp.food_title": { en: "Food at", de: "Essen in" },
  "camp.faq": { en: "Frequently Asked Questions", de: "Häufig gestellte Fragen" },

  "general.readMore": { en: "Read more", de: "Weiterlesen" },
  "general.backTo": { en: "Back to", de: "Zurück zu" },
  "general.seeAll": { en: "See all", de: "Alle anzeigen" },

  "footer.legal": { en: "Legal", de: "Impressum" },
  "footer.privacy": { en: "Privacy Policy", de: "Datenschutz" },
  "footer.terms": { en: "Terms & Conditions", de: "AGB" },
  "footer.cookies": { en: "Manage Cookies", de: "Cookies verwalten" },
};

export function t(key: string, lang: Lang = DEFAULT_LANG): string {
  return translations[key]?.[lang] ?? translations[key]?.en ?? key;
}

export function langPrefix(lang: Lang): string {
  return lang === DEFAULT_LANG ? "" : `/${lang}`;
}

export function localizedPath(path: string, lang: Lang): string {
  if (lang === DEFAULT_LANG) return path;
  return `/${lang}${path}`;
}
