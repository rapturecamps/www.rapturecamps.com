import { defineType, defineField } from "sanity";

export default defineType({
  name: "page",
  title: "Page",
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
            `count(*[_type == $type && slug.current == $slug && language == $lang && !(_id in [$id, $draftId])])`,
            { type: document?._type, slug: value, lang, id, draftId: `drafts.${id}` }
          );
          return count === 0;
        },
      },
      validation: (r) => r.required(),
      group: "content",
    }),
    defineField({
      name: "lastUpdated",
      title: "Last Updated",
      type: "date",
      description:
        "Shown at the top of legal pages (e.g. 'Last updated: February 2026').",
      group: "content",
    }),

    // Hero
    defineField({
      name: "heroImages",
      title: "Hero Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "Background images for the hero section.",
      group: "hero",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      description: "Main headline in the hero. Use \\n for line breaks.",
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

    // Body (for simple text pages)
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      description:
        "Simple rich text body for legal/text pages. For landing pages, use Page Builder instead.",
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
                  { name: "href", type: "url", title: "URL" },
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
      ],
    }),

    // Page Builder (for landing pages)
    defineField({
      name: "pageBuilder",
      title: "Page Builder",
      type: "array",
      description: "Build rich landing pages with modular blocks.",
      group: "content",
      of: [
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
        { type: "highlightsGrid" },
        { type: "inclusionsGrid" },
        { type: "faqSection" },
        { type: "ctaSection" },
        { type: "retreatItinerary" },
        { type: "retreatTestimonials" },
        { type: "retreatStatsBar" },
        { type: "retreatGallery" },
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
    select: { title: "title", slug: "slug.current" },
    prepare({ title, slug }) {
      return { title, subtitle: `/${slug || ""}` };
    },
  },
});
