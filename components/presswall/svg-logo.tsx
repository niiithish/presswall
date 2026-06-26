"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";
import { sanitizeSvg } from "@/lib/svg-sanitize";
import { cn } from "@/lib/utils";

const SVG_ROOT = /<svg[\s>]/i;

interface SvgLogoProps {
  className?: string;
  style?: React.CSSProperties;
  svg: string;
}

function themeColor(resolvedTheme: string | undefined): string {
  return resolvedTheme === "dark" ? "#fafafa" : "#1a1a1a";
}

function prepareInlineSvg(svg: string): string {
  const sanitized = sanitizeSvg(svg);
  const cleaned = sanitized || svg.trim();

  if (!SVG_ROOT.test(cleaned)) {
    return "";
  }

  return cleaned.replaceAll('fill="#1a1a1a"', 'fill="currentColor"');
}

export function SvgLogo({ svg, className, style }: SvgLogoProps) {
  const { resolvedTheme } = useTheme();

  const html = useMemo(() => prepareInlineSvg(svg), [svg]);

  if (!(svg && html)) {
    return null;
  }

  return (
    <span
      className={cn(
        "presswall-svg-logo inline-flex h-[var(--logo-height,1.5rem)] w-auto max-w-full select-none items-center justify-center",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ color: themeColor(resolvedTheme), ...style }}
      suppressHydrationWarning
    />
  );
}
