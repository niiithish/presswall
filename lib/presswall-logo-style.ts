import type { PresswallConfig } from "@/lib/presswall-types";

export function getLogoImageStyle(
  config: PresswallConfig
): React.CSSProperties | undefined {
  if (config.colorMode === "muted") {
    return {
      filter: "grayscale(100%)",
      opacity: config.grayscaleOpacity / 100,
    };
  }

  if (config.colorMode === "mono") {
    return { filter: "grayscale(100%)" };
  }

  return;
}
