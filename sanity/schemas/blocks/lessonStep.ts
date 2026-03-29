import { defineType, defineField } from "sanity";
import {
  blockLayoutFields,
  blockLayoutFieldset,
} from "../objects/blockLayout";

export default defineType({
  name: "lessonStep",
  title: "Lesson Steps",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      description: "Optional heading above the steps (e.g., 'How to Pop Up — Step by Step').",
    }),
    defineField({
      name: "steps",
      title: "Steps",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Step Title",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 4,
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "video",
              title: "Video URL",
              type: "url",
              description: "Optional video demonstrating this step.",
            }),
            defineField({
              name: "tips",
              title: "Tips",
              type: "array",
              of: [{ type: "string" }],
              description: "Quick tips for this specific step.",
            }),
          ],
          preview: {
            select: { title: "title" },
            prepare({ title }) {
              return { title: title || "Untitled Step" };
            },
          },
        },
      ],
      validation: (r) => r.min(1),
    }),
    ...blockLayoutFields,
  ],
  preview: {
    select: { heading: "heading", steps: "steps" },
    prepare({ heading, steps }) {
      const count = steps?.length ?? 0;
      return {
        title: heading || "Lesson Steps",
        subtitle: `${count} step${count !== 1 ? "s" : ""}`,
      };
    },
  },
});
