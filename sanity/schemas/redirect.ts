import { defineType, defineField } from "sanity";

export default defineType({
  name: "redirect",
  title: "Redirect",
  type: "document",
  fields: [
    defineField({
      name: "fromPath",
      title: "From Path",
      type: "string",
      description: "The old URL path (e.g., /old-blog-post/)",
      validation: (r) => r.required().custom((val) => {
        if (val && !val.startsWith("/")) return "Path must start with /";
        return true;
      }),
    }),
    defineField({
      name: "toPath",
      title: "To Path",
      type: "string",
      description: "The new URL path (e.g., /blog/new-blog-post)",
      validation: (r) => r.required().custom((val) => {
        if (val && !val.startsWith("/") && !val.startsWith("http")) {
          return "Path must start with / or http";
        }
        return true;
      }),
    }),
    defineField({
      name: "statusCode",
      title: "Status Code",
      type: "number",
      options: {
        list: [
          { title: "301 — Permanent Redirect", value: 301 },
          { title: "302 — Temporary Redirect", value: 302 },
        ],
      },
      initialValue: 301,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "note",
      title: "Note",
      type: "string",
      description: "Optional note (e.g., 'WordPress migration')",
    }),
  ],
  orderings: [
    {
      title: "From Path (A-Z)",
      name: "fromPathAsc",
      by: [{ field: "fromPath", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      from: "fromPath",
      to: "toPath",
      code: "statusCode",
      active: "isActive",
    },
    prepare({ from, to, code, active }) {
      return {
        title: `${from} → ${to}`,
        subtitle: `${code || 301}${active === false ? " (inactive)" : ""}`,
      };
    },
  },
});
