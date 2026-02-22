import { defineType, defineField } from "sanity";

export default defineType({
  name: "foodPage",
  title: "Food Page",
  type: "object",
  fields: [
    // ─── Intro ───
    defineField({ name: "introHeading", title: "Intro Heading", type: "string" }),
    defineField({ name: "introBody", title: "Intro Body", type: "text", rows: 4 }),
    defineField({
      name: "glanceItems",
      title: "At a Glance",
      description: "Key-value summary card shown next to the intro",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "label", title: "Label", type: "string" }),
          defineField({ name: "value", title: "Value", type: "string" }),
          defineField({ name: "note", title: "Note (small text)", type: "string", description: "Optional, e.g. '(at extra cost)'" }),
        ],
        preview: { select: { title: "label", subtitle: "value" } },
      }],
    }),

    // ─── Meals ───
    defineField({
      name: "meals",
      title: "Meals",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "meal", title: "Meal Name", type: "string", validation: (r) => r.required() }),
          defineField({ name: "time", title: "Time", type: "string" }),
          defineField({ name: "desc", title: "Description", type: "text", rows: 3 }),
          defineField({ name: "highlights", title: "Highlights", type: "array", of: [{ type: "string" }] }),
          defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
        ],
        preview: { select: { title: "meal", subtitle: "time" } },
      }],
    }),

    // ─── Image Break ───
    defineField({ name: "imageBreakUrl", title: "Image Break — URL", type: "url", description: "Full-width image between sections" }),
    defineField({ name: "imageBreakAlt", title: "Image Break — Alt Text", type: "string" }),
    defineField({ name: "imageBreakCaption", title: "Image Break — Caption", type: "string" }),

    // ─── Sample Menu ───
    defineField({ name: "menuHeading", title: "Menu Section — Heading", type: "string" }),
    defineField({ name: "menuSubtext", title: "Menu Section — Subtext", type: "text", rows: 2 }),
    defineField({
      name: "sampleMenu",
      title: "Sample Weekly Menu",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "day", title: "Day", type: "string" }),
          defineField({ name: "starter", title: "Starter", type: "string" }),
          defineField({ name: "main", title: "Main", type: "string" }),
          defineField({ name: "dessert", title: "Dessert", type: "string" }),
        ],
        preview: { select: { title: "day", subtitle: "main" } },
      }],
    }),

    // ─── Dietary ───
    defineField({ name: "dietaryHeading", title: "Dietary Section — Heading", type: "string" }),
    defineField({ name: "dietarySubtext", title: "Dietary Section — Subtext", type: "text", rows: 2 }),
    defineField({
      name: "dietary",
      title: "Dietary Options",
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
