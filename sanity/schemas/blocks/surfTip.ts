import { defineType, defineField } from "sanity";
import {
  blockLayoutFields,
  blockLayoutFieldset,
} from "../objects/blockLayout";

export default defineType({
  name: "surfTip",
  title: "Surf Tip / Callout",
  type: "object",
  fieldsets: [blockLayoutFieldset],
  fields: [
    defineField({
      name: "tipType",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Tip", value: "tip" },
          { title: "Warning", value: "warning" },
          { title: "Important", value: "important" },
          { title: "Pro Tip", value: "pro-tip" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "tip",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Optional custom title. Defaults to the type name if empty.",
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
    ...blockLayoutFields,
  ],
  preview: {
    select: { tipType: "tipType", title: "title", content: "content" },
    prepare({ tipType, title, content }) {
      const icons: Record<string, string> = {
        tip: "💡",
        warning: "⚠️",
        important: "❗",
        "pro-tip": "🎯",
      };
      const icon = icons[tipType] || "💡";
      return {
        title: `${icon} ${title || tipType || "Tip"}`,
        subtitle: content?.slice(0, 80),
      };
    },
  },
});
