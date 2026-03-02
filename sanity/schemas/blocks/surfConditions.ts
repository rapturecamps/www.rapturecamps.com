import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "surfConditions",
  title: "Surf Conditions",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Wave Type", value: "waveType" },
          { title: "Skill Level", value: "skillLevel" },
          { title: "Best Season", value: "bestSeason" },
          { title: "Swell & Wind", value: "swellWind" },
          { title: "Crowd Factor", value: "crowdFactor" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
    }),
    defineField({
      name: "headingLevel",
      title: "Heading Level",
      type: "string",
      options: {
        list: [
          { title: "H1", value: "h1" },
          { title: "H2 (default)", value: "h2" },
          { title: "H3", value: "h3" },
          { title: "H4", value: "h4" },
        ],
      },
      initialValue: "h2",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "cardTitle",
      title: "Card Title",
      type: "string",
      description:
        "Override the card title. Leave empty to use the default for the selected category.",
    }),
    defineField({
      name: "cardItems",
      title: "Card Items",
      type: "array",
      description:
        "Override the card data rows. Leave empty to use the defaults for the selected category.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "value", title: "Value", type: "string" }),
          ],
          preview: {
            select: { label: "label", value: "value" },
            prepare({ label, value }) {
              return { title: label || "Item", subtitle: value };
            },
          },
        },
      ],
    }),
    defineField({
      name: "cardNote",
      title: "Card Note",
      type: "string",
      description:
        "Optional footer note shown at the bottom of the card with an info icon.",
    }),
    defineField({
      name: "reverse",
      title: "Reverse Layout",
      type: "boolean",
      description: "Swap text and card sides.",
      initialValue: false,
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
    select: { title: "heading", category: "category" },
    prepare({ title, category }) {
      const categoryLabels: Record<string, string> = {
        waveType: "Wave Type",
        skillLevel: "Skill Level",
        bestSeason: "Best Season",
        swellWind: "Swell & Wind",
        crowdFactor: "Crowd Factor",
      };
      const label = categoryLabels[category] || category || "";
      return {
        title: title || label || "Surf Conditions",
        subtitle: `Surf Conditions${label ? ` — ${label}` : ""}`,
      };
    },
  },
});
