import { defineType, defineField } from "sanity";

export default defineType({
  name: "contentSilo",
  title: "Content Silo",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "isCountry",
      title: "Is Country Silo?",
      type: "boolean",
      description: "True for country-based silos (Bali, Portugal, etc.), false for topical silos.",
      initialValue: false,
    }),
    defineField({
      name: "country",
      title: "Linked Country",
      type: "reference",
      to: [{ type: "country" }],
      description: "For country silos, link to the matching country document.",
      hidden: ({ parent }) => !parent?.isCountry,
    }),
  ],
  preview: {
    select: { title: "name", isCountry: "isCountry" },
    prepare: ({ title, isCountry }) => ({
      title,
      subtitle: isCountry ? "Country Silo" : "Topical Silo",
    }),
  },
});
