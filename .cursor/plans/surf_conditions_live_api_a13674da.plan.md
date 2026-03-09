---
name: Surf conditions live API
overview: Integrate the Open-Meteo Marine Weather API to show live surf forecast data (wave height, period, direction, water temperature) on each camp's surf page, replacing the hardcoded "Surf Conditions" card with a mix of static camp info and real-time data.
todos:
  - id: add-coords
    content: Add latitude/longitude to Destination type and populate for all 9 camps in data.ts
    status: completed
  - id: update-surf-card
    content: Redesign the Surf Conditions card with static + live data rows, data attributes for coordinates, and a 'Live' badge
    status: completed
  - id: client-script
    content: Add inline script to fetch Open-Meteo Marine API on page load and update live rows with real data
    status: completed
  - id: fallback
    content: Ensure graceful fallback to static values if API call fails or is slow
    status: completed
isProject: false
---

# Live Surf Conditions via Open-Meteo Marine API

## Feasibility: Very Easy

The Open-Meteo Marine API is ideal for this:

- **Free**, no API key needed, no rate limit concerns at build volume
- Returns wave height, wave period, wave direction, swell data, and sea surface temperature
- Simple REST endpoint: `https://marine-api.open-meteo.com/v1/marine?latitude=X&longitude=Y&current=wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period,swell_wave_direction,sea_surface_temperature`
- JSON response, no auth headers

## Architecture Decision: Build-time + Client-side Refresh

Since the site is static (`output: "static"`), there are two approaches:

- **Option A: Build-time only** — fetch at build, data is baked into HTML. Stale after deploy.
- **Option B: Client-side fetch** — a small inline script fetches the API on page load and populates the UI. Always fresh.

**Recommended: Option B (client-side).** Surf conditions change hourly, so stale build-time data would be misleading. The API is free, fast, and CORS-enabled, so a lightweight client-side fetch is perfect.

## Data Mapping

Each destination needs coordinates added to [src/lib/data.ts](src/lib/data.ts) in the `Destination` interface:

- Green Bowl, Bali: `-8.81, 115.14`
- Padang Padang, Bali: `-8.81, 115.10`
- Avellanas, Costa Rica: `10.26, -85.84`
- Ericeira, Portugal: `38.96, -9.42`
- Coxos Surf Villa, Portugal: `38.98, -9.42`
- Milfontes, Portugal: `37.72, -8.79`
- Banana Village, Morocco: `29.35, -10.17`
- Playa Maderas, Nicaragua: `11.44, -85.85`
- Maderas Surf Resort, Nicaragua: `11.44, -85.85`

## API Call

```
https://marine-api.open-meteo.com/v1/marine
  ?latitude=-8.81
  &longitude=115.14
  &current=wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period,swell_wave_direction,sea_surface_temperature
  &timezone=auto
```

Returns:

```json
{
  "current": {
    "wave_height": 1.8,
    "wave_period": 9.2,
    "wave_direction": 195,
    "swell_wave_height": 1.5,
    "swell_wave_period": 12.1,
    "swell_wave_direction": 200,
    "sea_surface_temperature": 27.3
  }
}
```

## UI Changes to [src/pages/surfcamp/[country]/[camp]/surf.astro](src/pages/surfcamp/[country]/[camp]/surf.astro)

The current "Surf Conditions" card (lines 129-153) has 5 static rows. The new design:

- **Keep static rows**: Wave Type, Peak Season, Surf Spots Within Reach (these are camp-specific, not API-driven)
- **Replace with live data**: Water Temperature, Swell Direction
- **Add new live rows**: Wave Height, Wave Period, Swell Height, Swell Period
- Add a small "Live" badge with a green dot next to the heading
- Add a `data-lat` and `data-lng` attribute to the card, read by the inline script
- Skeleton/placeholder state while loading, graceful fallback to static values if API fails
- Small timestamp at the bottom: "Updated just now" or similar

## Implementation Steps

1. Add `latitude` and `longitude` to the `Destination` type and populate for all 9 camps in `data.ts`
2. Pass coordinates from the surf page to the conditions card via data attributes
3. Render the card with static rows + placeholder live rows (showing the current hardcoded values as defaults)
4. Add an inline script that fetches the Open-Meteo API on page load and updates the DOM
5. Add a helper to convert wave direction degrees to compass labels (e.g., 195 -> "SSW")

