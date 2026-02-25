import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "videoTestimonials",
  title: "Video Testimonials",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      options: {
        list: [
          { title: "From Library", value: "library" },
          { title: "Custom (inline)", value: "custom" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "library",
    }),
    defineField({
      name: "testimonialSet",
      title: "Testimonial Set",
      type: "reference",
      to: [{ type: "videoTestimonialSet" }],
      description: "Pick a reusable set from the Video Testimonials library.",
      hidden: ({ parent }) => parent?.source !== "library",
      validation: (r) =>
        r.custom((val, ctx) => {
          const parent = ctx.parent as any;
          if (parent?.source === "library" && !val) return "Required";
          return true;
        }),
    }),
    defineField({
      name: "headingOverride",
      title: "Heading Override",
      type: "string",
      description:
        "Optional. Overrides the heading from the library set for this specific page.",
      hidden: ({ parent }) => parent?.source !== "library",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Stories from Our Guests",
      hidden: ({ parent }) => parent?.source !== "custom",
    }),
    defineField({
      name: "bunnyLibraryId",
      title: "Bunny Library ID",
      type: "string",
      initialValue: "605576",
      hidden: ({ parent }) => parent?.source !== "custom",
      validation: (r) =>
        r.custom((val, ctx) => {
          const parent = ctx.parent as any;
          if (parent?.source === "custom" && !val) return "Required";
          return true;
        }),
    }),
    defineField({
      name: "bunnyPullZone",
      title: "Bunny Pull Zone URL",
      type: "string",
      initialValue: "vz-79cee76e-e6d.b-cdn.net",
      hidden: ({ parent }) => parent?.source !== "custom",
      validation: (r) =>
        r.custom((val, ctx) => {
          const parent = ctx.parent as any;
          if (parent?.source === "custom" && !val) return "Required";
          return true;
        }),
    }),
    defineField({
      name: "videos",
      title: "Testimonial Videos",
      type: "array",
      hidden: ({ parent }) => parent?.source !== "custom",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "bunnyVideoId",
              title: "Bunny Video ID",
              type: "string",
              description:
                "The video GUID from Bunny Stream (e.g. d9d9ab1f-fc9f-4488-9c26-4ffc653c0024).",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "posterImage",
              title: "Poster Image",
              type: "image",
              options: { hotspot: true },
              description:
                "Portrait photo shown before playing. If not set, the Bunny auto-generated thumbnail is used.",
            }),
            defineField({
              name: "guestName",
              title: "Guest Name",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "date",
              title: "Date",
              type: "string",
              description: "e.g. 22.09.2025",
            }),
            defineField({
              name: "location",
              title: "Location",
              type: "string",
              description:
                "Badge text shown on the card, e.g. Bali Green Bowl",
            }),
            defineField({
              name: "quote",
              title: "Quote",
              type: "string",
              description: "Short testimonial quote shown on the card.",
            }),
          ],
          preview: {
            select: {
              title: "guestName",
              subtitle: "location",
              media: "posterImage",
            },
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
    select: {
      source: "source",
      heading: "heading",
      headingOverride: "headingOverride",
      setTitle: "testimonialSet.title",
      setHeading: "testimonialSet.heading",
      videos: "videos",
      setVideos: "testimonialSet.videos",
    },
    prepare({ source, heading, headingOverride, setTitle, setHeading, videos, setVideos }) {
      if (source === "library") {
        return {
          title: headingOverride || setHeading || "Video Testimonials",
          subtitle: `Library: ${setTitle || "Not selected"}`,
        };
      }
      return {
        title: heading || "Video Testimonials",
        subtitle: `Custom · ${videos?.length || 0} videos`,
      };
    },
  },
});
