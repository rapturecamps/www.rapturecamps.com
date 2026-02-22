import { defineConfig, defineField } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { documentInternationalization } from "@sanity/document-internationalization";
import {
  useDeleteTranslationAction,
  useDuplicateWithTranslationsAction,
} from "@sanity/document-internationalization";
import { schemaTypes } from "./sanity/schemas";
import { TranslateAction } from "./sanity/actions/translateAction";

const LANGUAGES = [
  { id: "en", title: "English" },
  { id: "de", title: "German" },
];

const I18N_SCHEMA_TYPES = ["camp", "country", "blogPost", "faq", "page", "homepage", "linkinBio"];

export default defineConfig({
  name: "rapturecamps",
  title: "Rapture Surfcamps",
  projectId: "ypmt1bmc",
  dataset: "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Homepage")
              .child(
                S.documentTypeList("homepage").title("Homepage")
              ),
            S.documentTypeListItem("page").title("Pages"),
            S.listItem()
              .title("Link in Bio")
              .child(
                S.documentTypeList("linkinBio").title("Link in Bio")
              ),
            S.divider(),
            S.documentTypeListItem("country").title("Countries"),
            S.listItem()
              .title("Camps")
              .schemaType("camp")
              .child(
                S.documentTypeList("camp")
                  .title("Camps")
                  .child((campId) =>
                    S.document().schemaType("camp").documentId(campId)
                  )
              ),
            S.divider(),
            S.documentTypeListItem("blogPost").title("Blog Posts"),
            S.documentTypeListItem("blogCategory").title("Blog Categories"),
            S.divider(),
            S.documentTypeListItem("faq").title("FAQs"),
            S.divider(),
            S.listItem()
              .title("Site Settings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),
          ]),
    }),
    documentInternationalization({
      supportedLanguages: LANGUAGES,
      schemaTypes: I18N_SCHEMA_TYPES,
    }),
    visionTool(),
  ],
  document: {
    actions: (prev, context) => {
      if (I18N_SCHEMA_TYPES.includes(context.schemaType)) {
        return [
          ...prev,
          useDeleteTranslationAction,
          useDuplicateWithTranslationsAction,
          TranslateAction,
        ];
      }
      return prev;
    },
  },
  schema: {
    types: schemaTypes,
  },
});
