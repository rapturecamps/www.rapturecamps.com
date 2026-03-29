import { defineType, defineField } from "sanity";
import {
  blockLayoutFields,
  blockLayoutFieldset,
} from "../objects/blockLayout";

export default defineType({
  name: "surfMistake",
  title: "Common Mistakes",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      description: "Optional heading (e.g., 'Common Pop Up Mistakes'). Defaults to 'Common Mistakes'.",
    }),
    defineField({
      name: "mistakes",
      title: "Mistakes",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "mistake",
              title: "Mistake",
              type: "string",
              description: "What surfers do wrong.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "correction",
              title: "Correction",
              type: "string",
              description: "What they should do instead.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { mistake: "mistake", correction: "correction" },
            prepare({ mistake, correction }) {
              return {
                title: `❌ ${mistake || "Mistake"}`,
                subtitle: `✅ ${correction || "Correction"}`,
              };
            },
          },
        },
      ],
      validation: (r) => r.min(1),
    }),
    ...blockLayoutFields,
  ],
  preview: {
    select: { heading: "heading", mistakes: "mistakes" },
    prepare({ heading, mistakes }) {
      const count = mistakes?.length ?? 0;
      return {
        title: heading || "Common Mistakes",
        subtitle: `${count} mistake${count !== 1 ? "s" : ""}`,
      };
    },
  },
});
