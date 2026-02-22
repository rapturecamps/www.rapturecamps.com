import { defineType, defineField } from "sanity";

export default defineType({
  name: "foodPage",
  title: "Food Page",
  type: "object",
  fields: [
    defineField({
      name: "introHeading",
      title: "Intro Heading",
      type: "string",
    }),
    defineField({
      name: "introBody",
      title: "Intro Body",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "glanceItems",
      title: "At a Glance",
      description: "Key-value summary card shown next to the intro",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "value", title: "Value", type: "string" }),
            defineField({ name: "note", title: "Note (small text)", type: "string", description: "Optional, e.g. '(at extra cost)'" }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        },
      ],
    }),
    defineField({
      name: "meals",
      title: "Meals",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "meal", title: "Meal Name", type: "string", validation: (r) => r.required() }),
            defineField({ name: "time", title: "Time", type: "string" }),
            defineField({ name: "desc", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "highlights", title: "Highlights", type: "array", of: [{ type: "string" }] }),
            defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
          ],
          preview: { select: { title: "meal", subtitle: "time" } },
        },
      ],
    }),
    defineField({
      name: "sampleMenu",
      title: "Sample Weekly Menu",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "day", title: "Day", type: "string" }),
            defineField({ name: "starter", title: "Starter", type: "string" }),
            defineField({ name: "main", title: "Main", type: "string" }),
            defineField({ name: "dessert", title: "Dessert", type: "string" }),
          ],
          preview: { select: { title: "day", subtitle: "main" } },
        },
      ],
    }),
    defineField({
      name: "dietary",
      title: "Dietary Options",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "desc", title: "Description", type: "string" }),
          ],
          preview: { select: { title: "name" } },
        },
      ],
    }),
  ],
});
