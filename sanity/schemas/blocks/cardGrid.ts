import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "cardGrid",
  title: "Card Grid",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
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
        ],
      },
      initialValue: "h2",
      hidden: ({ parent }) => !parent?.heading,
    }),
    defineField({
      name: "subtext",
      title: "Subtext",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "cards",
      title: "Cards",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "tag",
              title: "Tag",
              type: "string",
              description: "Short label shown as a badge (top-right corner).",
            }),
            defineField({
              name: "subtitle",
              title: "Subtitle",
              type: "string",
              description: "Small text below the title (e.g. a category or type).",
            }),
            defineField({
              name: "body",
              title: "Body",
              type: "text",
              rows: 4,
            }),
            defineField({
              name: "link",
              title: "Link",
              type: "string",
              description: "Optional URL to make the card clickable (e.g. /surfcamp/bali).",
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "tag", media: "image" },
          },
        },
      ],
    }),
    defineField({
      name: "columns",
      title: "Columns (desktop)",
      type: "string",
      description: "Leave on Auto to adapt to the number of cards.",
      options: {
        list: [
          { title: "Auto", value: "auto" },
          { title: "2", value: "2" },
          { title: "3", value: "3" },
          { title: "4", value: "4" },
        ],
      },
      initialValue: "auto",
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
    select: { title: "heading", cards: "cards" },
    prepare({ title, cards }) {
      return {
        title: title || "Card Grid",
        subtitle: `${cards?.length || 0} cards`,
      };
    },
  },
});
