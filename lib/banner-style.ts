import { normalizePresswallLayout } from "@/lib/normalize-presswall-layout";
import type { PresswallConfig } from "@/lib/presswall-types";

export type BannerStyleLayout = "marquee" | "bar";

export interface BannerStyleOption {
  description: string;
  label: string;
  layout: BannerStyleLayout;
}

export const BANNER_STYLE_OPTIONS: BannerStyleOption[] = [
  {
    layout: "marquee",
    label: "Marquee",
    description: "Logos scroll continuously across the strip.",
  },
  {
    layout: "bar",
    label: "Static grid",
    description: "All logos visible in a fixed row.",
  },
];

export function normalizeBannerStyleLayout(
  layout: PresswallConfig["layout"] | string
): BannerStyleLayout {
  return normalizePresswallLayout(layout);
}

export function isBannerStyleLayout(
  layout: PresswallConfig["layout"] | string
): layout is BannerStyleLayout {
  const normalized = normalizePresswallLayout(layout);
  return normalized === "marquee" || normalized === "bar";
}
