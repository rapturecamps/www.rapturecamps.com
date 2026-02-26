import { defineType, defineField } from "sanity";

export default defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "content", title: "Content" },
    { name: "destinations", title: "Destinations" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Internal title for this document.",
      group: "seo",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      description: "Short site description used in meta tags.",
      group: "seo",
    }),
    defineField({
      name: "heroTagline",
      title: "Hero Tagline",
      type: "string",
      description: "Small text above the main title (e.g. 'Rapture Surfcamps').",
      group: "hero",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      description: "Main hero headline (e.g. 'All you have is now.').",
      group: "hero",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero Subtitle",
      type: "string",
      description: "Text below the title (e.g. 'Unparalleled Surf Camp Experience...').",
      group: "hero",
    }),
    defineField({
      name: "aboutHeading",
      title: "About Heading",
      type: "text",
      rows: 3,
      description: "Large intro paragraph on the homepage.",
      group: "content",
    }),
    defineField({
      name: "aboutSubtext",
      title: "About Subtext",
      type: "string",
      description: "The 'Surf the world and visit us in...' line.",
      group: "content",
    }),
    defineField({
      name: "aboutLinkText",
      title: "About Link Text",
      type: "string",
      description: "Text for the 'Learn more about us' link.",
      group: "content",
    }),
    defineField({
      name: "destinationHeading",
      title: "Destination Section Heading",
      type: "string",
      description: "Heading above the destination cards (e.g. 'Choose Your Destination').",
      group: "destinations",
    }),
    defineField({
      name: "featuredDestinations",
      title: "Featured Destinations",
      type: "array",
      description:
        "Pick which camps appear on the homepage and in what order. Leave empty to show all camps.",
      of: [
        {
          type: "reference",
          to: [{ type: "camp" }],
        },
      ],
      group: "destinations",
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      description: "Key numbers displayed in the stats bar (e.g. Established 2003, 80k+ Happy Customers).",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              description: 'e.g. "Happy Customers", "Destinations"',
            }),
            defineField({
              name: "value",
              title: "Display Value",
              type: "string",
              description: 'The value shown on the page, e.g. "2003", "80k+", "23"',
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "value" },
          },
        },
      ],
      group: "content",
    }),
    defineField({
      name: "pageBuilder",
      title: "Page Blocks",
      type: "array",
      description: "Add content blocks below the main sections.",
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
        { type: "featureBlock" },
        { type: "faqSection" },
        { type: "ctaSection" },
      ],
      group: "content",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Homepage" };
    },
  },
});
