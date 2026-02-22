import { defineType, defineField } from "sanity";

export default defineType({
  name: "surfForecast",
  title: "Surf Forecast",
  type: "object",
  fields: [
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
      return {
        title: "Surf Forecast",
        subtitle: "Live Forecast Widget",
      };
    },
  },
});
