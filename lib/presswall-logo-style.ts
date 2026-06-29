import { shouldInvertLogos } from "@/lib/presswall-logo-contrast";
import type { PresswallConfig } from "@/lib/presswall-types";

interface LogoImageStyleOptions {
  previewIsDark?: boolean;
}

function buildLogoFilter(
  config: PresswallConfig,
  options: LogoImageStyleOptions = {}
): string | undefined {
  const filters: string[] = [];

  if (config.colorMode === "muted" || config.colorMode === "mono") {
    filters.push("grayscale(100%)");
  }

  if (shouldInvertLogos(config, options)) {
    filters.push("invert(1)");
  }

  return filters.length > 0 ? filters.join(" ") : undefined;
}

export function getLogoSlotStyle(
  logoHeight: number,
  maxWidth: number,
  logoStyle?: React.CSSProperties
): React.CSSProperties {
  return {
    ...logoStyle,
    "--logo-height": `${logoHeight}px`,
    "--logo-max-width": `${maxWidth}px`,
  } as React.CSSProperties;
}

export function getLogoImageStyle(
  config: PresswallConfig,
  options: LogoImageStyleOptions = {}
): React.CSSProperties | undefined {
  const filter = buildLogoFilter(config, options);

  if (config.colorMode === "muted") {
    return {
      ...(filter ? { filter } : {}),
      opacity: config.grayscaleOpacity / 100,
    };
  }

  if (config.colorMode === "mono") {
    return filter ? { filter } : undefined;
  }

  return;
}
