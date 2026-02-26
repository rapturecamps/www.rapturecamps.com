import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "videoBlock",
  title: "Video",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "type",
      title: "Video Type",
      type: "string",
      options: {
        list: [
          { title: "YouTube", value: "youtube" },
          { title: "Vimeo", value: "vimeo" },
          { title: "Wistia", value: "wistia" },
          { title: "Bunny CDN Stream", value: "bunny" },
          { title: "File (MP4)", value: "file" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "videoId",
      title: "Video ID / URL",
      type: "string",
      description: "YouTube/Vimeo/Wistia/Bunny CDN video ID, or MP4 URL for File type",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "poster",
      title: "Poster Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "autoplay",
      title: "Autoplay",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "aspect",
      title: "Aspect Ratio",
      type: "string",
      options: {
        list: [
          { title: "16:9", value: "16/9" },
          { title: "4:3", value: "4/3" },
          { title: "21:9", value: "21/9" },
        ],
      },
      initialValue: "16/9",
    }),
    ...blockLayoutFields,
  ],
  preview: {
    select: { title: "title", subtitle: "type" },
    prepare({ title, subtitle }) {
      return {
        title: title || "Video",
        subtitle: `Video (${subtitle || "unknown"})`,
      };
    },
  },
});
