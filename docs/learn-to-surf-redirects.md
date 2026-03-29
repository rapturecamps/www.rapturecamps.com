# Learn to Surf — Blog Overlap Audit

**Generated:** 2026-03-29
**Blog posts analyzed:** 332
**Learn to Surf topics:** 101

---

## 301 Redirects (Direct Topic Overlap)

These blog posts cover the same topic as a Learn to Surf lesson. Redirect the blog URL to the new lesson page to consolidate ranking signals.

| Blog Post | Blog URL | → Redirect To |
|-----------|----------|---------------|
| A Step-by-Step Guide On How To Pop Up On A Surfboard | `/blog/how-to-pop-up-on-a-surfboard` | `/learn-to-surf/surf-fundamentals/pop-up` |
| How to Perfect Your Surfboard Pop-up | `/blog/8-steps-on-how-to-pop-up-on-a-surfboard` | `/learn-to-surf/surf-fundamentals/pop-up` |
| Conquer the Waves: Mastering the Art of Wave Reading | `/blog/how-to-read-waves` | `/learn-to-surf/wave-knowledge/reading-waves` |
| A Beginner's Guide to Understanding the Basics of Reading a Wave | `/blog/basics-to-read-a-wave` | `/learn-to-surf/wave-knowledge/reading-waves` |
| 5 Mistakes Beginner Surfers Make (And How to Fix Them) | `/blog/common-surfing-mistakes` | `/learn-to-surf/surf-fundamentals/beginner-mistakes` |
| Surfing Mistakes (And Tips To Fix Them) | `/blog/mistakes-you-make-as-a-surfer-and-tips-on-how-to-fix-them` | `/learn-to-surf/surf-fundamentals/beginner-mistakes` |
| LEARN HOW TO DUCK DIVE | `/blog/learn-how-to-duck-dive` | `/learn-to-surf/paddling/duck-dive` |
| Duck Diving: Techniques For Surfers | `/blog/what-is-duck-diving` | `/learn-to-surf/paddling/duck-dive` |
| How To Take Wax Off A Surfboard: A Step-by-Step Guide | `/blog/how-to-take-wax-off-a-surfboard` | `/learn-to-surf/surf-equipment/waxing-rewax` |
| How To Wax A Surfboard: Step-by-Step Guide | `/blog/how-to-wax-a-surfboard` | `/learn-to-surf/surf-equipment/waxing-rewax` |
| The Unspoken Rules of Surfing – A Guide to Surf Etiquette | `/blog/surf-etiquette-for-surfers` | `/learn-to-surf/surf-etiquette/surf-etiquette` |
| Can The Diving Reflex Help You Stay Calm Underwater? | `/blog/what-is-the-diving-reflex` | `/learn-to-surf/surf-mindset/staying-calm-underwater` |
| Expert Surfing 101: Riding a Barrel | `/blog/barrel-riding-basics` | `/learn-to-surf/surf-maneuvers/barrel-riding` |
| How to Surf: Barrel Riding Tips | `/blog/how-to-surf-barrel-riding-tips` | `/learn-to-surf/surf-maneuvers/barrel-riding` |

## Cross-Link Opportunities (Keep Blog Post, Add Internal Links)

These blog posts have a related angle but are not direct duplicates. Add internal links from the blog post body to the relevant Learn to Surf lesson.

| Blog Post | Blog URL | Link To |
|-----------|----------|---------|
| Surfing For Beginners: How To Ride The Waves With Confidence | `/blog/surfing-for-beginners` | `/learn-to-surf/surf-fundamentals/first-waves`, `/learn-to-surf/surf-mindset/surf-confidence` |
| Surfing Safety: Tips for Staying Safe on Costa Rica's Waves | `/blog/surfing-safety-tips-in-costa-rica` | `/learn-to-surf/surf-etiquette/safety-basics` |
| 10 Surfing Safety Tips Everyone Should Know | `/blog/surfing-safety-in-ocean` | `/learn-to-surf/surf-etiquette/safety-basics` |
| How To Choose A Surfboard For Beginner Surfers? | `/blog/choosing-beginner-surfboards` | `/learn-to-surf/surf-equipment/surfboards-for-beginners` |
| How to Choose the Right Surfboard for You | `/blog/how-to-choose-the-right-surfboard-for-you` | `/learn-to-surf/surf-equipment/surfboards-for-beginners` |
| The Best Soft Top Surfboards For Beginners And Beyond | `/blog/the-best-soft-top-surfboards` | `/learn-to-surf/surf-equipment/surfboards-for-beginners` |
| A Guide To Different Types of Surfboards | `/blog/a-guide-to-different-types-of-surfboards` | `/learn-to-surf/surf-equipment/board-types` |
| How to Cutback: A Surfer's Guide | `/blog/how-to-cutback-a-surfers-guide` | `/learn-to-surf/surf-maneuvers/cutback` |
| Catch the Perfect Wave: A Beginner's Guide to Surfing in Ericeira | `/blog/beginners-guide-to-ericeira` | `/learn-to-surf/surf-fundamentals/first-waves` |

---

## Redirect Implementation

Add these to `vercel.json` under the `redirects` array:

```json
[
  {
    "source": "/blog/how-to-pop-up-on-a-surfboard",
    "destination": "/learn-to-surf/surf-fundamentals/pop-up",
    "permanent": true
  },
  {
    "source": "/blog/8-steps-on-how-to-pop-up-on-a-surfboard",
    "destination": "/learn-to-surf/surf-fundamentals/pop-up",
    "permanent": true
  },
  {
    "source": "/blog/how-to-read-waves",
    "destination": "/learn-to-surf/wave-knowledge/reading-waves",
    "permanent": true
  },
  {
    "source": "/blog/basics-to-read-a-wave",
    "destination": "/learn-to-surf/wave-knowledge/reading-waves",
    "permanent": true
  },
  {
    "source": "/blog/common-surfing-mistakes",
    "destination": "/learn-to-surf/surf-fundamentals/beginner-mistakes",
    "permanent": true
  },
  {
    "source": "/blog/mistakes-you-make-as-a-surfer-and-tips-on-how-to-fix-them",
    "destination": "/learn-to-surf/surf-fundamentals/beginner-mistakes",
    "permanent": true
  },
  {
    "source": "/blog/learn-how-to-duck-dive",
    "destination": "/learn-to-surf/paddling/duck-dive",
    "permanent": true
  },
  {
    "source": "/blog/what-is-duck-diving",
    "destination": "/learn-to-surf/paddling/duck-dive",
    "permanent": true
  },
  {
    "source": "/blog/how-to-take-wax-off-a-surfboard",
    "destination": "/learn-to-surf/surf-equipment/waxing-rewax",
    "permanent": true
  },
  {
    "source": "/blog/how-to-wax-a-surfboard",
    "destination": "/learn-to-surf/surf-equipment/waxing-rewax",
    "permanent": true
  },
  {
    "source": "/blog/surf-etiquette-for-surfers",
    "destination": "/learn-to-surf/surf-etiquette/surf-etiquette",
    "permanent": true
  },
  {
    "source": "/blog/what-is-the-diving-reflex",
    "destination": "/learn-to-surf/surf-mindset/staying-calm-underwater",
    "permanent": true
  },
  {
    "source": "/blog/barrel-riding-basics",
    "destination": "/learn-to-surf/surf-maneuvers/barrel-riding",
    "permanent": true
  },
  {
    "source": "/blog/how-to-surf-barrel-riding-tips",
    "destination": "/learn-to-surf/surf-maneuvers/barrel-riding",
    "permanent": true
  }
]
```

### Notes

- **14 blog posts** should be 301-redirected to their corresponding Learn to Surf lesson pages
- **9 blog posts** should receive internal link additions pointing to relevant Learn to Surf lessons
- German blog mirrors (`/de/blog/...`) should also redirect to the German Learn to Surf equivalents (`/de/learn-to-surf/...`)
- After implementing redirects, update the sitemap and submit to Google Search Console
- Monitor 404s for 2-4 weeks after deployment to catch any missed redirects
