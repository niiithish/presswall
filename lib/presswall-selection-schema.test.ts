import { describe, expect, test } from "bun:test";
import { shopPublisherSelectionSchema } from "@/lib/presswall-types";

const CUSTOM_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';

describe("shopPublisherSelectionSchema", () => {
  test("accepts bundled publisher selections", () => {
    const parsed = shopPublisherSelectionSchema.safeParse({
      publisherId: "techcrunch",
      position: 0,
    });

    expect(parsed.success).toBe(true);
  });

  test("accepts custom outlets with name and logo", () => {
    const parsed = shopPublisherSelectionSchema.safeParse({
      customName: "Local Podcast",
      customLogoSvg: CUSTOM_SVG,
      position: 1,
    });

    expect(parsed.success).toBe(true);
  });

  test("accepts custom outlets with library logo id", () => {
    const parsed = shopPublisherSelectionSchema.safeParse({
      customLogoId: "logo-123",
      position: 2,
    });

    expect(parsed.success).toBe(true);
  });

  test("rejects custom outlets without logo svg or library id", () => {
    const parsed = shopPublisherSelectionSchema.safeParse({
      customName: "Local Podcast",
      position: 1,
    });

    expect(parsed.success).toBe(false);
  });

  test("rejects selections with neither publisher nor custom outlet", () => {
    const parsed = shopPublisherSelectionSchema.safeParse({
      position: 0,
    });

    expect(parsed.success).toBe(false);
  });
});
