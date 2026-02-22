import { defineType, defineField } from "sanity";

export default defineType({
  name: "roomInclusions",
  title: "Room Inclusions",
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
      name: "inclusions",
      title: "Inclusions",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "item", title: "Item", type: "string" }),
          ],
          preview: {
            select: { title: "item" },
          },
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
      return { title: title || "Inclusions", subtitle: "Inclusions" };
    },
  },
});
