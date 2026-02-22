import { defineType, defineField } from "sanity";

export default defineType({
  name: "surfPage",
  title: "Surf Page",
  type: "object",
  fields: [
    // ─── Intro ───
    defineField({ name: "introHeading", title: "Intro Heading", type: "string" }),
    defineField({ name: "introBody", title: "Intro Body", type: "text", rows: 4 }),
    defineField({
      name: "conditionsCard",
      title: "Surf Conditions Card (static rows)",
      description: "Static info shown alongside the live surf data",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "label", title: "Label", type: "string" }),
          defineField({ name: "value", title: "Value", type: "string" }),
        ],
        preview: { select: { title: "label", subtitle: "value" } },
      }],
    }),

    // ─── Image Break ───
    defineField({ name: "imageBreakUrl", title: "Image Break — URL", type: "url", description: "Full-width image between sections" }),
    defineField({ name: "imageBreakAlt", title: "Image Break — Alt Text", type: "string" }),
    defineField({ name: "imageBreakCaption", title: "Image Break — Caption", type: "string" }),

    // ─── Surf Spots ───
    defineField({ name: "spotsHeading", title: "Surf Spots — Heading", type: "string" }),
    defineField({ name: "spotsSubtext", title: "Surf Spots — Subtext", type: "text", rows: 2 }),
    defineField({
      name: "surfSpots",
      title: "Surf Spots",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
          defineField({ name: "level", title: "Level", type: "string" }),
          defineField({ name: "type", title: "Break Type", type: "string" }),
          defineField({ name: "desc", title: "Description", type: "text", rows: 3 }),
          defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
        ],
        preview: { select: { title: "name", subtitle: "level" } },
      }],
    }),

    // ─── Lessons ───
    defineField({ name: "lessonsHeading", title: "Lessons — Heading", type: "string" }),
    defineField({ name: "lessonsBody", title: "Lessons — Body", type: "text", rows: 6, description: "Plain text (paragraphs separated by blank lines)" }),
    defineField({ name: "lessonsImageUrl", title: "Lessons — Image URL", type: "url" }),
    defineField({ name: "lessonsImageAlt", title: "Lessons — Image Alt", type: "string" }),

    // ─── Surf Levels ───
    defineField({ name: "levelsHeading", title: "Surf Levels — Heading", type: "string" }),
    defineField({ name: "levelsSubtext", title: "Surf Levels — Subtext", type: "text", rows: 2 }),
    defineField({
      name: "levels",
      title: "Surf Levels",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "level", title: "Level", type: "string" }),
          defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
          defineField({ name: "features", title: "Features", type: "array", of: [{ type: "string" }] }),
          defineField({ name: "outcome", title: "Outcome", type: "text", rows: 2 }),
        ],
        preview: { select: { title: "level", subtitle: "subtitle" } },
      }],
    }),

    // ─── Schedule ───
    defineField({ name: "scheduleHeading", title: "Schedule — Heading", type: "string" }),
    defineField({ name: "scheduleSubtext", title: "Schedule — Subtext", type: "text", rows: 2 }),
    defineField({
      name: "schedule",
      title: "Daily Schedule",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "time", title: "Time", type: "string" }),
          defineField({ name: "activity", title: "Activity", type: "string" }),
        ],
        preview: { select: { title: "activity", subtitle: "time" } },
      }],
    }),

    // ─── Equipment ───
    defineField({ name: "equipmentHeading", title: "Equipment — Heading", type: "string" }),
    defineField({ name: "equipmentSubtext", title: "Equipment — Subtext", type: "text", rows: 2 }),
    defineField({
      name: "equipment",
      title: "Equipment Items",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "item", title: "Item Name", type: "string" }),
          defineField({ name: "desc", title: "Description", type: "string" }),
        ],
        preview: { select: { title: "item" } },
      }],
    }),
  ],
});
