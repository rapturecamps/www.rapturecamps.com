import camp from "./camp";
import country from "./country";
import blogPost from "./blogPost";
import blogCategory from "./blogCategory";
import faq from "./faq";
import siteSettings from "./siteSettings";

import contentBlock from "./blocks/contentBlock";
import imageGrid from "./blocks/imageGrid";
import imageBreak from "./blocks/imageBreak";
import imageCarousel from "./blocks/imageCarousel";
import videoBlock from "./blocks/videoBlock";
import videoTestimonials from "./blocks/videoTestimonials";
import highlightsGrid from "./blocks/highlightsGrid";
import inclusionsGrid from "./blocks/inclusionsGrid";
import faqSection from "./blocks/faqSection";
import ctaSection from "./blocks/ctaSection";
import surfSpots from "./blocks/surfSpots";

import seo from "./objects/seo";
import surfPage from "./objects/surfPage";
import roomsPage from "./objects/roomsPage";
import foodPage from "./objects/foodPage";

export const schemaTypes = [
  // Documents
  camp,
  country,
  blogPost,
  blogCategory,
  faq,
  siteSettings,

  // Page builder blocks
  contentBlock,
  imageGrid,
  imageBreak,
  imageCarousel,
  videoBlock,
  videoTestimonials,
  highlightsGrid,
  inclusionsGrid,
  faqSection,
  ctaSection,
  surfSpots,

  // Objects
  seo,
  surfPage,
  roomsPage,
  foodPage,
];
