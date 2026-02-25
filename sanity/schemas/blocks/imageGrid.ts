import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "imageGrid",
  title: "Image Grid",
  type: "object",
  fieldsets: [blockLayoutFieldset],
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
            { name: "caption", type: "string", title: "Caption" },
          ],
        },
      ],
      validation: (r) => r.min(3).max(5),
    }),
    ...blockLayoutFields,
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
