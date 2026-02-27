import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "roomInclusions",
  title: "Room Inclusions",
  type: "object",
  fieldsets: [blockLayoutFieldset],
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
            defineField({
              name: "icon",
              title: "Icon",
              type: "image",
              description: "SVG icon from the media library.",
              options: { accept: "image/svg+xml,image/*" },
            }),
          ],
          preview: {
            select: { title: "item", media: "icon" },
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
    ...blockLayoutFields,
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Inclusions", subtitle: "Inclusions" };
    },
  },
});
