import { defineType, defineField } from "sanity";

export default defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
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
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "General", value: "general" },
          { title: "Booking", value: "booking" },
          { title: "Surfing", value: "surfing" },
          { title: "Accommodation", value: "accommodation" },
          { title: "Food", value: "food" },
          { title: "Travel", value: "travel" },
        ],
      },
    }),
    defineField({
      name: "camps",
      title: "Related Camps",
      type: "array",
      of: [{ type: "reference", to: [{ type: "camp" }] }],
      description: "Link this FAQ to specific camps. Leave empty for global FAQs.",
    }),
    defineField({
      name: "countries",
      title: "Related Countries",
      type: "array",
      of: [{ type: "reference", to: [{ type: "country" }] }],
    }),
  ],
  preview: {
    select: { title: "question", subtitle: "category" },
  },
});
