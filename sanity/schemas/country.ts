import { defineType, defineField } from "sanity";

export default defineType({
  name: "country",
  title: "Country",
  type: "document",
  fields: [
    defineField({
      name: "language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "flag",
      title: "Flag Emoji",
      type: "string",
    }),
    defineField({
      name: "heroImages",
      title: "Hero Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      description:
        'Override the hero headline. Defaults to "Surf Camps\\nin {Country}". Use \\n for line breaks.',
    }),
    defineField({
      name: "heroTagline",
      title: "Hero Tagline",
      type: "string",
      description: "Override the tagline shown above the hero headline.",
    }),
    defineField({
      name: "description",
      title: "Short Description",
      type: "text",
      rows: 3,
      description:
        "Brief page description. Used as fallback meta description if the SEO section below is empty.",
    }),
    defineField({
      name: "comparison",
      title: "Camp Comparison",
      type: "object",
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
        defineField({
          name: "features",
          title: "Feature Labels",
          type: "array",
          of: [{ type: "string" }],
          description: "Row labels for the comparison table (e.g. Vibe, Best For, Pool).",
        }),
        defineField({
          name: "camps",
          title: "Camps",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "camp",
                  title: "Camp",
                  type: "reference",
                  to: [{ type: "camp" }],
                  options: { filter: 'language == "en" || !defined(language)' },
                  validation: (r) => r.required(),
                }),
                defineField({
                  name: "values",
                  title: "Feature Values",
                  type: "array",
                  of: [{ type: "string" }],
                  description: "One value per feature label, in the same order.",
                }),
              ],
              preview: {
                select: { title: "camp.name" },
                prepare({ title }) {
                  return { title: title || "Camp" };
                },
              },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "pageBuilder",
      title: "Page Content",
      type: "array",
      of: [
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
        { type: "surfSpots" },
        { type: "surfSeasons" },
        { type: "climateInfo" },
        { type: "featureBlock" },
        { type: "elfsightReviews" },
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
      title: "name",
      subtitle: "flag",
    },
    prepare({ title, subtitle }) {
      return { title: `${subtitle || ""} ${title}`.trim() };
    },
  },
});
