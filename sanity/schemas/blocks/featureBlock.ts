import { defineType, defineField } from "sanity";
import { blockLayoutFields, blockLayoutFieldset } from "../objects/blockLayout";

export default defineType({
  name: "featureBlock",
  title: "Feature Block",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "Small label above the heading, e.g. 'Chasing Waves'",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (r) => r.required(),
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
      validation: (r) => r.required(),
    }),
    defineField({
      name: "ctaText",
      title: "CTA Text",
      type: "string",
      description: "Link text shown below the body, e.g. 'Read more about surfing in Bali'",
    }),
    defineField({
      name: "ctaUrl",
      title: "CTA URL",
      type: "url",
      validation: (r) =>
        r.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
    }),
    defineField({
      name: "imagePosition",
      title: "Image Position",
      type: "string",
      options: {
        list: [
          { title: "Right", value: "right" },
          { title: "Left", value: "left" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "right",
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
    select: {
      title: "heading",
      subtitle: "tagline",
      media: "image",
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || "Feature Block",
        subtitle: subtitle || "Feature",
        media,
      };
    },
  },
});
