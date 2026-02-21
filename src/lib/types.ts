export interface Camp {
  slug: string;
  name: string;
  country: string;
  countrySlug: string;
  location: string;
  tagline: string;
  description: string;
  heroImage: string;
  cardImage: string;
  bookingUrl: string;
  inclusions: Inclusion[];
  faqs: FAQ[];
  gallery: string[];
}

export interface Country {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  camps: Camp[];
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  featuredImage: string;
  categories: Category[];
  tags: string[];
  seo: SEOData;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  description?: string;
}

export interface FAQ {
  question: string;
  answer: string;
  category?: string;
}

export interface Inclusion {
  icon: string;
  title: string;
  description: string;
}

export interface SEOData {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
}

export interface Destination {
  name: string;
  country: string;
  slug: string;
  image: string;
  location: string;
  tagline?: string;
  rating?: number;
  reviewCount?: number;
  amenities?: string[];
  bookingUrl?: string;
  heroImages?: string[];
  latitude?: number;
  longitude?: number;
  elfsightId?: string;
}

export interface StatItem {
  label: string;
  value: string;
  prefix?: string;
}
