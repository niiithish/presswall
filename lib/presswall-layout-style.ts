import type { PresswallConfig } from "@/lib/presswall-types";
import { cn } from "@/lib/utils";

const rowAlignmentClass = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
} as const;

export function getLogosRowGridStyle(
  logosPerRow: number,
  gap: number
): React.CSSProperties {
  return {
    gap: `${gap}px`,
    gridTemplateColumns: `repeat(${logosPerRow}, auto)`,
  };
}

export function getLogosRowGridClassName(
  alignment: PresswallConfig["alignment"]
): string {
  return cn("presswall-logo-row grid", rowAlignmentClass[alignment]);
}
