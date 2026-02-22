import { defineType, defineField } from "sanity";

export default defineType({
  name: "camp",
  title: "Camp",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "country",
      title: "Country",
      type: "reference",
      to: [{ type: "country" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "location",
      title: "Location Label",
      type: "string",
      description: "e.g. 'Bukit Peninsula, Bali'",
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Card Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "heroImages",
      title: "Hero Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "Rotating hero background images. First image is shown initially.",
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (r) => r.min(0).max(5).precision(1),
    }),
    defineField({
      name: "reviewCount",
      title: "Review Count",
      type: "number",
    }),
    defineField({
      name: "amenities",
      title: "Amenities",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "bookingUrl",
      title: "Booking URL",
      type: "url",
    }),
    defineField({
      name: "latitude",
      title: "Latitude",
      type: "number",
    }),
    defineField({
      name: "longitude",
      title: "Longitude",
      type: "number",
    }),
    defineField({
      name: "elfsightId",
      title: "Elfsight App ID",
      type: "string",
      description: "Elfsight reviews widget App ID",
    }),
    defineField({
      name: "pageBuilder",
      title: "Overview Page Content",
      type: "array",
      of: [
        { type: "contentBlock" },
        { type: "imageGrid" },
        { type: "imageBreak" },
        { type: "imageCarousel" },
        { type: "videoBlock" },
        { type: "videoTestimonials" },
        { type: "highlightsGrid" },
        { type: "inclusionsGrid" },
        { type: "faqSection" },
        { type: "ctaSection" },
      ],
    }),
    defineField({
      name: "surfPage",
      title: "Surf Page",
      type: "surfPage",
    }),
    defineField({
      name: "roomsPage",
      title: "Rooms Page",
      type: "roomsPage",
    }),
    defineField({
      name: "foodPage",
      title: "Food Page",
      type: "foodPage",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "country.name",
      media: "image",
    },
  },
});
