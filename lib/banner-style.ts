import type { PresswallConfig } from "@/lib/presswall-types";

export type BannerStyleLayout = "marquee" | "bar";

export interface BannerStyleOption {
  description: string;
  label: string;
  layout: BannerStyleLayout;
}

export const BANNER_STYLE_OPTIONS: BannerStyleOption[] = [
  {
    layout: "marquee",
    label: "Marquee",
    description: "Logos scroll continuously across the strip.",
  },
  {
    layout: "bar",
    label: "Static grid",
    description: "All logos visible in a fixed row.",
  },
];

export function normalizeBannerStyleLayout(
  layout: PresswallConfig["layout"]
): BannerStyleLayout {
  if (layout === "marquee") {
    return "marquee";
  }

  return "bar";
}

export function isBannerStyleLayout(
  layout: PresswallConfig["layout"]
): layout is BannerStyleLayout {
  return layout === "marquee" || layout === "bar";
}

export function usesInlineMarqueeHeading(
  config: Pick<
    PresswallConfig,
    "headingAlignment" | "headingText" | "layout" | "showHeading"
  >
): boolean {
  return (
    config.layout === "marquee" &&
    config.showHeading &&
    config.headingText.length > 0 &&
    config.headingAlignment === "left"
  );
}

export function usesAboveStripHeading(
  config: Pick<
    PresswallConfig,
    "headingAlignment" | "headingText" | "layout" | "showHeading"
  >
): boolean {
  return (
    config.showHeading &&
    config.headingText.length > 0 &&
    !usesInlineMarqueeHeading(config)
  );
}
