import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "richText",
  title: "Rich Text",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "label",
      title: "Internal Label",
      type: "string",
      description: "Only shown in the Studio list, not on the website.",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      description: "Optional top-level heading displayed above the body.",
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
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "maxWidth",
      title: "Content Width",
      type: "string",
      description: "Constrain text width for better readability on long-form content.",
      options: {
        list: [
          { title: "Full", value: "full" },
          { title: "Wide (5xl)", value: "5xl" },
          { title: "Medium (4xl)", value: "4xl" },
          { title: "Narrow (3xl)", value: "3xl" },
        ],
      },
      initialValue: "4xl",
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
    select: { label: "label", heading: "heading", body: "body" },
    prepare({ label, heading, body }) {
      const snippet = (body || [])
        .flatMap((b: any) => (b.children || []).map((c: any) => c.text))
        .join(" ")
        .slice(0, 80);
      return {
        title: label || heading || "Rich Text",
        subtitle: snippet ? `${snippet}…` : "Rich Text",
      };
    },
  },
});
