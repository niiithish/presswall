import { BUNDLED_PUBLISHERS } from "@/lib/bundled-publishers";

export type { BundledPublisher } from "@/lib/bundled-publishers";

const EMPTY_LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" aria-hidden="true"></svg>';

export function getSeedPublishers() {
  return BUNDLED_PUBLISHERS.map((publisher) => ({
    id: publisher.id,
    name: publisher.name,
    category: publisher.category,
    websiteUrl: publisher.websiteUrl,
    sortOrder: publisher.sortOrder,
    logoSvg: EMPTY_LOGO_SVG,
    logoMonoSvg: EMPTY_LOGO_SVG,
  }));
}

export const PUBLISHER_CATEGORIES = [
  "All",
  ...Array.from(
    new Set(BUNDLED_PUBLISHERS.map((publisher) => publisher.category))
  ).sort(),
] as const;

export const CUSTOM_LOGO_TIPS = [
  "Use a transparent PNG — avoid white or colored box backgrounds.",
  "Horizontal logos work best in the press bar and marquee layouts.",
  "Export at 2× resolution (e.g. 400px wide) so logos stay sharp on retina screens.",
  "Keep each PNG under 2 MB; smaller files upload faster.",
] as const;
