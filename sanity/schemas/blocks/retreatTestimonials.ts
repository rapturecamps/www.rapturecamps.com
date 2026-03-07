import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "retreatTestimonials",
  title: "Retreat Testimonials",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
    }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "quote",
              title: "Quote",
              type: "text",
              rows: 4,
              validation: (r) => r.required(),
            }),
            defineField({
              name: "authorName",
              title: "Author Name",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "authorRole",
              title: "Author Role",
              type: "string",
              description: 'e.g. "Yoga & Wellness Retreat Host"',
            }),
          ],
          preview: {
            select: { title: "authorName", subtitle: "authorRole" },
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
    select: { title: "heading", testimonials: "testimonials" },
    prepare({ title, testimonials }) {
      return {
        title: title || "Retreat Testimonials",
        subtitle: `${testimonials?.length || 0} quotes`,
      };
    },
  },
});
