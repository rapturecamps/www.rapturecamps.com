import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "imageBreak",
  title: "Image Divider",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      description: "Upload an image here, or use the External URL field below.",
    }),
    defineField({
      name: "imageUrl",
      title: "External Image URL",
      type: "url",
      description: "Fallback if no uploaded image. Will be replaced by Sanity image when available.",
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
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
    ...blockLayoutFields,
  ],
  preview: {
    select: { media: "image", caption: "caption" },
    prepare({ caption, media }) {
      return { title: caption || "Image Divider", subtitle: "Image Divider", media };
    },
  },
});
