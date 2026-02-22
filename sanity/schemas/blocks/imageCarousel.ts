import { defineType, defineField } from "sanity";

export default defineType({
  name: "imageCarousel",
  title: "Image Carousel",
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
    }),
    defineField({
      name: "aspect",
      title: "Aspect Ratio",
      type: "string",
      options: {
        list: [
          { title: "16:9", value: "16/9" },
          { title: "4:3", value: "4/3" },
          { title: "3:2", value: "3/2" },
          { title: "1:1", value: "1/1" },
        ],
      },
      initialValue: "16/9",
    }),
  ],
  preview: {
    select: { images: "images" },
    prepare({ images }) {
      return {
        title: `Carousel (${images?.length || 0} images)`,
        subtitle: "Image Carousel",
      };
    },
  },
});
