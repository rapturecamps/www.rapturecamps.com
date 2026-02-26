import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "contentBlockVideo",
  title: "Content Block Video",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "label",
      title: "Internal Label",
      type: "string",
      description: "Optional — only shown in the Studio list, not on the website.",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
    }),
    defineField({
      name: "headingLevel",
      title: "Heading Level",
      type: "string",
      options: {
        list: [
          { title: "H1", value: "h1" },
          { title: "H2 (default)", value: "h2" },
          { title: "H3", value: "h3" },
          { title: "H4", value: "h4" },
        ],
      },
      initialValue: "h2",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "videoType",
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
      description: "YouTube/Vimeo/Wistia/Bunny CDN video ID, or MP4 URL for File type.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "videoPoster",
      title: "Poster Image",
      type: "image",
      options: { hotspot: true },
      description: "Optional thumbnail shown before the video plays.",
    }),
    defineField({
      name: "reverse",
      title: "Reverse Layout",
      type: "boolean",
      description: "Place video on the left instead of right.",
      initialValue: false,
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
    select: { label: "label", heading: "heading", videoType: "videoType" },
    prepare({ label, heading, videoType }) {
      return {
        title: label || heading || "Content Block Video",
        subtitle: `Video (${videoType || "unknown"})`,
      };
    },
  },
});
