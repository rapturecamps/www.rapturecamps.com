import { createClient } from "@sanity/client";
import { randomUUID } from "crypto";

const client = createClient({
  projectId: "ypmt1bmc",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

function key() {
  return randomUUID().slice(0, 12).replace(/-/g, "");
}

const doc = {
  _id: "page-host-a-retreat-en",
  _type: "page",
  language: "en",
  title: "Host Your Retreat in Paradise",
  slug: { _type: "slug", current: "host-a-retreat" },
  heroTitle: "Host Your Retreat\nin Paradise",
  heroSubtitle:
    "A plug & play retreat location in Bali — designed for connection, focus and transformation.",
  heroTagline: "An Exclusive Invitation",
  pageBuilder: [
    // ── Why Rapture Camps (cardGrid) ──
    {
      _type: "cardGrid",
      _key: key(),
      heading: "Everything You Need. Nothing You Don't.",
      subtext:
        "We handle the logistics so you can focus on what matters — your community, your content, your vision.",
      columns: "4",
      background: "dark",
      cards: [
        {
          _type: "object",
          _key: key(),
          title: "You Host for Free",
          body: "Bring your group and stay at no cost. We take care of the commercial model so you can focus entirely on delivering your retreat experience.",
        },
        {
          _type: "object",
          _key: key(),
          title: "Plug & Play Setup",
          body: "From yoga shala to presentation screens, the venue is ready. Just show up with your program and let the space do the rest.",
        },
        {
          _type: "object",
          _key: key(),
          title: "Full Logistics Support",
          body: "We help with planning, booking management, cancellation flexibility, and on-the-ground coordination so nothing slips through the cracks.",
        },
        {
          _type: "object",
          _key: key(),
          title: "Paradise Location",
          body: "Nestled in the peaceful area of Green Bowl, Bali — surrounded by nature, calm beaches and open space. The backdrop your retreat deserves.",
        },
      ],
    },

    // ── What's Included (cardGrid) ──
    {
      _type: "cardGrid",
      _key: key(),
      heading: "We Handle Everything",
      columns: "4",
      background: "dark-lighter",
      cards: [
        {
          _type: "object",
          _key: key(),
          title: "The Venue",
          body: "Infinity pool, spacious common areas, private & shared rooms, game room, and presentation screens.",
        },
        {
          _type: "object",
          _key: key(),
          title: "Wellness & Activities",
          body: "Fully equipped yoga shala, outdoor gym, exclusive surf sessions with video analysis, and massage treatments.",
        },
        {
          _type: "object",
          _key: key(),
          title: "Food & Nourishment",
          body: "Vegetarian & vegan-friendly restaurant on-site, crafted to keep your group energized and nourished.",
        },
        {
          _type: "object",
          _key: key(),
          title: "Logistics & Booking",
          body: "Flexible booking & cancellation options, on-site support, and help with organisation from start to finish.",
        },
      ],
    },

    // ── The Location (featureBlock) ──
    {
      _type: "featureBlock",
      _key: key(),
      tagline: "The Location",
      heading: "Green Bowl, Bali",
      body: [
        {
          _type: "block",
          _key: key(),
          style: "normal",
          markDefs: [],
          children: [
            {
              _type: "span",
              _key: key(),
              marks: [],
              text: "Kutuh, South Kuta, Badung Regency — where the jungle meets the ocean.",
            },
          ],
        },
      ],
      background: "dark",
      imagePosition: "right",
    },

    // ── Itinerary ──
    {
      _type: "retreatItinerary",
      _key: key(),
      heading: "Example Retreat Program",
      subtext:
        "A week of surf, wellness, culture and connection — fully customisable to your retreat theme.",
      background: "dark-lighter",
      days: [
        {
          _type: "object",
          _key: key(),
          dayNumber: 1,
          dayName: "Saturday",
          theme: "Arrival",
          activities: [
            { _type: "object", _key: key(), title: "Pick-Up from the Airport" },
            {
              _type: "object",
              _key: key(),
              time: "16:00",
              title: "Welcoming at the location with free coconut",
            },
            {
              _type: "object",
              _key: key(),
              time: "18:00",
              title: "Yoga Session",
              category: "Yoga",
            },
            {
              _type: "object",
              _key: key(),
              time: "19:00",
              title: "All you can eat BBQ — Cocktails, Games and more",
            },
          ],
        },
        {
          _type: "object",
          _key: key(),
          dayNumber: 2,
          dayName: "Sunday",
          theme: "First Waves",
          activities: [
            { _type: "object", _key: key(), time: "06:00", title: "Breakfast" },
            {
              _type: "object",
              _key: key(),
              time: "07:00",
              title: "2x 2-hour Surf Session",
              category: "Surf",
            },
            {
              _type: "object",
              _key: key(),
              time: "16:00",
              title: "Sunday Hatch Market",
              category: "Culture",
            },
            {
              _type: "object",
              _key: key(),
              time: "19:00",
              title: "Family Pizza Night",
            },
            {
              _type: "object",
              _key: key(),
              time: "21:00",
              title: "Heading to Single Fin and celebrate the weekend",
            },
          ],
        },
        {
          _type: "object",
          _key: key(),
          dayNumber: 3,
          dayName: "Monday",
          theme: "Surf & Recover",
          activities: [
            { _type: "object", _key: key(), time: "06:00", title: "Breakfast" },
            {
              _type: "object",
              _key: key(),
              time: "07:00",
              title: "2x 2-hour Surf Session",
              category: "Surf",
            },
            { _type: "object", _key: key(), time: "13:00", title: "Lunch" },
            {
              _type: "object",
              _key: key(),
              time: "15:00",
              title: "Ice Bath / Sauna Session in Uluwatu",
              category: "Wellness",
            },
            { _type: "object", _key: key(), time: "19:00", title: "Dinner" },
            {
              _type: "object",
              _key: key(),
              time: "20:00",
              title: "Video Analysis",
              category: "Surf",
            },
          ],
        },
        {
          _type: "object",
          _key: key(),
          dayNumber: 4,
          dayName: "Tuesday",
          theme: "Mind & Body",
          activities: [
            { _type: "object", _key: key(), time: "06:00", title: "Breakfast" },
            {
              _type: "object",
              _key: key(),
              time: "07:00",
              title: "2x 2-hour Surf Session",
              category: "Surf",
            },
            {
              _type: "object",
              _key: key(),
              time: "15:00",
              title: "Pool Training",
              category: "Surf",
            },
            {
              _type: "object",
              _key: key(),
              time: "18:00",
              title: "Yoga with Purification Ritual and traditional Balinese meal",
              category: "Culture",
            },
          ],
        },
        {
          _type: "object",
          _key: key(),
          dayNumber: 5,
          dayName: "Wednesday",
          theme: "Explore Bali",
          activities: [
            { _type: "object", _key: key(), time: "06:00", title: "Breakfast" },
            {
              _type: "object",
              _key: key(),
              time: "07:00",
              title: "Ubud Trip — rice terraces, waterfall and more",
              category: "Culture",
            },
            {
              _type: "object",
              _key: key(),
              time: "18:00",
              title: "Relaxing Yoga Session",
              category: "Yoga",
            },
            { _type: "object", _key: key(), time: "19:00", title: "Dinner" },
            {
              _type: "object",
              _key: key(),
              time: "20:00",
              title: "Video Analysis",
              category: "Surf",
            },
          ],
        },
        {
          _type: "object",
          _key: key(),
          dayNumber: 6,
          dayName: "Thursday",
          theme: "Adventure Day",
          activities: [
            { _type: "object", _key: key(), time: "06:00", title: "Breakfast" },
            {
              _type: "object",
              _key: key(),
              time: "07:00",
              title: "2x 2-hour Surf Session",
              category: "Surf",
            },
            {
              _type: "object",
              _key: key(),
              time: "15:00",
              title: "Breathholding Class",
              category: "Wellness",
            },
            {
              _type: "object",
              _key: key(),
              time: "17:00",
              title: "Uluwatu Fire Dance Show",
              category: "Culture",
            },
            { _type: "object", _key: key(), time: "19:00", title: "Dinner" },
            {
              _type: "object",
              _key: key(),
              time: "20:00",
              title: "Surf Theory",
              category: "Surf",
            },
            {
              _type: "object",
              _key: key(),
              time: "21:00",
              title: "Night Out with best live music in town",
            },
          ],
        },
        {
          _type: "object",
          _key: key(),
          dayNumber: 7,
          dayName: "Friday",
          theme: "Final Session",
          activities: [
            {
              _type: "object",
              _key: key(),
              time: "09:00",
              title: "Morning Yoga Session",
              category: "Yoga",
            },
            { _type: "object", _key: key(), time: "10:00", title: "Breakfast" },
            {
              _type: "object",
              _key: key(),
              time: "15:00",
              title: "Sunset Surf Session",
              category: "Surf",
            },
            {
              _type: "object",
              _key: key(),
              time: "18:00",
              title: "Yoga at the beach",
              category: "Yoga",
            },
            { _type: "object", _key: key(), time: "19:00", title: "Dinner" },
            {
              _type: "object",
              _key: key(),
              time: "20:00",
              title: "Video Analysis",
              category: "Surf",
            },
          ],
        },
        {
          _type: "object",
          _key: key(),
          dayNumber: 8,
          dayName: "Saturday",
          theme: "Departure",
          activities: [
            {
              _type: "object",
              _key: key(),
              time: "06:00–10:00",
              title: "Breakfast",
            },
            {
              _type: "object",
              _key: key(),
              title: "Drop-Off to the Airport",
            },
          ],
        },
      ],
    },

    // ── Stats Bar ──
    {
      _type: "retreatStatsBar",
      _key: key(),
      background: "dark",
      stats: [
        {
          _type: "object",
          _key: key(),
          value: "22",
          label: "Years of Experience",
        },
        {
          _type: "object",
          _key: key(),
          value: "80k",
          label: "Happy Guests",
          prefix: "More than",
        },
        {
          _type: "object",
          _key: key(),
          value: "6",
          label: "Locations Worldwide",
        },
        {
          _type: "object",
          _key: key(),
          value: "12",
          label: "TripAdvisor Awards",
        },
      ],
    },

    // ── Testimonials ──
    {
      _type: "retreatTestimonials",
      _key: key(),
      heading: "What Retreat Hosts Say",
      background: "dark-lighter",
      testimonials: [
        {
          _type: "object",
          _key: key(),
          quote:
            "Rapture Camps made hosting my retreat completely effortless. The location was stunning, the team handled everything behind the scenes, and my group had the experience of a lifetime.",
          authorName: "Sarah L.",
          authorRole: "Yoga & Wellness Retreat Host",
        },
        {
          _type: "object",
          _key: key(),
          quote:
            "I've hosted retreats in five different countries, and Rapture Camps in Bali is by far the smoothest operation I've experienced. Truly plug and play.",
          authorName: "Marco R.",
          authorRole: "Fitness & Mindset Coach",
        },
        {
          _type: "object",
          _key: key(),
          quote:
            "My community still talks about this trip months later. The surf, the food, the setting — everything was dialed in. I just had to show up with my content plan.",
          authorName: "Jess K.",
          authorRole: "Content Creator & Community Builder",
        },
      ],
    },
  ],
  seo: {
    _type: "seo",
    metaTitle: "Host a Retreat in Bali · Rapture Surfcamps",
    metaDescription:
      "Partner with Rapture Surfcamps to host unforgettable surf, yoga, and wellness retreats at our Green Bowl, Bali location. Plug & play setup, full logistics support, you host for free.",
  },
};

async function main() {
  try {
    const existing = await client.fetch(
      `*[_type == "page" && slug.current == "host-a-retreat"][0]._id`
    );

    if (existing) {
      console.log(`Document already exists with _id: ${existing}. Replacing...`);
      await client.delete(existing);
    }

    const result = await client.createOrReplace(doc);
    console.log(`Created document: ${result._id}`);
  } catch (err) {
    console.error("Failed to create document:", err.message || err);
  }
}

main();
