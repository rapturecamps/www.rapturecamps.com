import { defineType, defineField } from "sanity";
import { PathInput } from "../components/PathInput";

const STATUS_CODES = [
  { title: "301 — Permanent Redirect", value: 301 },
  { title: "302 — Temporary Redirect", value: 302 },
  { title: "404 — Not Found", value: 404 },
  { title: "410 — Gone (permanently removed)", value: 410 },
];

const STATUS_LABELS: Record<number, string> = {
  301: "301 Redirect",
  302: "302 Redirect",
  404: "404 Not Found",
  410: "410 Gone",
};

export default defineType({
  name: "redirect",
  title: "Redirect",
  type: "document",
  fields: [
    defineField({
      name: "fromPath",
      title: "From Path",
      type: "string",
      description: "The old URL path (e.g., /old-blog-post/). Status check appears after typing.",
      components: { input: PathInput },
      validation: (r) =>
        r
          .required()
          .custom((val) => {
            if (val && !val.startsWith("/")) return "Path must start with /";
            return true;
          }),
    }),
    defineField({
      name: "toPath",
      title: "To Path",
      type: "string",
      description: "The new URL path (e.g., /blog/new-blog-post). Status check appears after typing.",
      components: { input: PathInput },
      hidden: ({ parent }) =>
        parent?.statusCode === 404 || parent?.statusCode === 410,
      validation: (r) =>
        r.custom((val, context) => {
          const code = (context.parent as any)?.statusCode;
          if (code === 404 || code === 410) return true;
          if (!val) return "To Path is required for redirects";
          if (!val.startsWith("/") && !val.startsWith("http")) {
            return "Path must start with / or http";
          }
          return true;
        }),
    }),
    defineField({
      name: "statusCode",
      title: "Status Code",
      type: "number",
      options: { list: STATUS_CODES },
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
      const label = STATUS_LABELS[code] || `${code}`;
      const isError = code === 404 || code === 410;
      const arrow = isError ? from || "" : `${from} → ${to}`;
      return {
        title: arrow,
        subtitle: `${label}${active === false ? " (inactive)" : ""}`,
      };
    },
  },
});
