import { defineType, defineField } from "sanity";
import {
  blockLayoutFields,
  blockLayoutFieldset,
} from "../objects/blockLayout";

export default defineType({
  name: "surfExercise",
  title: "Surf Exercise",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "title",
      title: "Exercise Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Brief overview of the exercise and its purpose.",
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      description: 'How long the exercise takes (e.g., "5 minutes", "10 reps x 3 sets").',
    }),
    defineField({
      name: "equipment",
      title: "Equipment Needed",
      type: "array",
      of: [{ type: "string" }],
      description: "List any required equipment (surfboard, surfskate, yoga mat, etc.).",
    }),
    defineField({
      name: "steps",
      title: "Exercise Steps",
      type: "array",
      of: [{ type: "string" }],
      description: "Ordered instructions for performing the exercise.",
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    ...blockLayoutFields,
  ],
  preview: {
    select: { title: "title", duration: "duration" },
    prepare({ title, duration }) {
      return {
        title: `🏋️ ${title || "Exercise"}`,
        subtitle: duration || "No duration set",
      };
    },
  },
});
