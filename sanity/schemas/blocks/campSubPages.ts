import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "campSubPages",
  title: "Explore the Camp",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Explore the Camp",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
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
    defineField({
      name: "surfCard",
      title: "Surf Card",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "description", title: "Description", type: "string" }),
        defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
      ],
    }),
    defineField({
      name: "roomsCard",
      title: "Rooms Card",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "description", title: "Description", type: "string" }),
        defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
      ],
    }),
    defineField({
      name: "foodCard",
      title: "Food Card",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "description", title: "Description", type: "string" }),
        defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
      ],
    }),
    ...blockLayoutFields,
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Explore the Camp", subtitle: "Camp Sub-Pages" };
    },
  },
});
