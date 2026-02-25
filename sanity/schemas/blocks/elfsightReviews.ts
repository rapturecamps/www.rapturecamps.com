import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "elfsightReviews",
  title: "Elfsight Reviews",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "What Our Guests Say",
    }),
    defineField({
      name: "elfsightAppId",
      title: "Elfsight App ID",
      type: "string",
      description:
        "The Elfsight widget App ID (found in your Elfsight dashboard).",
      validation: (r) => r.required(),
    }),
    ...blockLayoutFields,
  ],
  preview: {
    select: { title: "heading", appId: "elfsightAppId" },
    prepare({ title, appId }) {
      return {
        title: title || "Elfsight Reviews",
        subtitle: appId ? `App: ${appId}` : "No App ID set",
      };
    },
  },
});
