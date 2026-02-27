import camp from "./camp";
import campSurfPage from "./campSurfPage";
import campRoomsPage from "./campRoomsPage";
import campFoodPage from "./campFoodPage";
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
import popup from "./popup";
import videoTestimonialSet from "./videoTestimonialSet";

import contentBlock from "./blocks/contentBlock";
import contentBlockGrid from "./blocks/contentBlockGrid";
import contentBlockVideo from "./blocks/contentBlockVideo";
import contentBlockImageCarousel from "./blocks/contentBlockImageCarousel";
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
import surfSeasons from "./blocks/surfSeasons";
import climateInfo from "./blocks/climateInfo";
import foodIntro from "./blocks/foodIntro";
import mealCards from "./blocks/mealCards";
import menuTable from "./blocks/menuTable";
import dietaryOptions from "./blocks/dietaryOptions";
import roomTypes from "./blocks/roomTypes";
import roomInclusions from "./blocks/roomInclusions";
import imageGallery from "./blocks/imageGallery";
import featureBlock from "./blocks/featureBlock";
import elfsightReviews from "./blocks/elfsightReviews";
import campSubPages from "./blocks/campSubPages";

import seo from "./objects/seo";

export const schemaTypes = [
  // Documents
  camp,
  campSurfPage,
  campRoomsPage,
  campFoodPage,
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
  popup,
  videoTestimonialSet,

  // Page builder blocks — shared
  contentBlock,
  contentBlockGrid,
  contentBlockVideo,
  contentBlockImageCarousel,
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
  featureBlock,
  elfsightReviews,
  campSubPages,

  // Page builder blocks — surf
  surfIntro,
  surfSpots,
  surfForecast,
  surfLevels,
  surfSchedule,
  surfEquipment,
  surfSeasons,
  climateInfo,

  // Page builder blocks — food
  foodIntro,
  mealCards,
  menuTable,
  dietaryOptions,

  // Page builder blocks — rooms
  roomTypes,
  roomInclusions,

  // Objects
  seo,
];
