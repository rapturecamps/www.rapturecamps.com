import { defineType, defineField } from "sanity";

export default defineType({
  name: "learnToSurfLesson",
  title: "Learn to Surf – Lesson",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "header", title: "Lesson Header" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
      group: "content",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
        isUnique: async (value, context) => {
          const { document, getClient } = context;
          const client = getClient({ apiVersion: "2024-01-01" });
          const lang = (document as any)?.language;
          if (!lang) return true;
          const id = document?._id?.replace(/^drafts\./, "");
          const count = await client.fetch(
            `count(*[_type == "learnToSurfLesson" && slug.current == $slug && language == $lang && !(_id in [$id, $draftId])])`,
            { slug: value, lang, id, draftId: `drafts.${id}` }
          );
          return count === 0;
        },
      },
      validation: (r) => r.required(),
      group: "content",
    }),
    defineField({
      name: "cluster",
      title: "Cluster",
      type: "reference",
      to: [{ type: "learnToSurfCluster" }],
      validation: (r) => r.required(),
      description: "The topic cluster this lesson belongs to.",
      group: "content",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "2-3 sentence summary shown on cluster listing cards.",
      group: "content",
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      options: { hotspot: true },
      group: "content",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Controls the order lessons appear within their cluster.",
      group: "content",
    }),

    // Structured header
    defineField({
      name: "difficulty",
      title: "Difficulty",
      type: "string",
      options: {
        list: [
          { title: "Beginner", value: "beginner" },
          { title: "Intermediate", value: "intermediate" },
          { title: "Advanced", value: "advanced" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      group: "header",
    }),
    defineField({
      name: "readTime",
      title: "Read Time",
      type: "string",
      description: 'Estimated reading time (e.g., "8 min read").',
      group: "header",
    }),
    defineField({
      name: "keyTakeaways",
      title: "Key Takeaways",
      type: "array",
      of: [{ type: "string" }],
      description: "3-5 bullet points summarizing the lesson.",
      group: "header",
    }),
    defineField({
      name: "introVideo",
      title: "Intro Video URL",
      type: "url",
      description: "Paste a YouTube video URL. Supports youtube.com/watch and youtu.be links.",
      group: "header",
    }),
    defineField({
      name: "prerequisites",
      title: "Prerequisites",
      type: "array",
      of: [{ type: "reference", to: [{ type: "learnToSurfLesson" }] }],
      description: "Lessons the reader should complete before this one.",
      group: "header",
    }),
    defineField({
      name: "nextLessons",
      title: "Next Lessons",
      type: "array",
      of: [{ type: "reference", to: [{ type: "learnToSurfLesson" }] }],
      description: "Suggested lessons to continue with after this one.",
      group: "header",
    }),

    // LMS
    defineField({
      name: "lmsUrl",
      title: "LMS Lesson URL",
      type: "string",
      description: "Relative path to the matching Surfing Academy lesson. Leave empty if not yet available.",
      group: "content",
    }),

    // Body
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      group: "content",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (Rule: any) =>
                      Rule.uri({
                        allowRelative: true,
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  },
                  {
                    name: "blank",
                    type: "boolean",
                    title: "Open in new tab",
                    initialValue: false,
                  },
                ],
              },
            ],
          },
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "caption", type: "string", title: "Caption" },
            { name: "alt", type: "string", title: "Alt Text" },
          ],
        },
        { type: "lessonStep" },
        { type: "surfTip" },
        { type: "surfExercise" },
        { type: "surfMistake" },
        { type: "surfTable" },
        { type: "imageGrid" },
        { type: "imageBreak" },
        { type: "imageCarousel" },
        { type: "imageGallery" },
        { type: "videoBlock" },
        { type: "videoTestimonials" },
        { type: "highlightsGrid" },
        { type: "faqSection" },
        { type: "ctaSection" },
        { type: "richText" },
        { type: "contentBlock" },
        { type: "contentBlockGrid" },
        { type: "contentBlockVideo" },
        { type: "contentBlockImageCarousel" },
      ],
    }),

    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  orderings: [
    {
      title: "Order (Ascending)",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      cluster: "cluster.title",
      difficulty: "difficulty",
      language: "language",
      media: "featuredImage",
    },
    prepare({ title, cluster, difficulty, language, media }) {
      const badge = difficulty ? `[${difficulty}]` : "";
      return {
        title: title || "Untitled Lesson",
        subtitle: `${cluster || "No cluster"} ${badge} · ${(language || "en").toUpperCase()}`,
        media,
      };
    },
  },
});
