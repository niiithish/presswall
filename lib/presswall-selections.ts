import type {
  SelectedPublisher,
  ShopPublisherSelection,
} from "@/lib/presswall-types";

export function buildSelections(
  selected: SelectedPublisher[]
): ShopPublisherSelection[] {
  return selected.map((item, index) => {
    if (item.customLogoId) {
      return {
        customLogoId: item.customLogoId,
        customUrl: item.customUrl,
        position: index,
      };
    }

    return {
      publisherId: item.publisherId,
      customName: item.customName,
      customLogoSvg: item.customLogoSvg,
      customUrl: item.customUrl,
      position: index,
    };
  });
}

export function selectedFromApi(
  selections: ShopPublisherSelection[]
): SelectedPublisher[] {
  return selections.map((selection, index) => ({
    key:
      selection.publisherId ??
      (selection.customLogoId
        ? `custom-${selection.customLogoId}`
        : `custom-${index}`),
    publisherId: selection.publisherId,
    customLogoId: selection.customLogoId,
    customName: selection.customName,
    customLogoSvg: selection.customLogoSvg,
    customUrl: selection.customUrl,
  }));
}

export function countUnavailableSelections(
  selected: SelectedPublisher[],
  catalogById: Map<string, { id: string }>
): number {
  return selected.filter(
    (item) => item.publisherId && !catalogById.has(item.publisherId)
  ).length;
}
