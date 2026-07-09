"use client";

import { IconDeviceDesktop, IconDeviceMobile } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import type { PresswallViewport } from "@/lib/presswall-layout-style";
import { cn } from "@/lib/utils";

interface DeviceToggleProps {
  mode: PresswallViewport;
  onChange: (mode: PresswallViewport) => void;
}

/** Lighter active chip — solid black was too heavy for this compact control. */
const deviceSelectedClassName =
  "bg-zinc-200 text-foreground hover:bg-zinc-200 hover:text-foreground";

const deviceIdleClassName =
  "text-muted-foreground hover:bg-zinc-100 hover:text-foreground";

export function DeviceToggle({ mode, onChange }: DeviceToggleProps) {
  return (
    <fieldset className="inline-flex rounded-lg border border-border bg-card p-0.5 shadow-xs">
      <Button
        aria-label="Desktop preview"
        aria-pressed={mode === "desktop"}
        className={cn(
          "size-7 px-0 shadow-none",
          mode === "desktop" ? deviceSelectedClassName : deviceIdleClassName
        )}
        onClick={() => onChange("desktop")}
        size="sm"
        type="button"
        variant="ghost"
      >
        <IconDeviceDesktop className="size-3.5" stroke={2} />
      </Button>
      <Button
        aria-label="Mobile preview"
        aria-pressed={mode === "mobile"}
        className={cn(
          "size-7 px-0 shadow-none",
          mode === "mobile" ? deviceSelectedClassName : deviceIdleClassName
        )}
        onClick={() => onChange("mobile")}
        size="sm"
        type="button"
        variant="ghost"
      >
        <IconDeviceMobile className="size-3.5" stroke={2} />
      </Button>
    </fieldset>
  );
}
