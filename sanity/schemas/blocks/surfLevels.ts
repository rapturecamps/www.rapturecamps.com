import { defineType, defineField } from "sanity";

export default defineType({
  name: "surfLevels",
  title: "Surf Levels",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
    }),
    defineField({
      name: "subtext",
      title: "Subtext",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "levels",
      title: "Levels",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "level", title: "Level", type: "string" }),
            defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
            defineField({
              name: "features",
              title: "Features",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "outcome",
              title: "Outcome",
              type: "text",
              rows: 2,
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "background",
      title: "Background",
      type: "string",
      options: {
        list: [
          { title: "Dark", value: "dark" },
          { title: "Dark Lighter", value: "dark-lighter" },
        ],
      },
      initialValue: "dark",
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Surf Levels", subtitle: "Surf Levels" };
    },
  },
});
