import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "faqSection",
  title: "FAQ Section",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Frequently Asked Questions",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      options: {
        list: [
          { title: "From FAQ Library", value: "library" },
          { title: "Custom (inline)", value: "custom" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "library",
    }),
    defineField({
      name: "faqRefs",
      title: "Select FAQs",
      type: "array",
      of: [{ type: "reference", to: [{ type: "faq" }] }],
      description: "Pick individual FAQ items from the library. They appear in the order you add them.",
      hidden: ({ parent }) => parent?.source !== "library",
      validation: (r) =>
        r.custom((val, ctx) => {
          const parent = ctx.parent as any;
          if (parent?.source === "library" && (!val || val.length === 0))
            return "Select at least one FAQ";
          return true;
        }),
    }),
    defineField({
      name: "faqCategory",
      title: "Or Select by Category",
      type: "reference",
      to: [{ type: "faqCategory" }],
      description:
        "Optional. Instead of picking individual FAQs, select a category to show all FAQs in that category.",
      hidden: ({ parent }) => parent?.source !== "library",
    }),
    defineField({
      name: "faqs",
      title: "FAQ Items",
      type: "array",
      hidden: ({ parent }) => parent?.source !== "custom",
      of: [
        {
          type: "object",
          fields: [
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
          ],
          preview: { select: { title: "question" } },
        },
      ],
    }),
    ...blockLayoutFields,
  ],
  preview: {
    select: {
      title: "heading",
      source: "source",
      faqs: "faqs",
      faqRefs: "faqRefs",
      categoryName: "faqCategory.name",
    },
    prepare({ title, source, faqs, faqRefs, categoryName }) {
      let subtitle = "";
      if (source === "library") {
        if (categoryName) {
          subtitle = `Category: ${categoryName}`;
        } else {
          subtitle = `Library: ${faqRefs?.length || 0} FAQs selected`;
        }
      } else {
        subtitle = `Custom: ${faqs?.length || 0} FAQs`;
      }
      return {
        title: title || "FAQ Section",
        subtitle,
      };
    },
  },
});
