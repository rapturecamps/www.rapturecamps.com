import { defineType, defineField } from "sanity";

export default defineType({
  name: "linkinBio",
  title: "Link in Bio",
  type: "document",
  fields: [
    defineField({
      name: "language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "profileName",
      title: "Profile Name",
      type: "string",
    }),
    defineField({
      name: "profileTagline",
      title: "Profile Tagline",
      type: "text",
      rows: 2,
      description: "Short tagline below the name.",
    }),
    defineField({
      name: "ctaText",
      title: "CTA Button Text",
      type: "string",
    }),
    defineField({
      name: "ctaUrl",
      title: "CTA Button URL",
      type: "url",
    }),
    defineField({
      name: "updates",
      title: "Latest Updates",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "text", title: "Text", type: "text", rows: 2 }),
            defineField({ name: "time", title: "Time Label", type: "string", description: "e.g. '2h ago', '1d ago'" }),
            defineField({ name: "pinned", title: "Pinned", type: "boolean", initialValue: false }),
          ],
          preview: {
            select: { title: "text", subtitle: "time", pinned: "pinned" },
            prepare({ title, subtitle, pinned }) {
              return { title: (pinned ? "📌 " : "") + (title || "Update"), subtitle };
            },
          },
        },
      ],
    }),
    defineField({
      name: "blogPosts",
      title: "Featured Blog Posts",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "slug", title: "Slug", type: "string", description: "Blog post slug (e.g. 'bioluminescence-in-costa-rica')." }),
            defineField({ name: "image", title: "Image URL", type: "url" }),
            defineField({ name: "category", title: "Category", type: "string" }),
          ],
          preview: {
            select: { title: "title", subtitle: "category" },
          },
        },
      ],
    }),
    defineField({
      name: "extraLinks",
      title: "Extra Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "href", title: "URL", type: "string" }),
          ],
          preview: {
            select: { title: "label", subtitle: "href" },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Link in Bio" };
    },
  },
});
