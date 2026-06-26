"use client";

import Image from "next/image";
import { useState } from "react";
import { SvgLogo } from "@/components/presswall/svg-logo";
import { isBundledPublisherId } from "@/lib/bundled-publishers";
import { bundledLogoPath } from "@/lib/publisher-logo-path";
import { cn } from "@/lib/utils";

interface PublisherLogoProps {
  className?: string;
  customLogoSvg?: string;
  logoImageUrl?: string | null;
  name: string;
  publisherId?: string;
  style?: React.CSSProperties;
}

export function PublisherLogo({
  publisherId,
  logoImageUrl,
  name,
  customLogoSvg,
  className,
  style,
}: PublisherLogoProps) {
  const [failed, setFailed] = useState(false);

  if (customLogoSvg) {
    return <SvgLogo className={className} style={style} svg={customLogoSvg} />;
  }

  const logoUrl =
    logoImageUrl ??
    (publisherId && isBundledPublisherId(publisherId)
      ? bundledLogoPath(publisherId)
      : null);

  if (!logoUrl || failed) {
    return (
      <span
        className={cn(
          "inline-flex h-[var(--logo-height,1.5rem)] min-w-[var(--logo-height,1.5rem)] items-center justify-center rounded bg-muted font-semibold text-[0.625rem] text-muted-foreground uppercase",
          className
        )}
        style={style}
        title={name}
      >
        {name.slice(0, 2)}
      </span>
    );
  }

  return (
    <Image
      alt={`${name} logo`}
      className={cn(
        "h-[var(--logo-height,1.5rem)] w-auto max-w-full object-contain object-center",
        className
      )}
      height={32}
      onError={() => setFailed(true)}
      src={logoUrl}
      style={style}
      unoptimized
      width={112}
    />
  );
}
