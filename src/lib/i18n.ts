export const SUPPORTED_LANGS = ["en", "de"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

const translations: Record<string, Record<Lang, string>> = {
  "nav.destinations": { en: "Destinations", de: "Reiseziele" },
  "nav.overview": { en: "The Surfcamp", de: "Das Surfcamp" },
  "nav.surf": { en: "Surf", de: "Surfen" },
  "nav.rooms": { en: "Rooms", de: "Zimmer" },
  "nav.food": { en: "Food", de: "Essen" },
  "nav.book": { en: "Book", de: "Buchen" },
  "nav.allCamps": { en: "All {country} camps", de: "Alle {country} Camps" },
  "nav.blog": { en: "Blog", de: "Blog" },
  "nav.about": { en: "About", de: "Über uns" },
  "nav.faq": { en: "FAQ", de: "FAQ" },
  "nav.contact": { en: "Contact", de: "Kontakt" },

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
  "general.loading": { en: "Loading…", de: "Laden…" },
  "general.previous": { en: "Previous", de: "Zurück" },
  "general.next": { en: "Next", de: "Weiter" },
  "general.playStory": { en: "Play Story", de: "Story abspielen" },
  "general.pauseStory": { en: "Pause Story", de: "Story pausieren" },
  "general.checkAvailability": { en: "Check Availability", de: "Verfügbarkeit prüfen" },
  "general.getInTouch": { en: "Get in Touch", de: "Kontakt aufnehmen" },
  "general.gotQuestions": { en: "Got questions?", de: "Noch Fragen?" },
  "general.browseOur": { en: "browse our", de: "stöbere in unserem" },
  "general.orMessageUs": { en: "message us", de: "schreib uns" },
  "general.showMore": { en: "Show {n} more questions", de: "{n} weitere Fragen anzeigen" },
  "general.showFewer": { en: "Show fewer questions", de: "Weniger Fragen anzeigen" },

  "surf.typicalDay": { en: "A Typical Surf Day", de: "Ein typischer Surftag" },
  "surf.typicalDaySubtext": {
    en: "Every day is different depending on conditions, but here's what a standard day looks like.",
    de: "Jeder Tag ist anders – abhängig von den Bedingungen. So sieht ein typischer Tag bei uns aus.",
  },
  "surf.boards": { en: "Boards & Equipment", de: "Boards & Ausrüstung" },
  "surf.boardsSubtext": {
    en: "Everything you need is included. Just bring yourself and a sense of adventure.",
    de: "Alles was du brauchst ist inklusive. Bring einfach dich selbst und Abenteuerlust mit.",
  },
  "surf.yourLevel": { en: "Your Surf Level", de: "Dein Surflevel" },
  "surf.yourLevelSubtext": {
    en: "Whether it's your first wave or your thousandth, we have a programme tailored for you.",
    de: "Egal ob deine erste oder tausendste Welle – wir haben das passende Programm für dich.",
  },
  "surf.theWaves": { en: "The Waves", de: "Die Wellen" },
  "surf.conditions": { en: "Surf Conditions", de: "Surfbedingungen" },
  "surf.live": { en: "Live", de: "Live" },
  "surf.currentConditions": { en: "Current conditions", de: "Aktuelle Bedingungen" },
  "surf.waveHeight": { en: "Wave Height", de: "Wellenhöhe" },
  "surf.wavePeriod": { en: "Wave Period", de: "Wellenperiode" },
  "surf.swellHeight": { en: "Swell Height", de: "Swellhöhe" },
  "surf.swellDirection": { en: "Swell Direction", de: "Swellrichtung" },
  "surf.forecast": { en: "Surf Forecast", de: "Surf-Vorhersage" },
  "surf.forecastSubtext": {
    en: "Wave and swell forecast for the next 14 days",
    de: "Wellen- und Swell-Vorhersage für die nächsten 14 Tage",
  },
  "surf.mellow": { en: "Mellow", de: "Mellow" },
  "surf.fun": { en: "Fun", de: "Fun" },
  "surf.pumping": { en: "Pumping", de: "Pumping" },
  "surf.forecastDisclaimer": {
    en: "Data from Open-Meteo Marine API. Updated hourly. Forecasts beyond 7 days are less reliable.",
    de: "Daten von Open-Meteo Marine API. Stündlich aktualisiert. Vorhersagen über 7 Tage hinaus sind weniger zuverlässig.",
  },
  "surf.spotsNearby": { en: "Surf Spots Nearby", de: "Surfspots in der Nähe" },
  "surf.bestTimeToSurf": { en: "Best Time to Surf", de: "Beste Zeit zum Surfen" },
  "surf.waveConsistency": { en: "Wave Consistency", de: "Wellenkonsistenz" },
  "surf.seasons": { en: "Seasons", de: "Saisons" },
  "surf.crowdLevel": { en: "Crowd Level", de: "Crowd-Level" },
  "surf.temperature": { en: "Temperature", de: "Temperatur" },
  "surf.air": { en: "Air", de: "Luft" },
  "surf.water": { en: "Water", de: "Wasser" },
  "surf.airWaterTemp": { en: "Air & Water Temperatures", de: "Luft- & Wassertemperaturen" },
  "surf.airTempRange": { en: "Air temp range", de: "Lufttemperatur" },
  "surf.waterTemp": { en: "Water temp", de: "Wassertemperatur" },
  "surf.rainyDays": { en: "Rainy days", de: "Regentage" },
  "surf.rainfall": { en: "Rainfall", de: "Niederschlag" },
  "surf.avgAirTemp": { en: "Avg Air Temp", de: "Ø Lufttemperatur" },
  "surf.avgWater": { en: "Avg Water", de: "Ø Wassertemp." },
  "surf.rainyDaysYear": { en: "Rainy Days/Year", de: "Regentage/Jahr" },

  "food.dailyMeals": { en: "Daily Meals", de: "Tägliche Mahlzeiten" },
  "food.eatWell": { en: "Eat Well, Surf Better", de: "Gut essen, besser surfen" },
  "food.atAGlance": { en: "At a Glance", de: "Auf einen Blick" },
  "food.sampleMenu": { en: "Sample Weekly Menu", de: "Beispiel-Wochenmenü" },
  "food.day": { en: "Day", de: "Tag" },
  "food.starter": { en: "Starter", de: "Vorspeise" },
  "food.main": { en: "Main", de: "Hauptgericht" },
  "food.dessert": { en: "Dessert", de: "Dessert" },
  "food.dietary": { en: "Dietary Requirements", de: "Ernährungsanforderungen" },

  "rooms.roomTypes": { en: "Room Types", de: "Zimmertypen" },
  "rooms.everyBooking": { en: "Every Booking Includes", de: "Jede Buchung beinhaltet" },
  "rooms.whatsIncluded": { en: "What's Included", de: "Was ist inklusive" },
  "rooms.securePayments": { en: "Secure payments", de: "Sichere Zahlungen" },
  "rooms.paymentNote": {
    en: "Pay securely with your preferred method. Klarna buy-now-pay-later available at checkout.",
    de: "Bezahle sicher mit deiner bevorzugten Zahlungsmethode. Klarna Ratenzahlung an der Kasse verfügbar.",
  },

  "testimonials.heading": { en: "Stories from Our Guests", de: "Geschichten unserer Gäste" },
  "testimonials.whatGuestsSay": { en: "What Our Guests Say", de: "Was unsere Gäste sagen" },
  "testimonials.cookieConsent": {
    en: "This content is provided by a third party. To view reviews, please accept marketing cookies.",
    de: "Dieser Inhalt wird von einem Drittanbieter bereitgestellt. Um Bewertungen anzuzeigen, akzeptiere bitte Marketing-Cookies.",
  },
  "testimonials.manageCookies": { en: "Manage Cookie Preferences", de: "Cookie-Einstellungen verwalten" },

  "retreat.day": { en: "Day", de: "Tag" },

  "months.jan": { en: "Jan", de: "Jan" },
  "months.feb": { en: "Feb", de: "Feb" },
  "months.mar": { en: "Mar", de: "Mär" },
  "months.apr": { en: "Apr", de: "Apr" },
  "months.may": { en: "May", de: "Mai" },
  "months.jun": { en: "Jun", de: "Jun" },
  "months.jul": { en: "Jul", de: "Jul" },
  "months.aug": { en: "Aug", de: "Aug" },
  "months.sep": { en: "Sep", de: "Sep" },
  "months.oct": { en: "Oct", de: "Okt" },
  "months.nov": { en: "Nov", de: "Nov" },
  "months.dec": { en: "Dec", de: "Dez" },

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
