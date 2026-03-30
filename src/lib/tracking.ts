declare global {
  interface Window {
    dataLayer: Record<string, any>[];
    rcConsent?: { has: (key: string) => boolean };
  }
}

/**
 * Push a custom event to the GTM dataLayer.
 * Events are queued even before GTM loads — GTM replays them on init.
 */
export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...properties });
}

/**
 * Inline-safe version for use in <script is:inline> blocks
 * where imports aren't available. Copy this pattern directly.
 *
 * function rc(e,p){window.dataLayer=window.dataLayer||[];window.dataLayer.push(Object.assign({event:e},p||{}));}
 */
