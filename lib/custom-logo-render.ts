import { sanitizeSvg } from "@/lib/svg-sanitize";

const SVG_ROOT = /<svg[\s>]/i;

export function customLogoSvgDataUrl(svg: string): string | null {
  const sanitized = sanitizeSvg(svg);

  if (!(sanitized && SVG_ROOT.test(sanitized))) {
    return null;
  }

  return `data:image/svg+xml,${encodeURIComponent(sanitized)}`;
}
