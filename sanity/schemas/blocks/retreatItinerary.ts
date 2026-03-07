import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "retreatItinerary",
  title: "Retreat Itinerary",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
    }),
    defineField({
      name: "subtext",
      title: "Subtext",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "days",
      title: "Days",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "dayNumber",
              title: "Day Number",
              type: "number",
              validation: (r) => r.required().min(1),
            }),
            defineField({
              name: "dayName",
              title: "Day Name",
              type: "string",
              description: 'e.g. "Saturday", "Monday"',
            }),
            defineField({
              name: "theme",
              title: "Theme",
              type: "string",
              description: 'e.g. "Arrival", "First Waves", "Adventure Day"',
            }),
            defineField({
              name: "activities",
              title: "Activities",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({
                      name: "time",
                      title: "Time",
                      type: "string",
                      description: 'e.g. "07:00", "Pick-Up from the Airport"',
                    }),
                    defineField({
                      name: "title",
                      title: "Title",
                      type: "string",
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "category",
                      title: "Category",
                      type: "string",
                      options: {
                        list: [
                          { title: "Surf", value: "Surf" },
                          { title: "Yoga", value: "Yoga" },
                          { title: "Wellness", value: "Wellness" },
                          { title: "Culture", value: "Culture" },
                        ],
                      },
                    }),
                  ],
                  preview: {
                    select: { title: "title", time: "time", category: "category" },
                    prepare({ title, time, category }) {
                      return {
                        title: title || "Activity",
                        subtitle: [time, category].filter(Boolean).join(" · "),
                      };
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { dayNumber: "dayNumber", dayName: "dayName", theme: "theme" },
            prepare({ dayNumber, dayName, theme }) {
              return {
                title: `Day ${dayNumber || "?"} — ${dayName || ""}`,
                subtitle: theme || "",
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
      initialValue: "dark",
    }),
    ...blockLayoutFields,
  ],
  preview: {
    select: { title: "heading", days: "days" },
    prepare({ title, days }) {
      return {
        title: title || "Retreat Itinerary",
        subtitle: `${days?.length || 0} days`,
      };
    },
  },
});
