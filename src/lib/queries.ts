/**
 * Centralized GROQ queries for fetching Sanity data.
 * Queries that fetch camps/countries accept a $lang parameter (defaults to "en").
 */

export const COUNTRY_SLUGS = `*[_type == "country" && (language == $lang || (!defined(language) && $lang == "en"))]{ "slug": slug.current }`;

export const ALL_COUNTRIES = `*[_type == "country" && (language == $lang || (!defined(language) && $lang == "en"))] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  flag,
  "cardImage": heroImages[0].asset->url
}`;

export const COUNTRY_BY_SLUG = `*[_type == "country" && slug.current == $slug && (language == $lang || (!defined(language) && $lang == "en"))][0] {
  _id,
  name,
  "slug": slug.current,
  flag,
  description,
  comparison {
    heading,
    subtitle,
    features,
    camps[] {
      values,
      "campSlug": camp->slug.current,
      "campName": camp->name,
      "campImage": camp->image.asset->url,
      "campLocation": camp->location,
      "campTagline": camp->tagline,
      "campRating": camp->rating,
      "campReviewCount": camp->reviewCount,
      "campAmenities": camp->amenities,
      "campBookingUrl": camp->bookingUrl
    }
  },
  pageBuilder[] {
    ...,
    _type in ["imageGrid", "imageCarousel", "imageGallery", "contentBlockGrid", "contentBlockImageCarousel"] => {
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
    _type == "cardGrid" => {
      ...,
      cards[] { ..., "resolvedImageUrl": image.asset->url }
    },
    _type == "inclusionsGrid" => {
      ...,
      items[] { ..., "resolvedIconImageUrl": iconImage.asset->url }
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
      "resolvedFaqs": faqRefs[] {
        "faqId": coalesce(
          *[_type == "translation.metadata" && ^._ref in translations[].value._ref][0]
            .translations[_key == $lang][0].value._ref,
          _ref
        )
      }{ "question": *[_id == ^.faqId][0].question, "answer": *[_id == ^.faqId][0].answer },
      "resolvedCategoryFaqs": *[_type == "faq" && category._ref == ^.faqCategory._ref && (language == $lang || (!defined(language) && $lang == "en"))] | order(order asc) { question, answer }
    }
  },
  "heroImages": heroImages[].asset->url,
  heroTitle,
  heroTagline,
  useHeroAsH1,
  seoH1,
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
  introHeading,
  introHeadingLevel,
  introVideoId,
  introBody,
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
    cards[] { ..., "resolvedImageUrl": image.asset->url },
    _type == "inclusionsGrid" => {
      ...,
      items[] { ..., "resolvedIconImageUrl": iconImage.asset->url }
    },
    _type == "roomInclusions" => {
      ...,
      inclusions[] { ..., "resolvedIconUrl": icon.asset->url }
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
      "resolvedFaqs": faqRefs[] {
        "faqId": coalesce(
          *[_type == "translation.metadata" && ^._ref in translations[].value._ref][0]
            .translations[_key == $lang][0].value._ref,
          _ref
        )
      }{ "question": *[_id == ^.faqId][0].question, "answer": *[_id == ^.faqId][0].answer },
      "resolvedCategoryFaqs": *[_type == "faq" && category._ref == ^.faqCategory._ref && (language == $lang || (!defined(language) && $lang == "en"))] | order(order asc) { question, answer }
    },
    _type == "campSubPages" => {
      ...,
      "surfCard": { ...surfCard, "imageUrl": surfCard.image.asset->url },
      "roomsCard": { ...roomsCard, "imageUrl": roomsCard.image.asset->url },
      "foodCard": { ...foodCard, "imageUrl": foodCard.image.asset->url }
    }
  },
  "relatedBlogPosts": relatedBlogPosts[]->{ _id, title, "slug": slug.current, excerpt, "featuredImage": featuredImage.asset->url, publishedAt, "categories": categories[]->{ name, "slug": slug.current } },
  seo { ..., "ogImageUrl": ogImage.asset->url },
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
  "campHeroImages": camp->heroImages[].asset->url,
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
  "heroImages": heroImages[].asset->url,
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
    cards[] { ..., "resolvedImageUrl": image.asset->url },
    _type == "inclusionsGrid" => {
      ...,
      items[] { ..., "resolvedIconImageUrl": iconImage.asset->url }
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
      "resolvedFaqs": faqRefs[] {
        "faqId": coalesce(
          *[_type == "translation.metadata" && ^._ref in translations[].value._ref][0]
            .translations[_key == $lang][0].value._ref,
          _ref
        )
      }{ "question": *[_id == ^.faqId][0].question, "answer": *[_id == ^.faqId][0].answer },
      "resolvedCategoryFaqs": *[_type == "faq" && category._ref == ^.faqCategory._ref && (language == $lang || (!defined(language) && $lang == "en"))] | order(order asc) { question, answer }
    }
  },
  "relatedBlogPosts": relatedBlogPosts[]->{ _id, title, "slug": slug.current, excerpt, "featuredImage": featuredImage.asset->url, publishedAt, "categories": categories[]->{ name, "slug": slug.current } },
  seo { ..., "ogImageUrl": ogImage.asset->url },
  "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    language
  }
}`;

export const CAMP_ROOMS_PAGE = `*[_type == "campRoomsPage" && camp->slug.current == $slug && (language == $lang || (!defined(language) && $lang == "en"))][0] {
  _id,
  "heroImages": heroImages[].asset->url,
  heroTitle,
  ${campRefProjection},
  pageBuilder[] {
    _key, _type, ...,
    "resolvedImageUrl": image.asset->url,
    "resolvedImageAlt": image.asset->altText,
    "resolvedPosterUrl": poster.asset->url,
    "resolvedVideoPosterUrl": videoPoster.asset->url,
    images[] { ..., "resolvedUrl": asset->url, "resolvedAlt": asset->altText },
    rooms[] {
      ...,
      "resolvedImageUrl": image.asset->url,
      media[] {
        ...,
        _type == "mediaImage" => { ..., "resolvedUrl": image.asset->url },
        _type == "mediaVideo" => { ..., "resolvedPosterUrl": poster.asset->url }
      }
    },
    cards[] { ..., "resolvedImageUrl": image.asset->url },
    _type == "roomInclusions" => {
      ...,
      inclusions[] { ..., "resolvedIconUrl": icon.asset->url }
    },
    _type == "inclusionsGrid" => {
      ...,
      items[] { ..., "resolvedIconImageUrl": iconImage.asset->url }
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
      "resolvedFaqs": faqRefs[] {
        "faqId": coalesce(
          *[_type == "translation.metadata" && ^._ref in translations[].value._ref][0]
            .translations[_key == $lang][0].value._ref,
          _ref
        )
      }{ "question": *[_id == ^.faqId][0].question, "answer": *[_id == ^.faqId][0].answer },
      "resolvedCategoryFaqs": *[_type == "faq" && category._ref == ^.faqCategory._ref && (language == $lang || (!defined(language) && $lang == "en"))] | order(order asc) { question, answer }
    }
  },
  "relatedBlogPosts": relatedBlogPosts[]->{ _id, title, "slug": slug.current, excerpt, "featuredImage": featuredImage.asset->url, publishedAt, "categories": categories[]->{ name, "slug": slug.current } },
  seo { ..., "ogImageUrl": ogImage.asset->url },
  "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    language
  }
}`;

export const CAMP_FOOD_PAGE = `*[_type == "campFoodPage" && camp->slug.current == $slug && (language == $lang || (!defined(language) && $lang == "en"))][0] {
  _id,
  "heroImages": heroImages[].asset->url,
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
    cards[] { ..., "resolvedImageUrl": image.asset->url },
    _type == "inclusionsGrid" => {
      ...,
      items[] { ..., "resolvedIconImageUrl": iconImage.asset->url }
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
      "resolvedFaqs": faqRefs[] {
        "faqId": coalesce(
          *[_type == "translation.metadata" && ^._ref in translations[].value._ref][0]
            .translations[_key == $lang][0].value._ref,
          _ref
        )
      }{ "question": *[_id == ^.faqId][0].question, "answer": *[_id == ^.faqId][0].answer },
      "resolvedCategoryFaqs": *[_type == "faq" && category._ref == ^.faqCategory._ref && (language == $lang || (!defined(language) && $lang == "en"))] | order(order asc) { question, answer }
    }
  },
  "relatedBlogPosts": relatedBlogPosts[]->{ _id, title, "slug": slug.current, excerpt, "featuredImage": featuredImage.asset->url, publishedAt, "categories": categories[]->{ name, "slug": slug.current } },
  seo { ..., "ogImageUrl": ogImage.asset->url },
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
  "categories": categories[]->{ name, "slug": slug.current },
  "silo": silo->name,
  "hub": hub->name
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
  "heroImages": heroImages[].asset->url,
  heroTitle,
  heroSubtitle,
  heroTagline,
  useHeroAsH1,
  seoH1,
  pageBuilder[] {
    _key, _type, ...,
    "resolvedImageUrl": image.asset->url,
    "resolvedImageAlt": image.asset->altText,
    "resolvedPosterUrl": poster.asset->url,
    "resolvedVideoPosterUrl": videoPoster.asset->url,
    images[] { ..., "resolvedUrl": asset->url, "resolvedAlt": asset->altText },
    cards[] { ..., "resolvedImageUrl": image.asset->url },
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
    _type == "inclusionsGrid" => {
      ...,
      inclusions[] { ..., "resolvedIconUrl": icon.asset->url }
    },
    _type == "highlightsGrid" => {
      ...,
      items[] { ..., "resolvedIconImageUrl": iconImage.asset->url }
    },
  },
  "seoOgImageUrl": seo.ogImage.asset->url,
  seo
}`;

export const HOMEPAGE = `*[_type == "homepage" && (language == $lang || (!defined(language) && $lang == "en"))][0] {
  _id,
  title,
  description,
  heroTagline,
  heroTitle,
  heroSubtitle,
  useHeroAsH1,
  seoH1,
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
    "country": country->name,
    rating,
    reviewCount
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
    cards[] { ..., "resolvedImageUrl": image.asset->url },
    _type == "inclusionsGrid" => {
      ...,
      items[] { ..., "resolvedIconImageUrl": iconImage.asset->url }
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
      "resolvedFaqs": faqRefs[] {
        "faqId": coalesce(
          *[_type == "translation.metadata" && ^._ref in translations[].value._ref][0]
            .translations[_key == $lang][0].value._ref,
          _ref
        )
      }{ "question": *[_id == ^.faqId][0].question, "answer": *[_id == ^.faqId][0].answer },
      "resolvedCategoryFaqs": *[_type == "faq" && category._ref == ^.faqCategory._ref && (language == $lang || (!defined(language) && $lang == "en"))] | order(order asc) { question, answer }
    }
  },
  seo { ..., "ogImageUrl": ogImage.asset->url },
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
  "faqBlocks": body[_type == "block"] { style, "text": pt::text(@) },
  body[] {
    ...,
    _type == "image" => {
      ...,
      "url": asset->url,
      "altText": asset->altText
    },
    _type in ["imageGrid", "imageCarousel", "imageGallery", "contentBlockGrid", "contentBlockImageCarousel"] => {
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
    _type == "cardGrid" => {
      ...,
      cards[] { ..., "resolvedImageUrl": image.asset->url }
    },
    _type == "inclusionsGrid" => {
      ...,
      items[] { ..., "resolvedIconImageUrl": iconImage.asset->url }
    },
    _type == "ctaSection" => {
      ...,
      "resolvedImageUrl": image.asset->url
    }
  },
  publishedAt,
  authorName,
  authorUrl,
  tags,
  "categories": categories[]->{ name, "slug": slug.current },
  "silo": silo->name,
  "siloSlug": silo->slug.current,
  "siloIsCountry": silo->isCountry,
  "hub": hub->name,
  "hubSlug": hub->slug.current,
  seo { ..., "ogImageUrl": ogImage.asset->url },
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

export const BLOG_POSTS_BY_SILO = `*[_type == "blogPost" && silo->name == $siloName && (language == $lang || (!defined(language) && $lang == "en"))] | order(publishedAt desc) [0...$limit] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "featuredImage": featuredImage.asset->url,
  publishedAt,
  "categories": categories[]->{ name, "slug": slug.current },
  "silo": silo->name,
  "hub": hub->name
}`;

export const BLOG_POSTS_BY_HUB = `*[_type == "blogPost" && hub->name == $hubName && (language == $lang || (!defined(language) && $lang == "en")) && _id != $excludeId] | order(publishedAt desc) [0...$limit] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "featuredImage": featuredImage.asset->url,
  publishedAt,
  "categories": categories[]->{ name, "slug": slug.current },
  "silo": silo->name,
  "hub": hub->name
}`;

// ─── Learn to Surf ──────────────────────────────────────────────────────────

const learnToSurfBlockProjection = `
  _key, _type, ...,
  "resolvedImageUrl": image.asset->url,
  "resolvedImageAlt": image.asset->altText,
  "resolvedPosterUrl": poster.asset->url,
  "resolvedVideoPosterUrl": videoPoster.asset->url,
  images[] { ..., "resolvedUrl": asset->url, "resolvedAlt": asset->altText },
  cards[] { ..., "resolvedImageUrl": image.asset->url },
  _type == "lessonStep" => {
    ...,
    steps[] { ..., "resolvedImageUrl": image.asset->url }
  },
  _type == "surfExercise" => {
    ...,
    "resolvedImageUrl": image.asset->url
  },
  _type == "surfMistake" => {
    ...,
    mistakes[] { ..., "resolvedImageUrl": image.asset->url }
  },
  _type == "inclusionsGrid" => {
    ...,
    items[] { ..., "resolvedIconImageUrl": iconImage.asset->url }
  },
  _type == "videoTestimonials" => {
    ...,
    videos[] { ..., "posterImageUrl": posterImage.asset->url },
    "resolvedSet": testimonialSet->{
      heading, bunnyLibraryId, bunnyPullZone,
      videos[] { ..., "posterImageUrl": posterImage.asset->url }
    }
  },
  _type == "faqSection" => {
    ...,
    "resolvedFaqs": faqRefs[] {
      "faqId": coalesce(
        *[_type == "translation.metadata" && ^._ref in translations[].value._ref][0]
          .translations[_key == $lang][0].value._ref,
        _ref
      )
    }{ "question": *[_id == ^.faqId][0].question, "answer": *[_id == ^.faqId][0].answer },
    "resolvedCategoryFaqs": *[_type == "faq" && category._ref == ^.faqCategory._ref && (language == $lang || (!defined(language) && $lang == "en"))] | order(order asc) { question, answer }
  }
`;

export const ALL_LEARN_CLUSTERS = `*[_type == "learnToSurfCluster" && (language == $lang || (!defined(language) && $lang == "en"))] | order(order asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  icon,
  order,
  lmsCourseUrl,
  "featuredImageUrl": featuredImage.asset->url,
  seo
}`;

export const LEARN_CLUSTER_BY_SLUG = `*[_type == "learnToSurfCluster" && slug.current == $slug && (language == $lang || (!defined(language) && $lang == "en"))][0] {
  _id,
  title,
  "slug": slug.current,
  description,
  icon,
  order,
  heroTitle,
  heroSubtitle,
  heroTagline,
  "heroImageUrl": heroImage.asset->url,
  lmsCourseUrl,
  "featuredImageUrl": featuredImage.asset->url,
  pageBuilder[] { ${learnToSurfBlockProjection} },
  seo { ..., "ogImageUrl": ogImage.asset->url },
  "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    "slug": slug.current,
    language
  }
}`;

export const ALL_LEARN_LESSONS = `*[_type == "learnToSurfLesson" && (language == $lang || (!defined(language) && $lang == "en"))] | order(order asc) {
  _id,
  title,
  "slug": slug.current,
  "clusterSlug": cluster->slug.current,
  "clusterTitle": cluster->title,
  excerpt,
  difficulty,
  readTime,
  order,
  "featuredImageUrl": featuredImage.asset->url
}`;

export const LEARN_LESSONS_BY_CLUSTER = `*[_type == "learnToSurfLesson" && cluster->slug.current == $clusterSlug && (language == $lang || (!defined(language) && $lang == "en"))] | order(order asc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  difficulty,
  readTime,
  order,
  lmsUrl,
  "featuredImageUrl": featuredImage.asset->url
}`;

export const LEARN_LESSON_BY_SLUG = `*[_type == "learnToSurfLesson" && slug.current == $slug && cluster->slug.current == $clusterSlug && (language == $lang || (!defined(language) && $lang == "en"))][0] {
  _id,
  title,
  "slug": slug.current,
  "clusterSlug": cluster->slug.current,
  "clusterTitle": cluster->title,
  excerpt,
  difficulty,
  readTime,
  keyTakeaways,
  introVideo,
  lmsUrl,
  order,
  "featuredImageUrl": featuredImage.asset->url,
  "prerequisites": prerequisites[]->{
    _id, title, "slug": slug.current,
    "clusterSlug": cluster->slug.current,
    difficulty
  },
  "nextLessons": nextLessons[]->{
    _id, title, "slug": slug.current,
    "clusterSlug": cluster->slug.current,
    difficulty
  },
  body[] {
    ...,
    _type == "image" => {
      ...,
      "url": asset->url,
      "altText": asset->altText
    },
    ${learnToSurfBlockProjection}
  },
  seo { ..., "ogImageUrl": ogImage.asset->url },
  "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    "slug": slug.current,
    language
  }
}`;

export const RELATED_BLOG_POSTS = `{
  "byHub": *[_type == "blogPost" && silo->name == $siloName && hub->name == $hubName && (language == $lang || (!defined(language) && $lang == "en")) && _id != $excludeId] | order(publishedAt desc) [0...$limit] {
    _id, title, "slug": slug.current, excerpt, "featuredImage": featuredImage.asset->url, publishedAt,
    "categories": categories[]->{ name, "slug": slug.current }, "silo": silo->name, "hub": hub->name
  },
  "bySilo": *[_type == "blogPost" && silo->name == $siloName && hub->name != $hubName && (language == $lang || (!defined(language) && $lang == "en")) && _id != $excludeId] | order(publishedAt desc) [0...$limit] {
    _id, title, "slug": slug.current, excerpt, "featuredImage": featuredImage.asset->url, publishedAt,
    "categories": categories[]->{ name, "slug": slug.current }, "silo": silo->name, "hub": hub->name
  }
}`;
