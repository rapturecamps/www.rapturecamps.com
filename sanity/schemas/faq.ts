import { defineType, defineField } from "sanity";

export default defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({
      name: "language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "faqCategory" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "camps",
      title: "Related Camps",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "camp" }],
          options: {
            filter: 'language == "en" || !defined(language)',
          },
        },
      ],
      description:
        "Link this FAQ to specific camps. Leave empty for global FAQs shown on all camp pages.",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order within the category. Lower numbers appear first.",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Category, then Order",
      name: "categoryOrder",
      by: [
        { field: "category.name", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "question",
      category: "category.name",
      camp0: "camps.0.name",
      camp1: "camps.1.name",
      camp2: "camps.2.name",
    },
    prepare({ title, category, camp0, camp1, camp2 }) {
      const camps = [camp0, camp1, camp2].filter(Boolean).join(", ");
      const parts = [camps || "All Camps", category].filter(Boolean);
      return {
        title,
        subtitle: parts.join(" · "),
      };
    },
  },
});
