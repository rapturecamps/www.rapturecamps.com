import { defineType, defineField } from "sanity";

export default defineType({
  name: "learnToSurfCluster",
  title: "Learn to Surf – Cluster",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "hero", title: "Hero" },
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
            `count(*[_type == "learnToSurfCluster" && slug.current == $slug && language == $lang && !(_id in [$id, $draftId])])`,
            { slug: value, lang, id, draftId: `drafts.${id}` }
          );
          return count === 0;
        },
      },
      validation: (r) => r.required(),
      group: "content",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Short intro displayed on the hub page and at the top of the cluster page.",
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
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Icon identifier for visual display on the hub page (e.g., 'wave', 'paddle', 'board').",
      group: "content",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Controls the order clusters appear on the hub page.",
      group: "content",
    }),

    // Hero
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero Subtitle",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroTagline",
      title: "Hero Tagline",
      type: "string",
      description: "Small uppercase text above the hero headline.",
      group: "hero",
    }),

    // LMS
    defineField({
      name: "lmsCourseUrl",
      title: "LMS Course URL",
      type: "string",
      description: "Relative path to the matching Surfing Academy course (e.g., /surfing-academy/courses/surf-fundamentals). Leave empty if not yet available.",
      group: "content",
    }),

    // Page Builder
    defineField({
      name: "pageBuilder",
      title: "Page Builder",
      type: "array",
      description: "Build the cluster landing page with modular blocks.",
      group: "content",
      of: [
        { type: "lessonStep" },
        { type: "surfTip" },
        { type: "surfExercise" },
        { type: "surfMistake" },
        { type: "richText" },
        { type: "cardGrid" },
        { type: "contentBlock" },
        { type: "contentBlockGrid" },
        { type: "contentBlockVideo" },
        { type: "contentBlockImageCarousel" },
        { type: "featureBlock" },
        { type: "imageBreak" },
        { type: "imageGrid" },
        { type: "imageCarousel" },
        { type: "imageGallery" },
        { type: "videoBlock" },
        { type: "videoTestimonials" },
        { type: "highlightsGrid" },
        { type: "faqSection" },
        { type: "ctaSection" },
      ],
    }),

    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: {
      title: "title",
      order: "order",
      language: "language",
      media: "featuredImage",
    },
    prepare({ title, order, language, media }) {
      return {
        title: title || "Untitled Cluster",
        subtitle: `#${order ?? "?"} · ${(language || "en").toUpperCase()}`,
        media,
      };
    },
  },
});
