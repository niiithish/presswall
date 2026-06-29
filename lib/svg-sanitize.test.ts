import { describe, expect, test } from "bun:test";
import { MAX_CUSTOM_LOGO_SVG_LENGTH } from "@/lib/presswall-validation";
import { sanitizeSvg } from "@/lib/svg-sanitize";

const SAFE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';

describe("sanitizeSvg", () => {
  test("returns trimmed safe svg unchanged", () => {
    expect(sanitizeSvg(`  ${SAFE_SVG}  `)).toBe(SAFE_SVG);
  });

  test("returns empty string for blank input", () => {
    expect(sanitizeSvg("   ")).toBe("");
  });

  test("returns empty string when svg root is missing", () => {
    expect(sanitizeSvg("<div>not svg</div>")).toBe("");
  });

  test("strips script tags and event handlers", () => {
    const malicious =
      '<svg onload="alert(1)"><script>alert(1)</script><rect width="1" height="1"/></svg>';

    expect(sanitizeSvg(malicious)).toBe(
      '<svg><rect width="1" height="1"/></svg>'
    );
  });

  test("strips foreignObject and javascript uris", () => {
    const malicious =
      '<svg><foreignObject><body xmlns="http://www.w3.org/1999/xhtml">x</body></foreignObject><a href="javascript:alert(1)"/></svg>';

    const cleaned = sanitizeSvg(malicious);
    expect(cleaned).not.toContain("foreignObject");
    expect(cleaned).not.toContain("javascript:");
    expect(cleaned).toContain("<svg");
  });

  test("truncates oversized svg", () => {
    const padding = "x".repeat(MAX_CUSTOM_LOGO_SVG_LENGTH);
    const oversized = `<svg>${padding}</svg>`;

    expect(sanitizeSvg(oversized).length).toBeLessThanOrEqual(
      MAX_CUSTOM_LOGO_SVG_LENGTH
    );
  });
});
