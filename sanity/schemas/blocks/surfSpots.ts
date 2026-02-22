import { defineType, defineField } from "sanity";

export default defineType({
  name: "surfSpots",
  title: "Surf Spots",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
    }),
    defineField({
      name: "spots",
      title: "Spots",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({ name: "level", title: "Level", type: "string" }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "level", media: "image" },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "heading", spots: "spots" },
    prepare({ title, spots }) {
      return {
        title: title || "Surf Spots",
        subtitle: `${spots?.length || 0} spots`,
      };
    },
  },
});
