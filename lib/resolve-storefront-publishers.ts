import { isBundledPublisherId } from "@/lib/bundled-publishers";
import type {
  PresswallConfig,
  PublisherCatalogItem,
  ShopPublisherSelection,
  StorefrontPublisher,
} from "@/lib/presswall-types";
import { isSafeHttpUrl } from "@/lib/presswall-validation";
import { absoluteBundledLogoUrl } from "@/lib/publisher-logo-path";
import { sanitizeSvg } from "@/lib/svg-sanitize";

function resolvePublisherUrl(
  customUrl: string | undefined,
  fallbackUrl: string | null
): string | null {
  const candidate = customUrl || fallbackUrl;
  if (!candidate) {
    return null;
  }

  return isSafeHttpUrl(candidate) ? candidate : null;
}

export function resolveStorefrontPublishers(
  _config: PresswallConfig,
  catalog: PublisherCatalogItem[],
  selections: ShopPublisherSelection[]
): StorefrontPublisher[] {
  const catalogById = new Map(catalog.map((item) => [item.id, item]));

  return selections
    .map((selection, index): StorefrontPublisher | null => {
      if (selection.publisherId) {
        const publisher = catalogById.get(selection.publisherId);
        if (!publisher) {
          return null;
        }

        return {
          id: publisher.id,
          isCustom: false,
          name: publisher.name,
          logoImageUrl: isBundledPublisherId(publisher.id)
            ? absoluteBundledLogoUrl(publisher.id)
            : null,
          logoSvg: "",
          url: resolvePublisherUrl(selection.customUrl, publisher.websiteUrl),
        };
      }

      if (!selection.customName?.trim()) {
        return null;
      }

      return {
        id: `custom-${index}`,
        isCustom: true,
        name: selection.customName.trim(),
        logoImageUrl: null,
        logoSvg: sanitizeSvg(selection.customLogoSvg ?? ""),
        url: resolvePublisherUrl(selection.customUrl, null),
      };
    })
    .filter(
      (publisher): publisher is StorefrontPublisher => publisher !== null
    );
}
