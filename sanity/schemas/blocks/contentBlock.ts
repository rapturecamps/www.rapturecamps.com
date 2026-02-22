import { defineType, defineField } from "sanity";

export default defineType({
  name: "contentBlock",
  title: "Content Block",
  type: "object",
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
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "imageAlt",
      title: "Image Alt Text",
      type: "string",
    }),
    defineField({
      name: "reverse",
      title: "Reverse Layout",
      type: "boolean",
      description: "Place image on the left instead of right.",
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
  ],
  preview: {
    select: { label: "label", heading: "heading", body: "body" },
    prepare({ label, heading, body }) {
      const snippet = (body || [])
        .flatMap((b: any) => (b.children || []).map((c: any) => c.text))
        .join(" ")
        .slice(0, 80);
      return {
        title: label || heading || "Content Block",
        subtitle: snippet ? `${snippet}…` : "Content Block",
      };
    },
  },
});
