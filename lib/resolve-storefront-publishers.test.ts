import { describe, expect, test } from "bun:test";
import type { PublisherCatalogItem } from "@/lib/presswall-types";
import { resolveStorefrontPublishers } from "@/lib/resolve-storefront-publishers";

const catalog: PublisherCatalogItem[] = [
  {
    id: "techcrunch",
    name: "TechCrunch",
    category: "Tech",
    websiteUrl: "https://techcrunch.com",
    logoSvg: "",
    logoMonoSvg: "",
  },
];

const CUSTOM_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';

describe("resolveStorefrontPublishers", () => {
  test("resolves bundled publishers from catalog", () => {
    const publishers = resolveStorefrontPublishers(catalog, [
      { publisherId: "techcrunch", position: 0 },
    ]);

    expect(publishers).toHaveLength(1);
    expect(publishers[0]).toMatchObject({
      id: "techcrunch",
      isCustom: false,
      name: "TechCrunch",
      logoSvg: "",
    });
    expect(publishers[0]?.logoImageUrl).toContain("techcrunch");
  });

  test("drops unknown bundled publisher ids", () => {
    const publishers = resolveStorefrontPublishers(catalog, [
      { publisherId: "missing-outlet", position: 0 },
    ]);

    expect(publishers).toHaveLength(0);
  });

  test("resolves custom outlets with sanitized svg", () => {
    const publishers = resolveStorefrontPublishers(catalog, [
      {
        customName: "Local Podcast",
        customLogoSvg: CUSTOM_SVG,
        position: 0,
      },
    ]);

    expect(publishers).toHaveLength(1);
    expect(publishers[0]).toMatchObject({
      id: "custom-0",
      isCustom: true,
      name: "Local Podcast",
      logoImageUrl: null,
      logoSvg: CUSTOM_SVG,
    });
  });

  test("drops custom outlets without a name", () => {
    const publishers = resolveStorefrontPublishers(catalog, [
      {
        customLogoSvg: CUSTOM_SVG,
        position: 0,
      },
    ]);

    expect(publishers).toHaveLength(0);
  });

  test("sanitizes malicious custom svg before storefront render", () => {
    const publishers = resolveStorefrontPublishers(catalog, [
      {
        customName: "Unsafe",
        customLogoSvg:
          '<svg onload="alert(1)"><script>alert(1)</script><rect width="1" height="1"/></svg>',
        position: 0,
      },
    ]);

    expect(publishers[0]?.logoSvg).not.toContain("script");
    expect(publishers[0]?.logoSvg).not.toContain("onload");
  });
});
