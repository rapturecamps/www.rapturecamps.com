---
name: German pages creation
overview: "Create all missing German (`/de/`) page equivalents so German users don't hit 404s: contact, jobs, surfcamp index, meet-us, and thank-you pages."
todos:
  - id: de-contact
    content: Create /de/contact.astro with German translations, Zoho form, returnURL to /de/thank-you
    status: completed
  - id: de-jobs
    content: Create /de/jobs.astro with German translations, same Airtable embed
    status: completed
  - id: de-surfcamp-index
    content: Create /de/surfcamp/index.astro with getCountries('de'), German labels
    status: completed
  - id: de-meet-us
    content: Create /de/meet-us.astro with German translations, same Zoho Bookings iframe
    status: completed
  - id: de-thank-you
    content: Create /de/thank-you.astro with German translations, /de/faq link
    status: completed
isProject: false
---

# Create Missing German Pages

## Pages to Create

Five German pages need to be created to match their English counterparts:

- **`/de/contact`** -- German version of [src/pages/contact.astro](src/pages/contact.astro) with translated labels, placeholders, and the same Zoho Desk form (returnURL points to `/de/thank-you`). Meet-us link points to `/de/meet-us`.
- **`/de/jobs`** -- German version of [src/pages/jobs.astro](src/pages/jobs.astro) with translated headings/text. Same Airtable embed (English-only widget).
- **`/de/surfcamp/index`** -- German version of [src/pages/surfcamp/index.astro](src/pages/surfcamp/index.astro), calling `getCountries("de")` to fetch German-translated country names. Links go to `/de/surfcamp/{slug}`.
- **`/de/meet-us`** -- German version of [src/pages/meet-us.astro](src/pages/meet-us.astro) with translated text. Same Zoho Bookings iframe. Breadcrumbs link to `/de/contact`.
- **`/de/thank-you`** -- German version of [src/pages/thank-you.astro](src/pages/thank-you.astro) with translated copy. FAQ link goes to `/de/faq`.

## What's Already Handled

- **Hreflang tags**: `BaseLayout` auto-generates `hreflang` alternates via `getTranslatedPath()` (line 63 of [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro)). No extra config needed.
- **Footer links**: Already locale-aware using `${prefix}` pattern.
- **Header/nav**: Already uses `langPrefix` for surfcamp links.
- **Cookie banner**: Already localized (done previously).

## Optional: Survey Thank-You + ContactWidget

- A German `/de/survey-thank-you` page could also be created (low priority -- this is a noindexed utility page).
- The `ContactWidget` "Email" link is hardcoded to `/contact` (not locale-aware). Could be updated to detect locale, but this is a minor enhancement.
