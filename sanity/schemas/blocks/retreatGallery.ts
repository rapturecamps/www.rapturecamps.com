import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "retreatGallery",
  title: "Retreat Gallery",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: 'Small uppercase label, e.g. "The Location"',
    }),
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
      name: "images",
      title: "Gallery Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "label",
              title: "Badge Label",
              type: "string",
              description: 'Blue badge text, e.g. "Infinity Pool"',
            }),
          ],
          preview: {
            select: { title: "label", media: "asset" },
            prepare({ title, media }) {
              return { title: title || "Image", media };
            },
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
    select: { title: "heading", images: "images" },
    prepare({ title, images }) {
      return {
        title: title || "Retreat Gallery",
        subtitle: `${images?.length || 0} images`,
      };
    },
  },
});
