import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
// import storyblok from "@storyblok/astro";

export default defineConfig({
  site: "https://www.rapturecamps.com",
  output: "static",
  adapter: vercel(),
  integrations: [
    react(),
    // Enable once Storyblok token is configured:
    // storyblok({
    //   accessToken: process.env.PUBLIC_STORYBLOK_TOKEN || "",
    //   apiOptions: { region: "eu" },
    // }),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    domains: [
      "images.unsplash.com",
      "www.rapturecamps.com",
      "a.storyblok.com",
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
    "/surfcamp/nicaragua/playa-maderas/": "/surfcamp/nicaragua/maderas",
  },
});
