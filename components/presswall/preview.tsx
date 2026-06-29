"use client";

import { IconEye } from "@tabler/icons-react";
import { useState } from "react";
import { PublisherLogo } from "@/components/presswall/publisher-logo";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getLogoImageStyle } from "@/lib/presswall-logo-style";
import { getPreviewColors } from "@/lib/presswall-preview-colors";
import type {
  PresswallConfig,
  PublisherCatalogItem,
  ShopPublisherSelection,
  StorefrontPublisher,
} from "@/lib/presswall-types";
import { resolveStorefrontPublishers } from "@/lib/resolve-storefront-publishers";
import { cn } from "@/lib/utils";

interface PreviewProps {
  catalog: PublisherCatalogItem[];
  config: PresswallConfig;
  isLoading?: boolean;
  selections: ShopPublisherSelection[];
  variant?: "default" | "canvas";
}

const alignmentClass = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
} as const;

function LayoutContent({
  config,
  items,
  renderLogo,
}: {
  config: PresswallConfig;
  items: ReturnType<typeof resolveStorefrontPublishers>;
  renderLogo: (item: StorefrontPublisher) => React.ReactNode;
}) {
  if (items.length === 0) {
    return (
      <Empty className="border-0 p-4">
        <EmptyHeader>
          <EmptyTitle>No outlets selected</EmptyTitle>
          <EmptyDescription>
            Pick outlets from the library to preview your presswall.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (config.layout === "marquee") {
    return (
      <div className="overflow-hidden">
        <div
          className="presswall-marquee flex w-max items-center"
          style={{
            gap: `${config.gap}px`,
            animationDuration: `${config.marqueeSpeed}s`,
          }}
        >
          {items
            .map((item) => ({ item, suffix: "a" as string }))
            .concat(items.map((item) => ({ item, suffix: "b" as string })))
            .map(({ item, suffix }) => (
              <div key={`${item.id}-${suffix}`}>{renderLogo(item)}</div>
            ))}
        </div>
      </div>
    );
  }

  if (config.layout === "grid") {
    return (
      <div
        className="grid grid-cols-2 sm:grid-cols-3"
        style={{ gap: `${config.gap}px` }}
      >
        {items.map((item) => (
          <div className="flex items-center justify-center" key={item.id}>
            {renderLogo(item)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-y-4",
        alignmentClass[config.alignment]
      )}
      style={{ gap: `${config.gap}px` }}
    >
      {items.map((item) => renderLogo(item))}
    </div>
  );
}

export function PresswallPreview({
  config,
  catalog,
  selections,
  variant = "default",
  isLoading = false,
}: PreviewProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const items = resolveStorefrontPublishers(config, catalog, selections);
  const isDark = theme === "dark";
  const previewColors = getPreviewColors(config, isDark);
  const logoStyle = getLogoImageStyle(config, { previewIsDark: isDark });
  const isCanvas = variant === "canvas";

  const containerStyle = {
    backgroundColor: previewColors.backgroundColor,
    color: previewColors.textColor,
    borderRadius: `${config.borderRadius}px`,
    padding: `${config.paddingY}px ${config.paddingX}px`,
  } satisfies React.CSSProperties;

  const renderLogo = (item: StorefrontPublisher) => {
    const logoContainerStyle = {
      ...logoStyle,
      "--logo-height": `${config.logoHeight}px`,
      height: `${config.logoHeight}px`,
      maxWidth: "140px",
    } as React.CSSProperties;

    return (
      <PublisherLogo
        className="flex shrink-0 items-center"
        customLogoSvg={item.isCustom ? item.logoSvg || undefined : undefined}
        key={item.id}
        logoImageUrl={item.logoImageUrl}
        name={item.name}
        publisherId={item.isCustom ? undefined : item.id}
        style={logoContainerStyle}
      />
    );
  };

  const themeToggle = (
    <div className="flex gap-1 rounded-lg border bg-background/90 p-0.5 shadow-sm backdrop-blur">
      <Button
        onClick={() => setTheme("light")}
        size="sm"
        variant={theme === "light" ? "secondary" : "ghost"}
      >
        Light
      </Button>
      <Button
        onClick={() => setTheme("dark")}
        size="sm"
        variant={theme === "dark" ? "secondary" : "ghost"}
      >
        Dark
      </Button>
    </div>
  );

  const previewBody = (
    <div
      className={cn(
        "w-full rounded-xl border shadow-sm",
        isDark ? "border-white/10" : "border-black/10",
        isCanvas ? "max-w-3xl" : "min-h-32"
      )}
      style={containerStyle}
    >
      {config.showHeading && config.headingText ? (
        <p
          className="mb-4 font-medium text-[11px] uppercase tracking-[0.28em]"
          style={{ color: previewColors.textColor }}
        >
          {config.headingText}
        </p>
      ) : null}

      <LayoutContent config={config} items={items} renderLogo={renderLogo} />
    </div>
  );

  if (isCanvas) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="absolute top-3 right-3 z-10">{themeToggle}</div>

        <div
          className={cn(
            "presswall-canvas-bg flex min-h-0 flex-1 items-center justify-center overflow-auto p-6",
            isDark && "presswall-canvas-bg-dark"
          )}
        >
          {isLoading ? (
            <div className="h-32 w-full max-w-3xl animate-pulse rounded-xl border bg-background/60" />
          ) : (
            previewBody
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <IconEye className="text-muted-foreground" stroke={2} />
          <div>
            <p className="font-medium text-sm">Live preview</p>
            <p className="text-muted-foreground text-xs">
              How your presswall will look on the storefront
            </p>
          </div>
        </div>
        {themeToggle}
      </div>

      {previewBody}
    </div>
  );
}
