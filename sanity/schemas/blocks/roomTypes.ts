import { defineType, defineField } from "sanity";

export default defineType({
  name: "roomTypes",
  title: "Room Types",
  type: "object",
  fields: [
    defineField({
      name: "rooms",
      title: "Rooms",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "tag",
              title: "Tag",
              type: "string",
              description: "e.g. Most Popular or Premium",
            }),
            defineField({ name: "price", title: "Price", type: "string" }),
            defineField({ name: "capacity", title: "Capacity", type: "string" }),
            defineField({
              name: "desc",
              title: "Description",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "features",
              title: "Features",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: "type", subtitle: "price" },
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
    prepare() {
      return { title: "Room Types", subtitle: "Accommodation" };
    },
  },
});
