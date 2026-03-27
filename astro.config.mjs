import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import sanity from "@sanity/astro";

export default defineConfig({
  site: "https://www.rapturecamps.com",
  output: "static",
  adapter: vercel(),
  devToolbar: { enabled: false },
  integrations: [
    react(),
    sanity({
      projectId: "ypmt1bmc",
      dataset: "production",
      useCdn: true,
      studioBasePath: "/studio",
    }),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      filter: (page) =>
        !page.includes("/studio") &&
        !page.includes("/404") &&
        !page.includes("/410") &&
        !page.includes("/linkin-bio") &&
        !page.includes("/thank-you") &&
        !page.includes("/survey-thank-you"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "sanity",
        "sanity/structure",
        "@sanity/vision",
        "sanity-plugin-media",
        "@sanity/document-internationalization",
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-compiler-runtime",
        "react-is",
        "styled-components",
        "lucide-react",
        "lodash/startCase.js",
      ],
    },
  },
  image: {
    domains: [
      "www.rapturecamps.com",
      "cdn.sanity.io",
    ],
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "de"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  redirects: {
    "/surfcamp/portugal/ericeira/": "/surfcamp/portugal/ericeira-lizandro",
    "/surfcamp/portugal/milfontes/": "/surfcamp/portugal/alentejo-milfontes",
    "/surfcamp/portugal/coxos-surf-villa/":
      "/surfcamp/portugal/ericeira-coxos-surf-villa",
  },
});
