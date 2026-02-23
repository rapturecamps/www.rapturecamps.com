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
  pageBuilder,
  heroImages,
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
  heroImages,
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
  heroImages,
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
  rating,
  reviewCount,
  amenities,
  bookingUrl,
  latitude,
  longitude,
  elfsightId,
  heroImages,
  heroTitle,
  heroSubtitle,
  heroTagline,
  surfHeroTitle,
  roomsHeroTitle,
  foodHeroTitle,
  "image": image.asset->url,
  pageBuilder[] {
    _key, _type, ...,
    "resolvedImageUrl": image.asset->url,
    "resolvedPosterUrl": poster.asset->url,
    images[] {
      ...,
      "resolvedUrl": asset->url
    }
  },
  surfPageBuilder[] {
    _key, _type, ...,
    "resolvedImageUrl": image.asset->url,
    "resolvedPosterUrl": poster.asset->url,
    images[] { ..., "resolvedUrl": asset->url },
    surfSpots[] { ..., "resolvedImageUrl": image.asset->url }
  },
  roomsPageBuilder[] {
    _key, _type, ...,
    "resolvedImageUrl": image.asset->url,
    "resolvedPosterUrl": poster.asset->url,
    images[] { ..., "resolvedUrl": asset->url },
    rooms[] { ..., "resolvedImageUrl": image.asset->url }
  },
  foodPageBuilder[] {
    _key, _type, ...,
    "resolvedImageUrl": image.asset->url,
    "resolvedPosterUrl": poster.asset->url,
    images[] { ..., "resolvedUrl": asset->url },
    meals[] { ..., "resolvedImageUrl": image.asset->url }
  },
  seo,
  "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    "slug": slug.current,
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
  heroTagline,
  heroTitle,
  heroSubtitle,
  aboutHeading,
  aboutSubtext,
  aboutLinkText,
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
    _type in ["imageGrid", "imageCarousel", "imageGallery"] => {
      ...,
      images[] { ..., "resolvedUrl": asset->url }
    },
    _type in ["imageBreak", "contentBlock"] => {
      ...,
      "resolvedImageUrl": image.asset->url
    },
    _type == "videoBlock" => {
      ...,
      "resolvedPosterUrl": poster.asset->url
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
