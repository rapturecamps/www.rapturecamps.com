import { defineType, defineField } from "sanity";

export default defineType({
  name: "videoTestimonialSet",
  title: "Video Testimonial Set",
  type: "document",
  icon: () => "🎬",
  fields: [
    defineField({
      name: "title",
      title: "Set Name",
      type: "string",
      description:
        "Internal name to identify this set, e.g. Bali Green Bowl Testimonials",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heading",
      title: "Display Heading",
      type: "string",
      initialValue: "Stories from Our Guests",
      description: "Heading shown on the page. Can be overridden per block.",
    }),
    defineField({
      name: "bunnyLibraryId",
      title: "Bunny Library ID",
      type: "string",
      initialValue: "605576",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "bunnyPullZone",
      title: "Bunny Pull Zone URL",
      type: "string",
      initialValue: "vz-79cee76e-e6d.b-cdn.net",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "videos",
      title: "Testimonial Videos",
      type: "array",
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
              description: "Badge text shown on the card, e.g. Bali Green Bowl",
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
  ],
  preview: {
    select: { title: "title", videos: "videos" },
    prepare({ title, videos }) {
      return {
        title: title || "Video Testimonial Set",
        subtitle: `${videos?.length || 0} videos`,
      };
    },
  },
});
