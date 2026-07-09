"use client";

import {
  BANNER_STYLE_OPTIONS,
  type BannerStyleLayout,
} from "@/lib/banner-style";
import { cn } from "@/lib/utils";

interface BannerStylePickerProps {
  onChange: (layout: BannerStyleLayout) => void;
  value: BannerStyleLayout;
}

function MarqueeIllustration({ active }: { active: boolean }) {
  const squareClass = cn(
    "size-3 rounded-[2px]",
    active ? "bg-foreground/70" : "bg-muted-foreground/20"
  );

  return (
    <div className="relative flex h-10 items-center justify-center gap-1 px-3">
      <span
        aria-hidden
        className={cn(
          "absolute left-1 text-[10px]",
          active ? "text-foreground/50" : "text-muted-foreground/35"
        )}
      >
        ‹
      </span>
      <span className={cn(squareClass, active && "opacity-40")} />
      <span className={squareClass} />
      <span className={cn(squareClass, active && "opacity-40")} />
      <span className={cn(squareClass, active && "opacity-25")} />
      <span
        aria-hidden
        className={cn(
          "absolute right-1 text-[10px]",
          active ? "text-foreground/50" : "text-muted-foreground/35"
        )}
      >
        ›
      </span>
    </div>
  );
}

function StaticGridIllustration({ active }: { active: boolean }) {
  const squareClass = cn(
    "size-3 rounded-[2px]",
    active ? "bg-foreground" : "bg-muted-foreground/25"
  );

  return (
    <div className="flex h-10 items-center justify-center gap-1.5 px-3">
      <span className={squareClass} />
      <span className={squareClass} />
      <span className={squareClass} />
      <span className={squareClass} />
    </div>
  );
}

const ILLUSTRATIONS = {
  marquee: MarqueeIllustration,
  bar: StaticGridIllustration,
} as const;

export function BannerStylePicker({ onChange, value }: BannerStylePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {BANNER_STYLE_OPTIONS.map((option) => {
        const isSelected = value === option.layout;
        const Illustration = ILLUSTRATIONS[option.layout];

        return (
          <button
            aria-pressed={isSelected}
            className="group flex flex-col items-center gap-1.5 text-center"
            key={option.layout}
            onClick={() => onChange(option.layout)}
            title={option.description}
            type="button"
          >
            <span
              className={cn(
                "w-full rounded-lg border bg-card px-1 py-1 shadow-xs transition-all",
                isSelected
                  ? "border-foreground bg-foreground/[0.06] ring-2 ring-foreground/30"
                  : "border-border hover:border-foreground/25 hover:bg-muted/40"
              )}
            >
              <Illustration active={isSelected} />
            </span>
            <span
              className={cn(
                "text-xs leading-tight",
                isSelected
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
