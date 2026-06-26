"use client";

import { PresswallPreview } from "@/components/presswall/preview";
import type {
  PresswallConfig,
  PublisherCatalogItem,
  ShopPublisherSelection,
} from "@/lib/presswall-types";

interface PreviewPairProps {
  catalog: PublisherCatalogItem[];
  config: PresswallConfig;
  selections: ShopPublisherSelection[];
}

export function PresswallPreviewPair({
  config,
  catalog,
  selections,
}: PreviewPairProps) {
  return (
    <PresswallPreview
      catalog={catalog}
      config={config}
      selections={selections}
    />
  );
}
