/**
 * Centralized GROQ queries for fetching Sanity data.
 */

export const COUNTRY_SLUGS = `*[_type == "country"]{ "slug": slug.current }`;

export const ALL_COUNTRIES = `*[_type == "country"] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  flag
}`;

export const COUNTRY_BY_SLUG = `*[_type == "country" && slug.current == $slug][0] {
  _id,
  name,
  "slug": slug.current,
  flag,
  description,
  intro,
  comparison,
  pageBuilder,
  heroImages,
  seo
}`;

export const ALL_CAMPS = `*[_type == "camp"] | order(name asc) {
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

export const CAMPS_BY_COUNTRY = `*[_type == "camp" && country->slug.current == $countrySlug] | order(name asc) {
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

export const CAMP_BY_SLUG = `*[_type == "camp" && slug.current == $slug][0] {
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
  surfPageBuilder[] {
    _key, _type, ...,
    "resolvedImageUrl": image.asset->url,
    surfSpots[] { ..., "resolvedImageUrl": image.asset->url }
  },
  roomsPageBuilder[] {
    _key, _type, ...,
    "resolvedImageUrl": image.asset->url,
    rooms[] { ..., "resolvedImageUrl": image.asset->url }
  },
  foodPageBuilder[] {
    _key, _type, ...,
    "resolvedImageUrl": image.asset->url,
    meals[] { ..., "resolvedImageUrl": image.asset->url }
  },
  seo
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

export const ALL_BLOG_POSTS = `*[_type == "blogPost"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "featuredImage": featuredImage.asset->url,
  publishedAt,
  "categories": categories[]->{ name, "slug": slug.current }
}`;

export const BLOG_POST_BY_SLUG = `*[_type == "blogPost" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "featuredImage": featuredImage.asset->url,
  body,
  publishedAt,
  tags,
  "categories": categories[]->{ name, "slug": slug.current },
  seo
}`;
