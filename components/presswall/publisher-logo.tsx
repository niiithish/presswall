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

function LogoSlot({
  children,
  className,
  style,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}) {
  return (
    <span
      className={cn("presswall-logo-slot", className)}
      style={style}
      title={title}
    >
      {children}
    </span>
  );
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
    return (
      <LogoSlot className={className} style={style} title={name}>
        <SvgLogo svg={customLogoSvg} />
      </LogoSlot>
    );
  }

  const logoUrl =
    logoImageUrl ??
    (publisherId && isBundledPublisherId(publisherId)
      ? bundledLogoPath(publisherId)
      : null);

  if (!logoUrl || failed) {
    return (
      <LogoSlot className={className} style={style} title={name}>
        <span className="font-semibold text-[0.625rem] text-muted-foreground uppercase">
          {name.slice(0, 2)}
        </span>
      </LogoSlot>
    );
  }

  return (
    <LogoSlot className={className} style={style} title={name}>
      <Image
        alt={`${name} logo`}
        className="presswall-logo-img"
        height={32}
        onError={() => setFailed(true)}
        src={logoUrl}
        unoptimized
        width={140}
      />
    </LogoSlot>
  );
}
