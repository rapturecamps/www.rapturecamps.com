import { defineType, defineField } from "sanity";

export default defineType({
  name: "seoInsight",
  title: "SEO Insight",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Audit Title",
      type: "string",
      description: "Auto-generated label for this audit run.",
    }),
    defineField({
      name: "runDate",
      title: "Run Date",
      type: "datetime",
    }),
    defineField({
      name: "overallScore",
      title: "Overall Score",
      type: "number",
      description: "0-100 overall SEO health score.",
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 4,
      description: "High-level summary of findings.",
    }),
    defineField({
      name: "issues",
      title: "Issues",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "severity", title: "Severity", type: "string", options: { list: ["critical", "warning", "info"] } }),
            defineField({ name: "category", title: "Category", type: "string" }),
            defineField({ name: "pageUrl", title: "Page URL", type: "string" }),
            defineField({ name: "pageTitle", title: "Page Title", type: "string" }),
            defineField({ name: "issue", title: "Issue", type: "string" }),
            defineField({ name: "recommendation", title: "Recommendation", type: "string" }),
          ],
          preview: {
            select: { title: "issue", subtitle: "pageUrl", media: "severity" },
            prepare({ title, subtitle }) {
              return { title: title || "Issue", subtitle };
            },
          },
        },
      ],
    }),
    defineField({
      name: "siloHealth",
      title: "Silo Health",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "siloName", title: "Silo Name", type: "string" }),
            defineField({ name: "siloId", title: "Silo ID", type: "string" }),
            defineField({ name: "score", title: "Score", type: "number" }),
            defineField({ name: "totalPages", title: "Total Pages", type: "number" }),
            defineField({ name: "orphanedPages", title: "Orphaned Pages", type: "number" }),
            defineField({ name: "missingUplinks", title: "Missing Uplinks", type: "number" }),
            defineField({ name: "notes", title: "Notes", type: "text", rows: 2 }),
          ],
          preview: {
            select: { title: "siloName", subtitle: "score" },
            prepare({ title, subtitle }) {
              return { title: title || "Silo", subtitle: subtitle != null ? `Score: ${subtitle}` : undefined };
            },
          },
        },
      ],
    }),
  ],
  orderings: [
    {
      title: "Run Date (Newest)",
      name: "runDateDesc",
      by: [{ field: "runDate", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "runDate" },
    prepare({ title, subtitle }) {
      return {
        title: title || "SEO Audit",
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString() : undefined,
      };
    },
  },
});
