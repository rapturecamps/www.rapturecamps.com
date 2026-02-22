import { defineType, defineField } from "sanity";

export default defineType({
  name: "country",
  title: "Country",
  type: "document",
  fields: [
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
      name: "description",
      title: "Meta Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "intro",
      title: "Intro Text",
      type: "text",
      rows: 4,
      description: "Introductory paragraph shown below the camp cards.",
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
        }),
      ],
    }),
    defineField({
      name: "pageBuilder",
      title: "Page Content",
      type: "array",
      of: [
        { type: "contentBlock" },
        { type: "imageGrid" },
        { type: "imageBreak" },
        { type: "imageCarousel" },
        { type: "videoBlock" },
        { type: "surfSpots" },
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
