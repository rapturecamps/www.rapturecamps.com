import { defineType, defineField } from "sanity";

export default defineType({
  name: "faqCategory",
  title: "FAQ Category",
  type: "document",
  fields: [
    defineField({
      name: "language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
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
      options: {
        source: "name",
        maxLength: 96,
        isUnique: async (value, context) => {
          const { document, getClient } = context;
          const client = getClient({ apiVersion: "2024-01-01" });
          const lang = (document as any)?.language;
          if (!lang) return true;
          const id = document?._id?.replace(/^drafts\./, "");
          const count = await client.fetch(
            `count(*[_type == $type && slug.current == $slug && language == $lang && !(_id in [$id, $draftId])])`,
            { type: document?._type, slug: value, lang, id, draftId: `drafts.${id}` }
          );
          return count === 0;
        },
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first.",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", order: "order" },
    prepare({ title, order }) {
      return { title, subtitle: order != null ? `Order: ${order}` : undefined };
    },
  },
});
