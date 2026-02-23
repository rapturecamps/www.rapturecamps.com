import { defineConfig, defineField } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { media } from "sanity-plugin-media";
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

const I18N_SCHEMA_TYPES = ["camp", "country", "blogPost", "faq", "faqCategory", "page", "homepage", "linkinBio"];

export default defineConfig({
  name: "rapturecamps",
  title: "Rapture Surfcamps",
  projectId: "ypmt1bmc",
  dataset: "production",
  plugins: [
    structureTool({
      structure: (S) => {
        const HIDDEN_TYPES = ["media.tag", "translation.metadata"];
        const API_V = "v2024-01-01";
        return S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Pages")
              .child(
                S.list()
                  .title("Pages")
                  .items([
                    S.listItem()
                      .title("Homepage")
                      .child(
                        S.documentTypeList("homepage").title("Homepage")
                      ),
                    S.documentTypeListItem("page").title("Content Pages"),
                    S.listItem()
                      .title("Link in Bio")
                      .child(
                        S.documentTypeList("linkinBio").title("Link in Bio")
                      ),
                  ])
              ),
            S.divider(),
            S.listItem()
              .title("Countries")
              .child(
                S.documentList()
                  .title("Countries")
                  .schemaType("country")
                  .apiVersion(API_V)
                  .filter('_type == "country" && (language == "en" || !defined(language))')
              ),
            S.listItem()
              .title("Camps")
              .child(
                S.documentList()
                  .title("Camps")
                  .schemaType("camp")
                  .apiVersion(API_V)
                  .filter('_type == "camp" && (language == "en" || !defined(language))')
              ),
            S.divider(),
            S.listItem()
              .title("Blog")
              .child(
                S.list()
                  .title("Blog")
                  .items([
                    S.listItem()
                      .title("All Posts")
                      .child(
                        S.documentList()
                          .title("All Blog Posts")
                          .schemaType("blogPost")
                          .apiVersion(API_V)
                          .filter('_type == "blogPost" && (language == "en" || !defined(language))')
                          .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
                      ),
                    S.listItem()
                      .title("All Posts (DE)")
                      .child(
                        S.documentList()
                          .title("German Blog Posts")
                          .schemaType("blogPost")
                          .apiVersion(API_V)
                          .filter('_type == "blogPost" && language == "de"')
                          .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
                      ),
                    S.divider(),
                    S.listItem()
                      .title("By Category")
                      .child(
                        S.documentList()
                          .title("Select Category")
                          .schemaType("blogCategory")
                          .apiVersion(API_V)
                          .filter('_type == "blogCategory"')
                          .child((categoryId) =>
                            S.documentList()
                              .title("Posts")
                              .schemaType("blogPost")
                              .apiVersion(API_V)
                              .filter(
                                '_type == "blogPost" && (language == "en" || !defined(language)) && $categoryId in categories[]._ref'
                              )
                              .params({ categoryId })
                              .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
                          )
                      ),
                    S.listItem()
                      .title("By Category (DE)")
                      .child(
                        S.documentList()
                          .title("Select Category")
                          .schemaType("blogCategory")
                          .apiVersion(API_V)
                          .filter('_type == "blogCategory"')
                          .child((categoryId) =>
                            S.documentList()
                              .title("Posts (DE)")
                              .schemaType("blogPost")
                              .apiVersion(API_V)
                              .filter(
                                '_type == "blogPost" && language == "de" && $categoryId in categories[]._ref'
                              )
                              .params({ categoryId })
                              .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
                          )
                      ),
                    S.divider(),
                    S.listItem()
                      .title("Missing DE Translation")
                      .child(
                        S.documentList()
                          .title("EN Posts Without German Translation")
                          .schemaType("blogPost")
                          .apiVersion(API_V)
                          .filter(
                            '_type == "blogPost" && (language == "en" || !defined(language)) && count(*[_type == "translation.metadata" && references(^._id) && count(translations[_key == "de"]) > 0]) == 0'
                          )
                          .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
                      ),
                    S.divider(),
                    S.listItem()
                      .title("Manage Categories")
                      .child(
                        S.documentTypeList("blogCategory").title("Blog Categories")
                      ),
                  ])
              ),
            S.divider(),
            S.listItem()
              .title("FAQs")
              .child(
                S.list()
                  .title("FAQs")
                  .items([
                    S.listItem()
                      .title("By Camp")
                      .child(
                        S.documentList()
                          .title("Select Camp")
                          .schemaType("camp")
                          .apiVersion(API_V)
                          .filter('_type == "camp" && (language == "en" || !defined(language))')
                          .child((campId) =>
                            S.documentList()
                              .title("Categories")
                              .schemaType("faqCategory")
                              .apiVersion(API_V)
                              .filter('_type == "faqCategory" && (language == "en" || !defined(language))')
                              .child((categoryId) =>
                                S.documentList()
                                  .title("FAQs")
                                  .schemaType("faq")
                                  .apiVersion(API_V)
                                  .filter(
                                    '_type == "faq" && (language == "en" || !defined(language)) && $campId in camps[]._ref && category._ref == $categoryId'
                                  )
                                  .params({ campId, categoryId })
                              )
                          )
                      ),
                    S.divider(),
                    S.listItem()
                      .title("Categories")
                      .child(
                        S.documentList()
                          .title("Categories")
                          .schemaType("faqCategory")
                          .apiVersion(API_V)
                          .filter('_type == "faqCategory" && (language == "en" || !defined(language))')
                      ),
                    S.listItem()
                      .title("All FAQs")
                      .child(
                        S.documentList()
                          .title("All FAQs")
                          .schemaType("faq")
                          .apiVersion(API_V)
                          .filter('_type == "faq" && (language == "en" || !defined(language))')
                      ),
                  ])
              ),
            S.divider(),
            S.documentTypeListItem("redirect").title("Redirects"),
            S.divider(),
            S.listItem()
              .title("Site Settings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),
            ...S.documentTypeListItems().filter(
              (item) =>
                !HIDDEN_TYPES.includes(item.getId() ?? "") &&
                ![
                  "camp", "country", "blogPost", "blogCategory",
                  "faq", "faqCategory", "page", "homepage", "linkinBio",
                  "siteSettings", "redirect",
                ].includes(item.getId() ?? "")
            ),
          ]);
      },
    }),
    media(),
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
