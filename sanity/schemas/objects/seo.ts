import { defineType, defineField } from "sanity";

export default defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "string",
      description: "Override the page title for search results.",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "ogImage",
      title: "Open Graph Image",
      type: "image",
      description: "Custom social sharing image. Falls back to first hero image.",
    }),
    defineField({
      name: "noindex",
      title: "No Index",
      type: "boolean",
      description: "Prevent this page from being indexed by search engines.",
      initialValue: false,
    }),
  ],
});
