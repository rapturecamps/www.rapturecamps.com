import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "inclusionsGrid",
  title: "Inclusions Grid",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "What's Included",
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({
              name: "iconImage",
              title: "Icon",
              type: "image",
              description: "SVG icon from the media library.",
              options: { accept: "image/svg+xml,image/*" },
            }),
            defineField({
              name: "icon",
              title: "Icon Path (legacy)",
              type: "string",
              description: "SVG path data — used as fallback if no icon image is set.",
              hidden: ({ parent }: any) => !!parent?.iconImage,
            }),
          ],
          preview: { select: { title: "label", media: "iconImage" } },
        },
      ],
    }),
    ...blockLayoutFields,
  ],
  preview: {
    select: { title: "heading", items: "items" },
    prepare({ title, items }) {
      return {
        title: title || "Inclusions",
        subtitle: `${items?.length || 0} items`,
      };
    },
  },
});
