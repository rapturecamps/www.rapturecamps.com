import { defineType, defineField } from "sanity";

export default defineType({
  name: "roomsPage",
  title: "Rooms Page",
  type: "object",
  fields: [
    defineField({
      name: "rooms",
      title: "Room Types",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "type", title: "Room Type", type: "string", validation: (r) => r.required() }),
            defineField({ name: "tag", title: "Tag Label", type: "string", description: "e.g. 'Most Popular', 'Premium'" }),
            defineField({ name: "price", title: "Price", type: "string" }),
            defineField({ name: "capacity", title: "Capacity", type: "string" }),
            defineField({ name: "desc", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "features", title: "Features", type: "array", of: [{ type: "string" }] }),
            defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
          ],
          preview: { select: { title: "type", subtitle: "price" } },
        },
      ],
    }),
    defineField({
      name: "facilities",
      title: "Facilities",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "desc", title: "Description", type: "string" }),
          ],
          preview: { select: { title: "name" } },
        },
      ],
    }),
  ],
});
