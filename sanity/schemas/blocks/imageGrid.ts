import { defineType, defineField } from "sanity";

export default defineType({
  name: "imageGrid",
  title: "Image Grid",
  type: "object",
  fields: [
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", type: "string", title: "Alt Text" },
            { name: "caption", type: "string", title: "Caption" },
          ],
        },
      ],
      validation: (r) => r.min(3).max(5),
    }),
  ],
  preview: {
    select: { images: "images" },
    prepare({ images }) {
      return {
        title: `Image Grid (${images?.length || 0} images)`,
        subtitle: "Image Grid",
      };
    },
  },
});
