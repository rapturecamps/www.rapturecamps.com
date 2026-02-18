import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  date: string;
  isNew?: boolean;
}

const recentPosts: BlogPost[] = [
  {
    slug: "bioluminescence-in-costa-rica",
    title: "Bioluminescence in Costa Rica",
    excerpt: "The dazzling phenomenon of bioluminescence has turned Costa Rica's Isla de Cedros into a bucket-list destination.",
    featuredImage: "https://www.rapturecamps.com/wp-content/uploads/2025/05/Bioluminescence-In-Costa-rica.jpg",
    category: "Costa Rica",
    date: "May 10, 2025",
    isNew: true,
  },
  {
    slug: "dominical-costa-rica",
    title: "Dominical, Costa Rica: Surfing, Yoga, And Laid-Back Vibes",
    excerpt: "Tucked along Costa Rica's Pacific coast, Dominical offers what many surfers consider paradise.",
    featuredImage: "https://www.rapturecamps.com/wp-content/uploads/2025/05/Dominical-costa-rica-surfer.jpg",
    category: "Inspiration",
    date: "May 9, 2025",
  },
  {
    slug: "one-week-in-costa-rica-travel-itinerary",
    title: "One Week In Costa Rica: The Perfect Travel Itinerary",
    excerpt: "Costa Rica packs extraordinary biodiversity and adventure into a relatively small space.",
    featuredImage: "https://www.rapturecamps.com/wp-content/uploads/2025/05/sea-turtle-heading-to-beach.jpg",
    category: "Costa Rica",
    date: "May 8, 2025",
  },
  {
    slug: "arenal-volcano",
    title: "How To Hike Arenal Volcano: Best Trails & Tips",
    excerpt: "The majestic Arenal Volcano rises dramatically from the Costa Rican rainforest.",
    featuredImage: "https://www.rapturecamps.com/wp-content/uploads/2025/05/Arenal-Volcano-View-in-Costa-Rica.jpg",
    category: "Costa Rica",
    date: "May 7, 2025",
  },
  {
    slug: "10-best-surf-spots-in-bali",
    title: "10 Best Surf Spots In Bali: Map, Videos & Tips",
    excerpt: "Bali is home to at least 60 surf spots — here are the 10 best for every level, from Padang Padang to Uluwatu.",
    featuredImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=1000&fit=crop",
    category: "Bali",
    date: "May 5, 2025",
  },
];

export default function BlogFeed() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-16 bg-dark-lighter">
      <div className="px-6 sm:px-12 lg:px-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
            Recent Posts
          </h2>
          <div className="flex items-center gap-3">
            <a
              href="/blog"
              className="text-xs text-white/40 hover:text-white/70 transition-colors hidden sm:block"
            >
              View all
            </a>
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ocean text-white hover:bg-ocean-light transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" as React.CSSProperties["msOverflowStyle"] }}
        >
          {recentPosts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex-shrink-0 snap-start"
            >
              <article className="relative w-[280px] sm:w-[320px] lg:w-[360px] aspect-[3/4] overflow-hidden rounded-2xl">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {post.isNew && (
                  <div className="absolute top-4 left-4">
                    <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      New
                    </span>
                  </div>
                )}

                <div className="absolute top-4 right-4">
                  <span className="rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1 text-[10px] font-medium text-white/80">
                    {post.category}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-lg font-semibold text-white leading-tight line-clamp-2 group-hover:text-ocean-light transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs text-white/50 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </article>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
