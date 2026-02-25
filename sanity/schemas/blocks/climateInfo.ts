import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

const MONTH_LIST = [
  { title: "January", value: 1 },
  { title: "February", value: 2 },
  { title: "March", value: 3 },
  { title: "April", value: 4 },
  { title: "May", value: 5 },
  { title: "June", value: 6 },
  { title: "July", value: 7 },
  { title: "August", value: 8 },
  { title: "September", value: 9 },
  { title: "October", value: 10 },
  { title: "November", value: 11 },
  { title: "December", value: 12 },
];

export default defineType({
  name: "climateInfo",
  title: "Climate Info",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Air & Water Temperatures",
    }),
    defineField({
      name: "body",
      title: "Body Text",
      type: "array",
      description: "Full SEO-optimized text shown on the left side.",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "months",
      title: "Monthly Climate Data",
      description: "Temperature data for each month (used for the chart).",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "month",
              title: "Month",
              type: "number",
              options: { list: MONTH_LIST },
              validation: (r) => r.required().min(1).max(12),
            }),
            defineField({
              name: "airTempHigh",
              title: "Air Temp High °C",
              type: "number",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "airTempLow",
              title: "Air Temp Low °C",
              type: "number",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "waterTemp",
              title: "Water Temp °C",
              type: "number",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "rainyDays",
              title: "Rainy Days",
              type: "number",
              description: "Average rainy days in this month.",
            }),
          ],
          preview: {
            select: {
              month: "month",
              high: "airTempHigh",
              low: "airTempLow",
              water: "waterTemp",
            },
            prepare({ month, high, low, water }) {
              const names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              return {
                title: names[month] || "?",
                subtitle: `Air ${low}–${high}°C · Water ${water}°C`,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "wetsuitNote",
      title: "Wetsuit Note",
      type: "string",
      description: 'e.g. "No wetsuit needed" or "3/2mm fullsuit in winter"',
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
    select: { heading: "heading" },
    prepare({ heading }) {
      return {
        title: heading || "Climate Info",
        subtitle: "Temperature Chart",
      };
    },
  },
});
