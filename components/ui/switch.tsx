"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        // Track: off state uses a mid gray (not --input / --background, which
        // are nearly the same Shopify-admin gray and hide the white thumb).
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border outline-none transition-all after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-[size=default]:h-[16.6px] data-[size=sm]:h-[14px] data-[size=default]:w-[28px] data-[size=sm]:w-[24px] data-disabled:cursor-not-allowed data-disabled:opacity-50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        "data-checked:border-primary data-unchecked:border-zinc-400/50 data-checked:bg-primary data-unchecked:bg-zinc-300 dark:data-unchecked:border-zinc-600 dark:data-unchecked:bg-zinc-600",
        className
      )}
      data-size={size}
      data-slot="switch"
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          // Thumb stays pure white so it reads on both gray (off) and black (on).
          "pointer-events-none block rounded-full bg-white shadow-sm ring-1 ring-black/10 transition-transform",
          "group-data-[size=default]/switch:size-3.5 group-data-[size=sm]/switch:size-3",
          "group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0",
          "group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-unchecked:translate-x-0"
        )}
        data-slot="switch-thumb"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
