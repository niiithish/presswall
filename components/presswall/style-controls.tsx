"use client";

import {
  type Icon,
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
} from "@tabler/icons-react";
import { ColorField } from "@/components/presswall/color-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface StyleControlsProps {
  config: PresswallConfig;
  onUpdate: <K extends keyof PresswallConfig>(
    key: K,
    value: PresswallConfig[K]
  ) => void;
}

export function StyleControls({ config, onUpdate }: StyleControlsProps) {
  return (
    <Tabs defaultValue="content">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="style">Style</TabsTrigger>
        <TabsTrigger value="layout">Layout</TabsTrigger>
      </TabsList>

      <TabsContent className="mt-4 flex flex-col gap-4" value="content">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="show-heading">Show heading</Label>
            <p className="text-muted-foreground text-xs">
              Display a label above your logos
            </p>
          </div>
          <Switch
            checked={config.showHeading}
            id="show-heading"
            onCheckedChange={(checked) => onUpdate("showHeading", checked)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="heading-text">Heading text</Label>
          <Input
            disabled={!config.showHeading}
            id="heading-text"
            onChange={(event) => onUpdate("headingText", event.target.value)}
            placeholder="As seen on"
            value={config.headingText}
          />
        </div>

        <div className="grid gap-3 rounded-lg border p-3">
          <div>
            <p className="font-medium text-sm">Colors</p>
            <p className="text-muted-foreground text-xs">
              Set how the heading and bar look on your storefront. Use
              &ldquo;None&rdquo; for a transparent background.
            </p>
          </div>
          <ColorField
            allowTransparent
            id="background-color"
            label="Background"
            onChange={(value) => onUpdate("backgroundColor", value)}
            value={config.backgroundColor}
          />
          <ColorField
            id="text-color"
            label="Text color"
            onChange={(value) => onUpdate("textColor", value)}
            value={config.textColor}
          />
        </div>
      </TabsContent>

      <TabsContent className="mt-4 flex flex-col gap-4" value="style">
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Label>Color mode</Label>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button size="icon-sm" variant="ghost">
                    ?
                  </Button>
                }
              />
              <TooltipContent>
                Mono and muted modes work best with transparent logos. Full
                color shows original brand marks.
              </TooltipContent>
            </Tooltip>
          </div>
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
          <div className="grid gap-2">
            <Label>Muted opacity ({config.grayscaleOpacity}%)</Label>
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

        <div className="grid gap-2">
          <Label>Logo height ({config.logoHeight}px)</Label>
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
      </TabsContent>

      <TabsContent className="mt-4 flex flex-col gap-4" value="layout">
        <div className="grid gap-2">
          <Label>Layout type</Label>
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
              <SelectItem value="marquee">Scrolling marquee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.layout === "bar" || config.layout === "grid" ? (
          <div className="grid gap-2">
            <Label>Logos per row ({config.logosPerRow})</Label>
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

        <div className="grid gap-2">
          <Label>Alignment</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {ALIGNMENT_OPTIONS.map((option) => {
              const AlignIcon = option.icon;
              const isSelected = config.alignment === option.value;

              return (
                <button
                  aria-pressed={isSelected}
                  className={cn(
                    "flex min-w-0 flex-col items-center justify-center gap-1 rounded-md border px-1 py-2.5 text-center transition-colors",
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

        <div className="grid gap-2">
          <Label>Gap ({config.gap}px)</Label>
          <Slider
            max={64}
            min={8}
            onValueChange={(value) => onUpdate("gap", sliderValue(value))}
            step={2}
            value={[config.gap]}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Padding Y ({config.paddingY}px)</Label>
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
          <div className="grid gap-2">
            <Label>Padding X ({config.paddingX}px)</Label>
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

        <div className="grid gap-2">
          <Label>Corner radius ({config.borderRadius}px)</Label>
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
          <div className="grid gap-2">
            <Label>Marquee speed ({config.marqueeSpeed}s)</Label>
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
      </TabsContent>
    </Tabs>
  );
}
