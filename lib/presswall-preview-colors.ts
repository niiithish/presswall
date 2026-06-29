import type { PresswallConfig } from "@/lib/presswall-types";

export const PREVIEW_LIGHT_TEXT = "#111111";
export const PREVIEW_DARK_TEXT = "#f5f5f5";
export const PREVIEW_DARK_BACKGROUND = "#111111";
export const PREVIEW_LIGHT_BACKGROUND = "#ffffff";

export function isTransparentBackground(backgroundColor: string): boolean {
  return backgroundColor.trim().toLowerCase() === "transparent";
}

export function getPreviewColors(
  config: PresswallConfig,
  isDark: boolean
): { backgroundColor: string; textColor: string } {
  if (isTransparentBackground(config.backgroundColor)) {
    return {
      backgroundColor: isDark
        ? PREVIEW_DARK_BACKGROUND
        : PREVIEW_LIGHT_BACKGROUND,
      textColor: isDark ? PREVIEW_DARK_TEXT : config.textColor,
    };
  }

  return {
    backgroundColor: config.backgroundColor,
    textColor: config.textColor,
  };
}

import { shouldInvertLogos } from "@/lib/presswall-logo-contrast";

export function shouldInvertLogosForPreview(
  config: PresswallConfig,
  isDark: boolean
): boolean {
  return shouldInvertLogos(config, { previewIsDark: isDark });
}
