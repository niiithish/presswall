import type { PresswallConfig } from "@/lib/presswall-types";

export type PresswallHeadingConfig = Pick<
  PresswallConfig,
  "headingAlignment" | "headingText" | "layout" | "showHeading"
>;

export function usesInlineMarqueeHeading(
  config: PresswallHeadingConfig
): boolean {
  return (
    config.layout === "marquee" &&
    config.showHeading &&
    config.headingText.length > 0 &&
    config.headingAlignment === "left"
  );
}

export function usesAboveStripHeading(config: PresswallHeadingConfig): boolean {
  return (
    config.showHeading &&
    config.headingText.length > 0 &&
    !usesInlineMarqueeHeading(config)
  );
}
