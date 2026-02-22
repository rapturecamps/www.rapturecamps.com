import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import type { StructureBuilder } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";

function campSubPage(
  S: StructureBuilder,
  campId: string,
  field: string,
  title: string
) {
  return S.document()
    .schemaType("camp")
    .documentId(campId)
    .views([
      S.view
        .form()
        .title(title)
        .groups([{ name: field, title, default: true }]),
    ]);
}

export default defineConfig({
  name: "rapturecamps",
  title: "Rapture Surfcamps",
  projectId: "ypmt1bmc",
  dataset: "production",
  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Site Settings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
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
                    S.list()
                      .title("Pages")
                      .items([
                        S.listItem()
                          .title("Overview & Settings")
                          .icon(() => "⚙")
                          .child(
                            S.document()
                              .schemaType("camp")
                              .documentId(campId)
                          ),
                        S.divider(),
                        S.listItem()
                          .title("Surf Page")
                          .icon(() => "🏄")
                          .child(
                            campSubPage(S, campId, "surfPage", "Surf Page")
                          ),
                        S.listItem()
                          .title("Rooms Page")
                          .icon(() => "🛏")
                          .child(
                            campSubPage(S, campId, "roomsPage", "Rooms Page")
                          ),
                        S.listItem()
                          .title("Food Page")
                          .icon(() => "🍽")
                          .child(
                            campSubPage(S, campId, "foodPage", "Food Page")
                          ),
                      ])
                  )
              ),
            S.divider(),
            S.documentTypeListItem("blogPost").title("Blog Posts"),
            S.documentTypeListItem("blogCategory").title("Blog Categories"),
            S.divider(),
            S.documentTypeListItem("faq").title("FAQs"),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
