import { defineType, defineField } from "sanity";

export default defineType({
  name: "campSurfPage",
  title: "Camp Surf Page",
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
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      description: 'Override the hero headline. Defaults to "Surf".',
    }),
    defineField({
      name: "pageBuilder",
      title: "Surf Page Content",
      type: "array",
      of: [
        { type: "surfIntro" },
        { type: "surfForecast" },
        { type: "surfSpots" },
        { type: "surfLevels" },
        { type: "surfSchedule" },
        { type: "surfEquipment" },
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
        title: `Surf – ${campName || "Unknown Camp"}`,
        subtitle: language ? language.toUpperCase() : "EN",
      };
    },
  },
});
