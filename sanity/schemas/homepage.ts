import { defineType, defineField } from "sanity";

export default defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "heroTagline",
      title: "Hero Tagline",
      type: "string",
      description: "Small text above the main title (e.g. 'Rapture Surfcamps').",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      description: "Main hero headline (e.g. 'All you have is now.').",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero Subtitle",
      type: "string",
      description: "Text below the title (e.g. 'Unparalleled Surf Camp Experience...').",
    }),
    defineField({
      name: "aboutHeading",
      title: "About Heading",
      type: "text",
      rows: 3,
      description: "Large intro paragraph on the homepage.",
    }),
    defineField({
      name: "aboutSubtext",
      title: "About Subtext",
      type: "string",
      description: "The 'Surf the world and visit us in...' line.",
    }),
    defineField({
      name: "aboutLinkText",
      title: "About Link Text",
      type: "string",
      description: "Text for the 'Learn more about us' link.",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Homepage" };
    },
  },
});
