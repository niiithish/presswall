"use client";

import {
  type Icon,
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconChevronDown,
} from "@tabler/icons-react";
import { useState } from "react";
import { ColorField } from "@/components/presswall/color-field";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { PresswallConfig } from "@/lib/presswall-types";
import { cn } from "@/lib/utils";

function sliderValue(value: number | readonly number[]): number {
  if (typeof value === "number") {
    return value;
  }
  return value[0] ?? 0;
}

const ALIGNMENT_OPTIONS: {
  value: PresswallConfig["alignment"];
  icon: Icon;
  label: string;
}[] = [
  { value: "left", icon: IconAlignLeft, label: "Left" },
  { value: "center", icon: IconAlignCenter, label: "Center" },
  { value: "right", icon: IconAlignRight, label: "Right" },
];

type CustomSectionId = "heading" | "layout" | "look" | "spacing";

const DEFAULT_OPEN_SECTIONS: Record<CustomSectionId, boolean> = {
  heading: true,
  layout: true,
  look: false,
  spacing: false,
};

interface OnboardingTemplateCustomControlsProps {
  config: PresswallConfig;
  onUpdate: <K extends keyof PresswallConfig>(
    key: K,
    value: PresswallConfig[K]
  ) => void;
}

function ControlSection({
  children,
  onOpenChange,
  open,
  title,
}: {
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}) {
  return (
    <Collapsible
      className="border-b border-b-border/60 pb-3 last:border-b-0"
      onOpenChange={onOpenChange}
      open={open}
    >
      <CollapsibleTrigger
        className="flex w-full items-center justify-between gap-2 rounded-md py-1.5 text-left transition-colors hover:text-foreground"
        type="button"
      >
        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          {title}
        </span>
        <IconChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
          stroke={2}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function OnboardingTemplateCustomControls({
  config,
  onUpdate,
}: OnboardingTemplateCustomControlsProps) {
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN_SECTIONS);

  const setSectionOpen = (id: CustomSectionId, open: boolean) => {
    setOpenSections((current) => ({ ...current, [id]: open }));
  };

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="space-y-3 p-4">
        <ControlSection
          onOpenChange={(open) => setSectionOpen("heading", open)}
          open={openSections.heading}
          title="Heading"
        >
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <Label className="text-sm" htmlFor="onboarding-show-heading">
              Show heading
            </Label>
            <Switch
              checked={config.showHeading}
              id="onboarding-show-heading"
              onCheckedChange={(checked) => onUpdate("showHeading", checked)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm" htmlFor="onboarding-heading-text">
              Heading text
            </Label>
            <Input
              disabled={!config.showHeading}
              id="onboarding-heading-text"
              onChange={(event) => onUpdate("headingText", event.target.value)}
              placeholder="As seen on"
              value={config.headingText}
            />
          </div>

          {config.showHeading || config.layout === "bar" ? (
            <div className="grid gap-1.5">
              <Label className="text-sm">Alignment</Label>
              <p className="text-muted-foreground text-xs">
                {config.layout === "bar"
                  ? "Heading and horizontal logo bar"
                  : "Heading position"}
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {ALIGNMENT_OPTIONS.map((option) => {
                  const AlignIcon = option.icon;
                  const isSelected = config.alignment === option.value;

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={cn(
                        "flex min-w-0 flex-col items-center justify-center gap-1 rounded-md border px-1 py-2 text-center transition-colors",
                        isSelected
                          ? "border-ring bg-muted text-foreground"
                          : "border-border bg-background text-foreground hover:bg-muted/50"
                      )}
                      key={option.value}
                      onClick={() => onUpdate("alignment", option.value)}
                      type="button"
                    >
                      <AlignIcon className="size-3.5 shrink-0" stroke={2} />
                      <span className="w-full truncate text-[0.625rem] leading-none">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </ControlSection>

        <ControlSection
          onOpenChange={(open) => setSectionOpen("layout", open)}
          open={openSections.layout}
          title="Layout"
        >
          <div className="grid gap-1.5">
            <Label className="text-sm">Layout type</Label>
            <Select
              onValueChange={(value) =>
                onUpdate("layout", value as PresswallConfig["layout"])
              }
              value={config.layout}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Horizontal bar</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="marquee">Auto-scroll</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.layout === "bar" || config.layout === "grid" ? (
            <div className="grid gap-1.5">
              <Label className="text-sm">
                Logos per row ({config.logosPerRow})
              </Label>
              <Slider
                max={8}
                min={2}
                onValueChange={(value) =>
                  onUpdate("logosPerRow", sliderValue(value))
                }
                step={1}
                value={[config.logosPerRow]}
              />
            </div>
          ) : null}
        </ControlSection>

        <ControlSection
          onOpenChange={(open) => setSectionOpen("look", open)}
          open={openSections.look}
          title="Look"
        >
          <div className="grid gap-1.5">
            <Label className="text-sm">Color mode</Label>
            <Select
              onValueChange={(value) =>
                onUpdate("colorMode", value as PresswallConfig["colorMode"])
              }
              value={config.colorMode}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mono">Black &amp; white</SelectItem>
                <SelectItem value="muted">Muted grayscale</SelectItem>
                <SelectItem value="color">Full color</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.colorMode === "muted" ? (
            <div className="grid gap-1.5">
              <Label className="text-sm">
                Muted opacity ({config.grayscaleOpacity}%)
              </Label>
              <Slider
                max={100}
                min={20}
                onValueChange={(value) =>
                  onUpdate("grayscaleOpacity", sliderValue(value))
                }
                step={5}
                value={[config.grayscaleOpacity]}
              />
            </div>
          ) : null}

          <ColorField
            allowTransparent
            id="onboarding-background-color"
            label="Background"
            onChange={(value) => onUpdate("backgroundColor", value)}
            value={config.backgroundColor}
          />
          <ColorField
            id="onboarding-text-color"
            label="Text color"
            onChange={(value) => onUpdate("textColor", value)}
            value={config.textColor}
          />
        </ControlSection>

        <ControlSection
          onOpenChange={(open) => setSectionOpen("spacing", open)}
          open={openSections.spacing}
          title="Spacing"
        >
          <div className="grid gap-1.5">
            <Label className="text-sm">
              Logo height ({config.logoHeight}px)
            </Label>
            <Slider
              max={80}
              min={16}
              onValueChange={(value) =>
                onUpdate("logoHeight", sliderValue(value))
              }
              step={2}
              value={[config.logoHeight]}
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm">Gap ({config.gap}px)</Label>
            <Slider
              max={64}
              min={8}
              onValueChange={(value) => onUpdate("gap", sliderValue(value))}
              step={2}
              value={[config.gap]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-sm">Padding Y ({config.paddingY}px)</Label>
              <Slider
                max={80}
                min={0}
                onValueChange={(value) =>
                  onUpdate("paddingY", sliderValue(value))
                }
                step={2}
                value={[config.paddingY]}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm">Padding X ({config.paddingX}px)</Label>
              <Slider
                max={80}
                min={0}
                onValueChange={(value) =>
                  onUpdate("paddingX", sliderValue(value))
                }
                step={2}
                value={[config.paddingX]}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm">
              Corner radius ({config.borderRadius}px)
            </Label>
            <Slider
              max={32}
              min={0}
              onValueChange={(value) =>
                onUpdate("borderRadius", sliderValue(value))
              }
              step={2}
              value={[config.borderRadius]}
            />
          </div>

          {config.layout === "marquee" ? (
            <div className="grid gap-1.5">
              <Label className="text-sm">
                Scroll speed ({config.marqueeSpeed}s)
              </Label>
              <Slider
                max={80}
                min={10}
                onValueChange={(value) =>
                  onUpdate("marqueeSpeed", sliderValue(value))
                }
                step={5}
                value={[config.marqueeSpeed]}
              />
            </div>
          ) : null}
        </ControlSection>
      </div>
    </ScrollArea>
  );
}
