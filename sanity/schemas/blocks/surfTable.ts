import { defineType, defineField } from "sanity";

export default defineType({
  name: "surfTable",
  title: "Comparison Table",
  type: "object",
  fields: [
    defineField({
      name: "headers",
      title: "Column Headers",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.required().min(2),
    }),
    defineField({
      name: "rows",
      title: "Rows",
      type: "array",
      of: [
        {
          type: "object",
          name: "tableRow",
          fields: [
            defineField({
              name: "cells",
              title: "Cells",
              type: "array",
              of: [{ type: "string" }],
            }),
          ],
          preview: {
            select: { cells: "cells" },
            prepare({ cells }) {
              return {
                title: (cells || []).join(" | "),
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { headers: "headers", rows: "rows" },
    prepare({ headers, rows }) {
      const cols = (headers || []).join(", ");
      const count = (rows || []).length;
      return {
        title: `📊 Table: ${cols}`,
        subtitle: `${count} row${count === 1 ? "" : "s"}`,
      };
    },
  },
});
