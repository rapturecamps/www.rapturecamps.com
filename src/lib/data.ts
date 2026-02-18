import { Destination, StatItem } from "./types";

export const destinations: Destination[] = [
  {
    name: "Green Bowl",
    country: "Bali",
    slug: "/surfcamp/bali/green-bowl",
    image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=1000&fit=crop",
    location: "Bukit Peninsula",
  },
  {
    name: "Padang Padang",
    country: "Bali",
    slug: "/surfcamp/bali/padang-padang",
    image: "https://images.unsplash.com/photo-1504681869696-d977211a5f4c?w=800&h=1000&fit=crop",
    location: "Bukit Peninsula",
  },
  {
    name: "Avellanas",
    country: "Costa Rica",
    slug: "/surfcamp/costa-rica/avellanas",
    image: "https://images.unsplash.com/photo-1505459668311-8dfac7952bf0?w=800&h=1000&fit=crop",
    location: "Guanacaste",
  },
  {
    name: "Ericeira",
    country: "Portugal",
    slug: "/surfcamp/portugal/ericeira-lizandro",
    image: "https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=800&h=1000&fit=crop",
    location: "World Surfing Reserve",
  },
  {
    name: "Coxos Surf Villa",
    country: "Portugal",
    slug: "/surfcamp/portugal/ericeira-coxos-surf-villa",
    image: "https://images.unsplash.com/photo-1476673160081-cf065607f449?w=800&h=1000&fit=crop",
    location: "Ericeira",
  },
  {
    name: "Milfontes",
    country: "Portugal",
    slug: "/surfcamp/portugal/alentejo-milfontes",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=1000&fit=crop",
    location: "Alentejo Coast",
  },
  {
    name: "Banana Village",
    country: "Morocco",
    slug: "/surfcamp/morocco/banana-village",
    image: "https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&h=1000&fit=crop",
    location: "Sidi Ifni",
  },
  {
    name: "Playa Maderas",
    country: "Nicaragua",
    slug: "/surfcamp/nicaragua/maderas",
    image: "https://images.unsplash.com/photo-1455729552457-5c322b382886?w=800&h=1000&fit=crop",
    location: "San Juan del Sur",
  },
  {
    name: "Maderas Surf Resort",
    country: "Nicaragua",
    slug: "/surfcamp/nicaragua/maderas-surf-resort",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=1000&fit=crop",
    location: "Playa Maderas",
  },
];

export const stats: StatItem[] = [
  { label: "EST", value: "2003" },
  { label: "Happy Customers", value: "80k", prefix: "More than" },
  { label: "TripAdvisor Awards", value: "23" },
  { label: "Destinations", value: "8" },
  { label: "Instagram Followers", value: "35k", prefix: "More than" },
];

export const countries = [
  { name: "Bali", slug: "bali", flag: "🇮🇩" },
  { name: "Costa Rica", slug: "costa-rica", flag: "🇨🇷" },
  { name: "Portugal", slug: "portugal", flag: "🇵🇹" },
  { name: "Morocco", slug: "morocco", flag: "🇲🇦" },
  { name: "Nicaragua", slug: "nicaragua", flag: "🇳🇮" },
];

export const navigation = {
  main: [
    { label: "Destinations", href: "/surfcamp" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  destinations: [
    { label: "Bali", href: "/surfcamp/bali" },
    { label: "Costa Rica", href: "/surfcamp/costa-rica" },
    { label: "Portugal", href: "/surfcamp/portugal" },
    { label: "Morocco", href: "/surfcamp/morocco" },
    { label: "Nicaragua", href: "/surfcamp/nicaragua" },
  ],
};
