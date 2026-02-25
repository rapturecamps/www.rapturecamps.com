import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "surfSeasons",
  title: "Surf Seasons",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Best Time to Surf",
    }),
    defineField({
      name: "body",
      title: "Body Text",
      type: "array",
      description: "Full SEO-optimized text shown on the left side alongside the chart.",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "seasons",
      title: "Seasons",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Season Name",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "startMonth",
              title: "Start Month",
              type: "number",
              description: "1 = January, 12 = December",
              validation: (r) => r.required().min(1).max(12),
            }),
            defineField({
              name: "endMonth",
              title: "End Month",
              type: "number",
              description: "1 = January, 12 = December",
              validation: (r) => r.required().min(1).max(12),
            }),
            defineField({
              name: "waveConsistency",
              title: "Wave Consistency",
              type: "number",
              description: "1 (inconsistent) to 5 (firing every day)",
              validation: (r) => r.required().min(1).max(5),
            }),
            defineField({
              name: "waveSize",
              title: "Typical Wave Size",
              type: "string",
              options: {
                list: [
                  { title: "Small (1–3ft)", value: "small" },
                  { title: "Medium (3–5ft)", value: "medium" },
                  { title: "Large (5–8ft)", value: "large" },
                  { title: "XL (8ft+)", value: "xl" },
                ],
              },
            }),
            defineField({
              name: "crowdLevel",
              title: "Crowd Level",
              type: "number",
              description: "1 (empty) to 5 (packed)",
              validation: (r) => r.min(1).max(5),
            }),
            defineField({
              name: "bestFor",
              title: "Best For",
              type: "string",
              options: {
                list: [
                  { title: "Beginners", value: "beginner" },
                  { title: "Intermediate", value: "intermediate" },
                  { title: "Advanced", value: "advanced" },
                  { title: "All Levels", value: "all" },
                  { title: "Intermediate–Advanced", value: "intermediate-advanced" },
                  { title: "Beginner–Intermediate", value: "beginner-intermediate" },
                ],
              },
            }),
            defineField({
              name: "color",
              title: "Season Color",
              type: "string",
              options: {
                list: [
                  { title: "Amber (Peak / Dry)", value: "amber" },
                  { title: "Blue (Wet / Rainy)", value: "blue" },
                  { title: "Green (Shoulder / Transition)", value: "green" },
                  { title: "Purple (Winter)", value: "purple" },
                ],
              },
              initialValue: "amber",
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 2,
            }),
          ],
          preview: {
            select: { name: "name", startMonth: "startMonth", endMonth: "endMonth" },
            prepare({ name, startMonth, endMonth }) {
              const m = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              return { title: name || "Season", subtitle: `${m[startMonth] || "?"} – ${m[endMonth] || "?"}` };
            },
          },
        },
      ],
    }),
    defineField({
      name: "airTemp",
      title: "Air Temperature Range",
      type: "object",
      fields: [
        defineField({ name: "low", title: "Low °C", type: "number" }),
        defineField({ name: "high", title: "High °C", type: "number" }),
      ],
      options: { columns: 2 },
    }),
    defineField({
      name: "waterTemp",
      title: "Water Temperature Range",
      type: "object",
      fields: [
        defineField({ name: "low", title: "Low °C", type: "number" }),
        defineField({ name: "high", title: "High °C", type: "number" }),
      ],
      options: { columns: 2 },
    }),
    defineField({
      name: "wetsuitNote",
      title: "Wetsuit Note",
      type: "string",
      description: 'e.g. "No wetsuit needed" or "3/2mm recommended in winter"',
    }),
    defineField({
      name: "background",
      title: "Background",
      type: "string",
      options: {
        list: [
          { title: "Dark", value: "dark" },
          { title: "Dark Lighter", value: "dark-lighter" },
        ],
      },
      initialValue: "dark",
    }),
    ...blockLayoutFields,
  ],
  preview: {
    select: { heading: "heading", seasons: "seasons" },
    prepare({ heading, seasons }) {
      return {
        title: heading || "Surf Seasons",
        subtitle: `${seasons?.length || 0} seasons`,
      };
    },
  },
});
