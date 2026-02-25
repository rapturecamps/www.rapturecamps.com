/**
 * Centralized GROQ queries for fetching Sanity data.
 * Queries that fetch camps/countries accept a $lang parameter (defaults to "en").
 */

export const COUNTRY_SLUGS = `*[_type == "country" && (language == $lang || (!defined(language) && $lang == "en"))]{ "slug": slug.current }`;

export const ALL_COUNTRIES = `*[_type == "country" && (language == $lang || (!defined(language) && $lang == "en"))] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  flag
}`;

export const COUNTRY_BY_SLUG = `*[_type == "country" && slug.current == $slug && (language == $lang || (!defined(language) && $lang == "en"))][0] {
  _id,
  name,
  "slug": slug.current,
  flag,
  description,
  intro,
  comparison,
  pageBuilder[] {
    ...,
    _type in ["imageGrid", "imageCarousel", "imageGallery", "contentBlockGrid"] => {
      ...,
      images[] { ..., "resolvedUrl": asset->url, "resolvedAlt": asset->altText }
    },
    _type in ["imageBreak", "contentBlock", "featureBlock"] => {
      ...,
      "resolvedImageUrl": image.asset->url,
      "resolvedImageAlt": image.asset->altText
    },
    _type == "videoBlock" => {
      ...,
      "resolvedPosterUrl": poster.asset->url
    },
    _type == "contentBlockVideo" => {
      ...,
      "resolvedVideoPosterUrl": videoPoster.asset->url
    },
    _type == "surfSpots" => {
      ...,
      surfSpots[] { ..., "resolvedImageUrl": image.asset->url }
    },
    _type == "videoTestimonials" => {
      ...,
      videos[] { ..., "posterImageUrl": posterImage.asset->url },
      "resolvedSet": testimonialSet->{
        heading,
        bunnyLibraryId,
        bunnyPullZone,
        videos[] { ..., "posterImageUrl": posterImage.asset->url }
      }
    },
    _type == "faqSection" => {
      ...,
      "resolvedFaqs": faqRefs[]->{ question, answer },
      "resolvedCategoryFaqs": *[_type == "faq" && category._ref == ^.faqCategory._ref] | order(order asc) { question, answer }
    }
  },
  "heroImages": heroImages[].asset->url,
  heroTitle,
  heroTagline,
  seo
}`;

export const ALL_CAMPS = `*[_type == "camp" && (language == $lang || (!defined(language) && $lang == "en"))] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  "country": country->name,
  "countrySlug": country->slug.current,
  location,
  tagline,
  rating,
  reviewCount,
  amenities,
  bookingUrl,
  latitude,
  longitude,
  elfsightId,
  "heroImages": heroImages[].asset->url,
  "image": image.asset->url
}`;

export const CAMPS_BY_COUNTRY = `*[_type == "camp" && country->slug.current == $countrySlug && (language == $lang || (!defined(language) && $lang == "en"))] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  "country": country->name,
  "countrySlug": country->slug.current,
  location,
  tagline,
  rating,
  reviewCount,
  amenities,
  bookingUrl,
  latitude,
  longitude,
  elfsightId,
  "heroImages": heroImages[].asset->url,
  "image": image.asset->url,
  pageBuilder,
  seo
}`;

export const CAMP_BY_SLUG = `*[_type == "camp" && slug.current == $slug && (language == $lang || (!defined(language) && $lang == "en"))][0] {
  _id,
  name,
  "slug": slug.current,
  "country": country->name,
  "countrySlug": country->slug.current,
  location,
  tagline,
  introText,
  surfLevels,
  minStay,
  groupSize,
  spokenLanguages,
  rating,
  reviewCount,
  amenities,
  bookingUrl,
  latitude,
  longitude,
  elfsightId,
  "heroImages": heroImages[].asset->url,
  heroTitle,
  heroSubtitle,
  heroTagline,
  "image": image.asset->url,
  pageBuilder[] {
    _key, _type, ...,
    "resolvedImageUrl": image.asset->url,
    "resolvedImageAlt": image.asset->altText,
    "resolvedPosterUrl": poster.asset->url,
    "resolvedVideoPosterUrl": videoPoster.asset->url,
    images[] {
      ...,
      "resolvedUrl": asset->url,
      "resolvedAlt": asset->altText
    },
    _type == "videoTestimonials" => {
      ...,
      videos[] { ..., "posterImageUrl": posterImage.asset->url },
      "resolvedSet": testimonialSet->{
        heading,
        bunnyLibraryId,
        bunnyPullZone,
        videos[] { ..., "posterImageUrl": posterImage.asset->url }
      }
    },
    _type == "faqSection" => {
      ...,
      "resolvedFaqs": faqRefs[]->{ question, answer },
      "resolvedCategoryFaqs": *[_type == "faq" && category._ref == ^.faqCategory._ref] | order(order asc) { question, answer }
    },
    _type == "campSubPages" => {
      ...,
      "surfCard": { ...surfCard, "imageUrl": surfCard.image.asset->url },
      "roomsCard": { ...roomsCard, "imageUrl": roomsCard.image.asset->url },
      "foodCard": { ...foodCard, "imageUrl": foodCard.image.asset->url }
    }
  },
  seo,
  "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    "slug": slug.current,
    language
  }
}`;

// ─── Sub-page shared projection for camp reference ─────────────────────────
const campRefProjection = `
  "campName": camp->name,
  "campSlug": camp->slug.current,
  "countryName": camp->country->name,
  "countrySlug": camp->country->slug.current,
  "heroImages": camp->heroImages[].asset->url,
  "bookingUrl": camp->bookingUrl,
  "latitude": camp->latitude,
  "longitude": camp->longitude,
  "elfsightId": camp->elfsightId,
  "rating": camp->rating,
  "reviewCount": camp->reviewCount,
  "amenities": camp->amenities
`;

export const CAMP_SURF_PAGE = `*[_type == "campSurfPage" && camp->slug.current == $slug && (language == $lang || (!defined(language) && $lang == "en"))][0] {
  _id,
  heroTitle,
  ${campRefProjection},
  pageBuilder[] {
    _key, _type, ...,
    "resolvedImageUrl": image.asset->url,
    "resolvedImageAlt": image.asset->altText,
    "resolvedPosterUrl": poster.asset->url,
    "resolvedVideoPosterUrl": videoPoster.asset->url,
    images[] { ..., "resolvedUrl": asset->url, "resolvedAlt": asset->altText },
    surfSpots[] { ..., "resolvedImageUrl": image.asset->url },
    _type == "videoTestimonials" => {
      ...,
      videos[] { ..., "posterImageUrl": posterImage.asset->url },
      "resolvedSet": testimonialSet->{
        heading,
        bunnyLibraryId,
        bunnyPullZone,
        videos[] { ..., "posterImageUrl": posterImage.asset->url }
      }
    },
    _type == "faqSection" => {
      ...,
      "resolvedFaqs": faqRefs[]->{ question, answer },
      "resolvedCategoryFaqs": *[_type == "faq" && category._ref == ^.faqCategory._ref] | order(order asc) { question, answer }
    }
  },
  seo,
  "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    language
  }
}`;

export const CAMP_ROOMS_PAGE = `*[_type == "campRoomsPage" && camp->slug.current == $slug && (language == $lang || (!defined(language) && $lang == "en"))][0] {
  _id,
  heroTitle,
  ${campRefProjection},
  pageBuilder[] {
    _key, _type, ...,
    "resolvedImageUrl": image.asset->url,
    "resolvedImageAlt": image.asset->altText,
    "resolvedPosterUrl": poster.asset->url,
    "resolvedVideoPosterUrl": videoPoster.asset->url,
    images[] { ..., "resolvedUrl": asset->url, "resolvedAlt": asset->altText },
    rooms[] { ..., "resolvedImageUrl": image.asset->url },
    _type == "videoTestimonials" => {
      ...,
      videos[] { ..., "posterImageUrl": posterImage.asset->url },
      "resolvedSet": testimonialSet->{
        heading,
        bunnyLibraryId,
        bunnyPullZone,
        videos[] { ..., "posterImageUrl": posterImage.asset->url }
      }
    },
    _type == "faqSection" => {
      ...,
      "resolvedFaqs": faqRefs[]->{ question, answer },
      "resolvedCategoryFaqs": *[_type == "faq" && category._ref == ^.faqCategory._ref] | order(order asc) { question, answer }
    }
  },
  seo,
  "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    language
  }
}`;

export const CAMP_FOOD_PAGE = `*[_type == "campFoodPage" && camp->slug.current == $slug && (language == $lang || (!defined(language) && $lang == "en"))][0] {
  _id,
  heroTitle,
  ${campRefProjection},
  pageBuilder[] {
    _key, _type, ...,
    "resolvedImageUrl": image.asset->url,
    "resolvedImageAlt": image.asset->altText,
    "resolvedPosterUrl": poster.asset->url,
    "resolvedVideoPosterUrl": videoPoster.asset->url,
    images[] { ..., "resolvedUrl": asset->url, "resolvedAlt": asset->altText },
    meals[] { ..., "resolvedImageUrl": image.asset->url },
    _type == "videoTestimonials" => {
      ...,
      videos[] { ..., "posterImageUrl": posterImage.asset->url },
      "resolvedSet": testimonialSet->{
        heading,
        bunnyLibraryId,
        bunnyPullZone,
        videos[] { ..., "posterImageUrl": posterImage.asset->url }
      }
    },
    _type == "faqSection" => {
      ...,
      "resolvedFaqs": faqRefs[]->{ question, answer },
      "resolvedCategoryFaqs": *[_type == "faq" && category._ref == ^.faqCategory._ref] | order(order asc) { question, answer }
    }
  },
  seo,
  "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    language
  }
}`;

export const SITE_SETTINGS = `*[_type == "siteSettings" && _id == "siteSettings"][0] {
  title,
  description,
  navigation,
  stats,
  socialLinks,
  contact,
  "ogImage": ogImage.asset->url
}`;

export const ALL_BLOG_POSTS = `*[_type == "blogPost" && (language == $lang || (!defined(language) && $lang == "en"))] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "featuredImage": featuredImage.asset->url,
  publishedAt,
  "categories": categories[]->{ name, "slug": slug.current }
}`;

export const BLOG_POSTS_BY_CATEGORY = `*[_type == "blogPost" && (language == $lang || (!defined(language) && $lang == "en")) && $categorySlug in categories[]->slug.current] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "featuredImage": featuredImage.asset->url,
  publishedAt,
  "categories": categories[]->{ name, "slug": slug.current }
}`;

export const ALL_BLOG_CATEGORIES = `*[_type == "blogCategory"] | order(name asc) {
  _id,
  name,
  "slug": slug.current
}`;

export const PAGE_BY_SLUG = `*[_type == "page" && slug.current == $slug && (language == $lang || (!defined(language) && $lang == "en"))][0] {
  _id,
  title,
  "slug": slug.current,
  lastUpdated,
  body,
  seo
}`;

export const HOMEPAGE = `*[_type == "homepage" && (language == $lang || (!defined(language) && $lang == "en"))][0] {
  _id,
  title,
  description,
  heroTagline,
  heroTitle,
  heroSubtitle,
  aboutHeading,
  aboutSubtext,
  aboutLinkText,
  destinationHeading,
  stats,
  "featuredDestinations": featuredDestinations[]->{
    _id,
    name,
    "slug": "/surfcamp/" + country->slug.current + "/" + slug.current,
    "image": image.asset->url,
    location,
    "country": country->name
  },
  pageBuilder[] {
    _key, _type, ...,
    "resolvedImageUrl": image.asset->url,
    "resolvedImageAlt": image.asset->altText,
    "resolvedPosterUrl": poster.asset->url,
    "resolvedVideoPosterUrl": videoPoster.asset->url,
    images[] {
      ...,
      "resolvedUrl": asset->url,
      "resolvedAlt": asset->altText
    },
    _type == "videoTestimonials" => {
      ...,
      videos[] { ..., "posterImageUrl": posterImage.asset->url },
      "resolvedSet": testimonialSet->{
        heading,
        bunnyLibraryId,
        bunnyPullZone,
        videos[] { ..., "posterImageUrl": posterImage.asset->url }
      }
    },
    _type == "faqSection" => {
      ...,
      "resolvedFaqs": faqRefs[]->{ question, answer },
      "resolvedCategoryFaqs": *[_type == "faq" && category._ref == ^.faqCategory._ref] | order(order asc) { question, answer }
    }
  },
  seo,
  "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    language
  }
}`;

export const LINKIN_BIO = `*[_type == "linkinBio" && (language == $lang || (!defined(language) && $lang == "en"))][0] {
  _id,
  profileName,
  profileTagline,
  ctaText,
  ctaUrl,
  updates,
  blogPosts,
  extraLinks
}`;

export const FAQ_CATEGORIES = `*[_type == "faqCategory" && (language == $lang || (!defined(language) && $lang == "en"))] | order(order asc) {
  _id,
  name,
  "slug": slug.current,
  order
}`;

export const FAQS_BY_CAMP = `*[_type == "faq" && (
  $campRef in camps[]._ref || count(camps) == 0
) && (language == $lang || (!defined(language) && $lang == "en"))] | order(category->order asc, order asc) {
  question,
  answer,
  "categoryName": category->name,
  "categoryOrder": category->order
}`;

export const BLOG_POST_BY_SLUG = `*[_type == "blogPost" && slug.current == $slug && (language == $lang || (!defined(language) && $lang == "en"))][0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  featuredImage,
  "featuredImageUrl": featuredImage.asset->url,
  body[] {
    ...,
    _type == "image" => {
      ...,
      "url": asset->url,
      "altText": asset->altText
    },
    _type in ["imageGrid", "imageCarousel", "imageGallery", "contentBlockGrid"] => {
      ...,
      images[] { ..., "resolvedUrl": asset->url, "resolvedAlt": asset->altText }
    },
    _type in ["imageBreak", "contentBlock", "featureBlock"] => {
      ...,
      "resolvedImageUrl": image.asset->url,
      "resolvedImageAlt": image.asset->altText
    },
    _type == "videoBlock" => {
      ...,
      "resolvedPosterUrl": poster.asset->url
    },
    _type == "contentBlockVideo" => {
      ...,
      "resolvedVideoPosterUrl": videoPoster.asset->url
    },
    _type == "ctaSection" => {
      ...,
      "resolvedImageUrl": image.asset->url
    }
  },
  publishedAt,
  tags,
  "categories": categories[]->{ name, "slug": slug.current },
  seo,
  "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    "slug": slug.current,
    language
  }
}`;

// --- Popups ---

export const ACTIVE_POPUPS = `*[_type == "popup" && enabled == true] | order(priority desc) {
  _id,
  internalName,
  popupType,
  priority,
  language,
  triggerMode,
  delaySeconds,
  targetMode,
  urlPatterns,
  urlContains,
  "targetCampSlugs": targetCamps[]->slug.current,
  excludePatterns,
  startDate,
  endDate,
  headline,
  body,
  ctaText,
  ctaHref,
  voucherCode,
  "offerImageUrl": offerImage.asset->url,
  expiresAt,
  wheelHeadline,
  wheelSubheadline,
  segments,
  zohoListKey,
  zohoSource
}`;
