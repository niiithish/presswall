import { describe, expect, test } from "bun:test";
import {
  BANNER_STYLE_OPTIONS,
  normalizeBannerStyleLayout,
  usesAboveStripHeading,
  usesInlineMarqueeHeading,
} from "@/lib/banner-style";
import { getResolvedPresswallTemplateConfig } from "@/lib/presswall-templates";

describe("normalizeBannerStyleLayout", () => {
  test("maps non-marquee layouts to static grid", () => {
    expect(normalizeBannerStyleLayout("grid")).toBe("bar");
    expect(normalizeBannerStyleLayout("bar")).toBe("bar");
  });

  test("preserves marquee layout", () => {
    expect(normalizeBannerStyleLayout("marquee")).toBe("marquee");
  });
});

describe("BANNER_STYLE_OPTIONS", () => {
  test("exposes marquee and static grid choices", () => {
    expect(BANNER_STYLE_OPTIONS.map((option) => option.layout)).toEqual([
      "marquee",
      "bar",
    ]);
  });
});

describe("marquee heading placement", () => {
  test("keeps centered template headings above the scrolling strip", () => {
    const classicMarquee = {
      ...getResolvedPresswallTemplateConfig("classic"),
      layout: "marquee" as const,
    };

    expect(usesInlineMarqueeHeading(classicMarquee)).toBe(false);
    expect(usesAboveStripHeading(classicMarquee)).toBe(true);
  });

  test("keeps the auto-scroll template heading inline", () => {
    const marqueeTemplate = getResolvedPresswallTemplateConfig("marquee");

    expect(usesInlineMarqueeHeading(marqueeTemplate)).toBe(true);
    expect(usesAboveStripHeading(marqueeTemplate)).toBe(false);
  });
});
