import { defineType, defineField } from "sanity";

export default defineType({
  name: "roomsPage",
  title: "Rooms Page",
  type: "object",
  fields: [
    // ─── Intro ───
    defineField({ name: "introHeading", title: "Intro Heading", type: "string" }),
    defineField({ name: "introBody", title: "Intro Body", type: "text", rows: 4 }),

    // ─── Room Types ───
    defineField({
      name: "rooms",
      title: "Room Types",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "type", title: "Room Type", type: "string", validation: (r) => r.required() }),
          defineField({ name: "tag", title: "Tag Label", type: "string", description: "e.g. 'Most Popular', 'Premium'" }),
          defineField({ name: "price", title: "Price", type: "string" }),
          defineField({ name: "capacity", title: "Capacity", type: "string" }),
          defineField({ name: "desc", title: "Description", type: "text", rows: 3 }),
          defineField({ name: "features", title: "Features", type: "array", of: [{ type: "string" }] }),
          defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
        ],
        preview: { select: { title: "type", subtitle: "price" } },
      }],
    }),

    // ─── Image Break ───
    defineField({ name: "imageBreakUrl", title: "Image Break — URL", type: "url", description: "Full-width image between sections" }),
    defineField({ name: "imageBreakAlt", title: "Image Break — Alt Text", type: "string" }),
    defineField({ name: "imageBreakCaption", title: "Image Break — Caption", type: "string" }),

    // ─── Inclusions ───
    defineField({ name: "inclusionsHeading", title: "Inclusions — Heading", type: "string" }),
    defineField({ name: "inclusionsSubtext", title: "Inclusions — Subtext", type: "text", rows: 2 }),
    defineField({
      name: "inclusions",
      title: "What's Included",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "item", title: "Item", type: "string" }),
        ],
        preview: { select: { title: "item" } },
      }],
    }),

    // ─── Facilities ───
    defineField({ name: "facilitiesHeading", title: "Facilities — Heading", type: "string" }),
    defineField({ name: "facilitiesSubtext", title: "Facilities — Subtext", type: "text", rows: 2 }),
    defineField({
      name: "facilities",
      title: "Facilities",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "name", title: "Name", type: "string" }),
          defineField({ name: "desc", title: "Description", type: "string" }),
        ],
        preview: { select: { title: "name" } },
      }],
    }),

    // ─── Gallery ───
    defineField({
      name: "galleryImages",
      title: "Gallery Strip Images",
      description: "4 images shown in a grid row",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "url", title: "Image URL", type: "url" }),
          defineField({ name: "alt", title: "Alt Text", type: "string" }),
        ],
        preview: { select: { title: "alt" } },
      }],
    }),
  ],
});
