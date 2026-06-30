export type NormalizedPresswallLayout = "bar" | "marquee";

export function normalizePresswallLayout(
  layout: string | undefined
): NormalizedPresswallLayout {
  return layout === "marquee" ? "marquee" : "bar";
}
