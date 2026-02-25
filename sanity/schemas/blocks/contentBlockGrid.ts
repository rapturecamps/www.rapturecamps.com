import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "contentBlockGrid",
  title: "Content Block Grid",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "label",
      title: "Internal Label",
      type: "string",
      description: "Optional — only shown in the Studio list, not on the website.",
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
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "2–4 images displayed as a compact grid beside the text.",
      validation: (r) => r.min(2).max(4),
    }),
    defineField({
      name: "reverse",
      title: "Reverse Layout",
      type: "boolean",
      description: "Place grid on the left instead of right.",
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
    select: { label: "label", heading: "heading", body: "body" },
    prepare({ label, heading, body }) {
      const snippet = (body || [])
        .flatMap((b: any) => (b.children || []).map((c: any) => c.text))
        .join(" ")
        .slice(0, 80);
      return {
        title: label || heading || "Content Block Grid",
        subtitle: snippet ? `${snippet}…` : "Content Block Grid",
      };
    },
  },
});
