import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MAX_CUSTOM_LOGO_SVG_LENGTH } from "@/lib/presswall-validation";

const THEME_MAX_CUSTOM_LOGO_SVG_LENGTH =
  /const MAX_CUSTOM_LOGO_SVG_LENGTH = 50[,_]?000;/;

describe("theme bundle parity", () => {
  test("keeps custom logo svg length limit in sync with theme JS", () => {
    const themeJs = readFileSync(
      join(process.cwd(), "extensions/presswall-theme/assets/presswall.js"),
      "utf8"
    );

    expect(themeJs).toMatch(THEME_MAX_CUSTOM_LOGO_SVG_LENGTH);
    expect(MAX_CUSTOM_LOGO_SVG_LENGTH).toBe(50_000);
  });
});
