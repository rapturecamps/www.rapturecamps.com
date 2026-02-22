import { defineType, defineField } from "sanity";

export default defineType({
  name: "mealCards",
  title: "Meal Cards",
  type: "object",
  fields: [
    defineField({
      name: "meals",
      title: "Meals",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "meal",
              title: "Meal",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({ name: "time", title: "Time", type: "string" }),
            defineField({
              name: "desc",
              title: "Description",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "highlights",
              title: "Highlights",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            }),
          ],
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
  ],
  preview: {
    prepare() {
      return { title: "Meal Cards", subtitle: "Daily Meals" };
    },
  },
});
