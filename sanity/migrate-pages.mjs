import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const envContent = readFileSync(".env", "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const client = createClient({
  projectId: "ypmt1bmc",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

let keyCounter = 0;
function key() {
  return `k${Date.now().toString(36)}${(keyCounter++).toString(36)}`;
}

function heading(text, level = "h2") {
  return {
    _type: "block",
    _key: key(),
    style: level,
    children: [{ _type: "span", _key: key(), text, marks: [] }],
    markDefs: [],
  };
}

function paragraph(text) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    children: [{ _type: "span", _key: key(), text, marks: [] }],
    markDefs: [],
  };
}

function paragraphWithBoldAndLink(parts) {
  const markDefs = [];
  const children = parts.map((part) => {
    const marks = [];
    if (part.bold) marks.push("strong");
    if (part.link) {
      const linkKey = key();
      markDefs.push({
        _type: "link",
        _key: linkKey,
        href: part.link,
        blank: part.blank || false,
      });
      marks.push(linkKey);
    }
    return { _type: "span", _key: key(), text: part.text, marks };
  });
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    children,
    markDefs,
  };
}

function listItem(text) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    listItem: "bullet",
    level: 1,
    children: [{ _type: "span", _key: key(), text, marks: [] }],
    markDefs: [],
  };
}

function listItemWithBold(boldText, normalText) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    listItem: "bullet",
    level: 1,
    children: [
      { _type: "span", _key: key(), text: boldText, marks: ["strong"] },
      { _type: "span", _key: key(), text: normalText, marks: [] },
    ],
    markDefs: [],
  };
}

// ─── About Page ──────────────────────────────────────────────────────────────
const aboutBody = [
  paragraph("Rapture Surfcamps was born in 2003 when an Australian photographer and an Austrian entrepreneur decided to combine their passion for surfing with their love of travel. What started as a single surf house in Morocco has grown into a global network of 8 unique surf camps across 5 countries on 4 continents."),
  paragraph("Over the past two decades, we've welcomed more than 85,000 guests from every corner of the globe. From first-time surfers catching their very first wave to seasoned pros hunting barrels, our camps are built around one simple idea: sharing the joy of surfing in incredible locations with a community of like-minded adventurers."),
  paragraph("Every Rapture camp is owner-operated by surfers who know the local breaks inside and out. We're not a faceless chain — each camp has its own personality, its own vibe, and its own magic."),
  paragraph("Whether you're drawn to the tropical perfection of Bali, the Pura Vida spirit of Costa Rica, the raw beauty of Morocco, the wild Atlantic coast of Portugal, or the unspoiled shores of Nicaragua — there's a Rapture camp waiting for you."),
];

// ─── Legal Page ──────────────────────────────────────────────────────────────
const legalBody = [
  heading("Company Information"),
  paragraph("Rapture Surfcamps\n[Company legal name]\n[Street address]\n[Postal code, City]\n[Country]"),
  heading("Contact"),
  paragraph("Email: info@rapturecamps.com\nPhone: +44 7700 177360"),
  heading("Managing Director"),
  paragraph("[Name of managing director(s)]"),
  heading("Commercial Register"),
  paragraph("Registered at: [Court / Registry]\nRegistration number: [Number]"),
  heading("VAT Identification Number"),
  paragraph("[VAT ID if applicable]"),
  heading("Dispute Resolution"),
  paragraphWithBoldAndLink([
    { text: "The European Commission provides a platform for online dispute resolution (ODR): " },
    { text: "https://ec.europa.eu/consumers/odr", link: "https://ec.europa.eu/consumers/odr", blank: true },
    { text: "." },
  ]),
  paragraph("We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board."),
  heading("Liability for Content"),
  paragraph("As a service provider, we are responsible for our own content on these pages in accordance with general laws. However, we are not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity."),
];

// ─── Terms Page ──────────────────────────────────────────────────────────────
const termsBody = [
  heading("1. Scope"),
  paragraph("These General Terms and Conditions apply to all bookings made through rapturecamps.com and its affiliated booking platforms. By making a reservation, you agree to these terms."),
  heading("2. Booking & Confirmation"),
  paragraph("A booking is confirmed once you receive a written confirmation email and the deposit has been processed. The remaining balance is due 30 days before the arrival date. Bookings made within 30 days of arrival require full payment at the time of booking."),
  heading("3. Prices & Payment"),
  paragraph("All prices listed on the website are per person and include the services described on the respective camp page. Prices are subject to change without notice, but confirmed bookings will be honoured at the price quoted at the time of booking."),
  heading("4. Cancellation Policy"),
  listItem("More than 30 days before arrival: full refund minus processing fee"),
  listItem("15–30 days before arrival: 50% refund"),
  listItem("Less than 15 days before arrival: no refund"),
  listItem("No-show: no refund"),
  paragraph("We strongly recommend purchasing travel insurance that covers cancellation."),
  heading("5. Changes by the Guest"),
  paragraph("Date changes are subject to availability and must be requested at least 14 days before the original arrival date. A rebooking fee may apply."),
  heading("6. Changes by Rapture Surfcamps"),
  paragraph("We reserve the right to make changes to the programme due to weather, surf conditions, or other circumstances beyond our control. In the event of significant changes, you will be offered an alternative or a refund."),
  heading("7. Liability & Assumption of Risk"),
  paragraph("Surfing and related activities carry inherent risks. By participating in our programmes, you acknowledge and accept these risks. Rapture Surfcamps and its instructors are not liable for injuries or loss of property unless caused by gross negligence."),
  paragraph("All guests are required to sign a liability waiver upon check-in."),
  heading("8. Insurance"),
  paragraph("Travel and health insurance is not included in our packages. We require all guests to have adequate travel insurance covering medical expenses, repatriation, and cancellation. Proof of insurance may be requested at check-in."),
  heading("9. House Rules"),
  paragraph("Guests are expected to respect camp property, fellow guests, staff, and the local community. Rapture Surfcamps reserves the right to terminate a stay without refund if a guest's behaviour is deemed unacceptable."),
  heading("10. Governing Law"),
  paragraph("These terms are governed by [applicable law / jurisdiction]. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of [jurisdiction]."),
  heading("11. Contact"),
  paragraphWithBoldAndLink([
    { text: "For questions regarding these terms, please contact us at " },
    { text: "info@rapturecamps.com", link: "mailto:info@rapturecamps.com" },
    { text: "." },
  ]),
];

// ─── Privacy Policy ──────────────────────────────────────────────────────────
const privacyBody = [
  heading("1. Overview"),
  paragraph('This privacy policy explains how Rapture Surfcamps ("we", "us", "our") collects, uses, and protects your personal data when you visit our website rapturecamps.com or use our services.'),
  heading("2. Data Controller"),
  paragraph("Rapture Surfcamps\n[Company legal name]\n[Address]\nEmail: info@rapturecamps.com"),
  heading("3. Data We Collect"),
  paragraph("We may collect the following types of personal data:"),
  listItemWithBold("Contact information: ", "name, email address, phone number"),
  listItemWithBold("Booking data: ", "travel dates, camp preferences, dietary requirements, surf experience level"),
  listItemWithBold("Payment data: ", "processed securely through our payment provider; we do not store credit card details"),
  listItemWithBold("Usage data: ", "IP address, browser type, pages visited, time spent on site"),
  listItemWithBold("Communication data: ", "messages sent via contact forms, email, WhatsApp, or Telegram"),
  heading("4. How We Use Your Data"),
  listItem("To process and manage your booking"),
  listItem("To communicate with you about your reservation and stay"),
  listItem("To improve our website and services"),
  listItem("To send marketing communications (only with your consent)"),
  listItem("To comply with legal obligations"),
  heading("5. Cookies & Tracking"),
  paragraph("Our website uses cookies and similar technologies to enhance your browsing experience and analyse site traffic. We use:"),
  listItemWithBold("Essential cookies: ", "required for the website to function properly"),
  listItemWithBold("Analytics cookies: ", "help us understand how visitors use our site (e.g., Google Analytics)"),
  listItemWithBold("Marketing cookies: ", "used to deliver relevant advertisements (only with consent)"),
  paragraph("You can manage your cookie preferences through your browser settings or our cookie consent banner."),
  heading("6. Third-Party Services"),
  paragraph("We use the following third-party services that may process your data:"),
  listItemWithBold("Booking engine: ", "for reservation processing"),
  listItemWithBold("Google Analytics: ", "for website analytics"),
  listItemWithBold("Elfsight: ", "for displaying customer reviews"),
  listItemWithBold("Zoho SalesIQ: ", "for live chat support"),
  listItemWithBold("Vercel: ", "for website hosting"),
  paragraph("Each of these services has their own privacy policy governing the use of your data."),
  heading("7. Data Retention"),
  paragraph("We retain personal data only for as long as necessary to fulfil the purposes for which it was collected, or as required by law. Booking data is retained for [X] years after the completion of your stay for accounting and legal purposes."),
  heading("8. Your Rights"),
  paragraph("Under applicable data protection laws (including GDPR), you have the right to:"),
  listItem("Access the personal data we hold about you"),
  listItem("Request correction of inaccurate data"),
  listItem("Request deletion of your data"),
  listItem("Object to or restrict processing"),
  listItem("Data portability"),
  listItem("Withdraw consent at any time"),
  paragraphWithBoldAndLink([
    { text: "To exercise any of these rights, contact us at " },
    { text: "info@rapturecamps.com", link: "mailto:info@rapturecamps.com" },
    { text: "." },
  ]),
  heading("9. Data Security"),
  paragraph("We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. Our website uses SSL/TLS encryption for all data transmission."),
  heading("10. Changes to This Policy"),
  paragraph('We may update this privacy policy from time to time. The latest version will always be available on this page with the "Last updated" date above.'),
  heading("11. Contact"),
  paragraphWithBoldAndLink([
    { text: "For questions or concerns about this privacy policy or your personal data, contact us at " },
    { text: "info@rapturecamps.com", link: "mailto:info@rapturecamps.com" },
    { text: "." },
  ]),
];

// ─── Seed documents ──────────────────────────────────────────────────────────

const pages = [
  {
    _id: "page-about",
    _type: "page",
    title: "Our Story",
    slug: { _type: "slug", current: "about" },
    language: "en",
    body: aboutBody,
    seo: {
      _type: "seo",
      title: "About Us | Rapture Surfcamps",
      description: "Founded in 2003 by an Australian photographer and an Austrian entrepreneur, Rapture Surfcamps has grown into a global network of 8 surf camps across 5 countries.",
    },
  },
  {
    _id: "page-legal",
    _type: "page",
    title: "Legal Notice",
    slug: { _type: "slug", current: "legal" },
    language: "en",
    body: legalBody,
    seo: {
      _type: "seo",
      title: "Legal Notice | Rapture Surfcamps",
      description: "Legal notice and imprint for Rapture Surfcamps.",
    },
  },
  {
    _id: "page-terms",
    _type: "page",
    title: "Terms & Conditions",
    slug: { _type: "slug", current: "terms" },
    lastUpdated: "2026-02-01",
    language: "en",
    body: termsBody,
    seo: {
      _type: "seo",
      title: "Terms & Conditions | Rapture Surfcamps",
      description: "Terms and conditions for booking and staying at Rapture Surfcamps.",
    },
  },
  {
    _id: "page-privacy-policy",
    _type: "page",
    title: "Privacy Policy",
    slug: { _type: "slug", current: "privacy-policy" },
    lastUpdated: "2026-02-01",
    language: "en",
    body: privacyBody,
    seo: {
      _type: "seo",
      title: "Privacy Policy | Rapture Surfcamps",
      description: "Privacy policy and data security information for Rapture Surfcamps.",
    },
  },
];

const homepageDoc = {
  _id: "homepage-en",
  _type: "homepage",
  language: "en",
  heroTagline: "Rapture Surfcamps",
  heroTitle: "All you have is now.",
  heroSubtitle: "Unparalleled Surf Camp Experience at the Best Surf Spots!",
  aboutHeading: "We're a network of 8 unique surf camps in 5 countries on 4 continents. In the last 21 years, we've helped more than 85k people from all over the world to learn to surf and find the best waves.",
  aboutSubtext: "Surf the world and visit us in",
  aboutLinkText: "Learn more about us",
  seo: {
    _type: "seo",
    title: "Rapture Surfcamps — All You Have Is Now",
    description: "A network of 8 unique surf camps in 5 countries on 4 continents. Book your surf camp experience today.",
  },
};

console.log("Creating page documents...");
const tx = client.transaction();

for (const page of pages) {
  console.log(`  → ${page._id} (${page.title})`);
  tx.createOrReplace(page);
}

console.log(`  → ${homepageDoc._id} (Homepage)`);
tx.createOrReplace(homepageDoc);

await tx.commit();
console.log("Done — all pages created in Sanity.");
