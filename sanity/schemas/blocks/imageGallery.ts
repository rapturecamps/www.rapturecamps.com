import { defineType, defineField } from "sanity";

export default defineType({
  name: "imageGallery",
  title: "Image Gallery",
  type: "object",
  fields: [
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "url", title: "URL", type: "url" }),
            defineField({ name: "alt", title: "Alt", type: "string" }),
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
    select: { images: "images" },
    prepare({ images }) {
      const count = images?.length || 0;
      return {
        title: "Image Gallery",
        subtitle: `${count} image${count !== 1 ? "s" : ""}`,
      };
    },
  },
});
