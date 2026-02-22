import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";

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
                    S.document().schemaType("camp").documentId(campId)
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
