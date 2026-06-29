import { describe, expect, test } from "bun:test";
import { customLogoSvgDataUrl } from "@/lib/custom-logo-render";

const EMBEDDED_PNG_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><image href="data:image/png;base64,iVBORw0KGgo=" width="100" height="50"/></svg>';

describe("customLogoSvgDataUrl", () => {
  test("encodes embedded png svg logos for img rendering", () => {
    const dataUrl = customLogoSvgDataUrl(EMBEDDED_PNG_SVG);

    expect(dataUrl?.startsWith("data:image/svg+xml,")).toBe(true);
    expect(
      decodeURIComponent(dataUrl?.replace("data:image/svg+xml,", "") ?? "")
    ).toContain("<image");
  });

  test("returns null for invalid svg", () => {
    expect(customLogoSvgDataUrl("<div>nope</div>")).toBeNull();
  });
});
