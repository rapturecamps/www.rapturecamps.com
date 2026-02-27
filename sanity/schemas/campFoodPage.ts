import { defineType, defineField } from "sanity";

export default defineType({
  name: "campFoodPage",
  title: "Camp Food Page",
  type: "document",
  fields: [
    defineField({
      name: "language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "camp",
      title: "Camp",
      type: "reference",
      to: [{ type: "camp" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heroImages",
      title: "Hero Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description:
        "Background images for the hero section. Falls back to the camp's hero images if empty.",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      description: 'Override the hero headline. Defaults to "Food".',
    }),
    defineField({
      name: "pageBuilder",
      title: "Food Page Content",
      type: "array",
      of: [
        { type: "foodIntro" },
        { type: "mealCards" },
        { type: "menuTable" },
        { type: "dietaryOptions" },
        { type: "contentBlock" },
        { type: "contentBlockGrid" },
        { type: "contentBlockVideo" },
        { type: "contentBlockImageCarousel" },
        { type: "imageGrid" },
        { type: "imageBreak" },
        { type: "imageCarousel" },
        { type: "imageGallery" },
        { type: "videoBlock" },
        { type: "videoTestimonials" },
        { type: "highlightsGrid" },
        { type: "inclusionsGrid" },
        { type: "featureBlock" },
        { type: "faqSection" },
        { type: "ctaSection" },
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  preview: {
    select: {
      campName: "camp.name",
      language: "language",
    },
    prepare({ campName, language }) {
      return {
        title: `Food – ${campName || "Unknown Camp"}`,
        subtitle: language ? language.toUpperCase() : "EN",
      };
    },
  },
});
