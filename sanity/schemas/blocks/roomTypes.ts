import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "roomTypes",
  title: "Room Types",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Room Types",
    }),
    defineField({
      name: "rooms",
      title: "Rooms",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "tag",
              title: "Tag",
              type: "string",
              description: "e.g. Most Popular or Premium",
            }),
            defineField({ name: "price", title: "Price", type: "string" }),
            defineField({ name: "capacity", title: "Capacity", type: "string" }),
            defineField({
              name: "desc",
              title: "Description",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "features",
              title: "Features",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "media",
              title: "Media (Images & Videos)",
              type: "array",
              description: "Add images and/or Bunny CDN videos. Displayed as a carousel if more than one.",
              of: [
                {
                  type: "object",
                  name: "mediaImage",
                  title: "Image",
                  fields: [
                    defineField({
                      name: "image",
                      title: "Image",
                      type: "image",
                      options: { hotspot: true },
                      validation: (r) => r.required(),
                    }),
                  ],
                  preview: {
                    select: { media: "image" },
                    prepare({ media }) {
                      return { title: "Image", media };
                    },
                  },
                },
                {
                  type: "object",
                  name: "mediaVideo",
                  title: "Bunny CDN Video",
                  fields: [
                    defineField({
                      name: "videoId",
                      title: "Bunny CDN Video ID",
                      type: "string",
                      description: "The video GUID from Bunny CDN Stream.",
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "poster",
                      title: "Poster Image",
                      type: "image",
                      options: { hotspot: true },
                      description: "Optional thumbnail shown before the video plays.",
                    }),
                  ],
                  preview: {
                    select: { videoId: "videoId" },
                    prepare({ videoId }) {
                      return { title: `Video: ${videoId || "—"}` };
                    },
                  },
                },
              ],
            }),
            defineField({
              name: "image",
              title: "Image (legacy)",
              type: "image",
              options: { hotspot: true },
              hidden: true,
            }),
          ],
          preview: {
            select: { title: "type", subtitle: "price" },
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
    select: { heading: "heading" },
    prepare({ heading }) {
      return { title: heading || "Room Types", subtitle: "Accommodation" };
    },
  },
});
