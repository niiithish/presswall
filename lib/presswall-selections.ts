import type {
  SelectedPublisher,
  ShopPublisherSelection,
} from "@/lib/presswall-types";

export function buildSelections(
  selected: SelectedPublisher[]
): ShopPublisherSelection[] {
  return selected.map((item, index) => ({
    publisherId: item.publisherId,
    customName: item.customName,
    customLogoSvg: item.customLogoSvg,
    customUrl: item.customUrl,
    position: index,
  }));
}

export function selectedFromApi(
  selections: ShopPublisherSelection[]
): SelectedPublisher[] {
  return selections.map((selection, index) => ({
    key: selection.publisherId ?? `custom-${index}`,
    publisherId: selection.publisherId,
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
