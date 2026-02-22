import { defineType, defineField } from "sanity";

export default defineType({
  name: "imageBreak",
  title: "Full-Width Image",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt Text",
      type: "string",
    }),
    defineField({
      name: "height",
      title: "Height",
      type: "string",
      options: {
        list: [
          { title: "Small", value: "sm" },
          { title: "Medium", value: "md" },
          { title: "Large", value: "lg" },
        ],
      },
      initialValue: "md",
    }),
  ],
  preview: {
    select: { media: "image", title: "alt" },
    prepare({ title, media }) {
      return { title: title || "Full-Width Image", subtitle: "Image Break", media };
    },
  },
});
