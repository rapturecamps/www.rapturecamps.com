import { defineType, defineField } from "sanity";

export default defineType({
  name: "videoTestimonials",
  title: "Video Testimonials",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Stories from Our Guests",
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
              name: "youtubeId",
              title: "YouTube Video ID",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "guestName",
              title: "Guest Name",
              type: "string",
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "guestName", subtitle: "caption" },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "heading", videos: "videos" },
    prepare({ title, videos }) {
      return {
        title: title || "Video Testimonials",
        subtitle: `${videos?.length || 0} videos`,
      };
    },
  },
});
