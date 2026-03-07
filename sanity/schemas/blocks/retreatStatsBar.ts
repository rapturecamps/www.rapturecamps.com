import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "retreatStatsBar",
  title: "Retreat Stats Bar",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "value",
              title: "Value",
              type: "string",
              description: 'The number or value, e.g. "22", "80k", "6"',
              validation: (r) => r.required(),
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              description: 'e.g. "Years of Experience", "Happy Guests"',
              validation: (r) => r.required(),
            }),
            defineField({
              name: "prefix",
              title: "Prefix",
              type: "string",
              description: 'Optional text before the value, e.g. "More than"',
            }),
          ],
          preview: {
            select: { value: "value", label: "label", prefix: "prefix" },
            prepare({ value, label, prefix }) {
              return {
                title: `${prefix ? prefix + " " : ""}${value}`,
                subtitle: label,
              };
            },
          },
        },
      ],
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
      initialValue: "dark-lighter",
    }),
    ...blockLayoutFields,
  ],
  preview: {
    select: { stats: "stats" },
    prepare({ stats }) {
      return {
        title: "Stats Bar",
        subtitle: `${stats?.length || 0} stats`,
      };
    },
  },
});
