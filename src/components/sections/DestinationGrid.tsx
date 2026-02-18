import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { destinations } from "@/lib/data";

export default function DestinationGrid() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 380;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section id="destinations" className="py-20 sm:py-28 bg-dark">
      <div className="px-6 sm:px-12 lg:px-20">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
            Choose Your Destination
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ocean text-white hover:bg-ocean-light transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" as React.CSSProperties["msOverflowStyle"] }}
        >
          {destinations.map((dest) => (
            <a
              key={dest.slug}
              href={dest.slug}
              className="group flex-shrink-0 snap-start"
            >
              <div className="relative w-[280px] sm:w-[320px] lg:w-[360px] aspect-[3/4] overflow-hidden rounded-2xl">
                <img
                  src={dest.image}
                  alt={`${dest.name} surf camp in ${dest.country}`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
                    {dest.location}
                  </p>
                  <h3 className="text-lg font-semibold text-white">
                    {dest.name}
                  </h3>
                  <p className="text-sm text-white/50 mt-0.5">{dest.country}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
