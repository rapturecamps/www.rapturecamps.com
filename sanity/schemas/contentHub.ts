import { defineType, defineField } from "sanity";

export default defineType({
  name: "contentHub",
  title: "Content Hub",
  type: "document",
  fields: [
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
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "silos",
      title: "Parent Silos",
      type: "array",
      of: [{ type: "reference", to: [{ type: "contentSilo" }] }],
      description:
        "The silo(s) this hub belongs to. Shared hubs (e.g. Surf Spots & Guides) can belong to multiple country silos.",
      validation: (r) => r.min(1).required(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      silo0: "silos.0.name",
      silo1: "silos.1.name",
      silo2: "silos.2.name",
    },
    prepare: ({ title, silo0, silo1, silo2 }) => {
      const names = [silo0, silo1, silo2].filter(Boolean);
      const subtitle = names.length > 0
        ? names.length <= 3
          ? names.join(", ")
          : `${names.slice(0, 2).join(", ")} +${names.length - 2}`
        : "No silos assigned";
      return { title, subtitle };
    },
  },
});
