import { defineType, defineField } from "sanity";

export default defineType({
  name: "surfPage",
  title: "Surf Page",
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
      name: "conditionsCard",
      title: "Surf Conditions Card (static rows)",
      description: "Static info shown alongside the live surf data",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "value", title: "Value", type: "string" }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        },
      ],
    }),
    defineField({
      name: "surfSpots",
      title: "Surf Spots",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
            defineField({ name: "level", title: "Level", type: "string" }),
            defineField({ name: "type", title: "Break Type", type: "string" }),
            defineField({ name: "desc", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
          ],
          preview: { select: { title: "name", subtitle: "level" } },
        },
      ],
    }),
    defineField({
      name: "schedule",
      title: "Daily Schedule",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "time", title: "Time", type: "string" }),
            defineField({ name: "activity", title: "Activity", type: "string" }),
          ],
          preview: {
            select: { title: "activity", subtitle: "time" },
          },
        },
      ],
    }),
    defineField({
      name: "levels",
      title: "Surf Levels",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "level", title: "Level", type: "string" }),
            defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
            defineField({ name: "features", title: "Features", type: "array", of: [{ type: "string" }] }),
            defineField({ name: "outcome", title: "Outcome", type: "text", rows: 2 }),
          ],
          preview: { select: { title: "level", subtitle: "subtitle" } },
        },
      ],
    }),
  ],
});
