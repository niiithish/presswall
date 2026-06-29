"use client";

import { memo } from "react";
import {
  MarqueeLayout,
  MarqueeTrack,
} from "@/components/presswall/marquee-layout";
import { usesInlineMarqueeHeading } from "@/lib/banner-style";
import {
  getHeadingClassName,
  getHeadingStyle,
} from "@/lib/presswall-heading-style";
import {
  getLogosBarClassName,
  getLogosBarConstrainedClassName,
  getLogosBarConstrainedStyle,
  getLogosBarStyle,
  getLogosRowGridClassName,
  getLogosRowGridStyle,
  type PresswallViewport,
  shouldConstrainBarRows,
} from "@/lib/presswall-layout-style";
import {
  getMarqueeRepeatCount,
  getMarqueeTrackStyle,
} from "@/lib/presswall-marquee";
import type {
  PresswallConfig,
  StorefrontPublisher,
} from "@/lib/presswall-types";

export type PresswallStripConfig = Pick<
  PresswallConfig,
  | "showHeading"
  | "headingText"
  | "headingFontSize"
  | "headingSpacing"
  | "headingAlignment"
  | "layout"
  | "logoAlignment"
  | "gap"
  | "logoSpacing"
  | "marqueeSpeed"
>;

interface PresswallStripProps {
  backgroundColor: string;
  config: PresswallStripConfig;
  emptyState: React.ReactNode;
  headingOptions?: {
    compact?: boolean;
    compactFontSizeCap?: number;
  };
  items: StorefrontPublisher[];
  logosPerRow: number;
  renderLogo: (item: StorefrontPublisher) => React.ReactNode;
  staticLayoutItemLimit?: number;
  textColor: string;
  viewport?: PresswallViewport;
}

function StaticHeading({
  config,
  headingOptions,
  textColor,
}: {
  config: PresswallStripConfig;
  headingOptions?: PresswallStripProps["headingOptions"];
  textColor: string;
}) {
  if (!(config.showHeading && config.headingText)) {
    return null;
  }

  if (config.layout === "marquee" && usesInlineMarqueeHeading(config)) {
    return null;
  }

  return (
    <p
      className={getHeadingClassName(config.headingAlignment)}
      style={getHeadingStyle(
        {
          headingFontSize: config.headingFontSize,
          headingSpacing: config.headingSpacing,
          textColor,
        },
        headingOptions
      )}
    >
      {config.headingText}
    </p>
  );
}

function LogoBar({
  constrainRows,
  gap,
  items,
  logoAlignment,
  logoSpacing,
  logosPerRow,
  renderLogo,
}: {
  constrainRows: boolean;
  gap: number;
  items: StorefrontPublisher[];
  logoAlignment: PresswallStripConfig["logoAlignment"];
  logoSpacing: PresswallStripConfig["logoSpacing"];
  logosPerRow: number;
  renderLogo: (item: StorefrontPublisher) => React.ReactNode;
}) {
  if (constrainRows) {
    return (
      <div
        className={getLogosBarConstrainedClassName(logoAlignment)}
        style={getLogosBarConstrainedStyle(logosPerRow, gap, logoSpacing)}
      >
        {items.map((item) => (
          <div
            className="flex min-w-0 items-center justify-center"
            key={item.id}
          >
            {renderLogo(item)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={getLogosBarClassName(logoAlignment, logoSpacing)}
      style={getLogosBarStyle(gap, logoSpacing)}
    >
      {items.map((item) => (
        <div className="flex min-w-0 items-center" key={item.id}>
          {renderLogo(item)}
        </div>
      ))}
    </div>
  );
}

function LogoGrid({
  gap,
  items,
  logoAlignment,
  logosPerRow,
  renderLogo,
}: {
  gap: number;
  items: StorefrontPublisher[];
  logoAlignment: PresswallStripConfig["logoAlignment"];
  logosPerRow: number;
  renderLogo: (item: StorefrontPublisher) => React.ReactNode;
}) {
  return (
    <div
      className={getLogosRowGridClassName(logoAlignment)}
      style={getLogosRowGridStyle(logosPerRow, gap)}
    >
      {items.map((item) => (
        <div className="flex min-w-0 items-center" key={item.id}>
          {renderLogo(item)}
        </div>
      ))}
    </div>
  );
}

export const PresswallStrip = memo(function PresswallStrip({
  backgroundColor,
  config,
  emptyState,
  headingOptions,
  items,
  logosPerRow,
  renderLogo,
  staticLayoutItemLimit,
  textColor,
  viewport = "desktop",
}: PresswallStripProps) {
  if (items.length === 0) {
    return <>{emptyState}</>;
  }

  if (config.layout === "marquee") {
    const segments = getMarqueeRepeatCount(items.length);
    const marqueeItems = Array.from({ length: segments }, (_, segment) =>
      items.map((item) => ({ item, suffix: String(segment) }))
    ).flat();

    const marqueeConfig = usesInlineMarqueeHeading(config)
      ? config
      : { ...config, showHeading: false };

    return (
      <>
        <StaticHeading
          config={config}
          headingOptions={headingOptions}
          textColor={textColor}
        />
        <MarqueeLayout
          backgroundColor={backgroundColor}
          config={marqueeConfig}
          textColor={textColor}
        >
          <MarqueeTrack
            style={getMarqueeTrackStyle(
              segments,
              config.gap,
              config.marqueeSpeed
            )}
          >
            {marqueeItems.map(({ item, suffix }) => (
              <div className="pw-mq-item shrink-0" key={`${item.id}-${suffix}`}>
                {renderLogo(item)}
              </div>
            ))}
          </MarqueeTrack>
        </MarqueeLayout>
      </>
    );
  }

  const displayItems =
    staticLayoutItemLimit == null
      ? items
      : items.slice(0, staticLayoutItemLimit);

  return (
    <>
      <StaticHeading
        config={config}
        headingOptions={headingOptions}
        textColor={textColor}
      />
      {config.layout === "grid" ? (
        <LogoGrid
          gap={config.gap}
          items={displayItems}
          logoAlignment={config.logoAlignment}
          logosPerRow={logosPerRow}
          renderLogo={renderLogo}
        />
      ) : (
        <LogoBar
          constrainRows={shouldConstrainBarRows(viewport)}
          gap={config.gap}
          items={displayItems}
          logoAlignment={config.logoAlignment}
          logoSpacing={config.logoSpacing}
          logosPerRow={logosPerRow}
          renderLogo={renderLogo}
        />
      )}
    </>
  );
});
