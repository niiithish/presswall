"use client";

import {
  type Icon,
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { PresswallAlignment } from "@/lib/presswall-types";
import { cn } from "@/lib/utils";

export function sliderValue(value: number | readonly number[]): number {
  if (typeof value === "number") {
    return value;
  }
  return value[0] ?? 0;
}

export const ALIGNMENT_OPTIONS: {
  value: PresswallAlignment;
  icon: Icon;
  label: string;
}[] = [
  { value: "left", icon: IconAlignLeft, label: "Left" },
  { value: "center", icon: IconAlignCenter, label: "Center" },
  { value: "right", icon: IconAlignRight, label: "Right" },
];

export function ValueBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 rounded-md border bg-background px-1.5 py-0.5 font-medium text-[0.6875rem] text-muted-foreground tabular-nums">
      {children}
    </span>
  );
}

interface SliderFieldProps {
  disabled?: boolean;
  hint?: string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  unit?: string;
  value: number;
}

export function SliderField({
  disabled,
  hint,
  label,
  max,
  min,
  onChange,
  step,
  unit = "px",
  value,
}: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <ValueBadge>
          {value}
          {unit}
        </ValueBadge>
      </div>
      {hint ? (
        <p className="text-muted-foreground text-xs leading-relaxed">{hint}</p>
      ) : null}
      <Slider
        disabled={disabled}
        max={max}
        min={min}
        onValueChange={(next) => onChange(sliderValue(next))}
        step={step}
        value={[value]}
      />
    </div>
  );
}

interface SettingToggleProps {
  checked: boolean;
  description?: string;
  id: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}

export function SettingToggle({
  checked,
  description,
  id,
  label,
  onCheckedChange,
}: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 space-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        {description ? (
          <p className="text-muted-foreground text-xs leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      <Switch
        checked={checked}
        className="shrink-0"
        id={id}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

interface SegmentedAlignmentProps {
  onChange: (value: PresswallAlignment) => void;
  value: PresswallAlignment;
}

/**
 * Shared selected style for segmented controls.
 * Avoid `secondary` — it is nearly the same gray as Shopify admin background.
 */
export const segmentedSelectedClassName =
  "bg-foreground text-background hover:bg-foreground/90 hover:text-background";

export const segmentedIdleClassName =
  "text-muted-foreground hover:bg-muted/60 hover:text-foreground";

export function SegmentedAlignment({
  onChange,
  value,
}: SegmentedAlignmentProps) {
  return (
    <fieldset className="flex w-full rounded-lg border border-border bg-card p-0.5 shadow-xs">
      {ALIGNMENT_OPTIONS.map((option) => {
        const AlignIcon = option.icon;
        const isSelected = value === option.value;

        return (
          <Button
            aria-label={option.label}
            aria-pressed={isSelected}
            className={cn(
              "h-8 min-w-0 flex-1 gap-1.5 px-2 text-xs shadow-none",
              isSelected ? segmentedSelectedClassName : segmentedIdleClassName
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            size="sm"
            type="button"
            variant="ghost"
          >
            <AlignIcon className="size-3.5 shrink-0" stroke={2} />
            <span className="truncate">{option.label}</span>
          </Button>
        );
      })}
    </fieldset>
  );
}
