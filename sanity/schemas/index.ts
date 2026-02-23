import camp from "./camp";
import country from "./country";
import blogPost from "./blogPost";
import blogCategory from "./blogCategory";
import faq from "./faq";
import faqCategory from "./faqCategory";
import page from "./page";
import homepage from "./homepage";
import linkinBio from "./linkinBio";
import siteSettings from "./siteSettings";
import redirect from "./redirect";

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
import surfIntro from "./blocks/surfIntro";
import surfForecast from "./blocks/surfForecast";
import surfLevels from "./blocks/surfLevels";
import surfSchedule from "./blocks/surfSchedule";
import surfEquipment from "./blocks/surfEquipment";
import foodIntro from "./blocks/foodIntro";
import mealCards from "./blocks/mealCards";
import menuTable from "./blocks/menuTable";
import dietaryOptions from "./blocks/dietaryOptions";
import roomTypes from "./blocks/roomTypes";
import roomInclusions from "./blocks/roomInclusions";
import roomFacilities from "./blocks/roomFacilities";
import imageGallery from "./blocks/imageGallery";

import seo from "./objects/seo";

export const schemaTypes = [
  // Documents
  camp,
  country,
  blogPost,
  blogCategory,
  faq,
  faqCategory,
  page,
  homepage,
  linkinBio,
  siteSettings,
  redirect,

  // Page builder blocks — shared
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
  imageGallery,

  // Page builder blocks — surf
  surfIntro,
  surfSpots,
  surfForecast,
  surfLevels,
  surfSchedule,
  surfEquipment,

  // Page builder blocks — food
  foodIntro,
  mealCards,
  menuTable,
  dietaryOptions,

  // Page builder blocks — rooms
  roomTypes,
  roomInclusions,
  roomFacilities,

  // Objects
  seo,
];
