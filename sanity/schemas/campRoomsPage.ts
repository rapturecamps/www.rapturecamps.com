import { defineType, defineField } from "sanity";

export default defineType({
  name: "campRoomsPage",
  title: "Camp Rooms Page",
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
      description: 'Override the hero headline. Defaults to "Rooms".',
    }),
    defineField({
      name: "pageBuilder",
      title: "Rooms Page Content",
      type: "array",
      of: [
        { type: "roomTypes" },
        { type: "roomInclusions" },
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
        title: `Rooms – ${campName || "Unknown Camp"}`,
        subtitle: language ? language.toUpperCase() : "EN",
      };
    },
  },
});
