import { defineType, defineField } from "sanity";

export default defineType({
  name: "popup",
  title: "Popup",
  type: "document",
  groups: [
    { name: "general", title: "General", default: true },
    { name: "targeting", title: "Targeting" },
    { name: "content", title: "Content" },
    { name: "scheduling", title: "Scheduling" },
    { name: "integration", title: "Email Integration" },
  ],
  fields: [
    // --- General ---
    defineField({
      name: "internalName",
      title: "Internal Name",
      type: "string",
      description: "For your reference only (e.g., 'Bali Summer Offer 2026')",
      validation: (r) => r.required(),
      group: "general",
    }),
    defineField({
      name: "popupType",
      title: "Popup Type",
      type: "string",
      options: {
        list: [
          { title: "Special Offer", value: "special-offer" },
          { title: "Exit Intent", value: "exit-intent" },
          { title: "Spinning Wheel", value: "spinning-wheel" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
      group: "general",
    }),
    defineField({
      name: "enabled",
      title: "Enabled",
      type: "boolean",
      initialValue: true,
      group: "general",
    }),
    defineField({
      name: "priority",
      title: "Priority",
      type: "number",
      description:
        "Higher number = higher priority. When multiple popups match a page, the highest priority wins.",
      initialValue: 10,
      validation: (r) => r.required().min(1),
      group: "general",
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      options: {
        list: [
          { title: "English", value: "en" },
          { title: "German", value: "de" },
          { title: "All Languages", value: "all" },
        ],
      },
      initialValue: "all",
      group: "general",
    }),

    // --- Trigger ---
    defineField({
      name: "triggerMode",
      title: "Trigger",
      type: "string",
      options: {
        list: [
          { title: "Timed — show after delay", value: "timed" },
          { title: "Exit Intent — mouse leaves viewport", value: "exit-intent" },
          {
            title: "Timed + Exit Intent fallback",
            value: "timed-or-exit",
          },
        ],
        layout: "radio",
      },
      initialValue: "timed",
      group: "general",
    }),
    defineField({
      name: "delaySeconds",
      title: "Delay (seconds)",
      type: "number",
      description:
        "How many seconds to wait before showing (for timed triggers). Also used as the fallback timer for exit-intent.",
      initialValue: 10,
      hidden: ({ parent }) => parent?.triggerMode === "exit-intent",
      group: "general",
    }),

    // --- Targeting ---
    defineField({
      name: "targetMode",
      title: "Target Mode",
      type: "string",
      options: {
        list: [
          { title: "All Pages", value: "all-pages" },
          {
            title: "URL Patterns (e.g., /surfcamp/bali/*)",
            value: "url-patterns",
          },
          {
            title: "URL Contains keyword (e.g., bali)",
            value: "url-contains",
          },
          { title: "Specific Camps", value: "specific-camps" },
        ],
      },
      initialValue: "all-pages",
      validation: (r) => r.required(),
      group: "targeting",
    }),
    defineField({
      name: "urlPatterns",
      title: "URL Patterns",
      type: "array",
      of: [{ type: "string" }],
      description:
        'Glob-style path patterns. Use * as wildcard. E.g., /surfcamp/bali/* matches all Bali camp pages.',
      hidden: ({ parent }) => parent?.targetMode !== "url-patterns",
      group: "targeting",
    }),
    defineField({
      name: "urlContains",
      title: "URL Contains",
      type: "array",
      of: [{ type: "string" }],
      description:
        'Keywords to match anywhere in the URL. E.g., "bali" matches /surfcamp/bali/green-bowl AND /blog/best-surf-bali.',
      hidden: ({ parent }) => parent?.targetMode !== "url-contains",
      group: "targeting",
    }),
    defineField({
      name: "targetCamps",
      title: "Target Camps",
      type: "array",
      of: [{ type: "reference", to: [{ type: "camp" }] }],
      description:
        "Select specific camps. The popup will show on all pages for these camps (overview, surf, rooms, food) in all languages.",
      hidden: ({ parent }) => parent?.targetMode !== "specific-camps",
      group: "targeting",
    }),
    defineField({
      name: "excludePatterns",
      title: "Exclude Patterns",
      type: "array",
      of: [{ type: "string" }],
      description:
        'URL patterns to exclude even if they match above rules. E.g., /legal, /privacy-policy.',
      group: "targeting",
    }),

    // --- Scheduling ---
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "datetime",
      description: "Optional. Popup will not show before this date.",
      group: "scheduling",
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "datetime",
      description: "Optional. Popup will not show after this date.",
      group: "scheduling",
    }),

    // --- Content: Special Offer ---
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      group: "content",
      hidden: ({ parent }) => parent?.popupType === "spinning-wheel",
    }),
    defineField({
      name: "body",
      title: "Body Text",
      type: "text",
      rows: 3,
      group: "content",
      hidden: ({ parent }) => parent?.popupType === "spinning-wheel",
    }),
    defineField({
      name: "ctaText",
      title: "CTA Button Text",
      type: "string",
      group: "content",
      hidden: ({ parent }) => parent?.popupType === "spinning-wheel",
    }),
    defineField({
      name: "ctaHref",
      title: "CTA Button Link",
      type: "string",
      group: "content",
      hidden: ({ parent }) => parent?.popupType === "spinning-wheel",
    }),
    defineField({
      name: "voucherCode",
      title: "Voucher Code",
      type: "string",
      description: "Discount code displayed to the user.",
      group: "content",
      hidden: ({ parent }) => parent?.popupType === "spinning-wheel",
    }),
    defineField({
      name: "offerImage",
      title: "Offer Image",
      type: "image",
      options: { hotspot: true },
      description: "Optional image shown at the top of the popup.",
      group: "content",
      hidden: ({ parent }) => parent?.popupType !== "special-offer",
    }),
    defineField({
      name: "expiresAt",
      title: "Countdown Expires At",
      type: "datetime",
      description:
        "If set, a countdown timer is shown in the popup. Leave empty to hide the timer.",
      group: "content",
      hidden: ({ parent }) => parent?.popupType !== "special-offer",
    }),

    // --- Content: Spinning Wheel ---
    defineField({
      name: "wheelHeadline",
      title: "Headline",
      type: "string",
      group: "content",
      hidden: ({ parent }) => parent?.popupType !== "spinning-wheel",
    }),
    defineField({
      name: "wheelSubheadline",
      title: "Subheadline",
      type: "string",
      group: "content",
      hidden: ({ parent }) => parent?.popupType !== "spinning-wheel",
    }),
    defineField({
      name: "segments",
      title: "Wheel Segments",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "color",
              title: "Color",
              type: "string",
              description: "Hex color code (e.g., #005AFF)",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "prize",
              title: "Prize / Voucher Code",
              type: "string",
              description: "Leave empty for 'Try Again' segments.",
            }),
            defineField({
              name: "probability",
              title: "Probability Weight",
              type: "number",
              description: "Relative weight (e.g., 25 = common, 2 = rare).",
              initialValue: 10,
              validation: (r) => r.required().min(1),
            }),
          ],
          preview: {
            select: { title: "label", sub: "prize" },
            prepare({ title, sub }) {
              return {
                title: title || "Segment",
                subtitle: sub ? `Code: ${sub}` : "No prize",
              };
            },
          },
        },
      ],
      group: "content",
      hidden: ({ parent }) => parent?.popupType !== "spinning-wheel",
    }),

    // --- Email Integration ---
    defineField({
      name: "zohoListKey",
      title: "Zoho Campaigns List Key",
      type: "string",
      description:
        "The mailing list key from Zoho Campaigns (Contacts > Manage Lists > Setup). Emails captured by this popup will be added to this list.",
      group: "integration",
    }),
    defineField({
      name: "zohoSource",
      title: "Source Label",
      type: "string",
      description:
        'Identifies where the lead came from in Zoho (e.g., "Bali Spinning Wheel", "Exit Intent Homepage").',
      group: "integration",
    }),
  ],
  orderings: [
    {
      title: "Priority (High to Low)",
      name: "priorityDesc",
      by: [{ field: "priority", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      name: "internalName",
      type: "popupType",
      enabled: "enabled",
      target: "targetMode",
    },
    prepare({ name, type, enabled, target }) {
      const typeLabels: Record<string, string> = {
        "special-offer": "Special Offer",
        "exit-intent": "Exit Intent",
        "spinning-wheel": "Spinning Wheel",
      };
      const targetLabels: Record<string, string> = {
        "all-pages": "All Pages",
        "url-patterns": "URL Patterns",
        "url-contains": "URL Contains",
        "specific-camps": "Specific Camps",
      };
      return {
        title: name || "Untitled Popup",
        subtitle: `${typeLabels[type] || type} · ${targetLabels[target] || target}${enabled === false ? " · DISABLED" : ""}`,
      };
    },
  },
});
