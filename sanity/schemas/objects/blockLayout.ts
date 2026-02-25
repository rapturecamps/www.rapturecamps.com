import { defineField } from "sanity";

/**
 * Shared layout override fields for all pageBuilder blocks.
 * Spread into any block's `fields` array to make spacing and dividers
 * controllable from Sanity Studio.
 */
export const blockLayoutFields = [
  defineField({
    name: "topDivider",
    title: "Top Divider",
    type: "boolean",
    initialValue: false,
    fieldset: "layout",
  }),
  defineField({
    name: "spacingTop",
    title: "Top Spacing",
    type: "string",
    options: {
      list: [
        { title: "Default", value: "default" },
        { title: "None", value: "none" },
        { title: "Extra Small", value: "xs" },
        { title: "Small", value: "small" },
        { title: "Large", value: "large" },
      ],
      layout: "radio",
      direction: "horizontal",
    },
    initialValue: "default",
    fieldset: "layout",
  }),
  defineField({
    name: "spacingBottom",
    title: "Bottom Spacing",
    type: "string",
    options: {
      list: [
        { title: "Default", value: "default" },
        { title: "None", value: "none" },
        { title: "Extra Small", value: "xs" },
        { title: "Small", value: "small" },
        { title: "Large", value: "large" },
      ],
      layout: "radio",
      direction: "horizontal",
    },
    initialValue: "default",
    fieldset: "layout",
  }),
];

export const blockLayoutFieldset = {
  name: "layout",
  title: "Layout Overrides",
  options: { collapsible: true, collapsed: true },
};
